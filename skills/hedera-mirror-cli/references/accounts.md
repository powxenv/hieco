# Account Commands

## `account <id>`

Get account details.

```bash
bunx @hiecom/mirror-cli account 0.0.123
```

| Output         | Description                          |
| -------------- | ------------------------------------ |
| Account ID     | Account identifier (shard.realm.num) |
| Balance        | HBAR balance                         |
| Key            | Public key                           |
| Alias          | EVM address alias                    |
| Deleted        | Account deletion status              |
| Smart Contract | Whether account is a smart contract  |

## `balance <id>`

Get account balances (HBAR + tokens).

```bash
bunx @hiecom/mirror-cli balance 0.0.123
```

| Output         | Description            |
| -------------- | ---------------------- |
| Account ID     | Account identifier     |
| HBAR Balance   | HBAR balance           |
| Token Balances | List of token holdings |

## `balances`

Query balances with filters.

```bash
bunx @hiecom/mirror-cli balances --account-id 0.0.123 --limit 50
```

| Option              | Description          |
| ------------------- | -------------------- | ---------- |
| `--account-id <id>` | Filter by account ID |
| `--limit <num>`     | Maximum results      |
| `--order <asc       | desc>`               | Sort order |

## `balances:list`

List all balances.

```bash
bunx @hiecom/mirror-cli balances:list --limit 100
```

## `account:tokens <id>`

Get all tokens for account.

```bash
bunx @hiecom/mirror-cli account:tokens 0.0.123 --limit 50
```

| Output   | Description          |
| -------- | -------------------- |
| Token ID | Token identifier     |
| Balance  | Token balance        |
| Decimals | Token decimal places |

## `account:nfts <id>`

Get NFTs held by account.

```bash
bunx @hiecom/mirror-cli account:nfts 0.0.123 --limit 100
```

| Output        | Description          |
| ------------- | -------------------- |
| Token ID      | NFT token identifier |
| Serial Number | NFT serial number    |
| Metadata      | NFT metadata         |

## `account:rewards <id>`

Get staking rewards.

```bash
bunx @hiecom/mirror-cli account:rewards 0.0.123 --limit 50
```

| Output    | Description               |
| --------- | ------------------------- |
| Timestamp | Reward timestamp          |
| Amount    | Reward amount in HBAR     |
| Node ID   | Node that provided reward |

## `account:crypto-allowances <id>`

Get HBAR allowances.

```bash
bunx @hiecom/mirror-cli account:crypto-allowances 0.0.123
```

| Output  | Description               |
| ------- | ------------------------- |
| Owner   | Account owner             |
| Spender | Account allowed to spend  |
| Amount  | Allowed amount in tinybar |

## `account:token-allowances <id>`

Get token allowances.

```bash
bunx @hiecom/mirror-cli account:token-allowances 0.0.123
```

| Output   | Description              |
| -------- | ------------------------ |
| Token ID | Token identifier         |
| Owner    | Token owner              |
| Spender  | Account allowed to spend |
| Amount   | Allowed amount           |

## `account:nft-allowances <id>`

Get NFT allowances.

```bash
bunx @hiecom/mirror-cli account:nft-allowances 0.0.123
```

| Output        | Description              |
| ------------- | ------------------------ |
| Token ID      | NFT token identifier     |
| Serial Number | NFT serial number        |
| Owner         | NFT owner                |
| Spender       | Account allowed to spend |

## `account:airdrops:outstanding <id>`

Get outstanding NFT airdrops.

```bash
bunx @hiecom/mirror-cli account:airdrops:outstanding 0.0.123
```

| Output        | Description             |
| ------------- | ----------------------- |
| Token ID      | NFT token identifier    |
| Serial Number | NFT serial number       |
| Sender        | Account sending airdrop |

## `account:airdrops:pending <id>`

Get pending NFT airdrops.

```bash
bunx @hiecom/mirror-cli account:airdrops:pending 0.0.123
```

## `accounts:list`

List accounts with filters.

```bash
bunx @hiecom/mirror-cli accounts:list --balance-gte 100000000000 --smart-contract --limit 50
```

| Option                | Description               |
| --------------------- | ------------------------- | ---------- |
| `--balance-gte <amt>` | Minimum balance (tinybar) |
| `--balance-lte <amt>` | Maximum balance (tinybar) |
| `--smart-contract`    | Smart contracts only      |
| `--deleted`           | Include deleted accounts  |
| `--limit <num>`       | Maximum results           |
| `--order <asc         | desc>`                    | Sort order |
