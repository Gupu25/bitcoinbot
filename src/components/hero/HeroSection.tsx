'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { Locale } from '@/types';
import { NetworkNodes } from './NetworkNodes';
import { HiddenMenu } from '../navigation/HiddenMenu';
import {
  ArrowRight,
  HelpCircle,
  ShoppingBag,
  ChevronDown,
} from 'lucide-react';

interface HeroSectionProps {
  lang: Locale;
  dict: {
    title: string;
    subtitle: string;
    description: string;
    cta: string;
    secondaryCta?: string;
    tertiaryCta?: string;
  };
}

export function HeroSection({ lang, dict }: HeroSectionProps) {
  const { scrollY } = useScroll();

  // Parallax más sutil en móvil (menos motion sickness)
  const y = useTransform(scrollY, [0, 500], [0, 50]);

  const scrollToChat = () => {
    document.getElementById('chat-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToPartners = () => {
    document.getElementById('economies')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToWhyBitcoin = () => {
    document.getElementById('why-bitcoin')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-[100dvh] flex flex-col overflow-hidden bg-black">
      {/* HiddenMenu - acceso admin */}
      <HiddenMenu lang={lang as 'en' | 'es'} />

      {/* Background limpio */}
      <div className="absolute inset-0">
        {/* Grid sutil - más denso en móvil para que se note */}
        <motion.div
          animate={{
            backgroundPosition: ['0px 0px', '40px 40px'],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 opacity-[0.05] sm:opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(#f7931a 1px, transparent 1px), linear-gradient(90deg, #f7931a 1px, transparent 1px)`,
            backgroundSize: '40px 40px sm:68px sm:68px'
          }}
        />

        {/* Spotlight más centrado y sutil en móvil */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(247,147,26,0.12)_0%,transparent_60%)] sm:bg-[radial-gradient(circle_at_50%_40%,rgba(247,147,26,0.15)_0%,transparent_70%)]" />

        <NetworkNodes />

        {/* Línea de horizonte */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#f7931a]/30 to-transparent" />
      </div>

      <motion.div
        style={{ y }}
        className="relative z-10 flex-1 flex flex-col justify-center max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32"
      >
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center mb-8 sm:mb-12 lg:mb-16"
        >
          {/* Bitcoin - tamaño proporcional al dispositivo */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-[7rem] font-bold leading-[0.9] sm:leading-[0.95] tracking-[-2px] sm:tracking-[-3px] lg:tracking-[-4px] mb-4 sm:mb-6 lg:mb-8">
          <span className="bg-gradient-to-br from-[#f7931a] via-amber-300 to-white bg-clip-text text-transparent">
              Bitcoin
            </span>
          </h1>

          {/* 🐱 FIX #4: Subtítulo responsive y con mejor leading */}
          <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl text-white font-light tracking-tight mb-4 sm:mb-6 lg:mb-8 px-2 sm:px-0">
            {dict.subtitle}
          </p>

          {/* Descripción */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-base sm:text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed px-4 sm:px-6"
          >
            {dict.description}
          </motion.p>
        </motion.div>

        {/* CTAs en orden de las secciones: ¿Por qué? → Chat → Comprar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center flex-wrap mb-12 sm:mb-16 lg:mb-20 px-4 sm:px-0"
        >
          {/* 1. ¿Por qué Bitcoin para México? - primera sección */}
          {dict.tertiaryCta && (
            <motion.a
              href="#why-bitcoin"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={(e) => {
                e.preventDefault();
                scrollToWhyBitcoin();
              }}
              className="group w-full sm:w-auto px-6 py-3 sm:px-8 sm:py-4 bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-300 font-mono text-sm sm:text-base rounded-xl sm:rounded-2xl transition-all hover:bg-slate-800 hover:text-white flex items-center justify-center gap-2 no-underline"
            >
              <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="truncate">{dict.tertiaryCta}</span>
            </motion.a>
          )}

          {/* 2. Preguntar sobre Bitcoin - Chat */}
          <motion.a
            href="#chat-section"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={(e) => {
              e.preventDefault();
              scrollToChat();
            }}
            className="group w-full sm:w-auto px-6 py-3 sm:px-8 sm:py-4 lg:px-10 lg:py-5 bg-[#f7931a] hover:bg-[#f7931a]/90 text-black font-bold text-base sm:text-lg lg:text-xl rounded-xl sm:rounded-2xl transition-all flex items-center justify-center gap-2 sm:gap-3 shadow-lg shadow-[#f7931a]/20 no-underline"
          >
            <span>{dict.cta}</span>
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
          </motion.a>

          {/* 3. Comprar Bitcoin en México */}
          <motion.a
            href="#economies"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={(e) => {
              e.preventDefault();
              scrollToPartners();
            }}
            className="group w-full sm:w-auto px-6 py-3 sm:px-8 sm:py-4 bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-300 font-mono text-sm sm:text-base rounded-xl sm:rounded-2xl transition-all hover:bg-slate-800 hover:text-white flex items-center justify-center gap-2 no-underline"
          >
            <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="truncate">{dict.secondaryCta}</span>
          </motion.a>
        </motion.div>
      </motion.div>

      {/* 🐱 FIX #6: Scroll indicator más arriba en móvil (evita notch) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-20 sm:bottom-12 left-1/2 -translate-x-1/2 z-20"
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex flex-col items-center gap-1.5 sm:gap-2"
        >
          <span className="text-[10px] sm:text-xs font-mono text-slate-600 tracking-widest uppercase">
            {lang === 'en' ? 'Scroll' : 'Scroll'}
          </span>
          <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
        </motion.div>
      </motion.div>

 
    </section>
  );
}