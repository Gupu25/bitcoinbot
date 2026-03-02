/**
 * 🤖 Groq Client - Bitcoin Agent
 * 
 * Cliente para LLM inference con streaming, retries y manejo de errores
 * 
 * @author Kira Solara-Ω <aisynths@proton.me>
 * @version 2.1.0 - Added retry logic, timeouts, and error handling
 */

import Groq from 'groq-sdk';

// Import prompts from dedicated file
import { BITCOIN_SYSTEM_PROMPT } from './prompts';

// Re-export para backward compatibility
export { BITCOIN_SYSTEM_PROMPT };

// ============================================
// 🔧 GROQ CLIENT SETUP
// ============================================

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Model configuration
const DEFAULT_MODEL = 'llama-3.3-70b-versatile';
const DEFAULT_TEMPERATURE = 0.7;
const DEFAULT_MAX_TOKENS = 2048;

// Timeout and retry configuration
const GROQ_TIMEOUT_MS = 30000; // 30 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;
const MAX_INPUT_CHARS = 10000;

// ============================================
// 📝 TYPE DEFINITIONS
// ============================================

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface StreamOptions {
  messages: ChatMessage[];
  model?: string;
  temperature?: number;
  max_tokens?: number;
  systemPrompt?: string;
}

// ============================================
// 🔧 UTILITY FUNCTIONS
// ============================================

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Validate message format and content
 */
function validateMessages(messages: ChatMessage[]): void {
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new Error('Messages must be a non-empty array');
  }

  for (const msg of messages) {
    if (!msg.role || !['user', 'assistant', 'system'].includes(msg.role)) {
      throw new Error(`Invalid message role: ${msg.role}`);
    }
    if (typeof msg.content !== 'string') {
      throw new Error('Message content must be a string');
    }
  }

  const totalChars = messages.reduce((acc, m) => acc + m.content.length, 0);
  if (totalChars > MAX_INPUT_CHARS) {
    throw new Error(`Input too large: ${totalChars} characters (max ${MAX_INPUT_CHARS})`);
  }
}

/**
 * Retry wrapper with exponential backoff
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  retries: number = MAX_RETRIES,
  delay: number = RETRY_DELAY_MS
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      // Don't retry on certain errors
      if (error?.status === 401 || error?.status === 400) {
        throw error;
      }

      if (attempt < retries) {
        const backoffDelay = delay * Math.pow(2, attempt);
        console.warn(`⚠️ Groq API call failed (attempt ${attempt + 1}/${retries + 1}), retrying in ${backoffDelay}ms...`);
        await sleep(backoffDelay);
      }
    }
  }

  throw lastError;
}

/**
 * Safe error logging that won't leak sensitive info
 */
function safeErrorLog(context: string, error: any): void {
  const status = error?.status || error?.statusCode || 'unknown';
  const message = error?.message || 'Unknown error';
  console.error(`💥 [Groq] ${context} (status: ${status}):`, message);
}

// ============================================
// 🌊 STREAMING CHAT
// ============================================

/**
 * Stream chat completions from Groq
 * @param options - Chat options including messages and parameters
 * @yields String chunks of the response
 */
export async function* streamChat(
  options: StreamOptions
): AsyncGenerator<string> {
  const {
    messages,
    model = DEFAULT_MODEL,
    temperature = DEFAULT_TEMPERATURE,
    max_tokens = DEFAULT_MAX_TOKENS,
    systemPrompt = BITCOIN_SYSTEM_PROMPT,
  } = options;

  // Validate input
  try {
    validateMessages(messages);
  } catch (err: any) {
    yield `[Error: ${err.message}]`;
    return;
  }

  // Prepend system message
  const messagesWithSystem: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...messages.filter((m) => m.role !== 'system'), // Remove any existing system messages
  ];

  // Setup timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), GROQ_TIMEOUT_MS);

  try {
    const stream = await withRetry(() =>
      groq.chat.completions.create({
        model,
        messages: messagesWithSystem,
        temperature,
        max_tokens,
        stream: true,
      })
    );

    for await (const chunk of stream) {
      clearTimeout(timeoutId); // Reset timeout on each chunk
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        yield content;
      }
    }
  } catch (error: any) {
    clearTimeout(timeoutId);
    safeErrorLog('Streaming error', error);

    // Yield user-friendly error messages
    if (error?.name === 'AbortError') {
      yield "\n[⚠️ El agente tardó demasiado. Intenta una pregunta más corta.]";
    } else if (error?.status === 429) {
      yield "\n[⚠️ Demasiadas solicitudes. Espera un momento.]";
    } else if (error?.status === 401) {
      yield "\n[⚠️ Error de autenticación. Contacta al admin.]";
    } else if (error?.status === 400) {
      yield `\n[⚠️ Error en la solicitud: ${error.message || 'Datos inválidos'}]`;
    } else {
      yield "\n[⚠️ Error procesando tu solicitud. Intenta de nuevo.]";
    }
  }
}

/**
 * Non-streaming chat completion (for simple queries)
 */
export async function chat(options: StreamOptions): Promise<string> {
  const chunks: string[] = [];
  for await (const chunk of streamChat(options)) {
    chunks.push(chunk);
  }
  return chunks.join('');
}

// ============================================
// 🔧 CONFIGURATION UTILITIES
// ============================================

/**
 * Check if Groq API is configured
 */
export function isGroqConfigured(): boolean {
  return !!process.env.GROQ_API_KEY;
}

/**
 * Get available models
 */
export function getAvailableModels(): string[] {
  return [
    'llama-3.3-70b-versatile',
    'llama-3.1-8b-instant',
    'mixtral-8x7b-32768',
    'gemma2-9b-it',
  ];
}

/**
 * Get client configuration info (for debugging)
 */
export function getConfig(): {
  model: string;
  timeoutMs: number;
  maxRetries: number;
  maxInputChars: number;
} {
  return {
    model: DEFAULT_MODEL,
    timeoutMs: GROQ_TIMEOUT_MS,
    maxRetries: MAX_RETRIES,
    maxInputChars: MAX_INPUT_CHARS,
  };
}
