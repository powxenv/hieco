# Topic Commands

## `topic <id>`

Get topic information.

```bash
bunx @hiecom/mirror-cli topic 0.0.654
```

| Output | Description |
|--------|-------------|
| Topic ID | Topic identifier |
| Admin Key | Admin key status |
| Submit Key | Submit key status |
| Running Hash | Current running hash |
| Sequence Number | Current message sequence number |
| Deleted | Topic deletion status |

## `topic:messages <id>`

Get all messages from topic.

```bash
bunx @hiecom/mirror-cli topic:messages 0.0.654 --limit 100
```

| Option | Description |
|--------|-------------|
| `--limit <num>` | Maximum results |
| `--order <asc|desc>` | Sort order |

| Output | Description |
|--------|-------------|
| Sequence Number | Message sequence number |
| Transaction ID | Transaction that submitted message |
| Timestamp | Message consensus timestamp |
| Message Size | Message size in bytes |
| Running Hash | Running hash after message |

## `topic:message <id> <seq>`

Get specific message.

```bash
bunx @hiecom/mirror-cli topic:message 0.0.654 123
```

| Parameter | Description |
|-----------|-------------|
| `seq` | Message sequence number |

| Output | Description |
|--------|-------------|
| Topic ID | Topic identifier |
| Sequence Number | Message sequence number |
| Transaction ID | Transaction that submitted message |
| Timestamp | Message consensus timestamp |
| Message | Message content (base64 encoded) |
| Running Hash | Running hash after message |

## `topic:message-by-timestamp <timestamp>`

Get message by timestamp.

```bash
bunx @hiecom/mirror-cli topic:message-by-timestamp 1654321.987654321
```

| Parameter | Description |
|-----------|-------------|
| `timestamp` | Consensus timestamp (seconds.nanos) |

## `topics:list`

List all topics.

```bash
bunx @hiecom/mirror-cli topics:list --limit 100
```

| Option | Description |
|--------|-------------|
| `--limit <num>` | Maximum results |
| `--order <asc|desc>` | Sort order |
