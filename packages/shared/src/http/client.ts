/**
 * ONDC HTTP Client
 * HTTP client for making authenticated requests to ONDC network
 */

import axios, { type AxiosInstance, type AxiosError, type AxiosRequestConfig } from 'axios';
import { buildAuthHeader, type AuthHeaderRequest } from '../crypto';

/**
 * Configuration for ONDC client
 */
export interface ONDCClientConfig {
  /** Base URL for ONDC gateway */
  baseURL: string;
  /** Subscriber ID */
  subscriberId: string;
  /** Base64 encoded Ed25519 private key */
  privateKey: string;
  /** Unique key identifier */
  keyId?: string;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Maximum number of retry attempts (default: 3) */
  maxRetries?: number;
  /** Base delay for exponential backoff in ms (default: 100) */
  retryDelay?: number;
}

/**
 * Check if error is retryable (5xx errors)
 */
function isRetryableError(error: AxiosError): boolean {
  if (!error.response) return false;
  const status = error.response.status;
  return status >= 500 && status < 600;
}

/**
 * Calculate exponential backoff delay with jitter
 */
function calculateBackoff(attempt: number, baseDelay: number): number {
  const exponentialDelay = baseDelay * Math.pow(2, attempt);
  const jitter = exponentialDelay * 0.25 * (Math.random() * 2 - 1);
  return exponentialDelay + jitter;
}

/**
 * ONDC HTTP client for authenticated requests with retry support
 */
export class ONDCClient {
  private axios: AxiosInstance;
  private subscriberId: string;
  private privateKey: string;
  private keyId: string;
  private maxRetries: number;
  private retryDelay: number;

  constructor(config: ONDCClientConfig) {
    this.subscriberId = config.subscriberId;
    this.privateKey = config.privateKey;
    this.keyId = config.keyId ?? 'default-key';
    this.maxRetries = config.maxRetries ?? 3;
    this.retryDelay = config.retryDelay ?? 100;

    this.axios = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout ?? 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
  }

  /**
   * Execute request with retry logic
   */
  private async withRetry<T>(fn: () => Promise<T>): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;

        // Check if error is retryable
        const axiosError = error as AxiosError;
        if (!isRetryableError(axiosError) || attempt === this.maxRetries) {
          throw error;
        }

        // Calculate delay and wait before retry
        const delay = calculateBackoff(attempt, this.retryDelay);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }

  /**
   * Make authenticated POST request with retry
   */
  async post<T = unknown>(path: string, body: unknown): Promise<T> {
    return this.withRetry(async () => {
      // Stringify body for signing
      const bodyString = JSON.stringify(body);

      // Create ISO 8601 timestamp
      const created = new Date().toISOString();

      // Build auth header
      const authRequest: AuthHeaderRequest = {
        body: bodyString,
        created,
        keyId: this.keyId,
      };

      const authHeader = await buildAuthHeader(
        this.subscriberId,
        this.privateKey,
        authRequest
      );

      // Make request with auth header
      const config: AxiosRequestConfig = {
        headers: {
          Authorization: authHeader,
        },
      };

      const response = await this.axios.post<T>(path, body, config);
      return response.data;
    });
  }

  /**
   * Make authenticated GET request with retry
   */
  async get<T = unknown>(path: string): Promise<T> {
    return this.withRetry(async () => {
      // Create ISO 8601 timestamp
      const created = new Date().toISOString();

      // Build auth header with empty body for GET requests
      const authRequest: AuthHeaderRequest = {
        body: '',
        created,
        keyId: this.keyId,
      };

      const authHeader = await buildAuthHeader(
        this.subscriberId,
        this.privateKey,
        authRequest
      );

      // Make request with auth header
      const config: AxiosRequestConfig = {
        headers: {
          Authorization: authHeader,
        },
      };

      const response = await this.axios.get<T>(path, config);
      return response.data;
    });
  }

  /**
   * Update subscriber credentials
   *
   * @param subscriberId - New subscriber ID
   * @param privateKey - New private key
   */
  updateCredentials(subscriberId: string, privateKey: string): void {
    this.subscriberId = subscriberId;
    this.privateKey = privateKey;
  }

  /**
   * Update key identifier
   *
   * @param keyId - New key identifier
   */
  updateKeyId(keyId: string): void {
    this.keyId = keyId;
  }

  /**
   * Get the underlying Axios instance
   *
   * Useful for custom configurations or interceptors
   */
  getAxiosInstance(): AxiosInstance {
    return this.axios;
  }
}
