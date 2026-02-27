'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bitcoin,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Loader2,
  Zap,
  Globe,
  CreditCard,
  Wallet,
} from 'lucide-react';

// ============================================================================
// TYPES - Solo Partners Comerciales
// ============================================================================
type Partner = {
  id: string;
  name: string;
  nameEs: string;
  description: string;
  descriptionEs: string;
  website: string;
  referralUrl?: string;
  features: string[];
  featuresEs: string[];
  color: string;
  badge?: string;
  badgeEs?: string;
};

// ============================================================================
// DATA - Solo 3 Partners: Kapitalex, Changelly, Aureo
// ============================================================================
const partners: Partner[] = [
  {
    id: 'kapitalex',
    name: 'Kapitalex',
    nameEs: 'Kapitalex',
    description: 'The most trusted Bitcoin platform in Mexico since 2016. Buy, sell, and get instant loans collateralized with your BTC — no credit check required.',
    descriptionEs: 'La plataforma Bitcoin más confiable de México desde 2016. Compra, vende y obtén préstamos instantáneos con garantía BTC — sin revisar buró de crédito.',
    website: 'https://www.kapitalex.com',
    referralUrl: 'https://www.kapitalex.com/#/register?ref=FDHFVSRW5KJANRX',
    features: ['🇲🇽 Mexico', 'BTC Loans', 'MXNT + USDT', 'Instant SPEI'],
    featuresEs: ['🇲🇽 México', 'Préstamos BTC', 'MXNT + USDT', 'SPEI Instantáneo'],
    color: '#ff6b35',
    badge: 'NEW',
    badgeEs: 'NUEVO',
  },
  {
    id: 'changelly',
    name: 'Changelly',
    nameEs: 'Changelly',
    description: 'Global instant exchange. Buy Bitcoin with credit card, debit card, or bank transfer. Available in Mexico and LATAM with competitive rates.',
    descriptionEs: 'Exchange global instantáneo. Compra Bitcoin con tarjeta de crédito, débito o transferencia bancaria. Disponible en México y LATAM con tarifas competitivas.',
    website: 'https://changelly.com',
    features: ['🌎 Global', 'Card/SPEI', 'No KYC basic', 'Best rates'],
    featuresEs: ['🌎 Global', 'Tarjeta/SPEI', 'Sin KYC básico', 'Mejores tasas'],
    color: '#f7931a',
  },
  {
    id: 'aureo',
    name: 'Aureo',
    nameEs: 'Aureo',
    description: 'Lightning-fast Bitcoin for Mexicans. Buy with SPEI, withdraw via Lightning Network. The easiest on-ramp for beginners.',
    descriptionEs: 'Bitcoin rápido como el rayo para mexicanos. Compra con SPEI, retira vía Lightning Network. La rampa de acceso más fácil para principiantes.',
    website: 'https://www.aureobitcoin.com',
    features: ['🇲🇽 Mexico', 'Lightning', 'SPEI 24/7', 'Low fees'],
    featuresEs: ['🇲🇽 México', 'Lightning', 'SPEI 24/7', 'Bajas comisiones'],
    color: '#f59e0b',
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

function PartnerCard({ partner, lang }: { partner: Partner; lang: 'en' | 'es' }) {
  const isKapitalex = partner.id === 'kapitalex';
  const features = lang === 'es' ? partner.featuresEs : partner.features;
  const description = lang === 'es' ? partner.descriptionEs : partner.description;
  const badge = lang === 'es' ? partner.badgeEs : partner.badge;

  return (
    <div className="relative flex flex-col h-full p-6 sm:p-8 bg-slate-900/60 border border-slate-800 rounded-2xl sm:rounded-3xl overflow-hidden hover:border-orange-500/30 transition-all duration-300">
      {/* Background glow */}
      <div
        className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl opacity-10"
        style={{ backgroundColor: partner.color }}
      />

      {/* Header */}
      <div className="flex items-start gap-4 mb-5 relative z-10">
        <div
          className="p-3 rounded-xl flex-shrink-0 border-2"
          style={{
            backgroundColor: `${partner.color}15`,
            borderColor: `${partner.color}30`
          }}
        >
          <Bitcoin className="w-7 h-7" style={{ color: partner.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-xl sm:text-2xl font-bold text-white font-mono">
              {lang === 'es' ? partner.nameEs : partner.name}
            </h3>
            {badge && (
              <motion.span
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ repeat: Infinity, repeatType: 'reverse', duration: 1.5 }}
                className="text-[10px] bg-green-500 text-black px-2 py-0.5 rounded-full font-bold"
              >
                {badge}
              </motion.span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {partner.id === 'kapitalex' && (lang === 'es' ? 'Desde 2016' : 'Since 2016')}
            {partner.id === 'changelly' && (lang === 'es' ? 'Exchange Global' : 'Global Exchange')}
            {partner.id === 'aureo' && (lang === 'es' ? 'Lightning Native' : 'Lightning Native')}
          </p>
        </div>
      </div>

      {/* Features pills */}
      <div className="flex flex-wrap gap-2 mb-5 relative z-10">
        {features.map((feature, i) => (
          <span
            key={i}
            className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border border-slate-700 bg-slate-800 text-slate-300"
          >
            {feature}
          </span>
        ))}
      </div>

      {/* Description */}
      <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-6 flex-1 relative z-10">
        {description}
      </p>

      {/* CTA Button */}
      <a
        href={partner.referralUrl || partner.website}
        target="_blank"
        rel="noopener noreferrer"
        className="relative z-10 w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-sm sm:text-base font-bold rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
        style={{
          backgroundColor: partner.color,
          color: partner.id === 'changelly' ? 'black' : 'white',
          boxShadow: `0 10px 30px -10px ${partner.color}40`
        }}
      >
        {isKapitalex
          ? (lang === 'es' ? 'Registrarse con Referral' : 'Register with Referral')
          : (lang === 'es' ? 'Visitar Sitio' : 'Visit Website')
        }
        <ExternalLink className="w-4 h-4" />
      </a>

      {/* Partner badge */}
      <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-black text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg z-20">
        🎯 Partner
      </div>

      {/* Footer note */}
      <p className="text-[10px] sm:text-xs text-slate-600 mt-4 text-center font-mono relative z-10">
        {isKapitalex
          ? (lang === 'es' ? 'Al registrarte apoyas a BOB • Sin buró de crédito' : 'Registering supports BOB • No credit check')
          : (lang === 'es' ? 'Partner oficial de Bitcoin Agent' : 'Official Bitcoin Agent Partner')
        }
      </p>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT - Renombrado a PartnersCarousel
// ============================================================================
export function PartnersCarousel({ lang = 'en' }: { lang?: 'en' | 'es' }) {
  const [[current, direction], setCurrent] = useState<[number, number]>([0, 0]);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const total = partners.length;
  const currentPartner = partners[current];

  const paginate = useCallback(
    (newDirection: number) => {
      setCurrent(([prev]) => [
        (prev + newDirection + total) % total,
        newDirection,
      ]);
    },
    [total]
  );

  // Auto-advance cada 8s (más tiempo para leer)
  useEffect(() => {
    if (isPaused) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => paginate(1), 8000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPaused, paginate]);

  const labels = {
    en: {
      title: 'Buy Bitcoin',
      subtitle: 'Trusted partners to stack sats',
      pause: 'Pause',
      play: 'Play',
      footer: '🤝 These partners help us maintain BOB • Thank you for supporting them',
    },
    es: {
      title: 'Comprar Bitcoin',
      subtitle: 'Partners confiables para acumular sats',
      pause: 'Pausar',
      play: 'Reanudar',
      footer: '🤝 Estos partners nos ayudan a mantener BOB • Gracias por apoyarlos',
    },
  };
  const t = labels[lang];

  return (
    <section className="w-full py-12 sm:py-16 lg:py-20 bg-slate-950 border-t border-slate-800/70">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white font-mono mb-1">
              {t.title}
            </h2>
            <p className="text-sm sm:text-base text-slate-500">{t.subtitle}</p>
          </div>
          <button
            onClick={() => setIsPaused((p) => !p)}
            className="self-start sm:self-auto p-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-400 hover:text-white transition-all"
            aria-label={isPaused ? t.play : t.pause}
          >
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </button>
        </div>

        {/* Carousel Container */}
        <div className="relative max-w-2xl mx-auto">
          <div className="relative w-full" style={{ minHeight: '420px' }}>
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
                {!currentPartner ? (
                  <div className="flex items-center justify-center h-full text-slate-500">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                ) : (
                  <PartnerCard partner={currentPartner} lang={lang} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between mt-6 px-1">
            <button
              onClick={() => paginate(-1)}
              className="p-3 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-400 hover:text-white transition-all active:scale-95"
              aria-label="Previous"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Dots */}
            <div className="flex items-center gap-2">
              {partners.map((partner, i) => (
                <button
                  key={partner.id}
                  onClick={() => setCurrent(([prev]) => [i, i > prev ? 1 : -1])}
                  className={`rounded-full transition-all duration-300 ${i === current
                      ? 'w-8 h-2 bg-[#f7931a]'
                      : 'w-2 h-2 bg-slate-600 hover:bg-slate-400'
                    }`}
                  aria-label={`${partner.name} slide`}
                />
              ))}
            </div>

            <button
              onClick={() => paginate(1)}
              className="p-3 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-400 hover:text-white transition-all active:scale-95"
              aria-label="Next"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-xs text-slate-600 text-center mt-8 font-mono">
          {t.footer}
        </p>

        {/* 🐱 BONUS: Grid de logos para desktop (trust signals) */}
        <div className="hidden lg:grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-slate-800">
          {partners.map((partner) => (
            <a
              key={partner.id}
              href={partner.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 p-4 rounded-xl bg-slate-900/30 border border-slate-800 hover:border-slate-600 transition-all group"
            >
              <Bitcoin
                className="w-5 h-5 transition-colors"
                style={{ color: partner.color }}
              />
              <span className="text-slate-400 group-hover:text-white font-mono text-sm">
                {partner.name}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}