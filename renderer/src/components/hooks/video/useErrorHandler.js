import {
  useState, useRef, useCallback, useEffect,
} from 'react';

export const useErrorHandler = () => {
  const [error, setError] = useState(null);
  const errorTimeoutRef = useRef(null);

  const clearError = useCallback(() => {
    setError(null);
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
      errorTimeoutRef.current = null;
    }
  }, []);

  const setErrorWithTimeout = useCallback((message, timeout = 5000) => {
    setError(message);
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
    }
    errorTimeoutRef.current = setTimeout(() => {
      setError(null);
    }, timeout);
  }, []);

  useEffect(() => () => {
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
    }
  }, []);

  return {
    error,
    setError: setErrorWithTimeout,
    clearError,
  };
};
