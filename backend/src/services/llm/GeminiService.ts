import { GoogleGenerativeAI } from '@google/generative-ai';
import { LLMProvider, ChatResult } from './LLMProvider';
import { Message } from '../../types';

export class GeminiService implements LLMProvider {
  private genAI: GoogleGenerativeAI | null = null;
  private apiKey: string;
  private defaultModel: string;

  constructor(apiKey: string, defaultModel: string = 'gemini-1.5-flash') {
    this.apiKey = apiKey;
    this.defaultModel = defaultModel;
    
    if (apiKey && apiKey.trim() !== '') {
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
  }

  isAvailable(): boolean {
    return this.genAI !== null && this.apiKey.trim() !== '';
  }

  getDefaultModel(): string {
    return this.defaultModel;
  }

  async chat(messages: Message[], model?: string): Promise<ChatResult> {
    if (!this.genAI) {
      throw new Error('Gemini client not initialized. Please provide a valid API key.');
    }

    try {
      const modelName = model || this.defaultModel;
      const geminiModel = this.genAI.getGenerativeModel({ model: modelName });

      // Extract system message if present
      const systemMessage = messages.find(msg => msg.role === 'system');
      const conversationMessages = messages.filter(msg => msg.role !== 'system');

      // Build prompt from conversation history
      // For MVP, we'll format the conversation as a single prompt
      let prompt = '';
      
      if (systemMessage) {
        prompt += `System: ${systemMessage.content}\n\n`;
      }

      // Format conversation
      for (const msg of conversationMessages) {
        const role = msg.role === 'assistant' ? 'Assistant' : 'User';
        prompt += `${role}: ${msg.content}\n\n`;
      }

      // Ensure we end with a user message
      const lastMessage = conversationMessages[conversationMessages.length - 1];
      if (!lastMessage || lastMessage.role !== 'user') {
        throw new Error('Last message must be from user');
      }

      // Generate response
      const result = await geminiModel.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      if (!text) {
        throw new Error('No response text from Gemini');
      }

      // Gemini doesn't return model info in response, so use requested model
      return {
        content: text,
        model: modelName,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Gemini API error: ${error.message}`);
      }
      throw new Error('Unknown error occurred with Gemini API');
    }
  }
}

