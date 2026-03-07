import { getDictionary, isLocale, defaultLocale } from '@/lib/i18n/config';
import { SigningLabClient } from './SigningLabClient';
import type { SigningLabTranslations } from './SigningLabClient';

interface SigningLabPageProps {
  params: Promise<{ lang: string }>;
}

export default async function SigningLabPage({ params }: SigningLabPageProps) {
  const { lang: paramLang } = await params;
  const lang = isLocale(paramLang) ? paramLang : defaultLocale;

  const dict = await getDictionary(lang);

  // Cast the signingLab slice — keys match SigningLabTranslations exactly
  const t = dict.signingLab as unknown as SigningLabTranslations;

  return <SigningLabClient t={t} lang={lang} />;
}