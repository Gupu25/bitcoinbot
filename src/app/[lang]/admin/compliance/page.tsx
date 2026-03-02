'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, TrendingUp, AlertTriangle, Check, Calendar, 
  Download, Filter, Search, RefreshCw
} from 'lucide-react';

interface ComplianceDashboardProps {
  params: { lang: 'en' | 'es' };
}

export default function ComplianceDashboard({ params }: ComplianceDashboardProps) {
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({
    totalSats: 0,
    totalMXN: 0,
    transactionCount: 0,
    pendingReports: 0,
  });
  
  useEffect(() => {
    fetchComplianceData();
  }, []);
  
  const fetchComplianceData = async () => {
    // Fetch from API
    const res = await fetch('/api/compliance/transactions');
    const data = await res.json();
    setTransactions(data.transactions);
    setStats(data.stats);
  };
  
  const generateReport = async (type: string, period: string) => {
    await fetch('/api/compliance/reports', {
      method: 'POST',
      body: JSON.stringify({ type, period }),
    });
  };
  
  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-orange-400 flex items-center gap-3">
            <FileText className="w-8 h-8" />
            Compliance Fiscal
          </h1>
          <button
            onClick={fetchComplianceData}
            className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Recibido"
            value={`${(stats.totalSats / 1000000).toFixed(2)}M sats`}
            icon={<TrendingUp className="w-5 h-5" />}
            color="green"
          />
          <StatCard
            title="Valor MXN"
            value={`$${stats.totalMXN.toLocaleString()}`}
            icon={<FileText className="w-5 h-5" />}
            color="blue"
          />
          <StatCard
            title="Transacciones"
            value={stats.transactionCount.toString()}
            icon={<Check className="w-5 h-5" />}
            color="purple"
          />
          <StatCard
            title="Reportes Pendientes"
            value={stats.pendingReports.toString()}
            icon={<AlertTriangle className="w-5 h-5" />}
            color="orange"
          />
        </div>
        
        {/* Actions */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Generar Reportes</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => generateReport('monthly', getCurrentPeriod())}
              className="p-4 bg-slate-800 rounded-xl hover:bg-slate-700 text-center"
            >
              <Calendar className="w-6 h-6 mx-auto mb-2 text-orange-400" />
              <span className="text-sm">Mensual</span>
            </button>
            <button
              onClick={() => generateReport('quarterly', getCurrentQuarter())}
              className="p-4 bg-slate-800 rounded-xl hover:bg-slate-700 text-center"
            >
              <Calendar className="w-6 h-6 mx-auto mb-2 text-blue-400" />
              <span className="text-sm">Trimestral</span>
            </button>
            <button
              onClick={() => generateReport('annual', getCurrentYear())}
              className="p-4 bg-slate-800 rounded-xl hover:bg-slate-700 text-center"
            >
              <Calendar className="w-6 h-6 mx-auto mb-2 text-purple-400" />
              <span className="text-sm">Anual</span>
            </button>
            <button
              className="p-4 bg-slate-800 rounded-xl hover:bg-slate-700 text-center"
            >
              <Download className="w-6 h-6 mx-auto mb-2 text-green-400" />
              <span className="text-sm">Exportar CSV</span>
            </button>
          </div>
        </div>
        
        {/* Transactions Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Transacciones Recientes</h2>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Buscar..."
                className="px-3 py-2 bg-slate-800 rounded-lg text-sm"
              />
              <button className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700">
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-slate-400 text-sm border-b border-slate-800">
                  <th className="pb-3">Fecha</th>
                  <th className="pb-3">Monto (sats)</th>
                  <th className="pb-3">MXN</th>
                  <th className="pb-3">Fuente</th>
                  <th className="pb-3">Estado</th>
                  <th className="pb-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx: any) => (
                  <tr key={tx.id} className="border-b border-slate-800/50">
                    <td className="py-3 font-mono text-sm">
                      {new Date(tx.timestamp).toLocaleDateString()}
                    </td>
                    <td className="py-3 font-mono text-orange-400">
                      {tx.amountSats.toLocaleString()}
                    </td>
                    <td className="py-3 font-mono">
                      ${Number(tx.amountMXN).toFixed(2)}
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-1 bg-slate-800 rounded text-xs">
                        {tx.source}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        tx.status === 'confirmed' 
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-3">
                      <button className="text-slate-400 hover:text-white">
                        <FileText className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper components
function StatCard({ title, value, icon, color }: any) {
  const colors: Record<string, string> = {
    green: 'text-green-400',
    blue: 'text-blue-400',
    purple: 'text-purple-400',
    orange: 'text-orange-400',
  };
  
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
      <div className={`flex items-center gap-2 mb-2 ${colors[color]}`}>
        {icon}
        <span className="text-sm text-slate-400">{title}</span>
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

function getCurrentPeriod() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function getCurrentQuarter() {
  const now = new Date();
  const quarter = Math.floor(now.getMonth() / 3) + 1;
  return `${now.getFullYear()}-Q${quarter}`;
}

function getCurrentYear() {
  return String(new Date().getFullYear());
}
