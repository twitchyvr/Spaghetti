/**
 * The Pantry Design System - Card Component
 * Flexible container component with consistent styling and variants
 */

import React from 'react';

export type CardVariant = 'default' | 'outlined' | 'elevated' | 'filled';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg' | 'xl';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: CardPadding;
  hoverable?: boolean;
  children: React.ReactNode;
}

const getCardClasses = (variant: CardVariant, padding: CardPadding, hoverable: boolean) => {
  const baseClasses = 'rounded-3xl transition-all duration-500 ease-out';
  
  // Apple-style variant classes with elegant shadows and backdrop blur
  const variantClasses = {
    default: 'bg-white/90 backdrop-blur-xl border border-gray-200/50 shadow-sm hover:shadow-xl',
    outlined: 'bg-white/80 backdrop-blur-xl border-2 border-gray-300/60 hover:border-gray-400/60',
    elevated: 'bg-white/95 backdrop-blur-xl border border-gray-200/30 shadow-lg hover:shadow-2xl hover:scale-102',
    filled: 'bg-gradient-to-br from-gray-50/80 to-blue-50/30 backdrop-blur-xl border border-gray-200/40',
  };
  
  // Apple-style padding classes with generous spacing
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-12',
  };
  
  const hoverClass = hoverable ? 'hover:shadow-2xl hover:scale-105 cursor-pointer hover:bg-white/95' : '';
  
  return `${baseClasses} ${variantClasses[variant]} ${paddingClasses[padding]} ${hoverClass}`.trim();
};

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  padding = 'md',
  hoverable = false,
  children,
  className = '',
  ...props
}) => {
  const cardClasses = getCardClasses(variant, padding, hoverable);
  
  return (
    <div
      className={`${cardClasses} ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  );
};

// Card Header Component
export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  children?: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  subtitle,
  action,
  children,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`flex items-start justify-between pb-6 border-b border-gray-200/30 ${className}`.trim()}
      {...props}
    >
      <div className="flex-1 min-w-0">
        {title && (
          <h3 className="text-2xl font-light text-gray-900 truncate tracking-tight">
            {title}
          </h3>
        )}
        {subtitle && (
          <p className="mt-2 text-base text-gray-600 font-light">
            {subtitle}
          </p>
        )}
        {children}
      </div>
      {action && (
        <div className="ml-6 flex-shrink-0">
          {action}
        </div>
      )}
    </div>
  );
};

// Card Content Component
export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const CardContent: React.FC<CardContentProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`py-6 ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  );
};

// Card Footer Component
export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  justify?: 'start' | 'center' | 'end' | 'between';
}

export const CardFooter: React.FC<CardFooterProps> = ({
  children,
  justify = 'start',
  className = '',
  ...props
}) => {
  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
  };
  
  return (
    <div
      className={`flex items-center pt-6 border-t border-gray-200/30 gap-4 ${justifyClasses[justify]} ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  );
};

// Stats Card Component (commonly used in dashboards)
export interface StatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: string | number;
    type: 'increase' | 'decrease' | 'neutral';
  };
  icon?: React.ReactNode;
  className?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  icon,
  className = '',
}) => {
  const changeColorClasses = {
    increase: 'text-green-700 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/50',
    decrease: 'text-red-700 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200/50',
    neutral: 'text-gray-700 bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200/50',
  };
  
  return (
    <Card variant="elevated" className={`hover:scale-105 ${className}`.trim()}>
      <div className="text-center space-y-6">
        {icon && (
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-xl">
            <div className="text-white">
              {icon}
            </div>
          </div>
        )}
        
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
            {title}
          </p>
          <p className="text-4xl font-light text-gray-900 tracking-tight">
            {value}
          </p>
          
          {change && (
            <div className="flex justify-center">
              <span
                className={`inline-flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm ${
                  changeColorClasses[change.type]
                }`}
              >
                {change.type === 'increase' && '↗'}
                {change.type === 'decrease' && '↘'}
                {change.type === 'neutral' && '→'}
                {change.value}
              </span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default Card;