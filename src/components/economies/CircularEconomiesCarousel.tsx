'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  ExternalLink,
  Shield,
  Coins,
  Sparkles,
  Bitcoin,
  TreePine,
  Loader2,
  Maximize2,
  Minimize2,
  Pause,
  Play
} from 'lucide-react';

type ItemType = 'economy' | 'sponsor' | 'widget';

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

interface Sponsor extends BaseItem {
  type: 'sponsor';
  category: 'CEX' | 'P2P' | 'Swap';
  commission: string;
  feature: string;
  audience: string;
  icon: React.ElementType;
}

interface WidgetSponsor extends BaseItem {
  type: 'widget';
  category: 'Swap';
  commission: string;
  feature: string;
  audience: string;
  icon: React.ElementType;
  widgetUrl: string;
  defaultAmount: number;
  defaultFrom: string;
  defaultTo: string;
  height: number;
}

type Item = Economy | Sponsor | WidgetSponsor;

// ============================================================================
// COMPONENTE: Widget Card con Auto-pause
// ============================================================================

function WidgetCard({ 
  item, 
  isExpanded, 
  onToggleExpand, 
  isActive,
  onInteractionStart,
  onInteractionEnd,
}: { 
  item: WidgetSponsor; 
  isExpanded: boolean;
  onToggleExpand: () => void;
  isActive: boolean;
  onInteractionStart: () => void;
  onInteractionEnd: () => void;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    onInteractionStart();
  }, [onInteractionStart]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setTimeout(() => {
      if (!document.activeElement?.closest(`[data-widget-id="${item.id}"]`)) {
        onInteractionEnd();
      }
    }, 100);
  }, [onInteractionEnd, item.id]);

  useEffect(() => {
    const handleFocus = () => {
      const activeElement = document.activeElement;
      if (activeElement === iframeRef.current || 
          containerRef.current?.contains(activeElement)) {
        onInteractionStart();
      }
    };

    const handleBlur = () => {
      setTimeout(() => {
        const activeElement = document.activeElement;
        if (!containerRef.current?.contains(activeElement)) {
          onInteractionEnd();
        }
      }, 50);
    };

    window.addEventListener('focus', handleFocus, true);
    window.addEventListener('blur', handleBlur, true);

    return () => {
      window.removeEventListener('focus', handleFocus, true);
      window.removeEventListener('blur', handleBlur, true);
    };
  }, [onInteractionStart, onInteractionEnd]);

  useEffect(() => {
    if (isActive) {
      setIsLoading(true);
      setHasError(false);
    }
  }, [isActive]);

  return (
    <div 
      ref={containerRef}
      data-widget-id={item.id}
      className="flex flex-col h-full"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="p-2.5 rounded-xl flex-shrink-0 bg-[#f7931a]/10 border border-[#f7931a]/20">
          <item.icon className="w-5 h-5 text-[#f7931a]" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg sm:text-xl font-bold text-white font-mono">
              {item.name}
            </h3>
            {isHovered && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-500/20 text-green-400 text-[10px] rounded-full border border-green-500/30"
              >
                <Pause className="w-3 h-3" />
                <span>Auto-pausado</span>
              </motion.span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {item.audience}
          </p>
        </div>
        <button
          onClick={onToggleExpand}
          className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
          title={isExpanded ? "Minimizar" : "Expandir"}
        >
          {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border bg-purple-500/20 text-purple-400 border-purple-500/30">
          Instant Swap
        </span>
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border border-slate-600 bg-slate-800 text-[#f7931a]">
          {item.commission}
        </span>
      </div>

      <p className="text-sm text-slate-300 leading-relaxed mb-3">
        {item.description}
      </p>

      <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50 mb-3">
        <span className="text-xs text-slate-500 uppercase tracking-wider">Destacado</span>
        <p className="text-sm font-mono text-slate-200 mt-1">
          {item.feature}
        </p>
      </div>

      <div className={`
        relative rounded-xl overflow-hidden border border-slate-700/50 bg-slate-950
        transition-all duration-500 ease-out flex-1
        ${isExpanded ? 'min-h-[450px]' : 'min-h-[350px]'}
        ${isHovered ? 'ring-2 ring-[#f7931a]/30' : ''}
      `}>
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
              href={item.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#f7931a] hover:bg-amber-400 text-black text-sm font-bold rounded-xl transition-colors"
            >
              Visitar Sitio
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )}

        {!isHovered && !isLoading && !hasError && (
          <div className="absolute inset-0 z-5 pointer-events-none opacity-0 hover:opacity-100 transition-opacity">
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 px-3 py-1.5 rounded-full text-xs text-white">
              Haz click para pausar el carousel
            </div>
          </div>
        )}

        <iframe
          ref={iframeRef}
          src={item.widgetUrl}
          width="100%"
          height="100%"
          frameBorder="0"
          allow="camera"
          onLoad={() => setIsLoading(false)}
          onError={() => { setIsLoading(false); setHasError(true); }}
          loading="lazy"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          className={`
            absolute inset-0 w-full h-full transition-opacity duration-300
            ${isLoading || hasError ? 'opacity-0' : 'opacity-100'}
          `}
          title={`${item.name} Exchange Widget`}
        />
      </div>

      <p className="text-[10px] text-slate-600 mt-2 text-center font-mono">
        {isHovered 
          ? 'Carousel pausado. Completa tu operación con calma.' 
          : isExpanded 
            ? 'Presiona minimizar para vista compacta' 
            : 'Presiona expandir para trading completo'
        }
      </p>
    </div>
  );
}

// ============================================================================
// COMPONENTE: Sponsor Card
// ============================================================================

function SponsorCard({ item }: { item: Sponsor }) {
  const IconComponent = item.icon;
  
  return (
    <div className="flex flex-col h-full p-6 bg-slate-900/50 rounded-2xl border border-slate-800/50">
      <div className="flex items-start gap-4 mb-4">
        <div className="p-3 rounded-xl bg-[#f7931a]/10 border border-[#f7931a]/20">
          <IconComponent className="w-6 h-6 text-[#f7931a]" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white font-mono">{item.name}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{item.audience}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border bg-blue-500/20 text-blue-400 border-blue-500/30">
          {item.category}
        </span>
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border border-slate-600 bg-slate-800 text-[#f7931a]">
          {item.commission}
        </span>
      </div>

      <p className="text-sm text-slate-300 leading-relaxed mb-4 flex-1">
        {item.description}
      </p>

      <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50 mb-4">
        <span className="text-xs text-slate-500 uppercase tracking-wider">Destacado</span>
        <p className="text-sm font-mono text-slate-200 mt-1">{item.feature}</p>
      </div>

      <a
        href={item.website}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#f7931a] hover:bg-amber-400 text-black text-sm font-bold rounded-xl transition-colors"
      >
        Visitar Sitio
        <ExternalLink className="w-4 h-4" />
      </a>
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
  // Economies
  {
    id: 'bitcoin-beach',
    type: 'economy',
    name: 'Bitcoin Beach',
    description: 'Comunidad pionera en El Zonte, El Salvador, donde Bitcoin es moneda de curso legal. Un modelo de economía circular que inspira al mundo.',
    website: 'https://bitcoinbeach.com',
    location: 'El Zonte, El Salvador',
    status: 'active',
    ecosystem: 'Turismo, Comercio Local',
  },
  {
    id: 'bitcoin-jungle',
    type: 'economy',
    name: 'Bitcoin Jungle',
    description: 'Ecosistema Bitcoin en Costa Rica que promueve la adopción mediante educación, merchant onboarding y comunidad activa.',
    website: 'https://bitcoinjungle.app',
    location: 'Costa Rica',
    status: 'active',
    ecosystem: 'Pagos, Educación',
  },
  {
    id: 'bitcoin-lagos',
    type: 'economy',
    name: 'Bitcoin Lagos',
    description: 'Iniciativa de adopción en Nigeria, uno de los mercados P2P más grandes de Bitcoin en África.',
    website: 'https://bitcoinlagos.org',
    location: 'Lagos, Nigeria',
    status: 'coming',
    ecosystem: 'P2P Trading, Remesas',
  },
  // Sponsors
  {
    id: 'binance',
    type: 'sponsor',
    name: 'Binance',
    description: 'El exchange de criptomonedas más grande del mundo por volumen. Ofrece trading spot, futures, y una amplia gama de servicios financieros.',
    website: 'https://binance.com',
    category: 'CEX',
    commission: 'Hasta 20% descuento',
    feature: 'Trading profesional con liquidez profunda',
    audience: 'Traders de todos los niveles',
    icon: Coins,
  },
  {
    id: 'paxful',
    type: 'sponsor',
    name: 'Paxful',
    description: 'Marketplace P2P líder que conecta compradores y vendedores de Bitcoin con más de 300 métodos de pago.',
    website: 'https://paxful.com',
    category: 'P2P',
    commission: '0% para compradores',
    feature: 'Múltiples métodos de pago locales',
    audience: 'Usuarios sin acceso bancario',
    icon: Shield,
  },
  // Widget Sponsors
  {
    id: 'sideshift',
    type: 'widget',
    name: 'SideShift.ai',
    description: 'Exchange instantáneo sin KYC para swaps rápidos entre criptomonedas. Ideal para usuarios que valoran privacidad.',
    website: 'https://sideshift.ai',
    category: 'Swap',
    commission: 'Fee competitivo ~0.5%',
    feature: 'Sin registro, swaps instantáneos',
    audience: 'Usuarios que priorizan privacidad',
    icon: Sparkles,
    widgetUrl: 'https://sideshift.ai/iframe/btc-to-usdt',
    defaultAmount: 0.01,
    defaultFrom: 'BTC',
    defaultTo: 'USDT',
    height: 400,
  },
];

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export function CircularEconomiesCarousel({ lang = 'en' }: { lang?: 'en' | 'es' }) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const [filter, setFilter] = useState<'all' | 'economy' | 'sponsor' | 'widget'>('all');
  const [expandedWidget, setExpandedWidget] = useState<string | null>(null);
  
  const [isPaused, setIsPaused] = useState(false);
  const [pauseReason, setPauseReason] = useState<'none' | 'widget' | 'manual'>('none');
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const resumeTimerRef = useRef<NodeJS.Timeout | null>(null);

  const filteredItems = items.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'sponsor') return item.type === 'sponsor' || item.type === 'widget';
    return item.type === filter;
  });

  const currentItem = filteredItems[current % filteredItems.length];
  const isEconomy = currentItem?.type === 'economy';
  const isWidget = currentItem?.type === 'widget';

  // ==========================================================================
  // CONTROL DEL TIMER
  // ==========================================================================
  
  const clearTimers = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (resumeTimerRef.current) {
      clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }
  }, []);

  const startAutoScroll = useCallback(() => {
    clearTimers();
    
    timerRef.current = setInterval(() => {
      setDirection(1);
      setCurrent((prev) => (prev + 1) % filteredItems.length);
    }, 8000);
  }, [filteredItems.length, clearTimers]);

  const pauseAutoScroll = useCallback((reason: 'widget' | 'manual') => {
    setIsPaused(true);
    setPauseReason(reason);
    clearTimers();
  }, [clearTimers]);

  const resumeAutoScroll = useCallback((delay = 0) => {
    if (resumeTimerRef.current) {
      clearTimeout(resumeTimerRef.current);
    }

    const resume = () => {
      setIsPaused(false);
      setPauseReason('none');
      startAutoScroll();
    };

    if (delay > 0) {
      resumeTimerRef.current = setTimeout(resume, delay);
    } else {
      resume();
    }
  }, [startAutoScroll]);

  useEffect(() => {
    if (!isPaused) {
      startAutoScroll();
    }
    return () => clearTimers();
  }, [isPaused, startAutoScroll, clearTimers]);

  useEffect(() => {
    setExpandedWidget(null);
    setCurrent(0);
    pauseAutoScroll('manual');
    resumeAutoScroll(2000);
  }, [filter]);

  // ==========================================================================
  // HANDLERS DE INTERACCIÓN CON WIDGET
  // ==========================================================================

  const handleWidgetInteractionStart = useCallback(() => {
    if (!isPaused) {
      pauseAutoScroll('widget');
    }
  }, [isPaused, pauseAutoScroll]);

  const handleWidgetInteractionEnd = useCallback(() => {
    if (isPaused && pauseReason === 'widget') {
      resumeAutoScroll(5000);
    }
  }, [isPaused, pauseReason, resumeAutoScroll]);

  // ==========================================================================
  // NAVEGACIÓN MANUAL
  // ==========================================================================

  const next = useCallback(() => {
    pauseAutoScroll('manual');
    setDirection(1);
    setCurrent((prev) => (prev + 1) % filteredItems.length);
    resumeAutoScroll(10000);
  }, [filteredItems.length, pauseAutoScroll, resumeAutoScroll]);

  const prev = useCallback(() => {
    pauseAutoScroll('manual');
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
    resumeAutoScroll(10000);
  }, [filteredItems.length, pauseAutoScroll, resumeAutoScroll]);

  const goToSlide = useCallback((idx: number) => {
    pauseAutoScroll('manual');
    setDirection(idx > current ? 1 : -1);
    setCurrent(idx);
    resumeAutoScroll(10000);
  }, [current, pauseAutoScroll, resumeAutoScroll]);

  const toggleWidgetExpand = useCallback((id: string) => {
    setExpandedWidget(prev => {
      const newState = prev === id ? null : id;
      
      if (newState === id) {
        pauseAutoScroll('widget');
      } else if (isPaused && pauseReason === 'widget') {
        resumeAutoScroll(3000);
      }
      
      return newState;
    });
  }, [isPaused, pauseReason, pauseAutoScroll, resumeAutoScroll]);

  // ==========================================================================
  // TRANSLATIONS
  // ==========================================================================

  const translations = {
    en: {
      title: 'Circular Economies & Partners',
      subtitle: 'Discover Bitcoin communities and trusted services',
      all: 'All',
      economies: 'Economies',
      sponsors: 'Partners',
      widgets: 'Swap Widgets',
    },
    es: {
      title: 'Economías Circulares & Partners',
      subtitle: 'Descubre comunidades Bitcoin y servicios de confianza',
      all: 'Todos',
      economies: 'Economías',
      sponsors: 'Partners',
      widgets: 'Widgets',
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

  const filterButtons: { key: 'all' | 'economy' | 'sponsor' | 'widget'; label: string }[] = [
    { key: 'all', label: t.all },
    { key: 'economy', label: t.economies },
    { key: 'sponsor', label: t.sponsors },
    { key: 'widget', label: t.widgets },
  ];

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-slate-950 border-y border-slate-800/50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header con indicador de pausa */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#f7931a]/10 border border-[#f7931a]/20 rounded-full text-[#f7931a] text-xs font-mono mb-3">
            <Bitcoin className="w-3 h-3" />
            <span>mission · support · trade</span>
            {isPaused && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-1 ml-2 pl-2 border-l border-[#f7931a]/30 text-green-400"
              >
                <Pause className="w-3 h-3" />
                <span>{pauseReason === 'widget' ? 'widget active' : 'paused'}</span>
              </motion.span>
            )}
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white font-mono mb-2">
            {t.title}
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            {t.subtitle}
          </p>

          {/* Filter tabs */}
          <div className="flex justify-center gap-2 mt-4 flex-wrap">
            {filterButtons.map((btn) => (
              <button
                key={btn.key}
                onClick={() => setFilter(btn.key)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  filter === btn.key
                    ? 'bg-[#f7931a] text-black'
                    : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 hover:text-white border border-slate-700/50'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Navigation Arrows */}
          <button
            onClick={prev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 p-2 bg-slate-800/80 hover:bg-slate-700 rounded-full text-white transition-colors"
            aria-label="Previous"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={next}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 p-2 bg-slate-800/80 hover:bg-slate-700 rounded-full text-white transition-colors"
            aria-label="Next"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Slide Content */}
          <div className="min-h-[400px] relative overflow-hidden rounded-2xl">
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
                {currentItem && (
                  <>
                    {isEconomy && <EconomyCard item={currentItem as Economy} />}
                    {currentItem?.type === 'sponsor' && <SponsorCard item={currentItem as Sponsor} />}
                    {isWidget && (
                      <WidgetCard
                        item={currentItem as WidgetSponsor}
                        isExpanded={expandedWidget === currentItem.id}
                        onToggleExpand={() => toggleWidgetExpand(currentItem.id)}
                        isActive={true}
                        onInteractionStart={handleWidgetInteractionStart}
                        onInteractionEnd={handleWidgetInteractionEnd}
                      />
                    )}
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-4">
            {filteredItems.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToSlide(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === current
                    ? 'bg-[#f7931a] w-4'
                    : 'bg-slate-700 hover:bg-slate-600'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Play/Pause Control */}
        <div className="flex justify-center mt-4">
          <button
            onClick={() => {
              if (isPaused && pauseReason === 'manual') {
                resumeAutoScroll();
              } else {
                pauseAutoScroll('manual');
              }
            }}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            {isPaused ? (
              <>
                <Play className="w-3 h-3" />
                <span>Resume auto-play</span>
              </>
            ) : (
              <>
                <Pause className="w-3 h-3" />
                <span>Pause auto-play</span>
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}