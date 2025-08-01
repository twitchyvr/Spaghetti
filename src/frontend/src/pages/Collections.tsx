import { useState, useEffect } from 'react';
import { Plus, AlertCircle } from 'lucide-react';
import { 
  PlateCard, 
  PantrySearchBar, 
  PantryLoadingState, 
  PantryEmptyState,
  type Plate as PantryPlate,
  type PlateCardActions,
  type PantrySearchFilters
} from '../components/pantry';

// Convert legacy Plate to PantryPlate format
interface LegacyPlate {
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
  const [plates, setPlates] = useState<PantryPlate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<PantrySearchFilters>({
    searchTerm: '',
    selectedTags: [],
    sortBy: 'date',
    filterBy: 'all',
    viewMode: 'grid'
  });

  // Sample plate data
  const sampleLegacyPlates: LegacyPlate[] = [
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
      const response = sampleLegacyPlates; // TODO: Implement collections API
      const legacyPlates = Array.isArray(response) ? response : sampleLegacyPlates;
      
      // Convert to PantryPlate format
      const pantryPlates: PantryPlate[] = legacyPlates.map(plate => ({
        id: plate.id,
        name: plate.name,
        description: plate.description || undefined,
        noodleIds: Array.from({ length: plate.noodleCount }, (_, i) => `noodle-${plate.id}-${i}`),
        tags: plate.tags,
        createdBy: plate.createdBy,
        createdAt: plate.createdAt,
        updatedAt: plate.updatedAt || undefined,
        isPublic: plate.status === 'active',
        color: 'orange'
      }));
      
      setPlates(pantryPlates);
    } catch (err) {
      console.error('Failed to fetch plates:', err);
      // Use sample data as fallback
      const pantryPlates: PantryPlate[] = sampleLegacyPlates.map(plate => ({
        id: plate.id,
        name: plate.name,
        description: plate.description || undefined,
        noodleIds: Array.from({ length: plate.noodleCount }, (_, i) => `noodle-${plate.id}-${i}`),
        tags: plate.tags,
        createdBy: plate.createdBy,
        createdAt: plate.createdAt,
        updatedAt: plate.updatedAt || undefined,
        isPublic: plate.status === 'active',
        color: 'orange'
      }));
      setPlates(pantryPlates);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNoodle = (plateId: string) => {
    console.log('Add noodle to plate:', plateId);
    // TODO: Navigate to noodle selector or create new noodle
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
      const matchesSearch = plate.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                           plate.description?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                           plate.tags.some(tag => tag.toLowerCase().includes(filters.searchTerm.toLowerCase()));
      
      const matchesTags = filters.selectedTags.length === 0 || 
                         filters.selectedTags.some(tag => plate.tags.includes(tag));
      
      const matchesFilter = filters.filterBy === 'all' || 
                           (filters.filterBy === 'published' && plate.isPublic) ||
                           (filters.filterBy === 'draft' && !plate.isPublic);
      
      return matchesSearch && matchesTags && matchesFilter;
    })
    .sort((a, b) => {
      switch (filters.sortBy) {
        case 'title':
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

  // Plate card actions
  const plateActions: PlateCardActions = {
    onView: handleViewPlate,
    onEdit: handleEditPlate,
    onDelete: handleDeletePlate,
    onAddNoodle: handleAddNoodle
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <PantryLoadingState 
          variant="skeleton" 
          message="Loading your delicious plates..." 
          count={4}
        />
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

      {/* Search and Filters */}
      <PantrySearchBar
        filters={filters}
        onFiltersChange={setFilters}
        availableTags={allTags}
        placeholder="Search plates by name, description, or tags..."
      />

      {/* Plates Grid/List */}
      {filteredPlates.length === 0 ? (
        filters.searchTerm || filters.selectedTags.length > 0 || filters.filterBy !== 'all' ? (
          <PantryEmptyState
            type={filters.searchTerm ? "no-search-results" : "no-filtered-results"}
            searchTerm={filters.searchTerm}
            filterCount={filters.selectedTags.length + (filters.filterBy !== 'all' ? 1 : 0)}
            onAction={() => setFilters({ searchTerm: '', selectedTags: [], sortBy: 'date', filterBy: 'all', viewMode: filters.viewMode })}
            onSecondaryAction={handleCreatePlate}
            secondaryActionLabel="Create New Plate"
          />
        ) : (
          <PantryEmptyState
            type="no-plates"
            onAction={handleCreatePlate}
          />
        )
      ) : (
        <div className={
          filters.viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
        }>
          {filteredPlates.map((plate) => (
            <PlateCard
              key={plate.id}
              plate={plate}
              actions={plateActions}
              noodleCount={plate.noodleIds?.length || 0}
              viewMode={filters.viewMode}
              className="hover:shadow-md transition-shadow"
            />
          ))}
        </div>
      )}
    </div>
  );
}