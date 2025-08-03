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
    'inline-flex items-center justify-center font-medium transition-all duration-300 ease-out',
    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500/50',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
    'backdrop-blur-sm',
    {
      'w-full': fullWidth,
      'cursor-not-allowed opacity-60': loading || disabled,
    }
  );

  // Apple-style variant with elegant gradients and effects
  const variantClasses = {
    primary: cn(
      'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0',
      'focus:ring-blue-500/50 focus:ring-offset-2',
      'active:scale-95',
      'shadow-lg hover:shadow-xl hover:scale-105'
    ),
    secondary: cn(
      'bg-white/90 text-gray-700 border border-gray-300/50 backdrop-blur-xl',
      'hover:bg-white hover:border-gray-400/60 hover:text-gray-900',
      'focus:ring-blue-500/50 focus:ring-offset-2',
      'active:scale-95',
      'shadow-sm hover:shadow-lg hover:scale-102'
    ),
    outline: cn(
      'bg-transparent text-blue-600 border border-blue-500/60 backdrop-blur-sm',
      'hover:bg-blue-50/80 hover:text-blue-700 hover:border-blue-600',
      'focus:ring-blue-500/50 focus:ring-offset-2',
      'active:scale-95 active:bg-blue-100/80'
    ),
    ghost: cn(
      'bg-transparent text-gray-700 border border-transparent backdrop-blur-sm',
      'hover:bg-gray-100/60 hover:text-gray-900',
      'focus:ring-blue-500/50 focus:ring-offset-2',
      'active:scale-95 active:bg-gray-200/60'
    ),
    destructive: cn(
      'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white border-0',
      'focus:ring-red-500/50 focus:ring-offset-2',
      'active:scale-95',
      'shadow-lg hover:shadow-xl hover:scale-105'
    ),
    success: cn(
      'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0',
      'focus:ring-green-500/50 focus:ring-offset-2',
      'active:scale-95',
      'shadow-lg hover:shadow-xl hover:scale-105'
    ),
    warning: cn(
      'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white border-0',
      'focus:ring-yellow-500/50 focus:ring-offset-2',
      'active:scale-95',
      'shadow-lg hover:shadow-xl hover:scale-105'
    ),
  };

  // Apple-style size classes with generous spacing and rounded corners
  const sizeClasses = {
    sm: 'px-4 py-2.5 text-sm rounded-2xl gap-2 min-h-[36px]',
    md: 'px-6 py-3 text-sm rounded-2xl gap-2.5 min-h-[40px]',
    lg: 'px-8 py-4 text-base rounded-2xl gap-3 min-h-[48px]',
    xl: 'px-10 py-5 text-lg rounded-3xl gap-3.5 min-h-[56px]',
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
        ...child.props,
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