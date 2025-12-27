import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useChat } from '../../hooks/useChat';
import * as api from '../../services/api';

// Mock the API service
vi.mock('../../services/api');

describe('useChat', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default state', () => {
    vi.mocked(api.fetchProviders).mockResolvedValue([
      { id: 'openai', name: 'OpenAI GPT', available: true },
    ]);

    const { result } = renderHook(() => useChat());

    expect(result.current.provider).toBe('openai');
    expect(result.current.messages).toEqual([]);
    expect(result.current.input).toBe('');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should load providers on mount', async () => {
    const mockProviders = [
      { id: 'openai', name: 'OpenAI GPT', available: true },
      { id: 'anthropic', name: 'Anthropic Claude', available: true },
    ];

    vi.mocked(api.fetchProviders).mockResolvedValue(mockProviders);

    const { result } = renderHook(() => useChat());

    await waitFor(() => {
      expect(result.current.providers).toEqual(mockProviders);
    });

    expect(api.fetchProviders).toHaveBeenCalledOnce();
  });

  it('should set provider when setProvider is called', async () => {
    vi.mocked(api.fetchProviders).mockResolvedValue([
      { id: 'openai', name: 'OpenAI GPT', available: true },
      { id: 'anthropic', name: 'Anthropic Claude', available: true },
    ]);

    const { result } = renderHook(() => useChat());

    await waitFor(() => {
      expect(result.current.providers.length).toBeGreaterThan(0);
    });

    result.current.setProvider('anthropic');

    expect(result.current.provider).toBe('anthropic');
    expect(result.current.error).toBeNull();
  });

  it('should update input when setInput is called', () => {
    vi.mocked(api.fetchProviders).mockResolvedValue([
      { id: 'openai', name: 'OpenAI GPT', available: true },
    ]);

    const { result } = renderHook(() => useChat());

    result.current.setInput('Hello, world!');

    expect(result.current.input).toBe('Hello, world!');
  });

  it('should send message and update state', async () => {
    vi.mocked(api.fetchProviders).mockResolvedValue([
      { id: 'openai', name: 'OpenAI GPT', available: true },
    ]);

    const mockResponse = {
      message: 'Hello! How can I help?',
      provider: 'openai',
      model: 'gpt-4',
    };

    vi.mocked(api.sendChat).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useChat());

    await waitFor(() => {
      expect(result.current.providers.length).toBeGreaterThan(0);
    });

    result.current.setInput('Hello');
    await result.current.sendMessage();

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[0]).toEqual({
      role: 'user',
      content: 'Hello',
    });
    expect(result.current.messages[1]).toEqual({
      role: 'assistant',
      content: 'Hello! How can I help?',
      model: 'gpt-4',
    });
    expect(result.current.input).toBe('');
    expect(api.sendChat).toHaveBeenCalledWith({
      provider: 'openai',
      messages: [{ role: 'user', content: 'Hello' }],
    });
  });

  it('should handle send message errors', async () => {
    vi.mocked(api.fetchProviders).mockResolvedValue([
      { id: 'openai', name: 'OpenAI GPT', available: true },
    ]);

    vi.mocked(api.sendChat).mockRejectedValue(new Error('API error'));

    const { result } = renderHook(() => useChat());

    await waitFor(() => {
      expect(result.current.providers.length).toBeGreaterThan(0);
    });

    result.current.setInput('Hello');
    await result.current.sendMessage();

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe('API error');
    expect(result.current.messages).toHaveLength(1); // Only user message
  });

  it('should not send empty messages', async () => {
    vi.mocked(api.fetchProviders).mockResolvedValue([
      { id: 'openai', name: 'OpenAI GPT', available: true },
    ]);

    const { result } = renderHook(() => useChat());

    await waitFor(() => {
      expect(result.current.providers.length).toBeGreaterThan(0);
    });

    result.current.setInput('   '); // Whitespace only
    await result.current.sendMessage();

    expect(api.sendChat).not.toHaveBeenCalled();
    expect(result.current.messages).toHaveLength(0);
  });

  it('should reset messages and input', async () => {
    vi.mocked(api.fetchProviders).mockResolvedValue([
      { id: 'openai', name: 'OpenAI GPT', available: true },
    ]);

    const { result } = renderHook(() => useChat());

    await waitFor(() => {
      expect(result.current.providers.length).toBeGreaterThan(0);
    });

    result.current.setInput('Hello');
    result.current.setProvider('anthropic');

    result.current.reset();

    expect(result.current.messages).toEqual([]);
    expect(result.current.input).toBe('');
    expect(result.current.error).toBeNull();
  });

  it('should handle provider loading errors', async () => {
    vi.mocked(api.fetchProviders).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useChat());

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });

    expect(result.current.error).toBe('Network error');
  });
});

