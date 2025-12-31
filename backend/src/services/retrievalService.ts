import { ChromaClient } from 'chromadb';
import { config } from '../config';
import { KnowledgeBase } from '../types/knowledge-bases';
import { DocumentChunk } from '../types/documents';
import { EmbeddingService } from './embeddingService';

/**
 * Result from similarity search
 */
export interface RetrievalResult {
  chunk: DocumentChunk;
  similarity: number;
  documentId: string;
  knowledgeBaseId: string;
}

/**
 * Retrieval parameters
 */
export interface RetrievalParams {
  topK?: number;
  similarityThreshold?: number;
  metadataFilter?: Record<string, unknown>;
}

/**
 * Service for vector similarity search and retrieval
 */
export class RetrievalService {
  private static chromaClient: ChromaClient | null = null;

  /**
   * Get or create Chroma client
   */
  private static getChromaClient(): ChromaClient {
    if (!this.chromaClient) {
      this.chromaClient = new ChromaClient({
        path: config.chroma.baseUrl,
      });
    }
    return this.chromaClient;
  }

  /**
   * Get collection name for a Knowledge Base
   */
  private static getCollectionName(kbId: string): string {
    return `kb_${kbId}`;
  }

  /**
   * Get or create collection for a Knowledge Base
   */
  private static async getOrCreateCollection(kb: KnowledgeBase) {
    const client = this.getChromaClient();
    const collectionName = this.getCollectionName(kb.id);

    try {
      // Try to get existing collection
      return await client.getCollection({ name: collectionName });
    } catch (error) {
      // Collection doesn't exist, create it
      const dimensions = EmbeddingService.getEmbeddingDimensions(
        kb.config.embeddingProvider,
        kb.config.embeddingModel
      );

      return await client.createCollection({
        name: collectionName,
        metadata: {
          kbId: kb.id,
          kbName: kb.name,
          embeddingProvider: kb.config.embeddingProvider,
          embeddingModel: kb.config.embeddingModel,
        },
      });
    }
  }

  /**
   * Index document chunks in a Knowledge Base
   */
  static async indexChunks(
    kb: KnowledgeBase,
    documentId: string,
    chunks: DocumentChunk[]
  ): Promise<void> {
    const collection = await this.getOrCreateCollection(kb);

    // Generate embeddings for all chunks
    const texts = chunks.map(chunk => chunk.content);
    const embeddings = await EmbeddingService.generateEmbeddings(
      texts,
      kb.config.embeddingProvider,
      kb.config.embeddingModel
    );

    // Prepare data for Chroma
    const ids = chunks.map(chunk => chunk.id);
    const metadatas = chunks.map(chunk => ({
      documentId,
      knowledgeBaseId: kb.id,
      chunkIndex: chunk.chunkIndex,
      startChar: chunk.startChar,
      endChar: chunk.endChar,
      ...chunk.metadata,
    }));

    // Add to collection
    await collection.add({
      ids,
      embeddings: embeddings.map(e => e.embedding),
      metadatas,
      documents: texts,
    });
  }

  /**
   * Search for similar chunks in a Knowledge Base
   */
  static async search(
    kb: KnowledgeBase,
    query: string,
    params: RetrievalParams = {}
  ): Promise<RetrievalResult[]> {
    const collection = await this.getOrCreateCollection(kb);
    const topK = params.topK ?? kb.config.retrievalTopK ?? 5;
    const threshold = params.similarityThreshold ?? kb.config.retrievalThreshold ?? 0.7;

    // Generate query embedding
    const queryEmbedding = await EmbeddingService.generateEmbedding(
      query,
      kb.config.embeddingProvider,
      kb.config.embeddingModel
    );

    // Build where clause for metadata filtering
    const where: Record<string, unknown> = {};
    if (params.metadataFilter) {
      Object.assign(where, params.metadataFilter);
    }

    // Query collection
    const results = await collection.query({
      queryEmbeddings: [queryEmbedding.embedding],
      nResults: topK,
      where,
    });

    // Transform results
    const retrievalResults: RetrievalResult[] = [];

    if (results.ids && results.ids[0] && results.distances && results.metadatas && results.documents) {
      for (let i = 0; i < results.ids[0].length; i++) {
        const distance = results.distances[0][i];
        const similarity = 1 - distance; // Convert distance to similarity

        // Filter by threshold
        if (similarity < threshold) {
          continue;
        }

        const metadata = results.metadatas[0][i] as Record<string, unknown>;
        const content = results.documents[0][i] as string;

        retrievalResults.push({
          chunk: {
            id: results.ids[0][i] as string,
            documentId: metadata.documentId as string,
            content,
            chunkIndex: metadata.chunkIndex as number,
            startChar: metadata.startChar as number,
            endChar: metadata.endChar as number,
            metadata,
          },
          similarity,
          documentId: metadata.documentId as string,
          knowledgeBaseId: kb.id,
        });
      }
    }

    // Sort by similarity (descending)
    return retrievalResults.sort((a, b) => b.similarity - a.similarity);
  }

  /**
   * Delete all chunks for a document from a Knowledge Base
   */
  static async deleteDocumentChunks(kb: KnowledgeBase, documentId: string): Promise<void> {
    const collection = await this.getOrCreateCollection(kb);

    // Get all chunks for this document
    const results = await collection.get({
      where: { documentId },
    });

    if (results.ids && results.ids.length > 0) {
      await collection.delete({
        ids: results.ids as string[],
      });
    }
  }

  /**
   * Delete all chunks for a Knowledge Base (when deleting KB)
   */
  static async deleteKnowledgeBase(kb: KnowledgeBase): Promise<void> {
    const client = this.getChromaClient();
    const collectionName = this.getCollectionName(kb.id);

    try {
      await client.deleteCollection({ name: collectionName });
    } catch (error) {
      // Collection might not exist, ignore
      console.warn(`Collection ${collectionName} not found for deletion:`, error);
    }
  }
}

