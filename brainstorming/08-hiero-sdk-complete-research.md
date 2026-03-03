# Complete Hiero SDK Research & API Reference

**Research Date:** March 3, 2026
**Research Scope:** Complete API documentation, functions, modules, and usage patterns for all Hiero SDKs

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Hiero SDK Overview](#hiero-sdk-overview)
3. [JavaScript/TypeScript SDK](#javascripttypescript-sdk)
4. [Java SDK](#java-sdk)
5. [Python SDK](#python-sdk)
6. [Go SDK](#go-sdk)
7. [Rust SDK](#rust-sdk)
8. [Swift SDK](#swift-sdk)
9. [C++ SDK](#c-sdk)
10. [REST API](#rest-api)
11. [DID SDKs](#did-sdks)
12. [Common Patterns](#common-patterns)

---

## Executive Summary

Hiero is the open-source distributed ledger technology of Linux Foundation Decentralized Trust, originally contributed by Hedera Hashgraph. The Hiero SDKs provide comprehensive access to the Hedera network across multiple programming languages.

### Key Facts

- **License:** Apache 2.0 (all official SDKs)
- **Maintainer:** Hiero organization under Linux Foundation Decentralized Trust
- **Core Technology:** Hashgraph consensus algorithm (aBFT)
- **Network Services:** Cryptocurrency transfers, Token Service, Consensus Service, Smart Contracts, File Service, Scheduled Transactions

### Official SDKs

| SDK | Maintainer | Status | GitHub |
|-----|-----------|---------|---------|
| Java SDK | Hiero | Official | [hiero-ledger/hiero-sdk-java](https://github.com/hiero-ledger/hiero-sdk-java) |
| JavaScript SDK | Hiero | Official | [hiero-ledger/hiero-sdk-js](https://github.com/hiero-ledger/hiero-sdk-js) |
| Go SDK | Hiero | Official | [hiero-ledger/hiero-sdk-go](https://github.com/hiero-ledger/hiero-sdk-go) |
| Rust SDK | Hiero | Official | [hiero-ledger/hiero-sdk-rust](https://github.com/hiero-ledger/hiero-sdk-rust) |
| Swift SDK | Hiero | Official | [hiero-ledger/hiero-sdk-swift](https://github.com/hiero-ledger/hiero-sdk-swift) |
| C++ SDK | Hiero | Official | [hiero-ledger/hiero-sdk-cpp](https://github.com/hiero-ledger/hiero-sdk-cpp) |
| Python SDK | Community | Community | [hiero-ledger/hiero-sdk-python](https://github.com/hiero-ledger/hiero-sdk-python) |

### Additional SDKs

- **DID SDKs:** Java, JavaScript, Python (for decentralized identity)
- **Wallet SDKs:** HashConnect, Blade Wallet, Link Wallet, WalletConnect
- **Serverless:** AWS Lambda, Cloudflare Workers

---

## Hiero SDK Overview

### Core Concepts

#### 1. Client Architecture
All SDKs follow a similar client pattern:
```javascript
// Create client for specific network
Client.forTestnet()
Client.forMainnet()
Client.forPreviewnet()

// Set operator (account that signs transactions)
client.setOperator(accountId, privateKey)
```

#### 2. Key Types Supported
- **Ed25519** (preferred for security/performance)
- **ECDSA (secp256k1)** (for EVM compatibility)
- **Composite Keys:** Key lists, threshold keys

#### 3. Network Services

| Service | Description |
|---------|-------------|
| **Cryptocurrency** | HBAR transfers, account management |
| **Token Service (HTS)** | Fungible & non-fungible tokens, KYC, freeze |
| **Consensus Service (HCS)** | Pub/sub messaging, ordered consensus |
| **Smart Contracts** | EVM-compatible contracts |
| **File Service** | Decentralized file storage |
| **Schedule Transaction** | Future/delayed execution |

#### 4. Transaction Types

All SDKs implement the following transaction categories:

**Account Transactions:**
- `AccountCreateTransaction`
- `AccountUpdateTransaction`
- `AccountDeleteTransaction`
- `TransferTransaction`
- `AccountAllowanceApprovalTransaction`

**Token Transactions:**
- `TokenCreateTransaction`
- `TokenUpdateTransaction`
- `TokenMintTransaction`
- `TokenBurnTransaction`
- `TokenAssociateTransaction`
- `TokenDissociateTransaction`
- `TokenGrantKycTransaction`
- `TokenRevokeKycTransaction`
- `TokenFreezeTransaction`
- `TokenUnfreezeTransaction`
- `TokenWipeTransaction`
- `TokenDeleteTransaction`

**Consensus Transactions:**
- `TopicCreateTransaction`
- `TopicUpdateTransaction`
- `TopicMessageSubmitTransaction`
- `TopicDeleteTransaction`

**Smart Contract Transactions:**
- `ContractCreateTransaction`
- `ContractUpdateTransaction`
- `ContractDeleteTransaction`
- `ContractExecuteTransaction`
- `ContractCallQuery`

**File Transactions:**
- `FileCreateTransaction`
- `FileAppendTransaction`
- `FileUpdateTransaction`
- `FileDeleteTransaction`

**Schedule Transactions:**
- `ScheduleCreateTransaction`
- `ScheduleSignTransaction`
- `ScheduleDeleteTransaction`

---

## JavaScript/TypeScript SDK

### Package Information

**Official Package:** `@hiero-ledger/sdk` (formerly `@hashgraph/sdk`)

**Installation:**
```bash
npm install @hiero-ledger/sdk
# or
yarn add @hiero-ledger/sdk
# or
pnpm add @hiero-ledger/sdk
```

**Version:**
- Current stable: v2.80.0
- Dual publishing period: v2.70.0 - v2.82.0 (both old and new namespaces)
- From v2.83.0: Only `@hiero-ledger` namespace

**React Native Support:**
- SDK v2.60+: Requires Expo SDK 51+ and `react-native-get-random-values`
- SDK v2.59 and below: Requires Expo SDK 49 and `@ethersproject/shims`
- Does NOT support React Native Bare

### Core Classes

#### 1. Client

```typescript
class Client {
  // Network creation
  static forTestnet(): Client
  static forMainnet(): Client
  static forPreviewnet(): Client
  static forNetwork(network: {[key: string]: string}): Client

  // Operator management
  setOperator(accountId: string | AccountId, privateKey: string | PrivateKey): Client

  // Network configuration
  setNetwork(network: {[key: string]: string}): Client

  // Transaction execution
  getMaxAttempts(): number
  setMaxAttempts(max: number): Client
  getMaxBackoff(): number
  setMaxBackoff(max: number): Client

  // Close client
  close(): Promise<void>
}
```

#### 2. AccountId

```typescript
class AccountId {
  constructor(shard: number, realm: number, account: number)
  static fromString(id: string): AccountId
  static fromEvmAddress(evmAddress: string): AccountId
  toString(): string
  toSolidityAddress(): string
}
```

#### 3. PrivateKey / PublicKey

```typescript
class PrivateKey {
  static generate(): PrivateKey
  static fromString(key: string): PrivateKey
  static fromMnemonic(mnemonic: string[]): PrivateKey
  derive(passphrase: string): PrivateKey

  publicKey: PublicKey
  sign(message: Uint8Array): Signature
  toString(): string
  toBytes(): Uint8Array
}

class PublicKey {
  static fromBytes(bytes: Uint8Array): PublicKey
  toEvmAddress(): string
  toString(): string
  verify(message: Uint8Array, signature: Signature): boolean
}
```

#### 4. Hbar

```typescript
class Hbar {
  constructor(amount: number | BigNumber, unit: HbarUnit)

  static fromTinybars(tinybars: number | BigNumber): Hbar
  static fromHbar(hbar: number | BigNumber): Hbar

  toTinybars(): BigNumber
  toHbar(): BigNumber
  toString(): string
}
```

### Transaction Classes

#### TransferTransaction

```typescript
class TransferTransaction extends Transaction<TransferTransaction> {
  addHbarTransfer(accountId: AccountId | string, amount: Hbar): TransferTransaction
  addTokenTransfer(tokenId: TokenId, accountId: AccountId, amount: number): TransferTransaction
  addNftTransfer(tokenId: TokenId, from: AccountId, to: AccountId, serial: number): TransferTransaction

  // Transaction methods (inherited)
  setTransactionMemo(memo: string): TransferTransaction
  setMaxTransactionFee(fee: Hbar): TransferTransaction
  setTransactionValidDuration(duration: Duration): TransferTransaction
  execute(client: Client): Promise<TransactionResponse>
  sign(privateKey: PrivateKey): TransferTransaction
}
```

#### AccountCreateTransaction

```typescript
class AccountCreateTransaction extends Transaction<AccountCreateTransaction> {
  setKey(key: PublicKey): AccountCreateTransaction
  setInitialBalance(balance: Hbar): AccountCreateTransaction
  setAccountMemo(memo: string): AccountCreateTransaction
  setReceiverSignatureRequired(required: boolean): AccountCreateTransaction
  setAutoRenewPeriod(period: Duration): AccountCreateTransaction
  setStakedAccountId(accountId: AccountId): AccountCreateTransaction
  setStakedNodeId(nodeId: number): AccountCreateTransaction
  setDeclineStakingReward(decline: boolean): AccountCreateTransaction
  setAlias(evmAddress: string): AccountCreateTransaction

  execute(client: Client): Promise<TransactionResponse>
  getReceipt(client: Client): Promise<AccountCreateTransactionReceipt>
}
```

#### TokenCreateTransaction

```typescript
class TokenCreateTransaction extends Transaction<TokenCreateTransaction> {
  setTokenName(name: string): TokenCreateTransaction
  setTokenSymbol(symbol: string): TokenCreateTransaction
  setDecimals(decimals: number): TokenCreateTransaction
  setInitialSupply(supply: number): TokenCreateTransaction
  setTreasuryAccountId(id: AccountId): TokenCreateTransaction
  setAdminKey(key: Key): TokenCreateTransaction
  setKycKey(key: Key): TokenCreateTransaction
  setFreezeKey(key: Key): TokenCreateTransaction
  setWipeKey(key: Key): TokenCreateTransaction
  setSupplyKey(key: Key): TokenCreateTransaction
  setFeeScheduleKey(key: Key): TokenCreateTransaction
  setPauseKey(key: Key): TokenCreateTransaction
  setMetadata(key: Key): TokenCreateTransaction
  setAutoRenewAccountId(id: AccountId): TokenCreateTransaction
  setAutoRenewPeriod(period: Duration): TokenCreateTransaction
  setTokenType(type: TokenType): TokenCreateTransaction
  setSupplyType(type: TokenSupplyType): TokenCreateTransaction
  setMaxSupply(max: number): TokenCreateTransaction
  setCustomFees(fees: CustomFee[]): TokenCreateTransaction

  execute(client: Client): Promise<TransactionResponse>
  getReceipt(client: Client): Promise<TokenCreateTransactionReceipt>
}
```

#### TopicCreateTransaction (HCS)

```typescript
class TopicCreateTransaction extends Transaction<TopicCreateTransaction> {
  setTopicMemo(memo: string): TopicCreateTransaction
  setAdminKey(key: Key): TopicCreateTransaction
  setSubmitKey(key: Key): TopicCreateTransaction
  setAutoRenewAccountId(id: AccountId): TopicCreateTransaction
  setAutoRenewPeriod(period: Duration): TopicCreateTransaction

  execute(client: Client): Promise<TransactionResponse>
  getReceipt(client: Client): Promise<TopicCreateTransactionReceipt>
}

class TopicMessageSubmitTransaction extends Transaction<TopicMessageSubmitTransaction> {
  setTopicId(topicId: TopicId | string): TopicMessageSubmitTransaction
  setMessage(message: string | Uint8Array): TopicMessageSubmitTransaction

  execute(client: Client): Promise<TransactionResponse>
  getReceipt(client: Client): Promise<TransactionReceipt>
}
```

### Query Classes

#### AccountBalanceQuery

```typescript
class AccountBalanceQuery extends Query<AccountBalanceQuery, AccountBalance> {
  setAccountId(accountId: AccountId | string): AccountBalanceQuery

  execute(client: Client): Promise<AccountBalance>
}

class AccountBalance {
  hbars: Hbar
  tokens: Map<TokenId, number>
}
```

#### AccountInfoQuery

```typescript
class AccountInfoQuery extends Query<AccountInfoQuery, AccountInfo> {
  setAccountId(accountId: AccountId | string): AccountInfoQuery

  execute(client: Client): Promise<AccountInfo>
}

class AccountInfo {
  accountId: AccountId
  key: Key
  balance: Hbar
  tokenRelationships: Map<TokenId, TokenRelationship>
  accountMemo: string
  expirationTime: Instant
}
```

#### TokenInfoQuery

```typescript
class TokenInfoQuery extends Query<TokenInfoQuery, TokenInfo> {
  setTokenId(tokenId: TokenId | string): TokenInfoQuery

  execute(client: Client): Promise<TokenInfo>
}

class TokenInfo {
  tokenId: TokenId
  name: string
  symbol: string
  decimals: number
  totalSupply: number
  treasuryAccountId: AccountId
  adminKey: Key
  kycKey: Key
  freezeKey: Key
  wipeKey: Key
  supplyKey: Key
  feeScheduleKey: Key
  pauseKey: Key
  defaultFreezeStatus: boolean
  defaultKycStatus: boolean
  deleted: boolean
  autoRenewPeriod: Duration
}
```

### Mirror Client (HCS Subscriptions)

```typescript
class MirrorClient {
  constructor(network: string | string[])

  subscribeToTopic(
    topicId: TopicId | string,
    handler: (message: TopicMessage) => void,
    errorHandler: (error: Error) => void
  ): Subscription
}

class MirrorConsensusTopicQuery {
  setTopicId(topicId: TopicId | string): MirrorConsensusTopicQuery
  setStartTime(startTime: Date): MirrorConsensusTopicQuery
  setEndTime(endTime: Date): MirrorConsensusTopicQuery
  setLimit(limit: number): MirrorConsensusTopicQuery

  subscribe(
    mirrorClient: MirrorClient,
    handler: (message: TopicMessage) => void,
    errorHandler: (error: Error) => void
  ): Subscription
}

class TopicMessage {
  topicId: TopicId
  sequenceNumber: number
  message: Uint8Array
  consensusTimestamp: Instant
  runningHash: Uint8Array
}
```

### Complete Usage Examples

#### Basic Transfer

```typescript
import { Client, TransferTransaction, Hbar, AccountId } from "@hiero-ledger/sdk";

const client = Client.forTestnet();
client.setOperator(operatorId, operatorKey);

const transaction = await new TransferTransaction()
  .addHbarTransfer(operatorId, Hbar.fromTinybars(-1000))
  .addHbarTransfer(recipientId, Hbar.fromTinybars(1000))
  .setTransactionMemo("Payment")
  .execute(client);

const receipt = await transaction.getReceipt(client);
console.log("Status:", receipt.status);
```

#### HCS Publish/Subscribe

```typescript
import {
  Client,
  TopicCreateTransaction,
  TopicMessageSubmitTransaction,
  MirrorClient,
  MirrorConsensusTopicQuery
} from "@hiero-ledger/sdk";

// Create topic
const client = Client.forTestnet();
client.setOperator(operatorId, operatorKey);

const topicTx = await new TopicCreateTransaction()
  .setTopicMemo("My Topic")
  .execute(client);

const topicReceipt = await topicTx.getReceipt(client);
const topicId = topicReceipt.topicId;

// Submit message
const submitTx = await new TopicMessageSubmitTransaction()
  .setTopicId(topicId)
  .setMessage("Hello, Hiero!")
  .execute(client);

// Subscribe
const mirrorClient = new MirrorClient("testnet.mirrornode.hedera.com:443");

new MirrorConsensusTopicQuery()
  .setTopicId(topicId)
  .subscribe(mirrorClient, (message) => {
    console.log("Received:", new TextDecoder().decode(message.message));
  });
```

---

## Java SDK

### Package Information

**Maven Coordinates:**
- **GroupId:** `com.hedera.hashgraph` (transitional to `org.hiero`)
- **ArtifactId:** `sdk` (transitioning to `hiero-sdk`)
- **Version:** v2.80.0+

**Migration:**
- Single-step cutover from v2.80.0
- New namespace: `org.hiero`
- Migration guidelines available

### Core API Structure

#### Client Configuration

```java
// Network creation
Client client = Client.forTestnet();
Client client = Client.forMainnet();
Client client = Client.forPreviewnet();

// Operator setup
client.setOperator(AccountId.fromString("0.0.1234"),
                   PrivateKey.fromString("302e..."));

// Advanced configuration
client.setDefaultMaxTransactionFee(new Hbar(2));
client.setMaxAttempts(10);
client.setMaxBackoff(Duration.ofSeconds(30));
client.setMirrorNetwork(Arrays.asList("testnet.mirrornode.hedera.com:443"));
```

#### Account Operations

```java
// Create account
AccountCreateTransaction accountCreate = new AccountCreateTransaction()
    .setKey(publicKey)
    .setInitialBalance(new Hbar(1000))
    .setAccountMemo("My account")
    .setAutoRenewPeriod(Duration.ofDays(30));

TransactionResponse response = accountCreate.execute(client);
TransactionReceipt receipt = response.getReceipt(client);
AccountId newAccountId = receipt.accountId;

// Query account info
AccountInfo info = new AccountInfoQuery()
    .setAccountId(newAccountId)
    .execute(client);

System.out.println("Balance: " + info.accountBalance);
```

#### Token Operations

```java
// Create token
TokenCreateTransaction tokenCreate = new TokenCreateTransaction()
    .setTokenName("My Token")
    .setTokenSymbol("MTK")
    .setDecimals(2)
    .setInitialSupply(1000000)
    .setTreasuryAccountId(treasuryId)
    .setAdminKey(adminKey)
    .setSupplyKey(supplyKey)
    .setFreezeDefault(false);

TransactionResponse tokenResponse = tokenCreate.execute(client);
TokenId tokenId = tokenResponse.getReceipt(client).tokenId;

// Mint tokens
TokenMintTransaction mintTx = new TokenMintTransaction()
    .setTokenId(tokenId)
    .setAmount(1000)
    .freezeWith(client);

mintTx.sign(supplyKey)
      .execute(client)
      .getReceipt(client);

// Transfer tokens
TransferTransaction transferTx = new TransferTransaction()
    .addTokenTransfer(tokenId, senderId, -100)
    .addTokenTransfer(tokenId, receiverId, 100)
    .execute(client)
    .getReceipt(client);
```

#### HCS Operations

```java
// Create topic
TopicCreateTransaction topicCreate = new TopicCreateTransaction()
    .setTopicMemo("Important updates")
    .setAdminKey(adminKey)
    .setSubmitKey(submitKey)
    .setAutoRenewPeriod(Duration.ofDays(30));

TopicId topicId = topicCreate.execute(client).getReceipt(client).topicId;

// Submit message
TopicMessageSubmitTransaction submitTx = new TopicMessageSubmitTransaction()
    .setTopicId(topicId)
    .setMessage("Hello, Hiero!");

TransactionResponse submitResponse = submitTx.execute(client);
TransactionReceipt receipt = submitResponse.getReceipt(client);
```

### Advanced Features

#### Schedule Transactions

```java
// Schedule a transaction for future execution
TransferTransaction transfer = new TransferTransaction()
    .addHbarTransfer(senderId, Hbar.fromTinybars(-1000))
    .addHbarTransfer(receiverId, Hbar.fromTinybars(1000));

ScheduleCreateTransaction scheduleTx = new ScheduleCreateTransaction()
    .setScheduledTransaction(transfer)
    .setAdminKey(adminKey)
    .setPayerAccountId(payerId)
    .setExpirationTime(Instant.now().plus(60, ChronoUnit.DAYS));

TransactionResponse response = scheduleTx.execute(client);
ScheduleId scheduleId = response.getReceipt(client).scheduleId;
```

#### Smart Contracts

```java
// Create contract from bytecode
ContractCreateFlow contractCreate = new ContractCreateFlow()
    .setGas(100000)
    .setBytecode(bytecode)
    .setAdminKey(adminKey)
    .setInitialBalance(new Hbar(10));

ContractId contractId = contractCreate.execute(client).getReceipt(client).contractId;

// Call contract function
ContractFunctionResult result = new ContractCallQuery()
    .setContractId(contractId)
    .setGas(100000)
    .setFunction("getBalance")
    .execute(client);

BigInteger balance = result.getOutput(0).asInt(BigInteger.class);
```

---

## Python SDK

### Package Information

**PyPI Package:** `hiero-sdk-python`

**Installation:**
```bash
pip install hiero-sdk-python
pip install python-dotenv
```

**Compatibility:**
- Python ≥ 3.10
- Tested on Python 3.10–3.14

**Environment Setup:**
```bash
# Create .env file
OPERATOR_ID=0.0.1234
OPERATOR_KEY=302e020100300506032b657004220420...
HIERO_NETWORK=testnet
```

### Core API Usage

#### Basic Setup

```python
import os
from dotenv import load_dotenv
from hiero_sdk_python import (
    Network, Client, AccountId, PrivateKey,
    CryptoGetAccountBalanceQuery
)

load_dotenv()

# Create client
network = Network("testnet")
client = Client(network)

# Set operator
operator_id = AccountId.from_string(os.getenv("OPERATOR_ID"))
operator_key = PrivateKey.from_string(os.getenv("OPERATOR_KEY"))
client.set_operator(operator_id, operator_key)

# Query balance
balance = CryptoGetAccountBalanceQuery(account_id=operator_id).execute(client)
print(f"Balance: {balance.hbars} HBAR")
```

#### Account Operations

```python
from hiero_sdk_python import (
    AccountCreateTransaction, Hbar, PrivateKey
)

# Generate new key
new_key = PrivateKey.generate()
public_key = new_key.public_key()

# Create account
transaction = AccountCreateTransaction()
    .set_key(public_key)
    .set_initial_balance(Hbar(100))
    .freeze_with(client)

transaction.sign(operator_key)
response = transaction.execute(client)
receipt = response.get_receipt(client)

new_account_id = receipt.account_id
print(f"New account ID: {new_account_id}")
```

#### Token Operations

```python
from hiero_sdk_python import (
    TokenCreateTransaction, TokenType, TokenSupplyType
)

# Create fungible token
token_tx = TokenCreateTransaction()
    .set_token_name("My Token")
    .set_token_symbol("MTK")
    .set_decimals(2)
    .set_initial_supply(1000000)
    .set_treasury_account_id(treasury_id)
    .set_admin_key(admin_key.public_key())
    .set_supply_key(supply_key.public_key())
    .freeze_with(client)

token_tx.sign(admin_key)
token_tx.sign(supply_key)
response = token_tx.execute(client)
receipt = response.get_receipt(client)

token_id = receipt.token_id
print(f"Token ID: {token_id}")
```

#### HCS Operations

```python
from hiero_sdk_python import (
    TopicCreateTransaction, TopicMessageSubmitTransaction
)

# Create topic
topic_tx = TopicCreateTransaction()
    .set_topic_memo("My Topic")
    .set_admin_key(admin_key.public_key())
    .freeze_with(client)

topic_tx.sign(admin_key)
response = topic_tx.execute(client)
receipt = response.getReceipt(client)

topic_id = receipt.topicId

# Submit message
message_tx = TopicMessageSubmitTransaction()
    .set_topic_id(topic_id)
    .set_message("Hello, Hiero!")
    .execute(client)

receipt = message_tx.get_receipt(client)
print(f"Message sequence: {receipt.topic_sequence_number}")
```

### Advanced Features

#### NFT Operations

```python
from hiero_sdk_python import (
    TokenCreateTransaction, TokenType, TokenMintTransaction,
    TokenAssociateTransaction, TransferTransaction
)

# Create NFT token (non-fungible)
nft_tx = TokenCreateTransaction()
    .set_token_name("My NFT Collection")
    .set_token_symbol("MNFT")
    .set_token_type(TokenType.NON_FUNGIBLE_UNIQUE)
    .set_treasury_account_id(treasury_id)
    .set_admin_key(admin_key.public_key())
    .set_supply_key(supply_key.public_key())
    .freeze_with(client)

response = nft_tx.execute(client)
nft_token_id = response.get_receipt(client).token_id

# Mint NFTs with metadata
metadata_list = [
    bytes([1, 2, 3, 4]),  # NFT #1 metadata
    bytes([5, 6, 7, 8]),  # NFT #2 metadata
]

mint_tx = TokenMintTransaction()
    .set_token_id(nft_token_id)
    .set_metadata(metadata_list)
    .freeze_with(client)

mint_tx.sign(supply_key)
response = mint_tx.execute(client)
receipt = response.get_receipt(client)

serials = receipt.serials
print(f"Minted NFTs with serials: {serials}")

# Transfer NFT
transfer_tx = TransferTransaction()
    .add_nft_transfer(nft_token_id, treasury_id, recipient_id, serials[0])
    .execute(client)
    .get_receipt(client)
```

---

## Go SDK

### Package Information

**GitHub:** [hiero-ledger/hiero-sdk-go](https://github.com/hiero-ledger/hiero-sdk-go)

**Installation:**
```bash
go get github.com/hiero-ledger/hiero-sdk-go/v2
```

### Core API Usage

#### Client Setup

```go
package main

import (
    "context"
    "fmt"
    "github.com/hiero-ledger/hiero-sdk-go/v2"
)

func main() {
    // Create client
    client := hiero.ClientForTestnet()

    // Set operator
    operatorKey, _ := hiero.PrivateKeyFromString("302e...")
    operatorAccountID, _ := hiero.AccountIDFromString("0.0.1234")

    client.SetOperator(operatorAccountID, operatorKey)
}
```

#### Transfer Transaction

```go
// Transfer HBAR
recipientAccountID, _ := hiero.AccountIDFromString("0.0.5678")

transaction := hiero.NewTransferTransaction().
    AddHbarTransfer(operatorAccountID, hiero.NewHbar(-1).
        SetUnit(hiero.HbarUnits.Tinybar)).
    AddHbarTransfer(recipientAccountID, hiero.NewHbar(1).
        SetUnit(hiero.HbarUnits.Tinybar))

response, err := transaction.Execute(client)
if err != nil {
    panic(err)
}

receipt, err := response.GetReceipt(client)
if err != nil {
    panic(err)
}

fmt.Println("Transaction status:", receipt.Status)
```

#### Token Operations

```go
// Create token
supplyKey, _ := hiero.GeneratePrivateKey()
adminKey, _ := hiero.GeneratePrivateKey()

transaction := hiero.NewTokenCreateTransaction().
    SetTokenName("My Token").
    SetTokenSymbol("MTK").
    SetDecimals(2).
    SetInitialSupply(1000000).
    SetTreasuryAccountID(operatorAccountID).
    SetAdminKey(adminKey.PublicKey()).
    SetSupplyKey(supplyKey.PublicKey())

// Freeze and sign
txResponse, err := transaction.FreezeWith(client).Sign(operatorKey).Execute(client)
if err != nil {
    panic(err)
}

receipt, err := txResponse.GetReceipt(client)
if err != nil {
    panic(err)
}

fmt.Println("Token ID:", receipt.TokenID)

// Mint additional tokens
mintTx := hiero.NewTokenMintTransaction().
    SetTokenID(receipt.TokenID).
    SetAmount(1000).
    FreezeWith(client)

mintTx.Sign(supplyKey)
mintResponse, err := mintTx.Execute(client)
if err != nil {
    panic(err)
}

mintReceipt, err := mintResponse.GetReceipt(client)
if err != nil {
    panic(err)
}

fmt.Println("Minted:", mintReceipt.SerialNumbers)
```

#### HCS Operations

```go
// Create topic
topicTx := hiero.NewTopicCreateTransaction().
    SetTopicMemo("My Topic").
    SetAdminKey(adminKey.PublicKey())

txResponse, err := topicTx.Execute(client)
if err != nil {
    panic(err)
}

receipt, err := txResponse.GetReceipt(client)
if err != nil {
    panic(err)
}

fmt.Println("Topic ID:", receipt.TopicID)

// Submit message
submitTx := hiero.NewTopicMessageSubmitTransaction().
    SetTopicID(receipt.TopicID).
    SetMessage([]byte("Hello, Hiero!"))

submitResponse, err := submitTx.Execute(client)
if err != nil {
    panic(err)
}

submitReceipt, err := submitResponse.GetReceipt(client)
if err != nil {
    panic(err)
}

fmt.Println("Sequence number:", submitReceipt.TopicSequenceNumber)
```

### Contract Operations

```go
// Create contract
contractTx := hiero.NewContractCreateTransaction().
    SetGas(100000).
    SetBytecode(bytecode).
    SetAdminKey(adminKey.PublicKey())

contractResponse, err := contractTx.Execute(client)
if err != nil {
    panic(err)
}

contractReceipt, err := contractResponse.GetReceipt(client)
if err != nil {
    panic(err)
}

fmt.Println("Contract ID:", contractReceipt.ContractID)

// Call contract
functionParams := hiero.NewContractFunctionParameters().
    AddString("argument")

callQuery := hiero.NewContractCallQuery().
    SetContractID(contractReceipt.ContractID).
    SetGas(100000).
    SetFunction("getBalance", functionParams)

result, err := callQuery.Execute(client)
if err != nil {
    panic(err)
}

balance := result.GetInt64(0)
fmt.Println("Balance:", balance)
```

---

## Rust SDK

### Package Information

**GitHub:** [hiero-ledger/hiero-sdk-rust](https://github.com/hiero-ledger/hiero-sdk-rust)

**Cargo.toml:**
```toml
[dependencies]
hiero-sdk = "0.6"
```

### Core API Usage

#### Client Setup

```rust
use hiero_sdk::{
    Client, AccountId, PrivateKey, TransferTransaction,
    Hbar, TransactionReceipt
};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Create client for testnet
    let client = Client::for_testnet();

    // Set operator
    let operator_key = PrivateKey::from_str("302e...")?;
    let operator_id = AccountId::from_str("0.0.1234")?;

    client.set_operator(&operator_id, &operator_key);

    Ok(())
}
```

#### Transfer HBAR

```rust
use hiero_sdk::{TransferTransaction, Hbar, AccountId};

async fn transfer_hbar(
    client: &Client,
    sender: AccountId,
    recipient: AccountId,
    amount: u64,
) -> Result<TransactionReceipt, Box<dyn std::error::Error>> {
    let transfer_tx = TransferTransaction::new()
        .add_hbar_transfer(&sender, Hbar::from_tinybars(-(amount as i64)))
        .add_hbar_transfer(&recipient, Hbar::from_tinybars(amount as i64));

    let response = transfer_tx.execute(client).await?;
    let receipt = response.get_receipt(client).await?;

    Ok(receipt)
}
```

#### Token Operations

```rust
use hiero_sdk::{
    TokenCreateTransaction, TokenMintTransaction,
    TokenType, TokenSupplyType
};

async fn create_token(
    client: &Client,
    treasury_id: AccountId,
    admin_key: PrivateKey,
    supply_key: PrivateKey,
) -> Result<TokenId, Box<dyn std::error::Error>> {
    let token_create_tx = TokenCreateTransaction::new()
        .name("My Token")
        .symbol("MTK")
        .decimals(2)
        .initial_supply(1_000_000)
        .treasury_account_id(treasury_id)
        .admin_key(admin_key.public_key())
        .supply_key(supply_key.public_key())
        .freeze_with(client)?;

    let tx_response = token_create_tx.sign(&admin_key).execute(client).await?;
    let receipt = tx_response.get_receipt(client).await?;

    Ok(receipt.token_id.unwrap())
}

async fn mint_tokens(
    client: &Client,
    token_id: TokenId,
    amount: u64,
    supply_key: PrivateKey,
) -> Result<(), Box<dyn std::error::Error>> {
    let mint_tx = TokenMintTransaction::new()
        .token_id(token_id)
        .amount(amount)
        .freeze_with(client)?;

    let tx_response = mint_tx.sign(&supply_key).execute(client).await?;
    let _receipt = tx_response.get_receipt(client).await?;

    Ok(())
}
```

#### Query Operations

```rust
use hiero_sdk::{AccountInfoQuery, AccountBalance, TokenInfoQuery};

async fn query_account_info(
    client: &Client,
    account_id: AccountId,
) -> Result<AccountInfo, Box<dyn std::error::Error>> {
    let info = AccountInfoQuery::new()
        .account_id(account_id)
        .execute(client)
        .await?;

    Ok(info)
}

async fn query_token_info(
    client: &Client,
    token_id: TokenId,
) -> Result<TokenInfo, Box<dyn std::error::Error>> {
    let info = TokenInfoQuery::new()
        .token_id(token_id)
        .execute(client)
        .await?;

    Ok(info)
}
```

### Environment Setup

```rust
use hiero_sdk::Network;

// Create custom network
let network = Network::new_custom(vec![
    "0.node.hedera.com:50211".to_string(),
    "1.node.hedera.com:50211".to_string(),
])?;

// Or use predefined networks
let testnet = Network::testnet();
let mainnet = Network::mainnet();
let previewnet = Network::previewnet();
```

---

## Swift SDK

### Package Information

**GitHub:** [hiero-ledger/hiero-sdk-swift](https://github.com/hiero-ledger/hiero-sdk-swift)

**Requirements:**
- Swift 5.6+ (6.0+ recommended)
- macOS 10.15+ / iOS 13+
- Swift Package Manager

**Dependencies:**
```swift
// Package.swift
dependencies: [
    .package(url: "https://github.com/hiero-ledger/hiero-sdk-swift", from: "0.5.0")
]
```

### Core API Usage

#### Client Setup

```swift
import HieroSDK

// Create client
let client = Client.forTestnet()

// Set operator
let operatorKey = PrivateKey.fromString("302e...")!
let operatorAccountId = AccountId.fromString("0.0.1234")!

try client.setOperator(accountId: operatorAccountId, privateKey: operatorKey)
```

#### Transfer Transaction

```swift
import HieroSDK

func transferHbar(
    client: Client,
    from: AccountId,
    to: AccountId,
    amount: Hbar
) async throws -> TransactionReceipt {
    let transferTx = TransferTransaction()
        .addHbarTransfer(accountId: from, amount: -amount)
        .addHbarTransfer(accountId: to, amount: amount)

    let response = try await transferTx.execute(client)
    let receipt = try await response.getReceipt(client)

    return receipt
}

// Usage
let senderId = AccountId.fromString("0.0.1234")!
let recipientId = AccountId.fromString("0.0.5678")!
let amount = Hbar.fromTinybars(1000)

let receipt = try await transferHbar(
    client: client,
    from: senderId,
    to: recipientId,
    amount: amount
)

print("Transaction status: \(receipt.status)")
```

#### Token Operations

```swift
import HieroSDK

func createToken(
    client: Client,
    treasuryId: AccountId,
    adminKey: PrivateKey,
    supplyKey: PrivateKey
) async throws -> TokenId {
    let tokenCreateTx = TokenCreateTransaction()
        .tokenName("My Token")
        .tokenSymbol("MTK")
        .decimals(2)
        .initialSupply(1_000_000)
        .treasuryAccountId(treasuryId)
        .adminKey(adminKey.publicKey)
        .supplyKey(supplyKey.publicKey)
        .freezeWith(client)

    let txResponse = try await tokenCreateTx
        .sign(privateKey: adminKey)
        .execute(client)

    let receipt = try await txResponse.getReceipt(client)

    return receipt.tokenId!
}

func mintTokens(
    client: Client,
    tokenId: TokenId,
    amount: UInt64,
    supplyKey: PrivateKey
) async throws {
    let mintTx = TokenMintTransaction()
        .tokenId(tokenId)
        .amount(amount)
        .freezeWith(client)

    let txResponse = try await mintTx
        .sign(privateKey: supplyKey)
        .execute(client)

    let _ = try await txResponse.getReceipt(client)
}
```

#### HCS Operations

```swift
import HieroSDK

func createTopic(
    client: Client,
    adminKey: PrivateKey
) async throws -> TopicId {
    let topicTx = TopicCreateTransaction()
        .topicMemo("My Topic")
        .adminKey(adminKey.publicKey)
        .freezeWith(client)

    let txResponse = try await topicTx
        .sign(privateKey: adminKey)
        .execute(client)

    let receipt = try await txResponse.getReceipt(client)

    return receipt.topicId!
}

func submitMessage(
    client: Client,
    topicId: TopicId,
    message: Data
) async throws -> UInt64 {
    let submitTx = TopicMessageSubmitTransaction()
        .topicId(topicId)
        .message(message)

    let txResponse = try await submitTx.execute(client)
    let receipt = try await txResponse.getReceipt(client)

    return receipt.topicSequenceNumber
}
```

---

## C++ SDK

### Package Information

**GitHub:** [hiero-ledger/hiero-sdk-cpp](https://github.com/hiero-ledger/hiero-sdk-cpp)

**Status:** Not production-ready (under development)

**Build System:**
- CMake with presets
- vcpkg support

**Requirements:**
- C++17 or later
- OpenSSL
- Protocol Buffers

### Core API Usage

#### Client Setup

```cpp
#include <HieroSDK.h>

using namespace Hiero;

int main() {
    // Create client
    Client client = Client::forTestnet();

    // Set operator
    PrivateKey operatorKey = PrivateKey::fromString("302e...");
    AccountId operatorId = AccountId::fromString("0.0.1234");

    client.setOperator(operatorId, operatorKey);

    return 0;
}
```

#### Transfer Transaction

```cpp
#include <HieroSDK.h>

using namespace Hiero;

void transferHbar(
    Client& client,
    AccountId sender,
    AccountId receiver,
    uint64_t amount
) {
    TransferTransaction transferTx;

    transferTx.addHbarTransfer(sender, Hbar::fromTinybars(-static_cast<int64_t>(amount)));
    transferTx.addHbarTransfer(receiver, Hbar::fromTinybars(static_cast<int64_t>(amount)));

    TransactionResponse response = transferTx.execute(client);
    TransactionReceipt receipt = response.getReceipt(client);

    std::cout << "Status: " << receipt.getStatus() << std::endl;
}
```

---

## REST API

### Mirror Node REST API

The Mirror Node REST API provides read access to historical and current network data.

**Base URLs:**
- **Mainnet:** `https://mainnet.mirrornode.hedera.com`
- **Testnet:** `https://testnet.mirrornode.hedera.com`
- **Previewnet:** `https://previewnet.mirrornode.hedera.com`

### Account Endpoints

#### List Accounts
```
GET /api/v1/accounts
```

**Query Parameters:**
- `account.id`: Filter by account ID
- `balance`: Filter by balance
- `limit`: Number of results (default: 25, max: 100)
- `order`: "asc" or "desc"

**Response:**
```json
{
  "accounts": [
    {
      "account": "0.0.1234",
      "balance": {
        "balance": 100000000,
        "timestamp": "2026-03-03T00:00:00.000Z"
      },
      "expiry_timestamp": 1735689600,
      "auto_renew_period": 7776000
    }
  ],
  "links": {
    "next": "/api/v1/accounts?limit=25&timestamp=1735689600"
  }
}
```

#### Get Account Balance
```
GET /api/v1/accounts/{idOrAliasOrEvmAddress}
```

**Response:**
```json
{
  "account": "0.0.1234",
  "balance": {
    "balance": 100000000,
    "tokens": [
      {
        "token_id": "0.0.4567",
        "balance": 5000
      }
    ]
  },
  "expiry_timestamp": 1735689600
}
```

#### Get Account Info
```
GET /api/v1/accounts/{id}/info
```

**Response:**
```json
{
  "account_id": "0.0.1234",
  "key": {
    "key": "0.0.9876",
    "_type": "ED25519"
  },
  "balance": 100000000,
  "auto_renew_period": 7776000,
  "receiver_sig_required": false
}
```

### Token Endpoints

#### Get Token Info
```
GET /api/v1/tokens/{tokenId}
```

**Response:**
```json
{
  "token_id": "0.0.4567",
  "name": "My Token",
  "symbol": "MTK",
  "decimals": 2,
  "total_supply": "10000000000",
  "treasury_account_id": "0.0.1234",
  "admin_key": {
    "key": "0.0.9876",
    "_type": "ED25519"
  },
  "kyc_key": null,
  "freeze_key": null,
  "wipe_key": null,
  "supply_key": null,
  "freeze_default": false
}
```

#### Get Token Balances
```
GET /api/v1/tokens/{tokenId}/balances
```

**Response:**
```json
{
  "balances": [
    {
      "account": "0.0.1234",
      "balance": 1000000
    },
    {
      "account": "0.0.5678",
      "balance": 5000
    }
  ],
  "links": {}
}
```

### Transaction Endpoints

#### Get Transaction
```
GET /api/v1/transactions/{transactionId}
```

**Response:**
```json
{
  "transaction_id": "0.0.1234@1735689600.123456789",
  "transaction_hash": "abc123...",
  "consensus_timestamp": "2026-03-03T00:00:00.000Z",
  "validated_timestamp": "2026-03-03T00:00:01.000Z",
  "transactions": [
    {
      "name": "CRYPTOTRANSFER",
      "transaction": {
        "transfers": [
          {
            "account": "0.0.1234",
            "amount": -1000
          },
          {
            "account": "0.0.5678",
            "amount": 1000
          }
        ]
      }
    }
  ],
  "transaction_results": [
    {
      "status": "SUCCESS"
    }
  ]
}
```

### Topic Endpoints

#### Get Topic Messages
```
GET /api/v1/topics/{topicId}/messages
```

**Query Parameters:**
- `timestamp`: Filter by timestamp
- `order`: "asc" or "desc"
- `limit`: Number of results

**Response:**
```json
{
  "messages": [
    {
      "topic_id": "0.0.9999",
      "sequence_number": 1,
      "message": "SGVsbG8gSGllcm8h",
      "consensus_timestamp": "2026-03-03T00:00:00.000Z",
      "running_hash": "abc123..."
    }
  ],
  "links": {
    "next": "/api/v1/topics/0.0.9999/messages?limit=25&timestamp=..."
  }
}
```

---

## DID SDKs

### Hiero DID SDK Python

**GitHub:** [hiero-ledger/hiero-did-sdk-python](https://github.com/hiero-ledger/hiero-did-sdk-python)

**Features:**
- Create and manage Hedera DID documents
- Create and manage AnonCreds resources
- Hedera Consensus Service (HCS) integration
- W3C DID specification compliant
- Hedera DID Method compliant

**Installation:**
```bash
pip install hiero-did-sdk-python
```

**Usage:**
```python
from hiero_did_sdk_python import HederaDid, DidDocument

# Create DID
did = HederaDid()
did_document = DidDocument(
    did_id="did:hedera:testnet:z6Mk...",
    public_key=public_key,
    verification_methods=[...]
)

# Publish to HCS
topic_id = await did.publish(did_document)

# Resolve DID
resolved_doc = await did.resolve("did:hedera:testnet:z6Mk...")
```

### Hiero DID SDK JavaScript

**GitHub:** [hiero-ledger/hiero-did-sdk-js](https://github.com/hiero-ledger/hiero-did-sdk-js)

**Installation:**
```bash
npm install @hiero-did-sdk/core
```

**Features:**
- Complete Hedera DID lifecycle management
- Create, update, deactivate, and resolve Hedera DIDs
- Secure key management
- DID document publishing to Hedera network
- W3C DID specification compliant
- AnonCreds support for verifiable credentials

**Usage:**
```typescript
import { HederaDid } from '@hiero-did-sdk/core';

// Create DID
const did = new HederaDid({
  network: 'testnet',
  privateKey: '302e...'
});

const didDocument = await did.create({
  controller: 'did:hedera:testnet:z6Mk...',
  verificationMethods: [...]
});

// Publish to HCS
await did.publish(didDocument);

// Resolve DID
const resolved = await did.resolve('did:hedera:testnet:z6Mk...');
```

---

## Common Patterns

### Error Handling

All SDKs follow similar error handling patterns:

```typescript
try {
  const response = await transaction.execute(client);
  const receipt = await response.getReceipt(client);

  if (receipt.status !== Status.Success) {
    throw new Error(`Transaction failed: ${receipt.status}`);
  }
} catch (error) {
  console.error("Transaction error:", error);
}
```

### Transaction Flow

1. **Create transaction object**
2. **Configure transaction parameters**
3. **Freeze with client** (optional but recommended)
4. **Sign with required keys**
5. **Execute on network**
6. **Get receipt to confirm**

### Retry Logic

SDKs include automatic retry logic:

```typescript
client.setMaxAttempts(10);
client.setMaxBackoff(3000); // 3 seconds
client.setMinBackoff(500);  // 500ms
```

### Fee Estimation

```typescript
const query = new AccountBalanceQuery()
  .setAccountId(accountId);

const cost = await query.getCost(client);
console.log("Query cost:", cost.toString());
```

### Mirror Node Queries

For historical data and better performance:

```typescript
// Use Mirror Node REST API instead of SDK queries
const response = await fetch(
  `https://testnet.mirrornode.hedera.com/api/v1/accounts/${accountId}`
);
const data = await response.json();
```

---

## Migration Notes

### JavaScript SDK Namespace Migration

**Old:** `@hashgraph/sdk`
**New:** `@hiero-ledger/sdk`

**Dual Publishing:** v2.70.0 - v2.82.0
**Cutover:** v2.83.0 (only `@hiero-ledger`)

```bash
# Update dependencies
npm uninstall @hashgraph/sdk
npm install @hiero-ledger/sdk

# Update imports
// Old
import { Client } from "@hashgraph/sdk";

// New
import { Client } from "@hiero-ledger/sdk";
```

### Java SDK Namespace Migration

**Old:** `com.hedera.hashgraph`
**New:** `org.hiero`

**Version:** v2.80.0 (single-step cutover)

```xml
<!-- pom.xml -->
<dependency>
  <groupId>org.hiero</groupId>
  <artifactId>hiero-sdk</artifactId>
  <version>2.80.0</version>
</dependency>
```

```java
// Update imports
// Old
import com.hedera.hashgraph.sdk.Client;

// New
import org.hiero.sdk.Client;
```

---

## Deprecation Notices

### AccountBalanceQuery (All SDKs)

**Removal Date:** July 2026
**Throttle Reduction:** May 2026

**Action Required:** Migrate to Mirror Node REST API

```typescript
// Deprecated (will be removed)
const balance = await new AccountBalanceQuery()
  .setAccountId(accountId)
  .execute(client);

// Recommended alternative
const response = await fetch(
  `https://testnet.mirrornode.hedera.com/api/v1/accounts/${accountId}`
);
const data = await response.json();
const balance = data.balance.balance;
```

---

## Additional Resources

### Official Documentation
- **Hiero Docs:** https://docs.hiero.org
- **Hedera Docs:** https://docs.hedera.com
- **Mirror Node API:** https://docs.hedera.com/hedera/sdks-and-apis/rest-api

### GitHub Repositories
- **Hiero Organization:** https://github.com/hiero-ledger
- **Hedera Organization:** https://github.com/hashgraph

### Community
- **Discord:** https://hedera.com/discord
- **Stack Overflow:** Tag questions with `hedera` and `hiero`

### Local Development
- **Hiero Local Node:** https://github.com/hiero-ledger/hiero-local-node
- **Installation:** `npm install -g @hiero-local/node`
- **Start:** `hiero-local-node start`

---

## Quick Reference Cards

### Network Endpoints

| Network | Consensus Node | Mirror Node REST | Mirror Node GRPC |
|---------|---------------|------------------|------------------|
| Mainnet | mainnet-public.hedera.com:50111 | mainnet.mirrornode.hedera.com | mainnet.mirrornode.hedera.com:443 |
| Testnet | testnet.hedera.com:50111 | testnet.mirrornode.hedera.com | testnet.mirrornode.hedera.com:443 |
| Previewnet | previewnet.hedera.com:50111 | previewnet.mirrornode.hedera.com | previewnet.mirrornode.hedera.com:443 |

### Fee Schedule (Approximate)

| Operation | Cost (HBAR) |
|-----------|-------------|
| Account Creation | $0.05 - $1.00 |
| Token Creation | $1.00 - $100.00 |
| Transfer | $0.001 |
| Consensus Message Submit | $0.0001 |
| Contract Call | Variable |

### Transaction Limits

| Limit | Value |
|-------|-------|
| Max Transaction Fee | 1,000,000 tinybars (0.001 HBAR) default |
| Max Query Payment | 1,000,000 tinybars (0.001 HBAR) default |
| Transaction Memo | 100 bytes |
| Transaction Valid Duration | 120 seconds default |
| Max Auto Renew Period | 3 months (7776000 seconds) |

---

## Conclusion

This comprehensive research document covers the complete Hiero SDK ecosystem across all supported languages. Each SDK provides:

1. **Client Management** - Network connection and operator configuration
2. **Cryptocurrency Operations** - HBAR transfers and account management
3. **Token Service (HTS)** - Fungible and NFT creation, management, and transfers
4. **Consensus Service (HCS)** - Pub/sub messaging with guaranteed order
5. **Smart Contracts** - EVM-compatible contract deployment and execution
6. **File Service** - Decentralized file storage
7. **Queries** - Account, token, and network information retrieval
8. **Mirror Node Integration** - Historical data access via REST API

For the most up-to-date information, always refer to the official GitHub repositories and documentation links provided in this document.

---

**Research End**
*Last Updated: March 3, 2026*
*Document Version: 1.0*
