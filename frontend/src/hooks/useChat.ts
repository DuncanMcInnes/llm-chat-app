import { useEffect, useState } from 'react';
import { fetchProviders, sendChat } from '../services/api';
import type { ChatRequest, ChatResponse, LLMProviderId, Message, ProviderInfo } from '../types';

interface UseChatState {
  provider: LLMProviderId;
  providers: ProviderInfo[];
  messages: Message[];
  input: string;
  isLoading: boolean;
  error: string | null;
}

interface UseChatResult extends UseChatState {
  setProvider: (id: LLMProviderId) => void;
  setInput: (value: string) => void;
  sendMessage: () => Promise<void>;
  reset: () => void;
}

const DEFAULT_PROVIDER: LLMProviderId = 'openai';

export function useChat(): UseChatResult {
  const [state, setState] = useState<UseChatState>({
    provider: DEFAULT_PROVIDER,
    providers: [],
    messages: [],
    input: '',
    isLoading: false,
    error: null,
  });

  // Load providers on mount
  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const providers = await fetchProviders();
        if (!isMounted) return;

        const available = providers.filter(p => p.available);
        const defaultProvider =
          (available.find(p => p.id === DEFAULT_PROVIDER) ?? available[0] ?? providers[0])?.id ??
          DEFAULT_PROVIDER;

        setState(prev => ({
          ...prev,
          providers,
          provider: defaultProvider,
        }));
      } catch (error) {
        if (!isMounted) return;
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Failed to load providers',
        }));
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const setProvider = (id: LLMProviderId) => {
    setState(prev => ({ ...prev, provider: id, error: null }));
  };

  const setInput = (value: string) => {
    setState(prev => ({ ...prev, input: value }));
  };

  const reset = () => {
    setState(prev => ({
      ...prev,
      messages: [],
      input: '',
      error: null,
    }));
  };

  const sendMessage = async () => {
    const trimmed = state.input.trim();
    if (!trimmed || state.isLoading) return;

    const newUserMessage: Message = {
      role: 'user',
      content: trimmed,
    };

    const nextMessages = [...state.messages, newUserMessage];

    setState(prev => ({
      ...prev,
      messages: nextMessages,
      input: '',
      isLoading: true,
      error: null,
    }));

    const request: ChatRequest = {
      provider: state.provider,
      messages: nextMessages,
    };

    try {
      const response: ChatResponse = await sendChat(request);

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.message,
        model: response.model, // Store which model was used
      };

      setState(prev => ({
        ...prev,
        messages: [...nextMessages, assistantMessage],
        isLoading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to send message',
      }));
    }
  };

  return {
    ...state,
    setProvider,
    setInput,
    sendMessage,
    reset,
  };
}


