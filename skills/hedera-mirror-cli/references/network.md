# Network Commands

## `network`

Get network information.

```bash
bunx @hiecom/mirror-cli network
```

| Output       | Description        |
| ------------ | ------------------ |
| Network Type | mainnet, testnet, previewnet |
| Shard Count  | Number of shards   |
| Node Count   | Number of nodes    |

## `network:exchange-rate`

Get HBAR to USD exchange rate.

```bash
bunx @hiecom/mirror-cli network:exchange-rate
```

| Output              | Description               |
| ------------------- | ------------------------- |
| HBAR to USD         | Current exchange rate     |
| Expiration Timestamp | Rate expiration time      |

## `network:fees`

Get network fee schedules.

```bash
bunx @hiecom/mirror-cli network:fees
```

| Output           | Description                   |
| ---------------- | ----------------------------- |
| Transaction Type | CRYPTOTRANSFER, etc          |
| Fee Type         | fixed, fractional, etc        |
| Fee Amount       | Fee amount in tinybar         |

## `network:nodes`

Get network nodes.

```bash
bunx @hiecom/mirror-cli network:nodes --limit 50
```

| Option          | Description     |
| --------------- | --------------- |
| `--limit <num>` | Maximum results |

| Output      | Description       |
| ----------- | ----------------- |
| Node ID     | Node identifier   |
| Account ID  | Node account ID   |
| Description | Node description  |
| Stake       | Node stake amount |

## `network:stake`

Get network staking information.

```bash
bunx @hiecom/mirror-cli network:stake
```

| Output                  | Description                  |
| ----------------------- | ---------------------------- |
| Total Stake             | Total network stake          |
| Node Reward Distribution | Reward distribution details  |

## `network:supply`

Get HBAR token supply.

```bash
bunx @hiecom/mirror-cli network:supply
```

| Output             | Description             |
| ------------------ | ----------------------- |
| Total Supply       | Total HBAR supply       |
| Circulating Supply | Circulating HBAR supply |

## `network:nodes:list`

List all network nodes.

```bash
bunx @hiecom/mirror-cli network:nodes:list --limit 100
```

| Option          | Description     |
| --------------- | --------------- |
| `--limit <num>` | Maximum results |
| `--order <asc|desc>` | Sort order |

| Output          | Description              |
| --------------- | ------------------------ |
| Node ID         | Node identifier          |
| Account ID      | Node account ID          |
| File ID         | Node file ID             |
| Description     | Node description         |
| Stake           | Node stake amount        |
| Stake Total     | Total stake for node     |
| Stake Rewarded  | Amount of stake rewarded |

## HBAR Denominations

| Unit         | Tinybar             |
| ------------ | ------------------- |
| 1 HBAR       | 100,000,000 tinybar |
| 1 milli HBAR | 100,000 tinybar     |
| 1 micro HBAR | 100 tinybar         |

## Network Types

| Network    | Option              |
| ---------- | ------------------- |
| Mainnet    | `mainnet` (default) |
| Testnet    | `testnet`           |
| Previewnet | `previewnet`        |

```bash
bunx @hiecom/mirror-cli account 0.0.123 -n testnet
```
