import path from 'path';
import fs from 'fs';

/**
 * Storage configuration for documents
 */
export const storageConfig = {
  // Base directory for document storage
  baseDir: process.env.DOCUMENTS_STORAGE_DIR || path.join(process.cwd(), 'storage', 'documents'),
  
  // Temporary upload directory
  uploadDir: path.join(process.cwd(), 'storage', 'uploads'),
  
  // Maximum file size (50MB default)
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '52428800', 10), // 50MB
  
  // Allowed file types
  allowedMimeTypes: {
    'application/pdf': 'pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'application/msword': 'doc',
    'text/plain': 'txt',
  },
  
  // Cleanup policy defaults
  cleanupPolicy: {
    maxAgeDays: parseInt(process.env.DOCUMENTS_MAX_AGE_DAYS || '90', 10),
    maxDocuments: parseInt(process.env.DOCUMENTS_MAX_COUNT || '1000', 10),
    deleteUnindexed: process.env.DELETE_UNINDEXED === 'true',
    unindexedMaxAgeDays: parseInt(process.env.UNINDEXED_MAX_AGE_DAYS || '7', 10),
  },
  
  // Initialize storage directories
  initialize(): void {
    const dirs = [this.baseDir, this.uploadDir];
    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  },
};

