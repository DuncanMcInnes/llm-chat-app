/**
 * Types for document processing and storage
 */

export type DocumentType = 'pdf' | 'docx' | 'txt' | 'youtube' | 'webpage';

export interface DocumentMetadata {
  id: string;
  filename: string;
  type: DocumentType;
  size: number;
  uploadedAt: Date;
  processedAt?: Date;
  summary?: string;
  chunkCount?: number;
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

