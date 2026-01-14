/**
 * Ed25519 Key Generation
 * Uses libsodium-wrappers for cryptographic key generation
 */

import _sodium from 'libsodium-wrappers';

/**
 * Key pair generated using Ed25519
 */
export interface KeyPair {
  /** Base64 encoded public key */
  publicKey: string;
  /** Base64 encoded private key (seed) */
  privateKey: string;
}

/**
 * Initialize libsodium
 * Must be called before any crypto operations
 */
export async function initCrypto(): Promise<void> {
  await _sodium.ready;
}

/**
 * Get sodium instance (ensures it's ready)
 */
async function getSodium() {
  await _sodium.ready;
  return _sodium;
}

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
export async function generateKeyPair(): Promise<KeyPair> {
  const sodium = await getSodium();

  // Generate Ed25519 key pair
  const keyPair = sodium.crypto_sign_keypair();

  // Encode to base64
  const publicKey = sodium.to_base64(
    keyPair.publicKey,
    sodium.base64_variants.ORIGINAL
  );

  const privateKey = sodium.to_base64(
    keyPair.privateKey,
    sodium.base64_variants.ORIGINAL
  );

  return {
    publicKey,
    privateKey,
  };
}

/**
 * Generate key pair from seed
 *
 * @param seed - Base64 encoded seed (32 bytes)
 * @returns Promise resolving to base64-encoded key pair
 */
export async function generateKeyPairFromSeed(
  seed: string
): Promise<KeyPair> {
  const sodium = await getSodium();

  // Decode seed from base64
  const seedBytes = sodium.from_base64(
    seed,
    sodium.base64_variants.ORIGINAL
  );

  // Generate key pair from seed
  const keyPair = sodium.crypto_sign_seed_keypair(seedBytes);

  // Encode to base64
  const publicKey = sodium.to_base64(
    keyPair.publicKey,
    sodium.base64_variants.ORIGINAL
  );

  const privateKey = sodium.to_base64(
    keyPair.privateKey,
    sodium.base64_variants.ORIGINAL
  );

  return {
    publicKey,
    privateKey,
  };
}

/**
 * Extract public key from private key
 *
 * @param privateKey - Base64 encoded private key (64 bytes: 32 seed + 32 public key)
 * @returns Promise resolving to base64-encoded public key
 */
export async function getPublicKey(privateKey: string): Promise<string> {
  const sodium = await getSodium();

  // Decode private key from base64
  const privateKeyBytes = sodium.from_base64(
    privateKey,
    sodium.base64_variants.ORIGINAL
  );

  // In libsodium Ed25519, the private key format is:
  // First 32 bytes: seed
  // Last 32 bytes: public key
  // Extract the last 32 bytes (public key portion)
  const publicKeyBytes = privateKeyBytes.subarray(32);

  // Encode to base64
  return sodium.to_base64(
    publicKeyBytes,
    sodium.base64_variants.ORIGINAL
  );
}
