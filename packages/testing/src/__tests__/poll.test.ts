import { describe, test, expect } from "@jest/globals";
import { poll, PollTimeoutError } from "../utils/poll.js";

describe("poll", () => {
  test("resolves when done", async () => {
    let value = 0;

    const result = await poll(async () => {
      value += 1;
      if (value < 3) return { done: false };
      return { done: true, value };
    });

    expect(result).toBe(3);
  });

  test("throws PollTimeoutError when it times out", async () => {
    const promise = poll(async () => ({ done: false }), {
      timeoutMs: 10,
      intervalMs: 0,
    });

    await expect(promise).rejects.toBeInstanceOf(PollTimeoutError);
  });
});
