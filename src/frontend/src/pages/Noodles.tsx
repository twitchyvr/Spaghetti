import { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Plus, 
  Upload, 
  FileText, 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  Download, 
  Edit3, 
  Trash2, 
  Eye, 
  Tag,
  User,
  Calendar,
  Clock,
  X
} from 'lucide-react';

// Import new Pantry Design System components
import { 
  Card, 
  CardHeader, 
  CardContent 
} from '../components/pantry/Card';
import { Button } from '../components/pantry/Button';
import { Alert } from '../components/pantry/Alert';
import { Badge } from '../components/pantry/Badge';
import { Input } from '../components/pantry/Input';


// Types
interface Noodle {
  id: string;
  title: string;
  description: string;
  content: string;
  tags: string[];
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
  fileSize: string;
  status: 'draft' | 'published' | 'archived';
}

interface SearchFilters {
  searchTerm: string;
  selectedTags: string[];
  sortBy: 'date' | 'title' | 'author' | 'status';
  filterBy: 'all' | 'draft' | 'published' | 'archived';
  viewMode: 'grid' | 'list';
}

export default function Noodles() {
  const [noodles, setNoodles] = useState<Noodle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    searchTerm: '',
    selectedTags: [],
    sortBy: 'date',
    filterBy: 'all',
    viewMode: 'grid'
  });

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
      const matchesSearch = noodle.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                           noodle.description?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                           noodle.tags.some(tag => tag.toLowerCase().includes(filters.searchTerm.toLowerCase()));
      
      const matchesTags = filters.selectedTags.length === 0 || 
                         filters.selectedTags.some(tag => noodle.tags.includes(tag));
      
      const matchesFilter = filters.filterBy === 'all' || noodle.status === filters.filterBy;
      
      return matchesSearch && matchesTags && matchesFilter;
    })
    .sort((a, b) => {
      switch (filters.sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'author':
          return a.createdBy.localeCompare(b.createdBy);
        case 'status':
          return a.status.localeCompare(b.status);
        case 'date':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  // Get all unique tags
  const allTags = Array.from(new Set(noodles.flatMap(noodle => noodle.tags)));

  // Format date helper
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get status color
  const getStatusColor = (status: Noodle['status']) => {
    switch (status) {
      case 'published':
        return 'success';
      case 'draft':
        return 'warning';
      case 'archived':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  // Modern NoodleCard component using Pantry design system
  const NoodleCardComponent = ({ 
    noodle, 
    viewMode, 
    onView, 
    onEdit, 
    onDownload, 
    onDelete 
  }: {
    noodle: Noodle;
    viewMode: 'grid' | 'list';
    onView: (id: string) => void;
    onEdit: (id: string) => void;
    onDownload: (id: string) => void;
    onDelete: (id: string) => void;
  }) => {
    if (viewMode === 'list') {
      return (
        <Card className="p-6 hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-start justify-between gap-6">
            <div className="flex items-start gap-4 flex-1 min-w-0">
              <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-xl flex-shrink-0">
                <FileText className="w-6 h-6 text-orange-600" />
              </div>
              
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-lg font-semibold text-neutral-900 hover:text-orange-600 cursor-pointer truncate"
                      onClick={() => onView(noodle.id)}>
                    {noodle.title}
                  </h3>
                  <Badge variant={getStatusColor(noodle.status) as any}>
                    {noodle.status}
                  </Badge>
                </div>
                
                <p className="text-neutral-600 text-sm line-clamp-2">
                  {noodle.description}
                </p>
                
                <div className="flex items-center gap-4 text-xs text-neutral-500">
                  <span className="flex items-center gap-1">
                    <User size={12} />
                    {noodle.createdBy}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    {formatDate(noodle.createdAt)}
                  </span>
                  <span>{noodle.fileSize}</span>
                </div>
                
                <div className="flex items-center gap-2 flex-wrap">
                  {noodle.tags.map(tag => (
                    <Badge key={tag} variant="secondary" size="sm">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => onView(noodle.id)}
                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                title="View"
              >
                <Eye size={16} className="text-neutral-600" />
              </button>
              <button
                onClick={() => onEdit(noodle.id)}
                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                title="Edit"
              >
                <Edit3 size={16} className="text-neutral-600" />
              </button>
              <button
                onClick={() => onDownload(noodle.id)}
                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                title="Download"
              >
                <Download size={16} className="text-neutral-600" />
              </button>
              <button
                onClick={() => onDelete(noodle.id)}
                className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                title="Delete"
              >
                <Trash2 size={16} className="text-red-600" />
              </button>
            </div>
          </div>
        </Card>
      );
    }

    return (
      <Card className="p-6 hover:shadow-lg transition-shadow duration-200 h-full">
        <div className="flex flex-col h-full space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-xl">
              <FileText className="w-6 h-6 text-orange-600" />
            </div>
            <Badge variant={getStatusColor(noodle.status) as any}>
              {noodle.status}
            </Badge>
          </div>
          
          <div className="flex-1 space-y-3">
            <h3 className="text-lg font-semibold text-neutral-900 hover:text-orange-600 cursor-pointer line-clamp-2"
                onClick={() => onView(noodle.id)}>
              {noodle.title}
            </h3>
            
            <p className="text-neutral-600 text-sm line-clamp-3">
              {noodle.description}
            </p>
            
            <div className="flex items-center gap-2 flex-wrap">
              {noodle.tags.slice(0, 3).map(tag => (
                <Badge key={tag} variant="secondary" size="sm">
                  {tag}
                </Badge>
              ))}
              {noodle.tags.length > 3 && (
                <Badge variant="secondary" size="sm">
                  +{noodle.tags.length - 3}
                </Badge>
              )}
            </div>
          </div>
          
          <div className="space-y-3 pt-3 border-t border-neutral-100">
            <div className="flex items-center justify-between text-xs text-neutral-500">
              <span className="flex items-center gap-1">
                <User size={12} />
                {noodle.createdBy}
              </span>
              <span>{noodle.fileSize}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <button
                onClick={() => onView(noodle.id)}
                className="flex-1 p-2 text-sm text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Eye size={14} />
                View
              </button>
              <button
                onClick={() => onEdit(noodle.id)}
                className="flex-1 p-2 text-sm text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Edit3 size={14} />
                Edit
              </button>
              <button
                onClick={() => onDownload(noodle.id)}
                className="p-2 text-sm text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                title="Download"
              >
                <Download size={14} />
              </button>
              <button
                onClick={() => onDelete(noodle.id)}
                className="p-2 text-sm text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                title="Delete"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center w-16 h-16 bg-orange-100 rounded-2xl mx-auto">
              <FileText className="w-8 h-8 text-orange-600 animate-pulse" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-neutral-900">Loading your delicious noodles...</h3>
              <p className="text-neutral-600">Please wait while we fetch your documents</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-xl">
              <FileText className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">Noodles</h1>
              <p className="text-neutral-600 text-lg">
                Manage and organize your enterprise documents in The Pantry
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-neutral-500">
            <span className="flex items-center gap-2">
              <FileText size={16} />
              {filteredNoodles.length} noodle{filteredNoodles.length !== 1 ? 's' : ''} available
            </span>
            <span className="flex items-center gap-2">
              <Tag size={16} />
              {allTags.length} tags
            </span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <Button 
            variant="secondary" 
            icon={<Upload size={16} />}
            onClick={() => setShowUploadModal(true)}
          >
            Upload
          </Button>
          <Button 
            variant="primary" 
            icon={<Plus size={16} />}
            onClick={handleCreateNoodle}
          >
            New Noodle
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="error" dismissible>
          {error}
        </Alert>
      )}

      {/* Search and Filters */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <Input
                  type="text"
                  placeholder="Search noodles by title, description, or tags..."
                  value={filters.searchTerm}
                  onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as SearchFilters['sortBy'] })}
                className="border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="date">Sort by Date</option>
                <option value="title">Sort by Title</option>
                <option value="author">Sort by Author</option>
                <option value="status">Sort by Status</option>
              </select>
              
              <select
                value={filters.filterBy}
                onChange={(e) => setFilters({ ...filters, filterBy: e.target.value as SearchFilters['filterBy'] })}
                className="border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
              
              <div className="flex border border-neutral-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setFilters({ ...filters, viewMode: 'grid' })}
                  className={`p-2 ${filters.viewMode === 'grid' 
                    ? 'bg-orange-100 text-orange-600' 
                    : 'bg-white text-neutral-600 hover:bg-neutral-50'}`}
                >
                  <Grid3X3 size={16} />
                </button>
                <button
                  onClick={() => setFilters({ ...filters, viewMode: 'list' })}
                  className={`p-2 ${filters.viewMode === 'list' 
                    ? 'bg-orange-100 text-orange-600' 
                    : 'bg-white text-neutral-600 hover:bg-neutral-50'}`}
                >
                  <List size={16} />
                </button>
              </div>
            </div>
          </div>
          
          {/* Selected Filters */}
          {(filters.selectedTags.length > 0 || filters.filterBy !== 'all') && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-neutral-600">Active filters:</span>
              {filters.filterBy !== 'all' && (
                <button 
                  className="inline-flex items-center px-2.5 py-1 text-sm bg-neutral-100 text-neutral-600 border border-neutral-200 rounded-full hover:bg-neutral-200"
                  onClick={() => setFilters({ ...filters, filterBy: 'all' })}
                >
                  Status: {filters.filterBy}
                  <X size={14} className="ml-1" />
                </button>
              )}
              {filters.selectedTags.map(tag => (
                <button 
                  key={tag} 
                  className="inline-flex items-center px-2.5 py-1 text-sm bg-neutral-100 text-neutral-600 border border-neutral-200 rounded-full hover:bg-neutral-200"
                  onClick={() => setFilters({ 
                    ...filters, 
                    selectedTags: filters.selectedTags.filter(t => t !== tag) 
                  })}
                >
                  {tag}
                  <X size={14} className="ml-1" />
                </button>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Noodles Grid/List */}
      {filteredNoodles.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center space-y-6 max-w-md mx-auto">
            <div className="flex items-center justify-center w-20 h-20 bg-neutral-100 rounded-2xl">
              {filters.searchTerm || filters.selectedTags.length > 0 || filters.filterBy !== 'all' ? (
                <Search className="w-10 h-10 text-neutral-400" />
              ) : (
                <FileText className="w-10 h-10 text-neutral-400" />
              )}
            </div>
            
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-neutral-900">
                {filters.searchTerm || filters.selectedTags.length > 0 || filters.filterBy !== 'all'
                  ? 'No matching noodles found'
                  : 'No noodles yet'}
              </h3>
              <p className="text-neutral-600">
                {filters.searchTerm || filters.selectedTags.length > 0 || filters.filterBy !== 'all'
                  ? 'Try adjusting your search or filters to find what you\'re looking for.'
                  : 'Get started by creating your first noodle or uploading existing documents.'}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              {filters.searchTerm || filters.selectedTags.length > 0 || filters.filterBy !== 'all' ? (
                <Button 
                  variant="primary" 
                  onClick={() => setFilters({ searchTerm: '', selectedTags: [], sortBy: 'date', filterBy: 'all', viewMode: filters.viewMode })}
                  className="w-full sm:w-auto"
                >
                  Clear Filters
                </Button>
              ) : (
                <>
                  <Button 
                    variant="primary" 
                    icon={<Plus size={20} />}
                    onClick={handleCreateNoodle}
                    className="w-full sm:w-auto"
                  >
                    Create First Noodle
                  </Button>
                  <Button 
                    variant="secondary" 
                    icon={<Upload size={20} />}
                    onClick={() => setShowUploadModal(true)}
                    className="w-full sm:w-auto"
                  >
                    Upload Documents
                  </Button>
                </>
              )}
            </div>
          </div>
        </Card>
      ) : (
        <div className={
          filters.viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
        }>
          {filteredNoodles.map((noodle) => (
            <NoodleCardComponent
              key={noodle.id}
              noodle={noodle}
              viewMode={filters.viewMode}
              onView={handleViewNoodle}
              onEdit={handleEditNoodle}
              onDownload={handleDownloadNoodle}
              onDelete={handleDeleteNoodle}
            />
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="max-w-md w-full mx-4 p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 bg-orange-100 rounded-lg">
                  <Upload className="w-5 h-5 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900">Upload Noodle</h3>
              </div>
              <p className="text-neutral-600">
                Noodle upload functionality will be implemented in Phase 3 - The Kitchen.
              </p>
              <div className="flex justify-end gap-3">
                <Button 
                  variant="secondary" 
                  onClick={() => setShowUploadModal(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}