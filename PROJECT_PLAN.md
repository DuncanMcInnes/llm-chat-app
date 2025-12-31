# LLM Chat Interface - Project Plan

## Project Overview
A full-stack TypeScript application featuring a chat interface with abstraction layer supporting multiple LLM providers (GPT, Claude, Gemini, OLLAMA). Built as an MVP for educational purposes, deployable via Docker.

### Branching Strategy
The project uses a branching strategy to support different deployment scenarios:

- **`main` branch**: Cloud deployment version
  - Supports: OpenAI, Anthropic, Gemini
  - Optimized for cloud deployment (Digital Ocean, etc.)
  - Standard Docker Compose setup

- **`local-ollama` branch**: Local deployment with OLLAMA
  - Supports: OpenAI, Anthropic, Gemini, **OLLAMA (Local)**
  - Hardware detection and optimization
  - Mac M-series: Native OLLAMA with Metal acceleration
  - Linux NVIDIA: Docker OLLAMA with GPU support
  - CPU-only: Standard Docker OLLAMA

## Architecture

### Tech Stack
- **Backend**: Node.js + Express + TypeScript
- **Frontend**: React + Vite + TypeScript
- **LLM Providers**: 
  - **Cloud**: OpenAI (GPT), Anthropic (Claude), Google (Gemini)
  - **Local**: OLLAMA (with hardware-optimized setup)
- **Vector Database**: Chroma (local), Pinecone/Qdrant (cloud) - Phase 10
- **Containerization**: Docker + Docker Compose
- **Package Manager**: npm
- **Testing**: Jest (backend), Vitest (frontend)

### Knowledge Bases (KBs) - Core Concept
**Knowledge Bases are the primary abstraction for organizing and managing documents and embeddings in the RAG system.**

- **Multiple KBs**: The app supports multiple persistent Knowledge Bases, each isolated from others
- **KB Configuration**: Each KB has its own configuration:
  - **Embedding Model**: Which embedding model to use (OpenAI, OLLAMA, etc.)
  - **Chunking Strategy**: How to chunk documents (fixed, sentence, paragraph, semantic)
  - **Chunking Parameters**: Chunk size and overlap settings
  - **Retrieval Parameters**: Top-K results, similarity threshold
- **Document Association**: Documents belong to a specific KB
- **Isolation**: Each KB maintains its own vector collection/namespace
- **Use Cases**: 
  - Separate KBs for different projects or domains
  - Different embedding models for different content types
  - Different chunking strategies for different document types
  - Organizational separation (e.g., "Research Papers", "Company Docs", "Personal Notes")
- **Persistence**: KBs are stored persistently and can be created, updated, and deleted
- **Migration**: Documents can be moved between KBs (future enhancement)

### Project Structure
```
llm-chat-app/
├── backend/
│   ├── src/
│   │   ├── server.ts          # Express/Fastify server
│   │   ├── routes/
│   │   │   ├── chat.ts        # Chat API endpoints
│   │   │   ├── documents.ts   # Document API endpoints
│   │   │   ├── knowledge-bases.ts  # KB API endpoints (Phase 10)
│   │   │   └── rag.ts         # RAG query endpoints (Phase 11)
│   │   ├── services/
│   │   │   ├── llm/
│   │   │   │   ├── LLMProvider.ts      # Base interface
│   │   │   │   ├── OpenAIService.ts    # GPT implementation
│   │   │   │   ├── AnthropicService.ts # Claude implementation
│   │   │   │   ├── GeminiService.ts    # Gemini implementation
│   │   │   │   ├── OllamaService.ts    # OLLAMA implementation (local-ollama branch)
│   │   │   │   └── LLMFactory.ts       # Factory pattern
│   │   │   ├── chatService.ts
│   │   │   ├── documentService.ts     # Document processing
│   │   │   ├── embeddingService.ts     # Embedding generation (Phase 10)
│   │   │   ├── knowledgeBaseService.ts # KB management (Phase 10)
│   │   │   ├── retrievalService.ts    # Vector search (Phase 10)
│   │   │   └── ragService.ts          # RAG pipeline (Phase 11)
│   │   ├── types/
│   │   │   ├── index.ts       # Shared types
│   │   │   ├── documents.ts   # Document types
│   │   │   └── knowledge-bases.ts  # KB types (Phase 10)
│   │   └── config/
│   │       ├── index.ts       # Configuration
│   │       └── storage.ts     # Storage configuration
│   ├── __tests__/            # Test files
│   │   ├── unit/             # Unit tests
│   │   ├── integration/       # Integration tests
│   │   └── fixtures/         # Test fixtures and mocks
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatInterface.tsx
│   │   │   ├── MessageList.tsx
│   │   │   ├── MessageInput.tsx
│   │   │   ├── ProviderSelector.tsx
│   │   │   ├── Documents.tsx         # Document management
│   │   │   ├── DocumentUpload.tsx
│   │   │   ├── DocumentList.tsx
│   │   │   ├── KnowledgeBases.tsx     # KB management (Phase 10)
│   │   │   ├── KBSelector.tsx         # KB selection (Phase 10)
│   │   │   └── RAGInterface.tsx       # RAG query UI (Phase 11)
│   │   ├── hooks/
│   │   │   ├── useChat.ts
│   │   │   ├── useDocuments.ts
│   │   │   ├── useKnowledgeBases.ts   # KB management hook (Phase 10)
│   │   │   └── useRAG.ts              # RAG query hook (Phase 11)
│   │   ├── services/
│   │   │   └── api.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── App.tsx
│   ├── __tests__/            # Test files
│   │   ├── components/       # Component tests
│   │   └── hooks/            # Hook tests
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
├── docker-compose.yml              # Standard/CPU-only setup
├── docker-compose.mac-metal.yml    # Mac M-series (native OLLAMA)
├── docker-compose.nvidia-gpu.yml   # Linux with NVIDIA GPU
├── .env.example
├── .gitignore
├── test.sh                  # Comprehensive test automation script
├── test-api.sh              # API endpoint testing script
├── detect-hardware.sh       # Hardware detection (local-ollama branch)
├── setup-ollama.sh        # Automated OLLAMA setup (local-ollama branch)
├── README.md                # Main documentation
├── README_LOCAL.md          # Local deployment guide (local-ollama branch)
├── HARDWARE_SETUP.md       # Hardware-specific setup (local-ollama branch)
├── ARCHITECTURE.md          # Architecture diagrams
├── TESTING.md               # Testing documentation
├── DOCUMENT_UPLOAD_FLOW.md  # Document processing flow
└── CHUNKING_LOGIC.md        # Chunking parameter logic
```

## Implementation Phases

### Phase 1: Project Setup & Backend Foundation
**Goal**: Set up project structure and basic backend API

1. Initialize project structure
   - Create backend and frontend directories
   - Set up TypeScript configurations
   - Initialize package.json files
   - Set up .gitignore

2. Backend setup
   - Install Express/Fastify and dependencies
   - Create basic server with health check endpoint
   - Set up CORS for frontend communication
   - Configure environment variables

3. Type definitions
   - Define message types (Message, ChatRequest, ChatResponse)
   - Define LLM provider types
   - Create shared interfaces

### Phase 2: LLM Abstraction Layer
**Goal**: Create provider-agnostic LLM service

1. Base interface design
   - Create `LLMProvider` interface with common methods:
     - `chat(messages: Message[]): Promise<string>`
     - `streamChat(messages: Message[]): AsyncGenerator<string>`
   - Define provider configuration types

2. Implement provider adapters
   - **OpenAI Service**: Wrap OpenAI SDK
   - **Anthropic Service**: Wrap Anthropic SDK
   - **Gemini Service**: Wrap Google Gemini SDK
   - **OLLAMA Service**: HTTP client for local OLLAMA API (local-ollama branch)
   - Each adapter implements `LLMProvider` interface

3. Factory pattern
   - Create `LLMFactory` to instantiate providers
   - Provider selection based on configuration
   - Error handling for missing API keys

### Phase 3: Chat API Endpoints
**Goal**: Create RESTful API for chat functionality

1. Chat endpoint
   - POST `/api/chat`
   - Request: `{ provider: string, messages: Message[] }`
   - Response: `{ message: string, provider: string }`
   - Error handling and validation

2. Streaming endpoint (optional for MVP)
   - POST `/api/chat/stream`
   - Server-Sent Events (SSE) for real-time responses

3. Provider management
   - GET `/api/providers` - List available providers
   - GET `/api/providers/:id/config` - Get provider config

### Phase 4: Frontend Chat Interface
**Goal**: Build user-friendly chat UI

1. React app setup
   - Initialize React app (Vite or Create React App)
   - Set up TypeScript
   - Install UI library (optional: shadcn/ui, Material-UI, or Tailwind)

2. Core components
   - **ChatInterface**: Main container component
   - **MessageList**: Display chat history
   - **MessageInput**: Text input with send button
   - **ProviderSelector**: Dropdown to select LLM provider

3. State management
   - Use React hooks (useState, useReducer) or Zustand
   - Manage chat history, current provider, loading states

4. API integration
   - Create API service layer
   - Handle API calls and errors
   - Implement loading and error states

### Phase 5: Docker Configuration
**Goal**: Containerize application for easy deployment

1. Backend Dockerfile
   - Multi-stage build for optimization
   - Install dependencies and build TypeScript
   - Expose appropriate port

2. Frontend Dockerfile
   - Build React app
   - Serve with nginx or similar

3. Docker Compose
   - Define services (backend, frontend)
   - Set up networking
   - Configure environment variables
   - Volume mounts for development

4. Environment configuration
   - Create .env.example with all required variables
   - Document environment setup

### Phase 5.5: OLLAMA Local LLM Integration (local-ollama branch)
**Goal**: Add local LLM support with hardware optimization

1. OLLAMA Service Implementation
   - Create OllamaService implementing LLMProvider
   - HTTP client for OLLAMA API
   - Error handling and connection management

2. Hardware Detection
   - Detect Mac M-series (Apple Silicon)
   - Detect NVIDIA GPU (Linux)
   - Fallback to CPU-only configuration

3. Hardware-Specific Docker Compose
   - Mac M-series: Native OLLAMA with Metal acceleration
   - NVIDIA GPU: Docker OLLAMA with GPU support
   - CPU-only: Standard Docker OLLAMA

4. Automated Setup Scripts
   - Hardware detection script
   - Automated OLLAMA installation and configuration
   - Model pulling automation

### Phase 6: Documentation & Polish
**Goal**: Make project ready for deployment and sharing

1. README.md
   - Project description
   - Setup instructions
   - Environment variables documentation
   - Docker deployment guide
   - API documentation

2. Code quality
   - Add ESLint and Prettier
   - Type safety improvements
   - Error handling refinement

### Phase 7: Automated Testing
**Goal**: Set up automated testing infrastructure for reliable development

1. Test infrastructure setup
   - Install testing frameworks (Jest/Vitest for backend, Vitest for frontend)
   - Configure test scripts in package.json
   - Set up test environment configuration

2. Backend unit tests
   - Test LLM provider services (mocked API calls)
   - Test LLMFactory initialization and provider management
   - Test ChatService business logic
   - Test API route handlers with request validation
   - Test error handling scenarios

3. Backend integration tests
   - Test API endpoints with test server
   - Test provider availability detection
   - Test chat flow end-to-end (with mocked LLM responses)

4. Frontend unit tests
   - Test React components (ChatInterface, MessageList, etc.)
   - Test custom hooks (useChat)
   - Test API service layer

5. Test automation script
   - Create `test.sh` script to run all tests
   - Support for running specific test suites
   - Integration with CI/CD (optional)
   - Test coverage reporting

### Phase 8: Document Processing & Summarization
**Goal**: Add ability to process and summarize documents (Word, PDF)

1. File upload infrastructure
   - Add file upload endpoint (`POST /api/documents/upload`)
   - Configure multer for file handling
   - File validation (type, size limits)
   - Storage management (temporary or persistent)

2. PDF processing
   - Install PDF parsing library (pdf-parse, pdfjs-dist)
   - Extract text from PDFs
   - Handle multi-page documents
   - Text chunking for processing

3. Word document processing
   - Install docx parsing library (mammoth or docx)
   - Extract text and structure
   - Preserve formatting metadata (optional)

4. Document summarization service
   - Create `DocumentService` for processing
   - Integrate with existing LLM providers
   - Configurable summary length
   - Store summaries for RAG (optional)

5. Frontend file upload UI
   - File upload component
   - Progress indicators
   - Document list view
   - Summary display

**See**: `EXTENSION_PLAN.md` for detailed breakdown

### Phase 9: Video & Web Content Processing
**Goal**: Extend processing to YouTube videos and web pages (can be done in parallel with Phase 10)

1. YouTube video processing
   - Install youtube-transcript or yt-dlp
   - Extract video transcripts
   - Extract metadata (title, description, duration)
   - Handle different video formats

2. Web page processing
   - Install Puppeteer or Playwright for headless browser
   - Extract text content from web pages
   - Handle JavaScript-rendered content
   - Clean HTML to text

3. Content summarization
   - Extend DocumentService to handle video/web content
   - Unified summarization interface
   - Content type detection

4. Frontend content input
   - YouTube URL input
   - Web page URL input
   - Content type selector
   - Processing status
   - **KB selection**: Choose which KB to add content to

**Note**: This phase can be done in parallel with Phase 10, or deferred until after RAG is working.

**See**: `EXTENSION_PLAN.md` for detailed breakdown

### Phase 10: Vector Database & Knowledge Bases
**Goal**: Set up vector storage and Knowledge Base (KB) management for RAG pipelines

**Core Concept: Knowledge Bases (KBs)**
- The app supports **multiple persistent Knowledge Bases**
- Each KB is a separate, isolated collection of documents and embeddings
- Each KB has its own configuration:
  - **Embedding model** (OpenAI, OLLAMA, etc.)
  - **Chunking strategy** (fixed, sentence, paragraph, semantic)
  - **Chunking parameters** (chunk size, overlap)
  - **Retrieval parameters** (top-K, similarity threshold)
- Documents belong to a specific KB
- KBs are persistent and can be created, updated, and deleted
- Use cases: Separate KBs for different projects, domains, or purposes

1. Vector database selection & setup
   - Choose vector DB (Chroma for local, Pinecone/Qdrant for cloud)
   - Docker container for local DB
   - Database schema/collections setup
   - **KB isolation**: Each KB maps to a separate collection/namespace

2. Knowledge Base management
   - Create `KnowledgeBaseService` for KB CRUD operations
   - KB metadata storage:
     - KB ID, name, description
     - Created/updated timestamps
     - Document count, chunk count
     - Configuration (embedding model, chunking strategy)
   - KB persistence (file-based or database)
   - KB validation and constraints

3. Embedding service
   - Create `EmbeddingService` abstraction
   - Support multiple embedding models:
     - OpenAI embeddings
     - OLLAMA embeddings (local)
     - Open-source alternatives
   - **KB-scoped embedding**: Each KB uses its configured embedding model
   - Model selection per KB

4. Document-to-KB association
   - Update document upload to require KB selection
   - Link documents to KBs
   - Migrate existing documents to default KB (if needed)
   - Document indexing per KB configuration

5. Chunking & indexing per KB
   - Apply KB-specific chunking strategy when indexing
   - Use KB's chunking parameters (size, overlap)
   - Index documents with KB metadata
   - Batch processing per KB

6. Retrieval service
   - Create `RetrievalService` for similarity search
   - **KB-scoped retrieval**: Search within a specific KB
   - Configurable retrieval parameters per KB:
     - Top-K results
     - Similarity threshold
     - Metadata filtering
   - Cross-KB search (optional, for Phase 13)

7. KB API endpoints
   - `POST /api/knowledge-bases` - Create new KB
   - `GET /api/knowledge-bases` - List all KBs
   - `GET /api/knowledge-bases/:id` - Get KB details
   - `PUT /api/knowledge-bases/:id` - Update KB configuration
   - `DELETE /api/knowledge-bases/:id` - Delete KB (with cleanup)
   - `POST /api/knowledge-bases/:id/documents` - Add document to KB
   - `GET /api/knowledge-bases/:id/documents` - List documents in KB

**See**: `EXTENSION_PLAN.md` for detailed breakdown

### Phase 11: RAG Pipeline Configuration
**Goal**: Build configurable RAG (Retrieval Augmented Generation) system using Knowledge Bases

1. RAG pipeline abstraction
   - Create `RAGPipeline` interface
   - **KB-based pipeline**: Each pipeline is associated with a KB
   - Pipeline components:
     - Knowledge Base (source of truth)
     - Embedder (uses KB's embedding model)
     - Retriever (searches within KB)
     - LLM provider (for generation)
   - Configuration schema

2. Pipeline builder
   - Create `RAGPipelineBuilder` for configuration
   - **KB-first approach**: Select KB, then configure pipeline
   - Preset configurations (simple, advanced, etc.)
   - Custom pipeline creation
   - Pipeline validation

3. RAG query service
   - Create `RAGQueryService`
   - **KB-scoped queries**: Query a specific KB
   - Query flow:
     1. Select target KB
     2. Generate query embedding (using KB's embedding model)
     3. Retrieve relevant chunks from KB
     4. Build context
     5. Generate response with LLM
   - Context window management
   - Multi-KB queries (optional, for Phase 13)

4. Frontend RAG configuration UI
   - KB selection interface
   - Pipeline configuration interface
   - Model selection per component
   - Chunking strategy selection (inherited from KB)
   - Test/validate pipeline

**Dependencies**: Phase 10 (Vector DB & Knowledge Bases)

**See**: `EXTENSION_PLAN.md` for detailed breakdown

### Phase 12: Agent Framework Integration
**Goal**: Add LangChain agents with tool calling and MCP support

1. LangChain setup
   - Install LangChain.js
   - Create agent abstraction layer
   - Agent types: ReAct, Plan-and-Execute, etc.

2. Tool system
   - Create `Tool` interface
   - Implement tools:
     - Web search (SerpAPI, Tavily, etc.)
     - Calculator
     - Code execution (sandboxed)
     - Custom tools
   - Tool registry

3. MCP integration
   - Install MCP client library
   - Create `MCPService` for MCP server communication
   - MCP server discovery
   - Tool exposure from MCP

4. Agent service
   - Create `AgentService`
   - Agent orchestration
   - Tool selection and execution
   - Error handling and retries

5. Agent UI
   - Agent mode toggle
   - Tool selection interface
   - Agent execution visualization
   - Tool execution logs

**See**: `EXTENSION_PLAN.md` for detailed breakdown

### Phase 13: Unified Workflow & Integration
**Goal**: Integrate all features into cohesive workflow with Knowledge Base support

1. Workflow builder
   - Create workflow configuration
   - Combine: document processing → KB indexing → RAG → agent tools
   - **KB-aware workflows**: Workflows can target specific KBs
   - Workflow templates

2. Model selection per task
   - Task-specific model selection:
     - Document processing model
     - Embedding model (per KB)
     - RAG query model
     - Agent reasoning model
   - Model performance tracking

3. Advanced features
   - Multi-KB RAG queries
   - Cross-KB document queries
   - KB merging and splitting
   - Agent + RAG integration (agents can query KBs)
   - Workflow persistence

4. UI integration
   - Unified interface for all features
   - KB management UI
   - Workflow builder UI
   - Model selection per component
   - Results visualization

**Dependencies**: Phase 10 (Vector DB & Knowledge Bases), Phase 11 (RAG Pipeline)

**See**: `EXTENSION_PLAN.md` for detailed breakdown

## Environment Variables

### Backend
```env
PORT=3001
NODE_ENV=development
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
GOOGLE_API_KEY=your_google_key
CORS_ORIGIN=http://localhost:3000

# OLLAMA Configuration (local-ollama branch only)
OLLAMA_BASE_URL=http://localhost:11434  # or http://ollama:11434 for Docker
OLLAMA_DEFAULT_MODEL=mistral             # or llama3, llama2, etc.
```

### Frontend
```env
VITE_API_URL=http://localhost:3001
# or
REACT_APP_API_URL=http://localhost:3001
```

## API Design

### POST /api/chat
**Request:**
```json
{
  "provider": "openai" | "anthropic" | "gemini" | "ollama",
  "messages": [
    { "role": "user", "content": "Hello!" },
    { "role": "assistant", "content": "Hi there!" }
  ],
  "model": "gpt-4" (optional, provider-specific)
}
```

**Note**: `"ollama"` provider available only in `local-ollama` branch.

**Response:**
```json
{
  "message": "Response from LLM",
  "provider": "openai",
  "model": "gpt-4"
}
```

### GET /api/providers
**Response:**
```json
{
  "providers": [
    { "id": "openai", "name": "OpenAI GPT", "available": true },
    { "id": "anthropic", "name": "Anthropic Claude", "available": true },
    { "id": "gemini", "name": "Google Gemini", "available": true },
    { "id": "ollama", "name": "OLLAMA (Local)", "available": true }
  ]
}
```

**Note**: `"ollama"` provider appears only in `local-ollama` branch when configured.

### Knowledge Base API (Phase 10)

#### POST /api/knowledge-bases
**Create a new Knowledge Base**
**Request:**
```json
{
  "name": "Research Papers",
  "description": "Academic research papers on AI",
  "embeddingModel": "openai",
  "embeddingProvider": "openai",
  "chunkingStrategy": "sentence",
  "chunkSize": 1000,
  "overlap": 200
}
```

**Response:**
```json
{
  "id": "kb-uuid-here",
  "name": "Research Papers",
  "description": "Academic research papers on AI",
  "embeddingModel": "text-embedding-3-small",
  "embeddingProvider": "openai",
  "chunkingStrategy": "sentence",
  "chunkSize": 1000,
  "overlap": 200,
  "documentCount": 0,
  "chunkCount": 0,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

#### GET /api/knowledge-bases
**List all Knowledge Bases**
**Response:**
```json
{
  "knowledgeBases": [
    {
      "id": "kb-uuid-1",
      "name": "Research Papers",
      "documentCount": 15,
      "chunkCount": 450,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### GET /api/knowledge-bases/:id
**Get Knowledge Base details**
**Response:**
```json
{
  "id": "kb-uuid-1",
  "name": "Research Papers",
  "description": "Academic research papers on AI",
  "embeddingModel": "text-embedding-3-small",
  "embeddingProvider": "openai",
  "chunkingStrategy": "sentence",
  "chunkSize": 1000,
  "overlap": 200,
  "documentCount": 15,
  "chunkCount": 450,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

#### PUT /api/knowledge-bases/:id
**Update Knowledge Base configuration**
**Request:**
```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "chunkSize": 1500
}
```

#### DELETE /api/knowledge-bases/:id
**Delete Knowledge Base (with cleanup)**
**Response:**
```json
{
  "message": "Knowledge Base deleted successfully",
  "documentsDeleted": 15,
  "chunksDeleted": 450
}
```

#### POST /api/knowledge-bases/:id/documents
**Add document to Knowledge Base**
**Request:** (multipart/form-data)
- `file`: Document file
- `knowledgeBaseId`: KB ID (from URL param)

**Response:**
```json
{
  "document": {
    "id": "doc-uuid",
    "filename": "paper.pdf",
    "knowledgeBaseId": "kb-uuid-1",
    "chunkCount": 30,
    "indexed": true
  }
}
```

#### GET /api/knowledge-bases/:id/documents
**List documents in Knowledge Base**
**Response:**
```json
{
  "documents": [
    {
      "id": "doc-uuid",
      "filename": "paper.pdf",
      "type": "pdf",
      "uploadedAt": "2024-01-01T00:00:00Z",
      "chunkCount": 30
    }
  ]
}
```

### RAG Query API (Phase 11)

#### POST /api/rag/query
**Query a Knowledge Base using RAG**
**Request:**
```json
{
  "knowledgeBaseId": "kb-uuid-1",
  "query": "What are the main findings?",
  "llmProvider": "openai",
  "llmModel": "gpt-4",
  "topK": 5,
  "similarityThreshold": 0.7
}
```

**Response:**
```json
{
  "answer": "Based on the retrieved documents...",
  "sources": [
    {
      "documentId": "doc-uuid",
      "chunkIndex": 5,
      "similarity": 0.85,
      "content": "Relevant chunk content..."
    }
  ],
  "knowledgeBaseId": "kb-uuid-1",
  "model": "gpt-4"
}
```

## Deployment Strategy

### Branch Selection
- **`main` branch**: Use for cloud deployment (Digital Ocean, AWS, etc.)
- **`local-ollama` branch**: Use for local deployment with OLLAMA support

### Local Docker Deployment (main branch)
1. Build images: `docker-compose build`
2. Run containers: `docker-compose up`
3. Access: `http://localhost:3000` (frontend), `http://localhost:3001` (backend)

### Local Deployment with OLLAMA (local-ollama branch)
1. **Mac M-series (Recommended: Native OLLAMA)**
   - Install OLLAMA: `brew install ollama`
   - Start OLLAMA: `brew services start ollama`
   - Pull models: `ollama pull mistral`
   - Start app: `docker-compose -f docker-compose.mac-metal.yml up`

2. **Linux with NVIDIA GPU**
   - Install NVIDIA Container Toolkit
   - Start services: `docker-compose -f docker-compose.nvidia-gpu.yml up`
   - Pull models: `docker exec -it llm-chat-ollama ollama pull mistral`

3. **CPU-only**
   - Start services: `docker-compose up`
   - Pull models: `docker exec -it llm-chat-ollama ollama pull mistral`

4. **Automated Setup**
   - Run: `./setup-ollama.sh` (detects hardware and guides setup)

### Cloud Deployment (Digital Ocean) - main branch
1. Create Dockerfile optimizations for production
2. Set up environment variables in cloud platform
3. Configure domain and SSL
4. Set up CI/CD pipeline (optional)
5. **Note**: OLLAMA not included in cloud deployment (use cloud providers)

## Dependencies

### Backend
- `express` or `fastify` - Web framework
- `@openai/openai` - OpenAI SDK
- `@anthropic-ai/sdk` - Anthropic SDK
- `@google/generative-ai` - Google Gemini SDK
- `cors` - CORS middleware
- `dotenv` - Environment variables
- `zod` - Runtime validation
- `jest` or `vitest` - Testing framework
- `@types/jest` or `@vitest/ui` - Test type definitions
- `supertest` - HTTP assertion library for API testing

### Frontend
- `react` - UI library
- `react-dom` - React DOM
- `axios` or `fetch` - HTTP client
- UI library (optional): `tailwindcss`, `shadcn/ui`, or `@mui/material`
- `vitest` - Testing framework (works well with Vite)
- `@testing-library/react` - React component testing utilities
- `@testing-library/jest-dom` - Custom Jest matchers for DOM

## Testing Strategy

### Automated Testing
- **Unit Tests**: Test individual functions and classes in isolation
- **Integration Tests**: Test API endpoints and service interactions
- **E2E Tests**: Test complete user flows (optional for MVP)

### Test Scripts
- `npm test` - Run all tests
- `npm run test:unit` - Run unit tests only
- `npm run test:integration` - Run integration tests only
- `npm run test:watch` - Run tests in watch mode
- `./test.sh` - Comprehensive test automation script

### Test Coverage Goals
- Backend: 80%+ coverage for core services
- Frontend: 70%+ coverage for components and hooks
- Critical paths: 100% coverage (error handling, validation)

## Implementation Status

### Completed Phases ✅
1. ✅ Project setup & backend foundation
2. ✅ LLM abstraction layer (OpenAI, Anthropic, Gemini)
3. ✅ Chat API endpoints
4. ✅ Frontend chat interface
5. ✅ Docker configuration
6. ✅ Documentation & polish
7. ✅ Automated testing infrastructure
8. ✅ OLLAMA local LLM integration (local-ollama branch)
9. ✅ Hardware detection and optimization

### Next Steps

**Main Branch (Cloud Deployment)**
- [ ] Deploy to Digital Ocean
- [ ] Set up CI/CD pipeline
- [ ] Configure production environment variables
- [ ] Set up domain and SSL

**Local-OLLAMA Branch (Local Deployment)**
- [x] OLLAMA integration complete
- [x] Hardware detection working
- [x] Mac M-series Metal acceleration tested
- [ ] Test on Linux with NVIDIA GPU (if available)
- [ ] Performance benchmarking

### Future Extensions (Phases 8-13)
- [x] Phase 8: Document Processing & Summarization ✅
- [ ] Phase 9: Video & Web Content Processing (can be done in parallel)
- [ ] Phase 10: Vector Database & Knowledge Bases (NEXT PRIORITY)
- [ ] Phase 11: RAG Pipeline Configuration (depends on Phase 10)
- [ ] Phase 12: Agent Framework Integration (depends on Phase 11)
- [ ] Phase 13: Unified Workflow & Integration (depends on Phase 11)

**See**: `EXTENSION_PLAN.md` for detailed extension planning, technical considerations, and clarifying questions

## Notes
- MVP focus: Keep it simple, add features incrementally
- Educational purpose: Well-documented code with clear architecture
- Extensibility: Easy to add new LLM providers in the future
- Error handling: Graceful degradation when providers are unavailable
- Branching: Separate branches for different deployment scenarios
- Hardware optimization: Automatic detection and configuration for best performance
- Privacy: OLLAMA option keeps conversations local (no external API calls)

## Branch-Specific Features

### Main Branch
- Cloud-optimized deployment
- Three cloud LLM providers (OpenAI, Anthropic, Gemini)
- Standard Docker Compose setup
- Ready for Digital Ocean deployment

### Local-OLLAMA Branch
- All features from main branch
- Plus: OLLAMA local LLM support
- Hardware detection and optimization
- Mac M-series: Native OLLAMA with Metal
- Linux NVIDIA: Docker OLLAMA with GPU
- CPU-only: Standard Docker OLLAMA
- Privacy-focused local option

