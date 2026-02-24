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
  widgetUrl: string;
}

type Item = Economy | Exchange;

// ============================================================================
// COMPONENTE: Changelly Widget
// ============================================================================

function ChangellyWidget() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-start gap-3 mb-4">
        <div className="p-2.5 rounded-xl flex-shrink-0 bg-[#f7931a]/10 border border-[#f7931a]/20">
          <Bitcoin className="w-5 h-5 text-[#f7931a]" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg sm:text-xl font-bold text-white font-mono">
            Changelly
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Compra Bitcoin con tarjeta o transferencia
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border bg-purple-500/20 text-purple-400 border-purple-500/30">
          Instant Buy
        </span>
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border border-slate-600 bg-slate-800 text-[#f7931a]">
          MXN, USD → BTC
        </span>
      </div>

      <p className="text-sm text-slate-300 leading-relaxed mb-4">
        Compra Bitcoin al instante con pesos mexicanos o dólares.
        Widget integrado con nuestra cuenta de referido.
      </p>

      <div className="relative rounded-xl overflow-hidden border border-slate-700/50 bg-slate-950 flex-1 min-h-[400px]">
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 z-10"
            >
              <Loader2 className="w-8 h-8 text-[#f7931a] animate-spin mb-2" />
              <span className="text-xs text-slate-500 font-mono">Cargando widget...</span>
            </motion.div>
          )}
        </AnimatePresence>

        {hasError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 z-10">
            <p className="text-sm text-slate-400 mb-3">No se pudo cargar el widget</p>
            <a
              href="https://changelly.com "
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#f7931a] hover:bg-amber-400 text-black text-sm font-bold rounded-xl transition-colors"
            >
              Visitar Changelly
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )}

        <iframe
          src="https://widget.changelly.com?from=mxn%2Cusd&to=btc&amount=700&address=&fromDefault=mxn&toDefault=btc&merchant_id=eD8DX5SsvWty_llz&payment_id=&v=3&type=no-rev-share&color=f9861b&headerId=1&logo=visible&buyButtonTextId=2"
          width="100%"
          height="100%"
          frameBorder="0"
          allow="camera"
          onLoad={() => setIsLoading(false)}
          onError={() => { setIsLoading(false); setHasError(true); }}
          loading="lazy"
          className={`
            absolute inset-0 w-full h-full transition-opacity duration-300
            ${isLoading || hasError ? 'opacity-0' : 'opacity-100'}
          `}
          title="Changelly Exchange Widget"
        />
      </div>

      <p className="text-[10px] text-slate-600 mt-3 text-center font-mono">
        Al usar este widget apoyas nuestro proyecto • Comisiones competitivas
      </p>
    </div>
  );
}

// ============================================================================
// COMPONENTE: Economy Card
// ============================================================================

function EconomyCard({ item }: { item: Economy }) {
  const statusColors = {
    active: 'bg-green-500/20 text-green-400 border-green-500/30',
    coming: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    planned: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  };

  const statusLabels = {
    active: 'Activo',
    coming: 'Próximamente',
    planned: 'Planificado',
  };

  return (
    <div className="flex flex-col h-full p-6 bg-slate-900/50 rounded-2xl border border-slate-800/50">
      <div className="flex items-start gap-4 mb-4">
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <TreePine className="w-6 h-6 text-emerald-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white font-mono">{item.name}</h3>
          <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
            <MapPin className="w-3 h-3" />
            <span>{item.location}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusColors[item.status]}`}>
          {statusLabels[item.status]}
        </span>
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border border-slate-600 bg-slate-800 text-slate-300">
          {item.ecosystem}
        </span>
      </div>

      <p className="text-sm text-slate-300 leading-relaxed mb-4 flex-1">
        {item.description}
      </p>

      <a
        href={item.website}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl transition-colors"
      >
        Conocer Más
        <ExternalLink className="w-4 h-4" />
      </a>
    </div>
  );
}

// ============================================================================
// DATA
// ============================================================================

const items: Item[] = [
  // Economías Circulares
  {
    id: 'bitcoin-beach',
    type: 'economy',
    name: 'Bitcoin Beach',
    description: 'Comunidad pionera en El Zonte, El Salvador, donde Bitcoin es moneda de curso legal. Un modelo de economía circular que inspira al mundo.',
    website: 'https://bitcoinbeach.com ',
    location: 'El Zonte, El Salvador',
    status: 'active',
    ecosystem: 'Turismo, Comercio Local',
  },
  {
    id: 'bitcoin-jungle',
    type: 'economy',
    name: 'Bitcoin Jungle',
    description: 'Ecosistema Bitcoin en Costa Rica que promueve la adopción mediante educación, merchant onboarding y comunidad activa.',
    website: 'https://bitcoinjungle.app ',
    location: 'Costa Rica',
    status: 'active',
    ecosystem: 'Pagos, Educación',
  },
  {
    id: 'bitcoin-lagos',
    type: 'economy',
    name: 'Bitcoin Lagos',
    description: 'Iniciativa de adopción en Nigeria, uno de los mercados P2P más grandes de Bitcoin en África.',
    website: 'https://bitcoinlagos.org ',
    location: 'Lagos, Nigeria',
    status: 'coming',
    ecosystem: 'P2P Trading, Remesas',
  },
  // Exchange: Solo Changelly
  {
    id: 'changelly',
    type: 'exchange',
    name: 'Changelly',
    description: 'Compra Bitcoin al instante con pesos mexicanos o dólares. Widget integrado con nuestra cuenta de referido.',
    website: 'https://changelly.com ',
    widgetUrl: 'https://widget.changelly.com ',
  },
];

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export function CircularEconomiesCarousel({ lang = 'en' }: { lang?: 'en' | 'es' }) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentItem = items[current];

  // Auto-scroll
  useEffect(() => {
    if (!isPaused) {
      timerRef.current = setInterval(() => {
        setDirection(1);
        setCurrent((prev) => (prev + 1) % items.length);
      }, 10000); // 10 segundos
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused]);

  const next = () => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % items.length);
  };

  const prev = () => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + items.length) % items.length);
  };

  const goToSlide = (idx: number) => {
    setDirection(idx > current ? 1 : -1);
    setCurrent(idx);
  };

  const translations = {
    en: {
      title: 'Circular Economies',
      subtitle: 'Discover Bitcoin communities and get your first sats',
    },
    es: {
      title: 'Economías Circulares',
      subtitle: 'Descubre comunidades Bitcoin y obtén tus primeros sats',
    },
  };

  const t = translations[lang];

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
      scale: 0.95,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 100 : -100,
      opacity: 0,
      scale: 0.95,
    }),
  };

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-slate-950 border-y border-slate-800/50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#f7931a]/10 border border-[#f7931a]/20 rounded-full text-[#f7931a] text-xs font-mono mb-3">
            <Bitcoin className="w-3 h-3" />
            <span>adoption · community · on-ramp</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white font-mono mb-2">
            {t.title}
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            {t.subtitle}
          </p>
        </div>

        {/* Carousel */}
        <div className="relative">
          {/* Navigation */}
          <button
            onClick={prev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 p-2 bg-slate-800/80 hover:bg-slate-700 rounded-full text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={next}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 p-2 bg-slate-800/80 hover:bg-slate-700 rounded-full text-white transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Content */}
          <div className="min-h-[500px] relative overflow-hidden rounded-2xl">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={current}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="absolute inset-0"
              >
                {currentItem.type === 'economy' ? (
                  <EconomyCard item={currentItem as Economy} />
                ) : (
                  <ChangellyWidget />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-4">
            {items.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToSlide(idx)}
                className={`w-2 h-2 rounded-full transition-all ${idx === current ? 'bg-[#f7931a] w-4' : 'bg-slate-700 hover:bg-slate-600'
                  }`}
              />
            ))}
          </div>
        </div>

        {/* Pause/Play */}
        <div className="flex justify-center mt-4">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            {isPaused ? (
              <>
                <Play className="w-3 h-3" />
                <span>Resume</span>
              </>
            ) : (
              <>
                <Pause className="w-3 h-3" />
                <span>Pause</span>
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}