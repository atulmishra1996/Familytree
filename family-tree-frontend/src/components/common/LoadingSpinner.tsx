import './LoadingSpinner.css';

export interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
  overlay?: boolean;
  className?: string;
}

export function LoadingSpinner({
  size = 'medium',
  message,
  overlay = false,
  className = '',
}: LoadingSpinnerProps) {
  const content = (
    <div className={`loading-spinner loading-spinner--${size} ${className}`}>
      <div className="loading-spinner__circle">
        <div className="loading-spinner__inner"></div>
      </div>
      {message && (
        <div className="loading-spinner__message">{message}</div>
      )}
    </div>
  );

  if (overlay) {
    return (
      <div className="loading-overlay">
        {content}
      </div>
    );
  }

  return content;
}

// Inline loading component for buttons
export interface LoadingButtonProps {
  loading: boolean;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  [key: string]: any;
}

export function LoadingButton({
  loading,
  children,
  className = '',
  disabled,
  ...props
}: LoadingButtonProps) {
  return (
    <button
      {...props}
      className={`loading-button ${className} ${loading ? 'loading-button--loading' : ''}`}
      disabled={disabled || loading}
    >
      {loading && (
        <LoadingSpinner size="small" className="loading-button__spinner" />
      )}
      <span className={loading ? 'loading-button__text--hidden' : ''}>
        {children}
      </span>
    </button>
  );
}