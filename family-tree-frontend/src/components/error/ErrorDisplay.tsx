import { useState } from 'react';
import './ErrorDisplay.css';

export interface ErrorDisplayProps {
  title?: string;
  message: string;
  type?: 'error' | 'warning' | 'info';
  showRetry?: boolean;
  onRetry?: () => void;
  onDismiss?: () => void;
  details?: Record<string, any>;
  className?: string;
}

export function ErrorDisplay({
  title = 'Error',
  message,
  type = 'error',
  showRetry = false,
  onRetry,
  onDismiss,
  details,
  className = '',
}: ErrorDisplayProps) {
  const [showDetails, setShowDetails] = useState(false);

  const getIcon = () => {
    switch (type) {
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '❌';
    }
  };

  return (
    <div className={`error-display error-display--${type} ${className}`}>
      <div className="error-display__content">
        <div className="error-display__header">
          <span className="error-display__icon">{getIcon()}</span>
          <div className="error-display__text">
            <h3 className="error-display__title">{title}</h3>
            <p className="error-display__message">{message}</p>
          </div>
          {onDismiss && (
            <button
              className="error-display__dismiss"
              onClick={onDismiss}
              aria-label="Dismiss error"
            >
              ×
            </button>
          )}
        </div>

        {(showRetry || details) && (
          <div className="error-display__actions">
            {showRetry && onRetry && (
              <button
                className="error-display__retry"
                onClick={onRetry}
              >
                Try Again
              </button>
            )}
            {details && (
              <button
                className="error-display__details-toggle"
                onClick={() => setShowDetails(!showDetails)}
              >
                {showDetails ? 'Hide Details' : 'Show Details'}
              </button>
            )}
          </div>
        )}

        {showDetails && details && (
          <div className="error-display__details">
            <h4>Error Details:</h4>
            <pre className="error-display__details-content">
              {JSON.stringify(details, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

// Inline error component for form fields
export interface InlineErrorProps {
  message: string;
  className?: string;
}

export function InlineError({ message, className = '' }: InlineErrorProps) {
  return (
    <span className={`inline-error ${className}`}>
      {message}
    </span>
  );
}

// Toast-style error notification
export interface ErrorToastProps extends ErrorDisplayProps {
  duration?: number;
  onExpire?: () => void;
}

export function ErrorToast({
  duration = 5000,
  onExpire,
  onDismiss,
  ...props
}: ErrorToastProps) {
  useState(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onExpire?.();
        onDismiss?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  });

  return (
    <div className="error-toast">
      <ErrorDisplay
        {...props}
        onDismiss={onDismiss}
        className={`error-toast__content ${props.className || ''}`}
      />
    </div>
  );
}