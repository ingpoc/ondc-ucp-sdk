import { useState, useCallback } from 'react';

const API_BASE = 'http://localhost:3001';

export interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: () => Promise<void>;
}

/**
 * Hook for making API calls to the backend
 */
export function useApi<T>(
  endpoint: string,
  options?: RequestInit
): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const json = await response.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [endpoint, options]);

  return { data, loading, error, execute };
}

/**
 * Hook for search API
 */
export function useSearch(category: string, params?: Record<string, unknown>) {
  const query = new URLSearchParams({
    category,
    ...Object.fromEntries(
      Object.entries(params ?? {}).map(([k, v]) => [
        k,
        typeof v === 'string' ? v : JSON.stringify(v),
      ])
    ),
  }).toString();

  return useApi(`/api/search?${query}`);
}
