/**
 * The Pantry Design System - Alert Component
 * Flexible alert component for notifications, errors, and status messages
 */

import React from 'react';
import { cn } from '../../utils/cn';
import { 
  CheckCircle, 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  X 
} from 'lucide-react';

export type AlertVariant = 'info' | 'success' | 'warning' | 'error';
export type AlertSize = 'sm' | 'md' | 'lg';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
  size?: AlertSize;
  title?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
}

const getAlertClasses = (variant: AlertVariant, size: AlertSize) => {
  const baseClasses = 'relative rounded-lg border flex items-start transition-all duration-200';
  
  // Variant styles
  const variantClasses = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    error: 'bg-red-50 border-red-200 text-red-800',
  };
  
  // Size styles
  const sizeClasses = {
    sm: 'p-3 text-sm',
    md: 'p-4 text-sm',
    lg: 'p-6 text-base',
  };
  
  return cn(baseClasses, variantClasses[variant], sizeClasses[size]);
};

const getIconForVariant = (variant: AlertVariant) => {
  const iconProps = { size: 20, className: 'flex-shrink-0' };
  
  switch (variant) {
    case 'success':
      return <CheckCircle {...iconProps} className="text-green-600 flex-shrink-0" />;
    case 'warning':
      return <AlertTriangle {...iconProps} className="text-yellow-600 flex-shrink-0" />;
    case 'error':
      return <AlertCircle {...iconProps} className="text-red-600 flex-shrink-0" />;
    case 'info':
    default:
      return <Info {...iconProps} className="text-blue-600 flex-shrink-0" />;
  }
};

export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  size = 'md',
  title,
  dismissible = false,
  onDismiss,
  icon,
  action,
  children,
  className,
  ...props
}) => {
  const alertClasses = getAlertClasses(variant, size);
  const displayIcon = icon || getIconForVariant(variant);

  return (
    <div
      role="alert"
      className={cn(alertClasses, className)}
      {...props}
    >
      {/* Icon */}
      <div className="mr-3 mt-0.5">
        {displayIcon}
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        {title && (
          <h3 className="font-semibold mb-1">
            {title}
          </h3>
        )}
        <div className="text-sm">
          {children}
        </div>
        {action && (
          <div className="mt-3">
            {action}
          </div>
        )}
      </div>
      
      {/* Dismiss Button */}
      {dismissible && onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className={cn(
            'ml-3 p-1 rounded-md transition-colors duration-200',
            'hover:bg-black hover:bg-opacity-10 focus:outline-none focus:ring-2 focus:ring-offset-2',
            {
              'focus:ring-blue-500': variant === 'info',
              'focus:ring-green-500': variant === 'success',
              'focus:ring-yellow-500': variant === 'warning',
              'focus:ring-red-500': variant === 'error',
            }
          )}
          aria-label="Dismiss alert"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

// Toast Alert for floating notifications
export interface ToastAlertProps extends Omit<AlertProps, 'size'> {
  duration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export const ToastAlert: React.FC<ToastAlertProps> = ({
  duration = 5000,
  position = 'top-right',
  onDismiss,
  ...props
}) => {
  React.useEffect(() => {
    if (duration > 0 && onDismiss) {
      const timer = setTimeout(onDismiss, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onDismiss]);

  const positionClasses = {
    'top-right': 'fixed top-4 right-4 z-50',
    'top-left': 'fixed top-4 left-4 z-50',
    'bottom-right': 'fixed bottom-4 right-4 z-50',
    'bottom-left': 'fixed bottom-4 left-4 z-50',
  };

  return (
    <div className={cn(positionClasses[position], 'max-w-md')}>
      <Alert
        {...props}
        dismissible={true}
        onDismiss={onDismiss}
        className="shadow-lg"
      />
    </div>
  );
};

// Inline Alert for form validation
export interface InlineAlertProps extends Omit<AlertProps, 'size' | 'dismissible'> {
  field?: string;
}

export const InlineAlert: React.FC<InlineAlertProps> = ({
  field,
  children,
  ...props
}) => {
  return (
    <Alert
      {...props}
      size="sm"
      className="mt-1"
      role="alert"
      aria-describedby={field ? `${field}-error` : undefined}
    >
      {children}
    </Alert>
  );
};

export default Alert;