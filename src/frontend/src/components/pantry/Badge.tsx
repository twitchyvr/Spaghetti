/**
 * The Pantry Design System - Badge Component
 * Small status indicators and labels with consistent styling
 */

import React from 'react';

export type BadgeVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'destructive' | 'outline';
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  children: React.ReactNode;
}

const getBadgeClasses = (variant: BadgeVariant, size: BadgeSize, dot: boolean) => {
  const baseClasses = 'inline-flex items-center font-medium rounded-full transition-all duration-200';
  
  // Size classes
  const sizeClasses = {
    sm: dot ? 'px-1.5 py-0.5 text-xs gap-1' : 'px-2 py-0.5 text-xs',
    md: dot ? 'px-2 py-1 text-sm gap-1.5' : 'px-2.5 py-1 text-sm',
    lg: dot ? 'px-3 py-1.5 text-sm gap-2' : 'px-3 py-1.5 text-sm',
  };
  
  // Variant classes
  const variantClasses = {
    default: 'bg-neutral-100 text-neutral-800 border border-neutral-200',
    primary: 'bg-orange-100 text-orange-800 border border-orange-200',
    secondary: 'bg-neutral-100 text-neutral-600 border border-neutral-200',
    success: 'bg-green-100 text-green-800 border border-green-200',
    warning: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
    error: 'bg-red-100 text-red-800 border border-red-200',
    info: 'bg-blue-100 text-blue-800 border border-blue-200',
    destructive: 'bg-red-100 text-red-800 border border-red-200',
    outline: 'bg-white text-gray-800 border border-gray-300',
  };
  
  return `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]}`.trim();
};

const getDotColor = (variant: BadgeVariant) => {
  const dotColors = {
    default: 'bg-neutral-400',
    primary: 'bg-orange-500',
    secondary: 'bg-neutral-400',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    destructive: 'bg-red-500',
    outline: 'bg-gray-400',
  };
  
  return dotColors[variant];
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'md',
  dot = false,
  children,
  className = '',
  ...props
}) => {
  const badgeClasses = getBadgeClasses(variant, size, dot);
  const dotClasses = getDotColor(variant);
  
  return (
    <span
      className={`${badgeClasses} ${className}`.trim()}
      {...props}
    >
      {dot && (
        <span className={`w-2 h-2 rounded-full ${dotClasses}`} />
      )}
      {children}
    </span>
  );
};

// Status Badge Component for common status indicators
export interface StatusBadgeProps {
  status: 'online' | 'offline' | 'away' | 'busy' | 'active' | 'inactive' | 'pending' | 'approved' | 'rejected';
  size?: BadgeSize;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  className = '',
}) => {
  const statusConfig = {
    online: { variant: 'success' as BadgeVariant, label: 'Online', dot: true },
    offline: { variant: 'default' as BadgeVariant, label: 'Offline', dot: true },
    away: { variant: 'warning' as BadgeVariant, label: 'Away', dot: true },
    busy: { variant: 'error' as BadgeVariant, label: 'Busy', dot: true },
    active: { variant: 'success' as BadgeVariant, label: 'Active', dot: false },
    inactive: { variant: 'secondary' as BadgeVariant, label: 'Inactive', dot: false },
    pending: { variant: 'warning' as BadgeVariant, label: 'Pending', dot: false },
    approved: { variant: 'success' as BadgeVariant, label: 'Approved', dot: false },
    rejected: { variant: 'error' as BadgeVariant, label: 'Rejected', dot: false },
  };
  
  const config = statusConfig[status];
  
  return (
    <Badge
      variant={config.variant}
      size={size}
      dot={config.dot}
      className={className}
    >
      {config.label}
    </Badge>
  );
};

// Notification Badge Component for counts and notifications
export interface NotificationBadgeProps {
  count: number;
  max?: number;
  size?: BadgeSize;
  variant?: BadgeVariant;
  className?: string;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count,
  max = 99,
  size = 'sm',
  variant = 'error',
  className = '',
}) => {
  if (count <= 0) return null;
  
  const displayCount = count > max ? `${max}+` : count.toString();
  
  return (
    <Badge
      variant={variant}
      size={size}
      className={`${className} min-w-0 justify-center`.trim()}
    >
      {displayCount}
    </Badge>
  );
};

export default Badge;