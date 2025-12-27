import { ChatService } from '../../services/chatService';
import { LLMFactory } from '../../services/llm/LLMFactory';
import { ChatRequest } from '../../types';

// Mock LLMFactory
jest.mock('../../services/llm/LLMFactory');

describe('ChatService', () => {
  const mockProvider = {
    chat: jest.fn(),
    isAvailable: jest.fn(() => true),
    getDefaultModel: jest.fn(() => 'test-model'),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (LLMFactory.getProvider as jest.Mock).mockReturnValue(mockProvider);
    (LLMFactory.isProviderAvailable as jest.Mock).mockReturnValue(true);
  });

  describe('processChat', () => {
    const validRequest: ChatRequest = {
      provider: 'openai',
      messages: [
        { role: 'user', content: 'Hello' },
      ],
    };

    it('should process valid chat request successfully', async () => {
      mockProvider.chat.mockResolvedValue({
        content: 'Hello! How can I help?',
        model: 'gpt-4',
      });

      const result = await ChatService.processChat(validRequest);

      expect(result).toEqual({
        message: 'Hello! How can I help?',
        provider: 'openai',
        model: 'gpt-4',
      });
      expect(mockProvider.chat).toHaveBeenCalledWith(validRequest.messages, undefined);
    });

    it('should pass model override to provider', async () => {
      const requestWithModel: ChatRequest = {
        ...validRequest,
        model: 'gpt-3.5-turbo',
      };

      mockProvider.chat.mockResolvedValue({
        content: 'Response',
        model: 'gpt-3.5-turbo',
      });

      await ChatService.processChat(requestWithModel);

      expect(mockProvider.chat).toHaveBeenCalledWith(validRequest.messages, 'gpt-3.5-turbo');
    });

    it('should throw error when provider is not available', async () => {
      (LLMFactory.getProvider as jest.Mock).mockReturnValue(null);

      await expect(ChatService.processChat(validRequest)).rejects.toThrow(
        "Provider 'openai' is not available. Please check your API keys."
      );
    });

    it('should throw error when provider is not properly configured', async () => {
      mockProvider.isAvailable.mockReturnValue(false);

      await expect(ChatService.processChat(validRequest)).rejects.toThrow(
        "Provider 'openai' is not properly configured."
      );
    });

    it('should throw error when messages array is empty', async () => {
      const emptyRequest: ChatRequest = {
        ...validRequest,
        messages: [],
      };

      await expect(ChatService.processChat(emptyRequest)).rejects.toThrow(
        'Messages array cannot be empty'
      );
    });

    it('should throw error when last message is not from user', async () => {
      const invalidRequest: ChatRequest = {
        ...validRequest,
        messages: [
          { role: 'user', content: 'Hello' },
          { role: 'assistant', content: 'Hi' },
        ],
      };

      await expect(ChatService.processChat(invalidRequest)).rejects.toThrow(
        'Last message must be from user'
      );
    });

    it('should handle provider errors gracefully', async () => {
      mockProvider.chat.mockRejectedValue(new Error('API error'));

      await expect(ChatService.processChat(validRequest)).rejects.toThrow(
        'Failed to get response from openai: API error'
      );
    });

    it('should handle multi-turn conversations', async () => {
      const multiTurnRequest: ChatRequest = {
        ...validRequest,
        messages: [
          { role: 'user', content: 'What is TypeScript?' },
          { role: 'assistant', content: 'TypeScript is...' },
          { role: 'user', content: 'How does it differ from JavaScript?' },
        ],
      };

      mockProvider.chat.mockResolvedValue({
        content: 'TypeScript adds static typing...',
        model: 'gpt-4',
      });

      const result = await ChatService.processChat(multiTurnRequest);

      expect(result.message).toBe('TypeScript adds static typing...');
      expect(mockProvider.chat).toHaveBeenCalledWith(multiTurnRequest.messages, undefined);
    });
  });

  describe('getAvailableProviders', () => {
    it('should return all providers with availability status', () => {
      (LLMFactory.isProviderAvailable as jest.Mock).mockImplementation((provider) => {
        return provider === 'openai' || provider === 'anthropic';
      });

      const providers = ChatService.getAvailableProviders();

      expect(providers).toHaveLength(3);
      expect(providers).toEqual([
        { id: 'openai', name: 'OpenAI GPT', available: true },
        { id: 'anthropic', name: 'Anthropic Claude', available: true },
        { id: 'gemini', name: 'Google Gemini', available: false },
      ]);
    });

    it('should return all providers as unavailable when none are initialized', () => {
      (LLMFactory.isProviderAvailable as jest.Mock).mockReturnValue(false);

      const providers = ChatService.getAvailableProviders();

      expect(providers.every(p => p.available === false)).toBe(true);
    });
  });
});

