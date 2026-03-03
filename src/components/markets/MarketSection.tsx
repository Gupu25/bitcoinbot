'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, TrendingDown, Activity, LineChart, BarChart3, Hash,
  CircleDollarSign, Zap, Shield, Minus, Info, RefreshCw, AlertTriangle,
  HelpCircle // 🐱 FIX: Nuevo ícono para tooltips educativos
} from 'lucide-react';
import useSWR from 'swr';

interface MarketData {
  price: number;
  change24h: number;
  change7d: number;
  change30d: number;
  marketCap: number;
  volume24h: number;
  dominance: number;
  ath: number;
  athChange: number;
  athDate: string;
  hashrate: number;
  supply: {
    circulating: number;
    total: number | null;
    max: number;
  };
  lastUpdated: string;
}

interface MarketSectionProps {
  lang: 'en' | 'es';
}

// 🐱 FIX #1: Traducciones actualizadas con BTC/MXN + contenido educativo
const translations = {
  en: {
    title: 'Network Metrics',
    subtitle: 'Market data is secondary to network utility',
    price: 'BTC/MXN', // 🐱 Cambiado a MXN
    ath: 'All-Time High',
    fromATH: 'from ATH',
    marketCap: 'Market Cap',
    volume: '24h Volume',
    dominance: 'Dominance',
    hashRate: 'Hash Rate',
    supply: 'Circulating Supply',
    networkHealth: 'Network Health',
    source: 'Data: CoinGecko API • Updates every 60s',
    error: 'Unable to fetch market data',
    retry: 'Retry',
    timeframes: { '24h': '24h', '7d': '7d', '30d': '30d' },
    // 🎓 Nuevos textos educativos
    tooltips: {
      price: 'Current Bitcoin price in Mexican Pesos',
      marketCap: 'Total value of all BTC in circulation × price',
      volume: 'Amount of BTC traded in the last 24 hours',
      dominance: "Bitcoin's share of total crypto market value",
      hashRate: "Network's computing power securing transactions",
      supply: `BTC mined so far (${(21000000).toLocaleString()} max)`
    },
    eduFacts: [
      "💡 Did you know? Bitcoin's 21M cap is hardcoded in the protocol!",
      "⚡ Hash rate = more security. Miners protect the network with energy!",
      "🌍 Dominance shows Bitcoin's strength vs other cryptocurrencies"
    ]
  },
  es: {
    title: 'Métricas de Red',
    subtitle: 'Los datos de mercado son secundarios a la utilidad de la red',
    price: 'BTC/MXN', // 🐱 ¡Cambiado a pesos mexicanos! 🇲🇽
    ath: 'Máximo Histórico',
    fromATH: 'desde ATH',
    marketCap: 'Cap. de Mercado',
    volume: 'Volumen 24h',
    dominance: 'Dominancia',
    hashRate: 'Tasa de Hash',
    supply: 'Suministro Circulante',
    networkHealth: 'Salud de Red',
    source: 'Datos: CoinGecko API • Actualiza cada 60s',
    error: 'No se pudieron obtener datos de mercado',
    retry: 'Reintentar',
    timeframes: { '24h': '24h', '7d': '7d', '30d': '30d' },
    // 🎓 Textos educativos en español~
    tooltips: {
      price: 'Precio actual de Bitcoin en Pesos Mexicanos',
      marketCap: 'Valor total de todos los BTC en circulación × precio',
      volume: 'Cantidad de BTC operados en las últimas 24 horas',
      dominance: 'Participación de Bitcoin en el mercado crypto total',
      hashRate: 'Poder computacional que protege la red Bitcoin',
      supply: `BTC minados hasta ahora (${(21000000).toLocaleString()} máximo)`
    },
    eduFacts: [
      "💡 ¿Sabías? ¡El límite de 21M de BTC está escrito en el protocolo!",
      "⚡ Más hash rate = más seguridad. ¡Los mineros protegen la red con energía!",
      "🌍 La dominancia muestra la fuerza de Bitcoin vs otras criptomonedas"
    ]
  }
};

// 🐱 FIX #2: Fetcher actualizado para MXN + timeout robusto
const fetchMarketData = async (): Promise<MarketData> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const [priceRes, detailsRes] = await Promise.all([
      fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=mxn&include_24hr_change=true&include_7d_change=true&include_30d_change=true&include_market_cap=true&include_24hr_vol=true',
        { signal: controller.signal, next: { revalidate: 60 } }
      ),
      fetch(
        'https://api.coingecko.com/api/v3/coins/bitcoin?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false',
        { signal: controller.signal, next: { revalidate: 60 } }
      )
    ]);

    clearTimeout(timeout);

    if (!priceRes.ok || !detailsRes.ok) throw new Error('API response not OK');

    const priceData = await priceRes.json();
    const detailsData = await detailsRes.json();

    const hashrateTH = detailsData.market_data?.hash_rate || 0;
    const hashrateEH = hashrateTH > 0 ? (hashrateTH / 1e6).toFixed(2) : '600';

    return {
      price: priceData.bitcoin.mxn, // 🐱 MXN en lugar de USD
      change24h: priceData.bitcoin.mxn_24h_change || 0,
      change7d: priceData.bitcoin.mxn_7d_change || 0,
      change30d: priceData.bitcoin.mxn_30d_change || 0,
      marketCap: priceData.bitcoin.mxn_market_cap || 0,
      volume24h: priceData.bitcoin.mxn_24h_vol || 0,
      dominance: detailsData.market_data?.market_cap_percentage?.btc || 52,
      ath: detailsData.market_data?.ath?.mxn || 0, // 🐱 ATH en MXN
      athChange: detailsData.market_data?.ath_change_percentage?.mxn || 0,
      athDate: detailsData.market_data?.ath_date?.mxn || new Date().toISOString(),
      hashrate: parseFloat(hashrateEH as string),
      supply: {
        circulating: detailsData.market_data?.circulating_supply || 0,
        total: detailsData.market_data?.total_supply || null,
        max: 21000000,
      },
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    clearTimeout(timeout);
    throw error;
  }
};

// 🐱 FIX #3: Formato de moneda en MXN con Intl
const formatCurrency = (value: number, lang: 'en' | 'es', compact = false): string => {
  const locale = lang === 'es' ? 'es-MX' : 'en-US'; // 🐱 es-MX para formato mexicano~

  if (compact && value >= 1e12) {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'MXN', // 🐱 ¡Pesos mexicanos! 💵
      notation: 'compact',
      maximumFractionDigits: 2
    }).format(value);
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'MXN', // 🐱 MXN everywhere~
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatDate = (dateString: string, lang: 'en' | 'es'): string => {
  const date = new Date(dateString);
  const locale = lang === 'es' ? 'es-MX' : 'en-US';
  return new Intl.DateTimeFormat(locale, {
    year: '2-digit', month: 'short', day: 'numeric'
  }).format(date);
};

// 🎓 Componente de Tooltip Educativo Kawaii~ ✨
const EduTooltip = ({ text, lang }: { text: string; lang: 'en' | 'es' }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    whileHover={{ opacity: 1, scale: 1 }}
    className="group relative inline-flex items-center ml-1"
  >
    <HelpCircle className="w-3 h-3 sm:w-4 sm:h-4 text-orange-400/70 hover:text-orange-400 cursor-help transition-colors" />
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 border border-orange-500/30 rounded-lg text-[10px] sm:text-xs text-slate-200 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg max-w-[200px] sm:max-w-xs">
      {text}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
    </div>
  </motion.div>
);

export function MarketSection({ lang }: MarketSectionProps) {
  const t = translations[lang];

  const { data, error, isLoading, mutate } = useSWR(
    'bitcoin-market-data-mxn', // 🐱 Key única para versión MXN
    fetchMarketData,
    {
      refreshInterval: 60000,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
    }
  );

  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d'>('24h');
  const [showEduFact, setShowEduFact] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('market-timeframe') as '24h' | '7d' | '30d' | null;
    if (saved && ['24h', '7d', '30d'].includes(saved)) setTimeframe(saved);

    // 🎓 Rotar hechos educativos cada 10 segundos~
    const interval = setInterval(() => {
      setShowEduFact(prev => (prev + 1) % t.eduFacts.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [t.eduFacts.length]);

  const handleTimeframeChange = useCallback((tf: '24h' | '7d' | '30d') => {
    setTimeframe(tf);
    localStorage.setItem('market-timeframe', tf);
  }, []);

  const currentChange = data ? {
    '24h': data.change24h, '7d': data.change7d, '30d': data.change30d
  }[timeframe] : 0;

  const getChangeColor = (change: number): string => {
    if (change > 0) return 'text-green-400 bg-green-500/10 border-green-500/30';
    if (change < 0) return 'text-red-400 bg-red-500/10 border-red-500/30';
    return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />;
    if (change < 0) return <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4" />;
    return <Minus className="w-3 h-3 sm:w-4 sm:h-4" />;
  };

  if (error) {
    return (
      <section id="markets-section" className="py-16 sm:py-20 bg-slate-950 border-t border-slate-800/70">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col items-center justify-center h-48 sm:h-64 text-center">
            <AlertTriangle className="w-12 h-12 text-orange-500/50 mb-4" />
            <p className="text-slate-400 font-mono mb-4">{t.error}</p>
            <button onClick={() => mutate()} className="flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/30 rounded-lg text-orange-400 hover:bg-orange-500/20 transition-colors">
              <RefreshCw className="w-4 h-4" /> {t.retry}
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (isLoading || !data) {
    return (
      <section id="markets-section" className="py-16 sm:py-20 bg-slate-950 border-t border-slate-800/70">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex justify-center items-center h-48 sm:h-64">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-orange-500" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="markets-section" className="py-12 sm:py-16 lg:py-20 bg-slate-950 border-t border-slate-800/70 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(249,115,22,0.05)_0%,transparent_60%)]" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Header con toque educativo~ 🎓 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8 lg:mb-12">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-2 bg-orange-500/10 rounded-xl">
              <LineChart className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />
            </div>
            <div>
              <h2 className="font-mono text-base sm:text-lg lg:text-xl uppercase tracking-[2px] sm:tracking-[4px] text-orange-400/90">
                {t.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-mono mt-0.5">
                {t.subtitle}
              </p>
            </div>
          </div>

          <div className="flex gap-1 sm:gap-2 p-1 bg-slate-900/80 border border-slate-700 rounded-xl sm:rounded-2xl w-fit">
            {(['24h', '7d', '30d'] as const).map((tf) => (
              <button key={tf} onClick={() => handleTimeframeChange(tf)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-mono transition-all ${timeframe === tf ? 'bg-orange-500 text-black font-bold' : 'text-slate-500 hover:text-slate-300'}`}>
                {t.timeframes[tf]}
              </button>
            ))}
          </div>
        </div>

        {/* 🎓 Educational Banner Rotativo~ */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 sm:mb-6 p-2 sm:p-3 bg-orange-500/5 border border-orange-500/20 rounded-xl sm:rounded-2xl"
        >
          <div className="flex items-center gap-2 text-[10px] sm:text-xs text-orange-300 font-mono">
            <Zap className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
            <AnimatePresence mode="wait">
              <motion.p
                key={showEduFact}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="truncate"
              >
                {t.eduFacts[showEduFact]}
              </motion.p>
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Main Price Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-4 sm:mb-6 lg:mb-8 p-4 sm:p-6 lg:p-8 bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-slate-500 mb-1 sm:mb-2">
                <CircleDollarSign className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm font-mono tracking-wider">
                  {t.price}
                  <EduTooltip text={t.tooltips.price} lang={lang} /> {/* 🎓 Tooltip~ */}
                </span>
              </div>

              <div className="flex flex-wrap items-baseline gap-2 sm:gap-4">
                <span className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white font-mono tracking-tight">
                  {formatCurrency(data.price, lang)}
                </span>
                <div className={`inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm lg:text-base font-medium border ${getChangeColor(currentChange)}`}>
                  {getChangeIcon(currentChange)}
                  <span>{Math.abs(currentChange).toFixed(2)}%</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:min-w-[180px] xl:min-w-[220px]">
              <div className="text-left lg:text-right">
                <div className="text-[10px] sm:text-xs text-slate-500 font-mono mb-0.5 flex items-center justify-start lg:justify-end gap-1">
                  {t.ath}
                  <EduTooltip text={lang === 'es' ? 'Precio más alto histórico de Bitcoin' : 'Highest price Bitcoin has ever reached'} lang={lang} />
                </div>
                <div className="text-base sm:text-xl lg:text-2xl font-bold text-white">
                  {formatCurrency(data.ath, lang)}
                </div>
                <div className={`text-[10px] sm:text-xs mt-0.5 ${data.athChange > 0 ? 'text-red-400' : 'text-green-400'}`}>
                  {data.athChange.toFixed(1)}% {t.fromATH}
                </div>
              </div>
              <div className="text-left lg:text-right">
                <div className="text-[10px] sm:text-xs text-slate-500 font-mono mb-0.5">Date</div>
                <div className="text-sm sm:text-base lg:text-lg font-bold text-white">
                  {formatDate(data.athDate, lang)}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Metrics Grid con tooltips educativos~ 🎓✨ */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
          <MetricCard
            title={t.marketCap}
            value={formatCurrency(data.marketCap, lang, true)}
            subvalue={`${(data.marketCap / 1e9).toFixed(0)}B MXN`}
            icon={BarChart3}
            tooltip={t.tooltips.marketCap}
            lang={lang}
          />
          <MetricCard
            title={t.volume}
            value={`$${(data.volume24h / 1e9).toFixed(2)}B MXN`}
            subvalue="24h"
            icon={Activity}
            tooltip={t.tooltips.volume}
            lang={lang}
          />
          <MetricCard
            title={t.dominance}
            value={`${data.dominance.toFixed(1)}%`}
            subvalue="BTC dominance"
            icon={Shield}
            tooltip={t.tooltips.dominance}
            lang={lang}
          />
          <MetricCard
            title={t.hashRate}
            value={`${data.hashrate} EH/s`}
            subvalue="Network security"
            icon={Hash}
            tooltip={t.tooltips.hashRate}
            lang={lang}
          />
          <MetricCard
            title={t.supply}
            value={`${(data.supply.circulating / 1e6).toFixed(2)}M`}
            subvalue={`${((data.supply.circulating / 21e6) * 100).toFixed(1)}% of 21M`}
            icon={CircleDollarSign}
            className="col-span-2 lg:col-span-1"
            tooltip={t.tooltips.supply}
            lang={lang}
          >
            <div className="mt-2 sm:mt-3 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${(data.supply.circulating / 21e6) * 100}%` }}
                transition={{ duration: 1, delay: 0.3 }}
                className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"
              />
            </div>
          </MetricCard>
        </div>

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="p-3 sm:p-4 lg:p-6 bg-slate-900/50 border border-slate-800 rounded-xl sm:rounded-2xl"
        >
          <div className="flex items-start gap-2 sm:gap-3">
            <Info className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500/70 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs sm:text-sm lg:text-base text-slate-300 leading-relaxed">
                {t.subtitle}
              </p>
              <p className="text-[10px] sm:text-xs font-mono text-slate-600 mt-1 sm:mt-2 tracking-wider">
                {t.source} • {new Date(data.lastUpdated).toLocaleTimeString(lang === 'es' ? 'es-MX' : 'en-US')}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// 🎓 MetricCard actualizado con tooltip educativo~
interface MetricCardProps {
  title: string;
  value: string;
  subvalue: string;
  icon: React.ElementType;
  children?: React.ReactNode;
  className?: string;
  tooltip?: string;
  lang?: 'en' | 'es';
}

function MetricCard({ title, value, subvalue, icon: Icon, children, className = '', tooltip, lang = 'es' }: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`p-3 sm:p-4 lg:p-6 bg-slate-900/60 border border-slate-800 rounded-xl sm:rounded-2xl hover:border-orange-500/30 transition-colors ${className}`}
    >
      <div className="flex items-center gap-2 mb-2 sm:mb-3">
        <div className="p-1 sm:p-1.5 lg:p-2 bg-slate-800 rounded-lg">
          <Icon className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-orange-500" />
        </div>
        <span className="text-[10px] sm:text-xs lg:text-sm text-slate-500 font-mono truncate flex items-center">
          {title}
          {tooltip && lang && <EduTooltip text={tooltip} lang={lang} />}
        </span>
      </div>

      <div className="text-lg sm:text-xl lg:text-2xl font-bold text-white font-mono tracking-tight">
        {value}
      </div>
      <div className="text-[10px] sm:text-xs lg:text-sm text-slate-500 mt-0.5 sm:mt-1">
        {subvalue}
      </div>

      {children}
    </motion.div>
  );
}