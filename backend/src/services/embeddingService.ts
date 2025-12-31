import OpenAI from 'openai';
import { config } from '../config';
import { EmbeddingProvider } from '../types/knowledge-bases';

/**
 * Interface for embedding providers
 */
export interface EmbeddingResult {
  embedding: number[];
  model: string;
  provider: EmbeddingProvider;
}

/**
 * Service for generating embeddings from text
 */
export class EmbeddingService {
  private static openaiClient: OpenAI | null = null;

  /**
   * Initialize OpenAI client if API key is available
   */
  private static getOpenAIClient(): OpenAI | null {
    if (!config.llm.openai.apiKey) {
      return null;
    }
    if (!this.openaiClient) {
      this.openaiClient = new OpenAI({ apiKey: config.llm.openai.apiKey });
    }
    return this.openaiClient;
  }

  /**
   * Generate embeddings using OpenAI
   */
  private static async generateOpenAIEmbedding(
    text: string,
    model: string = 'text-embedding-3-small'
  ): Promise<EmbeddingResult> {
    const client = this.getOpenAIClient();
    if (!client) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await client.embeddings.create({
      model,
      input: text,
    });

    return {
      embedding: response.data[0].embedding,
      model: response.model,
      provider: 'openai',
    };
  }

  /**
   * Generate embeddings using OLLAMA
   */
  private static async generateOllamaEmbedding(
    text: string,
    model: string = 'nomic-embed-text'
  ): Promise<EmbeddingResult> {
    const baseUrl = config.llm.ollama.baseUrl;
    
    const response = await fetch(`${baseUrl}/api/embeddings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt: text,
      }),
    });

    if (!response.ok) {
      throw new Error(`OLLAMA embedding failed: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      embedding: data.embedding,
      model: data.model || model,
      provider: 'ollama',
    };
  }

  /**
   * Generate embeddings for a single text
   */
  static async generateEmbedding(
    text: string,
    provider: EmbeddingProvider,
    model: string
  ): Promise<EmbeddingResult> {
    switch (provider) {
      case 'openai':
        return this.generateOpenAIEmbedding(text, model);
      case 'ollama':
        return this.generateOllamaEmbedding(text, model);
      case 'local':
        // For now, fallback to OLLAMA
        // Future: could use local sentence-transformers
        return this.generateOllamaEmbedding(text, model);
      default:
        throw new Error(`Unsupported embedding provider: ${provider}`);
    }
  }

  /**
   * Generate embeddings for multiple texts (batch)
   */
  static async generateEmbeddings(
    texts: string[],
    provider: EmbeddingProvider,
    model: string
  ): Promise<EmbeddingResult[]> {
    // OpenAI supports batch embeddings
    if (provider === 'openai') {
      const client = this.getOpenAIClient();
      if (!client) {
        throw new Error('OpenAI API key not configured');
      }

      const response = await client.embeddings.create({
        model,
        input: texts,
      });

      return response.data.map((item, index) => ({
        embedding: item.embedding,
        model: response.model,
        provider: 'openai',
      }));
    }

    // For OLLAMA and local, generate one at a time
    const results: EmbeddingResult[] = [];
    for (const text of texts) {
      const result = await this.generateEmbedding(text, provider, model);
      results.push(result);
    }
    return results;
  }

  /**
   * Get embedding dimensions for a model
   */
  static getEmbeddingDimensions(provider: EmbeddingProvider, model: string): number {
    // OpenAI models
    if (provider === 'openai') {
      if (model.includes('text-embedding-3-small')) return 1536;
      if (model.includes('text-embedding-3-large')) return 3072;
      if (model.includes('text-embedding-ada-002')) return 1536;
      return 1536; // Default
    }

    // OLLAMA models
    if (provider === 'ollama' || provider === 'local') {
      if (model.includes('nomic-embed-text')) return 768;
      return 768; // Default for OLLAMA
    }

    return 1536; // Fallback
  }
}

