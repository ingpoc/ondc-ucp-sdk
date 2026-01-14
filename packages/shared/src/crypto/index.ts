// Cryptographic utilities for ONDC signatures

export async function signMessage(_message: string): Promise<string> {
  // TODO: Implement libsodium-based signing
  throw new Error('Not implemented');
}

export function verifySignature(
  _message: string,
  _signature: string,
  _publicKey: string
): boolean {
  // TODO: Implement signature verification
  throw new Error('Not implemented');
}
