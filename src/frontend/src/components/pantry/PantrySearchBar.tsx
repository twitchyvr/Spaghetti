/**
 * PantrySearchBar Component - The Pantry Component Library
 * Professional search bar with advanced filtering capabilities
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Search, X, Filter, SortAsc, Grid3X3, List, Table } from 'lucide-react';
import { PantrySearchFilters, ViewMode, SortBy, FilterBy } from './types';

interface PantrySearchBarProps {
  filters: PantrySearchFilters;
  onFiltersChange: (filters: PantrySearchFilters) => void;
  availableTags?: string[];
  placeholder?: string;
  showViewToggle?: boolean;
  showSortOptions?: boolean;
  showFilterOptions?: boolean;
  className?: string;
}

export const PantrySearchBar: React.FC<PantrySearchBarProps> = ({
  filters,
  onFiltersChange,
  availableTags = [],
  placeholder = "Search noodles and plates by title, description, or tags...",
  showViewToggle = true,
  showSortOptions = true,
  showFilterOptions = true,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const tagDropdownRef = useRef<HTMLDivElement>(null);

  // Close tag dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tagDropdownRef.current && !tagDropdownRef.current.contains(event.target as Node)) {
        setShowTagDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = useCallback((searchTerm: string) => {
    onFiltersChange({
      ...filters,
      searchTerm
    });
  }, [filters, onFiltersChange]);

  const handleTagToggle = useCallback((tag: string) => {
    const newSelectedTags = filters.selectedTags.includes(tag)
      ? filters.selectedTags.filter(t => t !== tag)
      : [...filters.selectedTags, tag];
    
    onFiltersChange({
      ...filters,
      selectedTags: newSelectedTags
    });
  }, [filters, onFiltersChange]);

  const handleClearSearch = useCallback(() => {
    onFiltersChange({
      ...filters,
      searchTerm: '',
      selectedTags: []
    });
    searchRef.current?.focus();
  }, [filters, onFiltersChange]);

  const handleViewModeChange = useCallback((viewMode: ViewMode) => {
    onFiltersChange({
      ...filters,
      viewMode
    });
  }, [filters, onFiltersChange]);

  const handleSortChange = useCallback((sortBy: SortBy) => {
    onFiltersChange({
      ...filters,
      sortBy
    });
  }, [filters, onFiltersChange]);

  const handleFilterChange = useCallback((filterBy: FilterBy) => {
    onFiltersChange({
      ...filters,
      filterBy
    });
  }, [filters, onFiltersChange]);

  const viewModeIcons = {
    grid: Grid3X3,
    list: List,
    table: Table
  };

  return (
    <div className={`pantry-search-bar bg-white rounded-lg shadow-sm border ${className}`}>
      {/* Main Search Row */}
      <div className="p-4">
        <div className="flex items-center gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              ref={searchRef}
              type="text"
              placeholder={placeholder}
              value={filters.searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {(filters.searchTerm || filters.selectedTags.length > 0) && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* View Mode Toggle */}
          {showViewToggle && (
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              {Object.entries(viewModeIcons).map(([mode, Icon]) => (
                <button
                  key={mode}
                  onClick={() => handleViewModeChange(mode as ViewMode)}
                  className={`p-2 rounded transition-colors ${
                    filters.viewMode === mode
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  title={`${mode} view`}
                >
                  <Icon size={16} />
                </button>
              ))}
            </div>
          )}

          {/* Sort Dropdown */}
          {showSortOptions && (
            <div className="flex items-center">
              <SortAsc size={16} className="text-gray-400 mr-2" />
              <select
                value={filters.sortBy}
                onChange={(e) => handleSortChange(e.target.value as SortBy)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="date">Sort by Date</option>
                <option value="title">Sort by Title</option>
                <option value="author">Sort by Author</option>
                <option value="status">Sort by Status</option>
              </select>
            </div>
          )}

          {/* Filter Options */}
          {showFilterOptions && (
            <div className="flex items-center">
              <select
                value={filters.filterBy}
                onChange={(e) => handleFilterChange(e.target.value as FilterBy)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="all">All Items</option>
                <option value="draft">Drafts Only</option>
                <option value="published">Published Only</option>
                <option value="archived">Archived Only</option>
              </select>
            </div>
          )}

          {/* Advanced Filters Toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`p-2 rounded-lg transition-colors ${
              isExpanded || filters.selectedTags.length > 0
                ? 'bg-blue-100 text-blue-600'
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
            }`}
            title="Advanced filters"
          >
            <Filter size={16} />
          </button>
        </div>
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-200">
          <div className="pt-4">
            {/* Tags Filter */}
            {availableTags.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-700">Filter by tags:</label>
                  {filters.selectedTags.length > 0 && (
                    <button
                      onClick={() => onFiltersChange({ ...filters, selectedTags: [] })}
                      className="text-xs text-red-600 hover:text-red-800"
                    >
                      Clear all tags
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map(tag => {
                    const isSelected = filters.selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        onClick={() => handleTagToggle(tag)}
                        className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                          isSelected
                            ? 'bg-blue-100 text-blue-800 border-blue-200'
                            : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                        }`}
                      >
                        {tag}
                        {isSelected && (
                          <X size={14} className="inline ml-1" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Active Filters Summary */}
      {(filters.selectedTags.length > 0 || filters.filterBy !== 'all') && (
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Active filters:</span>
            {filters.filterBy !== 'all' && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                {filters.filterBy}
              </span>
            )}
            {filters.selectedTags.map(tag => (
              <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                {tag}
                <button
                  onClick={() => handleTagToggle(tag)}
                  className="ml-1 hover:text-gray-900"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PantrySearchBar;