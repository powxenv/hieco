export const mirrorNodeKeys = {
  account: {
    info: (id: string) => ["mirror-node", "account", "info", id] as const,
    balances: (id: string) => ["mirror-node", "account", "balances", id] as const,
    tokens: (id: string) => ["mirror-node", "account", "tokens", id] as const,
    nfts: (id: string) => ["mirror-node", "account", "nfts", id] as const,
    stakingRewards: (id: string) => ["mirror-node", "account", "rewards", id] as const,
    cryptoAllowances: (id: string) =>
      ["mirror-node", "account", "allowances", "crypto", id] as const,
    tokenAllowances: (id: string) => ["mirror-node", "account", "allowances", "token", id] as const,
    nftAllowances: (id: string) => ["mirror-node", "account", "allowances", "nft", id] as const,
    outstandingAirdrops: (id: string) =>
      ["mirror-node", "account", "airdrops", "outstanding", id] as const,
    pendingAirdrops: (id: string) => ["mirror-node", "account", "airdrops", "pending", id] as const,
    list: () => ["mirror-node", "accounts", "list"] as const,
  },
  token: {
    info: (id: string) => ["mirror-node", "token", "info", id] as const,
    balances: (id: string) => ["mirror-node", "token", "balances", id] as const,
    nfts: (id: string) => ["mirror-node", "token", "nfts", id] as const,
    nft: (tokenId: string, serialNumber: number) =>
      ["mirror-node", "token", "nft", tokenId, serialNumber] as const,
    nftTransactions: (tokenId: string, serialNumber: number) =>
      ["mirror-node", "token", "nft", "transactions", tokenId, serialNumber] as const,
    list: () => ["mirror-node", "tokens", "list"] as const,
  },
  contract: {
    info: (id: string) => ["mirror-node", "contract", "info", id] as const,
    results: (id: string) => ["mirror-node", "contract", "results", id] as const,
    result: (id: string, timestamp: string) =>
      ["mirror-node", "contract", "result", id, timestamp] as const,
    state: (id: string) => ["mirror-node", "contract", "state", id] as const,
    logs: (id: string) => ["mirror-node", "contract", "logs", id] as const,
    allResults: () => ["mirror-node", "contract", "results", "all"] as const,
    resultByTx: (txHash: string) => ["mirror-node", "contract", "results", "byTx", txHash] as const,
    resultActions: (txHash: string) =>
      ["mirror-node", "contract", "results", "actions", txHash] as const,
    resultOpcodes: (txHash: string) =>
      ["mirror-node", "contract", "results", "opcodes", txHash] as const,
    allLogs: () => ["mirror-node", "contract", "results", "logs", "all"] as const,
    call: () => ["mirror-node", "contract", "call"] as const,
    list: () => ["mirror-node", "contracts", "list"] as const,
  },
  transaction: {
    info: (id: string) => ["mirror-node", "transaction", "info", id] as const,
    byAccount: (id: string) => ["mirror-node", "transaction", "account", id] as const,
    list: () => ["mirror-node", "transactions", "list"] as const,
  },
  topic: {
    info: (id: string) => ["mirror-node", "topic", "info", id] as const,
    messages: (id: string) => ["mirror-node", "topic", "messages", id] as const,
    message: (id: string, sequenceNumber: number) =>
      ["mirror-node", "topic", "message", id, sequenceNumber] as const,
    messageByTimestamp: (timestamp: string) =>
      ["mirror-node", "topic", "message", "byTimestamp", timestamp] as const,
    list: () => ["mirror-node", "topics", "list"] as const,
  },
  schedule: {
    info: (id: string) => ["mirror-node", "schedule", "info", id] as const,
    list: () => ["mirror-node", "schedules", "list"] as const,
  },
  network: {
    exchangeRate: () => ["mirror-node", "network", "exchange-rate"] as const,
    fees: () => ["mirror-node", "network", "fees"] as const,
    nodes: () => ["mirror-node", "network", "nodes"] as const,
    stake: () => ["mirror-node", "network", "stake"] as const,
    supply: () => ["mirror-node", "network", "supply"] as const,
  },
  balance: {
    list: () => ["mirror-node", "balances", "list"] as const,
  },
  block: {
    list: () => ["mirror-node", "blocks", "list"] as const,
    info: (hashOrNumber: string) => ["mirror-node", "block", "info", hashOrNumber] as const,
  },
};
