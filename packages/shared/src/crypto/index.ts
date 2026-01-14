/**
 * Crypto Module
 * Cryptographic utilities for ONDC signatures
 */

export {
  initCrypto,
  generateKeyPair,
  generateKeyPairFromSeed,
  getPublicKey,
  type KeyPair,
} from './keys';

// TODO: Implement signMessage and verifySignature in CRYPTO-002
export async function signMessage(_message: string): Promise<string> {
  throw new Error('Not implemented');
}

export function verifySignature(
  _message: string,
  _signature: string,
  _publicKey: string
): boolean {
  throw new Error('Not implemented');
}
