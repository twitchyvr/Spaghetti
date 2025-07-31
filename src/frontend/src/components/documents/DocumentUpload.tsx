import React, { useState, useCallback } from 'react';
import { documentApi } from '../../services/api';

interface DocumentUploadProps {
  onUploadComplete?: (document: any) => void;
  onCancel?: () => void;
  className?: string;
}

interface UploadProgress {
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
  documentId?: string;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
  onUploadComplete,
  onCancel,
  className = '',
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploads, setUploads] = useState<UploadProgress[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: '',
  });

  // Accepted file types
  const acceptedTypes = [
    '.pdf', '.doc', '.docx', '.txt', '.md',
    '.xls', '.xlsx', '.ppt', '.pptx',
    '.jpg', '.jpeg', '.png', '.gif',
    '.zip', '.rar', '.7z'
  ];

  const maxFileSize = 50 * 1024 * 1024; // 50MB

  const validateFile = (file: File): string | null => {
    if (file.size > maxFileSize) {
      return `File size must be less than ${maxFileSize / (1024 * 1024)}MB`;
    }

    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedTypes.includes(extension)) {
      return `File type ${extension} is not supported`;
    }

    return null;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const uploadFile = async (file: File) => {    
    // Add to uploads list
    setUploads(prev => [...prev, {
      file,
      progress: 0,
      status: 'uploading',
    }]);

    try {
      // Simulate upload progress
      const updateProgress = (progress: number) => {
        setUploads(prev => prev.map(upload => 
          upload.file === file ? { ...upload, progress } : upload
        ));
      };

      // Simulate progressive upload
      for (let i = 10; i <= 90; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        updateProgress(i);
      }

      // Create FormData for file upload
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('title', formData.title || file.name);
      uploadFormData.append('description', formData.description);
      
      if (formData.tags) {
        const tagArray = formData.tags.split(',').map(tag => tag.trim()).filter(Boolean);
        tagArray.forEach(tag => uploadFormData.append('tags', tag));
      }

      // Note: This would need to be updated to use the actual upload endpoint
      // For now, we'll use the create document API as a placeholder
      const result = await documentApi.createDocument({
        title: formData.title || file.name,
        content: formData.description || `Uploaded file: ${file.name}`,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
      });

      updateProgress(100);
      
      setUploads(prev => prev.map(upload => 
        upload.file === file ? { 
          ...upload, 
          status: 'completed',
          documentId: result.id 
        } : upload
      ));

      onUploadComplete?.(result);

    } catch (error) {
      setUploads(prev => prev.map(upload => 
        upload.file === file ? { 
          ...upload, 
          status: 'error',
          error: error instanceof Error ? error.message : 'Upload failed'
        } : upload
      ));
    }
  };

  const handleFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    
    for (const file of fileArray) {
      const validationError = validateFile(file);
      if (validationError) {
        alert(`${file.name}: ${validationError}`);
        continue;
      }
      
      uploadFile(file);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const removeUpload = (file: File) => {
    setUploads(prev => prev.filter(upload => upload.file !== file));
  };

  const clearCompleted = () => {
    setUploads(prev => prev.filter(upload => upload.status !== 'completed'));
  };

  const hasUploads = uploads.length > 0;
  const hasCompleted = uploads.some(upload => upload.status === 'completed');
  const allCompleted = uploads.length > 0 && uploads.every(upload => upload.status === 'completed');

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Document Information Form */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Document Information</h3>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter document title (optional - will use filename if empty)"
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter document description"
            />
          </div>
          
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
              Tags
            </label>
            <input
              type="text"
              id="tags"
              value={formData.tags}
              onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter tags separated by commas (e.g., legal, contract, important)"
            />
          </div>
        </div>
      </div>

      {/* File Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="space-y-4">
          <div className="text-4xl text-gray-400">📁</div>
          <div>
            <p className="text-lg font-medium text-gray-900">
              Drop files here or click to upload
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Supports: {acceptedTypes.join(', ')}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Maximum file size: {maxFileSize / (1024 * 1024)}MB
            </p>
          </div>
          
          <div>
            <input
              type="file"
              multiple
              accept={acceptedTypes.join(',')}
              onChange={handleFileInput}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
            >
              Choose Files
            </label>
          </div>
        </div>
      </div>

      {/* Upload Progress */}
      {hasUploads && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Upload Progress</h3>
            {hasCompleted && (
              <button
                onClick={clearCompleted}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Clear Completed
              </button>
            )}
          </div>
          
          <div className="max-h-64 overflow-y-auto">
            {uploads.map((upload, index) => (
              <div key={index} className="p-4 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {upload.file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(upload.file.size)}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="text-xs text-gray-500">
                      {upload.status === 'uploading' && `${upload.progress}%`}
                      {upload.status === 'completed' && '✓ Complete'}
                      {upload.status === 'error' && '✗ Failed'}
                    </div>
                    
                    <button
                      onClick={() => removeUpload(upload.file)}
                      className="text-gray-400 hover:text-gray-600"
                      title="Remove"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                
                {upload.status === 'uploading' && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${upload.progress}%` }}
                    />
                  </div>
                )}
                
                {upload.status === 'error' && upload.error && (
                  <p className="text-xs text-red-600 mt-1">{upload.error}</p>
                )}
                
                {upload.status === 'completed' && (
                  <div className="w-full bg-green-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full w-full" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3">
        {onCancel && (
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
        )}
        
        {allCompleted && (
          <button
            onClick={() => {
              setUploads([]);
              setFormData({ title: '', description: '', tags: '' });
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Done
          </button>
        )}
      </div>
    </div>
  );
};