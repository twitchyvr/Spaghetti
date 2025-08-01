/**
 * PantryViewToggle Component - The Pantry Component Library
 * Professional view mode toggle for switching between grid, list, and table views
 */

import React from 'react';
import { Grid3X3, List, Table } from 'lucide-react';
import { ViewMode } from './types';

interface PantryViewToggleProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  availableViews?: ViewMode[];
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const PantryViewToggle: React.FC<PantryViewToggleProps> = ({
  currentView,
  onViewChange,
  availableViews = ['grid', 'list', 'table'],
  size = 'md',
  className = ''
}) => {
  const viewConfigs = {
    grid: {
      icon: Grid3X3,
      label: 'Grid View',
      tooltip: 'View items in a grid layout'
    },
    list: {
      icon: List,
      label: 'List View', 
      tooltip: 'View items in a detailed list'
    },
    table: {
      icon: Table,
      label: 'Table View',
      tooltip: 'View items in a tabular format'
    }
  };

  const sizeClasses = {
    sm: {
      container: 'p-0.5',
      button: 'p-1.5',
      icon: 14
    },
    md: {
      container: 'p-1',
      button: 'p-2',
      icon: 16
    },
    lg: {
      container: 'p-1.5',
      button: 'p-2.5',
      icon: 18
    }
  };

  const sizes = sizeClasses[size];

  return (
    <div className={`pantry-view-toggle ${className}`}>
      <div className={`flex items-center bg-gray-100 rounded-lg ${sizes.container}`}>
        {availableViews.map((view) => {
          const config = viewConfigs[view];
          const Icon = config.icon;
          const isActive = currentView === view;

          return (
            <button
              key={view}
              onClick={() => onViewChange(view)}
              className={`
                ${sizes.button} rounded transition-all duration-200
                ${isActive 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
                }
              `}
              title={config.tooltip}
              aria-label={config.label}
              aria-pressed={isActive}
            >
              <Icon size={sizes.icon} />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PantryViewToggle;