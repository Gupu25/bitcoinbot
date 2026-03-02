/**
 * 📦 Groq Module Exports
 * 
 * Punto de entrada unificado para todo lo relacionado con Groq
 */

// Client functions
export { 
  streamChat, 
  chat, 
  isGroqConfigured, 
  getAvailableModels 
} from './client';

export type { ChatMessage, StreamOptions } from './client';

// Prompts
export {
  BITCOIN_AGENT_IDENTITY,
  BITCOIN_KNOWLEDGE,
  RESPONSE_FORMATTING,
  RAG_INSTRUCTIONS,
  LANGUAGE_PROMPTS,
  BITCOIN_SYSTEM_PROMPT,
  ENHANCED_SYSTEM_PROMPT,
  EDUCATIONAL_MODE_PROMPT,
  CONCISE_MODE_PROMPT,
  CODE_EXPLANATION_PROMPT,
  getSystemPrompt,
  PROMPT_VERSION,
  PROMPT_CHANGELOG,
} from './prompts';
