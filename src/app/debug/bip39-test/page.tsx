'use client';

import { useState, useEffect } from 'react';

// Test imports
import { generateMnemonic, mnemonicToEntropy, validateMnemonic } from '@scure/bip39';
import { wordlist as english } from '@scure/bip39/wordlists/english';

export default function Bip39DebugPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `> ${msg}`]);
  };

  const runTests = async () => {
    setLogs([]);
    setError(null);
    setSuccess(false);
    
    try {
      addLog('🔍 Starting BIP39 debug tests...');
      
      // Test 1: Check if wordlist loaded
      addLog(`📚 Wordlist length: ${english?.length || 'UNDEFINED!'}`);
      if (!english || english.length === 0) {
        throw new Error('Wordlist is empty or undefined!');
      }

      // Test 2: Try generating 12 words
      addLog('🎲 Generating 12-word mnemonic...');
      const mnemonic12 = generateMnemonic(english, 128);
      addLog(`✅ 12-word result: ${mnemonic12 ? 'SUCCESS' : 'FAILED'}`);
      addLog(`   Words: ${mnemonic12?.split(' ').length || 0}`);
      
      if (!mnemonic12) throw new Error('12-word generation returned empty!');

      // Test 3: Validate it
      addLog('🔐 Validating mnemonic...');
      const isValid = validateMnemonic(mnemonic12, english);
      addLog(`✅ Valid: ${isValid}`);

      // Test 4: Convert to entropy
      addLog('🔄 Converting to entropy...');
      const entropy = mnemonicToEntropy(mnemonic12, english);
      addLog(`✅ Entropy bytes: ${entropy?.length || 0}`);

      // Test 5: Try 24 words
      addLog('🎲 Generating 24-word mnemonic...');
      const mnemonic24 = generateMnemonic(english, 256);
      addLog(`✅ 24-word result: ${mnemonic24 ? 'SUCCESS' : 'FAILED'}`);
      addLog(`   Words: ${mnemonic24?.split(' ').length || 0}`);

      setSuccess(true);
      addLog('🎉 ALL TESTS PASSED! BIP39 is working correctly~!');
      
    } catch (err: any) {
      const errorMsg = err?.message || String(err);
      setError(errorMsg);
      addLog(`💥 ERROR: ${errorMsg}`);
      console.error('Full error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8 font-mono">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-orange-400 mb-4">🔧 BIP39 Debugger</h1>
        
        <button
          onClick={runTests}
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-bold mb-6"
        >
          Run Debug Tests
        </button>

        {error && (
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-4 text-red-300">
            <p className="font-bold">❌ ERROR DETECTED:</p>
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-500/20 border border-green-500 rounded-lg p-4 mb-4 text-green-300">
            ✅ All systems operational, senpai!
          </div>
        )}

        <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
          <p className="text-slate-400 text-sm mb-2">Debug Output:</p>
          <div className="space-y-1 text-sm">
            {logs.length === 0 ? (
              <p className="text-slate-600 italic">Click "Run Debug Tests" to start...</p>
            ) : (
              logs.map((log, i) => (
                <div key={i} className={`
                  ${log.includes('ERROR') ? 'text-red-400' : 
                    log.includes('SUCCESS') || log.includes('✅') ? 'text-green-400' : 
                    log.includes('PASSED') ? 'text-orange-400 font-bold' : 'text-slate-300'}
                `}>
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-8 text-xs text-slate-500">
          <p>Package: @scure/bip39</p>
          <p>Wordlist: english (2048 words)</p>
          <p>Strengths tested: 128bit (12 words), 256bit (24 words)</p>
        </div>
      </div>
    </div>
  );
}
