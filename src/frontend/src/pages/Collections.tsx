import { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Layers, 
  Plus, 
  Search, 
  Edit3,
  Trash2,
  Eye,
  Calendar,
  User,
  Grid3X3,
  List,
  SortAsc,
  AlertCircle,
  Utensils
} from 'lucide-react';

interface Plate {
  id: string;
  name: string;
  description?: string;
  noodleCount: number;
  tags: string[];
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
  status: 'active' | 'archived';
}

export default function Collections() {
  const [plates, setPlates] = useState<Plate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'author'>('date');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Sample plate data
  const samplePlates: Plate[] = [
    {
      id: '1',
      name: 'Legal Contract Suite',
      description: 'Collection of various legal contracts and agreements for enterprise clients.',
      noodleCount: 12,
      tags: ['legal', 'contracts', 'enterprise'],
      createdBy: 'John Smith',
      createdAt: '2025-07-25T10:00:00Z',
      updatedAt: '2025-07-25T14:30:00Z',
      status: 'active'
    },
    {
      id: '2',
      name: 'Product Documentation',
      description: 'Comprehensive product requirements and technical documentation collection.',
      noodleCount: 8,
      tags: ['product', 'technical', 'documentation'],
      createdBy: 'Sarah Johnson',
      createdAt: '2025-07-24T09:15:00Z',
      updatedAt: '2025-07-24T16:45:00Z',
      status: 'active'
    },
    {
      id: '3',
      name: 'Marketing Materials',
      description: 'Strategic marketing documents, campaigns, and brand guidelines.',
      noodleCount: 15,
      tags: ['marketing', 'branding', 'strategy'],
      createdBy: 'Mike Chen',
      createdAt: '2025-07-23T11:30:00Z',
      status: 'active'
    },
    {
      id: '4',
      name: 'HR Policies Archive',
      description: 'Employee handbooks, policies, and HR-related documentation.',
      noodleCount: 6,
      tags: ['hr', 'policies', 'employees'],
      createdBy: 'Lisa Brown',
      createdAt: '2025-07-22T08:00:00Z',
      updatedAt: '2025-07-23T12:00:00Z',
      status: 'archived'
    }
  ];

  useEffect(() => {
    fetchPlates();
  }, []);

  const fetchPlates = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Try to fetch from API, fallback to sample data
      const response = await api.collections?.getCollections?.() || samplePlates;
      setPlates(Array.isArray(response) ? response : samplePlates);
    } catch (err) {
      console.error('Failed to fetch plates:', err);
      // Use sample data as fallback
      setPlates(samplePlates);
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

  const handleCreatePlate = () => {
    console.log('Create new plate');
  };

  const handleEditPlate = (plateId: string) => {
    console.log('Edit plate:', plateId);
  };

  const handleViewPlate = (plateId: string) => {
    console.log('View plate:', plateId);
  };

  const handleDeletePlate = (plateId: string) => {
    console.log('Delete plate:', plateId);
  };

  // Filter and sort plates
  const filteredPlates = plates
    .filter(plate => {
      const matchesSearch = plate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           plate.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           plate.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesTags = selectedTags.length === 0 || 
                         selectedTags.some(tag => plate.tags.includes(tag));
      
      return matchesSearch && matchesTags;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'author':
          return a.createdBy.localeCompare(b.createdBy);
        case 'date':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  // Get all unique tags
  const allTags = Array.from(new Set(plates.flatMap(plate => plate.tags)));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading plates...</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Plates</h1>
          <p className="text-gray-600 mt-2">
            Organize your noodles into collections in The Pantry
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {filteredPlates.length} plate{filteredPlates.length !== 1 ? 's' : ''} available
          </p>
        </div>
        
        <button 
          onClick={handleCreatePlate}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Plus size={16} />
          <span>New Plate</span>
        </button>
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
                placeholder="Search plates by name, description, or tags..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-orange-100 text-orange-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <Grid3X3 size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-orange-100 text-orange-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <List size={16} />
            </button>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center space-x-2">
            <SortAsc size={16} className="text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'date' | 'author')}
              className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="date">Sort by Date</option>
              <option value="name">Sort by Name</option>
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
                      ? 'bg-orange-100 text-orange-800 border-orange-200'
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

      {/* Plates Grid/List */}
      {filteredPlates.length === 0 ? (
        <div className="text-center py-12">
          <Layers className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No plates found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || selectedTags.length > 0 
              ? 'Try adjusting your search or filters'
              : 'Get started by creating your first plate'
            }
          </p>
          <button 
            onClick={handleCreatePlate}
            className="btn btn-primary"
          >
            <Plus size={16} className="mr-2" />
            Create New Plate
          </button>
        </div>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
        }>
          {filteredPlates.map((plate) => (
            <div 
              key={plate.id} 
              className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
            >
              {viewMode === 'grid' ? (
                // Grid View
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                        {plate.name}
                      </h3>
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(plate.status)}`}>
                        {plate.status}
                      </span>
                    </div>
                    <Layers className="w-8 h-8 text-orange-600 ml-3" />
                  </div>
                  
                  {plate.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {plate.description}
                    </p>
                  )}

                  <div className="flex items-center space-x-2 mb-4">
                    <Utensils size={14} className="text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {plate.noodleCount} noodle{plate.noodleCount !== 1 ? 's' : ''}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {plate.tags.map(tag => (
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
                      {plate.createdBy}
                    </div>
                    <div className="flex items-center">
                      <Calendar size={14} className="mr-1" />
                      {new Date(plate.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex items-center justify-end pt-4 border-t border-gray-100">
                    <div className="flex space-x-1">
                      <button 
                        onClick={() => handleViewPlate(plate.id)}
                        className="p-2 text-gray-400 hover:text-orange-600 transition-colors"
                        title="View plate"
                      >
                        <Eye size={14} />
                      </button>
                      <button 
                        onClick={() => handleEditPlate(plate.id)}
                        className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                        title="Edit plate"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button 
                        onClick={() => handleDeletePlate(plate.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete plate"
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
                      <Layers className="w-10 h-10 text-orange-600" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {plate.name}
                          </h3>
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(plate.status)}`}>
                            {plate.status}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm truncate">
                          {plate.description}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                          <span>{plate.createdBy}</span>
                          <span>{new Date(plate.createdAt).toLocaleDateString()}</span>
                          <span>{plate.noodleCount} noodles</span>
                          <div className="flex space-x-1">
                            {plate.tags.slice(0, 3).map(tag => (
                              <span key={tag} className="px-1 py-0.5 bg-gray-100 rounded text-xs">
                                {tag}
                              </span>
                            ))}
                            {plate.tags.length > 3 && (
                              <span className="text-gray-400">+{plate.tags.length - 3}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1 ml-4">
                      <button 
                        onClick={() => handleViewPlate(plate.id)}
                        className="p-2 text-gray-400 hover:text-orange-600 transition-colors"
                        title="View plate"
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        onClick={() => handleEditPlate(plate.id)}
                        className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                        title="Edit plate"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeletePlate(plate.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete plate"
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
    </div>
  );
}