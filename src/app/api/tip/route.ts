import { NextRequest, NextResponse } from 'next/server';
import { getBTCPrice, convertSatsToFiat, logTransactionEvent } from '@/lib/compliance';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
const BLINK_API_URL = 'https://api.blink.sv/graphql';

/**
 * Hash IP address using SHA-256 with salt for GDPR compliance
 * @throws Error if IP_HASH_SALT environment variable is not set
 */
function hashIP(ip: string): string {
    const salt = process.env.IP_HASH_SALT;
    if (!salt) {
        throw new Error('IP_HASH_SALT environment variable is required for GDPR-compliant IP hashing');
    }
    return crypto.createHmac('sha256', salt).update(ip).digest('hex');
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { amount, memo } = body;

        // 1. Validación básica
        if (!amount || amount < 1000) { // Mínimo 1000 sats
            return NextResponse.json({ error: 'Minimum amount is 1000 sats' }, { status: 400 });
        }

        // 2. Capturar datos de precio BTC y convertir a fiat
        const priceData = await getBTCPrice();
        const fiatConversion = await convertSatsToFiat(amount);

        // 3. Capturar IP y User-Agent para compliance
        const ipAddress = request.headers.get('x-forwarded-for') || 
                          request.headers.get('x-real-ip') || 
                          'unknown';
        const userAgent = request.headers.get('user-agent') || 'unknown';
        
        // Hash del IP para GDPR compliance
        const ipHash = hashIP(ipAddress);

        // 4. Crear registro de transacción pendiente en compliance
        const tempPaymentHash = `pending_${crypto.randomUUID()}`;
        const complianceTx = await prisma.complianceTransaction.create({
            data: {
                paymentHash: tempPaymentHash,
                amountSats: Math.floor(amount),
                amountBTC: fiatConversion.btc,
                amountMXN: fiatConversion.mxn,
                amountUSD: fiatConversion.usd,
                btcPriceMXN: priceData.btcMXN,
                btcPriceUSD: priceData.btcUSD,
                priceSource: priceData.source,
                source: 'lightning',
                memo: memo || 'Bitcoin Agent Tip',
                ipHash: ipHash,
                userAgent: userAgent,
                status: 'pending',
                walletId: process.env.BLINK_WALLET_ID,
            },
        });

        // 5. Log del evento de creación de transacción
        await logTransactionEvent(
            complianceTx.id,
            'created',
            `Transaction created: ${amount} sats pending`,
            {
                amountSats: amount,
                amountMXN: fiatConversion.mxn,
                amountUSD: fiatConversion.usd,
                btcPriceMXN: priceData.btcMXN,
                btcPriceUSD: priceData.btcUSD,
                priceSource: priceData.source,
            }
        );

        // 6. Crear Invoice en Blink via GraphQL
        const mutation = `
            mutation LnInvoiceCreate($input: LnInvoiceCreateInput!) {
                lnInvoiceCreate(input: $input) {
                    invoice {
                        paymentRequest
                        paymentHash
                        paymentSecret
                    }
                    errors {
                        message
                    }
                }
            }
        `;

        const variables = {
            input: {
                amount: Math.floor(amount), // Sats
                memo: memo || 'Bitcoin Agent Tip',
                walletId: process.env.BLINK_WALLET_ID // Tu wallet ID de .env
            }
        };

        const response = await fetch(BLINK_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-KEY': process.env.BLINK_API_KEY || '' // Tu clave de .env
            },
            body: JSON.stringify({
                query: mutation,
                variables: variables
            })
        });

        const data = await response.json();

        if (data.errors || !data.data?.lnInvoiceCreate?.invoice) {
            console.error('Blink Error:', data.errors);
            
            // Actualizar transacción a estado failed
            await prisma.complianceTransaction.update({
                where: { id: complianceTx.id },
                data: { status: 'failed' },
            });
            
            await logTransactionEvent(
                complianceTx.id,
                'status_change',
                'Transaction failed: invoice creation error',
                { error: data.errors?.[0]?.message || 'Unknown error' }
            );
            
            throw new Error(data.errors?.[0]?.message || 'Failed to create invoice');
        }

        const paymentRequest = data.data.lnInvoiceCreate.invoice.paymentRequest;
        const realPaymentHash = data.data.lnInvoiceCreate.invoice.paymentHash;

        // 7. Actualizar el registro de compliance con el paymentHash real
        await prisma.complianceTransaction.update({
            where: { id: complianceTx.id },
            data: {
                paymentHash: realPaymentHash,
                bolt11Invoice: paymentRequest,
            },
        });

        return NextResponse.json({
            success: true,
            paymentRequest: paymentRequest,
            transactionId: complianceTx.id,
        });

    } catch (error: any) {
        console.error('Tip API Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
