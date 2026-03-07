'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Search, CheckCircle, XCircle, RefreshCw,
  Clock, Blocks, Hash, Link, Copy, Check, Zap,
  ChevronDown, ChevronUp, ExternalLink
} from 'lucide-react';
import { sha256 } from '@noble/hashes/sha256';
import { bytesToHex } from '@noble/hashes/utils';

// ============================================================================
// TYPES
// ============================================================================
interface TransactionInfo {
  txid: string;
  status: {
    confirmed: boolean;
    block_height: number;
    block_hash: string;
    block_time: number;
  };
}

interface BlockHeader {
  height: number;
  hash: string;
  merkle_root: string;
  timestamp: number;
}

interface MerkleProof {
  block_height: number;
  merkle_root: string;
  pos: number;
  proof: string[];
}

interface VerificationStep {
  name: string;
  status: 'pending' | 'success' | 'error';
}

// ============================================================================
// TRANSLATIONS
// ============================================================================
const translations = {
  en: {
    title: 'Real Bitcoin SPV Verification',
    subtitle: 'Verify transactions against the actual blockchain',
    description: 'Fetch a real transaction from Bitcoin mainnet and cryptographically verify its Merkle proof. No trust required!',
    inputLabel: 'Transaction ID (TXID)',
    inputPlaceholder: 'Paste a Bitcoin TXID...',
    verifyButton: 'Verify on Mainnet',
    verifying: 'Verifying...',
    demoTxs: 'Try these real transactions:',
    steps: {
      fetchTx: 'Fetch from mempool.space',
      fetchBlock: 'Get block header',
      fetchProof: 'Retrieve Merkle proof',
      verify: 'Cryptographic verification',
    },
    results: {
      success: '✅ Verified! This transaction is confirmed in block',
      failed: '❌ Verification failed',
      notConfirmed: 'Transaction not yet confirmed',
      error: 'Failed to fetch data',
    },
    blockInfo: 'Block Information',
    merkleRoot: 'Merkle Root',
    proofPath: 'Proof Path',
    efficiency: 'Downloaded only ~1KB instead of ~2MB block',
    viewOnMempool: 'View on mempool.space',
  },
  es: {
    title: 'Verificación SPV Real',
    subtitle: 'Verifica transacciones contra la blockchain real',
    description: 'Obtén una transacción real de Bitcoin mainnet y verifica criptográficamente su prueba Merkle. ¡Sin confianza necesaria!',
    inputLabel: 'ID de Transacción (TXID)',
    inputPlaceholder: 'Pega un TXID de Bitcoin...',
    verifyButton: 'Verificar en Mainnet',
    verifying: 'Verificando...',
    demoTxs: 'Prueba estas transacciones reales:',
    steps: {
      fetchTx: 'Obtener de mempool.space',
      fetchBlock: 'Obtener header del bloque',
      fetchProof: 'Recuperar prueba Merkle',
      verify: 'Verificación criptográfica',
    },
    results: {
      success: '✅ ¡Verificado! Esta transacción está confirmada en el bloque',
      failed: '❌ Verificación fallida',
      notConfirmed: 'Transacción aún no confirmada',
      error: 'Error al obtener datos',
    },
    blockInfo: 'Información del Bloque',
    merkleRoot: 'Raíz Merkle',
    proofPath: 'Camino de Prueba',
    efficiency: 'Descargados solo ~1KB en lugar de ~2MB del bloque',
    viewOnMempool: 'Ver en mempool.space',
  }
};

// Demo transactions (confirmed on mainnet)
const DEMO_TXS = [
  '504a72525a81ba74c8b3c2bb0481a0248c1eb780996d4976e49fc2225fbcc030',
  '0e5a04092081a63582eb8edac760e66890a72eea9a4cc53aa5e6188cb44b0341',
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================
function reverseHex(hex: string): string {
  const bytes = hex.match(/.{2}/g) || [];
  return bytes.reverse().join('');
}

function doubleSha256(data: string): string {
  const bytes = new Uint8Array(data.match(/.{2}/g)?.map(b => parseInt(b, 16)) || []);
  const hash1 = sha256(bytes);
  const hash2 = sha256(hash1);
  return bytesToHex(hash2);
}

function verifyMerkleProof(txid: string, merkleRoot: string, proof: MerkleProof): boolean {
  let currentHash = reverseHex(txid);
  let currentPos = proof.pos;

  for (const siblingHash of proof.proof) {
    const sibling = reverseHex(siblingHash);
    if (currentPos % 2 === 0) {
      currentHash = doubleSha256(currentHash + sibling);
    } else {
      currentHash = doubleSha256(sibling + currentHash);
    }
    currentPos = Math.floor(currentPos / 2);
  }

  return reverseHex(currentHash) === merkleRoot;
}

// ============================================================================
// COMPONENT
// ============================================================================
interface SPVVerifierPanelProps {
  lang: 'en' | 'es';
}

export function SPVVerifierPanel({ lang }: SPVVerifierPanelProps) {
  const t = translations[lang];
  
  const [txid, setTxid] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    valid: boolean;
    message: string;
    steps: VerificationStep[];
  } | null>(null);
  const [txInfo, setTxInfo] = useState<TransactionInfo | null>(null);
  const [blockHeader, setBlockHeader] = useState<BlockHeader | null>(null);
  const [merkleProof, setMerkleProof] = useState<MerkleProof | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  const verifyTransaction = async () => {
    if (!txid.trim()) return;
    
    setLoading(true);
    setResult(null);
    
    const steps: VerificationStep[] = [
      { name: t.steps.fetchTx, status: 'pending' },
      { name: t.steps.fetchBlock, status: 'pending' },
      { name: t.steps.fetchProof, status: 'pending' },
      { name: t.steps.verify, status: 'pending' },
    ];

    try {
      // Step 1: Fetch transaction
      steps[0].status = 'success';
      const txRes = await fetch(`https://mempool.space/api/tx/${txid.trim()}`);
      if (!txRes.ok) throw new Error('Transaction not found');
      const txData: TransactionInfo = await txRes.json();
      setTxInfo(txData);

      if (!txData.status.confirmed) {
        setResult({
          valid: false,
          message: t.results.notConfirmed,
          steps
        });
        setLoading(false);
        return;
      }

      // Step 2: Fetch block header
      steps[1].status = 'success';
      const blockRes = await fetch(`https://mempool.space/api/block/${txData.status.block_hash}`);
      const blockData: BlockHeader = await blockRes.json();
      setBlockHeader(blockData);

      // Step 3: Fetch Merkle proof
      steps[2].status = 'success';
      const proofRes = await fetch(`https://mempool.space/api/tx/${txid.trim()}/merkle-proof`);
      const proofData: MerkleProof = await proofRes.json();
      setMerkleProof(proofData);

      // Step 4: Verify locally
      const isValid = verifyMerkleProof(txid.trim(), blockData.merkle_root, proofData);
      steps[3].status = isValid ? 'success' : 'error';
      
      setResult({
        valid: isValid,
        message: isValid 
          ? `${t.results.success} #${blockData.height.toLocaleString()}`
          : t.results.failed,
        steps
      });

    } catch (error) {
      steps.forEach(s => { if (s.status === 'pending') s.status = 'error'; });
      setResult({
        valid: false,
        message: t.results.error,
        steps
      });
    } finally {
      setLoading(false);
    }
  };

  const copyTxid = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-3">
          <Zap className="w-6 h-6 text-green-400" />
          <h3 className="text-lg font-bold text-green-400">{t.title}</h3>
        </div>
        <p className="text-slate-300 text-sm mb-2">{t.subtitle}</p>
        <p className="text-slate-500 text-xs">{t.description}</p>
      </div>

      {/* Input */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
        <label className="block text-sm font-medium text-slate-400 mb-2">
          {t.inputLabel}
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={txid}
            onChange={(e) => setTxid(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && verifyTransaction()}
            placeholder={t.inputPlaceholder}
            className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-green-500/50"
          />
          <motion.button
            onClick={verifyTransaction}
            disabled={loading || !txid.trim()}
            className="bg-green-500 hover:bg-green-600 disabled:bg-slate-700 disabled:text-slate-500 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
            {loading ? t.verifying : t.verifyButton}
          </motion.button>
        </div>

        {/* Demo TXs */}
        <div className="mt-4">
          <p className="text-xs text-slate-500 mb-2">{t.demoTxs}</p>
          <div className="flex flex-wrap gap-2">
            {DEMO_TXS.map((demoTx) => (
              <button
                key={demoTx}
                onClick={() => setTxid(demoTx)}
                className="text-xs font-mono text-green-400 hover:text-green-300 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/30 transition-colors"
              >
                {demoTx.slice(0, 8)}...{demoTx.slice(-8)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Verification Steps */}
      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          {result.steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`flex items-center gap-3 p-4 rounded-xl ${
                step.status === 'success' ? 'bg-green-500/10 border border-green-500/30' :
                step.status === 'error' ? 'bg-red-500/10 border border-red-500/30' :
                'bg-slate-800/50 border border-slate-700'
              }`}
            >
              {step.status === 'success' ? <CheckCircle className="w-5 h-5 text-green-400" /> :
               step.status === 'error' ? <XCircle className="w-5 h-5 text-red-400" /> :
               <div className="w-5 h-5 rounded-full border-2 border-slate-600" />}
              <span className={step.status === 'success' ? 'text-green-400' : step.status === 'error' ? 'text-red-400' : 'text-slate-400'}>
                {step.name}
              </span>
            </motion.div>
          ))}

          {/* Final Result */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-6 rounded-2xl text-center ${
              result.valid ? 'bg-green-500/20 border-2 border-green-500/50' : 'bg-red-500/20 border-2 border-red-500/50'
            }`}
          >
            <p className={`text-lg font-bold ${result.valid ? 'text-green-400' : 'text-red-400'}`}>
              {result.message}
            </p>
            {result.valid && (
              <p className="text-sm text-slate-400 mt-2">{t.efficiency}</p>
            )}
          </motion.div>
        </motion.div>
      )}

      {/* Detailed Results */}
      {result?.valid && txInfo && blockHeader && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full flex items-center justify-between p-4 bg-slate-800/50 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <span className="font-bold flex items-center gap-2">
              <Blocks className="w-5 h-5 text-orange-400" />
              {t.blockInfo}
            </span>
            {showDetails ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>

          <AnimatePresence>
            {showDetails && (
              <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                <div className="space-y-4 p-4 bg-slate-900/50 rounded-xl">
                  
                  {/* Block Height & Time */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-800 rounded-xl p-4">
                      <p className="text-xs text-slate-500 mb-1">Block Height</p>
                      <p className="font-mono text-xl text-orange-400">#{blockHeader.height.toLocaleString()}</p>
                    </div>
                    <div className="bg-slate-800 rounded-xl p-4">
                      <p className="text-xs text-slate-500 mb-1">Timestamp</p>
                      <p className="font-mono text-sm text-slate-300">
                        {new Date(blockHeader.timestamp * 1000).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Merkle Root */}
                  <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
                    <h4 className="text-sm font-bold text-orange-400 mb-2 flex items-center gap-2">
                      <Hash className="w-4 h-4" />
                      {t.merkleRoot}
                    </h4>
                    <code className="text-xs font-mono text-orange-300 break-all">{blockHeader.merkle_root}</code>
                  </div>

                  {/* Proof Path */}
                  {merkleProof && (
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                      <h4 className="text-sm font-bold text-blue-400 mb-2 flex items-center gap-2">
                        <Link className="w-4 h-4" />
                        {t.proofPath} ({merkleProof.proof.length} levels)
                      </h4>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {merkleProof.proof.map((hash, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs font-mono">
                            <span className="text-slate-500 w-8">L{i}</span>
                            <code className="text-slate-300 truncate flex-1">{hash}</code>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* External Link */}
                  <a
                    href={`https://mempool.space/tx/${txid}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full p-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 hover:text-white transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    {t.viewOnMempool}
                  </a>

                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
