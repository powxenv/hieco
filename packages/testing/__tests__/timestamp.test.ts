import { describe, test, expect } from "bun:test";
import { timestampUtils, state } from "../src/utils";

describe("timestampUtils", () => {
  test("converts milliseconds to timestamp", () => {
    const timestamp = timestampUtils.fromMillis(1000);
    expect(timestamp).toBe("1000000000");
  });

  test("converts seconds to timestamp", () => {
    const timestamp = timestampUtils.fromSeconds(1);
    expect(timestamp).toBe("1000000000");
  });

  test("converts date to timestamp", () => {
    const date = new Date("2024-01-01T00:00:00.000Z");
    const timestamp = timestampUtils.fromDate(date);
    expect(timestamp).toBeTruthy();
  });

  test("generates current timestamp", () => {
    const timestamp = timestampUtils.now();
    expect(timestamp).toBeTruthy();
    const asDate = timestampUtils.toDate(timestamp);
    expect(Date.now() - asDate.getTime()).toBeLessThan(1000);
  });

  test("adds seconds to timestamp", () => {
    const timestamp = timestampUtils.fromSeconds(1);
    const updated = timestampUtils.addSeconds(timestamp, 5);
    expect(updated).toBe("6000000000");
  });

  test("subtracts seconds from timestamp", () => {
    const timestamp = timestampUtils.fromSeconds(10);
    const updated = timestampUtils.subtractSeconds(timestamp, 3);
    expect(updated).toBe("7000000000");
  });

  test("compares timestamps", () => {
    const earlier = timestampUtils.fromSeconds(1);
    const later = timestampUtils.fromSeconds(2);
    const same = timestampUtils.fromSeconds(1);

    expect(timestampUtils.compare(earlier, later)).toBeLessThan(0);
    expect(timestampUtils.compare(later, earlier)).toBeGreaterThan(0);
    expect(timestampUtils.compare(earlier, same)).toBe(0);
  });

  test("checks timestamp ordering", () => {
    const earlier = timestampUtils.fromSeconds(1);
    const later = timestampUtils.fromSeconds(2);

    expect(timestampUtils.before(earlier, later)).toBe(true);
    expect(timestampUtils.after(later, earlier)).toBe(true);
    expect(timestampUtils.equals(earlier, earlier)).toBe(true);
  });

  test("generates timestamp range", () => {
    const start = new Date("2024-01-01T00:00:00.000Z");
    const end = new Date("2024-01-01T00:00:10.000Z");
    const range = timestampUtils.range(start, end);

    expect(range.length).toBe(6);
  });
});

describe("state", () => {
  test("manages sequence numbers", () => {
    state.reset();

    expect(state.accountSequence).toBe(0);
    expect(state.transactionSequence).toBe(0);

    state.incrementAccount();
    state.incrementAccount();

    expect(state.accountSequence).toBe(2);
    expect(state.transactionSequence).toBe(0);
  });

  test("resets all sequences", () => {
    state.incrementAccount();
    state.incrementTransaction();
    state.incrementToken();

    expect(state.accountSequence).toBeGreaterThan(0);

    state.reset();

    expect(state.accountSequence).toBe(0);
    expect(state.transactionSequence).toBe(0);
    expect(state.tokenSequence).toBe(0);
  });
});
