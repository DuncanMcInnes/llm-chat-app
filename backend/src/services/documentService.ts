import fs from 'fs';
import path from 'path';
import mammoth from 'mammoth';

// pdf-parse is a CommonJS module
// In v2.x, it exports PDFParse class which takes {data: buffer} and has getText() method
const pdfParseModule = require('pdf-parse');
const PDFParseClass = pdfParseModule.PDFParse;

if (!PDFParseClass || typeof PDFParseClass !== 'function') {
  throw new Error('PDFParse class not found in pdf-parse module');
}
import { DocumentMetadata, DocumentType, DocumentChunk, CleanupPolicy } from '../types/documents';
import { LLMFactory } from './llm/LLMFactory';
import { Message } from '../types';
import { storageConfig } from '../config/storage';
import { v4 as uuidv4 } from 'uuid';

/**
 * Service for processing and managing documents
 */
export class DocumentService {
  /**
   * Extract text from PDF file
   */
  static async extractTextFromPDF(filePath: string): Promise<string> {
    try {
      console.log(`[EXTRACT] Reading PDF file: ${filePath}`);
      const stats = fs.statSync(filePath);
      console.log(`[EXTRACT] PDF file size: ${stats.size} bytes`);
      
      const dataBuffer = fs.readFileSync(filePath);
      console.log(`[EXTRACT] PDF buffer loaded: ${dataBuffer.length} bytes`);
      
      console.log(`[EXTRACT] Creating PDFParse instance...`);
      const parser = new PDFParseClass({ data: dataBuffer });
      console.log(`[EXTRACT] Extracting text from PDF...`);
      const textResult = await parser.getText();
      console.log(`[EXTRACT] PDF text extracted: ${textResult.text ? textResult.text.length : 0} characters`);
      
      if (!textResult || !textResult.text) {
        throw new Error('No text extracted from PDF');
      }
      
      const data = { text: textResult.text };
      console.log(`[EXTRACT] PDF parsed: ${data.text ? data.text.length : 0} characters extracted`);
      
      if (!data || !data.text) {
        throw new Error('No text extracted from PDF');
      }
      
      return data.text;
    } catch (error) {
      console.error(`[EXTRACT] PDF extraction error:`, error);
      if (error instanceof Error) {
        throw new Error(`Failed to extract text from PDF: ${error.message}`);
      }
      throw new Error('Failed to extract text from PDF');
    }
  }

  /**
   * Extract text from Word document
   */
  static async extractTextFromDocx(filePath: string): Promise<string> {
    try {
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to extract text from Word document: ${error.message}`);
      }
      throw new Error('Failed to extract text from Word document');
    }
  }

  /**
   * Extract text from plain text file
   */
  static async extractTextFromTxt(filePath: string): Promise<string> {
    try {
      return fs.readFileSync(filePath, 'utf-8');
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to read text file: ${error.message}`);
      }
      throw new Error('Failed to read text file');
    }
  }

  /**
   * Extract text from document based on type
   */
  static async extractText(filePath: string, type: DocumentType): Promise<string> {
    switch (type) {
      case 'pdf':
        return this.extractTextFromPDF(filePath);
      case 'docx':
        return this.extractTextFromDocx(filePath);
      case 'txt':
        return this.extractTextFromTxt(filePath);
      default:
        throw new Error(`Unsupported document type: ${type}`);
    }
  }

  /**
   * Chunk text into smaller pieces for processing
   */
  static chunkText(
    text: string,
    chunkSize: number = 1000,
    overlap: number = 200
  ): DocumentChunk[] {
    console.log(`[CHUNK] Starting chunking: text length=${text.length}, chunkSize=${chunkSize}, overlap=${overlap}`);
    const chunks: DocumentChunk[] = [];
    let startIndex = 0;
    let chunkIndex = 0;
    let iterations = 0;
    const maxIterations = 100000; // Safety limit

    while (startIndex < text.length) {
      iterations++;
      if (iterations > maxIterations) {
        console.error(`[CHUNK] ERROR: Exceeded max iterations (${maxIterations}), breaking loop`);
        break;
      }

      if (iterations % 100 === 0) {
        console.log(`[CHUNK] Iteration ${iterations}: startIndex=${startIndex}, text.length=${text.length}`);
      }

      const endIndex = Math.min(startIndex + chunkSize, text.length);
      const content = text.slice(startIndex, endIndex);

      chunks.push({
        id: uuidv4(),
        documentId: '', // Will be set by caller
        content: content.trim(),
        chunkIndex: chunkIndex++,
        startChar: startIndex,
        endChar: endIndex,
      });

      // Move start index forward, accounting for overlap
      const newStartIndex = endIndex - overlap;
      
      // Prevent infinite loop
      if (newStartIndex >= endIndex || newStartIndex <= startIndex) {
        console.log(`[CHUNK] Breaking loop: newStartIndex=${newStartIndex}, endIndex=${endIndex}, startIndex=${startIndex}`);
        break;
      }
      
      startIndex = newStartIndex;
    }

    console.log(`[CHUNK] Chunking complete: ${chunks.length} chunks created in ${iterations} iterations`);
    return chunks;
  }

  /**
   * Summarize document using LLM
   */
  static async summarizeDocument(
    text: string,
    provider: string = 'openai',
    model?: string
  ): Promise<string> {
    const llmProvider = LLMFactory.getProvider(provider as any);
    if (!llmProvider) {
      throw new Error(`Provider '${provider}' is not available`);
    }

    // Create summarization prompt
    const messages: Message[] = [
      {
        role: 'system',
        content: 'You are a helpful assistant that creates concise, informative summaries of documents.',
      },
      {
        role: 'user',
        content: `Please provide a comprehensive summary of the following document. Focus on key points, main ideas, and important details:\n\n${text.substring(0, 8000)}`, // Limit to avoid token limits
      },
    ];

    try {
      const result = await llmProvider.chat(messages, model);
      return result.content;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to summarize document: ${error.message}`);
      }
      throw new Error('Failed to summarize document');
    }
  }

  /**
   * Save document metadata
   */
  static saveMetadata(metadata: DocumentMetadata): void {
    const metadataPath = path.join(storageConfig.baseDir, `${metadata.id}.metadata.json`);
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
  }

  /**
   * Load document metadata
   */
  static loadMetadata(documentId: string): DocumentMetadata | null {
    const metadataPath = path.join(storageConfig.baseDir, `${documentId}.metadata.json`);
    if (!fs.existsSync(metadataPath)) {
      return null;
    }
    const data = fs.readFileSync(metadataPath, 'utf-8');
    return JSON.parse(data);
  }

  /**
   * Get all document metadata
   */
  static getAllMetadata(): DocumentMetadata[] {
    const files = fs.readdirSync(storageConfig.baseDir);
    const metadataFiles = files.filter(f => f.endsWith('.metadata.json'));
    
    return metadataFiles
      .map(file => {
        try {
          const data = fs.readFileSync(path.join(storageConfig.baseDir, file), 'utf-8');
          return JSON.parse(data) as DocumentMetadata;
        } catch {
          return null;
        }
      })
      .filter((m): m is DocumentMetadata => m !== null)
      .sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());
  }

  /**
   * Clean up old documents based on policy
   */
  static cleanupDocuments(policy: CleanupPolicy = storageConfig.cleanupPolicy): number {
    const metadata = this.getAllMetadata();
    const now = new Date();
    let deleted = 0;

    // Sort by upload date (newest first)
    const sorted = metadata.sort((a, b) => 
      new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );

    // Apply max documents limit
    if (policy.maxDocuments && sorted.length > policy.maxDocuments) {
      const toDelete = sorted.slice(policy.maxDocuments);
      toDelete.forEach(doc => {
        this.deleteDocument(doc.id);
        deleted++;
      });
      return deleted;
    }

    // Apply max age limit
    if (policy.maxAgeDays) {
      const maxAge = policy.maxAgeDays * 24 * 60 * 60 * 1000;
      sorted.forEach(doc => {
        const age = now.getTime() - new Date(doc.uploadedAt).getTime();
        if (age > maxAge) {
          this.deleteDocument(doc.id);
          deleted++;
        }
      });
    }

    // Delete unindexed documents
    if (policy.deleteUnindexed && policy.unindexedMaxAgeDays) {
      const unindexedMaxAge = policy.unindexedMaxAgeDays * 24 * 60 * 60 * 1000;
      sorted.forEach(doc => {
        if (!doc.indexed) {
          const age = now.getTime() - new Date(doc.uploadedAt).getTime();
          if (age > unindexedMaxAge) {
            this.deleteDocument(doc.id);
            deleted++;
          }
        }
      });
    }

    return deleted;
  }

  /**
   * Delete document and its metadata
   */
  static deleteDocument(documentId: string): void {
    const metadataPath = path.join(storageConfig.baseDir, `${documentId}.metadata.json`);
    const contentPath = path.join(storageConfig.baseDir, `${documentId}.txt`);
    
    if (fs.existsSync(metadataPath)) {
      fs.unlinkSync(metadataPath);
    }
    if (fs.existsSync(contentPath)) {
      fs.unlinkSync(contentPath);
    }
  }
}

