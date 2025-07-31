
import { useState } from 'react';
import { DocumentList } from '../components/documents/DocumentList';
import { DocumentUpload } from '../components/documents/DocumentUpload';

interface Document {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  tenantId: string;
  tags: string[];
}

export default function Documents() {
  const [currentView, setCurrentView] = useState<'list' | 'upload' | 'detail'>('list');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleDocumentSelect = (document: Document) => {
    setSelectedDocument(document);
    setCurrentView('detail');
  };

  const handleDocumentEdit = (document: Document) => {
    setSelectedDocument(document);
    // For Sprint 1, we'll just show the document details
    // Edit functionality can be added in future sprints
    setCurrentView('detail');
  };

  const handleDocumentDelete = (_documentId: string) => {
    // Refresh the list after deletion
    setRefreshKey(prev => prev + 1);
  };

  const handleUploadComplete = (_document: any) => {
    // Refresh the list after upload
    setRefreshKey(prev => prev + 1);
    setCurrentView('list');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          
          {currentView === 'list' && (
            <div className="flex items-center space-x-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64 px-4 py-2 pl-10 pr-4 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              
              <button
                onClick={() => setCurrentView('upload')}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Upload Document
              </button>
            </div>
          )}
          
          {currentView !== 'list' && (
            <button
              onClick={() => {
                setCurrentView('list');
                setSelectedDocument(null);
              }}
              className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Back to Documents
            </button>
          )}
        </div>

        {/* Breadcrumb */}
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-4">
            <li>
              <div className="flex items-center">
                <button
                  onClick={() => setCurrentView('list')}
                  className={`text-sm font-medium ${
                    currentView === 'list' 
                      ? 'text-blue-600' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  All Documents
                </button>
              </div>
            </li>
            
            {currentView === 'upload' && (
              <li>
                <div className="flex items-center">
                  <svg className="flex-shrink-0 h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-4 text-sm font-medium text-blue-600">Upload</span>
                </div>
              </li>
            )}
            
            {currentView === 'detail' && selectedDocument && (
              <li>
                <div className="flex items-center">
                  <svg className="flex-shrink-0 h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-4 text-sm font-medium text-blue-600 truncate max-w-md" title={selectedDocument.title}>
                    {selectedDocument.title}
                  </span>
                </div>
              </li>
            )}
          </ol>
        </nav>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg border border-gray-200">
        {currentView === 'list' && (
          <div className="p-6">
            <DocumentList
              key={refreshKey}
              searchTerm={searchTerm}
              onDocumentSelect={handleDocumentSelect}
              onDocumentEdit={handleDocumentEdit}
              onDocumentDelete={handleDocumentDelete}
            />
          </div>
        )}

        {currentView === 'upload' && (
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Upload New Document</h2>
            <DocumentUpload
              onUploadComplete={handleUploadComplete}
              onCancel={() => setCurrentView('list')}
            />
          </div>
        )}

        {currentView === 'detail' && selectedDocument && (
          <div className="p-6">
            <div className="space-y-6">
              {/* Document Header */}
              <div className="border-b border-gray-200 pb-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {selectedDocument.title}
                </h2>
                <div className="flex items-center space-x-6 text-sm text-gray-500">
                  <span>Created: {formatDate(selectedDocument.createdAt)}</span>
                  <span>Modified: {formatDate(selectedDocument.updatedAt)}</span>
                </div>
              </div>

              {/* Document Tags */}
              {selectedDocument.tags.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedDocument.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Document Content */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Content</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <pre className="whitespace-pre-wrap text-sm text-gray-900 font-mono">
                    {selectedDocument.content || 'No content available'}
                  </pre>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleDocumentEdit(selectedDocument)}
                  className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Edit Document
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this document?')) {
                      handleDocumentDelete(selectedDocument.id);
                      setCurrentView('list');
                    }
                  }}
                  className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Delete Document
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}