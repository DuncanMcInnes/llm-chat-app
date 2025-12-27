import { LLMFactory } from './llm/LLMFactory';
import { ChatRequest, ChatResponse, LLMProvider } from '../types';

/**
 * Service for handling chat requests
 * Acts as a bridge between the API routes and the LLM providers
 */
export class ChatService {
  /**
   * Process a chat request and return a response
   * @param request The chat request
   * @returns The chat response
   */
  static async processChat(request: ChatRequest): Promise<ChatResponse> {
    const { provider, messages, model } = request;

    // Get the provider instance
    const llmProvider = LLMFactory.getProvider(provider);
    
    if (!llmProvider) {
      throw new Error(`Provider '${provider}' is not available. Please check your API keys.`);
    }

    if (!llmProvider.isAvailable()) {
      throw new Error(`Provider '${provider}' is not properly configured.`);
    }

    // Validate messages
    if (!messages || messages.length === 0) {
      throw new Error('Messages array cannot be empty');
    }

    // Ensure last message is from user
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role !== 'user') {
      throw new Error('Last message must be from user');
    }

    try {
      // Get response from LLM provider (now returns both content and actual model used)
      const result = await llmProvider.chat(messages, model);

      return {
        message: result.content,
        provider,
        model: result.model, // Use the actual model from the API response
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get response from ${provider}: ${error.message}`);
      }
      throw new Error(`Failed to get response from ${provider}`);
    }
  }

  /**
   * Get information about available providers
   * @returns Array of provider information
   */
  static getAvailableProviders(): Array<{ id: LLMProvider; name: string; available: boolean }> {
    const providerNames: Record<LLMProvider, string> = {
      openai: 'OpenAI GPT',
      anthropic: 'Anthropic Claude',
      gemini: 'Google Gemini',
      ollama: 'OLLAMA (Local)',
    };

    const allProviders: LLMProvider[] = ['openai', 'anthropic', 'gemini', 'ollama'];
    
    return allProviders.map(id => ({
      id,
      name: providerNames[id],
      available: LLMFactory.isProviderAvailable(id),
    }));
  }
}

