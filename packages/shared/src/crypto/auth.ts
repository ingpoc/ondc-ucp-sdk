/**
 * ONDC Authorization Header
 * Builds ONDC-compliant Signature headers for authenticated requests
 */

import { createHash } from 'crypto';
import { signMessage, verifySignature } from './signing';

/**
 * Compute SHA-256 hash and return base64 encoded string
 */
function sha256Base64(input: string): string {
  const hash = createHash('sha256');
  hash.update(input);
  return hash.digest('base64');
}

/**
 * Request to be signed in ONDC auth header
 */
export interface AuthHeaderRequest {
  /** Request body to hash and sign (JSON stringified) */
  body: string;
  /** ISO 8601 timestamp for when the request was created */
  created: string;
  /** Unique key identifier for this subscriber's key */
  keyId: string;
}

/**
 * Build ONDC Authorization header
 *
 * @param subscriberId - Subscriber ID (e.g., "ondc.example.com")
 * @param privateKey - Base64 encoded Ed25519 private key
 * @param request - Request details to sign
 * @returns Formatted Authorization header value
 *
 * @example
 * ```ts
 * const header = await buildAuthHeader(
 *   'ondc.example.com',
 *   privateKey,
 *   {
 *     body: JSON.stringify({ context: {...}, message: {...} }),
 *     created: '2025-01-14T10:30:00.000Z',
 *     keyId: 'key-1'
 *   }
 * );
 * // Returns: Signature keyId="ondc.example.com|key-1|ed25519",signature="...",created="2025-01-14T10:30:00.000Z"
 * ```
 */
export async function buildAuthHeader(
  subscriberId: string,
  privateKey: string,
  request: AuthHeaderRequest
): Promise<string> {
  // Hash the request body using SHA-256
  const hashBase64 = sha256Base64(request.body);

  // Create signing string: body hash + created timestamp
  // Format: {hash}.{created}
  const signingString = `${hashBase64}.${request.created}`;

  // Sign the signing string
  const signature = await signMessage(signingString, privateKey);

  // Build the header value
  // Format: Signature keyId="{subscriberId}|{keyId}|ed25519",signature="{base64}",created="{timestamp}"
  const keyIdPart = `${subscriberId}|${request.keyId}|ed25519`;

  return `Signature keyId="${keyIdPart}",signature="${signature}",created="${request.created}"`;
}

/**
 * Extract signing string components for verification
 *
 * @param header - Authorization header value
 * @returns Extracted components or null if invalid format
 *
 * @example
 * ```ts
 * const parts = parseAuthHeader('Signature keyId="a|b|ed25519",signature="xyz",created="2025-..."');
 * // Returns: { subscriberId: 'a', keyId: 'b', algorithm: 'ed25519', signature: 'xyz', created: '2025-...' }
 * ```
 */
export function parseAuthHeader(header: string): {
  subscriberId: string;
  keyId: string;
  algorithm: string;
  signature: string;
  created: string;
} | null {
  // Check for Signature prefix
  if (!header.startsWith('Signature ')) {
    return null;
  }

  // Extract the key-value pairs after "Signature "
  const pairsStr = header.slice('Signature '.length);

  // Parse key="value" pairs
  const pairs: Record<string, string> = {};
  const regex = /(\w+)="([^"]*)"/g;
  let match;

  while ((match = regex.exec(pairsStr)) !== null) {
    const key = match[1];
    const value = match[2];
    if (key !== undefined && value !== undefined) {
      pairs[key] = value;
    }
  }

  // Validate required fields
  if (!pairs.keyId || !pairs.signature || !pairs.created) {
    return null;
  }

  // Parse keyId format: subscriberId|keyId|algorithm
  const keyIdParts = pairs.keyId.split('|');
  if (keyIdParts.length !== 3) {
    return null;
  }

  const [subscriberId, keyId, algorithm] = keyIdParts;

  if (algorithm !== 'ed25519') {
    return null;
  }

  return {
    subscriberId: subscriberId ?? '',
    keyId: keyId ?? '',
    algorithm,
    signature: pairs.signature,
    created: pairs.created,
  };
}

/**
 * Verified authorization header result
 */
export interface VerifiedAuth {
  /** Subscriber ID from the header */
  subscriberId: string;
  /** Key ID from the header */
  keyId: string;
  /** Whether the signature is valid */
  valid: boolean;
}

/**
 * Verify ONDC Authorization header
 *
 * @param header - Authorization header value
 * @param body - Raw request body (JSON string)
 * @param publicKey - Base64 encoded Ed25519 public key of the subscriber
 * @returns Verification result with subscriber info and validity
 *
 * @example
 * ```ts
 * const result = await verifyAuthHeader(
 *   'Signature keyId="ondc.example.com|key-1|ed25519",signature="...",created="2025-..."',
 *   JSON.stringify(requestBody),
 *   publicKey
 * );
 * if (result.valid) {
 *   console.log('Request from:', result.subscriberId);
 * }
 * ```
 */
export async function verifyAuthHeader(
  header: string,
  body: string,
  publicKey: string
): Promise<VerifiedAuth> {
  // Parse the header
  const parsed = parseAuthHeader(header);
  if (!parsed) {
    return {
      subscriberId: '',
      keyId: '',
      valid: false,
    };
  }

  // Hash the request body using SHA-256
  const hashBase64 = sha256Base64(body);

  // Create signing string: body hash + created timestamp
  const signingString = `${hashBase64}.${parsed.created}`;

  // Verify the signature
  const isValid = verifySignature(signingString, parsed.signature, publicKey);

  return {
    subscriberId: parsed.subscriberId,
    keyId: parsed.keyId,
    valid: isValid,
  };
}
