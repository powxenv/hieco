---
name: hedera-mirror-cli
description: Query Hedera Hashgraph blockchain data using mirror-cli CLI tool. Use for account information, transaction details, token data, smart contract interactions, blocks, network status, staking rewards, NFT ownership, consensus topics.
---

# Hedera Mirror CLI

Query Hedera Hashgraph blockchain data from Mirror Node REST API.

## Installation

```bash
bunx @hiecom/mirror-cli <command> [options]
npx @hiecom/mirror-cli <command> [options]
```

## Commands

| Category     | Commands                                                                                                                                                                                                                                                               | Docs                                          |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| Accounts     | `account`, `balance`, `balances`, `balances:list`, `account:tokens`, `account:nfts`, `account:rewards`, `account:crypto-allowances`, `account:token-allowances`, `account:nft-allowances`, `account:airdrops:outstanding`, `account:airdrops:pending`, `accounts:list` | [accounts.md](references/accounts.md)         |
| Tokens       | `token`, `token:balances`, `token:nfts`, `token:nft`, `token:nft:transactions`, `tokens:list`                                                                                                                                                                          | [tokens.md](references/tokens.md)             |
| Transactions | `transaction`, `transactions:account`, `transactions:list`                                                                                                                                                                                                             | [transactions.md](references/transactions.md) |
| Blocks       | `block`, `blocks`, `blocks:list`                                                                                                                                                                                                                                       | [blocks.md](references/blocks.md)             |
| Contracts    | `contract`, `contract:call`, `contract:results`, `contract:result`, `contract:state`, `contract:logs`, `contracts:results`, `contract:by-tx`, `contract:actions`, `contract:opcodes`, `contracts:list`                                                                 | [contracts.md](references/contracts.md)       |
| Schedules    | `schedule`, `schedules:list`                                                                                                                                                                                                                                           | [schedules.md](references/schedules.md)       |
| Topics       | `topic`, `topic:messages`, `topic:message`, `topic:message-by-timestamp`, `topics:list`                                                                                                                                                                                | [topics.md](references/topics.md)             |
| Network      | `network`, `network:exchange-rate`, `network:fees`, `network:nodes`, `network:stake`, `network:supply`, `network:nodes:list`                                                                                                                                           | [network.md](references/network.md)           |

## Global Options

| Option                   | Description                                           |
| ------------------------ | ----------------------------------------------------- |
| `-n, --network <net>`    | `mainnet`, `testnet`, `previewnet` (default: mainnet) |
| `-j, --json`             | Output as JSON (default: formatted table)             |
| `-u, --mirror-url <url>` | Custom Mirror Node URL                                |
| `--limit <num>`          | Limit results                                         |
| `--order <asc\|desc>`    | Sort order                                            |

## Examples

### Account

```bash
bunx @hiecom/mirror-cli account 0.0.123
bunx @hiecom/mirror-cli balance 0.0.123
bunx @hiecom/mirror-cli account:tokens 0.0.123
```

### Token

```bash
bunx @hiecom/mirror-cli token 0.0.456
bunx @hiecom/mirror-cli token:balances 0.0.456
bunx @hiecom/mirror-cli token:nfts 0.0.456
```

### Transaction

```bash
bunx @hiecom/mirror-cli transaction 0.0.123@1654321@987654321
bunx @hiecom/mirror-cli transactions:account 0.0.123
```

### Network

```bash
bunx @hiecom/mirror-cli network
bunx @hiecom/mirror-cli network:exchange-rate
```

## ID Formats

| Type                  | Format                          | Example                     |
| --------------------- | ------------------------------- | --------------------------- |
| Entity                | `shard.realm.num`               | `0.0.123`                   |
| Transaction           | `shard.realm.num@seconds@nanos` | `0.0.123@1654321@987654321` |
| Timestamp (ISO)       | `YYYY-MM-DDTHH:MM:SSZ`          | `2024-01-01T00:00:00Z`      |
| Timestamp (consensus) | `seconds.nanos`                 | `1654321.987654321`         |

## Documentation

- [accounts.md](references/accounts.md) - Account commands (11)
- [tokens.md](references/tokens.md) - Token commands (6)
- [transactions.md](references/transactions.md) - Transaction commands (3)
- [blocks.md](references/blocks.md) - Block commands (3)
- [contracts.md](references/contracts.md) - Contract commands (12)
- [schedules.md](references/schedules.md) - Schedule commands (2)
- [topics.md](references/topics.md) - Topic commands (5)
- [network.md](references/network.md) - Network commands (7)
- [common.md](references/common.md) - Common options and patterns
