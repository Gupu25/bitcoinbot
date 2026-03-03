'use client';

import { motion } from 'framer-motion';
import { Locale, TranslationKeys } from '@/lib/i18n/types';
import fallbackDict from '@/lib/i18n/en.json';
import {
  BookOpen,
  Globe,
  Code,
  Zap,
  Mail,
  ExternalLink,
  Heart,
  Github,
  Twitter,
  Users,
  Sparkles,
  GraduationCap
} from 'lucide-react';

interface FooterProps {
  lang: Locale;
  dict?: TranslationKeys['footer'];
}

export function Footer({ lang, dict }: FooterProps) {
  const t = dict || fallbackDict.footer;

  // 🎓 Recursos educativos esenciales
  const resources = [
    { title: t.protocol, href: 'https://bitcoin.org/bitcoin.pdf', icon: BookOpen, desc: 'Satoshi Nakamoto' },
    { title: t.lightning, href: 'https://lightning.network/lightning-network-paper.pdf', icon: Zap, desc: 'Poon & Dryja' },
    { title: t.books, href: 'https://github.com/BlockchainCommons/SecuringBitcoin', icon: Code, desc: lang === 'en' ? 'Security best practices' : 'Mejores prácticas de seguridad' },
  ];

  const docs = [
    { title: 'Bitcoin Developer Docs', href: 'https://developer.bitcoin.org', desc: lang === 'en' ? 'Reference documentation' : 'Documentación de referencia' },
    { title: 'Lightning Engineering', href: 'https://docs.lightning.engineering', desc: 'LND, Core Lightning' },
    { title: 'Saylor Academy', href: 'https://learn.saylor.org', desc: lang === 'en' ? 'Free Bitcoin courses' : 'Cursos gratuitos de Bitcoin' },
  ];

  return (
    <footer className="relative bg-slate-950 border-t border-slate-800/70">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#f7931a]/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">

        {/* 🎓 Hackathon Mission Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 p-4 sm:p-6 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent border border-amber-500/20 rounded-2xl"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/20 rounded-xl">
                <GraduationCap className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white font-mono">
                  {lang === 'es' ? 'Educación Bitcoin para México' : 'Bitcoin Education for Mexico'}
                </h3>
                <p className="text-xs text-slate-500">
                  {lang === 'es' ? 'Más allá del precio • Sin custodia • Open Source' : 'Beyond price • Non-custodial • Open Source'}
                </p>
              </div>
            </div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-full"
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span className="text-xs font-mono text-amber-300">Hackatón 2026</span>
            </motion.div>
          </div>
        </motion.div>

        {/* Grid principal simplificado */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-12">

          {/* Columna 1: Identidad + Misión */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#f7931a] to-amber-500 flex items-center justify-center">
                <span className="text-black font-bold text-lg">₿</span>
              </div>
              <span className="text-white font-bold font-mono text-xl tracking-tight">
                Bitcoin Agent
              </span>
            </div>

            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              {t.missionText}
            </p>

            <div className="flex gap-3">
              <a href="https://github.com/yourorg/bitcoin-agent" target="_blank" rel="noopener noreferrer" className="p-2 text-slate-500 hover:text-[#f7931a] transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="https://twitter.com/visionaryailat" target="_blank" rel="noopener noreferrer" className="p-2 text-slate-500 hover:text-[#f7931a] transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="mailto:aisynths@proton.me" className="p-2 text-slate-500 hover:text-[#f7931a] transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Columna 2: Recursos educativos */}
          <div>
            <h3 className="text-base font-mono font-semibold text-white mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#f7931a]" />
              {t.resources}
            </h3>
            <ul className="space-y-3">
              {resources.map(r => (
                <li key={r.title}>
                  <a href={r.href} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                    <r.icon className="w-4 h-4 text-slate-600 group-hover:text-[#f7931a] transition-colors" />
                    <span className="text-sm group-hover:underline">{r.title}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Columna 3: Docs + Equipo Hackatón */}
          <div>
            <h3 className="text-base font-mono font-semibold text-white mb-4 flex items-center gap-2">
              <Code className="w-4 h-4 text-[#f7931a]" />
              {t.documentation}
            </h3>
            <ul className="space-y-3 mb-6">
              {docs.map(d => (
                <li key={d.title}>
                  <a href={d.href} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                    <Globe className="w-4 h-4 text-slate-600 group-hover:text-[#f7931a] transition-colors" />
                    <span className="text-sm group-hover:underline">{d.title}</span>
                  </a>
                </li>
              ))}
            </ul>

            {/* 🇲🇽 Hackathon Team Credits */}
            <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-mono text-slate-400 uppercase">{lang === 'es' ? 'Equipo Hackatón' : 'Hackathon Team'}</span>
              </div>
              <p className="text-xs text-slate-500 mb-2">
                {lang === 'es' ? 'Construido con amor en:' : 'Built with love from:'}
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <span className="px-2 py-0.5 bg-slate-800 rounded">🇲🇽 CDMX</span>
                <span className="text-slate-600">+</span>
                <span className="px-2 py-0.5 bg-slate-800 rounded">🌴 Mérida</span>
              </div>
            </div>
          </div>
        </div>

        {/* 💛 Sponsor Acknowledgment */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-12 pt-6 border-t border-slate-800/50"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-600 text-center sm:text-left">
              {t.copyright} • <span className="italic">{t.disclaimer}</span>
            </p>

            {/* Aureo Sponsor Badge */}
            <a
              href="https://www.aureobitcoin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-full hover:border-amber-500/50 transition-colors group"
            >
              <Heart className="w-3 h-3 text-amber-400 group-hover:text-amber-300 transition-colors" />
              <span className="text-xs font-mono text-amber-300">
                {lang === 'es' ? 'Sponsor: Aureo Bitcoin' : 'Sponsor: Aureo Bitcoin'}
              </span>
              <ExternalLink className="w-3 h-3 text-slate-600" />
            </a>
          </div>
        </motion.div>

        {/* Bottom micro-bar */}
        <div className="mt-6 pt-4 border-t border-slate-800/30">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-[10px] text-slate-700">
            <p className="font-mono">
              v1.0 • Next.js • Upstash • Groq • Lightning ⚡
            </p>
            <div className="flex gap-3">
              <a href="/privacy" className="hover:text-slate-400 transition-colors">{lang === 'es' ? 'Privacidad' : 'Privacy'}</a>
              <a href="/terms" className="hover:text-slate-400 transition-colors">{lang === 'es' ? 'Términos' : 'Terms'}</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}