'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Hammer, Zap, Hash, Target, RefreshCw, Play, Pause,
    BookOpen, Shield, Lightbulb, Trophy, HelpCircle,
    Info, ChevronDown, Layers, Cpu,
    AlertTriangle
} from 'lucide-react';
import { InfoTooltip } from '@/components/ui/InfoTooltip';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
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
    difficulty: number;
}

interface Translations {
    title: string;
    subtitle: string;
    whyImportant: string;
    whyImportantDesc: string;
    selectDifficulty: string;
    difficultyLevel: string;
    difficultyDesc: string;
    startMining: string;
    stopMining: string;
    mining: string;
    mined: string;
    attempts: string;
    hashRate: string;
    time: string;
    target: string;
    foundHash: string;
    winningNonce: string;
    yourHashRate: string;
    labCompleted: string;
    labCompletedDesc: string;
    quiz: string;
    quizTitle: string;
    quizDesc: string;
    quizQuestion1: string;
    quizOption1A: string;
    quizOption1B: string;
    quizOption1C: string;
    quizOption1D: string;
    quizCorrect1: string;
    quizIncorrect1: string;
    quizQuestion2: string;
    quizOption2A: string;
    quizOption2B: string;
    quizOption2C: string;
    quizOption2D: string;
    quizCorrect2: string;
    quizIncorrect2: string;
    quizNext: string;
    quizComplete: string;
    startQuiz: string;
    question: string;
    score: string;
    tryAgain: string;
    complete: string;
    howPoWWorks: string;
    step1: string;
    step2: string;
    step3: string;
    step4: string;
    whatIsPoW: string;
    whatIsPoWDesc: string;
    whyPoW: string;
    whyPoWDesc: string;
    energyNote: string;
    energyNoteDesc: string;
    securityNote: string;
    securityNoteDesc: string;
    funFact: string;
    funFactDesc: string;
    tooltipDifficulty: string;
    tooltipHash: string;
    tooltipNonce: string;
    tooltipHashrate: string;
    difficultyEasy: string;
    difficultyNormal: string;
    difficultyHard: string;
    difficultyExpert: string;
    difficultyExtreme: string;
}

const translations: Record<'en' | 'es', Translations> = {
    en: {
        title: 'Mining Simulator Lab',
        subtitle: 'Experience Proof-of-Work like Bitcoin miners do',
        whyImportant: 'Why does this matter?',
        whyImportantDesc: 'Proof-of-Work is Bitcoin\'s security engine. Miners spend real energy to find valid hashes, making attacks economically impossible. Feel that energy yourself!',
        selectDifficulty: 'Select Mining Difficulty',
        difficultyLevel: 'Difficulty Level',
        difficultyDesc: 'More zeros = harder to find = more attempts needed',
        startMining: '⛏️ Start Mining',
        stopMining: '⏹ Stop Mining',
        mining: 'Mining in Progress...',
        mined: '🎉 Block Mined!',
        attempts: 'Attempts',
        hashRate: 'Hash Rate',
        time: 'Time',
        target: 'Target Prefix',
        foundHash: 'Found Hash',
        winningNonce: 'Winning Nonce',
        yourHashRate: 'Your Hash Rate',
        labCompleted: '🎉 Lab Completed!',
        labCompletedDesc: 'Now you understand how Bitcoin miners secure the network with real energy! ⚡',
        quiz: 'Test Your Knowledge',
        quizTitle: 'Proof-of-Work Quiz',
        quizDesc: 'Prove you understand how mining secures Bitcoin',
        quizQuestion1: 'Why does Bitcoin mining use so much energy?',
        quizOption1A: 'Because computers are inefficient',
        quizOption1B: 'To make attacks economically impossible',
        quizOption1C: 'To generate electricity as a byproduct',
        quizOption1D: 'It\'s just a design mistake',
        quizCorrect1: '✅ Correct! The energy cost makes it too expensive to attack the network. Security through economics!',
        quizIncorrect1: '❌ Think about what would happen if mining was free and easy.',
        quizQuestion2: 'What happens when more miners join the network?',
        quizOption2A: 'Transactions get slower',
        quizOption2B: 'Difficulty automatically increases',
        quizOption2C: 'Blocks get bigger',
        quizOption2D: 'Energy usage decreases',
        quizCorrect2: '✅ Correct! Bitcoin adjusts difficulty every 2016 blocks (~2 weeks) to keep block time at ~10 minutes.',
        quizIncorrect2: '❌ Think about how Bitcoin maintains consistent block times.',
        quizNext: 'Next Question',
        quizComplete: '🎉 Quiz Complete! You understand Proof-of-Work!',
        startQuiz: 'Start Quiz',
        question: 'Question',
        score: 'Score',
        tryAgain: 'Try Again',
        complete: 'Complete',
        howPoWWorks: 'How Proof-of-Work Works',
        step1: 'Miners collect transactions into a block',
        step2: 'They hash the block header with a changing nonce',
        step3: 'If hash starts with enough zeros, block is valid!',
        step4: 'Otherwise, change nonce and try again (billions of times!)',
        whatIsPoW: 'What is Proof-of-Work?',
        whatIsPoWDesc: 'A consensus mechanism where miners compete to solve a cryptographic puzzle. The "work" is computational effort that\'s easy to verify but hard to produce.',
        whyPoW: 'Why Bitcoin Uses It',
        whyPoWDesc: 'PoW makes it economically irrational to attack the network. To rewrite history, you\'d need more energy than all other miners combined!',
        energyNote: 'Energy & Security',
        energyNoteDesc: 'Bitcoin\'s energy usage isn\'t waste—it\'s the price of decentralized, censorship-resistant money. Every joule spent secures your transactions.',
        securityNote: 'Security Note',
        securityNoteDesc: 'The "longest chain" rule means the chain with the most cumulative work wins. This is why 51% attacks require controlling majority hash rate.',
        funFact: 'Fun Fact',
        funFactDesc: 'The Bitcoin network does ~500 exahashes (500,000,000,000,000,000,000) per second. Your phone just did a few thousand. That\'s the scale of Bitcoin security!',
        tooltipDifficulty: 'Number of leading zeros required. Each extra zero makes it ~16x harder!',
        tooltipHash: 'SHA-256 output: a unique 64-character fingerprint of your input. Change one bit, and the whole hash changes!',
        tooltipNonce: '"Number used once": the variable miners change to find a valid hash. Like guessing a combination lock!',
        tooltipHashrate: 'Guesses per second your device can make. Higher = faster mining (but also more battery drain!).',
        difficultyEasy: 'Easy mode - Perfect for learning! ☺️',
        difficultyNormal: 'Normal mode - Like early Bitcoin days',
        difficultyHard: 'Hard mode - Your device will work!',
        difficultyExpert: 'Expert mode - This might take a while...',
        difficultyExtreme: 'Extreme mode - For the brave! 🔥',
    },
    es: {
        title: 'Simulador de Minería',
        subtitle: 'Experimenta Proof-of-Work como lo hacen los mineros de Bitcoin',
        whyImportant: '¿Por qué importa esto?',
        whyImportantDesc: 'Proof-of-Work es el motor de seguridad de Bitcoin. Los mineros gastan energía real para encontrar hashes válidos, haciendo los ataques económicamente imposibles. ¡Siente esa energía tú mismo!',
        selectDifficulty: 'Selecciona Dificultad de Minería',
        difficultyLevel: 'Nivel de Dificultad',
        difficultyDesc: 'Más ceros = más difícil de encontrar = más intentos necesarios',
        startMining: '⛏️ Iniciar Minería',
        stopMining: '⏹ Detener Minería',
        mining: 'Minando...',
        mined: '🎉 ¡Bloque Minado!',
        attempts: 'Intentos',
        hashRate: 'Hash Rate',
        time: 'Tiempo',
        target: 'Prefijo Objetivo',
        foundHash: 'Hash Encontrado',
        winningNonce: 'Nonce Ganador',
        yourHashRate: 'Tu Hash Rate',
        labCompleted: '🎉 ¡Lab Completado!',
        labCompletedDesc: '¡Ahora entiendes cómo los mineros de Bitcoin aseguran la red con energía real! ⚡',
        quiz: 'Pon a Prueba tu Conocimiento',
        quizTitle: 'Quiz de Proof-of-Work',
        quizDesc: 'Demuestra que entiendes cómo la minería asegura Bitcoin',
        quizQuestion1: '¿Por qué la minería de Bitcoin usa tanta energía?',
        quizOption1A: 'Porque las computadoras son ineficientes',
        quizOption1B: 'Para hacer los ataques económicamente imposibles',
        quizOption1C: 'Para generar electricidad como subproducto',
        quizOption1D: 'Es solo un error de diseño',
        quizCorrect1: '✅ ¡Correcto! El costo energético hace que atacar la red sea demasiado caro. ¡Seguridad mediante economía!',
        quizIncorrect1: '❌ Piensa en qué pasaría si minar fuera gratis y fácil.',
        quizQuestion2: '¿Qué pasa cuando más mineros se unen a la red?',
        quizOption2A: 'Las transacciones se vuelven más lentas',
        quizOption2B: 'La dificultad aumenta automáticamente',
        quizOption2C: 'Los bloques se hacen más grandes',
        quizOption2D: 'El uso de energía disminuye',
        quizCorrect2: '✅ ¡Correcto! Bitcoin ajusta la dificultad cada 2016 bloques (~2 semanas) para mantener el tiempo de bloque en ~10 minutos.',
        quizIncorrect2: '❌ Piensa en cómo Bitcoin mantiene tiempos de bloque consistentes.',
        quizNext: 'Siguiente Pregunta',
        quizComplete: '🎉 ¡Quiz Completado! ¡Entiendes Proof-of-Work!',
        startQuiz: 'Iniciar Quiz',
        question: 'Pregunta',
        score: 'Puntuación',
        tryAgain: 'Intentar de Nuevo',
        complete: 'Completar',
        howPoWWorks: 'Cómo Funciona Proof-of-Work',
        step1: 'Los mineros agrupan transacciones en un bloque',
        step2: 'Hashean el encabezado del bloque con un nonce cambiante',
        step3: '¡Si el hash empieza con suficientes ceros, el bloque es válido!',
        step4: 'Si no, cambian el nonce e intentan de nuevo (¡miles de millones de veces!)',
        whatIsPoW: '¿Qué es Proof-of-Work?',
        whatIsPoWDesc: 'Un mecanismo de consenso donde los mineros compiten para resolver un rompecabezas criptográfico. El "trabajo" es esfuerzo computacional fácil de verificar pero difícil de producir.',
        whyPoW: 'Por Qué Bitcoin Lo Usa',
        whyPoWDesc: 'PoW hace irracional económicamente atacar la red. Para reescribir la historia, ¡necesitarías más energía que todos los demás mineros combinados!',
        energyNote: 'Energía y Seguridad',
        energyNoteDesc: 'El uso de energía de Bitcoin no es desperdicio—es el precio del dinero descentralizado y resistente a la censura. Cada julio gastado asegura tus transacciones.',
        securityNote: 'Nota de Seguridad',
        securityNoteDesc: 'La regla de "cadena más larga" significa que gana la cadena con más trabajo acumulado. Por eso los ataques del 51% requieren controlar la mayoría del hash rate.',
        funFact: 'Dato Curioso',
        funFactDesc: 'La red de Bitcoin hace ~500 exahashes (500,000,000,000,000,000,000) por segundo. Tu celular apenas hizo unos miles. ¡Esa es la escala de seguridad de Bitcoin!',
        tooltipDifficulty: 'Número de ceros iniciales requeridos. ¡Cada cero extra lo hace ~16x más difícil!',
        tooltipHash: 'Salida SHA-256: una huella digital única de 64 caracteres de tu entrada. ¡Cambia un bit y todo el hash cambia!',
        tooltipNonce: '"Número usado una vez": la variable que los mineros cambian para encontrar un hash válido. ¡Como adivinar la combinación de una cerradura!',
        tooltipHashrate: 'Adivinanzas por segundo que tu dispositivo puede hacer. Más alto = minería más rápida (¡pero también más consumo de batería!).',
        difficultyEasy: 'Modo fácil - ¡Perfecto para aprender! ☺️',
        difficultyNormal: 'Modo normal - Como los primeros días de Bitcoin',
        difficultyHard: 'Modo difícil - ¡Tu dispositivo trabajará!',
        difficultyExpert: 'Modo experto - Esto podría tardar un poco...',
        difficultyExtreme: 'Modo extremo - ¡Para los valientes! 🔥',
    },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================
function simulateHash(input: string): string {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
        const char = input.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    const hex = Math.abs(hash).toString(16).padStart(8, '0');
    return `${hex.repeat(8)}`.slice(0, 64);
}

function countLeadingZeros(hash: string): number {
    let zeros = 0;
    for (const char of hash) {
        if (char === '0') zeros++;
        else break;
    }
    return zeros;
}

// ============================================================================
// QUIZ QUESTIONS
// ============================================================================
interface QuizQuestion {
    question: string;
    options: string[];
    correct: number;
    explanation: string;
}

const getQuizQuestions = (lang: 'en' | 'es', t: Translations): QuizQuestion[] => [
    {
        question: t.quizQuestion1,
        options: [t.quizOption1A, t.quizOption1B, t.quizOption1C, t.quizOption1D],
        correct: 1,
        explanation: t.quizCorrect1,
    },
    {
        question: t.quizQuestion2,
        options: [t.quizOption2A, t.quizOption2B, t.quizOption2C, t.quizOption2D],
        correct: 1,
        explanation: t.quizCorrect2,
    },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function MiningLabPage({ params }: { params: { lang: 'en' | 'es' } }) {
    const lang = params.lang || 'en';
    const t = translations[lang];

    const [difficulty, setDifficulty] = useState(2);
    const [isMining, setIsMining] = useState(false);
    const [result, setResult] = useState<MiningResult | null>(null);
    const [stats, setStats] = useState<MiningStats>({
        attempts: 0,
        startTime: 0,
        currentHashrate: 0,
        bestDifficulty: 0,
    });
    const [showEducational, setShowEducational] = useState(true);
    const [labCompleted, setLabCompleted] = useState(false);
    const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

    // Quiz state
    const [quizStarted, setQuizStarted] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [score, setScore] = useState(0);
    const [quizComplete, setQuizComplete] = useState(false);
    const quizQuestions = useMemo(() => getQuizQuestions(lang, t), [lang, t]);

    const abortRef = useRef(false);
    const targetPrefix = Array(difficulty + 1).join('0');

    // 🎯 Mining logic (educational, no backend)
    const startMining = useCallback(() => {
        if (isMining || result) return;
        setIsMining(true);
        setResult(null);
        abortRef.current = false;

        const startTime = Date.now();
        let nonce = 0;
        let attempts = 0;

        const mineBatch = () => {
            const batchSize = 100;

            for (let i = 0; i < batchSize; i++) {
                if (abortRef.current) return;

                const message = `bitcoin-agent-hackathon-${Date.now()}-${nonce}`;
                const hash = simulateHash(message);
                attempts++;

                if (hash.startsWith(targetPrefix)) {
                    setResult({
                        nonce,
                        hash,
                        attempts,
                        timeElapsed: Date.now() - startTime,
                        difficulty,
                    });
                    setIsMining(false);
                    setLabCompleted(true);
                    return;
                }
                nonce++;
            }

            // Update stats
            const elapsed = (Date.now() - startTime) / 1000;
            setStats({
                attempts,
                startTime,
                currentHashrate: Math.floor(attempts / elapsed) || 0,
                bestDifficulty: Math.max(stats.bestDifficulty, countLeadingZeros(hash)),
            });

            // Continue mining
            setTimeout(mineBatch, 0);
        };

        mineBatch();
    }, [difficulty, isMining, result, targetPrefix, stats.bestDifficulty]);

    const stopMining = () => {
        abortRef.current = true;
        setIsMining(false);
    };

    const resetLab = () => {
        stopMining();
        setResult(null);
        setStats({ attempts: 0, startTime: 0, currentHashrate: 0, bestDifficulty: 0 });
        setLabCompleted(false);
    };

    // Quiz handlers
    const handleAnswer = (answerIndex: number) => {
        setSelectedAnswer(answerIndex);
        setShowResult(true);
        if (answerIndex === quizQuestions[currentQuestion].correct) {
            setScore(score + 1);
        }
    };

    const nextQuestion = () => {
        if (currentQuestion < quizQuestions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
            setSelectedAnswer(null);
            setShowResult(false);
        } else {
            setQuizComplete(true);
            setLabCompleted(true);
        }
    };

    const resetQuiz = () => {
        setQuizStarted(false);
        setCurrentQuestion(0);
        setSelectedAnswer(null);
        setShowResult(false);
        setScore(0);
        setQuizComplete(false);
    };

    const timeElapsed = stats.startTime ? Math.floor((Date.now() - stats.startTime) / 1000) : 0;

    const getDifficultyLabel = (d: number) => {
        const labels = [t.difficultyEasy, t.difficultyNormal, t.difficultyHard, t.difficultyExpert, t.difficultyExtreme];
        return labels[d - 1] || labels[1];
    };

    const getHashrateDescription = (rate: number) => {
        if (rate === 0) return "Ready to start";
        if (rate < 1000) return "Gentle pace 🐢";
        if (rate < 5000) return "Good speed! 🐇";
        if (rate < 10000) return "Fast! 🚀";
        return "Lightning! ⚡⚡⚡";
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
                    <motion.div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 rounded-full px-4 py-2 mb-4" whileHover={{ scale: 1.05 }}>
                        <Hammer className="w-4 h-4 text-orange-400" />
                        <span className="text-orange-400 text-sm font-mono uppercase tracking-wider">Proof-of-Work</span>
                    </motion.div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 flex items-center justify-center gap-3">
                        <Zap className="w-10 h-10 text-orange-400" />
                        {t.title}
                    </h1>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto">{t.subtitle}</p>
                </motion.div>

                {/* 🎓 Lab Completed Badge */}
                <AnimatePresence>
                    {labCompleted && (
                        <motion.div initial={{ opacity: 0, y: -20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20, scale: 0.9 }} className="mb-8 p-4 bg-gradient-to-r from-emerald-500/10 to-green-500/10 border-2 border-emerald-500/40 rounded-2xl text-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.1)_0%,transparent_70%)] pointer-events-none" />
                            <div className="flex items-center justify-center gap-2 mb-2 relative z-10">
                                <Trophy className="w-6 h-6 text-emerald-400 animate-bounce" />
                                <span className="text-emerald-300 font-mono text-lg font-bold">{t.labCompleted}</span>
                                <Trophy className="w-6 h-6 text-emerald-400 animate-bounce" />
                            </div>
                            <p className="text-slate-400 text-sm relative z-10">{t.labCompletedDesc}</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* 🎓 Why This Matters */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-6 mb-8">
                    <h3 className="text-lg font-bold text-blue-400 mb-3 flex items-center gap-2">
                        <Lightbulb className="w-5 h-5" />
                        {t.whyImportant}
                    </h3>
                    <p className="text-sm text-slate-300 leading-relaxed">{t.whyImportantDesc}</p>
                </motion.div>

                <div className="grid lg:grid-cols-3 gap-8">

                    {/* Left Panel - Controls */}
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-1 space-y-6">

                        {/* Difficulty Selector */}
                        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                            <h3 className="text-lg font-bold text-orange-400 mb-4 flex items-center gap-2">
                                <Target className="w-5 h-5" />
                                {t.selectDifficulty}
                                <InfoTooltip content={t.tooltipDifficulty} />
                            </h3>

                            <input
                                type="range"
                                min="1"
                                max="5"
                                value={difficulty}
                                onChange={(e) => setDifficulty(parseInt(e.target.value))}
                                disabled={isMining}
                                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500 disabled:opacity-50"
                            />

                            <div className="flex justify-between mt-2 text-xs text-slate-500">
                                <span>1</span>
                                <span>2</span>
                                <span>3</span>
                                <span>4</span>
                                <span>5</span>
                            </div>

                            <div className="mt-3 p-3 bg-orange-500/10 border border-orange-500/30 rounded-xl">
                                <p className="text-sm text-orange-300 font-mono">
                                    {t.difficultyLevel}: {difficulty} zeros
                                </p>
                                <p className="text-xs text-slate-400 mt-1">{getDifficultyLabel(difficulty)}</p>
                                <p className="text-xs text-slate-500 mt-1">{t.difficultyDesc}</p>
                            </div>

                            {/* Visual difficulty bar */}
                            <div className="mt-4">
                                <div className="flex gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <motion.div
                                            key={i}
                                            className={`h-2 flex-1 rounded-full transition-colors ${i < difficulty ? 'bg-orange-500' : 'bg-slate-700'}`}
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: i * 0.1 }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Mining Controls */}
                        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Cpu className="w-5 h-5 text-purple-400" />
                                {isMining ? t.mining : result ? t.mined : t.startMining}
                            </h3>

                            <div className="space-y-3">
                                {!result ? (
                                    <>
                                        <motion.button
                                            onClick={isMining ? stopMining : startMining}
                                            disabled={difficulty > 4 && !isMining}
                                            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all min-h-[56px] touch-manipulation ${isMining
                                                ? 'bg-red-600 hover:bg-red-700 text-white'
                                                : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-black'
                                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            {isMining ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                                            {isMining ? t.stopMining : t.startMining}
                                        </motion.button>

                                        {difficulty > 4 && !isMining && (
                                            <p className="text-xs text-amber-400 text-center flex items-center justify-center gap-1">
                                                <AlertTriangle className="w-3 h-3" />
                                                High difficulty may take a while!
                                            </p>
                                        )}
                                    </>
                                ) : (
                                    <motion.button
                                        onClick={resetLab}
                                        className="w-full bg-slate-800 hover:bg-slate-700 text-white py-4 rounded-xl font-medium flex items-center justify-center gap-2 min-h-[56px] touch-manipulation"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <RefreshCw className="w-5 h-5" />
                                        Mine Again
                                    </motion.button>
                                )}
                            </div>
                        </div>

                        {/* Live Stats */}
                        {(isMining || result) && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                                <h3 className="text-lg font-bold text-white mb-4">Live Stats</h3>
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="bg-slate-800 rounded-lg p-3 text-center">
                                        <p className="text-2xl font-bold text-green-400">{stats.attempts.toLocaleString()}</p>
                                        <p className="text-xs text-slate-500">{t.attempts}</p>
                                    </div>
                                    <div className="bg-slate-800 rounded-lg p-3 text-center">
                                        <p className="text-2xl font-bold text-orange-400">
                                            {stats.currentHashrate > 1000 ? `${(stats.currentHashrate / 1000).toFixed(1)}k` : stats.currentHashrate}
                                        </p>
                                        <p className="text-xs text-slate-500">H/s</p>
                                        <p className="text-[10px] text-orange-400/70">{getHashrateDescription(stats.currentHashrate)}</p>
                                    </div>
                                    <div className="bg-slate-800 rounded-lg p-3 text-center">
                                        <p className="text-2xl font-bold text-blue-400">{timeElapsed}s</p>
                                        <p className="text-xs text-slate-500">{t.time}</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </motion.div>

                    {/* Center - Mining Visualization */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-1">
                        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 min-h-[500px] flex flex-col">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Hash className="w-5 h-5 text-green-400" />
                                Mining Visualization
                                <InfoTooltip content={t.tooltipHash} />
                            </h3>

                            <div className="flex-1 flex flex-col items-center justify-center">
                                {!result ? (
                                    <div className="w-full space-y-4">
                                        {/* Target Display */}
                                        <div className="bg-slate-800 rounded-xl p-4">
                                            <p className="text-xs text-slate-500 mb-2 flex items-center gap-1">
                                                {t.target}:
                                                <InfoTooltip content={t.tooltipDifficulty} />
                                            </p>
                                            <div className="font-mono text-lg text-orange-400">
                                                <span className="text-green-400 font-bold">{targetPrefix}</span>
                                                <span className="text-slate-600">{'...'.repeat(8)}</span>
                                            </div>
                                        </div>

                                        {/* Live Hash Animation */}
                                        {isMining && (
                                            <motion.div className="bg-black/50 rounded-xl p-4 font-mono text-xs overflow-hidden">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full" />
                                                    <span className="text-orange-400">Trying nonces...</span>
                                                </div>
                                                <div className="space-y-1 h-24 overflow-hidden relative">
                                                    <motion.div animate={{ y: [0, -80] }} transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }} className="absolute inset-0 space-y-1">
                                                        {Array(10).fill(0).map((_, i) => {
                                                            const mockHash = Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
                                                            const isTarget = mockHash.startsWith(targetPrefix);
                                                            return (
                                                                <div key={i} className={`truncate ${isTarget ? 'text-green-400 font-bold bg-green-400/10' : 'text-slate-600'}`}>
                                                                    <span className="text-slate-700 mr-2">#{stats.attempts + i}</span>
                                                                    <span className={isTarget ? 'text-green-400' : mockHash.startsWith(targetPrefix.slice(0, 1)) ? 'text-yellow-600' : ''}>
                                                                        {mockHash.slice(0, 20)}...
                                                                    </span>
                                                                    {isTarget && <span className="ml-2 text-green-400">✓ MATCH!</span>}
                                                                </div>
                                                            );
                                                        })}
                                                    </motion.div>
                                                    <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/50 pointer-events-none" />
                                                </div>
                                            </motion.div>
                                        )}

                                        {/* Educational Tip */}
                                        {!isMining && !result && (
                                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="bg-blue-900/20 border border-blue-800 rounded-xl p-4 text-center">
                                                <p className="text-sm text-blue-300">
                                                    💡 <span className="font-bold">Tip:</span> Tap the stats to learn what they mean! This is exactly how Bitcoin miners secure the network.
                                                </p>
                                            </motion.div>
                                        )}
                                    </div>
                                ) : (
                                    /* Success Display */
                                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full space-y-4">
                                        <div className="bg-green-500/10 border-2 border-green-500 rounded-xl p-6 text-center">
                                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }} className="text-4xl mb-2">🎉</motion.div>
                                            <p className="text-green-400 font-bold text-lg">{t.mined}</p>
                                        </div>

                                        <div className="bg-slate-800 rounded-xl p-4 space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-500">{t.winningNonce}:</span>
                                                <span className="font-mono text-green-400">{result.nonce.toLocaleString()}</span>
                                            </div>
                                            <div>
                                                <p className="text-slate-500 text-xs mb-1">{t.foundHash}:</p>
                                                <p className="font-mono text-xs break-all">
                                                    <span className="text-green-400 font-bold">{targetPrefix}</span>
                                                    <span className="text-slate-400">{result.hash.slice(difficulty)}</span>
                                                </p>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-700">
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">{t.attempts}:</span>
                                                    <span className="font-mono">{result.attempts.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">{t.time}:</span>
                                                    <span className="font-mono">{(result.timeElapsed / 1000).toFixed(2)}s</span>
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center pt-2 border-t border-slate-700">
                                                <span className="text-slate-500">{t.yourHashRate}:</span>
                                                <span className="text-orange-400 font-bold">
                                                    {Math.floor(result.attempts / (result.timeElapsed / 1000)).toLocaleString()} H/s
                                                </span>
                                            </div>
                                        </div>

                                        {/* Fun Fact */}
                                        <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
                                            <p className="text-xs text-orange-300">
                                                <span className="font-bold">🧠 {t.funFact}</span> {t.funFactDesc}
                                            </p>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Panel - Education & Quiz */}
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-1 space-y-6">

                        {/* Educational Panel */}
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
                            <button onClick={() => setShowEducational(!showEducational)} className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-800/50 transition-colors">
                                <span className="font-bold text-white flex items-center gap-2">
                                    <BookOpen className="w-5 h-5 text-orange-400" />
                                    {t.howPoWWorks}
                                </span>
                                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${showEducational ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                                {showEducational && (
                                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                                        <div className="p-4 pt-0 space-y-4">
                                            {/* Steps */}
                                            <div className="space-y-2">
                                                {[t.step1, t.step2, t.step3, t.step4].map((step, i) => (
                                                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="flex items-start gap-2 text-sm p-3 rounded-xl bg-slate-800/50 border border-slate-700">
                                                        <span className="w-6 h-6 flex items-center justify-center bg-orange-500 text-white rounded text-xs flex-shrink-0">{i + 1}</span>
                                                        {step}
                                                    </motion.div>
                                                ))}
                                            </div>

                                            {/* Info Cards */}
                                            <div className="space-y-3 pt-4">
                                                <div className="bg-slate-800/50 rounded-xl p-4">
                                                    <h4 className="text-sm font-bold text-orange-400 mb-2 flex items-center gap-2"><Info className="w-4 h-4" />{t.whatIsPoW}</h4>
                                                    <p className="text-xs text-slate-400">{t.whatIsPoWDesc}</p>
                                                </div>
                                                <div className="bg-slate-800/50 rounded-xl p-4">
                                                    <h4 className="text-sm font-bold text-blue-400 mb-2 flex items-center gap-2"><Zap className="w-4 h-4" />{t.whyPoW}</h4>
                                                    <p className="text-xs text-slate-400">{t.whyPoWDesc}</p>
                                                </div>
                                                <div className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20 rounded-xl p-4">
                                                    <h4 className="text-sm font-bold text-amber-400 mb-2 flex items-center gap-2"><Layers className="w-4 h-4" />{t.energyNote}</h4>
                                                    <p className="text-xs text-slate-300">{t.energyNoteDesc}</p>
                                                </div>
                                                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                                                    <h4 className="text-sm font-bold text-red-400 mb-2 flex items-center gap-2"><Shield className="w-4 h-4" />{t.securityNote}</h4>
                                                    <p className="text-xs text-slate-300">{t.securityNoteDesc}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>

                        {/* Quiz */}
                        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <HelpCircle className="w-5 h-5 text-purple-400" />
                                {t.quiz}
                            </h3>
                            {!quizStarted && !quizComplete && (
                                <div>
                                    <p className="text-sm text-slate-400 mb-4">{t.quizDesc}</p>
                                    <motion.button onClick={() => setQuizStarted(true)} className="w-full bg-purple-500 hover:bg-purple-600 text-white py-4 rounded-xl font-medium min-h-[56px] touch-manipulation" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>{t.startQuiz}</motion.button>
                                </div>
                            )}
                            {quizStarted && !quizComplete && (
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-xs text-slate-500">{t.question} {currentQuestion + 1}/{quizQuestions.length}</span>
                                        <span className="text-xs text-purple-400">{t.score}: {score}</span>
                                    </div>
                                    <p className="text-sm text-white mb-4">{quizQuestions[currentQuestion].question}</p>
                                    <div className="space-y-2">
                                        {quizQuestions[currentQuestion].options.map((option, i) => (
                                            <motion.button key={i} onClick={() => !showResult && handleAnswer(i)} disabled={showResult} className={`w-full p-3 rounded-xl text-sm text-left transition-all min-h-[56px] touch-manipulation ${showResult ? i === quizQuestions[currentQuestion].correct ? 'bg-green-500/20 border border-green-500/50 text-green-400' : i === selectedAnswer ? 'bg-red-500/20 border border-red-500/50 text-red-400' : 'bg-slate-800 text-slate-500' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}`} whileHover={!showResult ? { scale: 1.02 } : {}} whileTap={!showResult ? { scale: 0.98 } : {}}>{option}</motion.button>
                                        ))}
                                    </div>
                                    {showResult && (
                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
                                            <p className={`text-sm mb-4 ${selectedAnswer === quizQuestions[currentQuestion].correct ? 'text-green-400' : 'text-red-400'}`}>{quizQuestions[currentQuestion].explanation}</p>
                                            <motion.button onClick={nextQuestion} className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 rounded-xl text-sm min-h-[48px] touch-manipulation" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>{currentQuestion < quizQuestions.length - 1 ? t.quizNext : t.complete}</motion.button>
                                        </motion.div>
                                    )}
                                </div>
                            )}
                            {quizComplete && (
                                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
                                    <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 0.5 }} className="text-4xl mb-4">🎉</motion.div>
                                    <p className="text-green-400 font-mono mb-2">{t.quizComplete}</p>
                                    <p className="text-slate-400 text-sm mb-4">{t.score}: {score}/{quizQuestions.length}</p>
                                    <motion.button onClick={resetQuiz} className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-sm min-h-[48px] touch-manipulation" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>{t.tryAgain}</motion.button>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
