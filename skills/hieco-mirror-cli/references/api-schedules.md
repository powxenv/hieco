# Schedules API

Canonical docs:

- [`@hieco/mirror-cli` README](https://github.com/powxenv/hieco/tree/main/packages/mirror-cli)
- Common CLI contract: [api-common.md](api-common.md)

## Commands

| Command                 | What it does                 | Parameters                                                                                                                                                                                                                         | Returns                |
| ----------------------- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| `schedule <scheduleId>` | Query one schedule.          | `scheduleId: string`; options: `--json`                                                                                                                                                                                            | schedule summary       |
| `schedules:list`        | List schedules with filters. | no positional args; options: `--account-id`, `--admin-key`, `--creator-account-id`, `--deleted`, `--executed-timestamp`, `--expiration-timestamp`, `--limit`, `--memo`, `--order`, `--payer-account-id`, `--schedule-id`, `--json` | filtered schedule list |

## Key Output Shapes

### `schedule`

Typical fields:

- `Schedule ID`
- `Creator Account ID`
- `Payer Account ID`
- `Deleted`
- `Memo`
- `Consensus Timestamp`
- `Executed Timestamp`
- `Expiration Time`
- `Wait for Expiry`
- `Signatures`
- `Admin Key`

### `schedules:list`

Typical row fields:

- `Schedule ID`
- `Creator Account`
- `Payer Account`
- `Deleted`
- `Memo`
- `Consensus Timestamp`
- `Executed Timestamp`
- `Expiration Time`
- `Signatures`

## Examples

```bash
hieco schedule 0.0.4001
hieco schedules:list --creator-account-id 0.0.1001 --limit 20
hieco schedules:list --deleted --json
```
