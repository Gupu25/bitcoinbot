'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Info, Shield, Zap, Terminal, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface HiddenMenuProps {
    lang: 'en' | 'es';
}

const translations = {
    en: {
        about: 'About Us',
        adminZone: 'Admin Zone',
        immuneDashboard: 'Immune Dashboard',
        nativeBeacon: 'Native Beacon',
        challengeZone: 'Challenge Zone',
        secured: '🔐 Secured Connection',
        version: 'v2.0.1 • Secure Mode',
        close: 'Close menu',
        open: 'Open menu',
    },
    es: {
        about: 'Sobre Nosotros',
        adminZone: 'Zona Admin',
        immuneDashboard: 'Panel Inmune',
        nativeBeacon: 'Beacon Nativo',
        challengeZone: 'Zona de Desafío',
        secured: '🔐 Conexión Segura',
        version: 'v2.0.1 • Modo Seguro',
        close: 'Cerrar menú',
        open: 'Abrir menú',
    }
};

export function HiddenMenu({ lang }: HiddenMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [reducedMotion, setReducedMotion] = useState(false);
    const router = useRouter();
    const t = translations[lang];

    // 🐱 FIX #1: Detectar reduced motion para accesibilidad
    useEffect(() => {
        setMounted(true);
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        setReducedMotion(mediaQuery.matches);

        const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
    }, []);

    // 🐱 FIX #2: Prevenir scroll con padding-right compensación (evita layout shift)
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

        // Compensar scrollbar para evitar layout shift
        document.body.style.paddingRight = `${scrollbarWidth}px`;
        document.body.style.overflow = 'hidden';

        // 🐱 FIX #3: Prevenir scroll en iOS (necesita position: fixed)
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
        // 🐱 FIX #4: Pequeño delay para que cierre la animación antes de navegar
        setTimeout(() => router.push(path), 150);
    };

    // 🐱 FIX #5: Abrir en nueva pestaña (Ctrl/Cmd + click)
    const handleAdminAuxClick = (e: React.MouseEvent, path: string) => {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            window.open(path, '_blank');
            setIsOpen(false);
        }
    };

    if (!mounted) {
        // 🐱 FIX #6: Placeholder SSR-friendly para evitar hydration mismatch
        return (
            <div
                className="fixed top-[calc(1rem+env(safe-area-inset-top))] right-4 w-11 h-11 rounded-full bg-black/80 border border-orange-500/30"
                aria-hidden="true"
            />
        );
    }

    const transitionConfig = reducedMotion
        ? { duration: 0 }
        : { type: 'spring', damping: 25, stiffness: 200 };

    return (
        <>
            {/* 🐱 FIX #7: Botón con safe-area-inset y tamaño táctil óptimo */}
            <motion.button
                initial={reducedMotion ? {} : { opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={reducedMotion ? {} : { delay: 0.5, type: 'spring' }}
                onClick={() => setIsOpen(!isOpen)}
                className="fixed z-50 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/90 border border-[#f7931a]/40 
                   flex items-center justify-center text-[#f7931a] 
                   hover:text-white hover:border-[#f7931a] hover:bg-[#f7931a] 
                   transition-colors shadow-lg shadow-black/50
                   active:scale-95 touch-manipulation"
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

            {/* 🐱 FIX #8: Overlay con z-index moderado */}
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

            {/* 🐱 FIX #9: Panel con safe areas y ancho responsive */}
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
                        aria-label="Administration menu"
                    >
                        {/* Header */}
                        <div className="flex-shrink-0 p-5 sm:p-6 border-b border-slate-800">
                            <h3 className="text-base sm:text-lg font-bold text-[#f7931a] font-mono">
                                Bitcoin Agent
                            </h3>
                            <p className="text-[10px] sm:text-xs text-slate-500 mt-1 font-mono">
                                {t.version}
                            </p>
                        </div>

                        {/* 🐱 FIX #10: Scrollable content con flex-1 */}
                        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
                            {/* Links públicos */}
                            <div className="mb-6 sm:mb-8">
                                <Link
                                    href={`/${lang}/about`}
                                    className="flex items-center gap-3 px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl 
                           text-slate-300 hover:text-[#f7931a] hover:bg-slate-900 
                           transition-colors active:scale-[0.98]"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <Info className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" aria-hidden="true" />
                                    <span className="font-mono text-sm">{t.about}</span>
                                </Link>
                            </div>

                            {/* Admin Zone */}
                            <div>
                                <p className="text-[10px] sm:text-xs text-slate-600 uppercase tracking-wider mb-2 sm:mb-3 px-3 sm:px-4 font-mono">
                                    {t.adminZone}
                                </p>
                                <nav className="space-y-1" aria-label="Admin navigation">
                                    {[
                                        { title: t.immuneDashboard, path: '/satoshi/immune-dashboard', icon: Shield },
                                        { title: t.nativeBeacon, path: '/satoshi/beacon/native', icon: Zap },
                                        { title: t.challengeZone, path: '/challenge/pow', icon: Terminal },
                                    ].map((item) => (
                                        <button
                                            key={item.title}
                                            onClick={(e) => handleAdminClick(item.path)}
                                            onAuxClick={(e) => handleAdminAuxClick(e, item.path)}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl 
                               text-slate-400 hover:text-[#f7931a] hover:bg-slate-900 
                               transition-colors text-left group
                               active:scale-[0.98]"
                                            title={`${item.title} (Ctrl+Click to open in new tab)`}
                                        >
                                            <item.icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 group-hover:scale-110 transition-transform" aria-hidden="true" />
                                            <span className="font-mono text-xs sm:text-sm">{item.title}</span>
                                            <ExternalLink className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-50" aria-hidden="true" />
                                        </button>
                                    ))}
                                </nav>
                            </div>
                        </div>

                        {/* 🐱 FIX #11: Footer que respeta safe-area */}
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