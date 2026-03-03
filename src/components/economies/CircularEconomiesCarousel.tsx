'use client';

import { motion } from 'framer-motion';
import {
  Bitcoin,
  ExternalLink,
  Zap,
  Globe,
  CreditCard,
  Wallet,
  Shield,
  Clock,
  Sparkles,
  Heart,
} from 'lucide-react';

// ============================================================================
// TYPES - Aureo Spotlight
// ============================================================================
interface AureoSpotlightProps {
  lang: 'en' | 'es';
  dict: {
    title: string;
    subtitle: string;
    intro: string;
    sponsor: {
      name: string;
      tagline: string;
      description: string;
      features: string[];
      cta: string;
      badge: string;
      trust: string[];
    };
    footer: string;
    newPointer: string;
    glossary: {
      spei: string;
      lightning: string;
    };
  };
}

// ============================================================================
// AUREO SPOTLIGHT COMPONENT - Tribute to our Hackathon Sponsor 💛
// ============================================================================
export function PartnersCarousel({ lang, dict }: AureoSpotlightProps) {
  const t = dict.sponsor;
  const glossary = dict.glossary;

  // 🎨 Aureo brand colors (golden vibes~)
  const aureoColors = {
    primary: '#f59e0b',    // Amber-500
    secondary: '#fbbf24',  // Amber-400
    dark: '#78350f',       // Amber-900
    glow: 'rgba(245, 158, 11, 0.15)',
  };

  return (
    <section className="w-full py-12 sm:py-16 lg:py-20 bg-slate-950 border-t border-slate-800/70 relative overflow-hidden">
      {/* ✨ Background glow effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(245,158,11,0.08)_0%,transparent_70%)]" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[radial-gradient(circle,rgba(245,158,11,0.1)_0%,transparent_70%)] blur-3xl" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">

        {/* 🎯 Header con toque especial para Aureo */}
        <div className="text-center mb-8 sm:mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-full mb-4"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-mono text-amber-300">{dict.sponsor.badge}</span>
          </motion.div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white font-mono mb-2">
            {dict.title}
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
            {dict.subtitle}
          </p>
        </div>

        {/* 💛 Aureo Premium Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-3xl mx-auto"
        >
          <div className="relative p-6 sm:p-8 lg:p-10 bg-slate-900/80 border border-amber-500/20 rounded-3xl overflow-hidden hover:border-amber-500/40 transition-all duration-500 group">

            {/* ✨ Animated border glow */}
            <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-amber-500/10 via-transparent to-amber-500/10 animate-pulse" />
            </div>

            {/* 🎨 Decorative elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-amber-400/10 rounded-full blur-2xl" />

            {/* Header: Logo + Badge */}
            <div className="flex items-start gap-4 mb-6 relative z-10">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/20 border border-amber-500/30 flex-shrink-0"
              >
                <Bitcoin className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: aureoColors.primary }} />
              </motion.div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-2xl sm:text-3xl font-bold text-white font-mono tracking-tight">
                    {t.name}
                  </h3>
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: 'spring' }}
                    className="px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-black text-xs font-bold rounded-full shadow-lg"
                  >
                    {t.badge}
                  </motion.span>
                </div>
                <p className="text-amber-400/90 font-medium mt-1">{t.tagline}</p>
              </div>
            </div>

            {/* Description con corazón~ 💕 */}
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-base sm:text-lg text-slate-300 leading-relaxed mb-6 relative z-10"
            >
              {t.description}
            </motion.p>

            {/* Features Grid con íconos~ ✨ */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6 relative z-10">
              {[
                { icon: Globe, text: t.features[0] },
                { icon: Zap, text: t.features[1] },
                { icon: Clock, text: t.features[2] },
                { icon: Shield, text: t.features[3] },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/50 border border-slate-700/50"
                >
                  <item.icon className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span className="text-sm text-slate-300 font-medium">{item.text}</span>
                </motion.div>
              ))}
            </div>

            {/* Trust badges~ 🛡️ */}
            <div className="flex flex-wrap gap-2 mb-6 relative z-10">
              {t.trust.map((trustItem, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 border border-amber-500/20 text-amber-300"
                >
                  <Heart className="w-3 h-3" />
                  {trustItem}
                </span>
              ))}
            </div>

            {/* CTA Button con glow~ 🚀 */}
            <motion.a
              href="https://www.aureobitcoin.com"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="relative z-10 w-full inline-flex items-center justify-center gap-3 px-6 py-4 text-base font-bold rounded-2xl transition-all shadow-xl"
              style={{
                background: `linear-gradient(135deg, ${aureoColors.primary}, ${aureoColors.secondary})`,
                color: 'black',
                boxShadow: `0 20px 40px -20px ${aureoColors.primary}`,
              }}
            >
              {t.cta}
              <ExternalLink className="w-5 h-5" />
            </motion.a>

            {/* Footer note con amor~ 💛 */}
            <p className="text-xs text-slate-500 mt-6 text-center font-mono relative z-10">
              {dict.footer}
            </p>
          </div>
        </motion.div>

        {/* 💡 Educational pointer + glossary */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-8 sm:mt-12 max-w-2xl mx-auto"
        >
          {/* New user pointer */}
          <a
            href="#chat"
            className="block p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 hover:border-amber-500/40 transition-colors group"
          >
            <p className="text-sm text-amber-300 group-hover:text-amber-200 transition-colors">
              {dict.newPointer}
            </p>
          </a>

          {/* Inline glossary */}
          <div className="mt-4 flex flex-wrap justify-center gap-4 text-xs text-slate-500">
            <span>
              <strong className="text-slate-400">SPEI:</strong> {glossary.spei}
            </span>
            <span>
              <strong className="text-slate-400">Lightning:</strong> {glossary.lightning}
            </span>
          </div>
        </motion.div>

        {/* 🎨 Decorative footer with Aureo love */}
        <div className="hidden lg:flex items-center justify-center gap-2 mt-12 pt-8 border-t border-slate-800/50">
          <span className="text-xs text-slate-600 font-mono">Built with</span>
          <Heart className="w-3 h-3 text-amber-500 animate-pulse" />
          <span className="text-xs text-slate-600 font-mono">for Mexican Bitcoiners</span>
          <span className="text-amber-500 font-mono">•</span>
          <a
            href="https://www.aureobitcoin.com/en/nuestra-historia"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-amber-400 hover:text-amber-300 transition-colors font-mono"
          >
            Conoce la historia de Aureo →
          </a>
        </div>
      </div>
    </section>
  );
}