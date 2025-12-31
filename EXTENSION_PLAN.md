# Extension Plan: Document Processing, Agents & RAG

## Overview
Extend the LLM Chat App to support:
1. Document processing and summarization (Word, PDF, YouTube videos, web pages)
2. Agent framework integration (LangChain) with MCP services and tools
3. Configurable RAG (Retrieval Augmented Generation) pipelines
4. Model selection per task

## Clarifying Questions

### Document Processing
1. **File Upload**: 
   - Should users upload files directly through the UI?
   - Maximum file size limits?
   - Storage: Temporary (process & delete) or persistent (for RAG)?

2. **Processing Priority**:
   - Which document type first? (PDF is most common)
   - Should all types be implemented simultaneously or incrementally?

3. **Summarization**:
   - Fixed-length summaries or user-configurable?
   - Should summaries be stored for later retrieval?

### Video Processing
1. **YouTube**:
   - Extract transcripts only, or also video metadata?
   - Handle live streams or only completed videos?
   - Video length limits?

2. **Other Video Sources**:
   - Local video file uploads?
   - Other platforms (Vimeo, etc.)?

### Web Page Processing
1. **Scope**:
   - Single page or full website crawling?
   - JavaScript-rendered content (requires headless browser)?
   - Authentication for protected pages?

### Agent Framework
1. **LangChain**:
   - Full LangChain.js or lighter alternative?
   - Which agent types? (ReAct, Plan-and-Execute, etc.)

2. **MCP Services**:
   - Which MCP servers do you want to integrate?
   - Custom MCP servers or existing ones?

3. **Tools**:
   - What external tools? (web search, calculator, code execution, etc.)
   - Tool selection UI or automatic?

### RAG Pipeline
1. **Vector Database**:
   - Which one? (Chroma, Pinecone, Weaviate, Qdrant, pgvector, etc.)
   - Local (Docker) or cloud service?
   - Embedding model preference?

2. **Configuration**:
   - Per-user RAG configs or global?
   - Configurable chunking strategies?
   - Multiple knowledge bases?

3. **Retrieval Strategy**:
   - Simple similarity search or advanced (hybrid, reranking)?
   - Context window management?

## Proposed Phases

### Phase 8: Document Processing Foundation
**Goal**: Add ability to process and summarize documents

#### 8.1 File Upload Infrastructure
- Add file upload endpoint (`POST /api/documents/upload`)
- Configure multer for file handling
- Add file validation (type, size limits)
- Temporary storage management

#### 8.2 PDF Processing
- Install PDF parsing library (pdf-parse, pdfjs-dist)
- Extract text from PDFs
- Handle multi-page documents
- Chunk text for processing

#### 8.3 Word Document Processing
- Install docx parsing library (mammoth or docx)
- Extract text and structure
- Preserve formatting metadata (optional)

#### 8.4 Document Summarization Service
- Create `DocumentService` for processing
- Integrate with existing LLM providers
- Configurable summary length
- Store summaries (optional)

#### 8.5 Frontend File Upload UI
- File upload component
- Progress indicators
- Document list view
- Summary display

**Dependencies**: None (uses existing LLM providers)

---

### Phase 9: Video & Web Content Processing
**Goal**: Extend processing to videos and web pages

#### 9.1 YouTube Video Processing
- Install youtube-transcript or yt-dlp
- Extract video transcripts
- Extract metadata (title, description, duration)
- Handle different video formats

#### 9.2 Web Page Processing
- Install Puppeteer or Playwright for headless browser
- Extract text content from web pages
- Handle JavaScript-rendered content
- Clean HTML to text

#### 9.3 Content Summarization
- Extend DocumentService to handle video/web content
- Unified summarization interface
- Content type detection

#### 9.4 Frontend Content Input
- YouTube URL input
- Web page URL input
- Content type selector
- Processing status

**Dependencies**: Phase 8 (DocumentService)

---

### Phase 10: Vector Database & Knowledge Bases
**Goal**: Set up vector storage and Knowledge Base (KB) management for RAG

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

#### 10.1 Vector Database Selection & Setup
- Choose vector DB (recommend: Chroma for local, Pinecone for cloud)
- Docker container for local DB
- Database schema/collections setup
- **KB isolation**: Each KB maps to a separate collection/namespace

#### 10.2 Knowledge Base Management
- Create `KnowledgeBaseService` for KB CRUD operations
- KB metadata storage:
  - KB ID, name, description
  - Created/updated timestamps
  - Document count, chunk count
  - Configuration (embedding model, chunking strategy)
- KB persistence (file-based or database)
- KB validation and constraints
- Default KB creation for existing documents

#### 10.3 Embedding Service
- Create `EmbeddingService` abstraction
- Support multiple embedding models:
  - OpenAI embeddings
  - OLLAMA embeddings (local)
  - Open-source alternatives (sentence-transformers via API)
- **KB-scoped embedding**: Each KB uses its configured embedding model
- Model selection per KB

#### 10.4 Document-to-KB Association
- Update document upload to require KB selection
- Link documents to KBs
- Migrate existing documents to default KB (if needed)
- Document indexing per KB configuration

#### 10.5 Chunking & Indexing per KB
- Apply KB-specific chunking strategy when indexing
- Use KB's chunking parameters (size, overlap)
- Index documents with KB metadata
- Batch processing per KB

#### 10.6 Retrieval Service
- Create `RetrievalService` for similarity search
- **KB-scoped retrieval**: Search within a specific KB
- Configurable retrieval parameters per KB:
  - Top-K results
  - Similarity threshold
  - Metadata filtering
- Cross-KB search (optional, for Phase 13)

#### 10.7 KB API Endpoints
- `POST /api/knowledge-bases` - Create new KB
- `GET /api/knowledge-bases` - List all KBs
- `GET /api/knowledge-bases/:id` - Get KB details
- `PUT /api/knowledge-bases/:id` - Update KB configuration
- `DELETE /api/knowledge-bases/:id` - Delete KB (with cleanup)
- `POST /api/knowledge-bases/:id/documents` - Add document to KB
- `GET /api/knowledge-bases/:id/documents` - List documents in KB

**Dependencies**: Phase 8 (Document processing)

---

### Phase 11: RAG Pipeline Configuration
**Goal**: Build configurable RAG system using Knowledge Bases

#### 11.1 RAG Pipeline Abstraction
- Create `RAGPipeline` interface
- **KB-based pipeline**: Each pipeline is associated with a KB
- Pipeline components:
  - Knowledge Base (source of truth)
  - Embedder (uses KB's embedding model)
  - Retriever (searches within KB)
  - LLM provider (for generation)
- Configuration schema

#### 11.2 Pipeline Builder
- Create `RAGPipelineBuilder` for configuration
- **KB-first approach**: Select KB, then configure pipeline
- Preset configurations (simple, advanced, etc.)
- Custom pipeline creation
- Pipeline validation

#### 11.3 RAG Query Service
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

#### 11.4 Frontend RAG Configuration UI
- KB selection interface
- Pipeline configuration interface
- Model selection per component
- Chunking strategy selection (inherited from KB)
- Test/validate pipeline

**Dependencies**: Phase 10 (Vector DB & Knowledge Bases)

---

### Phase 12: Agent Framework Integration
**Goal**: Add LangChain agents with tool calling

#### 12.1 LangChain Setup
- Install LangChain.js
- Create agent abstraction layer
- Agent types: ReAct, Plan-and-Execute, etc.

#### 12.2 Tool System
- Create `Tool` interface
- Implement tools:
  - Web search (SerpAPI, Tavily, etc.)
  - Calculator
  - Code execution (sandboxed)
  - Custom tools
- Tool registry

#### 12.3 MCP Integration
- Install MCP client library
- Create `MCPService` for MCP server communication
- MCP server discovery
- Tool exposure from MCP

#### 12.4 Agent Service
- Create `AgentService`
- Agent orchestration
- Tool selection and execution
- Error handling and retries

#### 12.5 Agent UI
- Agent mode toggle
- Tool selection interface
- Agent execution visualization
- Tool execution logs

**Dependencies**: Phase 11 (RAG Pipeline) - agents can use RAG as a tool

---

### Phase 13: Unified Workflow
**Goal**: Integrate all features into cohesive workflow

#### 13.1 Workflow Builder
- Create workflow configuration
- Combine: document processing → RAG → agent tools
- Workflow templates

#### 13.2 Model Selection Per Task
- Task-specific model selection:
  - Document processing model
  - Embedding model
  - RAG query model
  - Agent reasoning model
- Model performance tracking

#### 13.3 Advanced Features
- Multi-document RAG
- Cross-document queries
- Agent + RAG integration
- Workflow persistence

#### 13.4 UI Integration
- Unified interface for all features
- Workflow builder UI
- Model selection per component
- Results visualization

**Dependencies**: All previous phases

---

## Technical Considerations

### Storage Strategy
- **Temporary**: Process and discard (MVP)
- **Persistent**: Store for RAG (recommended)
- **Hybrid**: User choice

### Vector Database Options
| Option | Local | Cloud | Best For |
|--------|-------|-------|----------|
| Chroma | ✅ | ❌ | Local development |
| Qdrant | ✅ | ✅ | Production |
| Pinecone | ❌ | ✅ | Cloud deployment |
| pgvector | ✅ | ✅ | PostgreSQL users |
| Weaviate | ✅ | ✅ | Enterprise |

**Recommendation**: Start with Chroma (local), add Qdrant/Pinecone for production

### Embedding Models
- **OpenAI**: `text-embedding-3-small` (fast, cheap)
- **OLLAMA**: `nomic-embed-text` (local, free)
- **Open Source**: Sentence Transformers (via API or local)

### Agent Framework
- **LangChain.js**: Full-featured, well-documented
- **Vercel AI SDK**: Lighter, React-focused
- **Custom**: More control, more work

**Recommendation**: LangChain.js for flexibility

---

## Implementation Order Recommendation

### MVP Path (Incremental)
1. **Phase 8.1-8.2**: PDF upload and summarization
2. **Phase 10.1-10.2**: Basic vector DB + embeddings
3. **Phase 11.1-11.3**: Simple RAG pipeline
4. **Phase 8.3-8.4**: Word documents
5. **Phase 9.1**: YouTube transcripts
6. **Phase 12.1-12.2**: Basic agents with simple tools
7. **Phase 9.2**: Web pages
8. **Phase 11.4**: RAG configuration UI
9. **Phase 12.3-12.4**: MCP integration
10. **Phase 13**: Full integration

### Fast Track (Parallel Development)
- Phase 8 (Documents) + Phase 9 (Video/Web) in parallel
- Phase 10 (Vector DB) + Phase 11 (RAG) in parallel
- Phase 12 (Agents) independently
- Phase 13 (Integration) last

---

## Decisions Made ✅

1. **Priority**: Document processing → RAG → Agents (incremental approach)
2. **Storage**: Persistent for RAG with cleanup capabilities
3. **Vector DB**: Local (Chroma) - Docker container
4. **Agent Framework**: LangChain.js
5. **MCP Services**: Academia MCP, Google News MCP
6. **Branch**: `feature/rag-agents` (new branch)

---

## Implementation Roadmap

### Immediate Next Steps (Phase 8.1-8.2)
1. Set up file upload infrastructure
2. Implement PDF processing
3. Create document storage with cleanup policies
4. Basic summarization service

### Following Steps
5. Phase 10: Vector DB (Chroma) + Embeddings
6. Phase 11: RAG Pipeline
7. Phase 8.3-8.4: Word documents
8. Phase 9: Video & Web content
9. Phase 12: LangChain agents + MCP integration
10. Phase 13: Full integration

