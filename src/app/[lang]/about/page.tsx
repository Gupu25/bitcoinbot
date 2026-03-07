import { getDictionary, isLocale, defaultLocale } from '@/lib/i18n/config';
import { TerminalWindow } from '@/components/terminal/TerminalWindow';
import {
  Bitcoin, Zap, Brain, Heart, Code, Globe,
  GraduationCap, Users, Sparkles, ExternalLink
} from 'lucide-react';
import Link from 'next/link';

interface AboutPageProps {
  params: Promise<{ lang: string }>;
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { lang: paramLang } = await params;
  const lang = isLocale(paramLang) ? paramLang : defaultLocale;
  const dict = await getDictionary(lang);

  // 🎓 Tech stack enfocado en educación~
  const techStack = [
    { icon: Brain, name: 'Groq AI', desc: lang === 'es' ? 'Tutor inteligente B.O.B.' : 'B.O.B. AI Tutor', color: 'text-purple-400' },
    { icon: Zap, name: 'Upstash Vector', desc: lang === 'es' ? 'Conocimiento Bitcoin verificado' : 'Verified Bitcoin knowledge', color: 'text-yellow-400' },
    { icon: Globe, name: 'Next.js 14', desc: lang === 'es' ? 'Rápido en cualquier dispositivo' : 'Fast on any device', color: 'text-white' },
    { icon: Bitcoin, name: 'Lightning', desc: lang === 'es' ? 'Practica con sats reales' : 'Practice with real sats', color: 'text-orange-400' },
  ];

  // 🎓 Manifiesto educativo para hackatón~
  const manifestoContent = {
    en: `# Bitcoin Agent: Education First

## Learn by Doing, Not Just Reading

We believe Bitcoin education should be:
• Interactive, not passive
• Visual, not abstract  
• Fun, not intimidating
• Free, not gated

## Our Mission for Mexico 🇲🇽

1. DEMYSTIFY BITCOIN
   No jargon. No gatekeeping. Just clear, 
   step-by-step learning in Spanish & English.

2. PRACTICE SAFELY
   Test transactions, explore keys, build 
   trees — all in a sandbox. No real funds 
   at risk while learning.

3. EMPOWER NOOBS
   Start with "What is a seed phrase?" 
   End with "I understand Lightning."

4. CELEBRATE PROGRESS
   Every lab completed is a victory. 
   Every question asked is growth.

## On This Hackathon

This version was built in 48 hours by a 
distributed team passionate about Bitcoin 
education in Mexico. It's not perfect — 
but it's a start. And in Bitcoin, we 
iterate, we improve, we ship.

## Acknowledgments

🤝 Aureo Bitcoin — Our sponsor, making 
   Bitcoin accessible to Mexicans
🦊 Fede (Gupu25) — Mérida, fork wizard
💻 You (PAV) — CDMX, feature architect
✨ The Bitcoin community — For building 
   the future of money

Built with love • Verified by math • 
Running for education`,

    es: `# Bitcoin Agent: Educación Primero

## Aprende Haciendo, No Solo Leyendo

Creemos que la educación Bitcoin debe ser:
• Interactiva, no pasiva
• Visual, no abstracta
• Divertida, no intimidante
• Gratuita, no con muro de pago

## Nuestra Misión para México 🇲🇽

1. DESMITIFICAR BITCOIN
   Sin jerga. Sin gatekeeping. Solo 
   aprendizaje claro, paso a paso, 
   en español e inglés.

2. PRACTICAR CON SEGURIDAD
   Transacciones de prueba, explora 
   llaves, construye árboles — todo 
   en un sandbox. Sin fondos reales 
   en riesgo mientras aprendes.

3. EMPODERAR A NOOBS
   Empieza con "¿Qué es una frase semilla?"
   Termina con "Entiendo Lightning."

4. CELEBRAR EL PROGRESO
   Cada lab completado es una victoria.
   Cada pregunta hecha es crecimiento.

## Sobre Este Hackatón

Esta versión fue construida en 48 horas 
por un equipo distribuido apasionado por 
la educación Bitcoin en México. No es 
perfecta — pero es un inicio. Y en 
Bitcoin, iteramos, mejoramos, lanzamos.

## Agradecimientos

🤝 Aureo Bitcoin — Nuestro sponsor, haciendo 
   Bitcoin accesible para mexicanos
🦊 Fede (Gupu25) — Mérida, mago de forks
💻 Tú (PAV) — CDMX, arquitecto de features
✨ La comunidad Bitcoin — Por construir 
   el futuro del dinero

Construido con amor • Verificado por matemáticas • 
Corriendo para educar`
  };

  return (
    <main className="min-h-screen bg-black pt-24 sm:pt-28 md:pt-32 px-4 sm:px-6 lg:px-8">
      {/* Background sutil */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_10%,rgba(247,147,26,0.05)_0%,transparent_70%)]" />

      <div className="max-w-5xl mx-auto relative z-10">

        {/* Header con back button~ */}
        <div className="mb-12 sm:mb-16">
          <Link
            href={`/${lang}`}
            className="inline-flex items-center gap-2 text-[#f7931a]/70 hover:text-[#f7931a] transition-colors font-mono text-sm mb-6 sm:mb-8 group"
          >
            <span className="group-hover:-translate-x-0.5 transition">←</span>
            <span className="hidden sm:inline">cd ~/{lang}</span>
            <span className="sm:hidden">cd /</span>
          </Link>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold bg-gradient-to-br from-white via-[#f7931a] to-amber-300 bg-clip-text text-transparent leading-tight sm:leading-none tracking-tighter mb-3 sm:mb-4">
            {lang === 'en' ? 'About This Project' : 'Sobre Este Proyecto'}
          </h1>

          <p className="text-lg sm:text-xl md:text-2xl text-slate-400 font-light leading-relaxed">
            {lang === 'en'
              ? 'Bitcoin education, made interactive and accessible for Mexico.'
              : 'Educación Bitcoin, hecha interactiva y accesible para México.'}
          </p>
        </div>

        {/* 🎓 Educational Manifesto in Terminal~ */}
        <TerminalWindow title="cat MANIFESTO.md" className="mb-12 sm:mb-16">
          <div className="font-mono text-xs sm:text-sm leading-relaxed whitespace-pre-wrap text-slate-300 max-h-[60vh] sm:max-h-none overflow-y-auto sm:overflow-visible pr-2">
            {manifestoContent[lang]}
          </div>
        </TerminalWindow>

        {/* 🧰 Simplified Tech Stack for Education~ */}
        <div className="mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#f7931a] mb-6 sm:mb-8 font-mono flex items-center gap-3">
            <Code className="w-5 h-5 sm:w-6 sm:h-6" />
            {lang === 'en' ? 'How It Works' : 'Cómo Funciona'}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {techStack.map((tech) => (
              <div
                key={tech.name}
                className="group border border-slate-800 hover:border-[#f7931a]/50 bg-slate-900 p-4 sm:p-6 rounded-xl sm:rounded-2xl transition-all hover:-translate-y-1"
              >
                <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                  <tech.icon className={`w-6 h-6 sm:w-7 sm:h-7 ${tech.color} group-hover:scale-110 transition flex-shrink-0`} />
                  <span className={`font-mono font-semibold text-base sm:text-lg ${tech.color}`}>{tech.name}</span>
                </div>
                <p className="text-slate-400 font-mono text-xs sm:text-sm">{tech.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 🇲🇽 Hackathon Team Credits~ */}
        <div className="mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#f7931a] mb-6 sm:mb-8 font-mono flex items-center gap-3">
            <Users className="w-5 h-5 sm:w-6 sm:h-6" />
            {lang === 'en' ? 'Hackathon Team' : 'Equipo Hackatón'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* CDMX */}
            <TerminalWindow title="cat CDMX.txt" className="h-full">
              <div className="py-4 sm:py-6 text-center">
                <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#f7931a]/20 to-amber-500/20 flex items-center justify-center mb-4 sm:mb-6 border border-[#f7931a]/30">
                  <span className="text-2xl sm:text-3xl">🇲🇽</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2 font-mono">CDMX</h3>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed px-2">
                  {lang === 'en'
                    ? 'Architecture, features, and i18n unification. Making Bitcoin education beautiful and functional.'
                    : 'Arquitectura, features y unificación i18n. Haciendo la educación Bitcoin bella y funcional.'}
                </p>
              </div>
            </TerminalWindow>

            {/* Mérida */}
            <TerminalWindow title="cat MERIDA.txt" className="h-full">
              <div className="py-4 sm:py-6 text-center">
                <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center mb-4 sm:mb-6 border border-emerald-500/30">
                  <span className="text-2xl sm:text-3xl">🌴</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2 font-mono">Mérida</h3>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed px-2">
                  {lang === 'en'
                    ? 'Noob-friendly fork, UI polish, and Spanish-first UX. Making Bitcoin accessible to everyone.'
                    : 'Fork noob-friendly, pulido de UI y UX primero en español. Haciendo Bitcoin accesible para todos.'}
                </p>
              </div>
            </TerminalWindow>
          </div>
        </div>

        {/* 💛 Aureo Sponsor Acknowledgment~ */}
        <div className="mb-16 sm:mb-20">
          <TerminalWindow title="cat SPONSOR.md" className="border-amber-500/30">
            <div className="py-4 sm:py-6 text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Bitcoin className="w-6 h-6 sm:w-8 sm:h-8 text-amber-400" />
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300" />
                <span className="text-lg sm:text-xl font-bold text-white font-mono">Aureo Bitcoin</span>
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300" />
                <Bitcoin className="w-6 h-6 sm:w-8 sm:h-8 text-amber-400" />
              </div>

              <p className="text-slate-400 text-sm sm:text-base leading-relaxed mb-4 px-4">
                {lang === 'en'
                  ? 'Official sponsor of this hackathon project. Aureo makes Bitcoin accessible to Mexicans with SPEI, Lightning, and Spanish support.'
                  : 'Sponsor oficial de este proyecto de hackatón. Aureo hace Bitcoin accesible para mexicanos con SPEI, Lightning y soporte en español.'}
              </p>

              <a
                href="https://www.aureobitcoin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-black font-bold rounded-lg hover:bg-amber-400 transition-colors"
              >
                {lang === 'en' ? 'Visit Aureo →' : 'Visitar Aureo →'}
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </TerminalWindow>
        </div>

        {/* Final Signature~ */}
        <div className="text-center pb-16 sm:pb-24">
          <div className="inline-flex flex-col items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2 text-slate-500">
              <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-rose-500 fill-rose-500" />
              <span className="text-xs sm:text-sm font-mono">
                {lang === 'en' ? 'Built for Mexican Bitcoiners' : 'Construido para Bitcoiners Mexicanos'}
              </span>
              <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-rose-500 fill-rose-500" />
            </div>

            <p className="text-[10px] sm:text-xs text-slate-600 font-mono mt-2 sm:mt-4">
              Hackatón 2026 • Bitcoin Agent v2.0.1 • {lang === 'en' ? 'Education First' : 'Educación Primero'}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}