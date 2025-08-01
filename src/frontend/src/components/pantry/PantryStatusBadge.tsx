/**
 * PantryStatusBadge Component - The Pantry Component Library
 * Professional status badge with customizable variants and states
 */

import React from 'react';
import { Circle, CheckCircle, Clock, Archive, AlertCircle, Lock, Globe } from 'lucide-react';

type StatusType = 'draft' | 'published' | 'archived' | 'private' | 'public' | 'pending' | 'error';

interface PantryStatusBadgeProps {
  status: StatusType;
  label?: string;
  showIcon?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  variant?: 'solid' | 'outline' | 'subtle';
  className?: string;
}

export const PantryStatusBadge: React.FC<PantryStatusBadgeProps> = ({
  status,
  label,
  showIcon = true,
  size = 'sm',
  variant = 'subtle',
  className = ''
}) => {
  const statusConfigs = {
    draft: {
      icon: Clock,
      label: 'Draft',
      colors: {
        solid: 'bg-yellow-600 text-white border-yellow-600',
        outline: 'bg-white text-yellow-600 border-yellow-600',
        subtle: 'bg-yellow-100 text-yellow-800 border-yellow-200'
      }
    },
    published: {
      icon: CheckCircle,
      label: 'Published',
      colors: {
        solid: 'bg-green-600 text-white border-green-600',
        outline: 'bg-white text-green-600 border-green-600',
        subtle: 'bg-green-100 text-green-800 border-green-200'
      }
    },
    archived: {
      icon: Archive,
      label: 'Archived',
      colors: {
        solid: 'bg-gray-600 text-white border-gray-600',
        outline: 'bg-white text-gray-600 border-gray-600',
        subtle: 'bg-gray-100 text-gray-800 border-gray-200'
      }
    },
    private: {
      icon: Lock,
      label: 'Private',
      colors: {
        solid: 'bg-red-600 text-white border-red-600',
        outline: 'bg-white text-red-600 border-red-600',
        subtle: 'bg-red-100 text-red-800 border-red-200'
      }
    },
    public: {
      icon: Globe,
      label: 'Public',
      colors: {
        solid: 'bg-blue-600 text-white border-blue-600',
        outline: 'bg-white text-blue-600 border-blue-600',
        subtle: 'bg-blue-100 text-blue-800 border-blue-200'
      }
    },
    pending: {
      icon: Circle,
      label: 'Pending',
      colors: {
        solid: 'bg-orange-600 text-white border-orange-600',
        outline: 'bg-white text-orange-600 border-orange-600',
        subtle: 'bg-orange-100 text-orange-800 border-orange-200'
      }
    },
    error: {
      icon: AlertCircle,
      label: 'Error',
      colors: {
        solid: 'bg-red-600 text-white border-red-600',
        outline: 'bg-white text-red-600 border-red-600',
        subtle: 'bg-red-100 text-red-800 border-red-200'
      }
    }
  };

  const sizeClasses = {
    xs: {
      container: 'px-1.5 py-0.5 text-xs',
      icon: 10
    },
    sm: {
      container: 'px-2 py-1 text-xs',
      icon: 12
    },
    md: {
      container: 'px-3 py-1.5 text-sm',
      icon: 14
    },
    lg: {
      container: 'px-4 py-2 text-base',
      icon: 16
    }
  };

  const config = statusConfigs[status];
  const sizes = sizeClasses[size];
  const colors = config.colors[variant];
  const displayLabel = label || config.label;
  const Icon = config.icon;

  return (
    <span
      className={`
        inline-flex items-center gap-1 font-medium rounded-full border
        ${colors}
        ${sizes.container}
        ${className}
      `}
    >
      {showIcon && <Icon size={sizes.icon} className="flex-shrink-0" />}
      <span>{displayLabel}</span>
    </span>
  );
};

// Utility function to determine status from noodle/plate data
export const getStatusFromData = (item: { status?: string; isPublic?: boolean }): StatusType => {
  if (item.status) {
    return item.status as StatusType;
  }
  
  if (item.isPublic !== undefined) {
    return item.isPublic ? 'public' : 'private';
  }
  
  return 'draft';
};

export default PantryStatusBadge;