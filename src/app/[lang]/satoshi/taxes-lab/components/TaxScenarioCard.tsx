'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, LucideIcon } from 'lucide-react';

interface TaxScenarioCardProps {
    title: string;
    description: string;
    icon: LucideIcon;
    lang: 'en' | 'es';
}

const scenarioDetails: Record<string, { en: { outcome: string; taxNote: string }; es: { outcome: string; taxNote: string } }> = {
    'HODL vs Sell': {
        en: {
            outcome: 'Holding BTC for more than a calendar year does NOT reduce your tax rate in Mexico — every gain is taxed as ordinary income in the year of disposal.',
            taxNote: '📌 No long-term capital gains discount exists in Mexico for crypto (unlike the US). Plan your disposals strategically.',
        },
        es: {
            outcome: 'Mantener BTC por más de un año NO reduce tu tasa de impuestos en México. Cada ganancia se grava como ingreso ordinario en el año de la enajenación.',
            taxNote: '📌 En México no hay descuento por ganancias de capital a largo plazo para cripto (a diferencia de EE.UU.). Planea tus enajenaciones estratégicamente.',
        },
    },
    'Exchange to ETH': {
        en: {
            outcome: 'Swapping BTC for ETH is legally a two-step event: (1) disposal of BTC at market value → triggers gain/loss, (2) acquisition of ETH at the same market value → sets new cost basis.',
            taxNote: '📌 You must report the BTC gain even if you never touched fiat. The "I didn\'t cash out" argument doesn\'t hold.',
        },
        es: {
            outcome: 'Cambiar BTC por ETH es legalmente un evento en dos pasos: (1) enajenación de BTC al valor de mercado → genera ganancia/pérdida, (2) adquisición de ETH al mismo valor → establece nuevo costo.',
            taxNote: '📌 Debes reportar la ganancia de BTC aunque nunca hayas tocado dinero fiat. El argumento "no saqué a fiat" no aplica.',
        },
    },
    'Gift to Friend': {
        en: {
            outcome: 'Gifting BTC in Mexico is treated as a disposal at fair market value. The donor may owe ISR on the gain. The recipient receives the BTC at market value (new cost basis) and owes ISR on any gift above exemptions.',
            taxNote: '📌 Gifts between non-relatives are taxable. Between direct family members, exemptions may apply up to certain amounts.',
        },
        es: {
            outcome: 'Regalar BTC en México se trata como una enajenación al valor de mercado. El donante puede deber ISR sobre la ganancia. El donatario recibe el BTC al valor de mercado (nuevo costo) y debe ISR sobre donaciones que superen exenciones.',
            taxNote: '📌 Las donaciones entre no familiares son gravables. Entre familiares directos puede haber exenciones hasta ciertos montos.',
        },
    },
    'HODL vs Vender': {
        en: { outcome: '', taxNote: '' },
        es: {
            outcome: 'Mantener BTC por más de un año NO reduce tu tasa de impuestos en México. Cada ganancia se grava como ingreso ordinario en el año de la enajenación.',
            taxNote: '📌 En México no hay descuento por ganancias de capital a largo plazo para cripto. Planea tus enajenaciones estratégicamente.',
        },
    },
    'Intercambiar por ETH': {
        en: { outcome: '', taxNote: '' },
        es: {
            outcome: 'Cambiar BTC por ETH es legalmente un evento en dos pasos: (1) enajenación de BTC → genera ganancia, (2) adquisición de ETH → nuevo costo de adquisición.',
            taxNote: '📌 Debes reportar la ganancia de BTC aunque nunca hayas tocado dinero fiat.',
        },
    },
    'Regalo a un Amigo': {
        en: { outcome: '', taxNote: '' },
        es: {
            outcome: 'Regalar BTC se trata como enajenación al valor de mercado. El donante puede deber ISR; el donatario también sobre donaciones que superen exenciones.',
            taxNote: '📌 Las donaciones entre no familiares son gravables. Entre familiares directos puede haber exenciones.',
        },
    },
};

function getDetails(title: string, lang: 'en' | 'es') {
    const entry = scenarioDetails[title];
    if (!entry) return null;
    return entry[lang].outcome ? entry[lang] : null;
}

export function TaxScenarioCard({ title, description, icon: Icon, lang }: TaxScenarioCardProps) {
    const [expanded, setExpanded] = useState(false);
    const details = getDetails(title, lang);

    return (
        <motion.div
            whileHover={{ y: -2 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden"
        >
            <div
                className="p-5 cursor-pointer"
                onClick={() => setExpanded((v) => !v)}
            >
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0">
                            <Icon className="w-5 h-5 text-orange-400" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-sm">{title}</h3>
                            <p className="text-xs text-slate-400 mt-0.5">{description}</p>
                        </div>
                    </div>
                    {expanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
                    ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
                    )}
                </div>
            </div>

            <AnimatePresence>
                {expanded && details && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-5 pb-5 border-t border-slate-800"
                    >
                        <div className="pt-4 space-y-3">
                            <p className="text-sm text-slate-300 leading-relaxed">{details.outcome}</p>
                            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-xs text-amber-300">
                                {details.taxNote}
                            </div>
                        </div>
                    </motion.div>
                )}
                {expanded && !details && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-5 pb-5 border-t border-slate-800"
                    >
                        <div className="pt-4">
                            <p className="text-sm text-slate-400">
                                {lang === 'es' ? 'Contenido detallado próximamente...' : 'Detailed content coming soon...'}
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
