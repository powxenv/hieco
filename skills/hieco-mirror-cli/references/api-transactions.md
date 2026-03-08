# Transactions API

Canonical docs:

- [`@hieco/mirror-cli` README](https://github.com/powxenv/hieco/tree/main/packages/mirror-cli)
- Common CLI contract: [api-common.md](api-common.md)

## Commands

| Command                            | What it does                             | Parameters                                                                                                                                                                                                                          | Returns                   |
| ---------------------------------- | ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| `transaction <transactionId>`      | Query one transaction by transaction ID. | `transactionId: string`; options: `--nonce`, `--scheduled`, `--json`                                                                                                                                                                | one transaction summary   |
| `transactions:account <accountId>` | Query all transactions for one account.  | `accountId: string`; options: `--result`, `--scheduled`, `--timestamp`, `--transaction-id`, `--transaction-hash`, `--transaction-type`, `--type`, `--json`                                                                          | account transaction list  |
| `transactions:list`                | List transactions with filters.          | no positional args; options: `--account`, `--account-id`, `--limit`, `--order`, `--result`, `--scheduled`, `--timestamp`, `--transaction-hash`, `--transaction-id`, `--transaction-type`, `--transfers-account`, `--type`, `--json` | filtered transaction list |

## Key Output Shapes

### `transaction`

Typical fields:

- `Transaction ID`
- `Name`
- `Consensus Timestamp`
- `Result`
- `Charged Tx Fee`
- `Max Fee`
- `Memo Base64`
- `Transaction Hash`
- `Valid Start`
- `Valid Duration`
- `Scheduled`
- `Node`
- `Entity ID`
- `NFT Transfers`
- `Token Transfers`
- `Transfers`
- `Staking Reward Transfers`

### `transactions:account` and `transactions:list`

Typical row fields:

- `Transaction ID`
- `Name`
- `Result`
- `Consensus Timestamp`
- `Charged Fee`
- `Transaction Hash`
- `Scheduled`

## Filter Semantics

| Option                            | Meaning                                             |
| --------------------------------- | --------------------------------------------------- | --------------------------------------------------- |
| `--result <result>`               | Filter by transaction result code such as `SUCCESS` |
| `--scheduled`                     | Restrict to scheduled transactions                  |
| `--type <credit                   | debit>`                                             | Filter by credit or debit direction where supported |
| `--transaction-type <type>`       | Filter by Hedera transaction type                   |
| `--transaction-hash <hash>`       | Filter by transaction hash                          |
| `--transfers-account <accountId>` | Filter by transfer participant account              |

## Examples

```bash
hieco transaction 0.0.1001@1700000000@123456789
hieco transaction 0.0.1001@1700000000@123456789 --scheduled
hieco transactions:account 0.0.1001 --result SUCCESS --json
hieco transactions:list --account-id 0.0.1001 --order desc --limit 25
hieco transactions:list --transaction-type CONTRACTCALL --transfers-account 0.0.1001
```
