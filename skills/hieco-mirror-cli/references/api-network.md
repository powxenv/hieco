# Network API

Canonical docs:

- [`@hieco/mirror-cli` README](https://github.com/powxenv/hieco/tree/main/packages/mirror-cli)
- Common CLI contract: [api-common.md](api-common.md)

## Commands

| Command                 | What it does                             | Parameters                                                                            | Returns                                                           |
| ----------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `network`               | Query a combined network report.         | no positional args; options: `--json`                                                 | aggregate report including exchange rate, fees, stake, and supply |
| `network:exchange-rate` | Query current HBAR to USD exchange rate. | no positional args; options: `--timestamp`, `--json`                                  | exchange rate summary                                             |
| `network:fees`          | Query network fee schedules.             | no positional args; options: `--limit`, `--order`, `--timestamp`, `--json`            | fee schedule list                                                 |
| `network:nodes`         | Query network node information.          | no positional args; options: `--file-id`, `--node-id`, `--limit`, `--order`, `--json` | node summary list                                                 |
| `network:stake`         | Query staking information.               | no positional args; options: `--json`                                                 | staking summary                                                   |
| `network:supply`        | Query HBAR supply information.           | no positional args; options: `--json`                                                 | supply summary                                                    |
| `network:nodes:list`    | List network nodes.                      | no positional args; options: `--file-id`, `--node-id`, `--limit`, `--order`, `--json` | flattened node list                                               |

## Key Output Shapes

### `network`

Typical sections:

- `Exchange Rate`
- `Fees`
- `Stake`
- `Supply`

### `network:exchange-rate`

Typical fields:

- current rate
- next rate
- expiration
- timestamp

### `network:fees`

Typical row fields:

- fee category
- fee amount
- timestamp or expiry-related metadata

### `network:nodes` and `network:nodes:list`

Typical row fields:

- node ID
- account ID
- description
- stake
- service endpoint or file ID when present

### `network:stake`

Typical fields:

- node reward data
- staking period information
- aggregate stake information

### `network:supply`

Typical fields:

- `Total Supply`
- `Released Supply`
- `Timestamp`

## Examples

```bash
hieco network
hieco network:exchange-rate
hieco network:fees --limit 20 --order desc
hieco network:nodes --node-id 3
hieco network:stake --json
hieco network:supply
hieco network:nodes:list --limit 50
```
