/**
 * Core types for the LLM Chat application
 */

export type MessageRole = 'user' | 'assistant' | 'system';

export interface Message {
  role: MessageRole;
  content: string;
}

export type LLMProvider = 'openai' | 'anthropic' | 'gemini' | 'ollama';

export interface ChatRequest {
  provider: LLMProvider;
  messages: Message[];
  model?: string; // Optional model override (provider-specific)
}

export interface ChatResponse {
  message: string;
  provider: LLMProvider;
  model?: string;
}

export interface ProviderInfo {
  id: LLMProvider;
  name: string;
  available: boolean;
}

export interface LLMConfig {
  openai?: {
    apiKey: string;
    defaultModel?: string;
  };
  anthropic?: {
    apiKey: string;
    defaultModel?: string;
  };
  gemini?: {
    apiKey: string;
    defaultModel?: string;
  };
  ollama?: {
    baseUrl?: string; // Default: http://localhost:11434
    defaultModel?: string; // Default: llama2
  };
}


