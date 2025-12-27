import { LLMProvider, ChatResult } from './LLMProvider';
import { Message } from '../../types';

/**
 * OLLAMA Service
 * Connects to a local OLLAMA instance running in Docker
 * OLLAMA API: https://github.com/ollama/ollama/blob/main/docs/api.md
 */
export class OllamaService implements LLMProvider {
  private baseUrl: string;
  private defaultModel: string;

  constructor(baseUrl: string = 'http://localhost:11434', defaultModel: string = 'mistral') {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.defaultModel = defaultModel;
  }

  isAvailable(): boolean {
    // OLLAMA doesn't require API keys, but we should check if the service is reachable
    // For simplicity, we'll assume it's available if baseUrl is set
    return this.baseUrl.trim() !== '';
  }

  getDefaultModel(): string {
    return this.defaultModel;
  }

  async chat(messages: Message[], model?: string): Promise<ChatResult> {
    const modelName = model || this.defaultModel;

    try {
      // Convert our Message format to OLLAMA's format
      // OLLAMA expects messages in a specific format
      const ollamaMessages = messages.map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : msg.role === 'system' ? 'system' : 'user',
        content: msg.content,
      }));

      // OLLAMA API endpoint: POST /api/chat
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: modelName,
          messages: ollamaMessages,
          stream: false, // We want a complete response, not streaming
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OLLAMA API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json() as {
        message?: { role: string; content: string };
        model?: string;
      };

      // OLLAMA response format: { message: { role: string, content: string }, ... }
      const content = data.message?.content;
      if (!content) {
        throw new Error('No response content from OLLAMA');
      }

      return {
        content,
        model: modelName, // OLLAMA returns the model in the response, but we'll use requested
      };
    } catch (error) {
      if (error instanceof Error) {
        // Check if it's a connection error
        if (error.message.includes('fetch failed') || error.message.includes('ECONNREFUSED')) {
          throw new Error(`Cannot connect to OLLAMA at ${this.baseUrl}. Make sure OLLAMA is running.`);
        }
        throw new Error(`OLLAMA API error: ${error.message}`);
      }
      throw new Error('Unknown error occurred with OLLAMA API');
    }
  }
}

