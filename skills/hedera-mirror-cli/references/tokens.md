# Token Commands

## `token <id>`

Get token information.

```bash
bunx @hiecom/mirror-cli token 0.0.456
```

| Output       | Description                            |
| ------------ | -------------------------------------- |
| Token ID     | Token identifier                       |
| Name         | Token name                             |
| Symbol       | Token symbol                           |
| Decimals     | Token decimal places                   |
| Total Supply | Total token supply                     |
| Type         | FUNGIBLE_COMMON or NON_FUNGIBLE_UNIQUE |
| Admin Key    | Admin key status                       |
| Supply Key   | Supply key status                      |
| Freeze Key   | Freeze key status                      |
| Wipe Key     | Wipe key status                        |
| Pause Key    | Pause key status                       |
| Deleted      | Token deletion status                  |

## `token:balances <id>`

Get balances for token.

```bash
bunx @hiecom/mirror-cli token:balances 0.0.456 --limit 100
```

| Option              | Description          |
| ------------------- | -------------------- | ---------- |
| `--account-id <id>` | Filter by account ID |
| `--limit <num>`     | Maximum results      |
| `--order <asc       | desc>`               | Sort order |

| Output     | Description    |
| ---------- | -------------- |
| Account ID | Account holder |
| Balance    | Token balance  |

## `token:nfts <id>`

Get NFTs for token.

```bash
bunx @hiecom/mirror-cli token:nfts 0.0.456 --account-id 0.0.789 --limit 50
```

| Option              | Description          |
| ------------------- | -------------------- | ---------- |
| `--account-id <id>` | Filter by account ID |
| `--limit <num>`     | Maximum results      |
| `--order <asc       | desc>`               | Sort order |

| Output             | Description             |
| ------------------ | ----------------------- |
| Token ID           | NFT token identifier    |
| Serial Number      | NFT serial number       |
| Account ID         | Current owner           |
| Metadata           | NFT metadata            |
| Created Timestamp  | Creation timestamp      |
| Modified Timestamp | Last modified timestamp |

## `token:nft <id> <serial>`

Get specific NFT.

```bash
bunx @hiecom/mirror-cli token:nft 0.0.456 123
```

| Output             | Description             |
| ------------------ | ----------------------- |
| Token ID           | NFT token identifier    |
| Serial Number      | NFT serial number       |
| Account ID         | Current owner           |
| Metadata           | NFT metadata            |
| Created Timestamp  | Creation timestamp      |
| Modified Timestamp | Last modified timestamp |
| Deleted            | NFT deletion status     |

## `token:nft:transactions <id> <serial>`

Get NFT transaction history.

```bash
bunx @hiecom/mirror-cli token:nft:transactions 0.0.456 123 --limit 50
```

| Option          | Description     |
| --------------- | --------------- | ---------- |
| `--limit <num>` | Maximum results |
| `--order <asc   | desc>`          | Sort order |

| Output         | Description                          |
| -------------- | ------------------------------------ |
| Transaction ID | Transaction identifier               |
| Type           | CRYPTOTRANSFER, TOKENBURN, TOKENMINT |
| Timestamp      | Transaction timestamp                |
| From Account   | Sender account                       |
| To Account     | Receiver account                     |

## `tokens:list`

List all tokens.

```bash
bunx @hiecom/mirror-cli tokens:list --limit 50 --order desc
```

| Option          | Description     |
| --------------- | --------------- | ---------- |
| `--limit <num>` | Maximum results |
| `--order <asc   | desc>`          | Sort order |
