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
  const baseClasses = 'rounded-lg transition-all duration-200';
  
  // Professional variant classes with subtle shadows
  const variantClasses = {
    default: 'bg-white border border-neutral-200 shadow-sm',
    outlined: 'bg-white border-2 border-neutral-300',
    elevated: 'bg-white border border-neutral-200 shadow-md hover:shadow-lg',
    filled: 'bg-neutral-50 border border-neutral-200',
  };
  
  // Padding classes
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
  };
  
  const hoverClass = hoverable ? 'hover:shadow-lg hover:border-neutral-300 cursor-pointer' : '';
  
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
      className={`flex items-start justify-between pb-4 border-b ${className}`.trim()}
      {...props}
    >
      <div className="flex-1 min-w-0">
        {title && (
          <h3 className="text-lg font-semibold text-neutral-900 truncate">
            {title}
          </h3>
        )}
        {subtitle && (
          <p className="mt-1 text-sm text-neutral-600">
            {subtitle}
          </p>
        )}
        {children}
      </div>
      {action && (
        <div className="ml-4 flex-shrink-0">
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
      className={`py-4 ${className}`.trim()}
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
      className={`flex items-center pt-4 border-t border-neutral-200 ${justifyClasses[justify]} ${className}`.trim()}
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
    increase: 'text-green-600 bg-green-50',
    decrease: 'text-red-600 bg-red-50',
    neutral: 'text-neutral-600 bg-neutral-50',
  };
  
  return (
    <Card variant="elevated" className={`${className}`.trim()}>
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-neutral-600 truncate">
            {title}
          </p>
          <p className="mt-1 text-3xl font-bold text-neutral-900">
            {value}
          </p>
          {change && (
            <div className="mt-2 flex items-center">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
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
        {icon && (
          <div className="flex-shrink-0 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-blue-600">
              {icon}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default Card;