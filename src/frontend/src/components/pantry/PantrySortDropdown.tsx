/**
 * PantrySortDropdown Component - The Pantry Component Library
 * Professional sort dropdown with customizable options
 */

import React from 'react';
import { SortAsc, SortDesc, ChevronDown } from 'lucide-react';
import { SortBy } from './types';

interface SortOption {
  value: SortBy;
  label: string;
  description?: string;
}

interface PantrySortDropdownProps {
  currentSort: SortBy;
  onSortChange: (sort: SortBy) => void;
  sortDirection?: 'asc' | 'desc';
  onSortDirectionChange?: (direction: 'asc' | 'desc') => void;
  options?: SortOption[];
  showDirection?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const defaultSortOptions: SortOption[] = [
  { value: 'date', label: 'Date Created', description: 'Most recent first' },
  { value: 'title', label: 'Title', description: 'Alphabetical order' },
  { value: 'author', label: 'Author', description: 'By creator name' },
  { value: 'status', label: 'Status', description: 'By publication status' }
];

export const PantrySortDropdown: React.FC<PantrySortDropdownProps> = ({
  currentSort,
  onSortChange,
  sortDirection = 'desc',
  onSortDirectionChange,
  options = defaultSortOptions,
  showDirection = true,
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-2 text-sm', 
    lg: 'px-4 py-3 text-base'
  };

  const currentOption = options.find(opt => opt.value === currentSort);
  const SortIcon = sortDirection === 'asc' ? SortAsc : SortDesc;

  return (
    <div className={`pantry-sort-dropdown flex items-center gap-2 ${className}`}>
      {/* Sort Icon */}
      <SortIcon size={16} className="text-gray-400 flex-shrink-0" />

      {/* Sort Dropdown */}
      <select
        value={currentSort}
        onChange={(e) => onSortChange(e.target.value as SortBy)}
        className={`
          border border-gray-300 rounded-lg bg-white focus:outline-none 
          focus:ring-2 focus:ring-blue-500 focus:border-transparent
          appearance-none pr-8 cursor-pointer
          ${sizeClasses[size]}
        `}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
          backgroundPosition: 'right 0.5rem center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: '1.5em 1.5em'
        }}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {/* Sort Direction Toggle */}
      {showDirection && onSortDirectionChange && (
        <button
          onClick={() => onSortDirectionChange(sortDirection === 'asc' ? 'desc' : 'asc')}
          className={`
            p-2 rounded-lg border border-gray-300 bg-white transition-colors
            hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500
            ${sortDirection === 'desc' ? 'text-blue-600' : 'text-gray-600'}
          `}
          title={`Sort ${sortDirection === 'asc' ? 'descending' : 'ascending'}`}
        >
          {sortDirection === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />}
        </button>
      )}
    </div>
  );
};

export default PantrySortDropdown;