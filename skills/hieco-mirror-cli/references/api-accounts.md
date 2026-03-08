# Accounts And Balances API

Canonical docs:

- [`@hieco/mirror-cli` README](https://github.com/powxenv/hieco/tree/main/packages/mirror-cli)
- Common CLI contract: [api-common.md](api-common.md)

## Account Commands

| Command                                    | What it does                                   | Parameters                                                                                                                                                                                                                                      | Returns                                                                              |
| ------------------------------------------ | ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `account <accountId>`                      | Query account information.                     | `accountId: string`; options: `--timestamp`, `--json`                                                                                                                                                                                           | account summary including alias, key, balance, staking, reward, and lifecycle fields |
| `balance <accountId>`                      | Query one account’s HBAR and token balances.   | `accountId: string`; options: `--json`                                                                                                                                                                                                          | balance summary with timestamp, HBAR balance, and token balances                     |
| `account:tokens <accountId>`               | Query tokens associated with an account.       | `accountId: string`; options: `--token-id`, `--json`                                                                                                                                                                                            | token relationship list                                                              |
| `account:nfts <accountId>`                 | Query NFTs held by an account.                 | `accountId: string`; options: `--spender-id`, `--token-id`, `--serial-number`, `--json`                                                                                                                                                         | NFT relationship list                                                                |
| `account:rewards <accountId>`              | Query staking rewards for an account.          | `accountId: string`; options: `--timestamp`, `--json`                                                                                                                                                                                           | staking reward entries                                                               |
| `account:crypto-allowances <accountId>`    | Query HBAR allowances granted by an account.   | `accountId: string`; options: `--spender-id`, `--json`                                                                                                                                                                                          | HBAR allowance list                                                                  |
| `account:token-allowances <accountId>`     | Query token allowances granted by an account.  | `accountId: string`; options: `--spender-id`, `--token-id`, `--json`                                                                                                                                                                            | token allowance list                                                                 |
| `account:nft-allowances <accountId>`       | Query NFT allowances granted by an account.    | `accountId: string`; options: `--account-id`, `--token-id`, `--owner`, `--json`                                                                                                                                                                 | NFT allowance list                                                                   |
| `account:airdrops:outstanding <accountId>` | Query outstanding NFT airdrops for an account. | `accountId: string`; options: `--receiver-id`, `--serial-number`, `--token-id`, `--json`                                                                                                                                                        | outstanding airdrop list                                                             |
| `account:airdrops:pending <accountId>`     | Query pending NFT airdrops for an account.     | `accountId: string`; options: `--sender-id`, `--serial-number`, `--token-id`, `--json`                                                                                                                                                          | pending airdrop list                                                                 |
| `accounts:list`                            | List accounts with filters.                    | no positional args; options: `--account`, `--alias`, `--balance`, `--balance-gte`, `--balance-lte`, `--evm-address`, `--key`, `--limit`, `--memo`, `--order`, `--public-key`, `--smart-contract`, `--staked-account`, `--staked-node`, `--json` | filtered account list                                                                |

## Balance Commands

| Command         | What it does                            | Parameters                                                                                                                   | Returns                                    |
| --------------- | --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| `balances`      | Query aggregated balances with filters. | no positional args; options: `--account`, `--account-balance`, `--limit`, `--order`, `--public-key`, `--timestamp`, `--json` | balance snapshot payload with balance rows |
| `balances:list` | List all account balances.              | no positional args; options: `--account`, `--account-balance`, `--limit`, `--order`, `--public-key`, `--timestamp`, `--json` | flattened balance list                     |

## Key Output Shapes

### `account`

Typical fields:

- `Account ID`
- `Alias`
- `ECDSA Public Key`
- `Balance`
- `Token Balances`
- `Auto Renew Period`
- `Max Automatic Token Associations`
- `Memo`
- `Deleted`
- `EVM Address`
- `Ethereum Nonce`
- `Staked Node ID`
- `Staked Account ID`
- `Decline Reward`
- `Pending Reward`
- `Stake Period Start`
- `Receiver Sig Required`
- `Created Timestamp`
- `Expiry Timestamp`

### `balance`

Typical fields:

- `Account ID`
- `Timestamp`
- `HBAR Balance`
- `Token Balances`

### `accounts:list`

Typical row fields:

- `Account ID`
- `Balance`
- account state metadata such as memo, alias, or smart-contract flags depending on the result shape

## Examples

```bash
hieco account 0.0.1001
hieco account 0.0.1001 --timestamp 1700000000.123456789
hieco balance 0.0.1001 --json
hieco account:tokens 0.0.1001 --token-id 0.0.2001
hieco accounts:list --balance-gte 100000000000 --smart-contract --limit 20
hieco balances --account 0.0.1001 --json
```
