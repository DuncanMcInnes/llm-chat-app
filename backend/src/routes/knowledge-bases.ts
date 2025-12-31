import { Router, Request, Response } from 'express';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';
import { KnowledgeBaseService } from '../services/knowledgeBaseService';
import { RetrievalService } from '../services/retrievalService';
import { DocumentService } from '../services/documentService';
import { EmbeddingService } from '../services/embeddingService';
import { DocumentChunk } from '../types/documents';
import { storageConfig } from '../config/storage';

const router = Router();

// Validation schemas
const createKBSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  config: z.object({
    embeddingProvider: z.enum(['openai', 'ollama', 'local']).optional(),
    embeddingModel: z.string().optional(),
    chunkingStrategy: z.enum(['fixed', 'sentence', 'paragraph', 'semantic']).optional(),
    chunkSize: z.number().min(100).max(10000).optional(),
    overlap: z.number().min(0).max(1000).optional(),
    retrievalTopK: z.number().min(1).max(50).optional(),
    retrievalThreshold: z.number().min(0).max(1).optional(),
  }).optional(),
});

const updateKBSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  config: z.object({
    embeddingProvider: z.enum(['openai', 'ollama', 'local']).optional(),
    embeddingModel: z.string().optional(),
    chunkingStrategy: z.enum(['fixed', 'sentence', 'paragraph', 'semantic']).optional(),
    chunkSize: z.number().min(100).max(10000).optional(),
    overlap: z.number().min(0).max(1000).optional(),
    retrievalTopK: z.number().min(1).max(50).optional(),
    retrievalThreshold: z.number().min(0).max(1).optional(),
  }).optional(),
});

/**
 * POST /api/knowledge-bases
 * Create a new Knowledge Base
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const validationResult = createKBSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Invalid request',
        details: validationResult.error.errors,
      });
    }

    const kb = KnowledgeBaseService.createKB(validationResult.data);
    return res.status(201).json({ knowledgeBase: kb });
  } catch (error) {
    console.error('Create KB error:', error);
    return res.status(500).json({
      error: 'Failed to create knowledge base',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/knowledge-bases
 * List all Knowledge Bases
 */
router.get('/', (_req: Request, res: Response) => {
  try {
    const kbs = KnowledgeBaseService.listKBs();
    return res.json({ knowledgeBases: kbs });
  } catch (error) {
    console.error('List KBs error:', error);
    return res.status(500).json({
      error: 'Failed to list knowledge bases',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/knowledge-bases/:id
 * Get Knowledge Base details
 */
router.get('/:id', (req: Request, res: Response) => {
  try {
    const kb = KnowledgeBaseService.getKB(req.params.id);
    if (!kb) {
      return res.status(404).json({ error: 'Knowledge base not found' });
    }
    return res.json({ knowledgeBase: kb });
  } catch (error) {
    console.error('Get KB error:', error);
    return res.status(500).json({
      error: 'Failed to get knowledge base',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * PUT /api/knowledge-bases/:id
 * Update Knowledge Base
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const validationResult = updateKBSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Invalid request',
        details: validationResult.error.errors,
      });
    }

    const kb = KnowledgeBaseService.updateKB(req.params.id, validationResult.data);
    if (!kb) {
      return res.status(404).json({ error: 'Knowledge base not found' });
    }

    return res.json({ knowledgeBase: kb });
  } catch (error) {
    console.error('Update KB error:', error);
    return res.status(500).json({
      error: 'Failed to update knowledge base',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * DELETE /api/knowledge-bases/:id
 * Delete Knowledge Base
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const kb = KnowledgeBaseService.getKB(req.params.id);
    if (!kb) {
      return res.status(404).json({ error: 'Knowledge base not found' });
    }

    // Delete from vector DB
    await RetrievalService.deleteKnowledgeBase(kb);

    // Delete KB metadata
    const deleted = KnowledgeBaseService.deleteKB(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Knowledge base not found' });
    }

    return res.json({
      message: 'Knowledge base deleted successfully',
      documentsDeleted: kb.documentCount,
      chunksDeleted: kb.chunkCount,
    });
  } catch (error) {
    console.error('Delete KB error:', error);
    return res.status(500).json({
      error: 'Failed to delete knowledge base',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/knowledge-bases/:id/documents
 * List documents in a Knowledge Base
 */
router.get('/:id/documents', (req: Request, res: Response) => {
  try {
    const kb = KnowledgeBaseService.getKB(req.params.id);
    if (!kb) {
      return res.status(404).json({ error: 'Knowledge base not found' });
    }

    // Get all documents and filter by KB
    const allDocuments = DocumentService.getAllMetadata();
    const kbDocuments = allDocuments.filter(doc => doc.knowledgeBaseId === kb.id);

    return res.json({
      knowledgeBaseId: kb.id,
      documents: kbDocuments,
    });
  } catch (error) {
    console.error('Get KB documents error:', error);
    return res.status(500).json({
      error: 'Failed to get knowledge base documents',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/knowledge-bases/:id/index
 * Index a document into the Knowledge Base
 */
router.post('/:id/index', async (req: Request, res: Response) => {
  try {
    const { documentId } = req.body;

    if (!documentId) {
      return res.status(400).json({ error: 'documentId is required' });
    }

    const kb = KnowledgeBaseService.getKB(req.params.id);
    if (!kb) {
      return res.status(404).json({ error: 'Knowledge base not found' });
    }

    // Load document metadata
    const metadata = DocumentService.loadMetadata(documentId);
    if (!metadata) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Load document chunks
    const chunksPath = path.join(storageConfig.baseDir, `${documentId}.chunks.json`);
    if (!fs.existsSync(chunksPath)) {
      return res.status(404).json({ error: 'Document chunks not found' });
    }

    const chunksData = fs.readFileSync(chunksPath, 'utf-8');
    const chunks: DocumentChunk[] = JSON.parse(chunksData);

    // Index chunks in vector DB
    await RetrievalService.indexChunks(kb, documentId, chunks);

    // Update KB counts
    KnowledgeBaseService.incrementDocumentCount(kb.id, 1);
    KnowledgeBaseService.incrementChunkCount(kb.id, chunks.length);

    // Update document metadata
    metadata.indexed = true;
    metadata.embeddingSchema = {
      model: kb.config.embeddingModel,
      provider: kb.config.embeddingProvider,
      dimensions: EmbeddingService.getEmbeddingDimensions(
        kb.config.embeddingProvider,
        kb.config.embeddingModel
      ),
      indexed: true,
    };
    DocumentService.saveMetadata(metadata);

    return res.json({
      message: 'Document indexed successfully',
      documentId,
      knowledgeBaseId: kb.id,
      chunksIndexed: chunks.length,
    });
  } catch (error) {
    console.error('Index document error:', error);
    return res.status(500).json({
      error: 'Failed to index document',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;

