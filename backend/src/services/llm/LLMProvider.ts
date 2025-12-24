import { Message } from '../../types';

/**
 * Base interface for all LLM providers
 * This abstraction allows us to swap providers without changing the rest of the code
 */
export interface ChatResult {
  content: string;
  model: string; // The actual model used by the API
}

export interface LLMProvider {
  /**
   * Send a chat request and get a response
   * @param messages Array of messages in the conversation
   * @param model Optional model override (provider-specific)
   * @returns The assistant's response with the actual model used
   */
  chat(messages: Message[], model?: string): Promise<ChatResult>;

  /**
   * Check if the provider is available (has valid API key)
   * @returns true if the provider can be used
   */
  isAvailable(): boolean;

  /**
   * Get the default model for this provider
   * @returns The default model identifier
   */
  getDefaultModel(): string;
}

