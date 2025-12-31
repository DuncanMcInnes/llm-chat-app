/**
 * Types for Knowledge Base (KB) management
 */

import { ChunkingSchema, EmbeddingSchema } from './documents';

export type EmbeddingProvider = 'openai' | 'ollama' | 'local';

export interface KnowledgeBaseConfig {
  embeddingProvider: EmbeddingProvider;
  embeddingModel: string; // e.g., 'text-embedding-3-small', 'nomic-embed-text'
  chunkingStrategy: ChunkingSchema['strategy'];
  chunkSize: number;
  overlap: number;
  retrievalTopK?: number; // Default top-K for retrieval
  retrievalThreshold?: number; // Default similarity threshold (0-1)
}

export interface KnowledgeBase {
  id: string;
  name: string;
  description?: string;
  config: KnowledgeBaseConfig;
  documentCount: number;
  chunkCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface KnowledgeBaseCreateRequest {
  name: string;
  description?: string;
  config: Partial<KnowledgeBaseConfig>; // Partial, will apply defaults
}

export interface KnowledgeBaseUpdateRequest {
  name?: string;
  description?: string;
  config?: Partial<KnowledgeBaseConfig>;
}

export interface KnowledgeBaseDocument {
  documentId: string;
  knowledgeBaseId: string;
  indexed: boolean;
  indexedAt?: Date;
}

