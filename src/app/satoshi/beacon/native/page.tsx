'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TerminalWindow } from '@/components/terminal/TerminalWindow';

export default function NativeBeaconPage() {
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        setLoaded(true);
    }, []);

    if (!loaded) return <div style={{ color: 'white' }}>Loading...</div>;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ padding: 40, color: 'white', background: '#0a0a0a', minHeight: '100vh' }}
        >
            <h1>Native Coinbin Beacon</h1>
            <TerminalWindow title="test">
                <p>Si ves esto dentro de la ventana, TerminalWindow funciona.</p>
            </TerminalWindow>
        </motion.div>
    );
}