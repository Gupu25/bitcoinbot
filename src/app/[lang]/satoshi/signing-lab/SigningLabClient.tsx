'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Key, PenTool, AlertTriangle,
    Sparkles, BookOpen, Shield, Zap, Lock,
    Copy, Check, RefreshCw,
    Users, Bug, HelpCircle, ChevronDown,
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================
export interface SigningLabTranslations {
    title: string;
    subtitle: string;
    tagline: string;
    tabEcdsa: string;
    tabSchnorr: string;
    tabMuSig: string;
    tabNonce: string;
    privateKey: string;
    privateKeyDesc: string;
    publicKey: string;
    publicKeyDesc: string;
    signature: string;
    signatureDesc: string;
    generateKeys: string;
    message: string;
    sign: string;
    verify: string;
    valid: string;
    invalid: string;
    analogyTitle: string;
    analogyKey: string;
    analogyKeyDesc: string;
    analogyLock: string;
    analogyLockDesc: string;
    analogySeal: string;
    analogySealDesc: string;
    ecdsaSimple: string;
    ecdsaSimpleDesc: string;
    ecdsaAdvanced: string;
    schnorrSimple: string;
    schnorrSimpleDesc: string;
    schnorrUpgrade: string;
    musigSimple: string;
    musigSimpleDesc: string;
    musigBenefit: string;
    nonceWarning: string;
    nonceSimple: string;
    nonceSimpleDesc: string;
    dangerZone: string;
    privateKeyExposed: string;
    reuseNonce: string;
    showAdvanced: string;
    hideAdvanced: string;
    copied: string;
    showKey: string;
    hideKey: string;
    learningCheck: string;
    quizQuestion: string;
    quizAnswer: string;
}

interface Props {
    t: SigningLabTranslations;
    lang: 'en' | 'es';
}

// ============================================================================
// HELPER FUNCTIONS (Simulated for Education)
// ============================================================================
function simulateHash(input: string): string {
    let hash = 0n;
    for (let i = 0; i < input.length; i++) {
        const char = BigInt(input.charCodeAt(i));
        hash = ((hash << 5n) - hash) + char;
        hash = hash & ((1n << 256n) - 1n);
    }
    return hash.toString(16).padStart(64, '0');
}

function generateRandomHex(length: number = 64): string {
    const array = new Uint32Array(length / 8);
    if (typeof window !== 'undefined' && window.crypto) {
        window.crypto.getRandomValues(array);
    } else {
        for (let i = 0; i < array.length; i++) {
            array[i] = Math.floor(Math.random() * 0xffffffff);
        }
    }
    return Array.from(array, (x) => x.toString(16).padStart(8, '0')).join('');
}

function simulatePointMul(scalar: string): string {
    return simulateHash(scalar + 'point').slice(0, 64);
}

interface KeyPair {
    privateKey: string;
    publicKey: string;
}

function generateKeyPair(): KeyPair {
    const privateKey = generateRandomHex(64);
    const publicKey = simulatePointMul(privateKey);
    return { privateKey, publicKey };
}

// ============================================================================
// CLIENT COMPONENT
// ============================================================================
export function SigningLabClient({ t, lang }: Props) {
    const [activeTab, setActiveTab] = useState<'ecdsa' | 'schnorr' | 'musig' | 'nonce'>('ecdsa');
    const [keyPair, setKeyPair] = useState<KeyPair | null>(null);
    const [showPrivate, setShowPrivate] = useState(false);
    const [message, setMessage] = useState('I agree to send 1 BTC');
    const [signature, setSignature] = useState<string | null>(null);
    const [verificationResult, setVerificationResult] = useState<boolean | null>(null);
    const [copied, setCopied] = useState<string | null>(null);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [exposedKey, setExposedKey] = useState<string | null>(null);
    const [nonceAttackDone, setNonceAttackDone] = useState(false);

    const handleGenerateKeys = useCallback(() => {
        setKeyPair(generateKeyPair());
        setSignature(null);
        setVerificationResult(null);
        setExposedKey(null);
        setNonceAttackDone(false);
    }, []);

    const handleSign = useCallback(() => {
        if (!keyPair) return;
        const sig = simulateHash(keyPair.privateKey + message).slice(0, 128);
        setSignature(sig);
        setVerificationResult(null);
    }, [keyPair, message]);

    const handleVerify = useCallback(() => {
        setVerificationResult(true);
    }, []);

    const handleNonceAttack = useCallback(() => {
        if (!keyPair) return;
        setExposedKey(keyPair.privateKey);
        setNonceAttackDone(true);
    }, [keyPair]);

    const copyToClipboard = async (text: string, id: string) => {
        await navigator.clipboard.writeText(text);
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
    };

    const tabs = [
        { id: 'ecdsa' as const, label: t.tabEcdsa, icon: PenTool, color: 'blue' },
        { id: 'schnorr' as const, label: t.tabSchnorr, icon: Zap, color: 'amber' },
        { id: 'musig' as const, label: t.tabMuSig, icon: Users, color: 'purple' },
        { id: 'nonce' as const, label: t.tabNonce, icon: AlertTriangle, color: 'red' },
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-white py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <motion.div
                        className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 rounded-full px-4 py-2 mb-4"
                        whileHover={{ scale: 1.05 }}
                    >
                        <Key className="w-4 h-4 text-orange-400" />
                        <span className="text-orange-400 text-sm font-mono uppercase tracking-wider">
                            {t.tagline}
                        </span>
                    </motion.div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{t.title}</h1>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto">{t.subtitle}</p>
                </motion.div>

                {/* Analogy Cards */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid md:grid-cols-3 gap-4 mb-8"
                >
                    {[
                        { icon: Key, title: t.analogyKey, desc: t.analogyKeyDesc, bgClass: 'bg-red-500/20', iconClass: 'text-red-400' },
                        { icon: Lock, title: t.analogyLock, desc: t.analogyLockDesc, bgClass: 'bg-green-500/20', iconClass: 'text-green-400' },
                        { icon: PenTool, title: t.analogySeal, desc: t.analogySealDesc, bgClass: 'bg-blue-500/20', iconClass: 'text-blue-400' },
                    ].map((card, i) => (
                        <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                            <div className={`w-10 h-10 rounded-lg ${card.bgClass} flex items-center justify-center mb-3`}>
                                <card.icon className={`w-5 h-5 ${card.iconClass}`} />
                            </div>
                            <h3 className="font-bold text-sm text-white mb-1">{card.title}</h3>
                            <p className="text-xs text-slate-400">{card.desc}</p>
                        </div>
                    ))}
                </motion.div>

                {/* Tab Bar */}
                <div className="flex flex-wrap justify-center gap-2 mb-8">
                    {tabs.map((tab) => (
                        <motion.button
                            key={tab.id}
                            onClick={() => {
                                setActiveTab(tab.id);
                                setSignature(null);
                                setVerificationResult(null);
                                setExposedKey(null);
                            }}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all ${activeTab === tab.id
                                    ? tab.id === 'ecdsa' ? 'bg-blue-500 text-white shadow-lg'
                                        : tab.id === 'schnorr' ? 'bg-amber-500 text-white shadow-lg'
                                            : tab.id === 'musig' ? 'bg-purple-500 text-white shadow-lg'
                                                : 'bg-red-500 text-white shadow-lg'
                                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                                }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </motion.button>
                    ))}
                </div>

                <div className="grid lg:grid-cols-2 gap-8">

                    {/* ── Left Panel – Interactive ── */}
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">

                        {/* Key Generator */}
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Key className="w-5 h-5 text-orange-400" />
                                {t.generateKeys}
                            </h3>
                            <motion.button
                                onClick={handleGenerateKeys}
                                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 mb-4"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <RefreshCw className="w-5 h-5" />
                                {t.generateKeys}
                            </motion.button>

                            {keyPair && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                                    {/* Private Key */}
                                    <div className="bg-slate-800 rounded-xl p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs text-slate-500 font-mono">{t.privateKey}</span>
                                            <button
                                                onClick={() => setShowPrivate(!showPrivate)}
                                                className="text-xs text-orange-400 hover:underline"
                                            >
                                                {showPrivate ? t.hideKey : t.showKey}
                                            </button>
                                        </div>
                                        <p className="font-mono text-xs break-all text-red-400">
                                            {showPrivate ? keyPair.privateKey : '••••••••••••••••••••••••'}
                                        </p>
                                        <p className="text-[10px] text-slate-500 mt-1">{t.privateKeyDesc}</p>
                                    </div>

                                    {/* Public Key */}
                                    <div className="bg-slate-800 rounded-xl p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs text-slate-500 font-mono">{t.publicKey}</span>
                                            <button
                                                onClick={() => copyToClipboard(keyPair.publicKey, 'pub')}
                                                className="text-xs text-slate-400 hover:text-white"
                                            >
                                                {copied === 'pub'
                                                    ? <Check className="w-3 h-3 inline text-green-400" />
                                                    : <Copy className="w-3 h-3 inline" />}
                                            </button>
                                        </div>
                                        <p className="font-mono text-xs break-all text-green-400">{keyPair.publicKey}</p>
                                        <p className="text-[10px] text-slate-500 mt-1">{t.publicKeyDesc}</p>
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Sign / Verify Panel */}
                        {activeTab !== 'nonce' && (
                            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                                <h3 className="text-lg font-bold text-white mb-4">{t.message}</h3>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    className="w-full h-20 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white font-mono text-sm resize-none focus:outline-none focus:border-orange-500/50 mb-4"
                                />
                                <div className="flex gap-2">
                                    <motion.button
                                        onClick={handleSign}
                                        disabled={!keyPair}
                                        className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-700 disabled:text-slate-500 text-white py-3 rounded-xl font-medium"
                                        whileHover={{ scale: keyPair ? 1.02 : 1 }}
                                    >
                                        {t.sign}
                                    </motion.button>
                                    <motion.button
                                        onClick={handleVerify}
                                        disabled={!signature}
                                        className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-slate-700 disabled:text-slate-500 text-white py-3 rounded-xl font-medium"
                                        whileHover={{ scale: signature ? 1.02 : 1 }}
                                    >
                                        {t.verify}
                                    </motion.button>
                                </div>

                                {verificationResult !== null && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`mt-4 p-3 rounded-xl text-center font-medium text-sm ${verificationResult
                                                ? 'bg-green-500/20 border border-green-500/50 text-green-400'
                                                : 'bg-red-500/20 border border-red-500/50 text-red-400'
                                            }`}
                                    >
                                        {verificationResult ? t.valid : t.invalid}
                                    </motion.div>
                                )}
                            </div>
                        )}

                        {/* Nonce Danger Panel */}
                        {activeTab === 'nonce' && (
                            <div className="bg-red-900/20 border border-red-500/30 rounded-2xl p-6">
                                <h3 className="text-lg font-bold text-red-400 mb-2 flex items-center gap-2">
                                    <Bug className="w-5 h-5" />
                                    {t.dangerZone}
                                </h3>
                                <p className="text-sm text-slate-300 mb-4">{t.nonceSimpleDesc}</p>
                                <motion.button
                                    onClick={handleNonceAttack}
                                    disabled={!keyPair || nonceAttackDone}
                                    className="w-full bg-red-600 hover:bg-red-700 disabled:bg-slate-700 disabled:text-slate-500 text-white py-3 rounded-xl font-medium mb-4"
                                >
                                    {t.reuseNonce}
                                </motion.button>

                                {exposedKey && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="bg-red-500/20 border border-red-500/50 rounded-xl p-4"
                                    >
                                        <p className="text-red-400 font-bold text-sm mb-2">{t.privateKeyExposed}</p>
                                        <p className="font-mono text-xs text-white break-all bg-black/50 p-2 rounded">
                                            {exposedKey}
                                        </p>
                                        <p className="text-xs text-red-300 mt-2">
                                            {lang === 'es'
                                                ? '¡Al reusar el nonce, cualquiera puede calcular tu clave privada!'
                                                : 'By reusing the nonce, anyone can calculate your private key!'}
                                        </p>
                                    </motion.div>
                                )}
                            </div>
                        )}
                    </motion.div>

                    {/* ── Right Panel – Education ── */}
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">

                        {/* Concept Explanation */}
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-orange-400" />
                                {activeTab === 'ecdsa' && t.ecdsaSimple}
                                {activeTab === 'schnorr' && t.schnorrSimple}
                                {activeTab === 'musig' && t.musigSimple}
                                {activeTab === 'nonce' && t.nonceSimple}
                            </h3>

                            <div className="space-y-4">
                                <p className="text-sm text-slate-300">
                                    {activeTab === 'ecdsa' && t.ecdsaSimpleDesc}
                                    {activeTab === 'schnorr' && t.schnorrSimpleDesc}
                                    {activeTab === 'musig' && t.musigSimpleDesc}
                                    {activeTab === 'nonce' && t.nonceSimpleDesc}
                                </p>

                                {activeTab === 'schnorr' && (
                                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3">
                                        <p className="text-xs text-amber-300 flex items-center gap-2">
                                            <Sparkles className="w-4 h-4" />
                                            {t.schnorrUpgrade}
                                        </p>
                                    </div>
                                )}

                                {activeTab === 'musig' && (
                                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-3">
                                        <p className="text-xs text-purple-300 flex items-center gap-2">
                                            <Shield className="w-4 h-4" />
                                            {t.musigBenefit}
                                        </p>
                                    </div>
                                )}

                                {/* Advanced Math Toggle */}
                                {activeTab !== 'nonce' && (
                                    <div className="pt-4 border-t border-slate-800">
                                        <button
                                            onClick={() => setShowAdvanced(!showAdvanced)}
                                            className="text-xs text-slate-400 hover:text-orange-400 flex items-center gap-1"
                                        >
                                            <ChevronDown className={`w-3 h-3 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
                                            {showAdvanced ? t.hideAdvanced : t.showAdvanced}
                                        </button>

                                        <AnimatePresence>
                                            {showAdvanced && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="mt-3 bg-black/50 rounded-xl p-3 font-mono text-[10px] text-slate-500">
                                                        {activeTab === 'ecdsa' && (
                                                            <>
                                                                <p>r = (k × G).x mod n</p>
                                                                <p>s = (z + r × d) / k mod n</p>
                                                            </>
                                                        )}
                                                        {activeTab === 'schnorr' && (
                                                            <>
                                                                <p>e = H(R || P || m)</p>
                                                                <p>s = k + e × d mod n</p>
                                                            </>
                                                        )}
                                                        {activeTab === 'musig' && (
                                                            <>
                                                                <p>P_agg = Σ Pᵢ</p>
                                                                <p>s_agg = Σ sᵢ</p>
                                                            </>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Learning Check */}
                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-6">
                            <h3 className="text-lg font-bold text-blue-400 mb-3 flex items-center gap-2">
                                <HelpCircle className="w-5 h-5" />
                                {t.learningCheck}
                            </h3>
                            <p className="text-sm text-slate-300 mb-3">{t.quizQuestion}</p>
                            <div className="bg-slate-800 rounded-xl p-3">
                                <p className="text-sm text-green-400 font-medium">{t.quizAnswer}</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
