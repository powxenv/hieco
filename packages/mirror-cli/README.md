# @hiecom/mirror-cli

CLI tool for querying Hedera Mirror Node REST API.

## Features

- **53 Commands** - Complete coverage of Hedera Mirror Node REST API
- **All Data Types** - Accounts, tokens, transactions, blocks, contracts, schedules, topics, network
- **Multiple Networks** - Mainnet, testnet, previewnet support
- **Flexible Output** - Formatted tables or JSON for programmatic use
- **Filtering & Pagination** - Built-in support for queries with filters
- **Zero Setup** - Use via bunx/npx without installation

## Installation

No installation required - use via **bunx** or **npx**:

```bash
bunx @hiecom/mirror-cli <command> [options]
npx @hiecom/mirror-cli <command> [options]
```

## Quick Start

```bash
# Check account balance
bunx @hiecom/mirror-cli balance 0.0.123

# Get transaction details
bunx @hiecom/mirror-cli transaction 0.0.123@1654321@987654321

# Query token information
bunx @hiecom/mirror-cli token 0.0.456

# Network status
bunx @hiecom/mirror-cli network

# JSON output
bunx @hiecom/mirror-cli account 0.0.123 --json
```

## Global Options

| Option                   | Description                                           |
| ------------------------ | ----------------------------------------------------- |
| `-n, --network <net>`    | `mainnet`, `testnet`, `previewnet` (default: mainnet) |
| `-j, --json`             | Output as JSON (default: formatted table)             |
| `-u, --mirror-url <url>` | Custom Mirror Node URL                                |
| `--limit <num>`          | Limit results                                         |
| `--order <asc\|desc>`    | Sort order                                            |

## Commands

### Accounts (13 commands)

```bash
# Account info
bunx @hiecom/mirror-cli account <accountId>

# Account balance
bunx @hiecom/mirror-cli balance <accountId>

# Account balances with filters
bunx @hiecom/mirror-cli balances --account <accountId>

# List all balances
bunx @hiecom/mirror-cli balances:list

# Account tokens
bunx @hiecom/mirror-cli account:tokens <accountId>

# Account NFTs
bunx @hiecom/mirror-cli account:nfts <accountId>

# Staking rewards
bunx @hiecom/mirror-cli account:rewards <accountId>

# HBAR allowances
bunx @hiecom/mirror-cli account:crypto-allowances <accountId>

# Token allowances
bunx @hiecom/mirror-cli account:token-allowances <accountId>

# NFT allowances
bunx @hiecom/mirror-cli account:nft-allowances <accountId>

# Outstanding airdrops
bunx @hiecom/mirror-cli account:airdrops:outstanding <accountId>

# Pending airdrops
bunx @hiecom/mirror-cli account:airdrops:pending <accountId>

# List accounts
bunx @hiecom/mirror-cli accounts:list --balance-gte 100000000000
```

### Tokens (6 commands)

```bash
# Token info
bunx @hiecom/mirror-cli token <tokenId>

# Token balances
bunx @hiecom/mirror-cli token:balances <tokenId>

# Token NFTs
bunx @hiecom/mirror-cli token:nfts <tokenId>

# Specific NFT
bunx @hiecom/mirror-cli token:nft <tokenId> <serial>

# NFT transactions
bunx @hiecom/mirror-cli token:nft:transactions <tokenId> <serial>

# List tokens
bunx @hiecom/mirror-cli tokens:list
```

### Transactions (3 commands)

```bash
# Transaction details
bunx @hiecom/mirror-cli transaction <transactionId>

# Transactions by account
bunx @hiecom/mirror-cli transactions:account <accountId>

# List transactions
bunx @hiecom/mirror-cli transactions:list
```

### Blocks (3 commands)

```bash
# Block info
bunx @hiecom/mirror-cli block <hashOrNumber>

# Query blocks
bunx @hiecom/mirror-cli blocks

# List blocks
bunx @hiecom/mirror-cli blocks:list
```

### Contracts (12 commands)

```bash
# Contract info
bunx @hiecom/mirror-cli contract <contractId>

# Contract call
bunx @hiecom/mirror-cli contract:call <contractId> --data <hex>

# Contract results
bunx @hiecom/mirror-cli contract:results <contractId>

# Specific result
bunx @hiecom/mirror-cli contract:result <contractId> <timestamp>

# Contract state
bunx @hiecom/mirror-cli contract:state <contractId>

# Contract logs
bunx @hiecom/mirror-cli contract:logs <contractId>

# All contract results
bunx @hiecom/mirror-cli contracts:results

# Result by transaction
bunx @hiecom/mirror-cli contract:by-tx <transactionIdOrHash>

# Result actions
bunx @hiecom/mirror-cli contract:actions <transactionIdOrHash>

# Result opcodes
bunx @hiecom/mirror-cli contract:opcodes <transactionIdOrHash>

# List contracts
bunx @hiecom/mirror-cli contracts:list
```

### Schedules (2 commands)

```bash
# Schedule info
bunx @hiecom/mirror-cli schedule <scheduleId>

# List schedules
bunx @hiecom/mirror-cli schedules:list
```

### Topics (5 commands)

```bash
# Topic info
bunx @hiecom/mirror-cli topic <topicId>

# Topic messages
bunx @hiecom/mirror-cli topic:messages <topicId>

# Specific message
bunx @hiecom/mirror-cli topic:message <topicId> <sequenceNumber>

# Message by timestamp
bunx @hiecom/mirror-cli topic:message-by-timestamp <timestamp>

# List topics
bunx @hiecom/mirror-cli topics:list
```

### Network (7 commands)

```bash
# Network information
bunx @hiecom/mirror-cli network

# Exchange rate
bunx @hiecom/mirror-cli network:exchange-rate

# Network fees
bunx @hiecom/mirror-cli network:fees

# Network nodes
bunx @hiecom/mirror-cli network:nodes

# Network stake
bunx @hiecom/mirror-cli network:stake

# Network supply
bunx @hiecom/mirror-cli network:supply

# List network nodes
bunx @hiecom/mirror-cli network:nodes:list
```

## ID Formats

| Type                  | Format                          | Example                     |
| --------------------- | ------------------------------- | --------------------------- |
| Entity                | `shard.realm.num`               | `0.0.123`                   |
| Transaction           | `shard.realm.num@seconds@nanos` | `0.0.123@1654321@987654321` |
| Timestamp (ISO)       | `YYYY-MM-DDTHH:MM:SSZ`          | `2024-01-01T00:00:00Z`      |
| Timestamp (consensus) | `seconds.nanos`                 | `1654321.987654321`         |

## Output Formats

**Table (default):**

```
┌─────────────────────┬──────────────────┐
│ Field               │ Value            │
├─────────────────────┼──────────────────┤
│ Account ID          │ 0.0.123          │
│ Balance             │ 1000.00000000 ℏ  │
└─────────────────────┴──────────────────┘
```

**JSON (`-j`):**

```json
{
  "Account ID": "0.0.123",
  "Balance": "1000.00000000 ℏ"
}
```

## Agent Skills

This package includes an **Agent Skill** at [`skills/hedera-mirror-cli/`](../../skills/hedera-mirror-cli/) that enables AI agents to use the CLI effectively.

The skill provides:

- Complete command reference for all 53 commands
- Detailed API documentation organized by category
- Usage patterns and best practices
- Filtering and pagination guide

AI agents can use this skill to query Hedera blockchain data by invoking CLI commands via bunx/npx.

## Related Packages

- [`@hiecom/mirror-js`](https://www.npmjs.com/package/@hiecom/mirror-js) - REST API client for programmatic access
- [`@hiecom/mirror-react`](https://www.npmjs.com/package/@hiecom/mirror-react) - React hooks with TanStack Query
- [`@hiecom/mirror-preact`](https://www.npmjs.com/package/@hiecom/mirror-preact) - Preact hooks with TanStack Query
- [`@hiecom/mirror-solid`](https://www.npmjs.com/package/@hiecom/mirror-solid) - SolidJS hooks with TanStack Query

## License

MIT
