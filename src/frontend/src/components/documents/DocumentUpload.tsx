import { useState, useRef, useCallback } from 'react';
import { Upload, X, File, Check, AlertCircle, Progress } from 'lucide-react';

interface DocumentUploadProps {
  onClose: () => void;
  onUploadComplete?: (documents: any[]) => void;
}

interface UploadFile {
  id: string;
  file: File;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  progress: number;
  error?: string;
  documentId?: string;
}

interface DocumentFormData {
  title: string;
  description: string;
  documentType: string;
  industry: string;
  status: 'Draft' | 'InReview' | 'Approved' | 'Published';
  publicAccessLevel: 'Private' | 'TenantUsers' | 'AuthenticatedUsers' | 'Public';
  tags: string[];
}

export default function DocumentUpload({ onClose, onUploadComplete }: DocumentUploadProps) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [formData, setFormData] = useState<DocumentFormData>({
    title: '',
    description: '',
    documentType: 'Document',
    industry: 'General',
    status: 'Draft',
    publicAccessLevel: 'Private',
    tags: []
  });
  const [tagInput, setTagInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/markdown',
    'image/jpeg',
    'image/png',
    'image/gif'
  ];

  const maxFileSize = 100 * 1024 * 1024; // 100MB

  const validateFile = (file: File): string | null => {
    if (!allowedTypes.includes(file.type)) {
      return 'File type not supported';
    }
    if (file.size > maxFileSize) {
      return 'File size exceeds 100MB limit';
    }
    return null;
  };

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    const validFiles: UploadFile[] = [];

    fileArray.forEach(file => {
      const error = validateFile(file);
      const uploadFile: UploadFile = {
        id: Math.random().toString(36).substr(2, 9),
        file,
        status: error ? 'error' : 'pending',
        progress: 0,
        error
      };
      validFiles.push(uploadFile);
    });

    setFiles(prev => [...prev, ...validFiles]);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFiles = e.dataTransfer.files;
    addFiles(droppedFiles);
  }, [addFiles]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(e.target.files);
    }
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const simulateUpload = async (file: UploadFile): Promise<void> => {
    // Simulate file upload with progress
    for (let progress = 0; progress <= 100; progress += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setFiles(prev => prev.map(f => 
        f.id === file.id ? { ...f, progress, status: 'uploading' } : f
      ));
    }

    // Simulate completion
    setFiles(prev => prev.map(f => 
      f.id === file.id 
        ? { ...f, status: 'completed', documentId: Math.random().toString(36).substr(2, 9) }
        : f
    ));
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    const validFiles = files.filter(f => f.status === 'pending');

    try {
      // Upload files in parallel
      await Promise.all(validFiles.map(file => simulateUpload(file)));
      
      // Call completion callback
      const completedFiles = files.filter(f => f.status === 'completed');
      if (onUploadComplete) {
        onUploadComplete(completedFiles);
      }

      // Close modal after successful upload
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('image')) return '🖼️';
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word') || fileType.includes('document')) return '📝';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊';
    if (fileType.includes('powerpoint') || fileType.includes('presentation')) return '📑';
    return '📄';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <Check className="icon-sm text-green-500" />;
      case 'error': return <AlertCircle className="icon-sm text-red-500" />;
      case 'uploading': return <Progress className="icon-sm text-blue-500 animate-spin" />;
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Upload Documents</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="icon-md" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Upload Area */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragOver 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <Upload className="icon-3xl text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {isDragOver ? 'Drop files here' : 'Drag and drop files here'}
              </h3>
              <p className="text-muted-foreground mb-4">
                or click to browse your computer
              </p>
              <p className="text-sm text-muted-foreground">
                Supported: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, MD, Images (up to 100MB)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={allowedTypes.join(',')}
                onChange={handleFileInput}
                className="hidden"
              />
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-medium">Files to Upload ({files.length})</h3>
                <div className="space-y-2">
                  {files.map(file => (
                    <div key={file.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <div className="text-2xl">{getFileIcon(file.file.type)}</div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium truncate">{file.file.name}</h4>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(file.status)}
                            {file.status !== 'error' && file.status !== 'completed' && (
                              <button
                                onClick={() => removeFile(file.id)}
                                className="p-1 hover:bg-gray-100 rounded"
                              >
                                <X className="icon-xs" />
                              </button>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>{formatFileSize(file.file.size)}</span>
                          <span>{file.file.type}</span>
                        </div>
                        
                        {file.status === 'uploading' && (
                          <div className="mt-2">
                            <div className="w-full bg-gray-200 rounded-full h-1">
                              <div
                                className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                                style={{ width: `${file.progress}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-muted-foreground">{file.progress}%</span>
                          </div>
                        )}
                        
                        {file.error && (
                          <p className="text-sm text-red-600 mt-1">{file.error}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Document Metadata Form */}
            {files.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-medium">Document Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Title</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Document title (optional)"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Document Type</label>
                    <select
                      value={formData.documentType}
                      onChange={(e) => setFormData(prev => ({ ...prev, documentType: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Document">Document</option>
                      <option value="Contract">Contract</option>
                      <option value="Policy">Policy</option>
                      <option value="Specification">Specification</option>
                      <option value="Report">Report</option>
                      <option value="Presentation">Presentation</option>
                      <option value="Spreadsheet">Spreadsheet</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Industry</label>
                    <select
                      value={formData.industry}
                      onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="General">General</option>
                      <option value="Technology">Technology</option>
                      <option value="Legal">Legal</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Finance">Finance</option>
                      <option value="Education">Education</option>
                      <option value="Manufacturing">Manufacturing</option>
                      <option value="Retail">Retail</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Draft">Draft</option>
                      <option value="InReview">In Review</option>
                      <option value="Approved">Approved</option>
                      <option value="Published">Published</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Document description (optional)"
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Tags</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center space-x-1"
                      >
                        <span>{tag}</span>
                        <button
                          onClick={() => removeTag(tag)}
                          className="hover:text-blue-600"
                        >
                          <X className="icon-xs" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      placeholder="Add tag..."
                      className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={addTag}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <div className="text-sm text-muted-foreground">
            {files.length > 0 && (
              <span>
                {files.filter(f => f.status === 'completed').length} of {files.length} files uploaded
              </span>
            )}
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              disabled={isUploading}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={uploadFiles}
              disabled={files.length === 0 || isUploading || files.every(f => f.status === 'error')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isUploading ? (
                <>
                  <Progress className="icon-sm animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="icon-sm" />
                  <span>Upload Files</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}