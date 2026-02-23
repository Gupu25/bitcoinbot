'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, AlertTriangle, Shield, Activity, Ban, CheckCircle, RefreshCw, Power } from 'lucide-react';

// ============================================================================
// SEGURIDAD: Ofuscación de sessionStorage
// ============================================================================

const STORAGE_KEY = '_btc_sess';
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 30000;

function storeKey(key: string) {
  const mask = Date.now().toString(36);
  const obfuscated = key.split('').map((c, i) =>
    String.fromCharCode(c.charCodeAt(0) ^ mask.charCodeAt(i % mask.length))
  ).join('');

  sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
    k: obfuscated,
    m: mask,
    t: Date.now()
  }));
}

function retrieveKey(): string | null {
  const data = sessionStorage.getItem(STORAGE_KEY);
  if (!data) return null;
  try {
    const { k, m } = JSON.parse(data);
    return k.split('').map((c: string, i: number) =>
      String.fromCharCode(c.charCodeAt(0) ^ m.charCodeAt(i % m.length))
    ).join('');
  } catch { return null; }
}

function clearKey() {
  sessionStorage.removeItem(STORAGE_KEY);
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ============================================================================
// SECURITY GATE COMPONENT
// ============================================================================

function SecurityGate({ onUnlock }: { onUnlock: (key: string) => void }) {
  const [key, setKey] = useState('');
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);

  const isLocked = lockoutUntil ? Date.now() < lockoutUntil : false;
  const remainingTime = lockoutUntil ? Math.ceil((lockoutUntil - Date.now()) / 1000) : 0;

  useEffect(() => {
    if (!isLocked) return;
    const timer = setInterval(() => {
      if (Date.now() >= lockoutUntil!) {
        setLockoutUntil(null);
        setAttempts(0);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [isLocked, lockoutUntil]);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLocked) {
      setError(`System locked. Wait ${remainingTime}s.`);
      return;
    }

    if (!key.trim()) return;

    setChecking(true);
    setError('');

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const res = await fetch('/api/satoshi/immune/stats', {
        method: 'GET',
        headers: { 'X-API-Key': key.trim() },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        storeKey(key.trim());
        setAttempts(0);
        onUnlock(key.trim());
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);

        if (newAttempts >= MAX_ATTEMPTS) {
          setLockoutUntil(Date.now() + LOCKOUT_MS);
          setError(`Maximum attempts exceeded. System locked for ${LOCKOUT_MS / 1000}s.`);
        } else {
          setError(`Authentication failed. ${MAX_ATTEMPTS - newAttempts} attempts remaining.`);
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setError('Request timeout. Check connection.');
      } else {
        setError('Connection failed. Verify network.');
      }
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center font-mono p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <div className="bg-[#1a1a1a] border border-[#F7931A]/50 rounded-lg shadow-2xl overflow-hidden">
          <div className="bg-[#F7931A]/10 p-6 border-b border-[#F7931A]/20">
            <div className="flex flex-col items-center">
              <motion.div
                animate={isLocked ? { x: [-5, 5, -5, 5, 0] } : {}}
                transition={{ duration: 0.4 }}
              >
                <Lock className={`w-12 h-12 ${isLocked ? 'text-red-500' : 'text-[#F7931A]'} mb-4`} />
              </motion.div>
              <h2 className="text-xl font-bold text-white tracking-wider">SATOSHI CORE</h2>
              <p className="text-gray-500 text-xs mt-1 uppercase tracking-widest">Restricted Access</p>
            </div>
          </div>

          <div className="p-6 space-y-4">
            {isLocked && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-red-500/10 border border-red-500/30 rounded p-3 flex items-center gap-3"
              >
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <span className="text-red-400 text-xs">
                  Security lockout active. {remainingTime}s remaining.
                </span>
              </motion.div>
            )}

            <form onSubmit={handleUnlock} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs text-gray-500 uppercase tracking-wider">
                  Authentication Key
                </label>
                <input
                  type="password"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  placeholder="••••••••••••••••"
                  disabled={isLocked || checking}
                  className="w-full px-4 py-3 bg-black border border-[#2a2a2a] rounded text-white placeholder-gray-600 focus:border-[#F7931A] focus:outline-none transition-colors disabled:opacity-50 font-mono text-sm"
                  autoFocus
                  autoComplete="off"
                />
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-500 text-xs text-center bg-red-500/10 py-2 rounded"
                >
                  {escapeHtml(error)}
                </motion.p>
              )}

              <button
                type="submit"
                disabled={checking || isLocked || !key.trim()}
                className="w-full py-3 bg-[#F7931A] text-black font-bold rounded hover:bg-[#e88a00] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {checking ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-black border-t-transparent rounded-full"
                    />
                    <span>VERIFYING...</span>
                  </>
                ) : (
                  <span>DECRYPT ACCESS</span>
                )}
              </button>
            </form>

            <p className="text-center text-gray-600 text-[10px]">
              Session expires on tab close. No persistent storage.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ============================================================================
// TYPES
// ============================================================================

interface StatsData {
  status: string;
  timestamp: number;
  node: string;
  threat_level: string;
  message: string;
}

interface BanData {
  ip: string;
  reason: string;
  timestamp: number;
  expires: number;
  nodeType: string;
  previousBans: number;
}

interface ThreatData {
  id: string;
  timestamp: number;
  ip: string;
  score: number;
  signatures: string[];
  category: string;
  action: string;
  resolved: boolean;
}

interface BypassData {
  timestamp: number;
  ip: string;
  reason: string;
  trustScore: number;
  approved: boolean;
}

// ============================================================================
// DASHBOARD CONTENT - SECURITY SOC
// ============================================================================

function DashboardContent({ apiKey, onLogout }: { apiKey: string; onLogout: () => void }) {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [bans, setBans] = useState<BanData[]>([]);
  const [threats, setThreats] = useState<ThreatData[]>([]);
  const [bypasses, setBypasses] = useState<BypassData[]>([]);
  const [paranoiaMode, setParanoiaMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [unbanningIp, setUnbanningIp] = useState<string | null>(null);

  const fetchAllData = useCallback(async () => {
    try {
      const headers = { 'X-API-Key': apiKey };

      const [statsRes, bansRes, threatsRes, bypassesRes, configRes] = await Promise.all([
        fetch('/api/satoshi/immune/stats', { headers }),
        fetch('/api/satoshi/immune/bans', { headers }),
        fetch('/api/satoshi/immune/threats?limit=20', { headers }),
        fetch('/api/satoshi/immune/bypasses', { headers }),
        fetch('/api/satoshi/immune/config', { headers })
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (bansRes.ok) setBans(await bansRes.json());
      if (threatsRes.ok) setThreats(await threatsRes.json());
      if (bypassesRes.ok) setBypasses(await bypassesRes.json());
      if (configRes.ok) {
        const config = await configRes.json();
        setParanoiaMode(config.paranoiaMode);
      }

      setLastUpdate(new Date());
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, [apiKey]);

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 30000); // Auto-refresh cada 30s
    return () => clearInterval(interval);
  }, [fetchAllData]);

  const handleUnban = async (ip: string) => {
    setUnbanningIp(ip);
    try {
      const res = await fetch('/api/satoshi/immune/unban', {
        method: 'POST',
        headers: { 'X-API-Key': apiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip })
      });

      if (res.ok) {
        setBans(prev => prev.filter(b => b.ip !== ip));
        fetchAllData(); // Refrescar datos
      }
    } catch (error) {
      console.error('Unban error:', error);
    } finally {
      setUnbanningIp(null);
    }
  };

  const toggleParanoia = async () => {
    try {
      const newMode = !paranoiaMode;
      const res = await fetch('/api/satoshi/immune/config', {
        method: 'POST',
        headers: { 'X-API-Key': apiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({ paranoiaMode: newMode })
      });

      if (res.ok) {
        setParanoiaMode(newMode);
      }
    } catch (error) {
      console.error('Config error:', error);
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getThreatColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'low': return 'text-green-400 bg-green-400/10 border-green-400/30';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
      case 'high': return 'text-orange-400 bg-orange-400/10 border-orange-400/30';
      case 'critical': return 'text-red-400 bg-red-400/10 border-red-400/30';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/30';
    }
  };

  const getScoreColor = (score: number) => {
    if (score < 0.3) return 'text-green-400';
    if (score < 0.6) return 'text-yellow-400';
    if (score < 0.85) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-300 font-mono">
      {/* Header */}
      <header className="border-b border-[#2a2a2a] bg-[#1a1a1a] p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-[#F7931A]" />
            <div>
              <h1 className="text-[#F7931A] font-bold tracking-wider">SATOSHI IMMUNE DASHBOARD</h1>
              <p className="text-xs text-gray-500">Security Operations Center</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleParanoia}
              className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-bold transition-all ${paranoiaMode
                ? 'bg-red-500/20 text-red-400 border border-red-500/50 animate-pulse'
                : 'bg-green-500/20 text-green-400 border border-green-500/50'
                }`}
            >
              <Power className="w-3 h-3" />
              {paranoiaMode ? 'PARANOIA ON' : 'PARANOIA OFF'}
            </button>

            <button
              onClick={fetchAllData}
              disabled={loading}
              className="p-2 text-gray-400 hover:text-[#F7931A] transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={onLogout}
              className="text-xs text-red-500 hover:text-red-400 border border-red-500/30 px-3 py-1.5 rounded hover:bg-red-500/10 transition-colors"
            >
              [PURGE SESSION]
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500 uppercase">System Status</span>
              <Activity className="w-4 h-4 text-green-400" />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-green-400 font-bold">{stats?.status || 'UNKNOWN'}</span>
            </div>
            <p className="text-xs text-gray-600 mt-1">{stats?.node}</p>
          </div>

          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500 uppercase">Threat Level</span>
              <AlertTriangle className={`w-4 h-4 ${stats?.threat_level === 'low' ? 'text-green-400' : 'text-yellow-400'}`} />
            </div>
            <span className={`text-2xl font-bold uppercase ${getThreatColor(stats?.threat_level || 'low').split(' ')[0]}`}>
              {stats?.threat_level || 'UNKNOWN'}
            </span>
          </div>

          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500 uppercase">Active Bans</span>
              <Ban className="w-4 h-4 text-red-400" />
            </div>
            <span className="text-2xl font-bold text-red-400">{bans.length}</span>
            <p className="text-xs text-gray-600 mt-1">IPs quarantined</p>
          </div>

          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500 uppercase">Bypasses</span>
              <CheckCircle className="w-4 h-4 text-blue-400" />
            </div>
            <span className="text-2xl font-bold text-blue-400">{bypasses.length}</span>
            <p className="text-xs text-gray-600 mt-1">Verified accesses</p>
          </div>
        </div>

        {/* Live Threats */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg overflow-hidden">
          <div className="p-4 border-b border-[#2a2a2a] flex justify-between items-center">
            <h3 className="text-sm font-bold text-gray-300 flex items-center gap-2">
              <Activity className="w-4 h-4 text-red-400" />
              LIVE THREATS
            </h3>
            <span className="text-xs text-gray-500">
              Last update: {formatTime(lastUpdate.getTime())}
            </span>
          </div>

          <div className="max-h-64 overflow-y-auto">
            {threats.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">
                No threats detected. System calm.
              </div>
            ) : (
              <table className="w-full text-xs">
                <thead className="bg-[#0a0a0a] text-gray-500">
                  <tr>
                    <th className="text-left p-3">Time</th>
                    <th className="text-left p-3">IP</th>
                    <th className="text-left p-3">Signature</th>
                    <th className="text-left p-3">Score</th>
                    <th className="text-left p-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {threats.map((threat, idx) => (
                    <tr key={threat.id || idx} className="border-b border-[#2a2a2a] hover:bg-[#2a2a2a]/50">
                      <td className="p-3 text-gray-400">{formatTime(threat.timestamp)}</td>
                      <td className="p-3 font-mono text-gray-300">{threat.ip}</td>
                      <td className="p-3">
                        <span className="text-red-400">{threat.signatures?.[0] || 'Unknown'}</span>
                      </td>
                      <td className="p-3">
                        <span className={getScoreColor(threat.score)}>
                          {(threat.score * 100).toFixed(0)}%
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase ${threat.action === 'ban' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                          {threat.action}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quarantine (Bans) */}
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg overflow-hidden">
            <div className="p-4 border-b border-[#2a2a2a]">
              <h3 className="text-sm font-bold text-gray-300 flex items-center gap-2">
                <Ban className="w-4 h-4 text-red-400" />
                QUARANTINE
              </h3>
            </div>

            <div className="max-h-64 overflow-y-auto">
              {bans.length === 0 ? (
                <div className="p-8 text-center text-gray-500 text-sm">
                  No active bans. Network healthy.
                </div>
              ) : (
                <div className="divide-y divide-[#2a2a2a]">
                  {bans.map((ban, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between hover:bg-[#2a2a2a]/30">
                      <div>
                        <p className="text-sm font-mono text-gray-300">{ban.ip}</p>
                        <p className="text-xs text-gray-500">{ban.reason}</p>
                        <p className="text-xs text-gray-600">Expires: {formatTime(ban.expires)}</p>
                      </div>
                      <button
                        onClick={() => handleUnban(ban.ip)}
                        disabled={unbanningIp === ban.ip}
                        className="px-3 py-1 text-xs bg-green-500/10 text-green-400 border border-green-500/30 rounded hover:bg-green-500/20 transition-colors disabled:opacity-50"
                      >
                        {unbanningIp === ban.ip ? '...' : 'UNBAN'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Bypasses */}
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg overflow-hidden">
            <div className="p-4 border-b border-[#2a2a2a]">
              <h3 className="text-sm font-bold text-gray-300 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-blue-400" />
                VERIFIED ACCESSES
              </h3>
            </div>

            <div className="max-h-64 overflow-y-auto">
              {bypasses.length === 0 ? (
                <div className="p-8 text-center text-gray-500 text-sm">
                  No verified bypasses yet.
                </div>
              ) : (
                <div className="divide-y divide-[#2a2a2a]">
                  {bypasses.map((bypass, idx) => (
                    <div key={idx} className="p-3 hover:bg-[#2a2a2a]/30">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-mono text-gray-300">{bypass.ip}</p>
                        <span className={`px-2 py-0.5 rounded text-[10px] ${bypass.approved ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                          {bypass.approved ? 'APPROVED' : 'DENIED'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">{bypass.reason}</p>
                      <p className="text-xs text-gray-600">Trust: {(bypass.trustScore * 100).toFixed(0)}% • {formatTime(bypass.timestamp)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// ============================================================================
// MAIN DASHBOARD COMPONENT
// ============================================================================

export default function ImmuneDashboard() {
  const [unlocked, setUnlocked] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);

  useEffect(() => {
    const stored = retrieveKey();
    if (stored) {
      setApiKey(stored);
      setUnlocked(true);
    }
  }, []);

  const handleUnlock = useCallback((key: string) => {
    setApiKey(key);
    setUnlocked(true);
  }, []);

  const handleLogout = useCallback(() => {
    clearKey();
    setApiKey(null);
    setUnlocked(false);
  }, []);

  if (!unlocked || !apiKey) {
    return <SecurityGate onUnlock={handleUnlock} />;
  }

  return <DashboardContent apiKey={apiKey} onLogout={handleLogout} />;
}