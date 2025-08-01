/**
 * PantryLoadingState Component - The Pantry Component Library
 * Professional loading states with various animations and layouts
 */

import React from 'react';
import { Loader2, ChefHat, FileText, FolderOpen } from 'lucide-react';

interface PantryLoadingStateProps {
  variant?: 'spinner' | 'skeleton' | 'cards' | 'table';
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  showIcon?: boolean;
  count?: number; // For skeleton/card layouts
  className?: string;
}

export const PantryLoadingState: React.FC<PantryLoadingStateProps> = ({
  variant = 'spinner',
  size = 'md',
  message = 'Loading...',
  showIcon = true,
  count = 6,
  className = ''
}) => {
  const sizeClasses = {
    sm: {
      spinner: 'w-6 h-6',
      icon: 24,
      text: 'text-sm',
      container: 'min-h-32'
    },
    md: {
      spinner: 'w-8 h-8',
      icon: 32,
      text: 'text-base',
      container: 'min-h-48'
    },
    lg: {
      spinner: 'w-12 h-12',
      icon: 48,
      text: 'text-lg',
      container: 'min-h-64'
    }
  };

  const sizes = sizeClasses[size];

  // Spinner Loading
  if (variant === 'spinner') {
    return (
      <div className={`pantry-loading-spinner flex items-center justify-center ${sizes.container} ${className}`}>
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            {showIcon && (
              <ChefHat size={sizes.icon} className="text-blue-600 mr-3" />
            )}
            <Loader2 className={`${sizes.spinner} text-blue-600 animate-spin`} />
          </div>
          <p className={`text-gray-600 ${sizes.text}`}>{message}</p>
        </div>
      </div>
    );
  }

  // Skeleton Loading
  if (variant === 'skeleton') {
    return (
      <div className={`pantry-loading-skeleton space-y-4 ${className}`}>
        {/* Header Skeleton */}
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
          </div>
          <div className="flex space-x-2">
            <div className="h-10 bg-gray-200 rounded w-24 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
          </div>
        </div>

        {/* Search Bar Skeleton */}
        <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>

        {/* Content Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: count }).map((_, index) => (
            <div key={index} className="bg-white rounded-lg border p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  <div className="w-10 h-10 bg-gray-200 rounded animate-pulse"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6 animate-pulse"></div>
              </div>

              <div className="flex space-x-2">
                <div className="h-6 bg-gray-200 rounded-full w-16 animate-pulse"></div>
                <div className="h-6 bg-gray-200 rounded-full w-20 animate-pulse"></div>
                <div className="h-6 bg-gray-200 rounded-full w-14 animate-pulse"></div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                <div className="flex space-x-1">
                  {Array.from({ length: 4 }).map((_, btnIndex) => (
                    <div key={btnIndex} className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Card Grid Loading
  if (variant === 'cards') {
    return (
      <div className={`pantry-loading-cards ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: count }).map((_, index) => (
            <div key={index} className="bg-white rounded-lg border p-6 animate-pulse">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded"></div>
                  <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-20"></div>
                </div>
              </div>
              
              <div className="space-y-3 mb-4">
                <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded"></div>
                <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-5/6"></div>
                <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-4/6"></div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full w-16"></div>
                <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full w-20"></div>
                <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full w-14"></div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-16"></div>
                <div className="flex space-x-1">
                  {Array.from({ length: 4 }).map((_, btnIndex) => (
                    <div key={btnIndex} className="w-7 h-7 bg-gradient-to-r from-gray-200 to-gray-300 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Table Loading
  if (variant === 'table') {
    return (
      <div className={`pantry-loading-table bg-white rounded-lg border ${className}`}>
        <div className="animate-pulse">
          {/* Table Header */}
          <div className="border-b border-gray-200 p-4">
            <div className="flex items-center space-x-4">
              <div className="h-4 bg-gray-200 rounded w-8"></div>
              <div className="h-4 bg-gray-200 rounded w-32"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
              <div className="h-4 bg-gray-200 rounded w-16"></div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </div>
          </div>

          {/* Table Rows */}
          {Array.from({ length: count }).map((_, index) => (
            <div key={index} className="border-b border-gray-100 p-4">
              <div className="flex items-center space-x-4">
                <div className="w-4 h-4 bg-gray-200 rounded"></div>
                <div className="flex items-center space-x-3 flex-1">
                  <div className="w-8 h-8 bg-gray-200 rounded"></div>
                  <div className="space-y-1 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-48"></div>
                    <div className="h-3 bg-gray-200 rounded w-32"></div>
                  </div>
                </div>
                <div className="h-3 bg-gray-200 rounded w-20"></div>
                <div className="h-5 bg-gray-200 rounded-full w-16"></div>
                <div className="h-3 bg-gray-200 rounded w-16"></div>
                <div className="flex space-x-1">
                  <div className="w-6 h-6 bg-gray-200 rounded"></div>
                  <div className="w-6 h-6 bg-gray-200 rounded"></div>
                  <div className="w-6 h-6 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
};

// Specialized loading components
export const NoodleLoadingCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-white rounded-lg border p-6 animate-pulse ${className}`}>
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center space-x-3 flex-1">
        <FileText className="w-8 h-8 text-gray-300" />
        <div className="space-y-2 flex-1">
          <div className="h-5 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-16"></div>
        </div>
      </div>
    </div>
    <div className="space-y-2 mb-4">
      <div className="h-3 bg-gray-200 rounded"></div>
      <div className="h-3 bg-gray-200 rounded w-5/6"></div>
    </div>
    <div className="flex space-x-1 mb-4">
      <div className="h-5 bg-gray-200 rounded-full w-12"></div>
      <div className="h-5 bg-gray-200 rounded-full w-16"></div>
    </div>
    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
      <div className="h-3 bg-gray-200 rounded w-16"></div>
      <div className="flex space-x-1">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="w-7 h-7 bg-gray-200 rounded"></div>
        ))}
      </div>
    </div>
  </div>
);

export const PlateLoadingCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-white rounded-lg border p-6 animate-pulse ${className}`}>
    <div className="flex items-start space-x-3 mb-4">
      <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
      <div className="flex-1 space-y-2">
        <div className="h-5 bg-gray-200 rounded w-3/4"></div>
        <div className="h-3 bg-gray-200 rounded w-16"></div>
      </div>
    </div>
    <div className="space-y-2 mb-4">
      <div className="h-3 bg-gray-200 rounded"></div>
      <div className="h-3 bg-gray-200 rounded w-4/6"></div>
    </div>
    <div className="grid grid-cols-2 gap-4 mb-4">
      <div className="p-3 bg-gray-50 rounded-lg">
        <div className="h-6 bg-gray-200 rounded w-8 mx-auto mb-1"></div>
        <div className="h-2 bg-gray-200 rounded w-12 mx-auto"></div>
      </div>
      <div className="p-3 bg-gray-50 rounded-lg">
        <div className="h-6 bg-gray-200 rounded w-8 mx-auto mb-1"></div>
        <div className="h-2 bg-gray-200 rounded w-16 mx-auto"></div>
      </div>
    </div>
    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
      <div className="h-3 bg-gray-200 rounded w-20"></div>
      <div className="flex space-x-1">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="w-7 h-7 bg-gray-200 rounded"></div>
        ))}
      </div>
    </div>
  </div>
);

export default PantryLoadingState;