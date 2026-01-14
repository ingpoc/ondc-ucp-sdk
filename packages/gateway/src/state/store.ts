/**
 * State Store
 * In-memory storage for pending request state
 */

/**
 * Pending request state
 */
export interface PendingRequest {
  /** Transaction ID */
  transactionId: string;
  /** Request timestamp */
  createdAt: Date;
  /** Request type (e.g., 'search', 'select') */
  type: string;
  /** Additional request data */
  data?: unknown;
}

/**
 * State Store Configuration
 */
export interface StateStoreConfig {
  /** TTL in milliseconds (default: 5 minutes) */
  ttl?: number;
}

/**
 * In-memory state store for pending requests
 */
export class StateStore {
  private store: Map<string, PendingRequest>;
  private ttl: number;
  private cleanupTimer: ReturnType<typeof setInterval> | null;

  constructor(config: StateStoreConfig = {}) {
    this.store = new Map();
    this.ttl = config.ttl ?? 5 * 60 * 1000; // 5 minutes default
    this.cleanupTimer = null;

    // Start periodic cleanup
    this.startCleanup();
  }

  /**
   * Store state for a transaction
   * @param transactionId - Transaction ID
   * @param state - State to store
   */
  set(transactionId: string, state: Omit<PendingRequest, 'transactionId' | 'createdAt'>): void {
    const pendingRequest: PendingRequest = {
      transactionId,
      createdAt: new Date(),
      ...state,
    };
    this.store.set(transactionId, pendingRequest);
  }

  /**
   * Get state for a transaction
   * @param transactionId - Transaction ID
   * @returns Pending request or undefined if not found
   */
  get(transactionId: string): PendingRequest | undefined {
    return this.store.get(transactionId);
  }

  /**
   * Remove state for a transaction
   * @param transactionId - Transaction ID
   * @returns true if found and removed, false otherwise
   */
  delete(transactionId: string): boolean {
    return this.store.delete(transactionId);
  }

  /**
   * Check if transaction exists
   * @param transactionId - Transaction ID
   * @returns true if exists, false otherwise
   */
  has(transactionId: string): boolean {
    return this.store.has(transactionId);
  }

  /**
   * Get all transaction IDs
   * @returns Array of transaction IDs
   */
  keys(): string[] {
    return Array.from(this.store.keys());
  }

  /**
   * Get count of pending requests
   * @returns Number of pending requests
   */
  size(): number {
    return this.store.size;
  }

  /**
   * Clear all pending requests
   */
  clear(): void {
    this.store.clear();
  }

  /**
   * Start periodic cleanup of expired entries
   */
  private startCleanup(): void {
    // Run cleanup every minute
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, 60 * 1000);
  }

  /**
   * Stop periodic cleanup
   */
  stopCleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }

  /**
   * Remove expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, value] of this.store.entries()) {
      const age = now - value.createdAt.getTime();
      if (age > this.ttl) {
        expiredKeys.push(key);
      }
    }

    for (const key of expiredKeys) {
      this.store.delete(key);
    }

    if (expiredKeys.length > 0) {
      console.log(`State store: cleaned up ${expiredKeys.length} expired entries`);
    }
  }

  /**
   * Get statistics about the state store
   * @returns Statistics object
   */
  getStats(): {
    size: number;
    ttl: number;
    keys: string[];
  } {
    return {
      size: this.store.size,
      ttl: this.ttl,
      keys: this.keys(),
    };
  }
}
