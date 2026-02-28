'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Dices, Shield, AlertTriangle, Key, Eye, EyeOff, 
  Copy, Check, RefreshCw, BookOpen, Sparkles,
  Lock, Unlock, Trash2, Zap, FileText, Fingerprint,
  Wallet, Building2, XCircle, CheckCircle, HelpCircle
} from 'lucide-react';
import { InfoTooltip } from '@/components/ui/InfoTooltip';

// 🔢 Entropy → Seed Phrase Visualizer
// The MOST IMPORTANT lesson for Bitcoin newcomers!

// BIP39 Wordlist (English - first 256 words for demo)
const BIP39_WORDS = [
  'abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract',
  'absurd', 'abuse', 'access', 'accident', 'account', 'accuse', 'achieve', 'acid',
  'acoustic', 'acquire', 'across', 'act', 'action', 'actor', 'actress', 'actual',
  'adapt', 'add', 'addict', 'address', 'adjust', 'admit', 'adult', 'advance',
  'advice', 'aerobic', 'affair', 'afford', 'afraid', 'again', 'age', 'agent',
  'agree', 'ahead', 'aim', 'air', 'airport', 'aisle', 'alarm', 'album',
  'alcohol', 'alert', 'alien', 'all', 'alley', 'allow', 'almost', 'alone',
  'alpha', 'already', 'also', 'alter', 'always', 'amateur', 'amazing', 'among',
  'amount', 'amused', 'analyst', 'anchor', 'ancient', 'anger', 'angle', 'angry',
  'animal', 'ankle', 'announce', 'annual', 'another', 'answer', 'antenna', 'antique',
  'anxiety', 'any', 'apart', 'apology', 'appear', 'apple', 'approve', 'april',
  'arch', 'arctic', 'area', 'arena', 'argue', 'arm', 'armed', 'armor',
  'army', 'around', 'arrange', 'arrest', 'arrive', 'arrow', 'art', 'artefact',
  'artist', 'artwork', 'ask', 'aspect', 'assault', 'asset', 'assist', 'assume',
  'asthma', 'athlete', 'atom', 'attack', 'attend', 'attitude', 'attract', 'auction',
  'audit', 'august', 'aunt', 'author', 'auto', 'autumn', 'average', 'avocado',
  'avoid', 'awake', 'aware', 'away', 'awesome', 'awful', 'awkward', 'axis',
  'baby', 'bachelor', 'bacon', 'badge', 'bag', 'balance', 'balcony', 'ball',
  'bamboo', 'banana', 'banner', 'bar', 'barely', 'bargain', 'barrel', 'base',
  'basic', 'basket', 'battle', 'beach', 'bean', 'beauty', 'because', 'become',
  'beef', 'before', 'begin', 'behave', 'behind', 'believe', 'below', 'belt',
  'bench', 'benefit', 'best', 'betray', 'better', 'between', 'beyond', 'bicycle',
  'bid', 'bike', 'bind', 'biology', 'bird', 'birth', 'bitter', 'black',
  'blade', 'blame', 'blanket', 'blast', 'bleak', 'bless', 'blind', 'blood',
  'blossom', 'blouse', 'blue', 'blur', 'blush', 'board', 'boat', 'body',
  'boil', 'bomb', 'bone', 'bonus', 'book', 'boost', 'border', 'boring',
  'borrow', 'boss', 'bottom', 'bounce', 'box', 'boy', 'bracket', 'brain',
  'brand', 'brass', 'brave', 'bread', 'breeze', 'brick', 'bridge', 'brief',
  'bright', 'bring', 'brisk', 'broccoli', 'broken', 'bronze', 'broom', 'brother',
  'brown', 'brush', 'bubble', 'buddy', 'budget', 'buffalo', 'build', 'bulb',
  'bulk', 'bullet', 'bundle', 'bunker', 'burden', 'burger', 'burst', 'bus',
  'business', 'busy', 'butter', 'buyer', 'buzz', 'cabbage', 'cabin', 'cable',
  'cactus', 'cage', 'cake', 'call', 'calm', 'camera', 'camp', 'canal',
  'candy', 'cannon', 'canoe', 'canvas', 'canyon', 'capable', 'capital', 'captain',
  'car', 'carbon', 'card', 'cargo', 'carpet', 'carry', 'cart', 'case',
  'cash', 'casino', 'castle', 'casual', 'cat', 'catalog', 'catch', 'category'
];

// Extended wordlist simulation (in production, use full 2048 words)
const getWord = (index: number): string => {
  const wordIndex = index % 2048;
  if (wordIndex < BIP39_WORDS.length) {
    return BIP39_WORDS[wordIndex];
  }
  // Simulate remaining words
  return `word${wordIndex}`;
};

interface Translations {
  title: string;
  subtitle: string;
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
}

const translations: Record<'en' | 'es', Translations> = {
  en: {
    title: 'Seed Phrase Lab',
    subtitle: 'Understand the most important 12-24 words of your Bitcoin journey',
    generateEntropy: 'Generate New Seed',
    entropyBits: 'Entropy (Random Bits)',
    entropyDesc: 'True randomness is the foundation of security',
    checksum: 'Checksum',
    checksumDesc: 'Error detection to catch typos',
    seedPhrase: 'Seed Phrase (BIP39)',
    seedPhraseDesc: 'Human-readable representation of your master key',
    words12: '12 Words',
    words24: '24 Words',
    yourSeed: 'Your Seed Phrase',
    criticalWarning: '⚠️ CRITICAL SECURITY RULES',
    criticalWarningDesc: 'Violating these rules can result in PERMANENT loss of funds',
    neverShare: '❌ NEVER share your seed with anyone',
    neverDigital: '❌ NEVER store digitally (photos, cloud, email)',
    neverPhoto: '❌ NEVER take a screenshot',
    neverCloud: '❌ NEVER paste in password managers',
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
    step1Title: 'Generate Entropy',
    step1Desc: '128 or 256 bits of true randomness (coin flips, dice, or computer)',
    step2Title: 'Calculate Checksum',
    step2Desc: 'First 4 or 8 bits of SHA256(entropy) added for error detection',
    step3Title: 'Split into 11-bit Groups',
    step3Desc: 'Each group becomes an index (0-2047) for the BIP39 wordlist',
    step4Title: 'Map to Words',
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
  },
  es: {
    title: 'Laboratorio de Semilla',
    subtitle: 'Entiende las 12-24 palabras más importantes de tu viaje en Bitcoin',
    generateEntropy: 'Generar Nueva Semilla',
    entropyBits: 'Entropía (Bits Aleatorios)',
    entropyDesc: 'La verdadera aleatoriedad es la base de la seguridad',
    checksum: 'Checksum',
    checksumDesc: 'Detección de errores para detectar errores tipográficos',
    seedPhrase: 'Frase Semilla (BIP39)',
    seedPhraseDesc: 'Representación legible de tu clave maestra',
    words12: '12 Palabras',
    words24: '24 Palabras',
    yourSeed: 'Tu Frase Semilla',
    criticalWarning: '⚠️ REGLAS CRÍTICAS DE SEGURIDAD',
    criticalWarningDesc: 'Violar estas reglas puede resultar en pérdida PERMANENTE de fondos',
    neverShare: '❌ NUNCA compartas tu semilla con nadie',
    neverDigital: '❌ NUNCA guardes digitalmente (fotos, nube, email)',
    neverPhoto: '❌ NUNCA tomes captura de pantalla',
    neverCloud: '❌ NUNCA pegues en gestores de contraseñas',
    onlyPaper: '✅ Escribe solo en papel',
    onlyMetal: '✅ Graba en metal para resistencia al fuego',
    onlyMemorize: '✅ Memoriza y destruye el papel',
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
    step1Title: 'Generar Entropía',
    step1Desc: '128 o 256 bits de verdadera aleatoriedad (monedas, dados, o computadora)',
    step2Title: 'Calcular Checksum',
    step2Desc: 'Primeros 4 u 8 bits de SHA256(entropía) añadidos para detectar errores',
    step3Title: 'Dividir en Grupos de 11 bits',
    step3Desc: 'Cada grupo se convierte en índice (0-2047) para la lista BIP39',
    step4Title: 'Mapear a Palabras',
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
  },
};

// 🔢 Generate random entropy
function generateEntropy(bits: 128 | 256): string {
  const bytes = bits / 8;
  const array = new Uint8Array(bytes);
  
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(array);
  } else {
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  
  // Convert to binary string
  return Array.from(array)
    .map(b => b.toString(2).padStart(8, '0'))
    .join('');
}

// 🔐 Calculate checksum (simulated SHA-256)
function calculateChecksum(entropy: string): string {
  let hash = 0n;
  for (let i = 0; i < entropy.length; i++) {
    hash = ((hash << 5n) - hash) + BigInt(entropy[i] === '1' ? 1 : 0);
    hash = hash & ((1n << 256n) - 1n);
  }
  
  const checksumLength = entropy.length / 32; // 4 for 128-bit, 8 for 256-bit
  return hash.toString(2).padStart(256, '0').slice(0, checksumLength);
}

// 📝 Convert entropy + checksum to seed phrase
interface SeedWord {
  word: string;
  index: number;
  binary: string;
  entropyBits: string;
}

function entropyToSeedPhrase(entropy: string): SeedWord[] {
  const checksum = calculateChecksum(entropy);
  const combined = entropy + checksum;
  const words: SeedWord[] = [];
  
  // Split into 11-bit chunks
  for (let i = 0; i < combined.length; i += 11) {
    const chunk = combined.slice(i, i + 11);
    if (chunk.length === 11) {
      const index = parseInt(chunk, 2);
      words.push({
        word: getWord(index),
        index,
        binary: chunk,
        entropyBits: chunk.slice(0, 8), // Show first 8 bits from entropy
      });
    }
  }
  
  return words;
}

// ❓ Quiz questions
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

export default function SeedLabPage({ params }: { params: { lang: 'en' | 'es' } }) {
  const lang = params.lang || 'en';
  const t = translations[lang];
  
  const [wordCount, setWordCount] = useState<12 | 24>(12);
  const [entropy, setEntropy] = useState<string>('');
  const [seedWords, setSeedWords] = useState<SeedWord[]>([]);
  const [showSeed, setShowSeed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [showVisualization, setShowVisualization] = useState(true);
  
  // Quiz state
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);
  
  const quizQuestions = getQuizQuestions(lang);
  
  // Generate new seed
  const generateNewSeed = useCallback(() => {
    const bits = wordCount === 12 ? 128 : 256;
    const newEntropy = generateEntropy(bits);
    setEntropy(newEntropy);
    setSeedWords(entropyToSeedPhrase(newEntropy));
    setShowSeed(false);
    setActiveStep(0);
    setCopied(false);
  }, [wordCount]);
  
  // Generate on mount
  useEffect(() => {
    generateNewSeed();
  }, [generateNewSeed]);
  
  // Copy seed phrase
  const copySeed = async () => {
    const phrase = seedWords.map(w => w.word).join(' ');
    await navigator.clipboard.writeText(phrase);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  // Handle quiz answer
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
  
  // Animate steps
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
              Most Important Lesson
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

        {/* Critical Warning Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-500/10 border-2 border-red-500/50 rounded-2xl p-6 mb-8"
        >
          <h3 className="text-lg font-bold text-red-400 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 animate-pulse" />
            {t.criticalWarning}
          </h3>
          <p className="text-sm text-red-300 mb-4">{t.criticalWarningDesc}</p>
          
          <div className="grid sm:grid-cols-2 gap-4">
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

        {/* Bank vs Bitcoin Comparison */}
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
            {/* Bank */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-5">
              <h4 className="text-lg font-bold text-blue-400 mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                {t.bankTitle}
              </h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-2 text-sm text-slate-300">
                  <CheckCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  {t.bankDesc1}
                </li>
                <li className="flex items-start gap-2 text-sm text-slate-300">
                  <CheckCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  {t.bankDesc2}
                </li>
                <li className="flex items-start gap-2 text-sm text-slate-300">
                  <CheckCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  {t.bankDesc3}
                </li>
              </ul>
            </div>
            
            {/* Bitcoin */}
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-5">
              <h4 className="text-lg font-bold text-orange-400 mb-4 flex items-center gap-2">
                <Wallet className="w-5 h-5" />
                {t.bitcoinTitle}
              </h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-2 text-sm text-slate-300">
                  <XCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                  {t.bitcoinDesc1}
                </li>
                <li className="flex items-start gap-2 text-sm text-slate-300">
                  <XCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                  {t.bitcoinDesc2}
                </li>
                <li className="flex items-start gap-2 text-sm text-slate-300">
                  <XCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                  {t.bitcoinDesc3}
                </li>
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

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Panel - Controls */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1 space-y-6"
          >
            {/* Word Count Selector */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Dices className="w-5 h-5 text-orange-400" />
                {t.entropyRandom}
              </h3>
              
              <div className="flex gap-2 mb-4">
                {[12, 24].map((count) => (
                  <motion.button
                    key={count}
                    onClick={() => {
                      setWordCount(count as 12 | 24);
                    }}
                    className={`flex-1 py-3 rounded-xl font-mono text-sm transition-all ${
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
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2"
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
                    animate={{
                      scale: i === activeStep ? 1.02 : 1,
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono ${
                        i <= activeStep ? 'bg-orange-500 text-white' : 'bg-slate-700 text-slate-400'
                      }`}>
                        {i + 1}
                      </span>
                      <step.icon className={`w-4 h-4 ${i <= activeStep ? 'text-orange-400' : 'text-slate-500'}`} />
                      <span className="font-mono text-sm text-white">{step.title}</span>
                    </div>
                    <p className="text-xs text-slate-400 pl-8">{step.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Center Panel - Seed Phrase Display */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 min-h-[500px]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Lock className="w-5 h-5 text-orange-400" />
                  {t.yourSeed}
                </h3>
                <div className="flex gap-2">
                  <motion.button
                    onClick={() => setShowSeed(!showSeed)}
                    className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {showSeed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </motion.button>
                  <motion.button
                    onClick={copySeed}
                    disabled={!showSeed}
                    className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors disabled:opacity-50"
                    whileHover={{ scale: showSeed ? 1.1 : 1 }}
                    whileTap={{ scale: showSeed ? 0.9 : 1 }}
                  >
                    {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  </motion.button>
                </div>
              </div>
              
              {/* Warning when hidden */}
              {!showSeed && (
                <div className="h-64 flex items-center justify-center">
                  <div className="text-center">
                    <div className="relative">
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="inline-flex items-center justify-center w-16 h-16 bg-slate-800 rounded-full"
                      >
                        <Lock className="w-8 h-8 text-orange-400" />
                      </motion.div>
                      <motion.div
                        className="absolute inset-0 border-2 border-orange-400/30 rounded-full"
                        animate={{ scale: [1, 1.3, 1], opacity: [1, 0, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    </div>
                    <p className="text-slate-400 mt-4 text-sm">
                      {t.showSeed}
                    </p>
                    <p className="text-slate-500 text-xs mt-1">
                      {lang === 'en' ? '(Make sure no one is watching!)' : '(¡Asegúrate de que nadie esté viendo!)'}
                    </p>
                  </div>
                </div>
              )}
              
              {/* Seed Words Grid */}
              {showSeed && seedWords.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-3 gap-2"
                >
                  {seedWords.map((word, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-slate-800 rounded-xl p-3 relative group"
                    >
                      <span className="absolute top-1 left-2 text-xs text-slate-600 font-mono">
                        {i + 1}
                      </span>
                      <p className="font-mono text-sm text-orange-400 text-center mt-2">
                        {word.word}
                      </p>
                      
                      {/* Tooltip with index */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-700 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        <span className="text-slate-400">Index: </span>
                        <span className="text-orange-400">{word.index}</span>
                        <span className="text-slate-500 ml-2">({word.binary})</span>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
              
              {/* Entropy Visualization */}
              {showSeed && showVisualization && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 p-3 bg-slate-800/50 rounded-xl"
                >
                  <p className="text-xs text-slate-500 mb-2">{t.entropyBits}:</p>
                  <div className="font-mono text-xs text-slate-400 break-all leading-relaxed">
                    {entropy.slice(0, 64)}...
                  </div>
                  <p className="text-xs text-slate-500 mt-2 mb-1">{t.checksum}:</p>
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
                    className="w-full bg-purple-500 hover:bg-purple-600 text-white py-3 rounded-xl font-medium"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {lang === 'en' ? 'Start Quiz' : 'Iniciar Quiz'}
                  </motion.button>
                </div>
              )}
              
              {quizStarted && !quizComplete && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs text-slate-500">
                      {lang === 'en' ? 'Question' : 'Pregunta'} {currentQuestion + 1}/{quizQuestions.length}
                    </span>
                    <span className="text-xs text-purple-400">
                      {lang === 'en' ? 'Score' : 'Puntuación'}: {score}
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
                        className={`w-full p-3 rounded-xl text-sm text-left transition-all ${
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
                        className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 rounded-xl text-sm"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {currentQuestion < quizQuestions.length - 1 ? t.quizNext : (lang === 'en' ? 'Complete' : 'Completar')}
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
                    {lang === 'en' ? 'Score' : 'Puntuación'}: {score}/{quizQuestions.length}
                  </p>
                  <motion.button
                    onClick={resetQuiz}
                    className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-sm"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {lang === 'en' ? 'Try Again' : 'Intentar de Nuevo'}
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
                  { icon: Check, text: t.tip4 },
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
                BIP39 Standard
              </h3>
              <p className="text-xs text-slate-400">
                {lang === 'en'
                  ? 'BIP39 defines the standard for mnemonic codes. It uses 2048 carefully selected words from various languages to create human-readable backups of cryptographic keys.'
                  : 'BIP39 define el estándar para códigos mnemónicos. Usa 2048 palabras cuidadosamente seleccionadas de varios idiomas para crear respaldos legibles de claves criptográficas.'
                }
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
