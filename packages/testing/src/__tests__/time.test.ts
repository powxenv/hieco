import { describe, test, expect, beforeEach, afterEach } from "@jest/globals";
import { TimeController } from "../mock/time/time-controller.js";

describe("TimeController", () => {
  let time: TimeController;

  beforeEach(() => {
    time = new TimeController();
  });

  afterEach(() => {
    time.reset();
  });

  describe("now", () => {
    test("returns current time by default", () => {
      const now = time.now();
      expect(now).toBeInstanceOf(Date);
      expect(Date.now() - now.getTime()).toBeLessThan(100);
    });

    test("returns frozen time when frozen", () => {
      const frozenTime = new Date("2024-01-01T00:00:00Z");
      time.freeze(frozenTime);

      const now = time.now();
      expect(now.toISOString()).toBe(frozenTime.toISOString());
    });

    test("frozen time does not change", () => {
      time.freeze(new Date("2024-01-01T00:00:00Z"));

      const first = time.now();
      const second = time.now();

      expect(first.getTime()).toBe(second.getTime());
    });
  });

  describe("setTime", () => {
    test("sets current time to specific timestamp", () => {
      const timestamp = new Date("2024-06-15T12:30:00Z");
      time.setTime(timestamp);

      const now = time.now();
      expect(now.getTime()).toBeCloseTo(timestamp.getTime(), -3);
    });

    test("unfreezes time when set", () => {
      time.freeze(new Date("2024-01-01T00:00:00Z"));
      expect(time.isFrozen).toBe(true);

      time.setTime(new Date("2024-06-15T12:30:00Z"));
      expect(time.isFrozen).toBe(false);
    });
  });

  describe("freeze", () => {
    test("freezes time at current moment", () => {
      const beforeFreeze = Date.now();
      time.freeze();
      const afterFreeze = Date.now();

      const frozen = time.now();
      expect(frozen.getTime()).toBeGreaterThanOrEqual(beforeFreeze);
      expect(frozen.getTime()).toBeLessThanOrEqual(afterFreeze);
    });

    test("freezes time at specific timestamp", () => {
      const timestamp = new Date("2024-01-01T00:00:00Z");
      time.freeze(timestamp);

      expect(time.now().toISOString()).toBe(timestamp.toISOString());
    });

    test("sets isFrozen to true", () => {
      expect(time.isFrozen).toBe(false);
      time.freeze();
      expect(time.isFrozen).toBe(true);
    });
  });

  describe("unfreeze", () => {
    test("unfreezes time", () => {
      time.freeze();
      expect(time.isFrozen).toBe(true);

      time.unfreeze();
      expect(time.isFrozen).toBe(false);
    });

    test("time continues after unfreeze", () => {
      time.freeze(new Date("2024-01-01T00:00:00Z"));

      const frozen = time.now();
      time.unfreeze();

      time.advance(100);

      const after = time.now();
      expect(after.getTime()).toBeGreaterThan(frozen.getTime());
    });
  });

  describe("advance", () => {
    test("advances time when frozen", () => {
      time.freeze(new Date("2024-01-01T00:00:00Z"));

      time.advance(1000);

      expect(time.now().toISOString()).toBe("2024-01-01T00:00:01.000Z");
    });

    test("advances time when not frozen", () => {
      const before = time.now();
      time.advance(5000);

      const now = time.now();
      expect(now.getTime()).toBeCloseTo(before.getTime() + 5000, -3);
    });

    test("can advance multiple times", () => {
      time.freeze(new Date("2024-01-01T00:00:00Z"));

      time.advance(1000);
      expect(time.now().toISOString()).toBe("2024-01-01T00:00:01.000Z");

      time.advance(2000);
      expect(time.now().toISOString()).toBe("2024-01-01T00:00:03.000Z");

      time.advance(500);
      expect(time.now().toISOString()).toBe("2024-01-01T00:00:03.500Z");
    });

    test("handles negative values", () => {
      time.freeze(new Date("2024-01-01T00:00:10.000Z"));

      time.advance(-5000);

      expect(time.now().toISOString()).toBe("2024-01-01T00:00:05.000Z");
    });
  });

  describe("reset", () => {
    test("resets to current system time", () => {
      time.freeze(new Date("2024-01-01T00:00:00Z"));
      time.advance(10000);

      time.reset();

      expect(time.isFrozen).toBe(false);
      expect(time.offset).toBe(0);

      const now = time.now();
      expect(Date.now() - now.getTime()).toBeLessThan(100);
    });
  });

  describe("isFrozen", () => {
    test("returns false by default", () => {
      expect(time.isFrozen).toBe(false);
    });

    test("returns true after freeze", () => {
      time.freeze();
      expect(time.isFrozen).toBe(true);
    });

    test("returns false after unfreeze", () => {
      time.freeze();
      time.unfreeze();
      expect(time.isFrozen).toBe(false);
    });
  });

  describe("offset", () => {
    test("returns offset in milliseconds", () => {
      const offset = 5000;
      time.advance(offset);

      expect(time.offset).toBe(offset);
    });

    test("updates when advancing time", () => {
      time.advance(1000);
      expect(time.offset).toBe(1000);

      time.advance(2000);
      expect(time.offset).toBe(3000);
    });
  });
});
