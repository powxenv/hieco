import { describe, test, expect, beforeEach, afterEach } from "@jest/globals";
import { createMirrorNodeClient } from "@hieco/mirror";
import { http, HttpResponse } from "msw";
import { setupMirrorMock } from "../server/setup.js";
import { NETWORK_URLS } from "../server/constants.js";
import { mockSchedule } from "../fixtures/mirror/schedule.js";
import { poll } from "../utils/poll.js";

describe("mirror schedule polling", () => {
  const network = "testnet" as const;
  const mirror = createMirrorNodeClient(network);
  const server = setupMirrorMock({ network });

  beforeEach(() => {
    server.listen();
  });

  afterEach(() => {
    server.resetHandlers();
    server.close();
  });

  test("polls until schedule executed_timestamp is present", async () => {
    const scheduleId = "0.0.7777" as const;
    const executedTimestamp = "1704067200.000000001" as const;

    let calls = 0;
    server.resetHandlers();
    server.use(
      http.get(`${NETWORK_URLS[network]}/api/v1/schedules/:id`, ({ params }) => {
        if (params.id !== scheduleId) {
          return HttpResponse.json({ error: "not_found" }, { status: 404 as const });
        }

        calls += 1;
        const schedule = mockSchedule.build({
          schedule_id: scheduleId,
          executed_timestamp: calls >= 3 ? executedTimestamp : null,
          deleted: false,
        });

        return HttpResponse.json(schedule);
      }),
    );

    const schedule = await poll(
      async () => {
        const result = await mirror.schedule.getInfo(scheduleId);
        expect(result.success).toBe(true);
        if (!result.success) return { done: false };
        if (!result.data.executed_timestamp) return { done: false };
        return { done: true, value: result.data };
      },
      { timeoutMs: 2500, intervalMs: 10 },
    );

    expect(schedule.schedule_id).toBe(scheduleId);
    expect(schedule.executed_timestamp).toBe(executedTimestamp);
  });
});
