import { LLMFactory } from '../../services/llm/LLMFactory';
import { OpenAIService } from '../../services/llm/OpenAIService';
import { AnthropicService } from '../../services/llm/AnthropicService';
import { GeminiService } from '../../services/llm/GeminiService';

// Mock the config module
jest.mock('../../config', () => ({
  config: {
    llm: {
      openai: {
        apiKey: 'test-openai-key',
        defaultModel: 'gpt-4',
      },
      anthropic: {
        apiKey: 'test-anthropic-key',
        defaultModel: 'claude-3-sonnet-20240229',
      },
      gemini: {
        apiKey: 'test-gemini-key',
        defaultModel: 'gemini-1.5-flash',
      },
    },
  },
}));

describe('LLMFactory', () => {
  beforeEach(() => {
    // Clear the providers map before each test
    // @ts-ignore - accessing private static property for testing
    LLMFactory.providers.clear();
  });

  describe('initialize', () => {
    it('should initialize all providers with valid API keys', () => {
      LLMFactory.initialize();

      expect(LLMFactory.getProvider('openai')).toBeInstanceOf(OpenAIService);
      expect(LLMFactory.getProvider('anthropic')).toBeInstanceOf(AnthropicService);
      expect(LLMFactory.getProvider('gemini')).toBeInstanceOf(GeminiService);
    });

    it('should not initialize providers without API keys', () => {
      // Test that services with empty keys are not available
      const { OpenAIService } = require('../../services/llm/OpenAIService');
      const emptyOpenAI = new OpenAIService('', 'gpt-4');
      
      expect(emptyOpenAI.isAvailable()).toBe(false);
    });
  });

  describe('getProvider', () => {
    beforeEach(() => {
      LLMFactory.initialize();
    });

    it('should return provider instance for valid provider name', () => {
      const provider = LLMFactory.getProvider('openai');
      expect(provider).toBeInstanceOf(OpenAIService);
    });

    it('should return null for uninitialized provider', () => {
      // @ts-ignore - accessing private static property for testing
      LLMFactory.providers.clear();
      const provider = LLMFactory.getProvider('openai');
      expect(provider).toBeNull();
    });
  });

  describe('getAvailableProviders', () => {
    beforeEach(() => {
      LLMFactory.initialize();
    });

    it('should return all available providers', () => {
      const providers = LLMFactory.getAvailableProviders();
      expect(providers).toContain('openai');
      expect(providers).toContain('anthropic');
      expect(providers).toContain('gemini');
      expect(providers.length).toBe(3);
    });

    it('should return empty array when no providers are initialized', () => {
      // @ts-ignore - accessing private static property for testing
      LLMFactory.providers.clear();
      const providers = LLMFactory.getAvailableProviders();
      expect(providers).toEqual([]);
    });
  });

  describe('isProviderAvailable', () => {
    beforeEach(() => {
      LLMFactory.initialize();
    });

    it('should return true for available provider', () => {
      expect(LLMFactory.isProviderAvailable('openai')).toBe(true);
    });

    it('should return false for uninitialized provider', () => {
      // @ts-ignore - accessing private static property for testing
      LLMFactory.providers.clear();
      expect(LLMFactory.isProviderAvailable('openai')).toBe(false);
    });
  });
});

