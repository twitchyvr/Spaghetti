/**
 * PantryEmptyState Component - The Pantry Component Library
 * Professional empty state with various scenarios and call-to-action buttons
 */

import React from 'react';
import { 
  FileText, 
  FolderOpen, 
  Search, 
  Plus, 
  Upload,
  Filter,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

type EmptyStateType = 
  | 'no-noodles' 
  | 'no-plates' 
  | 'no-search-results' 
  | 'no-filtered-results'
  | 'error'
  | 'loading-failed';

interface PantryEmptyStateProps {
  type: EmptyStateType;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  searchTerm?: string;
  filterCount?: number;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const PantryEmptyState: React.FC<PantryEmptyStateProps> = ({
  type,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  searchTerm,
  filterCount = 0,
  showIcon = true,
  size = 'md',
  className = ''
}) => {
  const emptyStateConfigs = {
    'no-noodles': {
      icon: FileText,
      defaultTitle: 'No noodles in The Pantry',
      defaultDescription: 'Start cooking up your first noodle to organize your documents and content.',
      defaultActionLabel: 'Create New Noodle',
      defaultSecondaryActionLabel: 'Upload Noodle',
      iconColor: 'text-blue-500',
      bgColor: 'bg-blue-50'
    },
    'no-plates': {
      icon: FolderOpen,
      defaultTitle: 'No plates created yet',
      defaultDescription: 'Organize your noodles into plates to create beautiful collections and workflows.',
      defaultActionLabel: 'Create New Plate',
      defaultSecondaryActionLabel: null,
      iconColor: 'text-purple-500',
      bgColor: 'bg-purple-50'
    },
    'no-search-results': {
      icon: Search,
      defaultTitle: searchTerm ? `No results for "${searchTerm}"` : 'No search results',
      defaultDescription: searchTerm 
        ? 'Try adjusting your search terms or browse all available noodles and plates.'
        : 'Enter a search term to find noodles and plates.',
      defaultActionLabel: 'Clear Search',
      defaultSecondaryActionLabel: 'Browse All',
      iconColor: 'text-gray-500',
      bgColor: 'bg-gray-50'
    },
    'no-filtered-results': {
      icon: Filter,
      defaultTitle: 'No items match your filters',
      defaultDescription: `${filterCount > 0 ? `${filterCount} filter${filterCount > 1 ? 's' : ''} applied. ` : ''}Try removing some filters to see more results.`,
      defaultActionLabel: 'Clear Filters',
      defaultSecondaryActionLabel: 'Reset All',
      iconColor: 'text-orange-500',
      bgColor: 'bg-orange-50'
    },
    'error': {
      icon: AlertCircle,
      defaultTitle: 'Something went wrong',
      defaultDescription: 'We encountered an error loading your content. Please try again.',
      defaultActionLabel: 'Try Again',
      defaultSecondaryActionLabel: 'Refresh Page',
      iconColor: 'text-red-500',
      bgColor: 'bg-red-50'
    },
    'loading-failed': {
      icon: RefreshCw,
      defaultTitle: 'Failed to load content',
      defaultDescription: 'There was a problem loading your noodles and plates. Check your connection and try again.',
      defaultActionLabel: 'Retry',
      defaultSecondaryActionLabel: 'Go to Dashboard',
      iconColor: 'text-yellow-500',
      bgColor: 'bg-yellow-50'
    }
  };

  const sizeClasses = {
    sm: {
      container: 'py-8',
      icon: 48,
      title: 'text-lg',
      description: 'text-sm',
      button: 'px-4 py-2 text-sm'
    },
    md: {
      container: 'py-12',
      icon: 64,
      title: 'text-xl',
      description: 'text-base',
      button: 'px-6 py-3 text-base'
    },
    lg: {
      container: 'py-16',
      icon: 80,
      title: 'text-2xl',
      description: 'text-lg',
      button: 'px-8 py-4 text-lg'
    }
  };

  const config = emptyStateConfigs[type];
  const sizes = sizeClasses[size];
  const Icon = config.icon;

  const displayTitle = title || config.defaultTitle;
  const displayDescription = description || config.defaultDescription;
  const displayActionLabel = actionLabel || config.defaultActionLabel;
  const displaySecondaryActionLabel = secondaryActionLabel || config.defaultSecondaryActionLabel;

  return (
    <div className={`pantry-empty-state text-center ${sizes.container} ${className}`}>
      {/* Icon */}
      {showIcon && (
        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${config.bgColor} mb-6`}>
          <Icon size={sizes.icon} className={config.iconColor} />
        </div>
      )}

      {/* Title */}
      <h3 className={`font-semibold text-gray-900 mb-3 ${sizes.title}`}>
        {displayTitle}
      </h3>

      {/* Description */}
      <p className={`text-gray-600 mb-8 max-w-md mx-auto ${sizes.description}`}>
        {displayDescription}
      </p>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        {displayActionLabel && onAction && (
          <button
            onClick={onAction}
            className={`
              bg-blue-600 text-white rounded-lg font-medium transition-colors
              hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              ${sizes.button}
            `}
          >
            {type === 'no-noodles' && <Plus size={16} className="inline mr-2" />}
            {type === 'no-plates' && <Plus size={16} className="inline mr-2" />}
            {(type === 'error' || type === 'loading-failed') && <RefreshCw size={16} className="inline mr-2" />}
            {displayActionLabel}
          </button>
        )}

        {displaySecondaryActionLabel && onSecondaryAction && (
          <button
            onClick={onSecondaryAction}
            className={`
              bg-gray-100 text-gray-700 rounded-lg font-medium transition-colors
              hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2
              ${sizes.button}
            `}
          >
            {type === 'no-noodles' && <Upload size={16} className="inline mr-2" />}
            {displaySecondaryActionLabel}
          </button>
        )}
      </div>

      {/* Additional Context */}
      {type === 'no-search-results' && searchTerm && (
        <div className="mt-8 p-4 bg-blue-50 rounded-lg max-w-md mx-auto">
          <p className="text-blue-700 text-sm">
            <strong>Search tip:</strong> Try using different keywords, check for typos, or use broader terms.
          </p>
        </div>
      )}

      {type === 'no-filtered-results' && filterCount > 0 && (
        <div className="mt-8 p-4 bg-orange-50 rounded-lg max-w-md mx-auto">
          <p className="text-orange-700 text-sm">
            <strong>{filterCount}</strong> filter{filterCount > 1 ? 's' : ''} currently applied. 
            Consider removing some to see more results.
          </p>
        </div>
      )}
    </div>
  );
};

// Specialized empty state components
export const NoNoodlesState: React.FC<{
  onCreateNoodle?: () => void;
  onUploadNoodle?: () => void;
  className?: string;
}> = ({ onCreateNoodle, onUploadNoodle, className }) => {
  const props: PantryEmptyStateProps = { type: "no-noodles" };
  if (onCreateNoodle) props.onAction = onCreateNoodle;
  if (onUploadNoodle) props.onSecondaryAction = onUploadNoodle;
  if (className) props.className = className;
  return <PantryEmptyState {...props} />;
};

export const NoPlatesState: React.FC<{
  onCreatePlate?: () => void;
  className?: string;
}> = ({ onCreatePlate, className }) => {
  const props: PantryEmptyStateProps = { type: "no-plates" };
  if (onCreatePlate) props.onAction = onCreatePlate;
  if (className) props.className = className;
  return <PantryEmptyState {...props} />;
};

export const NoSearchResultsState: React.FC<{
  searchTerm: string;
  onClearSearch?: () => void;
  onBrowseAll?: () => void;
  className?: string;
}> = ({ searchTerm, onClearSearch, onBrowseAll, className }) => {
  const props: PantryEmptyStateProps = { type: "no-search-results", searchTerm };
  if (onClearSearch) props.onAction = onClearSearch;
  if (onBrowseAll) props.onSecondaryAction = onBrowseAll;
  if (className) props.className = className;
  return <PantryEmptyState {...props} />;
};

export const NoFilteredResultsState: React.FC<{
  filterCount: number;
  onClearFilters?: () => void;
  onResetAll?: () => void;
  className?: string;
}> = ({ filterCount, onClearFilters, onResetAll, className }) => {
  const props: PantryEmptyStateProps = { type: "no-filtered-results", filterCount };
  if (onClearFilters) props.onAction = onClearFilters;
  if (onResetAll) props.onSecondaryAction = onResetAll;
  if (className) props.className = className;
  return <PantryEmptyState {...props} />;
};

export const ErrorState: React.FC<{
  onRetry?: () => void;
  onRefresh?: () => void;
  className?: string;
}> = ({ onRetry, onRefresh, className }) => {
  const props: PantryEmptyStateProps = { type: "error" };
  if (onRetry) props.onAction = onRetry;
  if (onRefresh) props.onSecondaryAction = onRefresh;
  if (className) props.className = className;
  return <PantryEmptyState {...props} />;
};

export default PantryEmptyState;