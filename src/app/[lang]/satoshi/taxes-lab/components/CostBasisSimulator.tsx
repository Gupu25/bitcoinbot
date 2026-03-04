'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { InfoTooltip } from '@/components/ui/InfoTooltip';

interface CostBasisSimulatorProps {
    lang: 'en' | 'es';
    t: {
        costBasisTitle: string;
        costBasisSubtitle: string;
        fifoLabel: string;
        lifoLabel: string;
        tooltipFIFO: string;
        tooltipLIFO: string;
        tooltipCostBasis: string;
        tooltipGainLoss: string;
    };
}

interface Lot {
    id: string;
    date: string;
    sats: number;
    priceMXN: number; // price per BTC in MXN at purchase
}

const defaultLots: Lot[] = [
    { id: 'L1', date: '2023-01-10', sats: 500_000, priceMXN: 340_000 },
    { id: 'L2', date: '2023-06-15', sats: 300_000, priceMXN: 520_000 },
    { id: 'L3', date: '2024-01-05', sats: 200_000, priceMXN: 850_000 },
];

const SELL_SATS = 400_000;
const CURRENT_PRICE_MXN = 1_050_000; // BTC price today

function calcGain(lots: Lot[], sellSats: number, method: 'fifo' | 'lifo'): number {
    const ordered = method === 'fifo' ? [...lots] : [...lots].reverse();
    let remaining = sellSats;
    let totalCostBasis = 0;
    for (const lot of ordered) {
        if (remaining <= 0) break;
        const used = Math.min(remaining, lot.sats);
        const btcFraction = used / 100_000_000;
        totalCostBasis += btcFraction * lot.priceMXN;
        remaining -= used;
    }
    const saleValue = (sellSats / 100_000_000) * CURRENT_PRICE_MXN;
    return saleValue - totalCostBasis;
}

export function CostBasisSimulator({ lang, t }: CostBasisSimulatorProps) {
    const [method, setMethod] = useState<'fifo' | 'lifo'>('fifo');

    const fifoGain = useMemo(() => calcGain(defaultLots, SELL_SATS, 'fifo'), []);
    const lifoGain = useMemo(() => calcGain(defaultLots, SELL_SATS, 'lifo'), []);
    const activeGain = method === 'fifo' ? fifoGain : lifoGain;

    const labels = {
        en: {
            lots: 'Your Holdings (Lots)',
            date: 'Purchase Date',
            sats: 'Sats',
            costPrice: 'BTC Price (MXN)',
            sellSection: 'Simulating Sale',
            sellAmount: `Selling ${SELL_SATS.toLocaleString()} sats`,
            currentPrice: `@ BTC Price: $${CURRENT_PRICE_MXN.toLocaleString()} MXN`,
            taxableGain: 'Taxable Gain',
            diff: 'Difference',
            tip: 'FIFO usually results in higher gains in a rising market because you first use cheaper lots. LIFO uses recent (more expensive) lots, reducing apparent gains.',
        },
        es: {
            lots: 'Tus Holdings (Lotes)',
            date: 'Fecha de Compra',
            sats: 'Sats',
            costPrice: 'Precio BTC (MXN)',
            sellSection: 'Simulando Venta',
            sellAmount: `Vendiendo ${SELL_SATS.toLocaleString()} sats`,
            currentPrice: `@ Precio BTC: $${CURRENT_PRICE_MXN.toLocaleString()} MXN`,
            taxableGain: 'Ganancia Gravable',
            diff: 'Diferencia',
            tip: 'FIFO suele generar mayores ganancias en un mercado alcista porque usas primero lotes más baratos. LIFO usa lotes recientes (más caros), reduciendo la ganancia aparente.',
        },
    };
    const L = labels[lang];

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-1">{t.costBasisTitle}</h2>
            <p className="text-sm text-slate-400 mb-6">{t.costBasisSubtitle}</p>

            {/* Method Toggle */}
            <div className="flex gap-2 mb-6">
                {(['fifo', 'lifo'] as const).map((m) => (
                    <button
                        key={m}
                        onClick={() => setMethod(m)}
                        className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${method === m
                                ? 'bg-orange-500 text-black'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                            }`}
                    >
                        <RefreshCw className="w-4 h-4" />
                        {m === 'fifo' ? t.fifoLabel : t.lifoLabel}
                        {m === 'fifo' ? <InfoTooltip content={t.tooltipFIFO} /> : <InfoTooltip content={t.tooltipLIFO} />}
                    </button>
                ))}
            </div>

            {/* Lots Table */}
            <div className="mb-6">
                <h3 className="text-sm font-semibold text-slate-400 mb-2">{L.lots}</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-slate-500 border-b border-slate-800">
                                <th className="pb-2">ID</th>
                                <th className="pb-2">{L.date}</th>
                                <th className="pb-2 text-right">{L.sats}</th>
                                <th className="pb-2 text-right">{L.costPrice}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {defaultLots.map((lot) => (
                                <tr key={lot.id} className="border-b border-slate-800/40">
                                    <td className="py-2 font-mono text-orange-400">{lot.id}</td>
                                    <td className="py-2 text-slate-400">{lot.date}</td>
                                    <td className="py-2 text-right font-mono">{lot.sats.toLocaleString()}</td>
                                    <td className="py-2 text-right font-mono">${lot.priceMXN.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Sale Simulation */}
            <div className="bg-slate-800/50 rounded-xl p-4 mb-4">
                <p className="text-sm font-medium text-slate-300 mb-1">{L.sellSection}</p>
                <p className="text-xs text-slate-500">{L.sellAmount}</p>
                <p className="text-xs text-slate-500">{L.currentPrice}</p>
            </div>

            {/* Results Comparison */}
            <div className="grid grid-cols-2 gap-3">
                {(['fifo', 'lifo'] as const).map((m) => {
                    const gain = m === 'fifo' ? fifoGain : lifoGain;
                    const isActive = method === m;
                    return (
                        <motion.div
                            key={m}
                            animate={{ scale: isActive ? 1.02 : 1 }}
                            className={`rounded-xl p-4 border transition-colors ${isActive
                                    ? 'bg-orange-500/10 border-orange-500/40'
                                    : 'bg-slate-800/30 border-slate-700'
                                }`}
                        >
                            <p className="text-xs text-slate-400 uppercase font-bold mb-2">{m.toUpperCase()}</p>
                            <p className="text-xs text-slate-500 mb-3">{L.taxableGain}</p>
                            <div className="flex items-center gap-1">
                                {gain >= 0 ? (
                                    <TrendingUp className="w-4 h-4 text-red-400" />
                                ) : (
                                    <TrendingDown className="w-4 h-4 text-green-400" />
                                )}
                                <span className={`text-lg font-bold font-mono ${gain >= 0 ? 'text-red-400' : 'text-green-400'}`}>
                                    {gain >= 0 ? '+' : ''}${Math.round(gain).toLocaleString()} MXN
                                </span>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Diff callout */}
            <div className="mt-4 bg-blue-500/10 border border-blue-500/30 rounded-xl p-3 text-xs text-blue-300">
                <strong>{L.diff}:</strong> ${Math.abs(Math.round(fifoGain - lifoGain)).toLocaleString()} MXN — {L.tip}
            </div>
        </div>
    );
}
