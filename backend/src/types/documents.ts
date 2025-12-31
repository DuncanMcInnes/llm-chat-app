/**
 * Types for document processing and storage
 */

export type DocumentType = 'pdf' | 'docx' | 'txt' | 'youtube' | 'webpage';

export interface ChunkingSchema {
  chunkSize: number; // Characters per chunk
  overlap: number; // Overlap between chunks
  strategy: 'fixed' | 'sentence' | 'paragraph' | 'semantic'; // Chunking strategy
}

export interface EmbeddingSchema {
  model?: string; // Embedding model name (e.g., 'text-embedding-3-small')
  provider?: string; // Embedding provider (e.g., 'openai', 'local')
  dimensions?: number; // Vector dimensions
  indexed?: boolean; // Whether embeddings have been generated
}

export interface SummaryMetadata {
  provider: string; // LLM provider used
  model: string; // Model name used
  createdAt: Date; // When summary was generated
}

export interface DocumentMetadata {
  id: string;
  filename: string;
  type: DocumentType;
  size: number;
  uploadedAt: Date;
  processedAt?: Date;
  summary?: string;
  summaryMetadata?: SummaryMetadata; // Metadata about the summary (provider, model)
  chunkCount?: number;
  chunkingSchema?: ChunkingSchema; // Chunking configuration used
  embeddingSchema?: EmbeddingSchema; // Embedding configuration (for future RAG)
  indexed?: boolean; // Whether document is indexed in vector DB
}

export interface DocumentUpload {
  file: Express.Multer.File;
  metadata?: {
    title?: string;
    description?: string;
  };
}

export interface DocumentSummary {
  documentId: string;
  summary: string;
  model: string;
  provider: string;
  createdAt: Date;
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  content: string;
  chunkIndex: number;
  startChar?: number;
  endChar?: number;
  metadata?: Record<string, unknown>;
}

export interface CleanupPolicy {
  maxAgeDays?: number; // Delete documents older than X days
  maxDocuments?: number; // Keep only N most recent documents
  deleteUnindexed?: boolean; // Delete documents not indexed after X days
  unindexedMaxAgeDays?: number; // Delete unindexed documents older than X days
}

