import { useDocuments } from '../hooks/useDocuments';
import { useChat } from '../hooks/useChat';
import { DocumentUpload } from './DocumentUpload';
import { DocumentList } from './DocumentList';
import type { LLMProviderId } from '../types';

export function Documents() {
  const {
    documents,
    isLoading,
    error,
    uploadProgress,
    uploadDocument,
    summarizeDocument,
    deleteDocument,
  } = useDocuments();

  const { providers } = useChat();

  const handleSummarize = async (documentId: string, provider?: LLMProviderId, model?: string) => {
    await summarizeDocument(documentId, { provider, model });
  };

  return (
    <div className="documents-container">
      <header className="documents-header">
        <div>
          <h1>Document Processing</h1>
          <p className="documents-subtitle">
            Upload documents (PDF, Word, Text) and generate summaries using any LLM provider.
          </p>
        </div>
      </header>

      <main className="documents-main">
        <section className="upload-section">
          <h2>Upload Document</h2>
          <DocumentUpload
            onUpload={uploadDocument}
            isLoading={isLoading}
            uploadProgress={uploadProgress}
          />
        </section>

        {error && <div className="documents-error">Error: {error}</div>}

        <section className="documents-section">
          <DocumentList
            documents={documents}
            providers={providers}
            onSummarize={handleSummarize}
            onDelete={deleteDocument}
            isLoading={isLoading}
          />
        </section>
      </main>
    </div>
  );
}

