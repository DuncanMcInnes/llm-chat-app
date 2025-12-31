export type MessageRole = 'user' | 'assistant' | 'system';

export interface Message {
  role: MessageRole;
  content: string;
  model?: string; // Optional: model used for assistant messages
}

export type LLMProviderId = 'openai' | 'anthropic' | 'gemini' | 'ollama';

export interface ProviderInfo {
  id: LLMProviderId;
  name: string;
  available: boolean;
}

export interface ChatRequest {
  provider: LLMProviderId;
  messages: Message[];
  model?: string;
}

export interface ChatResponse {
  message: string;
  provider: LLMProviderId;
  model?: string;
}

// Document types
export type DocumentType = 'pdf' | 'docx' | 'txt' | 'youtube' | 'webpage';

export interface ChunkingSchema {
  chunkSize: number;
  overlap: number;
  strategy: 'fixed' | 'sentence' | 'paragraph' | 'semantic';
}

export interface EmbeddingSchema {
  model?: string;
  provider?: string;
  dimensions?: number;
  indexed?: boolean;
}

export interface SummaryMetadata {
  provider: string;
  model: string;
  createdAt: string; // ISO date string
}

export interface DocumentMetadata {
  id: string;
  filename: string;
  type: DocumentType;
  size: number;
  uploadedAt: string; // ISO date string
  processedAt?: string;
  summary?: string;
  summaryMetadata?: SummaryMetadata;
  chunkCount?: number;
  chunkingSchema?: ChunkingSchema;
  embeddingSchema?: EmbeddingSchema;
  indexed?: boolean;
}

export interface DocumentUploadResponse {
  document: DocumentMetadata;
  message: string;
}

export interface DocumentSummaryRequest {
  provider?: LLMProviderId;
  model?: string;
}

export interface DocumentSummaryResponse {
  documentId: string;
  summary: string;
  provider: LLMProviderId;
  model?: string;
}


