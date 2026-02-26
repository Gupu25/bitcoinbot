'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bitcoin,
  MapPin,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Loader2,
  Globe,
  Zap,
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================
type Economy = {
  id: string;
  type: 'economy';
  name: string;
  description: string;
  website: string;
  location: string;
  status: 'active' | 'coming';
  ecosystem: string;
};

type Exchange = {
  id: string;
  type: 'exchange';
  name: string;
  description: string;
  website: string;
  widgetUrl?: string;
};

type Item = Economy | Exchange;

// ============================================================================
// DATA
// ============================================================================
const items: Item[] = [
  {
    id: 'bitcoin-beach',
    type: 'economy',
    name: 'Bitcoin Beach',
    description:
      'La primera economía circular de Bitcoin en El Zonte, El Salvador. Pionera en demostrar que Bitcoin puede funcionar como moneda local en una comunidad.',
    website: 'https://www.bitcoinbeach.com',
    location: 'El Zonte, El Salvador',
    status: 'active',
    ecosystem: 'Lightning Network',
  },
  {
    id: 'bitcoin-jungle',
    type: 'economy',
    name: 'Bitcoin Jungle',
    description:
      'Economía circular Bitcoin en la costa del Pacífico de Costa Rica. Más de 200 negocios aceptan Bitcoin con Lightning en la región de Uvita y Dominical.',
    website: 'https://bitcoinjungle.app',
    location: 'Costa Rica',
    status: 'active',
    ecosystem: 'Lightning Network',
  },
  {
    id: 'bitcoin-lagos',
    type: 'economy',
    name: 'Bitcoin Lagos',
    description:
      'Comunidad Bitcoin creciente en Nigeria que trabaja para empoderar a los ciudadanos con herramientas financieras descentralizadas.',
    website: 'https://bitcoinlagos.io',
    location: 'Lagos, Nigeria',
    status: 'coming',
    ecosystem: 'Bitcoin + Lightning',
  },
  {
    id: 'kapitalex',
    type: 'exchange',
    name: 'Kapitalex',
    description:
      'Compra y vende Bitcoin instantáneamente en México. Préstamos colateralizados sin buró de crédito.',
    website: 'https://www.kapitalex.com/#/register?ref=FDHFVSRW5KJANRX',
  },
  {
    id: 'changelly',
    type: 'exchange',
    name: 'Changelly',
    description:
      'Compra Bitcoin al instante con pesos mexicanos o dólares. Widget integrado con nuestra cuenta de referido.',
    website: 'https://changelly.com',
    widgetUrl: 'https://widget.changelly.com',
  },
  {
    id: 'aureo',
    type: 'exchange',
    name: 'Aureo',
    description:
      'Compra y vende Bitcoin instantáneamente con pesos mexicanos vía SPEI y Lightning.',
    website: 'https://www.aureobitcoin.com',
  },
];

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================
const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
    scale: 0.95,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 300 : -300,
    opacity: 0,
    scale: 0.95,
  }),
};

const transition = {
  x: { type: 'spring', stiffness: 300, damping: 30 },
  opacity: { duration: 0.2 },
  scale: { duration: 0.2 },
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function KapitalexCard() {
  return (
    <div className="relative flex flex-col h-full p-6 sm:p-8 bg-slate-900/60 border border-slate-800 rounded-2xl sm:rounded-3xl overflow-hidden hover:border-orange-500/30 transition-colors">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff6b35]/5 rounded-full blur-3xl" />

      <div className="flex items-start gap-4 mb-4 relative z-10">
        <div className="p-2.5 rounded-xl flex-shrink-0 bg-[#ff6b35]/10 border border-[#ff6b35]/20">
          <Bitcoin className="w-6 h-6 text-[#ff6b35]" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg sm:text-xl font-bold text-white font-mono">Kapitalex</h3>
            <motion.span
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ repeat: Infinity, repeatType: 'reverse', duration: 1.5 }}
              className="text-[8px] bg-green-500 text-black px-1.5 py-0.5 rounded-full font-bold"
            >
              NUEVO
            </motion.span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Bitcoin en México desde 2016</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4 relative z-10">
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border bg-blue-500/20 text-blue-400 border-blue-500/30">
          🇲🇽 México
        </span>
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border border-slate-700 bg-slate-800 text-white">
          Préstamos con BTC
        </span>
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border border-slate-700 bg-slate-800 text-white">
          MXNT + USDT
        </span>
      </div>

      <p className="text-sm text-slate-300 leading-relaxed mb-6 flex-1 relative z-10">
        Compra y vende Bitcoin instantáneamente con bancos mexicanos.
        Obtén préstamos en MXNT usando tu Bitcoin como garantía,
        sin historial crediticio. La plataforma más confiable de México.
      </p>

      <a
        href="https://www.kapitalex.com/#/register?ref=FDHFVSRW5KJANRX"
        target="_blank"
        rel="noopener noreferrer"
        className="relative z-10 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#ff6b35] to-[#f7931a] hover:from-[#ff8c5a] hover:to-[#ffa64d] text-white text-sm font-bold rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-orange-500/20"
      >
        Registrarse con referral
        <ExternalLink className="w-4 h-4" />
      </a>

      <div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-black text-[10px] font-bold px-2 py-1 rounded-full shadow-lg z-20">
        🎯 Partner
      </div>

      <p className="text-[10px] text-slate-600 mt-4 text-center font-mono relative z-10">
        Al registrarte apoyas a BOB • Préstamos rápidos sin buró de crédito
      </p>
    </div>
  );
}

function ChangellyWidget() {
  return (
    <div className="relative flex flex-col h-full p-6 sm:p-8 bg-slate-900/60 border border-slate-800 rounded-2xl sm:rounded-3xl overflow-hidden hover:border-orange-500/30 transition-colors">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#f7931a]/5 rounded-full blur-3xl" />

      <div className="flex items-start gap-4 mb-4 relative z-10">
        <div className="p-2.5 rounded-xl flex-shrink-0 bg-[#f7931a]/10 border border-[#f7931a]/20">
          <Bitcoin className="w-6 h-6 text-[#f7931a]" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg sm:text-xl font-bold text-white font-mono">Changelly</h3>
          <p className="text-xs text-slate-500 mt-0.5">Exchange instantáneo global</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4 relative z-10">
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border bg-blue-500/20 text-blue-400 border-blue-500/30">
          🌎 Global
        </span>
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border border-slate-700 bg-slate-800 text-white">
          Tarjeta / SPEI
        </span>
      </div>

      <p className="text-sm text-slate-300 leading-relaxed mb-6 flex-1 relative z-10">
        Compra Bitcoin al instante con tarjeta de crédito, débito o transferencia bancaria.
        Servicio disponible en México y LATAM. Sin registro complejo.
      </p>

      <a
        href="https://changelly.com"
        target="_blank"
        rel="noopener noreferrer"
        className="relative z-10 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#f7931a] hover:bg-[#f7931a]/90 text-black text-sm font-bold rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98]"
      >
        Comprar Bitcoin
        <ExternalLink className="w-4 h-4" />
      </a>
    </div>
  );
}

function AureoCard() {
  return (
    <div className="relative flex flex-col h-full p-6 sm:p-8 bg-slate-900/60 border border-slate-800 rounded-2xl sm:rounded-3xl overflow-hidden hover:border-amber-500/30 transition-colors">
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl" />

      <div className="flex items-start gap-4 mb-4 relative z-10">
        <div className="p-2.5 rounded-xl flex-shrink-0 bg-amber-500/10 border border-amber-500/20">
          <Bitcoin className="w-6 h-6 text-amber-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg sm:text-xl font-bold text-white font-mono">Aureo</h3>
          <p className="text-xs text-slate-500 mt-0.5">Bitcoin rápido en México</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border bg-blue-500/20 text-blue-400 border-blue-500/30">
          🇲🇽 México
        </span>
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border border-slate-600 bg-slate-800 text-white">
          SPEI
        </span>
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border border-slate-600 bg-slate-800 text-white">
          Lightning
        </span>
      </div>

      <p className="text-sm text-slate-300 leading-relaxed mb-6 flex-1">
        Compra Bitcoin al instante con SPEI mexicano. Retiros vía Lightning Network
        para transacciones rápidas y económicas. Ideal para mexicanos que quieren
        empezar sin complicaciones.
      </p>

      <a
        href="https://www.aureobitcoin.com"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold rounded-xl transition-colors"
      >
        Visitar Aureo
        <ExternalLink className="w-4 h-4" />
      </a>
    </div>
  );
}

// Economy Card Component
function EconomyCard({ item }: { item: Economy }) {
  return (
    <div className="flex flex-col h-full p-6 bg-slate-900/50 rounded-2xl border border-slate-800/50">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#f7931a]/10 border border-[#f7931a]/20">
            <Globe className="w-6 h-6 text-[#f7931a]" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white font-mono">{item.name}</h3>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
              <MapPin className="w-3 h-3" />
              {item.location}
            </div>
          </div>
        </div>
        <span
          className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${item.status === 'active'
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
            }`}
        >
          {item.status === 'active' ? 'Activo' : 'Próximamente'}
        </span>
      </div>

      <div className="mb-4">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border border-slate-600 bg-slate-800 text-white">
          <Zap className="w-3 h-3 text-[#f7931a]" />
          {item.ecosystem}
        </span>
      </div>

      <p className="text-sm text-slate-300 leading-relaxed mb-6 flex-1">{item.description}</p>

      <a
        href={item.website}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold rounded-xl transition-colors border border-slate-700"
      >
        Visitar sitio
        <ExternalLink className="w-4 h-4" />
      </a>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export function CircularEconomiesCarousel({ lang = 'en' }: { lang?: 'en' | 'es' }) {
  const [[current, direction], setCurrent] = useState<[number, number]>([0, 0]);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const total = items.length;
  const currentItem = items[current] ?? null;

  const paginate = useCallback(
    (newDirection: number) => {
      setCurrent(([prev]) => [
        (prev + newDirection + total) % total,
        newDirection,
      ]);
    },
    [total]
  );

  // Auto-advance
  useEffect(() => {
    if (isPaused) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => paginate(1), 6000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPaused, paginate]);

  const labels = {
    en: {
      title: 'Circular Economies',
      subtitle: 'Real-world Bitcoin communities & exchanges',
      pause: 'Pause',
      play: 'Play',
      footer: '🤝 Our partners help us maintain BOB • Thanks for supporting using their links',
    },
    es: {
      title: 'Economías Circulares',
      subtitle: 'Comunidades Bitcoin reales e intercambios',
      pause: 'Pausar',
      play: 'Reanudar',
      footer: '🤝 Nuestros partners nos ayudan a mantener BOB • Gracias por apoyar usando sus links',
    },
  };
  const t = labels[lang];

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div>
          <h2 className="text-xl font-bold text-white font-mono">{t.title}</h2>
          <p className="text-xs text-slate-500 mt-0.5">{t.subtitle}</p>
        </div>
        <button
          onClick={() => setIsPaused((p) => !p)}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          aria-label={isPaused ? t.play : t.pause}
        >
          {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
        </button>
      </div>

      {/* Carousel */}
      <div className="relative w-full" style={{ minHeight: '400px' }}>
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={current}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={transition}
            className="absolute inset-0"
          >
            {!currentItem ? (
              <div className="flex items-center justify-center h-full text-slate-500">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : currentItem.type === 'economy' ? (
              <EconomyCard item={currentItem as Economy} />
            ) : (
              <>
                {currentItem.id === 'kapitalex' && <KapitalexCard />}
                {currentItem.id === 'changelly' && <ChangellyWidget />}
                {currentItem.id === 'aureo' && <AureoCard />}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mt-4 px-1">
        <button
          onClick={() => paginate(-1)}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          aria-label="Previous"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-1.5">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(([prev]) => [i, i > prev ? 1 : -1])}
              className={`rounded-full transition-all duration-300 ${i === current
                  ? 'w-5 h-2 bg-[#f7931a]'
                  : 'w-2 h-2 bg-slate-600 hover:bg-slate-400'
                }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>

        <button
          onClick={() => paginate(1)}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          aria-label="Next"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Footer */}
      <p className="text-[10px] text-slate-700 text-center mt-6 font-mono">
        {t.footer}
      </p>
    </div>
  );
}