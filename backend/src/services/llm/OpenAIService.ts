import OpenAI from 'openai';
import { LLMProvider } from './LLMProvider';
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

  async chat(messages: Message[], model?: string): Promise<string> {
    if (!this.client) {
      throw new Error('OpenAI client not initialized. Please provide a valid API key.');
    }

    try {
      // Convert our Message format to OpenAI's format
      const openAIMessages = messages.map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : msg.role === 'system' ? 'system' : 'user',
        content: msg.content,
      }));

      const response = await this.client.chat.completions.create({
        model: model || this.defaultModel,
        messages: openAIMessages as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response content from OpenAI');
      }

      return content;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`OpenAI API error: ${error.message}`);
      }
      throw new Error('Unknown error occurred with OpenAI API');
    }
  }
}

