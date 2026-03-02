import { NextRequest } from 'next/server';
import { streamChat, ENHANCED_SYSTEM_PROMPT } from '@/lib/groq';  // ← Import unificado
import { searchWhitepaper } from '@/lib/vector/search';

export const runtime = 'edge';

// 🎯 Type definitions para seguridad
interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface RequestBody {
  messages: ChatMessage[];
  useRAG?: boolean;
}

interface WhitepaperDoc {
  metadata?: {
    text?: string;
    [key: string]: any;
  };
  text?: string;
  score?: number;
}

// ⏱️ Configurable timeout para RAG
const RAG_TIMEOUT_MS = 2000;
const MAX_RAG_DOCS = 3;

/**
 * Extrae el último mensaje del usuario para búsqueda semántica
 */
function getLastUserMessage(messages: ChatMessage[]): string | null {
  const userMessages = messages.filter((m) => m.role === 'user');
  return userMessages.pop()?.content ?? null;
}

/**
 * Formatea documentos del whitepaper para contexto
 */
function formatRAGContext(docs: WhitepaperDoc[]): string {
  if (!docs.length) return '';
  
  const context = docs
    .map((doc, i) => {
      const text = doc.metadata?.text || doc.text || '';
      // Truncate long texts to prevent token bloat
      const truncated = text.length > 500 ? text.slice(0, 500) + '...' : text;
      return `[${i + 1}] ${truncated}`;
    })
    .join('\n\n');

  return `\n\n📜 Contexto Whitepaper:\n${context}`;
}

/**
 * Wrapper con timeout para búsqueda vectorial
 */
async function searchWithTimeout(
  query: string, 
  limit: number, 
  timeoutMs: number
): Promise<WhitepaperDoc[]> {
  const timeoutPromise = new Promise<never>((_, reject) => 
    setTimeout(() => reject(new Error('RAG_TIMEOUT')), timeoutMs)
  );
  
  try {
    return await Promise.race([
      searchWhitepaper(query, limit),
      timeoutPromise,
    ]);
  } catch (error) {
    if (error instanceof Error && error.message === 'RAG_TIMEOUT') {
      console.warn('⏱️ RAG search timeout - proceeding without context');
    } else {
      console.error('🔍 RAG search error:', error);
    }
    return [];
  }
}

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID().slice(0, 8);
  
  console.log(`🚀 [${requestId}] Chat request received`);

  try {
    // 📝 Parse body con validación
    let body: RequestBody;
    try {
      body = await request.json();
    } catch {
      return Response.json(
        { error: 'Invalid JSON body', requestId }, 
        { status: 400 }
      );
    }

    const { messages, useRAG = true } = body;

    // ✅ Validación estricta
    if (!Array.isArray(messages) || messages.length === 0) {
      return Response.json(
        { error: 'Messages must be a non-empty array', requestId }, 
        { status: 400 }
      );
    }

    // Validar estructura de mensajes
    const invalidMsg = messages.find(
      (m) => !m.role || !['user', 'assistant', 'system'].includes(m.role) || typeof m.content !== 'string'
    );
    if (invalidMsg) {
      return Response.json(
        { error: 'Invalid message format', details: invalidMsg, requestId }, 
        { status: 400 }
      );
    }

    // 🧠 Construir prompt con RAG opcional
    let systemPrompt = ENHANCED_SYSTEM_PROMPT;
    let ragContext = '';
    
    if (useRAG) {
      const lastUserMsg = getLastUserMessage(messages);
      
      if (lastUserMsg && lastUserMsg.trim().length > 0) {
        console.log(`🔍 [${requestId}] Searching whitepaper for: "${lastUserMsg.slice(0, 50)}..."`);
        
        const docs = await searchWithTimeout(lastUserMsg, MAX_RAG_DOCS, RAG_TIMEOUT_MS);
        
        if (docs.length > 0) {
          ragContext = formatRAGContext(docs);
          systemPrompt += ragContext;
          console.log(`✅ [${requestId}] RAG context added: ${docs.length} docs`);
        } else {
          console.log(`⚠️ [${requestId}] No relevant docs found`);
        }
      }
    }

    // 🎭 Preparar mensajes para Groq
    const groqMessages = [
      { role: 'system' as const, content: systemPrompt },
      ...messages.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    ];

    // 🌊 Iniciar streaming
    console.log(`⚡ [${requestId}] Starting stream...`);
    const stream = streamChat({
      messages: groqMessages,
      temperature: 0.8,
      max_tokens: 2048,
    });

    const encoder = new TextEncoder();
    let chunkCount = 0;
    
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            // Validar que el chunk sea string
            if (typeof chunk !== 'string') {
              console.warn(`⚠️ [${requestId}] Non-string chunk received:`, typeof chunk);
              continue;
            }
            
            controller.enqueue(encoder.encode(chunk));
            chunkCount++;
          }
          
          console.log(`✅ [${requestId}] Stream complete: ${chunkCount} chunks`);
        } catch (err) {
          console.error(`💥 [${requestId}] Stream error:`, err);
          controller.error(err);
        } finally {
          controller.close();
        }
      },
      
      cancel() {
        console.log(`🛑 [${requestId}] Stream cancelled by client`);
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Accel-Buffering': 'no',
        'X-Request-ID': requestId,
      },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`💀 [${requestId}] Fatal error:`, errorMessage);
    
    return Response.json(
      { 
        error: 'Internal server error', 
        requestId,
        timestamp: new Date().toISOString(),
      }, 
      { status: 500 }
    );
  }
}