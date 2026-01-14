/**
 * Ed25519 Signing
 * Uses libsodium-wrappers for message signing and verification
 */

import _sodium from 'libsodium-wrappers';

/**
 * Get sodium instance (ensures it's ready)
 */
async function getSodium() {
  await _sodium.ready;
  return _sodium;
}

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
export async function signMessage(
  message: string,
  privateKey: string
): Promise<string> {
  const sodium = await getSodium();

  // Convert message to bytes
  const messageBytes = sodium.from_string(message);

  // Decode private key from base64
  const privateKeyBytes = sodium.from_base64(
    privateKey,
    sodium.base64_variants.ORIGINAL
  );

  // Sign using detached signature (returns only signature, not message+sig)
  const signatureBytes = sodium.crypto_sign_detached(
    messageBytes,
    privateKeyBytes
  );

  // Encode signature to base64
  return sodium.to_base64(
    signatureBytes,
    sodium.base64_variants.ORIGINAL
  );
}

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
export function verifySignature(
  message: string,
  signature: string,
  publicKey: string
): boolean {
  try {
    const sodium = _sodium;

    // Convert message to bytes
    const messageBytes = sodium.from_string(message);

    // Decode signature from base64
    const signatureBytes = sodium.from_base64(
      signature,
      sodium.base64_variants.ORIGINAL
    );

    // Decode public key from base64
    const publicKeyBytes = sodium.from_base64(
      publicKey,
      sodium.base64_variants.ORIGINAL
    );

    // Verify signature
    return sodium.crypto_sign_verify_detached(
      signatureBytes,
      messageBytes,
      publicKeyBytes
    );
  } catch {
    return false;
  }
}
