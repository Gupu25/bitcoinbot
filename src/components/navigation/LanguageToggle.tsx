'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { locales, localeNames, type Locale } from '@/lib/i18n/config';

/**
 * Toggle between EN and ES. Uses pathname to preserve current route.
 */
export function LanguageToggle() {
  const pathname = usePathname() ?? '/en';

  // Extract lang from path: /en, /en/about, /es/satoshi/seed-lab, etc.
  const segments = pathname.split('/').filter(Boolean);
  const currentLang = (segments[0] === 'en' || segments[0] === 'es' ? segments[0] : 'en') as Locale;

  const otherLang: Locale = currentLang === 'en' ? 'es' : 'en';

  // Build alternate path: replace first segment with other lang
  const alternatePath = segments.length > 0
    ? `/${otherLang}${segments.length > 1 ? '/' + segments.slice(1).join('/') : ''}`
    : `/${otherLang}`;

  return (
    <div
      className="fixed z-50 flex items-center gap-0.5 rounded-full bg-black/90 border border-[#f7931a]/30 px-1.5 py-1 font-mono text-xs"

      aria-label="Switch language"
    >
      {locales.map((locale) => {
        const isActive = locale === currentLang;

        return (
          <span key={locale} className="relative inline-flex items-center">
            {isActive ? (
              <span
                className="inline-flex items-center justify-center px-3 py-1.5 rounded-full bg-[#f7931a] text-black font-bold cursor-default leading-none"
                aria-current="page"
              >
                {localeNames[locale]}
              </span>
            ) : (
              <Link
                href={alternatePath}
                className="inline-flex items-center justify-center px-3 py-1.5 rounded-full text-slate-400 hover:text-white transition-colors leading-none"
              >
                {localeNames[locale]}
              </Link>
            )}
          </span>
        );
      })}
    </div>
  );
}
