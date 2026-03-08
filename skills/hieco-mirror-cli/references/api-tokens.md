# Tokens And NFTs API

Canonical docs:

- [`@hieco/mirror-cli` README](https://github.com/powxenv/hieco/tree/main/packages/mirror-cli)
- Common CLI contract: [api-common.md](api-common.md)

## Commands

| Command                                           | What it does                        | Parameters                                                                                                                    | Returns                 |
| ------------------------------------------------- | ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| `token <tokenId>`                                 | Query token information.            | `tokenId: string`; options: `--timestamp`, `--json`                                                                           | token metadata summary  |
| `token:balances <tokenId>`                        | Query token holders and balances.   | `tokenId: string`; options: `--account-id`, `--account-balance`, `--account-public-key`, `--timestamp`, `--json`              | token holder list       |
| `token:nfts <tokenId>`                            | Query NFTs for a token.             | `tokenId: string`; options: `--account-id`, `--serial-number`, `--json`                                                       | NFT list for the token  |
| `token:nft <tokenId> <serialNumber>`              | Query one NFT by serial number.     | `tokenId: string`, `serialNumber: number`; options: `--json`                                                                  | one NFT record          |
| `token:nft:transactions <tokenId> <serialNumber>` | Query all transactions for one NFT. | `tokenId: string`, `serialNumber: number`; options: `--timestamp`, `--json`                                                   | NFT transaction history |
| `tokens:list`                                     | List tokens with filters.           | no positional args; options: `--account-id`, `--token-id`, `--limit`, `--name`, `--order`, `--public-key`, `--type`, `--json` | filtered token list     |

## Key Output Shapes

### `token`

Typical fields:

- `Token ID`
- `Name`
- `Symbol`
- `Type`
- `Supply Type`
- `Total Supply`
- `Max Supply`
- `Decimals`
- `Admin Key`
- `Kyc Key`
- `Freeze Key`
- `Wipe Key`
- `Supply Key`
- `Fee Schedule Key`
- `Pause Key`
- `Metadata Key`
- `Custom Fees`
- `Default Freeze Status`
- `Pause Status`
- `Created Timestamp`
- `Modified Timestamp`
- `Treasury Account ID`
- `Auto Renew Account`
- `Auto Renew Period`
- `Expiry Timestamp`
- `Memo`

### `token:balances`

Typical row fields:

- `Account`
- `Balance`
- `Decimals`

### `token:nfts` and `token:nft`

Typical fields:

- `Account ID`
- `Serial Number`
- `Delegated`
- `Deleted`
- `Metadata`
- `IPFS Hash`
- `Created`
- `Modified`
- `Spender`
- `Symbol`
- `Name`
- `Treasury`

### `token:nft:transactions`

Typical row fields:

- `Transaction ID`
- `Name`
- `Result`
- `Consensus Timestamp`
- `Transaction Hash`

## Examples

```bash
hieco token 0.0.2001
hieco token:balances 0.0.2001 --account-id 0.0.1001
hieco token:nfts 0.0.2001 --serial-number 1 --json
hieco token:nft 0.0.2001 1
hieco token:nft:transactions 0.0.2001 1 --timestamp 1700000000.123456789
hieco tokens:list --type NON_FUNGIBLE_UNIQUE --limit 20
```
