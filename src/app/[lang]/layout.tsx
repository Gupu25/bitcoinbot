import type { Metadata, Viewport } from 'next';
import { Locale, getDictionary, isLocale, defaultLocale } from '@/lib/i18n/config';
import { Providers } from './providers';
import { HiddenMenu } from '@/components/navigation/HiddenMenu';

// 🐱 FIX #1: Eliminar force-dynamic para static generation ultra-rápida
// Solo usar 'force-dynamic' si REALMENTE necesitas datos dinámicos en cada request
// export const dynamic = 'force-dynamic'; 

// 🐱 FIX #2: Revalidación incremental - el mejor de ambos mundos
export const revalidate = 3600; // Revalida cada hora, nya~!

export async function generateMetadata({
  params
}: {
  params: { lang: string }
}): Promise<Metadata> {
  const lang = isLocale(params?.lang) ? params.lang : defaultLocale;
  const dict = await getDictionary(lang);

  return {
    title: {
      default: 'Bitcoin Agent | Infrastructure First',
      template: '%s | Bitcoin Agent', // Para páginas hijas
    },
    description: dict?.hero?.subtitle || 'Digital Immune System for Bitcoin Infrastructure',

    // 🐱 FIX #3: Keywords para SEO
    keywords: ['Bitcoin', 'Lightning Network', 'AI', 'Infrastructure', 'Cryptocurrency', 'Education'],

    // 🐱 FIX #4: Authors y metadata de confianza para investors
    authors: [{ name: 'Bitcoin Agent Team' }],
    creator: 'Bitcoin Agent',
    publisher: 'Bitcoin Agent',

    // 🐱 FIX #5: Open Graph completo para previews sociales
    openGraph: {
      type: 'website',
      locale: lang === 'es' ? 'es_ES' : 'en_US',
      url: `https://bitcoinagent.io/${lang}`,
      siteName: 'Bitcoin Agent',
      title: 'Bitcoin Agent | Infrastructure First',
      description: dict?.hero?.subtitle || 'Digital Immune System',
      images: [
        {
          url: '/og-image.png', // Asegúrate de tener esta imagen en public/
          width: 1200,
          height: 630,
          alt: 'Bitcoin Agent - Infrastructure First',
        },
      ],
    },

    // 🐱 FIX #6: Twitter Cards para máximo alcance
    twitter: {
      card: 'summary_large_image',
      title: 'Bitcoin Agent | Infrastructure First',
      description: dict?.hero?.subtitle || 'Digital Immune System',
      images: ['/og-image.png'],
      creator: '@bitcoinagent',
    },

    alternates: {
      canonical: `/${lang}`,
      languages: {
        'en': '/en',
        'es': '/es',
      },
    },

    // 🐱 FIX #7: Robots para indexing correcto
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },

    // 🐱 FIX #8: Icons para todos los dispositivos
    icons: {
      icon: '/favicon.ico',
      shortcut: '/favicon-16x16.png',
      apple: '/apple-touch-icon.png',
      other: [
        {
          rel: 'icon',
          type: 'image/png',
          sizes: '32x32',
          url: '/favicon-32x32.png',
        },
      ],
    },

    // 🐱 FIX #9: Manifest para PWA (investors love PWA stats!)
    manifest: '/site.webmanifest',
  };
}

// 🐱 FIX #10: Viewport separado (Next.js 14 best practice)
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5, // Permitir zoom para accesibilidad
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f7931a' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
  colorScheme: 'dark',
};

export async function generateStaticParams() {
  return [
    { lang: 'en' },
    { lang: 'es' },
  ];
}

/**
 * Language-specific Layout
 * Philosophy: Handles i18n context and client-side hydration boundaries.
 * Optimized for static generation and investor-ready performance.
 */
export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: string };
}) {
  const lang = isLocale(params?.lang) ? params.lang : defaultLocale;

  return (
    // 🐱 FIX #11: HTML lang attribute para SEO y accesibilidad
    <html lang={lang} dir="ltr" className="scroll-smooth">
      <body
        className="min-h-screen bg-slate-950 text-slate-100 font-mono antialiased selection:bg-orange-500/30 selection:text-orange-100"
      // 🐱 FIX #12: Colores estándar de Tailwind en vez de clases custom indefinidas
      >
        <Providers>
          {/* 🐱 FIX #13: HiddenMenu DENTRO de Providers para acceso a context */}
          <HiddenMenu lang={lang as Locale} />
          {children}
        </Providers>
      </body>
    </html>
  );
}