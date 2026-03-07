'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Menu, X, Info, Zap, Terminal, TreeDeciduous, Key,
    Fingerprint, ExternalLink, GraduationCap, Cpu,
    FileText, Star, Lock, Home
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

interface HiddenMenuProps {
    lang: 'en' | 'es';
    dict?: {
        home: string;
        about: string;
        labSection: string;
        labs: {
            seedLab: string;
            seedLabDesc: string;
            merkleLab: string;
            merkleLabDesc: string;
            miningLab: string;
            miningLabDesc: string;
            signingLab: string;
            signingLabDesc: string;
            taxesLab: string;
            taxesLabDesc: string;
        };
        difficulty: {
            beginner: string;
            intermediate: string;
            advanced: string;
        };
        secured: string;
        version: string;
        close: string;
        open: string;
        recommended: string;
    };
}

// 🐱 Fallback translations if dict not provided
const fallbackTranslations = {
    en: {
        home: 'Home',
        about: 'About Us',
        labSection: 'Labs',
        labs: {
            seedLab: 'Seed Phrase Lab',
            seedLabDesc: 'Your keys, your coins',
            merkleLab: 'Merkle Tree Lab',
            merkleLabDesc: 'How Bitcoin verifies transactions',
            miningLab: 'Mining Simulator',
            miningLabDesc: 'Proof-of-Work in action',
            signingLab: 'Signing Lab',
            signingLabDesc: 'ECDSA vs Schnorr signatures',
            taxesLab: 'Taxes Lab',
            taxesLabDesc: 'Bitcoin & tax implications',
        },
        difficulty: {
            beginner: 'Beginner',
            intermediate: 'Intermediate',
            advanced: 'Advanced',
        },
        secured: '🔐 Secured Connection',
        version: 'v2.0.1 • Hackatón MX',
        close: 'Close menu',
        open: 'Open menu',
        recommended: '⭐ Recommended first',
    },
    es: {
        home: 'Inicio',
        about: 'Sobre Nosotros',
        labSection: 'Laboratorios',
        labs: {
            seedLab: 'Lab Frase Semilla',
            seedLabDesc: 'Tus llaves, tus bitcoins',
            merkleLab: 'Lab Árboles Merkle',
            merkleLabDesc: 'Cómo Bitcoin verifica transacciones',
            miningLab: 'Simulador de Minería',
            miningLabDesc: 'Proof-of-Work en acción',
            signingLab: 'Lab de Firmas',
            signingLabDesc: 'Firmas ECDSA vs Schnorr',
            taxesLab: 'Lab de Impuestos',
            taxesLabDesc: 'Bitcoin e impuestos en México',
        },
        difficulty: {
            beginner: 'Principiante',
            intermediate: 'Intermedio',
            advanced: 'Avanzado',
        },
        secured: '🔐 Conexión Segura',
        version: 'v2.0.1 • Hackatón MX',
        close: 'Cerrar menú',
        open: 'Abrir menú',
        recommended: '⭐ Recomendado primero',
    },
};

// 🎓 Lab difficulty levels & ordering
type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

interface LabItem {
    title: string;
    description: string;
    path: string;
    icon: React.ElementType;
    difficulty: DifficultyLevel;
    recommended?: boolean;
}

export function HiddenMenu({ lang, dict }: HiddenMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [reducedMotion, setReducedMotion] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    const t = dict || fallbackTranslations[lang];

    useEffect(() => {
        setMounted(true);
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        setReducedMotion(mediaQuery.matches);
        const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
    }, []);

    useEffect(() => {
        if (!isOpen) return;
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        const originalStyle = {
            overflow: document.body.style.overflow,
            paddingRight: document.body.style.paddingRight,
            position: document.body.style.position,
            width: document.body.style.width,
            top: document.body.style.top,
        };
        document.body.style.paddingRight = `${scrollbarWidth}px`;
        document.body.style.overflow = 'hidden';
        if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
            const scrollY = window.scrollY;
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
            document.body.style.top = `-${scrollY}px`;
        }
        return () => {
            const scrollY = parseInt(document.body.style.top || '0') * -1;
            Object.assign(document.body.style, originalStyle);
            if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
                window.scrollTo(0, scrollY);
            }
        };
    }, [isOpen]);

    const handleAdminClick = (path: string) => {
        setIsOpen(false);
        const fullPath = `/${lang}${path}`;
        setTimeout(() => router.push(fullPath), 150);
    };

    const handleAdminAuxClick = (e: React.MouseEvent, path: string) => {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            const fullPath = `/${lang}${path}`;
            window.open(fullPath, '_blank');
            setIsOpen(false);
        }
    };

    if (!mounted) {
        return (
            <div
                className="fixed top-[calc(1rem+env(safe-area-inset-top))] right-4 w-11 h-11 rounded-full bg-black/80 border border-orange-500/30"
                aria-hidden="true"
            />
        );
    }

    const transitionConfig = reducedMotion ? { duration: 0 } : { type: 'spring', damping: 25, stiffness: 200 };

    // 🎓 Labs ordenados por dificultad (Noob → Advanced)
    const menuItems: LabItem[] = [
        {
            title: t.labs.seedLab,
            description: t.labs.seedLabDesc,
            path: '/satoshi/seed-lab',
            icon: Fingerprint,
            difficulty: 'beginner',
            recommended: true, // 🌱 Start here!
        },
        {
            title: t.labs.merkleLab,
            description: t.labs.merkleLabDesc,
            path: '/satoshi/merkle-lab',
            icon: TreeDeciduous,
            difficulty: 'beginner',
        },
        {
            title: t.labs.miningLab,
            description: t.labs.miningLabDesc,
            path: '/satoshi/mining-lab',
            icon: Cpu,
            difficulty: 'intermediate',
        },
        {
            title: t.labs.signingLab,
            description: t.labs.signingLabDesc,
            path: '/satoshi/signing-lab',
            icon: Key,
            difficulty: 'intermediate',
        },
        {
            title: t.labs.taxesLab,
            description: t.labs.taxesLabDesc,
            path: '/satoshi/taxes-lab',
            icon: FileText,
            difficulty: 'advanced',
        },
    ];

    // 🎨 Difficulty badge colors
    const difficultyStyles = {
        beginner: {
            badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
            dot: 'bg-emerald-500',
            label: t.difficulty.beginner,
        },
        intermediate: {
            badge: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
            dot: 'bg-amber-500',
            label: t.difficulty.intermediate,
        },
        advanced: {
            badge: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
            dot: 'bg-rose-500',
            label: t.difficulty.advanced,
        },
    };

    return (
        <>
            {/* Hamburger Button */}
            <motion.button
                initial={reducedMotion ? {} : { opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={reducedMotion ? {} : { delay: 0.5, type: 'spring' }}
                onClick={() => setIsOpen(!isOpen)}
                className="fixed z-50 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/90 border border-[#f7931a]/40 
           flex items-center justify-center text-[#f7931a] 
           hover:text-white hover:border-[#f7931a] hover:bg-[#f7931a] 
           transition-colors shadow-lg shadow-black/50 active:scale-95 touch-manipulation"
                style={{
                    top: 'calc(0.75rem + env(safe-area-inset-top))',
                    right: 'calc(0.75rem + env(safe-area-inset-right))',
                }}
                aria-label={isOpen ? t.close : t.open}
                aria-expanded={isOpen}
                aria-controls="hidden-menu-panel"
            >
                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <motion.div
                            key="close"
                            initial={reducedMotion ? {} : { rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={reducedMotion ? {} : { rotate: 90, opacity: 0 }}
                            transition={{ duration: reducedMotion ? 0 : 0.2 }}
                        >
                            <X className="w-5 h-5" aria-hidden="true" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="menu"
                            initial={reducedMotion ? {} : { rotate: 90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={reducedMotion ? {} : { rotate: -90, opacity: 0 }}
                            transition={{ duration: reducedMotion ? 0 : 0.2 }}
                        >
                            <Menu className="w-5 h-5" aria-hidden="true" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.button>

            {/* Backdrop */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: reducedMotion ? 0 : 0.2 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                        aria-hidden="true"
                    />
                )}
            </AnimatePresence>

            {/* Menu Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        id="hidden-menu-panel"
                        initial={reducedMotion ? {} : { opacity: 0, x: '100%' }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={reducedMotion ? {} : { opacity: 0, x: '100%' }}
                        transition={transitionConfig}
                        className="fixed top-0 right-0 bottom-0 w-[min(85vw,320px)] sm:w-80 
             bg-slate-950 border-l border-[#f7931a]/20 z-50 shadow-2xl
             flex flex-col"
                        style={{
                            paddingTop: 'env(safe-area-inset-top)',
                            paddingBottom: 'env(safe-area-inset-bottom)',
                            paddingRight: 'env(safe-area-inset-right)',
                        }}
                        role="dialog"
                        aria-modal="true"
                        aria-label="Navigation menu"
                    >
                        {/* Header */}
                        <div className="flex-shrink-0 p-5 sm:p-6 border-b border-slate-800">
                            <div className="flex items-center gap-2 mb-1">
                                <GraduationCap className="w-4 h-4 text-[#f7931a]" />
                                <h3 className="text-base sm:text-lg font-bold text-[#f7931a] font-mono">
                                    Bitcoin Agent
                                </h3>
                            </div>
                            <p className="text-[10px] sm:text-xs text-slate-500 font-mono">
                                {t.version}
                            </p>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
                            {/* Home Link */}
                            <div className="mb-3">
                                <Link
                                    href={`/${lang}`}
                                    className={`flex items-center gap-3 px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl 
                   transition-colors active:scale-[0.98] border
                   ${pathname === `/${lang}` || pathname === `/${lang}/`
                                        ? 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20'
                                        : 'border-transparent text-slate-300 hover:text-[#f7931a] hover:bg-slate-900'}`}
                                    onClick={() => setIsOpen(false)}
                                >
                                    <Home className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" aria-hidden="true" />
                                    <span className="font-mono text-sm">{t.home}</span>
                                </Link>
                            </div>

                            {/* About Link */}
                            <div className="mb-6 sm:mb-8">
                                <Link
                                    href={`/${lang}/about`}
                                    className={`flex items-center gap-3 px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl 
                   transition-colors active:scale-[0.98] border
                   ${pathname?.startsWith(`/${lang}/about`)
                                        ? 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20'
                                        : 'border-transparent text-slate-300 hover:text-[#f7931a] hover:bg-slate-900'}`}
                                    onClick={() => setIsOpen(false)}
                                >
                                    <Info className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" aria-hidden="true" />
                                    <span className="font-mono text-sm">{t.about}</span>
                                </Link>
                            </div>

                            {/* Labs Section with Difficulty Path */}
                            <div>
                                <div className="flex items-center justify-between mb-3 px-3 sm:px-4">
                                    <p className="text-[10px] sm:text-xs text-slate-600 uppercase tracking-wider font-mono">
                                        {t.labSection}
                                    </p>
                                    <span className="text-[10px] text-slate-700 font-mono">
                                        🌱 → 🔥
                                    </span>
                                </div>

                                <nav className="space-y-2" aria-label="Lab navigation">
                                    {menuItems.map((item, index) => {
                                        const style = difficultyStyles[item.difficulty];
                                        const Icon = item.icon;
                                        const fullPath = `/${lang}${item.path}`;
                                        const isActive = pathname === fullPath || pathname?.startsWith(`${fullPath}/`);

                                        return (
                                            <motion.button
                                                key={item.title}
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                onClick={(e) => handleAdminClick(item.path)}
                                                onAuxClick={(e) => handleAdminAuxClick(e, item.path)}
                                                className={`w-full flex items-start gap-3 px-3 py-3 rounded-xl 
                           text-slate-400 hover:text-[#f7931a] hover:bg-slate-900 
                           transition-colors text-left group active:scale-[0.98]
                           border border-transparent hover:border-[#f7931a]/20
                           ${isActive ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-300' : ''}`}
                                                title={`${item.title} (Ctrl+Click to open in new tab)`}
                                            >
                                                {/* Difficulty dot */}
                                                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${style.dot}`} />

                                                {/* Icon */}
                                                <div className={`p-2 rounded-lg flex-shrink-0 
                            ${isActive ? 'bg-emerald-500/20' : 'bg-slate-900'}
                            group-hover:bg-slate-800 transition-colors`}>
                                                    <Icon className={`w-4 h-4 sm:w-5 sm:h-5 
                            ${isActive ? 'text-emerald-400' : 'text-slate-500 group-hover:text-[#f7931a]'} 
                            transition-colors`}
                                                        aria-hidden="true"
                                                    />
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className={`font-mono text-xs sm:text-sm ${isActive ? 'text-emerald-300 font-semibold' : ''}`}>
                                                            {item.title}
                                                        </span>
                                                        {item.recommended && !isActive && (
                                                            <span className="text-[10px] text-emerald-400">⭐</span>
                                                        )}
                                                    </div>
                                                    <p className="text-[10px] text-slate-600 mt-0.5 line-clamp-1">
                                                        {item.description}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-1.5">
                                                        <span className={`text-[9px] px-1.5 py-0.5 rounded border ${style.badge}`}>
                                                            {style.label}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* External link icon */}
                                                <ExternalLink className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-50 flex-shrink-0 mt-1"
                                                    aria-hidden="true"
                                                />
                                            </motion.button>
                                        );
                                    })}
                                </nav>
                            </div>

                            {/* Developer Tools */}
                            <div className="mb-6">
                                <p className="text-[10px] sm:text-xs text-slate-600 uppercase tracking-wider mb-2 sm:mb-3 px-3 sm:px-4 font-mono">
                                    {t.adminZone}
                                </p>
                                <nav className="space-y-1">
                                    {devItems.map((item) => (
                                        <button
                                            key={item.title}
                                            onClick={(e) => handleAdminClick(item.path)}
                                            onAuxClick={(e) => handleAdminAuxClick(e, item.path)}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl 
                               text-slate-400 hover:text-[#f7931a] hover:bg-slate-900 
                               transition-colors text-left group active:scale-[0.98]"
                                            title={`${item.title} (Ctrl+Click to open in new tab)`}
                                        >
                                            <item.icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 group-hover:scale-110 transition-transform" aria-hidden="true" />
                                            <span className="font-mono text-xs sm:text-sm">{item.title}</span>
                                            <ExternalLink className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-50" aria-hidden="true" />
                                        </button>
                                    ))}
                                </nav>
                            </div>

                            {/* Admin Section */}
                            <div>
                                <p className="text-[10px] sm:text-xs text-red-500/80 uppercase tracking-wider mb-2 sm:mb-3 px-3 sm:px-4 font-mono">
                                    {t.complianceZone}
                                </p>
                                <nav className="space-y-1">
                                    {adminItems.map((item) => (
                                        <button
                                            key={item.title}
                                            onClick={(e) => handleAdminClick(item.path)}
                                            onAuxClick={(e) => handleAdminAuxClick(e, item.path)}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl 
                               text-slate-400 hover:text-red-400 hover:bg-slate-900 
                               transition-colors text-left group active:scale-[0.98]
                               border border-red-500/20"
                                            title={`${item.title} (Ctrl+Click to open in new tab)`}
                                        >
                                            <item.icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 group-hover:scale-110 transition-transform text-red-400/70" aria-hidden="true" />
                                            <span className="font-mono text-xs sm:text-sm">{item.title}</span>
                                            <ExternalLink className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-50" aria-hidden="true" />
                                        </button>
                                    ))}
                                </nav>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex-shrink-0 p-4 sm:p-6 border-t border-slate-800 bg-slate-950/50">
                            <p className="text-[10px] sm:text-xs text-slate-600 text-center font-mono">
                                {t.secured}
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}