# Transaction Commands

## `transaction <id>`

Get transaction details.

```bash
bunx @hieco/mirror-cli transaction 0.0.123@1654321@987654321
```

| Output                 | Description                                            |
| ---------------------- | ------------------------------------------------------ |
| Transaction ID         | Transaction identifier (shard.realm.num@seconds@nanos) |
| Type                   | CRYPTOTRANSFER, TOKENASSOCIATE, CONTRACTCALL, etc      |
| Consensus Timestamp    | Transaction timestamp                                  |
| From Account           | Payer account                                          |
| Result                 | SUCCESS or FAIL                                        |
| Scheduled              | Whether transaction is scheduled                       |
| Transaction Hash       | Transaction hash                                       |
| Valid Start NS         | Valid start nanoseconds                                |
| Valid Duration Seconds | Transaction valid duration                             |

## `transactions:account <id>`

Get transactions for account.

```bash
bunx @hieco/mirror-cli transactions:account 0.0.123 --limit 20 --result SUCCESS
```

| Option           | Description                      |
| ---------------- | -------------------------------- | ---------- |
| `--limit <num>`  | Maximum results                  |
| `--order <asc    | desc>`                           | Sort order |
| `--result <res>` | Filter by result (SUCCESS, FAIL) |
| `--scheduled`    | Show scheduled transactions only |

## `transactions:list`

List all transactions.

```bash
bunx @hieco/mirror-cli transactions:list --limit 50 --order desc
```

| Option           | Description      |
| ---------------- | ---------------- | ---------- |
| `--limit <num>`  | Maximum results  |
| `--order <asc    | desc>`           | Sort order |
| `--result <res>` | Filter by result |

## Transaction Types

CRYPTOTRANSFER, TOKENASSOCIATE, TOKENDISSOCIATE, TOKENMINT, TOKENBURN, CONTRACTCALL, CONTRACTCREATEINSTANCE, FILECREATE, FILEUPDATE, FILEDELETE, TOPICCREATE, TOPICSUBMITMESSAGE, SCHEDULECREATE, SYSTEMDELETE, SYSTEMUNDELETE

## Result Codes

| Code                              | Description                   |
| --------------------------------- | ----------------------------- |
| SUCCESS                           | Transaction succeeded         |
| FAIL                              | Transaction failed            |
| INSUFFICIENT_BALANCE              | Insufficient account balance  |
| INVALID_ACCOUNT_ID                | Invalid account ID            |
| INVALID_TOKEN_ID                  | Invalid token ID              |
| TOKEN_NOT_ASSOCIATED_TO_ACCOUNT   | Token not associated          |
| ACCOUNT_STAKED_TO_ANOTHER_ACCOUNT | Account already staked        |
| INSUFFICIENT_PAYER_BALANCE        | Insufficient payer balance    |
| CONTRACT_REVERT_EXECUTED          | Contract execution reverted   |
| INVALID_SIGNATURE                 | Invalid transaction signature |
