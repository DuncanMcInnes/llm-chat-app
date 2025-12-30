import dotenv from 'dotenv';
import path from 'path';
import { LLMConfig } from '../types';

// Load environment variables
// 1. Try project root .env (one level above backend/)
// 2. Fallback to backend/.env
const projectRootEnvPath = path.resolve(__dirname, '../../../.env');
dotenv.config({ path: projectRootEnvPath });
dotenv.config(); // fallback to default .env lookup in backend directory

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3004',
  llm: {
    openai: {
      apiKey: process.env.OPENAI_API_KEY || '',
      defaultModel: process.env.OPENAI_DEFAULT_MODEL || 'gpt-4',
    },
    anthropic: {
      apiKey: process.env.ANTHROPIC_API_KEY || '',
      // Try claude-3-5-sonnet-20240620 first, fallback to claude-3-sonnet-20240229
      // User can override in .env if needed
      defaultModel: process.env.ANTHROPIC_DEFAULT_MODEL || 'claude-3-5-sonnet-20240620',
    },
    gemini: {
      apiKey: process.env.GOOGLE_API_KEY || '',
      defaultModel: process.env.GEMINI_DEFAULT_MODEL || 'gemini-1.5-flash',
    },
    ollama: {
      baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
      // Default to mistral (faster, smaller) or use llama3 for better quality
      defaultModel: process.env.OLLAMA_DEFAULT_MODEL || 'mistral',
    },
  } as LLMConfig,
} as const;


