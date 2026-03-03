'use client';

import { ReactNode, useRef, useEffect, useState } from 'react';
import { TerminalLine } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, Terminal } from 'lucide-react';

interface TerminalWindowProps {
  lines?: TerminalLine[];
  isLoading?: boolean;
  children?: ReactNode;
  /** Content that scrolls with messages (e.g. suggested question chips) */
  scrollableSlot?: ReactNode;
  className?: string;
  title?: string;
}

export function TerminalWindow({
  lines = [],
  isLoading,
  children,
  scrollableSlot,
  className = '',
  title
}: TerminalWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Track si el usuario hizo scroll manual para no interrumpir lectura
  const userScrolledRef = useRef(false);
  const lastLineCountRef = useRef(lines.length);
  const hasMountedRef = useRef(false);

  // Scroll inteligente: solo si es mensaje nuevo (no en carga inicial)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const isNewMessage = lines.length > lastLineCountRef.current;
    lastLineCountRef.current = lines.length;

    // Skip scroll on initial load (welcome message) — evita auto-scroll a secciones bajas
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    if (isNewMessage && !userScrolledRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [lines.length]);

  // Detectar scroll manual del usuario
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 50;
      userScrolledRef.current = !isAtBottom;
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const formatContent = (content: string) => {
    const parts = content.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const code = part.slice(3, -3).trim();
        const firstLine = code.split('\n')[0];
        const language = firstLine && !firstLine.includes(' ') ? firstLine : 'text';
        const actualCode = firstLine && !firstLine.includes(' ')
          ? code.slice(firstLine.length).trim()
          : code;

        return (
          <div key={index} className="my-3 rounded bg-slate-950 border border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800">
              <span className="text-xs text-slate-500 font-mono">{language}</span>
              <button
                onClick={() => copyToClipboard(actualCode, `code-${index}`)}
                className="text-xs text-slate-500 hover:text-orange-400 transition-colors flex items-center gap-1"
              >
                {copiedId === `code-${index}` ? (
                  <><Check className="w-3 h-3" /> Copied</>
                ) : (
                  <><Copy className="w-3 h-3" /> Copy</>
                )}
              </button>
            </div>
            <pre className="p-3 overflow-x-auto text-xs text-slate-300">
              <code>{actualCode}</code>
            </pre>
          </div>
        );
      }

      return (
        <span key={index}>
          {part.split(/(https?:\/\/[^\s]+)/g).map((segment, i) =>
            segment.match(/^https?:\/\//) ? (
              <a
                key={i}
                href={segment}
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-400 hover:underline break-all"
              >
                {segment}
              </a>
            ) : (
              segment
            )
          )}
        </span>
      );
    });
  };

  return (
    <div className={`w-full min-w-0 max-w-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl ${className}`}>
      {/* Header */}
      <div className="bg-slate-950 px-3 sm:px-4 py-2 sm:py-3 flex items-center gap-2 sm:gap-3 border-b border-slate-800">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
        </div>

        <div className="flex-1 flex items-center justify-center gap-2">
          <Terminal className="w-4 h-4 text-slate-600" />
          <span className="text-xs text-slate-500 font-mono tracking-wider">
            {title || 'bitcoin-agent@mainnet:~'}
          </span>
        </div>

        {!title && (
          <div className="text-xs text-slate-600 font-mono">
            {lines.length} msgs
          </div>
        )}
      </div>

      {/* Content */}
      <div
        ref={containerRef}
        className={`p-3 sm:p-4 overflow-x-hidden overflow-y-auto font-mono text-sm sm:text-base scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent scroll-smooth ${!title && lines.length > 0 ? 'min-h-[160px] max-h-[50dvh] sm:min-h-[220px] sm:max-h-[55dvh] md:min-h-[280px] md:max-h-[600px]' : 'min-h-[120px] sm:min-h-[160px]'}`}
        aria-live="polite"
        aria-atomic="false"
      >
        {lines.length === 0 && !isLoading && !children && !scrollableSlot && (
          <div className="flex items-center justify-center h-full text-slate-600">
            <span className="text-xs">Type a message to start...</span>
          </div>
        )}

        <AnimatePresence mode="popLayout">
          {lines.map((line, index) => (
            <motion.div
              key={line.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.15 }}
              className="group relative mb-3 min-w-0"
            >
              <span className="absolute -left-16 top-0 text-[10px] text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity hidden lg:block">
                {line.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>

              <div className={`min-w-0 break-words ${line.type === 'input'
                  ? 'text-orange-400'
                  : line.type === 'error'
                    ? 'text-red-400'
                    : line.type === 'system'
                      ? 'text-yellow-500/60 italic'
                      : 'text-slate-300'
                }`}>
                {line.type === 'input' && (
                  <span className="text-orange-500/50 mr-2 select-none shrink-0">{'➜'}</span>
                )}
                {line.type === 'output' && (
                  <span className="text-slate-600 mr-2 select-none shrink-0">{'◆'}</span>
                )}

                <div className="block w-full min-w-0 break-words whitespace-pre-wrap">
                  {formatContent(line.content)}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Chips / suggested questions — scroll with messages */}
        {scrollableSlot}

        {/* Loading indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-yellow-500/60 mt-4"
          >
            <span className="text-slate-600">{'◆'}</span>
            <span className="flex gap-1">
              <motion.span
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
              >●</motion.span>
              <motion.span
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
              >●</motion.span>
              <motion.span
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
              >●</motion.span>
            </span>
            <span className="text-xs italic">mining blocks...</span>
          </motion.div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Form — always visible, does not scroll */}
        {children && (
          <div className="shrink-0 border-t border-slate-800 bg-slate-900">
            {children}
          </div>
        )}
    </div>
  );
}