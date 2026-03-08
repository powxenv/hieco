# Blocks API

Canonical docs:

- [`@hieco/mirror-cli` README](https://github.com/powxenv/hieco/tree/main/packages/mirror-cli)
- Common CLI contract: [api-common.md](api-common.md)

## Commands

| Command                     | What it does                       | Parameters                                                                                   | Returns                |
| --------------------------- | ---------------------------------- | -------------------------------------------------------------------------------------------- | ---------------------- |
| `block <blockHashOrNumber>` | Query one block by hash or number. | `blockHashOrNumber: string`; options: `--json`                                               | block summary          |
| `blocks`                    | Query blocks with filters.         | no positional args; options: `--block-number`, `--limit`, `--order`, `--timestamp`, `--json` | filtered block payload |
| `blocks:list`               | List blocks.                       | no positional args; options: `--block-number`, `--limit`, `--order`, `--timestamp`, `--json` | flattened block list   |

## Key Output Shapes

### `block`

Typical fields:

- `Block Hash`
- `Block Number`
- `Consensus Start`
- `Consensus End`
- `Gas Used`
- `Previous Hash`
- `Record File Hash`
- `State Hash`

### `blocks` and `blocks:list`

Typical row fields:

- `Block Hash`
- `Block Number`
- `Consensus Start`
- `Consensus End`
- `Gas Used`
- `Previous Hash`

## Examples

```bash
hieco block 12345
hieco block 0xabc123
hieco blocks --order desc --limit 20
hieco blocks:list --timestamp 1700000000.123456789 --json
```
