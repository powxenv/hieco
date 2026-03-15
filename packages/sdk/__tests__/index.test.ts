import { describe, expect, test } from "bun:test";
import { KeyList, Mnemonic, PrivateKey, PublicKey } from "@hiero-ledger/sdk";
import { hieco } from "../src";
import * as sdk from "../src";

describe("@hieco/sdk", () => {
  test("re-exports native key primitives from the top-level barrel", () => {
    expect(sdk.KeyList).toBe(KeyList);
    expect(sdk.Mnemonic).toBe(Mnemonic);
    expect(sdk.PrivateKey).toBe(PrivateKey);
    expect(sdk.PublicKey).toBe(PublicKey);
  });

  test("keeps the main SDK entrypoint intact", () => {
    expect(typeof hieco).toBe("function");
  });
});
