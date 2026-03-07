'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dices, Shield, AlertTriangle, Key, Eye, EyeOff,
  Copy, Check, RefreshCw, BookOpen, Sparkles,
  Lock, Wallet, Building2, XCircle, CheckCircle, HelpCircle,
  Trophy, FileText
} from 'lucide-react';
import { InfoTooltip } from '@/components/ui/InfoTooltip';
import { BobChatWidget } from '@/components/chat/BobChatWidget';

// ✅ IMPORTS CORREGIDOS PARA @scure/bip39 v1.4.0
import { generateMnemonic, mnemonicToEntropy, entropyToMnemonic, validateMnemonic } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';
import { sha256 } from '@noble/hashes/sha256';
import { bytesToHex, hexToBytes } from '@noble/hashes/utils';

// ============================================================================
// Translations - 🇲🇽 Spanish-First Microcopy para Mexicanos
// ============================================================================
interface Translations {
  title: string;
  subtitle: string;
  introTitle: string;
  introText: string;
  glossarySeedPhrase: string;
  glossaryEntropy: string;
  glossaryChecksum: string;
  glossary11bits: string;
  generateEntropy: string;
  entropyBits: string;
  entropyDesc: string;
  checksum: string;
  checksumDesc: string;
  seedPhrase: string;
  seedPhraseDesc: string;
  words12: string;
  words24: string;
  yourSeed: string;
  criticalWarning: string;
  criticalWarningDesc: string;
  neverShare: string;
  neverDigital: string;
  neverPhoto: string;
  neverCloud: string;
  onlyPaper: string;
  onlyMetal: string;
  onlyMemorize: string;
  bankVsBitcoin: string;
  bankTitle: string;
  bitcoinTitle: string;
  bankDesc1: string;
  bankDesc2: string;
  bankDesc3: string;
  bitcoinDesc1: string;
  bitcoinDesc2: string;
  bitcoinDesc3: string;
  howItWorks: string;
  step1Title: string;
  step1Desc: string;
  step2Title: string;
  step2Desc: string;
  step3Title: string;
  step3Desc: string;
  step4Title: string;
  step4Desc: string;
  entropy: string;
  binary: string;
  word: string;
  index: string;
  copied: string;
  copySeed: string;
  showSeed: string;
  hideSeed: string;
  regenerate: string;
  regenerateConfirm: string;
  quiz: string;
  quizTitle: string;
  quizDesc: string;
  quizQuestion: string;
  quizCorrect: string;
  quizIncorrect: string;
  quizNext: string;
  quizComplete: string;
  securityTips: string;
  tip1: string;
  tip2: string;
  tip3: string;
  tip4: string;
  entropyRandom: string;
  entropyMath: string;
  totalBits: string;
  checksumBits: string;
  finalBits: string;
  labCompleted: string;
  labCompletedDesc: string;
  startQuiz: string;
  question: string;
  score: string;
  tryAgain: string;
  complete: string;
  bip39Standard: string;
  bip39Desc: string;
  makeSureNoOneWatching: string;
}

const translations: Record<'en' | 'es', Translations> = {
  en: {
    title: 'Seed Phrase Lab',
    subtitle: 'Understand the most important 12-24 words of your Bitcoin journey',
    introTitle: 'Why does this matter?',
    introText: 'In Bitcoin, you control your money. There is no bank to recover your password. Twelve to twenty-four words (called a "seed phrase") are like the master key to all your Bitcoin. If you lose them or someone sees them, you lose everything. This lab teaches you what they are, how they are created, and how to protect them.',
    glossarySeedPhrase: 'The 12-24 words that control all your Bitcoin. Like a master key—whoever has them controls your money.',
    glossaryEntropy: 'Random numbers that make your phrase impossible to guess. The foundation of your security.',
    glossaryChecksum: 'Extra data that helps detect if you wrote a word wrong when restoring.',
    glossary11bits: 'Each 11-bit group maps to one of 2048 words (2^11 = 2048). This makes your seed readable but still secure!',
    generateEntropy: 'Generate New Seed',
    entropyBits: 'Randomness (foundation of your security)',
    entropyDesc: 'True randomness is the foundation of security',
    checksum: 'Verification (detect typos)',
    checksumDesc: 'Error detection to catch typos',
    seedPhrase: 'Your 12-24 key words',
    seedPhraseDesc: 'Human-readable representation of your master key',
    words12: '12 Words',
    words24: '24 Words',
    yourSeed: 'Your Seed Phrase',
    criticalWarning: '⚠️ GOLDEN RULES',
    criticalWarningDesc: 'These rules protect your bitcoins forever',
    neverShare: '❌ Never share with anyone, not even your best friend',
    neverDigital: '❌ Never store digitally (photos, cloud, email)',
    neverPhoto: '❌ Never take a screenshot',
    neverCloud: '❌ Never paste in password managers',
    onlyPaper: '✅ Write on paper only',
    onlyMetal: '✅ Etch on metal for fire resistance',
    onlyMemorize: '✅ Memorize and destroy paper',
    bankVsBitcoin: 'Bank vs Bitcoin: The Key Difference',
    bankTitle: '🏦 Traditional Bank',
    bitcoinTitle: '₿ Bitcoin',
    bankDesc1: '✅ Lost password? Reset via email',
    bankDesc2: '✅ Account hacked? Bank reverses',
    bankDesc3: '✅ Forgot everything? ID verification',
    bitcoinDesc1: '❌ Lost seed? Funds gone forever',
    bitcoinDesc2: '❌ Hacked? No one can help',
    bitcoinDesc3: '❌ No recovery, no customer service',
    howItWorks: 'How a Seed Phrase is Born',
    step1Title: 'Step 1: Randomness',
    step1Desc: '128 or 256 bits of true randomness (coin flips, dice, or computer)',
    step2Title: 'Step 2: Verification',
    step2Desc: 'First 4 or 8 bits added to detect if you wrote a word wrong',
    step3Title: 'Step 3: Split into 11-bit Groups',
    step3Desc: 'Each group becomes an index (0-2047) for the BIP39 wordlist',
    step4Title: 'Step 4: Map to Words',
    step4Desc: '2048 carefully chosen words that are easy to identify',
    entropy: 'Entropy',
    binary: 'Binary',
    word: 'Word',
    index: 'Index',
    copied: 'Copied!',
    copySeed: 'Copy Seed',
    showSeed: 'Show Seed',
    hideSeed: 'Hide Seed',
    regenerate: 'Generate New Seed',
    regenerateConfirm: 'Generate new seed? Current one will be lost (make sure you saved it if it was important!)',
    quiz: 'Test Your Knowledge',
    quizTitle: 'Seed Security Quiz',
    quizDesc: 'Prove you understand seed phrase security',
    quizQuestion: 'What is the SAFEST way to backup your seed phrase?',
    quizCorrect: '✅ Correct! Metal backups resist fire, water, and time.',
    quizIncorrect: '❌ Incorrect. Think about physical durability and privacy.',
    quizNext: 'Next Question',
    quizComplete: '🎉 Quiz Complete! You understand seed security!',
    securityTips: 'Security Tips',
    tip1: 'Generate in offline environment',
    tip2: 'Use a hardware wallet for generation',
    tip3: 'Never type your seed on a keyboard',
    tip4: 'Verify backup by restoring to another device',
    entropyRandom: 'Random number generation',
    entropyMath: 'Mathematical transformation',
    totalBits: 'Total bits',
    checksumBits: 'Checksum bits',
    finalBits: 'Final entropy',
    labCompleted: '🎉 Lab Completed!',
    labCompletedDesc: 'Now you understand why your seed phrase is your most valuable treasure 💎',
    startQuiz: 'Start Quiz',
    question: 'Question',
    score: 'Score',
    tryAgain: 'Try Again',
    complete: 'Complete',
    bip39Standard: 'BIP39 Standard',
    bip39Desc: 'BIP39 defines the standard for mnemonic codes. It uses 2048 carefully selected words from various languages to create human-readable backups of cryptographic keys.',
    makeSureNoOneWatching: '(Make sure no one is watching!)',
  },
  es: {
    title: 'Laboratorio de Semilla',
    subtitle: 'Entiende las 12-24 palabras más importantes de tu viaje en Bitcoin',
    introTitle: '¿Por qué importa esto?',
    introText: 'En Bitcoin, tú controlas tu dinero. No hay banco que te recupere la contraseña. Hay 12-24 palabras (llamadas "frase semilla") que son como la llave maestra de todo tu Bitcoin. Si las pierdes o alguien las ve, pierdes todo. En este lab aprenderás qué son, cómo se crean y cómo protegerlas.',
    glossarySeedPhrase: 'Las 12-24 palabras que controlan todo tu Bitcoin. Como una llave maestra—quien las tenga controla tu dinero.',
    glossaryEntropy: 'Números aleatorios que hacen tu frase imposible de adivinar. La base de tu seguridad.',
    glossaryChecksum: 'Dato extra para detectar si escribiste mal una palabra al restaurar.',
    glossary11bits: 'Cada grupo de 11 bits mapea a una de 2048 palabras (2^11 = 2048). ¡Esto hace tu semilla legible pero segura!',
    generateEntropy: 'Generar Nueva Semilla',
    entropyBits: 'Aleatoriedad (base de tu seguridad)',
    entropyDesc: 'La verdadera aleatoriedad es la base de la seguridad',
    checksum: 'Verificación (detectar errores)',
    checksumDesc: 'Detección de errores para detectar errores tipográficos',
    seedPhrase: 'Tus 12-24 palabras clave',
    seedPhraseDesc: 'Representación legible de tu clave maestra',
    words12: '12 Palabras',
    words24: '24 Palabras',
    yourSeed: 'Tu Frase Semilla',
    criticalWarning: '⚠️ REGLAS DE ORO',
    criticalWarningDesc: 'Estas reglas protegen tus bitcoins para siempre',
    neverShare: '❌ Jamás la compartas, ni con tu mejor amigo',
    neverDigital: '❌ Jamás la guardes digitalmente (fotos, nube, email)',
    neverPhoto: '❌ Jamás tomes captura de pantalla',
    neverCloud: '❌ Jamás la pegues en gestores de contraseñas',
    onlyPaper: '✅ Anótala en papel, como en los viejos tiempos',
    onlyMetal: '✅ Grábala en metal para resistencia al fuego',
    onlyMemorize: '✅ Memorízala y destruye el papel',
    bankVsBitcoin: 'Banco vs Bitcoin: La Diferencia Clave',
    bankTitle: '🏦 Banco Tradicional',
    bitcoinTitle: '₿ Bitcoin',
    bankDesc1: '✅ ¿Perdiste la contraseña? Recupera por email',
    bankDesc2: '✅ ¿Cuenta hackeada? El banco revierte',
    bankDesc3: '✅ ¿Olvidaste todo? Verificación de ID',
    bitcoinDesc1: '❌ ¿Perdiste la semilla? Fondos perdidos para siempre',
    bitcoinDesc2: '❌ ¿Hackeado? Nadie puede ayudarte',
    bitcoinDesc3: '❌ Sin recuperación, sin servicio al cliente',
    howItWorks: 'Cómo Nace una Frase Semilla',
    step1Title: 'Paso 1: Aleatoriedad',
    step1Desc: '128 o 256 bits de verdadera aleatoriedad (monedas, dados, o computadora)',
    step2Title: 'Paso 2: Verificación',
    step2Desc: 'Primeros 4 u 8 bits añadidos para detectar si escribiste mal una palabra',
    step3Title: 'Paso 3: Dividir en Grupos de 11 bits',
    step3Desc: 'Cada grupo se convierte en índice (0-2047) para la lista BIP39',
    step4Title: 'Paso 4: Mapear a Palabras',
    step4Desc: '2048 palabras cuidadosamente elegidas, fáciles de identificar',
    entropy: 'Entropía',
    binary: 'Binario',
    word: 'Palabra',
    index: 'Índice',
    copied: '¡Copiado!',
    copySeed: 'Copiar Semilla',
    showSeed: 'Mostrar Semilla',
    hideSeed: 'Ocultar Semilla',
    regenerate: 'Generar Nueva Semilla',
    regenerateConfirm: '¿Generar nueva semilla? La actual se perderá (¡asegúrate de haberla guardado si era importante!)',
    quiz: 'Pon a Prueba tu Conocimiento',
    quizTitle: 'Quiz de Seguridad de Semilla',
    quizDesc: 'Demuestra que entiendes la seguridad de frases semilla',
    quizQuestion: '¿Cuál es la forma MÁS SEGURA de respaldar tu frase semilla?',
    quizCorrect: '✅ ¡Correcto! Los respaldos de metal resisten fuego, agua y tiempo.',
    quizIncorrect: '❌ Incorrecto. Piensa en durabilidad física y privacidad.',
    quizNext: 'Siguiente Pregunta',
    quizComplete: '🎉 ¡Quiz Completado! ¡Entiendes la seguridad de semillas!',
    securityTips: 'Consejos de Seguridad',
    tip1: 'Genera en entorno sin conexión',
    tip2: 'Usa un hardware wallet para generar',
    tip3: 'Nunca escribas tu semilla en un teclado',
    tip4: 'Verifica el respaldo restaurando en otro dispositivo',
    entropyRandom: 'Generación de números aleatorios',
    entropyMath: 'Transformación matemática',
    totalBits: 'Bits totales',
    checksumBits: 'Bits de checksum',
    finalBits: 'Entropía final',
    labCompleted: '🎉 ¡Lab Completado!',
    labCompletedDesc: 'Ahora entiendes por qué tu frase semilla es tu tesoro más valioso 💎',
    startQuiz: 'Iniciar Quiz',
    question: 'Pregunta',
    score: 'Puntuación',
    tryAgain: 'Intentar de Nuevo',
    complete: 'Completar',
    bip39Standard: 'Estándar BIP39',
    bip39Desc: 'BIP39 define el estándar para códigos mnemónicos. Usa 2048 palabras cuidadosamente seleccionadas de varios idiomas para crear respaldos legibles de claves criptográficas.',
    makeSureNoOneWatching: '(¡Asegúrate de que nadie esté viendo!)',
  },
};

// ============================================================================
// Types & Helpers - CORREGIDOS CON @scure/bip39 v1.4.0
// ============================================================================

interface SeedWord {
  word: string;
  index: number;
  binary: string;
  entropyBits: string;
}

// ✅ Convertir mnemonic a SeedWord[] para visualización educativa
function mnemonicToSeedWords(mnemonic: string): SeedWord[] {
  const words = mnemonic.split(' ');
  const seedWords: SeedWord[] = [];
  
  // Obtener entropía del mnemonic usando la wordlist
  const entropyBytes = mnemonicToEntropy(mnemonic, wordlist);
  const entropyBinary = Array.from(entropyBytes)
    .map(b => b.toString(2).padStart(8, '0'))
    .join('');
  
  // Calcular checksum real con SHA256 (BIP39 estándar)
  const checksum = calculateChecksum(entropyBinary);
  const combined = entropyBinary + checksum;
  
  // Mapear cada palabra a su índice y bits usando la wordlist
  words.forEach((word, i) => {
    const index = wordlist.indexOf(word);
    const chunk = combined.slice(i * 11, (i + 1) * 11);
    
    seedWords.push({
      word,
      index,
      binary: chunk,
      entropyBits: chunk.slice(0, 8),
    });
  });
  
  return seedWords;
}

// ✅ Calcular checksum con SHA256 REAL (BIP39 estándar)
function calculateChecksum(entropy: string): string {
  const entropyBytes = new Uint8Array(entropy.length / 8);
  for (let i = 0; i < entropy.length; i += 8) {
    entropyBytes[i / 8] = parseInt(entropy.slice(i, i + 8), 2);
  }
  
  const hash = sha256(entropyBytes);
  
  const hashBinary = Array.from(hash as Uint8Array)
    .map(b => b.toString(2).padStart(8, '0'))
    .join('');
  
  const checksumLength = entropy.length / 32; // 128 bits = 4, 256 bits = 8
  return hashBinary.slice(0, checksumLength);
}

// ✅ Generar mnemonic válido usando @scure/bip39 con wordlist
function generateValidMnemonic(wordCount: 12 | 24): string {
  const strength = wordCount === 12 ? 128 : 256;
  return generateMnemonic(wordlist, strength);
}

// ============================================================================
// Quiz Questions
// ============================================================================
interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

const getQuizQuestions = (lang: 'en' | 'es'): QuizQuestion[] => [
  {
    question: lang === 'en'
      ? 'What is the SAFEST way to backup your seed phrase?'
      : '¿Cuál es la forma MÁS SEGURA de respaldar tu frase semilla?',
    options: lang === 'en'
      ? ['Screenshot on phone', 'Email to yourself', 'Etched on metal plate', 'Saved in Notes app']
      : ['Captura en el celular', 'Email a ti mismo', 'Grabado en placa de metal', 'Guardado en Notas'],
    correct: 2,
    explanation: lang === 'en'
      ? '✅ Metal backups resist fire, water, and physical damage. Digital storage can be hacked or lost.'
      : '✅ Los respaldos de metal resisten fuego, agua y daño físico. El almacenamiento digital puede ser hackeado o perdido.',
  },
  {
    question: lang === 'en'
      ? 'If someone asks for your seed phrase to "verify" your wallet, you should:'
      : 'Si alguien pide tu frase semilla para "verificar" tu wallet, debes:',
    options: lang === 'en'
      ? ['Share it if they seem trustworthy', 'Only share half the words', 'Never share it - it\'s a scam', 'Share it with support staff']
      : ['Compartirla si parecen confiables', 'Solo compartir la mitad de palabras', 'Nunca compartirla - es estafa', 'Compartirla con soporte'],
    correct: 2,
    explanation: lang === 'en'
      ? '✅ NEVER share your seed phrase. Legitimate services NEVER ask for it. Anyone who asks is trying to steal your Bitcoin.'
      : '✅ NUNCA compartas tu frase semilla. Los servicios legítimos NUNCA la piden. Quien la pide intenta robar tu Bitcoin.',
  },
  {
    question: lang === 'en'
      ? 'What happens if you lose your seed phrase and your device breaks?'
      : '¿Qué pasa si pierdes tu frase semilla y tu dispositivo se rompe?',
    options: lang === 'en'
      ? ['Contact Bitcoin support to recover', 'Your funds are lost forever', 'Use your ID to recover account', 'Create a new wallet with same address']
      : ['Contactar soporte de Bitcoin para recuperar', 'Tus fondos están perdidos para siempre', 'Usar tu ID para recuperar cuenta', 'Crear nuevo wallet con misma dirección'],
    correct: 1,
    explanation: lang === 'en'
      ? '✅ There is no "forgot password" in Bitcoin. No seed = no funds. This is why backups are CRITICAL.'
      : '✅ No existe "olvidé mi contraseña" en Bitcoin. Sin semilla = sin fondos. Por eso los respaldos son CRÍTICOS.',
  },
  {
    question: lang === 'en'
      ? 'Why does Bitcoin use words instead of random characters?'
      : '¿Por qué Bitcoin usa palabras en vez de caracteres aleatorios?',
    options: lang === 'en'
      ? ['Easier for humans to write and verify', 'More secure than random characters', 'It\'s just tradition', 'Words are shorter to type']
      : ['Más fácil para humanos escribir y verificar', 'Más seguro que caracteres aleatorios', 'Es solo tradición', 'Las palabras son más cortas de escribir'],
    correct: 0,
    explanation: lang === 'en'
      ? '✅ Humans make fewer errors with words. Try writing "witch collapse practice feed shame open despair creek road again ice least" vs "a7f3b2c9..."'
      : '✅ Los humanos cometen menos errores con palabras. Intenta escribir palabras vs caracteres aleatorios.',
  },
];

// ============================================================================
// Main Component - SeedLabPage
// ============================================================================
export default function SeedLabPage({ params }: { params: { lang: 'en' | 'es' } }) {
  const lang = params.lang || 'en';
  const t = translations[lang];
  
  const [wordCount, setWordCount] = useState<12 | 24>(12);
  const [mnemonic, setMnemonic] = useState<string>('');
  const [entropy, setEntropy] = useState<string>('');
  const [seedWords, setSeedWords] = useState<SeedWord[]>([]);
  const [showSeed, setShowSeed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [showVisualization, setShowVisualization] = useState(true);
  const [labCompleted, setLabCompleted] = useState(false);
  
  // Quiz state
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);
  
  const quizQuestions = getQuizQuestions(lang);
  
  // ✅ SOLUCIÓN 1: Mostrar semilla inmediatamente al generar
  const generateNewSeed = useCallback(() => {
    console.log('🔄 generateNewSeed iniciado');
    try {
      // 🔐 Confirm before regenerating if seed is visible
      if (showSeed && seedWords.length > 0) {
        const confirmed = window.confirm(t.regenerateConfirm);
        if (!confirmed) return;
      }
      
      // Generar mnemonic válido con @scure/bip39 usando wordlist
      const newMnemonic = generateValidMnemonic(wordCount);
      console.log('✅ Mnemónico generado:', newMnemonic);
      
      setMnemonic(newMnemonic);
      
      // Convertir a SeedWords para visualización
      const words = mnemonicToSeedWords(newMnemonic);
      console.log('✅ Palabras convertidas:', words.length);
      
      setSeedWords(words);
      
      // ✅ MOSTRAR SEMILLA INMEDIATAMENTE (Solución 1!)
      setShowSeed(true);
      
      // Calcular entropía para visualización usando wordlist
      const entropyBytes = mnemonicToEntropy(newMnemonic, wordlist);
      const entropyBinary = Array.from(entropyBytes)
        .map(b => b.toString(2).padStart(8, '0'))
        .join('');
      setEntropy(entropyBinary);
      
      setActiveStep(0);
      setCopied(false);
    } catch (error) {
      console.error('❌ ERROR en generateNewSeed:', error);
    }
  }, [wordCount, showSeed, seedWords.length, t.regenerateConfirm]);
  
  // Generar semilla inicial al montar componente
  useEffect(() => {
    generateNewSeed();
  }, []); // Solo al inicio
  
  const copySeed = async () => {
    await navigator.clipboard.writeText(mnemonic);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
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
      setLabCompleted(true); // 🎓 Mark lab as completed!
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
  
  useEffect(() => {
    if (entropy) {
      const interval = setInterval(() => {
        setActiveStep(prev => (prev < 3 ? prev + 1 : prev));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [entropy]);
  
  const checksum = entropy ? calculateChecksum(entropy) : '';
  const totalBits = wordCount === 12 ? 128 : 256;
  const checksumBits = wordCount === 12 ? 4 : 8;
  
  return (
    <div className="min-h-screen bg-slate-950 text-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-full px-4 py-2 mb-4"
            whileHover={{ scale: 1.05 }}
          >
            <Shield className="w-4 h-4 text-red-400" />
            <span className="text-red-400 text-sm font-mono uppercase tracking-wider">
              {lang === 'es' ? 'Lección Más Importante' : 'Most Important Lesson'}
            </span>
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <Key className="w-10 h-10 text-orange-400" />
            {t.title}
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            {t.subtitle}
          </p>
        </motion.div>
        
        {/* 🎓 Lab Completed Badge */}
        <AnimatePresence>
          {labCompleted && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className="mb-8 p-4 bg-gradient-to-r from-emerald-500/10 to-green-500/10 border-2 border-emerald-500/40 rounded-2xl text-center relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.1)_0%,transparent_70%)] pointer-events-none" />
              <div className="flex items-center justify-center gap-2 mb-2 relative z-10">
                <Trophy className="w-6 h-6 text-emerald-400 animate-bounce" />
                <span className="text-emerald-300 font-mono text-lg font-bold">
                  {t.labCompleted}
                </span>
                <Trophy className="w-6 h-6 text-emerald-400 animate-bounce" />
              </div>
              <p className="text-slate-400 text-sm relative z-10">
                {t.labCompletedDesc}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Intro */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-6 mb-8"
        >
          <h3 className="text-lg font-bold text-blue-400 mb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            {t.introTitle}
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed">
            {t.introText}
          </p>
        </motion.div>
        
        {/* Bank vs Bitcoin */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 mb-8"
        >
          <h3 className="text-lg font-bold text-white mb-6 text-center flex items-center justify-center gap-2">
            <BookOpen className="w-5 h-5 text-orange-400" />
            {t.bankVsBitcoin}
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-5">
              <h4 className="text-lg font-bold text-blue-400 mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                {t.bankTitle}
              </h4>
              <ul className="space-y-3">
                {[t.bankDesc1, t.bankDesc2, t.bankDesc3].map((desc, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <CheckCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                    {desc}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-5">
              <h4 className="text-lg font-bold text-orange-400 mb-4 flex items-center gap-2">
                <Wallet className="w-5 h-5" />
                {t.bitcoinTitle}
              </h4>
              <ul className="space-y-3">
                {[t.bitcoinDesc1, t.bitcoinDesc2, t.bitcoinDesc3].map((desc, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <XCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                    {desc}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-center">
            <p className="text-amber-400 font-mono text-sm">
              {lang === 'en'
                ? '🔓 In Bitcoin, YOU are the bank. Your seed = your keys = your Bitcoin.'
                : '🔓 En Bitcoin, TÚ eres el banco. Tu semilla = tus claves = tu Bitcoin.'
              }
            </p>
          </div>
        </motion.div>
        
        {/* Critical Warning */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-500/10 border-2 border-red-500/50 rounded-2xl p-6 mb-8 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(239,68,68,0.1)_0%,transparent_70%)] pointer-events-none" />
          <h3 className="text-lg font-bold text-red-400 mb-3 flex items-center gap-2 relative z-10">
            <AlertTriangle className="w-5 h-5 animate-pulse" />
            {t.criticalWarning}
          </h3>
          <p className="text-sm text-red-300 mb-4 relative z-10">{t.criticalWarningDesc}</p>
          <div className="grid sm:grid-cols-2 gap-4 relative z-10">
            <div className="space-y-2">
              <p className="text-sm text-slate-400 font-mono">❌ {lang === 'en' ? 'NEVER' : 'NUNCA'}</p>
              <ul className="text-sm space-y-1">
                <li className="text-red-400">{t.neverShare}</li>
                <li className="text-red-400">{t.neverDigital}</li>
                <li className="text-red-400">{t.neverPhoto}</li>
              </ul>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-slate-400 font-mono">✅ {lang === 'en' ? 'ONLY' : 'SOLO'}</p>
              <ul className="text-sm space-y-1">
                <li className="text-green-400">{t.onlyPaper}</li>
                <li className="text-green-400">{t.onlyMetal}</li>
                <li className="text-green-400">{t.onlyMemorize}</li>
              </ul>
            </div>
          </div>
        </motion.div>
        
        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Panel - Controls */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1 space-y-6"
          >
            {/* Word Count */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Dices className="w-5 h-5 text-orange-400" />
                {t.entropyRandom}
              </h3>
              <div className="flex gap-2 mb-4">
                {[12, 24].map((count) => (
                  <motion.button
                    key={count}
                    onClick={() => setWordCount(count as 12 | 24)}
                    className={`flex-1 py-3 rounded-xl font-mono text-sm transition-all min-h-[56px] touch-manipulation ${
                      wordCount === count
                        ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {count === 12 ? t.words12 : t.words24}
                  </motion.button>
                ))}
              </div>
              <motion.button
                onClick={generateNewSeed}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white py-4 rounded-xl font-medium flex items-center justify-center gap-2 min-h-[56px] touch-manipulation"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <RefreshCw className="w-5 h-5" />
                {t.regenerate}
              </motion.button>
              
              {/* Stats */}
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="bg-slate-800 rounded-lg p-2">
                  <p className="text-xs text-slate-500">{t.totalBits}</p>
                  <p className="font-mono text-orange-400">{totalBits}</p>
                </div>
                <div className="bg-slate-800 rounded-lg p-2">
                  <p className="text-xs text-slate-500">{t.checksumBits}</p>
                  <p className="font-mono text-blue-400">{checksumBits}</p>
                </div>
                <div className="bg-slate-800 rounded-lg p-2">
                  <p className="text-xs text-slate-500">{t.finalBits}</p>
                  <p className="font-mono text-green-400">{totalBits + checksumBits}</p>
                </div>
              </div>
            </div>
            
            {/* How It Works */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                {t.howItWorks}
              </h3>
              <div className="space-y-3">
                {[
                  { title: t.step1Title, desc: t.step1Desc, icon: Dices },
                  { title: t.step2Title, desc: t.step2Desc, icon: Shield },
                  { title: t.step3Title, desc: t.step3Desc, icon: FileText },
                  { title: t.step4Title, desc: t.step4Desc, icon: Key },
                ].map((step, i) => (
                  <motion.div
                    key={i}
                    className={`p-3 rounded-xl transition-all ${
                      i <= activeStep
                        ? 'bg-orange-500/20 border border-orange-500/30'
                        : 'bg-slate-800/50 border border-slate-700'
                    }`}
                    animate={{ scale: i === activeStep ? 1.02 : 1 }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono ${
                        i <= activeStep ? 'bg-orange-500 text-white' : 'bg-slate-700 text-slate-400'
                      }`}>
                        {i + 1}
                      </span>
                      <step.icon className={`w-4 h-4 ${
                        i <= activeStep ? 'text-orange-400' : 'text-slate-500'
                      }`} />
                      <span className="font-mono text-sm text-white">{step.title}</span>
                    </div>
                    <p className="text-xs text-slate-400 pl-8">{step.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
          
          {/* Center Panel - Seed Display */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 min-h-[500px]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Key className="w-5 h-5 text-orange-400" />
                  {t.yourSeed}
                  <InfoTooltip content={t.glossarySeedPhrase} />
                </h3>
                <div className="flex gap-2">
                  <motion.button
                    onClick={() => setShowSeed(!showSeed)}
                    className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors min-h-[44px] min-w-[44px] touch-manipulation"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {showSeed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </motion.button>
                  <motion.button
                    onClick={copySeed}
                    disabled={!showSeed}
                    className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors disabled:opacity-50 min-h-[44px] min-w-[44px] touch-manipulation"
                    whileHover={{ scale: showSeed ? 1.1 : 1 }}
                    whileTap={{ scale: showSeed ? 0.9 : 1 }}
                  >
                    {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  </motion.button>
                </div>
              </div>
              
              {/* Seed Words Grid - AHORA SIEMPRE VISIBLE SI EXISTEN */}
              {seedWords.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-3 gap-2"
                >
                  {seedWords.map((word, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-3 relative group border border-slate-700 hover:border-orange-500/50 transition-colors"
                    >
                      <span className="absolute top-1 left-2 text-xs text-slate-600 font-mono">
                        {i + 1}
                      </span>
                      <p className="font-mono text-sm text-orange-400 text-center mt-2">
                        {word.word}
                      </p>
                      
                      {/* Educational Tooltip */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-700 rounded-lg text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 max-w-[180px] shadow-xl border border-orange-500/20">
                        <p className="text-orange-300 font-mono mb-1">Index: {word.index}</p>
                        <p className="text-slate-400">{t.glossary11bits}</p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
              
              {/* Mensaje si no hay semilla */}
              {seedWords.length === 0 && (
                <div className="h-64 flex items-center justify-center">
                  <div className="text-center">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="inline-flex items-center justify-center w-16 h-16 bg-slate-800 rounded-full mb-4"
                    >
                      <Dices className="w-8 h-8 text-orange-400" />
                    </motion.div>
                    <p className="text-slate-400 text-sm">Click "Generate New Seed" to start</p>
                  </div>
                </div>
              )}
              
              {/* Entropy Visualization */}
              {showVisualization && entropy && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 p-3 bg-slate-800/50 rounded-xl"
                >
                  <p className="text-xs text-slate-500 mb-2 flex items-center gap-1">
                    {t.entropyBits}:
                    <InfoTooltip content={t.glossaryEntropy} />
                  </p>
                  <div className="font-mono text-xs text-slate-400 break-all leading-relaxed">
                    {entropy.slice(0, 64)}...
                  </div>
                  <p className="text-xs text-slate-500 mt-2 mb-1 flex items-center gap-1">
                    {t.checksum}:
                    <InfoTooltip content={t.glossaryChecksum} />
                  </p>
                  <div className="font-mono text-xs text-blue-400">
                    {checksum}
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
          
          {/* Right Panel - Quiz & Tips */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1 space-y-6"
          >
            {/* Quiz */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-purple-400" />
                {t.quiz}
              </h3>
              {!quizStarted && !quizComplete && (
                <div>
                  <p className="text-sm text-slate-400 mb-4">{t.quizDesc}</p>
                  <motion.button
                    onClick={() => setQuizStarted(true)}
                    className="w-full bg-purple-500 hover:bg-purple-600 text-white py-4 rounded-xl font-medium min-h-[56px] touch-manipulation"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {t.startQuiz}
                  </motion.button>
                </div>
              )}
              
              {quizStarted && !quizComplete && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs text-slate-500">
                      {t.question} {currentQuestion + 1}/{quizQuestions.length}
                    </span>
                    <span className="text-xs text-purple-400">
                      {t.score}: {score}
                    </span>
                  </div>
                  <p className="text-sm text-white mb-4">
                    {quizQuestions[currentQuestion].question}
                  </p>
                  <div className="space-y-2">
                    {quizQuestions[currentQuestion].options.map((option, i) => (
                      <motion.button
                        key={i}
                        onClick={() => !showResult && handleAnswer(i)}
                        disabled={showResult}
                        className={`w-full p-3 rounded-xl text-sm text-left transition-all min-h-[56px] touch-manipulation ${
                          showResult
                            ? i === quizQuestions[currentQuestion].correct
                              ? 'bg-green-500/20 border border-green-500/50 text-green-400'
                              : i === selectedAnswer
                              ? 'bg-red-500/20 border border-red-500/50 text-red-400'
                              : 'bg-slate-800 text-slate-500'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                        }`}
                        whileHover={!showResult ? { scale: 1.02 } : {}}
                        whileTap={!showResult ? { scale: 0.98 } : {}}
                      >
                        {option}
                      </motion.button>
                    ))}
                  </div>
                  {showResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4"
                    >
                      <p className={`text-sm mb-4 ${
                        selectedAnswer === quizQuestions[currentQuestion].correct
                          ? 'text-green-400'
                          : 'text-red-400'
                      }`}>
                        {quizQuestions[currentQuestion].explanation}
                      </p>
                      <motion.button
                        onClick={nextQuestion}
                        className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 rounded-xl text-sm min-h-[48px] touch-manipulation"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {currentQuestion < quizQuestions.length - 1 ? t.quizNext : t.complete}
                      </motion.button>
                    </motion.div>
                  )}
                </div>
              )}
              
              {quizComplete && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center"
                >
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 0.5 }}
                    className="text-4xl mb-4"
                  >
                    🎉
                  </motion.div>
                  <p className="text-green-400 font-mono mb-2">{t.quizComplete}</p>
                  <p className="text-slate-400 text-sm mb-4">
                    {t.score}: {score}/{quizQuestions.length}
                  </p>
                  <motion.button
                    onClick={resetQuiz}
                    className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-sm min-h-[48px] touch-manipulation"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {t.tryAgain}
                  </motion.button>
                </motion.div>
              )}
            </div>
            
            {/* Security Tips */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-400" />
                {t.securityTips}
              </h3>
              <ul className="space-y-3">
                {[
                  { icon: Lock, text: t.tip1 },
                  { icon: Wallet, text: t.tip2 },
                  { icon: Key, text: t.tip3 },
                  { icon: CheckCircle, text: t.tip4 },
                ].map((tip, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-2 text-sm text-slate-300"
                  >
                    <tip.icon className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    {tip.text}
                  </motion.li>
                ))}
              </ul>
            </div>
            
            {/* BIP39 Info */}
            <div className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-orange-400 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                {t.bip39Standard}
              </h3>
              <p className="text-xs text-slate-400">
                {t.bip39Desc}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
      
      <BobChatWidget mode="floating" context="seed" lang={lang} />
    </div>
  );
}