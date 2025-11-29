import Anthropic from '@anthropic-ai/sdk';
import { LLMProvider } from './LLMProvider';
import { Message } from '../../types';

export class AnthropicService implements LLMProvider {
  private client: Anthropic | null = null;
  private apiKey: string;
  private defaultModel: string;

  constructor(apiKey: string, defaultModel: string = 'claude-3-5-sonnet-20241022') {
    this.apiKey = apiKey;
    this.defaultModel = defaultModel;
    
    if (apiKey && apiKey.trim() !== '') {
      this.client = new Anthropic({ apiKey });
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

      const response = await this.client.messages.create({
        model: model || this.defaultModel,
        max_tokens: 1024,
        messages: conversationMessages,
        ...(systemMessage && { system: systemMessage.content }),
      });

      // Anthropic returns content as an array, extract text
      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected content type from Anthropic API');
      }

      return content.text;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Anthropic API error: ${error.message}`);
      }
      throw new Error('Unknown error occurred with Anthropic API');
    }
  }
}

