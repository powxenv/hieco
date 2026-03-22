import { describe, expect, test } from "bun:test";
import { QueryClient } from "@tanstack/query-core";
import { isValidEntityId } from "./entity";
import { toApiError } from "./guards";
import { findMethodMapping, invalidateQueries, isValidMirrorNodeKey } from "./helpers";

describe("mirror helpers", () => {
  test("validates Hedera entity IDs", () => {
    expect(isValidEntityId("0.0.123")).toBe(true);
    expect(isValidEntityId("9999999999.1.1")).toBe(true);
    expect(isValidEntityId("0.0")).toBe(false);
    expect(isValidEntityId("0.0.12345678901")).toBe(false);
    expect(isValidEntityId("account-1")).toBe(false);
  });

  test("normalizes tagged API errors", () => {
    expect(
      toApiError({
        _tag: "ValidationError",
        message: "Invalid input",
        code: "BAD_INPUT",
      }),
    ).toEqual({
      _tag: "ValidationError",
      message: "Invalid input",
      code: "BAD_INPUT",
    });

    expect(toApiError(new Error("Boom"))).toEqual({
      _tag: "UnknownError",
      message: "Boom",
    });
  });

  test("recognizes valid mirror-node query keys", () => {
    expect(isValidMirrorNodeKey(["mirror-node", "testnet", "account", "info", "0.0.123"])).toBe(
      true,
    );
    expect(isValidMirrorNodeKey(["mirror-node", "testnet", "account"])).toBe(false);
    expect(isValidMirrorNodeKey(["mirror-node", 1, "account", "info"])).toBe(false);
  });

  test("finds mirror method mappings from query keys", () => {
    const result = findMethodMapping(["mirror-node", "testnet", "account", "info", "0.0.123"]);

    expect(result).not.toBeNull();
    expect(result?.mapping.apiProperty).toBe("account");
    expect(result?.mapping.methodName).toBe("getInfo");
    expect(result?.args).toEqual(["0.0.123"]);
    expect(findMethodMapping(["query", "other"])).toBeNull();
  });

  test("invalidates an exact query key", async () => {
    const queryClient = new QueryClient();
    const queryKey = ["mirror-node", "testnet", "account", "info", "0.0.1"] as const;

    queryClient.setQueryData(queryKey, { account: "0.0.1" });

    await invalidateQueries(queryClient, { exactKey: queryKey });

    expect(queryClient.getQueryState(queryKey)?.isInvalidated).toBe(true);
  });

  test("invalidates matching entity queries by resource id", async () => {
    const queryClient = new QueryClient();
    const matchingKey = ["mirror-node", "testnet", "account", "info", "0.0.2"] as const;
    const otherResourceKey = ["mirror-node", "testnet", "account", "info", "0.0.3"] as const;
    const otherEntityKey = ["mirror-node", "testnet", "topic", "info", "0.0.2"] as const;

    queryClient.setQueryData(matchingKey, { account: "0.0.2" });
    queryClient.setQueryData(otherResourceKey, { account: "0.0.3" });
    queryClient.setQueryData(otherEntityKey, { topic: "0.0.2" });

    await invalidateQueries(queryClient, {
      entityType: "account",
      resourceId: "0.0.2",
    });

    expect(queryClient.getQueryState(matchingKey)?.isInvalidated).toBe(true);
    expect(queryClient.getQueryState(otherResourceKey)?.isInvalidated).toBe(false);
    expect(queryClient.getQueryState(otherEntityKey)?.isInvalidated).toBe(false);
  });
});
