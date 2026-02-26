'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { Locale } from '@/types';
import { NetworkNodes } from './NetworkNodes';
import { HiddenMenu } from '../navigation/HiddenMenu';
import {
  ArrowRight,
  Terminal,
  ChevronDown,
  Bitcoin
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface HeroSectionProps {
  lang: Locale;
  dict: {
    title: string;
    subtitle: string;
    cta: string;
    secondaryCta?: string;
  };
}

export function HeroSection({ lang, dict }: HeroSectionProps) {
  const [mounted, setMounted] = useState(false);
  const { scrollY } = useScroll();

  // 🐱 FIX #1: Parallax más sutil en móvil (menos motion sickness)
  const y = useTransform(scrollY, [0, 500], [0, 50]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const scrollToChat = () => {
    document.getElementById('chat-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToMarkets = () => {
    document.getElementById('markets-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Terminal typing effect
  const [displayText, setDisplayText] = useState('');
  const fullText = lang === 'en'
    ? 'root@bitcoin:~# ./global-settlement-layer'
    : 'root@bitcoin:~# ./capa-de-liquidación-global';

  useEffect(() => {
    if (!mounted) return;

    let i = 0;
    const typing = setInterval(() => {
      if (i < fullText.length) {
        setDisplayText(fullText.slice(0, i + 1));
        i++;
      } else {
        clearInterval(typing);
      }
    }, 50);

    return () => clearInterval(typing);
  }, [fullText, mounted]);

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
        {/* 🐱 FIX #2: Terminal Header más compacto en móvil */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mb-8 sm:mb-12 lg:mb-16"
        >
          <div className="group px-3 py-2 sm:px-6 sm:py-3 bg-slate-900 border border-slate-800 rounded-xl sm:rounded-2xl font-mono text-xs sm:text-sm flex items-center gap-2 sm:gap-4 shadow-lg">
            {/* Terminal dots - más pequeños en móvil */}
            <div className="flex gap-1.5 sm:gap-2">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500/80" />
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-amber-500/80" />
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500/80" />
            </div>

            {/* Typing effect - texto truncado en móvil */}
            <code className="text-slate-400 truncate max-w-[200px] sm:max-w-none">
              <span className="text-green-400 hidden sm:inline">bitcoin@agent</span>
              <span className="text-green-400 sm:hidden">btc@agent</span>
              <span className="text-blue-400">:~</span>$
              <span className="ml-1 sm:ml-2 text-[#f7931a]">
                {displayText.length > 25 && window?.innerWidth < 640
                  ? displayText.slice(0, 25) + '...'
                  : displayText}
              </span>
              <span className="animate-pulse ml-1 text-[#f7931a]">▊</span>
            </code>
          </div>
        </motion.div>

        {/* 🐱 FIX #3: Title RESPONSIVE - no más gigantismo */}
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

          {/* Descripción - más compacta en móvil */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-base sm:text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed px-4 sm:px-6"
          >
            {lang === 'en'
              ? 'Decentralized infrastructure for transferring value. Open, permissionless, always running—like email, but for money.'
              : 'Infraestructura descentralizada para transferir valor. Abierta, sin permisos, siempre funcionando—como el email, pero para dinero.'}
          </motion.p>
        </motion.div>

        {/* 🐱 FIX #5: CTAs responsive - stack en móvil, side-by-side en desktop */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-12 sm:mb-16 lg:mb-20 px-4 sm:px-0"
        >
          {/* Botón primario - tamaño responsive */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={scrollToChat}
            className="group w-full sm:w-auto px-6 py-3 sm:px-8 sm:py-4 lg:px-10 lg:py-5 bg-[#f7931a] hover:bg-[#f7931a]/90 text-black font-bold text-base sm:text-lg lg:text-xl rounded-xl sm:rounded-2xl transition-all flex items-center justify-center gap-2 sm:gap-3 shadow-lg shadow-[#f7931a]/20"
          >
            <span>{dict.cta}</span>
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
          </motion.button>

          {/* Botón secundario - full width en móvil */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={scrollToMarkets}
            className="group w-full sm:w-auto px-6 py-3 sm:px-8 sm:py-4 bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-300 font-mono text-sm sm:text-base rounded-xl sm:rounded-2xl transition-all hover:bg-slate-800 hover:text-white flex items-center justify-center gap-2"
          >
            <Terminal className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="truncate">
              {dict.secondaryCta || (lang === 'en' ? './market-data' : './datos-mercado')}
            </span>
          </motion.button>
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

      {/* 🐱 FIX #7: Badge de versión VISIBLE en móvil (abajo izquierda) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-4 sm:bottom-8 left-4 sm:left-8 z-20"
      >
        <div className="flex items-center gap-1.5 sm:gap-2 px-2 py-1.5 sm:px-3 sm:py-2 bg-slate-900/80 border border-slate-800 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-mono">
          <Bitcoin className="w-3 h-3 sm:w-4 sm:h-4 text-[#f7931a]" />
          <span className="text-slate-500">v2.0.1</span>
        </div>
      </motion.div>
    </section>
  );
}