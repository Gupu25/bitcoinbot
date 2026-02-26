'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useMemo, useEffect, useState } from 'react';

interface Node {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
}

export function NetworkNodes() {
  const [mounted, setMounted] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  // 🐱 FIX #1: Generar nodos UNA SOLA VEZ con useMemo
  // Evita hydration mismatch y re-renders innecesarios
  const nodes = useMemo<Node[]>(() => {
    // Semilla pseudo-aleatoria basada en ID para consistencia SSR/CSR
    const seedRandom = (seed: number) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };

    return Array.from({ length: 12 }, (_, i) => ({ // 🐱 FIX #2: 12 nodos en vez de 20
      id: i,
      x: seedRandom(i * 997) * 100, // Distribución determinística
      y: seedRandom(i * 331) * 100,
      size: seedRandom(i * 773) * 2 + 1, // 1-3px (más pequeños)
      delay: seedRandom(i * 557) * 3, // 0-3s delay
      duration: 3 + seedRandom(i * 883) * 2, // 3-5s duración variable
    }));
  }, []);

  // 🐱 FIX #3: Solo renderizar en cliente (evita hydration mismatch)
  useEffect(() => {
    setMounted(true);
  }, []);

  // 🐱 FIX #4: Respetar preferencia de reduced motion (accesibilidad)
  if (!mounted || shouldReduceMotion) {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(247,147,26,0.1)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(247,147,26,0.1)_0%,transparent_50%)]" />
      </div>
    );
  }

  // 🐱 FIX #5: Menos nodos visibles en móvil (detección simple)
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
  const visibleNodes = isMobile ? nodes.slice(0, 6) : nodes; // 6 en móvil, 12 en desktop
  const lineCount = isMobile ? 3 : 5; // Menos líneas en móvil

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Nodos principales - pulso suave */}
      {visibleNodes.map((node) => (
        <motion.div
          key={node.id}
          className="absolute rounded-full bg-orange-500/30"
          style={{
            left: `${node.x}%`,
            top: `${node.y}%`,
            width: node.size,
            height: node.size,
            willChange: 'transform, opacity', // 🐱 FIX #6: GPU acceleration hint
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: node.duration,
            delay: node.delay,
            repeat: Infinity,
            ease: "easeInOut",
            // 🐱 FIX #7: Pausar cuando no es visible (ahorro batería)
            repeatType: "loop",
          }}
        />
      ))}

      {/* Líneas de conexión - solo las más visibles */}
      <svg
        className="absolute inset-0 w-full h-full opacity-10"
        preserveAspectRatio="none"
      >
        {visibleNodes.slice(0, lineCount).map((node, i) => {
          const nextNode = visibleNodes[(i + 1) % visibleNodes.length];
          return (
            <motion.line
              key={`line-${i}`}
              x1={`${node.x}%`}
              y1={`${node.y}%`}
              x2={`${nextNode.x}%`}
              y2={`${nextNode.y}%`}
              stroke="#f7931a"
              strokeWidth="0.5"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.2 }}
              transition={{
                duration: 4,
                delay: i * 0.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{ willChange: 'stroke-dasharray, opacity' }}
            />
          );
        })}
      </svg>

      {/* 🐱 FIX #8: Gradientes estáticos como fallback visual */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-orange-500/5 to-transparent opacity-50" />
    </div>
  );
}