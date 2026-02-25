import { describe, test, expect } from "bun:test";
import { sleep, waitFor, assertThrows } from "../src/utils";

describe("sleep", () => {
  test("resolves after specified time", async () => {
    const start = Date.now();
    await sleep(100);
    const elapsed = Date.now() - start;

    expect(elapsed).toBeGreaterThanOrEqual(100);
  });
});

describe("waitFor", () => {
  test("resolves when condition is met", async () => {
    let value = 0;

    setTimeout(() => {
      value = 42;
    }, 100);

    const result = await waitFor(() => (value === 42 ? value : Promise.reject()));
    expect(result).toBe(42);
  });

  test("throws timeout when condition is not met", async () => {
    let value = 0;

    await expect(
      waitFor(() => (value === 42 ? value : Promise.reject()), { timeout: 100, interval: 10 }),
    ).rejects.toThrow("waitFor timed out");
  });

  test("retries on failure", async () => {
    let attempts = 0;

    const result = await waitFor(
      () => {
        attempts++;
        if (attempts < 3) throw new Error("not yet");
        return "success";
      },
      { timeout: 500, interval: 10 },
    );

    expect(result).toBe("success");
    expect(attempts).toBeGreaterThanOrEqual(3);
  });
});

describe("assertThrows", () => {
  test("passes when function throws", async () => {
    const error = await assertThrows(() => {
      throw new Error("test error");
    });

    expect(error.message).toBe("test error");
  });

  test("validates error type", async () => {
    const error = await assertThrows(() => {
      throw new TypeError("type error");
    }, TypeError);

    expect(error).toBeInstanceOf(TypeError);
    expect(error.message).toBe("type error");
  });

  test("throws when function does not throw", async () => {
    await expect(assertThrows(() => {})).rejects.toThrow("Expected function to throw");
  });

  test("throws when error type does not match", async () => {
    await expect(
      assertThrows(() => {
        throw new Error("test");
      }, TypeError),
    ).rejects.toThrow("Expected error to be instance of TypeError");
  });
});
