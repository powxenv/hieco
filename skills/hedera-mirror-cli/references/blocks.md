# Block Commands

## `block <hashOrNumber>`

Get block by hash or number.

```bash
bunx @hieco/mirror-cli block 12345
bunx @hieco/mirror-cli block 0xabc123...
```

| Parameter      | Description                                     |
| -------------- | ----------------------------------------------- |
| `hashOrNumber` | Block hash (hex with 0x prefix) or block number |

| Output        | Description                     |
| ------------- | ------------------------------- |
| Block Number  | Block number                    |
| Block Hash    | Block hash                      |
| Timestamp     | Block timestamp                 |
| Count         | Number of transactions in block |
| Previous Hash | Previous block hash             |
| Gas Used      | Gas used in block               |
| Gas Limit     | Block gas limit                 |

## `blocks`

Query blocks with filters.

```bash
bunx @hieco/mirror-cli blocks --limit 50 --order desc
```

| Option          | Description     |
| --------------- | --------------- | ---------- |
| `--limit <num>` | Maximum results |
| `--order <asc   | desc>`          | Sort order |

## `blocks:list`

List all blocks.

```bash
bunx @hieco/mirror-cli blocks:list --limit 100
```

| Option          | Description     |
| --------------- | --------------- | ---------- |
| `--limit <num>` | Maximum results |
| `--order <asc   | desc>`          | Sort order |

| Output            | Description            |
| ----------------- | ---------------------- |
| Block Number      | Block identifier       |
| Block Hash        | Block hash             |
| Timestamp         | Block timestamp        |
| Transaction Count | Number of transactions |
