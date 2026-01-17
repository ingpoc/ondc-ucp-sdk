const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
const CLEANUP_INTERVAL = 60 * 1000; // 1 minute

export interface PendingRequest {
  transactionId: string;
  createdAt: Date;
  type: string;
  data?: unknown;
}

export interface StateStoreConfig {
  ttl?: number;
}

export class StateStore {
  private store: Map<string, PendingRequest>;
  private ttl: number;
  private cleanupTimer: ReturnType<typeof setInterval> | null;

  constructor(config: StateStoreConfig = {}) {
    this.store = new Map();
    this.ttl = config.ttl ?? DEFAULT_TTL;
    this.cleanupTimer = null;
    this.startCleanup();
  }

  set(transactionId: string, state: Omit<PendingRequest, 'transactionId' | 'createdAt'>): void {
    const pendingRequest: PendingRequest = {
      transactionId,
      createdAt: new Date(),
      ...state,
    };
    this.store.set(transactionId, pendingRequest);
  }

  get(transactionId: string): PendingRequest | undefined {
    return this.store.get(transactionId);
  }

  delete(transactionId: string): boolean {
    return this.store.delete(transactionId);
  }

  has(transactionId: string): boolean {
    return this.store.has(transactionId);
  }

  keys(): string[] {
    return Array.from(this.store.keys());
  }

  size(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }

  stopCleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }

  private startCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, CLEANUP_INTERVAL);
  }

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
