/**
 * PantryUserAvatar Component - The Pantry Component Library
 * Professional user avatar with role indicators and online status
 */

import React from 'react';
import { User, Crown, ChefHat, Utensils, Coffee } from 'lucide-react';
import { PantryUser } from './types';

interface PantryUserAvatarProps {
  user: PantryUser | string; // Can accept user object or just name string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showRole?: boolean;
  showOnlineStatus?: boolean;
  showTooltip?: boolean;
  shape?: 'circle' | 'square' | 'rounded';
  className?: string;
}

export const PantryUserAvatar: React.FC<PantryUserAvatarProps> = ({
  user,
  size = 'md',
  showRole = false,
  showOnlineStatus = false,
  showTooltip = true,
  shape = 'circle',
  className = ''
}) => {
  // Handle both user object and string inputs
  const userData = typeof user === 'string' 
    ? { id: '0', name: user, email: '', role: 'diner' as const }
    : user;

  const { name, email, avatar, role, isOnline } = userData;

  const sizeClasses = {
    xs: {
      container: 'w-6 h-6',
      text: 'text-xs',
      icon: 12,
      indicator: 'w-2 h-2 -top-0.5 -right-0.5'
    },
    sm: {
      container: 'w-8 h-8',
      text: 'text-sm',
      icon: 14,
      indicator: 'w-2.5 h-2.5 -top-0.5 -right-0.5'
    },
    md: {
      container: 'w-10 h-10',
      text: 'text-base',
      icon: 16,
      indicator: 'w-3 h-3 -top-0.5 -right-0.5'
    },
    lg: {
      container: 'w-12 h-12',
      text: 'text-lg',
      icon: 18,
      indicator: 'w-3.5 h-3.5 -top-1 -right-1'
    },
    xl: {
      container: 'w-16 h-16',
      text: 'text-xl',
      icon: 20,
      indicator: 'w-4 h-4 -top-1 -right-1'
    }
  };

  const shapeClasses = {
    circle: 'rounded-full',
    square: 'rounded-none',
    rounded: 'rounded-lg'
  };

  const roleConfigs = {
    chef: {
      icon: Crown,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      label: 'Chef'
    },
    'sous-chef': {
      icon: ChefHat,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      label: 'Sous Chef'
    },
    steward: {
      icon: Utensils,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      label: 'Steward'
    },
    diner: {
      icon: Coffee,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
      label: 'Diner'
    }
  };

  const sizes = sizeClasses[size];
  const shapeClass = shapeClasses[shape];
  const roleConfig = roleConfigs[role];

  // Generate initials from name
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2);
  };

  // Generate consistent color from name
  const getColorFromName = (name: string): string => {
    const colors = [
      'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
      'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
    ];
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  const avatarContent = avatar ? (
    <img
      src={avatar}
      alt={`${name}'s avatar`}
      className={`${sizes.container} ${shapeClass} object-cover`}
    />
  ) : (
    <div className={`
      ${sizes.container} ${shapeClass} flex items-center justify-center text-white font-medium
      ${getColorFromName(name)} ${sizes.text}
    `}>
      {getInitials(name)}
    </div>
  );

  const tooltip = showTooltip ? {
    title: `${name}${email ? ` (${email})` : ''}${roleConfig ? ` - ${roleConfig.label}` : ''}${isOnline !== undefined ? (isOnline ? ' - Online' : ' - Offline') : ''}`
  } : {};

  return (
    <div className={`pantry-user-avatar relative inline-flex items-center ${className}`} {...tooltip}>
      {/* Avatar */}
      <div className="relative">
        {avatarContent}
        
        {/* Online Status Indicator */}
        {showOnlineStatus && isOnline !== undefined && (
          <div className={`
            absolute border-2 border-white rounded-full
            ${sizes.indicator}
            ${isOnline ? 'bg-green-500' : 'bg-gray-400'}
          `} />
        )}

        {/* Role Indicator */}
        {showRole && roleConfig && (
          <div className={`
            absolute -bottom-1 -right-1 rounded-full border-2 border-white
            ${roleConfig.bgColor} p-1
          `}>
            <roleConfig.icon size={sizes.icon - 4} className={roleConfig.color} />
          </div>
        )}
      </div>
    </div>
  );
};

// Group avatar component for multiple users
interface PantryUserAvatarGroupProps {
  users: (PantryUser | string)[];
  maxVisible?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showRole?: boolean;
  showOnlineStatus?: boolean;
  overlap?: boolean;
  className?: string;
}

export const PantryUserAvatarGroup: React.FC<PantryUserAvatarGroupProps> = ({
  users,
  maxVisible = 3,
  size = 'md',
  showRole = false,
  showOnlineStatus = false,
  overlap = true,
  className = ''
}) => {
  const visibleUsers = users.slice(0, maxVisible);
  const remainingCount = users.length - maxVisible;

  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl'
  };

  return (
    <div className={`pantry-user-avatar-group flex items-center ${className}`}>
      {visibleUsers.map((user, index) => (
        <div
          key={typeof user === 'string' ? user : user.id}
          className={overlap ? `-ml-2 first:ml-0` : 'mr-1 last:mr-0'}
          style={{ zIndex: visibleUsers.length - index }}
        >
          <PantryUserAvatar
            user={user}
            size={size}
            showRole={showRole}
            showOnlineStatus={showOnlineStatus}
            className="ring-2 ring-white"
          />
        </div>
      ))}
      
      {remainingCount > 0 && (
        <div className={`
          ${overlap ? '-ml-2' : 'ml-1'}
          ${sizeClasses[size]} rounded-full bg-gray-200 text-gray-600 border-2 border-white
          flex items-center justify-center font-medium
        `}>
          +{remainingCount}
        </div>
      )}
    </div>
  );
};

export default PantryUserAvatar;