# 🤖 RAG Chatbot with Gemini AI & Astra DB

A production-grade **Retrieval-Augmented Generation (RAG)** chatbot that combines Google Gemini LLM with Astra DB vector database for accurate, context-aware responses.

## ✨ Key Features

- 🎯 **Advanced System Prompts** - Sophisticated prompt engineering to ensure accurate responses
- 🔍 **Vector Search** - Semantic search using Astra DB
- 📱 **Modern Chat UI** - Beautiful Next.js React interface
- 🕷️ **Web Scraping** - Puppeteer-based document ingestion
- 📚 **Intelligent Chunking** - Context-aware text splitting
- ⚡ **Production Ready** - Full TypeScript, error handling, logging
- 🔐 **Source Attribution** - Track where information comes from

## 🏗️ Architecture

```
User Query
    ↓
Next.js Chat Interface
    ↓
Embed Question (Gemini Embedding API)
    ↓
Vector Search (Astra DB)
    ↓
Retrieve Top K Documents
    ↓
Build Context + System Prompt
    ↓
Generate Response (Gemini LLM)
    ↓
Return to User
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Google Gemini API Key
- Astra DB Account

### 1. Clone & Install

```bash
cd agro-bot
npm install
```

### 2. Setup Environment Variables

Create `.env.local`:

```env
GEMINI_API_KEY=your_api_key_here
ASTRA_DB_ENDPOINT=https://your-endpoint.astra.datastax.com
ASTRA_DB_TOKEN=AstraCS:your_token_here
ASTRA_DB_NAMESPACE=default_keyspace
NEXT_PUBLIC_API_URL=http://localhost:3000
```

**Get API Keys:**
- [Google Gemini API](https://aistudio.google.com/app/apikey)
- [Astra DB Console](https://astra.datastax.com/)

### 3. Ingest Documents

```bash
# Index documents from your website
npm run ingest https://example.com https://docs.example.com
```

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and start chatting!

## 📁 Project Structure

```
agro-bot/
├── app/
│   ├── api/chat/route.ts         # Main chat API
│   ├── components/ChatUI.tsx     # Chat interface
│   ├── page.tsx                  # Home page
│   └── layout.tsx
├── ai/
│   ├── gemini.ts                 # LLM integration
│   ├── embed.ts                  # Embeddings
│   └── vectorSearch.ts           # Vector search
├── db/
│   └── astraClient.ts            # Database client
├── ingestion/
│   ├── scrape.ts                 # Web scraping
│   └── chunk.ts                  # Text chunking
├── lib/
│   └── prompts.ts                # System prompts
├── scripts/
│   └── ingestWebsite.ts          # Ingestion script
├── SETUP.md                      # Setup guide
├── API.md                        # API documentation
├── PROMPTS.md                    # Prompts guide
└── package.json
```

## 🧠 System Prompts

The chatbot uses **advanced, production-grade system prompts** to ensure accuracy:

### Key Features

✅ **Context Grounding** - Forces LLM to use only provided documents
✅ **Hallucination Prevention** - Explicit constraints against making up information
✅ **Source Attribution** - Proper citation of retrieved documents
✅ **Edge Case Handling** - Clear instructions for ambiguous queries
✅ **Transparency** - Distinction between context and general knowledge

**Example:**
```
"ALWAYS base your answers on the provided context documents"
"NEVER fabricate information or make assumptions"
"If the context doesn't contain information, explicitly state this"
```

See [PROMPTS.md](PROMPTS.md) for detailed prompt engineering guide.

## 💬 Using the Chatbot

### Via Web Interface

1. Open http://localhost:3000
2. Type your question
3. Get instant, context-aware answers

### Via API

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"question": "What is your pricing?"}'
```

## 📊 Data Ingestion Pipeline

### Scrape → Chunk → Embed → Store

```
Website URL
    ↓
Puppeteer Scraper
    ↓
Text Cleaning & Normalization
    ↓
Intelligent Chunking (800 chars, overlapping)
    ↓
Gemini Embedding Model
    ↓
Astra DB Vector Store
```

### Example Usage

```bash
# Single URL
npm run ingest https://example.com

# Multiple URLs
npm run ingest https://docs.example.com https://blog.example.com https://help.example.com

# Command line
ts-node scripts/ingestWebsite.ts https://example.com
```

## 🔧 API Endpoints

### POST /api/chat

Send a question and receive an AI response with source attribution.

**Request:**
```json
{
  "question": "What is your return policy?",
  "contextChunks": 5
}
```

**Response:**
```json
{
  "success": true,
  "answer": "Based on the provided documentation, the return policy is...",
  "sources": ["https://example.com/policies"],
  "timestamp": "2024-03-07T15:30:00Z"
}
```

See [API.md](API.md) for full documentation.

## 🛠️ Tech Stack

| Component | Technology |
|-----------|-----------|
| Frontend | Next.js 16, React 19, TailwindCSS |
| Backend | Node.js, Next.js API Routes |
| LLM | Google Generative AI (Gemini) |
| Embeddings | Google Embedding API |
| Vector DB | Astra DB (DataStax) |
| Scraping | Puppeteer |
| Language | TypeScript |

## 📚 Documentation

- **[SETUP.md](SETUP.md)** - Complete setup and configuration guide
- **[API.md](API.md)** - API reference and usage examples
- **[PROMPTS.md](PROMPTS.md)** - System prompts and prompt engineering guide

## 🐛 Troubleshooting

### No Results Found
- Ensure URLs are properly ingested: `npm run ingest <url>`
- Check Astra DB connection
- Try broader search terms

### API Errors
- Verify API keys in `.env.local`
- Check internet connectivity
- Review server logs

### Slow Responses
- Reduce `contextChunks` parameter
- Optimize chunk size
- Check database performance

## 🔐 Security Features

- ✅ API key validation
- ✅ Input sanitization
- ✅ Error handling with user-friendly messages
- ✅ Rate limiting ready
- ✅ No sensitive data logging

## 📝 License

MIT License

## 📧 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check documentation in [SETUP.md](SETUP.md), [API.md](API.md), [PROMPTS.md](PROMPTS.md)
- Review example code in main branch

---

    "https://en.wikipedia.org/wiki/Eggplant",
    "https://en.wikipedia.org/wiki/Broccoli",
    "https://en.wikipedia.org/wiki/Cabbage",
    "https://en.wikipedia.org/wiki/Capsicum",
    "https://en.wikipedia.org/wiki/Carrot",
    "https://en.wikipedia.org/wiki/Cauliflower",
    "https://en.wikipedia.org/wiki/Chickpea",
    "https://en.wikipedia.org/wiki/Fenugreek",
    "https://en.wikipedia.org/wiki/Garlic",
    "https://en.wikipedia.org/wiki/Lettuce",
    "https://en.wikipedia.org/wiki/Pea",
    "https://en.wikipedia.org/wiki/Onion",
    "https://en.wikipedia.org/wiki/Potato",
    "https://en.wikipedia.org/wiki/Radish",
    "https://en.wikipedia.org/wiki/Spinach",
    "https://en.wikipedia.org/wiki/Sweet_potato",
    "https://en.wikipedia.org/wiki/Tomato",
    "https://en.wikipedia.org/wiki/Turnip",

**Built with ❤️ by Full Stack AI Engineers**

**Status:** Production Ready • **Version:** 1.0 • **Last Updated:** March 2024
