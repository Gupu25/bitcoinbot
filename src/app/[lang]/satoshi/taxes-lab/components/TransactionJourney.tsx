'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Wallet, Building2, FileText, CheckCircle, AlertCircle } from 'lucide-react';

interface TransactionJourneyProps {
    lang: 'en' | 'es';
    t: {
        journeyTitle: string;
        journeySubtitle: string;
    };
}

const steps = {
    en: [
        {
            id: 'acquire',
            icon: Wallet,
            title: 'Acquire Bitcoin',
            desc: 'You buy BTC on an exchange. Record the date, amount in sats, and the MXN value at the moment of purchase.',
            tip: '💡 This establishes your Cost Basis in MXN.',
            color: 'blue',
        },
        {
            id: 'hold',
            icon: Building2,
            title: 'Hold (No Tax Event)',
            desc: 'Simply holding BTC is NOT a taxable event. No need to report while you HODL!',
            tip: '✅ Merely holding BTC does not trigger SAT obligations.',
            color: 'emerald',
        },
        {
            id: 'dispose',
            icon: ArrowRight,
            title: 'Dispose (Taxable Event)',
            desc: 'Selling, exchanging, or spending BTC triggers a taxable event. Calculate: Sale Value − Cost Basis = Gain/Loss.',
            tip: '⚠️ Swapping BTC → ETH also counts as a disposal!',
            color: 'amber',
        },
        {
            id: 'report',
            icon: FileText,
            title: 'Report to SAT',
            desc: 'Include net gains in your annual tax declaration (Declaración Anual). Use official Banxico exchange rates.',
            tip: '📅 Deadline: April 30 for individuals.',
            color: 'orange',
        },
        {
            id: 'confirm',
            icon: CheckCircle,
            title: 'Compliance Achieved!',
            desc: `You've fulfilled your fiscal obligations. Sleep soundly knowing you're legally protected.`,
            tip: '🎉 Traceability + Transparency + Good Management!',
            color: 'green',
        },
    ],
    es: [
        {
            id: 'acquire',
            icon: Wallet,
            title: 'Adquirir Bitcoin',
            desc: 'Compras BTC en un exchange. Registra la fecha, el monto en sats y el valor en MXN al momento de la compra.',
            tip: '💡 Esto establece tu Costo de Adquisición en MXN.',
            color: 'blue',
        },
        {
            id: 'hold',
            icon: Building2,
            title: 'Mantener (Sin Evento Fiscal)',
            desc: 'Solo mantener BTC NO es un evento gravable. ¡No necesitas reportar mientras haces HODL!',
            tip: '✅ Simplemente tener BTC no activa obligaciones ante el SAT.',
            color: 'emerald',
        },
        {
            id: 'dispose',
            icon: ArrowRight,
            title: 'Enajenar (Evento Gravable)',
            desc: 'Vender, intercambiar o gastar BTC activa un evento gravable. Calcula: Valor Venta − Costo Adquisición = Ganancia/Pérdida.',
            tip: '⚠️ ¡Cambiar BTC → ETH también cuenta como enajenación!',
            color: 'amber',
        },
        {
            id: 'report',
            icon: FileText,
            title: 'Declarar al SAT',
            desc: 'Incluye las ganancias netas en tu Declaración Anual. Usa el tipo de cambio oficial del Banxico.',
            tip: '📅 Fecha límite: 30 de abril para personas físicas.',
            color: 'orange',
        },
        {
            id: 'confirm',
            icon: CheckCircle,
            title: '¡Cumplimiento Logrado!',
            desc: 'Has cumplido con tus obligaciones fiscales. Duerme tranquilo sabiendo que estás protegido legalmente.',
            tip: '🎉 ¡Trazabilidad + Transparencia + Buen Manejo!',
            color: 'green',
        },
    ],
};

const colorMap: Record<string, string> = {
    blue: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
    emerald: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    amber: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    orange: 'bg-orange-500/10 border-orange-500/30 text-orange-400',
    green: 'bg-green-500/10 border-green-500/30 text-green-400',
};

const iconColorMap: Record<string, string> = {
    blue: 'text-blue-400',
    emerald: 'text-emerald-400',
    amber: 'text-amber-400',
    orange: 'text-orange-400',
    green: 'text-green-400',
};

export function TransactionJourney({ lang, t }: TransactionJourneyProps) {
    const [activeStep, setActiveStep] = useState(0);
    const journey = steps[lang];
    const current = journey[activeStep];

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-1">{t.journeyTitle}</h2>
            <p className="text-sm text-slate-400 mb-6">{t.journeySubtitle}</p>

            {/* Step Indicators */}
            <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-2">
                {journey.map((step, i) => {
                    const Icon = step.icon;
                    const isActive = i === activeStep;
                    const isDone = i < activeStep;
                    return (
                        <div key={step.id} className="flex items-center gap-1 shrink-0">
                            <button
                                onClick={() => setActiveStep(i)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${isActive
                                    ? `border ${colorMap[step.color]} scale-105`
                                    : isDone
                                        ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
                                        : 'bg-slate-800/50 text-slate-500 border border-slate-700'
                                    }`}
                            >
                                {isDone ? (
                                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                                ) : (
                                    <Icon className={`w-4 h-4 ${isActive ? iconColorMap[step.color] : 'text-slate-500'}`} />
                                )}
                                <span className="hidden sm:block">{step.title}</span>
                            </button>
                            {i < journey.length - 1 && (
                                <ArrowRight className={`w-4 h-4 shrink-0 ${i < activeStep ? 'text-emerald-400' : 'text-slate-700'}`} />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Step Detail Card */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={current.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className={`border rounded-2xl p-6 ${colorMap[current.color]}`}
                >
                    <div className="flex items-center gap-3 mb-3">
                        <current.icon className={`w-6 h-6 ${iconColorMap[current.color]}`} />
                        <h3 className="text-lg font-bold text-white">{current.title}</h3>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed mb-3">{current.desc}</p>
                    <div className="bg-slate-900/60 rounded-xl p-3 text-xs text-slate-400">
                        {current.tip}
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-4">
                <button
                    onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                    disabled={activeStep === 0}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded-xl text-sm transition-colors"
                >
                    ← {lang === 'es' ? 'Anterior' : 'Previous'}
                </button>
                <span className="text-slate-500 text-sm self-center">
                    {activeStep + 1} / {journey.length}
                </span>
                <button
                    onClick={() => setActiveStep(Math.min(journey.length - 1, activeStep + 1))}
                    disabled={activeStep === journey.length - 1}
                    className="px-4 py-2 bg-orange-500 hover:bg-orange-400 disabled:opacity-30 rounded-xl text-sm font-medium text-black transition-colors"
                >
                    {lang === 'es' ? 'Siguiente' : 'Next'} →
                </button>
            </div>
        </div>
    );
}
