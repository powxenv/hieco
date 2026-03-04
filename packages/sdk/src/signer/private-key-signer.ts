import { PrivateKey } from "@hiero-ledger/sdk";
import type { Signer } from "./types.ts";

const HEX_PATTERN = /^[0-9a-fA-F]+$/;

function resolvePrivateKey(key: string): PrivateKey {
  const trimmed = key.trim();

  if (trimmed.startsWith("302")) {
    return PrivateKey.fromStringDer(trimmed);
  }

  if (HEX_PATTERN.test(trimmed)) {
    if (trimmed.length === 64) {
      return PrivateKey.fromStringED25519(trimmed);
    }
    if (trimmed.length === 66 || trimmed.length === 128) {
      return PrivateKey.fromStringECDSA(trimmed);
    }
  }

  return PrivateKey.fromStringDer(trimmed);
}

export function privateKeySigner(keyString: string): Signer {
  const privateKey = resolvePrivateKey(keyString);
  const publicKeyHex = privateKey.publicKey.toStringDer();

  return {
    getPublicKey: () => publicKeyHex,
    sign: (message: Uint8Array) => Promise.resolve(privateKey.sign(message)),
  };
}
