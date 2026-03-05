import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import type { NetworkType } from "../types/config.js";
import type { MirrorMockConfig, MirrorMockServer } from "../types/config.js";
import { NETWORK_URLS } from "./constants.js";

export { createFixtureHandlers } from "./handlers.js";

const createDefaultHandlers = (network: NetworkType) => [
  http.get(`${NETWORK_URLS[network]}/api/v1/accounts`, () => {
    return HttpResponse.json({
      accounts: [],
      links: {},
    });
  }),

  http.get(`${NETWORK_URLS[network]}/api/v1/accounts/:id`, ({ params }) => {
    const { id } = params;
    return HttpResponse.json({
      account: id,
      balance: { balance: 100000000000, timestamp: Date.now().toString() },
      expiry_timestamp: null,
      auto_renew_period: null,
      auto_renew_account: null,
      created_timestamp: Date.now().toString(),
      decline_reward: false,
      ethereum_nonce: null,
      key: null,
      max_automatic_token_associations: 0,
      memo: "",
      pending_reward: 0,
      premise_id: null,
      proxy_account_id: null,
      public_key: null,
      receiver_sig_required: false,
      reward_account: null,
      stake_period_start: null,
      staked_account_id: null,
      staked_node_id: null,
    });
  }),

  http.get(`${NETWORK_URLS[network]}/api/v1/accounts/:id/allowances`, () => {
    return HttpResponse.json({
      crypto_allowances: [],
      token_allowances: [],
      nft_allowances: [],
    });
  }),

  http.get(`${NETWORK_URLS[network]}/api/v1/accounts/:id/tokens`, () => {
    return HttpResponse.json({
      tokens: [],
      links: {},
    });
  }),

  http.get(`${NETWORK_URLS[network]}/api/v1/accounts/:id/nfts`, () => {
    return HttpResponse.json({
      nfts: [],
      links: {},
    });
  }),

  http.get(`${NETWORK_URLS[network]}/api/v1/accounts/:id/balances`, () => {
    return HttpResponse.json({
      balance: 100000000000,
      timestamp: Date.now().toString(),
      tokens: [],
    });
  }),

  http.get(`${NETWORK_URLS[network]}/api/v1/accounts/:id/rewards`, () => {
    return HttpResponse.json({
      rewards: [],
      links: {},
    });
  }),

  http.get(`${NETWORK_URLS[network]}/api/v1/accounts/:id/allowances/crypto`, () => {
    return HttpResponse.json({
      crypto_allowances: [],
      links: {},
    });
  }),

  http.get(`${NETWORK_URLS[network]}/api/v1/accounts/:id/allowances/token`, () => {
    return HttpResponse.json({
      token_allowances: [],
      links: {},
    });
  }),

  http.get(`${NETWORK_URLS[network]}/api/v1/accounts/:id/allowances/nft`, () => {
    return HttpResponse.json({
      nft_allowances: [],
      links: {},
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
      balances: [
        {
          account: params.id,
          balance: 100000000000,
          tokens: [],
        },
      ],
      timestamp: Date.now().toString(),
    });
  }),

  http.get(`${NETWORK_URLS[network]}/api/v1/transactions`, () => {
    return HttpResponse.json({
      transactions: [],
      links: {},
    });
  }),

  http.get(`${NETWORK_URLS[network]}/api/v1/transactions/:id`, ({ params }) => {
    const timestamp = Date.now().toString();
    return HttpResponse.json({
      transaction_id: params.id,
      consensus_timestamp: timestamp,
      result: "SUCCESS",
      name: "CRYPTOTRANSFER",
      charged_tx_fee: 100000,
      transaction_hash: "abc123",
      transactions: [],
      token_transfers: [],
      nft_transfers: [],
    });
  }),

  http.get(`${NETWORK_URLS[network]}/api/v1/tokens`, () => {
    return HttpResponse.json({
      tokens: [],
      links: {},
    });
  }),

  http.get(`${NETWORK_URLS[network]}/api/v1/tokens/:id`, ({ params }) => {
    return HttpResponse.json({
      token_id: params.id,
      name: "Test Token",
      symbol: "TT",
      decimals: 8,
      total_supply: 100000000,
      type: "FUNGIBLE_COMMON",
      admin_key: null,
      auto_renew_account: null,
      auto_renew_period: null,
      created_timestamp: Date.now().toString(),
      deleted: false,
      expiry_timestamp: null,
      fee_schedule_key: null,
      freeze_default: false,
      freeze_key: null,
      kyc_key: null,
      max_supply: null,
      modified_timestamp: Date.now().toString(),
      pause_key: null,
      pause_status: "NOT_PAUSED",
      supply_key: null,
      supply_type: "INFINITE",
      treasury_account_id: "0.0.1",
      memo: "",
      custom_fees: {
        created_timestamp: "0",
        fixed_fees: [],
        fractional_fees: [],
      },
    });
  }),

  http.get(`${NETWORK_URLS[network]}/api/v1/tokens/:id/balances`, () => {
    return HttpResponse.json({
      balances: [],
      links: {},
      timestamp: Date.now().toString(),
    });
  }),

  http.get(`${NETWORK_URLS[network]}/api/v1/tokens/:id/nfts`, () => {
    return HttpResponse.json({
      nfts: [],
      links: {},
    });
  }),

  http.get(`${NETWORK_URLS[network]}/api/v1/tokens/:id/nfts/:serialNumber`, ({ params }) => {
    return HttpResponse.json({
      token_id: params.id,
      serial_number: Number(params.serialNumber),
      account: "0.0.123",
      created_timestamp: Date.now().toString(),
      deleted: false,
      metadata: "test-metadata",
      modified_timestamp: Date.now().toString(),
    });
  }),

  http.get(`${NETWORK_URLS[network]}/api/v1/topics`, () => {
    return HttpResponse.json({
      topics: [],
      links: {},
    });
  }),

  http.get(`${NETWORK_URLS[network]}/api/v1/topics/:id`, ({ params }) => {
    return HttpResponse.json({
      topic_id: params.id,
      created_timestamp: Date.now().toString(),
      updated_timestamp: Date.now().toString(),
      running_hash: "abc123",
      sequence_number: 0,
      executor_account_id: null,
      auto_renew_account_id: null,
      auto_renew_period: null,
      expiration_timestamp: null,
      memo: "test topic",
      submit_key: null,
      auto_update_title_metadata: false,
      auto_update_memo: true,
    });
  }),

  http.get(`${NETWORK_URLS[network]}/api/v1/topics/:id/messages`, () => {
    return HttpResponse.json({
      messages: [],
      links: {},
    });
  }),

  http.get(`${NETWORK_URLS[network]}/api/v1/topics/:id/messages/:sequenceNumber`, ({ params }) => {
    return HttpResponse.json({
      topic_id: params.id,
      sequence_number: Number(params.sequenceNumber),
      message: "SGVsbG8gV29ybGQ=",
      consensus_timestamp: Date.now().toString(),
      running_hash: "abc123",
      previous_running_hash: null,
    });
  }),

  http.get(`${NETWORK_URLS[network]}/api/v1/topics/:id/messages/:timestamp`, ({ params }) => {
    return HttpResponse.json({
      topic_id: params.id,
      sequence_number: 1,
      message: "SGVsbG8gV29ybGQ=",
      consensus_timestamp: params.timestamp,
      running_hash: "abc123",
      previous_running_hash: null,
    });
  }),

  http.get(`${NETWORK_URLS[network]}/api/v1/contracts`, () => {
    return HttpResponse.json({
      contracts: [],
      links: {},
    });
  }),

  http.get(`${NETWORK_URLS[network]}/api/v1/contracts/:id`, ({ params }) => {
    return HttpResponse.json({
      contract_id: params.id,
      created_timestamp: Date.now().toString(),
      deleted: false,
      bytecode: null,
      auto_renew_account_id: null,
      auto_renew_period: null,
      expiration_timestamp: null,
      key: null,
      memo: "test contract",
      storage: 0,
      runtime_bytecode: null,
    });
  }),

  http.get(`${NETWORK_URLS[network]}/api/v1/contracts/:id/results`, () => {
    return HttpResponse.json({
      results: [],
      links: {},
    });
  }),

  http.get(`${NETWORK_URLS[network]}/api/v1/contracts/:id/results/:timestamp`, ({ params }) => {
    return HttpResponse.json({
      contract_id: params.id,
      result_id: params.timestamp,
      consensus_timestamp: params.timestamp,
      status: "SUCCESS",
      from: "0.0.123",
      to: "0.0.456",
      gas_used: 10000,
      function_parameters: "",
      logs: [],
    });
  }),

  http.get(`${NETWORK_URLS[network]}/api/v1/blocks`, () => {
    return HttpResponse.json({
      blocks: [],
      links: {},
    });
  }),

  http.get(`${NETWORK_URLS[network]}/api/v1/blocks/:idOrHashOrNumber`, ({ params }) => {
    const idOrHashOrNumber = params.idOrHashOrNumber;
    const timestamp = Date.now().toString();
    return HttpResponse.json({
      hash: "abc123",
      name: "123",
      number: Number(idOrHashOrNumber) || 123,
      timestamp: {
        from: timestamp,
        to: timestamp,
      },
      count: 0,
      hapi_version: "0.0.0",
      previous_hash: "previous",
    });
  }),

  http.get(`${NETWORK_URLS[network]}/api/v1/network`, () => {
    return HttpResponse.json({
      audit_trail: false,
      entities: {
        "0.0.0": {
          id: "0.0.0",
          type: "file",
        },
      },
      exchange_rate: {
        current_rate: {
          hbar_equiv: 30000,
          cent_equiv: 1,
          expiration_time: "4102444800.000000000",
        },
        next_rate: {
          hbar_equiv: 30000,
          cent_equiv: 1,
          expiration_time: "4102444800.000000000",
        },
      },
      fees: {
        node_fee_schedule: [],
        network_fee_schedule: [],
        resource_fee_schedule: [],
      },
      service_endpoints: [],
      staking: {
        decline_start: null,
        end_stake_node: null,
        max_stake_reward: null,
        min_stake: null,
        min_stake_reward: null,
        stake_period: null,
        stake_period_start: null,
        stake_to_date: null,
      },
    });
  }),

  http.get(`${NETWORK_URLS[network]}/api/v1/schedules`, () => {
    return HttpResponse.json({
      schedules: [],
      links: {},
    });
  }),

  http.get(`${NETWORK_URLS[network]}/api/v1/schedules/:id`, ({ params }) => {
    const timestamp = Date.now().toString();
    return HttpResponse.json({
      admin_key: null,
      consensus_timestamp: timestamp,
      creator_account_id: "0.0.1",
      deleted: false,
      executed_timestamp: null,
      expiration_time: null,
      memo: "",
      payer_account_id: "0.0.1",
      schedule_id: params.id,
      signatures: [],
      transaction_body: "0x",
      wait_for_expiry: false,
    });
  }),

  http.get(`${NETWORK_URLS[network]}/api/v1/accounts/:id/staking-rewards`, () => {
    return HttpResponse.json({
      rewards: [],
      links: {},
    });
  }),

  http.get(`${NETWORK_URLS[network]}/api/v1/accounts/:id/airdrops/outstanding`, () => {
    return HttpResponse.json({
      airdrops: [],
      links: {},
    });
  }),

  http.get(`${NETWORK_URLS[network]}/api/v1/accounts/:id/airdrops/pending`, () => {
    return HttpResponse.json({
      airdrops: [],
      links: {},
    });
  }),

  http.get(
    `${NETWORK_URLS[network]}/api/v1/tokens/:tokenId/nfts/:serialNumber/transactions`,
    () => {
      return HttpResponse.json({
        transactions: [],
        links: {},
      });
    },
  ),

  http.get(`${NETWORK_URLS[network]}/api/v1/contracts/:id/state`, () => {
    return HttpResponse.json({
      storage: [],
      links: {},
    });
  }),

  http.get(`${NETWORK_URLS[network]}/api/v1/contracts/:id/logs`, () => {
    return HttpResponse.json({
      logs: [],
      links: {},
    });
  }),

  http.get(`${NETWORK_URLS[network]}/api/v1/contracts/:id/results/:timestamp/actions`, () => {
    return HttpResponse.json({
      actions: [],
      links: {},
    });
  }),

  http.get(`${NETWORK_URLS[network]}/api/v1/network/fees`, () => {
    return HttpResponse.json({
      fees: {
        node_fee_schedule: [],
        network_fee_schedule: [],
        resource_fee_schedule: [],
      },
    });
  }),

  http.get(`${NETWORK_URLS[network]}/api/v1/network/nodes`, () => {
    return HttpResponse.json({
      nodes: [],
      links: {},
    });
  }),

  http.get(`${NETWORK_URLS[network]}/api/v1/network/exchangerate`, () => {
    return HttpResponse.json({
      current_rate: {
        hbar_equiv: 30000,
        cent_equiv: 1,
        expiration_time: "4102444800.000000000",
      },
      next_rate: {
        hbar_equiv: 30000,
        cent_equiv: 1,
        expiration_time: "4102444800.000000000",
      },
    });
  }),

  http.get(`${NETWORK_URLS[network]}/api/v1/network/stake`, () => {
    return HttpResponse.json({
      stake_total: 5000000000000000000,
      staking_start: 1704067200,
      stake_percent: 15.5,
      max_stake_reward: 100000000000000000,
      stake_reward_rate: 3805175038000,
      unreserved_stake_balance: 4500000000000000000,
    });
  }),

  http.get(`${NETWORK_URLS[network]}/api/v1/network/supply`, () => {
    return HttpResponse.json({
      total_coin: 5000000000000000000,
      total_coin_change: 0,
      released_coin: 5000000000000000000,
      start_coin: 5000000000000000000,
      end_coin: 5000000000000000000,
    });
  }),

  http.get(`${NETWORK_URLS[network]}/api/v1/contracts/results`, () => {
    return HttpResponse.json({
      results: [],
      links: {},
    });
  }),

  http.get(
    `${NETWORK_URLS[network]}/api/v1/contracts/results/:transactionIdOrHash`,
    ({ params }) => {
      return HttpResponse.json({
        contract_id: "0.0.456",
        result_id: params.transactionIdOrHash,
        consensus_timestamp: Date.now().toString(),
        status: "SUCCESS",
        from: "0.0.123",
        to: "0.0.456",
        gas_used: 10000,
        function_parameters: "",
        logs: [],
      });
    },
  ),

  http.get(`${NETWORK_URLS[network]}/api/v1/contracts/:id/results/logs`, () => {
    return HttpResponse.json({
      logs: [],
      links: {},
    });
  }),

  http.get(`${NETWORK_URLS[network]}/api/v1/contracts/results/logs`, () => {
    return HttpResponse.json({
      logs: [],
      links: {},
    });
  }),

  http.get(`${NETWORK_URLS[network]}/api/v1/contracts/results/:transactionIdOrHash/actions`, () => {
    return HttpResponse.json({
      actions: [],
    });
  }),

  http.get(`${NETWORK_URLS[network]}/api/v1/contracts/results/:transactionIdOrHash/opcodes`, () => {
    return HttpResponse.json({
      opcodes: [],
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
