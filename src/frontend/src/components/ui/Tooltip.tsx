import React, { useState, useRef } from 'react';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  className?: string;
  maxWidth?: string;
  showArrow?: boolean;
  interactive?: boolean;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  delay = 500,
  className = '',
  maxWidth = '300px',
  showArrow = true,
  interactive = false,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [actualPosition, setActualPosition] = useState(position);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const showTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      // Calculate position if tooltip would go off screen
      if (triggerRef.current && tooltipRef.current) {
        const triggerRect = triggerRef.current.getBoundingClientRect();
        const tooltipRect = tooltipRef.current.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        let newPosition = position;
        
        // Check if tooltip goes off right edge
        if (triggerRect.left + tooltipRect.width > viewportWidth) {
          if (position === 'right') newPosition = 'left';
        }
        
        // Check if tooltip goes off left edge
        if (triggerRect.left - tooltipRect.width < 0) {
          if (position === 'left') newPosition = 'right';
        }
        
        // Check if tooltip goes off top edge
        if (triggerRect.top - tooltipRect.height < 0) {
          if (position === 'top') newPosition = 'bottom';
        }
        
        // Check if tooltip goes off bottom edge
        if (triggerRect.bottom + tooltipRect.height > viewportHeight) {
          if (position === 'bottom') newPosition = 'top';
        }
        
        setActualPosition(newPosition);
      }
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (!interactive) {
      setIsVisible(false);
    }
  };

  const handleTooltipMouseEnter = () => {
    if (interactive) {
      setIsVisible(true);
    }
  };

  const handleTooltipMouseLeave = () => {
    if (interactive) {
      setIsVisible(false);
    }
  };

  const getPositionClasses = () => {
    const baseClasses = 'absolute z-100 pointer-events-none';
    
    switch (actualPosition) {
      case 'top':
        return `${baseClasses} bottom-full left-1/2 transform -translate-x-1/2 mb-2`;
      case 'bottom':
        return `${baseClasses} top-full left-1/2 transform -translate-x-1/2 mt-2`;
      case 'left':
        return `${baseClasses} right-full top-1/2 transform -translate-y-1/2 mr-2`;
      case 'right':
        return `${baseClasses} left-full top-1/2 transform -translate-y-1/2 ml-2`;
      default:
        return `${baseClasses} bottom-full left-1/2 transform -translate-x-1/2 mb-2`;
    }
  };

  const getArrowClasses = () => {
    const baseClasses = 'absolute w-2 h-2 bg-gray-900 transform rotate-45';
    
    switch (actualPosition) {
      case 'top':
        return `${baseClasses} top-full left-1/2 transform -translate-x-1/2 -translate-y-1/2`;
      case 'bottom':
        return `${baseClasses} bottom-full left-1/2 transform -translate-x-1/2 translate-y-1/2`;
      case 'left':
        return `${baseClasses} left-full top-1/2 transform -translate-x-1/2 -translate-y-1/2`;
      case 'right':
        return `${baseClasses} right-full top-1/2 transform translate-x-1/2 -translate-y-1/2`;
      default:
        return `${baseClasses} top-full left-1/2 transform -translate-x-1/2 -translate-y-1/2`;
    }
  };

  return (
    <div 
      className="relative inline-block"
      ref={triggerRef}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      
      {isVisible && (
        <div
          ref={tooltipRef}
          className={getPositionClasses()}
          onMouseEnter={handleTooltipMouseEnter}
          onMouseLeave={handleTooltipMouseLeave}
          style={{ 
            maxWidth, 
            pointerEvents: interactive ? 'auto' : 'none' 
          }}
        >
          <div className={`
            bg-gray-900 text-white text-sm font-medium px-3 py-2 rounded-lg shadow-elevation-3
            backdrop-blur-sm bg-opacity-95 border border-gray-700
            animate-fade-in
            ${className}
          `}>
            {content}
            {showArrow && <div className={getArrowClasses()} />}
          </div>
        </div>
      )}
    </div>
  );
};

// Professional tooltip variations for different use cases
export const InfoTooltip: React.FC<Omit<TooltipProps, 'children'> & { size?: 'sm' | 'md' | 'lg' }> = ({ 
  content, 
  size = 'md',
  ...props 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4 text-xs',
    md: 'w-5 h-5 text-sm',
    lg: 'w-6 h-6 text-base'
  };

  return (
    <Tooltip content={content} {...props}>
      <div className={`
        inline-flex items-center justify-center rounded-full 
        bg-info-100 text-info-600 hover:bg-info-200 
        transition-colors cursor-help
        ${sizeClasses[size]}
      `}>
        <span className="font-semibold">?</span>
      </div>
    </Tooltip>
  );
};

export const HelpTooltip: React.FC<Omit<TooltipProps, 'children'> & { 
  title?: string;
  description: string;
  example?: string;
  learnMoreUrl?: string;
}> = ({ 
  title, 
  description, 
  example, 
  learnMoreUrl,
  ...props 
}) => {
  const content = (
    <div className="space-y-2 max-w-xs">
      {title && (
        <div className="font-semibold text-white border-b border-gray-600 pb-1">
          {title}
        </div>
      )}
      <div className="text-gray-200 text-xs leading-relaxed">
        {description}
      </div>
      {example && (
        <div className="mt-2 p-2 bg-gray-800 rounded text-xs font-mono text-gray-300 border border-gray-600">
          {example}
        </div>
      )}
      {learnMoreUrl && (
        <div className="mt-2 pt-2 border-t border-gray-600">
          <a 
            href={learnMoreUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-300 hover:text-blue-200 text-xs underline"
          >
            Learn more →
          </a>
        </div>
      )}
    </div>
  );

  return (
    <Tooltip content={content} interactive maxWidth="350px" {...props}>
      <div className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors cursor-help">
        <span className="text-xs font-bold">i</span>
      </div>
    </Tooltip>
  );
};

export const StatusTooltip: React.FC<Omit<TooltipProps, 'children'> & {
  status: 'success' | 'warning' | 'error' | 'info';
  title: string;
  description: string;
  lastUpdated?: string;
}> = ({ 
  status, 
  title, 
  description, 
  lastUpdated,
  ...props 
}) => {
  const statusConfig = {
    success: { 
      color: 'text-success-600', 
      bg: 'bg-success-100 hover:bg-success-200',
      icon: '✓'
    },
    warning: { 
      color: 'text-warning-600', 
      bg: 'bg-warning-100 hover:bg-warning-200',
      icon: '⚠'
    },
    error: { 
      color: 'text-error-600', 
      bg: 'bg-error-100 hover:bg-error-200',
      icon: '✗'
    },
    info: { 
      color: 'text-info-600', 
      bg: 'bg-info-100 hover:bg-info-200',
      icon: 'i'
    }
  };

  const config = statusConfig[status];

  const content = (
    <div className="space-y-2">
      <div className="font-semibold text-white flex items-center space-x-2">
        <span>{config.icon}</span>
        <span>{title}</span>
      </div>
      <div className="text-gray-200 text-xs">
        {description}
      </div>
      {lastUpdated && (
        <div className="text-gray-400 text-xs pt-1 border-t border-gray-600">
          Updated: {lastUpdated}
        </div>
      )}
    </div>
  );

  return (
    <Tooltip content={content} {...props}>
      <div className={`
        inline-flex items-center justify-center w-5 h-5 rounded-full 
        ${config.bg} ${config.color}
        transition-colors cursor-help text-xs font-bold
      `}>
        {config.icon}
      </div>
    </Tooltip>
  );
};

export default Tooltip;