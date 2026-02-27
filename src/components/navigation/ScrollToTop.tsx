'use client';

import { useEffect } from 'react';

/**
 * ScrollToTop
 * Renders nothing — side-effect only component.
 * Forces scroll position to the top on every page load and disables
 * the browser's native scroll restoration so landing always starts at hero.
 */
export function ScrollToTop() {
    useEffect(() => {
        // FIX #1: Disable browser scroll restoration FIRST to prevent race condition
        if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
        }

        // FIX #2: Force scroll to top (handles both standard and iOS momentum scroll)
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

        // FIX #3: Strip any hash fragment from URL so deep-link anchors don't offset the page
        if (window.location.hash) {
            window.history.replaceState(
                null,
                '',
                window.location.pathname + window.location.search
            );
        }
    }, []);

    return null;
}
