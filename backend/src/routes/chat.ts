import { Router, Request, Response } from 'express';
import { ChatService } from '../services/chatService';
import { ChatRequest } from '../types';
import { z } from 'zod';

const router = Router();

// Validation schema for chat request
const chatRequestSchema = z.object({
  provider: z.enum(['openai', 'anthropic', 'gemini']),
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant', 'system']),
      content: z.string().min(1),
    })
  ).min(1),
  model: z.string().optional(),
});

/**
 * POST /api/chat
 * Send a chat message to an LLM provider
 */
router.post('/chat', async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validationResult = chatRequestSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Invalid request',
        details: validationResult.error.errors,
      });
    }

    const chatRequest: ChatRequest = validationResult.data;

    // Process the chat request
    const response = await ChatService.processChat(chatRequest);

    res.json(response);
  } catch (error) {
    console.error('Chat error:', error);
    
    if (error instanceof Error) {
      return res.status(500).json({
        error: 'Chat request failed',
        message: error.message,
      });
    }

    res.status(500).json({
      error: 'Chat request failed',
      message: 'Unknown error occurred',
    });
  }
});

/**
 * GET /api/providers
 * Get list of available LLM providers
 */
router.get('/providers', (_req: Request, res: Response) => {
  try {
    const providers = ChatService.getAvailableProviders();
    res.json({ providers });
  } catch (error) {
    console.error('Providers error:', error);
    res.status(500).json({
      error: 'Failed to get providers',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;

