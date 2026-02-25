import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import type { NetworkType } from "../types/config.js";
import type { MirrorMockConfig, MirrorMockServer } from "../types/config.js";
import { NETWORK_URLS } from "./constants.js";

export { createFixtureHandlers } from "./handlers.js";

const createDefaultHandlers = (network: NetworkType) => [
  http.get(`${NETWORK_URLS[network]}/api/v1/accounts/:id`, ({ params }) => {
    const { id } = params;
    return HttpResponse.json({
      account: id,
      balance: { balance: 100000000000, timestamp: Date.now() },
      expiry_timestamp: null,
    });
  }),

  http.get(`${NETWORK_URLS[network]}/api/v1/transactions`, () => {
    return HttpResponse.json({
      transactions: [],
      links: {},
    });
  }),

  http.get(`${NETWORK_URLS[network]}/api/v1/transactions/:id`, ({ params }) => {
    return HttpResponse.json({
      transaction_id: params.id,
      consensus_timestamp: Date.now().toString(),
      result: "SUCCESS",
      name: "CRYPTOTRANSFER",
    });
  }),

  http.get(`${NETWORK_URLS[network]}/api/v1/balances`, () => {
    return HttpResponse.json({
      balances: [],
      timestamp: Date.now().toString(),
      links: {},
    });
  }),

  http.get(`${NETWORK_URLS[network]}/api/v1/balances/:id`, ({ params }) => {
    return HttpResponse.json({
      balances: [{ account: params.id, balance: 100000000000, tokens: [] }],
      timestamp: Date.now().toString(),
    });
  }),

  http.get(`${NETWORK_URLS[network]}/api/v1/tokens`, () => {
    return HttpResponse.json({ tokens: [], links: {} });
  }),

  http.get(`${NETWORK_URLS[network]}/api/v1/tokens/:id`, ({ params }) => {
    return HttpResponse.json({
      token_id: params.id,
      name: "Test Token",
      symbol: "TT",
      decimals: 8,
      total_supply: 100000000,
      type: "FUNGIBLE_COMMON",
    });
  }),
];

export const setupMirrorMock = (
  config: MirrorMockConfig = { network: "testnet" },
): MirrorMockServer => {
  const server = setupServer(...createDefaultHandlers(config.network));

  return {
    server,
    listen: () =>
      server.listen({
        onUnhandledRequest: config.onUnhandledRequest ?? "error",
      }),
    resetHandlers: () => server.resetHandlers(),
    close: () => server.close(),
    use: (...handlers) => server.use(...handlers),
  };
};
