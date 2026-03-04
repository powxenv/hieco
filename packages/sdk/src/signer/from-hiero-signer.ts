import type { Signer as HieroSigner } from "@hiero-ledger/sdk";
import type { Signer } from "./types.ts";

function extractPublicKeyString(hieroSigner: HieroSigner): string {
  const accountKey = hieroSigner.getAccountKey?.();
  if (!accountKey) return "";

  const keyWithDer = accountKey as { toStringDer?: () => string };
  if (typeof keyWithDer.toStringDer === "function") {
    return keyWithDer.toStringDer();
  }

  const keyWithToString = accountKey as { toString?: () => string };
  if (typeof keyWithToString.toString === "function") {
    return keyWithToString.toString();
  }

  return "";
}

export function fromHieroSigner(hieroSigner: HieroSigner): Signer {
  const publicKeyHex = extractPublicKeyString(hieroSigner);

  return {
    getPublicKey: () => publicKeyHex,
    sign: async (message: Uint8Array) => {
      const signatures = await hieroSigner.sign([message]);
      const first = signatures[0];
      if (!first) {
        throw new Error("Hiero signer returned no signatures");
      }
      return first.signature;
    },
  };
}
