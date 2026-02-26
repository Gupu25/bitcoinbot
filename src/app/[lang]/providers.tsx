'use client';

import { ReactNode, useEffect, useState, createContext, useContext, ReactElement } from 'react';

// ============================================================================
// THEME CONTEXT - Para look cypherpunk consistente
// ============================================================================
type Theme = 'dark' | 'light' | 'system';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    resolvedTheme: 'dark' | 'light';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) throw new Error('useTheme must be used within ThemeProvider');
    return context;
}

// ============================================================================
// ERROR BOUNDARY - Protección contra crashes
// ============================================================================
interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactElement;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error?: Error;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('ErrorBoundary caught:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback || (
                <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-orange-500 mb-2">System Error</h2>
                        <p className="text-slate-400 font-mono text-sm">
                            Digital immune system activated. Please refresh.
                        </p>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

// Import React para ErrorBoundary
import React from 'react';

// ============================================================================
// SMOOTH SCROLL PROVIDER
// ============================================================================
function SmoothScrollProvider({ children }: { children: ReactNode }) {
    useEffect(() => {
        // Smooth scroll para anchor links
        const handleAnchorClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const anchor = target.closest('a[href^="#"]');
            if (anchor) {
                e.preventDefault();
                const id = anchor.getAttribute('href')?.slice(1);
                const element = document.getElementById(id || '');
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        };

        document.addEventListener('click', handleAnchorClick);
        return () => document.removeEventListener('click', handleAnchorClick);
    }, []);

    return <>{children}</>;
}

// ============================================================================
// HYDRATION SAFE PROVIDER - Mejor estrategia
// ============================================================================
function HydrationSafeProvider({ children }: { children: ReactNode }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // 🐱 FIX #1: Estrategia más elegante - renderiza siempre pero previene interacción hasta hidratación
    return (
        <div
            className={mounted ? 'hydrated' : 'hydrating'}
            style={!mounted ? {
                // 🐱 FIX #2: pointerEvents none previene clicks antes de hidratación
                pointerEvents: 'none',
                // 🐱 FIX #3: Opacity sutil en vez de visibility:hidden (mejor para perceived performance)
                opacity: 0.99
            } : undefined}
        >
            {children}
        </div>
    );
}

// ============================================================================
// THEME PROVIDER IMPLEMENTATION
// ============================================================================
function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setTheme] = useState<Theme>('dark');
    const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'light'>('dark');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);

        // Detectar preferencia guardada o del sistema
        const saved = localStorage.getItem('theme') as Theme | null;
        if (saved) {
            setTheme(saved);
        } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
            setTheme('system');
        }
    }, []);

    useEffect(() => {
        if (!mounted) return;

        const root = window.document.documentElement;
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        const resolved = theme === 'system' ? systemTheme : theme;

        setResolvedTheme(resolved);
        root.classList.remove('light', 'dark');
        root.classList.add(resolved);

        localStorage.setItem('theme', theme);
    }, [theme, mounted]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

// ============================================================================
// MAIN PROVIDERS COMPONENT
// ============================================================================
export function Providers({ children }: { children: ReactNode }) {
    return (
        <ErrorBoundary>
            <ThemeProvider>
                <HydrationSafeProvider>
                    <SmoothScrollProvider>
                        {children}
                    </SmoothScrollProvider>
                </HydrationSafeProvider>
            </ThemeProvider>
        </ErrorBoundary>
    );
}