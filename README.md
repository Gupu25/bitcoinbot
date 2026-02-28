Bitcoin Agent
An AI-powered educational platform for understanding Bitcoin and Lightning Network infrastructure through interactive cryptographic labs. Built with Next.js 14, Groq, and Upstash.

Bitcoin AgentNext.jsTypeScriptTailwind CSS

✨ Features
🤖 AI-Powered Chat
Ask questions about Bitcoin protocol, Lightning Network, mining, and more
RAG-Enhanced responses powered by curated knowledge base
Available in English and Spanish
📚 Interactive Cryptographic Labs
Educational tools to master Bitcoin's cryptographic foundations:

Lab	Description
🔢 Seed Phrase Lab	Learn entropy → seed phrase generation, security best practices, and why your seed is the most important thing in Bitcoin
🌳 Merkle Tree Lab	Build and explore Merkle Trees, generate SPV proofs, understand how Bitcoin verifies transactions efficiently
🔐 ECDSA/Schnorr Lab	Master digital signatures, compare algorithms, simulate MuSig aggregation, and learn about nonce dangers
⛏️ Mining Simulator	Experience Proof-of-Work firsthand
⚡ Lightning Network Integration
Accept Lightning Network donations via Blink (Cashu)
Interactive tip jar with QR codes and invoice generation
WebLN support for seamless wallet integration
💻 Terminal UI
Hacker-style terminal interface for authentic Bitcoin aesthetic
Immersive educational experience
🛠️ Tech Stack
Category	Technology
Framework	Next.js 14 (App Router)
AI	Groq (Mixtral-8x7b)
Database	Upstash Vector (RAG), Upstash Redis (Rate limiting & chat history)
ORM	Prisma
Styling	Tailwind CSS
Animation	Framer Motion
Language	TypeScript
🚀 Getting Started
Prerequisites
Node.js 18+
npm or yarn
Upstash account (for Vector and Redis)
Groq API key
Environment Variables
Create a .env.local file:

# GroqGROQ_API_KEY=your_groq_api_key# Upstash VectorUPSTASH_VECTOR_REST_URL=your_vector_rest_urlUPSTASH_VECTOR_REST_TOKEN=your_vector_rest_token# Upstash RedisUPSTASH_REDIS_REST_URL=your_redis_rest_urlUPSTASH_REDIS_REST_TOKEN=your_redis_rest_token# Database (for Prisma)DATABASE_URL=your_postgres_connection_string# Blink/Cashu (optional, for tips)BLINK_API_KEY=your_blink_api_key
Installation
bash

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed vector database (whitepaper + Mi Primer Bitcoin book)
npm run db:seed

# Start development server
npm run dev
Visit http://localhost:3000 to see the application.

📁 Project Structure
text

bitcoin-agent/
├── src/
│   ├── app/
│   │   ├── [lang]/                    # i18n routing (en/es)
│   │   │   ├── layout.tsx             # Root layout with fonts
│   │   │   ├── page.tsx               # Main page
│   │   │   └── satoshi/
│   │   │       ├── seed-lab/          # 🔢 Entropy → Seed Phrase Visualizer
│   │   │       ├── merkle-lab/        # 🌳 Merkle Tree Builder & Prover
│   │   │       ├── signing-lab/       # 🔐 ECDSA/Schnorr Signature Lab
│   │   │       ├── immune-dashboard/  # System Monitor
│   │   │       └── beacon/native/     # Network Explorer
│   │   ├── api/
│   │   │   ├── chat/                  # Groq streaming
│   │   │   ├── rag/                   # Vector search
│   │   │   └── tip/                   # Lightning donations
│   │   └── globals.css
│   ├── components/
│   │   ├── hero/                      # Hero section with animations
│   │   ├── chat/                      # Chat interface
│   │   ├── terminal/                  # Terminal window UI
│   │   ├── tip-jar/                   # Lightning tip jar
│   │   ├── ui/
│   │   │   └── InfoTooltip.tsx        # Reusable tooltip component
│   │   ├── HiddenMenu.tsx             # Developer tools navigation
│   │   └── footer/                    # Footer with resources
│   ├── lib/
│   │   ├── groq/                      # Groq client & prompts
│   │   ├── vector/                    # Upstash Vector client
│   │   └── i18n/                      # i18n config & dictionaries
│   └── types/                         # TypeScript interfaces
├── prisma/
│   └── schema.prisma                  # Database schema
├── scripts/
│   ├── seed-whitepaper.ts             # Seeds Bitcoin whitepaper into vector DB
│   └── rag/
│       ├── upload_diploma_to_rag.ts   # Seeds Mi Primer Bitcoin book
│       └── README.md                  # RAG dataset documentation
├── tailwind.config.ts
└── package.json
🔌 API Routes
POST /api/chat
Send a chat message and receive an AI response.

json

{
  "messages": [
    { "role": "user", "content": "What is proof of work?" }
  ],
  "lang": "en"
}
POST /api/rag
Query the vector database for relevant context.

json

{
  "query": "How does Lightning Network work?",
  "limit": 5
}
POST /api/tip
Create a Lightning Network payment request.

json

{
  "amount": 100,
  "recipient": "your@lightning.address",
  "message": "Thanks for the help!"
}
🧪 Cryptographic Labs
🔢 Seed Phrase Lab
The most important lesson for Bitcoin newcomers!

Features:

Interactive entropy generation (128/256 bits)
Visual representation of BIP39 word selection
Checksum calculation demonstration
Bank vs Bitcoin custody comparison
Security rules and best practices
Interactive quiz to test knowledge
Learning Objectives:

Understand why seed phrases are critical
Learn proper backup methods (metal plates, paper)
Recognize common scams and security mistakes
Grasp the difference between custodial and non-custodial systems
🌳 Merkle Tree Lab
Understand how Bitcoin efficiently verifies transactions.

Features:

Build Merkle Trees from transactions
Generate and verify Merkle proofs
SPV (Simplified Payment Verification) demonstration
Step-by-step visualization
Learning Objectives:

Understand Merkle tree structure
Learn how SPV clients verify transactions
Grasp why Bitcoin can be verified without full nodes
🔐 ECDSA/Schnorr Lab
Master Bitcoin's digital signature algorithms.

Features:

Generate key pairs (simulated)
Sign messages with ECDSA and Schnorr
Step-by-step algorithm visualization
MuSig signature aggregation simulation
Nonce reuse attack demonstration
Learning Objectives:

Understand public key cryptography
Compare ECDSA vs Schnorr signatures
Learn why Schnorr enables better privacy
Understand the dangers of nonce reuse
📚 Knowledge Base (RAG)
The agent's responses are grounded in a curated vector knowledge base stored in Upstash Vector.

Source
Description
Chunks
Language
Bitcoin Whitepaper	Satoshi Nakamoto's original paper	~15	EN
Mi Primer Bitcoin	Bitcoin Diploma workbook by My First Bitcoin (El Salvador)	15	EN/ES

Adding new documents
bash

# Upload Mi Primer Bitcoin book
npx ts-node scripts/rag/upload_diploma_to_rag.ts

# Upload Bitcoin whitepaper
npm run db:seed
🌍 Internationalization
The application supports English (en) and Spanish (es). Language is automatically detected from the URL path:

/en - English
/es - Spanish
To add a new language:

Add the locale to src/lib/i18n/config.ts
Create a new JSON file in src/lib/i18n/
Add translations for all keys
🎨 UI Components
InfoTooltip
A reusable tooltip component for contextual help:

tsx

<InfoTooltip content="This is helpful information!" />
HiddenMenu
A slide-out navigation menu with developer tools:

Seed Phrase Lab - For newcomers (highlighted)
Merkle Tree Lab - SPV proofs
ECDSA/Schnorr Lab - Digital signatures
System Monitor - Dashboard
Network Explorer - Beacon
Mining Simulator - PoW
🤝 Contributing
Contributions are welcome! Please read our contributing guidelines first.

📄 License
MIT License - see LICENSE for details.

⚠️ Disclaimer
This is an educational tool. The information provided is for educational purposes only and should not be considered financial advice. Always do your own research before making any financial decisions.

👥 Credits
Development & Design
Built with ⚡ for the Bitcoin community

Kira Solara-Ω — Kawaii Cypherpunk Engineer
📧 aisynths@proton.me
🏢 visionaryai.lat

Knowledge Sources
Bitcoin Whitepaper by Satoshi Nakamoto
Mi Primer Bitcoin by My First Bitcoin (El Salvador)
<div align="center">

Nyaa~! ✨ Built with love for the Bitcoin community desu! 💖

"In Bitcoin, you are the bank. Your seed = your keys = your Bitcoin."

</div>