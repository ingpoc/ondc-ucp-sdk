/**
 * useSearchStream Hook (SDK-BUYER-SEARCH-001)
 * Hook for Server-Sent Events streaming search results with progressive disclosure
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { BecknItem } from '@ondc-website/shared';

/** Stream event types */
export type StreamEventType =
  | 'status'
  | 'results'
  | 'error'
  | 'complete';

/** Base stream event */
export interface StreamEvent {
  type: StreamEventType;
  data: unknown;
  timestamp: string;
}

/** Status event data */
export interface StatusEventData {
  status: 'searching' | 'receiving' | 'complete' | 'error';
  message: string;
}

/** Results event data */
export interface ResultsEventData {
  items: BecknItem[];
  count: number;
  hasMore: boolean;
}

/** Error event data */
export interface ErrorEventData {
  error: string;
  code?: string;
}

/** Hook state */
export interface SearchStreamState {
  status: 'idle' | 'connecting' | 'streaming' | 'complete' | 'error';
  items: BecknItem[];
  error: string | null;
  hasMore: boolean;
  isStreaming: boolean;
}

/** Hook result */
export interface SearchStreamResult extends SearchStreamState {
  startStream: (params: SearchStreamParams) => void;
  stopStream: () => void;
  reset: () => void;
}

/** Search stream parameters */
export interface SearchStreamParams {
  query?: string;
  category: string;
  location?: string;
  preferences?: string;
}

const API_BASE = 'http://localhost:3001';
const STREAM_TIMEOUT = 3000; // 3 seconds

/**
 * Hook for SSE-based progressive disclosure search
 * Streams results as they arrive with immediate status feedback
 */
export function useSearchStream(): SearchStreamResult {
  const [state, setState] = useState<SearchStreamState>({
    status: 'idle',
    items: [],
    error: null,
    hasMore: false,
    isStreaming: false,
  });

  const eventSourceRef = useRef<EventSource | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  /** Stop the current stream */
  const stopStream = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setState((prev) => ({
      ...prev,
      isStreaming: false,
      status: prev.status === 'streaming' ? 'complete' : prev.status,
    }));
  }, []);

  /** Reset state to initial values */
  const reset = useCallback(() => {
    stopStream();
    setState({
      status: 'idle',
      items: [],
      error: null,
      hasMore: false,
      isStreaming: false,
    });
  }, [stopStream]);

  /** Start streaming search results */
  const startStream = useCallback((params: SearchStreamParams) => {
    // Reset previous state
    setState({
      status: 'connecting',
      items: [],
      error: null,
      hasMore: false,
      isStreaming: true,
    });

    // Build query string
    const queryParams = new URLSearchParams();
    if (params.query) queryParams.set('query', params.query);
    if (params.category) queryParams.set('category', params.category);
    if (params.location) queryParams.set('location', params.location);
    if (params.preferences) queryParams.set('preferences', params.preferences);

    const url = `${API_BASE}/api/search/stream?${queryParams.toString()}`;

    // Create EventSource connection
    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;

    // Set timeout for completion
    timeoutRef.current = setTimeout(() => {
      if (state.isStreaming) {
        stopStream();
      }
    }, STREAM_TIMEOUT);

    // Handle incoming messages
    eventSource.onmessage = (event) => {
      try {
        const streamEvent = JSON.parse(event.data) as StreamEvent;

        switch (streamEvent.type) {
          case 'status': {
            const statusData = streamEvent.data as StatusEventData;
            setState((prev) => ({
              ...prev,
              status: 'streaming',
              error: null,
            }));
            break;
          }

          case 'results': {
            const resultsData = streamEvent.data as ResultsEventData;
            setState((prev) => ({
              ...prev,
              items: resultsData.items,
              hasMore: resultsData.hasMore,
              status: 'streaming',
            }));
            break;
          }

          case 'error': {
            const errorData = streamEvent.data as ErrorEventData;
            setState((prev) => ({
              ...prev,
              status: 'error',
              error: errorData.error,
              isStreaming: false,
            }));
            stopStream();
            break;
          }

          case 'complete': {
            setState((prev) => ({
              ...prev,
              status: 'complete',
              isStreaming: false,
            }));
            stopStream();
            break;
          }
        }
      } catch (err) {
        setState((prev) => ({
          ...prev,
          status: 'error',
          error: err instanceof Error ? err.message : 'Failed to parse stream event',
          isStreaming: false,
        }));
        stopStream();
      }
    };

    // Handle connection errors
    eventSource.onerror = (err) => {
      setState((prev) => ({
        ...prev,
        status: 'error',
        error: 'Stream connection error',
        isStreaming: false,
      }));
      stopStream();
    };
  }, [stopStream, state.isStreaming]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopStream();
    };
  }, [stopStream]);

  return {
    ...state,
    startStream,
    stopStream,
    reset,
  };
}
