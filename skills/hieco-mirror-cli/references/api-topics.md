# Topics API

Canonical docs:

- [`@hieco/mirror-cli` README](https://github.com/powxenv/hieco/tree/main/packages/mirror-cli)
- Common CLI contract: [api-common.md](api-common.md)

## Commands

| Command                                    | What it does                              | Parameters                                                                                                                | Returns       |
| ------------------------------------------ | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ------------- |
| `topic <topicId>`                          | Query topic metadata.                     | `topicId: string`; options: `--json`                                                                                      | topic summary |
| `topic:messages <topicId>`                 | Query topic messages.                     | `topicId: string`; options: `--encoding`, `--sequence-number`, `--timestamp`, `--transaction-id`, `--scheduled`, `--json` | message list  |
| `topic:message <topicId> <sequenceNumber>` | Query one message by sequence number.     | `topicId: string`, `sequenceNumber: number`; options: `--json`                                                            | one message   |
| `topic:message-by-timestamp <timestamp>`   | Query one message by consensus timestamp. | `timestamp: string`; options: `--json`                                                                                    | one message   |
| `topics:list`                              | List topics.                              | no positional args; options: `--limit`, `--order`, `--json`                                                               | topic list    |

## Key Output Shapes

### `topic`

Typical fields:

- `Topic ID`
- `Admin Key`
- `Auto Renew Account`
- `Auto Renew Period`
- `Fee Schedule Key`
- `Submit Key`
- `Fee Exempt Key List`
- `Deleted`
- `Custom Fees`
- `Memo`
- `Created Timestamp`
- `Timestamp`

### `topic:messages`, `topic:message`, `topic:message-by-timestamp`

Typical fields:

- `Topic ID`
- `Sequence Number`
- `Consensus Timestamp`
- `Message`
- `Payer Account`
- `Running Hash`
- `Running Hash Version`
- `Chunk Info`

## Examples

```bash
hieco topic 0.0.5005
hieco topic:messages 0.0.5005 --encoding utf-8 --limit 20
hieco topic:message 0.0.5005 10 --json
hieco topic:message-by-timestamp 1700000000.123456789
hieco topics:list --order desc --limit 20
```
