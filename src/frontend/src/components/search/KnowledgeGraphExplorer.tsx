import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Maximize2, 
  Download, 
  Share2, 
  Eye, 
  FileText,
  Users,
  Building,
  Calendar,
  Tag,
  Zap,
  Brain
} from 'lucide-react';

interface GraphNode {
  id: string;
  label: string;
  type: 'document' | 'person' | 'organization' | 'concept' | 'date' | 'tag';
  properties: Record<string, any>;
  relevanceScore: number;
}

interface GraphEdge {
  id: string;
  from: string;
  to: string;
  label: string;
  type: 'contains' | 'authored_by' | 'related_to' | 'mentions' | 'part_of' | 'collaborates_with';
  weight: number;
}

interface SearchResult {
  nodes: GraphNode[];
  edges: GraphEdge[];
  query: string;
  totalResults: number;
}

const KnowledgeGraphExplorer: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const nodeTypes = [
    { id: 'all', label: 'All Types', icon: Eye, color: '#6B7280' },
    { id: 'document', label: 'Documents', icon: FileText, color: '#3B82F6' },
    { id: 'person', label: 'People', icon: Users, color: '#10B981' },
    { id: 'organization', label: 'Organizations', icon: Building, color: '#F59E0B' },
    { id: 'concept', label: 'Concepts', icon: Brain, color: '#8B5CF6' },
    { id: 'date', label: 'Dates', icon: Calendar, color: '#EF4444' },
    { id: 'tag', label: 'Tags', icon: Tag, color: '#06B6D4' }
  ];

  // Mock knowledge graph data
  const mockGraphData: SearchResult = {
    query: 'legal contracts',
    totalResults: 47,
    nodes: [
      {
        id: '1',
        label: 'Service Agreement 2024',
        type: 'document',
        properties: { created: '2024-01-15', size: '15 pages', status: 'active' },
        relevanceScore: 0.95
      },
      {
        id: '2',
        label: 'John Smith',
        type: 'person',
        properties: { role: 'Legal Counsel', department: 'Legal' },
        relevanceScore: 0.87
      },
      {
        id: '3',
        label: 'Acme Corporation',
        type: 'organization',
        properties: { type: 'Client', industry: 'Technology' },
        relevanceScore: 0.83
      },
      {
        id: '4',
        label: 'Data Protection',
        type: 'concept',
        properties: { category: 'Compliance', frequency: 23 },
        relevanceScore: 0.79
      },
      {
        id: '5',
        label: 'NDA Template',
        type: 'document',
        properties: { created: '2023-11-20', size: '8 pages', status: 'template' },
        relevanceScore: 0.75
      },
      {
        id: '6',
        label: 'GDPR Compliance',
        type: 'concept',
        properties: { category: 'Regulation', frequency: 45 },
        relevanceScore: 0.72
      },
      {
        id: '7',
        label: 'Sarah Johnson',
        type: 'person',
        properties: { role: 'Senior Partner', department: 'Legal' },
        relevanceScore: 0.68
      },
      {
        id: '8',
        label: '2024-Q1',
        type: 'date',
        properties: { period: 'Quarter', documents: 15 },
        relevanceScore: 0.65
      }
    ],
    edges: [
      { id: 'e1', from: '2', to: '1', label: 'authored', type: 'authored_by', weight: 0.9 },
      { id: 'e2', from: '1', to: '3', label: 'involves', type: 'mentions', weight: 0.8 },
      { id: 'e3', from: '1', to: '4', label: 'contains', type: 'contains', weight: 0.7 },
      { id: 'e4', from: '4', to: '6', label: 'related to', type: 'related_to', weight: 0.85 },
      { id: 'e5', from: '2', to: '7', label: 'collaborates with', type: 'collaborates_with', weight: 0.6 },
      { id: 'e6', from: '1', to: '8', label: 'created in', type: 'part_of', weight: 0.5 },
      { id: 'e7', from: '5', to: '4', label: 'contains', type: 'contains', weight: 0.7 }
    ]
  };

  const getNodeColor = (type: string): string => {
    const colors = {
      document: '#3B82F6',
      person: '#10B981',
      organization: '#F59E0B',
      concept: '#8B5CF6',
      date: '#EF4444',
      tag: '#06B6D4'
    };
    return colors[type as keyof typeof colors] || '#6B7280';
  };

  const performSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setSelectedNode(null);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Return mock data for now
    setSearchResults({
      ...mockGraphData,
      query: searchQuery
    });

    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      performSearch();
    }
  };

  const exportGraph = () => {
    // Simplified export functionality
    console.log('Export graph functionality would be implemented here');
  };

  const resetView = () => {
    // Reset view functionality
    console.log('Reset view functionality would be implemented here');
  };

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50' : 'h-screen'} bg-gray-50 flex flex-col`}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Zap className="h-6 w-6 text-indigo-600 mr-2" />
              <h1 className="text-xl font-semibold text-gray-900">Knowledge Graph Explorer</h1>
            </div>
            
            {/* Search */}
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Search knowledge graph..."
                  className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <button
                onClick={performSearch}
                disabled={isLoading}
                className={`px-4 py-2 bg-indigo-600 text-white rounded-lg transition-colors ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-700'
                }`}
              >
                {isLoading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </button>
            <button
              onClick={exportGraph}
              className="flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Maximize2 className="h-4 w-4 mr-2" />
              {isFullscreen ? 'Exit' : 'Fullscreen'}
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">Filter by type:</span>
              <div className="flex flex-wrap gap-2">
                {nodeTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setFilterType(type.id)}
                      className={`flex items-center px-3 py-1 text-sm rounded-full transition-colors ${
                        filterType === type.id
                          ? 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                          : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="h-3 w-3 mr-1" style={{ color: type.color }} />
                      {type.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 flex">
        {/* Graph Visualization */}
        <div className="flex-1 relative">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
              <div className="flex items-center">
                <Brain className="h-8 w-8 text-indigo-600 animate-pulse mr-3" />
                <div className="text-lg text-gray-600">
                  Building knowledge graph...
                </div>
              </div>
            </div>
          ) : searchResults ? (
            <div className="w-full h-full p-6 overflow-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {searchResults.nodes
                  .filter(node => filterType === 'all' || node.type === filterType)
                  .map((node) => {
                    const nodeTypeConfig = nodeTypes.find(nt => nt.id === node.type);
                    const Icon = nodeTypeConfig?.icon || FileText;
                    return (
                      <div
                        key={node.id}
                        onClick={() => setSelectedNode(node)}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedNode?.id === node.id
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div 
                            className="p-2 rounded-lg"
                            style={{ 
                              backgroundColor: `${nodeTypeConfig?.color || '#6B7280'}15`,
                              color: nodeTypeConfig?.color || '#6B7280'
                            }}
                          >
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-gray-900 truncate">
                              {node.label}
                            </h3>
                            <p className="text-xs text-gray-500 capitalize mb-2">
                              {node.type}
                            </p>
                            <div className="flex items-center">
                              <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div 
                                  className="bg-indigo-600 h-1.5 rounded-full"
                                  style={{ width: `${node.relevanceScore * 100}%` }}
                                ></div>
                              </div>
                              <span className="ml-2 text-xs text-gray-500">
                                {(node.relevanceScore * 100).toFixed(0)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
              
              {/* Connections Overview */}
              <div className="mt-6 bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  Node Connections ({searchResults.edges.length})
                </h3>
                <div className="space-y-2">
                  {searchResults.edges.slice(0, 5).map((edge) => {
                    const fromNode = searchResults.nodes.find(n => n.id === edge.from);
                    const toNode = searchResults.nodes.find(n => n.id === edge.to);
                    return (
                      <div key={edge.id} className="flex items-center text-sm text-gray-600">
                        <span className="font-medium">{fromNode?.label}</span>
                        <span className="mx-2 text-gray-400">→</span>
                        <span className="font-medium">{toNode?.label}</span>
                        <span className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded">
                          {edge.label}
                        </span>
                      </div>
                    );
                  })}
                  {searchResults.edges.length > 5 && (
                    <div className="text-xs text-gray-500">
                      +{searchResults.edges.length - 5} more connections
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Search Knowledge Graph
                </h3>
                <p className="text-gray-600 mb-4">
                  Enter a search term to explore document relationships and connections
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('legal contracts');
                    performSearch();
                  }}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Try Example Search
                </button>
              </div>
            </div>
          )}

          {/* Graph Controls */}
          {searchResults && (
            <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3">
              <div className="flex items-center space-x-2">
                <button
                  onClick={resetView}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                >
                  Reset View
                </button>
                <div className="text-sm text-gray-600">
                  {searchResults.nodes.length} nodes, {searchResults.edges.length} connections
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Node Details Panel */}
        {selectedNode && (
          <div className="w-80 bg-white border-l border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Node Details</h3>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {/* Node Type and Label */}
              <div>
                <div className="flex items-center mb-2">
                  <div 
                    className="w-4 h-4 rounded mr-2"
                    style={{ backgroundColor: getNodeColor(selectedNode.type) }}
                  ></div>
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {selectedNode.type}
                  </span>
                </div>
                <h4 className="text-xl font-semibold text-gray-900">{selectedNode.label}</h4>
              </div>

              {/* Relevance Score */}
              <div>
                <span className="text-sm font-medium text-gray-700">Relevance Score:</span>
                <div className="flex items-center mt-1">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-indigo-600 h-2 rounded-full"
                      style={{ width: `${selectedNode.relevanceScore * 100}%` }}
                    ></div>
                  </div>
                  <span className="ml-2 text-sm text-gray-600">
                    {(selectedNode.relevanceScore * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              {/* Properties */}
              <div>
                <span className="text-sm font-medium text-gray-700 block mb-2">Properties:</span>
                <div className="space-y-2">
                  {Object.entries(selectedNode.properties).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-gray-600 capitalize">{key.replace('_', ' ')}:</span>
                      <span className="text-gray-900 font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-gray-200">
                <div className="space-y-2">
                  <button className="w-full flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </button>
                  <button className="w-full flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Node
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Search Results Summary */}
      {searchResults && (
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Found <span className="font-semibold">{searchResults.totalResults}</span> results 
              for "<span className="font-semibold">{searchResults.query}</span>"
              {filterType !== 'all' && (
                <span> (filtered by {filterType})</span>
              )}
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>Click nodes for details</span>
              <span>•</span>
              <span>Use filters to refine results</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeGraphExplorer;