// 🦊 Imports ordenados por categoría~ 📋
// ─────────────────────────────────────
// Components (en orden de aparición en la página~)
import { HeroSection } from '@/components/hero/HeroSection';
import { WhyBitcoinForMexico } from '@/components/why-bitcoin/WhyBitcoinForMexico';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { MarketSection } from '@/components/markets/MarketSection'; // 💱 BTC/MXN educativo
import { PartnersCarousel } from '@/components/economies/CircularEconomiesCarousel'; // 🛒 Aureo sponsor
import { TipJar } from '@/components/tip-jar/TipJar';
import { Footer } from '@/components/footer/Footer';

// i18n & Types
import { getDictionary, isLocale, defaultLocale } from '@/lib/i18n/config';
import type { TranslationKeys } from '@/lib/i18n/types';
import fallbackDict from '@/lib/i18n/en.json';

// ─────────────────────────────────────
// 🐱 FIX #1: Static generation con revalidación incremental
export const revalidate = 3600; // 1 hora = fresh data, fast performance ⚡

// 🐱 FIX #2: Generar páginas estáticas para ambos idiomas
export async function generateStaticParams() {
  return [
    { lang: 'en' },
    { lang: 'es' },
  ];
}

// 🐱 FIX #3: Next.js 14+ params es Promise~ ✨
export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: paramLang } = await params;
  const lang = isLocale(paramLang) ? paramLang : defaultLocale;

  // 🐱 FIX #4: Carga de diccionario con fallback inteligente
  let dict: TranslationKeys;
  try {
    dict = await getDictionary(lang);
  } catch (e) {
    console.error('Dictionary load failed:', e);
    dict = lang === 'es'
      ? await getDictionary('es').catch(() => fallbackDict)
      : fallbackDict;
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white antialiased overflow-x-hidden">

      {/* 🦊 1) HERO – Gran apertura emocional */}
      <section id="hero" className="scroll-mt-20">
        <HeroSection lang={lang} dict={dict.hero} />
      </section>

      {/* 🇲🇽 2) WHY BITCOIN FOR MEXICO – Educación contextualizada */}
      <section id="why-mexico" className="scroll-mt-20">
        <WhyBitcoinForMexico lang={lang} />
      </section>

      {/* 🤖 3) CHAT – Interactúa con B.O.B., tu tutor AI */}
      <section id="chat" className="scroll-mt-20">
        <ChatInterface lang={lang} dict={dict.chat} />
      </section>

      {/* 💱 4) MARKET METRICS – BTC/MXN con tooltips educativos */}
      <section id="markets" className="scroll-mt-20">
        <MarketSection lang={lang} />
      </section>

      {/* 🛒 5) SPONSORS CAROUSEL – Comprar Bitcoin en México (Aureo) */}
      <section id="economies" className="scroll-mt-20">
        <PartnersCarousel lang={lang} dict={dict.partners} />
      </section>

      {/* ⚡ 6) TIPJAR – Soporta el proyecto con Lightning */}
      <section id="support" className="scroll-mt-20">
        <TipJar lang={lang} dict={dict.tip} />
      </section>

      {/* 🦶 7) FOOTER – Cierre formal y enlaces */}
      <Footer lang={lang} dict={dict.footer} />
    </main>
  );
}