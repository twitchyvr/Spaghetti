import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { AlertCircle, X } from 'lucide-react';

interface CustomErrorEvent {
  id: string;
  message: string;
  stack?: string | undefined;
  timestamp: Date;
  type: 'error' | 'unhandledrejection' | 'network' | 'api';
  context?: Record<string, any> | undefined;
}

interface GlobalErrorHandlerProps {
  children: React.ReactNode;
  showErrorDialog?: boolean;
  maxErrors?: number;
}

export function GlobalErrorHandler({ 
  children, 
  showErrorDialog = false,
  maxErrors = 5 
}: GlobalErrorHandlerProps) {
  const [errors, setErrors] = useState<CustomErrorEvent[]>([]);
  const [showDialog, setShowDialog] = useState(false);

  const addError = useCallback((error: CustomErrorEvent) => {
    setErrors(prev => {
      const newErrors = [error, ...prev].slice(0, maxErrors);
      return newErrors;
    });

    // Show toast notification for the error
    if (error.type === 'api' || error.type === 'network') {
      toast.error(error.message, {
        description: 'Please check your connection and try again.',
        action: {
          label: 'Retry',
          onClick: () => window.location.reload(),
        },
      });
    } else if (error.type === 'error') {
      toast.error('An unexpected error occurred', {
        description: error.message,
        action: showErrorDialog ? {
          label: 'Details',
          onClick: () => setShowDialog(true),
        } : undefined,
      });
    }
  }, [maxErrors, showErrorDialog]);

  const clearErrors = useCallback(() => {
    setErrors([]);
    setShowDialog(false);
  }, []);

  const dismissError = useCallback((errorId: string) => {
    setErrors(prev => prev.filter(error => error.id !== errorId));
  }, []);

  // Global error handler for JavaScript errors
  useEffect(() => {
    const handleError = (event: Event) => {
      const errorEvent = event as ErrorEvent;
      const error: CustomErrorEvent = {
        id: Math.random().toString(36).substring(2, 15),
        message: errorEvent.message || 'Unknown error occurred',
        stack: (errorEvent as any).error?.stack,
        timestamp: new Date(),
        type: 'error',
        context: {
          filename: errorEvent.filename,
          lineno: errorEvent.lineno,
          colno: errorEvent.colno,
        },
      };

      addError(error);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, [addError]);

  // Global handler for unhandled promise rejections
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error: CustomErrorEvent = {
        id: Math.random().toString(36).substring(2, 15),
        message: event.reason?.message || 'Unhandled promise rejection',
        stack: event.reason?.stack,
        timestamp: new Date(),
        type: 'unhandledrejection',
        context: {
          reason: event.reason,
        },
      };

      addError(error);
      
      // Prevent the default browser error handling
      event.preventDefault();
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    return () => window.removeEventListener('unhandledrejection', handleUnhandledRejection);
  }, [addError]);

  // Expose error reporting function globally
  useEffect(() => {
    (window as any).reportError = (error: Error, context?: Record<string, any>) => {
      const errorEvent: CustomErrorEvent = {
        id: Math.random().toString(36).substring(2, 15),
        message: error.message,
        stack: error.stack,
        timestamp: new Date(),
        type: 'error',
        context,
      };

      addError(errorEvent);
    };

    (window as any).reportApiError = (message: string, context?: Record<string, any>) => {
      const errorEvent: CustomErrorEvent = {
        id: Math.random().toString(36).substring(2, 15),
        message,
        timestamp: new Date(),
        type: 'api',
        context,
      };

      addError(errorEvent);
    };

    (window as any).reportNetworkError = (message: string, context?: Record<string, any>) => {
      const errorEvent: CustomErrorEvent = {
        id: Math.random().toString(36).substring(2, 15),
        message,
        timestamp: new Date(),
        type: 'network',
        context,
      };

      addError(errorEvent);
    };

    return () => {
      delete (window as any).reportError;
      delete (window as any).reportApiError;
      delete (window as any).reportNetworkError;
    };
  }, [addError]);

  return (
    <>
      {children}
      
      {/* Error Dialog */}
      {showDialog && showErrorDialog && errors.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="max-w-2xl w-full max-h-[80vh] bg-background border border-border rounded-lg shadow-lg">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <h2 className="text-lg font-semibold">Error Details</h2>
              </div>
              <button
                onClick={() => setShowDialog(false)}
                className="p-1 hover:bg-accent rounded transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="p-6 max-h-96 overflow-y-auto">
              <div className="space-y-4">
                {errors.map((error) => (
                  <div
                    key={error.id}
                    className="p-4 bg-muted rounded-lg border border-border"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-1 bg-destructive/20 text-destructive rounded">
                          {error.type}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {error.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <button
                        onClick={() => dismissError(error.id)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                    
                    <p className="text-sm font-medium mb-2">{error.message}</p>
                    
                    {error.stack && (
                      <details className="text-xs">
                        <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                          Stack Trace
                        </summary>
                        <pre className="mt-2 p-2 bg-background rounded text-xs overflow-x-auto">
                          {error.stack}
                        </pre>
                      </details>
                    )}
                    
                    {error.context && (
                      <details className="text-xs mt-2">
                        <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                          Context
                        </summary>
                        <pre className="mt-2 p-2 bg-background rounded text-xs overflow-x-auto">
                          {JSON.stringify(error.context, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end gap-2 p-6 border-t border-border">
              <button
                onClick={clearErrors}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Clear All
              </button>
              <button
                onClick={() => setShowDialog(false)}
                className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}