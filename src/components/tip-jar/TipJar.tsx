'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Copy, Check, Heart, Globe, ArrowRight, Sparkles, AlertCircle, X, Clock } from 'lucide-react';
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
    embeds: string;
    satsRaised: string;
    nextTarget: string;
    thankYou: string;
    copy: string;
    scan: string;
    customAmount: string;
    powered: string;
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

const defaultDictByLocale: Record<Locale, TipDict['tip']> = {
  en: {
    title: 'Power the Mission',
    description: 'Your sats help us embed this Bitcoin Agent in communities worldwide—starting with A.i and beyond.',
    button: 'Send Sats',
    success: 'Zap received! ⚡',
    error: 'Payment failed. Please try again.',
    impact: 'Impact so far',
    embeds: 'Community embeds',
    satsRaised: 'Sats raised',
    nextTarget: 'Next: Global adoption',
    thankYou: 'Thank you for keeping the orange flame alive!',
    copy: 'Copy LN address',
    scan: 'Scan with wallet',
    customAmount: 'Custom amount...',
    powered: 'Powered by Lightning Network',
    preset: {
      '1k': '1,000 sats',
      '5k': '5,000 sats',
      '21k': '21,000 sats',
      '100k': '100,000 sats'
    }
  },
  es: {
    title: 'Impulsa la Misión',
    description: 'Tus sats nos ayudan a integrar este Bitcoin Agent en comunidades del mundo—empezando por Bitcoin Beach y más allá.',
    button: 'Enviar Sats',
    success: '¡Zap recibido! ⚡',
    error: 'El pago falló. Por favor intenta de nuevo.',
    impact: 'Impacto hasta ahora',
    embeds: 'Comunidades con embed',
    satsRaised: 'Sats recaudados',
    nextTarget: 'Próximo: Sitio de Bitcoin Beach',
    thankYou: '¡Gracias por mantener viva la llama naranja!',
    copy: 'Copiar dirección LN',
    scan: 'Escanear con wallet',
    customAmount: 'Cantidad personalizada...',
    powered: 'Powered by Lightning Network',
    preset: {
      '1k': '1.000 sats',
      '5k': '5.000 sats',
      '21k': '21.000 sats',
      '100k': '100.000 sats'
    }
  }
};

const IMPACT_STATS = [
  { label: 'embeds', value: '12' },
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

  // 🐱 FIX #1: Definir resetToAddress PRIMERO con useCallback
  const resetToAddress = useCallback(() => {
    setMode('address');
    setPaymentRequest(null);
    setSelectedAmount(null);
    setCustomAmount('');
    setExpiresAt(null);
    setTimeLeft(null);
    setError(null); // Limpiar errores también, nya~!
  }, []);

  // 🐱 FIX #2: useEffect ahora puede usar resetToAddress sin problemas
  useEffect(() => {
    if (!expiresAt) {
      setTimeLeft(null);
      return;
    }

    const updateTimer = () => {
      const diff = Math.ceil((expiresAt.getTime() - Date.now()) / 1000);
      if (diff <= 0) {
        setTimeLeft(0);
        resetToAddress(); // Ahora sí funciona, desu!
      } else {
        setTimeLeft(diff);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [expiresAt, resetToAddress]); // Incluir resetToAddress en deps

  const handleSuccess = useCallback(() => {
    setShowConfetti(true);
    setShowSuccess(true);
    resetToAddress();
    setTimeout(() => setShowConfetti(false), 5000);
    setTimeout(() => setShowSuccess(false), 5000);
  }, [resetToAddress]);

  // 🐱 FIX #3: Función de generación de invoice SUPER ROBUSTA
  const generateInvoice = useCallback(async (amount: number) => {
    // Validaciones tempranas, nya~!
    if (!amount || amount <= 0 || isProcessing) {
      setError(lang === 'es' ? 'Cantidad inválida o procesando' : 'Invalid amount or processing');
      return;
    }

    setIsProcessing(true);
    setError(null);

    // 🐱 FIX #4: Setear el amount INMEDIATAMENTE en UI para feedback instantáneo
    setSelectedAmount(amount);
    setMode('invoice');

    try {
      console.log('🎯 Generando invoice para:', amount, 'sats');

      const response = await fetch('/api/tip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount, // Usar el parámetro directamente, no el estado
          recipient: lightningAddress,
          memo: `Bitcoin Agent Embed Fund - ${amount} sats`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('❌ API Error:', response.status, data);
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      if (!data.paymentRequest) {
        throw new Error(lang === 'es' ? 'Respuesta inválida del servidor' : 'Invalid server response');
      }

      console.log('✅ Invoice recibido:', data.paymentRequest.substring(0, 30) + '...');

      setPaymentRequest(data.paymentRequest);

      // Expira en 60 minutos
      const expiry = new Date(Date.now() + 60 * 60 * 1000);
      setExpiresAt(expiry);

      // 🐱 FIX #5: WebLN con mejor manejo de errores
      if (typeof window !== 'undefined' && (window as any).webln) {
        try {
          await (window as any).webln.enable();
          const result = await (window as any).webln.sendPayment(data.paymentRequest);
          console.log('⚡ WebLN success:', result);
          handleSuccess();
          return;
        } catch (weblnErr: any) {
          // No es error fatal, solo fallback a QR
          console.log('WebLN no disponible o rechazado:', weblnErr.message || weblnErr);
        }
      }
    } catch (err: any) {
      console.error('❌ Error completo:', err);
      setError(err.message || t.error);
      // 🐱 FIX #6: Reset completo en error para evitar estados corruptos
      resetToAddress();
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, lang, lightningAddress, t.error, handleSuccess, resetToAddress]);

  // 🐱 FIX #7: Manejadores de eventos con prevención de doble-click
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

  // 🐱 FIX #8: QR Value con validación estricta
  const getQRValue = useCallback(() => {
    if (mode === 'invoice' && paymentRequest && typeof paymentRequest === 'string') {
      // Asegurar que no tiene prefijo lightning: duplicado
      const cleanReq = paymentRequest.replace(/^lightning:/i, '');
      return `lightning:${cleanReq.toUpperCase()}`;
    }
    return `lightning:${lightningAddress}`;
  }, [mode, paymentRequest, lightningAddress]);

  const canGenerateInvoice = mode !== 'invoice' && !isProcessing;

  return (
    <section className="relative py-24 bg-slate-950 overflow-hidden border-t border-slate-800">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 rounded-full px-4 py-2 mb-6">
            <Zap className="w-4 h-4 text-orange-400" />
            <span className="text-orange-400 text-sm font-mono uppercase tracking-wider">Lightning Network</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            {t.title}
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-12">
            {t.description}
          </p>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 mb-8">
            {IMPACT_STATS.map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-orange-400 font-mono mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-slate-500 uppercase tracking-wider">
                  {t[stat.label as keyof typeof t] as string}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="inline-flex items-center gap-2 text-slate-500 text-sm">
            <Globe className="w-4 h-4" />
            {t.nextTarget}
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* QR Code Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="flex justify-center pt-8 md:pt-0"
          >
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl">
                {/* Amount Badge - AHORA CON FALLBACK SEGURO */}
                {mode === 'invoice' && selectedAmount ? (
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center gap-3 bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/40 rounded-2xl px-8 py-4">
                      <span className="text-4xl font-bold text-white font-mono">
                        {selectedAmount.toLocaleString()}
                      </span>
                      <div className="text-left">
                        <span className="text-orange-400 text-xl block">sats</span>
                        <span className="text-xs text-orange-400/70 uppercase tracking-wider">
                          {lang === 'es' ? 'Factura Activa' : 'Invoice Active'}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center gap-2 bg-slate-800/80 border border-orange-500/30 rounded-2xl px-6 py-3">
                      <Sparkles className="w-4 h-4 text-orange-400" />
                      <span className="text-orange-400 font-mono text-sm uppercase tracking-wider">
                        {lang === 'es' ? 'Dirección Permanente' : 'Permanent Address'}
                      </span>
                    </div>
                  </div>
                )}

                {/* QR Code - AHORA CON KEY PARA FORZAR RE-RENDER */}
                <div className="bg-white p-4 rounded-2xl mb-6 relative">
                  <QRCodeSVG
                    key={mode + (paymentRequest || 'address')} // 🐱 FIX #9: Forzar re-render al cambiar modo
                    value={getQRValue()}
                    size={256}
                    level="H"
                    includeMargin={false}
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-white p-1 rounded-full shadow-md">
                      <BitcoinLogoSVG />
                    </div>
                  </div>
                </div>

                {/* Timer */}
                {mode === 'invoice' && timeLeft !== null && timeLeft > 0 && (
                  <div className="flex items-center justify-center gap-2 text-orange-400 mb-4">
                    <Clock className="w-4 h-4 animate-pulse" />
                    <span className="font-mono text-sm">
                      {lang === 'es' ? 'Expira en' : 'Expires in'} {formatTime(timeLeft)}
                    </span>
                  </div>
                )}

                {/* Back Button */}
                {mode === 'invoice' && (
                  <button
                    onClick={resetToAddress}
                    disabled={isProcessing}
                    className="w-full flex items-center justify-center gap-2 text-slate-400 hover:text-white text-sm py-2 hover:bg-slate-800 rounded-xl transition-colors disabled:opacity-50"
                  >
                    <ArrowRight className="w-4 h-4 rotate-180" />
                    {lang === 'es' ? 'Elegir otra cantidad' : 'Choose different amount'}
                  </button>
                )}

                <p className="text-center mt-4 text-slate-500 text-xs font-mono uppercase tracking-[2px]">
                  {mode === 'invoice' ? t.scan : t.copy}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Controls */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="max-w-md mx-auto md:mx-0 space-y-6"
          >
            {/* Preset Amounts */}
            <div className="grid grid-cols-2 gap-4">
              {PRESET_AMOUNTS.map((amount) => (
                <button
                  key={amount}
                  onClick={() => handleAmountSelect(amount)}
                  disabled={!canGenerateInvoice}
                  className={`
                    relative overflow-hidden group p-4 rounded-2xl border-2 transition-all duration-300
                    ${selectedAmount === amount && mode === 'invoice'
                      ? 'bg-orange-500/20 border-orange-500 text-orange-400'
                      : 'bg-slate-900/50 border-slate-700 hover:border-orange-500/50 hover:bg-slate-800/50 text-slate-300'
                    }
                    ${!canGenerateInvoice ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}
                  `}
                >
                  <div className="relative z-10">
                    <div className="text-2xl font-bold font-mono mb-1">
                      {formatSats(amount)}
                    </div>
                    <div className="text-xs opacity-70 uppercase tracking-wider">
                      sats
                    </div>
                  </div>
                  {selectedAmount === amount && mode === 'invoice' && (
                    <motion.div
                      layoutId="activeGlow"
                      className="absolute inset-0 bg-orange-500/10"
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Custom Amount */}
            <form onSubmit={handleCustomSubmit} className="flex gap-3">
              <div className="relative flex-1">
                <input
                  type="number"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  placeholder={t.customAmount}
                  disabled={!canGenerateInvoice}
                  min="1"
                  step="1"
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 disabled:opacity-50 font-mono"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm">sats</span>
              </div>
              <button
                type="submit"
                disabled={!customAmount || parseInt(customAmount) <= 0 || !canGenerateInvoice}
                className="bg-orange-500 hover:bg-orange-600 disabled:bg-slate-800 disabled:text-slate-500 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2"
              >
                {isProcessing ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  />
                ) : (
                  <Zap className="w-5 h-5" />
                )}
              </button>
            </form>

            {/* Direct Address */}
            <div className="pt-6 border-t border-slate-800">
              <p className="text-slate-500 text-sm mb-4 text-center">
                {lang === 'es' ? 'O envía directo a' : 'Or send directly to'}
              </p>
              <div className="flex items-center justify-center gap-3 bg-slate-900 border border-slate-700 rounded-2xl px-6 py-4">
                <code className="text-orange-400 font-mono text-sm md:text-base">{lightningAddress}</code>
                <button
                  onClick={copyAddress}
                  className="p-2 hover:bg-slate-800 rounded-xl transition-colors group"
                >
                  {copied ? (
                    <Check className="w-5 h-5 text-green-400" />
                  ) : (
                    <Copy className="w-5 h-5 text-slate-400 group-hover:text-orange-400" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-slate-600 text-xs">
              <Zap className="w-3 h-3" />
              {t.powered}
            </div>
          </motion.div>
        </div>

        {/* Success Message */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
            >
              <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-8 py-6 rounded-3xl shadow-2xl flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-full">
                  <Heart className="w-8 h-8 fill-current" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{t.success}</div>
                  <div className="text-orange-100">{t.thankYou}</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Toast */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-4 rounded-2xl flex items-center gap-3 shadow-2xl z-50"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
              <button
                onClick={() => setError(null)}
                className="ml-2 p-1 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Confetti */}
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  opacity: 1,
                  y: -20,
                  x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
                  rotate: 0
                }}
                animate={{
                  opacity: 0,
                  y: (typeof window !== 'undefined' ? window.innerHeight : 1000) + 100,
                  rotate: 360 * (Math.random() > 0.5 ? 1 : -1),
                  x: `+=${(Math.random() - 0.5) * 200}`
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  ease: "easeOut"
                }}
                className="absolute w-3 h-3 rounded-full"
                style={{
                  backgroundColor: ['#f97316', '#fbbf24', '#f59e0b'][Math.floor(Math.random() * 3)]
                }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}