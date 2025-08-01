import { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Upload, AlertCircle } from 'lucide-react';
import { 
  NoodleCard, 
  PantrySearchBar, 
  PantryLoadingState, 
  PantryEmptyState,
  type Noodle,
  type NoodleCardActions,
  type PantrySearchFilters
} from '../components/pantry';


export default function Noodles() {
  const [noodles, setNoodles] = useState<Noodle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [filters, setFilters] = useState<PantrySearchFilters>({
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

  // Noodle card actions
  const noodleActions: NoodleCardActions = {
    onView: handleViewNoodle,
    onEdit: handleEditNoodle,
    onDownload: handleDownloadNoodle,
    onDelete: handleDeleteNoodle
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <PantryLoadingState 
          variant="skeleton" 
          message="Loading your delicious noodles..." 
          count={6}
        />
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

      {/* Search and Filters */}
      <PantrySearchBar
        filters={filters}
        onFiltersChange={setFilters}
        availableTags={allTags}
        placeholder="Search noodles by title, description, or tags..."
      />

      {/* Noodles Grid/List */}
      {filteredNoodles.length === 0 ? (
        filters.searchTerm || filters.selectedTags.length > 0 || filters.filterBy !== 'all' ? (
          <PantryEmptyState
            type={filters.searchTerm ? "no-search-results" : "no-filtered-results"}
            searchTerm={filters.searchTerm}
            filterCount={filters.selectedTags.length + (filters.filterBy !== 'all' ? 1 : 0)}
            onAction={() => setFilters({ searchTerm: '', selectedTags: [], sortBy: 'date', filterBy: 'all', viewMode: filters.viewMode })}
            onSecondaryAction={handleCreateNoodle}
            secondaryActionLabel="Create New Noodle"
          />
        ) : (
          <PantryEmptyState
            type="no-noodles"
            onAction={handleCreateNoodle}
            onSecondaryAction={() => setShowUploadModal(true)}
          />
        )
      ) : (
        <div className={
          filters.viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
        }>
          {filteredNoodles.map((noodle) => (
            <NoodleCard
              key={noodle.id}
              noodle={noodle}
              actions={noodleActions}
              viewMode={filters.viewMode}
              className="hover:shadow-md transition-shadow"
            />
          ))}
        </div>
      )}

      {/* Upload Modal Placeholder */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Upload Noodle</h3>
            <p className="text-gray-600 mb-4">
              Noodle upload functionality will be implemented in Phase 3 - The Kitchen.
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