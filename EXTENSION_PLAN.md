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

### Phase 10: Vector Database & Embeddings
**Goal**: Set up vector storage for RAG

#### 10.1 Vector Database Selection & Setup
- Choose vector DB (recommend: Chroma for local, Pinecone for cloud)
- Docker container for local DB
- Database schema/collections setup

#### 10.2 Embedding Service
- Create `EmbeddingService` abstraction
- Support multiple embedding models:
  - OpenAI embeddings
  - OLLAMA embeddings (local)
  - Open-source alternatives (sentence-transformers via API)
- Model selection per use case

#### 10.3 Document Chunking & Indexing
- Implement chunking strategies:
  - Fixed-size chunks
  - Semantic chunking
  - Overlap strategies
- Index documents with metadata
- Batch processing

#### 10.4 Retrieval Service
- Create `RetrievalService` for similarity search
- Configurable retrieval parameters:
  - Top-K results
  - Similarity threshold
  - Metadata filtering

**Dependencies**: Phase 8 (Document processing)

---

### Phase 11: RAG Pipeline Configuration
**Goal**: Build configurable RAG system

#### 11.1 RAG Pipeline Abstraction
- Create `RAGPipeline` interface
- Pipeline components:
  - Document loader
  - Chunker
  - Embedder
  - Retriever
  - LLM provider
- Configuration schema

#### 11.2 Pipeline Builder
- Create `RAGPipelineBuilder` for configuration
- Preset configurations (simple, advanced, etc.)
- Custom pipeline creation
- Pipeline validation

#### 11.3 RAG Query Service
- Create `RAGQueryService`
- Query flow:
  1. Generate query embedding
  2. Retrieve relevant chunks
  3. Build context
  4. Generate response with LLM
- Context window management

#### 11.4 Frontend RAG Configuration UI
- Pipeline configuration interface
- Model selection per component
- Chunking strategy selection
- Test/validate pipeline

**Dependencies**: Phase 10 (Vector DB & Embeddings)

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

## Questions for You

1. **Priority**: Which feature is most important first?
   - [ ] Document processing
   - [ ] RAG pipelines
   - [ ] Agent framework

2. **Storage**: Temporary or persistent document storage?

3. **Vector DB**: Local (Chroma) or cloud (Pinecone) preference?

4. **Agent Framework**: LangChain.js or lighter alternative?

5. **MCP Services**: Which specific MCP servers to integrate?

6. **Branch**: Add to `main`, `local-ollama`, or new branch?

---

## Next Steps

Once you answer the questions above, I can:
1. Create detailed implementation plans for each phase
2. Set up the initial infrastructure (file upload, vector DB)
3. Begin implementation of your highest priority feature

