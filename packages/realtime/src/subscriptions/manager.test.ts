import { describe, expect, test } from "bun:test";
import { SubscriptionManager } from "./manager";

describe("subscription manager", () => {
  test("tracks subscribe requests and responses", () => {
    const manager = new SubscriptionManager();
    const callback = (
      _message: Parameters<typeof manager.subscribe>[3] extends (value: infer T) => void
        ? T
        : never,
    ): void => {
      return;
    };
    const results: Array<{ readonly success: boolean }> = [];

    manager.subscribe(
      1,
      "local-1",
      {
        type: "logs",
        filter: {},
      },
      callback,
      (result) => {
        results.push({ success: result.success });
      },
    );

    expect(manager.hasPendingSubscribe(1)).toBe(true);
    expect(manager.tracked.get("local-1")?.subscription).toEqual({
      type: "logs",
      filter: {},
    });

    const pending = manager.handleSubscribeResponse(1);

    expect(pending?.localSubscriptionId).toBe("local-1");
    expect(manager.hasPendingSubscribe(1)).toBe(false);
    expect(results).toEqual([]);
  });

  test("maps pending request errors to API error tags", () => {
    const manager = new SubscriptionManager();
    const subscribeResults: Array<string> = [];
    const unsubscribeResults: Array<string> = [];
    const chainIdResults: Array<string> = [];

    manager.subscribe(
      11,
      "local-11",
      {
        type: "logs",
        filter: {},
      },
      () => {
        return;
      },
      (result) => {
        if (!result.success) {
          subscribeResults.push(`${result.error._tag}:${result.error.code}`);
        }
      },
    );
    manager.unsubscribe(12, "local-12", (result) => {
      if (!result.success) {
        unsubscribeResults.push(`${result.error._tag}:${result.error.code}`);
      }
    });
    manager.setChainId(13, {
      resolve: (result) => {
        if (!result.success) {
          chainIdResults.push(`${result.error._tag}:${result.error.code}`);
        }
      },
    });

    manager.handleError(11, { code: -32602, message: "Invalid params" });
    manager.handleError(12, { code: -32608, message: "Rate limited" });
    manager.handleError(13, { code: 4001, message: "Unknown" });

    expect(subscribeResults).toEqual(["ValidationError:-32602"]);
    expect(unsubscribeResults).toEqual(["RateLimitError:-32608"]);
    expect(chainIdResults).toEqual(["UnknownError:4001"]);
  });

  test("maps server and local subscription ids", () => {
    const manager = new SubscriptionManager();

    manager.setServerSubscription("local-1", "server-1");

    expect(manager.getLocalSubscriptionId("server-1")).toBe("local-1");
    expect(manager.getServerSubscriptionIdByLocalId("local-1")).toBe("server-1");

    manager.deleteServerSubscription("server-1");

    expect(manager.getLocalSubscriptionId("server-1")).toBeNull();
  });
});
