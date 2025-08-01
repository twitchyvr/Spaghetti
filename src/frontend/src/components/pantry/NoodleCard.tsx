/**
 * NoodleCard Component - The Pantry Component Library
 * Professional card component for displaying noodle metadata with enterprise features
 */

import React from 'react';
import { 
  FileText, 
  Eye, 
  Edit3, 
  Download, 
  Trash2, 
  Share2,
  MessageCircle,
  Calendar,
  User,
  Clock,
  MoreHorizontal
} from 'lucide-react';
import { Noodle, NoodleCardActions, ViewMode } from './types';

interface NoodleCardProps {
  noodle: Noodle;
  actions: NoodleCardActions;
  viewMode?: ViewMode;
  showMenu?: boolean;
  isSelected?: boolean;
  isDraggable?: boolean;
  className?: string;
}

export const NoodleCard: React.FC<NoodleCardProps> = ({
  noodle,
  actions,
  viewMode = 'grid',
  showMenu = true,
  isSelected = false,
  isDraggable = false,
  className = ''
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800 border-green-200';
      case 'draft': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'archived': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  const baseClasses = `
    bg-white rounded-lg border transition-all duration-200
    ${isDraggable ? 'cursor-move' : 'cursor-pointer'}
    ${isSelected ? 'ring-2 ring-blue-500 shadow-lg' : 'shadow-sm hover:shadow-md'}
    ${className}
  `;

  if (viewMode === 'list') {
    return (
      <div className={baseClasses}>
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1 min-w-0">
              <div className="flex-shrink-0">
                <FileText className="w-10 h-10 text-blue-600" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="font-semibold text-gray-900 truncate text-lg">
                    {noodle.title}
                  </h3>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(noodle.status)}`}>
                    {noodle.status}
                  </span>
                </div>
                
                {noodle.description && (
                  <p className="text-gray-600 text-sm mb-2 line-clamp-1">
                    {truncateText(noodle.description, 120)}
                  </p>
                )}
                
                <div className="flex items-center space-x-6 text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <User size={12} />
                    <span>{noodle.createdBy}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar size={12} />
                    <span>{formatDate(noodle.createdAt)}</span>
                  </div>
                  {noodle.updatedAt && (
                    <div className="flex items-center space-x-1">
                      <Clock size={12} />
                      <span>Updated {formatTime(noodle.updatedAt)}</span>
                    </div>
                  )}
                  <span className="font-medium">{noodle.fileSize}</span>
                </div>
                
                <div className="flex items-center space-x-1 mt-2">
                  {noodle.tags.slice(0, 4).map(tag => (
                    <span 
                      key={tag}
                      className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                  {noodle.tags.length > 4 && (
                    <span className="text-gray-400 text-xs">+{noodle.tags.length - 4}</span>
                  )}
                </div>
              </div>
            </div>
            
            {showMenu && (
              <div className="flex items-center space-x-1 ml-4 flex-shrink-0">
                <ActionButton
                  icon={Eye}
                  onClick={() => actions.onView(noodle.id)}
                  tooltip="View noodle"
                  color="blue"
                />
                <ActionButton
                  icon={Edit3}
                  onClick={() => actions.onEdit(noodle.id)}
                  tooltip="Edit noodle"
                  color="green"
                />
                <ActionButton
                  icon={Download}
                  onClick={() => actions.onDownload(noodle.id)}
                  tooltip="Download noodle"
                  color="purple"
                />
                {actions.onShare && (
                  <ActionButton
                    icon={Share2}
                    onClick={() => actions.onShare!(noodle.id)}
                    tooltip="Share noodle"
                    color="indigo"
                  />
                )}
                {actions.onComment && (
                  <ActionButton
                    icon={MessageCircle}
                    onClick={() => actions.onComment!(noodle.id)}
                    tooltip="Comments"
                    color="gray"
                  />
                )}
                <ActionButton
                  icon={Trash2}
                  onClick={() => actions.onDelete(noodle.id)}
                  tooltip="Delete noodle"
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
    <div className={baseClasses}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-start space-x-2 mb-2">
              <FileText className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 text-lg leading-tight">
                  {noodle.title}
                </h3>
                <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(noodle.status)}`}>
                  {noodle.status}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Description */}
        {noodle.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {noodle.description}
          </p>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-4">
          {noodle.tags.map(tag => (
            <span 
              key={tag}
              className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded font-medium"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Metadata */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <User size={14} />
              <span>{noodle.createdBy}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar size={14} />
              <span>{formatDate(noodle.createdAt)}</span>
            </div>
          </div>
          
          {noodle.updatedAt && (
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <Clock size={14} />
                <span>Updated {formatTime(noodle.updatedAt)}</span>
              </div>
              <span className="font-medium">{noodle.fileSize}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        {showMenu && (
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <span className="text-xs text-gray-500 font-medium">
              {noodle.fileSize || 'Unknown size'}
            </span>
            <div className="flex space-x-1">
              <ActionButton
                icon={Eye}
                onClick={() => actions.onView(noodle.id)}
                tooltip="View noodle"
                color="blue"
                size="sm"
              />
              <ActionButton
                icon={Edit3}
                onClick={() => actions.onEdit(noodle.id)}
                tooltip="Edit noodle"
                color="green"
                size="sm"
              />
              <ActionButton
                icon={Download}
                onClick={() => actions.onDownload(noodle.id)}
                tooltip="Download noodle"
                color="purple"
                size="sm"
              />
              {actions.onShare && (
                <ActionButton
                  icon={Share2}
                  onClick={() => actions.onShare!(noodle.id)}
                  tooltip="Share noodle"
                  color="indigo"
                  size="sm"
                />
              )}
              <ActionButton
                icon={Trash2}
                onClick={() => actions.onDelete(noodle.id)}
                tooltip="Delete noodle"
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

// Action Button Component
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

export default NoodleCard;