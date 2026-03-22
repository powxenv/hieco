import { describe, expect, test } from "bun:test";
import { HieroError, classifyError, createError, formatError, toHieroError, unwrap } from "./error";
import { err, ok } from "../results/result";

describe("sdk errors", () => {
  test("creates and rehydrates HieroError instances", () => {
    const shape = createError("CONFIG_INVALID_NETWORK", "Unsupported network", {
      hint: "Use mainnet, testnet, or previewnet",
      transactionId: "0.0.1@123.456",
      details: {
        status: "BUSY",
      },
    });

    const error = toHieroError(shape);

    expect(error).toBeInstanceOf(HieroError);
    expect(error.toShape()).toEqual(shape);
  });

  test("unwraps ok results and throws on errors", () => {
    expect(unwrap(ok("value"))).toBe("value");

    expect(() =>
      unwrap(
        err(
          createError("TX_PRECHECK_FAILED", "Precheck failed", {
            details: {
              status: "INVALID_SIGNATURE",
            },
          }),
        ),
      ),
    ).toThrow(HieroError);
  });

  test("classifies retryable Hiero errors", () => {
    const classification = classifyError(
      new HieroError(
        createError("NETWORK_QUERY_FAILED", "Network failed", {
          hint: "Retry later",
          transactionId: "tx-123",
          details: {
            status: "BUSY",
          },
        }),
      ),
    );

    expect(classification).toEqual({
      kind: "network",
      code: "NETWORK_QUERY_FAILED",
      status: "BUSY",
      retryable: true,
      message: "Network failed",
      hint: "Retry later",
      transactionId: "tx-123",
    });
  });

  test("classifies plain error-like objects and unknown values", () => {
    expect(
      classifyError({
        code: "UNEXPECTED_ERROR",
        message: "Unexpected condition",
        status: 503,
      }),
    ).toEqual({
      kind: "unexpected",
      code: "UNEXPECTED_ERROR",
      status: "503",
      retryable: false,
      message: '{"code":"UNEXPECTED_ERROR","message":"Unexpected condition","status":503}',
    });

    expect(classifyError("plain failure")).toEqual({
      kind: "unknown",
      retryable: false,
      message: "plain failure",
    });
  });

  test("formats classified errors into readable strings", () => {
    const formatted = formatError(
      new HieroError(
        createError("CONFIG_INVALID_KEY", "Invalid private key", {
          hint: "Use a DER-encoded private key",
          details: {
            status: "400",
          },
        }),
      ),
    );

    expect(formatted).toBe(
      "Invalid private key (CONFIG_INVALID_KEY) [status: 400] Hint: Use a DER-encoded private key",
    );
  });
});
