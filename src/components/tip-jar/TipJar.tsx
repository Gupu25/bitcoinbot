'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Copy, Check, Heart, Globe, ArrowRight, Sparkles, AlertCircle, X, Clock, Bot, Users } from 'lucide-react';
import dynamic from 'next/dynamic';

const QRCodeSVG = dynamic(() => import('qrcode.react').then(mod => mod.QRCodeSVG), { ssr: false });
import { Locale } from '@/types';

interface TipDict {
  tip: {
    title: string;
    description: string;
    button: string;
    success: string;
    error: string;
    impact: string;
    contributors: string;
    satsRaised: string;
    nextTarget: string;
    thankYou: string;
    copy: string;
    scan: string;
    customAmount: string;
    powered: string;
    community: string;
    preset: {
      '1k': string;
      '5k': string;
      '21k': string;
      '100k': string;
    };
  };
}

interface TipJarProps {
  lang: Locale;
  dict?: TipDict['tip'];
}

// 🐱 FIX: Mensajes actualizados - enfocados en la comunidad que mantiene el agente vivo
const defaultDictByLocale: Record<Locale, TipDict['tip']> = {
  en: {
    title: 'Keep the Agent Alive',
    description: 'Your sats directly fund the Bitcoin Agent infrastructure. Servers, API calls, and continuous improvements—powered by the community.',
    button: 'Send Sats',
    success: 'Zap received! ⚡',
    error: 'Payment failed. Please try again.',
    impact: 'Community power',
    contributors: 'Active contributors',
    satsRaised: 'Sats raised',
    nextTarget: 'Next: Enhanced AI models',
    thankYou: 'Thank you for fueling the orange intelligence!',
    copy: 'Copy LN address',
    scan: 'Scan with wallet',
    customAmount: 'Custom amount...',
    powered: 'Powered by Lightning Network',
    community: 'This agent runs on community support. Every sat keeps the lights on.',
    preset: {
      '1k': '1,000 sats',
      '5k': '5,000 sats',
      '21k': '21,000 sats',
      '100k': '100,000 sats'
    }
  },
  es: {
    title: 'Mantén el Agente Vivo',
    description: 'Tus sats financian directamente la infraestructura de Bitcoin Agent. Servidores, llamadas API y mejoras continuas—impulsados por la comunidad.',
    button: 'Enviar Sats',
    success: '¡Zap recibido! ⚡',
    error: 'El pago falló. Por favor intenta de nuevo.',
    impact: 'Poder comunitario',
    contributors: 'Contribuyentes activos',
    satsRaised: 'Sats recaudados',
    nextTarget: 'Próximo: Modelos de IA mejorados',
    thankYou: '¡Gracias por alimentar la inteligencia naranja!',
    copy: 'Copiar dirección LN',
    scan: 'Escanear con wallet',
    customAmount: 'Cantidad personalizada...',
    powered: 'Powered by Lightning Network',
    community: 'Este agente funciona con apoyo comunitario. Cada sat mantiene las luces encendidas.',
    preset: {
      '1k': '1.000 sats',
      '5k': '5.000 sats',
      '21k': '21.000 sats',
      '100k': '100.000 sats'
    }
  }
};

// 🐱 FIX: Stats actualizados - enfocados en la comunidad, no en embeds geográficos
const IMPACT_STATS = [
  { label: 'contributors', value: '47' },
  { label: 'satsRaised', value: '2.4M' }
];
const PRESET_AMOUNTS = [1000, 5000, 21000, 100000];

const BitcoinLogoSVG = () => (
  <svg viewBox="0 0 64 64" width="48" height="48" className="mx-auto my-auto">
    <circle cx="32" cy="32" r="30" fill="#F7931A" />
    <path
      fill="#FFF"
      d="M44.5 28.5c.6-4-2.4-6.2-6.5-7.6l1.3-5.3-3.2-.8-1.3 5.2c-.8-.2-1.7-.4-2.5-.6l1.3-5.2-3.2-.8-1.3 5.3c-.7-.2-1.4-.3-2-.5l-4.4-1.1-.8 3.4s2.4.5 2.3.6c1.3.3 1.5 1.2 1.5 1.9l-1.5 6.1c.1 0 .2 0 .4.1-.1 0-.3-.1-.4-.1l-2.1 8.5c-.2.4-.6 1.1-1.5.8 0 .1-2.3-.6-2.3-.6l-1.6 3.7 4.1 1c.8.2 1.5.4 2.2.6l-1.4 5.5 3.2.8 1.4-5.4c.9.2 1.7.5 2.5.7l-1.3 5.3 3.2.8 1.4-5.5c5.7 1.1 10 .6 11.8-4.5 1.5-4.1-.1-6.5-3.1-8.1 2.2-.5 3.9-2 4.3-5zm-7.8 10.9c-1.1 4.3-8.2 2-10.5 1.4l1.9-7.5c2.3.6 9.7 1.6 8.6 6.1zm1.1-11.3c-1 3.9-6.8 1.9-8.7 1.4l1.7-6.7c1.9.5 8 1.4 7 5.3z"
    />
  </svg>
);

export function TipJar({ lang, dict }: TipJarProps) {
  const [mode, setMode] = useState<'address' | 'invoice'>('address');
  const [paymentRequest, setPaymentRequest] = useState<string | null>(null);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const t = dict || defaultDictByLocale[lang];
  const lightningAddress = 'scubapav@blink.sv';

  const resetToAddress = useCallback(() => {
    setMode('address');
    setPaymentRequest(null);
    setSelectedAmount(null);
    setCustomAmount('');
    setExpiresAt(null);
    setTimeLeft(null);
    setError(null);
  }, []);

  useEffect(() => {
    if (!expiresAt) {
      setTimeLeft(null);
      return;
    }

    const updateTimer = () => {
      const diff = Math.ceil((expiresAt.getTime() - Date.now()) / 1000);
      if (diff <= 0) {
        setTimeLeft(0);
        resetToAddress();
      } else {
        setTimeLeft(diff);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [expiresAt, resetToAddress]);

  const handleSuccess = useCallback(() => {
    setShowConfetti(true);
    setShowSuccess(true);
    resetToAddress();
    setTimeout(() => setShowConfetti(false), 5000);
    setTimeout(() => setShowSuccess(false), 5000);
  }, [resetToAddress]);

  const generateInvoice = useCallback(async (amount: number) => {
    if (!amount || amount <= 0 || isProcessing) {
      setError(lang === 'es' ? 'Cantidad inválida o procesando' : 'Invalid amount or processing');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSelectedAmount(amount);
    setMode('invoice');

    try {
      const response = await fetch('/api/tip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          recipient: lightningAddress,
          memo: `Bitcoin Agent Community Fund - ${amount} sats`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      if (!data.paymentRequest) {
        throw new Error(lang === 'es' ? 'Respuesta inválida del servidor' : 'Invalid server response');
      }

      setPaymentRequest(data.paymentRequest);
      const expiry = new Date(Date.now() + 60 * 60 * 1000);
      setExpiresAt(expiry);

      if (typeof window !== 'undefined' && (window as any).webln) {
        try {
          await (window as any).webln.enable();
          const result = await (window as any).webln.sendPayment(data.paymentRequest);
          handleSuccess();
          return;
        } catch (weblnErr) {
          console.log('WebLN fallback to QR:', weblnErr);
        }
      }
    } catch (err: any) {
      setError(err.message || t.error);
      resetToAddress();
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, lang, lightningAddress, t.error, handleSuccess, resetToAddress]);

  const handleAmountSelect = useCallback((amount: number) => {
    if (mode === 'invoice' || isProcessing) return;
    generateInvoice(amount);
  }, [mode, isProcessing, generateInvoice]);

  const handleCustomSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'invoice' || isProcessing) return;

    const amt = parseInt(customAmount, 10);
    if (isNaN(amt) || amt <= 0) {
      setError(lang === 'es' ? 'Ingresa una cantidad válida' : 'Enter a valid amount');
      return;
    }
    generateInvoice(amt);
  }, [customAmount, mode, isProcessing, lang, generateInvoice]);

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(lightningAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatSats = (sats: number) => {
    if (sats >= 1000000) return `${(sats / 1000000).toFixed(1)}M`;
    if (sats >= 1000) return `${(sats / 1000).toFixed(1)}k`;
    return sats.toString();
  };

  const getQRValue = useCallback(() => {
    if (mode === 'invoice' && paymentRequest && typeof paymentRequest === 'string') {
      const cleanReq = paymentRequest.replace(/^lightning:/i, '');
      return `lightning:${cleanReq.toUpperCase()}`;
    }
    return `lightning:${lightningAddress}`;
  }, [mode, paymentRequest, lightningAddress]);

  const canGenerateInvoice = mode !== 'invoice' && !isProcessing;

  return (
    <section id="support" className="relative py-16 sm:py-20 lg:py-24 bg-slate-950 overflow-hidden border-t border-slate-800">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl