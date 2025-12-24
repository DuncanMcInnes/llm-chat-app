import OpenAI from 'openai';
import { LLMProvider, ChatResult } from './LLMProvider';
import { Message } from '../../types';

export class OpenAIService implements LLMProvider {
  private client: OpenAI | null = null;
  private apiKey: string;
  private defaultModel: string;

  constructor(apiKey: string, defaultModel: string = 'gpt-4') {
    this.apiKey = apiKey;
    this.defaultModel = defaultModel;
    
    if (apiKey && apiKey.trim() !== '') {
      this.client = new OpenAI({ apiKey });
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
      throw new Error('OpenAI client not initialized. Please provide a valid API key.');
    }

    try {
      // Convert our Message format to OpenAI's format
      const openAIMessages = messages.map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : msg.role === 'system' ? 'system' : 'user',
        content: msg.content,
      }));

      const requestedModel = model || this.defaultModel;
      const response = await this.client.chat.completions.create({
        model: requestedModel,
        messages: openAIMessages as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response content from OpenAI');
      }

      // Get the actual model used from the API response
      const actualModel = response.model || requestedModel;

      return {
        content,
        model: actualModel,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`OpenAI API error: ${error.message}`);
      }
      throw new Error('Unknown error occurred with OpenAI API');
    }
  }
}

