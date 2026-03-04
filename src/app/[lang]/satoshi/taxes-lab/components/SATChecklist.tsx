'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Circle, ChevronDown, ChevronUp } from 'lucide-react';

interface SATChecklistProps {
    lang: 'en' | 'es';
    t: {
        checklistTitle: string;
        checklistSubtitle: string;
    };
    onComplete?: () => void;
}

interface CheckItem {
    id: string;
    title: string;
    detail: string;
    category: string;
}

const checklistData: Record<'en' | 'es', { categories: string[]; items: CheckItem[] }> = {
    en: {
        categories: ['Records', 'Calculation', 'Filing', 'Ongoing'],
        items: [
            {
                id: 'rec1',
                category: 'Records',
                title: 'Log every transaction with date & time',
                detail: 'Timestamp each acquisition or disposal. Use ISO 8601 format for precision.',
            },
            {
                id: 'rec2',
                category: 'Records',
                title: 'Record MXN value at time of transaction',
                detail: 'Use the official Banxico FIX rate for the transaction date.',
            },
            {
                id: 'rec3',
                category: 'Records',
                title: 'Document the purpose / source of funds',
                detail: 'Was it income, a gift, a purchase, mining reward? SAT may ask.',
            },
            {
                id: 'calc1',
                category: 'Calculation',
                title: 'Determine cost basis for each disposal',
                detail: 'Cost Basis in MXN = original acquisition price at purchase date.',
            },
            {
                id: 'calc2',
                category: 'Calculation',
                title: 'Choose FIFO or LIFO method consistently',
                detail: 'Once chosen, stick with the same method across all tax years.',
            },
            {
                id: 'calc3',
                category: 'Calculation',
                title: 'Net gains: sum gains, subtract losses',
                detail: 'Only net realized gains are taxable. Unrealized gains are not.',
            },
            {
                id: 'fil1',
                category: 'Filing',
                title: 'Include crypto gains in Declaración Anual',
                detail: 'Report under "Otros ingresos" in your annual tax return. Deadline: April 30.',
            },
            {
                id: 'fil2',
                category: 'Filing',
                title: 'Pay any applicable ISR on net gains',
                detail: 'ISR rates for individuals range from 1.9% to 35% depending on income bracket.',
            },
            {
                id: 'ong1',
                category: 'Ongoing',
                title: 'Keep records for at least 5 years',
                detail: 'SAT can audit up to 5 years back. Digital records (CSV, JSON) are acceptable.',
            },
            {
                id: 'ong2',
                category: 'Ongoing',
                title: 'Set calendar reminders for fiscal deadlines',
                detail: 'Monthly provisional payments if income exceeds thresholds. Annual: April 30.',
            },
        ],
    },
    es: {
        categories: ['Registros', 'Cálculo', 'Declaración', 'Continuo'],
        items: [
            {
                id: 'rec1',
                category: 'Registros',
                title: 'Registra cada transacción con fecha y hora',
                detail: 'Guarda timestamp en cada adquisición o enajenación. Usa formato ISO 8601.',
            },
            {
                id: 'rec2',
                category: 'Registros',
                title: 'Anota el valor en MXN al momento de la transacción',
                detail: 'Usa el tipo de cambio FIX del Banxico para la fecha de la transacción.',
            },
            {
                id: 'rec3',
                category: 'Registros',
                title: 'Documenta el propósito / origen del dinero',
                detail: '¿Fue ingreso, regalo, compra, recompensa minera? El SAT puede preguntar.',
            },
            {
                id: 'calc1',
                category: 'Cálculo',
                title: 'Determina el costo de adquisición de cada enajenación',
                detail: 'Costo de Adquisición en MXN = precio original al momento de la compra.',
            },
            {
                id: 'calc2',
                category: 'Cálculo',
                title: 'Elige FIFO o LIFO y úsalo de forma consistente',
                detail: 'Una vez elegido, aplica el mismo método en todos los ejercicios fiscales.',
            },
            {
                id: 'calc3',
                category: 'Cálculo',
                title: 'Ganancia neta: suma ganancias, resta pérdidas',
                detail: 'Solo las ganancias realizadas netas son gravables. Las ganancias no realizadas no.',
            },
            {
                id: 'fil1',
                category: 'Declaración',
                title: 'Incluye ganancias cripto en tu Declaración Anual',
                detail: 'Repórtalas bajo "Otros ingresos". Fecha límite: 30 de abril.',
            },
            {
                id: 'fil2',
                category: 'Declaración',
                title: 'Paga el ISR correspondiente sobre ganancias netas',
                detail: 'Las tasas ISR para personas físicas van del 1.9% al 35% según nivel de ingreso.',
            },
            {
                id: 'ong1',
                category: 'Continuo',
                title: 'Conserva registros al menos 5 años',
                detail: 'El SAT puede auditar hasta 5 años atrás. Los registros digitales (CSV, JSON) son válidos.',
            },
            {
                id: 'ong2',
                category: 'Continuo',
                title: 'Pon recordatorios para fechas fiscales importantes',
                detail: 'Pagos provisionales mensuales si ingresos superan umbrales. Anual: 30 de abril.',
            },
        ],
    },
};

export function SATChecklist({ lang, t, onComplete }: SATChecklistProps) {
    const data = checklistData[lang];
    const [checked, setChecked] = useState<Set<string>>(new Set());
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
        new Set(data.categories)
    );

    const toggle = (id: string) => {
        setChecked((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else {
                next.add(id);
                if (next.size === data.items.length && onComplete) onComplete();
            }
            return next;
        });
    };

    const toggleCategory = (cat: string) => {
        setExpandedCategories((prev) => {
            const next = new Set(prev);
            if (next.has(cat)) next.delete(cat);
            else next.add(cat);
            return next;
        });
    };

    const progress = Math.round((checked.size / data.items.length) * 100);

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-1">{t.checklistTitle}</h2>
            <p className="text-sm text-slate-400 mb-4">{t.checklistSubtitle}</p>

            {/* Progress Bar */}
            <div className="mb-6">
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>{checked.size} / {data.items.length} {lang === 'es' ? 'completados' : 'completed'}</span>
                    <span className="text-orange-400 font-bold">{progress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full"
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.4 }}
                    />
                </div>
            </div>

            {/* Categories */}
            <div className="space-y-4">
                {data.categories.map((category) => {
                    const categoryItems = data.items.filter((item) => item.category === category);
                    const categoryChecked = categoryItems.filter((item) => checked.has(item.id)).length;
                    const isExpanded = expandedCategories.has(category);

                    return (
                        <div key={category} className="border border-slate-800 rounded-xl overflow-hidden">
                            <button
                                onClick={() => toggleCategory(category)}
                                className="w-full flex items-center justify-between px-4 py-3 bg-slate-800/40 hover:bg-slate-800/70 transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-sm text-white">{category}</span>
                                    <span className="text-xs text-slate-500">
                                        ({categoryChecked}/{categoryItems.length})
                                    </span>
                                </div>
                                {isExpanded ? (
                                    <ChevronUp className="w-4 h-4 text-slate-400" />
                                ) : (
                                    <ChevronDown className="w-4 h-4 text-slate-400" />
                                )}
                            </button>

                            <AnimateChecklistItems isExpanded={isExpanded} items={categoryItems} checked={checked} toggle={toggle} />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function AnimateChecklistItems({
    isExpanded,
    items,
    checked,
    toggle,
}: {
    isExpanded: boolean;
    items: CheckItem[];
    checked: Set<string>;
    toggle: (id: string) => void;
}) {
    if (!isExpanded) return null;
    return (
        <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="divide-y divide-slate-800/50"
        >
            {items.map((item) => {
                const isDone = checked.has(item.id);
                return (
                    <div
                        key={item.id}
                        onClick={() => toggle(item.id)}
                        className="flex gap-3 px-4 py-3 cursor-pointer hover:bg-slate-800/30 transition-colors"
                    >
                        <div className="mt-0.5 shrink-0">
                            {isDone ? (
                                <CheckCircle className="w-5 h-5 text-emerald-400" />
                            ) : (
                                <Circle className="w-5 h-5 text-slate-600" />
                            )}
                        </div>
                        <div>
                            <p className={`text-sm font-medium ${isDone ? 'line-through text-slate-500' : 'text-white'}`}>
                                {item.title}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">{item.detail}</p>
                        </div>
                    </div>
                );
            })}
        </motion.div>
    );
}
