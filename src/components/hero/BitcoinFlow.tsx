'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface Block {
  id: string;
  label: string;
  labelEs: string;
  x: number;
  y: number;
  type: 'onchain' | 'offchain';
}

interface Connection {
  from: string;
  to: string;
}

const blocks: Block[] = [
  { id: 'pow', label: 'Proof of Work', labelEs: 'Prueba de Trabajo', x: 0, y: 0, type: 'onchain' },
  { id: 'block', label: 'Block', labelEs: 'Bloque', x: 150, y: 0, type: 'onchain' },
  { id: 'chain', label: 'Blockchain', labelEs: 'Cadena', x: 300, y: 0, type: 'onchain' },
  { id: 'lightning', label: 'Lightning', labelEs: 'Lightning', x: 150, y: 120, type: 'offchain' },
  { id: 'wallet', label: 'Wallet', labelEs: 'Billetera', x: 300, y: 120, type: 'offchain' },
];

const connections: Connection[] = [
  { from: 'pow', to: 'block' },
  { from: 'block', to: 'chain' },
  { from: 'chain', to: 'lightning' },
  { from: 'lightning', to: 'wallet' },
];

interface BitcoinFlowProps {
  lang?: 'en' | 'es';
}

export function BitcoinFlow({ lang = 'en' }: BitcoinFlowProps) {
  const [mounted, setMounted] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 500, height: 200 });

  useEffect(() => {
    setMounted(true);

    // 🐱 FIX #1: Calcular dimensiones responsivas
    const updateDimensions = () => {
      const containerWidth = Math.min(window.innerWidth - 32, 600); // Max 600px, padding 16px each side
      const scale = containerWidth / 500;
      setDimensions({
        width: containerWidth,
        height: 200 * scale,
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full max-w-xl mx-auto h-48 bg-slate-900/50 rounded-xl animate-pulse" />
    );
  }

  const scale = dimensions.width / 500;
  const blockWidth = Math.max(80, 120 * scale); // Mínimo 80px en móvil
  const blockHeight = Math.max(35, 50 * scale);
  const fontSize = Math.max(9, 12 * scale);
  const nodeRadius = Math.max(3, 4 * scale);

  return (
    <div className="relative w-full max-w-xl mx-auto px-2 sm:px-0">
      {/* 🐱 FIX #2: SVG responsive con viewBox dinámico */}
      <svg
        viewBox={`0 0 500 200`}
        className="w-full h-auto"
        preserveAspectRatio="xMidYMid meet"
        style={{ maxHeight: '250px' }}
      >
        {/* Definiciones de gradientes */}
        <defs>
          <linearGradient id="onchainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f7931a" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#f7931a" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="offchainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* Connection lines */}
        {connections.map((conn, i) => {
          const from = blocks.find((b) => b.id === conn.from)!;
          const to = blocks.find((b) => b.id === conn.to)!;

          return (
            <motion.line
              key={i}
              x1={from.x + 120}
              y1={from.y + 25}
              x2={to.x}
              y2={to.y + 25}
              stroke={to.type === 'offchain' ? '#10b981' : '#f7931a'}
              strokeWidth="2"
              strokeDasharray="5,5"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.6 }}
              transition={{ duration: 1.5, delay: i * 0.3 }}
            />
          );
        })}

        {/* Animated data flow - círculos que se mueven */}
        {connections.map((conn, i) => {
          const from = blocks.find((b) => b.id === conn.from)!;
          const to = blocks.find((b) => b.id === conn.to)!;

          return (
            <motion.circle
              key={`flow-${i}`}
              r={nodeRadius}
              fill={to.type === 'offchain' ? '#10b981' : '#f7931a'}
              initial={{ cx: from.x + 120, cy: from.y + 25, opacity: 0 }}
              animate={{
                cx: [from.x + 120, to.x],
                cy: [from.y + 25, to.y + 25],
                opacity: [0, 1, 1, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.5,
                ease: 'linear',
              }}
            />
          );
        })}

        {/* Blocks - cajas con labels */}
        {blocks.map((block, i) => (
          <motion.g
            key={block.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: i * 0.2 }}
          >
            {/* Fondo del bloque */}
            <rect
              x={block.x}
              y={block.y}
              width="120"
              height="50"
              rx="8"
              fill={block.type === 'offchain' ? 'url(#offchainGradient)' : 'url(#onchainGradient)'}
              stroke={block.type === 'offchain' ? '#10b981' : '#f7931a'}
              strokeWidth="2"
            />

            {/* Label */}
            <text
              x={block.x + 60}
              y={block.y + 30}
              textAnchor="middle"
              fill={block.type === 'offchain' ? '#10b981' : '#f7931a'}
              fontSize={fontSize}
              fontFamily="monospace"
              fontWeight="bold"
            >
              {lang === 'es' && block.labelEs ? block.labelEs : block.label}
            </text>

            {/* Icono indicador */}
            <circle
              cx={block.x + 10}
              cy={block.y + 10}
              r="3"
              fill={block.type === 'offchain' ? '#10b981' : '#f7931a'}
              opacity="0.5"
            />
          </motion.g>
        ))}
      </svg>

      {/* 🐱 FIX #3: Leyenda responsive y funcional */}
      <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-8 mt-4 sm:mt-6 text-xs text-slate-400 font-mono">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-orange-500/30 border border-orange-500/50" />
          <span>{lang === 'en' ? 'On-Chain (Base Layer)' : 'On-Chain (Capa Base)'}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-emerald-500/30 border border-emerald-500/50" />
          <span>{lang === 'en' ? 'Off-Chain (Layer 2)' : 'Off-Chain (Capa 2)'}</span>
        </div>
      </div>

      {/* 🐱 FIX #4: Descripción opcional para contexto */}
      <p className="text-center text-[10px] sm:text-xs text-slate-500 mt-3 font-mono px-4">
        {lang === 'en'
          ? 'Data flows from consensus → settlement → payment layers'
          : 'Los datos fluyen de consenso → liquidación → capas de pago'}
      </p>
    </div>
  );
}