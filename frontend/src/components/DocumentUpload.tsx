import { useRef, useState } from 'react';
import type { DocumentUploadResponse } from '../types';

interface DocumentUploadProps {
  onUpload: (file: File) => Promise<DocumentUploadResponse>;
  isLoading: boolean;
  uploadProgress: number | null;
}

export function DocumentUpload({ onUpload, isLoading, uploadProgress }: DocumentUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain',
    ];

    if (!allowedTypes.includes(file.type)) {
      setError(`Invalid file type. Allowed: PDF, Word (.docx, .doc), or Text (.txt)`);
      return;
    }

    // Validate file size (50MB max)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      setError(`File too large. Maximum size: 50MB`);
      return;
    }

    setError(null);
    try {
      await onUpload(file);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="document-upload">
      <div
        className={`upload-area ${dragActive ? 'drag-active' : ''} ${isLoading ? 'uploading' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.txt"
          onChange={handleChange}
          disabled={isLoading}
          style={{ display: 'none' }}
        />
        {isLoading ? (
          <div className="upload-progress">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${uploadProgress ?? 0}%` }}
              />
            </div>
            <p>Uploading... {uploadProgress ?? 0}%</p>
          </div>
        ) : (
          <div className="upload-content">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <p className="upload-text">
              <strong>Click to upload</strong> or drag and drop
            </p>
            <p className="upload-hint">
              PDF, Word (.docx, .doc), or Text (.txt) up to 50MB
            </p>
          </div>
        )}
      </div>
      {error && <div className="upload-error">{error}</div>}
    </div>
  );
}

