import type { ChatRequest, ChatResponse, ProviderInfo } from '../types';

const API_BASE = '/api';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = `Request failed with status ${res.status}`;
    try {
      const data = await res.json();
      if (data?.message || data?.error) {
        message = data.message || data.error;
      }
    } catch {
      // ignore JSON parse errors
    }
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

export async function fetchProviders(): Promise<ProviderInfo[]> {
  const res = await fetch(`${API_BASE}/providers`);
  const data = await handleResponse<{ providers: ProviderInfo[] }>(res);
  return data.providers;
}

export async function sendChat(request: ChatRequest): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  return handleResponse<ChatResponse>(res);
}


