import { createContext, useContext, useReducer, useCallback, type ReactNode } from 'react';

export interface AppError {
  id: string;
  message: string;
  type: 'error' | 'warning' | 'info';
  title?: string;
  details?: Record<string, any>;
  timestamp: Date;
  dismissible?: boolean;
  duration?: number; // Auto-dismiss after this many milliseconds
}

interface ErrorState {
  errors: AppError[];
  globalError: AppError | null;
}

type ErrorAction =
  | { type: 'ADD_ERROR'; payload: Omit<AppError, 'id' | 'timestamp'> }
  | { type: 'REMOVE_ERROR'; payload: string }
  | { type: 'CLEAR_ERRORS' }
  | { type: 'SET_GLOBAL_ERROR'; payload: AppError | null };

const initialState: ErrorState = {
  errors: [],
  globalError: null,
};

function errorReducer(state: ErrorState, action: ErrorAction): ErrorState {
  switch (action.type) {
    case 'ADD_ERROR':
      const newError: AppError = {
        ...action.payload,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        timestamp: new Date(),
      };
      return {
        ...state,
        errors: [...state.errors, newError],
      };

    case 'REMOVE_ERROR':
      return {
        ...state,
        errors: state.errors.filter(error => error.id !== action.payload),
      };

    case 'CLEAR_ERRORS':
      return {
        ...state,
        errors: [],
      };

    case 'SET_GLOBAL_ERROR':
      return {
        ...state,
        globalError: action.payload,
      };

    default:
      return state;
  }
}

interface ErrorContextType {
  state: ErrorState;
  addError: (error: Omit<AppError, 'id' | 'timestamp'>) => string;
  removeError: (id: string) => void;
  clearErrors: () => void;
  setGlobalError: (error: AppError | null) => void;
  // Convenience methods
  showError: (message: string, options?: Partial<Omit<AppError, 'id' | 'timestamp' | 'message' | 'type'>>) => string;
  showWarning: (message: string, options?: Partial<Omit<AppError, 'id' | 'timestamp' | 'message' | 'type'>>) => string;
  showInfo: (message: string, options?: Partial<Omit<AppError, 'id' | 'timestamp' | 'message' | 'type'>>) => string;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

interface ErrorProviderProps {
  children: ReactNode;
}

export function ErrorProvider({ children }: ErrorProviderProps) {
  const [state, dispatch] = useReducer(errorReducer, initialState);

  const addError = useCallback((error: Omit<AppError, 'id' | 'timestamp'>): string => {
    dispatch({ type: 'ADD_ERROR', payload: error });
    
    // Auto-dismiss if duration is specified
    if (error.duration && error.duration > 0) {
      const errorId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      setTimeout(() => {
        dispatch({ type: 'REMOVE_ERROR', payload: errorId });
      }, error.duration);
      return errorId;
    }
    
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }, []);

  const removeError = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_ERROR', payload: id });
  }, []);

  const clearErrors = useCallback(() => {
    dispatch({ type: 'CLEAR_ERRORS' });
  }, []);

  const setGlobalError = useCallback((error: AppError | null) => {
    dispatch({ type: 'SET_GLOBAL_ERROR', payload: error });
  }, []);

  const showError = useCallback((message: string, options: Partial<Omit<AppError, 'id' | 'timestamp' | 'message' | 'type'>> = {}) => {
    return addError({
      message,
      type: 'error',
      dismissible: true,
      ...options,
    });
  }, [addError]);

  const showWarning = useCallback((message: string, options: Partial<Omit<AppError, 'id' | 'timestamp' | 'message' | 'type'>> = {}) => {
    return addError({
      message,
      type: 'warning',
      dismissible: true,
      ...options,
    });
  }, [addError]);

  const showInfo = useCallback((message: string, options: Partial<Omit<AppError, 'id' | 'timestamp' | 'message' | 'type'>> = {}) => {
    return addError({
      message,
      type: 'info',
      dismissible: true,
      duration: 5000, // Auto-dismiss info messages
      ...options,
    });
  }, [addError]);

  return (
    <ErrorContext.Provider
      value={{
        state,
        addError,
        removeError,
        clearErrors,
        setGlobalError,
        showError,
        showWarning,
        showInfo,
      }}
    >
      {children}
    </ErrorContext.Provider>
  );
}

export function useError() {
  const context = useContext(ErrorContext);
  if (context === undefined) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
}