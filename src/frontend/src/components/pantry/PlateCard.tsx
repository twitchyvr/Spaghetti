/**
 * PlateCard Component - The Pantry Component Library
 * Professional card component for displaying plate collections with drag-and-drop support
 */

import React from 'react';
import { 
  FolderOpen,
  Plus,
  Eye, 
  Edit3, 
  Trash2, 
  Share2,
  Users,
  Calendar,
  User,
  FileText,
  MoreHorizontal,
  Lock,
  Globe,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { Plate, PlateCardActions, ViewMode } from './types';

interface PlateCardProps {
  plate: Plate;
  actions: PlateCardActions;
  noodleCount?: number;
  collaboratorCount?: number;
  viewMode?: ViewMode;
  showMenu?: boolean;
  isSelected?: boolean;
  isCollapsible?: boolean;
  isExpanded?: boolean;
  onToggleExpanded?: () => void;
  className?: string;
}

export const PlateCard: React.FC<PlateCardProps> = ({
  plate,
  actions,
  noodleCount = plate.noodleIds?.length || 0,
  collaboratorCount = 0,
  viewMode = 'grid',
  showMenu = true,
  isSelected = false,
  isCollapsible = false,
  isExpanded = false,
  onToggleExpanded,
  className = ''
}) => {

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  const getPlateIcon = () => {
    if (plate.icon) {
      // TODO: Support custom icons
      return FolderOpen;
    }
    return FolderOpen;
  };

  const getPlateColor = () => {
    const colors = {
      blue: 'bg-blue-100 text-blue-800 border-blue-200',
      green: 'bg-green-100 text-green-800 border-green-200',
      purple: 'bg-purple-100 text-purple-800 border-purple-200',
      orange: 'bg-orange-100 text-orange-800 border-orange-200',
      red: 'bg-red-100 text-red-800 border-red-200',
      indigo: 'bg-indigo-100 text-indigo-800 border-indigo-200'
    };
    
    return colors[plate.color as keyof typeof colors] || colors.blue;
  };

  const baseClasses = `
    bg-white rounded-lg border transition-all duration-200 cursor-pointer
    ${isSelected ? 'ring-2 ring-blue-500 shadow-lg' : 'shadow-sm hover:shadow-md'}
    ${className}
  `;

  const PlateIcon = getPlateIcon();

  if (viewMode === 'list') {
    return (
      <div 
        className={baseClasses}
      >
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1 min-w-0">
              {/* Collapsible Arrow */}
              {isCollapsible && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleExpanded?.();
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
              )}
              
              <div className="flex-shrink-0">
                <div className={`p-2 rounded-lg ${getPlateColor()}`}>
                  <PlateIcon className="w-6 h-6" />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="font-semibold text-gray-900 truncate text-lg">
                    {plate.name}
                  </h3>
                  <div className="flex items-center space-x-1">
                    {plate.isPublic ? 
                      <Globe size={14} className="text-green-600" /> :
                      <Lock size={14} className="text-gray-500" />
                    }
                  </div>
                </div>
                
                {plate.description && (
                  <p className="text-gray-600 text-sm mb-2 line-clamp-1">
                    {truncateText(plate.description, 120)}
                  </p>
                )}
                
                <div className="flex items-center space-x-6 text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <User size={12} />
                    <span>{plate.createdBy}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar size={12} />
                    <span>{formatDate(plate.createdAt)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <FileText size={12} />
                    <span>{noodleCount} noodle{noodleCount !== 1 ? 's' : ''}</span>
                  </div>
                  {collaboratorCount > 0 && (
                    <div className="flex items-center space-x-1">
                      <Users size={12} />
                      <span>{collaboratorCount} collaborator{collaboratorCount !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-1 mt-2">
                  {plate.tags.slice(0, 4).map(tag => (
                    <span 
                      key={tag}
                      className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                  {plate.tags.length > 4 && (
                    <span className="text-gray-400 text-xs">+{plate.tags.length - 4}</span>
                  )}
                </div>
              </div>
            </div>
            
            {showMenu && (
              <div className="flex items-center space-x-1 ml-4 flex-shrink-0">
                <ActionButton
                  icon={Eye}
                  onClick={() => actions.onView(plate.id)}
                  tooltip="View plate"
                  color="blue"
                />
                <ActionButton
                  icon={Plus}
                  onClick={() => actions.onAddNoodle(plate.id)}
                  tooltip="Add noodle to plate"
                  color="green"
                />
                <ActionButton
                  icon={Edit3}
                  onClick={() => actions.onEdit(plate.id)}
                  tooltip="Edit plate"
                  color="purple"
                />
                {actions.onShare && (
                  <ActionButton
                    icon={Share2}
                    onClick={() => actions.onShare!(plate.id)}
                    tooltip="Share plate"
                    color="indigo"
                  />
                )}
                <ActionButton
                  icon={Trash2}
                  onClick={() => actions.onDelete(plate.id)}
                  tooltip="Delete plate"
                  color="red"
                />
                <ActionButton
                  icon={MoreHorizontal}
                  onClick={() => {}}
                  tooltip="More options"
                  color="gray"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Grid view (default)
  return (
    <div 
      className={baseClasses}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-3 flex-1 min-w-0">
            <div className={`p-3 rounded-lg ${getPlateColor()} flex-shrink-0`}>
              <PlateIcon className="w-8 h-8" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="font-semibold text-gray-900 line-clamp-2 text-lg leading-tight">
                  {plate.name}
                </h3>
                {plate.isPublic ? 
                  <Globe size={16} className="text-green-600 flex-shrink-0" /> :
                  <Lock size={16} className="text-gray-500 flex-shrink-0" />
                }
              </div>
            </div>
          </div>
        </div>
        
        {/* Description */}
        {plate.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {plate.description}
          </p>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-xl font-bold text-gray-900">{noodleCount}</div>
            <div className="text-xs text-gray-600">Noodle{noodleCount !== 1 ? 's' : ''}</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-xl font-bold text-gray-900">{collaboratorCount}</div>
            <div className="text-xs text-gray-600">Collaborator{collaboratorCount !== 1 ? 's' : ''}</div>
          </div>
        </div>

        {/* Tags */}
        {plate.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {plate.tags.slice(0, 3).map(tag => (
              <span 
                key={tag}
                className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded font-medium"
              >
                {tag}
              </span>
            ))}
            {plate.tags.length > 3 && (
              <span className="px-2 py-1 text-xs text-gray-500 rounded">
                +{plate.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Metadata */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <User size={14} />
              <span>{plate.createdBy}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar size={14} />
              <span>{formatDate(plate.createdAt)}</span>
            </div>
          </div>
          
          {plate.updatedAt && (
            <div className="text-sm text-gray-500">
              <span>Updated {formatDate(plate.updatedAt)}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        {showMenu && (
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <button
              onClick={(e) => {
                e.stopPropagation();
                actions.onAddNoodle(plate.id);
              }}
              className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              <Plus size={14} />
              <span>Add Noodle</span>
            </button>
            
            <div className="flex space-x-1">
              <ActionButton
                icon={Eye}
                onClick={() => actions.onView(plate.id)}
                tooltip="View plate"
                color="blue"
                size="sm"
              />
              <ActionButton
                icon={Edit3}
                onClick={() => actions.onEdit(plate.id)}
                tooltip="Edit plate"
                color="green"
                size="sm"
              />
              {actions.onShare && (
                <ActionButton
                  icon={Share2}
                  onClick={() => actions.onShare!(plate.id)}
                  tooltip="Share plate"
                  color="indigo"
                  size="sm"
                />
              )}
              <ActionButton
                icon={Trash2}
                onClick={() => actions.onDelete(plate.id)}
                tooltip="Delete plate"
                color="red"
                size="sm"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Action Button Component (reused from NoodleCard)
interface ActionButtonProps {
  icon: React.ComponentType<any>;
  onClick: () => void;
  tooltip: string;
  color: 'blue' | 'green' | 'purple' | 'indigo' | 'red' | 'gray';
  size?: 'sm' | 'md';
}

const ActionButton: React.FC<ActionButtonProps> = ({ 
  icon: Icon, 
  onClick, 
  tooltip, 
  color, 
  size = 'md' 
}) => {
  const colorClasses = {
    blue: 'hover:text-blue-600 hover:bg-blue-50',
    green: 'hover:text-green-600 hover:bg-green-50',
    purple: 'hover:text-purple-600 hover:bg-purple-50',
    indigo: 'hover:text-indigo-600 hover:bg-indigo-50',
    red: 'hover:text-red-600 hover:bg-red-50',
    gray: 'hover:text-gray-600 hover:bg-gray-50'
  };

  const sizeClasses = {
    sm: 'p-2',
    md: 'p-2.5'
  };

  const iconSize = size === 'sm' ? 14 : 16;

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`
        text-gray-400 transition-all duration-200 rounded-md
        ${colorClasses[color]}
        ${sizeClasses[size]}
      `}
      title={tooltip}
    >
      <Icon size={iconSize} />
    </button>
  );
};

export default PlateCard;