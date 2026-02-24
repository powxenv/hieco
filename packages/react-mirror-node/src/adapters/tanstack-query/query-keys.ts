export const mirrorNodeKeys = {
  account: {
    info: (network: string, id: string) => ["mirror-node", network, "account", "info", id] as const,
    balances: (network: string, id: string) => ["mirror-node", network, "account", "balances", id] as const,
    tokens: (network: string, id: string) => ["mirror-node", network, "account", "tokens", id] as const,
    nfts: (network: string, id: string) => ["mirror-node", network, "account", "nfts", id] as const,
    stakingRewards: (network: string, id: string) => ["mirror-node", network, "account", "rewards", id] as const,
    cryptoAllowances: (network: string, id: string) =>
      ["mirror-node", network, "account", "allowances", "crypto", id] as const,
    tokenAllowances: (network: string, id: string) => ["mirror-node", network, "account", "allowances", "token", id] as const,
    nftAllowances: (network: string, id: string) => ["mirror-node", network, "account", "allowances", "nft", id] as const,
    outstandingAirdrops: (network: string, id: string) =>
      ["mirror-node", network, "account", "airdrops", "outstanding", id] as const,
    pendingAirdrops: (network: string, id: string) => ["mirror-node", network, "account", "airdrops", "pending", id] as const,
    list: (network: string) => ["mirror-node", network, "accounts", "list"] as const,
  },
  token: {
    info: (network: string, id: string) => ["mirror-node", network, "token", "info", id] as const,
    balances: (network: string, id: string) => ["mirror-node", network, "token", "balances", id] as const,
    nfts: (network: string, id: string) => ["mirror-node", network, "token", "nfts", id] as const,
    nft: (network: string, tokenId: string, serialNumber: number) =>
      ["mirror-node", network, "token", "nft", tokenId, serialNumber] as const,
    nftTransactions: (network: string, tokenId: string, serialNumber: number) =>
      ["mirror-node", network, "token", "nft", "transactions", tokenId, serialNumber] as const,
    list: (network: string) => ["mirror-node", network, "tokens", "list"] as const,
  },
  contract: {
    info: (network: string, id: string) => ["mirror-node", network, "contract", "info", id] as const,
    results: (network: string, id: string) => ["mirror-node", network, "contract", "results", id] as const,
    result: (network: string, id: string, timestamp: string) =>
      ["mirror-node", network, "contract", "result", id, timestamp] as const,
    state: (network: string, id: string) => ["mirror-node", network, "contract", "state", id] as const,
    logs: (network: string, id: string) => ["mirror-node", network, "contract", "logs", id] as const,
    allResults: (network: string) => ["mirror-node", network, "contract", "results", "all"] as const,
    resultByTx: (network: string, txHash: string) => ["mirror-node", network, "contract", "results", "byTx", txHash] as const,
    resultActions: (network: string, txHash: string) =>
      ["mirror-node", network, "contract", "results", "actions", txHash] as const,
    resultOpcodes: (network: string, txHash: string) =>
      ["mirror-node", network, "contract", "results", "opcodes", txHash] as const,
    allLogs: (network: string) => ["mirror-node", network, "contract", "results", "logs", "all"] as const,
    call: (network: string) => ["mirror-node", network, "contract", "call"] as const,
    list: (network: string) => ["mirror-node", network, "contracts", "list"] as const,
  },
  transaction: {
    info: (network: string, id: string) => ["mirror-node", network, "transaction", "info", id] as const,
    byAccount: (network: string, id: string) => ["mirror-node", network, "transaction", "account", id] as const,
    list: (network: string) => ["mirror-node", network, "transactions", "list"] as const,
  },
  topic: {
    info: (network: string, id: string) => ["mirror-node", network, "topic", "info", id] as const,
    messages: (network: string, id: string) => ["mirror-node", network, "topic", "messages", id] as const,
    message: (network: string, id: string, sequenceNumber: number) =>
      ["mirror-node", network, "topic", "message", id, sequenceNumber] as const,
    messageByTimestamp: (network: string, timestamp: string) =>
      ["mirror-node", network, "topic", "message", "byTimestamp", timestamp] as const,
    list: (network: string) => ["mirror-node", network, "topics", "list"] as const,
  },
  schedule: {
    info: (network: string, id: string) => ["mirror-node", network, "schedule", "info", id] as const,
    list: (network: string) => ["mirror-node", network, "schedules", "list"] as const,
  },
  network: {
    exchangeRate: (network: string) => ["mirror-node", network, "network", "exchange-rate"] as const,
    fees: (network: string) => ["mirror-node", network, "network", "fees"] as const,
    nodes: (network: string) => ["mirror-node", network, "network", "nodes"] as const,
    stake: (network: string) => ["mirror-node", network, "network", "stake"] as const,
    supply: (network: string) => ["mirror-node", network, "network", "supply"] as const,
  },
  balance: {
    list: (network: string) => ["mirror-node", network, "balances", "list"] as const,
  },
  block: {
    list: (network: string) => ["mirror-node", network, "blocks", "list"] as const,
    info: (network: string, hashOrNumber: string) => ["mirror-node", network, "block", "info", hashOrNumber] as const,
  },
};
