/**
 * The Pantry Design System - Navigation Components
 * Tabs, Breadcrumbs, and Pagination components for consistent navigation
 */

import React, { useState } from 'react';

// Tab Components
export interface TabItem {
  id: string;
  label: string;
  content?: React.ReactNode;
  disabled?: boolean;
  badge?: string | number;
}

export interface TabsProps {
  items: TabItem[];
  defaultActiveTab?: string;
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const getTabClasses = (variant: string, size: string, isActive: boolean, disabled: boolean) => {
  const baseClasses = 'inline-flex items-center gap-2 font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2';
  
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };
  
  const variantClasses = {
    default: {
      base: 'rounded-lg border',
      active: 'bg-orange-50 border-orange-200 text-orange-700',
      inactive: 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900',
      disabled: 'bg-neutral-50 border-neutral-200 text-neutral-400 cursor-not-allowed',
    },
    pills: {
      base: 'rounded-full',
      active: 'bg-orange-100 text-orange-700',
      inactive: 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900',
      disabled: 'text-neutral-400 cursor-not-allowed',
    },
    underline: {
      base: 'border-b-2 rounded-none',
      active: 'border-orange-500 text-orange-600',
      inactive: 'border-transparent text-neutral-600 hover:text-neutral-900 hover:border-neutral-300',
      disabled: 'border-transparent text-neutral-400 cursor-not-allowed',
    },
  };
  
  const variant_config = variantClasses[variant as keyof typeof variantClasses];
  const stateClass = disabled ? variant_config.disabled : isActive ? variant_config.active : variant_config.inactive;
  
  return `${baseClasses} ${sizeClasses[size as keyof typeof sizeClasses]} ${variant_config.base} ${stateClass}`.trim();
};

export const Tabs: React.FC<TabsProps> = ({
  items,
  defaultActiveTab,
  activeTab: controlledActiveTab,
  onTabChange,
  variant = 'default',
  size = 'md',
  className = '',
}) => {
  const [internalActiveTab, setInternalActiveTab] = useState(defaultActiveTab || items[0]?.id);
  const activeTab = controlledActiveTab !== undefined ? controlledActiveTab : internalActiveTab;
  
  const handleTabClick = (tabId: string, disabled: boolean) => {
    if (disabled) return;
    
    if (controlledActiveTab === undefined) {
      setInternalActiveTab(tabId);
    }
    onTabChange?.(tabId);
  };
  
  const activeTabItem = items.find(item => item.id === activeTab);
  
  return (
    <div className={className}>
      {/* Tab Navigation */}
      <div className={`flex gap-1 ${variant === 'underline' ? 'border-b border-neutral-200' : ''}`}>
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className={getTabClasses(variant, size, activeTab === item.id, !!item.disabled)}
            onClick={() => handleTabClick(item.id, !!item.disabled)}
            disabled={item.disabled}
            aria-selected={activeTab === item.id}
            role="tab"
          >
            {item.label}
            {item.badge && (
              <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-neutral-100 text-neutral-600 rounded-full">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </div>
      
      {/* Tab Content */}
      {activeTabItem?.content && (
        <div className="mt-4" role="tabpanel">
          {activeTabItem.content}
        </div>
      )}
    </div>
  );
};

// Breadcrumb Components
export interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
  current?: boolean;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  separator,
  className = '',
}) => {
  const defaultSeparator = (
    <svg className="w-4 h-4 text-neutral-400" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
    </svg>
  );
  
  return (
    <nav className={className} aria-label="Breadcrumb">
      <ol className="flex items-center gap-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <span className="mx-2">
                {separator || defaultSeparator}
              </span>
            )}
            
            {item.current ? (
              <span className="text-sm font-medium text-neutral-900" aria-current="page">
                {item.label}
              </span>
            ) : (
              <a
                href={item.href}
                onClick={item.onClick}
                className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors duration-200"
              >
                {item.label}
              </a>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

// Pagination Component
export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showFirstLast?: boolean;
  showPrevNext?: boolean;
  maxVisiblePages?: number;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  showFirstLast = true,
  showPrevNext = true,
  maxVisiblePages = 7,
  className = '',
}) => {
  const getVisiblePages = () => {
    const delta = Math.floor(maxVisiblePages / 2);
    let start = Math.max(1, currentPage - delta);
    let end = Math.min(totalPages, currentPage + delta);
    
    // Adjust if we're near the beginning or end
    if (end - start + 1 < maxVisiblePages) {
      if (start === 1) {
        end = Math.min(totalPages, start + maxVisiblePages - 1);
      } else if (end === totalPages) {
        start = Math.max(1, end - maxVisiblePages + 1);
      }
    }
    
    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  };
  
  const visiblePages = getVisiblePages();
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;
  
  const buttonClasses = "px-3 py-2 text-sm font-medium border border-neutral-300 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
  const activeButtonClasses = "px-3 py-2 text-sm font-medium bg-orange-50 border border-orange-300 text-orange-600";
  
  return (
    <nav className={`flex items-center justify-center gap-1 ${className}`.trim()} aria-label="Pagination">
      {/* First Page */}
      {showFirstLast && !isFirstPage && visiblePages[0] && visiblePages[0] > 1 && (
        <>
          <button
            type="button"
            className={`${buttonClasses} rounded-l-lg`}
            onClick={() => onPageChange(1)}
            aria-label="Go to first page"
          >
            1
          </button>
          {visiblePages[0] && visiblePages[0] > 2 && (
            <span className="px-2 text-neutral-500">...</span>
          )}
        </>
      )}
      
      {/* Previous Page */}
      {showPrevNext && (
        <button
          type="button"
          className={`${buttonClasses} ${showFirstLast || visiblePages[0] === 1 ? '' : 'rounded-l-lg'}`}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={isFirstPage}
          aria-label="Go to previous page"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      )}
      
      {/* Page Numbers */}
      {visiblePages.map((page) => (
        <button
          key={page}
          type="button"
          className={page === currentPage ? activeButtonClasses : buttonClasses}
          onClick={() => onPageChange(page)}
          aria-label={`Go to page ${page}`}
          aria-current={page === currentPage ? 'page' : undefined}
        >
          {page}
        </button>
      ))}
      
      {/* Next Page */}
      {showPrevNext && (
        <button
          type="button"
          className={`${buttonClasses} ${showFirstLast || visiblePages[visiblePages.length - 1] === totalPages ? '' : 'rounded-r-lg'}`}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={isLastPage}
          aria-label="Go to next page"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      )}
      
      {/* Last Page */}
      {(() => {
        const lastVisiblePage = visiblePages[visiblePages.length - 1];
        return showFirstLast && !isLastPage && lastVisiblePage && lastVisiblePage < totalPages && (
          <>
            {lastVisiblePage < totalPages - 1 && (
              <span className="px-2 text-neutral-500">...</span>
            )}
          <button
            type="button"
            className={`${buttonClasses} rounded-r-lg`}
            onClick={() => onPageChange(totalPages)}
            aria-label="Go to last page"
          >
            {totalPages}
          </button>
        </>
        );
      })()}
    </nav>
  );
};

export default { Tabs, Breadcrumbs, Pagination };