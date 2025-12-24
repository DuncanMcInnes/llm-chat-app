export type MessageRole = 'user' | 'assistant' | 'system';

export interface Message {
  role: MessageRole;
  content: string;
  model?: string; // Optional: model used for assistant messages
}

export type LLMProviderId = 'openai' | 'anthropic' | 'gemini';

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


