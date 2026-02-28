'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Key, PenTool, CheckCircle, XCircle, AlertTriangle, 
  Sparkles, BookOpen, Shield, Zap, Lock, Unlock,
  Copy, Check, RefreshCw, ArrowRight, Eye, EyeOff,
  Users, Merge, Bug
} from 'lucide-react';
import { InfoTooltip } from '@/components/ui/InfoTooltip';

// 🔐 ECDSA/Schnorr Signing Lab
// Interactive demonstration of Bitcoin's digital signature algorithms!

interface Translations {
  title: string;
  subtitle: string;
  tabEcdsa: string;
  tabSchnorr: string;
  tabMuSig: string;
  tabNonce: string;
  privateKey: string;
  publicKey: string;
  generateKeys: string;
  message: string;
  sign: string;
  signature: string;
  verify: string;
  valid: string;
  invalid: string;
  stepByStep: string;
  howItWorks: string;
  ecdsaTitle: string;
  schnorrTitle: string;
  muSigTitle: string;
  nonceTitle: string;
  ecdsaDesc: string;
  schnorrDesc: string;
  muSigDesc: string;
  nonceDesc: string;
  copyKey: string;
  copied: string;
  showKey: string;
  hideKey: string;
  nonce: string;
  nonceWarning: string;
  reuseNonce: string;
  dangerZone: string;
  privateKeyExposed: string;
  safeNonce: string;
  participants: string;
  aggregateKey: string;
  aggregateSig: string;
  privacy: string;
  privacyDesc: string;
  step1: string;
  step2: string;
  step3: string;
  step4: string;
  step5: string;
  calcHash: string;
  calcNonce: string;
  calcPoint: string;
  calcR: string;
  calcS: string;
  calcE: string;
  verifyCheck: string;
  alice: string;
  bob: string;
  carol: string;
}

const translations: Record<'en' | 'es', Translations> = {
  en: {
    title: 'Signing Lab',
    subtitle: 'Master ECDSA & Schnorr signatures like a cypherpunk',
    tabEcdsa: 'ECDSA',
    tabSchnorr: 'Schnorr',
    tabMuSig: 'MuSig',
    tabNonce: 'Nonce Danger',
    privateKey: 'Private Key',
    publicKey: 'Public Key',
    generateKeys: 'Generate Keys',
    message: 'Message',
    sign: 'Sign',
    signature: 'Signature',
    verify: 'Verify',
    valid: '✅ Valid Signature!',
    invalid: '❌ Invalid Signature',
    stepByStep: 'Step by Step',
    howItWorks: 'How It Works',
    ecdsaTitle: 'ECDSA Signing',
    schnorrTitle: 'Schnorr Signing',
    muSigTitle: 'MuSig Aggregation',
    nonceTitle: 'Nonce Reuse Attack',
    ecdsaDesc: 'The original Bitcoin signature algorithm. Proves you own a private key without revealing it.',
    schnorrDesc: 'Taproot upgrade (2021). Simpler, smaller, and enables signature aggregation!',
    muSigDesc: 'Combine multiple signatures into one! Better privacy and lower fees.',
    nonceDesc: 'See why reusing the nonce (k) exposes your private key. This is DANGEROUS!',
    copyKey: 'Copy',
    copied: 'Copied!',
    showKey: 'Show',
    hideKey: 'Hide',
    nonce: 'Nonce (k)',
    nonceWarning: '⚠️ Never reuse the same nonce for different messages!',
    reuseNonce: 'Reuse Nonce',
    dangerZone: '🔴 DANGER ZONE',
    privateKeyExposed: '🔓 Private Key EXPOSED:',
    safeNonce: 'Random Nonce',
    participants: 'Participants',
    aggregateKey: 'Aggregate Public Key',
    aggregateSig: 'Aggregate Signature',
    privacy: 'Privacy Bonus',
    privacyDesc: 'Looks like a single signature! Nobody knows it\'s multisig.',
    step1: 'Hash the message',
    step2: 'Generate random nonce',
    step3: 'Calculate point R',
    step4: 'Calculate r or e',
    step5: 'Calculate s',
    calcHash: 'z = SHA256(message)',
    calcNonce: 'k = random(1, n-1)',
    calcPoint: 'R = k × G',
    calcR: 'r = R.x mod n',
    calcS: 's = (z + r×d) / k mod n',
    calcE: 'e = H(R || P || m)',
    verifyCheck: 's × G = R + e × P ?',
    alice: 'Alice',
    bob: 'Bob',
    carol: 'Carol',
  },
  es: {
    title: 'Laboratorio de Firmas',
    subtitle: 'Domina las firmas ECDSA y Schnorr como un cypherpunk',
    tabEcdsa: 'ECDSA',
    tabSchnorr: 'Schnorr',
    tabMuSig: 'MuSig',
    tabNonce: 'Peligro Nonce',
    privateKey: 'Clave Privada',
    publicKey: 'Clave Pública',
    generateKeys: 'Generar Claves',
    message: 'Mensaje',
    sign: 'Firmar',
    signature: 'Firma',
    verify: 'Verificar',
    valid: '✅ ¡Firma Válida!',
    invalid: '❌ Firma Inválida',
    stepByStep: 'Paso a Paso',
    howItWorks: 'Cómo Funciona',
    ecdsaTitle: 'Firma ECDSA',
    schnorrTitle: 'Firma Schnorr',
    muSigTitle: 'Agregación MuSig',
    nonceTitle: 'Ataque por Nonce',
    ecdsaDesc: 'El algoritmo de firma original de Bitcoin. Prueba que posees una clave privada sin revelarla.',
    schnorrDesc: 'Upgrade Taproot (2021). ¡Más simple, más pequeño, y permite agregación de firmas!',
    muSigDesc: '¡Combina múltiples firmas en una! Mejor privacidad y menores comisiones.',
    nonceDesc: 'Mira por qué reutilizar el nonce (k) expone tu clave privada. ¡Esto es PELIGROSO!',
    copyKey: 'Copiar',
    copied: '¡Copiado!',
    showKey: 'Mostrar',
    hideKey: 'Ocultar',
    nonce: 'Nonce (k)',
    nonceWarning: '⚠️ ¡Nunca reutilices el mismo nonce para mensajes diferentes!',
    reuseNonce: 'Reutilizar Nonce',
    dangerZone: '🔴 ZONA DE PELIGRO',
    privateKeyExposed: '🔓 Clave Privada EXPUESTA:',
    safeNonce: 'Nonce Aleatorio',
    participants: 'Participantes',
    aggregateKey: 'Clave Pública Agregada',
    aggregateSig: 'Firma Agregada',
    privacy: 'Bonus de Privacidad',
    privacyDesc: '¡Parece una firma normal! Nadie sabe que es multisig.',
    step1: 'Hashear el mensaje',
    step2: 'Generar nonce aleatorio',
    step3: 'Calcular punto R',
    step4: 'Calcular r o e',
    step5: 'Calcular s',
    calcHash: 'z = SHA256(mensaje)',
    calcNonce: 'k = aleatorio(1, n-1)',
    calcPoint: 'R = k × G',
    calcR: 'r = R.x mod n',
    calcS: 's = (z + r×d) / k mod n',
    calcE: 'e = H(R || P || m)',
    verifyCheck: 's × G = R + e × P ?',
    alice: 'Alice',
    bob: 'Bob',
    carol: 'Carol',
  },
};

// 🐱 Simulated cryptographic functions (for educational demo)
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
  return Array.from(array, x => x.toString(16).padStart(8, '0')).join('');
}

// 🌐 Simulated point multiplication (simplified)
function simulatePointMul(scalar: string): string {
  const hash = simulateHash(scalar + 'point');
  return hash.slice(0, 64);
}

// 🔑 Generate key pair
interface KeyPair {
  privateKey: string;
  publicKey: string;
}

function generateKeyPair(): KeyPair {
  const privateKey = generateRandomHex(64);
  const publicKey = simulatePointMul(privateKey);
  return { privateKey, publicKey };
}

// ✍️ ECDSA Signature
interface ECDSASignature {
  r: string;
  s: string;
  nonce: string;
  hash: string;
  steps: { label: string; value: string; explanation: string }[];
}

function signECDSA(
  message: string, 
  privateKey: string, 
  customNonce?: string
): ECDSASignature {
  const steps: ECDSASignature['steps'] = [];
  
  // Step 1: Hash message
  const hash = simulateHash(message);
  steps.push({
    label: 'z',
    value: hash,
    explanation: 'SHA256(message)',
  });
  
  // Step 2: Nonce
  const nonce = customNonce || generateRandomHex(64);
  steps.push({
    label: 'k',
    value: nonce,
    explanation: 'Random nonce (SECRET!)',
  });
  
  // Step 3: Calculate R = k × G
  const R = simulatePointMul(nonce);
  steps.push({
    label: 'R',
    value: R,
    explanation: 'R = k × G (point on curve)',
  });
  
  // Step 4: r = R.x mod n
  const r = simulateHash(R + 'r').slice(0, 64);
  steps.push({
    label: 'r',
    value: r,
    explanation: 'r = R.x mod n',
  });
  
  // Step 5: s = (z + r × d) / k mod n
  const s = simulateHash(hash + r + privateKey + nonce).slice(0, 64);
  steps.push({
    label: 's',
    value: s,
    explanation: 's = (z + r × d) / k mod n',
  });
  
  return { r, s, nonce, hash, steps };
}

// ⚡ Schnorr Signature
interface SchnorrSignature {
  R: string;
  s: string;
  e: string;
  nonce: string;
  hash: string;
  steps: { label: string; value: string; explanation: string }[];
}

function signSchnorr(
  message: string, 
  privateKey: string,
  publicKey: string,
  customNonce?: string
): SchnorrSignature {
  const steps: SchnorrSignature['steps'] = [];
  
  // Step 1: Nonce
  const nonce = customNonce || generateRandomHex(64);
  steps.push({
    label: 'k',
    value: nonce,
    explanation: 'Random nonce (SECRET!)',
  });
  
  // Step 2: R = k × G
  const R = simulatePointMul(nonce);
  steps.push({
    label: 'R',
    value: R,
    explanation: 'R = k × G',
  });
  
  // Step 3: e = H(R || P || m)
  const e = simulateHash(R + publicKey + message);
  steps.push({
    label: 'e',
    value: e,
    explanation: 'e = H(R || P || m)',
  });
  
  // Step 4: s = k + e × d mod n
  const s = simulateHash(nonce + e + privateKey);
  steps.push({
    label: 's',
    value: s,
    explanation: 's = k + e × d mod n',
  });
  
  return { R, s, e, nonce, hash: simulateHash(message), steps };
}

// 🔓 Recover private key from nonce reuse
function recoverPrivateKeyFromNonceReuse(
  sig1: ECDSASignature,
  sig2: ECDSASignature
): string | null {
  // If same nonce was used, we can recover the private key
  // k = (z1 - z2) / (s1 - s2)
  // d = (s × k - z) / r
  
  if (sig1.nonce !== sig2.nonce) return null;
  
  // Simulated recovery for demo
  return simulateHash(sig1.hash + sig2.hash + 'recovered');
}

// 👥 MuSig Key Aggregation
interface MuSigParticipant {
  name: string;
  privateKey: string;
  publicKey: string;
}

interface MuSigResult {
  participants: MuSigParticipant[];
  aggregatePublicKey: string;
  aggregateSignature: string;
  message: string;
}

function simulateMuSig(message: string): MuSigResult {
  const participants: MuSigParticipant[] = [
    { name: 'Alice', ...generateKeyPair() },
    { name: 'Bob', ...generateKeyPair() },
    { name: 'Carol', ...generateKeyPair() },
  ];
  
  // Aggregate public key
  const aggPubKey = simulateHash(
    participants.map(p => p.publicKey).join('')
  );
  
  // Aggregate signature
  const aggSig = simulateHash(
    participants.map(p => p.privateKey).join('') + message
  );
  
  return {
    participants,
    aggregatePublicKey: aggPubKey,
    aggregateSignature: aggSig,
    message,
  };
}

export default function SigningLabPage({ params }: { params: { lang: 'en' | 'es' } }) {
  const lang = params.lang || 'en';
  const t = translations[lang];
  
  const [activeTab, setActiveTab] = useState<'ecdsa' | 'schnorr' | 'musig' | 'nonce'>('ecdsa');
  const [keyPair, setKeyPair] = useState<KeyPair | null>(null);
  const [showPrivate, setShowPrivate] = useState(false);
  const [message, setMessage] = useState('I am sending 1 BTC to Bob');
  const [signature, setSignature] = useState<ECDSASignature | SchnorrSignature | null>(null);
  const [verificationResult, setVerificationResult] = useState<boolean | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  
  // 🎭 Nonce attack state
  const [nonceAttackSig1, setNonceAttackSig1] = useState<ECDSASignature | null>(null);
  const [nonceAttackSig2, setNonceAttackSig2] = useState<ECDSASignature | null>(null);
  const [reusedNonce, setReusedNonce] = useState<string | null>(null);
  const [exposedKey, setExposedKey] = useState<string | null>(null);
  
  // 👥 MuSig state
  const [muSigResult, setMuSigResult] = useState<MuSigResult | null>(null);
  
  // 🔑 Generate keys
  const handleGenerateKeys = useCallback(() => {
    setKeyPair(generateKeyPair());
    setSignature(null);
    setVerificationResult(null);
    setCurrentStep(0);
    setNonceAttackSig1(null);
    setNonceAttackSig2(null);
    setExposedKey(null);
  }, []);
  
  // ✍️ Sign message
  const handleSign = useCallback((algorithm: 'ecdsa' | 'schnorr') => {
    if (!keyPair) return;
    
    if (algorithm === 'ecdsa') {
      const sig = signECDSA(message, keyPair.privateKey);
      setSignature(sig);
    } else {
      const sig = signSchnorr(message, keyPair.privateKey, keyPair.publicKey);
      setSignature(sig);
    }
    
    setVerificationResult(null);
    setCurrentStep(0);
  }, [keyPair, message]);
  
  // ✅ Verify signature
  const handleVerify = useCallback(() => {
    // Simulated verification (always valid for demo)
    setVerificationResult(true);
  }, []);
  
  // 🚨 Nonce attack simulation
  const handleNonceAttack = useCallback(() => {
    if (!keyPair) return;
    
    const nonce = generateRandomHex(64);
    setReusedNonce(nonce);
    
    // Sign two different messages with same nonce
    const msg1 = 'Message 1: Sending 1 BTC';
    const msg2 = 'Message 2: Sending 2 BTC';
    
    const sig1 = signECDSA(msg1, keyPair.privateKey, nonce);
    const sig2 = signECDSA(msg2, keyPair.privateKey, nonce);
    
    setNonceAttackSig1(sig1);
    setNonceAttackSig2(sig2);
    
    // Recover private key
    const recovered = recoverPrivateKeyFromNonceReuse(sig1, sig2);
    setExposedKey(recovered);
  }, [keyPair]);
  
  // 👥 Generate MuSig
  const handleMuSig = useCallback(() => {
    setMuSigResult(simulateMuSig(message));
  }, [message]);
  
  // 📋 Copy to clipboard
  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };
  
  // Animate steps
  const animateSteps = useCallback(() => {
    if (!signature) return;
    const stepsCount = 'steps' in signature ? signature.steps.length : 0;
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setCurrentStep(step);
      if (step >= stepsCount) clearInterval(interval);
    }, 500);
    return () => clearInterval(interval);
  }, [signature]);
  
  // Tab content
  const tabs = [
    { id: 'ecdsa' as const, label: t.tabEcdsa, icon: PenTool },
    { id: 'schnorr' as const, label: t.tabSchnorr, icon: Zap },
    { id: 'musig' as const, label: t.tabMuSig, icon: Users },
    { id: 'nonce' as const, label: t.tabNonce, icon: AlertTriangle },
  ];

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
            <Key className="w-4 h-4 text-orange-400" />
            <span className="text-orange-400 text-sm font-mono uppercase tracking-wider">
              Cryptographic Signatures
            </span>
          </motion.div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <Lock className="w-10 h-10 text-orange-400" />
            {t.title}
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            {t.subtitle}
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSignature(null);
                setVerificationResult(null);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-sm transition-all ${
                activeTab === tab.id
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
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

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Panel - Keys & Input */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1 space-y-6"
          >
            {/* Key Generator */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Key className="w-5 h-5 text-orange-400" />
                {t.generateKeys}
              </h3>
              
              <motion.button
                onClick={handleGenerateKeys}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <RefreshCw className="w-5 h-5" />
                {t.generateKeys}
              </motion.button>
              
              {keyPair && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 space-y-3"
                >
                  {/* Private Key */}
                  <div className="bg-slate-800 rounded-xl p-4 relative group">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-slate-500 font-mono">{t.privateKey}</span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => setShowPrivate(!showPrivate)}
                          className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white"
                        >
                          {showPrivate ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => copyToClipboard(keyPair.privateKey, 'priv')}
                          className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white"
                        >
                          {copied === 'priv' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <p className="font-mono text-xs break-all text-red-400">
                      {showPrivate ? keyPair.privateKey : '••••••••••••••••••••••••••••••••'}
                    </p>
                    {!showPrivate && (
                      <p className="text-xs text-slate-500 mt-2">{t.showKey}</p>
                    )}
                  </div>
                  
                  {/* Public Key */}
                  <div className="bg-slate-800 rounded-xl p-4 relative group">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-slate-500 font-mono">{t.publicKey}</span>
                      <button
                        onClick={() => copyToClipboard(keyPair.publicKey, 'pub')}
                        className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white"
                      >
                        {copied === 'pub' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="font-mono text-xs break-all text-green-400">
                      {keyPair.publicKey}
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
            
            {/* Message Input */}
            {activeTab !== 'musig' && activeTab !== 'nonce' && (
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <PenTool className="w-5 h-5 text-blue-400" />
                  {t.message}
                </h3>
                
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full h-24 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white font-mono text-sm resize-none focus:outline-none focus:border-orange-500/50"
                  placeholder="Enter your message..."
                />
                
                <div className="flex gap-2 mt-4">
                  <motion.button
                    onClick={() => handleSign(activeTab as 'ecdsa' | 'schnorr')}
                    disabled={!keyPair || !message}
                    className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-700 disabled:text-slate-500 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2"
                    whileHover={{ scale: keyPair && message ? 1.02 : 1 }}
                    whileTap={{ scale: keyPair && message ? 0.98 : 1 }}
                  >
                    <PenTool className="w-4 h-4" />
                    {t.sign}
                  </motion.button>
                  
                  <motion.button
                    onClick={handleVerify}
                    disabled={!signature}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-slate-700 disabled:text-slate-500 text-white px-4 py-3 rounded-xl font-medium flex items-center justify-center gap-2"
                    whileHover={{ scale: signature ? 1.02 : 1 }}
                    whileTap={{ scale: signature ? 0.98 : 1 }}
                  >
                    <CheckCircle className="w-4 h-4" />
                  </motion.button>
                </div>
                
                {verificationResult !== null && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-4 p-4 rounded-xl text-center font-mono text-sm ${
                      verificationResult
                        ? 'bg-green-500/20 border border-green-500/50 text-green-400'
                        : 'bg-red-500/20 border border-red-500/50 text-red-400'
                    }`}
                  >
                    {verificationResult ? t.valid : t.invalid}
                  </motion.div>
                )}
              </div>
            )}
            
            {/* MuSig Controls */}
            {activeTab === 'musig' && (
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-400" />
                  {t.participants}
                </h3>
                
                <p className="text-sm text-slate-400 mb-4">{t.muSigDesc}</p>
                
                <motion.button
                  onClick={handleMuSig}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Merge className="w-5 h-5" />
                  Generate MuSig
                </motion.button>
              </div>
            )}
            
            {/* Nonce Attack Controls */}
            {activeTab === 'nonce' && (
              <div className="bg-slate-900/50 border border-red-500/30 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-red-400 mb-4 flex items-center gap-2">
                  <Bug className="w-5 h-5" />
                  {t.dangerZone}
                </h3>
                
                <p className="text-sm text-slate-400 mb-4">{t.nonceDesc}</p>
                
                <motion.button
                  onClick={handleGenerateKeys}
                  className="w-full bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-xl font-medium mb-3"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {t.generateKeys}
                </motion.button>
                
                <motion.button
                  onClick={handleNonceAttack}
                  disabled={!keyPair}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-slate-700 disabled:text-slate-500 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2"
                  whileHover={{ scale: keyPair ? 1.02 : 1 }}
                  whileTap={{ scale: keyPair ? 0.98 : 1 }}
                >
                  <AlertTriangle className="w-4 h-4" />
                  {t.reuseNonce}
                </motion.button>
                
                {exposedKey && keyPair && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 bg-red-500/20 border border-red-500/50 rounded-xl p-4"
                  >
                    <p className="text-red-400 font-mono text-sm mb-2">{t.privateKeyExposed}</p>
                    <p className="font-mono text-xs text-white break-all">
                      {keyPair.privateKey}
                    </p>
                    <p className="text-xs text-red-300 mt-2">
                      {lang === 'en' 
                        ? 'Both signatures used the same nonce! Anyone can calculate your private key!'
                        : '¡Ambas firmas usaron el mismo nonce! ¡Cualquiera puede calcular tu clave privada!'
                      }
                    </p>
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>

          {/* Center Panel - Visualization */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 min-h-[500px]">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                {activeTab === 'ecdsa' && <PenTool className="w-5 h-5 text-blue-400" />}
                {activeTab === 'schnorr' && <Zap className="w-5 h-5 text-amber-400" />}
                {activeTab === 'musig' && <Users className="w-5 h-5 text-purple-400" />}
                {activeTab === 'nonce' && <AlertTriangle className="w-5 h-5 text-red-400" />}
                
                {activeTab === 'ecdsa' && t.ecdsaTitle}
                {activeTab === 'schnorr' && t.schnorrTitle}
                {activeTab === 'musig' && t.muSigTitle}
                {activeTab === 'nonce' && t.nonceTitle}
                
                <InfoTooltip content={
                  activeTab === 'ecdsa' ? t.ecdsaDesc :
                  activeTab === 'schnorr' ? t.schnorrDesc :
                  activeTab === 'musig' ? t.muSigDesc :
                  t.nonceDesc
                } />
              </h3>
              
              {/* ECDSA / Schnorr Steps */}
              {(activeTab === 'ecdsa' || activeTab === 'schnorr') && signature && 'steps' in signature && (
                <div className="space-y-3">
                  {signature.steps.map((step, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.2 }}
                      className={`p-3 rounded-xl transition-all ${
                        i <= currentStep
                          ? 'bg-orange-500/20 border border-orange-500/30'
                          : 'bg-slate-800/50 border border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono ${
                          i <= currentStep ? 'bg-orange-500 text-white' : 'bg-slate-700 text-slate-400'
                        }`}>
                          {i + 1}
                        </span>
                        <span className="font-mono text-orange-400 font-bold">{step.label}</span>
                        <span className="text-xs text-slate-500 ml-auto">{step.explanation}</span>
                      </div>
                      <p className="font-mono text-xs text-slate-300 break-all pl-8">
                        {step.value.slice(0, 32)}...
                      </p>
                    </motion.div>
                  ))}
                  
                  <motion.button
                    onClick={animateSteps}
                    className="w-full mt-4 py-2 rounded-xl border border-orange-500/30 text-orange-400 hover:bg-orange-500/10 text-sm font-mono"
                    whileHover={{ scale: 1.02 }}
                  >
                    ▶️ Replay Animation
                  </motion.button>
                </div>
              )}
              
              {/* MuSig Visualization */}
              {activeTab === 'musig' && muSigResult && (
                <div className="space-y-4">
                  {/* Participants */}
                  <div className="space-y-2">
                    {muSigResult.participants.map((p, i) => (
                      <motion.div
                        key={p.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center gap-3 p-3 bg-slate-800 rounded-xl"
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                          i === 0 ? 'bg-blue-500' : i === 1 ? 'bg-green-500' : 'bg-purple-500'
                        }`}>
                          {p.name[0]}
                        </div>
                        <div className="flex-1">
                          <p className="font-mono text-sm text-white">{p.name}</p>
                          <p className="font-mono text-xs text-slate-500 truncate">
                            {p.publicKey.slice(0, 20)}...
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  
                  <div className="flex justify-center">
                    <ArrowRight className="w-6 h-6 text-orange-400 rotate-90" />
                  </div>
                  
                  {/* Aggregate */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-4"
                  >
                    <p className="text-xs text-slate-500 mb-2">{t.aggregateKey}</p>
                    <p className="font-mono text-xs text-purple-400 break-all">
                      {muSigResult.aggregatePublicKey}
                    </p>
                    <p className="text-xs text-slate-500 mt-3 mb-2">{t.aggregateSig}</p>
                    <p className="font-mono text-xs text-pink-400 break-all">
                      {muSigResult.aggregateSignature}
                    </p>
                  </motion.div>
                  
                  {/* Privacy Bonus */}
                  <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                    <p className="text-sm font-bold text-green-400 flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      {t.privacy}
                    </p>
                    <p className="text-xs text-green-300 mt-2">{t.privacyDesc}</p>
                  </div>
                </div>
              )}
              
              {/* Nonce Attack Visualization */}
              {activeTab === 'nonce' && nonceAttackSig1 && nonceAttackSig2 && (
                <div className="space-y-4">
                  <p className="text-xs text-slate-500 font-mono">
                    {t.nonceWarning}
                  </p>
                  
                  {/* Signature 1 */}
                  <div className="bg-slate-800 rounded-xl p-4">
                    <p className="text-xs text-slate-500 mb-2">Message 1</p>
                    <p className="font-mono text-xs text-blue-400">r: {nonceAttackSig1.r.slice(0, 16)}...</p>
                    <p className="font-mono text-xs text-blue-400">s: {nonceAttackSig1.s.slice(0, 16)}...</p>
                    <p className="font-mono text-xs text-red-400 mt-2">
                      k: {nonceAttackSig1.nonce.slice(0, 16)}...
                    </p>
                  </div>
                  
                  {/* Signature 2 */}
                  <div className="bg-slate-800 rounded-xl p-4">
                    <p className="text-xs text-slate-500 mb-2">Message 2</p>
                    <p className="font-mono text-xs text-green-400">r: {nonceAttackSig2.r.slice(0, 16)}...</p>
                    <p className="font-mono text-xs text-green-400">s: {nonceAttackSig2.s.slice(0, 16)}...</p>
                    <p className="font-mono text-xs text-red-400 mt-2">
                      k: {nonceAttackSig2.nonce.slice(0, 16)}...
                    </p>
                  </div>
                  
                  {/* Same Nonce Warning */}
                  <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 text-center">
                    <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                    <p className="text-sm text-red-400 font-mono">
                      {lang === 'en' ? 'SAME NONCE DETECTED!' : '¡MISMO NONCE DETECTADO!'}
                    </p>
                  </div>
                </div>
              )}
              
              {/* Empty State */}
              {!signature && activeTab !== 'musig' && activeTab !== 'nonce' && (
                <div className="h-64 flex items-center justify-center text-slate-500">
                  <div className="text-center">
                    <PenTool className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>{lang === 'en' ? 'Generate keys and sign a message' : 'Genera claves y firma un mensaje'}</p>
                  </div>
                </div>
              )}
              
              {!muSigResult && activeTab === 'musig' && (
                <div className="h-64 flex items-center justify-center text-slate-500">
                  <div className="text-center">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>{lang === 'en' ? 'Click Generate MuSig' : 'Clic en Generate MuSig'}</p>
                  </div>
                </div>
              )}
              
              {!nonceAttackSig1 && activeTab === 'nonce' && (
                <div className="h-64 flex items-center justify-center text-slate-500">
                  <div className="text-center">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>{lang === 'en' ? 'Generate keys then click Reuse Nonce' : 'Genera claves y luego clic en Reuse Nonce'}</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Right Panel - Educational */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1 space-y-6"
          >
            {/* Algorithm Comparison */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-orange-400" />
                {t.howItWorks}
              </h3>
              
              {activeTab === 'ecdsa' && (
                <div className="space-y-3">
                  <div className="bg-slate-800 rounded-xl p-4">
                    <h4 className="text-sm font-bold text-blue-400 mb-2">ECDSA Formula</h4>
                    <div className="font-mono text-xs text-slate-300 space-y-1">
                      <p>1. z = SHA256(message)</p>
                      <p>2. k = random nonce</p>
                      <p>3. R = k × G</p>
                      <p>4. r = R.x mod n</p>
                      <p>5. s = (z + r×d) / k mod n</p>
                    </div>
                  </div>
                  
                  <div className="bg-slate-800 rounded-xl p-4">
                    <h4 className="text-sm font-bold text-green-400 mb-2">Verification</h4>
                    <div className="font-mono text-xs text-slate-300 space-y-1">
                      <p>w = 1/s mod n</p>
                      <p>u1 = z × w</p>
                      <p>u2 = r × w</p>
                      <p>P = u1×G + u2×Pub</p>
                      <p>Valid if P.x ≡ r mod n</p>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'schnorr' && (
                <div className="space-y-3">
                  <div className="bg-slate-800 rounded-xl p-4">
                    <h4 className="text-sm font-bold text-amber-400 mb-2">Schnorr Formula</h4>
                    <div className="font-mono text-xs text-slate-300 space-y-1">
                      <p>1. k = random nonce</p>
                      <p>2. R = k × G</p>
                      <p>3. e = H(R || P || m)</p>
                      <p>4. s = k + e×d mod n</p>
                      <p>Signature: (R, s)</p>
                    </div>
                  </div>
                  
                  <div className="bg-slate-800 rounded-xl p-4">
                    <h4 className="text-sm font-bold text-green-400 mb-2">Verification</h4>
                    <div className="font-mono text-xs text-slate-300 space-y-1">
                      <p>e = H(R || P || m)</p>
                      <p>s × G = R + e × P</p>
                      <p>✅ Simple linear check!</p>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20 rounded-xl p-4">
                    <h4 className="text-sm font-bold text-orange-400 mb-2 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      {lang === 'en' ? 'Why Schnorr is Better' : 'Por qué Schnorr es Mejor'}
                    </h4>
                    <ul className="text-xs text-slate-300 space-y-1">
                      <li>• Simpler math = less bugs</li>
                      <li>• 64 bytes vs 72 bytes</li>
                      <li>• Native signature aggregation</li>
                      <li>• Better privacy (MuSig)</li>
                      <li>• Batch verification possible</li>
                    </ul>
                  </div>
                </div>
              )}
              
              {activeTab === 'musig' && (
                <div className="space-y-3">
                  <div className="bg-slate-800 rounded-xl p-4">
                    <h4 className="text-sm font-bold text-purple-400 mb-2">MuSig2 Protocol</h4>
                    <div className="font-mono text-xs text-slate-300 space-y-1">
                      <p>1. Each party has (dᵢ, Pᵢ)</p>
                      <p>2. P_agg = Σ Pᵢ</p>
                      <p>3. Round 1: Share nonce commitments</p>
                      <p>4. Round 2: Share nonces Rᵢ</p>
                      <p>5. R_agg = Σ Rᵢ</p>
                      <p>6. e = H(R_agg || P_agg || m)</p>
                      <p>7. sᵢ = kᵢ + e × dᵢ</p>
                      <p>8. s_agg = Σ sᵢ</p>
                    </div>
                  </div>
                  
                  <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                    <h4 className="text-sm font-bold text-green-400 mb-2">Benefits</h4>
                    <ul className="text-xs text-slate-300 space-y-1">
                      <li>• Looks like single key spend</li>
                      <li>• Lower fees (1 sig vs N sigs)</li>
                      <li>• Better privacy</li>
                      <li>• No script overhead</li>
                    </ul>
                  </div>
                </div>
              )}
              
              {activeTab === 'nonce' && (
                <div className="space-y-3">
                  <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4">
                    <h4 className="text-sm font-bold text-red-400 mb-2">⚠️ The Attack</h4>
                    <div className="font-mono text-xs text-slate-300 space-y-2">
                      <p>If k is reused:</p>
                      <p className="text-red-300">s₁ = (z₁ + r×d) / k</p>
                      <p className="text-red-300">s₂ = (z₂ + r×d) / k</p>
                      <p className="mt-2">Subtracting:</p>
                      <p className="text-amber-300">s₁ - s₂ = (z₁ - z₂) / k</p>
                      <p className="text-amber-300">k = (z₁ - z₂) / (s₁ - s₂)</p>
                      <p className="mt-2 text-red-400">Then: d = (s×k - z) / r</p>
                    </div>
                  </div>
                  
                  <div className="bg-slate-800 rounded-xl p-4">
                    <h4 className="text-sm font-bold text-orange-400 mb-2">Historical Example</h4>
                    <p className="text-xs text-slate-300">
                      In 2010, PlayStation 3 was hacked because Sony reused the same nonce (k) for all firmware signatures. 
                      This allowed hackers to calculate Sony's private signing key!
                    </p>
                  </div>
                  
                  <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                    <h4 className="text-sm font-bold text-green-400 mb-2">How to Stay Safe</h4>
                    <ul className="text-xs text-slate-300 space-y-1">
                      <li>• Use RFC 6979 deterministic nonces</li>
                      <li>• Derive k from message + private key</li>
                      <li>• Never implement crypto yourself!</li>
                      <li>• Use well-tested libraries</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
            
            {/* Quick Facts */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                {lang === 'en' ? 'Quick Facts' : 'Datos Rápidos'}
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-800 rounded-xl">
                  <span className="text-sm text-slate-400">ECDSA sig size</span>
                  <span className="font-mono text-orange-400">~72 bytes</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-800 rounded-xl">
                  <span className="text-sm text-slate-400">Schnorr sig size</span>
                  <span className="font-mono text-orange-400">64 bytes</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-800 rounded-xl">
                  <span className="text-sm text-slate-400">Curve</span>
                  <span className="font-mono text-orange-400">secp256k1</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-800 rounded-xl">
                  <span className="text-sm text-slate-400">Key size</span>
                  <span className="font-mono text-orange-400">256 bits</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-800 rounded-xl">
                  <span className="text-sm text-slate-400">Schnorr BIP</span>
                  <span className="font-mono text-orange-400">BIP-340</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
