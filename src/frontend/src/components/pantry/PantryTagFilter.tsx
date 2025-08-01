/**
 * PantryTagFilter Component - The Pantry Component Library
 * Professional tag filtering with search and selection capabilities
 */

import React, { useState, useRef, useEffect } from 'react';
import { X, Search, Tag, Plus, ChevronDown } from 'lucide-react';

interface PantryTagFilterProps {
  availableTags: string[];
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  placeholder?: string;
  maxVisibleTags?: number;
  allowCustomTags?: boolean;
  onCreateTag?: (tag: string) => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'inline' | 'dropdown';
  className?: string;
}

export const PantryTagFilter: React.FC<PantryTagFilterProps> = ({
  availableTags,
  selectedTags,
  onTagsChange,
  maxVisibleTags = 6,
  allowCustomTags = false,
  onCreateTag,
  size = 'md',
  variant = 'inline',
  className = ''
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAll, setShowAll] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTagToggle = (tag: string) => {
    const newSelectedTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    onTagsChange(newSelectedTags);
  };

  const handleCreateTag = () => {
    if (searchTerm.trim() && !availableTags.includes(searchTerm.trim()) && onCreateTag) {
      onCreateTag(searchTerm.trim());
      setSearchTerm('');
    }
  };

  const handleClearAll = () => {
    onTagsChange([]);
  };

  const filteredTags = availableTags.filter(tag =>
    tag.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const visibleTags = showAll ? availableTags : availableTags.slice(0, maxVisibleTags);

  const sizeClasses = {
    sm: {
      tag: 'px-2 py-1 text-xs',
      input: 'px-2 py-1 text-xs',
      button: 'px-2 py-1 text-xs'
    },
    md: {
      tag: 'px-3 py-1.5 text-sm',
      input: 'px-3 py-2 text-sm',
      button: 'px-3 py-2 text-sm'
    },
    lg: {
      tag: 'px-4 py-2 text-base',
      input: 'px-4 py-3 text-base', 
      button: 'px-4 py-3 text-base'
    }
  };

  const sizes = sizeClasses[size];

  if (variant === 'dropdown') {
    return (
      <div className={`pantry-tag-filter-dropdown relative ${className}`} ref={dropdownRef}>
        {/* Dropdown Trigger */}
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className={`
            flex items-center gap-2 border border-gray-300 rounded-lg bg-white
            hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500
            ${sizes.button}
          `}
        >
          <Tag size={16} className="text-gray-400" />
          <span className="text-gray-700">
            {selectedTags.length > 0 
              ? `${selectedTags.length} tag${selectedTags.length > 1 ? 's' : ''} selected`
              : 'Filter by tags'
            }
          </span>
          <ChevronDown size={16} className={`text-gray-400 transition-transform ${
            isDropdownOpen ? 'rotate-180' : ''
          }`} />
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-80 overflow-hidden">
            {/* Search */}
            <div className="p-3 border-b border-gray-200">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 border border-gray-300 rounded ${sizes.input} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>
            </div>

            {/* Selected Tags */}
            {selectedTags.length > 0 && (
              <div className="p-3 border-b border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Selected:</span>
                  <button
                    onClick={handleClearAll}
                    className="text-xs text-red-600 hover:text-red-800"
                  >
                    Clear all
                  </button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {selectedTags.map(tag => (
                    <span
                      key={tag}
                      className={`bg-blue-100 text-blue-800 border border-blue-200 rounded-full flex items-center gap-1 ${sizes.tag}`}
                    >
                      {tag}
                      <button
                        onClick={() => handleTagToggle(tag)}
                        className="hover:bg-blue-200 rounded-full p-0.5"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Available Tags */}
            <div className="max-h-48 overflow-y-auto">
              {filteredTags.length > 0 ? (
                <div className="p-3">
                  {filteredTags.map(tag => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        onClick={() => handleTagToggle(tag)}
                        className={`
                          w-full text-left px-3 py-2 rounded transition-colors mb-1
                          ${isSelected 
                            ? 'bg-blue-50 text-blue-700' 
                            : 'hover:bg-gray-50 text-gray-700'
                          }
                        `}
                      >
                        <div className="flex items-center justify-between">
                          <span>{tag}</span>
                          {isSelected && <X size={14} className="text-blue-600" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="p-3 text-center text-gray-500">
                  {searchTerm ? 'No matching tags found' : 'No tags available'}
                  {allowCustomTags && searchTerm && (
                    <button
                      onClick={handleCreateTag}
                      className="block w-full mt-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Plus size={14} className="inline mr-1" />
                      Create "{searchTerm}"
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Inline variant (default)
  return (
    <div className={`pantry-tag-filter-inline ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm font-medium text-gray-700">Filter by tags:</label>
        {selectedTags.length > 0 && (
          <button
            onClick={handleClearAll}
            className="text-xs text-red-600 hover:text-red-800"
          >
            Clear all ({selectedTags.length})
          </button>
        )}
      </div>

      {/* Search */}
      {availableTags.length > 8 && (
        <div className="relative mb-3">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 border border-gray-300 rounded-lg ${sizes.input} focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
        </div>
      )}

      {/* Tag Grid */}
      <div className="flex flex-wrap gap-2">
        {(searchTerm ? filteredTags : visibleTags).map(tag => {
          const isSelected = selectedTags.includes(tag);
          return (
            <button
              key={tag}
              onClick={() => handleTagToggle(tag)}
              className={`
                ${sizes.tag} rounded-full border transition-colors
                ${isSelected
                  ? 'bg-blue-100 text-blue-800 border-blue-200'
                  : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                }
              `}
            >
              <span>{tag}</span>
              {isSelected && <X size={12} className="inline ml-1" />}
            </button>
          );
        })}

        {/* Show More/Less Button */}
        {!searchTerm && availableTags.length > maxVisibleTags && (
          <button
            onClick={() => setShowAll(!showAll)}
            className={`${sizes.tag} rounded-full border-2 border-dashed border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-700`}
          >
            {showAll ? 'Show less' : `${availableTags.length - maxVisibleTags} more`}
          </button>
        )}

        {/* Create Custom Tag */}
        {allowCustomTags && searchTerm && !filteredTags.includes(searchTerm) && (
          <button
            onClick={handleCreateTag}
            className={`${sizes.tag} rounded-full border-2 border-dashed border-blue-300 text-blue-600 hover:border-blue-400 hover:bg-blue-50`}
          >
            <Plus size={12} className="inline mr-1" />
            Create "{searchTerm}"
          </button>
        )}
      </div>

      {/* Selected Tags Summary */}
      {selectedTags.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="text-xs text-gray-500 mb-2">Selected tags:</div>
          <div className="flex flex-wrap gap-1">
            {selectedTags.map(tag => (
              <span
                key={tag}
                className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs flex items-center gap-1"
              >
                {tag}
                <button
                  onClick={() => handleTagToggle(tag)}
                  className="hover:bg-blue-200 rounded-full p-0.5"
                >
                  <X size={10} />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PantryTagFilter;