# Document Upload Flow Diagram

## Complete Flow

```mermaid
flowchart TD
    Start([User uploads document]) --> Upload[POST /api/documents/upload]
    Upload --> Multer[Multer middleware]
    Multer --> ValidateFile{File type valid?}
    
    ValidateFile -->|No| Error1[Return 400: Invalid file type]
    ValidateFile -->|Yes| SaveTemp[Save to temp upload directory]
    
    SaveTemp --> GenerateID[Generate UUID document ID]
    GenerateID --> DetectType[Detect document type<br/>PDF/DOCX/TXT]
    
    DetectType --> ExtractText[DocumentService.extractText]
    
    ExtractText --> PDFParse{Type?}
    PDFParse -->|PDF| PDFExtract[pdf-parse: Extract text]
    PDFParse -->|DOCX| DOCXExtract[mammoth: Extract text]
    PDFParse -->|TXT| TXTExtract[fs.readFile: Read text]
    
    PDFExtract --> SaveContent
    DOCXExtract --> SaveContent
    TXTExtract --> SaveContent
    
    SaveContent[Save extracted text to<br/>storage/documents/{id}.txt]
    
    SaveContent --> ChunkText[DocumentService.chunkText]
    ChunkText --> ChunkConfig[Chunk size: 1000 chars<br/>Overlap: 200 chars]
    ChunkConfig --> CreateChunks[Create DocumentChunk[]<br/>with metadata]
    CreateChunks --> SaveChunks[Save chunks to<br/>storage/documents/{id}.chunks.json]
    
    SaveChunks --> CreateMetadata[Create DocumentMetadata]
    CreateMetadata --> MetadataFields[ID, filename, type, size<br/>uploadedAt, processedAt<br/>chunkCount, indexed=false]
    MetadataFields --> SaveMetadata[Save to<br/>storage/documents/{id}.metadata.json]
    
    SaveMetadata --> CleanupTemp[Delete temp uploaded file]
    CleanupTemp --> ReturnSuccess[Return 201: Document metadata]
    
    ReturnSuccess --> End([Upload complete])
    
    style Start fill:#e1f5ff
    style End fill:#d4edda
    style Error1 fill:#f8d7da
    style SaveContent fill:#fff3cd
    style ChunkText fill:#fff3cd
    style SaveMetadata fill:#fff3cd
```

## Document Summarization Flow

```mermaid
flowchart TD
    Start([User requests summary]) --> Summarize[POST /api/documents/:id/summarize]
    Summarize --> ValidateReq{Validate request<br/>provider, model?}
    
    ValidateReq -->|Invalid| Error1[Return 400: Invalid request]
    ValidateReq -->|Valid| LoadMetadata[DocumentService.loadMetadata]
    
    LoadMetadata --> DocExists{Document exists?}
    DocExists -->|No| Error2[Return 404: Document not found]
    DocExists -->|Yes| LoadContent[Load text from<br/>storage/documents/{id}.txt]
    
    LoadContent --> ContentExists{Content exists?}
    ContentExists -->|No| Error3[Return 404: Content not found]
    ContentExists -->|Yes| GetLLMProvider[LLMFactory.getProvider]
    
    GetLLMProvider --> ProviderAvailable{Provider available?}
    ProviderAvailable -->|No| Error4[Return 500: Provider unavailable]
    ProviderAvailable -->|Yes| CreatePrompt[Create summarization prompt]
    
    CreatePrompt --> PromptContent[System: Summarization instructions<br/>User: Document text<br/>Limit: 8000 chars]
    PromptContent --> CallLLM[LLM Provider.chat]
    
    CallLLM --> LLMResponse{LLM response?}
    LLMResponse -->|Error| Error5[Return 500: Summarization failed]
    LLMResponse -->|Success| UpdateMetadata[Update metadata.summary]
    
    UpdateMetadata --> SaveUpdatedMeta[Save updated metadata]
    SaveUpdatedMeta --> ReturnSummary[Return 200: Summary + metadata]
    
    ReturnSummary --> End([Summary complete])
    
    style Start fill:#e1f5ff
    style End fill:#d4edda
    style Error1 fill:#f8d7da
    style Error2 fill:#f8d7da
    style Error3 fill:#f8d7da
    style Error4 fill:#f8d7da
    style Error5 fill:#f8d7da
    style CallLLM fill:#fff3cd
    style UpdateMetadata fill:#fff3cd
```

## Document Storage Structure

```mermaid
graph TD
    Storage[storage/] --> Documents[documents/]
    Storage --> Uploads[uploads/]
    
    Documents --> MetaFile[{id}.metadata.json]
    Documents --> ContentFile[{id}.txt]
    Documents --> ChunksFile[{id}.chunks.json]
    
    MetaFile --> MetaContent[DocumentMetadata:<br/>- id, filename, type<br/>- size, uploadedAt<br/>- processedAt, summary<br/>- chunkCount, indexed]
    
    ContentFile --> TextContent[Extracted text content<br/>plain text format]
    
    ChunksFile --> ChunksContent[DocumentChunk[]:<br/>- id, documentId<br/>- content, chunkIndex<br/>- startChar, endChar<br/>- metadata]
    
    Uploads --> TempFiles[Temporary uploaded files<br/>Deleted after processing]
    
    style Storage fill:#e1f5ff
    style Documents fill:#d4edda
    style Uploads fill:#fff3cd
```

## API Endpoints Overview

```mermaid
graph LR
    Client[Client Application] --> Upload[POST /api/documents/upload]
    Client --> List[GET /api/documents]
    Client --> Get[GET /api/documents/:id]
    Client --> Content[GET /api/documents/:id/content]
    Client --> Summarize[POST /api/documents/:id/summarize]
    Client --> Delete[DELETE /api/documents/:id]
    Client --> Cleanup[POST /api/documents/cleanup]
    
    Upload --> Service[DocumentService]
    List --> Service
    Get --> Service
    Content --> Service
    Summarize --> Service
    Delete --> Service
    Cleanup --> Service
    
    Service --> Storage[File System Storage]
    Service --> LLM[LLM Providers]
    
    Summarize -.-> LLM
    
    style Client fill:#e1f5ff
    style Service fill:#fff3cd
    style Storage fill:#d4edda
    style LLM fill:#f8d7da
```

## Document Processing Pipeline

```mermaid
sequenceDiagram
    participant Client
    participant API as Document API
    participant Multer
    participant Service as DocumentService
    participant Storage
    participant LLM as LLM Provider
    
    Client->>API: POST /api/documents/upload<br/>(multipart/form-data)
    API->>Multer: Handle file upload
    Multer->>Storage: Save temp file
    Multer->>API: Return file object
    
    API->>Service: extractText(file.path, type)
    Service->>Storage: Read file
    Service->>Service: Parse (PDF/DOCX/TXT)
    Service->>Storage: Save extracted text
    
    API->>Service: chunkText(text, 1000, 200)
    Service->>Service: Create chunks with overlap
    Service->>Storage: Save chunks JSON
    
    API->>Service: saveMetadata(metadata)
    Service->>Storage: Save metadata JSON
    
    API->>Storage: Delete temp file
    API->>Client: Return 201 + metadata
    
    Note over Client,LLM: Later: Summarization
    
    Client->>API: POST /api/documents/:id/summarize<br/>{provider, model?}
    API->>Service: loadMetadata(id)
    Service->>Storage: Read metadata
    Service->>API: Return metadata
    
    API->>Storage: Read document text
    API->>LLM: Create summarization prompt
    LLM->>LLM: Generate summary
    LLM->>API: Return summary
    
    API->>Service: Update metadata.summary
    Service->>Storage: Save updated metadata
    API->>Client: Return 200 + summary
```

## Data Flow: Upload to RAG (Future)

```mermaid
flowchart LR
    Upload[Document Upload] --> Extract[Text Extraction]
    Extract --> Chunk[Chunking]
    Chunk --> Store[File Storage]
    
    Store --> Embed[Embeddings<br/>Future: Phase 10]
    Embed --> VectorDB[Vector DB<br/>Chroma - Future]
    
    VectorDB --> RAG[RAG Pipeline<br/>Future: Phase 11]
    RAG --> Query[Query Interface<br/>Future: Phase 13]
    
    style Upload fill:#e1f5ff
    style Extract fill:#fff3cd
    style Chunk fill:#fff3cd
    style Store fill:#d4edda
    style Embed fill:#f0f0f0
    style VectorDB fill:#f0f0f0
    style RAG fill:#f0f0f0
    style Query fill:#f0f0f0
```

## Error Handling Flow

```mermaid
flowchart TD
    Start([Any API Request]) --> Try[Try block]
    Try --> Operation{Operation type}
    
    Operation -->|Upload| UploadOps[File validation<br/>Text extraction<br/>Chunking]
    Operation -->|Summarize| SummarizeOps[Load metadata<br/>Load content<br/>LLM call]
    Operation -->|Other| OtherOps[Load metadata<br/>File operations]
    
    UploadOps --> Error{Error occurred?}
    SummarizeOps --> Error
    OtherOps --> Error
    
    Error -->|No| Success[Return success response]
    Error -->|Yes| Catch[Catch block]
    
    Catch --> ErrorType{Error type}
    ErrorType -->|File not found| Error404[Return 404]
    ErrorType -->|Validation| Error400[Return 400]
    ErrorType -->|LLM unavailable| Error500LLM[Return 500: LLM error]
    ErrorType -->|Other| Error500[Return 500: Generic error]
    
    Error404 --> Cleanup[Cleanup temp files if needed]
    Error400 --> Cleanup
    Error500LLM --> Cleanup
    Error500 --> Cleanup
    
    Cleanup --> LogError[Log error to console]
    LogError --> ReturnError[Return error response]
    
    Success --> End([Complete])
    ReturnError --> End
    
    style Start fill:#e1f5ff
    style End fill:#d4edda
    style Error404 fill:#f8d7da
    style Error400 fill:#f8d7da
    style Error500LLM fill:#f8d7da
    style Error500 fill:#f8d7da
    style Cleanup fill:#fff3cd
```

