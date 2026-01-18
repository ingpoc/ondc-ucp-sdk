// src/crypto/keys.ts
import _sodium from "libsodium-wrappers";
async function initCrypto() {
  await _sodium.ready;
}
async function getSodium() {
  await _sodium.ready;
  return _sodium;
}
async function generateKeyPair() {
  const sodium = await getSodium();
  const keyPair = sodium.crypto_sign_keypair();
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
    privateKey
  };
}
async function generateKeyPairFromSeed(seed) {
  const sodium = await getSodium();
  const seedBytes = sodium.from_base64(
    seed,
    sodium.base64_variants.ORIGINAL
  );
  const keyPair = sodium.crypto_sign_seed_keypair(seedBytes);
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
    privateKey
  };
}
async function getPublicKey(privateKey) {
  const sodium = await getSodium();
  const privateKeyBytes = sodium.from_base64(
    privateKey,
    sodium.base64_variants.ORIGINAL
  );
  const publicKeyBytes = privateKeyBytes.subarray(32);
  return sodium.to_base64(
    publicKeyBytes,
    sodium.base64_variants.ORIGINAL
  );
}

// src/crypto/signing.ts
import _sodium2 from "libsodium-wrappers";
async function getSodium2() {
  await _sodium2.ready;
  return _sodium2;
}
async function signMessage(message, privateKey) {
  const sodium = await getSodium2();
  const messageBytes = sodium.from_string(message);
  const privateKeyBytes = sodium.from_base64(
    privateKey,
    sodium.base64_variants.ORIGINAL
  );
  const signatureBytes = sodium.crypto_sign_detached(
    messageBytes,
    privateKeyBytes
  );
  return sodium.to_base64(
    signatureBytes,
    sodium.base64_variants.ORIGINAL
  );
}
function verifySignature(message, signature, publicKey) {
  try {
    const sodium = _sodium2;
    const messageBytes = sodium.from_string(message);
    const signatureBytes = sodium.from_base64(
      signature,
      sodium.base64_variants.ORIGINAL
    );
    const publicKeyBytes = sodium.from_base64(
      publicKey,
      sodium.base64_variants.ORIGINAL
    );
    return sodium.crypto_sign_verify_detached(
      signatureBytes,
      messageBytes,
      publicKeyBytes
    );
  } catch {
    return false;
  }
}

// src/crypto/auth.ts
import { createHash } from "crypto";
function sha256Base64(input) {
  const hash = createHash("sha256");
  hash.update(input);
  return hash.digest("base64");
}
async function buildAuthHeader(subscriberId, privateKey, request) {
  const hashBase64 = sha256Base64(request.body);
  const signingString = `${hashBase64}.${request.created}`;
  const signature = await signMessage(signingString, privateKey);
  const keyIdPart = `${subscriberId}|${request.keyId}|ed25519`;
  return `Signature keyId="${keyIdPart}",signature="${signature}",created="${request.created}"`;
}
function parseAuthHeader(header) {
  if (!header.startsWith("Signature ")) {
    return null;
  }
  const pairsStr = header.slice("Signature ".length);
  const pairs = {};
  const regex = /(\w+)="([^"]*)"/g;
  let match;
  while ((match = regex.exec(pairsStr)) !== null) {
    const key = match[1];
    const value = match[2];
    if (key !== void 0 && value !== void 0) {
      pairs[key] = value;
    }
  }
  if (!pairs.keyId || !pairs.signature || !pairs.created) {
    return null;
  }
  const keyIdParts = pairs.keyId.split("|");
  if (keyIdParts.length !== 3) {
    return null;
  }
  const [subscriberId, keyId, algorithm] = keyIdParts;
  if (algorithm !== "ed25519") {
    return null;
  }
  return {
    subscriberId: subscriberId ?? "",
    keyId: keyId ?? "",
    algorithm,
    signature: pairs.signature,
    created: pairs.created
  };
}
async function verifyAuthHeader(header, body, publicKey) {
  const parsed = parseAuthHeader(header);
  if (!parsed) {
    return {
      subscriberId: "",
      keyId: "",
      valid: false
    };
  }
  const hashBase64 = sha256Base64(body);
  const signingString = `${hashBase64}.${parsed.created}`;
  const isValid = verifySignature(signingString, parsed.signature, publicKey);
  return {
    subscriberId: parsed.subscriberId,
    keyId: parsed.keyId,
    valid: isValid
  };
}
export {
  buildAuthHeader,
  generateKeyPair,
  generateKeyPairFromSeed,
  getPublicKey,
  initCrypto,
  parseAuthHeader,
  signMessage,
  verifyAuthHeader,
  verifySignature
};
//# sourceMappingURL=index.js.map