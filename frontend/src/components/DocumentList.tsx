import { useState } from 'react';
import type { DocumentMetadata, LLMProviderId } from '../types';
import { ProviderSelector } from './ProviderSelector';
import type { ProviderInfo } from '../types';

interface DocumentListProps {
  documents: DocumentMetadata[];
  providers: ProviderInfo[];
  onSummarize: (documentId: string, provider?: LLMProviderId, model?: string) => Promise<void>;
  onDelete: (documentId: string) => Promise<void>;
  isLoading: boolean;
}

export function DocumentList({
  documents,
  providers,
  onSummarize,
  onDelete,
  isLoading,
}: DocumentListProps) {
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const [summaryProvider, setSummaryProvider] = useState<LLMProviderId>('openai');
  const [isSummarizing, setIsSummarizing] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSummarize = async (documentId: string) => {
    setIsSummarizing(documentId);
    try {
      await onSummarize(documentId, summaryProvider);
    } finally {
      setIsSummarizing(null);
    }
  };

  const handleDelete = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return;
    }
    setIsDeleting(documentId);
    try {
      await onDelete(documentId);
    } finally {
      setIsDeleting(null);
    }
  };

  if (documents.length === 0) {
    return (
      <div className="document-list empty">
        <p>No documents uploaded yet. Upload a document to get started.</p>
      </div>
    );
  }

  return (
    <div className="document-list">
      <div className="document-list-header">
        <h3>Documents ({documents.length})</h3>
        <div className="summary-provider-selector">
          <label>Summarize with:</label>
          <ProviderSelector
            providers={providers}
            value={summaryProvider}
            onChange={setSummaryProvider}
          />
        </div>
      </div>
      <div className="document-items">
        {documents.map((doc) => (
          <div key={doc.id} className="document-item">
            <div className="document-header">
              <div className="document-info">
                <h4>{doc.filename}</h4>
                <div className="document-meta">
                  <span className="document-type">{doc.type.toUpperCase()}</span>
                  <span className="document-size">{formatFileSize(doc.size)}</span>
                  {doc.chunkCount && (
                    <span className="document-chunks">{doc.chunkCount} chunks</span>
                  )}
                  {doc.chunkingSchema && (
                    <span className="document-chunking" title={`Chunking: ${doc.chunkingSchema.chunkSize} chars, ${doc.chunkingSchema.overlap} overlap, ${doc.chunkingSchema.strategy} strategy`}>
                      {doc.chunkingSchema.chunkSize}/{doc.chunkingSchema.overlap}
                    </span>
                  )}
                  {doc.summaryMetadata && (
                    <span className="document-model" title={`Summarized with ${doc.summaryMetadata.provider} (${doc.summaryMetadata.model})`}>
                      {doc.summaryMetadata.provider}: {doc.summaryMetadata.model}
                    </span>
                  )}
                  <span className="document-date">{formatDate(doc.uploadedAt)}</span>
                </div>
              </div>
              <div className="document-actions">
                {!doc.summary && (
                  <button
                    className="btn-summarize"
                    onClick={() => handleSummarize(doc.id)}
                    disabled={isSummarizing === doc.id || isLoading}
                  >
                    {isSummarizing === doc.id ? 'Summarizing...' : 'Summarize'}
                  </button>
                )}
                <button
                  className="btn-delete"
                  onClick={() => handleDelete(doc.id)}
                  disabled={isDeleting === doc.id || isLoading}
                >
                  {isDeleting === doc.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
            {(doc.summary || doc.chunkingSchema || doc.embeddingSchema) && (
              <div className="document-details">
                {doc.summary && (
                  <div className="document-summary">
                    <details
                      open={selectedDoc === doc.id}
                      onClick={(e) => {
                        e.preventDefault();
                        setSelectedDoc(selectedDoc === doc.id ? null : doc.id);
                      }}
                    >
                      <summary>
                        Summary
                        {doc.summaryMetadata && (
                          <span className="summary-meta">
                            {' '}({doc.summaryMetadata.provider} - {doc.summaryMetadata.model})
                          </span>
                        )}
                      </summary>
                      <div className="summary-content">{doc.summary}</div>
                    </details>
                  </div>
                )}
                {(doc.chunkingSchema || doc.embeddingSchema) && (
                  <div className="document-schemas">
                    <details>
                      <summary>Processing Schema</summary>
                      <div className="schema-content">
                        {doc.chunkingSchema && (
                          <div className="schema-item">
                            <strong>Chunking:</strong>
                            <ul>
                              <li>Size: {doc.chunkingSchema.chunkSize} characters</li>
                              <li>Overlap: {doc.chunkingSchema.overlap} characters</li>
                              <li>Strategy: {doc.chunkingSchema.strategy}</li>
                            </ul>
                          </div>
                        )}
                        {doc.embeddingSchema && (
                          <div className="schema-item">
                            <strong>Embedding:</strong>
                            <ul>
                              {doc.embeddingSchema.model && <li>Model: {doc.embeddingSchema.model}</li>}
                              {doc.embeddingSchema.provider && <li>Provider: {doc.embeddingSchema.provider}</li>}
                              {doc.embeddingSchema.dimensions && <li>Dimensions: {doc.embeddingSchema.dimensions}</li>}
                              <li>Indexed: {doc.embeddingSchema.indexed ? 'Yes' : 'No'}</li>
                            </ul>
                          </div>
                        )}
                      </div>
                    </details>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

