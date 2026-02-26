# Contract Commands

## `contract <id>`

Get contract information.

```bash
bunx @hiecom/mirror-cli contract 0.0.789
bunx @hiecom/mirror-cli contract 0x0000000000000000000000000000000000001234
```

| Parameter | Description                                  |
| --------- | -------------------------------------------- |
| `id`      | Contract ID (0.0.num) or EVM address (0x...) |

| Output      | Description              |
| ----------- | ------------------------ |
| Contract ID | Contract identifier      |
| EVM Address | EVM address              |
| Account ID  | Account ID               |
| Balance     | Contract HBAR balance    |
| Admin Key   | Admin key status         |
| Deleted     | Contract deletion status |

## `contract:call <id>`

Execute read-only contract call.

```bash
bunx @hiecom/mirror-cli contract:call 0.0.789 --data 0x70a08231...
```

| Option         | Description                        |
| -------------- | ---------------------------------- |
| `--data <hex>` | Call data (hex encoded) - REQUIRED |

| Output   | Description               |
| -------- | ------------------------- |
| Result   | Call result (hex encoded) |
| Gas Used | Gas used for call         |
| Error    | Error message if failed   |

## `contract:results <id>`

Get contract execution results.

```bash
bunx @hiecom/mirror-cli contract:results 0.0.789 --limit 50
```

| Option          | Description     |
| --------------- | --------------- | ---------- |
| `--limit <num>` | Maximum results |
| `--order <asc   | desc>`          | Sort order |

## `contract:result <id> <timestamp>`

Get specific contract result.

```bash
bunx @hiecom/mirror-cli contract:result 0.0.789 1654321.987654321
```

| Parameter   | Description                         |
| ----------- | ----------------------------------- |
| `timestamp` | Consensus timestamp (seconds.nanos) |

| Output      | Description             |
| ----------- | ----------------------- |
| Contract ID | Contract identifier     |
| Timestamp   | Consensus timestamp     |
| Result      | Call result             |
| Gas Used    | Gas consumed            |
| Error       | Error message if failed |

## `contract:state <id>`

Get contract storage state.

```bash
bunx @hiecom/mirror-cli contract:state 0.0.789 --limit 100
```

| Option          | Description     |
| --------------- | --------------- |
| `--limit <num>` | Maximum results |

| Output | Description  |
| ------ | ------------ |
| Slot   | Storage slot |
| Value  | Stored value |

## `contract:logs <id>`

Get event logs.

```bash
bunx @hiecom/mirror-cli contract:logs 0.0.789 --limit 50
```

| Option          | Description     |
| --------------- | --------------- | ---------- |
| `--limit <num>` | Maximum results |
| `--order <asc   | desc>`          | Sort order |

| Output         | Description                       |
| -------------- | --------------------------------- |
| Transaction ID | Transaction that emitted log      |
| Timestamp      | Log timestamp                     |
| Topics         | Log topics (indexed parameters)   |
| Data           | Log data (non-indexed parameters) |

## `contracts:results`

Get all contract results.

```bash
bunx @hiecom/mirror-cli contracts:results --limit 100
```

## `contract:by-tx <txIdOrHash>`

Get result by transaction.

```bash
bunx @hiecom/mirror-cli contract:by-tx 0.0.123@1654321@987654321
```

## `contract:actions <txIdOrHash>`

Get result actions.

```bash
bunx @hiecom/mirror-cli contract:actions 0.0.123@1654321@987654321
```

| Output      | Description            |
| ----------- | ---------------------- |
| Contract ID | Contract identifier    |
| Action Type | call, create, etc      |
| From        | Sender account         |
| To          | Recipient account      |
| Value       | HBAR value transferred |

## `contract:opcodes <txIdOrHash>`

Get result opcodes.

```bash
bunx @hiecom/mirror-cli contract:opcodes 0.0.123@1654321@987654321
```

| Output      | Description               |
| ----------- | ------------------------- |
| Opcode      | Operation code            |
| Stack Depth | Stack depth at execution  |
| Gas Used    | Gas consumed by operation |

## `contracts:list`

List all contracts.

```bash
bunx @hiecom/mirror-cli contracts:list --limit 100
```

| Option          | Description     |
| --------------- | --------------- | ---------- |
| `--limit <num>` | Maximum results |
| `--order <asc   | desc>`          | Sort order |
