import { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  FileText, 
  Plus, 
  Search, 
  Download,
  Edit3,
  Trash2,
  Eye,
  Calendar,
  User,
  Upload,
  Grid3X3,
  List,
  SortAsc,
  AlertCircle
} from 'lucide-react';

interface Noodle {
  id: string;
  title: string;
  description?: string;
  content: string;
  tags: string[];
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
  fileSize?: string;
  status: 'draft' | 'published' | 'archived';
}

export default function Noodles() {
  const [noodles, setNoodles] = useState<Noodle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'title' | 'date' | 'author'>('date');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Sample noodle data
  const sampleNoodles: Noodle[] = [
    {
      id: '1',
      title: 'Linguine Legal Contract',
      description: 'Comprehensive legal noodle for software development services including milestones, deliverables, and payment terms.',
      content: 'This Software Development Agreement outlines the terms and conditions...',
      tags: ['contract', 'software', 'legal'],
      createdBy: 'John Smith',
      createdAt: '2025-07-25T10:00:00Z',
      updatedAt: '2025-07-25T14:30:00Z',
      fileSize: '247 KB',
      status: 'published'
    },
    {
      id: '2',
      title: 'Penne Product Requirements',
      description: 'Detailed PRD noodle for the new mobile application including user stories, wireframes, and technical specifications.',
      content: 'Product Overview: This document outlines the requirements for...',
      tags: ['prd', 'mobile', 'product'],
      createdBy: 'Sarah Johnson',
      createdAt: '2025-07-24T09:15:00Z',
      updatedAt: '2025-07-24T16:45:00Z',
      fileSize: '1.2 MB',
      status: 'published'
    },
    {
      id: '3',
      title: 'Rigatoni Marketing Strategy Q3 2025',
      description: 'Strategic marketing noodle for Q3 including campaigns, budgets, and success metrics.',
      content: 'Executive Summary: Our Q3 marketing strategy focuses on...',
      tags: ['marketing', 'strategy', 'q3'],
      createdBy: 'Mike Chen',
      createdAt: '2025-07-23T11:30:00Z',
      fileSize: '856 KB',
      status: 'draft'
    },
    {
      id: '4',
      title: 'Fusilli Employee Handbook 2025',
      description: 'Updated company policies noodle with procedures and guidelines for all employees.',
      content: 'Welcome to our company! This handbook contains important information...',
      tags: ['hr', 'handbook', 'policies'],
      createdBy: 'Lisa Brown',
      createdAt: '2025-07-22T08:00:00Z',
      updatedAt: '2025-07-23T12:00:00Z',
      fileSize: '3.4 MB',
      status: 'published'
    },
    {
      id: '5',
      title: 'Tagliatelle API Documentation v2.1',
      description: 'Comprehensive API noodle including endpoints, parameters, and examples.',
      content: 'API Overview: This documentation covers all available endpoints...',
      tags: ['api', 'documentation', 'technical'],
      createdBy: 'David Wilson',
      createdAt: '2025-07-21T13:20:00Z',
      fileSize: '678 KB',
      status: 'published'
    },
    {
      id: '6',
      title: 'Tortellini Client Onboarding',
      description: 'Step-by-step noodle for onboarding new enterprise clients.',
      content: 'Pre-Onboarding Preparation: Before the client starts...',
      tags: ['onboarding', 'process', 'clients'],
      createdBy: 'Emma Davis',
      createdAt: '2025-07-20T15:40:00Z',
      fileSize: '234 KB',
      status: 'published'
    }
  ];

  useEffect(() => {
    fetchNoodles();
  }, []);

  const fetchNoodles = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Try to fetch from API, fallback to sample data
      const response = await api.documents?.getDocuments?.() || sampleNoodles;
      setNoodles(Array.isArray(response) ? response : sampleNoodles);
    } catch (err) {
      console.error('Failed to fetch noodles:', err);
      // Use sample data as fallback
      setNoodles(sampleNoodles);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleTagFilter = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleCreateNoodle = () => {
    console.log('Create new noodle');
    // TODO: Navigate to noodle editor
  };

  const handleEditNoodle = (noodleId: string) => {
    console.log('Edit noodle:', noodleId);
    // TODO: Navigate to noodle editor
  };

  const handleViewNoodle = (noodleId: string) => {
    console.log('View noodle:', noodleId);
    // TODO: Navigate to noodle viewer
  };

  const handleDeleteNoodle = (noodleId: string) => {
    console.log('Delete noodle:', noodleId);
    // TODO: Show confirmation dialog and delete
  };

  const handleDownloadNoodle = (noodleId: string) => {
    console.log('Download noodle:', noodleId);
    // TODO: Download noodle as PDF
  };

  // Filter and sort noodles
  const filteredNoodles = noodles
    .filter(noodle => {
      const matchesSearch = noodle.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           noodle.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           noodle.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesTags = selectedTags.length === 0 || 
                         selectedTags.some(tag => noodle.tags.includes(tag));
      
      return matchesSearch && matchesTags;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'author':
          return a.createdBy.localeCompare(b.createdBy);
        case 'date':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  // Get all unique tags
  const allTags = Array.from(new Set(noodles.flatMap(noodle => noodle.tags)));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading noodles...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Noodles</h1>
          <p className="text-gray-600 mt-2">
            Manage and organize your enterprise noodles in The Pantry
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {filteredNoodles.length} noodle{filteredNoodles.length !== 1 ? 's' : ''} available
          </p>
        </div>
        
        <div className="flex space-x-3">
          <button 
            onClick={() => setShowUploadModal(true)}
            className="btn btn-secondary flex items-center space-x-2"
          >
            <Upload size={16} />
            <span>Upload</span>
          </button>
          <button 
            onClick={handleCreateNoodle}
            className="btn btn-primary flex items-center space-x-2"
          >
            <Plus size={16} />
            <span>New Noodle</span>
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <AlertCircle className="w-5 h-5 text-red-400 mr-2 mt-0.5" />
            <span className="text-sm text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search noodles by title, description, or tags..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <Grid3X3 size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <List size={16} />
            </button>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center space-x-2">
            <SortAsc size={16} className="text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'title' | 'date' | 'author')}
              className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="date">Sort by Date</option>
              <option value="title">Sort by Title</option>
              <option value="author">Sort by Author</option>
            </select>
          </div>
        </div>

        {/* Tag Filters */}
        {allTags.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-600 mr-2">Filter by tags:</span>
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => handleTagFilter(tag)}
                  className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                    selectedTags.includes(tag)
                      ? 'bg-blue-100 text-blue-800 border-blue-200'
                      : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
              {selectedTags.length > 0 && (
                <button
                  onClick={() => setSelectedTags([])}
                  className="px-3 py-1 text-xs text-red-600 hover:text-red-800"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Documents Grid/List */}
      {filteredNoodles.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No noodles found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || selectedTags.length > 0 
              ? 'Try adjusting your search or filters'
              : 'Get started by creating your first noodle'
            }
          </p>
          <button 
            onClick={handleCreateNoodle}
            className="btn btn-primary"
          >
            <Plus size={16} className="mr-2" />
            Create New Noodle
          </button>
        </div>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
        }>
          {filteredNoodles.map((noodle) => (
            <div 
              key={noodle.id} 
              className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
            >
              {viewMode === 'grid' ? (
                // Grid View
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                        {noodle.title}
                      </h3>
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(noodle.status)}`}>
                        {noodle.status}
                      </span>
                    </div>
                    <FileText className="w-8 h-8 text-blue-600 ml-3" />
                  </div>
                  
                  {noodle.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {noodle.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-1 mb-4">
                    {noodle.tags.map(tag => (
                      <span 
                        key={tag}
                        className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <User size={14} className="mr-1" />
                      {noodle.createdBy}
                    </div>
                    <div className="flex items-center">
                      <Calendar size={14} className="mr-1" />
                      {new Date(noodle.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="text-xs text-gray-500">{noodle.fileSize}</span>
                    <div className="flex space-x-1">
                      <button 
                        onClick={() => handleViewNoodle(noodle.id)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title="View noodle"
                      >
                        <Eye size={14} />
                      </button>
                      <button 
                        onClick={() => handleEditNoodle(noodle.id)}
                        className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                        title="Edit noodle"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button 
                        onClick={() => handleDownloadNoodle(noodle.id)}
                        className="p-2 text-gray-400 hover:text-purple-600 transition-colors"
                        title="Download noodle"
                      >
                        <Download size={14} />
                      </button>
                      <button 
                        onClick={() => handleDeleteNoodle(noodle.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete noodle"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                // List View
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <FileText className="w-10 h-10 text-blue-600" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {noodle.title}
                          </h3>
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(noodle.status)}`}>
                            {noodle.status}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm truncate">
                          {noodle.description}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                          <span>{noodle.createdBy}</span>
                          <span>{new Date(noodle.createdAt).toLocaleDateString()}</span>
                          <span>{noodle.fileSize}</span>
                          <div className="flex space-x-1">
                            {noodle.tags.slice(0, 3).map(tag => (
                              <span key={tag} className="px-1 py-0.5 bg-gray-100 rounded text-xs">
                                {tag}
                              </span>
                            ))}
                            {noodle.tags.length > 3 && (
                              <span className="text-gray-400">+{noodle.tags.length - 3}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1 ml-4">
                      <button 
                        onClick={() => handleViewNoodle(noodle.id)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title="View noodle"
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        onClick={() => handleEditNoodle(noodle.id)}
                        className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                        title="Edit noodle"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDownloadNoodle(noodle.id)}
                        className="p-2 text-gray-400 hover:text-purple-600 transition-colors"
                        title="Download noodle"
                      >
                        <Download size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteNoodle(noodle.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete noodle"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal Placeholder */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Upload Noodle</h3>
            <p className="text-gray-600 mb-4">
              Noodle upload functionality will be implemented in the next sprint.
            </p>
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setShowUploadModal(false)}
                className="btn btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}