---
title: Hiero SDK Research & Proposals
category: research
---

# Complete Hiero SDK Research & API Reference

**Research Date:** March 3, 2026
**Research Scope:** Complete API documentation, functions, modules, and usage patterns for all Hiero SDKs

## Executive Summary

Hiero is the open-source distributed ledger technology of Linux Foundation Decentralized Trust, originally contributed by Hedera Hashgraph. The Hiero SDKs provide comprehensive access to the Hedera network across multiple programming languages.

### Key Facts

- **License:** Apache 2.0 (all official SDKs)
- **Maintainer:** Hiero organization under Linux Foundation Decentralized Trust
- **Core Technology:** Hashgraph consensus algorithm (aBFT)
- **Network Services:** Cryptocurrency transfers, Token Service, Consensus Service, Smart Contracts, File Service, Scheduled Transactions

### Official SDKs

| SDK            | Maintainer | Status    | GitHub                                                                            |
| -------------- | ---------- | --------- | --------------------------------------------------------------------------------- |
| Java SDK       | Hiero      | Official  | [hiero-ledger/hiero-sdk-java](https://github.com/hiero-ledger/hiero-sdk-java)     |
| JavaScript SDK | Hiero      | Official  | [hiero-ledger/hiero-sdk-js](https://github.com/hiero-ledger/hiero-sdk-js)         |
| Go SDK         | Hiero      | Official  | [hiero-ledger/hiero-sdk-go](https://github.com/hiero-ledger/hiero-sdk-go)         |
| Rust SDK       | Hiero      | Official  | [hiero-ledger/hiero-sdk-rust](https://github.com/hiero-ledger/hiero-sdk-rust)     |
| Swift SDK      | Hiero      | Official  | [hiero-ledger/hiero-sdk-swift](https://github.com/hiero-ledger/hiero-sdk-swift)   |
| C++ SDK        | Hiero      | Official  | [hiero-ledger/hiero-sdk-cpp](https://github.com/hiero-ledger/hiero-sdk-cpp)       |
| Python SDK     | Community  | Community | [hiero-ledger/hiero-sdk-python](https://github.com/hiero-ledger/hiero-sdk-python) |

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
Client.forTestnet();
Client.forMainnet();
Client.forPreviewnet();

// Set operator (account that signs transactions)
client.setOperator(accountId, privateKey);
```

#### 2. Key Types Supported

- **Ed25519** (preferred for security/performance)
- **ECDSA (secp256k1)** (for EVM compatibility)
- **Composite Keys:** Key lists, threshold keys

#### 3. Network Services

| Service                     | Description                                 |
| --------------------------- | ------------------------------------------- |
| **Cryptocurrency**          | HBAR transfers, account management          |
| **Token Service (HTS)**     | Fungible & non-fungible tokens, KYC, freeze |
| **Consensus Service (HCS)** | Pub/sub messaging, ordered consensus        |
| **Smart Contracts**         | EVM-compatible contracts                    |
| **File Service**            | Decentralized file storage                  |
| **Schedule Transaction**    | Future/delayed execution                    |

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
  static forTestnet(): Client;
  static forMainnet(): Client;
  static forPreviewnet(): Client;
  static forNetwork(network: { [key: string]: string }): Client;

  // Operator management
  setOperator(accountId: string | AccountId, privateKey: string | PrivateKey): Client;

  // Network configuration
  setNetwork(network: { [key: string]: string }): Client;

  // Transaction execution
  getMaxAttempts(): number;
  setMaxAttempts(max: number): Client;
  getMaxBackoff(): number;
  setMaxBackoff(max: number): Client;

  // Close client
  close(): Promise<void>;
}
```

#### 2. AccountId

```typescript
class AccountId {
  constructor(shard: number, realm: number, account: number);
  static fromString(id: string): AccountId;
  static fromEvmAddress(evmAddress: string): AccountId;
  toString(): string;
  toSolidityAddress(): string;
}
```

#### 3. PrivateKey / PublicKey

```typescript
class PrivateKey {
  static generate(): PrivateKey;
  static fromString(key: string): PrivateKey;
  static fromMnemonic(mnemonic: string[]): PrivateKey;
  derive(passphrase: string): PrivateKey;

  publicKey: PublicKey;
  sign(message: Uint8Array): Signature;
  toString(): string;
  toBytes(): Uint8Array;
}

class PublicKey {
  static fromBytes(bytes: Uint8Array): PublicKey;
  toEvmAddress(): string;
  toString(): string;
  verify(message: Uint8Array, signature: Signature): boolean;
}
```

#### 4. Hbar

```typescript
class Hbar {
  constructor(amount: number | BigNumber, unit: HbarUnit);

  static fromTinybars(tinybars: number | BigNumber): Hbar;
  static fromHbar(hbar: number | BigNumber): Hbar;

  toTinybars(): BigNumber;
  toHbar(): BigNumber;
  toString(): string;
}
```

### Transaction Classes

#### TransferTransaction

```typescript
class TransferTransaction extends Transaction<TransferTransaction> {
  addHbarTransfer(accountId: AccountId | string, amount: Hbar): TransferTransaction;
  addTokenTransfer(tokenId: TokenId, accountId: AccountId, amount: number): TransferTransaction;
  addNftTransfer(
    tokenId: TokenId,
    from: AccountId,
    to: AccountId,
    serial: number,
  ): TransferTransaction;

  // Transaction methods (inherited)
  setTransactionMemo(memo: string): TransferTransaction;
  setMaxTransactionFee(fee: Hbar): TransferTransaction;
  setTransactionValidDuration(duration: Duration): TransferTransaction;
  execute(client: Client): Promise<TransactionResponse>;
  sign(privateKey: PrivateKey): TransferTransaction;
}
```

#### AccountCreateTransaction

```typescript
class AccountCreateTransaction extends Transaction<AccountCreateTransaction> {
  setKey(key: PublicKey): AccountCreateTransaction;
  setInitialBalance(balance: Hbar): AccountCreateTransaction;
  setAccountMemo(memo: string): AccountCreateTransaction;
  setReceiverSignatureRequired(required: boolean): AccountCreateTransaction;
  setAutoRenewPeriod(period: Duration): AccountCreateTransaction;
  setStakedAccountId(accountId: AccountId): AccountCreateTransaction;
  setStakedNodeId(nodeId: number): AccountCreateTransaction;
  setDeclineStakingReward(decline: boolean): AccountCreateTransaction;
  setAlias(evmAddress: string): AccountCreateTransaction;

  execute(client: Client): Promise<TransactionResponse>;
  getReceipt(client: Client): Promise<AccountCreateTransactionReceipt>;
}
```

#### TokenCreateTransaction

```typescript
class TokenCreateTransaction extends Transaction<TokenCreateTransaction> {
  setTokenName(name: string): TokenCreateTransaction;
  setTokenSymbol(symbol: string): TokenCreateTransaction;
  setDecimals(decimals: number): TokenCreateTransaction;
  setInitialSupply(supply: number): TokenCreateTransaction;
  setTreasuryAccountId(id: AccountId): TokenCreateTransaction;
  setAdminKey(key: Key): TokenCreateTransaction;
  setKycKey(key: Key): TokenCreateTransaction;
  setFreezeKey(key: Key): TokenCreateTransaction;
  setWipeKey(key: Key): TokenCreateTransaction;
  setSupplyKey(key: Key): TokenCreateTransaction;
  setFeeScheduleKey(key: Key): TokenCreateTransaction;
  setPauseKey(key: Key): TokenCreateTransaction;
  setMetadata(key: Key): TokenCreateTransaction;
  setAutoRenewAccountId(id: AccountId): TokenCreateTransaction;
  setAutoRenewPeriod(period: Duration): TokenCreateTransaction;
  setTokenType(type: TokenType): TokenCreateTransaction;
  setSupplyType(type: TokenSupplyType): TokenCreateTransaction;
  setMaxSupply(max: number): TokenCreateTransaction;
  setCustomFees(fees: CustomFee[]): TokenCreateTransaction;

  execute(client: Client): Promise<TransactionResponse>;
  getReceipt(client: Client): Promise<TokenCreateTransactionReceipt>;
}
```

#### TopicCreateTransaction (HCS)

```typescript
class TopicCreateTransaction extends Transaction<TopicCreateTransaction> {
  setTopicMemo(memo: string): TopicCreateTransaction;
  setAdminKey(key: Key): TopicCreateTransaction;
  setSubmitKey(key: Key): TopicCreateTransaction;
  setAutoRenewAccountId(id: AccountId): TopicCreateTransaction;
  setAutoRenewPeriod(period: Duration): TopicCreateTransaction;

  execute(client: Client): Promise<TransactionResponse>;
  getReceipt(client: Client): Promise<TopicCreateTransactionReceipt>;
}

class TopicMessageSubmitTransaction extends Transaction<TopicMessageSubmitTransaction> {
  setTopicId(topicId: TopicId | string): TopicMessageSubmitTransaction;
  setMessage(message: string | Uint8Array): TopicMessageSubmitTransaction;

  execute(client: Client): Promise<TransactionResponse>;
  getReceipt(client: Client): Promise<TransactionReceipt>;
}
```

### Query Classes

#### AccountBalanceQuery

```typescript
class AccountBalanceQuery extends Query<AccountBalanceQuery, AccountBalance> {
  setAccountId(accountId: AccountId | string): AccountBalanceQuery;

  execute(client: Client): Promise<AccountBalance>;
}

class AccountBalance {
  hbars: Hbar;
  tokens: Map<TokenId, number>;
}
```

#### AccountInfoQuery

```typescript
class AccountInfoQuery extends Query<AccountInfoQuery, AccountInfo> {
  setAccountId(accountId: AccountId | string): AccountInfoQuery;

  execute(client: Client): Promise<AccountInfo>;
}

class AccountInfo {
  accountId: AccountId;
  key: Key;
  balance: Hbar;
  tokenRelationships: Map<TokenId, TokenRelationship>;
  accountMemo: string;
  expirationTime: Instant;
}
```

#### TokenInfoQuery

```typescript
class TokenInfoQuery extends Query<TokenInfoQuery, TokenInfo> {
  setTokenId(tokenId: TokenId | string): TokenInfoQuery;

  execute(client: Client): Promise<TokenInfo>;
}

class TokenInfo {
  tokenId: TokenId;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: number;
  treasuryAccountId: AccountId;
  adminKey: Key;
  kycKey: Key;
  freezeKey: Key;
  wipeKey: Key;
  supplyKey: Key;
  feeScheduleKey: Key;
  pauseKey: Key;
  defaultFreezeStatus: boolean;
  defaultKycStatus: boolean;
  deleted: boolean;
  autoRenewPeriod: Duration;
}
```

### Mirror Client (HCS Subscriptions)

```typescript
class MirrorClient {
  constructor(network: string | string[]);

  subscribeToTopic(
    topicId: TopicId | string,
    handler: (message: TopicMessage) => void,
    errorHandler: (error: Error) => void,
  ): Subscription;
}

class MirrorConsensusTopicQuery {
  setTopicId(topicId: TopicId | string): MirrorConsensusTopicQuery;
  setStartTime(startTime: Date): MirrorConsensusTopicQuery;
  setEndTime(endTime: Date): MirrorConsensusTopicQuery;
  setLimit(limit: number): MirrorConsensusTopicQuery;

  subscribe(
    mirrorClient: MirrorClient,
    handler: (message: TopicMessage) => void,
    errorHandler: (error: Error) => void,
  ): Subscription;
}

class TopicMessage {
  topicId: TopicId;
  sequenceNumber: number;
  message: Uint8Array;
  consensusTimestamp: Instant;
  runningHash: Uint8Array;
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
  MirrorConsensusTopicQuery,
} from "@hiero-ledger/sdk";

// Create topic
const client = Client.forTestnet();
client.setOperator(operatorId, operatorKey);

const topicTx = await new TopicCreateTransaction().setTopicMemo("My Topic").execute(client);

const topicReceipt = await topicTx.getReceipt(client);
const topicId = topicReceipt.topicId;

// Submit message
const submitTx = await new TopicMessageSubmitTransaction()
  .setTopicId(topicId)
  .setMessage("Hello, Hiero!")
  .execute(client);

// Subscribe
const mirrorClient = new MirrorClient("testnet.mirrornode.hedera.com:443");

new MirrorConsensusTopicQuery().setTopicId(topicId).subscribe(mirrorClient, (message) => {
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
client.setMinBackoff(500); // 500ms
```

### Fee Estimation

```typescript
const query = new AccountBalanceQuery().setAccountId(accountId);

const cost = await query.getCost(client);
console.log("Query cost:", cost.toString());
```

### Mirror Node Queries

For historical data and better performance:

```typescript
// Use Mirror Node REST API instead of SDK queries
const response = await fetch(`https://testnet.mirrornode.hedera.com/api/v1/accounts/${accountId}`);
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
const balance = await new AccountBalanceQuery().setAccountId(accountId).execute(client);

// Recommended alternative
const response = await fetch(`https://testnet.mirrornode.hedera.com/api/v1/accounts/${accountId}`);
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

| Network    | Consensus Node                  | Mirror Node REST                 | Mirror Node GRPC                     |
| ---------- | ------------------------------- | -------------------------------- | ------------------------------------ |
| Mainnet    | mainnet-public.hedera.com:50111 | mainnet.mirrornode.hedera.com    | mainnet.mirrornode.hedera.com:443    |
| Testnet    | testnet.hedera.com:50111        | testnet.mirrornode.hedera.com    | testnet.mirrornode.hedera.com:443    |
| Previewnet | previewnet.hedera.com:50111     | previewnet.mirrornode.hedera.com | previewnet.mirrornode.hedera.com:443 |

### Fee Schedule (Approximate)

| Operation                | Cost (HBAR)     |
| ------------------------ | --------------- |
| Account Creation         | $0.05 - $1.00   |
| Token Creation           | $1.00 - $100.00 |
| Transfer                 | $0.001          |
| Consensus Message Submit | $0.0001         |
| Contract Call            | Variable        |

### Transaction Limits

| Limit                      | Value                                   |
| -------------------------- | --------------------------------------- |
| Max Transaction Fee        | 1,000,000 tinybars (0.001 HBAR) default |
| Max Query Payment          | 1,000,000 tinybars (0.001 HBAR) default |
| Transaction Memo           | 100 bytes                               |
| Transaction Valid Duration | 120 seconds default                     |
| Max Auto Renew Period      | 3 months (7776000 seconds)              |

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
_Last Updated: March 3, 2026_
_Document Version: 1.0_

---

# Hiero SDK Quick Reference Guide

**Last Updated:** March 3, 2026

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

---

# @hieco/sdk — Comprehensive Proposal

> The developer experience layer for Hiero. From first connection to complex
> transaction orchestration — intuitive, powerful, and genuinely enjoyable.

## 1. Problem Statement

Building on the Hiero network today requires developers to write verbose, repetitive
boilerplate for every operation. A simple HBAR transfer looks like this:

```typescript
import { Client, TransferTransaction, Hbar, AccountId, PrivateKey } from "@hiero-ledger/sdk";

const client = Client.forTestnet();
client.setOperator(
  AccountId.fromString(process.env.HIERO_ACCOUNT_ID!),
  PrivateKey.fromStringED25519(process.env.HIERO_PRIVATE_KEY!),
);

const transaction = new TransferTransaction()
  .addHbarTransfer(AccountId.fromString("0.0.1234"), new Hbar(-10))
  .addHbarTransfer(AccountId.fromString("0.0.5678"), new Hbar(10))
  .setTransactionMemo("Payment")
  .setMaxTransactionFee(new Hbar(1));

const frozenTx = await transaction.freezeWith(client);
const signedTx = await frozenTx.sign(PrivateKey.fromStringED25519(process.env.HIERO_PRIVATE_KEY!));
const response = await signedTx.execute(client);
const receipt = await response.getReceipt(client);

console.log(`Status: ${receipt.status}`);
```

**Every. Single. Time.** Create → Configure → Freeze → Sign → Execute → Receipt.

This is not a developer experience. It is a ceremony.

### The Pain is Structural

| Pain Point                                                              | Impact                                     |
| ----------------------------------------------------------------------- | ------------------------------------------ |
| Manual `Client.forTestnet()` + `setOperator()` ceremony                 | Every file, every script, every test       |
| `AccountId.fromString()` / `PrivateKey.fromStringED25519()` wrapping    | Type conversion noise everywhere           |
| Explicit `freezeWith()` → `sign()` → `execute()` → `getReceipt()` chain | 4 lines that never vary                    |
| No automatic retry on `BUSY` / `PLATFORM_TRANSACTION_NOT_CREATED`       | Silent failures in production              |
| No gas estimation for smart contracts                                   | Manual guessing or over-provisioning       |
| Cryptic `Status.INVALID_SIGNATURE` with no context                      | Hours lost debugging key mismatches        |
| Separate clients for consensus node vs Mirror Node                      | Two integration paths, two mental models   |
| `AccountBalanceQuery` planned for deprecation                           | Future migration with no abstraction layer |
| No transaction lifecycle visibility                                     | No hooks, no events, no middleware         |

The Hiero SDK is correct, complete, and well-maintained. But it optimizes for
**protocol fidelity** over **developer productivity**. That gap is where `@hieco/sdk`
lives.

---

## 2. Vision

`@hieco/sdk` exists to make the Hiero network feel **native** to TypeScript developers.
Not "blockchain SDK you learn to tolerate" — genuinely pleasant to use, the way
the best tools disappear into your workflow.

```typescript
import { createHieroClient } from "@hieco/sdk";

const hiero = createHieroClient();

await hiero.transfer({ to: "0.0.5678", amount: 10 });
```

Three lines. Zero ceremony. The client reads credentials from environment variables,
defaults to testnet, handles the entire freeze → sign → execute → receipt lifecycle,
retries on transient errors, and returns a typed result.

### Core Principles

1. **The happy path should be one line.** Every common operation — transfer, create
   token, submit message — has a single-call shorthand. No setup, no boilerplate.

2. **Complexity is opt-in, not mandatory.** Need custom signing? Multi-sig? Manual
   gas limits? The API unfolds gracefully. You never pay for complexity you don't use.

3. **One client, one mental model.** Consensus node transactions, Mirror Node queries,
   and WebSocket subscriptions all flow through `HieroClient`. No juggling clients.

4. **TypeScript is the documentation.** Types are so precise that autocomplete alone
   teaches you the API. Discriminated unions, template literals, conditional types —
   the compiler is your guide.

5. **Errors are conversations, not codes.** Instead of `Status.INVALID_SIGNATURE`,
   you get a structured error explaining which keys were expected, which were provided,
   and what the account's key structure actually requires.

6. **The SDK never lies about what happened.** Every operation returns `ApiResult<T>` —
   a discriminated union of success and failure. No thrown exceptions for expected
   errors. Pattern match, don't try/catch.

---

## 3. Design Philosophy

### 3.1 Inspirations

This SDK draws from the best developer experience patterns in modern tooling:

**From Laravel:** Convention over configuration. Environment variable auto-loading.
Fluent, chainable builders that read like prose. The idea that the framework should
work for you, not the other way around.

**From viem:** Composable client decoration via `.extend()`. Tree-shakable action
functions that take the client as the first argument. Transport abstractions that
hide protocol complexity.

**From wagmi:** Mutation hooks that track lifecycle state (`idle → pending → success`).
Config objects that wire up the entire stack. Provider patterns that make the client
available to the entire component tree.

**From Zod:** Type inference that flows from runtime to compile time. The schema is
the source of truth. You define once, TypeScript infers the rest.

### 3.2 Key Translations

| Pattern                                | @hieco/sdk                                                   |
| -------------------------------------- | ------------------------------------------------------------ |
| `Eloquent::create([...])`              | `hiero.tokens().name("X").symbol("Y").create()`              |
| `DB::table(...)->where(...)->get()`    | `hiero.mirror.accounts().balance.gte(1000).get()`            |
| Service Container                      | `createHieroClient()` resolves consensus + mirror transports |
| Facades                                | `import { transfer } from "@hieco/sdk/facade"`               |
| `.env` auto-loading                    | `HIERO_OPERATOR_ID`, `HIERO_PRIVATE_KEY`, `HIERO_NETWORK`    |
| `createClient().extend(publicActions)` | `createHieroClient().extend(tokenActions)`                   |
| Tree-shakable imports                  | `import { transfer } from "@hieco/sdk/actions"`              |
| `useWriteContract`                     | `useTransfer`, `useCreateToken`, `useSubmitMessage`          |
| Transport abstraction                  | `ConsensusTransport` / `MirrorTransport`                     |
| Middleware pipeline                    | Transaction middleware (retry, logging, gas estimation)      |

---

## 4. Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      @hieco/sdk-react                       │
│  useTransfer · useCreateToken · useSubmitMessage · ...      │
├─────────────────────────────────────────────────────────────┤
│                        @hieco/sdk                           │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                    HieroClient                        │  │
│  │  ┌─────────┐  ┌──────────┐  ┌─────────────────────┐  │  │
│  │  │Consensus│  │  Mirror   │  │     Relay (WS)      │  │  │
│  │  │Transport│  │ Transport │  │     Transport       │  │  │
│  │  └────┬────┘  └─────┬────┘  └──────────┬──────────┘  │  │
│  │       │             │                   │             │  │
│  │  ┌────┴────┐  ┌─────┴──────┐  ┌────────┴───────┐    │  │
│  │  │ Actions │  │  Queries   │  │  Subscriptions │    │  │
│  │  └─────────┘  └────────────┘  └────────────────┘    │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐  │
│  │ Builders │  │  Events  │  │ Errors   │  │ Middleware  │  │
│  └──────────┘  └──────────┘  └──────────┘  └────────────┘  │
│  ┌──────────┐                                               │
│  │ Signers  │  privateKeySigner · fromHieroSigner           │
│  └──────────┘                                               │
├─────────────────────────────────────────────────────────────┤
│              @hiero-ledger/sdk  ·  @hieco/mirror            │
│                     @hieco/utils · @hieco/realtime           │
├─────────────────────────────────────────────────────────────┤
│         @hashgraph/hedera-wallet-connect (optional)         │
│   DAppConnector → DAppSigner → fromHieroSigner() adapter   │
└─────────────────────────────────────────────────────────────┘
```

### Dependency Graph

```
@hieco/sdk
  ├── @hiero-ledger/sdk     (peer: consensus node transactions)
  ├── @hieco/mirror         (Mirror Node REST queries)
  ├── @hieco/realtime       (WebSocket subscriptions)
  └── @hieco/utils          (shared foundation types)

@hieco/sdk-react
  ├── @hieco/sdk            (core SDK)
  ├── @hieco/mirror-react   (existing Mirror hooks, re-exported)
  └── @tanstack/react-query (peer dependency)
```

### Core Modules

| Module              | Responsibility                                                | Entry Point             |
| ------------------- | ------------------------------------------------------------- | ----------------------- |
| `client`            | Client creation, configuration, service resolution            | `@hieco/sdk`            |
| `actions/crypto`    | HBAR transfers, account CRUD                                  | `@hieco/sdk/actions`    |
| `actions/token`     | HTS token lifecycle (create, mint, burn, associate, transfer) | `@hieco/sdk/actions`    |
| `actions/consensus` | HCS topic CRUD, message submission                            | `@hieco/sdk/actions`    |
| `actions/contract`  | Smart contract deploy, execute, call                          | `@hieco/sdk/actions`    |
| `actions/schedule`  | Scheduled transactions                                        | `@hieco/sdk/actions`    |
| `actions/file`      | File service operations                                       | `@hieco/sdk/actions`    |
| `builders`          | Fluent resource builders                                      | `@hieco/sdk/builders`   |
| `mirror`            | Mirror Node query integration                                 | `@hieco/sdk/mirror`     |
| `events`            | Transaction lifecycle events                                  | `@hieco/sdk/events`     |
| `middleware`        | Transaction pipeline middleware                               | `@hieco/sdk/middleware` |
| `errors`            | Enhanced error types and messages                             | `@hieco/sdk/errors`     |
| `facade`            | Singleton static-like access                                  | `@hieco/sdk/facade`     |

---

## 5. The Developer Journey

This is the core of what `@hieco/sdk` optimizes for. Every design decision flows
from making these moments feel right.

### Moment 1: First Connection

The developer has just installed the SDK. They want to talk to the network.

```bash
bun add @hieco/sdk @hiero-ledger/sdk
```

**Node (scripts, backends, CLIs):**

```env
HIERO_OPERATOR_ID=0.0.1234
HIERO_PRIVATE_KEY=302e020100300506032b657004220420...
```

```typescript
import { createHieroClient } from "@hieco/sdk";

const hiero = createHieroClient();
```

Done. No `Client.forTestnet()`. No `AccountId.fromString()`. No `PrivateKey.fromStringED25519()`.
The client reads environment variables, detects the network, initializes the consensus
transport, lazily prepares the Mirror Node client. One line.

**Browser (dApps):**

```typescript
import { createHieroClient, fromHieroSigner } from "@hieco/sdk";
import { DAppConnector } from "@hashgraph/hedera-wallet-connect";

// 1. Connect via WalletConnect (ecosystem standard — works with HashPack, Kabila, Dropp)
const dAppConnector = new DAppConnector(/* metadata, ledgerId, projectId */);
await dAppConnector.init();
const session = await dAppConnector.openModal();
const walletSigner = dAppConnector.getSigner(accountId); // DAppSigner (implements Hiero Signer)

// 2. Wrap in @hieco/sdk's Signer interface
const hiero = createHieroClient({
  network: "mainnet",
  operator: {
    accountId: "0.0.1234",
    signer: fromHieroSigner(walletSigner),
  },
});
```

Browser environments require explicit operator configuration — the SDK refuses to
guess about signing in a context where private keys should never exist in plain text.
Transport auto-detection selects gRPC-web automatically.

### Moment 2: First Transaction

The developer wants to send HBAR. They type `hiero.` and autocomplete shows them
every available action.

```typescript
const result = await hiero.transfer({ to: "0.0.5678", amount: 10 });
```

Behind the scenes: build `TransferTransaction`, set operator as sender, freeze with
client, sign with operator key, execute, wait for receipt, wrap in `ApiResult`,
retry if the node was `BUSY`. The developer sees none of this.

### Moment 3: First Error

The transfer fails. Instead of `Status.INSUFFICIENT_PAYER_BALANCE`:

```typescript
if (!result.success) {
  console.log(result.error.message);
  // "Transaction failed with INSUFFICIENT_PAYER_BALANCE on account 0.0.1234.
  //  The payer account does not have enough HBAR to cover the transaction fee.
  //  Check the account balance with hiero.getBalance({ accountId: '0.0.1234' })."
}
```

The error is a structured object with `_tag` discrimination. The message is
human-readable. The developer knows exactly what happened and what to do.

### Moment 4: Growing Complexity

The developer's needs evolve. They need custom signing, multiple recipients,
specific gas limits. The API does not change shape — it just accepts more parameters:

```typescript
// Simple (day 1)
await hiero.transfer({ to: "0.0.5678", amount: 10 });

// Multi-recipient (day 5)
await hiero.transfer({
  transfers: [
    { to: "0.0.5678", amount: 5 },
    { to: "0.0.9012", amount: 5 },
  ],
  memo: "Split payment",
});

// Custom signing (day 15)
await hiero.transfer({
  to: "0.0.5678",
  amount: 100,
  signers: [additionalKey],
  maxFee: 2,
  nodeAccountIds: ["0.0.3"],
});

// Full control (day 30)
const frozen = await hiero.buildTransaction("transfer", {
  to: "0.0.5678",
  amount: 100,
});
const bytes = frozen.toBytes(); // serialize for external signing
frozen.addSignature(pubKey, sig); // add external signature
const result = await hiero.submitTransaction(frozen);
```

Same API surface. Same mental model. Just more knobs turned.

### Moment 5: Reading the Network

The developer needs account data. The Mirror Node is available through the same client:

```typescript
const account = await hiero.mirror.accounts.get("0.0.1234");

const richAccounts = await hiero.mirror
  .accounts()
  .balance.gte(1000_00000000)
  .order("desc")
  .limit(25)
  .get();

for await (const tx of hiero.mirror.transactions().account("0.0.1234").all()) {
  console.log(tx.transaction_id);
}
```

No separate client. No separate configuration. One object, both writing and reading.

### Moment 6: React Integration

The developer is building a UI. Transaction state management should be trivial:

```tsx
import { useTransfer } from "@hieco/sdk-react";

function SendButton() {
  const { mutate, isPending, isSuccess, error } = useTransfer();

  return (
    <button disabled={isPending} onClick={() => mutate({ to: "0.0.5678", amount: 10 })}>
      {isPending ? "Sending..." : "Send 10 HBAR"}
    </button>
  );
}
```

Lifecycle state is managed. Error state is managed. The hook re-renders the component
at the right times. The developer focuses on UI, not plumbing.

---

## 6. Client System

### 6.1 Client Creation

```typescript
import { createHieroClient } from "@hieco/sdk";

// Node: zero-config — reads HIERO_OPERATOR_ID, HIERO_PRIVATE_KEY, HIERO_NETWORK from env
const hiero = createHieroClient();

// Explicit configuration (Node or browser)
const hiero = createHieroClient({
  network: "testnet",
  operator: {
    accountId: "0.0.1234",
    privateKey: "302e020100300506032b657004220420...",
  },
});

// Browser: explicit operator required (env-var fallback disabled)
import { privateKeySigner } from "@hieco/sdk";

const hiero = createHieroClient({
  network: "testnet",
  operator: {
    accountId: "0.0.1234",
    signer: privateKeySigner("302e020100..."),
  },
});

// Browser with wallet signer (via @hashgraph/hedera-wallet-connect)
import { fromHieroSigner } from "@hieco/sdk";
import { DAppConnector } from "@hashgraph/hedera-wallet-connect";

const dAppConnector = new DAppConnector(/* ... */);
await dAppConnector.init();
const walletSigner = dAppConnector.getSigner(accountId);

const hiero = createHieroClient({
  network: "mainnet",
  operator: {
    accountId: "0.0.1234",
    signer: fromHieroSigner(walletSigner),
  },
});

// Full configuration with all transports
const hiero = createHieroClient({
  network: "mainnet",
  operator: {
    accountId: "0.0.1234",
    privateKey: "302e020100300506032b657004220420...",
  },
  transport: "auto", // "auto" | "grpc" | "grpc-web" (auto-detects environment)
  mirror: {
    url: "https://mainnet.mirrornode.hedera.com",
    rateLimitPerSecond: 50,
  },
  middleware: [loggingMiddleware(), retryMiddleware({ maxRetries: 3 })],
  maxTransactionFee: 5, // HBAR
  defaultTransactionValidDuration: 120, // seconds
});
```

### 6.2 Signer Interface

The SDK defines a minimal `Signer` interface scoped to what the transaction pipeline
actually needs: sign raw bytes and provide a public key. This mirrors viem's
`CustomSource` pattern — the SDK never imports wallet packages, it accepts an
interface.

```typescript
interface Signer {
  sign(bytes: Uint8Array): Promise<Uint8Array>;
  getPublicKey(): Promise<PublicKey>;
}
```

**Built-in signers:**

```typescript
import { privateKeySigner } from "@hieco/sdk";

// Auto-detects key format: ED25519 DER, ECDSA DER, raw hex
const signer = privateKeySigner("302e020100300506032b657004220420...");
```

**Adapter for ecosystem wallets:**

The Hedera ecosystem has standardized on `@hashgraph/hedera-wallet-connect`, which
provides `DAppSigner` — a class implementing the Hiero SDK's full `Signer` interface
(12 methods). HashPack, Kabila, and Dropp all use it. Blade Wallet shut down July
2025 and its SDK is deprecated.

`@hieco/sdk` does NOT build wallet connectors or depend on wallet SDKs. Instead, it
ships a `fromHieroSigner()` adapter that bridges any object implementing the Hiero
SDK's `Signer` interface (including `DAppSigner`) into our minimal interface:

```typescript
import { fromHieroSigner } from "@hieco/sdk";
import { DAppConnector } from "@hashgraph/hedera-wallet-connect";

const dAppConnector = new DAppConnector(metadata, ledgerId, projectId);
await dAppConnector.init();
const session = await dAppConnector.openModal();
const walletSigner = dAppConnector.getSigner(accountId);

const hiero = createHieroClient({
  network: "mainnet",
  operator: {
    accountId: accountId.toString(),
    signer: fromHieroSigner(walletSigner),
  },
});
```

**Custom signer (ad-hoc):**

Developers can implement the `Signer` interface directly for any signing backend
(HSMs, custodial services, multi-party computation):

```typescript
const customSigner: Signer = {
  async sign(bytes) {
    return myHsmService.sign(bytes);
  },
  async getPublicKey() {
    return myHsmService.getPublicKey();
  },
};
```

**Why not use the Hiero SDK's full Signer interface?**

The Hiero SDK's `Signer` is a 12-method fat interface (`getLedgerId`, `getAccountId`,
`getAccountKey`, `getNetwork`, `getMirrorNetwork`, `sign`, `getAccountBalance`,
`getAccountInfo`, `getAccountRecords`, `signTransaction`, `checkTransaction`,
`populateTransaction`, `call`). Most of these are query methods that `@hieco/sdk`
already handles through its own transports. Requiring implementors to provide 12
methods for what is fundamentally a signing operation would kill the DX for custom
integrations. Our 2-method interface is the minimum viable contract; `fromHieroSigner`
bridges the gap for ecosystem signers that already implement the full interface.

### 6.3 Environment-Aware Operator Resolution

In **Node environments**, if `operator` is omitted from config, the SDK reads
`HIERO_OPERATOR_ID` and `HIERO_PRIVATE_KEY` from `process.env` and constructs
a `privateKeySigner` automatically.

In **browser environments**, omitting `operator` throws a `ConfigurationError`:

```
ConfigurationError: Operator configuration is required in browser environments.
Provide { operator: { accountId, signer } } to createHieroClient().
```

This prevents accidental private key exposure in client-side bundles and forces
intentional signer setup — whether a private key for testing (with appropriate
warnings) or a `fromHieroSigner()` adapter wrapping a WalletConnect `DAppSigner`.

### 6.4 HieroClient Interface

```typescript
interface HieroClient {
  readonly network: NetworkType;
  readonly operatorAccountId: EntityId;
  readonly operatorPublicKey: string;

  // Transports (lazy-initialized, auto-detected environment)
  readonly consensus: ConsensusTransport;
  readonly mirror: MirrorQueryClient;

  // Quick actions (convenience methods on the client itself)
  transfer(params: TransferParams): Promise<SdkResult<TransferReceipt>>;
  createAccount(params: CreateAccountParams): Promise<SdkResult<AccountReceipt>>;
  createToken(params: CreateTokenParams): Promise<SdkResult<TokenReceipt>>;
  createTopic(params: CreateTopicParams): Promise<SdkResult<TopicReceipt>>;
  submitMessage(params: SubmitMessageParams): Promise<SdkResult<MessageReceipt>>;
  deployContract(params: DeployContractParams): Promise<SdkResult<ContractReceipt>>;
  executeContract(params: ExecuteContractParams): Promise<SdkResult<ContractExecuteReceipt>>;
  callContract(params: CallContractParams): Promise<SdkResult<ContractCallResult>>;
  getBalance(params: GetBalanceParams): Promise<SdkResult<BalanceResult>>;

  // Fluent builders
  tokens(): TokenBuilder;
  topics(): TopicBuilder;
  accounts(): AccountBuilder;
  contracts(): ContractBuilder;

  // Transaction lifecycle
  buildTransaction<T extends TransactionType>(
    type: T,
    params: TransactionParamsMap[T],
  ): Promise<FrozenTransaction>;
  submitTransaction(frozen: FrozenTransaction): Promise<SdkResult<TransactionReceipt>>;

  // Composable extension (viem pattern)
  extend<TActions extends Record<string, unknown>>(
    decorator: (client: HieroClient) => TActions,
  ): HieroClient & TActions;

  // Event system
  on<TEvent extends TransactionEvent>(
    event: TEvent,
    handler: TransactionEventHandler<TEvent>,
  ): Unsubscribe;

  // Real-time subscriptions (different transports per type)
  watchTopicMessages(params: WatchTopicMessagesParams): Unsubscribe; // gRPC via @hiero-ledger/sdk
  watchContractLogs(params: WatchContractLogsParams): Unsubscribe; // WebSocket via @hieco/realtime

  // Raw access (escape hatch to underlying libraries)
  readonly raw: {
    readonly client: import("@hiero-ledger/sdk").Client;
    readonly mirrorClient: import("@hieco/mirror").MirrorNodeClient;
  };

  close(): Promise<void>;
}

interface GetBalanceParams {
  readonly accountId: EntityId;
  readonly source?: "mirror" | "consensus"; // default: "mirror"
}
```

### 6.5 Composable Extension (viem Pattern)

```typescript
import { createHieroClient } from "@hieco/sdk";
import { hcsActions, tokenActions, contractActions } from "@hieco/sdk/actions";

const hiero = createHieroClient().extend(hcsActions).extend(tokenActions).extend(contractActions);

// hiero now has all HCS + Token + Contract methods
await hiero.createTopic({ memo: "My topic", submitKey: true });
await hiero.createToken({ name: "Gold", symbol: "GLD", decimals: 8 });
await hiero.deployContract({ bytecode: "0x...", gas: 100_000 });
```

The base client ships with convenience actions for the most common operations.
The `.extend()` pattern lets you add domain-specific action sets without bloating
the default bundle.

### 6.6 Tree-Shakable Standalone Actions

```typescript
import { createHieroClient } from "@hieco/sdk";
import { transfer, createToken } from "@hieco/sdk/actions";

const hiero = createHieroClient();

// Actions accept the client as the first argument (like viem)
await transfer(hiero, { to: "0.0.5678", amount: 10 });
await createToken(hiero, { name: "Gold", symbol: "GLD", decimals: 8 });
```

Both patterns — `hiero.transfer(...)` and `transfer(hiero, ...)` — call the same
underlying implementation. Choose based on preference and bundle requirements.

### 6.7 Environment Variable Convention (Node Only)

| Variable                    | Default         | Description                                                  |
| --------------------------- | --------------- | ------------------------------------------------------------ |
| `HIERO_OPERATOR_ID`         | —               | Operator account ID (`0.0.XXXX`)                             |
| `HIERO_PRIVATE_KEY`         | —               | Operator private key (DER-encoded or raw hex)                |
| `HIERO_NETWORK`             | `"testnet"`     | Network name (`mainnet`, `testnet`, `previewnet`)            |
| `HIERO_MIRROR_URL`          | Network default | Custom Mirror Node URL                                       |
| `HIERO_RELAY_URL`           | Network default | Custom JSON-RPC Relay URL                                    |
| `HIERO_MAX_TRANSACTION_FEE` | `"2"`           | Default max fee in HBAR                                      |
| `HIERO_LOG_LEVEL`           | `"none"`        | Logging verbosity (`none`, `error`, `warn`, `info`, `debug`) |

Environment variable resolution is **disabled in browser environments**. The SDK
detects the runtime and only reads `process.env` in Node. Browser clients must
provide explicit configuration via `createHieroClient({ operator: ... })`.

The SDK detects private key format automatically — ED25519 DER, ECDSA DER, or raw
hex. No `fromStringED25519` vs `fromStringECDSA` decision for the developer.
Mnemonic phrases are not auto-detected and should use the `Mnemonic` class from
`@hiero-ledger/sdk` directly.

> **Note:** `HIERO_ACCOUNT_ID` is also accepted as an alias for `HIERO_OPERATOR_ID`
> for backward compatibility.

---

## 7. Transaction Pipeline

This is the heart of the SDK. Every transaction — whether triggered by
`hiero.transfer()`, a fluent builder's `.create()`, or a standalone action function —
flows through the same pipeline:

```
┌──────────┐    ┌────────────┐    ┌──────────────┐    ┌────────┐
│  Params  │───▶│   Build    │───▶│  Middleware   │───▶│ Freeze │
│  (user)  │    │ Transaction│    │  (pre-exec)  │    │        │
└──────────┘    └────────────┘    └──────────────┘    └───┬────┘
                                                         │
┌──────────┐    ┌────────────┐    ┌──────────────┐    ┌──┴─────┐
│  Result  │◀───│  Receipt   │◀───│   Execute    │◀───│  Sign  │
│ (caller) │    │  (wait)    │    │  (submit)    │    │        │
└──────────┘    └────────────┘    └──────────────┘    └────────┘
```

### 7.1 Pipeline Stages

**1. Params → Build:** The user's params object is validated and transformed into
a native `@hiero-ledger/sdk` transaction. String entity IDs are parsed into
`AccountId` / `TokenId` / `TopicId`. Numbers are wrapped in `Hbar`. Booleans like
`adminKey: true` are resolved to the operator's public key.

**2. Build → Middleware (pre-exec):** The constructed transaction passes through
the middleware chain. Middleware can inspect, modify, log, or reject the transaction
before execution. The retry middleware wraps the remaining pipeline in retry logic.

**3. Middleware → Freeze:** The transaction is frozen with the client, locking in
the transaction ID, node account IDs, and valid duration.

**4. Freeze → Sign:** The operator's private key signs the frozen transaction.
Additional signers (if provided via params) are applied in order.

**5. Sign → Execute:** The signed transaction is submitted to a consensus node.

**6. Execute → Receipt:** The SDK waits for the transaction receipt, confirming
the transaction reached consensus.

**7. Receipt → Result:** The receipt is mapped to a typed result object and wrapped
in `ApiResult<T, SdkError>`. Success data includes the transaction ID, status,
and any created entity IDs (account, token, topic, contract, file, schedule).

### 7.2 Middleware Interface

```typescript
type TransactionMiddleware = (
  context: TransactionContext,
  next: () => Promise<SdkResult<TransactionReceipt>>,
) => Promise<SdkResult<TransactionReceipt>>;

interface TransactionContext {
  readonly type: TransactionType;
  readonly params: Record<string, unknown>;
  readonly client: HieroClient;
  readonly attempt: number;
  readonly transactionId: string | undefined;
  readonly startedAt: number;
}
```

### 7.3 Built-in Middleware

```typescript
import { retryMiddleware, loggingMiddleware, gasEstimationMiddleware } from "@hieco/sdk/middleware";

const hiero = createHieroClient({
  middleware: [
    loggingMiddleware({ level: "info" }),
    retryMiddleware({ maxRetries: 3 }),
    gasEstimationMiddleware({ bufferPercent: 20 }),
  ],
});
```

**Retry middleware** is enabled by default (3 retries, exponential backoff, retries
on `BUSY` / `PLATFORM_TRANSACTION_NOT_CREATED` / `PLATFORM_NOT_ACTIVE`). It can be
configured at the client level or overridden per-transaction.

**Logging middleware** emits structured log events at each pipeline stage:
`transaction:building`, `transaction:frozen`, `transaction:signed`,
`transaction:submitted`, `transaction:confirmed`, `transaction:error`.

**Gas estimation middleware** is opt-in for contract operations. It uses the Mirror
Node REST API (`POST /api/v1/contracts/call` with `{ "estimate": true }`) to
estimate gas. For complex state-dependent contracts where the Mirror Node estimate
is insufficient, developers can switch to dry-run execution via the Hiero SDK.
A configurable buffer percentage is added to the estimate.

```typescript
gasEstimationMiddleware({
  strategy: "mirror", // "mirror" (default) | "dry-run"
  bufferPercent: 20,
});
```

### 7.4 Custom Middleware

```typescript
const auditMiddleware: TransactionMiddleware = async (context, next) => {
  console.log(`[${context.type}] Starting attempt ${context.attempt}`);
  const start = performance.now();
  const result = await next();
  const duration = performance.now() - start;

  if (result.success) {
    console.log(`[${context.type}] Confirmed in ${duration.toFixed(0)}ms`);
  } else {
    console.error(`[${context.type}] Failed: ${result.error._tag}`);
  }

  return result;
};

const hiero = createHieroClient({
  middleware: [auditMiddleware],
});
```

---

## 8. Progressive Disclosure

The API is designed so that complexity unfolds gradually. A developer should never
need to learn more than what their current task demands.

### 8.1 Level 0: One-Liner

The simplest possible invocation. Sensible defaults everywhere.

```typescript
await hiero.transfer({ to: "0.0.5678", amount: 10 });
await hiero.createToken({ name: "Gold", symbol: "GLD", decimals: 8 });
await hiero.createTopic({ memo: "Audit log" });
await hiero.submitMessage({ topicId: "0.0.TOPIC", message: "Hello" });
```

### 8.2 Level 1: Configuration

Optional fields that control behavior without changing the API shape.

```typescript
await hiero.transfer({
  to: "0.0.5678",
  amount: 10,
  memo: "Invoice #1234",
  maxFee: 1,
});

await hiero.createToken({
  name: "Gold",
  symbol: "GLD",
  decimals: 8,
  initialSupply: 1_000_000,
  treasury: "0.0.1234",
  adminKey: true,
  supplyKey: true,
  freezeDefault: false,
});
```

### 8.3 Level 2: Multi-Party

Transactions involving multiple accounts or requiring additional signatures.

```typescript
// Multiple recipients
await hiero.transfer({
  transfers: [
    { to: "0.0.5678", amount: 5 },
    { to: "0.0.9012", amount: 5 },
  ],
});

// Additional signers
await hiero.transfer({
  to: "0.0.5678",
  amount: 100,
  signers: [secondaryKey],
});

// Token with multiple key holders
await hiero.createToken({
  name: "Governed Token",
  symbol: "GOV",
  decimals: 8,
  adminKey: adminPublicKey,
  supplyKey: minterPublicKey,
  freezeKey: compliancePublicKey,
  wipeKey: compliancePublicKey,
  signers: [adminKey, minterKey, complianceKey],
});
```

### 8.4 Level 3: Pipeline Control

For advanced use cases — manual freezing, external signing, custom node selection.

```typescript
// Build without executing (for external signing flows)
const frozen = await hiero.buildTransaction("transfer", {
  to: "0.0.5678",
  amount: 100,
});

// Serialize for transport
const bytes = frozen.toBytes();

// Add externally-obtained signature
frozen.addSignature(externalPublicKey, externalSignature);

// Submit manually
const result = await hiero.submitTransaction(frozen);

// Or: complete low-level control via escape hatch
const rawClient = hiero.raw.client;
const rawTx = new TransferTransaction()
  .addHbarTransfer(AccountId.fromString("0.0.1234"), new Hbar(-10))
  .addHbarTransfer(AccountId.fromString("0.0.5678"), new Hbar(10));
const response = await rawTx.execute(rawClient);
```

### 8.5 Level 4: Fluent Builders

For developers who prefer expressive, chainable construction over parameter objects.

```typescript
const token = await hiero
  .tokens()
  .name("Loyalty Points")
  .symbol("LOYAL")
  .decimals(2)
  .initialSupply(1_000_000)
  .treasuryAccount("0.0.1234")
  .adminKey(hiero.operatorPublicKey)
  .supplyKey(hiero.operatorPublicKey)
  .memo("Loyalty program token")
  .create();
```

Both `hiero.createToken({...})` and `hiero.tokens()...create()` produce identical
transactions through the same pipeline. Two syntaxes, one behavior.

---

## 9. Transaction Actions

### 9.1 Action Signature

Every action follows the same contract:

```typescript
type Action<TParams, TResult> = (
  client: HieroClient,
  params: TParams,
) => Promise<SdkResult<TResult>>;
```

When called as a method on the client (`hiero.transfer(...)`), the client parameter
is bound automatically.

### 9.2 Crypto Actions

```typescript
// Transfer HBAR
await hiero.transfer({
  to: "0.0.5678",
  amount: 10, // number = HBAR, Hbar instance also accepted
  memo: "Payment for services",
});

// Transfer HBAR to multiple recipients
await hiero.transfer({
  transfers: [
    { to: "0.0.5678", amount: 5 },
    { to: "0.0.9012", amount: 5 },
  ],
  memo: "Split payment",
});

// Create account
const result = await hiero.createAccount({
  initialBalance: 10,
  memo: "Service account",
  maxAutoTokenAssociations: 10,
});
if (result.success) {
  console.log(result.data.accountId); // EntityId
}

// Update account
await hiero.updateAccount({
  accountId: "0.0.1234",
  memo: "Updated memo",
  maxAutoTokenAssociations: 50,
});

// Delete account (transfer remaining balance)
await hiero.deleteAccount({
  accountId: "0.0.1234",
  transferTo: "0.0.5678",
});

// Approve HBAR/token allowance
await hiero.approveAllowance({
  ownerAccountId: "0.0.1234",
  spenderAccountId: "0.0.5678",
  amount: 50, // HBAR
});
```

### 9.3 Token Actions (HTS)

```typescript
// Create fungible token
const token = await hiero.createToken({
  name: "Loyalty Points",
  symbol: "LOYAL",
  decimals: 2,
  initialSupply: 1_000_000,
  treasury: "0.0.1234", // defaults to operator if omitted
  adminKey: true, // true = use operator key
  supplyKey: true,
  freezeDefault: false,
});

// Create NFT collection
const nft = await hiero.createToken({
  name: "Art Collection",
  symbol: "ART",
  type: "NON_FUNGIBLE_UNIQUE",
  maxSupply: 10_000,
  supplyKey: true,
  treasury: "0.0.1234",
});

// Mint tokens
await hiero.mintToken({
  tokenId: "0.0.TOKEN",
  amount: 500,
});

// Mint NFTs (with metadata)
await hiero.mintToken({
  tokenId: "0.0.NFT",
  metadata: [Buffer.from("ipfs://QmXxx..."), Buffer.from("ipfs://QmYyy...")],
});

// Transfer tokens
await hiero.transferToken({
  tokenId: "0.0.TOKEN",
  to: "0.0.5678",
  amount: 100,
});

// Transfer NFT
await hiero.transferNft({
  tokenId: "0.0.NFT",
  serialNumber: 1,
  to: "0.0.5678",
});

// Associate token with account
await hiero.associateToken({
  accountId: "0.0.5678",
  tokenIds: ["0.0.TOKEN1", "0.0.TOKEN2"],
});

// Full token lifecycle
await hiero.burnToken({ tokenId: "0.0.TOKEN", amount: 50 });
await hiero.wipeToken({ tokenId: "0.0.TOKEN", accountId: "0.0.5678", amount: 10 });
await hiero.freezeToken({ tokenId: "0.0.TOKEN", accountId: "0.0.5678" });
await hiero.unfreezeToken({ tokenId: "0.0.TOKEN", accountId: "0.0.5678" });
await hiero.pauseToken({ tokenId: "0.0.TOKEN" });
await hiero.unpauseToken({ tokenId: "0.0.TOKEN" });
await hiero.grantKyc({ tokenId: "0.0.TOKEN", accountId: "0.0.5678" });
await hiero.revokeKyc({ tokenId: "0.0.TOKEN", accountId: "0.0.5678" });
await hiero.deleteToken({ tokenId: "0.0.TOKEN" });
```

### 9.4 Consensus Actions (HCS)

```typescript
// Create topic
const topic = await hiero.createTopic({
  memo: "Audit log",
  submitKey: true, // true = operator key
  adminKey: true,
});

// Submit message (string)
await hiero.submitMessage({
  topicId: "0.0.TOPIC",
  message: "Hello, consensus!",
});

// Submit structured message (auto-serialized to JSON)
await hiero.submitMessage({
  topicId: "0.0.TOPIC",
  message: { event: "user.signup", userId: "abc123", timestamp: Date.now() },
});

// Submit large message (auto-chunked for messages > 1024 bytes)
await hiero.submitMessage({
  topicId: "0.0.TOPIC",
  message: largePayload,
});

// Update topic
await hiero.updateTopic({
  topicId: "0.0.TOPIC",
  memo: "Audit log v2",
});

// Delete topic
await hiero.deleteTopic({ topicId: "0.0.TOPIC" });
```

### 9.5 Smart Contract Actions

```typescript
// Deploy contract
const contract = await hiero.deployContract({
  bytecode: "0x608060...",
  gas: 100_000, // or omit for auto-estimation
  constructorParams: {
    types: ["string", "uint256"],
    values: ["Hello", 42],
  },
  adminKey: true,
  memo: "MyContract v1",
});

// Execute contract function (state-changing, costs gas)
await hiero.executeContract({
  contractId: "0.0.CONTRACT",
  functionName: "transfer",
  functionParams: {
    types: ["address", "uint256"],
    values: ["0.0.5678", 100],
  },
  gas: 50_000,
});

// Call contract (read-only, free, via Mirror Node)
const result = await hiero.callContract({
  contractId: "0.0.CONTRACT",
  functionName: "balanceOf",
  functionParams: {
    types: ["address"],
    values: ["0.0.1234"],
  },
});

// Deploy with gas estimation (Mirror Node POST /api/v1/contracts/call with estimate: true)
const contract = await hiero.deployContract({
  bytecode: "0x608060...",
  gasEstimate: true, // runs Mirror Node gas estimation
  constructorParams: { types: ["string"], values: ["Hello"] },
});
```

### 9.6 Schedule Actions

```typescript
// Schedule a transaction for later execution
const scheduled = await hiero.scheduleTransaction({
  transaction: {
    type: "transfer",
    params: { to: "0.0.5678", amount: 100 },
  },
  expirationTime: new Date("2026-04-01"),
  memo: "Scheduled payment",
  waitForExpiry: false,
});

// Add signature to scheduled transaction (multi-sig flow)
await hiero.signSchedule({
  scheduleId: "0.0.SCHEDULE",
});

// Delete scheduled transaction
await hiero.deleteSchedule({
  scheduleId: "0.0.SCHEDULE",
});
```

### 9.7 File Actions

```typescript
await hiero.createFile({
  contents: Buffer.from("Hello, Hiero!"),
  memo: "My file",
});

await hiero.appendFile({
  fileId: "0.0.FILE",
  contents: Buffer.from(" More content."),
});

await hiero.deleteFile({ fileId: "0.0.FILE" });
```

### 9.8 Multi-Signature Support

```typescript
// Transaction requiring multiple signatures
const result = await hiero.transfer({
  to: "0.0.5678",
  amount: 100,
  signers: [secondaryKey, tertiaryKey],
});

// Or: freeze for external signing
const frozen = await hiero.buildTransaction("transfer", {
  to: "0.0.5678",
  amount: 100,
});

// Serialize → send to another party → receive signature back
const bytes = frozen.toBytes();
frozen.addSignature(otherPublicKey, otherSignature);

const result = await hiero.submitTransaction(frozen);
```

---

## 10. Resource Builders (Fluent API)

For developers who prefer chainable, prose-like construction:

### 10.1 Token Builder

```typescript
const token = await hiero
  .tokens()
  .name("Loyalty Points")
  .symbol("LOYAL")
  .decimals(2)
  .initialSupply(1_000_000)
  .treasuryAccount("0.0.1234")
  .adminKey(hiero.operatorPublicKey)
  .supplyKey(hiero.operatorPublicKey)
  .freezeDefault(false)
  .memo("Loyalty program token")
  .create();
```

### 10.2 Topic Builder

```typescript
const topic = await hiero
  .topics()
  .memo("Audit events")
  .submitKey(hiero.operatorPublicKey)
  .adminKey(hiero.operatorPublicKey)
  .autoRenewAccount("0.0.1234")
  .autoRenewPeriod(7776000)
  .create();
```

### 10.3 Account Builder

```typescript
const account = await hiero
  .accounts()
  .initialBalance(50)
  .memo("Service account")
  .maxAutoTokenAssociations(100)
  .receiverSignatureRequired(false)
  .create();
```

### 10.4 Contract Builder

```typescript
const contract = await hiero
  .contracts()
  .bytecode(compiledBytecode)
  .gas(200_000)
  .constructorParams(["Hello", 42])
  .adminKey(hiero.operatorPublicKey)
  .memo("MyContract v1.0")
  .autoRenewPeriod(7776000)
  .deploy();
```

Every builder's terminal method (`.create()`, `.deploy()`) flows through the same
transaction pipeline as direct action calls. Builders are syntax sugar, not a
separate code path.

---

## 11. Mirror Node Integration

### 11.1 Balance Queries with Source Selection

The `AccountBalanceQuery` is planned for deprecation in the Hiero SDK. The SDK
defaults to Mirror Node for balance queries — free and fast — but provides an
explicit `source` option for developers who need real-time consensus data.

```typescript
// Default: Mirror Node (free, fast, sufficient for most applications)
const balance = await hiero.getBalance({ accountId: "0.0.1234" });

// Explicit: consensus node (real-time, costs HBAR)
const balance = await hiero.getBalance({
  accountId: "0.0.1234",
  source: "consensus",
});
```

Most applications never need consensus-sourced balances. The Mirror Node default
respects developer resources while the option preserves access for arbitrage,
high-frequency trading, or other latency-sensitive use cases.

### 11.2 Unified Query Client

The `hiero.mirror` property exposes a fluent query interface built on top of
`@hieco/mirror`'s `MirrorNodeClient`. The SDK uses **plural** naming
(`hiero.mirror.accounts`, `hiero.mirror.tokens`) to distinguish the fluent query
API from `@hieco/mirror`'s singular domain APIs (`client.account`, `client.token`).
Both are accessible — the fluent API is sugar, the raw client is the escape hatch.

```typescript
// Direct access
const account = await hiero.mirror.accounts.get("0.0.1234");
const tokens = await hiero.mirror.tokens.list({ limit: 10 });

// Fluent query builder
const richAccounts = await hiero.mirror
  .accounts()
  .balance.gte(1000_00000000)
  .order("desc")
  .limit(25)
  .get();

// Pagination with AsyncIterable
for await (const tx of hiero.mirror.transactions().account("0.0.1234").all()) {
  console.log(tx.transaction_id);
}

// Topic messages with filtering
const messages = await hiero.mirror
  .topics("0.0.TOPIC")
  .messages()
  .sequenceNumber.gte(100)
  .limit(50)
  .get();
```

### 11.3 Relationship Loading (Planned — v0.2)

> **Postponed:** Relationship loading requires parallel Mirror Node requests and
> response stitching. While feasible, it adds implementation complexity without
> solving an urgent pain point — developers can make two calls today. This will be
> added in v0.2 after the core SDK stabilizes.

Inspired by Eloquent's eager loading, the planned API:

```typescript
// Load account with related data in parallel
const account = await hiero.mirror.accounts.get("0.0.1234", {
  with: ["tokens", "nfts"],
});
// account.tokens → Token[]
// account.nfts → Nft[]
```

### 11.4 Query Builder Interface

The fluent query builder is a thin facade over `@hieco/mirror`'s existing domain
APIs (`AccountApi`, `TokenApi`, etc.) and their internal `QueryBuilder`. It
translates chainable method calls into query parameters that are passed to the
underlying API methods.

```typescript
interface MirrorQueryBuilder<T> {
  // Filtering
  eq(value: T): this;
  ne(value: T): this;
  gt(value: T): this;
  gte(value: T): this;
  lt(value: T): this;
  lte(value: T): this;

  // Sorting & pagination
  order(direction: "asc" | "desc"): this;
  limit(count: number): this;
  after(cursor: string): this;

  // Timestamp filtering
  timestamp: {
    gt(ts: string | Date | number): MirrorQueryBuilder<T>;
    gte(ts: string | Date | number): MirrorQueryBuilder<T>;
    lt(ts: string | Date | number): MirrorQueryBuilder<T>;
    lte(ts: string | Date | number): MirrorQueryBuilder<T>;
  };

  // Terminal methods
  get(): Promise<ApiResult<readonly T[]>>;
  first(): Promise<ApiResult<T>>;
  all(): AsyncIterable<T>; // delegates to @hieco/mirror CursorPaginator
}
```

---

## 12. Type System & Inference

TypeScript is not just supported — it is the primary interface. The type system
teaches developers the API through autocomplete and compile-time feedback.

### 12.1 Entity ID as Template Literal

```typescript
// From @hieco/utils — enforced at the type level
type EntityId = `${number}.${number}.${number}`;

// These compile
const a: EntityId = "0.0.1234";
const b: EntityId = "0.0.5678";

// These do not compile
const c: EntityId = "0.0"; // Error: not enough segments
const d: EntityId = "abc.0.1234"; // Error: not a number
```

### 12.2 Params Types — Self-Documenting

```typescript
interface TransferParams {
  readonly to?: EntityId;
  readonly amount?: number | Hbar;
  readonly transfers?: readonly TransferEntry[];
  readonly memo?: string;
  readonly maxFee?: number;
  readonly signers?: readonly PrivateKey[];
  readonly retry?: RetryConfig | false;
  readonly nodeAccountIds?: readonly EntityId[];
}

interface TransferEntry {
  readonly to: EntityId;
  readonly amount: number | Hbar;
}
```

The type system enforces that you provide either `to` + `amount` or `transfers`,
but not both. TypeScript autocomplete shows every available field with its type.

### 12.3 Discriminated Result Types

```typescript
type SdkResult<T> = ApiResult<T, SdkError>;

// ApiResult from @hieco/utils:
type ApiResult<T, E = ApiError> =
  | { readonly success: true; readonly data: T }
  | { readonly success: false; readonly error: E };
```

After checking `result.success`, TypeScript narrows the type automatically:

```typescript
const result = await hiero.createToken({...})

if (result.success) {
  result.data.tokenId   // EntityId ✓ (narrowed to success branch)
  result.data.status     // string ✓
  result.error           // Error: property 'error' does not exist ✓
} else {
  result.error._tag      // SdkError["_tag"] ✓ (narrowed to error branch)
  result.data            // Error: property 'data' does not exist ✓
}
```

### 12.4 Transaction Type Map (Conditional Types)

```typescript
type TransactionType =
  | "transfer"
  | "createAccount"
  | "createToken"
  | "mintToken"
  | "createTopic"
  | "submitMessage"
  | "deployContract"
  | "executeContract"
  | "scheduleTransaction";
// ... all transaction types

// Maps transaction type → params type
interface TransactionParamsMap {
  transfer: TransferParams;
  createAccount: CreateAccountParams;
  createToken: CreateTokenParams;
  mintToken: MintTokenParams;
  createTopic: CreateTopicParams;
  submitMessage: SubmitMessageParams;
  deployContract: DeployContractParams;
  executeContract: ExecuteContractParams;
  scheduleTransaction: ScheduleTransactionParams;
  // ...
}

// Maps transaction type → result type
interface TransactionResultMap {
  transfer: TransferReceipt;
  createAccount: AccountReceipt;
  createToken: TokenReceipt;
  mintToken: MintReceipt;
  createTopic: TopicReceipt;
  submitMessage: MessageReceipt;
  deployContract: ContractReceipt;
  executeContract: ContractExecuteReceipt;
  scheduleTransaction: ScheduleReceipt;
  // ...
}
```

This enables fully typed generic methods:

```typescript
// buildTransaction infers both params and result from the type string
const frozen = await hiero.buildTransaction("transfer", {
  to: "0.0.5678", // TypeScript knows this must be TransferParams
  amount: 10,
});

// The event system uses the same map for typed payloads
hiero.on("transaction:transfer:confirmed", (event) => {
  event.receipt.status; // TypeScript knows this is TransferReceipt
});
```

### 12.5 Builder Return Type Inference

Fluent builders use `this` return types for chaining, and the terminal method
returns the correct `SdkResult`:

```typescript
class TokenBuilder {
  name(value: string): this {
    /* ... */
  }
  symbol(value: string): this {
    /* ... */
  }
  decimals(value: number): this {
    /* ... */
  }
  // ...
  create(): Promise<SdkResult<TokenReceipt>> {
    /* ... */
  }
}
```

Autocomplete at every step shows only the methods available on `TokenBuilder`.
The terminal `.create()` returns the specific receipt type.

---

## 13. Error Handling

### 13.1 Enhanced Error Types

Building on `@hieco/utils`' `ApiError` pattern with `_tag` discrimination:

```typescript
type SdkError =
  | {
      readonly _tag: "TransactionError";
      readonly status: string;
      readonly transactionId: string;
      readonly message: string;
    }
  | {
      readonly _tag: "InsufficientBalanceError";
      readonly accountId: EntityId;
      readonly message: string;
    }
  | {
      readonly _tag: "InvalidSignatureError";
      readonly transactionId: string;
      readonly message: string;
    }
  | { readonly _tag: "GasEstimationError"; readonly contractId: EntityId; readonly message: string }
  | {
      readonly _tag: "NetworkError";
      readonly url: string;
      readonly statusCode: number;
      readonly message: string;
    }
  | {
      readonly _tag: "TimeoutError";
      readonly operation: string;
      readonly timeoutMs: number;
      readonly message: string;
    }
  | { readonly _tag: "RateLimitError"; readonly retryAfterMs: number; readonly message: string }
  | { readonly _tag: "ConfigurationError"; readonly field: string; readonly message: string }
  | { readonly _tag: "InvalidEntityIdError"; readonly value: string; readonly message: string };
```

### 13.2 Human-Readable Error Messages

The SDK translates Hiero status codes into developer-friendly messages that explain
what happened and what to do. Error messages are generated from locally available
context only — the SDK never makes additional network requests during error handling.

```typescript
// Instead of: "Status: INVALID_SIGNATURE"
{
  _tag: "InvalidSignatureError",
  message: "Transaction 0.0.1234@1234567890.000000000 failed with INVALID_SIGNATURE. "
    + "The signatures provided did not satisfy the key requirements for this transaction. "
    + "Use hiero.mirror.accounts.get('0.0.1234') to inspect the account's key structure.",
  transactionId: "0.0.1234@1234567890.000000000",
}

// Instead of: "Status: INSUFFICIENT_PAYER_BALANCE"
{
  _tag: "InsufficientBalanceError",
  message: "Transaction failed with INSUFFICIENT_PAYER_BALANCE on account 0.0.1234. "
    + "The payer account does not have enough HBAR to cover the transaction fee. "
    + "Check the account balance with hiero.getBalance({ accountId: '0.0.1234' }).",
  accountId: "0.0.1234",
}

// Instead of: "Status: TOKEN_NOT_ASSOCIATED_TO_ACCOUNT"
{
  _tag: "TransactionError",
  status: "TOKEN_NOT_ASSOCIATED_TO_ACCOUNT",
  message: "Token 0.0.TOKEN is not associated with account 0.0.5678. "
    + "Call hiero.associateToken({ accountId: '0.0.5678', tokenIds: ['0.0.TOKEN'] }) first.",
  transactionId: "0.0.1234@1234567890.000000000",
}
```

The error messages reference SDK methods by name, so the developer can copy-paste
the suggested fix directly.

### 13.3 Type-Safe Error Narrowing

```typescript
const result = await hiero.transfer({ to: "0.0.5678", amount: 10 });

if (!result.success) {
  switch (result.error._tag) {
    case "InsufficientBalanceError":
      console.log(`Insufficient balance on ${result.error.accountId}`);
      break;
    case "InvalidSignatureError":
      console.log(`Signature mismatch: ${result.error.message}`);
      break;
    case "NetworkError":
      console.log(`Network issue: ${result.error.statusCode}`);
      break;
    case "TimeoutError":
      console.log(`Timed out after ${result.error.timeoutMs}ms`);
      break;
    default: {
      const _exhaustive: never = result.error;
      // TypeScript ensures all cases are handled ^
    }
  }
}
```

### 13.4 Error Type Guards

SDK-specific type guards, consistent with `@hieco/utils`'s pattern but
operating on `SdkError` (not `ApiError`). These are separate from the `ApiError`
type guards in `@hieco/utils` because `SdkError` has different `_tag`
variants — they are not interchangeable.

```typescript
import {
  isInsufficientBalanceError,
  isInvalidSignatureError,
  isNetworkError,
  isRateLimitError,
} from "@hieco/sdk/errors";

const result = await hiero.transfer({ to: "0.0.5678", amount: 10 });

if (!result.success && isRateLimitError(result.error)) {
  await sleep(result.error.retryAfterMs);
  // retry...
}
```

---

## 14. Retry & Resilience

### 14.1 Built-in Retry with Exponential Backoff

Retry is enabled by default. Every transaction is automatically retried on known
transient errors.

```typescript
// Default retry configuration (applied automatically)
const hiero = createHieroClient();
// Equivalent to:
const hiero = createHieroClient({
  retry: {
    maxRetries: 3,
    initialDelayMs: 500,
    maxDelayMs: 10_000,
    backoffMultiplier: 2,
    jitter: true,
    retryableStatuses: ["BUSY", "PLATFORM_TRANSACTION_NOT_CREATED", "PLATFORM_NOT_ACTIVE"],
  },
});
```

### 14.2 Per-Transaction Override

```typescript
// More retries for critical transactions
await hiero.transfer({
  to: "0.0.5678",
  amount: 10,
  retry: { maxRetries: 5, maxDelayMs: 30_000 },
});

// No retry for idempotency-sensitive operations
await hiero.transfer({
  to: "0.0.5678",
  amount: 10,
  retry: false,
});
```

### 14.3 Retry Observability

The event system emits retry events so you can monitor retry behavior:

```typescript
hiero.on("transaction:retry", (event) => {
  console.warn(
    `Retrying ${event.type} (attempt ${event.attempt}/${event.maxRetries}): ${event.reason}`,
  );
});
```

---

## 15. Event System

### 15.1 Transaction Lifecycle Events

```typescript
const unsubscribe = hiero.on("transaction:confirmed", (event) => {
  console.log(`${event.transactionId} confirmed: ${event.status}`);
});

hiero.on("transaction:transfer:confirmed", (event) => {
  console.log(`Transfer confirmed`);
});

hiero.on("transaction:error", (event) => {
  console.error(`${event.transactionId} failed: ${event.error._tag}`);
});

hiero.on("transaction:before", (event) => {
  console.log(`Executing ${event.type}...`);
});

hiero.on("transaction:retry", (event) => {
  console.warn(`Retry attempt ${event.attempt} for ${event.type}`);
});

unsubscribe();
```

### 15.2 Event Types

```typescript
type TransactionEvent =
  | "transaction:before"
  | "transaction:signed"
  | "transaction:submitted"
  | "transaction:confirmed"
  | "transaction:error"
  | "transaction:retry"
  | `transaction:${TransactionType}:before`
  | `transaction:${TransactionType}:confirmed`
  | `transaction:${TransactionType}:error`;
```

### 15.3 Real-Time Subscriptions

The client provides two subscription mechanisms with honest transport boundaries:

**Topic Messages** — uses `TopicMessageQuery` from `@hiero-ledger/sdk` (gRPC
server-streaming to the mirror node). This is NOT a WebSocket subscription.

```typescript
// Topic message stream (via @hiero-ledger/sdk TopicMessageQuery, gRPC)
const unsubscribe = hiero.watchTopicMessages({
  topicId: "0.0.TOPIC",
  startTime: new Date("2026-01-01"), // optional
  handler: (message) => {
    console.log(`Sequence ${message.sequenceNumber}: ${message.contents}`);
  },
  onError: (error) => {
    console.error("Subscription error:", error);
  },
});

// Stop listening
unsubscribe();
```

**Contract Logs** — uses `@hieco/realtime`'s `RelayWebSocketClient` with
`eth_subscribe("logs")`. Requires a JSON-RPC Relay WebSocket endpoint.

```typescript
// Contract event log stream (via @hieco/realtime, WebSocket eth_subscribe)
const unsubscribe = hiero.watchContractLogs({
  contractId: "0.0.CONTRACT",
  handler: (log) => {
    console.log(`Event: ${log.topics[0]}`);
  },
});
```

> **Why two mechanisms?** Topic messages use HCS gRPC streaming — a Hiero-native
> protocol with no WebSocket equivalent. Contract logs use Ethereum-compatible
> `eth_subscribe` over WebSocket. These are fundamentally different transport layers
> and the SDK does not pretend otherwise.

---

## 16. Facades (Static-like Access)

For scripts, CLIs, and quick prototypes where creating a client feels heavy:

```typescript
import { transfer, createToken, submitMessage } from "@hieco/sdk/facade";

// Auto-creates a singleton client from environment variables on first call
await transfer({ to: "0.0.5678", amount: 10 });
await createToken({ name: "Gold", symbol: "GLD", decimals: 8 });
await submitMessage({ topicId: "0.0.TOPIC", message: "Hello" });
```

Each facade function lazily initializes a module-scoped `HieroClient` on first
invocation using `createHieroClient()` with zero-config defaults. Ideal for
scripts that do one thing and exit.

---

## 17. React Integration (@hieco/sdk-react)

### 17.1 Provider

```tsx
import { HieroProvider, createHieroConfig } from "@hieco/sdk-react";

const config = createHieroConfig({
  network: "testnet",
  operator: {
    accountId: "0.0.1234",
    privateKey: "302e...",
  },
});

function App() {
  return (
    <HieroProvider config={config}>
      <MyApp />
    </HieroProvider>
  );
}
```

### 17.2 Transaction Mutation Hooks

Following the wagmi `useWriteContract` pattern:

```tsx
import { useTransfer, useCreateToken } from "@hieco/sdk-react";

function TransferButton() {
  const { mutate, isPending, isSuccess, error, data } = useTransfer();

  return (
    <button disabled={isPending} onClick={() => mutate({ to: "0.0.5678", amount: 10 })}>
      {isPending ? "Sending..." : "Send 10 HBAR"}
    </button>
  );
}

function CreateTokenForm() {
  const { mutateAsync } = useCreateToken();

  async function handleSubmit(values: TokenFormValues) {
    const result = await mutateAsync({
      name: values.name,
      symbol: values.symbol,
      decimals: values.decimals,
      initialSupply: values.supply,
    });
    if (result.success) {
      console.log(`Created token: ${result.data.tokenId}`);
    }
  }

  return <form onSubmit={handleSubmit}>{/* ... */}</form>;
}
```

### 17.3 Hook Return Type

```typescript
interface UseTransactionResult<TData, TParams> {
  readonly mutate: (params: TParams) => void;
  readonly mutateAsync: (params: TParams) => Promise<SdkResult<TData>>;
  readonly data: TData | undefined;
  readonly error: SdkError | null;
  readonly status: "idle" | "pending" | "success" | "error";
  readonly isIdle: boolean;
  readonly isPending: boolean;
  readonly isSuccess: boolean;
  readonly isError: boolean;
  readonly reset: () => void;
  readonly transactionId: string | undefined;
}
```

### 17.4 Re-exported Mirror Hooks

`@hieco/sdk-react` re-exports all hooks from `@hieco/mirror-react` — developers
have a single import source for both reads and writes:

```tsx
import {
  // Writes (new, from @hieco/sdk-react)
  useTransfer,
  useCreateToken,
  useSubmitMessage,
  // Reads (re-exported from @hieco/mirror-react)
  useAccountInfo,
  useAccountBalances,
  useTokenInfo,
  // Provider (unified)
  HieroProvider,
} from "@hieco/sdk-react";
```

### 17.5 Subscription Hooks

```tsx
import { useTopicMessages, useContractLogs } from "@hieco/sdk-react";

function AuditLog() {
  const { messages, isConnected } = useTopicMessages({
    topicId: "0.0.TOPIC",
  });

  return (
    <ul>
      {messages.map((msg) => (
        <li key={msg.sequenceNumber}>{msg.contents}</li>
      ))}
    </ul>
  );
}
```

> **Note:** `useTopicMessages` uses `TopicMessageQuery` (gRPC) internally.
> `useContractLogs` uses `@hieco/realtime` (WebSocket `eth_subscribe`). These are
> different transport layers and have different connection lifecycle characteristics.

```

### 17.6 Hooks for Every Action

| Hook | Params | Return |
|---|---|---|
| `useTransfer` | `TransferParams` | `UseTransactionResult<TransferReceipt>` |
| `useCreateAccount` | `CreateAccountParams` | `UseTransactionResult<AccountReceipt>` |
| `useCreateToken` | `CreateTokenParams` | `UseTransactionResult<TokenReceipt>` |
| `useMintToken` | `MintTokenParams` | `UseTransactionResult<MintReceipt>` |
| `useBurnToken` | `BurnTokenParams` | `UseTransactionResult<TransactionReceipt>` |
| `useTransferToken` | `TransferTokenParams` | `UseTransactionResult<TransactionReceipt>` |
| `useAssociateToken` | `AssociateTokenParams` | `UseTransactionResult<TransactionReceipt>` |
| `useCreateTopic` | `CreateTopicParams` | `UseTransactionResult<TopicReceipt>` |
| `useSubmitMessage` | `SubmitMessageParams` | `UseTransactionResult<MessageReceipt>` |
| `useDeployContract` | `DeployContractParams` | `UseTransactionResult<ContractReceipt>` |
| `useExecuteContract` | `ExecuteContractParams` | `UseTransactionResult<ContractExecuteReceipt>` |
| `useOperator` | — | `{ accountId, publicKey, network }` |
| `useTopicMessages` | `{ topicId }` | `{ messages, isConnected }` (via gRPC `TopicMessageQuery`) |
| `useContractLogs` | `{ contractId }` | `{ logs, isConnected }` (via WebSocket `eth_subscribe`) |

---

## 18. Tree-Shaking & Bundle Size

### 18.1 Entry Point Strategy

```

@hieco/sdk → createHieroClient, HieroClient, core types, privateKeySigner
@hieco/sdk/signer → Signer interface, privateKeySigner, fromHieroSigner adapter
@hieco/sdk/actions → all action functions
@hieco/sdk/actions/crypto → transfer, createAccount, updateAccount, deleteAccount
@hieco/sdk/actions/token → createToken, mintToken, burnToken, transferToken, ...
@hieco/sdk/actions/consensus → createTopic, submitMessage, deleteTopic, updateTopic
@hieco/sdk/actions/contract → deployContract, executeContract, callContract
@hieco/sdk/actions/schedule → scheduleTransaction, signSchedule, deleteSchedule
@hieco/sdk/actions/file → createFile, appendFile, deleteFile
@hieco/sdk/builders → TokenBuilder, TopicBuilder, AccountBuilder, ContractBuilder
@hieco/sdk/mirror → MirrorQueryClient, query builders
@hieco/sdk/events → event types, typed emitter
@hieco/sdk/middleware → retryMiddleware, loggingMiddleware, gasEstimationMiddleware
@hieco/sdk/errors → SdkError, type guards, error factories
@hieco/sdk/facade → singleton facades

````

### 18.2 Bundle Impact

`@hiero-ledger/sdk` is a peer dependency — it is not bundled into `@hieco/sdk`.
The SDK's own code is lightweight wrapper logic (type conversions, pipeline
orchestration, middleware), not heavy cryptographic implementations.

Precise bundle size estimates will be measured after the initial implementation.
The tree-shakable entry points ensure that unused action modules are eliminated
by bundlers.

### 18.3 Side Effects Declaration

```json
{
  "sideEffects": false
}
````

Every module is pure. No top-level side effects. Bundlers can safely eliminate
unused exports.

---

## 19. Compatibility with Existing @hieco Packages

### 19.1 Non-Breaking Integration

`@hieco/sdk` wraps existing packages — it does not replace them:

```
@hieco/sdk uses @hieco/mirror (not replaces)
@hieco/sdk uses @hieco/realtime (not replaces)
@hieco/sdk uses @hieco/utils (not replaces)
@hieco/sdk-react uses @hieco/mirror-react (re-exports, not replaces)
```

Developers already using `@hieco/mirror` can adopt `@hieco/sdk` incrementally.
Both packages can coexist in the same project.

### 19.2 Interoperability

```typescript
import { createHieroClient } from "@hieco/sdk";
import { createMirrorNodeClient } from "@hieco/mirror";

const hiero = createHieroClient();

// Access the underlying @hieco/mirror client
const mirrorClient: MirrorNodeClient = hiero.raw.mirrorClient;

// Or use @hieco/mirror independently (still works)
const mirror = createMirrorNodeClient("testnet");
const account = await mirror.account.getInfo("0.0.1234");
```

### 19.3 Shared Type Foundation

All types flow from `@hieco/utils`:

- `EntityId` — template literal type `${number}.${number}.${number}`
- `ApiResult<T, E>` — discriminated success/error union
- `ApiError` — tagged union with `_tag` discriminant
- `NetworkType` — `"mainnet" | "testnet" | "previewnet"`
- `PaginationParams` — shared pagination interface

`@hieco/sdk` extends these (never replaces):

```typescript
export type { EntityId, ApiResult, NetworkType } from "@hieco/utils"
export type { SdkError, SdkResult, TransactionReceipt, TokenReceipt, ... }
```

---

## 20. Package Structure

```
packages/sdk/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts                    # createHieroClient, HieroClient, core types
│   ├── client.ts                   # HieroClient implementation
│   ├── config.ts                   # Configuration resolution (env vars, defaults)
│   ├── environment.ts              # Runtime environment detection (Node vs browser)
│   ├── types.ts                    # SDK-specific types (params, receipts, events)
│   ├── signer/
│   │   ├── index.ts                # Signer interface, privateKeySigner, fromHieroSigner
│   │   ├── types.ts                # Signer interface definition
│   │   ├── private-key-signer.ts   # Built-in private key signer (auto-detects format)
│   │   └── from-hiero-signer.ts    # Adapter: Hiero SDK Signer → @hieco/sdk Signer
│   ├── actions/
│   │   ├── index.ts                # Re-exports all actions + action set decorators
│   │   ├── crypto.ts               # transfer, createAccount, updateAccount, deleteAccount
│   │   ├── token.ts                # createToken, mintToken, burnToken, transferToken, ...
│   │   ├── consensus.ts            # createTopic, submitMessage, deleteTopic, updateTopic
│   │   ├── contract.ts             # deployContract, executeContract, callContract
│   │   ├── schedule.ts             # scheduleTransaction, signSchedule, deleteSchedule
│   │   └── file.ts                 # createFile, appendFile, deleteFile
│   ├── builders/
│   │   ├── index.ts
│   │   ├── token-builder.ts
│   │   ├── topic-builder.ts
│   │   ├── account-builder.ts
│   │   └── contract-builder.ts
│   ├── mirror/
│   │   ├── index.ts
│   │   └── query-client.ts         # MirrorQueryClient wrapping @hieco/mirror
│   ├── pipeline/
│   │   ├── index.ts
│   │   ├── executor.ts             # Transaction pipeline orchestrator
│   │   └── resolver.ts             # Params → native transaction resolver
│   ├── events/
│   │   ├── index.ts
│   │   └── emitter.ts              # Typed event emitter
│   ├── middleware/
│   │   ├── index.ts
│   │   ├── retry.ts                # Retry with exponential backoff + jitter
│   │   ├── logging.ts              # Transaction lifecycle logging
│   │   └── gas-estimation.ts       # Auto gas estimation (Mirror Node default + dry-run escalation)
│   ├── errors/
│   │   ├── index.ts
│   │   ├── types.ts                # SdkError discriminated union
│   │   ├── guards.ts               # Type guard functions
│   │   └── messages.ts             # Human-readable error message generation
│   └── facade/
│       └── index.ts                # Singleton facades
└── tests/

packages/sdk-react/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts                    # Re-exports everything
│   ├── provider.tsx                # HieroProvider
│   ├── context.ts                  # React context
│   └── hooks/
│       ├── index.ts
│       ├── use-transfer.ts
│       ├── use-create-token.ts
│       ├── use-mint-token.ts
│       ├── use-create-topic.ts
│       ├── use-submit-message.ts
│       ├── use-deploy-contract.ts
│       ├── use-execute-contract.ts
│       ├── use-operator.ts
│       ├── use-topic-messages.ts
│       └── use-contract-logs.ts
└── tests/
```

### package.json (SDK core)

```json
{
  "name": "@hieco/sdk",
  "version": "0.1.0",
  "type": "module",
  "sideEffects": false,
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    },
    "./signer": {
      "types": "./dist/signer/index.d.ts",
      "import": "./dist/signer/index.js"
    },
    "./actions": {
      "types": "./dist/actions/index.d.ts",
      "import": "./dist/actions/index.js"
    },
    "./actions/crypto": {
      "types": "./dist/actions/crypto.d.ts",
      "import": "./dist/actions/crypto.js"
    },
    "./actions/token": {
      "types": "./dist/actions/token.d.ts",
      "import": "./dist/actions/token.js"
    },
    "./actions/consensus": {
      "types": "./dist/actions/consensus.d.ts",
      "import": "./dist/actions/consensus.js"
    },
    "./actions/contract": {
      "types": "./dist/actions/contract.d.ts",
      "import": "./dist/actions/contract.js"
    },
    "./actions/schedule": {
      "types": "./dist/actions/schedule.d.ts",
      "import": "./dist/actions/schedule.js"
    },
    "./actions/file": {
      "types": "./dist/actions/file.d.ts",
      "import": "./dist/actions/file.js"
    },
    "./builders": {
      "types": "./dist/builders/index.d.ts",
      "import": "./dist/builders/index.js"
    },
    "./mirror": {
      "types": "./dist/mirror/index.d.ts",
      "import": "./dist/mirror/index.js"
    },
    "./events": {
      "types": "./dist/events/index.d.ts",
      "import": "./dist/events/index.js"
    },
    "./middleware": {
      "types": "./dist/middleware/index.d.ts",
      "import": "./dist/middleware/index.js"
    },
    "./errors": {
      "types": "./dist/errors/index.d.ts",
      "import": "./dist/errors/index.js"
    },
    "./facade": {
      "types": "./dist/facade/index.d.ts",
      "import": "./dist/facade/index.js"
    }
  },
  "peerDependencies": {
    "@hiero-ledger/sdk": ">=2.80.0"
  },
  "dependencies": {
    "@hieco/mirror": "workspace:*",
    "@hieco/realtime": "workspace:*",
    "@hieco/utils": "workspace:*"
  },
  "devDependencies": {
    "@hiero-ledger/sdk": "^2.80.0"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

---

## 21. API Reference

### 21.1 Client

| Export                       | Type                                          | Description                                                   |
| ---------------------------- | --------------------------------------------- | ------------------------------------------------------------- |
| `createHieroClient(config?)` | `(config?: HieroClientConfig) => HieroClient` | Create a configured client                                    |
| `HieroClient`                | Interface                                     | Client instance type                                          |
| `HieroClientConfig`          | Interface                                     | Configuration options                                         |
| `privateKeySigner(key)`      | `(key: string) => Signer`                     | Create signer from private key (auto-detects format)          |
| `fromHieroSigner(signer)`    | `(signer: HieroSigner) => Signer`             | Adapt a Hiero SDK `Signer` (e.g., WalletConnect `DAppSigner`) |
| `Signer`                     | Interface                                     | Minimal signing interface (2 methods: `sign`, `getPublicKey`) |
| `GetBalanceParams`           | Interface                                     | Balance query params with `source` option                     |

### 21.2 Crypto Actions

| Export             | Params                   | Result                          |
| ------------------ | ------------------------ | ------------------------------- |
| `transfer`         | `TransferParams`         | `SdkResult<TransferReceipt>`    |
| `createAccount`    | `CreateAccountParams`    | `SdkResult<AccountReceipt>`     |
| `updateAccount`    | `UpdateAccountParams`    | `SdkResult<TransactionReceipt>` |
| `deleteAccount`    | `DeleteAccountParams`    | `SdkResult<TransactionReceipt>` |
| `approveAllowance` | `ApproveAllowanceParams` | `SdkResult<TransactionReceipt>` |

### 21.3 Token Actions

| Export                   | Params                         | Result                          |
| ------------------------ | ------------------------------ | ------------------------------- |
| `createToken`            | `CreateTokenParams`            | `SdkResult<TokenReceipt>`       |
| `mintToken`              | `MintTokenParams`              | `SdkResult<MintReceipt>`        |
| `burnToken`              | `BurnTokenParams`              | `SdkResult<TransactionReceipt>` |
| `transferToken`          | `TransferTokenParams`          | `SdkResult<TransactionReceipt>` |
| `transferNft`            | `TransferNftParams`            | `SdkResult<TransactionReceipt>` |
| `associateToken`         | `AssociateTokenParams`         | `SdkResult<TransactionReceipt>` |
| `dissociateToken`        | `DissociateTokenParams`        | `SdkResult<TransactionReceipt>` |
| `freezeToken`            | `FreezeTokenParams`            | `SdkResult<TransactionReceipt>` |
| `unfreezeToken`          | `UnfreezeTokenParams`          | `SdkResult<TransactionReceipt>` |
| `grantKyc`               | `GrantKycParams`               | `SdkResult<TransactionReceipt>` |
| `revokeKyc`              | `RevokeKycParams`              | `SdkResult<TransactionReceipt>` |
| `pauseToken`             | `PauseTokenParams`             | `SdkResult<TransactionReceipt>` |
| `unpauseToken`           | `UnpauseTokenParams`           | `SdkResult<TransactionReceipt>` |
| `wipeToken`              | `WipeTokenParams`              | `SdkResult<TransactionReceipt>` |
| `deleteToken`            | `DeleteTokenParams`            | `SdkResult<TransactionReceipt>` |
| `updateToken`            | `UpdateTokenParams`            | `SdkResult<TransactionReceipt>` |
| `updateTokenFeeSchedule` | `UpdateTokenFeeScheduleParams` | `SdkResult<TransactionReceipt>` |

### 21.4 Consensus Actions

| Export          | Params                | Result                          |
| --------------- | --------------------- | ------------------------------- |
| `createTopic`   | `CreateTopicParams`   | `SdkResult<TopicReceipt>`       |
| `updateTopic`   | `UpdateTopicParams`   | `SdkResult<TransactionReceipt>` |
| `deleteTopic`   | `DeleteTopicParams`   | `SdkResult<TransactionReceipt>` |
| `submitMessage` | `SubmitMessageParams` | `SdkResult<MessageReceipt>`     |

### 21.5 Contract Actions

| Export            | Params                  | Result                              |
| ----------------- | ----------------------- | ----------------------------------- |
| `deployContract`  | `DeployContractParams`  | `SdkResult<ContractReceipt>`        |
| `executeContract` | `ExecuteContractParams` | `SdkResult<ContractExecuteReceipt>` |
| `callContract`    | `CallContractParams`    | `SdkResult<ContractCallResult>`     |
| `deleteContract`  | `DeleteContractParams`  | `SdkResult<TransactionReceipt>`     |
| `updateContract`  | `UpdateContractParams`  | `SdkResult<TransactionReceipt>`     |

### 21.6 Schedule Actions

| Export                | Params                      | Result                          |
| --------------------- | --------------------------- | ------------------------------- |
| `scheduleTransaction` | `ScheduleTransactionParams` | `SdkResult<ScheduleReceipt>`    |
| `signSchedule`        | `SignScheduleParams`        | `SdkResult<TransactionReceipt>` |
| `deleteSchedule`      | `DeleteScheduleParams`      | `SdkResult<TransactionReceipt>` |

### 21.7 File Actions

| Export       | Params             | Result                          |
| ------------ | ------------------ | ------------------------------- |
| `createFile` | `CreateFileParams` | `SdkResult<FileReceipt>`        |
| `appendFile` | `AppendFileParams` | `SdkResult<TransactionReceipt>` |
| `updateFile` | `UpdateFileParams` | `SdkResult<TransactionReceipt>` |
| `deleteFile` | `DeleteFileParams` | `SdkResult<TransactionReceipt>` |

### 21.8 Builders

| Builder             | Terminal    | Result                       |
| ------------------- | ----------- | ---------------------------- |
| `hiero.tokens()`    | `.create()` | `SdkResult<TokenReceipt>`    |
| `hiero.topics()`    | `.create()` | `SdkResult<TopicReceipt>`    |
| `hiero.accounts()`  | `.create()` | `SdkResult<AccountReceipt>`  |
| `hiero.contracts()` | `.deploy()` | `SdkResult<ContractReceipt>` |

### 21.9 Middleware

| Export                             | Description                                                                                                                       |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `retryMiddleware(config?)`         | Exponential backoff with jitter (default: enabled)                                                                                |
| `loggingMiddleware(config?)`       | Structured lifecycle logging                                                                                                      |
| `gasEstimationMiddleware(config?)` | Gas estimation via Mirror Node REST API (`POST /api/v1/contracts/call` with `estimate: true`), or dry-run via `@hiero-ledger/sdk` |

---

## 22. Before & After

### Raw @hiero-ledger/sdk (35 lines)

```typescript
import {
  Client,
  PrivateKey,
  AccountId,
  TransferTransaction,
  Hbar,
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  TopicCreateTransaction,
  TopicMessageSubmitTransaction,
} from "@hiero-ledger/sdk";

const client = Client.forTestnet();
client.setOperator(
  AccountId.fromString(process.env.ACCOUNT_ID!),
  PrivateKey.fromStringED25519(process.env.PRIVATE_KEY!),
);

// Transfer HBAR
const transferTx = new TransferTransaction()
  .addHbarTransfer(AccountId.fromString("0.0.1234"), new Hbar(-10))
  .addHbarTransfer(AccountId.fromString("0.0.5678"), new Hbar(10))
  .setMaxTransactionFee(new Hbar(1));
const frozenTransfer = await transferTx.freezeWith(client);
const signedTransfer = await frozenTransfer.sign(
  PrivateKey.fromStringED25519(process.env.PRIVATE_KEY!),
);
const transferResponse = await signedTransfer.execute(client);
const transferReceipt = await transferResponse.getReceipt(client);

// Create Token
const tokenTx = new TokenCreateTransaction()
  .setTokenName("Loyalty Points")
  .setTokenSymbol("LOYAL")
  .setDecimals(2)
  .setInitialSupply(1000000)
  .setTreasuryAccountId(AccountId.fromString(process.env.ACCOUNT_ID!))
  .setAdminKey(PrivateKey.fromStringED25519(process.env.PRIVATE_KEY!).publicKey)
  .setSupplyKey(PrivateKey.fromStringED25519(process.env.PRIVATE_KEY!).publicKey)
  .setTokenType(TokenType.FungibleCommon)
  .setSupplyType(TokenSupplyType.Infinite)
  .setMaxTransactionFee(new Hbar(30));
const frozenToken = await tokenTx.freezeWith(client);
const signedToken = await frozenToken.sign(PrivateKey.fromStringED25519(process.env.PRIVATE_KEY!));
const tokenResponse = await signedToken.execute(client);
const tokenReceipt = await tokenResponse.getReceipt(client);

// Create Topic + Submit Message
const topicTx = new TopicCreateTransaction()
  .setTopicMemo("Audit log")
  .setSubmitKey(PrivateKey.fromStringED25519(process.env.PRIVATE_KEY!).publicKey);
const frozenTopic = await topicTx.freezeWith(client);
const signedTopic = await frozenTopic.sign(PrivateKey.fromStringED25519(process.env.PRIVATE_KEY!));
const topicResponse = await signedTopic.execute(client);
const topicReceipt = await topicResponse.getReceipt(client);

const msgTx = new TopicMessageSubmitTransaction()
  .setTopicId(topicReceipt.topicId!)
  .setMessage("Hello, consensus!");
const msgResponse = await msgTx.execute(client);
await msgResponse.getReceipt(client);
```

### @hieco/sdk (10 lines)

```typescript
import { createHieroClient } from "@hieco/sdk";

const hiero = createHieroClient();

await hiero.transfer({ to: "0.0.5678", amount: 10 });

const token = await hiero.createToken({
  name: "Loyalty Points",
  symbol: "LOYAL",
  decimals: 2,
  initialSupply: 1_000_000,
  supplyKey: true,
  adminKey: true,
});

const topic = await hiero.createTopic({ memo: "Audit log", submitKey: true });
await hiero.submitMessage({ topicId: topic.data.topicId, message: "Hello, consensus!" });
```

Same 3 operations. 35 lines → 10 lines. Every operation gets automatic retry,
typed results, human-readable errors, and event emission — for free.

---

## 23. Roadmap

### Phase 1: Client & Transaction Pipeline (Week 1-2)

- [ ] `createHieroClient` with env-var resolution and zero-config defaults
- [ ] Runtime environment detection (Node vs browser)
- [ ] `ConsensusTransport` wrapping `@hiero-ledger/sdk` Client
- [ ] Transaction pipeline: params → build → middleware → freeze → sign → execute → receipt → result
- [ ] Middleware system with composable `TransactionMiddleware` interface
- [ ] Retry middleware with exponential backoff + jitter (enabled by default)
- [ ] Logging middleware
- [ ] Typed event emitter for transaction lifecycle
- [ ] `SdkError` discriminated union with human-readable messages (local context only)
- [ ] Error type guards (`isInsufficientBalanceError`, `isTransactionError`, etc.)
- [ ] Crypto actions: `transfer`, `createAccount`, `updateAccount`, `deleteAccount`
- [ ] `Signer` interface + `privateKeySigner` with auto-detection (ED25519/ECDSA DER, raw hex) + `fromHieroSigner` adapter
- [ ] Browser operator requirement enforcement (`ConfigurationError` on missing operator)

### Phase 2: Token & Consensus Actions (Week 2-3)

- [ ] Token actions: full HTS lifecycle (17 actions — uses `TokenWipeTransaction`, not `TokenWipeAccountTransaction`)
- [ ] Consensus actions: `createTopic`, `submitMessage` with auto-chunking, `updateTopic`, `deleteTopic`
- [ ] Fluent resource builders: `TokenBuilder`, `TopicBuilder`, `AccountBuilder`
- [ ] Per-transaction retry override
- [ ] `approveAllowance` action

### Phase 3: Contracts, Schedules, Mirror & Composition (Week 3-4)

- [ ] Contract actions: `deployContract`, `executeContract`, `callContract`
- [ ] Gas estimation middleware (`"mirror"` via `POST /api/v1/contracts/call` with `{ "estimate": true }`, or `"dry-run"` via `ContractCallQuery`)
- [ ] Schedule actions: `scheduleTransaction`, `signSchedule`, `deleteSchedule`
- [ ] File actions: `createFile`, `appendFile`, `deleteFile`
- [ ] `ContractBuilder` fluent builder
- [ ] `MirrorQueryClient` with fluent query builder facade over `@hieco/mirror`
- [ ] Composable `client.extend()` pattern (viem-style decorator composition)
- [ ] Tree-shakable standalone action imports (`import { transfer } from "@hieco/sdk/actions"`)
- [ ] `watchTopicMessages` (gRPC via `TopicMessageQuery`)
- [ ] `watchContractLogs` (WebSocket via `@hieco/realtime` `eth_subscribe`)

### Phase 4: React Integration (Week 4-5)

- [ ] `@hieco/sdk-react` package
- [ ] `HieroProvider` and `createHieroConfig`
- [ ] Transaction mutation hooks: `useTransfer`, `useCreateToken`, `useMintToken`, `useCreateTopic`, `useSubmitMessage`, `useDeployContract`, `useExecuteContract`
- [ ] `useOperator` hook
- [ ] Re-export all `@hieco/mirror-react` hooks
- [ ] Facade module for script/CLI usage

### Phase 5: Polish & Documentation (Week 5-6)

- [ ] Subscription hooks: `useTopicMessages` (gRPC), `useContractLogs` (WebSocket)
- [ ] Multi-signature transaction flows (`buildTransaction` + `submitTransaction`)
- [ ] `TransactionParamsMap` / `TransactionResultMap` conditional type system
- [ ] Performance benchmarks vs raw `@hiero-ledger/sdk`
- [ ] Bundle size analysis and optimization
- [ ] API documentation

### Planned for v0.2 (Post-hackathon)

- [ ] Relationship loading (`.with("tokens", "nfts")` — parallel Mirror Node requests + response stitching)
- [ ] Mnemonic-to-signer convenience function
- [ ] Advanced gas estimation heuristics (auto-escalation based on contract analysis)
- [ ] Solid.js and Preact integration packages

---

## 24. Architectural Decisions

All previously-unresolved questions have been decided. Each decision is documented
below with its rationale.

### 24.1 Hiero SDK as Peer Dependency

**Decision:** `@hiero-ledger/sdk` is a `peerDependency`.

Tree-shaking and version deduplication are critical in a monorepo where multiple
packages (`@hieco/mirror`, `@hieco/realtime`) may interact with the same underlying
SDK. Bundling creates version conflicts and bloat. The install step is acceptable
friction — developers installing `@hieco/sdk` are already committed to Hedera
development and will have `@hiero-ledger/sdk` in their dependencies.

```bash
bun add @hieco/sdk @hiero-ledger/sdk
```

### 24.2 Gas Estimation: Mirror Node Default with Explicit Dry-Run Option

**Decision:** Default to Mirror Node REST API (`POST /api/v1/contracts/call` with
`{ "estimate": true }`) for gas estimation. Provide an explicit `"dry-run"` strategy
for developers who need it. No automatic escalation.

Mirror Node provides sufficient accuracy for standard contract calls with lower
latency than dry-run execution. Complex state-dependent transactions may need
dry-run for precision, but there is no reliable heuristic to detect this
automatically — the developer must choose. JSON-RPC Relay is not needed since
Mirror Node provides gas estimation directly.

```typescript
gasEstimationMiddleware({
  strategy: "mirror", // "mirror" (default) | "dry-run"
  bufferPercent: 20,
});
```

The `"mirror"` strategy calls the Mirror Node REST API. The `"dry-run"` strategy
uses `ContractCallQuery` from `@hiero-ledger/sdk` to execute the contract locally
on a consensus node.

### 24.3 Unified Entry Point with Runtime Environment Detection

**Decision:** One import, multiple environments, seamless behavior. No separate
entry points.

The divergence between gRPC (Node) and gRPC-web (browser) is an implementation
detail developers should not manage. `@hieco/sdk` detects the environment at
runtime and instantiates the correct transport automatically. An explicit
`transport` configuration option is available for advanced users needing manual
override.

```typescript
// Works in both Node and browser — transport auto-detected
const hiero = createHieroClient();

// Manual override for edge cases
const hiero = createHieroClient({
  transport: "grpc-web", // force gRPC-web even in Node (e.g., testing)
});
```

### 24.4 Signer Interface at the SDK Boundary

**Decision:** `@hieco/sdk` defines a minimal 2-method `Signer` interface and ships
a `fromHieroSigner()` adapter for ecosystem wallet integration. No dedicated wallet
connect package.

The SDK provides `privateKeySigner` for Node/scripts and `fromHieroSigner()` as a
bridge for any object implementing the Hiero SDK's full `Signer` interface. The
Hedera wallet ecosystem has standardized on `@hashgraph/hedera-wallet-connect` (used
by HashPack, Kabila, Dropp), which provides `DAppSigner` — a class implementing the
Hiero SDK's `Signer`. Blade Wallet shut down July 2025; its SDK is deprecated.

`@hieco/sdk` does NOT build wallet connectors, does NOT depend on wallet SDKs, and
does NOT ship wallet-specific signer implementations. The ecosystem already solved
wallet connectivity. Our job is to accept the result cleanly.

For custom integrations (HSMs, custodial services, MPC), developers implement the
2-method `Signer` interface directly — no 12-method fat interface to satisfy.

```typescript
interface Signer {
  sign(bytes: Uint8Array): Promise<Uint8Array>;
  getPublicKey(): Promise<PublicKey>;
}

// Built-in: private key signer (included in @hieco/sdk)
const hiero = createHieroClient({
  operator: {
    accountId: "0.0.1234",
    signer: privateKeySigner("302e020100..."),
  },
});

// Ecosystem wallet: WalletConnect DAppSigner → fromHieroSigner adapter
import { fromHieroSigner } from "@hieco/sdk";
import { DAppConnector } from "@hashgraph/hedera-wallet-connect";

const dAppConnector = new DAppConnector(metadata, ledgerId, projectId);
await dAppConnector.init();
const walletSigner = dAppConnector.getSigner(accountId);

const hiero = createHieroClient({
  operator: {
    accountId: accountId.toString(),
    signer: fromHieroSigner(walletSigner),
  },
});

// Custom: ad-hoc implementation for any signing backend
const hiero = createHieroClient({
  operator: {
    accountId: "0.0.1234",
    signer: {
      async sign(bytes) {
        return myHsm.sign(bytes);
      },
      async getPublicKey() {
        return myHsm.getPublicKey();
      },
    },
  },
});
```

### 24.5 Explicit Balance Query Source with Mirror Default

**Decision:** `source?: "mirror" | "consensus"` option with `"mirror"` as default.

Consensus queries cost HBAR and impose network load; Mirror Node queries are free
and faster. Defaulting to Mirror Node respects developer resources while the explicit
option preserves access to real-time consensus data when genuinely needed (arbitrage,
high-frequency trading).

```typescript
// Default: Mirror Node (free, fast)
const balance = await hiero.getBalance({ accountId: "0.0.1234" });

// Explicit: consensus node (real-time, costs HBAR)
const balance = await hiero.getBalance({
  accountId: "0.0.1234",
  source: "consensus",
});
```

### 24.6 Package Name: `@hieco/sdk`

**Decision:** `@hieco/sdk`, not `@hieco/core`.

The existing domain packages (`mirror`, `realtime`, `types`) are infrastructure
components. This package is the developer-facing entry point — the
"batteries-included" experience. "SDK" signals a complete toolkit; "core" implies
a foundation requiring additional assembly. The semantic distinction from existing
infrastructure packages is intentional and clear.

### 24.7 Environment-Aware Operator Configuration

**Decision:** Explicit `operator` config required in browser. Environment variable
fallback only in Node.

Security and predictability outweigh convenience. In Node environments only, if
`operator` is omitted, the SDK attempts to construct from `HIERO_OPERATOR_ID` and
`HIERO_PRIVATE_KEY` environment variables. In browser environments, omitting
`operator` throws an explicit `ConfigurationError` requiring operator configuration.
This prevents accidental private key exposure in client-side bundles and forces
intentional signer setup.

```typescript
// Node: zero-config (reads from process.env)
const hiero = createHieroClient();

// Browser: explicit operator required
const hiero = createHieroClient({
  operator: {
    accountId: "0.0.1234",
    signer: fromHieroSigner(walletSigner), // or custom Signer implementation
  },
});

// Browser: omitting operator throws ConfigurationError
// "Operator configuration is required in browser environments.
//  Provide { operator: { accountId, signer } } to createHieroClient()."
```

---

## 25. Audit Log

This section documents changes made to the proposal after evidence-based auditing
against actual `@hiero-ledger/sdk` exports, Mirror Node REST API endpoints, existing
`@hieco/*` package implementations, and viem architectural patterns.

### Corrections (Factual Errors Fixed)

| Finding                                                                      | Change                                                                                                   |
| ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `TokenWipeAccountTransaction` doesn't exist in `@hiero-ledger/sdk`           | Internal implementation must use `TokenWipeTransaction`. Action name `wipeToken` unchanged.              |
| `AccountBalanceQuery` is NOT deprecated in SDK source (no `@deprecated` tag) | Changed "deprecated July 2026" to "planned for deprecation" throughout.                                  |
| `POST /api/v1/contracts/estimateGas` does not exist                          | Gas estimation uses `POST /api/v1/contracts/call` with `{ "estimate": true }`. All references corrected. |
| `ThresholdKey` doesn't exist as a standalone class                           | Uses `KeyList` with `threshold` parameter: `new KeyList(keys, 2)`.                                       |

### Deletions

| Feature                                                                      | Reason                                                                                                                                                                                                                                                                                            |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unified `hiero.subscribe("topic:messages", {...})` API                       | `@hieco/realtime` only supports `eth_subscribe` (logs, newHeads). Topic subscriptions require `TopicMessageQuery` (gRPC) from `@hiero-ledger/sdk` — a completely different transport. Replaced with honest `watchTopicMessages()` and `watchContractLogs()` with documented transport boundaries. |
| `gasEstimationMiddleware` "auto" strategy with bytecode complexity detection | No reliable heuristic exists to detect when Mirror Node estimate will fail. Removed "auto", simplified to explicit `"mirror"` (default) or `"dry-run"`.                                                                                                                                           |
| `count()` terminal method on `MirrorQueryBuilder`                            | Mirror Node REST API has no count endpoints. Would require fetching all results just to count them — deceptive API surface.                                                                                                                                                                       |

### Simplifications

| Feature                       | Change                                                                                                                                                                                                           |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Human-readable error messages | Removed key structure fetching from error handling. Errors now use only locally available context (status code, transaction ID, account ID). Suggests diagnostic Mirror Node queries instead of performing them. |
| `SdkError` type               | Removed `required`/`available` from `InsufficientBalanceError` and `expectedKeys`/`providedKeys` from `InvalidSignatureError` — these required additional network queries.                                       |
| `MirrorQueryBuilder`          | Added documentation that it's a facade over `@hieco/mirror`'s existing domain APIs, not a new implementation. Removed `with()` from query builder interface.                                                     |
| Private key auto-detection    | Removed mnemonic auto-detection. Mnemonics require BIP-39 wordlist lookup — a different code path. Keep ED25519/ECDSA DER and raw hex detection only.                                                            |
| Bundle size estimates         | Removed specific KB estimates (they were speculative). Replaced with commitment to measure after implementation.                                                                                                 |

### Postponements (Moved to v0.2)

| Feature                                                    | Reason                                                                                                                                         |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Relationship loading (`.with("tokens", "nfts")`)           | Requires parallel Mirror Node requests + response stitching. Feasible but adds implementation complexity without solving an urgent pain point. |
| Mnemonic-to-signer convenience function                    | Lower priority, clear workaround exists (`Mnemonic` from `@hiero-ledger/sdk`).                                                                 |
| Advanced gas estimation heuristics                         | Needs real-world data on when Mirror Node estimates are insufficient.                                                                          |
| Subscription hooks (`useTopicMessages`, `useContractLogs`) | Moved from Phase 4 to Phase 5 — the two different transport layers (gRPC vs WebSocket) add complexity that should not block core React hooks.  |

### Consistency Fixes

| Finding                                                                                          | Change                                                                                                                                                                                                                                                                                                                                                             |
| ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `@hieco/mirror` uses singular (`client.account`), proposal uses plural (`hiero.mirror.accounts`) | Documented the intentional naming divergence with rationale in Section 11.2.                                                                                                                                                                                                                                                                                       |
| `SdkError` type guards incompatible with `@hieco/utils` `ApiError` guards                        | Added explicit documentation in Section 13.4 that SDK type guards are separate from `@hieco/utils` guards.                                                                                                                                                                                                                                                         |
| `RelayTransport` listed in key translations table                                                | Removed — `@hieco/realtime` is used directly for WebSocket subscriptions, not through a separate transport abstraction.                                                                                                                                                                                                                                            |
| `relay: RelayTransport` on `HieroClient` interface                                               | Removed — same rationale as above. `watchContractLogs` manages its own connection.                                                                                                                                                                                                                                                                                 |
| `@hieco/connect` phantom package with `hashPackSigner`, `bladeSigner`, `metaMaskSigner`          | Removed entirely. Blade Wallet shut down July 2025. Ecosystem standardized on `@hashgraph/hedera-wallet-connect` (`DAppSigner` implements Hiero SDK `Signer`). Added `fromHieroSigner()` adapter to bridge ecosystem signers to our minimal 2-method interface. Architecture diagram, developer journey, Section 6.2, Section 24.4, and all code examples updated. |

---

# @hiero/testkit - Comprehensive Testing Library for Hiero

**Hackathon:** Hedera Hello Future Apex Hackathon 2026
**Bounty Pool:** $8,000 (Hiero Developer Tooling Track)
**Status:** Novel Proposal - Zero Overlap with Official Examples
**Timeline:** 5 weeks (February - March 2026)

---

## Executive Summary

**@hiero/testkit** is a comprehensive testing infrastructure library that solves the #1 undocumented pain point in Hiero development: **the complete absence of testing utilities, patterns, and mock implementations**.

### Why This Will Win

1. **Zero Competition** - No existing testing library exists for Hiero
2. **Solves Real Pain** - Addresses documented gaps in SDK research
3. **100% Novel** - Not in official examples, not in existing proposals
4. **High Adoption** - Every Hiero developer needs testing tools
5. **Production-Minded** - Follows hiero-enterprise-java patterns

---

## Problem Analysis: The Testing Gap in Hiero Ecosystem

### What the Deep Research Revealed

Exhaustive research using MCP tools, GitHub search, and deep web analysis uncovered these documented gaps:

> "No verified, reproducible community facts in the supplied evidence describe recommended VSCode launch configs, sourcemap configurations, or coverage tool specifics for Hiero/Hedera + Vitest/Jest"

> "No verified community guidance for Hedera-specific mocking libraries (MSW/testcontainers) or patterns"

> "No coverage integration best-practices with the Hiero SDK"

### Current Developer Experience (Broken)

Developers writing Hiero tests today face:

```typescript
// ❌ The "Old Way" - What developers currently do
import { Client, TransferTransaction, Hbar } from "@hiero-ledger/sdk";

describe("Transfer Tests", () => {
  let client: Client;
  let senderKey: PrivateKey;
  let recipientKey: PrivateKey;

  beforeAll(async () => {
    // Must start local node manually - 30+ seconds
    // Docker must be running
    // Port conflicts possible
    // Ledger state is non-deterministic
    client = Client.forPreviewnet();
    senderKey = PrivateKey.generate();
    recipientKey = PrivateKey.generate();
    // Must fund accounts from faucet - rate limited!
  });

  test("transfer HBAR", async () => {
    // Flaky if faucet fails
    // Slow (actual network call)
    // Tests interfere with each other
    const tx = await new TransferTransaction()
      .addHbarTransfer(sender, Hbar.fromTinybars(-100))
      .addHbarTransfer(recipient, Hbar.fromTinybars(100))
      .execute(client);

    const receipt = await tx.getReceipt(client);
    expect(receipt.status).toBe(Status.Success);
  });
});
```

**Problems:**

- Tests require actual network connection (slow, flaky)
- No way to mock SDK responses
- Shared ledger state causes cascading failures
- No test fixtures or helpers
- No custom matchers
- Tests take minutes instead of milliseconds

---

## What @hiero/testkit Provides

### Core Value Proposition

**@hiero/testkit** brings Hiero testing to parity with modern Web3 tooling (viem, wagmi, Hardhat) by providing:

| Feature             | Description                                | Comparable To                              |
| ------------------- | ------------------------------------------ | ------------------------------------------ |
| **Mock Client**     | In-memory mock for unit tests              | viem's `anvil` + `testClient`              |
| **Test Fixtures**   | Pre-configured accounts, tokens, contracts | Hardhat's `hardhat-network-helpers`        |
| **Custom Matchers** | Jest/Vitest matchers for Hiero types       | `@nomicfoundation/hardhat-viem-assertions` |
| **State Snapshots** | Ledger state management                    | Foundry's `vm.snapshot`                    |
| **Network Spinup**  | Programmatic local node control            | Hardhat's `node` object                    |
| **Coverage Config** | Ready-to-use instrumentation               | nyc/istanbul presets                       |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         @hiero/testkit                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    Core Testing Layer                        │   │
│  │                                                              │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │   │
│  │  │ MockHiero    │  │ TestFixtures │  │  Matchers    │      │   │
│  │  │   Client     │  │              │  │              │      │   │
│  │  │              │  │ • Accounts   │  │ • toHaveStatus│      │   │
│  │  │ • Mock tx    │  │ • Tokens     │  │ • toHaveBalance│      │   │
│  │  │ • Mock query │  │ • Contracts  │  │ • toHaveEmitted│      │   │
│  │  │ • Freeze time│  │ • Topics     │  │ • toBeValidTx │      │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘      │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                 Test Runner Integration                      │   │
│  │                                                              │   │
│  │  ┌─────────────────────────┐  ┌─────────────────────────┐   │   │
│  │  │      Vitest Plugin      │  │       Jest Plugin        │   │   │
│  │  │                         │  │                         │   │   │
│  │  │ • setupFiles            │  │ • setupFilesAfterEnv   │   │   │
│  │  │ • global fixtures       │  │ • globalSetup          │   │   │
│  │  │ • workspace support    │  │ • transform            │   │   │
│  │  └─────────────────────────┘  └─────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    Developer Tools                           │   │
│  │                                                              │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │   │
│  │  │ VSCode       │  │ Coverage     │  │ CLI          │      │   │
│  │  │ Debug Config │  │ Presets      │  │              │      │   │
│  │  │              │  │              │  │ • init       │      │   │
│  │  │ • launch.json│  │ • nyc        │  │ • generate   │      │   │
│  │  │ • extensions │  │ • vitest     │  │ • validate   │      │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘      │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## API Design

### 1. Mock Client - Unit Testing Without Network

```typescript
import { mockClient } from "@hiero/testkit/vitest";
// or
import { mockClient } from "@hiero/testkit/jest";

describe("TransferService", () => {
  const mock = mockClient();

  beforeEach(() => {
    mock.reset();
  });

  it("should transfer HBAR", async () => {
    // Arrange: Set up mock state
    mock.accounts.set({
      "0.0.1001": { balance: Hbar.from(1000) },
      "0.0.1002": { balance: Hbar.from(0) },
    });

    // Act: Execute transaction against mock
    const service = new TransferService(mock.client);
    await service.transfer("0.0.1001", "0.0.1002", Hbar.from(100));

    // Assert: Verify state changes
    expect(mock.accounts.get("0.0.1001").balance).toBeHbar("899.99...");
    expect(mock.accounts.get("0.0.1002").balance).toBeHbar("100");

    // Verify transaction was submitted
    expect(mock.client.execute).toHaveBeenCalledWith(expect.any(TransferTransaction));
  });

  it("should fail with insufficient balance", async () => {
    mock.accounts.set({
      "0.0.1001": { balance: Hbar.from(10) }, // Not enough
    });

    const service = new TransferService(mock.client);

    await expect(
      service.transfer("0.0.1001", "0.0.1002", Hbar.from(100)),
    ).rejects.toThrowHieroError("INSUFFICIENT_PAYER_BALANCE");
  });
});
```

### 2. Test Fixtures - Pre-configured Test State

```typescript
import { fixtures, useAccount, useToken } from "@hiero/testkit/vitest";

describe("Token Transfer", () => {
  // Use pre-funded test accounts
  const [sender, recipient] = fixtures.accounts(2);

  // Use pre-configured token
  const token = fixtures.token({
    name: "Test Token",
    symbol: "TST",
    decimals: 8,
    initialSupply: 1_000_000,
    treasury: sender.accountId,
  });

  beforeEach(async () => {
    await fixtures.deploy(mock.client);
  });

  it("should transfer tokens", async () => {
    await token.transfer(recipient.accountId, 100);

    expect(await token.balanceOf(sender.accountId)).toBe(999_900n);
    expect(await token.balanceOf(recipient.accountId)).toBe(100n);
  });
});
```

### 3. Custom Matchers - Type-Safe Assertions

```typescript
import { describe, it, expect } from "@hiero/testkit/vitest";

// Custom matchers for Hiero types
describe("Custom Matchers", () => {
  it("should match Hbar amounts", () => {
    const balance = Hbar.fromTinybars(100_000_000);

    expect(balance).toBeHbar("1 ℏ");
    expect(balance).toBeHbar(1);
    expect(balance).toBeHbar(Hbar.from(1));
  });

  it("should match account IDs", () => {
    const accountId = AccountId.fromString("0.0.1234");

    expect(accountId).toBeAccountId("0.0.1234");
    expect(accountId).toHaveShard(0);
    expect(accountId).toHaveRealm(0);
    expect(accountId).toHaveAccount(1234);
  });

  it("should match transaction status", () => {
    const receipt = { status: Status.Success };

    expect(receipt).toHaveStatus("SUCCESS");
    expect(receipt).toSucceed();
  });

  it("should match transaction receipts", () => {
    const receipt = {
      status: Status.Success,
      accountId: AccountId.fromString("0.0.1234"),
      tokenId: TokenId.fromString("0.0.5678"),
    };

    expect(receipt).toSucceedWith({
      accountId: "0.0.1234",
      tokenId: "0.0.5678",
    });
  });

  it("should validate errors", () => {
    const error = new HederaTransactionError(
      "INSUFFICIENT_PAYER_BALANCE",
      "account 0.0.1001 has insufficient balance",
    );

    expect(error).toBeHieroError("INSUFFICIENT_PAYER_BALANCE");
    expect(error).toHaveErrorCode(12);
  });

  it("should match token info", () => {
    const tokenInfo = {
      tokenId: TokenId.fromString("0.0.1000"),
      name: "Test Token",
      symbol: "TST",
      decimals: 8,
      totalSupply: 1_000_000n,
    };

    expect(tokenInfo).toBeToken({
      name: "Test Token",
      symbol: "TST",
      decimals: 8,
    });
  });
});
```

### 4. State Snapshots - Deterministic Test Isolation

```typescript
import { createTestKit } from "@hiero/testkit";

describe("State Snapshots", () => {
  const kit = createTestKit();

  it("test 1 - creates account", async () => {
    const account = await kit.createAccount();
    expect(kit.accounts.has(account.accountId)).toBe(true);
  });

  it("test 2 - isolated from test 1", async () => {
    // Each test gets fresh state
    expect(kit.accounts.count()).toBe(0);

    const account = await kit.createAccount();
    expect(kit.accounts.count()).toBe(1);
  });

  it("test 3 - can snapshot and restore", async () => {
    // Create some state
    await kit.createAccount();
    await kit.createToken();

    const snapshot = await kit.snapshot();

    // Modify state
    await kit.createAccount();
    expect(kit.accounts.count()).toBe(3);

    // Restore to snapshot
    await kit.restore(snapshot);
    expect(kit.accounts.count()).toBe(2);
  });
});
```

### 5. Network Control - Programmatic Local Node

```typescript
import { TestNetwork } from "@hiero/testkit";

describe("Integration Tests", () => {
  let network: TestNetwork;

  beforeAll(async () => {
    network = await TestNetwork.start({
      accounts: 10,
      ports: { consensus: 50211, mirror: 5600 },
      features: ["auto-faucet", "fast-consensus"],
    });
  });

  afterAll(async () => {
    await network.stop();
  });

  it("should connect to local network", async () => {
    const client = network.client;
    const account = network.accounts[0];

    const balance = await new AccountBalanceQuery().setAccountId(account.accountId).execute(client);

    expect(balance.hbars.toBigNumber().toNumber()).toBeGreaterThan(0);
  });

  it("should reset network between tests", async () => {
    await network.reset();

    // All accounts deleted, ledger cleared
    expect(network.accounts).toHaveLength(0);
  });
});
```

### 6. Coverage Integration - Ready-to-Use Configs

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";
import { hieroTestkit } from "@hiero/testkit/vitest/plugin";

export default defineConfig({
  plugins: [hieroTestkit()],
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      // Pre-configured exclusions for test files
      exclude: [...hieroTestkit.defaultCoverageExcludes],
    },
  },
});
```

### 7. VSCode Debug Configuration

```json
// .vscode/launch.json - Generated by @hiero/testkit init
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Current Hiero Test",
      "program": "${workspaceFolder}/node_modules/.bin/vitest",
      "args": ["run", "${relativeFile}"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen",
      "smartStep": true,
      "skipFiles": ["<node_internals>/**", "**/node_modules/**"]
    },
    {
      "type": "node",
      "request": "launch",
      "name": "Debug All Hiero Tests",
      "program": "${workspaceFolder}/node_modules/.bin/vitest",
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

---

## Implementation Roadmap

### Phase 1: Core Mock Client (Days 1-7)

**Deliverables:**

- `MockClient` class implementing `Client` interface
- Mock transaction execution (no network calls)
- Mock query responses
- In-memory state tracking
- Time freezing utilities

**API:**

```typescript
class MockClient implements Client {
  // Mock state
  readonly accounts: MockAccountStore;
  readonly tokens: MockTokenStore;
  readonly contracts: MockContractStore;
  readonly topics: MockTopicStore;

  // Time control
  setTime(timestamp: Date): void;
  freezeTime(): void;
  advanceTime(duration: Duration): void;

  // Spying
  readonly execute: jest.Mock<Function>;
  readonly setOperator: jest.Mock<Function>;
}
```

### Phase 2: Test Fixtures (Days 8-12)

**Deliverables:**

- Pre-configured test accounts
- Token creation helpers
- Contract deployment helpers
- Topic creation helpers
- Fixture reset utilities

**API:**

```typescript
const fixtures = {
  accounts: (count: number) => TestAccount[],
  account: (config?: AccountConfig) => TestAccount,
  token: (config: TokenConfig) => TokenFixture,
  contract: (bytecode: string, abi: Abi) => ContractFixture,
  topic: (config?: TopicConfig) => TopicFixture,
  deploy: (client: Client) => Promise<void>
};
```

### Phase 3: Custom Matchers (Days 13-16)

**Deliverables:**

- Jest custom matchers
- Vitest custom matchers
- TypeScript type narrowing
- Pretty error messages

**Matchers:**

- `toBeHbar(amount)`
- `toBeAccountId(id)`
- `toHaveStatus(status)`
- `toSucceed()`
- `toFailWith(error)`
- `toBeHieroError(code)`
- `toHaveEmitted(event)`
- `toHaveTokenBalance(balance)`
- `toBeValidTx()`

### Phase 4: State Snapshots (Days 17-20)

**Deliverables:**

- Snapshot creation
- Snapshot restoration
- Automatic per-test isolation
- Manual snapshot management

**API:**

```typescript
interface TestKit {
  snapshot(): Promise<Snapshot>;
  restore(snapshot: Snapshot): Promise<void>;
  reset(): Promise<void>;
}
```

### Phase 5: Network Control (Days 21-24)

**Deliverables:**

- Local node lifecycle management
- Docker integration
- Port management
- Health checks
- Automatic reset between tests

**API:**

```typescript
class TestNetwork {
  static start(options?: NetworkOptions): Promise<TestNetwork>;
  stop(): Promise<void>;
  reset(): Promise<void>;

  readonly client: Client;
  readonly accounts: TestAccount[];
  readonly ports: NetworkPorts;
}
```

### Phase 6: Developer Tools (Days 25-28)

**Deliverables:**

- CLI tool (`hiero-testkit init`)
- VSCode configurations
- Coverage presets
- Example test suite

**CLI:**

```bash
npx @hiero/testkit init
npx @hiero/testkit generate:mock <contract>
npx @hiero/testkit validate
```

### Phase 7: Documentation & Examples (Days 29-35)

**Deliverables:**

- README with quickstart
- API reference
- Example test suites
- Migration guide (from raw SDK tests)
- Contribution guidelines

---

## Unique Selling Points

### 1. Zero Network Dependency for Unit Tests

```typescript
// Before: 30+ seconds per test (network)
// After: <10ms per test (in-memory)

it("transfers HBAR", async () => {
  const mock = mockClient();
  // ... test runs in milliseconds
});
```

### 2. Deterministic Test Outcomes

No more flaky tests due to:

- Faucet rate limits
- Network delays
- Shared ledger state
- Port conflicts
- Docker issues

### 3. Type-Safe Mocking

```typescript
// TypeScript knows the exact types
const mock = mockClient();
mock.execute.mockResolvedValueOnce({
  status: Status.Success,
  accountId: AccountId.fromString("0.0.1234"),
  // Fully typed!
});
```

### 4. IDE Integration

- VSCode debug configurations included
- Auto-completion for matchers
- Quick fixes for common issues
- Test file templates

### 5. Works with Existing Tests

Drop-in replacement for real `Client`:

```typescript
// Before
const client = Client.forTestnet();

// After (in tests only)
const client = mockClient().client;

// All existing code works unchanged
const tx = await new TransferTransaction().addHbarTransfer(sender, Hbar.from(100)).execute(client);
```

---

## Competitive Analysis

| Feature          | @hiero/testkit | viem (Ethereum)   | Hardhat      | Current Hiero  |
| ---------------- | -------------- | ----------------- | ------------ | -------------- |
| Mock Client      | ✅             | ✅                | ✅           | ❌             |
| Custom Matchers  | ✅             | ✅                | ✅           | ❌             |
| Test Fixtures    | ✅             | ⚠️ Community      | ✅           | ❌             |
| State Snapshots  | ✅             | ✅                | ✅           | ❌             |
| Network Control  | ✅             | ⚠️ Anvil separate | ✅           | ⚠️ Manual only |
| VSCode Config    | ✅             | ❌ Manual         | ⚠️ Community | ❌             |
| TypeScript First | ✅             | ✅                | ⚠️           | ✅             |
| Hiero Specific   | ✅             | ❌                | ❌           | N/A            |

---

## Success Metrics

### For Hackathon Judging

**Code Quality (30%)**

- ✅ TypeScript strict mode
- ✅ 90%+ test coverage (ironically, testing library must be well-tested)
- ✅ Zero ESLint warnings
- ✅ Full type safety

**Documentation (25%)**

- ✅ README with <5 min quickstart
- ✅ API reference with examples
- ✅ JSDoc on all exports
- ✅ 3+ complete example suites

**Developer Experience (25%)**

- ✅ One-line setup (`npm install @hiero/testkit`)
- ✅ Drop-in replacement pattern
- ✅ Helpful error messages
- ✅ Works with Vitest AND Jest

**Innovation (20%)**

- ✅ First testing library for Hiero
- ✅ Solves documented ecosystem gaps
- ✅ Brings Hiero to parity with Ethereum tooling
- ✅ Enables TDD workflows

### Post-Hackathon Adoption Targets

**3 Months:**

- 100+ GitHub stars
- 500+ weekly downloads
- 10+ projects using it
- Mentioned in official docs

**6 Months:**

- 500+ GitHub stars
- 2,000+ weekly downloads
- 50+ projects using it
- Standard for Hiero testing

---

## Submission Checklist

- [ ] Public GitHub repository with Apache 2.0 license
- [ ] Clean library API with intuitive interfaces
- [ ] Unit tests for all modules (>90% coverage)
- [ ] Integration tests with real Hiero SDK
- [ ] CI/CD (GitHub Actions)
- [ ] README with installation and quickstart
- [ ] Contributing guidelines (CONTRIBUTING.md)
- [ ] API documentation (TypeDoc)
- [ ] Example test suites (3+ scenarios)
- [ ] VSCode configuration templates
- [ ] Coverage presets (v8, nyc)
- [ ] CLI tool (`init` command)
- [ ] Vitest plugin
- [ ] Jest plugin
- [ ] Demo video showing before/after comparison

---

## Demo Strategy

### Live Demo: "The Same Test, Two Ways"

**Part 1: The Old Way (2 minutes)**

1. Start local node manually (Docker, wait...)
2. Write test that hits actual network
3. Show flakiness (fauce timeout, network delay)
4. Show 30+ second execution time

**Part 2: The New Way (1 minute)**

1. Install @hiero/testkit
2. Write same test with mock client
3. Show <10ms execution time
4. Run 100 tests in <1 second

**Part 3: Feature Tour (2 minutes)**

1. Custom matchers showing readable assertions
2. State snapshots showing test isolation
3. Network control for integration tests
4. VSCode debugging in action

**Total Time: 5 minutes of impact**

---

## Why This Beats Other Proposals

| Criteria                      | @hiero/testkit   | Mirror Client         | Scheduled Tx       | React Hooks        |
| ----------------------------- | ---------------- | --------------------- | ------------------ | ------------------ |
| **Official Example?**         | ❌ No            | ❌ Yes (duplicate)    | ❌ Yes (duplicate) | ❌ Yes (duplicate) |
| **Existing Solutions?**       | ❌ Zero          | ⚠️ Old wrapper (2021) | ❌ Zero            | ⚠️ Partial libs    |
| **Pain Point Severity**       | 🔥 Critical      | 🟡 High               | 🟡 Medium          | 🟡 Medium          |
| **Adoption Potential**        | ✅ Every project | ✅ Most projects      | ⚠️ Niche           | ✅ Frontend only   |
| **Implementation Complexity** | Medium           | Medium                | Medium             | Medium             |
| **Differentiation**           | ✅ Clear         | ⚠️ Feature parity     | ⚠️ Feature parity  | ⚠️ Feature parity  |

---

## Conclusion

**@hiero/testkit** is the right choice because:

1. **Solves the #1 Undocumented Pain Point** - No testing tools exist
2. **Zero Overlap** - Not in official examples, not in existing proposals
3. **Universal Appeal** - Every Hiero developer needs testing
4. **Clear Value Prop** - 1000x faster tests, deterministic outcomes
5. **Ecosystem Parity** - Brings Hiero to parity with Ethereum tooling

The library is achievable within the hackathon timeline, has a clear adoption path, and will genuinely improve the developer experience for the entire Hiero ecosystem.

---

_Proposal compiled from extensive research including:_

- _GitHub code search for existing patterns_
- _Deep research on testing pain points_
- _Analysis of modern Web3 testing frameworks (viem, wagmi, Hardhat)_
- _Review of official Hiero SDK and tooling_
- _Study of hiero-enterprise-java reference implementation_

_Last Updated: March 3, 2026_

---

# @hieco/sdk ruthless audit + redesign

## 1. Consolidation manifest

### Delete

- `packages/sdk/src/builders/*`
  - Rationale: fluent builders duplicate existing param objects, add new concepts without reducing required knowledge, and are used nowhere in the SDK internals. They increase API surface and cognitive load.
- `packages/sdk/src/actions/decorators.ts`
  - Rationale: thin pass-through wrappers around `HieroClient` methods. They fragment discovery without adding capabilities.
- `packages/sdk/src/default.ts` (`configureHiero`, `hiero`, `getHieroClient`, `resetHiero`)
  - Rationale: global singleton encourages hidden state and makes client lifecycle implicit. Replace with explicit `hiero()` factory and optional memoized default via user-land.
- `packages/sdk/src/events/emitter.ts` and `packages/sdk/src/middleware/*`
  - Rationale: custom middleware/event system is extra infrastructure in a small SDK. It adds ceremony (registering listeners) and makes execution flow harder to reason about. Replace with per-call hooks and structured error objects.
- `packages/sdk/src/flows/scheduled-transaction-flow.ts`
  - Rationale: a bespoke flow object for a single feature. Move to a tiny, direct `schedule` namespace with explicit helpers (`create`, `sign`, `wait`), no implicit state.
- `packages/sdk/src/environment.ts`
  - Rationale: redundant in modern runtimes and used only for env config. Replace with direct checks where needed.

### Simplify / merge

- `packages/sdk/src/pipeline/*`
  - Collapse `resolver.ts` + `executor.ts` into a single `transactions.ts` with `buildTx` and `submitTx` functions. Current separation hides control flow and introduces heavy switch logic.
- `packages/sdk/src/types.ts`
  - Split into focused modules: `types/client.ts`, `types/params.ts`, `types/errors.ts`, `types/results.ts`.
  - Remove `Mutable` and builder-related types.
  - Replace `TransactionType` string union with a discriminated action map to reduce duplication.
- `packages/sdk/src/actions/*`
  - Merge into domain modules with explicit names: `accounts`, `tokens`, `hcs`, `contracts`, `files`, `schedules`.
  - Eliminate per-action wrappers that only forward to `executeTransaction`.
- `packages/sdk/src/client.ts`
  - Reduce 40+ methods on a single class by introducing domain namespaces on the client (`client.tokens.create`, `client.hcs.submit`, etc.). This improves discovery and autocomplete.

### Consolidate API surface

- Single entrypoint: `import { hiero } from "@hieco/sdk"`.
- Remove overloads for `createHieroClient` vs `hiero()`; use one factory.
- Replace `withSigner`/`withoutSigner` with `client.with({ signer })` and `client.as(signer)`.
- Replace `watchTopicMessages` with `client.hcs.watch(topicId, handler, options)`.

## 2. Reimagined API proposal

### Design goals

- One obvious path per operation.
- Minimum setup: no required generics, no manual `Hbar`/`Long` in user code.
- Autocomplete-first: discoverable via `client.{accounts,tokens,hcs,contracts,files,schedules}`.
- Errors are actionable: structured error objects with `code`, `hint`, `transactionId`.

### New public surface (proposed)

```ts
import { hiero } from "@hieco/sdk";

const client = hiero({
  network: "testnet",
  operator: "0.0.123",
  key: process.env.OPERATOR_KEY,
});

await client.accounts.transfer({
  from: "0.0.123",
  to: "0.0.456",
  hbar: 10,
});

await client.tokens.create({
  name: "MyToken",
  symbol: "MYT",
  supply: 1_000_000,
  treasury: "0.0.123",
});

const receipt = await client.contracts.call({
  id: "0.0.789",
  fn: "balanceOf",
  args: ["0.0.456"],
  returns: "uint256",
});

const stop = client.hcs.watch("0.0.9001", (msg) => {
  console.log(msg.json());
});
```

### Before / after examples

#### Transfers

Before:

```ts
const result = await hiero.transfer({
  from: "0.0.123",
  to: "0.0.456",
  amount: 10,
});
```

After:

```ts
await client.accounts.transfer({
  from: "0.0.123",
  to: "0.0.456",
  hbar: 10,
});
```

#### Scheduled transactions

Before:

```ts
const flow = hiero().scheduledTransaction({
  create: { transaction: { type: "transfer", params } },
});
const created = await flow.create();
await flow.sign({ signer });
await flow.waitForExecuted();
```

After:

```ts
const schedule = await client.schedules.create({
  tx: client.accounts.transfer.tx({ from, to, hbar: 5 }),
});

await client.schedules.sign(schedule.id, { signer });
await client.schedules.wait(schedule.id);
```

#### Contracts

Before:

```ts
await hiero.executeContract({
  contractId: "0.0.789",
  functionName: "transfer",
  functionParams: { types: ["address", "uint256"], values: ["0.0.456", 100] },
});
```

After:

```ts
await client.contracts.execute({
  id: "0.0.789",
  fn: "transfer",
  args: ["0.0.456", 100],
});
```

### API structure (proposed)

- `hiero(config)` -> returns `HieroClient`
- `client.accounts.*`
  - `transfer`, `create`, `update`, `delete`, `allowances`
- `client.tokens.*`
  - `create`, `mint`, `burn`, `transfer`, `transferNft`, `associate`, `dissociate`, `freeze`, `unfreeze`, `pause`, `unpause`, `wipe`, `update`, `fees`
- `client.hcs.*`
  - `create`, `update`, `delete`, `submit`, `watch`
- `client.contracts.*`
  - `deploy`, `execute`, `call`, `update`, `delete`
- `client.files.*`
  - `create`, `append`, `update`, `delete`
- `client.schedules.*`
  - `create`, `sign`, `delete`, `info`, `wait`
- `client.mirror.*`
  - unchanged mirror client, but aligned naming with `client.*`

## 3. Magic moments

### Telepathic arguments

- `accounts.transfer({ to, hbar })` infers `from` from `operator` or signer.
- `tokens.transfer({ token, to, amount })` infers `from` the operator.
- `contracts.call({ id, fn, args })` infers gas defaults based on ABI signatures.

### Smart tx builders without builders

- `client.accounts.transfer.tx({...})` returns a typed transaction descriptor usable for schedules.
- `client.schedules.create({ tx })` accepts any typed tx, no manual `type` string.

### Ergonomic amounts

- Accept `number | string | bigint` everywhere; convert internally.
- `hbar: 10` and `tokens: 100` are normalized without `Hbar` or `Long` in user code.

### Structured, actionable errors

- Standard error shape:
  - `code` (stable enum), `message`, `hint`, `transactionId`, `details`
- Example: `INSUFFICIENT_PAYER_BALANCE` includes current balance, requested amount, and suggested fee tweak.

### Autocomplete-first discovery

- Domain namespaces are the primary entrypoints.
- Every action exists in exactly one place.

## 4. Migration path

### Mechanical mapping

- `createHieroClient(...)` -> `hiero(...)`
- `hiero()` -> `hiero()` (same, but no global config)
- `client.transfer(...)` -> `client.accounts.transfer(...)`
- `client.createToken(...)` -> `client.tokens.create(...)`
- `client.submitMessage(...)` -> `client.hcs.submit(...)`
- `client.watchTopicMessages(...)` -> `client.hcs.watch(...)`
- `client.scheduledTransaction(...)` -> `client.schedules.create(...)` + `client.schedules.sign(...)`

### Compatibility layer (optional)

- Keep old method names for one minor release as thin wrappers.
- Emit deprecation warnings once per method via `console.warn` when `logLevel !== "none"`.

### Incremental adoption strategy

- Step 1: Switch to `hiero()` factory and `client.accounts.*` etc.
- Step 2: Replace scheduled flow with `client.schedules.*`.
- Step 3: Remove builders and decorators imports.

### Zero breaking changes for mirror

- `client.mirror.*` stays intact and keeps existing types.
