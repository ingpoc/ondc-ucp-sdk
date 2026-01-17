import type { StateStore } from './store';

export interface PollerConfig {
  stateStore: StateStore;
  pollInterval?: number;
  defaultTimeout?: number;
}

export interface PollResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

const DEFAULT_POLL_INTERVAL = 100;
const DEFAULT_TIMEOUT = 5000;

export class AsyncPoller {
  private stateStore: StateStore;
  private pollInterval: number;
  private defaultTimeout: number;

  constructor(config: PollerConfig) {
    this.stateStore = config.stateStore;
    this.pollInterval = config.pollInterval ?? DEFAULT_POLL_INTERVAL;
    this.defaultTimeout = config.defaultTimeout ?? DEFAULT_TIMEOUT;
  }

  async waitForCallback<T = unknown>(
    transactionId: string,
    timeout?: number
  ): Promise<T> {
    const actualTimeout = timeout ?? this.defaultTimeout;
    const startTime = Date.now();

    return new Promise<T>((resolve, reject) => {
      const checkCallback = () => {
        const state = this.stateStore.get(transactionId);

        if (state && state.data && typeof state.data === 'object') {
          const result = state.data as { result?: T; error?: string };

          if (result.error) {
            reject(new Error(result.error));
            return true;
          }

          if (result.result !== undefined) {
            resolve(result.result);
            return true;
          }
        }

        return false;
      };

      this.poll(checkCallback, actualTimeout, startTime, `Timeout waiting for callback: ${transactionId}`, resolve, reject);
    });
  }

  async waitUntil<T = unknown>(
    check: () => T | null | undefined,
    timeout?: number
  ): Promise<T> {
    const actualTimeout = timeout ?? this.defaultTimeout;
    const startTime = Date.now();

    return new Promise<T>((resolve, reject) => {
      const checkCondition = () => {
        const result = check();

        if (result !== null && result !== undefined) {
          resolve(result);
          return true;
        }

        return false;
      };

      this.poll(checkCondition, actualTimeout, startTime, 'Timeout waiting for condition', resolve, reject);
    });
  }

  private poll(
    check: () => boolean,
    timeout: number,
    startTime: number,
    timeoutMessage: string,
    resolve: (value: unknown) => void,
    reject: (reason?: Error) => void
  ): void {
    const elapsed = Date.now() - startTime;

    if (elapsed >= timeout) {
      reject(new Error(timeoutMessage));
      return;
    }

    if (check()) {
      return;
    }

    setTimeout(() => this.poll(check, timeout, startTime, timeoutMessage, resolve, reject), this.pollInterval);
  }

  getPollInterval(): number {
    return this.pollInterval;
  }

  getDefaultTimeout(): number {
    return this.defaultTimeout;
  }
}

export function createCallbackResult<T>(result: T): { result: T } {
  return { result };
}

export function createCallbackError(error: string): { error: string } {
  return { error };
}
