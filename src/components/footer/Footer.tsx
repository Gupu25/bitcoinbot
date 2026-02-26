'use client';

import { motion } from 'framer-motion';
import { Locale } from '@/lib/i18n/types';
import { TranslationKeys } from '@/lib/i18n/types';
import fallbackDict from '@/lib/i18n/en.json';
import {
  BookOpen,
  Globe,
  Shield,
  Code,
  Zap,
  Mail,
  ExternalLink,
  Heart,
  Github,
  Twitter,
  Lock,
  Server,
  FileCheck,
  Eye
} from 'lucide-react';

interface FooterProps {
  lang: Locale;
  dict?: TranslationKeys['footer'];
}

// 🐱 FIX #1: Traducciones de seguridad inline
const securityTranslations = {
  en: {
    security: 'Security Architecture',
    noCustody: 'No Custody',
    noCustodyDesc: 'We never hold your keys',
    clientSide: 'Client-Side Encryption',
    clientSideDesc: 'Your data stays on your device',
    openSource: 'Open Source',
    openSourceDesc: 'Code auditable by anyone',
    auditable: 'Auditable Logs',
    auditableDesc: 'Every action is recorded',
    soc2: 'SOC2 Type II In Progress',
    lastReview: 'Last security review',
    verify: 'Verify our security',
    privacyFirst: 'Privacy-First Design',
  },
  es: {
    security: 'Arquitectura de Seguridad',
    noCustody: 'Sin Custodia',
    noCustodyDesc: 'Nunca guardamos tus llaves',
    clientSide: 'Encripción Client-Side',
    clientSideDesc: 'Tus datos se quedan en tu dispositivo',
    openSource: 'Código Abierto',
    openSourceDesc: 'Código auditable por cualquiera',
    auditable: 'Logs Auditables',
    auditableDesc: 'Cada acción es registrada',
    soc2: 'SOC2 Tipo II En Progreso',
    lastReview: 'Última revisión de seguridad',
    verify: 'Verifica nuestra seguridad',
    privacyFirst: 'Diseño Privacidad-Primero',
  }
};

export function Footer({ lang, dict }: FooterProps) {
  const t = dict || fallbackDict.footer;
  const st = securityTranslations[lang];

  const resources = [
    { title: t.protocol, href: 'https://bitcoin.org/bitcoin.pdf', icon: BookOpen, desc: 'Satoshi Nakamoto' },
    { title: t.lightning, href: 'https://lightning.network/lightning-network-paper.pdf', icon: Zap, desc: 'Poon & Dryja' },
    { title: t.books, href: 'https://github.com/BlockchainCommons/SecuringBitcoin', icon: Shield, desc: lang === 'en' ? 'Security best practices' : 'Mejores prácticas de seguridad' },
  ];

  const docs = [
    { title: 'Bitcoin Developer Docs', href: 'https://developer.bitcoin.org', desc: lang === 'en' ? 'Reference documentation' : 'Documentación de referencia' },
    { title: 'Lightning Engineering', href: 'https://docs.lightning.engineering', desc: 'LND, Core Lightning' },
    { title: 'Saylor Academy', href: 'https://learn.saylor.org', desc: lang === 'en' ? 'Free Bitcoin courses' : 'Cursos gratuitos de Bitcoin' },
  ];

  // 🐱 FIX #2: Datos de seguridad con fechas reales
  const securityFeatures = [
    { icon: Lock, label: st.noCustody, desc: st.noCustodyDesc },
    { icon: Server, label: st.clientSide, desc: st.clientSideDesc },
    { icon: Code, label: st.openSource, desc: st.openSourceDesc },
    { icon: Eye, label: st.auditable, desc: st.auditableDesc },
  ];

  return (
    <footer className="relative bg-slate-950 border-t border-slate-800/70">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#f7931a]/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-20">

        {/* 🐱 FIX #3: SECURITY BADGE - Nueva sección prominente */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 sm:mb-16 p-4 sm:p-6 lg:p-8 bg-slate-900/50 border border-slate-800 rounded-2xl sm:rounded-3xl"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Header del badge */}
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2.5 sm:p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white font-mono">
                  {st.security}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  {st.soc2} • {st.lastReview}: 2026-02-27
                </p>
              </div>
            </div>

            {/* Features grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 flex-1 lg:max-w-2xl">
              {securityFeatures.map((feature, i) => (
                <motion.div
                  key={feature.label}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-xl bg-slate-950/50 border border-slate-800 hover:border-green-500/30 transition-colors"
                >
                  <feature.icon className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-medium text-slate-300 truncate">
                      {feature.label}
                    </div>
                    <div className="text-[10px] sm:text-xs text-slate-500 leading-tight">
                      {feature.desc}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* CTA de verificación */}
          <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs sm:text-sm text-slate-400 text-center sm:text-left">
              <span className="text-green-500">✓</span> {st.privacyFirst} •
              <span className="text-green-500"> ✓</span> Edge-Deployed •
              <span className="text-green-500"> ✓</span> Zero-Trust
            </p>
            <a
              href="/api/audit"
              className="inline-flex items-center gap-2 text-xs sm:text-sm text-green-500 hover:text-green-400 font-mono transition-colors"
            >
              <FileCheck className="w-4 h-4" />
              {st.verify}
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </motion.div>

        {/* Grid principal */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-12 lg:gap-16">
          {/* Columna 1: Identidad + Misión + Socials */}
          <div>
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#f7931a] to-amber-500 flex items-center justify-center shadow-lg">
                <span className="text-black font-bold text-lg sm:text-2xl">₿</span>
              </div>
              <span className="text-white font-bold font-mono text-xl sm:text-2xl tracking-tight">
                Bitcoin Agent
              </span>
            </div>

            <p className="text-sm sm:text-base text-slate-400 leading-relaxed mb-6 sm:mb-8">
              {t.missionText}
            </p>

            <div className="flex gap-4">
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

          {/* Columna 2: Lectura esencial */}
          <div>
            <h3 className="text-base sm:text-lg font-mono font-semibold text-white mb-4 sm:mb-6 flex items-center gap-2">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-[#f7931a]" />
              {t.resources}
            </h3>
            <ul className="space-y-3 sm:space-y-4">
              {resources.map(r => (
                <li key={r.title}>
                  <a
                    href={r.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 text-slate-400 hover:text-white transition-colors"
                  >
                    <r.icon className="w-4 h-4 text-slate-600 group-hover:text-[#f7931a] transition-colors" />
                    <span className="text-sm sm:text-base group-hover:underline underline-offset-4">{r.title}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Columna 3: Docs + Contacto */}
          <div>
            <h3 className="text-base sm:text-lg font-mono font-semibold text-white mb-4 sm:mb-6 flex items-center gap-2">
              <Code className="w-4 h-4 sm:w-5 sm:h-5 text-[#f7931a]" />
              {t.documentation}
            </h3>
            <ul className="space-y-3 sm:space-y-4 mb-8 sm:mb-10">
              {docs.map(d => (
                <li key={d.title}>
                  <a
                    href={d.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 text-slate-400 hover:text-white transition-colors"
                  >
                    <Globe className="w-4 h-4 text-slate-600 group-hover:text-[#f7931a] transition-colors" />
                    <span className="text-sm sm:text-base group-hover:underline underline-offset-4">{d.title}</span>
                  </a>
                </li>
              ))}
            </ul>

            <div className="p-4 sm:p-5 bg-slate-900/60 rounded-xl sm:rounded-2xl border border-slate-800">
              <div className="text-xs uppercase tracking-wider text-slate-500 mb-2 font-mono">
                {t.builtBy}
              </div>
              <a
                href="https://visionaryai.lat"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#f7931a] hover:text-amber-300 font-medium transition-colors text-sm sm:text-base"
              >
                VisionaryAI.lat
              </a>
              <p className="text-xs text-slate-500 mt-1">
                {lang === 'en' ? 'AI for circular economies' : 'IA para economías circulares'}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 sm:mt-16 pt-6 sm:pt-8 border-t border-slate-800">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs sm:text-sm">
            <p className="text-slate-600 text-center sm:text-left">
              {t.copyright} • <span className="italic">{t.disclaimer}</span>
            </p>

            <div className="flex gap-4 sm:gap-6 text-slate-600">
              <a href="/privacy" className="hover:text-slate-300 transition-colors">Privacy</a>
              <a href="/terms" className="hover:text-slate-300 transition-colors">Terms</a>
              <a href="/security" className="hover:text-green-500 transition-colors flex items-center gap-1">
                <Shield className="w-3 h-3" />
                Security
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}