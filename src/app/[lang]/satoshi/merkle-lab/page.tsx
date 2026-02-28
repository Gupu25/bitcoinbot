'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TreeDeciduous, Hash, Plus, Trash2, Eye, Copy, Check, 
  Sparkles, BookOpen, Shield, Zap, AlertTriangle, Info,
  ChevronDown, ChevronRight, FileText, Lock
} from 'lucide-react';
import { InfoTooltip } from '@/components/ui/InfoTooltip';

// 🌳 Merkle Lab - Interactive Merkle Tree Builder & Prover
// Learn how Bitcoin uses Merkle Trees for efficient SPV proofs!

interface MerkleNode {
  hash: string;
  left?: MerkleNode;
  right?: MerkleNode;
  isLeaf?: boolean;
  transaction?: string;
  level: number;
}

interface Translations {
  title: string;
  subtitle: string;
  addTx: string;
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
}

const translations: Record<'en' | 'es', Translations> = {
  en: {
    title: 'Merkle Tree Lab',
    subtitle: 'Build and explore Merkle Trees like Bitcoin does',
    addTx: 'Add Transaction',
    clearAll: 'Clear All',
    transactions: 'Transactions',
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
    tip: 'Click any node to generate a Merkle Proof!',
  },
  es: {
    title: 'Laboratorio Merkle',
    subtitle: 'Construye y explora Árboles Merkle como Bitcoin',
    addTx: 'Añadir Transacción',
    clearAll: 'Limpiar Todo',
    transactions: 'Transacciones',
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
    tip: '¡Haz clic en cualquier nodo para generar una Prueba Merkle!',
  },
};

// 🐱 Simulated SHA-256 (for demo - in production use crypto.subtle)
function simulateHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  // Make it look like a real hash
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `${hex.repeat(8)}`.slice(0, 64);
}

// 🌳 Build Merkle Tree from transactions
function buildMerkleTree(transactions: string[]): MerkleNode | null {
  if (transactions.length === 0) return null;
  
  // Hash all transactions
  let currentLevel: MerkleNode[] = transactions.map((tx, i) => ({
    hash: simulateHash(tx),
    transaction: tx,
    isLeaf: true,
    level: 0,
  }));
  
  if (currentLevel.length === 1) {
    return currentLevel[0];
  }
  
  let level = 1;
  
  // Build tree bottom-up
  while (currentLevel.length > 1) {
    const nextLevel: MerkleNode[] = [];
    
    for (let i = 0; i < currentLevel.length; i += 2) {
      const left = currentLevel[i];
      const right = currentLevel[i + 1] || left; // Duplicate if odd
      
      const combinedHash = simulateHash(left.hash + right.hash);
      
      nextLevel.push({
        hash: combinedHash,
        left,
        right,
        level,
      });
    }
    
    currentLevel = nextLevel;
    level++;
  }
  
  return currentLevel[0];
}

// 🎯 Generate Merkle Proof
interface ProofStep {
  hash: string;
  position: 'left' | 'right';
}

function generateMerkleProof(
  tree: MerkleNode | null, 
  targetHash: string
): ProofStep[] | null {
  if (!tree) return null;
  
  function findPath(node: MerkleNode, path: ProofStep[]): ProofStep[] | null {
    if (node.isLeaf) {
      return node.hash === targetHash ? path : null;
    }
    
    if (node.left && node.right) {
      // Try left
      const leftPath = findPath(node.left, [
        ...path, 
        { hash: node.right.hash, position: 'right' }
      ]);
      if (leftPath) return leftPath;
      
      // Try right
      const rightPath = findPath(node.right, [
        ...path,
        { hash: node.left.hash, position: 'left' }
      ]);
      if (rightPath) return rightPath;
    }
    
    return null;
  }
  
  return findPath(tree, []);
}

// ✅ Verify Merkle Proof
function verifyMerkleProof(
  leafHash: string,
  proof: ProofStep[],
  rootHash: string
): boolean {
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

// 📊 Get all nodes by level for visualization
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
  return levels.reverse(); // Root first
}

export default function MerkleLabPage({ params }: { params: { lang: 'en' | 'es' } }) {
  const lang = params.lang || 'en';
  const t = translations[lang];
  
  const [transactions, setTransactions] = useState<string[]>([
    'tx_alice_bob_001',
    'tx_carol_dave_002',
  ]);
  const [newTx, setNewTx] = useState('');
  const [selectedNode, setSelectedNode] = useState<MerkleNode | null>(null);
  const [proof, setProof] = useState<ProofStep[] | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [showEducational, setShowEducational] = useState(true);
  
  // 🌳 Build tree
  const tree = useMemo(() => buildMerkleTree(transactions), [transactions]);
  const levels = useMemo(() => getNodesByLevel(tree), [tree]);
  
  // 🎯 Handle proof generation
  const handleSelectNode = (node: MerkleNode) => {
    if (!node.isLeaf) return;
    setSelectedNode(node);
    const nodeProof = generateMerkleProof(tree, node.hash);
    setProof(nodeProof);
  };
  
  // ➕ Add transaction
  const addTransaction = () => {
    if (newTx.trim()) {
      setTransactions([...transactions, newTx.trim()]);
      setNewTx('');
    }
  };
  
  // 🗑️ Remove transaction
  const removeTransaction = (index: number) => {
    setTransactions(transactions.filter((_, i) => i !== index));
    setSelectedNode(null);
    setProof(null);
  };
  
  // 📋 Copy to clipboard
  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };
  
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
            className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 rounded-full px-4 py-2 mb-4"
            whileHover={{ scale: 1.05 }}
          >
            <TreeDeciduous className="w-4 h-4 text-orange-400" />
            <span className="text-orange-400 text-sm font-mono uppercase tracking-wider">
              Cryptographic Trees
            </span>
          </motion.div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <Hash className="w-10 h-10 text-orange-400" />
            {t.title}
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            {t.subtitle}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Panel - Transactions */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1 space-y-6"
          >
            {/* Add Transaction */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-orange-400 mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5" />
                {t.addTx}
              </h3>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTx}
                  onChange={(e) => setNewTx(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addTransaction()}
                  placeholder="tx_id_or_data..."
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-orange-500/50"
                />
                <motion.button
                  onClick={addTransaction}
                  disabled={!newTx.trim()}
                  className="bg-orange-500 hover:bg-orange-600 disabled:bg-slate-700 disabled:text-slate-500 text-white px-4 py-3 rounded-xl font-medium transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Plus className="w-5 h-5" />
                </motion.button>
              </div>
              
              <button
                onClick={() => {
                  setTransactions([]);
                  setSelectedNode(null);
                  setProof(null);
                }}
                className="mt-3 text-sm text-slate-500 hover:text-red-400 transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" />
                {t.clearAll}
              </button>
            </div>
            
            {/* Transaction List */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-slate-400" />
                {t.transactions}
                <span className="ml-auto text-sm font-mono text-slate-500">
                  {transactions.length}
                </span>
              </h3>
              
              <div className="space-y-2 max-h-64 overflow-y-auto">
                <AnimatePresence>
                  {transactions.map((tx, i) => (
                    <motion.div
                      key={`${tx}-${i}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className={`group flex items-center gap-2 p-3 rounded-xl font-mono text-sm transition-all ${
                        selectedNode?.transaction === tx
                          ? 'bg-orange-500/20 border border-orange-500/50 text-orange-400'
                          : 'bg-slate-800/50 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span className="w-6 h-6 flex items-center justify-center bg-slate-700 rounded text-xs text-slate-400">
                        {i + 1}
                      </span>
                      <span className="flex-1 truncate">{tx}</span>
                      <button
                        onClick={() => removeTransaction(i)}
                        className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
            
            {/* Merkle Root Display */}
            {tree && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/30 rounded-2xl p-6"
              >
                <h3 className="text-lg font-bold text-orange-400 mb-3 flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  {t.merkleRoot}
                </h3>
                <div className="bg-slate-900 rounded-xl p-4 font-mono text-xs text-orange-300 break-all relative group">
                  {tree.hash}
                  <button
                    onClick={() => copyToClipboard(tree.hash, 'root')}
                    className="absolute top-2 right-2 p-2 bg-slate-800 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {copied === 'root' ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Center - Tree Visualization */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 min-h-[500px] flex flex-col">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <TreeDeciduous className="w-5 h-5 text-green-400" />
                Tree Structure
                <InfoTooltip content={t.tip} />
              </h3>
              
              <div className="flex-1 flex items-center justify-center overflow-auto">
                {levels.length > 0 ? (
                  <div className="space-y-8 py-4">
                    {levels.map((level, levelIdx) => (
                      <motion.div
                        key={levelIdx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: levelIdx * 0.1 }}
                        className="flex items-center justify-center gap-4 flex-wrap"
                      >
                        {level.map((node, nodeIdx) => (
                          <motion.button
                            key={`${levelIdx}-${nodeIdx}`}
                            onClick={() => node.isLeaf && handleSelectNode(node)}
                            disabled={!node.isLeaf}
                            className={`relative group ${
                              node.isLeaf ? 'cursor-pointer' : 'cursor-default'
                            }`}
                            whileHover={node.isLeaf ? { scale: 1.1 } : {}}
                            whileTap={node.isLeaf ? { scale: 0.95 } : {}}
                          >
                            {/* Node */}
                            <div
                              className={`px-3 py-2 rounded-xl font-mono text-xs transition-all ${
                                node.isLeaf
                                  ? selectedNode?.hash === node.hash
                                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                                    : 'bg-orange-500/20 text-orange-400 border border-orange-500/30 hover:bg-orange-500/30'
                                  : 'bg-slate-800 text-slate-400 border border-slate-700'
                              }`}
                            >
                              {node.hash.slice(0, 8)}...
                            </div>
                            
                            {/* Tooltip */}
                            {node.isLeaf && (
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                {node.transaction}
                              </div>
                            )}
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
            </div>
          </motion.div>

          {/* Right Panel - Proof */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1 space-y-6"
          >
            {/* Proof Display */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-400" />
                {t.generateProof}
              </h3>
              
              {proof && selectedNode ? (
                <div className="space-y-4">
                  {/* Selected Leaf */}
                  <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
                    <p className="text-xs text-slate-500 mb-2">Selected Transaction:</p>
                    <p className="font-mono text-sm text-orange-400 truncate">
                      {selectedNode.transaction}
                    </p>
                    <p className="font-mono text-xs text-slate-500 mt-2">
                      Hash: {selectedNode.hash.slice(0, 16)}...
                    </p>
                  </div>
                  
                  {/* Proof Path */}
                  <div className="space-y-2">
                    <p className="text-xs text-slate-500 mb-2">Proof Path (siblings):</p>
                    {proof.map((step, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={`flex items-center gap-2 p-3 rounded-xl font-mono text-xs ${
                          step.position === 'left'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                            : 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                        }`}
                      >
                        <span className="text-slate-500">{i + 1}.</span>
                        <span className="uppercase">{step.position}</span>
                        <ChevronRight className="w-4 h-4" />
                        <span className="flex-1 truncate">{step.hash.slice(0, 12)}...</span>
                      </motion.div>
                    ))}
                  </div>
                  
                  {/* Verification */}
                  <div className={`p-4 rounded-xl ${
                    verifyMerkleProof(selectedNode.hash, proof, tree!.hash)
                      ? 'bg-green-500/10 border border-green-500/30'
                      : 'bg-red-500/10 border border-red-500/30'
                  }`}>
                    <p className={`font-mono text-sm ${
                      verifyMerkleProof(selectedNode.hash, proof, tree!.hash)
                        ? 'text-green-400'
                        : 'text-red-400'
                    }`}>
                      {verifyMerkleProof(selectedNode.hash, proof, tree!.hash)
                        ? t.proofValid
                        : t.proofInvalid}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center text-slate-500 py-8">
                  <Eye className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>{t.selectLeaf}</p>
                </div>
              )}
            </div>
            
            {/* Educational Panel */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden"
            >
              <button
                onClick={() => setShowEducational(!showEducational)}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-800/50 transition-colors"
              >
                <span className="font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-orange-400" />
                  {t.howItWorks}
                </span>
                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${showEducational ? 'rotate-180' : ''}`} />
              </button>
              
              <AnimatePresence>
                {showEducational && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 pt-0 space-y-4">
                      {/* Steps */}
                      <div className="space-y-2">
                        {[t.step1, t.step2, t.step3, t.step4].map((step, i) => (
                          <div key={i} className="flex items-start gap-2 text-sm text-slate-400">
                            <span className="w-5 h-5 flex items-center justify-center bg-orange-500/20 text-orange-400 rounded text-xs flex-shrink-0">
                              {i + 1}
                            </span>
                            {step}
                          </div>
                        ))}
                      </div>
                      
                      {/* Info Cards */}
                      <div className="space-y-3 pt-4">
                        <div className="bg-slate-800/50 rounded-xl p-4">
                          <h4 className="text-sm font-bold text-orange-400 mb-2 flex items-center gap-2">
                            <Info className="w-4 h-4" />
                            {t.whatIsMerkle}
                          </h4>
                          <p className="text-xs text-slate-400">{t.whatIsMerkleDesc}</p>
                        </div>
                        
                        <div className="bg-slate-800/50 rounded-xl p-4">
                          <h4 className="text-sm font-bold text-blue-400 mb-2 flex items-center gap-2">
                            <Zap className="w-4 h-4" />
                            {t.whyMerkle}
                          </h4>
                          <p className="text-xs text-slate-400">{t.whyMerkleDesc}</p>
                        </div>
                        
                        <div className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20 rounded-xl p-4">
                          <h4 className="text-sm font-bold text-amber-400 mb-2 flex items-center gap-2">
                            <Sparkles className="w-4 h-4" />
                            {t.spvTitle}
                          </h4>
                          <p className="text-xs text-slate-300">{t.spvDesc}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
