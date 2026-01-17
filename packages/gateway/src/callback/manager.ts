/**
 * Callback Manager
 * Integrates webhook server with state store for transaction correlation
 */

import type { BecknMessage } from '@ondc-agent/shared';
import type { StateStore } from '../state/store';
import type { AsyncPoller } from '../state/poller';
import { createCallbackResult, createCallbackError } from '../state/poller';

/**
 * Callback manager configuration
 */
export interface CallbackManagerConfig {
  /** State store for pending requests */
  stateStore: StateStore;
  /** Async poller for waiting */
  poller: AsyncPoller;
}

/**
 * Callback Manager
 * Manages transaction ID correlation between requests and callbacks
 */
export class CallbackManager {
  private stateStore: StateStore;
  private poller: AsyncPoller;
  private pendingCallbacks: Map<string, Array<(message: BecknMessage) => void>>;

  constructor(config: CallbackManagerConfig) {
    this.stateStore = config.stateStore;
    this.poller = config.poller;
    this.pendingCallbacks = new Map();
  }

  /**
   * Register pending request
   */
  registerRequest(
    transactionId: string,
    type: string,
    data?: unknown
  ): void {
    this.stateStore.set(transactionId, { type, data });
  }

  /**
   * Wait for callback result
   */
  async waitForCallback<T = BecknMessage>(
    transactionId: string,
    timeout?: number
  ): Promise<T> {
    return this.poller.waitForCallback<T>(transactionId, timeout);
  }

  /**
   * Handle incoming callback and route to waiting promise
   */
  handleCallback(message: BecknMessage): void {
    const transactionId = message.context?.transaction_id;

    if (!transactionId) {
      console.warn('Callback missing transaction_id');
      return;
    }

    // Check if there's a pending request for this transaction
    const pendingRequest = this.stateStore.get(transactionId);

    if (!pendingRequest) {
      console.warn(`No pending request for transaction: ${transactionId}`);
      return;
    }

    // Store the callback result
    this.stateStore.set(transactionId, {
      type: pendingRequest.type,
      data: createCallbackResult(message),
    });

    // Notify any registered handlers
    const handlers = this.pendingCallbacks.get(transactionId) || [];
    for (const handler of handlers) {
      try {
        handler(message);
      } catch (error) {
        console.error(`Error in callback handler for ${transactionId}:`, error);
      }
    }

    // Clear handlers after notification
    this.pendingCallbacks.delete(transactionId);
  }

  /**
   * Register one-time handler for transaction
   */
  onTransaction(
    transactionId: string,
    handler: (message: BecknMessage) => void
  ): void {
    if (!this.pendingCallbacks.has(transactionId)) {
      this.pendingCallbacks.set(transactionId, []);
    }
    this.pendingCallbacks.get(transactionId)!.push(handler);
  }

  /**
   * Complete request with error
   */
  completeWithError(transactionId: string, error: string): void {
    const pendingRequest = this.stateStore.get(transactionId);

    if (pendingRequest) {
      this.stateStore.set(transactionId, {
        type: pendingRequest.type,
        data: createCallbackError(error),
      });
    }
  }

  /**
   * Complete request with result
   */
  completeWithResult<T>(transactionId: string, result: T): void {
    const pendingRequest = this.stateStore.get(transactionId);

    if (pendingRequest) {
      this.stateStore.set(transactionId, {
        type: pendingRequest.type,
        data: createCallbackResult(result),
      });
    }
  }

  /**
   * Remove pending request
   */
  removeRequest(transactionId: string): void {
    this.stateStore.delete(transactionId);
    this.pendingCallbacks.delete(transactionId);
  }

  /**
   * Get statistics about pending requests
   */
  getStats(): {
    pendingRequests: number;
    waitingHandlers: number;
    stateStoreSize: number;
  } {
    return {
      pendingRequests: this.stateStore.size(),
      waitingHandlers: this.pendingCallbacks.size,
      stateStoreSize: this.stateStore.size(),
    };
  }
}
