import { useState, useCallback, useEffect } from 'react';
import type { UCPSession, UCPSessionItem, BecknItem } from '../types';

const API_BASE = 'http://localhost:3001';

export interface UseCartResult {
  session: UCPSession | null;
  loading: boolean;
  error: string | null;
  addToCart: (item: BecknItem, quantity?: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  refreshCart: () => Promise<void>;
  clearError: () => void;
  itemCount: number;
  subtotal: number;
}

/**
 * Generate a unique session ID for the user
 * In a real app, this would be stored in localStorage or managed by auth
 */
function getSessionId(): string {
  const storageKey = 'ondc-session-id';
  let sessionId = localStorage.getItem(storageKey);

  if (!sessionId) {
    sessionId = `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem(storageKey, sessionId);
  }

  return sessionId;
}

/**
 * Calculate subtotal from session items
 */
function calculateSubtotal(items: UCPSessionItem[]): number {
  return items.reduce((total, item) => {
    const priceValue = typeof item.item.price?.value === 'string'
      ? parseFloat(item.item.price.value)
      : (item.item.price?.value ?? 0);
    return total + (priceValue * item.quantity);
  }, 0);
}

/**
 * Hook for cart state management
 * Manages cart operations using the backend cart API
 */
export function useCart(): UseCartResult {
  const [session, setSession] = useState<UCPSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sessionId = getSessionId();

  // Fetch cart on mount
  useEffect(() => {
    refreshCart();
  }, []);

  const refreshCart = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/api/cart?sessionId=${sessionId}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch cart: ${response.status}`);
      }

      const data = await response.json();
      setSession(data.session);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load cart');
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  const addToCart = useCallback(async (item: BecknItem, quantity = 1) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/api/cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          item,
          quantity,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to add to cart: ${response.status}`);
      }

      const data = await response.json();
      setSession(data.session);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add item to cart');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  const removeFromCart = useCallback(async (itemId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/api/cart/${itemId}?sessionId=${sessionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to remove from cart: ${response.status}`);
      }

      const data = await response.json();
      setSession(data.session);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove item from cart');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/api/cart/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          quantity,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update quantity: ${response.status}`);
      }

      const data = await response.json();
      setSession(data.session);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update quantity');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Calculate derived values
  const itemCount = session?.items.length ?? 0;
  const subtotal = session ? calculateSubtotal(session.items) : 0;

  return {
    session,
    loading,
    error,
    addToCart,
    removeFromCart,
    updateQuantity,
    refreshCart,
    clearError,
    itemCount,
    subtotal,
  };
}
