/**
 * The Pantry Design System - Button Component
 * Professional button component with consistent styling and accessibility
 */

import React from 'react';
import { cn } from '../../utils/cn';

export type ButtonVariant = 
  | 'primary' 
  | 'secondary' 
  | 'outline' 
  | 'ghost' 
  | 'destructive' 
  | 'success' 
  | 'warning';

export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  children: React.ReactNode;
}

const getButtonClasses = (
  variant: ButtonVariant,
  size: ButtonSize,
  loading: boolean,
  fullWidth: boolean,
  disabled: boolean
) => {
  const baseClasses = cn(
    'inline-flex items-center justify-center font-medium transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
    {
      'w-full': fullWidth,
      'cursor-not-allowed opacity-60': loading || disabled,
    }
  );

  // Variant styles using CSS custom properties
  const variantClasses = {
    primary: cn(
      'bg-orange-500 text-white border border-orange-500',
      'hover:bg-orange-600 hover:border-orange-600',
      'focus:ring-orange-500 focus:ring-offset-2',
      'active:bg-orange-700'
    ),
    secondary: cn(
      'bg-neutral-100 text-neutral-900 border border-neutral-200',
      'hover:bg-neutral-200 hover:border-neutral-300',
      'focus:ring-neutral-500 focus:ring-offset-2',
      'active:bg-neutral-300'
    ),
    outline: cn(
      'bg-transparent text-orange-600 border border-orange-500',
      'hover:bg-orange-50 hover:text-orange-700',
      'focus:ring-orange-500 focus:ring-offset-2',
      'active:bg-orange-100'
    ),
    ghost: cn(
      'bg-transparent text-neutral-700 border border-transparent',
      'hover:bg-neutral-100 hover:text-neutral-900',
      'focus:ring-neutral-500 focus:ring-offset-2',
      'active:bg-neutral-200'
    ),
    destructive: cn(
      'bg-red-600 text-white border border-red-600',
      'hover:bg-red-700 hover:border-red-700',
      'focus:ring-red-500 focus:ring-offset-2',
      'active:bg-red-800'
    ),
    success: cn(
      'bg-green-600 text-white border border-green-600',
      'hover:bg-green-700 hover:border-green-700',
      'focus:ring-green-500 focus:ring-offset-2',
      'active:bg-green-800'
    ),
    warning: cn(
      'bg-yellow-500 text-white border border-yellow-500',
      'hover:bg-yellow-600 hover:border-yellow-600',
      'focus:ring-yellow-500 focus:ring-offset-2',
      'active:bg-yellow-700'
    ),
  };

  // Size styles
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm rounded-md gap-1.5',
    md: 'px-4 py-2 text-sm rounded-md gap-2',
    lg: 'px-6 py-3 text-base rounded-lg gap-2.5',
    xl: 'px-8 py-4 text-lg rounded-lg gap-3',
  };

  return cn(baseClasses, variantClasses[variant], sizeClasses[size]);
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  disabled = false,
  children,
  className,
  type = 'button',
  ...props
}) => {
  const buttonClasses = getButtonClasses(variant, size, loading, fullWidth, disabled);

  const renderIcon = () => {
    if (loading) {
      return (
        <svg
          className="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      );
    }
    return icon;
  };

  return (
    <button
      type={type}
      className={cn(buttonClasses, className)}
      disabled={disabled || loading}
      {...props}
    >
      {iconPosition === 'left' && renderIcon()}
      <span className={loading ? 'opacity-0' : ''}>{children}</span>
      {iconPosition === 'right' && renderIcon()}
    </button>
  );
};

// Button Group Component
export interface ButtonGroupProps {
  orientation?: 'horizontal' | 'vertical';
  size?: ButtonSize;
  variant?: ButtonVariant;
  children: React.ReactNode;
  className?: string;
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  orientation = 'horizontal',
  size = 'md',
  variant = 'primary',
  children,
  className,
}) => {
  const groupClasses = cn(
    'inline-flex',
    {
      'flex-row': orientation === 'horizontal',
      'flex-col': orientation === 'vertical',
    },
    className
  );

  const modifiedChildren = React.Children.map(children, (child, index) => {
    if (React.isValidElement(child) && child.type === Button) {
      const isFirst = index === 0;
      const isLast = index === React.Children.count(children) - 1;
      
      let roundedClass = '';
      if (orientation === 'horizontal') {
        if (isFirst && !isLast) roundedClass = 'rounded-r-none border-r-0';
        else if (isLast && !isFirst) roundedClass = 'rounded-l-none';
        else if (!isFirst && !isLast) roundedClass = 'rounded-none border-r-0';
      } else {
        if (isFirst && !isLast) roundedClass = 'rounded-b-none border-b-0';
        else if (isLast && !isFirst) roundedClass = 'rounded-t-none';
        else if (!isFirst && !isLast) roundedClass = 'rounded-none border-b-0';
      }

      return React.cloneElement(child, {
        size: child.props.size || size,
        variant: child.props.variant || variant,
        className: cn(child.props.className, roundedClass),
      });
    }
    return child;
  });

  return <div className={groupClasses}>{modifiedChildren}</div>;
};

export default Button;