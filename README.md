# 🦊 Bitcoin Agent

**Learn Bitcoin by playing with it.** An interactive, AI-powered educational platform that makes Bitcoin and Lightning Network actually fun to understand. No PhD in cryptography required!

Built with love by Kira-Ω and the community~ ✨

---

## 🎯 What Is This?

Bitcoin Agent is your friendly guide to understanding Bitcoin from the ground up. Instead of boring textbooks, you get:

- 🤖 **An AI tutor** that explains complex concepts in simple terms (available in English & Spanish!)
- 🧪 **Interactive labs** where you *do* Bitcoin things, not just read about them
- ⚡ **Real Lightning Network** integration - send actual sats while learning
- 💻 **A terminal that doesn't judge you** - perfect for beginners and pros alike

No signup. No tracking. Just pure Bitcoin education.

---

## ✨ What You Can Do Here

### Chat with B.O.B. (Bitcoin Operated Brain)
Ask anything! "What's a private key?" "How does mining work?" "Why is my transaction stuck?" 

B.O.B. uses a curated knowledge base (Bitcoin whitepaper, educational books) to give you accurate answers, not AI hallucinations.

## 🎓 Educational Labs (Hackathon Focus)

- 🔢 Seed Phrase Lab - `/satoshi/seed-lab`
- 🌳 Merkle Tree Lab - `/satoshi/merkle-lab`  
- ⛏️ Mining Simulator - `/satoshi/mining-lab` ← NEW!
- 🔐 Signing Lab - `/satoshi/signing-lab`

### 🔐 Security Features (Production - Archived)
The PoW Challenge system is archived in `/src/archive` for production deployment.
For this hackathon demo, we're focusing 100% on education over security.

---

## 🛠️ Tech Stack (For the Curious)

| Category | Technology |
|----------|------------|
| Framework | Next.js 14 (App Router) |
| AI | Groq (llama-3.3-70b-versatile) |
| Vector DB | Upstash Vector (for RAG) |
| Cache/Queue | Upstash Redis |
| Database | Prisma + PostgreSQL |
| Styling | Tailwind CSS |
| Animations | Framer Motion |
| Language | TypeScript |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Accounts for: Upstash (Vector + Redis), Groq, and optionally Blink for Lightning features

### Quick Start

```bash
# 1. Clone and install
git clone &lt;your-repo-url&gt;
cd bitcoin-agent
npm install

# 2. Set up your environment
cp .env.example .env.local
# Edit .env.local with your API keys

# 3. Set up the database
npx prisma generate
npx prisma db push

# 4. Seed the knowledge base
npm run db:seed

# 5. Start hacking!
npm run dev