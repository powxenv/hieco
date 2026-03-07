type ApiProperty =
  | "account"
  | "token"
  | "contract"
  | "transaction"
  | "topic"
  | "schedule"
  | "network"
  | "balance"
  | "block";

type KeyFactory = (
  network: string,
  ...args: ReadonlyArray<string | number>
) => readonly ["mirror-node", string, ...ReadonlyArray<string | number>];

export interface MirrorNodeMethodDefinition {
  readonly apiProperty: ApiProperty;
  readonly methodName: string;
  readonly keyPath: readonly string[];
  readonly buildKey: KeyFactory;
}

function define(
  apiProperty: ApiProperty,
  methodName: string,
  ...keyPath: ReadonlyArray<string>
): MirrorNodeMethodDefinition {
  return {
    apiProperty,
    methodName,
    keyPath,
    buildKey: (network, ...args) => ["mirror-node", network, ...keyPath, ...args] as const,
  };
}

export const mirrorNodeDefinitions = {
  account: {
    info: define("account", "getInfo", "account", "info"),
    balances: define("account", "getBalances", "account", "balances"),
    tokens: define("account", "getTokens", "account", "tokens"),
    nfts: define("account", "getNfts", "account", "nfts"),
    stakingRewards: define("account", "getStakingRewards", "account", "rewards"),
    cryptoAllowances: define("account", "getCryptoAllowances", "account", "allowances", "crypto"),
    tokenAllowances: define("account", "getTokenAllowances", "account", "allowances", "token"),
    nftAllowances: define("account", "getNftAllowances", "account", "allowances", "nft"),
    outstandingAirdrops: define(
      "account",
      "getOutstandingAirdrops",
      "account",
      "airdrops",
      "outstanding",
    ),
    pendingAirdrops: define("account", "getPendingAirdrops", "account", "airdrops", "pending"),
    list: define("account", "listPaginated", "accounts", "list"),
  },
  token: {
    info: define("token", "getInfo", "token", "info"),
    balances: define("token", "getBalances", "token", "balances"),
    balancesSnapshot: define("token", "getBalancesSnapshot", "token", "balances", "snapshot"),
    nfts: define("token", "getNfts", "token", "nfts"),
    nft: define("token", "getNft", "token", "nft"),
    nftTransactions: define("token", "getNftTransactions", "token", "nft", "transactions"),
    list: define("token", "listPaginated", "tokens", "list"),
  },
  contract: {
    info: define("contract", "getInfo", "contract", "info"),
    results: define("contract", "getResults", "contract", "results"),
    result: define("contract", "getResult", "contract", "result"),
    state: define("contract", "getState", "contract", "state"),
    logs: define("contract", "getLogs", "contract", "logs"),
    allResults: define("contract", "getAllResults", "contract", "results", "all"),
    resultByTx: define("contract", "getResultByTransactionIdOrHash", "contract", "results", "byTx"),
    resultActions: define("contract", "getResultActions", "contract", "results", "actions"),
    resultOpcodes: define("contract", "getResultOpcodes", "contract", "results", "opcodes"),
    allLogs: define("contract", "getAllContractLogs", "contract", "results", "logs", "all"),
    call: define("contract", "call", "contract", "call"),
    list: define("contract", "listPaginated", "contracts", "list"),
  },
  transaction: {
    info: define("transaction", "getById", "transaction", "info"),
    byAccount: define("transaction", "listByAccount", "transaction", "account"),
    list: define("transaction", "listPaginated", "transactions", "list"),
  },
  topic: {
    info: define("topic", "getInfo", "topic", "info"),
    messages: define("topic", "getMessages", "topic", "messages"),
    message: define("topic", "getMessage", "topic", "message"),
    messageByTimestamp: define("topic", "getMessageByTimestamp", "topic", "message", "byTimestamp"),
    list: define("topic", "listPaginated", "topics", "list"),
  },
  schedule: {
    info: define("schedule", "getInfo", "schedule", "info"),
    list: define("schedule", "listPaginated", "schedules", "list"),
  },
  network: {
    exchangeRate: define("network", "getExchangeRate", "network", "exchange-rate"),
    fees: define("network", "getFees", "network", "fees"),
    nodes: define("network", "getNodes", "network", "nodes"),
    stake: define("network", "getStake", "network", "stake"),
    supply: define("network", "getSupply", "network", "supply"),
  },
  balance: {
    list: define("balance", "getBalances", "balances", "list"),
  },
  block: {
    list: define("block", "getBlocks", "blocks", "list"),
    info: define("block", "getBlock", "block", "info"),
  },
} as const;

export const mirrorNodeMethodMappings = Object.values(mirrorNodeDefinitions).flatMap((group) =>
  Object.values(group),
);
