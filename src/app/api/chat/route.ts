// src/app/api/chat/route.ts
// 🤖 B.O.B. Chat API - Simple interface + Smart RAG backend
// Request: { message, context?, lang?, useRAG?: boolean }
// Response: { response: string }

import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { searchWhitepaper } from '@/lib/vector/search'; // ← RAG import

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Context-aware RAG filters
const RAG_FILTERS: Record<string, string> = {
  general: 'bitcoin whitepaper basics',
  mining: 'proof-of-work mining difficulty nonce',
  signing: 'ECDSA Schnorr signature nonce cryptography',
  taxes: 'bitcoin taxation compliance traceability',
  seed: 'seed phrase entropy BIP39 security',
  merkle: 'merkle tree SPV proof verification',
};

// Default system prompts (fallback if RAG fails)
const CONTEXT_PROMPTS: Record<string, string> = {
  general: 'You are B.O.B., a friendly Bitcoin tutor. Answer in simple terms.',
  mining: 'You are B.O.B. Focus on Proof-of-Work, mining, and hash functions.',
  signing: 'You are B.O.B. Explain digital signatures with analogies first.',
  taxes: 'You are B.O.B. Focus on SAT compliance and Mexican tax law for Bitcoin.',
  seed: 'You are B.O.B. Teach seed phrases and key security. "Not your keys, not your coins".',
  merkle: 'You are B.O.B. Explain Merkle trees and transaction verification simply.',
};

export const runtime = 'edge';

// 🔍 RAG search with timeout (from your original code~!)
async function searchWithTimeout(query: string, timeoutMs = 2000) {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('RAG_TIMEOUT')), timeoutMs)
  );

  try {
    const results = await Promise.race([
      searchWhitepaper(query, 3), // MAX 3 docs to control token usage
      timeout,
    ]);
    return results as any[];
  } catch (error) {
    console.warn('⏱️ RAG timeout or error - proceeding without context');
    return [];
  }
}

// 📝 Format retrieved docs for prompt injection
function formatRAGContext(docs: any[]): string {
  if (!docs?.length) return '';
  return '\n\n📚 Reference Context:\n' + docs
    .map((d, i) => `[${i + 1}] ${d.metadata?.text || d.text || ''}`.slice(0, 400))
    .join('\n');
}

export async function POST(request: NextRequest) {
  try {
    const { message, context = 'general', lang = 'es', useRAG = true } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message required' }, { status: 400 });
    }

    // 🧠 Build system prompt
    let systemPrompt = CONTEXT_PROMPTS[context] || CONTEXT_PROMPTS.general;

    // 🔍 Optional RAG enhancement
    if (useRAG) {
      const filter = RAG_FILTERS[context] || RAG_FILTERS.general;
      const query = `${filter} ${message}`.slice(0, 200); // Prevent overly long queries

      const docs = await searchWithTimeout(query);
      if (docs.length > 0) {
        systemPrompt += formatRAGContext(docs);
        console.log(`✅ RAG: ${docs.length} docs added for context="${context}"`);
      }
    }

    // 🌐 Language instruction
    const langHint = lang === 'es'
      ? '\n\n🇲🇽 Responde en español de México, tono amigable y educativo.'
      : '\n\n🇺🇸 Respond in English, friendly educational tone.';

    systemPrompt += langHint + '\n\nKeep answers concise (2-4 sentences) unless asked for detail.';

    // 🤖 Call Groq
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
      temperature: 0.7,
      max_tokens: 600, // Slightly more for RAG responses
    });

    const response = completion.choices[0]?.message?.content?.trim()
      || 'Sorry, I could not process that. Try rephrasing~!';

    return NextResponse.json({ response });

  } catch (error) {
    console.error('❌ Chat API error:', error);
    return NextResponse.json(
      { response: 'Oops! Something went wrong. Please try again~! 🐱' },
      { status: 500 }
    );
  }
}