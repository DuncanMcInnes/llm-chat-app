import Anthropic from '@anthropic-ai/sdk';
import { LLMProvider, ChatResult } from './LLMProvider';
import { Message } from '../../types';

export class AnthropicService implements LLMProvider {
  private client: Anthropic | null = null;
  private apiKey: string;
  private defaultModel: string;

  constructor(apiKey: string, defaultModel: string = 'claude-3-5-sonnet-20240620') {
    this.apiKey = apiKey;
    this.defaultModel = defaultModel;
    
    if (apiKey && apiKey.trim() !== '') {
      this.client = new Anthropic({ 
        apiKey,
        // Explicitly set API version - required for Anthropic API
        // The SDK should handle this, but being explicit helps
      });
    }
  }

  isAvailable(): boolean {
    return this.client !== null && this.apiKey.trim() !== '';
  }

  getDefaultModel(): string {
    return this.defaultModel;
  }

  async chat(messages: Message[], model?: string): Promise<ChatResult> {
    if (!this.client) {
      throw new Error('Anthropic client not initialized. Please provide a valid API key.');
    }

    try {
      // Anthropic API requires messages array with specific format
      // System messages need to be extracted separately
      const systemMessage = messages.find(msg => msg.role === 'system');
      const conversationMessages = messages
        .filter(msg => msg.role !== 'system')
        .map(msg => ({
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.content,
        })) as Anthropic.MessageParam[];

      const requestedModel = model || this.defaultModel;
      const response = await this.client.messages.create({
        model: requestedModel,
        max_tokens: 1024,
        messages: conversationMessages,
        ...(systemMessage && { system: systemMessage.content }),
      });

      // Anthropic returns content as an array, extract text
      if (!response.content || response.content.length === 0) {
        throw new Error('Anthropic API returned empty content array');
      }

      const content = response.content[0];
      if (!content || content.type !== 'text') {
        throw new Error(`Unexpected content type from Anthropic API: ${content?.type || 'undefined'}`);
      }

      if (!content.text) {
        throw new Error('Anthropic API returned text content with no text property');
      }

      // Get the actual model used from the API response (Anthropic returns model as string)
      const actualModel = response.model || requestedModel;

      return {
        content: content.text,
        model: actualModel,
      };
    } catch (error) {
      // Enhanced error handling to show full error details
      if (error instanceof Error) {
        // Check if it's an Anthropic API error with details
        const errorMessage = error.message;
        const errorDetails = (error as any).error || (error as any).body;
        
        if (errorDetails) {
          const detailsStr = typeof errorDetails === 'string' 
            ? errorDetails 
            : JSON.stringify(errorDetails);
          throw new Error(`Anthropic API error: ${errorMessage}\nDetails: ${detailsStr}`);
        }
        throw new Error(`Anthropic API error: ${errorMessage}`);
      }
      throw new Error(`Unknown error occurred with Anthropic API: ${String(error)}`);
    }
  }
}

