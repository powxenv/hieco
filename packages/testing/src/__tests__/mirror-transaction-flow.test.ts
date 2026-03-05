import { describe, test, expect, beforeEach, afterEach } from "@jest/globals";
import { createMirrorNodeClient } from "@hieco/mirror";
import { http, HttpResponse } from "msw";
import type { TransactionDetails } from "@hieco/mirror";
import { fixtures, poll, setupMirrorMock, NETWORK_URLS } from "../index.js";

describe("mirror transaction polling", () => {
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

  test("polls until transaction is available", async () => {
    const transactionId = "0.0.7777@1704067200.000000001" as const;

    let calls = 0;
    server.resetHandlers();
    server.use(
      http.get(`${NETWORK_URLS[network]}/api/v1/transactions/:id`, ({ params }) => {
        if (params.id !== transactionId) {
          return HttpResponse.json({ error: "not_found" }, { status: 404 as const });
        }

        calls += 1;
        if (calls < 3) {
          return HttpResponse.json({ error: "not_found" }, { status: 404 as const });
        }

        const base = fixtures.mirror.mockTransaction.build({
          transaction_id: transactionId,
          consensus_timestamp: "1704067200.000000001",
          result: "SUCCESS",
          charged_tx_fee: 12345,
        });

        const details: TransactionDetails = {
          ...base,
          assessed_custom_fees: [],
        };

        return HttpResponse.json(details);
      }),
    );

    const tx = await poll(
      async () => {
        const result = await mirror.transaction.getById(transactionId);
        if (!result.success) return { done: false };
        return { done: true, value: result.data };
      },
      { timeoutMs: 2500, intervalMs: 10 },
    );

    expect(tx.transaction_id).toBe(transactionId);
    expect(tx.result).toBe("SUCCESS");
  });
});
