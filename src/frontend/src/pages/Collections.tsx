import { useState, useEffect } from 'react';
import { 
  Plus, 
  Layers, 
  Search, 
  Grid3X3, 
  List, 
  Eye, 
  Edit3, 
  Trash2, 
  FileText,
  User,
  Calendar,
  Tag,
  Filter,
  AlertCircle
} from 'lucide-react';

// Import Pantry Design System components
import { 
  Card, 
  CardHeader, 
  CardContent 
} from '../components/pantry/Card';
import { Button } from '../components/pantry/Button';
import { Alert } from '../components/pantry/Alert';
import { Badge } from '../components/pantry/Badge';
import { Input } from '../components/pantry/Input';
import { PantryLoadingState } from '../components/pantry/PantryLoadingState';
import { PantrySearchBar } from '../components/pantry/PantrySearchBar';
import { PantryEmptyState } from '../components/pantry/PantryEmptyState';
import { PlateCard } from '../components/pantry/PlateCard';
import { 
  Plate, 
  PantrySearchFilters, 
  PlateCardActions 
} from '../components/pantry/types';

// Using Pantry types
type SearchFilters = PantrySearchFilters;

export default function Collections() {
  const [plates, setPlates] = useState<Plate[]>([]);
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
  const samplePlates: Plate[] = [
    {
      id: '1',
      name: 'Legal Contract Suite',
      description: 'Collection of various legal contracts and agreements for enterprise clients.',
      noodleIds: ['n1', 'n2', 'n3', 'n4', 'n5', 'n6', 'n7', 'n8', 'n9', 'n10', 'n11', 'n12'],
      tags: ['legal', 'contracts', 'enterprise'],
      createdBy: 'John Smith',
      createdAt: '2025-07-25T10:00:00Z',
      updatedAt: '2025-07-25T14:30:00Z',
      color: 'orange',
      isPublic: false
    },
    {
      id: '2',
      name: 'Product Documentation',
      description: 'Comprehensive product requirements and technical documentation collection.',
      noodleIds: ['n13', 'n14', 'n15', 'n16', 'n17', 'n18', 'n19', 'n20'],
      tags: ['product', 'technical', 'documentation'],
      createdBy: 'Sarah Johnson',
      createdAt: '2025-07-24T09:15:00Z',
      updatedAt: '2025-07-24T16:45:00Z',
      color: 'blue',
      isPublic: false
    },
    {
      id: '3',
      name: 'Marketing Materials',
      description: 'Strategic marketing documents, campaigns, and brand guidelines.',
      noodleIds: ['n21', 'n22', 'n23', 'n24', 'n25', 'n26', 'n27', 'n28', 'n29', 'n30', 'n31', 'n32', 'n33', 'n34', 'n35'],
      tags: ['marketing', 'branding', 'strategy'],
      createdBy: 'Mike Chen',
      createdAt: '2025-07-23T11:30:00Z',
      color: 'green',
      isPublic: true
    },
    {
      id: '4',
      name: 'HR Policies Archive',
      description: 'Employee handbooks, policies, and HR-related documentation.',
      noodleIds: ['n36', 'n37', 'n38', 'n39', 'n40', 'n41'],
      tags: ['hr', 'policies', 'employees'],
      createdBy: 'Lisa Brown',
      createdAt: '2025-07-22T08:00:00Z',
      updatedAt: '2025-07-23T12:00:00Z',
      color: 'neutral',
      isPublic: false
    },
    {
      id: '5',
      name: 'Client Onboarding Kit',
      description: 'Complete set of documents for onboarding new enterprise clients.',
      noodleIds: ['n42', 'n43', 'n44', 'n45', 'n46', 'n47', 'n48', 'n49', 'n50'],
      tags: ['onboarding', 'process', 'clients', 'enterprise'],
      createdBy: 'Emma Davis',
      createdAt: '2025-07-21T15:40:00Z',
      color: 'purple',
      isPublic: false
    },
    {
      id: '6',
      name: 'API Documentation Hub',
      description: 'Technical documentation, guides, and examples for platform APIs.',
      noodleIds: ['n51', 'n52', 'n53', 'n54', 'n55', 'n56', 'n57', 'n58', 'n59', 'n60', 'n61', 'n62', 'n63', 'n64', 'n65', 'n66', 'n67', 'n68'],
      tags: ['api', 'technical', 'development', 'guides'],
      createdBy: 'David Wilson',
      createdAt: '2025-07-20T13:20:00Z',
      updatedAt: '2025-07-21T09:15:00Z',
      color: 'indigo',
      isPublic: true
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
      const response = samplePlates; // TODO: Implement plates API
      setPlates(Array.isArray(response) ? response : samplePlates);
    } catch (err) {
      console.error('Failed to fetch plates:', err);
      setPlates(samplePlates);
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
    // TODO: Navigate to plate editor
  };

  const handleEditPlate = (plateId: string) => {
    console.log('Edit plate:', plateId);
    // TODO: Navigate to plate editor
  };

  const handleViewPlate = (plateId: string) => {
    console.log('View plate:', plateId);
    // TODO: Navigate to plate viewer
  };

  const handleDeletePlate = (plateId: string) => {
    console.log('Delete plate:', plateId);
    // TODO: Show confirmation dialog and delete
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

  // Format date helper
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Plate actions configuration
  const plateActions = {
    onView: handleViewPlate,
    onEdit: handleEditPlate,
    onDelete: handleDeletePlate,
    onAddNoodle: handleAddNoodle
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <PantryLoadingState 
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
        
        <Button 
          onClick={handleCreatePlate}
          variant="primary"
          className="flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white"
        >
          <Plus size={16} />
          <span>New Plate</span>
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="error" className="mb-4">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </Alert>
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
            type="no-search-results"
            searchTerm={filters.searchTerm}
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
              className="hover:shadow-md transition-shadow border-orange-200 hover:border-orange-300"
            />
          ))}
        </div>
      )}
    </div>
  );
}