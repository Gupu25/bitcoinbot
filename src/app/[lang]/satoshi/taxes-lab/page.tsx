'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText, TrendingUp, AlertTriangle, Check, Calendar,
    Download, Filter, Search, RefreshCw, BookOpen, Lightbulb,
    Shield, Target, Coins, Scale, PieChart, HelpCircle,
    ChevronDown, Info, CheckCircle, XCircle, ArrowRight, Clock,
} from 'lucide-react';
import { InfoTooltip } from '@/components/ui/InfoTooltip';
import { BobChatWidget } from '@/components/chat/BobChatWidget';
import { TransactionJourney } from './components/TransactionJourney';
import { CostBasisSimulator } from './components/CostBasisSimulator';
import { SATChecklist } from './components/SATChecklist';
import { TaxScenarioCard } from './components/TaxScenarioCard';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface TaxLabProps {
    params: { lang: 'en' | 'es' };
}

interface Transaction {
    id: string;
    timestamp: string;
    amountSats: number;
    amountMXN: number;
    source: string;
    status: 'confirmed' | 'pending' | 'unreported';
    costBasis?: number;
    gainLoss?: number;
    fiscalYear: number;
}

interface TaxStats {
    totalReceived: number;
    totalSent: number;
    totalGain: number;
    totalLoss: number;
    reportedCount: number;
    unreportedCount: number;
}

interface Translations {
    // Headers
    title: string;
    subtitle: string;
    tagline: string;

    // Three Pillars
    pillarTraceability: string;
    pillarTraceabilityDesc: string;
    pillarTransparency: string;
    pillarTransparencyDesc: string;
    pillarManagement: string;
    pillarManagementDesc: string;

    // Stats
    statsTitle: string;
    totalReceived: string;
    totalSent: string;
    netGain: string;
    complianceRate: string;

    // Educational Sections
    whyTaxesMatter: string;
    whyTaxesDesc: string;
    mexicanContext: string;
    mexicanContextDesc: string;

    // Transaction Journey
    journeyTitle: string;
    journeySubtitle: string;

    // Cost Basis
    costBasisTitle: string;
    costBasisSubtitle: string;
    fifoLabel: string;
    lifoLabel: string;

    // SAT Checklist
    checklistTitle: string;
    checklistSubtitle: string;

    // Scenarios
    scenariosTitle: string;
    scenario1Title: string;
    scenario1Desc: string;
    scenario2Title: string;
    scenario2Desc: string;
    scenario3Title: string;
    scenario3Desc: string;

    // Table
    transactionsTitle: string;
    searchPlaceholder: string;
    tableHeaders: {
        date: string;
        amount: string;
        mxnValue: string;
        source: string;
        status: string;
        gainLoss: string;
        actions: string;
    };

    // Actions
    generateReport: string;
    exportCSV: string;
    refreshData: string;

    // Educational Tooltips
    tooltipCostBasis: string;
    tooltipGainLoss: string;
    tooltipStatus: string;
    tooltipFIFO: string;
    tooltipLIFO: string;

    // Completion
    labComplete: string;
    labCompleteDesc: string;
    nextStep: string;

    // Quiz (optional)
    quizTitle: string;
    quizDesc: string;
}

const translations: Record<'en' | 'es', Translations> = {
    en: {
        title: 'Taxes & Compliance Lab',
        subtitle: 'Learn Bitcoin taxation through interactive practice',
        tagline: '🔍 Traceability • 🔓 Transparency • 📚 Good Management',

        pillarTraceability: 'Traceability',
        pillarTraceabilityDesc: 'Every satoshi has a history. Record date, amount, MXN value, and purpose for each transaction.',
        pillarTransparency: 'Transparency',
        pillarTransparencyDesc: 'Clear documentation makes compliance easy. Use official exchange rates and keep organized records.',
        pillarManagement: 'Good Management',
        pillarManagementDesc: 'Calculate gains/losses correctly. Understand FIFO/LIFO. Report on time. Sleep peacefully! 😴',

        statsTitle: 'Your Fiscal Overview',
        totalReceived: 'Total Received',
        totalSent: 'Total Sent',
        netGain: 'Net Gain/Loss',
        complianceRate: 'Compliance Rate',

        whyTaxesMatter: 'Why Bitcoin Taxes Matter',
        whyTaxesDesc: 'Bitcoin transactions are taxable events in Mexico. Understanding your obligations protects you and strengthens the ecosystem. Knowledge is your best defense! 🛡️',
        mexicanContext: 'Mexican Context (SAT)',
        mexicanContextDesc: 'The SAT considers cryptocurrencies as assets. Gains from disposal (venta, intercambio, gasto) are taxable income. No minimum exemption—every transaction counts!',

        journeyTitle: 'Follow the Satoshi: Fiscal Journey',
        journeySubtitle: 'See how a single transaction flows through your tax obligations',

        costBasisTitle: 'Cost Basis Simulator',
        costBasisSubtitle: 'Learn how FIFO vs LIFO affects your taxable gains',
        fifoLabel: 'FIFO: First In, First Out',
        lifoLabel: 'LIFO: Last In, First Out',

        checklistTitle: 'SAT Compliance Checklist',
        checklistSubtitle: 'Complete these steps to stay compliant (and stress-free!)',

        scenariosTitle: 'What-If Scenarios',
        scenario1Title: 'HODL vs Sell',
        scenario1Desc: 'What happens if you hold vs sell after 1 year?',
        scenario2Title: 'Exchange to ETH',
        scenario2Desc: 'Swapping BTC for ETH is a taxable disposal!',
        scenario3Title: 'Gift to Friend',
        scenario3Desc: 'Even gifts may have tax implications—learn when.',

        transactionsTitle: 'Transaction History',
        searchPlaceholder: 'Search by txid, source, or amount...',
        tableHeaders: {
            date: 'Date',
            amount: 'Amount (sats)',
            mxnValue: 'MXN Value',
            source: 'Source',
            status: 'Fiscal Status',
            gainLoss: 'Gain/Loss',
            actions: 'Actions',
        },

        generateReport: 'Generate Report',
        exportCSV: 'Export CSV',
        refreshData: 'Refresh Data',

        tooltipCostBasis: 'Cost basis = original value in MXN when acquired. Critical for calculating gains!',
        tooltipGainLoss: 'Gain = Sale Value - Cost Basis. Positive = taxable income. Negative = potential deduction.',
        tooltipStatus: '🟢 Reported • 🟡 Pending • 🔴 Unreported. Aim for all green!',
        tooltipFIFO: 'Sell oldest coins first. Often better for long-term holdings in rising markets.',
        tooltipLIFO: 'Sell newest coins first. May reduce short-term gains in volatile markets.',

        labComplete: '🎉 Lab Completed!',
        labCompleteDesc: 'You now understand Bitcoin taxation basics! Remember: traceability + transparency + good management = peace of mind.',
        nextStep: 'Continue Learning',

        quizTitle: 'Test Your Knowledge',
        quizDesc: 'Prove you understand Bitcoin taxes in Mexico',
    },
    es: {
        title: 'Lab de Impuestos y Cumplimiento',
        subtitle: 'Aprende sobre impuestos Bitcoin con práctica interactiva',
        tagline: '🔍 Trazabilidad • 🔓 Transparencia • 📚 Buen Manejo',

        pillarTraceability: 'Trazabilidad',
        pillarTraceabilityDesc: 'Cada satoshi tiene historia. Registra fecha, monto, valor en MXN y propósito de cada transacción.',
        pillarTransparency: 'Transparencia',
        pillarTransparencyDesc: 'Documentación clara facilita el cumplimiento. Usa tipos de cambio oficiales y mantén registros organizados.',
        pillarManagement: 'Buen Manejo',
        pillarManagementDesc: 'Calcula ganancias/pérdidas correctamente. Entiende FIFO/LIFO. Declara a tiempo. ¡Duerme tranquilo! 😴',

        statsTitle: 'Tu Panorama Fiscal',
        totalReceived: 'Total Recibido',
        totalSent: 'Total Enviado',
        netGain: 'Ganancia/Pérdida Neta',
        complianceRate: 'Tasa de Cumplimiento',

        whyTaxesMatter: 'Por Qué Importan los Impuestos Bitcoin',
        whyTaxesDesc: 'Las transacciones Bitcoin son eventos tributables en México. Entender tus obligaciones te protege y fortalece el ecosistema. ¡El conocimiento es tu mejor defensa! 🛡️',
        mexicanContext: 'Contexto Mexicano (SAT)',
        mexicanContextDesc: 'El SAT considera las criptomonedas como activos. Las ganancias por enajenación (venta, intercambio, gasto) son ingresos gravables. ¡No hay mínimo exento—cada transacción cuenta!',

        journeyTitle: 'Sigue al Satoshi: Ruta Fiscal',
        journeySubtitle: 'Mira cómo una sola transacción fluye por tus obligaciones fiscales',

        costBasisTitle: 'Simulador de Costo de Adquisición',
        costBasisSubtitle: 'Aprende cómo FIFO vs LIFO afecta tus ganancias gravables',
        fifoLabel: 'FIFO: Primero en Entrar, Primero en Salir',
        lifoLabel: 'LIFO: Último en Entrar, Primero en Salir',

        checklistTitle: 'Lista de Cumplimiento SAT',
        checklistSubtitle: 'Completa estos pasos para mantenerte compliant (¡y sin estrés!)',

        scenariosTitle: 'Escenarios "¿Qué Pasaría Si...?"',
        scenario1Title: 'HODL vs Vender',
        scenario1Desc: '¿Qué pasa si mantienes vs vendes después de 1 año?',
        scenario2Title: 'Intercambiar por ETH',
        scenario2Desc: '¡Cambiar BTC por ETH es una enajenación gravable!',
        scenario3Title: 'Regalo a un Amigo',
        scenario3Desc: 'Incluso los regalos pueden tener implicaciones fiscales—aprende cuándo.',

        transactionsTitle: 'Historial de Transacciones',
        searchPlaceholder: 'Buscar por txid, fuente o monto...',
        tableHeaders: {
            date: 'Fecha',
            amount: 'Monto (sats)',
            mxnValue: 'Valor MXN',
            source: 'Fuente',
            status: 'Estado Fiscal',
            gainLoss: 'Ganancia/Pérdida',
            actions: 'Acciones',
        },

        generateReport: 'Generar Reporte',
        exportCSV: 'Exportar CSV',
        refreshData: 'Actualizar Datos',

        tooltipCostBasis: 'Costo de adquisición = valor original en MXN al comprar. ¡Crítico para calcular ganancias!',
        tooltipGainLoss: 'Ganancia = Valor Venta - Costo Adquisición. Positivo = ingreso gravable. Negativo = posible deducción.',
        tooltipStatus: '🟢 Reportado • 🟡 Pendiente • 🔴 No Reportado. ¡Apunta a todo verde!',
        tooltipFIFO: 'Vende primero las monedas más antiguas. Mejor para holdings a largo plazo en mercados alcistas.',
        tooltipLIFO: 'Vende primero las monedas más recientes. Puede reducir ganancias a corto plazo en mercados volátiles.',

        labComplete: '🎉 ¡Lab Completado!',
        labCompleteDesc: '¡Ahora entiendes los basics de impuestos Bitcoin! Recuerda: trazabilidad + transparencia + buen manejo = paz mental.',
        nextStep: 'Continuar Aprendiendo',

        quizTitle: 'Pon a Prueba tu Conocimiento',
        quizDesc: 'Demuestra que entiendes impuestos Bitcoin en México',
    },
};

// ============================================================================
// MOCK DATA (for educational purposes - replace with API in production)
// ============================================================================
const mockTransactions: Transaction[] = [
    {
        id: 'a1b2c3d4',
        timestamp: '2024-01-15T10:30:00Z',
        amountSats: 50000,
        amountMXN: 18500,
        source: 'Binance',
        status: 'confirmed',
        costBasis: 18500,
        gainLoss: 0,
        fiscalYear: 2024,
    },
    {
        id: 'e5f6g7h8',
        timestamp: '2024-02-20T14:15:00Z',
        amountSats: 30000,
        amountMXN: 12000,
        source: 'Personal Wallet',
        status: 'pending',
        costBasis: 12000,
        gainLoss: 0,
        fiscalYear: 2024,
    },
    {
        id: 'i9j0k1l2',
        timestamp: '2024-03-10T09:45:00Z',
        amountSats: 20000,
        amountMXN: 9000,
        source: 'Lightning Tip',
        status: 'unreported',
        costBasis: 9000,
        gainLoss: 0,
        fiscalYear: 2024,
    },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function TaxesLabPage({ params }: TaxLabProps) {
    const lang = params.lang || 'en';
    const t = translations[lang];

    const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
    const [stats] = useState<TaxStats>({
        totalReceived: 100000,
        totalSent: 0,
        totalGain: 0,
        totalLoss: 0,
        reportedCount: 1,
        unreportedCount: 2,
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [labCompleted, setLabCompleted] = useState(false);
    const [activeSection, setActiveSection] = useState<'journey' | 'simulator' | 'checklist'>('journey');

    // Filter transactions based on search
    const filteredTransactions = useMemo(() => {
        if (!searchQuery) return transactions;
        const query = searchQuery.toLowerCase();
        return transactions.filter(
            (tx) =>
                tx.id.toLowerCase().includes(query) ||
                tx.source.toLowerCase().includes(query) ||
                tx.amountSats.toString().includes(query),
        );
    }, [transactions, searchQuery]);

    // Educational progress tracker
    const progressSteps = [
        { id: 'journey', title: t.journeyTitle, icon: Target },
        { id: 'simulator', title: t.costBasisTitle, icon: PieChart },
        { id: 'checklist', title: t.checklistTitle, icon: CheckCircle },
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-white py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <motion.div
                        className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 rounded-full px-4 py-2 mb-4"
                        whileHover={{ scale: 1.05 }}
                    >
                        <Scale className="w-4 h-4 text-blue-400" />
                        <span className="text-blue-400 text-sm font-mono uppercase tracking-wider">
                            {t.tagline}
                        </span>
                    </motion.div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 flex items-center justify-center gap-3">
                        <FileText className="w-10 h-10 text-orange-400" />
                        {t.title}
                    </h1>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto">{t.subtitle}</p>
                </motion.div>

                {/* 🎓 Three Pillars Banner */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="grid md:grid-cols-3 gap-4 mb-8"
                >
                    {[
                        { icon: Target, title: t.pillarTraceability, desc: t.pillarTraceabilityDesc, colorClass: 'bg-emerald-500/10 border-emerald-500/30', iconClass: 'bg-emerald-500/20', textClass: 'text-emerald-400' },
                        { icon: Shield, title: t.pillarTransparency, desc: t.pillarTransparencyDesc, colorClass: 'bg-blue-500/10 border-blue-500/30', iconClass: 'bg-blue-500/20', textClass: 'text-blue-400' },
                        { icon: BookOpen, title: t.pillarManagement, desc: t.pillarManagementDesc, colorClass: 'bg-amber-500/10 border-amber-500/30', iconClass: 'bg-amber-500/20', textClass: 'text-amber-400' },
                    ].map((pillar, i) => (
                        <motion.div
                            key={pillar.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className={`border rounded-2xl p-5 ${pillar.colorClass}`}
                        >
                            <div className={`w-10 h-10 rounded-xl ${pillar.iconClass} flex items-center justify-center mb-3`}>
                                <pillar.icon className={`w-5 h-5 ${pillar.textClass}`} />
                            </div>
                            <h3 className="font-bold text-white mb-1">{pillar.title}</h3>
                            <p className="text-sm text-slate-400">{pillar.desc}</p>
                        </motion.div>
                    ))}
                </motion.div>

                {/* 🎓 Why This Matters */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-purple-500/10 border border-purple-500/30 rounded-2xl p-6 mb-8"
                >
                    <h3 className="text-lg font-bold text-purple-400 mb-3 flex items-center gap-2">
                        <Lightbulb className="w-5 h-5" />
                        {t.whyTaxesMatter}
                    </h3>
                    <p className="text-sm text-slate-300 leading-relaxed mb-3">{t.whyTaxesDesc}</p>
                    <div className="bg-slate-900/50 rounded-xl p-4 mt-3">
                        <p className="text-sm text-orange-400 font-medium mb-1">🇲🇽 {t.mexicanContext}</p>
                        <p className="text-xs text-slate-400">{t.mexicanContextDesc}</p>
                    </div>
                </motion.div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: t.totalReceived, value: `${(stats.totalReceived / 1e6).toFixed(2)}M sats`, icon: TrendingUp, colorClass: 'text-green-400' },
                        { label: t.totalSent, value: `${(stats.totalSent / 1e6).toFixed(2)}M sats`, icon: Coins, colorClass: 'text-blue-400' },
                        { label: t.netGain, value: `$${(stats.totalGain - stats.totalLoss).toLocaleString()}`, icon: Scale, colorClass: stats.totalGain >= stats.totalLoss ? 'text-emerald-400' : 'text-rose-400' },
                        { label: t.complianceRate, value: `${Math.round((stats.reportedCount / (stats.reportedCount + stats.unreportedCount)) * 100)}%`, icon: Check, colorClass: 'text-amber-400' },
                    ].map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-slate-900 border border-slate-800 rounded-2xl p-4"
                        >
                            <div className={`flex items-center gap-2 mb-2 ${stat.colorClass}`}>
                                <stat.icon className="w-4 h-4" />
                                <span className="text-xs text-slate-400">{stat.label}</span>
                            </div>
                            <p className="text-lg font-bold">{stat.value}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Educational Sections Navigation */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {progressSteps.map((step) => (
                        <button
                            key={step.id}
                            onClick={() => setActiveSection(step.id as 'journey' | 'simulator' | 'checklist')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${activeSection === step.id
                                ? 'bg-orange-500 text-black'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                }`}
                        >
                            <step.icon className="w-4 h-4" />
                            {step.title}
                        </button>
                    ))}
                </div>

                {/* Dynamic Educational Content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeSection}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="mb-8"
                    >
                        {activeSection === 'journey' && (
                            <TransactionJourney lang={lang} t={t} />
                        )}
                        {activeSection === 'simulator' && (
                            <CostBasisSimulator lang={lang} t={t} />
                        )}
                        {activeSection === 'checklist' && (
                            <SATChecklist lang={lang} t={t} onComplete={() => setLabCompleted(true)} />
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* What-If Scenarios */}
                <h2 className="text-xl font-bold mb-4">{t.scenariosTitle}</h2>
                <div className="grid md:grid-cols-3 gap-4 mb-8">
                    {[
                        { title: t.scenario1Title, desc: t.scenario1Desc, icon: Clock },
                        { title: t.scenario2Title, desc: t.scenario2Desc, icon: RefreshCw },
                        { title: t.scenario3Title, desc: t.scenario3Desc, icon: Coins },
                    ].map((scenario) => (
                        <TaxScenarioCard
                            key={scenario.title}
                            title={scenario.title}
                            description={scenario.desc}
                            icon={scenario.icon}
                            lang={lang}
                        />
                    ))}
                </div>

                {/* Transactions Table */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                        <h2 className="text-xl font-bold">{t.transactionsTitle}</h2>
                        <div className="flex gap-2 w-full sm:w-auto">
                            <div className="relative flex-1 sm:flex-none">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                    type="text"
                                    placeholder={t.searchPlaceholder}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full sm:w-64 pl-10 pr-3 py-2 bg-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            </div>
                            <button
                                onClick={() => setTransactions(mockTransactions)}
                                className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700"
                                title={t.refreshData}
                            >
                                <RefreshCw className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-slate-400 text-sm border-b border-slate-800">
                                    <th className="pb-3">{t.tableHeaders.date}</th>
                                    <th className="pb-3">{t.tableHeaders.amount}</th>
                                    <th className="pb-3">{t.tableHeaders.mxnValue}</th>
                                    <th className="pb-3">{t.tableHeaders.source}</th>
                                    <th className="pb-3">
                                        <span className="flex items-center gap-1">
                                            {t.tableHeaders.status}
                                            <InfoTooltip content={t.tooltipStatus} />
                                        </span>
                                    </th>
                                    <th className="pb-3">
                                        <span className="flex items-center gap-1">
                                            {t.tableHeaders.gainLoss}
                                            <InfoTooltip content={t.tooltipGainLoss} />
                                        </span>
                                    </th>
                                    <th className="pb-3">{t.tableHeaders.actions}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTransactions.map((tx) => (
                                    <motion.tr
                                        key={tx.id}
                                        className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                    >
                                        <td className="py-3 font-mono text-sm">
                                            {new Date(tx.timestamp).toLocaleDateString(lang === 'es' ? 'es-MX' : 'en-US')}
                                        </td>
                                        <td className="py-3 font-mono text-orange-400">
                                            {tx.amountSats.toLocaleString()}
                                        </td>
                                        <td className="py-3 font-mono">
                                            ${tx.amountMXN.toLocaleString()}
                                        </td>
                                        <td className="py-3">
                                            <span className="px-2 py-1 bg-slate-800 rounded text-xs">
                                                {tx.source}
                                            </span>
                                        </td>
                                        <td className="py-3">
                                            <span
                                                className={`px-2 py-1 rounded text-xs flex items-center gap-1 w-fit ${tx.status === 'confirmed'
                                                    ? 'bg-green-500/20 text-green-400'
                                                    : tx.status === 'pending'
                                                        ? 'bg-yellow-500/20 text-yellow-400'
                                                        : 'bg-red-500/20 text-red-400'
                                                    }`}
                                            >
                                                {tx.status === 'confirmed' ? '🟢' : tx.status === 'pending' ? '🟡' : '🔴'}
                                                {tx.status}
                                            </span>
                                        </td>
                                        <td className="py-3 font-mono text-sm">
                                            {tx.gainLoss !== undefined && tx.gainLoss !== 0 ? (
                                                <span className={tx.gainLoss >= 0 ? 'text-green-400' : 'text-red-400'}>
                                                    {tx.gainLoss >= 0 ? '+' : ''}${Math.abs(tx.gainLoss).toFixed(2)}
                                                </span>
                                            ) : (
                                                <span className="text-slate-500">—</span>
                                            )}
                                        </td>
                                        <td className="py-3">
                                            <button
                                                className="text-slate-400 hover:text-orange-400 transition-colors"
                                                title="View details"
                                            >
                                                <ArrowRight className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 justify-center mb-8">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-black font-bold rounded-xl flex items-center gap-2"
                    >
                        <Calendar className="w-5 h-5" />
                        {t.generateReport}
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl flex items-center gap-2"
                    >
                        <Download className="w-5 h-5" />
                        {t.exportCSV}
                    </motion.button>
                </div>

                {/* 🎉 Completion Badge */}
                <AnimatePresence>
                    {labCompleted && (
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.95 }}
                            className="p-6 bg-gradient-to-r from-emerald-500/10 to-green-500/10 border-2 border-emerald-500/40 rounded-2xl text-center relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.1)_0%,transparent_70%)] pointer-events-none" />
                            <div className="flex items-center justify-center gap-2 mb-3 relative z-10">
                                <CheckCircle className="w-6 h-6 text-emerald-400 animate-bounce" />
                                <span className="text-emerald-300 font-mono text-lg font-bold">{t.labComplete}</span>
                                <CheckCircle className="w-6 h-6 text-emerald-400 animate-bounce" />
                            </div>
                            <p className="text-slate-400 text-sm mb-4 relative z-10">{t.labCompleteDesc}</p>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-black font-medium rounded-lg inline-flex items-center gap-2"
                            >
                                {t.nextStep}
                                <ArrowRight className="w-4 h-4" />
                            </motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>
                <BobChatWidget mode="floating" context="taxes" lang={lang} />
            </div>
        </div>
    );
}
