'use client';

import { useState, useRef, useEffect, FormEvent, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { TerminalWindow } from '../terminal/TerminalWindow';
import { Locale, Message, TerminalLine } from '@/types';
import { Send, Zap } from 'lucide-react';

interface ChatInterfaceProps {
  lang: Locale;
  dict: {
    title?: string;
    subtitle?: string;
    placeholder: string;
    thinking: string;
    welcome: string;
    suggestedQuestions?: string[];
  };
}

export function ChatInterface({ lang, dict }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const streamingContentRef = useRef('');
  const [streamingContent, setStreamingContent] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const shouldScrollRef = useRef(false);

  // Inicializar mensaje de bienvenida más cálido y educativo
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        id: 'welcome',
        role: 'assistant',
        content: dict.welcome || (lang === 'en'
          ? "Konnichiwa, I'm Bitcoin Agent — your personal guide to the Bitcoin universe. Ask me anything: How Lightning works, why 21 million matters, sats stacking strategies, privacy tips... I'm here to educate, inspire, and empower. What would you like to explore first? ⚡"
          : "¡Hola! Soy Bitcoin Agent — tu guía personal en el universo Bitcoin. Pregúntame lo que quieras: cómo funciona Lightning, por qué 21 millones importan, estrategias de stacking sats, tips de privacidad... Estoy aquí para educarte, inspirarte y empoderarte. ¿Qué quieres explorar primero? ⚡"),
        createdAt: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [dict.welcome, lang, messages.length]);

  useEffect(() => {
    if (shouldScrollRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      shouldScrollRef.current = false;
    }
  }, [messages]);

  const submitMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      createdAt: new Date(),
    };

    shouldScrollRef.current = true;
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setStreamingContent('');
    streamingContentRef.current = '';

    const apiMessages = [...messages, userMessage]
      .filter((m) => m.id !== 'welcome')
      .map(({ role, content }) => ({ role, content }));

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          lang,
          useRAG: true,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);
      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';
      let lastUpdate = Date.now();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullContent += chunk;
        streamingContentRef.current = fullContent;

        const now = Date.now();
        if (now - lastUpdate > 50) {
          setStreamingContent(fullContent);
          lastUpdate = now;
        }
      }

      setStreamingContent(fullContent);

      shouldScrollRef.current = true;
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: fullContent,
          createdAt: new Date(),
        },
      ]);

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return;

      console.error('Chat error:', error);

      shouldScrollRef.current = true;
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: lang === 'en'
            ? '⚠️ Error: Could not connect to Bitcoin Agent. Please try again.'
            : '⚠️ Error: No pude conectar con Bitcoin Agent. Intenta de nuevo.',
          createdAt: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
      setStreamingContent('');
      streamingContentRef.current = '';
      abortControllerRef.current = null;
      inputRef.current?.focus({ preventScroll: true });
    }
  }, [isLoading, lang, messages]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    submitMessage(input);
  };

  const suggestedQuestions = dict.suggestedQuestions ?? [];
  const showChips = suggestedQuestions.length > 0 && messages.length <= 1 && !isLoading;

  const terminalLines = useMemo(() => {
    const lines: TerminalLine[] = messages.map((msg) => ({
      id: msg.id,
      type: msg.role === 'user' ? 'input' : 'output',
      content: msg.content,
      timestamp: msg.createdAt,
    }));

    if (isLoading) {
      if (streamingContent) {
        lines.push({
          id: 'streaming',
          type: 'output',
          content: streamingContent + '▊',
          timestamp: new Date(),
        });
      } else {
        lines.push({
          id: 'thinking',
          type: 'system',
          content: dict.thinking + '...',
          timestamp: new Date(),
        });
      }
    }

    return lines;
  }, [messages, isLoading, streamingContent, dict.thinking]);

  return (
    <section
      id="chat-section"
      className="relative py-8 sm:py-12 md:py-16 lg:py-24 px-3 sm:px-4 md:px-6 bg-black scroll-mt-20"
    >
      <div className="max-w-5xl mx-auto w-full min-w-0">
        {/* Header invitador - OPTIMIZADO PARA MÓVIL */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-5 sm:mb-8 md:mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 sm:px-6 py-1.5 sm:py-3 bg-slate-900 border border-[#f7931a]/30 rounded-xl sm:rounded-3xl mb-3 sm:mb-6">
            <Zap className="w-4 h-4 sm:w-6 sm:h-6 text-[#f7931a] shrink-0" />
            <span className="text-xs sm:text-lg font-mono text-[#f7931a] tracking-wider">Bitcoin Agent Online</span>
          </div>

          <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white font-mono tracking-[-1px] mb-2 sm:mb-4">
            {dict.title ?? (lang === 'en' ? 'Talk to Bitcoin Agent' : 'Chatea con Bitcoin Agent')}
          </h2>

          <p className="text-sm sm:text-lg md:text-xl lg:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed px-0">
            {dict.subtitle ?? (lang === 'en'
              ? "Ask anything: what Bitcoin is, how to buy it, why it matters. I explain everything in plain language. What can I help you with?"
              : "Pregunta lo que sea: qué es Bitcoin, cómo comprar, por qué te conviene. Te explico todo en español, sin tecnisimos. ¿En qué te ayudo?")}
          </p>
        </motion.div>

        {/* Terminal principal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.2 }}
          className="w-full min-w-0 overflow-hidden"
        >
          <TerminalWindow
            lines={terminalLines}
            isLoading={isLoading}
            scrollableSlot={showChips ? (
              <div className="flex flex-wrap gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-slate-900/50 border-b border-slate-800 mt-2">
                {suggestedQuestions.map((q) => (
                  <motion.button
                    key={q}
                    type="button"
                    onClick={() => submitMessage(q)}
                    className="px-3 py-1.5 text-xs sm:text-sm font-mono rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:border-[#f7931a]/50 hover:text-[#f7931a] transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {q}
                  </motion.button>
                ))}
              </div>
            ) : undefined}
          >
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 bg-slate-900 pt-2 pb-4 sm:pt-4 md:pt-5 px-3 sm:px-4"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-[#f7931a] font-mono text-lg sm:text-xl font-bold flex-shrink-0">{'>'}</span>

                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={dict.placeholder || (lang === 'en' ? "Ask about Bitcoin..." : "Pregunta sobre Bitcoin...")}
                  disabled={isLoading}
                  className="flex-1 bg-transparent text-white font-mono text-base sm:text-lg outline-none placeholder:text-slate-500 caret-[#f7931a] selection:bg-[#f7931a]/30 min-w-0"
                />
              </div>

              {/* 🐱 FIX #4: Botón full-width en móvil pequeño, normal en desktop */}
              <motion.button
                type="submit"
                disabled={isLoading || !input.trim()}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-4 sm:px-6 py-2.5 sm:py-3 bg-[#f7931a] hover:bg-[#f7931a]/90 text-black font-mono font-bold rounded-xl sm:rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 flex-shrink-0"
              >
                {isLoading ? (
                  <span className="text-sm sm:text-base">Thinking...</span>
                ) : (
                  <>
                    <span className="sm:hidden">Send</span>
                    <span className="hidden sm:inline">Send</span>
                    <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                  </>
                )}
              </motion.button>
            </form>
          </TerminalWindow>
        </motion.div>

        <div ref={messagesEndRef} />
      </div>
    </section>
  );
}