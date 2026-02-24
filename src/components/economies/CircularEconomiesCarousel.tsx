'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  ExternalLink,
  Bitcoin,
  TreePine,
  Loader2,
  Pause,
  Play
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================
type ItemType = 'economy' | 'exchange';

interface BaseItem {
  id: string;
  type: ItemType;
  name: string;
  description: string;
  website: string;
}

interface Economy extends BaseItem {
  type: 'economy';
  location: string;
  status: 'active' | 'coming' | 'planned';
  ecosystem: string;
}

interface Exchange extends BaseItem {
  type: 'exchange';
  widgetUrl?: string;
}

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
// SLIDE VARIANTS
// ============================================================================
const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
  }),
};

const transition = {
  x: { type: 'spring', stiffness: 300, damping: 30 },
  opacity: { duration: 0.2 },
};

// ============================================================================
// CHANGELLY WIDGET
// ============================================================================
function ChangellyWidget() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-start gap-4 mb-4">
        <div className="p-2.5 rounded-xl flex-shrink-0 bg-blue-500/10 border border-blue-500/20">
          <Bitcoin className="w-6 h-6 text-blue-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg sm:text-xl font-bold text-white font-mono">Changelly</h3>
          <p className="text-xs text-slate-500 mt-0.5">Exchange rápido con referral</p>
        </div>
      </div>

      <div className="relative flex-1 min-h-[220px] rounded-xl overflow-hidden border border-slate-700/50">
        {isLoading && !hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 z-10">
            <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
          </div>
        )}
        {hasError ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400">
            <Bitcoin className="w-8 h-8" />
            <p className="text-sm">Widget no disponible</p>
            <a
              href="https://changelly.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl transition-colors"
            >
              Ir a Changelly <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        ) : (
          <iframe
            src="https://widget.changelly.com?from=mxn&to=btc&amount=1000&address=&fromDefault=mxn&toDefault=btc&theme=dark&merchant_id=your_merchant_id&payment_id=&v=3"
            width="100%"
            height="100%"
            className="border-0"
            onLoad={() => setIsLoading(false)}
            onError={() => { setIsLoading(false); setHasError(true); }}
            title="Changelly Widget"
          />
        )}
      </div>
    </div>
  );
}

// ============================================================================
// AUREO CARD
// ============================================================================
function AureoCard() {
  return (
    <div className="flex flex-col h-full p-6 bg-slate-900/50 rounded-2xl border border-slate-800/50">
      <div className="flex items-start gap-4 mb-4">
        <div className="p-2.5 rounded-xl flex-shrink-0 bg-[#f7931a]/10 border border-[#f7931a]/20">
          <Bitcoin className="w-6 h-6 text-[#f7931a]" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg sm:text-xl font-bold text-white font-mono">Aureo</h3>
          <p className="text-xs text-slate-500 mt-0.5">El exchange premium de México</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border bg-[#f7931a]/20 text-[#f7931a] border-[#f7931a]/30">
          SPEI + Lightning
        </span>
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border border-slate-600 bg-slate-800 text-white">
          MXN → BTC
        </span>
      </div>

      <p className="text-sm text-slate-300 leading-relaxed mb-6 flex-1">
        Compra y vende Bitcoin instantáneamente con pesos mexicanos vía SPEI y Lightning.
        Soporte humano real y programa de referidos. La mejor experiencia local para Bitcoiners mexicanos.
      </p>

      <a
        href="https://www.aureobitcoin.com"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#f7931a] hover:bg-amber-400 text-black text-sm font-bold rounded-xl transition-colors"
      >
        Ir a Aureo (usa nuestro referral)
        <ExternalLink className="w-4 h-4" />
      </a>

      <p className="text-[10px] text-slate-600 mt-4 text-center font-mono">
        Al usar Aureo apoyas nuestro proyecto • Comisiones competitivas
      </p>
    </div>
  );
}

// ============================================================================
// ECONOMY CARD
// ============================================================================
function EconomyCard({ item }: { item: Economy }) {
  const statusConfig = {
    active: { label: 'Activa', className: 'bg-green-500/20 text-green-400 border-green-500/30' },
    coming: { label: 'Próximamente', className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
    planned: { label: 'Planeada', className: 'bg-slate-500/20 text-slate-400 border-slate-500/30' },
  };
  const { label, className } = statusConfig[item.status];

  return (
    <div className="flex flex-col h-full p-6 bg-slate-900/50 rounded-2xl border border-slate-800/50">
      <div className="flex items-start gap-4 mb-4">
        <div className="p-2.5 rounded-xl flex-shrink-0 bg-green-500/10 border border-green-500/20">
          <TreePine className="w-6 h-6 text-green-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg sm:text-xl font-bold text-white font-mono">{item.name}</h3>
          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {item.location}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${className}`}>
          {label}
        </span>
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border border-slate-600 bg-slate-800 text-white">
          {item.ecosystem}
        </span>
      </div>

      <p className="text-sm text-slate-300 leading-relaxed mb-6 flex-1">{item.description}</p>

      <a
        href={item.website}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-500 text-white text-sm font-bold rounded-xl transition-colors"
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
    en: { title: 'Circular Economies', subtitle: 'Real-world Bitcoin communities & exchanges', pause: 'Pause', play: 'Play' },
    es: { title: 'Economías Circulares', subtitle: 'Comunidades Bitcoin reales e intercambios', pause: 'Pausar', play: 'Reanudar' },
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
          onClick={() => setIsPaused(p => !p)}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          aria-label={isPaused ? t.play : t.pause}
        >
          {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
        </button>
      </div>

      {/* Carousel */}
      <div className="relative w-full" style={{ minHeight: '340px' }}>
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
            ) : currentItem.id === 'changelly' ? (
              <ChangellyWidget />
            ) : (
              <AureoCard />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mt-4 px-1">
        {/* Prev */}
        <button
          onClick={() => paginate(-1)}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          aria-label="Previous"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Dots */}
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

        {/* Next */}
        <button
          onClick={() => paginate(1)}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          aria-label="Next"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}