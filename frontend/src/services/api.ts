import type { 
  ChatRequest, 
  ChatResponse, 
  ProviderInfo, 
  DocumentMetadata, 
  DocumentUploadResponse, 
  DocumentSummaryRequest, 
  DocumentSummaryResponse 
} from '../types';

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

// Document API functions
export async function uploadDocument(file: File): Promise<DocumentUploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/documents/upload`, {
    method: 'POST',
    body: formData,
  });

  return handleResponse<DocumentUploadResponse>(res);
}

export async function listDocuments(): Promise<DocumentMetadata[]> {
  const res = await fetch(`${API_BASE}/documents`);
  const data = await handleResponse<{ documents: DocumentMetadata[] }>(res);
  return data.documents;
}

export async function getDocument(documentId: string): Promise<DocumentMetadata> {
  const res = await fetch(`${API_BASE}/documents/${documentId}`);
  const data = await handleResponse<{ document: DocumentMetadata }>(res);
  return data.document;
}

export async function summarizeDocument(
  documentId: string,
  request: DocumentSummaryRequest = {}
): Promise<DocumentSummaryResponse> {
  const res = await fetch(`${API_BASE}/documents/${documentId}/summarize`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  return handleResponse<DocumentSummaryResponse>(res);
}

export async function deleteDocument(documentId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/documents/${documentId}/delete`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    throw new Error(`Failed to delete document: ${res.statusText}`);
  }
}


