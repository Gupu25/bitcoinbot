'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

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
            <p>Con framer-motion</p>
        </motion.div>
    );
}