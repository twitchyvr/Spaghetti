
import { useState, useEffect } from 'react';
import { Search, Upload, Grid, List, Filter, Download, Eye, Edit, Trash2, Tag, Calendar, User, FileText } from 'lucide-react';
import DocumentUpload from '../components/documents/DocumentUpload';

interface Document {
  id: string;
  title: string;
  documentType: string;
  industry: string;
  status: 'Draft' | 'InReview' | 'Approved' | 'Published' | 'Archived';
  createdAt: string;
  updatedAt: string;
  createdByName: string;
  fileName?: string;
  contentType?: string;
  fileSize?: number;
  version: number;
  isLatestVersion: boolean;
  tagNames: string[];
}

interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export default function Documents() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set());
  const [showUpload, setShowUpload] = useState(false);
  const [filters, setFilters] = useState({
    documentType: '',
    industry: '',
    status: '',
    tags: [] as string[]
  });
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 12,
    totalItems: 0,
    totalPages: 0
  });

  // Mock data for demo - replace with actual API calls
  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockDocuments: Document[] = [
          {
            id: '1',
            title: 'Software Development Agreement',
            documentType: 'Contract',
            industry: 'Technology',
            status: 'Published',
            createdAt: '2024-01-15T10:30:00Z',
            updatedAt: '2024-01-16T14:20:00Z',
            createdByName: 'John Doe',
            fileName: 'software-dev-agreement.pdf',
            contentType: 'application/pdf',
            fileSize: 2048576,
            version: 2,
            isLatestVersion: true,
            tagNames: ['contract', 'technology', 'legal']
          },
          {
            id: '2',
            title: 'Product Requirements Document',
            documentType: 'Specification',
            industry: 'Technology',
            status: 'InReview',
            createdAt: '2024-01-14T09:15:00Z',
            updatedAt: '2024-01-15T11:45:00Z',
            createdByName: 'Jane Smith',
            fileName: 'prd-v1.docx',
            contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            fileSize: 1024000,
            version: 1,
            isLatestVersion: true,
            tagNames: ['product', 'requirements', 'specification']
          },
          {
            id: '3',
            title: 'Company Policy Manual',
            documentType: 'Policy',
            industry: 'General',
            status: 'Published',
            createdAt: '2024-01-13T08:00:00Z',
            updatedAt: '2024-01-14T16:30:00Z',
            createdByName: 'HR Department',
            fileName: 'policy-manual.pdf',
            contentType: 'application/pdf',
            fileSize: 5242880,
            version: 3,
            isLatestVersion: true,
            tagNames: ['policy', 'hr', 'internal']
          }
        ];

        setDocuments(mockDocuments);
        setPagination({
          page: 1,
          pageSize: 12,
          totalItems: mockDocuments.length,
          totalPages: Math.ceil(mockDocuments.length / 12)
        });
      } catch (error) {
        console.error('Error fetching documents:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [searchTerm, filters]);

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return 'Unknown';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'Draft': return 'bg-gray-100 text-gray-800';
      case 'InReview': return 'bg-yellow-100 text-yellow-800';
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Published': return 'bg-blue-100 text-blue-800';
      case 'Archived': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const toggleDocumentSelection = (documentId: string) => {
    const newSelection = new Set(selectedDocuments);
    if (newSelection.has(documentId)) {
      newSelection.delete(documentId);
    } else {
      newSelection.add(documentId);
    }
    setSelectedDocuments(newSelection);
  };

  const handleSelectAll = () => {
    if (selectedDocuments.size === documents.length) {
      setSelectedDocuments(new Set());
    } else {
      setSelectedDocuments(new Set(documents.map(d => d.id)));
    }
  };

  const DocumentCard = ({ document }: { document: Document }) => (
    <div className="bg-card border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={selectedDocuments.has(document.id)}
            onChange={() => toggleDocumentSelection(document.id)}
            className="rounded border-gray-300"
          />
          <FileText className="icon-md text-blue-500" />
        </div>
        <div className="flex space-x-1">
          <button className="p-1 hover:bg-gray-100 rounded">
            <Eye className="icon-sm" />
          </button>
          <button className="p-1 hover:bg-gray-100 rounded">
            <Download className="icon-sm" />
          </button>
          <button className="p-1 hover:bg-gray-100 rounded">
            <Edit className="icon-sm" />
          </button>
        </div>
      </div>
      
      <h3 className="font-semibold text-sm mb-2 line-clamp-2">{document.title}</h3>
      
      <div className="space-y-2 text-xs text-muted-foreground">
        <div className="flex items-center space-x-4">
          <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(document.status)}`}>
            {document.status}
          </span>
          <span>v{document.version}</span>
        </div>
        
        <div className="flex items-center space-x-1">
          <User className="icon-xs" />
          <span>{document.createdByName}</span>
        </div>
        
        <div className="flex items-center space-x-1">
          <Calendar className="icon-xs" />
          <span>{formatDate(document.updatedAt)}</span>
        </div>
        
        {document.fileSize && (
          <div className="text-xs">
            {formatFileSize(document.fileSize)}
          </div>
        )}
        
        {document.tagNames.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {document.tagNames.slice(0, 3).map(tag => (
              <span key={tag} className="px-1 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                {tag}
              </span>
            ))}
            {document.tagNames.length > 3 && (
              <span className="text-xs text-muted-foreground">+{document.tagNames.length - 3}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const DocumentListItem = ({ document }: { document: Document }) => (
    <div className="bg-card border rounded-lg p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-center space-x-4">
        <input
          type="checkbox"
          checked={selectedDocuments.has(document.id)}
          onChange={() => toggleDocumentSelection(document.id)}
          className="rounded border-gray-300"
        />
        
        <FileText className="icon-lg text-blue-500 flex-shrink-0" />
        
        <div className="flex-grow min-w-0">
          <div className="flex items-center space-x-3 mb-1">
            <h3 className="font-semibold truncate">{document.title}</h3>
            <span className={`px-2 py-1 rounded-full text-xs flex-shrink-0 ${getStatusColor(document.status)}`}>
              {document.status}
            </span>
            <span className="text-sm text-muted-foreground flex-shrink-0">v{document.version}</span>
          </div>
          
          <div className="flex items-center space-x-6 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <User className="icon-xs" />
              <span>{document.createdByName}</span>
            </div>
            
            <div className="flex items-center space-x-1">
              <Calendar className="icon-xs" />
              <span>{formatDate(document.updatedAt)}</span>
            </div>
            
            <span>{document.documentType}</span>
            
            {document.fileSize && (
              <span>{formatFileSize(document.fileSize)}</span>
            )}
          </div>
          
          {document.tagNames.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {document.tagNames.map(tag => (
                <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex space-x-1 flex-shrink-0">
          <button className="p-2 hover:bg-gray-100 rounded">
            <Eye className="icon-sm" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded">
            <Download className="icon-sm" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded">
            <Edit className="icon-sm" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded text-red-500">
            <Trash2 className="icon-sm" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Documents</h1>
          <p className="text-muted-foreground">Manage your documents and files</p>
        </div>
        
        <div className="flex items-center space-x-3 mt-4 lg:mt-0">
          <button
            onClick={() => setShowUpload(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Upload className="icon-sm" />
            <span>Upload</span>
          </button>
          
          <div className="flex items-center border rounded-lg">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-gray-100' : ''}`}
            >
              <List className="icon-sm" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100' : ''}`}
            >
              <Grid className="icon-sm" />
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="icon-sm absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="Draft">Draft</option>
            <option value="InReview">In Review</option>
            <option value="Approved">Approved</option>
            <option value="Published">Published</option>
            <option value="Archived">Archived</option>
          </select>
          
          <select
            value={filters.documentType}
            onChange={(e) => setFilters({...filters, documentType: e.target.value})}
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            <option value="Contract">Contract</option>
            <option value="Policy">Policy</option>
            <option value="Specification">Specification</option>
            <option value="Report">Report</option>
          </select>
          
          <button className="p-2 border rounded-lg hover:bg-gray-50">
            <Filter className="icon-sm" />
          </button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedDocuments.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-800">
              {selectedDocuments.size} document(s) selected
            </span>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
                Download
              </button>
              <button className="px-3 py-1 border border-red-300 text-red-700 rounded hover:bg-red-50 text-sm">
                Delete
              </button>
              <button
                onClick={() => setSelectedDocuments(new Set())}
                className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-sm"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {/* Documents Grid/List */}
          {documents.length > 0 ? (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <input
                    type="checkbox"
                    checked={selectedDocuments.size === documents.length && documents.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-muted-foreground">
                    {pagination.totalItems} documents
                  </span>
                </div>
              </div>

              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {documents.map(document => (
                    <DocumentCard key={document.id} document={document} />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {documents.map(document => (
                    <DocumentListItem key={document.id} document={document} />
                  ))}
                </div>
              )}

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center space-x-2">
                  <button
                    disabled={pagination.page === 1}
                    className="px-3 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-2">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <button
                    disabled={pagination.page === pagination.totalPages}
                    className="px-3 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <FileText className="icon-3xl text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No documents found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? 'Try adjusting your search criteria' : 'Get started by uploading your first document'}
              </p>
              <button
                onClick={() => setShowUpload(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Upload Document
              </button>
            </div>
          )}
        </>
      )}

      {/* Upload Modal */}
      {showUpload && (
        <DocumentUpload
          onClose={() => setShowUpload(false)}
          onUploadComplete={(uploadedFiles) => {
            console.log('Files uploaded:', uploadedFiles);
            // Refresh documents list here
            setShowUpload(false);
          }}
        />
      )}
    </div>
  );
}