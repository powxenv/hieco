# Contracts API

Canonical docs:

- [`@hieco/mirror-cli` README](https://github.com/powxenv/hieco/tree/main/packages/mirror-cli)
- Common CLI contract: [api-common.md](api-common.md)

## Commands

| Command                                    | What it does                                           | Parameters                                                                                                                              | Returns                |
| ------------------------------------------ | ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| `contract <contractId>`                    | Query contract metadata.                               | `contractId: string`; options: `--timestamp`, `--json`                                                                                  | contract summary       |
| `contract:call <contractId>`               | Execute a read-only contract call.                     | `contractId: string`; options: `--from`, `--gas`, `--gas-price`, `--data`, `--estimate`, `--block`, `--value`, `--json`                 | call result summary    |
| `contract:results <contractId>`            | Query contract execution results for one contract.     | `contractId: string`; options: `--block-hash`, `--block-number`, `--from`, `--internal`, `--timestamp`, `--transaction-index`, `--json` | result list            |
| `contract:result <contractId> <timestamp>` | Query one contract result by timestamp.                | `contractId: string`, `timestamp: string`; options: `--json`                                                                            | one contract result    |
| `contract:state <contractId>`              | Query contract storage state.                          | `contractId: string`; options: `--slot`, `--timestamp`, `--json`                                                                        | storage state rows     |
| `contract:logs <contractId>`               | Query contract event logs.                             | `contractId: string`; options: `--index`, `--timestamp`, `--topic0`, `--topic1`, `--topic2`, `--topic3`, `--transaction-hash`, `--json` | log rows               |
| `contracts:results`                        | Query contract execution results across all contracts. | no positional args; options: `--from`, `--block-hash`, `--block-number`, `--internal`, `--timestamp`, `--transaction-index`, `--json`   | global result list     |
| `contract:by-tx <transactionIdOrHash>`     | Query one contract result by transaction ID or hash.   | `transactionIdOrHash: string`; options: `--nonce`, `--json`                                                                             | one contract result    |
| `contract:actions <transactionIdOrHash>`   | Query result actions by transaction.                   | `transactionIdOrHash: string`; options: `--index`, `--json`                                                                             | action list            |
| `contract:opcodes <transactionIdOrHash>`   | Query result opcodes by transaction.                   | `transactionIdOrHash: string`; options: `--stack`, `--memory`, `--storage`, `--json`                                                    | opcode trace list      |
| `contracts:list`                           | List contracts with filters.                           | no positional args; options: `--address`, `--contract-id`, `--limit`, `--order`, `--smart-contract-id`, `--json`                        | filtered contract list |

## Key Output Shapes

### `contract`

Typical fields:

- `Contract ID`
- `EVM Address`
- `Admin Key`
- `Auto Renew Account`
- `Auto Renew Period`
- `Memo`
- `Deleted`
- `Permanent Removal`
- `Created Timestamp`
- `Expiry Timestamp`
- `File ID`
- `Obtainer ID`
- `Proxy Account ID`
- `Max Automatic Token Associations`
- `Timestamp`

### `contract:call`

Typical fields:

- `Contract ID`
- `Result`
- `Error`

### `contract:results`, `contracts:results`, `contract:result`, `contract:by-tx`

Typical fields:

- `Contract ID`
- `Address`
- `Call Result`
- `Error Message`
- `Gas Used`
- `Result`
- `Timestamp`
- `To`
- `From`
- `Function Parameters`

### `contract:state`

Typical row fields:

- `Contract ID`
- `Address`
- `Slot`
- `Value`
- `Timestamp`

### `contract:logs`

Typical row fields:

- `Address`
- `Block Hash`
- `Block Number`
- `Data`
- `Index`
- `Topics`
- `Transaction Hash`

### `contract:actions`

Typical row fields:

- action type
- from
- to
- call depth or index
- value or amount fields when present

### `contract:opcodes`

Typical row fields:

- opcode
- stack or memory snapshots when requested
- storage snapshots when requested
- gas-related fields when present

## Examples

```bash
hieco contract 0.0.3001
hieco contract 0x0000000000000000000000000000000000001234
hieco contract:call 0.0.3001 --data 0x70a08231...
hieco contract:results 0.0.3001 --limit 20 --order desc
hieco contract:result 0.0.3001 1700000000.123456789
hieco contract:logs 0.0.3001 --topic0 0xddf252ad --json
hieco contract:by-tx 0.0.1001@1700000000@123456789
hieco contract:actions 0.0.1001@1700000000@123456789
hieco contract:opcodes 0.0.1001@1700000000@123456789 --stack --memory
```
