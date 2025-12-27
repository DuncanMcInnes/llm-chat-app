import request from 'supertest';
import express from 'express';
import cors from 'cors';
import chatRoutes from '../../routes/chat';
import { LLMFactory } from '../../services/llm/LLMFactory';

// Mock LLMFactory
jest.mock('../../services/llm/LLMFactory');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', chatRoutes);

describe('Chat API Routes', () => {
  const mockProvider = {
    chat: jest.fn(),
    isAvailable: jest.fn(() => true),
    getDefaultModel: jest.fn(() => 'gpt-4'),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (LLMFactory.getProvider as jest.Mock).mockReturnValue(mockProvider);
    (LLMFactory.isProviderAvailable as jest.Mock).mockReturnValue(true);
  });

  describe('POST /api/chat', () => {
    const validRequest = {
      provider: 'openai',
      messages: [
        { role: 'user', content: 'Hello' },
      ],
    };

    it('should return 200 with valid chat response', async () => {
      mockProvider.chat.mockResolvedValue({
        content: 'Hello! How can I help?',
        model: 'gpt-4',
      });

      const response = await request(app)
        .post('/api/chat')
        .send(validRequest)
        .expect(200);

      expect(response.body).toEqual({
        message: 'Hello! How can I help?',
        provider: 'openai',
        model: 'gpt-4',
      });
    });

    it('should return 400 for invalid provider', async () => {
      const invalidRequest = {
        ...validRequest,
        provider: 'invalid-provider',
      };

      const response = await request(app)
        .post('/api/chat')
        .send(invalidRequest)
        .expect(400);

      expect(response.body.error).toBe('Invalid request');
      expect(response.body.details).toBeDefined();
    });

    it('should return 400 for empty messages array', async () => {
      const invalidRequest = {
        ...validRequest,
        messages: [],
      };

      const response = await request(app)
        .post('/api/chat')
        .send(invalidRequest)
        .expect(400);

      expect(response.body.error).toBe('Invalid request');
    });

    it('should return 400 for invalid message format', async () => {
      const invalidRequest = {
        ...validRequest,
        messages: [
          { role: 'invalid-role', content: 'Hello' },
        ],
      };

      const response = await request(app)
        .post('/api/chat')
        .send(invalidRequest)
        .expect(400);

      expect(response.body.error).toBe('Invalid request');
    });

    it('should return 400 for empty message content', async () => {
      const invalidRequest = {
        ...validRequest,
        messages: [
          { role: 'user', content: '' },
        ],
      };

      const response = await request(app)
        .post('/api/chat')
        .send(invalidRequest)
        .expect(400);

      expect(response.body.error).toBe('Invalid request');
    });

    it('should return 500 when provider is not available', async () => {
      (LLMFactory.getProvider as jest.Mock).mockReturnValue(null);

      const response = await request(app)
        .post('/api/chat')
        .send(validRequest)
        .expect(500);

      expect(response.body.error).toBe('Chat request failed');
      expect(response.body.message).toContain('not available');
    });

    it('should return 500 when provider chat fails', async () => {
      mockProvider.chat.mockRejectedValue(new Error('API error'));

      const response = await request(app)
        .post('/api/chat')
        .send(validRequest)
        .expect(500);

      expect(response.body.error).toBe('Chat request failed');
      expect(response.body.message).toContain('Failed to get response');
    });

    it('should handle model override', async () => {
      const requestWithModel = {
        ...validRequest,
        model: 'gpt-3.5-turbo',
      };

      mockProvider.chat.mockResolvedValue({
        content: 'Response',
        model: 'gpt-3.5-turbo',
      });

      const response = await request(app)
        .post('/api/chat')
        .send(requestWithModel)
        .expect(200);

      expect(response.body.model).toBe('gpt-3.5-turbo');
      expect(mockProvider.chat).toHaveBeenCalledWith(
        requestWithModel.messages,
        'gpt-3.5-turbo'
      );
    });

    it('should handle multi-turn conversations', async () => {
      const multiTurnRequest = {
        ...validRequest,
        messages: [
          { role: 'user', content: 'What is React?' },
          { role: 'assistant', content: 'React is a library...' },
          { role: 'user', content: 'How does it work?' },
        ],
      };

      mockProvider.chat.mockResolvedValue({
        content: 'React uses a virtual DOM...',
        model: 'gpt-4',
      });

      const response = await request(app)
        .post('/api/chat')
        .send(multiTurnRequest)
        .expect(200);

      expect(response.body.message).toBe('React uses a virtual DOM...');
    });
  });

  describe('GET /api/providers', () => {
    it('should return 200 with provider list', async () => {
      (LLMFactory.isProviderAvailable as jest.Mock).mockImplementation((provider) => {
        return provider === 'openai' || provider === 'anthropic';
      });

      const response = await request(app)
        .get('/api/providers')
        .expect(200);

      expect(response.body.providers).toHaveLength(3);
      expect(response.body.providers).toEqual([
        { id: 'openai', name: 'OpenAI GPT', available: true },
        { id: 'anthropic', name: 'Anthropic Claude', available: true },
        { id: 'gemini', name: 'Google Gemini', available: false },
      ]);
    });

    it('should handle errors gracefully', async () => {
      (LLMFactory.isProviderAvailable as jest.Mock).mockImplementation(() => {
        throw new Error('Test error');
      });

      const response = await request(app)
        .get('/api/providers')
        .expect(500);

      expect(response.body.error).toBe('Failed to get providers');
    });
  });
});

