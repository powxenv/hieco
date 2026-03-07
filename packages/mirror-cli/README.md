# @hieco/mirror-cli

## Overview

`@hieco/mirror-cli` is a command-line client for Hedera Mirror Node data.

It provides:

- one `hieco` binary for accounts, tokens, transactions, blocks, contracts, schedules, topics, and network data
- read-only commands that map directly to `@hieco/mirror`
- JSON output for scripting and shell automation
- built-in network selection and custom Mirror Node endpoint overrides

## Installation

```bash
npm install --global @hieco/mirror-cli
```

```bash
pnpm add --global @hieco/mirror-cli
```

```bash
yarn global add @hieco/mirror-cli
```

```bash
bun add --global @hieco/mirror-cli
```

You can also run the CLI without installing it:

```bash
bunx @hieco/mirror-cli --help
```

## When To Use This Package

Use `@hieco/mirror-cli` when you want to:

- inspect Hedera Mirror Node data from a terminal
- script read-only blockchain queries in CI, shells, or local tooling
- verify API responses without writing application code
- explore accounts, contracts, transactions, topics, and network state quickly

If you need a programmatic client, use [`@hieco/mirror`](../mirror/README.md).

## Quick Start

After installation, use the `hieco` binary. If you prefer not to install it, replace `hieco` with `bunx @hieco/mirror-cli`.

```bash
hieco account 0.0.1001
hieco balance 0.0.1001
hieco token 0.0.2001
hieco transactions:list --account 0.0.1001 --limit 10
hieco contract:call 0.0.3001 --data 0x70a082310000000000000000000000000000000000000000000000000000000000000001
hieco network:exchange-rate
```

## Core Concepts

### Command Structure

The CLI uses one flat command namespace:

- single-resource reads like `account`, `token`, `transaction`, and `block`
- filtered collection reads like `balances`, `blocks`, and `contract:results`
- exhaustive list commands like `accounts:list`, `tokens:list`, and `topics:list`

### Global Flags

Every command accepts the same network-level flags:

- `-n, --network <network>` to choose `mainnet`, `testnet`, or `previewnet`
- `-u, --mirror-url <url>` to query a custom Mirror Node endpoint

### Output Modes

Most commands accept `-j, --json` for machine-friendly output. Without it, the CLI renders a formatted terminal view.

## Advanced

### JSON Output

```bash
hieco account 0.0.1001 --json
hieco contract:logs 0.0.3001 --topic0 0xddf252ad --json
```

### Custom Networks And Endpoints

```bash
hieco accounts:list --network testnet --limit 5
hieco tokens:list --mirror-url https://testnet.mirrornode.hedera.com --limit 5
```

### Shell Scripting

```bash
hieco transactions:list --account 0.0.1001 --limit 25 --json > transactions.json
hieco topic:messages 0.0.5005 --encoding utf-8 --json > topic-messages.json
```

### Command Composition

```bash
hieco accounts:list --memo treasury --limit 10
hieco contract:result 0.0.3001 1700000000.123456789 --json
hieco network:nodes --order asc --limit 20
```

## API Reference

### Global Options

| Option                    | Kind | Purpose                                         | Usage form                           |
| ------------------------- | ---- | ----------------------------------------------- | ------------------------------------ |
| `-n, --network <network>` | flag | Choose `mainnet`, `testnet`, or `previewnet`.   | `hieco ... --network testnet`        |
| `-u, --mirror-url <url>`  | flag | Override the default Mirror Node REST endpoint. | `hieco ... --mirror-url https://...` |

### Account Commands

| Command                        | Purpose                                        | Arguments     | Options                                                                                                                                                                                                        |
| ------------------------------ | ---------------------------------------------- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `account`                      | Query account information.                     | `<accountId>` | `-t, --timestamp <timestamp>`, `-j, --json`                                                                                                                                                                    |
| `balance`                      | Query account balances (HBAR plus tokens).     | `<accountId>` | `-j, --json`                                                                                                                                                                                                   |
| `balances`                     | Query aggregated balances with filters.        | none          | `--account`, `--account-balance`, `--limit`, `--order`, `--public-key`, `-t`, `-j`                                                                                                                             |
| `balances:list`                | List all account balances.                     | none          | `--account`, `--account-balance`, `--limit`, `--order`, `--public-key`, `-t`, `-j`                                                                                                                             |
| `account:tokens`               | Query all tokens associated with an account.   | `<accountId>` | `--token-id`, `-j`                                                                                                                                                                                             |
| `account:nfts`                 | Query all NFTs held by an account.             | `<accountId>` | `--spender-id`, `--token-id`, `--serial-number`, `-j`                                                                                                                                                          |
| `account:rewards`              | Query staking rewards for an account.          | `<accountId>` | `-t, --timestamp <timestamp>`, `-j, --json`                                                                                                                                                                    |
| `account:crypto-allowances`    | Query HBAR allowances granted by an account.   | `<accountId>` | `--spender-id`, `-j`                                                                                                                                                                                           |
| `account:token-allowances`     | Query token allowances granted by an account.  | `<accountId>` | `--spender-id`, `--token-id`, `-j`                                                                                                                                                                             |
| `account:nft-allowances`       | Query NFT allowances granted by an account.    | `<accountId>` | `--account-id`, `--token-id`, `--owner`, `-j`                                                                                                                                                                  |
| `account:airdrops:outstanding` | Query outstanding NFT airdrops for an account. | `<accountId>` | `--receiver-id`, `--serial-number`, `--token-id`, `-j`                                                                                                                                                         |
| `account:airdrops:pending`     | Query pending NFT airdrops for an account.     | `<accountId>` | `--sender-id`, `--serial-number`, `--token-id`, `-j`                                                                                                                                                           |
| `accounts:list`                | List Hedera accounts with filters.             | none          | `--account`, `--alias`, `--balance`, `--balance-gte`, `--balance-lte`, `--evm-address`, `--key`, `--limit`, `--memo`, `--order`, `--public-key`, `--smart-contract`, `--staked-account`, `--staked-node`, `-j` |

### Token Commands

| Command                  | Purpose                                      | Arguments                  | Options                                                                                      |
| ------------------------ | -------------------------------------------- | -------------------------- | -------------------------------------------------------------------------------------------- |
| `token`                  | Query token information.                     | `<tokenId>`                | `-t, --timestamp <timestamp>`, `-j, --json`                                                  |
| `token:balances`         | Query all account balances for a token.      | `<tokenId>`                | `--account-id`, `--account-balance`, `--account-public-key`, `-t`, `-j`                      |
| `token:nfts`             | Query all NFTs for a token.                  | `<tokenId>`                | `--account-id`, `--serial-number`, `-j`                                                      |
| `token:nft`              | Query one NFT by token ID and serial number. | `<tokenId> <serialNumber>` | `-j, --json`                                                                                 |
| `token:nft:transactions` | Query all transactions for an NFT.           | `<tokenId> <serialNumber>` | `-t, --timestamp <timestamp>`, `-j, --json`                                                  |
| `tokens:list`            | List Hedera tokens with filters.             | none                       | `--account-id`, `--token-id`, `--limit`, `--name`, `--order`, `--public-key`, `--type`, `-j` |

### Transaction Commands

| Command                | Purpose                                  | Arguments         | Options                                                                                                                                                                                   |
| ---------------------- | ---------------------------------------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `transaction`          | Query one transaction by transaction ID. | `<transactionId>` | `--nonce`, `--scheduled`, `-j`                                                                                                                                                            |
| `transactions:account` | Query all transactions for an account.   | `<accountId>`     | `--result`, `--scheduled`, `-t`, `--transaction-id`, `--transaction-hash`, `--transaction-type`, `--type`, `-j`                                                                           |
| `transactions:list`    | List Hedera transactions with filters.   | none              | `--account`, `--account-id`, `--limit`, `--order`, `--result`, `--scheduled`, `-t`, `--transaction-hash`, `--transaction-id`, `--transaction-type`, `--transfers-account`, `--type`, `-j` |

### Block Commands

| Command       | Purpose                                    | Arguments             | Options                                            |
| ------------- | ------------------------------------------ | --------------------- | -------------------------------------------------- |
| `block`       | Query block information by hash or number. | `<blockHashOrNumber>` | `-j, --json`                                       |
| `blocks`      | Query block information with filters.      | none                  | `--block-number`, `--limit`, `--order`, `-t`, `-j` |
| `blocks:list` | List Hedera blocks.                        | none                  | `--block-number`, `--limit`, `--order`, `-t`, `-j` |

### Contract Commands

| Command             | Purpose                                                  | Arguments                  | Options                                                                                     |
| ------------------- | -------------------------------------------------------- | -------------------------- | ------------------------------------------------------------------------------------------- |
| `contract`          | Query smart contract information.                        | `<contractId>`             | `-t, --timestamp <timestamp>`, `-j, --json`                                                 |
| `contract:call`     | Execute a read-only smart contract call.                 | `<contractId>`             | `--from`, `--gas`, `--gas-price`, `--data`, `--estimate`, `--block`, `--value`, `-j`        |
| `contract:results`  | Query contract execution results for one contract.       | `<contractId>`             | `--block-hash`, `--block-number`, `--from`, `--internal`, `-t`, `--transaction-index`, `-j` |
| `contract:result`   | Query one contract result by timestamp.                  | `<contractId> <timestamp>` | `-j, --json`                                                                                |
| `contract:state`    | Query contract storage state.                            | `<contractId>`             | `--slot`, `-t`, `-j`                                                                        |
| `contract:logs`     | Query contract event logs.                               | `<contractId>`             | `--index`, `-t`, `--topic0`, `--topic1`, `--topic2`, `--topic3`, `--transaction-hash`, `-j` |
| `contracts:results` | Query contract execution results across all contracts.   | none                       | `--from`, `--block-hash`, `--block-number`, `--internal`, `-t`, `--transaction-index`, `-j` |
| `contract:by-tx`    | Query one contract result by transaction ID or hash.     | `<transactionIdOrHash>`    | `--nonce`, `-j`                                                                             |
| `contract:actions`  | Query contract result actions by transaction ID or hash. | `<transactionIdOrHash>`    | `--index`, `-j`                                                                             |
| `contract:opcodes`  | Query contract result opcodes by transaction ID or hash. | `<transactionIdOrHash>`    | `--stack`, `--memory`, `--storage`, `-j`                                                    |
| `contracts:list`    | List Hedera smart contracts.                             | none                       | `--address`, `--contract-id`, `--limit`, `--order`, `--smart-contract-id`, `-j`             |

### Schedule Commands

| Command          | Purpose                                  | Arguments      | Options                                                                                                                                                                                           |
| ---------------- | ---------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `schedule`       | Query scheduled transaction information. | `<scheduleId>` | `-j, --json`                                                                                                                                                                                      |
| `schedules:list` | List scheduled transactions.             | none           | `--account-id`, `--admin-key`, `--creator-account-id`, `--deleted`, `--executed-timestamp`, `--expiration-timestamp`, `--limit`, `--memo`, `--order`, `--payer-account-id`, `--schedule-id`, `-j` |

### Topic Commands

| Command                      | Purpose                                     | Arguments                    | Options                                                                          |
| ---------------------------- | ------------------------------------------- | ---------------------------- | -------------------------------------------------------------------------------- |
| `topic`                      | Query topic information.                    | `<topicId>`                  | `-j, --json`                                                                     |
| `topic:messages`             | Query all messages from a topic.            | `<topicId>`                  | `--encoding`, `--sequence-number`, `-t`, `--transaction-id`, `--scheduled`, `-j` |
| `topic:message`              | Query one topic message by sequence number. | `<topicId> <sequenceNumber>` | `-j, --json`                                                                     |
| `topic:message-by-timestamp` | Query one topic message by timestamp.       | `<timestamp>`                | `-j, --json`                                                                     |
| `topics:list`                | List Hedera consensus topics.               | none                         | `--limit`, `--order`, `-j`                                                       |

### Network Commands

| Command                 | Purpose                              | Arguments | Options                                              |
| ----------------------- | ------------------------------------ | --------- | ---------------------------------------------------- |
| `network`               | Query network information.           | none      | `-j, --json`                                         |
| `network:exchange-rate` | Query the HBAR to USD exchange rate. | none      | `-t, --timestamp <timestamp>`, `-j, --json`          |
| `network:fees`          | Query network fee schedules.         | none      | `--limit`, `--order`, `-t`, `-j`                     |
| `network:nodes`         | Query network node information.      | none      | `--file-id`, `--node-id`, `--limit`, `--order`, `-j` |
| `network:stake`         | Query network staking information.   | none      | `-j, --json`                                         |
| `network:supply`        | Query HBAR supply information.       | none      | `-j, --json`                                         |
| `network:nodes:list`    | List network nodes.                  | none      | `--file-id`, `--node-id`, `--limit`, `--order`, `-j` |

## Related Packages

- [`@hieco/mirror`](../mirror/README.md) for the underlying Mirror Node client
- [`@hieco/mirror-mcp`](../mirror-mcp/README.md) for the same data surface exposed as an MCP server
- [`@hieco/mirror-react`](../mirror-react/README.md) for React bindings
