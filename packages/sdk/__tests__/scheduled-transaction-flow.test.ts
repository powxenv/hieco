import { describe, test, expect, beforeAll, afterAll, beforeEach } from "bun:test";
import { createHieroClient } from "../src/index.ts";
import { setupMirrorMock } from "@hieco/testing";
import { http, HttpResponse } from "msw";

describe("ScheduledTransactionFlow", () => {
  const mock = setupMirrorMock({ network: "testnet" });

  beforeAll(() => {
    mock.listen();
  });

  afterAll(() => {
    mock.close();
  });

  beforeEach(() => {
    mock.resetHandlers();
  });

  test("waitForExecuted resolves when executed_timestamp becomes available", async () => {
    let calls = 0;
    mock.use(
      http.get("https://testnet.mirrornode.hedera.com/api/v1/schedules/:id", ({ params }) => {
        calls++;
        const scheduleId = params.id;
        const executed_timestamp = calls >= 2 ? "123.456" : null;

        return HttpResponse.json({
          admin_key: null,
          consensus_timestamp: "1.2",
          creator_account_id: "0.0.1",
          deleted: false,
          executed_timestamp,
          expiration_time: null,
          memo: "",
          payer_account_id: "0.0.1",
          schedule_id: scheduleId,
          signatures: [],
          transaction_body: "0x",
          wait_for_expiry: false,
        });
      }),
    );

    const client = createHieroClient({ network: "testnet" });
    const flow = client.scheduledTransaction({ scheduleId: "0.0.123" });

    const result = await flow.waitForExecuted({ timeoutMs: 5_000, pollIntervalMs: 1 });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.schedule.executed_timestamp).toBe("123.456");
      expect(result.data.scheduleId).toBe("0.0.123");
    }
  });

  test("waitForExecuted returns FlowError when schedule is deleted", async () => {
    mock.use(
      http.get("https://testnet.mirrornode.hedera.com/api/v1/schedules/:id", ({ params }) => {
        const scheduleId = params.id;
        return HttpResponse.json({
          admin_key: null,
          consensus_timestamp: "1.2",
          creator_account_id: "0.0.1",
          deleted: true,
          executed_timestamp: null,
          expiration_time: null,
          memo: "",
          payer_account_id: "0.0.1",
          schedule_id: scheduleId,
          signatures: [],
          transaction_body: "0x",
          wait_for_expiry: false,
        });
      }),
    );

    const client = createHieroClient({ network: "testnet" });
    const flow = client.scheduledTransaction({ scheduleId: "0.0.123" });

    const result = await flow.waitForExecuted({ timeoutMs: 50, pollIntervalMs: 1 });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error._tag).toBe("FlowError");
      if (result.error._tag === "FlowError") {
        expect(result.error.name).toBe("SCHEDULE_DELETED");
        expect(result.error.scheduleId).toBe("0.0.123");
      }
    }
  });
});
