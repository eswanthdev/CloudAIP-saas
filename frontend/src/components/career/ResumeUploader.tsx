import React, { useState } from 'react';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';

interface ResumeUploaderProps {
  resume?: {
    fileName: string;
    uploadedAt: string;
    url: string;
  };
  onUpload?: (file: File) => void;
  onDelete?: () => void;
}

const ResumeUploader: React.FC<ResumeUploaderProps> = ({ resume, onUpload, onDelete }) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      alert('Please upload a PDF file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }
    setIsLoading(true);
    onUpload?.(file);
    setIsLoading(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  return (
    <Card>
      <div className="p-6">
        <h3 className="text-lg font-semibold text-secondary-900 mb-4">Resume</h3>

        {resume ? (
          <div className="border-l-4 border-green-600 bg-green-50 p-4 rounded">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8 16.5a1 1 0 11-2 0 1 1 0 012 0zM15 7a1 1 0 11-2 0 1 1 0 012 0z" />
                  <path d="M12.5 1a1 1 0 00-1 1v1h3V2a1 1 0 00-1-1h-1zm-7 8a1 1 0 100 2h8a1 1 0 100-2h-8z" />
                </svg>
                <div>
                  <p className="font-medium text-green-900">{resume.fileName}</p>
                  <p className="text-sm text-green-700">Uploaded {resume.uploadedAt}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={onDelete}>
                Delete
              </Button>
            </div>
            <a href={resume.url} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-700 text-sm font-medium">
              Download Resume
            </a>
          </div>
        ) : (
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
              isDragActive
                ? 'border-primary-600 bg-primary-50'
                : 'border-secondary-300 bg-secondary-50 hover:border-primary-600'
            }`}
          >
            <svg className="w-12 h-12 mx-auto text-secondary-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <p className="text-secondary-900 font-medium mb-1">Upload your resume</p>
            <p className="text-secondary-600 text-sm mb-4">Drag and drop a PDF file or click to browse</p>
            <label>
              <input
                type="file"
                accept=".pdf"
                onChange={handleInputChange}
                className="hidden"
                disabled={isLoading}
              />
              <Button variant="primary" size="sm" as="span" isLoading={isLoading}>
                Choose File
              </Button>
            </label>
            <p className="text-secondary-500 text-xs mt-3">PDF up to 5MB</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ResumeUploader;
