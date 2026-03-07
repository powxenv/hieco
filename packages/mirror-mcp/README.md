# @hieco/mirror-mcp

## Overview

`@hieco/mirror-mcp` is a stdio MCP server for Hedera Mirror Node data.

It provides:

- a ready-to-run MCP server binary named `mirror-mcp`
- read-only tools across accounts, balances, blocks, contracts, network, schedules, tokens, topics, and transactions
- runtime tools for inspecting the active network and, when enabled, switching networks for the current stdio session
- validated inputs using `Zod 4`
- environment-driven startup defaults for `mainnet`, `testnet`, `previewnet`, or a custom Mirror Node URL

## Installation

```bash
npm install --global @hieco/mirror-mcp
```

```bash
pnpm add --global @hieco/mirror-mcp
```

```bash
yarn global add @hieco/mirror-mcp
```

```bash
bun add --global @hieco/mirror-mcp
```

You can also run the server without installing it:

```bash
bunx @hieco/mirror-mcp
```

## When To Use This Package

Use `@hieco/mirror-mcp` when you want to:

- expose Hedera Mirror Node data to an AI agent or MCP-compatible client
- avoid writing custom wrappers around the Mirror Node REST API
- give a model read-only blockchain access with validated parameters
- share one consistent tool surface across local agents, editors, and desktops

If you need a terminal interface instead of MCP, use [`@hieco/mirror-cli`](../mirror-cli/README.md).

## Quick Start

Run the server locally:

```bash
bunx @hieco/mirror-mcp
```

A typical MCP client configuration points at the same stdio command:

```json
{
  "mcpServers": {
    "hedera-mirror": {
      "command": "bunx",
      "args": ["@hieco/mirror-mcp"],
      "env": {
        "MIRROR_NETWORK": "mainnet",
        "MIRROR_ALLOW_NETWORK_SWITCH": "true"
      }
    }
  }
}
```

## Core Concepts

### Stdio Server

`@hieco/mirror-mcp` starts an MCP server over standard input and output. Any MCP host that can launch a local process can use it.

### Environment-Driven Mirror Client

The server starts with one `MirrorNodeClient` from:

- `MIRROR_NETWORK`
- `MIRROR_NODE_URL`
- `MIRROR_ALLOW_NETWORK_SWITCH`

`MIRROR_NETWORK` and `MIRROR_NODE_URL` define the startup default. If network switching is enabled, later tool calls can move the active session to another built-in network or another Mirror Node URL.

### Session State

This package uses stdio, so one server process usually serves one MCP client. That makes an in-memory active network a good fit:

- the environment variables choose the startup default
- `get-current-network` reports the live session state
- `switch-network` changes the active network for subsequent tool calls
- restarting the process resets the server to its startup defaults

### Tool Shape

Each tool:

- validates its input with `Zod 4`
- calls the matching `@hieco/mirror` API
- returns the successful API payload
- throws an MCP-friendly error when the underlying Mirror API fails

## Advanced

### Environment Variables

| Variable                      | Purpose                                                             | Default         |
| ----------------------------- | ------------------------------------------------------------------- | --------------- |
| `MIRROR_NETWORK`              | Select `mainnet`, `testnet`, or `previewnet`.                       | `mainnet`       |
| `MIRROR_NODE_URL`             | Override the default Mirror Node base URL.                          | Network default |
| `MIRROR_ALLOW_NETWORK_SWITCH` | Expose the `switch-network` tool and allow session-level switching. | `false`         |

### Custom Network Routing

```bash
MIRROR_NETWORK=testnet bunx @hieco/mirror-mcp
MIRROR_NODE_URL=https://testnet.mirrornode.hedera.com bunx @hieco/mirror-mcp
MIRROR_ALLOW_NETWORK_SWITCH=true bunx @hieco/mirror-mcp
```

### Session-Level Network Switching

When `MIRROR_ALLOW_NETWORK_SWITCH=true`, the server exposes `switch-network`.

A typical flow is:

1. Call `get-current-network`
2. Call `switch-network` with `network: "testnet"`
3. Run normal read tools like `get-account-info` or `list-transactions`
4. Call `get-current-network` again to verify the active session network

You can also provide `mirrorNodeUrl` when switching if you want to route the current session to a custom Mirror Node endpoint.

```json
{
  "name": "switch-network",
  "arguments": {
    "network": "testnet"
  }
}
```

### Tool Behavior

- all tools are read-only
- runtime network state is process-local and resets when the stdio server restarts
- list tools exhaust paginated Mirror Node endpoints and return the collected results
- input validation happens before the Mirror API call
- entity IDs, transaction IDs, timestamps, limits, serial numbers, and node IDs are validated centrally

## API Reference

### Runtime Surface

| Export                        | Kind                 | Purpose                                         | Usage form                         |
| ----------------------------- | -------------------- | ----------------------------------------------- | ---------------------------------- |
| `mirror-mcp`                  | binary               | Start the MCP server over stdio.                | `mirror-mcp`                       |
| `MIRROR_NETWORK`              | environment variable | Choose the startup Hedera network.              | `MIRROR_NETWORK=testnet`           |
| `MIRROR_NODE_URL`             | environment variable | Override the startup Mirror Node base URL.      | `MIRROR_NODE_URL=https://...`      |
| `MIRROR_ALLOW_NETWORK_SWITCH` | environment variable | Enable the session-level `switch-network` tool. | `MIRROR_ALLOW_NETWORK_SWITCH=true` |

### Runtime Tools

| Tool ID               | Purpose                                                                                                                                   | Input fields               |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| `get-current-network` | Get the current active network, effective Mirror Node URL, startup defaults, and switch capability.                                       | none                       |
| `list-networks`       | List the built-in Hedera networks and mark the default and current entries.                                                               | none                       |
| `switch-network`      | Switch the active network for subsequent tool calls in the current stdio session. Only available when `MIRROR_ALLOW_NETWORK_SWITCH=true`. | `network`, `mirrorNodeUrl` |

### Account Tools

| Tool ID                    | Purpose                                     | Input fields                                                                                                                                                              |
| -------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `get-account-info`         | Get detailed information about an account.  | `accountId`, `timestamp`, `transactions`                                                                                                                                  |
| `get-account-balances`     | Get all token balances for an account.      | `accountId`                                                                                                                                                               |
| `get-account-tokens`       | Get all tokens associated with an account.  | `accountId`, `tokenId`                                                                                                                                                    |
| `get-account-nfts`         | Get NFTs held by an account.                | `accountId`, `spenderId`, `tokenId`, `serialNumber`                                                                                                                       |
| `get-staking-rewards`      | Get staking rewards for an account.         | `accountId`, `timestamp`                                                                                                                                                  |
| `get-crypto-allowances`    | Get HBAR allowances granted by an account.  | `accountId`, `spenderId`                                                                                                                                                  |
| `get-token-allowances`     | Get token allowances granted by an account. | `accountId`, `spenderId`, `tokenId`                                                                                                                                       |
| `get-nft-allowances`       | Get NFT allowances granted by an account.   | `accountId`, `accountIdFilter`, `tokenId`, `owner`                                                                                                                        |
| `get-outstanding-airdrops` | Get outstanding airdrops for an account.    | `accountId`, `receiverId`, `serialNumber`, `tokenId`                                                                                                                      |
| `get-pending-airdrops`     | Get pending airdrops for an account.        | `accountId`, `senderId`, `serialNumber`, `tokenId`                                                                                                                        |
| `list-accounts`            | List accounts with filters.                 | `account`, `alias`, `balance`, `balanceGte`, `balanceLte`, `evmAddress`, `key`, `limit`, `memo`, `order`, `publicKey`, `smartContract`, `stakedAccountId`, `stakedNodeId` |

### Balance Tools

| Tool ID         | Purpose                                       | Input fields                                                            |
| --------------- | --------------------------------------------- | ----------------------------------------------------------------------- |
| `get-balances`  | Get aggregated account balances with filters. | `account`, `accountBalance`, `limit`, `order`, `publicKey`, `timestamp` |
| `list-balances` | List all balances.                            | `account`, `accountBalance`, `limit`, `order`, `publicKey`, `timestamp` |

### Block Tools

| Tool ID       | Purpose                             | Input fields                                 |
| ------------- | ----------------------------------- | -------------------------------------------- |
| `get-blocks`  | Get block information with filters. | `blockNumber`, `limit`, `order`, `timestamp` |
| `get-block`   | Get one block by hash or number.    | `hashOrNumber`                               |
| `list-blocks` | List all blocks.                    | `blockNumber`, `limit`, `order`, `timestamp` |

### Contract Tools

| Tool ID                     | Purpose                                                | Input fields                                                                                  |
| --------------------------- | ------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| `get-contract-info`         | Get detailed information about a contract.             | `contractIdOrAddress`, `timestamp`                                                            |
| `call-contract`             | Execute a read-only local contract call.               | `contractId`, `from`, `gas`, `gasPrice`, `data`, `estimate`, `block`, `value`                 |
| `get-contract-results`      | Get execution results for one contract.                | `contractId`, `blockHash`, `blockNumber`, `from`, `internal`, `timestamp`, `transactionIndex` |
| `get-contract-result`       | Get one contract result by timestamp.                  | `contractId`, `timestamp`                                                                     |
| `get-contract-state`        | Get contract storage state.                            | `contractId`, `slot`, `timestamp`                                                             |
| `get-contract-logs`         | Get event logs for a contract.                         | `contractId`, `index`, `timestamp`, `topic0`, `topic1`, `topic2`, `topic3`, `transactionHash` |
| `get-all-contract-results`  | Get contract results across all contracts.             | `from`, `blockHash`, `blockNumber`, `internal`, `timestamp`, `transactionIndex`               |
| `get-result-by-transaction` | Get contract result details by transaction ID or hash. | `transactionIdOrHash`, `nonce`                                                                |
| `get-result-actions`        | Get contract result actions by transaction ID or hash. | `transactionIdOrHash`, `index`                                                                |
| `get-result-opcodes`        | Get opcode traces by transaction ID or hash.           | `transactionIdOrHash`, `stack`, `memory`, `storage`                                           |
| `list-contracts`            | List contracts with filters.                           | `address`, `contractId`, `limit`, `order`, `smartContractId`                                  |

### Network Tools

| Tool ID              | Purpose                              | Input fields                         |
| -------------------- | ------------------------------------ | ------------------------------------ |
| `get-exchange-rate`  | Get the HBAR to USD exchange rate.   | `timestamp`                          |
| `get-network-fees`   | Get network fee schedules.           | `limit`, `order`, `timestamp`        |
| `get-network-nodes`  | Get information about network nodes. | `fileId`, `limit`, `nodeId`, `order` |
| `get-network-stake`  | Get network staking information.     | none                                 |
| `get-network-supply` | Get HBAR supply information.         | none                                 |
| `list-network-nodes` | List network nodes.                  | `fileId`, `limit`, `nodeId`, `order` |

### Schedule Tools

| Tool ID             | Purpose                                                 | Input fields                                                                                                                                                                            |
| ------------------- | ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `get-schedule-info` | Get detailed information about a scheduled transaction. | `scheduleId`                                                                                                                                                                            |
| `list-schedules`    | List scheduled transactions.                            | `accountId`, `adminKey`, `creatorAccountId`, `deleted`, `executedTimestamp`, `expirationTimestamp`, `limit`, `memo`, `order`, `payerAccountId`, `scheduleId`, `waitForExpiryExpiration` |

### Token Tools

| Tool ID                | Purpose                                    | Input fields                                                              |
| ---------------------- | ------------------------------------------ | ------------------------------------------------------------------------- |
| `get-token-info`       | Get detailed information about a token.    | `tokenId`, `timestamp`                                                    |
| `get-token-balances`   | Get all account balances for a token.      | `tokenId`, `accountId`, `accountBalance`, `accountPublicKey`, `timestamp` |
| `get-token-nfts`       | Get NFTs for a token.                      | `tokenId`, `accountId`, `serialNumber`                                    |
| `get-nft-by-serial`    | Get one NFT by token ID and serial number. | `tokenId`, `serialNumber`                                                 |
| `get-nft-transactions` | Get transactions for an NFT.               | `tokenId`, `serialNumber`, `timestamp`                                    |
| `list-tokens`          | List tokens with filters.                  | `accountId`, `tokenId`, `limit`, `name`, `order`, `publicKey`, `type`     |

### Topic Tools

| Tool ID                    | Purpose                                   | Input fields                                                                       |
| -------------------------- | ----------------------------------------- | ---------------------------------------------------------------------------------- |
| `get-topic-info`           | Get detailed information about a topic.   | `topicId`                                                                          |
| `get-topic-messages`       | Get all messages from a topic.            | `topicId`, `encoding`, `sequenceNumber`, `timestamp`, `transactionId`, `scheduled` |
| `get-topic-message`        | Get one topic message by sequence number. | `topicId`, `sequenceNumber`                                                        |
| `get-message-by-timestamp` | Get a topic message by timestamp.         | `timestamp`                                                                        |
| `list-topics`              | List consensus topics.                    | `limit`, `order`                                                                   |

### Transaction Tools

| Tool ID                       | Purpose                           | Input fields                                                                                                                                                    |
| ----------------------------- | --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `get-transaction`             | Get one transaction by ID.        | `nonce`, `scheduled`, `transactionId`                                                                                                                           |
| `get-transactions-by-account` | Get transactions for one account. | `accountId`, `result`, `scheduled`, `timestamp`, `transactionHash`, `transactionId`, `transactionType`, `type`                                                  |
| `list-transactions`           | List transactions with filters.   | `account`, `accountId`, `limit`, `order`, `result`, `scheduled`, `timestamp`, `transactionHash`, `transactionId`, `transactionType`, `transfersAccount`, `type` |

## Related Packages

- [`@hieco/mirror`](../mirror/README.md) for the underlying Mirror Node client
- [`@hieco/mirror-cli`](../mirror-cli/README.md) for terminal-first access to the same data surface
- [`@hieco/utils`](../utils/README.md) for shared validation and network helpers
