/**
 * Async Poller
 * Waits for callbacks via state store polling
 */

import type { StateStore } from './store';

/**
 * Poller configuration
 */
export interface PollerConfig {
  /** State store to poll */
  stateStore: StateStore;
  /** Poll interval in milliseconds (default: 100) */
  pollInterval?: number;
  /** Default timeout in milliseconds (default: 5000) */
  defaultTimeout?: number;
}

/**
 * Poll result
 */
export interface PollResult<T = unknown> {
  /** Whether the poll was successful */
  success: boolean;
  /** The result data if successful */
  data?: T;
  /** Error message if failed */
  error?: string;
}

/**
 * Async Poller for callbacks
 * Polls state store for updates
 */
export class AsyncPoller {
  private stateStore: StateStore;
  private pollInterval: number;
  private defaultTimeout: number;

  constructor(config: PollerConfig) {
    this.stateStore = config.stateStore;
    this.pollInterval = config.pollInterval ?? 100;
    this.defaultTimeout = config.defaultTimeout ?? 5000;
  }

  /**
   * Wait for callback result
   * @param transactionId - Transaction ID to wait for
   * @param timeout - Timeout in milliseconds (uses default if not provided)
   * @returns Promise resolving to result or rejecting on timeout
   */
  async waitForCallback<T = unknown>(
    transactionId: string,
    timeout?: number
  ): Promise<T> {
    const actualTimeout = timeout ?? this.defaultTimeout;
    const startTime = Date.now();

    return new Promise<T>((resolve, reject) => {
      const poll = () => {
        const elapsed = Date.now() - startTime;

        // Check timeout
        if (elapsed >= actualTimeout) {
          reject(new Error(`Timeout waiting for callback: ${transactionId}`));
          return;
        }

        // Check if result is available
        const state = this.stateStore.get(transactionId);

        if (state && state.data && typeof state.data === 'object') {
          const result = state.data as { result?: T; error?: string };

          if (result.error) {
            reject(new Error(result.error));
            return;
          }

          if (result.result !== undefined) {
            resolve(result.result);
            return;
          }
        }

        // Continue polling
        setTimeout(poll, this.pollInterval);
      };

      // Start polling
      poll();
    });
  }

  /**
   * Wait with custom check function
   * @param check - Function to check if condition is met
   * @param timeout - Timeout in milliseconds
   * @returns Promise resolving when condition is met or rejecting on timeout
   */
  async waitUntil<T = unknown>(
    check: () => T | null | undefined,
    timeout?: number
  ): Promise<T> {
    const actualTimeout = timeout ?? this.defaultTimeout;
    const startTime = Date.now();

    return new Promise<T>((resolve, reject) => {
      const poll = () => {
        const elapsed = Date.now() - startTime;

        // Check timeout
        if (elapsed >= actualTimeout) {
          reject(new Error('Timeout waiting for condition'));
          return;
        }

        // Check condition
        const result = check();

        if (result !== null && result !== undefined) {
          resolve(result);
          return;
        }

        // Continue polling
        setTimeout(poll, this.pollInterval);
      };

      // Start polling
      poll();
    });
  }

  /**
   * Get the poll interval
   */
  getPollInterval(): number {
    return this.pollInterval;
  }

  /**
   * Get the default timeout
   */
  getDefaultTimeout(): number {
    return this.defaultTimeout;
  }
}

/**
 * Create a callback result for state store
 * @param result - Result data
 * @returns Callback result object
 */
export function createCallbackResult<T>(result: T): { result: T } {
  return { result };
}

/**
 * Create a callback error for state store
 * @param error - Error message
 * @returns Callback error object
 */
export function createCallbackError(error: string): { error: string } {
  return { error };
}
