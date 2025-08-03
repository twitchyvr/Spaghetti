/**
 * The Pantry Design System - Input Components
 * Accessible form inputs with consistent styling and validation states
 */

import React, { forwardRef } from 'react';

export type InputSize = 'sm' | 'md' | 'lg';
export type InputState = 'default' | 'error' | 'success' | 'warning';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  helperText?: string;
  error?: string;
  size?: InputSize;
  state?: InputState;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const getInputClasses = (size: InputSize, state: InputState, hasLeftIcon: boolean, hasRightIcon: boolean) => {
  const baseClasses = 'block border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed';
  
  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-4 py-3 text-base',
  };
  
  // State classes
  const stateClasses = {
    default: 'border-neutral-300 bg-white text-neutral-900 placeholder-neutral-500 focus:border-orange-500 focus:ring-orange-500',
    error: 'border-red-300 bg-white text-neutral-900 placeholder-neutral-500 focus:border-red-500 focus:ring-red-500',
    success: 'border-green-300 bg-white text-neutral-900 placeholder-neutral-500 focus:border-green-500 focus:ring-green-500',
    warning: 'border-yellow-300 bg-white text-neutral-900 placeholder-neutral-500 focus:border-yellow-500 focus:ring-yellow-500',
  };
  
  const leftPadding = hasLeftIcon ? (size === 'sm' ? 'pl-10' : size === 'md' ? 'pl-11' : 'pl-12') : '';
  const rightPadding = hasRightIcon ? (size === 'sm' ? 'pr-10' : size === 'md' ? 'pr-11' : 'pr-12') : '';
  
  return `${baseClasses} ${sizeClasses[size]} ${stateClasses[state]} ${leftPadding} ${rightPadding}`.trim();
};

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  helperText,
  error,
  size = 'md',
  state = 'default',
  leftIcon,
  rightIcon,
  fullWidth = true,
  className = '',
  id,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const actualState = error ? 'error' : state;
  const inputClasses = getInputClasses(size, actualState, !!leftIcon, !!rightIcon);
  const containerWidth = fullWidth ? 'w-full' : '';
  
  return (
    <div className={`${containerWidth} ${className}`.trim()}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-neutral-700 mb-2"
        >
          {label}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className={`absolute left-0 top-0 bottom-0 flex items-center ${
            size === 'sm' ? 'pl-3' : size === 'md' ? 'pl-3' : 'pl-4'
          }`}>
            <div className="text-neutral-400">
              {leftIcon}
            </div>
          </div>
        )}
        
        <input
          ref={ref}
          id={inputId}
          className={`${inputClasses} ${fullWidth ? 'w-full' : ''}`.trim()}
          {...props}
        />
        
        {rightIcon && (
          <div className={`absolute right-0 top-0 bottom-0 flex items-center ${
            size === 'sm' ? 'pr-3' : size === 'md' ? 'pr-3' : 'pr-4'
          }`}>
            <div className="text-neutral-400">
              {rightIcon}
            </div>
          </div>
        )}
      </div>
      
      {(error || helperText) && (
        <div className="mt-2">
          {error && (
            <p className="text-sm text-red-600">
              {error}
            </p>
          )}
          {!error && helperText && (
            <p className="text-sm text-neutral-600">
              {helperText}
            </p>
          )}
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';

// Textarea Component
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
  state?: InputState;
  fullWidth?: boolean;
  rows?: number;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  label,
  helperText,
  error,
  state = 'default',
  fullWidth = true,
  rows = 4,
  className = '',
  id,
  ...props
}, ref) => {
  const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
  const actualState = error ? 'error' : state;
  
  const stateClasses = {
    default: 'border-neutral-300 bg-white text-neutral-900 placeholder-neutral-500 focus:border-orange-500 focus:ring-orange-500',
    error: 'border-red-300 bg-white text-neutral-900 placeholder-neutral-500 focus:border-red-500 focus:ring-red-500',
    success: 'border-green-300 bg-white text-neutral-900 placeholder-neutral-500 focus:border-green-500 focus:ring-green-500',
    warning: 'border-yellow-300 bg-white text-neutral-900 placeholder-neutral-500 focus:border-yellow-500 focus:ring-yellow-500',
  };
  
  const textareaClasses = `block border rounded-lg px-4 py-3 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed resize-vertical ${stateClasses[actualState]}`;
  const containerWidth = fullWidth ? 'w-full' : '';
  
  return (
    <div className={`${containerWidth} ${className}`.trim()}>
      {label && (
        <label
          htmlFor={textareaId}
          className="block text-sm font-medium text-neutral-700 mb-2"
        >
          {label}
        </label>
      )}
      
      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        className={`${textareaClasses} ${fullWidth ? 'w-full' : ''}`.trim()}
        {...props}
      />
      
      {(error || helperText) && (
        <div className="mt-2">
          {error && (
            <p className="text-sm text-red-600">
              {error}
            </p>
          )}
          {!error && helperText && (
            <p className="text-sm text-neutral-600">
              {helperText}
            </p>
          )}
        </div>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

// Select Component
export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  helperText?: string;
  error?: string;
  size?: InputSize;
  state?: InputState;
  fullWidth?: boolean;
  options?: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  helperText,
  error,
  size = 'md',
  state = 'default',
  fullWidth = true,
  options = [],
  placeholder,
  className = '',
  id,
  children,
  ...props
}, ref) => {
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
  const actualState = error ? 'error' : state;
  const selectClasses = getInputClasses(size, actualState, false, true); // Select always has right icon (dropdown arrow)
  const containerWidth = fullWidth ? 'w-full' : '';
  
  return (
    <div className={`${containerWidth} ${className}`.trim()}>
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-neutral-700 mb-2"
        >
          {label}
        </label>
      )}
      
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          className={`${selectClasses} ${fullWidth ? 'w-full' : ''} appearance-none pr-10`.trim()}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
          {children}
        </select>
        
        {/* Dropdown Arrow */}
        <div className="absolute right-3 top-0 bottom-0 flex items-center pointer-events-none">
          <svg
            className="h-4 w-4 text-neutral-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
      
      {(error || helperText) && (
        <div className="mt-2">
          {error && (
            <p className="text-sm text-red-600">
              {error}
            </p>
          )}
          {!error && helperText && (
            <p className="text-sm text-neutral-600">
              {helperText}
            </p>
          )}
        </div>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Input;