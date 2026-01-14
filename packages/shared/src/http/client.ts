/**
 * ONDC HTTP Client
 * HTTP client for making authenticated requests to ONDC network
 */

import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';
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
}

/**
 * ONDC HTTP client for authenticated requests
 */
export class ONDCClient {
  private axios: AxiosInstance;
  private subscriberId: string;
  private privateKey: string;
  private keyId: string;

  constructor(config: ONDCClientConfig) {
    this.subscriberId = config.subscriberId;
    this.privateKey = config.privateKey;
    this.keyId = config.keyId ?? 'default-key';

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
   * Make an authenticated POST request
   *
   * @param path - Request path (e.g., "/search")
   * @param body - Request body (will be JSON stringified)
   * @returns Promise resolving to response data
   *
   * @example
   * ```ts
   * const client = new ONDCClient({
   *   baseURL: 'https://gateway.ondc.org',
   *   subscriberId: 'ondc.example.com',
   *   privateKey: privateKey
   * });
   * const response = await client.post('/search', { intent: {...} });
   * ```
   */
  async post<T = unknown>(path: string, body: unknown): Promise<T> {
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
  }

  /**
   * Make an authenticated GET request
   *
   * @param path - Request path
   * @returns Promise resolving to response data
   */
  async get<T = unknown>(path: string): Promise<T> {
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
