/**
 * The Pantry Design System - Lazy Image Component
 * Optimized image loading with lazy loading, progressive enhancement, and error handling
 */

import React from 'react';
import { useLazyImage } from '../../hooks/usePerformance';

export interface LazyImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string;
  placeholder?: string;
  fallback?: string;
  aspectRatio?: 'square' | '16:9' | '4:3' | '3:2' | number;
  showLoading?: boolean;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  containerClassName?: string;
}

const getAspectRatioClass = (aspectRatio: LazyImageProps['aspectRatio']) => {
  switch (aspectRatio) {
    case 'square':
      return 'aspect-square';
    case '16:9':
      return 'aspect-video';
    case '4:3':
      return 'aspect-[4/3]';
    case '3:2':
      return 'aspect-[3/2]';
    default:
      return typeof aspectRatio === 'number' ? `aspect-[${aspectRatio}]` : '';
  }
};

const DefaultLoadingComponent: React.FC = () => (
  <div className="absolute inset-0 flex items-center justify-center bg-neutral-100">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
  </div>
);

const DefaultErrorComponent: React.FC = () => (
  <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-100 text-neutral-500">
    <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
    <span className="text-sm">Failed to load image</span>
  </div>
);

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  placeholder,
  fallback,
  aspectRatio,
  showLoading = true,
  loadingComponent = <DefaultLoadingComponent />,
  errorComponent = <DefaultErrorComponent />,
  containerClassName = '',
  className = '',
  alt = '',
  ...props
}) => {
  const { ref, src: imageSrc, isLoading, hasError } = useLazyImage(src, placeholder);
  
  const aspectRatioClass = getAspectRatioClass(aspectRatio);
  const shouldShowError = hasError && !fallback;
  const currentSrc = hasError && fallback ? fallback : imageSrc;
  
  return (
    <div className={`relative overflow-hidden ${aspectRatioClass} ${containerClassName}`.trim()}>
      {/* Image */}
      <img
        ref={ref}
        src={currentSrc}
        alt={alt}
        className={`object-cover transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        } ${className}`.trim()}
        {...props}
      />
      
      {/* Loading State */}
      {isLoading && showLoading && (
        <div className="absolute inset-0">
          {loadingComponent}
        </div>
      )}
      
      {/* Error State */}
      {shouldShowError && (
        <div className="absolute inset-0">
          {errorComponent}
        </div>
      )}
      
      {/* Placeholder Background */}
      {!currentSrc && !isLoading && !shouldShowError && (
        <div className="absolute inset-0 bg-neutral-200" />
      )}
    </div>
  );
};

// Image Gallery with lazy loading
export interface LazyImageGalleryProps {
  images: Array<{
    src: string;
    alt: string;
    caption?: string;
    placeholder?: string;
  }>;
  columns?: number;
  gap?: 'sm' | 'md' | 'lg';
  aspectRatio?: LazyImageProps['aspectRatio'];
  onImageClick?: (index: number) => void;
  className?: string;
}

export const LazyImageGallery: React.FC<LazyImageGalleryProps> = ({
  images,
  columns = 3,
  gap = 'md',
  aspectRatio = 'square',
  onImageClick,
  className = '',
}) => {
  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
  };
  
  const gridColumns = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 md:grid-cols-3 lg:grid-cols-5',
    6: 'grid-cols-1 md:grid-cols-3 lg:grid-cols-6',
  };
  
  return (
    <div className={`grid ${gridColumns[columns as keyof typeof gridColumns]} ${gapClasses[gap]} ${className}`.trim()}>
      {images.map((image, index) => (
        <div
          key={index}
          className={`group cursor-pointer transition-transform duration-200 hover:scale-[1.02] ${
            onImageClick ? 'cursor-pointer' : ''
          }`}
          onClick={() => onImageClick?.(index)}
        >
          <LazyImage
            src={image.src}
            alt={image.alt}
            placeholder={image.placeholder}
            aspectRatio={aspectRatio}
            className="w-full h-full group-hover:brightness-110 transition-all duration-200"
            containerClassName="rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
          />
          
          {image.caption && (
            <p className="mt-2 text-sm text-neutral-600 text-center">
              {image.caption}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};

// Avatar component with lazy loading
export interface LazyAvatarProps {
  src: string;
  alt: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  fallbackText?: string;
  className?: string;
}

export const LazyAvatar: React.FC<LazyAvatarProps> = ({
  src,
  alt,
  size = 'md',
  fallbackText,
  className = '',
}) => {
  const { ref, src: imageSrc, isLoading, hasError } = useLazyImage(src);
  
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-20 h-20 text-2xl',
  };
  
  const getFallbackInitials = (text: string) => {
    return text
      .split(' ')
      .map(word => word[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };
  
  return (
    <div className={`relative ${sizeClasses[size]} rounded-full overflow-hidden ${className}`.trim()}>
      {!hasError && imageSrc && (
        <img
          ref={ref}
          src={imageSrc}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
        />
      )}
      
      {(hasError || !imageSrc) && (
        <div className="w-full h-full bg-neutral-200 flex items-center justify-center">
          {fallbackText ? (
            <span className="font-medium text-neutral-600">
              {getFallbackInitials(fallbackText)}
            </span>
          ) : (
            <svg className="w-1/2 h-1/2 text-neutral-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          )}
        </div>
      )}
      
      {isLoading && (
        <div className="absolute inset-0 bg-neutral-100 flex items-center justify-center">
          <div className="animate-pulse bg-neutral-200 w-full h-full rounded-full" />
        </div>
      )}
    </div>
  );
};

export default LazyImage;