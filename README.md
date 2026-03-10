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
# From the sources mentioned below, 863 record are stored in the vector database, when someone search then by the cosine similarity the corresponding data ase being fetched and sent to LLM for generating the answers based on the data

### Source of the data:
```
    "https://en.wikipedia.org/wiki/Bean",
    "https://en.wikipedia.org/wiki/Beetroot",
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
```



**Status:** Production Ready • **Version:** 1.0 • **Last Updated:** March 2026
