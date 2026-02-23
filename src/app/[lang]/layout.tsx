import type { Metadata } from 'next';
import { Locale, getDictionary, isLocale, defaultLocale } from '@/lib/i18n/config';
import { Providers } from './providers';
import { HiddenMenu } from '@/components/navigation/HiddenMenu';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params
}: {
  params: { lang: string }
}): Promise<Metadata> {
  const lang = isLocale(params?.lang) ? params.lang : defaultLocale;
  const dict = await getDictionary(lang);

  return {
    title: 'Bitcoin Agent | Infrastructure First',
    description: dict?.hero?.subtitle || 'Digital Immune System',
    alternates: {
      canonical: `/${lang}`,
      languages: {
        'en': '/en',
        'es': '/es',
      },
    },
  };
}

export async function generateStaticParams() {
  return ['en', 'es'].map((locale) => ({ lang: locale }));
}

/**
 * Language-specific Layout
 * Philosophy: Handles i18n context and client-side hydration boundaries.
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
    <div className="min-h-screen bg-terminal-black text-terminal-green font-mono">
      <HiddenMenu lang={lang as Locale} />
      <Providers>
        {children}
      </Providers>
    </div>
  );
}