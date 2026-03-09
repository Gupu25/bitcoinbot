'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Sparkles, Loader2 } from 'lucide-react';

interface BobChatWidgetProps {
    mode: 'hero' | 'floating';
    context?: 'general' | 'mining' | 'signing' | 'taxes' | 'seed' | 'merkle';
    lang?: 'en' | 'es';
}

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export function BobChatWidget({ mode, context = 'general', lang = 'es' }: BobChatWidgetProps) {
    const [isOpen, setIsOpen] = useState(mode === 'hero');
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);

    // Load from sessionStorage on mount
    useEffect(() => {
        const saved = sessionStorage.getItem(`bob_chat_${context}`);
        if (saved) {
            setMessages(JSON.parse(saved));
        }
    }, [context]);

    // Save to sessionStorage on change
    useEffect(() => {
        sessionStorage.setItem(`bob_chat_${context}`, JSON.stringify(messages));
    }, [messages, context]);

    // Auto-scroll to bottom (only within chat container, not the page)
    useEffect(() => {
        const el = messagesContainerRef.current;
        if (el) {
            el.scrollTop = el.scrollHeight;
        }
    }, [messages]);

    // Context-aware system prompt
    const getSystemPrompt = () => {
        const prompts: Record<string, string> = {
            general: 'You are B.O.B., a friendly Bitcoin tutor. Answer in simple terms.',
            mining: 'You are B.O.B. Help users understand Proof-of-Work, mining difficulty, and hash rates.',
            signing: 'You are B.O.B. Explain ECDSA, Schnorr, MuSig, and nonce security.',
            taxes: 'You are B.O.B. Focus on SAT compliance, traceability, and Mexican tax law for Bitcoin.',
            seed: 'You are B.O.B. Teach about seed phrases, entropy, and key security.',
            merkle: 'You are B.O.B. Explain Merkle trees, SPV proofs, and transaction verification.',
        };
        return prompts[context] || prompts.general;
    };

    const sendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: input,
                    context,
                    lang,
                    useRAG: true,
                }),
            });

            const data = await res.json();
            const assistantMessage: Message = { role: 'assistant', content: data.response };
            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, { role: 'assistant', content: 'Oops! Something went wrong. Try again~!' }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    // Floating Mode (Labs)
    if (mode === 'floating') {
        return (
            <>
                {/* Floating Button */}
                <motion.button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full shadow-lg shadow-orange-500/30 flex items-center justify-center text-white hover:scale-110 transition-transform"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <MessageSquare className="w-6 h-6" />
                </motion.button>

                {/* Chat Window */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.9 }}
                            className="fixed bottom-24 right-6 z-50 w-[min(90vw,400px)] h-[500px] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
                        >
                            {/* Header */}
                            <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-4 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-white" />
                                    <span className="font-bold text-white">B.O.B. {context !== 'general' && `• ${context}`}</span>
                                </div>
                                <button onClick={() => setIsOpen(false)} className="text-white hover:bg-white/20 rounded-lg p-1">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Messages */}
                            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-950">
                                {messages.length === 0 && (
                                    <div className="text-center text-slate-500 text-sm mt-20">
                                        <p>👋 ¡Hola! Soy B.O.B.</p>
                                        <p>¿En qué puedo ayudarte con {context}?</p>
                                    </div>
                                )}
                                {messages.map((msg, i) => (
                                    <div
                                        key={i}
                                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[80%] p-3 rounded-xl text-sm ${msg.role === 'user'
                                                    ? 'bg-orange-500 text-white'
                                                    : 'bg-slate-800 text-slate-200'
                                                }`}
                                        >
                                            {msg.content}
                                        </div>
                                    </div>
                                ))}
                                {isLoading && (
                                    <div className="flex justify-start">
                                        <div className="bg-slate-800 p-3 rounded-xl flex items-center gap-2">
                                            <Loader2 className="w-4 h-4 animate-spin text-orange-400" />
                                            <span className="text-slate-400 text-sm">B.O.B. está pensando...</span>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input */}
                            <div className="p-4 bg-slate-900 border-t border-slate-800 flex gap-2">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Escribe tu pregunta..."
                                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-orange-500"
                                />
                                <button
                                    onClick={sendMessage}
                                    disabled={!input.trim() || isLoading}
                                    className="bg-orange-500 hover:bg-orange-600 disabled:bg-slate-700 text-white p-2 rounded-xl"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </>
        );
    }

    // Hero Mode (Home Page)
    return (
        <div className="w-full max-w-3xl mx-auto bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-4 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-white" />
                <span className="font-bold text-white text-lg">B.O.B. - Bitcoin Operated Brain</span>
            </div>

            {/* Messages */}
            <div ref={messagesContainerRef} className="h-[500px] overflow-y-auto p-4 space-y-3 bg-slate-950">
                {messages.length === 0 && (
                    <div className="text-center text-slate-500 text-sm mt-20">
                        <p className="text-2xl mb-2">🤖</p>
                        <p>¡Hola! Soy B.O.B., tu tutor de Bitcoin~!</p>
                        <p className="mt-2">Pregúntame sobre:</p>
                        <ul className="mt-2 space-y-1 text-slate-400">
                            <li>• Mining y Proof-of-Work ⛏️</li>
                            <li>• Firmas digitales 🔐</li>
                            <li>• Impuestos y SAT 📊</li>
                            <li>• Seed phrases y seguridad 🌱</li>
                        </ul>
                    </div>
                )}
                {messages.map((msg, i) => (
                    <div
                        key={i}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[80%] p-3 rounded-xl text-sm ${msg.role === 'user'
                                    ? 'bg-orange-500 text-white'
                                    : 'bg-slate-800 text-slate-200'
                                }`}
                        >
                            {msg.content}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-slate-800 p-3 rounded-xl flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-orange-400" />
                            <span className="text-slate-400 text-sm">B.O.B. está pensando...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-slate-900 border-t border-slate-800 flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Escribe tu pregunta sobre Bitcoin..."
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500"
                />
                <button
                    onClick={sendMessage}
                    disabled={!input.trim() || isLoading}
                    className="bg-orange-500 hover:bg-orange-600 disabled:bg-slate-700 text-white px-6 py-3 rounded-xl font-medium"
                >
                    <Send className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
