import {
  AccountBalance,
  AccountBalanceQuery,
  AccountId,
  AccountInfo,
  AccountInfoQuery,
  AccountRecordsQuery,
  Client,
  LedgerId,
  PublicKey,
  Query,
  SignerSignature,
  Transaction,
  TransactionId,
  TransactionReceipt,
  TransactionReceiptQuery,
  TransactionRecord,
  TransactionRecordQuery,
  TransactionResponse,
  type Key,
  type TransactionResponseJSON,
  type Executable,
  type Signer,
} from "@hiero-ledger/sdk";
import { proto } from "@hiero-ledger/proto";
import type SignClient from "@walletconnect/sign-client";
import type { SessionTypes } from "@walletconnect/types";
import { createWalletError } from "./errors";
import type { WalletChain } from "./types";

const HEDERA_SIGN_MESSAGE = "hedera_signMessage";
const HEDERA_SIGN_QUERY = "hedera_signAndExecuteQuery";
const HEDERA_SIGN_TRANSACTION = "hedera_signTransaction";
const HEDERA_EXECUTE_TRANSACTION = "hedera_signAndExecuteTransaction";

const PREFIX = "\u0019Hedera Signed Message:\n";

function encodeBase64(bytes: Uint8Array): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(bytes).toString("base64");
  }

  let binary = "";
  for (const value of bytes) {
    binary += String.fromCharCode(value);
  }
  return btoa(binary);
}

function decodeBase64(value: string): Uint8Array {
  if (typeof Buffer !== "undefined") {
    return new Uint8Array(Buffer.from(value, "base64"));
  }

  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function encodeText(value: string): Uint8Array {
  return new TextEncoder().encode(value);
}

function toUtf8(value: Uint8Array): string {
  return new TextDecoder().decode(value);
}

function transactionBodyToBytes(body: proto.ITransactionBody): Uint8Array {
  return proto.TransactionBody.encode(body).finish();
}

function parseSignatureMap(value: string): proto.SignatureMap {
  return proto.SignatureMap.decode(decodeBase64(value));
}

function transactionToBody(
  transaction: Transaction,
  nodeAccountId?: AccountId | null,
): proto.ITransactionBody {
  const bytes = transaction.toBytes();
  const list = proto.TransactionList.decode(bytes);
  const first = list.transactionList[0];

  if (!first) {
    throw createWalletError(
      "SIGNER_UNAVAILABLE",
      "Transaction bytes did not include a transaction body.",
    );
  }

  if (first.signedTransactionBytes) {
    const signed = proto.SignedTransaction.decode(first.signedTransactionBytes);
    const body = proto.TransactionBody.decode(signed.bodyBytes);

    if (!nodeAccountId) {
      return body;
    }

    return {
      ...body,
      nodeAccountID: nodeAccountId._toProtobuf(),
    };
  }

  if (!first.bodyBytes) {
    throw createWalletError("SIGNER_UNAVAILABLE", "Transaction bytes did not include body bytes.");
  }

  const body = proto.TransactionBody.decode(first.bodyBytes);

  if (!nodeAccountId) {
    return body;
  }

  return {
    ...body,
    nodeAccountID: nodeAccountId._toProtobuf(),
  };
}

function mergeSignatureMap(
  transaction: Transaction,
  signatureMap: proto.SignatureMap,
): Transaction {
  const bytes = transaction.toBytes();
  const list = proto.TransactionList.decode(bytes);
  const transactionList = list.transactionList.map((item) => {
    if (item.signedTransactionBytes) {
      const signed = proto.SignedTransaction.decode(item.signedTransactionBytes);
      const merged = [...(signed.sigMap?.sigPair ?? []), ...(signatureMap.sigPair ?? [])];

      return {
        signedTransactionBytes: proto.SignedTransaction.encode({
          bodyBytes: signed.bodyBytes,
          sigMap: proto.SignatureMap.create({
            sigPair: merged,
          }),
        }).finish(),
      };
    }

    return {
      ...item,
      sigMap: proto.SignatureMap.create({
        sigPair: [...(item.sigMap?.sigPair ?? []), ...(signatureMap.sigPair ?? [])],
      }),
    };
  });

  return Transaction.fromBytes(
    proto.TransactionList.encode({
      transactionList,
    }).finish(),
  );
}

function createNetworkClient(chain: WalletChain): Client {
  switch (chain.network) {
    case "mainnet":
      return Client.forMainnet();
    case "testnet":
      return Client.forTestnet();
    case "previewnet":
      return Client.forPreviewnet();
    case "devnet":
      return Client.forNetwork({ "127.0.0.1:50211": new AccountId(3) });
    case "custom":
      if (!chain.rpcUrl) {
        throw createWalletError("CHAIN_UNSUPPORTED", `Chain ${chain.id} requires an rpcUrl.`);
      }
      return Client.forNetwork({ [chain.rpcUrl]: new AccountId(3) });
  }
}

function parseQueryResponse(query: Query<unknown>, response: string): unknown {
  if (query instanceof AccountRecordsQuery) {
    return response
      .split(",")
      .filter((value) => value.length > 0)
      .map((value) => TransactionRecord.fromBytes(decodeBase64(value)));
  }

  const bytes = decodeBase64(response);

  if (query instanceof AccountBalanceQuery) {
    return AccountBalance.fromBytes(bytes);
  }
  if (query instanceof AccountInfoQuery) {
    return AccountInfo.fromBytes(bytes);
  }
  if (query instanceof TransactionReceiptQuery) {
    return TransactionReceipt.fromBytes(bytes);
  }
  if (query instanceof TransactionRecordQuery) {
    return TransactionRecord.fromBytes(bytes);
  }

  throw createWalletError("SIGNER_UNAVAILABLE", "Unsupported Hedera query response.");
}

export class WalletConnectHederaSigner implements Signer {
  readonly #accountId: AccountId;
  readonly #chain: WalletChain;
  readonly #client: SignClient;
  readonly #topic: string;
  readonly #networkClient: Client;

  constructor(input: {
    readonly accountId: string;
    readonly chain: WalletChain;
    readonly client: SignClient;
    readonly topic: string;
  }) {
    this.#accountId = AccountId.fromString(input.accountId);
    this.#chain = input.chain;
    this.#client = input.client;
    this.#topic = input.topic;
    this.#networkClient = createNetworkClient(input.chain);
  }

  async #request<T>(method: string, params: Record<string, unknown>): Promise<T> {
    return this.#client.request<T>({
      topic: this.#topic,
      chainId: this.#chain.id,
      request: {
        method,
        params,
      },
    });
  }

  getAccountId(): AccountId {
    return this.#accountId;
  }

  getAccountKey(): Key {
    throw createWalletError("SIGNER_UNAVAILABLE", "Wallet signers do not expose the account key.");
  }

  getLedgerId(): LedgerId {
    return LedgerId.fromString(this.#chain.ledgerId);
  }

  getNetwork(): { [key: string]: string | AccountId } {
    return this.#networkClient.network;
  }

  getMirrorNetwork(): string[] {
    return this.#networkClient.mirrorNetwork;
  }

  async sign(messages: Uint8Array[]): Promise<SignerSignature[]> {
    const payload = messages[0];
    if (!payload) {
      return [];
    }

    const prefixed = encodeText(`${PREFIX}${payload.length}${toUtf8(payload)}`);
    const result = await this.#request<{ signatureMap: string }>(HEDERA_SIGN_MESSAGE, {
      signerAccountId: `${this.#chain.id}:${this.#accountId.toString()}`,
      message: toUtf8(prefixed),
    });
    const signatureMap = parseSignatureMap(result.signatureMap);
    const first = signatureMap.sigPair[0];

    if (!first) {
      throw createWalletError("SIGNER_UNAVAILABLE", "Wallet returned an empty signature map.");
    }

    const publicKeyPrefix = first.pubKeyPrefix;
    if (!publicKeyPrefix) {
      throw createWalletError(
        "SIGNER_UNAVAILABLE",
        "Wallet returned a signature pair without a public key prefix.",
      );
    }

    const signature = first.ed25519 ?? first.ECDSASecp256k1;
    if (!signature) {
      throw createWalletError(
        "SIGNER_UNAVAILABLE",
        "Wallet returned a signature pair without signature bytes.",
      );
    }

    return [
      new SignerSignature({
        accountId: this.#accountId,
        publicKey: PublicKey.fromBytes(publicKeyPrefix),
        signature,
      }),
    ];
  }

  getAccountBalance(): Promise<AccountBalance> {
    return this.call(new AccountBalanceQuery().setAccountId(this.#accountId));
  }

  getAccountInfo(): Promise<AccountInfo> {
    return this.call(new AccountInfoQuery().setAccountId(this.#accountId));
  }

  getAccountRecords(): Promise<TransactionRecord[]> {
    return this.call(new AccountRecordsQuery().setAccountId(this.#accountId));
  }

  async signTransaction<T extends Transaction>(transaction: T): Promise<T> {
    if (!transaction.isFrozen()) {
      transaction.freezeWith(this.#networkClient);
    }

    const nodeAccountId = transaction.nodeAccountIds?.[0] ?? null;
    const body = transactionToBody(transaction, nodeAccountId);
    const result = await this.#request<{ signatureMap: string }>(HEDERA_SIGN_TRANSACTION, {
      signerAccountId: `${this.#chain.id}:${this.#accountId.toString()}`,
      transactionBody: encodeBase64(transactionBodyToBytes(body)),
    });

    return mergeSignatureMap(transaction, parseSignatureMap(result.signatureMap)) as T;
  }

  async checkTransaction<T extends Transaction>(transaction: T): Promise<T> {
    return transaction;
  }

  async populateTransaction<T extends Transaction>(transaction: T): Promise<T> {
    if (!transaction.transactionId) {
      transaction.setTransactionId(TransactionId.generate(this.#accountId));
    }
    return transaction;
  }

  async call<RequestT, ResponseT, OutputT>(
    request: Executable<RequestT, ResponseT, OutputT>,
  ): Promise<OutputT> {
    if (request instanceof Transaction && !(request instanceof TransactionReceiptQuery)) {
      const result = await this.#request<TransactionResponseJSON>(HEDERA_EXECUTE_TRANSACTION, {
        signerAccountId: `${this.#chain.id}:${this.#accountId.toString()}`,
        transactionList: encodeBase64(request.toBytes()),
      });

      return TransactionResponse.fromJSON(result) as OutputT;
    }

    const query =
      request instanceof TransactionReceiptQuery ? request : Query.fromBytes(request.toBytes());
    const result = await this.#request<{ response: string }>(HEDERA_SIGN_QUERY, {
      signerAccountId: `${this.#chain.id}:${this.#accountId.toString()}`,
      query: encodeBase64(query.toBytes()),
    });

    return parseQueryResponse(query, result.response) as OutputT;
  }

  async close(session?: SessionTypes.Struct): Promise<void> {
    const active = session ?? this.#client.session.get(this.#topic);
    if (!active) {
      return;
    }

    await this.#client.disconnect({
      topic: active.topic,
      reason: {
        code: 6000,
        message: "User disconnected.",
      },
    });
  }
}
