import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { DocumentService } from '../services/documentService';
import { storageConfig } from '../config/storage';
import { DocumentMetadata, DocumentType } from '../types/documents';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    storageConfig.initialize();
    cb(null, storageConfig.uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: storageConfig.maxFileSize,
  },
  fileFilter: (_req, file, cb) => {
    const mimeType = file.mimetype as keyof typeof storageConfig.allowedMimeTypes;
    if (storageConfig.allowedMimeTypes[mimeType]) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type. Allowed types: ${Object.keys(storageConfig.allowedMimeTypes).join(', ')}`));
    }
  },
});

// Validation schema
const summarizeRequestSchema = z.object({
  documentId: z.string().uuid(),
  provider: z.enum(['openai', 'anthropic', 'gemini', 'ollama']).optional(),
  model: z.string().optional(),
});

/**
 * POST /api/documents/upload
 * Upload and process a document
 */
router.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = req.file;
    const mimeType = file.mimetype as keyof typeof storageConfig.allowedMimeTypes;
    const documentType = storageConfig.allowedMimeTypes[mimeType] as DocumentType;

    if (!documentType) {
      return res.status(400).json({ error: 'Unsupported file type' });
    }

    // Create document ID
    const documentId = uuidv4();

    // Extract text from document
    const text = await DocumentService.extractText(file.path, documentType);

    // Save extracted text
    const contentPath = path.join(storageConfig.baseDir, `${documentId}.txt`);
    fs.writeFileSync(contentPath, text, 'utf-8');

    // Create metadata
    const metadata: DocumentMetadata = {
      id: documentId,
      filename: file.originalname,
      type: documentType,
      size: file.size,
      uploadedAt: new Date(),
      processedAt: new Date(),
      chunkCount: 0,
      indexed: false,
    };

    // Chunk the document
    const chunks = DocumentService.chunkText(text, 1000, 200);
    chunks.forEach(chunk => {
      chunk.documentId = documentId;
    });
    metadata.chunkCount = chunks.length;

    // Save chunks (for future RAG indexing)
    const chunksPath = path.join(storageConfig.baseDir, `${documentId}.chunks.json`);
    fs.writeFileSync(chunksPath, JSON.stringify(chunks, null, 2));

    // Save metadata
    DocumentService.saveMetadata(metadata);

    // Clean up uploaded file
    fs.unlinkSync(file.path);

    return res.status(201).json({
      document: metadata,
      message: 'Document uploaded and processed successfully',
    });
  } catch (error) {
    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    console.error('Document upload error:', error);
    if (error instanceof Error) {
      return res.status(500).json({
        error: 'Document upload failed',
        message: error.message,
      });
    }
    return res.status(500).json({
      error: 'Document upload failed',
      message: 'Unknown error occurred',
    });
  }
});

/**
 * POST /api/documents/:id/summarize
 * Summarize a document
 */
router.post('/:id/summarize', async (req: Request, res: Response) => {
  try {
    const validationResult = summarizeRequestSchema.safeParse({
      documentId: req.params.id,
      ...req.body,
    });

    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Invalid request',
        details: validationResult.error.errors,
      });
    }

    const { documentId, provider = 'openai', model } = validationResult.data;

    // Load document metadata
    const metadata = DocumentService.loadMetadata(documentId);
    if (!metadata) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Load document content
    const contentPath = path.join(storageConfig.baseDir, `${documentId}.txt`);
    if (!fs.existsSync(contentPath)) {
      return res.status(404).json({ error: 'Document content not found' });
    }

    const text = fs.readFileSync(contentPath, 'utf-8');

    // Summarize document
    const summary = await DocumentService.summarizeDocument(text, provider, model);

    // Update metadata with summary
    metadata.summary = summary;
    DocumentService.saveMetadata(metadata);

    return res.json({
      documentId,
      summary,
      provider,
      model: model || 'default',
    });
  } catch (error) {
    console.error('Document summarization error:', error);
    if (error instanceof Error) {
      return res.status(500).json({
        error: 'Document summarization failed',
        message: error.message,
      });
    }
    return res.status(500).json({
      error: 'Document summarization failed',
      message: 'Unknown error occurred',
    });
  }
});

/**
 * GET /api/documents
 * List all documents
 */
router.get('/', (_req: Request, res: Response) => {
  try {
    const documents = DocumentService.getAllMetadata();
    return res.json({ documents });
  } catch (error) {
    console.error('Get documents error:', error);
    return res.status(500).json({
      error: 'Failed to get documents',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/documents/:id
 * Get document details
 */
router.get('/:id', (req: Request, res: Response) => {
  try {
    const metadata = DocumentService.loadMetadata(req.params.id);
    if (!metadata) {
      return res.status(404).json({ error: 'Document not found' });
    }
    return res.json({ document: metadata });
  } catch (error) {
    console.error('Get document error:', error);
    return res.status(500).json({
      error: 'Failed to get document',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/documents/:id/content
 * Get document content
 */
router.get('/:id/content', (req: Request, res: Response) => {
  try {
    const metadata = DocumentService.loadMetadata(req.params.id);
    if (!metadata) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const contentPath = path.join(storageConfig.baseDir, `${metadata.id}.txt`);
    if (!fs.existsSync(contentPath)) {
      return res.status(404).json({ error: 'Document content not found' });
    }

    const content = fs.readFileSync(contentPath, 'utf-8');
    return res.json({
      documentId: metadata.id,
      content,
      metadata,
    });
  } catch (error) {
    console.error('Get document content error:', error);
    return res.status(500).json({
      error: 'Failed to get document content',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * DELETE /api/documents/:id
 * Delete a document
 */
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const metadata = DocumentService.loadMetadata(req.params.id);
    if (!metadata) {
      return res.status(404).json({ error: 'Document not found' });
    }

    DocumentService.deleteDocument(req.params.id);
    return res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete document error:', error);
    return res.status(500).json({
      error: 'Failed to delete document',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/documents/cleanup
 * Clean up old documents based on policy
 */
router.post('/cleanup', (req: Request, res: Response) => {
  try {
    const policy = req.body.policy || storageConfig.cleanupPolicy;
    const deleted = DocumentService.cleanupDocuments(policy);
    return res.json({
      message: `Cleanup completed`,
      deletedCount: deleted,
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    return res.status(500).json({
      error: 'Cleanup failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;

