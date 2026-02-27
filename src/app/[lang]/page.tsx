import { HeroSection } from '@/components/hero/HeroSection';
import { PartnersCarousel } from '@/components/economies/CircularEconomiesCarousel';
import { MarketSection } from '@/components/markets/MarketSection';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { TipJar } from '@/components/tip-jar/TipJar';
import { Footer } from '@/components/footer/Footer';
import { ProtocolLayers } from '@/components/protocol-layers/ProtocolLayers';
import { getDictionary, isLocale, defaultLocale } from '@/lib/i18n/config';
import type { TranslationKeys } from '@/lib/i18n/types';
import fallbackDict from '@/lib/i18n/en.json';

// 🐱 FIX #1: Static generation con revalidación incremental
// Eliminar force-dynamic para máxima velocidad
export const revalidate = 3600; // 1 hora = fresh data, fast performance

// 🐱 FIX #2: Generar páginas estáticas para ambos idiomas
export async function generateStaticParams() {
  return [
    { lang: 'en' },
    { lang: 'es' },
  ];
}

export default async function Home({ params }: { params: { lang: string } }) {
  const lang = isLocale(params?.lang) ? params.lang : defaultLocale;

  let dict: TranslationKeys;
  try {
    dict = await getDictionary(lang);
  } catch (e) {
    console.error('Dictionary load failed:', e);
    // 🐱 FIX #3: Fallback inteligente según idioma solicitado
    dict = lang === 'es' ? await getDictionary('es').catch(() => fallbackDict) : fallbackDict;
  }

  return (
    // 🐱 FIX #4: bg-slate-950 consistente con el resto de la app
    <main className="min-h-screen bg-slate-950 text-white antialiased overflow-x-hidden">

      {/* 🐱 FIX #5: Cada sección con ID para navegación por anchors */}

      {/* Hero – Gran apertura */}
      <section id="hero" className="scroll-mt-20">
        <HeroSection lang={lang} dict={dict.hero} />
      </section>

      {/* 🐱 FIX #6: NUEVO ORDEN - Educación primero, luego interacción */}
      {/* Protocol Layers – Explicación técnica (aprender antes de hablar) */}
      <section id="protocol" className="scroll-mt-20">
        <ProtocolLayers lang={lang} />
      </section>

      {/* Chat – El protagonista (ahora el usuario sabe de qué hablar) */}
      <section id="chat" className="scroll-mt-20">
        <ChatInterface lang={lang} dict={dict.chat} />
      </section>

      {/* Comunidades – Prueba social viva */}
      <section id="economies" className="scroll-mt-20">
        <PartnersCarousel lang={lang} />
      </section>

      {/* Mercado – Datos en vivo */}
      <section id="markets" className="scroll-mt-20">
        <MarketSection lang={lang} />
      </section>

      {/* TipJar – Cierre emocional */}
      <section id="support" className="scroll-mt-20">
        <TipJar lang={lang} dict={dict.tip} />
      </section>

      {/* Footer – Cierre formal */}
      <Footer lang={lang} dict={dict.footer} />
    </main>
  );
}