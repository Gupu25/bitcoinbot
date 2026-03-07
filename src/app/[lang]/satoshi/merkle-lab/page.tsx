'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TreeDeciduous, Hash, Plus, Trash2, Eye, Copy, Check,
  Sparkles, BookOpen, Shield, Zap, AlertTriangle, Info,
  ChevronDown, ChevronRight, FileText, Lock, GraduationCap,
  Trophy, HelpCircle, XCircle, CheckCircle, Lightbulb,
  GitBranch, Layers, Target, RefreshCw, ToggleLeft, Database, Globe
} from 'lucide-react';
import { InfoTooltip } from '@/components/ui/InfoTooltip';
import { BobChatWidget } from '@/components/chat/BobChatWidget';
import { SPVVerifierPanel } from '@/components/labs/SPVVerifierPanel';

// ============================================================================
// DEMO DATA - Friendly transactions for users without Bitcoin knowledge
// ============================================================================
const DEMO_TRANSACTIONS = [
  '504a72525a81ba74c8b3c2bb0481a0248c1eb780996d4976e49fc2225fbcc030',
  '0e5a04092081a63582eb8edac760e66890a72eea9a4cc53aa5e6188cb44b0341',
];

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface MerkleNode {
  hash: string;
  left?: MerkleNode;
  right?: MerkleNode;
  isLeaf?: boolean;
  transaction?: string;
  level: number;
  index?: number;
}

interface ProofStep {
  hash: string;
  position: 'left' | 'right';
  label?: string;
}

interface Translations {
  title: string;
  subtitle: string;
  whyImportant: string;
  whyImportantDesc: string;
  addTx: string;
  loadDemo: string;
  clearAll: string;
  transactions: string;
  merkleRoot: string;
  generateProof: string;
  verifyProof: string;
  proofValid: string;
  proofInvalid: string;
  selectLeaf: string;
  copyHash: string;
  copied: string;
  howItWorks: string;
  step1: string;
  step2: string;
  step3: string;
  step4: string;
  whatIsMerkle: string;
  whatIsMerkleDesc: string;
  whyMerkle: string;
  whyMerkleDesc: string;
  spvTitle: string;
  spvDesc: string;
  example: string;
  tip: string;
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
  labCompleted: string;
  labCompletedDesc: string;
  realWorld: string;
  realWorldDesc: string;
  securityNote: string;
  securityNoteDesc: string;
  nodeTooltip: string;
  rootTooltip: string;
  proofTooltip: string;
  oddTxNote: string;
  doubleHashNote: string;
  efficiencyNote: string;
}

const translations: Record<'en' | 'es', Translations> = {
  en: {
    title: 'Merkle Tree Lab',
    subtitle: 'Build and explore Merkle Trees like Bitcoin does',
    whyImportant: 'Why does this matter?',
    whyImportantDesc: 'Merkle Trees let you verify a single transaction without downloading 500GB+ of blockchain. This is how lightweight wallets like Electrum work!',
    addTx: 'Add Transaction',
    loadDemo: 'Load Demo',
    clearAll: 'Clear All',
    transactions: 'Transactions (Leaves)',
    merkleRoot: 'Merkle Root',
    generateProof: 'Generate Proof',
    verifyProof: 'Verify Proof',
    proofValid: '✅ Proof Valid!',
    proofInvalid: '❌ Proof Invalid',
    selectLeaf: 'Select a leaf to generate proof',
    copyHash: 'Copy Hash',
    copied: 'Copied!',
    howItWorks: 'How It Works',
    step1: 'Hash each transaction with SHA-256 (double)',
    step2: 'Pair hashes and hash them together',
    step3: 'Repeat until one hash remains',
    step4: 'The final hash is the Merkle Root',
    whatIsMerkle: 'What is a Merkle Tree?',
    whatIsMerkleDesc: 'A data structure that efficiently verifies data integrity using cryptographic hashes. Named after Ralph Merkle, 1979.',
    whyMerkle: 'Why Bitcoin Uses It',
    whyMerkleDesc: 'Allows SPV (Simplified Payment Verification) clients to verify transactions without downloading the entire blockchain.',
    spvTitle: 'SPV Proofs',
    spvDesc: 'With just the Merkle Root and a proof path, anyone can verify a transaction is in a block—no full node needed!',
    example: 'Example: 4 transactions → 2 pairs → 1 root',
    tip: 'Click any leaf to generate a Merkle Proof!',
    quiz: 'Test Your Knowledge',
    quizTitle: 'Merkle Tree Quiz',
    quizDesc: 'Prove you understand how Merkle Trees work',
    quizQuestion1: 'What is the main benefit of Merkle Trees in Bitcoin?',
    quizOption1A: 'They make transactions faster',
    quizOption1B: 'They allow verification without downloading the full blockchain',
    quizOption1C: 'They encrypt your private keys',
    quizOption1D: 'They prevent double-spending',
    quizCorrect1: '✅ Correct! SPV clients use Merkle proofs to verify transactions with minimal data.',
    quizIncorrect1: '❌ Not quite. Think about data efficiency and verification.',
    quizQuestion2: 'If you change ONE transaction in a block, what happens?',
    quizOption2A: 'Only that transaction hash changes',
    quizOption2B: 'The Merkle Root and all parent hashes change',
    quizOption2C: 'Nothing, Merkle Trees are immutable',
    quizOption2D: 'The block becomes invalid immediately',
    quizCorrect2: '✅ Correct! Changing any leaf changes its parent, and so on up to the root. This is cryptographic integrity!',
    quizIncorrect2: '❌ Think about how hashes propagate upward in the tree.',
    quizNext: 'Next Question',
    quizComplete: '🎉 Quiz Complete! You understand Merkle Trees!',
    startQuiz: 'Start Quiz',
    question: 'Question',
    score: 'Score',
    tryAgain: 'Try Again',
    complete: 'Complete',
    labCompleted: '🎉 Lab Completed!',
    labCompletedDesc: 'Now you understand how Bitcoin verifies transactions efficiently with Merkle Trees! 🌳',
    realWorld: 'Real-World Example',
    realWorldDesc: 'When your phone wallet shows "Transaction confirmed", it likely received just the Merkle Root + a small proof (~1KB) instead of the full block (~1-4MB). That\'s the power of Merkle!',
    securityNote: 'Security Note',
    securityNoteDesc: 'If an attacker tries to fake a transaction, they\'d need to recalculate the Merkle Root and fool the entire network. The cryptographic chain makes this computationally impossible.',
    nodeTooltip: 'Leaf node: Represents one transaction. Click to generate a proof!',
    rootTooltip: 'Merkle Root: Single hash that represents ALL transactions in the block. Stored in the block header!',
    proofTooltip: 'Proof path: The sibling hashes needed to recompute the root. Only log₂(n) hashes needed!',
    oddTxNote: 'If odd number of transactions, the last one is duplicated.',
    doubleHashNote: 'Bitcoin uses double SHA-256: SHA256(SHA256(data)) for extra security.',
    efficiencyNote: 'For 1000 transactions, you only need ~10 hashes to prove inclusion. That\'s logarithmic efficiency!',
  },
  es: {
    title: 'Laboratorio Merkle',
    subtitle: 'Construye y explora Árboles Merkle como Bitcoin',
    whyImportant: '¿Por qué importa esto?',
    whyImportantDesc: 'Los Árboles Merkle te permiten verificar una sola transacción sin descargar 500GB+ de blockchain. ¡Así funcionan wallets ligeras como Electrum!',
    addTx: 'Añadir Transacción',
    loadDemo: 'Cargar Demo',
    clearAll: 'Limpiar Todo',
    transactions: 'Transacciones (Hojas)',
    merkleRoot: 'Raíz Merkle',
    generateProof: 'Generar Prueba',
    verifyProof: 'Verificar Prueba',
    proofValid: '✅ ¡Prueba Válida!',
    proofInvalid: '❌ Prueba Inválida',
    selectLeaf: 'Selecciona una hoja para generar prueba',
    copyHash: 'Copiar Hash',
    copied: '¡Copiado!',
    howItWorks: 'Cómo Funciona',
    step1: 'Hashea cada transacción con SHA-256 (doble)',
    step2: 'Empareja hashes y hashéalos juntos',
    step3: 'Repite hasta que quede un solo hash',
    step4: 'El hash final es la Raíz Merkle',
    whatIsMerkle: '¿Qué es un Árbol Merkle?',
    whatIsMerkleDesc: 'Una estructura de datos que verifica eficientemente la integridad de datos usando hashes criptográficos. Nombrado así por Ralph Merkle, 1979.',
    whyMerkle: 'Por Qué Bitcoin Lo Usa',
    whyMerkleDesc: 'Permite a clientes SPV (Verificación de Pago Simplificada) verificar transacciones sin descargar toda la blockchain.',
    spvTitle: 'Pruebas SPV',
    spvDesc: 'Con solo la Raíz Merkle y un camino de prueba, cualquiera puede verificar que una transacción está en un bloque—¡sin nodo completo!',
    example: 'Ejemplo: 4 transacciones → 2 pares → 1 raíz',
    tip: '¡Haz clic en cualquier hoja para generar una Prueba Merkle!',
    quiz: 'Pon a Prueba tu Conocimiento',
    quizTitle: 'Quiz de Árboles Merkle',
    quizDesc: 'Demuestra que entiendes cómo funcionan los Árboles Merkle',
    quizQuestion1: '¿Cuál es el beneficio principal de los Árboles Merkle en Bitcoin?',
    quizOption1A: 'Hacen las transacciones más rápidas',
    quizOption1B: 'Permiten verificar sin descargar toda la blockchain',
    quizOption1C: 'Encriptan tus claves privadas',
    quizOption1D: 'Previenen el doble gasto',
    quizCorrect1: '✅ ¡Correcto! Los clientes SPV usan pruebas Merkle para verificar transacciones con mínimos datos.',
    quizIncorrect1: '❌ No exactamente. Piensa en eficiencia de datos y verificación.',
    quizQuestion2: 'Si cambias UNA transacción en un bloque, ¿qué pasa?',
    quizOption2A: 'Solo cambia el hash de esa transacción',
    quizOption2B: 'Cambia la Raíz Merkle y todos los hashes padres',
    quizOption2C: 'Nada, los Árboles Merkle son inmutables',
    quizOption2D: 'El bloque se vuelve inválido inmediatamente',
    quizCorrect2: '✅ ¡Correcto! Cambiar cualquier hoja cambia su padre, y así hasta la raíz. ¡Esto es integridad criptográfica!',
    quizIncorrect2: '❌ Piensa en cómo los hashes se propagan hacia arriba en el árbol.',
    quizNext: 'Siguiente Pregunta',
    quizComplete: '🎉 ¡Quiz Completado! ¡Entiendes los Árboles Merkle!',
    startQuiz: 'Iniciar Quiz',
    question: 'Pregunta',
    score: 'Puntuación',
    tryAgain: 'Intentar de Nuevo',
    complete: 'Completar',
    labCompleted: '🎉 ¡Lab Completado!',
    labCompletedDesc: '¡Ahora entiendes cómo Bitcoin verifica transacciones eficientemente con Árboles Merkle! 🌳',
    realWorld: 'Ejemplo del Mundo Real',
    realWorldDesc: 'Cuando tu wallet del celular muestra "Transacción confirmada", probablemente recibió solo la Raíz Merkle + una pequeña prueba (~1KB) en lugar del bloque completo (~1-4MB). ¡Ese es el poder de Merkle!',
    securityNote: 'Nota de Seguridad',
    securityNoteDesc: 'Si un atacante intenta falsificar una transacción, necesitaría recalcular la Raíz Merkle y engañar a toda la red. La cadena criptográfica hace esto computacionalmente imposible.',
    nodeTooltip: 'Nodo hoja: Representa una transacción. ¡Haz clic para generar una prueba!',
    rootTooltip: 'Raíz Merkle: Un solo hash que representa TODAS las transacciones del bloque. ¡Se guarda en el encabezado del bloque!',
    proofTooltip: 'Camino de prueba: Los hashes hermanos necesarios para recomputar la raíz. ¡Solo se necesitan log₂(n) hashes!',
    oddTxNote: 'Si hay número impar de transacciones, la última se duplica.',
    doubleHashNote: 'Bitcoin usa doble SHA-256: SHA256(SHA256(datos)) para seguridad extra.',
    efficiencyNote: 'Para 1000 transacciones, solo necesitas ~10 hashes para probar inclusión. ¡Esa es eficiencia logarítmica!',
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

function buildMerkleTree(transactions: string[]): MerkleNode | null {
  if (transactions.length === 0) return null;

  let currentLevel: MerkleNode[] = transactions.map((tx, i) => ({
    hash: simulateHash(tx),
    transaction: tx,
    isLeaf: true,
    level: 0,
    index: i,
  }));

  if (currentLevel.length === 1) {
    return currentLevel[0];
  }

  let level = 1;

  while (currentLevel.length > 1) {
    const nextLevel: MerkleNode[] = [];

    for (let i = 0; i < currentLevel.length; i += 2) {
      const left = currentLevel[i];
      const right = currentLevel[i + 1] || left;

      const combinedHash = simulateHash(left.hash + right.hash);

      nextLevel.push({
        hash: combinedHash,
        left,
        right,
        level,
        index: i,
      });
    }

    currentLevel = nextLevel;
    level++;
  }

  return currentLevel[0];
}

function generateMerkleProof(tree: MerkleNode | null, targetHash: string): ProofStep[] | null {
  if (!tree) return null;

  function findPath(node: MerkleNode, path: ProofStep[]): ProofStep[] | null {
    if (node.isLeaf) {
      return node.hash === targetHash ? path : null;
    }

    if (node.left && node.right) {
      const leftPath = findPath(node.left, [
        ...path,
        { hash: node.right.hash, position: 'right', label: node.right.transaction }
      ]);
      if (leftPath) return leftPath;

      const rightPath = findPath(node.right, [
        ...path,
        { hash: node.left.hash, position: 'left', label: node.left.transaction }
      ]);
      if (rightPath) return rightPath;
    }

    return null;
  }

  return findPath(tree, []);
}

function verifyMerkleProof(leafHash: string, proof: ProofStep[], rootHash: string): boolean {
  let currentHash = leafHash;

  for (const step of proof) {
    if (step.position === 'left') {
      currentHash = simulateHash(step.hash + currentHash);
    } else {
      currentHash = simulateHash(currentHash + step.hash);
    }
  }

  return currentHash === rootHash;
}

function getNodesByLevel(tree: MerkleNode | null): MerkleNode[][] {
  if (!tree) return [];

  const levels: MerkleNode[][] = [];

  function traverse(node: MerkleNode, level: number) {
    if (!levels[level]) levels[level] = [];
    levels[level].push(node);

    if (node.left) traverse(node.left, level + 1);
    if (node.right) traverse(node.right, level + 1);
  }

  traverse(tree, 0);
  return levels.reverse();
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
export default function MerkleLabPage({ params }: { params: { lang: 'en' | 'es' } }) {
  const lang = params.lang || 'en';
  const t = translations[lang];

  const [transactions, setTransactions] = useState<string[]>([]);
  const [newTx, setNewTx] = useState('');
  const [selectedNode, setSelectedNode] = useState<MerkleNode | null>(null);
  const [proof, setProof] = useState<ProofStep[] | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [showEducational, setShowEducational] = useState(true);
  const [activeStep, setActiveStep] = useState(0);
  const [labCompleted, setLabCompleted] = useState(false);
  const [mode, setMode] = useState<'demo' | 'real'>('demo');

  // Quiz state
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);
  const quizQuestions = useMemo(() => getQuizQuestions(lang, t), [lang, t]);

  const tree = useMemo(() => buildMerkleTree(transactions), [transactions]);
  const levels = useMemo(() => getNodesByLevel(tree), [tree]);

  const handleSelectNode = (node: MerkleNode) => {
    if (!node.isLeaf) return;
    setSelectedNode(node);
    const nodeProof = generateMerkleProof(tree, node.hash);
    setProof(nodeProof);
  };

  const addTransaction = () => {
    if (newTx.trim()) {
      setTransactions([...transactions, newTx.trim()]);
      setNewTx('');
    }
  };

  const removeTransaction = (index: number) => {
    setTransactions(transactions.filter((_, i) => i !== index));
    setSelectedNode(null);
    setProof(null);
  };

  const loadDemoTransactions = () => {
    setTransactions([...DEMO_TRANSACTIONS]);
    setSelectedNode(null);
    setProof(null);
  };

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
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

  useEffect(() => {
    if (transactions.length > 0) {
      const interval = setInterval(() => {
        setActiveStep(prev => (prev < 3 ? prev + 1 : prev));
      }, 1200);
      return () => clearInterval(interval);
    }
  }, [transactions]);

  return (
    <div className="min-h-screen bg-slate-950 text-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <motion.div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 rounded-full px-4 py-2 mb-4" whileHover={{ scale: 1.05 }}>
            <TreeDeciduous className="w-4 h-4 text-orange-400" />
            <span className="text-orange-400 text-sm font-mono uppercase tracking-wider">Cryptographic Trees</span>
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <Hash className="w-10 h-10 text-orange-400" />
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

          {/* Left Panel - Transactions */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-1 space-y-6">

            {/* Add Transaction */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-orange-400 mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5" />
                {t.addTx}
              </h3>
              <div className="flex gap-2">
                <input type="text" value={newTx} onChange={(e) => setNewTx(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addTransaction()} placeholder="tx_id_or_data..." className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-orange-500/50 min-h-[48px] touch-manipulation" />
                <motion.button onClick={addTransaction} disabled={!newTx.trim()} className="bg-orange-500 hover:bg-orange-600 disabled:bg-slate-700 disabled:text-slate-500 text-white px-4 py-3 rounded-xl font-medium transition-colors min-h-[48px] min-w-[48px] touch-manipulation" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Plus className="w-5 h-5" />
                </motion.button>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <motion.button onClick={loadDemoTransactions} className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Sparkles className="w-4 h-4" />
                  {t.loadDemo}
                </motion.button>
                <button onClick={() => { setTransactions([]); setSelectedNode(null); setProof(null); }} className="text-sm text-slate-500 hover:text-red-400 transition-colors flex items-center gap-1">
                  <Trash2 className="w-4 h-4" />
                  {t.clearAll}
                </button>
              </div>
            </div>

            {/* Transaction List */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-slate-400" />
                {t.transactions}
                <span className="ml-auto text-sm font-mono text-slate-500">{transactions.length}</span>
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                <AnimatePresence>
                  {transactions.map((tx, i) => (
                    <motion.div key={`${tx}-${i}`} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className={`group flex items-center gap-2 p-3 rounded-xl font-mono text-sm transition-all min-h-[48px] touch-manipulation ${selectedNode?.transaction === tx ? 'bg-orange-500/20 border border-orange-500/50 text-orange-400' : 'bg-slate-800/50 text-slate-300 hover:bg-slate-800'}`}>
                      <span className="w-6 h-6 flex items-center justify-center bg-slate-700 rounded text-xs text-slate-400">{i + 1}</span>
                      <span className="flex-1 truncate">{tx}</span>
                      <button onClick={() => removeTransaction(i)} className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all min-w-[32px] min-h-[32px] touch-manipulation">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              {transactions.length % 2 === 1 && transactions.length > 1 && (
                <p className="text-xs text-amber-400 mt-3 flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  {t.oddTxNote}
                </p>
              )}
            </div>

            {/* Merkle Root Display */}
            {tree && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/30 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-orange-400 mb-3 flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  {t.merkleRoot}
                  <InfoTooltip content={t.rootTooltip} />
                </h3>
                <div className="bg-slate-900 rounded-xl p-4 font-mono text-xs text-orange-300 break-all relative group">
                  {tree.hash}
                  <button onClick={() => copyToClipboard(tree.hash, 'root')} className="absolute top-2 right-2 p-2 bg-slate-800 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity min-w-[36px] min-h-[36px] touch-manipulation">
                    {copied === 'root' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  {t.doubleHashNote}
                </p>
              </motion.div>
            )}
          </motion.div>

          {/* Center - Tree Visualization */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-1">
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 min-h-[500px] flex flex-col">
              
              {/* Header with toggle */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  {mode === 'demo' ? (
                    <>
                      <TreeDeciduous className="w-5 h-5 text-green-400" />
                      Tree Structure
                    </>
                  ) : (
                    <>
                      <Globe className="w-5 h-5 text-green-400" />
                      Live Bitcoin
                    </>
                  )}
                </h3>
                
                {/* TOGGLE DEMO/REAL */}
                <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
                  <button
                    onClick={() => setMode('demo')}
                    className={`px-3 py-1.5 rounded-md text-xs font-mono flex items-center gap-1.5 transition-all ${
                      mode === 'demo' 
                        ? 'bg-orange-500 text-white shadow-lg' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Database className="w-3.5 h-3.5" />
                    Demo
                  </button>
                  <button
                    onClick={() => setMode('real')}
                    className={`px-3 py-1.5 rounded-md text-xs font-mono flex items-center gap-1.5 transition-all ${
                      mode === 'real' 
                        ? 'bg-green-500 text-white shadow-lg' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5" />
                    Real
                  </button>
                </div>
              </div>

              {/* CONTENIDO CONDICIONAL */}
              <div className="flex-1 overflow-auto">
                {mode === 'real' ? (
                  <SPVVerifierPanel lang={lang} />
                ) : (
                  /* Demo mode - Merkle Tree */
                  <div className="flex items-center justify-center h-full">
                    {levels.length > 0 ? (
                      <div className="space-y-8 py-4">
                        {levels.map((level, levelIdx) => (
                          <motion.div key={levelIdx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: levelIdx * 0.1 }} className="flex items-center justify-center gap-4 flex-wrap">
                            {level.map((node, nodeIdx) => (
                              <motion.button key={`${levelIdx}-${nodeIdx}`} onClick={() => node.isLeaf && handleSelectNode(node)} disabled={!node.isLeaf} className={`relative group ${node.isLeaf ? 'cursor-pointer' : 'cursor-default'}`} whileHover={node.isLeaf ? { scale: 1.1 } : {}} whileTap={node.isLeaf ? { scale: 0.95 } : {}}>
                                <div className={`px-3 py-2 rounded-xl font-mono text-xs transition-all ${node.isLeaf ? selectedNode?.hash === node.hash ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' : 'bg-orange-500/20 text-orange-400 border border-orange-500/30 hover:bg-orange-500/30' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
                                  {node.hash.slice(0, 8)}...
                                </div>
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 max-w-[200px] shadow-xl border border-orange-500/20">
                                  {node.isLeaf ? (
                                    <>
                                      <p className="text-orange-300 font-mono mb-1">{node.transaction}</p>
                                      <p className="text-slate-400">{t.nodeTooltip}</p>
                                    </>
                                  ) : (
                                    <p className="text-slate-400">Parent hash (level {node.level})</p>
                                  )}
                                </div>
                              </motion.button>
                            ))}
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-slate-500">
                        <TreeDeciduous className="w-16 h-16 mx-auto mb-4 opacity-30" />
                        <p>Add transactions to build the tree</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>
          </motion.div>

          {/* Right Panel - Proof & Education */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-1 space-y-6">

            {/* Proof Display */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-400" />
                {t.generateProof}
                <InfoTooltip content={t.proofTooltip} />
              </h3>

              {proof && selectedNode ? (
                <div className="space-y-4">
                  <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
                    <p className="text-xs text-slate-500 mb-2">Selected Transaction:</p>
                    <p className="font-mono text-sm text-orange-400 truncate">{selectedNode.transaction}</p>
                    <p className="font-mono text-xs text-slate-500 mt-2">Hash: {selectedNode.hash.slice(0, 16)}...</p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs text-slate-500 mb-2">Proof Path (siblings):</p>
                    {proof.map((step, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className={`flex items-center gap-2 p-3 rounded-xl font-mono text-xs ${step.position === 'left' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30' : 'bg-purple-500/10 text-purple-400 border border-purple-500/30'}`}>
                        <span className="text-slate-500">{i + 1}.</span>
                        <span className="uppercase">{step.position}</span>
                        <ChevronRight className="w-4 h-4" />
                        <span className="flex-1 truncate">{step.hash.slice(0, 12)}...</span>
                        {step.label && <span className="text-slate-600 text-[10px]">({step.label})</span>}
                      </motion.div>
                    ))}
                  </div>

                  <div className={`p-4 rounded-xl ${verifyMerkleProof(selectedNode.hash, proof, tree!.hash) ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
                    <p className={`font-mono text-sm ${verifyMerkleProof(selectedNode.hash, proof, tree!.hash) ? 'text-green-400' : 'text-red-400'}`}>
                      {verifyMerkleProof(selectedNode.hash, proof, tree!.hash) ? t.proofValid : t.proofInvalid}
                    </p>
                  </div>

                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    {t.efficiencyNote}
                  </p>
                </div>
              ) : (
                <div className="text-center text-slate-500 py-8">
                  <Eye className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>{t.selectLeaf}</p>
                </div>
              )}
            </div>

            {/* Educational Panel */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
              <button onClick={() => setShowEducational(!showEducational)} className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-800/50 transition-colors">
                <span className="font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-orange-400" />
                  {t.howItWorks}
                </span>
                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${showEducational ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {showEducational && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                    <div className="p-4 pt-0 space-y-4">
                      <div className="space-y-2">
                        {[t.step1, t.step2, t.step3, t.step4].map((step, i) => (
                          <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className={`flex items-start gap-2 text-sm p-3 rounded-xl transition-all ${i <= activeStep ? 'bg-orange-500/20 border border-orange-500/30' : 'bg-slate-800/50 border border-slate-700'}`}>
                            <span className={`w-6 h-6 flex items-center justify-center rounded text-xs flex-shrink-0 ${i <= activeStep ? 'bg-orange-500 text-white' : 'bg-slate-700 text-slate-400'}`}>{i + 1}</span>
                            {step}
                          </motion.div>
                        ))}
                      </div>

                      <div className="space-y-3 pt-4">
                        <div className="bg-slate-800/50 rounded-xl p-4">
                          <h4 className="text-sm font-bold text-orange-400 mb-2 flex items-center gap-2"><Info className="w-4 h-4" />{t.whatIsMerkle}</h4>
                          <p className="text-xs text-slate-400">{t.whatIsMerkleDesc}</p>
                        </div>
                        <div className="bg-slate-800/50 rounded-xl p-4">
                          <h4 className="text-sm font-bold text-blue-400 mb-2 flex items-center gap-2"><Zap className="w-4 h-4" />{t.whyMerkle}</h4>
                          <p className="text-xs text-slate-400">{t.whyMerkleDesc}</p>
                        </div>
                        <div className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20 rounded-xl p-4">
                          <h4 className="text-sm font-bold text-amber-400 mb-2 flex items-center gap-2"><Sparkles className="w-4 h-4" />{t.spvTitle}</h4>
                          <p className="text-xs text-slate-300">{t.spvDesc}</p>
                        </div>
                        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                          <h4 className="text-sm font-bold text-green-400 mb-2 flex items-center gap-2"><Shield className="w-4 h-4" />{t.realWorld}</h4>
                          <p className="text-xs text-slate-300">{t.realWorldDesc}</p>
                        </div>
                        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                          <h4 className="text-sm font-bold text-red-400 mb-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4" />{t.securityNote}</h4>
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
      <BobChatWidget mode="floating" context="merkle" lang={lang} />
    </div>
  );
}