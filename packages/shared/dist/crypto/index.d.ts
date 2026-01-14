/**
 * Ed25519 Key Generation
 * Uses libsodium-wrappers for cryptographic key generation
 */
/**
 * Key pair generated using Ed25519
 */
interface KeyPair {
    /** Base64 encoded public key */
    publicKey: string;
    /** Base64 encoded private key (seed) */
    privateKey: string;
}
/**
 * Initialize libsodium
 * Must be called before any crypto operations
 */
declare function initCrypto(): Promise<void>;
/**
 * Generate an Ed25519 key pair
 *
 * @returns Promise resolving to base64-encoded key pair
 *
 * @example
 * ```ts
 * const { publicKey, privateKey } = await generateKeyPair();
 * console.log('Public key:', publicKey);
 * console.log('Private key:', privateKey);
 * ```
 */
declare function generateKeyPair(): Promise<KeyPair>;
/**
 * Generate key pair from seed
 *
 * @param seed - Base64 encoded seed (32 bytes)
 * @returns Promise resolving to base64-encoded key pair
 */
declare function generateKeyPairFromSeed(seed: string): Promise<KeyPair>;
/**
 * Extract public key from private key
 *
 * @param privateKey - Base64 encoded private key (64 bytes: 32 seed + 32 public key)
 * @returns Promise resolving to base64-encoded public key
 */
declare function getPublicKey(privateKey: string): Promise<string>;

/**
 * Ed25519 Signing
 * Uses libsodium-wrappers for message signing and verification
 */
/**
 * Sign a message using Ed25519 private key
 *
 * @param message - Message to sign (will be UTF-8 encoded)
 * @param privateKey - Base64 encoded private key
 * @returns Promise resolving to base64-encoded signature (64 bytes)
 *
 * @example
 * ```ts
 * const { publicKey, privateKey } = await generateKeyPair();
 * const signature = await signMessage('hello world', privateKey);
 * console.log('Signature:', signature);
 * ```
 */
declare function signMessage(message: string, privateKey: string): Promise<string>;
/**
 * Verify a signature using Ed25519 public key
 *
 * @param message - Original message (will be UTF-8 encoded)
 * @param signature - Base64 encoded signature (64 bytes)
 * @param publicKey - Base64 encoded public key (32 bytes)
 * @returns true if signature is valid, false otherwise
 *
 * @example
 * ```ts
 * const { publicKey, privateKey } = await generateKeyPair();
 * const signature = await signMessage('hello world', privateKey);
 * const isValid = verifySignature('hello world', signature, publicKey);
 * console.log('Valid:', isValid); // true
 * ```
 */
declare function verifySignature(message: string, signature: string, publicKey: string): boolean;

/**
 * ONDC Authorization Header
 * Builds ONDC-compliant Signature headers for authenticated requests
 */
/**
 * Request to be signed in ONDC auth header
 */
interface AuthHeaderRequest {
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
declare function buildAuthHeader(subscriberId: string, privateKey: string, request: AuthHeaderRequest): Promise<string>;
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
declare function parseAuthHeader(header: string): {
    subscriberId: string;
    keyId: string;
    algorithm: string;
    signature: string;
    created: string;
} | null;
/**
 * Verified authorization header result
 */
interface VerifiedAuth {
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
declare function verifyAuthHeader(header: string, body: string, publicKey: string): Promise<VerifiedAuth>;

export { type AuthHeaderRequest, type KeyPair, type VerifiedAuth, buildAuthHeader, generateKeyPair, generateKeyPairFromSeed, getPublicKey, initCrypto, parseAuthHeader, signMessage, verifyAuthHeader, verifySignature };
