import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import {
  KnowledgeBase,
  KnowledgeBaseCreateRequest,
  KnowledgeBaseUpdateRequest,
  KnowledgeBaseConfig,
} from '../types/knowledge-bases';
import { storageConfig } from '../config/storage';

/**
 * Default Knowledge Base configuration
 */
const DEFAULT_KB_CONFIG: KnowledgeBaseConfig = {
  embeddingProvider: 'openai',
  embeddingModel: 'text-embedding-3-small',
  chunkingStrategy: 'fixed',
  chunkSize: 1000,
  overlap: 200,
  retrievalTopK: 5,
  retrievalThreshold: 0.7,
};

/**
 * Service for managing Knowledge Bases
 */
export class KnowledgeBaseService {
  private static readonly KB_STORAGE_DIR = path.join(storageConfig.baseDir, 'knowledge-bases');
  private static readonly KB_METADATA_FILE = 'kb-metadata.json';

  /**
   * Initialize KB storage directory
   */
  static initialize(): void {
    if (!fs.existsSync(this.KB_STORAGE_DIR)) {
      fs.mkdirSync(this.KB_STORAGE_DIR, { recursive: true });
    }
  }

  /**
   * Get path to KB metadata file
   */
  private static getKBPath(kbId: string): string {
    return path.join(this.KB_STORAGE_DIR, `${kbId}.json`);
  }

  /**
   * Merge config with defaults
   */
  private static mergeConfig(partialConfig?: Partial<KnowledgeBaseConfig>): KnowledgeBaseConfig {
    return {
      ...DEFAULT_KB_CONFIG,
      ...partialConfig,
    };
  }

  /**
   * Create a new Knowledge Base
   */
  static createKB(request: KnowledgeBaseCreateRequest): KnowledgeBase {
    this.initialize();

    const kbId = uuidv4();
    const now = new Date();
    const config = this.mergeConfig(request.config);

    const kb: KnowledgeBase = {
      id: kbId,
      name: request.name,
      description: request.description,
      config,
      documentCount: 0,
      chunkCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    // Save KB metadata
    const kbPath = this.getKBPath(kbId);
    fs.writeFileSync(kbPath, JSON.stringify(kb, null, 2));

    return kb;
  }

  /**
   * Get a Knowledge Base by ID
   */
  static getKB(kbId: string): KnowledgeBase | null {
    const kbPath = this.getKBPath(kbId);
    if (!fs.existsSync(kbPath)) {
      return null;
    }

    const data = fs.readFileSync(kbPath, 'utf-8');
    const kb = JSON.parse(data) as KnowledgeBase;
    
    // Convert date strings back to Date objects
    kb.createdAt = new Date(kb.createdAt);
    kb.updatedAt = new Date(kb.updatedAt);

    return kb;
  }

  /**
   * List all Knowledge Bases
   */
  static listKBs(): KnowledgeBase[] {
    this.initialize();

    const files = fs.readdirSync(this.KB_STORAGE_DIR);
    const kbFiles = files.filter(f => f.endsWith('.json'));

    return kbFiles
      .map(file => {
        try {
          const kbId = file.replace('.json', '');
          return this.getKB(kbId);
        } catch (e) {
          console.error(`Error loading KB file ${file}:`, e);
          return null;
        }
      })
      .filter((kb): kb is KnowledgeBase => kb !== null)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Update a Knowledge Base
   */
  static updateKB(kbId: string, request: KnowledgeBaseUpdateRequest): KnowledgeBase | null {
    const kb = this.getKB(kbId);
    if (!kb) {
      return null;
    }

    // Update fields
    if (request.name !== undefined) {
      kb.name = request.name;
    }
    if (request.description !== undefined) {
      kb.description = request.description;
    }
    if (request.config !== undefined) {
      kb.config = this.mergeConfig({ ...kb.config, ...request.config });
    }

    kb.updatedAt = new Date();

    // Save updated KB
    const kbPath = this.getKBPath(kbId);
    fs.writeFileSync(kbPath, JSON.stringify(kb, null, 2));

    return kb;
  }

  /**
   * Delete a Knowledge Base
   */
  static deleteKB(kbId: string): boolean {
    const kbPath = this.getKBPath(kbId);
    if (!fs.existsSync(kbPath)) {
      return false;
    }

    fs.unlinkSync(kbPath);
    return true;
  }

  /**
   * Increment document count for a KB
   */
  static incrementDocumentCount(kbId: string, delta: number = 1): void {
    const kb = this.getKB(kbId);
    if (kb) {
      kb.documentCount += delta;
      kb.updatedAt = new Date();
      const kbPath = this.getKBPath(kbId);
      fs.writeFileSync(kbPath, JSON.stringify(kb, null, 2));
    }
  }

  /**
   * Increment chunk count for a KB
   */
  static incrementChunkCount(kbId: string, delta: number = 1): void {
    const kb = this.getKB(kbId);
    if (kb) {
      kb.chunkCount += delta;
      kb.updatedAt = new Date();
      const kbPath = this.getKBPath(kbId);
      fs.writeFileSync(kbPath, JSON.stringify(kb, null, 2));
    }
  }

  /**
   * Get or create default KB (for backward compatibility)
   */
  static getOrCreateDefaultKB(): KnowledgeBase {
    const kbs = this.listKBs();
    const defaultKB = kbs.find(kb => kb.name === 'Default Knowledge Base');
    
    if (defaultKB) {
      return defaultKB;
    }

    // Create default KB
    return this.createKB({
      name: 'Default Knowledge Base',
      description: 'Default knowledge base for documents',
    });
  }
}

