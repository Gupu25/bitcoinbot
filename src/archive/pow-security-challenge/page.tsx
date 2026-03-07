'use client';

/**
 * Proof-of-Work Challenge Page - Educational Edition
 * Bitcoin Agent Digital Immune System
 * 
 * Concept: Learn by Doing - Users experience real mining
 * Philosophy: "Feel the hash, own the knowledge"
 * 
 * Educational Goals:
 * - Visualize what mining actually IS
 * - Show hash rate in human terms
 * - Explain difficulty intuitively
 * - Make cryptography feel magical, not scary
 */

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import { TerminalWindow } from '@/components/terminal/TerminalWindow';

interface MiningStats {
    attempts: number;
    startTime: number;
    currentHashrate: number;
    bestDifficulty: number;
}

interface MiningResult {
    nonce: number;
    hash: string;
    attempts: number;
    timeElapsed: number;
}

type BypassReason = 'human-declared' | 'accessibility' | 'mobile-limitation' | 'urgency';

// Educational content for tooltips
const EDUCATION = {
    hash: {
        title: "What's a Hash? 🔐",
        description: "Think of it like a digital fingerprint! Every unique input creates a unique jumbled code. Change one letter, and the whole fingerprint changes completely!",
        emoji: "🖐️",
    },
    difficulty: {
        title: "Mining Difficulty ⛏️",
        description: "Finding a hash that starts with zeros is like finding a coin with a specific serial number. More zeros = harder to find = takes more guesses!",
        emoji: "🎯",
    },
    hashrate: {
        title: "Hash Rate ⚡",
        description: "How many guesses your phone makes per second. A higher number means your device is working harder (and faster!) to solve the puzzle.",
        emoji: "🏃‍♀️",
    },
    nonce: {
        title: "The Nonce 🔢",
        description: "Short for 'Number Used Once.' It's your guess! Keep changing this number until the hash looks right. Miners do this billions of times!",
        emoji: "🎲",
    },
};

function PoWChallengeContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Get params from URL
    const difficulty = parseInt(searchParams.get('difficulty') || '2', 10);
    const returnTo = searchParams.get('returnTo') || '/';
    const challengeId = searchParams.get('challengeId') || crypto.randomUUID();

    // Mining state
    const [isMining, setIsMining] = useState(false);
    const [result, setResult] = useState<MiningResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [verifying, setVerifying] = useState(false);
    const [showNormieOptions, setShowNormieOptions] = useState(false);
    const [bypassWarning, setBypassWarning] = useState<string | null>(null);
    const [pageLoadTime] = useState(Date.now());
    const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

    // Stats
    const [stats, setStats] = useState<MiningStats>({
        attempts: 0,
        startTime: 0,
        currentHashrate: 0,
        bestDifficulty: 0,
    });

    // Refs for mining control
    const abortRef = useRef(false);
    const workerRef = useRef<Worker | null>(null);
    const mouseMovementsRef = useRef(0);

    const targetZeros = Array(difficulty + 1).join('0');
    const targetPrefix = targetZeros.substring(0, difficulty);

    /**
     * Count leading zeros in hash for difficulty display
     */
    const countLeadingZeros = (hashArray: Uint8Array): number => {
        let zeros = 0;
        for (let i = 0; i < hashArray.length; i++) {
            const byte = hashArray[i];
            if (byte === 0) {
                zeros += 2;
            } else {
                if (byte < 16) zeros += 1;
                break;
            }
        }
        return zeros;
    };

    /**
     * Fallback mining (main thread - blocks UI slightly)
     */
    const mineFallback = useCallback(async () => {
        let nonce = 0;
        const startTime = Date.now();
        const batchSize = 100;

        const mineBatch = async () => {
            for (let i = 0; i < batchSize; i++) {
                if (abortRef.current) return;

                const message = challengeId + nonce;
                const hashBuffer = await crypto.subtle.digest('SHA-256',
                    new TextEncoder().encode(message)
                );
                const hashHex = Array.from(new Uint8Array(hashBuffer))
                    .map(b => b.toString(16).padStart(2, '0'))
                    .join('');

                if (hashHex.startsWith(targetPrefix)) {
                    setResult({
                        nonce,
                        hash: hashHex,
                        attempts: nonce + 1,
                        timeElapsed: Date.now() - startTime,
                    });
                    setIsMining(false);
                    return;
                }

                nonce++;
            }

            const elapsed = Date.now() - startTime;
            const currentHashBuffer = await crypto.subtle.digest('SHA-256',
                new TextEncoder().encode(challengeId + (nonce - 1))
            );

            setStats({
                attempts: nonce,
                startTime,
                currentHashrate: Math.floor(nonce / (elapsed / 1000)),
                bestDifficulty: countLeadingZeros(new Uint8Array(currentHashBuffer)),
            });

            setTimeout(mineBatch, 0);
        };

        mineBatch();
    }, [challengeId, targetPrefix]);

    /**
     * SHA-256 mining worker
     */
    const startMining = useCallback(() => {
        if (isMining || result) return;

        setIsMining(true);
        setError(null);
        abortRef.current = false;

        const startTime = Date.now();
        setStats(prev => ({ ...prev, startTime, attempts: 0 }));

        if (typeof window !== 'undefined' && window.Worker) {
            const workerCode = `
        self.onmessage = async function(e) {
          const { challengeId, targetPrefix, difficulty } = e.data;
          let nonce = 0;
          const startTime = Date.now();
          
          while (true) {
            if (nonce % 1000 === 0) {
              self.postMessage({ type: 'progress', nonce, elapsed: Date.now() - startTime });
            }
            
            const message = challengeId + nonce;
            const encoder = new TextEncoder();
            const data = encoder.encode(message);
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            
            if (hashHex.startsWith(targetPrefix)) {
              self.postMessage({ 
                type: 'success', 
                nonce, 
                hash: hashHex,
                attempts: nonce + 1,
                timeElapsed: Date.now() - startTime
              });
              return;
            }
            
            nonce++;
          }
        };
      `;

            const blob = new Blob([workerCode], { type: 'application/javascript' });
            workerRef.current = new Worker(URL.createObjectURL(blob));

            workerRef.current.onmessage = (e) => {
                const { type } = e.data;

                if (type === 'progress') {
                    const { nonce, elapsed } = e.data;
                    const hashrate = nonce / (elapsed / 1000);
                    setStats(prev => ({
                        ...prev,
                        attempts: nonce,
                        currentHashrate: Math.floor(hashrate),
                    }));
                }

                if (type === 'success') {
                    const { nonce, hash, attempts, timeElapsed } = e.data;
                    setResult({ nonce, hash, attempts, timeElapsed });
                    setIsMining(false);
                    workerRef.current?.terminate();
                }
            };

            workerRef.current.postMessage({ challengeId, targetPrefix, difficulty });
        } else {
            mineFallback();
        }
    }, [challengeId, difficulty, targetPrefix, isMining, result, mineFallback]);

    /**
     * Verify solution with backend
     */
    const verifySolution = async () => {
        if (!result) return;

        setVerifying(true);
        setError(null);

        try {
            const response = await fetch('/api/challenge/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    challengeId,
                    nonce: result.nonce,
                    hash: result.hash,
                    difficulty,
                }),
            });

            const data = await response.json();

            if (response.ok && data.valid) {
                router.push(returnTo);
            } else {
                setError(data.message || 'Verification failed. Try again.');
                setResult(null);
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setVerifying(false);
        }
    };

    /**
     * Cancel mining and go back
     */
    const handleCancel = () => {
        abortRef.current = true;
        workerRef.current?.terminate();
        setIsMining(false);
        router.back();
    };

    /**
     * Human bypass (with interaction scoring)
     */
    const handleNormieBypass = async (reason: BypassReason) => {
        setVerifying(true);
        setError(null);

        const interactionData = {
            timeOnPage: Date.now() - pageLoadTime,
            mouseMovements: mouseMovementsRef.current,
        };

        try {
            const response = await fetch('/api/challenge/bypass', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    challengeId,
                    reason,
                    timestamp: Date.now(),
                    userAgent: navigator.userAgent,
                    interactionData,
                }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                if (data.warning) {
                    setBypassWarning(data.warning);
                    setTimeout(() => router.push(returnTo), 2000);
                } else {
                    router.push(returnTo);
                }
            } else {
                setError(data.message || 'Bypass failed. Please try mining.');
                setVerifying(false);
            }
        } catch (err) {
            setError('Network error. Please try mining instead.');
            setVerifying(false);
        }
    };

    // Track interactions for trust scoring
    useEffect(() => {
        const handleMouseMove = () => {
            mouseMovementsRef.current += 1;
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => {
            abortRef.current = true;
            workerRef.current?.terminate();
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    const timeElapsed = stats.startTime
        ? Math.floor((Date.now() - stats.startTime) / 1000)
        : 0;

    // Helper to format hashrate in human terms
    const getHashrateDescription = (rate: number) => {
        if (rate === 0) return "Ready to start";
        if (rate < 1000) return "Gentle pace 🐢";
        if (rate < 5000) return "Good speed! 🐇";
        if (rate < 10000) return "Fast! 🚀";
        return "Lightning! ⚡⚡⚡";
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-3 sm:p-4 font-mono">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-2xl"
            >
                <TerminalWindow
                    title="bitcoin-agent :: proof-of-work-challenge"
                    className="border-[#F7931A]"
                >
                    {/* Header - Friendly & Educational */}
                    <div className="text-center mb-4 sm:mb-6">
                        <motion.div
                            initial={{ y: -20 }}
                            animate={{ y: 0 }}
                            className="inline-block mb-2 px-3 py-1 bg-[#F7931A]/20 rounded-full text-[#F7931A] text-xs sm:text-sm font-bold"
                        >
                            🎓 Learn Bitcoin Mining by Doing
                        </motion.div>
                        
                        <motion.h1
                            className="text-xl sm:text-2xl md:text-3xl font-bold text-[#F7931A] mb-2 leading-tight"
                            animate={{ opacity: [1, 0.8, 1] }}
                            transition={{ duration: 3, repeat: Infinity }}
                        >
                            {isMining ? "⛏️ Mining in Progress..." : result ? "🎉 Block Mined!" : "🔐 Security Check"}
                        </motion.h1>
                        
                        <p className="text-gray-400 text-xs sm:text-sm px-2">
                            {!result && !isMining && "Prove you're human by helping secure the network (just like real Bitcoin miners!)"}
                            {isMining && "Your device is solving a cryptographic puzzle..."}
                            {result && "You found the magic number! This is exactly how Bitcoin mining works."}
                        </p>
                    </div>

                    {/* Educational Challenge Info */}
                    <div className="bg-[#1a1a1a] rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 border border-[#2a2a2a] space-y-3">
                        <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
                            {/* Difficulty with Tooltip */}
                            <div 
                                className="relative cursor-help group"
                                onClick={() => setActiveTooltip(activeTooltip === 'difficulty' ? null : 'difficulty')}
                            >
                                <div className="flex items-center gap-1 text-gray-500 mb-1">
                                    <span>Target</span>
                                    <span className="text-[#F7931A] text-xs">ⓘ</span>
                                </div>
                                <div className="text-[#00ff41] font-mono font-bold truncate">
                                    {targetPrefix}...
                                </div>
                                <div className="text-[10px] text-gray-600 mt-0.5">
                                    Find hash starting with {difficulty} zero{difficulty > 1 ? 's' : ''}
                                </div>
                                
                                {/* Mobile-friendly Tooltip */}
                                <AnimatePresence>
                                    {activeTooltip === 'difficulty' && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 5 }}
                                            className="absolute z-10 left-0 right-0 top-full mt-2 p-3 bg-[#0a0a0a] border border-[#F7931A] rounded-lg shadow-xl"
                                        >
                                            <div className="text-[#F7931A] font-bold text-xs mb-1">
                                                {EDUCATION.difficulty.emoji} {EDUCATION.difficulty.title}
                                            </div>
                                            <div className="text-gray-300 text-xs leading-relaxed">
                                                {EDUCATION.difficulty.description}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Algorithm */}
                            <div>
                                <div className="text-gray-500 mb-1">Algorithm</div>
                                <div className="text-gray-300 font-mono font-bold">SHA-256</div>
                                <div className="text-[10px] text-gray-600 mt-0.5">
                                    Same as Bitcoin!
                                </div>
                            </div>
                        </div>

                        {/* Visual Difficulty Bar */}
                        <div className="pt-2 border-t border-[#2a2a2a]">
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                                <span>Mining Difficulty</span>
                                <span className="text-[#F7931A]">Level {difficulty}</span>
                            </div>
                            <div className="flex gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        className={`h-2 flex-1 rounded-full ${
                                            i < difficulty ? 'bg-[#F7931A]' : 'bg-[#2a2a2a]'
                                        }`}
                                        initial={i < difficulty ? { scale: 0 } : {}}
                                        animate={i < difficulty ? { scale: 1 } : {}}
                                        transition={{ delay: i * 0.1 }}
                                    />
                                ))}
                            </div>
                            <p className="text-[10px] text-gray-600 mt-1.5 text-center">
                                {difficulty === 1 && "Easy mode - Perfect for learning! ☺️"}
                                {difficulty === 2 && "Normal mode - Like early Bitcoin days"}
                                {difficulty === 3 && "Getting serious - Your phone will work!"}
                                {difficulty >= 4 && "Expert mode - This might take a while..."}
                            </p>
                        </div>
                    </div>

                    {/* Mining Visualization */}
                    <div className="mb-4 sm:mb-6">
                        <AnimatePresence mode="wait">
                            {!result ? (
                                <motion.div
                                    key="mining"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="space-y-3 sm:space-y-4"
                                >
                                    {/* Stats Grid - Mobile Optimized */}
                                    <div className="grid grid-cols-3 gap-2 sm:gap-4">
                                        {/* Attempts */}
                                        <div 
                                            className="bg-[#0a0a0a] rounded-lg p-2 sm:p-3 border border-[#2a2a2a] relative cursor-help"
                                            onClick={() => setActiveTooltip(activeTooltip === 'nonce' ? null : 'nonce')}
                                        >
                                            <div className="text-lg sm:text-2xl font-bold text-[#00ff41] truncate">
                                                {stats.attempts.toLocaleString()}
                                            </div>
                                            <div className="text-[10px] sm:text-xs text-gray-500 flex items-center gap-0.5">
                                                Guesses
                                                <span className="text-[#F7931A] text-[10px]">ⓘ</span>
                                            </div>
                                            
                                            {activeTooltip === 'nonce' && (
                                                <motion.div
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    className="absolute inset-0 bg-[#0a0a0a] border border-[#00ff41] rounded-lg p-2 z-10 flex flex-col justify-center"
                                                >
                                                    <div className="text-[10px] text-[#00ff41] font-bold mb-0.5">
                                                        {EDUCATION.nonce.emoji} Nonce
                                                    </div>
                                                    <div className="text-[9px] text-gray-300 leading-tight">
                                                        {EDUCATION.nonce.description}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </div>

                                        {/* Hash Rate */}
                                        <div 
                                            className="bg-[#0a0a0a] rounded-lg p-2 sm:p-3 border border-[#2a2a2a] relative cursor-help"
                                            onClick={() => setActiveTooltip(activeTooltip === 'hashrate' ? null : 'hashrate')}
                                        >
                                            <div className="text-lg sm:text-2xl font-bold text-[#F7931A] truncate">
                                                {stats.currentHashrate > 0 
                                                    ? stats.currentHashrate > 1000 
                                                        ? `${(stats.currentHashrate/1000).toFixed(1)}k` 
                                                        : stats.currentHashrate
                                                    : '0'
                                                }
                                            </div>
                                            <div className="text-[10px] sm:text-xs text-gray-500 flex items-center gap-0.5">
                                                H/s
                                                <span className="text-[#F7931A] text-[10px]">ⓘ</span>
                                            </div>
                                            <div className="text-[8px] sm:text-[10px] text-[#F7931A]/70 mt-0.5 truncate">
                                                {getHashrateDescription(stats.currentHashrate)}
                                            </div>

                                            {activeTooltip === 'hashrate' && (
                                                <motion.div
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    className="absolute inset-0 bg-[#0a0a0a] border border-[#F7931A] rounded-lg p-2 z-10 flex flex-col justify-center"
                                                >
                                                    <div className="text-[10px] text-[#F7931A] font-bold mb-0.5">
                                                        {EDUCATION.hashrate.emoji} Hash Rate
                                                    </div>
                                                    <div className="text-[9px] text-gray-300 leading-tight">
                                                        {EDUCATION.hashrate.description}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </div>

                                        {/* Time */}
                                        <div className="bg-[#0a0a0a] rounded-lg p-2 sm:p-3 border border-[#2a2a2a]">
                                            <div className="text-lg sm:text-2xl font-bold text-[#ffb000]">
                                                {timeElapsed}s
                                            </div>
                                            <div className="text-[10px] sm:text-xs text-gray-500">Time</div>
                                            <div className="text-[8px] sm:text-[10px] text-[#ffb000]/70 mt-0.5 truncate">
                                                {timeElapsed < 5 ? "Just started!" : timeElapsed < 30 ? "Keep going!" : "Hang in there!"}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Live Hash Visualization */}
                                    {isMining && (
                                        <div className="bg-[#0a0a0a] rounded-lg p-3 sm:p-4 border border-[#2a2a2a] overflow-hidden">
                                            <div className="flex items-center gap-2 mb-2">
                                                <motion.div
                                                    animate={{ rotate: 360 }}
                                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                                    className="w-4 h-4 border-2 border-[#F7931A] border-t-transparent rounded-full flex-shrink-0"
                                                />
                                                <span className="text-[#F7931A] text-xs sm:text-sm font-bold">
                                                    Trying random numbers...
                                                </span>
                                            </div>
                                            
                                            {/* Scrolling Hashes */}
                                            <div className="relative h-16 sm:h-20 overflow-hidden rounded bg-black/50 font-mono text-xs">
                                                <motion.div
                                                    animate={{ y: [0, -40] }}
                                                    transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
                                                    className="absolute inset-0 p-2 space-y-1"
                                                >
                                                    {Array(8).fill(0).map((_, i) => {
                                                        const mockHash = Array(64).fill(0).map(() => 
                                                            Math.floor(Math.random() * 16).toString(16)
                                                        ).join('');
                                                        const isTarget = mockHash.startsWith(targetPrefix);
                                                        
                                                        return (
                                                            <div 
                                                                key={i} 
                                                                className={`truncate text-[10px] sm:text-xs ${
                                                                    isTarget ? 'text-[#00ff41] font-bold bg-[#00ff41]/10' : 'text-gray-600'
                                                                }`}
                                                            >
                                                                <span className="text-gray-700 mr-2">#{stats.attempts + i}</span>
                                                                <span className={isTarget ? 'text-[#00ff41]' : 
                                                                    mockHash.startsWith(targetPrefix.slice(0, 1)) ? 'text-yellow-600' : ''
                                                                }>
                                                                    {mockHash.slice(0, 16)}...
                                                                </span>
                                                                {isTarget && <span className="ml-2">✓ MATCH!</span>}
                                                            </div>
                                                        );
                                                    })}
                                                </motion.div>
                                                
                                                {/* Gradient Overlay */}
                                                <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-transparent to-[#0a0a0a] pointer-events-none" />
                                            </div>

                                            {/* Educational Caption */}
                                            <p className="text-[10px] text-gray-500 mt-2 text-center">
                                                Looking for a hash starting with <span className="text-[#00ff41] font-mono">{targetPrefix}</span>
                                                <br className="sm:hidden" />
                                                <span className="hidden sm:inline"> • </span>
                                                Each try is completely random!
                                            </p>
                                        </div>
                                    )}

                                    {/* Action Buttons - Mobile Optimized */}
                                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                                        {!isMining ? (
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={startMining}
                                                className="flex-1 bg-gradient-to-r from-[#F7931A] to-[#ff9f2a] hover:from-[#ff9f2a] hover:to-[#ffb347] text-black font-bold py-3 sm:py-4 px-6 rounded-lg transition-all shadow-lg shadow-[#F7931A]/20 text-sm sm:text-base"
                                            >
                                                <span className="mr-2">⛏️</span>
                                                Start Mining (Learn!)
                                            </motion.button>
                                        ) : (
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => {
                                                    abortRef.current = true;
                                                    workerRef.current?.terminate();
                                                    setIsMining(false);
                                                }}
                                                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 sm:py-4 px-6 rounded-lg transition-colors text-sm sm:text-base"
                                            >
                                                <span className="mr-2">⏹</span>
                                                Stop Mining
                                            </motion.button>
                                        )}

                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={handleCancel}
                                            className="px-6 py-3 sm:py-4 border border-gray-600 text-gray-400 hover:text-white hover:border-gray-400 rounded-lg transition-colors text-sm sm:text-base"
                                        >
                                            Back
                                        </motion.button>
                                    </div>

                                    {/* Quick Tip */}
                                    {!isMining && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.5 }}
                                            className="bg-blue-900/20 border border-blue-800 rounded-lg p-3 text-xs text-blue-300 text-center"
                                        >
                                            💡 <span className="font-bold">Tip:</span> Tap the numbers above to learn what they mean! 
                                            This is exactly how Bitcoin miners secure the network.
                                        </motion.div>
                                    )}
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="success"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-3 sm:space-y-4"
                                >
                                    {/* Success Celebration */}
                                    <div className="bg-[#00ff41]/10 border-2 border-[#00ff41] rounded-lg p-4 sm:p-6 text-center">
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: "spring", stiffness: 200 }}
                                            className="text-4xl sm:text-5xl mb-2"
                                        >
                                            🎉
                                        </motion.div>
                                        <div className="text-[#00ff41] font-bold text-lg sm:text-xl mb-1">
                                            Block Mined Successfully!
                                        </div>
                                        <p className="text-gray-400 text-xs sm:text-sm">
                                            You just experienced real Proof-of-Work!
                                        </p>
                                    </div>

                                    {/* Result Details - Educational */}
                                    <div className="bg-[#1a1a1a] rounded-lg p-3 sm:p-4 border border-[#2a2a2a] space-y-2 text-xs sm:text-sm">
                                        <div className="flex justify-between items-center py-1 border-b border-[#2a2a2a]">
                                            <span className="text-gray-500 flex items-center gap-1">
                                                Winning Number (Nonce)
                                                <span className="text-[#F7931A] text-xs cursor-help" title={EDUCATION.nonce.description}>ⓘ</span>
                                            </span>
                                            <span className="text-[#00ff41] font-mono font-bold">{result.nonce}</span>
                                        </div>
                                        
                                        <div className="py-1 border-b border-[#2a2a2a]">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-gray-500 flex items-center gap-1">
                                                    Valid Hash Found
                                                    <span className="text-[#F7931A] text-xs cursor-help" title={EDUCATION.hash.description}>ⓘ</span>
                                                </span>
                                                <span className="text-[#00ff41] text-xs">✓ Valid</span>
                                            </div>
                                            <div className="font-mono text-[10px] sm:text-xs text-[#00ff41] break-all bg-black/30 p-2 rounded">
                                                <span className="text-[#F7931A] font-bold">{targetPrefix}</span>
                                                {result.hash.slice(difficulty)}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 py-1">
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Total Guesses:</span>
                                                <span className="text-gray-300 font-mono">{result.attempts.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Time:</span>
                                                <span className="text-gray-300 font-mono">{(result.timeElapsed / 1000).toFixed(2)}s</span>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center pt-1">
                                            <span className="text-gray-500">Your Hash Rate:</span>
                                            <span className="text-[#F7931A] font-bold">
                                                {Math.floor(result.attempts / (result.timeElapsed / 1000)).toLocaleString()} H/s
                                            </span>
                                        </div>
                                    </div>

                                    {/* Fun Fact */}
                                    <div className="bg-[#F7931A]/10 border border-[#F7931A]/30 rounded-lg p-3 text-xs text-[#F7931A]">
                                        <span className="font-bold">🧠 Did you know?</span> Real Bitcoin miners do this billions of times per second! 
                                        Your phone just did {result.attempts.toLocaleString()} hashes. The Bitcoin network does 
                                        <span className="font-bold"> 500,000,000,000,000,000,000</span> hashes per second! 🤯
                                    </div>

                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={verifySolution}
                                        disabled={verifying}
                                        className="w-full bg-gradient-to-r from-[#F7931A] to-[#ff9f2a] hover:from-[#ff9f2a] hover:to-[#ffb347] disabled:from-gray-600 disabled:to-gray-700 text-black font-bold py-3 sm:py-4 px-6 rounded-lg transition-all shadow-lg shadow-[#F7931A]/20 text-sm sm:text-base"
                                    >
                                        {verifying ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <motion.div
                                                    animate={{ rotate: 360 }}
                                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                    className="w-4 h-4 border-2 border-black border-t-transparent rounded-full"
                                                />
                                                Verifying...
                                            </span>
                                        ) : (
                                            <span>Continue to Chat →</span>
                                        )}
                                    </motion.button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Error Display */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-red-900/20 border border-red-600 rounded-lg p-3 mb-4 text-red-400 text-xs sm:text-sm"
                        >
                            ⚠️ {error}
                        </motion.div>
                    )}

                    {/* Success/Warning Display */}
                    {bypassWarning && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-yellow-900/20 border border-yellow-600 rounded-lg p-3 mb-4 text-yellow-400 text-xs sm:text-sm"
                        >
                            ⚠️ {bypassWarning}
                        </motion.div>
                    )}

                    {/* Footer - Simplified & Friendly */}
                    <div className="border-t border-[#2a2a2a] pt-4 text-xs text-gray-500 space-y-3">
                        {/* Why This Exists */}
                        <div className="flex items-start gap-2">
                            <span className="text-[#F7931A] text-lg">💡</span>
                            <div>
                                <span className="text-gray-400 font-bold">Why mine instead of CAPTCHA?</span>
                                <p className="mt-0.5 leading-relaxed text-[11px] sm:text-xs">
                                    CAPTCHAs track you across the internet. Mining proves you're human 
                                    through <span className="text-[#F7931A]">work</span>, not surveillance. 
                                    Plus, you learn how Bitcoin actually works! 
                                    <span className="text-[#00ff41]"> Privacy + Education = Win!</span>
                                </p>
                            </div>
                        </div>

                        {/* Human Bypass - Mobile Optimized */}
                        <div className="border-t border-[#2a2a2a] pt-3 text-center">
                            <button
                                onClick={() => setShowNormieOptions(!showNormieOptions)}
                                className="text-[#F7931A] hover:text-[#ff9f2a] text-xs sm:text-sm font-bold transition-colors flex items-center justify-center gap-2 mx-auto w-full py-2"
                            >
                                <span>👤 Can't mine? Skip this step</span>
                                <motion.span
                                    animate={{ rotate: showNormieOptions ? 180 : 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    ▼
                                </motion.span>
                            </button>

                            <AnimatePresence>
                                {showNormieOptions && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mt-2 space-y-2 overflow-hidden"
                                    >
                                        <p className="text-[11px] text-gray-500 mb-2">
                                            No worries! Mining isn't for everyone. Choose your reason:
                                        </p>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {[
                                                { id: 'accessibility', label: '♿ Accessibility', desc: 'Screen reader or motor disability' },
                                                { id: 'mobile-limitation', label: '📱 Old device / Low battery', desc: 'Phone getting too hot or slow' },
                                                { id: 'urgency', label: '⚡ Urgent', desc: 'Need access right now' },
                                                { id: 'human-declared', label: '👤 Just prefer not to', desc: 'Rather skip today' },
                                            ].map((option) => (
                                                <motion.button
                                                    key={option.id}
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => handleNormieBypass(option.id as BypassReason)}
                                                    disabled={verifying}
                                                    className="text-left p-3 rounded-lg bg-[#1a1a1a] hover:bg-[#2a2a2a] border border-[#2a2a2a] hover:border-[#F7931A]/50 transition-all disabled:opacity-50"
                                                >
                                                    <div className="text-xs text-gray-300 font-medium">{option.label}</div>
                                                    <div className="text-[10px] text-gray-500">{option.desc}</div>
                                                </motion.button>
                                            ))}
                                        </div>

                                        <p className="text-[10px] text-gray-600 mt-2">
                                            Limited to 3 skips per day. Mining grants longer access sessions.
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </TerminalWindow>
            </motion.div>
        </div>
    );
}

export default function PoWChallenge() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 font-mono text-[#F7931A] text-sm sm:text-base">
                <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                >
                    ⚡ Initializing Educational Mining Experience...
                </motion.div>
            </div>
        }>
            <PoWChallengeContent />
        </Suspense>
    );
}