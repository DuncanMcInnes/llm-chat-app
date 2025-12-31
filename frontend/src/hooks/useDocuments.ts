import { useState, useEffect, useCallback } from 'react';
import * as api from '../services/api';
import type { DocumentMetadata, DocumentSummaryRequest } from '../types';

export function useDocuments() {
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const loadDocuments = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const docs = await api.listDocuments();
      setDocuments(docs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load documents');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const uploadDocument = useCallback(async (file: File) => {
    try {
      setIsLoading(true);
      setError(null);
      setUploadProgress(0);

      // Simulate progress (since we can't track actual upload progress easily)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => (prev === null ? 10 : Math.min(prev + 10, 90)));
      }, 200);

      const response = await api.uploadDocument(file);
      clearInterval(progressInterval);
      setUploadProgress(100);

      // Reload documents list
      await loadDocuments();

      setTimeout(() => setUploadProgress(null), 500);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload document');
      setUploadProgress(null);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [loadDocuments]);

  const summarizeDocument = useCallback(async (
    documentId: string,
    request: DocumentSummaryRequest = {}
  ) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.summarizeDocument(documentId, request);
      // Reload documents to get updated summary
      await loadDocuments();
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to summarize document');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [loadDocuments]);

  const deleteDocument = useCallback(async (documentId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await api.deleteDocument(documentId);
      // Reload documents list
      await loadDocuments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete document');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [loadDocuments]);

  return {
    documents,
    isLoading,
    error,
    uploadProgress,
    uploadDocument,
    summarizeDocument,
    deleteDocument,
    refreshDocuments: loadDocuments,
  };
}

