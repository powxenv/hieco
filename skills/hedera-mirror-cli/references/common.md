# Common Options

## Installation

```bash
bunx @hiecom/mirror-cli <command> [options]
npx @hiecom/mirror-cli <command> [options]
```

## Global Options

| Option                   | Description                                           |
| ------------------------ | ----------------------------------------------------- | ---------- |
| `-n, --network <net>`    | `mainnet`, `testnet`, `previewnet` (default: mainnet) |
| `-j, --json`             | Output as JSON (default: formatted table)             |
| `-u, --mirror-url <url>` | Custom Mirror Node URL                                |
| `--limit <num>`          | Limit results                                         |
| `--order <asc            | desc>`                                                | Sort order |

## ID Formats

| Type                  | Format                          | Example                     |
| --------------------- | ------------------------------- | --------------------------- |
| Entity                | `shard.realm.num`               | `0.0.123`                   |
| Transaction           | `shard.realm.num@seconds@nanos` | `0.0.123@1654321@987654321` |
| Timestamp (ISO)       | `YYYY-MM-DDTHH:MM:SSZ`          | `2024-01-01T00:00:00Z`      |
| Timestamp (consensus) | `seconds.nanos`                 | `1654321.987654321`         |

## Examples

### Filter by balance

```bash
bunx @hiecom/mirror-cli accounts:list --balance-gte 100000000000
bunx @hiecom/mirror-cli accounts:list --smart-contract
```

### Filter transactions

```bash
bunx @hiecom/mirror-cli transactions:account 0.0.123 --result SUCCESS
bunx @hiecom/mirror-cli transactions:account 0.0.123 --scheduled
```

### Pagination

```bash
bunx @hiecom/mirror-cli transactions:account 0.0.123 --limit 20 --order desc
```

## Output Formats

### Table (default)

```
┌─────────────────────┬──────────────────┐
│ Field               │ Value            │
├─────────────────────┼──────────────────┤
│ Account ID          │ 0.0.123          │
│ Balance             │ 1000.00000000 ℏ  │
└─────────────────────┴──────────────────┘
```

### JSON (`-j`)

```json
{
  "Account ID": "0.0.123",
  "Balance": "1000.00000000 ℏ"
}
```

## Error Handling

| Error                    | Solution                                   |
| ------------------------ | ------------------------------------------ |
| `404 Not Found`          | Verify entity ID is correct                |
| `Invalid entity ID`      | Use format `shard.realm.num`               |
| `Invalid transaction ID` | Use format `shard.realm.num@seconds@nanos` |
| `Network error`          | Check network or use `-u` for custom URL   |
