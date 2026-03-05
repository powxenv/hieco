# Hiero SDK Quick Reference Guide

**Last Updated:** March 3, 2026

---

## Installation Commands

### JavaScript/TypeScript

```bash
npm install @hiero-ledger/sdk
# or
yarn add @hiero-ledger/sdk
# or
pnpm add @hiero-ledger/sdk
```

### Python

```bash
pip install hiero-sdk-python
pip install python-dotenv
```

### Go

```bash
go get github.com/hiero-ledger/hiero-sdk-go/v2
```

### Rust

```toml
# Cargo.toml
[dependencies]
hiero-sdk = "0.6"
```

### Swift (SPM)

```swift
// Package.swift
.package(url: "https://github.com/hiero-ledger/hiero-sdk-swift", from: "0.5.0")
```

---

## Network Endpoints

| Network        | Consensus Node                    | Mirror Node REST                           |
| -------------- | --------------------------------- | ------------------------------------------ |
| **Mainnet**    | `mainnet-public.hedera.com:50111` | `https://mainnet.mirrornode.hedera.com`    |
| **Testnet**    | `testnet.hedera.com:50111`        | `https://testnet.mirrornode.hedera.com`    |
| **Previewnet** | `previewnet.hedera.com:50111`     | `https://previewnet.mirrornode.hedera.com` |

---

## Quick Start Patterns

### Client Setup (All Languages)

**JavaScript:**

```typescript
import { Client } from "@hiero-ledger/sdk";
const client = Client.forTestnet();
client.setOperator(accountId, privateKey);
```

**Python:**

```python
from hiero_sdk_python import Network, Client
client = Client(Network("testnet"))
client.set_operator(operator_id, operator_key)
```

**Go:**

```go
import "github.com/hiero-ledger/hiero-sdk-go/v2"
client := hiero.ClientForTestnet()
client.SetOperator(accountId, privateKey)
```

**Rust:**

```rust
use hiero_sdk::Client;
let client = Client::for_testnet();
client.set_operator(&operator_id, &operator_key);
```

---

## Common Transactions

### Transfer HBAR

**JavaScript:**

```typescript
import { TransferTransaction, Hbar } from "@hiero-ledger/sdk";

const tx = await new TransferTransaction()
  .addHbarTransfer(senderId, Hbar.fromTinybars(-1000))
  .addHbarTransfer(recipientId, Hbar.fromTinybars(1000))
  .execute(client);

const receipt = await tx.getReceipt(client);
```

**Python:**

```python
from hiero_sdk_python import TransferTransaction, Hbar

tx = TransferTransaction()
    .add_hbar_transfer(sender_id, Hbar.from_tinybars(-1000))
    .add_hbar_transfer(recipient_id, Hbar.from_tinybars(1000))
    .execute(client)

receipt = tx.get_receipt(client)
```

**Go:**

```go
import "github.com/hiero-ledger/hiero-sdk-go/v2"

tx := hiero.NewTransferTransaction().
    AddHbarTransfer(senderId, hiero.NewHbar(-1).SetUnit(hiero.HbarUnits.Tinybar)).
    AddHbarTransfer(recipientId, hiero.NewHbar(1).SetUnit(hiero.HbarUnits.Tinybar))

response, _ := tx.Execute(client)
receipt, _ := response.GetReceipt(client)
```

### Create Token

**JavaScript:**

```typescript
import { TokenCreateTransaction } from "@hiero-ledger/sdk";

const tx = await new TokenCreateTransaction()
  .setTokenName("My Token")
  .setTokenSymbol("MTK")
  .setDecimals(2)
  .setInitialSupply(1000000)
  .setTreasuryAccountId(treasuryId)
  .setAdminKey(adminKey.publicKey)
  .setSupplyKey(supplyKey.publicKey)
  .execute(client);

const receipt = await tx.getReceipt(client);
const tokenId = receipt.tokenId;
```

**Python:**

```python
from hiero_sdk_python import TokenCreateTransaction

tx = TokenCreateTransaction()
    .set_token_name("My Token")
    .set_token_symbol("MTK")
    .set_decimals(2)
    .set_initial_supply(1000000)
    .set_treasury_account_id(treasury_id)
    .set_admin_key(admin_key.public_key())
    .set_supply_key(supply_key.public_key())
    .execute(client)

receipt = tx.get_receipt(client)
token_id = receipt.token_id
```

### HCS (Consensus Service)

**Create Topic:**

```typescript
import { TopicCreateTransaction } from "@hiero-ledger/sdk";

const tx = await new TopicCreateTransaction()
  .setTopicMemo("My Topic")
  .setAdminKey(adminKey.publicKey)
  .execute(client);

const receipt = await tx.getReceipt(client);
const topicId = receipt.topicId;
```

**Submit Message:**

```typescript
import { TopicMessageSubmitTransaction } from "@hiero-ledger/sdk";

const tx = await new TopicMessageSubmitTransaction()
  .setTopicId(topicId)
  .setMessage("Hello, Hiero!")
  .execute(client);

const receipt = await tx.getReceipt(client);
```

---

## Query Patterns

### Account Balance (Deprecated - Use Mirror Node)

**SDK Query (deprecated):**

```typescript
import { AccountBalanceQuery } from "@hiero-ledger/sdk";

const balance = await new AccountBalanceQuery().setAccountId(accountId).execute(client);
```

**Mirror Node REST API (Recommended):**

```typescript
const response = await fetch(`https://testnet.mirrornode.hedera.com/api/v1/accounts/${accountId}`);
const data = await response.json();
const balance = data.balance.balance;
```

### Account Info

**JavaScript:**

```typescript
import { AccountInfoQuery } from "@hiero-ledger/sdk";

const info = await new AccountInfoQuery().setAccountId(accountId).execute(client);

console.log(info.balance);
console.log(info.tokenRelationships);
```

### Token Info

**JavaScript:**

```typescript
import { TokenInfoQuery } from "@hiero-ledger/sdk";

const info = await new TokenInfoQuery().setTokenId(tokenId).execute(client);

console.log(info.name, info.symbol, info.totalSupply);
```

---

## Key Management

### Generate Keys

**JavaScript:**

```typescript
import { PrivateKey } from "@hiero-ledger/sdk";

const privateKey = PrivateKey.generate();
const publicKey = privateKey.publicKey;
const privateKeyDer = privateKey.toStringDer();
const accountId = publicKey.toAccountId();
```

**Python:**

```python
from hiero_sdk_python import PrivateKey

private_key = PrivateKey.generate()
public_key = private_key.public_key()
private_key_der = private_key.to_string_der()
```

### Recover from Mnemonic

**JavaScript:**

```typescript
const privateKey = PrivateKey.fromMnemonic(mnemonicWords);
```

**Python:**

```python
private_key = PrivateKey.from_mnemonic(mnemonic_words)
```

---

## Common Transaction Types

| Category           | Transactions                                                                                                                        |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| **Account**        | `AccountCreateTransaction`, `AccountUpdateTransaction`, `AccountDeleteTransaction`, `TransferTransaction`                           |
| **Token**          | `TokenCreateTransaction`, `TokenMintTransaction`, `TokenBurnTransaction`, `TokenAssociateTransaction`, `TokenDissociateTransaction` |
| **Consensus**      | `TopicCreateTransaction`, `TopicMessageSubmitTransaction`, `TopicUpdateTransaction`, `TopicDeleteTransaction`                       |
| **Smart Contract** | `ContractCreateTransaction`, `ContractExecuteTransaction`, `ContractCallQuery`                                                      |
| **File**           | `FileCreateTransaction`, `FileAppendTransaction`, `FileUpdateTransaction`, `FileDeleteTransaction`                                  |
| **Schedule**       | `ScheduleCreateTransaction`, `ScheduleSignTransaction`, `ScheduleDeleteTransaction`                                                 |

---

## REST API Quick Reference

### Account Endpoints

```
GET /api/v1/accounts                          # List accounts
GET /api/v1/accounts/{id}                      # Get account balance
GET /api/v1/accounts/{id}/info                 # Get account info
GET /api/v1/accounts/{id}/allowances/crypto    # Get crypto allowances
GET /api/v1/accounts/{id}/allowances/tokens    # Get token allowances
GET /api/v1/accounts/{id}/nfts                 # Get NFTs
GET /api/v1/accounts/{id}/tokens               # Get token relationships
```

### Token Endpoints

```
GET /api/v1/tokens/{tokenId}                   # Get token info
GET /api/v1/tokens/{tokenId}/balances          # Get token balances
GET /api/v1/tokens/{tokenId}/nfts              # Get NFTs for token
```

### Transaction Endpoints

```
GET /api/v1/transactions/{transactionId}       # Get transaction
GET /api/v1/transactions                       # List transactions
GET /api/v1/transactions/{transactionId}/record # Get transaction record
```

### Topic Endpoints

```
GET /api/v1/topics/{topicId}/messages          # Get topic messages
GET /api/v1/topics/{topicId}                   # Get topic info
```

---

## Error Handling

**JavaScript Pattern:**

```typescript
try {
  const response = await transaction.execute(client);
  const receipt = await response.getReceipt(client);

  if (receipt.status !== Status.Success) {
    throw new Error(`Transaction failed: ${receipt.status}`);
  }
} catch (error) {
  if (error instanceof ReceiptStatusError) {
    console.error("Transaction failed:", error.status);
  } else {
    console.error("Unexpected error:", error);
  }
}
```

---

## Configuration Tips

### Set Max Transaction Fee

```typescript
client.setDefaultMaxTransactionFee(new Hbar(2));
```

### Set Max Query Payment

```typescript
client.setDefaultMaxQueryPayment(new Hbar(1));
```

### Configure Retry Logic

```typescript
client.setMaxAttempts(10);
client.setMaxBackoff(3000); // 3 seconds
client.setMinBackoff(500); // 500ms
```

### Set Mirror Network

```typescript
client.setMirrorNetwork(["testnet.mirrornode.hedera.com:443"]);
```

---

## SDK Versions & Migration

### JavaScript SDK

- **Old:** `@hashgraph/sdk`
- **New:** `@hiero-ledger/sdk`
- **Dual Publishing:** v2.70.0 - v2.82.0
- **Cutover:** v2.83.0

### Java SDK

- **Old:** `com.hedera.hashgraph:sdk`
- **New:** `org.hiero:hiero-sdk`
- **Cutover:** v2.80.0

---

## Important Notices

### Deprecation Warning

**AccountBalanceQuery** will be removed in **July 2026**.

**Action Required:** Migrate to Mirror Node REST API

```typescript
// ❌ Deprecated (removing July 2026)
const balance = await new AccountBalanceQuery().setAccountId(accountId).execute(client);

// ✅ Recommended
const response = await fetch(`https://testnet.mirrornode.hedera.com/api/v1/accounts/${accountId}`);
const data = await response.json();
```

---

## Useful Links

- **Official Docs:** https://docs.hiero.org
- **GitHub:** https://github.com/hiero-ledger
- **Discord:** https://hedera.com/discord
- **Mirror Node API:** https://docs.hedera.com/hedera/sdks-and-apis/rest-api
- **Local Node:** https://github.com/hiero-ledger/hiero-local-node

---

## License

All Hiero SDKs are licensed under **Apache 2.0**.

---

_Quick Reference Guide v1.0_
