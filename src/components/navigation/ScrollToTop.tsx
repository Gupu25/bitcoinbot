'use client';

import { useEffect } from 'react';

/**
 * ScrollToTop
 * Forces scroll to hero on load. Runs immediately and with delays to win
 * over any scroll triggered by hydration (focus, scrollIntoView, etc).
 */
export function ScrollToTop() {
    const resetScroll = () => {
        if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
        }
        if (window.location.hash) {
            window.history.replaceState(null, '', window.location.pathname + window.location.search);
        }
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    };

    useEffect(() => {
        resetScroll();
        // Retry after hydration: other components may scroll during their effects
        const t1 = setTimeout(resetScroll, 100);
        const t2 = setTimeout(resetScroll, 400);
        window.addEventListener('pageshow', resetScroll);
        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            window.removeEventListener('pageshow', resetScroll);
        };
    }, []);

    return null;
}
