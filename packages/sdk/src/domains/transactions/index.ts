import {
  AccountAllowanceApproveTransaction,
  AccountCreateTransaction,
  AccountDeleteTransaction,
  AccountUpdateTransaction,
  Client,
  ContractCallQuery,
  ContractCreateTransaction,
  ContractDeleteTransaction,
  ContractExecuteTransaction,
  ContractFunctionParameters,
  ContractUpdateTransaction,
  FileAppendTransaction,
  FileCreateTransaction,
  FileDeleteTransaction,
  FileUpdateTransaction,
  Hbar,
  PrivateKey,
  ReceiptStatusError,
  ScheduleCreateTransaction,
  ScheduleDeleteTransaction,
  ScheduleSignTransaction,
  TokenAssociateTransaction,
  TokenBurnTransaction,
  TokenCreateTransaction,
  TokenDeleteTransaction,
  TokenDissociateTransaction,
  TokenFeeScheduleUpdateTransaction,
  TokenFreezeTransaction,
  TokenGrantKycTransaction,
  TokenMintTransaction,
  TokenPauseTransaction,
  TokenRevokeKycTransaction,
  TokenSupplyType,
  TokenType,
  TokenUnfreezeTransaction,
  TokenUnpauseTransaction,
  TokenUpdateTransaction,
  TokenWipeTransaction,
  TopicCreateTransaction,
  TopicDeleteTransaction,
  TopicMessageSubmitTransaction,
  TopicUpdateTransaction,
  TransferTransaction,
  Long,
  CustomFixedFee,
  CustomFractionalFee,
  CustomRoyaltyFee,
  FeeAssessmentMethod,
  NftId,
  AccountId,
  Timestamp,
  FileInfoQuery,
  FileContentsQuery,
  TransactionRecordQuery,
  TransactionId,
  TransactionReceiptQuery,
  AccountRecordsQuery,
  ContractByteCodeQuery,
  TokenNftInfoQuery,
  MirrorNodeContractCallQuery,
  MirrorNodeContractEstimateQuery,
  ContractId,
} from "@hiero-ledger/sdk";
import type { Signer as HieroSigner } from "@hiero-ledger/sdk";
import type { EntityId } from "@hieco/types";
import { asEntityId } from "@hieco/mirror-shared";
import type {
  TransactionDescriptor,
  FunctionParamsConfig,
  CustomFeeParams,
  CustomFixedFeeParams,
} from "../../shared/params.ts";
import type {
  TransactionReceiptData,
  AccountRecordsData,
  ContractBytecodeData,
  TokenNftInfoData,
  MirrorContractCallData,
  MirrorContractEstimateData,
} from "../../shared/results-shapes.ts";
import type { Result } from "../../shared/results.ts";
import { err, ok } from "../../shared/results.ts";
import { createError } from "../../shared/errors.ts";
import { toAmountString } from "../../shared/utils.ts";

export type SigningContext =
  | { readonly kind: "operator"; readonly key: string }
  | { readonly kind: "signer"; readonly signer: HieroSigner };

export interface SubmitContext {
  readonly client: Client;
  readonly signing: SigningContext;
  readonly operator?: EntityId;
}

const INSUFFICIENT_BALANCE_STATUSES = new Set([
  "INSUFFICIENT_ACCOUNT_BALANCE",
  "INSUFFICIENT_PAYER_BALANCE",
]);

const INVALID_SIGNATURE_STATUSES = new Set(["INVALID_SIGNATURE", "KEY_NOT_PROVIDED"]);

function toHbar(amount: string | number | bigint): Hbar {
  return new Hbar(typeof amount === "bigint" ? amount.toString() : amount);
}

function resolveKeyParam(value: string | true, operatorKey?: string, signing?: SigningContext) {
  if (value === true) {
    if (signing?.kind === "signer") {
      const accountKey = signing.signer.getAccountKey?.();
      if (!accountKey) {
        throw new Error("Signer account key required when key param is true");
      }
      return accountKey;
    }

    if (!operatorKey) {
      throw new Error("Operator key required when key param is true");
    }
    return PrivateKey.fromStringDer(operatorKey).publicKey;
  }
  return PrivateKey.fromStringDer(value).publicKey;
}

function buildCustomFee(
  fee: CustomFeeParams,
): CustomFixedFee | CustomFractionalFee | CustomRoyaltyFee {
  if (fee.type === "fixed") {
    const f = new CustomFixedFee()
      .setAmount(Number(toAmountString(fee.amount)))
      .setFeeCollectorAccountId(fee.feeCollectorAccountId);
    if (fee.denominatingTokenId) f.setDenominatingTokenId(fee.denominatingTokenId);
    return f;
  }

  if (fee.type === "fractional") {
    const f = new CustomFractionalFee()
      .setNumerator(fee.numerator)
      .setDenominator(fee.denominator)
      .setFeeCollectorAccountId(fee.feeCollectorAccountId);
    if (fee.min !== undefined) f.setMin(fee.min);
    if (fee.max !== undefined) f.setMax(fee.max);
    if (fee.netOfTransfers !== undefined) {
      f.setAssessmentMethod(
        fee.netOfTransfers ? FeeAssessmentMethod.Inclusive : FeeAssessmentMethod.Exclusive,
      );
    }
    return f;
  }

  const f = new CustomRoyaltyFee()
    .setNumerator(fee.numerator)
    .setDenominator(fee.denominator)
    .setFeeCollectorAccountId(fee.feeCollectorAccountId);
  if (fee.fallbackAmount !== undefined) {
    const fallback = new CustomFixedFee().setAmount(Number(toAmountString(fee.fallbackAmount)));
    if (fee.fallbackDenominatingTokenId) {
      fallback.setDenominatingTokenId(fee.fallbackDenominatingTokenId);
    }
    f.setFallbackFee(fallback);
  }
  return f;
}

function buildTopicCustomFee(fee: CustomFixedFeeParams): CustomFixedFee {
  const f = new CustomFixedFee()
    .setAmount(Number(toAmountString(fee.amount)))
    .setFeeCollectorAccountId(fee.feeCollectorAccountId);
  if (fee.denominatingTokenId) f.setDenominatingTokenId(fee.denominatingTokenId);
  return f;
}

function hexToBytes(hex: string): Uint8Array {
  const cleanHex = hex.startsWith("0x") ? hex.slice(2) : hex;
  const bytes = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(cleanHex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

export function buildContractFunctionParameters(
  config: FunctionParamsConfig,
): ContractFunctionParameters {
  const cfp = new ContractFunctionParameters();
  for (let i = 0; i < config.types.length; i++) {
    const solType = config.types[i];
    const val = config.values[i];
    if (!solType) continue;
    addSolidityParam(cfp, solType, val);
  }
  return cfp;
}

export function buildContractFunctionParametersFromArgs(
  args: ReadonlyArray<unknown> | undefined,
): ContractFunctionParameters | undefined {
  if (!args || args.length === 0) return undefined;
  const cfp = new ContractFunctionParameters();
  for (const arg of args) {
    addArg(cfp, arg);
  }
  return cfp;
}

function toInt64Param(val: unknown): number | Long {
  if (typeof val === "number") return val;
  if (typeof val === "bigint") return Long.fromString(val.toString());
  if (typeof val === "string") return Long.fromString(val);
  if (val instanceof Long) return val;
  throw new Error("Unsupported int64 parameter type");
}

function addArg(cfp: ContractFunctionParameters, val: unknown): void {
  if (val === undefined || val === null) {
    throw new Error("Contract argument value is required");
  }
  if (typeof val === "string") {
    cfp.addString(val);
    return;
  }
  if (typeof val === "boolean") {
    cfp.addBool(val);
    return;
  }
  if (typeof val === "number") {
    if (Number.isInteger(val)) {
      cfp.addInt64(val);
      return;
    }
    cfp.addString(val.toString());
    return;
  }
  if (typeof val === "bigint") {
    cfp.addInt256(Long.fromString(val.toString()));
    return;
  }
  if (val instanceof Uint8Array) {
    if (val.length === 32) {
      cfp.addBytes32(val);
      return;
    }
    cfp.addBytes(val);
    return;
  }
  throw new Error("Unsupported contract argument type");
}

function addSolidityParam(cfp: ContractFunctionParameters, solType: string, val: unknown): void {
  if (val === undefined || val === null) {
    throw new Error(`Missing value for Solidity type: ${solType}`);
  }
  switch (solType) {
    case "string": {
      if (typeof val !== "string") throw new Error(`Expected string for ${solType}`);
      cfp.addString(val);
      return;
    }
    case "bool": {
      if (typeof val !== "boolean") throw new Error(`Expected boolean for ${solType}`);
      cfp.addBool(val);
      return;
    }
    case "address": {
      cfp.addAddress(String(val));
      return;
    }
    case "bytes": {
      if (!(val instanceof Uint8Array)) throw new Error(`Expected Uint8Array for ${solType}`);
      cfp.addBytes(val);
      return;
    }
    case "bytes32": {
      if (!(val instanceof Uint8Array)) throw new Error(`Expected Uint8Array for ${solType}`);
      cfp.addBytes32(val);
      return;
    }
    case "int8":
    case "int16":
    case "int32":
    case "uint8":
    case "uint16":
    case "uint32": {
      if (typeof val !== "number") throw new Error(`Expected number for ${solType}`);
      if (solType === "int8") cfp.addInt8(val);
      if (solType === "int16") cfp.addInt16(val);
      if (solType === "int32") cfp.addInt32(val);
      if (solType === "uint8") cfp.addUint8(val);
      if (solType === "uint16") cfp.addUint16(val);
      if (solType === "uint32") cfp.addUint32(val);
      return;
    }
    case "int64": {
      cfp.addInt64(toInt64Param(val));
      return;
    }
    case "int256": {
      cfp.addInt256(Long.fromString(String(val)));
      return;
    }
    case "uint64": {
      cfp.addUint64(toInt64Param(val));
      return;
    }
    case "uint256": {
      cfp.addUint256(Long.fromString(String(val)));
      return;
    }
    default:
      throw new Error(`Unsupported Solidity type: ${solType}`);
  }
}

export function buildTransaction(
  tx: TransactionDescriptor,
  operatorKey: string | undefined,
  signing?: SigningContext,
) {
  switch (tx.kind) {
    case "accounts.transfer": {
      const params = tx.params;
      const from = params.from ?? undefined;
      const transaction = new TransferTransaction();
      if (from) {
        transaction.addHbarTransfer(from, toHbar(params.hbar).negated());
      }
      transaction.addHbarTransfer(params.to, toHbar(params.hbar));
      if (params.memo) transaction.setTransactionMemo(params.memo);
      if (params.maxFee !== undefined) transaction.setMaxTransactionFee(toHbar(params.maxFee));
      return transaction;
    }
    case "accounts.create": {
      const params = tx.params;
      const key = PrivateKey.fromStringDer(params.publicKey).publicKey;
      const transaction = new AccountCreateTransaction().setKeyWithoutAlias(key);
      if (params.initialBalance !== undefined)
        transaction.setInitialBalance(toHbar(params.initialBalance));
      if (params.memo) transaction.setAccountMemo(params.memo);
      if (params.maxAutomaticTokenAssociations !== undefined)
        transaction.setMaxAutomaticTokenAssociations(params.maxAutomaticTokenAssociations);
      if (params.receiverSignatureRequired !== undefined)
        transaction.setReceiverSignatureRequired(params.receiverSignatureRequired);
      if (params.autoRenewPeriodSeconds !== undefined)
        transaction.setAutoRenewPeriod(params.autoRenewPeriodSeconds);
      if (params.maxFee !== undefined) transaction.setMaxTransactionFee(toHbar(params.maxFee));
      return transaction;
    }
    case "accounts.update": {
      const params = tx.params;
      const transaction = new AccountUpdateTransaction().setAccountId(params.accountId);
      if (params.key) transaction.setKey(PrivateKey.fromStringDer(params.key).publicKey);
      if (params.memo !== undefined) transaction.setAccountMemo(params.memo);
      if (params.maxAutomaticTokenAssociations !== undefined)
        transaction.setMaxAutomaticTokenAssociations(params.maxAutomaticTokenAssociations);
      if (params.autoRenewPeriodSeconds !== undefined)
        transaction.setAutoRenewPeriod(params.autoRenewPeriodSeconds);
      if (params.expirationTime) transaction.setExpirationTime(params.expirationTime);
      if (params.stakedAccountId) transaction.setStakedAccountId(params.stakedAccountId);
      if (params.stakedNodeId !== undefined) transaction.setStakedNodeId(params.stakedNodeId);
      if (params.declineStakingReward !== undefined)
        transaction.setDeclineStakingReward(params.declineStakingReward);
      if (params.maxFee !== undefined) transaction.setMaxTransactionFee(toHbar(params.maxFee));
      return transaction;
    }
    case "accounts.delete": {
      const params = tx.params;
      const transaction = new AccountDeleteTransaction()
        .setAccountId(params.accountId)
        .setTransferAccountId(params.transferAccountId);
      if (params.maxFee !== undefined) transaction.setMaxTransactionFee(toHbar(params.maxFee));
      return transaction;
    }
    case "accounts.allowances": {
      const params = tx.params;
      const transaction = new AccountAllowanceApproveTransaction();
      if (params.hbar) {
        for (const a of params.hbar) {
          transaction.approveHbarAllowance(a.ownerAccountId, a.spenderAccountId, toHbar(a.amount));
        }
      }
      if (params.tokens) {
        for (const a of params.tokens) {
          transaction.approveTokenAllowance(
            a.tokenId,
            a.ownerAccountId,
            a.spenderAccountId,
            Long.fromString(toAmountString(a.amount)),
          );
        }
      }
      if (params.nfts) {
        for (const a of params.nfts) {
          if (a.approveAll) {
            transaction.approveTokenNftAllowanceAllSerials(
              a.tokenId,
              a.ownerAccountId,
              a.spenderAccountId,
            );
          } else if (a.serial !== undefined) {
            transaction.approveTokenNftAllowance(
              NftId.fromString(`${a.tokenId}/${String(a.serial)}`),
              a.ownerAccountId,
              a.spenderAccountId,
            );
          }
        }
      }
      if (params.memo) transaction.setTransactionMemo(params.memo);
      if (params.maxFee !== undefined) transaction.setMaxTransactionFee(toHbar(params.maxFee));
      return transaction;
    }
    case "tokens.create": {
      const params = tx.params;
      const transaction = new TokenCreateTransaction()
        .setTokenName(params.name)
        .setTokenSymbol(params.symbol);
      if (params.decimals !== undefined) transaction.setDecimals(params.decimals);
      if (params.supply !== undefined)
        transaction.setInitialSupply(Long.fromString(toAmountString(params.supply)));
      if (params.treasury) transaction.setTreasuryAccountId(params.treasury);
      if (params.tokenType === "NON_FUNGIBLE_UNIQUE")
        transaction.setTokenType(TokenType.NonFungibleUnique);
      if (params.tokenType === "FUNGIBLE_COMMON")
        transaction.setTokenType(TokenType.FungibleCommon);
      if (params.supplyType === "FINITE") transaction.setSupplyType(TokenSupplyType.Finite);
      if (params.supplyType === "INFINITE") transaction.setSupplyType(TokenSupplyType.Infinite);
      if (params.maxSupply !== undefined)
        transaction.setMaxSupply(Long.fromString(toAmountString(params.maxSupply)));
      if (params.freezeDefault !== undefined) transaction.setFreezeDefault(params.freezeDefault);
      if (params.adminKey !== undefined)
        transaction.setAdminKey(resolveKeyParam(params.adminKey, operatorKey, signing));
      if (params.kycKey !== undefined)
        transaction.setKycKey(resolveKeyParam(params.kycKey, operatorKey, signing));
      if (params.freezeKey !== undefined)
        transaction.setFreezeKey(resolveKeyParam(params.freezeKey, operatorKey, signing));
      if (params.wipeKey !== undefined)
        transaction.setWipeKey(resolveKeyParam(params.wipeKey, operatorKey, signing));
      if (params.supplyKey !== undefined)
        transaction.setSupplyKey(resolveKeyParam(params.supplyKey, operatorKey, signing));
      if (params.pauseKey !== undefined)
        transaction.setPauseKey(resolveKeyParam(params.pauseKey, operatorKey, signing));
      if (params.metadataKey !== undefined)
        transaction.setMetadataKey(resolveKeyParam(params.metadataKey, operatorKey, signing));
      if (params.feeScheduleKey !== undefined)
        transaction.setFeeScheduleKey(resolveKeyParam(params.feeScheduleKey, operatorKey, signing));
      if (params.customFees) transaction.setCustomFees(params.customFees.map(buildCustomFee));
      if (params.autoRenewAccountId) transaction.setAutoRenewAccountId(params.autoRenewAccountId);
      if (params.autoRenewPeriodSeconds !== undefined)
        transaction.setAutoRenewPeriod(params.autoRenewPeriodSeconds);
      if (params.expirationTime) transaction.setExpirationTime(params.expirationTime);
      if (params.memo) transaction.setTokenMemo(params.memo);
      if (params.maxFee !== undefined) transaction.setMaxTransactionFee(toHbar(params.maxFee));
      return transaction;
    }
    case "tokens.mint": {
      const params = tx.params;
      const transaction = new TokenMintTransaction().setTokenId(params.tokenId);
      if (params.amount !== undefined)
        transaction.setAmount(Long.fromString(toAmountString(params.amount)));
      if (params.metadata) {
        for (const m of params.metadata) transaction.addMetadata(m);
      }
      if (params.memo) transaction.setTransactionMemo(params.memo);
      if (params.maxFee !== undefined) transaction.setMaxTransactionFee(toHbar(params.maxFee));
      return transaction;
    }
    case "tokens.burn": {
      const params = tx.params;
      const transaction = new TokenBurnTransaction().setTokenId(params.tokenId);
      if (params.amount !== undefined)
        transaction.setAmount(Long.fromString(toAmountString(params.amount)));
      if (params.serials) transaction.setSerials(params.serials.map((s) => Long.fromNumber(s)));
      if (params.memo) transaction.setTransactionMemo(params.memo);
      if (params.maxFee !== undefined) transaction.setMaxTransactionFee(toHbar(params.maxFee));
      return transaction;
    }
    case "tokens.transfer": {
      const params = tx.params;
      const transaction = new TransferTransaction();
      if (params.from) {
        transaction.addTokenTransfer(
          params.tokenId,
          params.from,
          Long.fromString(toAmountString(params.amount)).negate(),
        );
      }
      transaction.addTokenTransfer(
        params.tokenId,
        params.to,
        Long.fromString(toAmountString(params.amount)),
      );
      if (params.memo) transaction.setTransactionMemo(params.memo);
      if (params.maxFee !== undefined) transaction.setMaxTransactionFee(toHbar(params.maxFee));
      return transaction;
    }
    case "tokens.transferNft": {
      const params = tx.params;
      const transaction = new TransferTransaction().addNftTransfer(
        params.tokenId,
        params.serial,
        params.from,
        params.to,
      );
      if (params.memo) transaction.setTransactionMemo(params.memo);
      if (params.maxFee !== undefined) transaction.setMaxTransactionFee(toHbar(params.maxFee));
      return transaction;
    }
    case "tokens.associate": {
      const params = tx.params;
      const transaction = new TokenAssociateTransaction()
        .setAccountId(params.accountId)
        .setTokenIds([...params.tokenIds]);
      if (params.memo) transaction.setTransactionMemo(params.memo);
      if (params.maxFee !== undefined) transaction.setMaxTransactionFee(toHbar(params.maxFee));
      return transaction;
    }
    case "tokens.dissociate": {
      const params = tx.params;
      const transaction = new TokenDissociateTransaction()
        .setAccountId(params.accountId)
        .setTokenIds([...params.tokenIds]);
      if (params.memo) transaction.setTransactionMemo(params.memo);
      if (params.maxFee !== undefined) transaction.setMaxTransactionFee(toHbar(params.maxFee));
      return transaction;
    }
    case "tokens.freeze": {
      const params = tx.params;
      const transaction = new TokenFreezeTransaction()
        .setTokenId(params.tokenId)
        .setAccountId(params.accountId);
      if (params.memo) transaction.setTransactionMemo(params.memo);
      if (params.maxFee !== undefined) transaction.setMaxTransactionFee(toHbar(params.maxFee));
      return transaction;
    }
    case "tokens.unfreeze": {
      const params = tx.params;
      const transaction = new TokenUnfreezeTransaction()
        .setTokenId(params.tokenId)
        .setAccountId(params.accountId);
      if (params.memo) transaction.setTransactionMemo(params.memo);
      if (params.maxFee !== undefined) transaction.setMaxTransactionFee(toHbar(params.maxFee));
      return transaction;
    }
    case "tokens.grantKyc": {
      const params = tx.params;
      const transaction = new TokenGrantKycTransaction()
        .setTokenId(params.tokenId)
        .setAccountId(params.accountId);
      if (params.memo) transaction.setTransactionMemo(params.memo);
      if (params.maxFee !== undefined) transaction.setMaxTransactionFee(toHbar(params.maxFee));
      return transaction;
    }
    case "tokens.revokeKyc": {
      const params = tx.params;
      const transaction = new TokenRevokeKycTransaction()
        .setTokenId(params.tokenId)
        .setAccountId(params.accountId);
      if (params.memo) transaction.setTransactionMemo(params.memo);
      if (params.maxFee !== undefined) transaction.setMaxTransactionFee(toHbar(params.maxFee));
      return transaction;
    }
    case "tokens.pause": {
      const params = tx.params;
      const transaction = new TokenPauseTransaction().setTokenId(params.tokenId);
      if (params.memo) transaction.setTransactionMemo(params.memo);
      if (params.maxFee !== undefined) transaction.setMaxTransactionFee(toHbar(params.maxFee));
      return transaction;
    }
    case "tokens.unpause": {
      const params = tx.params;
      const transaction = new TokenUnpauseTransaction().setTokenId(params.tokenId);
      if (params.memo) transaction.setTransactionMemo(params.memo);
      if (params.maxFee !== undefined) transaction.setMaxTransactionFee(toHbar(params.maxFee));
      return transaction;
    }
    case "tokens.wipe": {
      const params = tx.params;
      const transaction = new TokenWipeTransaction()
        .setTokenId(params.tokenId)
        .setAccountId(params.accountId);
      if (params.amount !== undefined)
        transaction.setAmount(Long.fromString(toAmountString(params.amount)));
      if (params.serials) transaction.setSerials(params.serials.map((s) => Long.fromNumber(s)));
      if (params.memo) transaction.setTransactionMemo(params.memo);
      if (params.maxFee !== undefined) transaction.setMaxTransactionFee(toHbar(params.maxFee));
      return transaction;
    }
    case "tokens.delete": {
      const params = tx.params;
      const transaction = new TokenDeleteTransaction().setTokenId(params.tokenId);
      if (params.memo) transaction.setTransactionMemo(params.memo);
      if (params.maxFee !== undefined) transaction.setMaxTransactionFee(toHbar(params.maxFee));
      return transaction;
    }
    case "tokens.update": {
      const params = tx.params;
      const transaction = new TokenUpdateTransaction().setTokenId(params.tokenId);
      if (params.name) transaction.setTokenName(params.name);
      if (params.symbol) transaction.setTokenSymbol(params.symbol);
      if (params.treasury) transaction.setTreasuryAccountId(params.treasury);
      if (params.adminKey !== undefined)
        transaction.setAdminKey(resolveKeyParam(params.adminKey, operatorKey, signing));
      if (params.kycKey !== undefined)
        transaction.setKycKey(resolveKeyParam(params.kycKey, operatorKey, signing));
      if (params.freezeKey !== undefined)
        transaction.setFreezeKey(resolveKeyParam(params.freezeKey, operatorKey, signing));
      if (params.wipeKey !== undefined)
        transaction.setWipeKey(resolveKeyParam(params.wipeKey, operatorKey, signing));
      if (params.supplyKey !== undefined)
        transaction.setSupplyKey(resolveKeyParam(params.supplyKey, operatorKey, signing));
      if (params.pauseKey !== undefined)
        transaction.setPauseKey(resolveKeyParam(params.pauseKey, operatorKey, signing));
      if (params.metadataKey !== undefined)
        transaction.setMetadataKey(resolveKeyParam(params.metadataKey, operatorKey, signing));
      if (params.feeScheduleKey !== undefined)
        transaction.setFeeScheduleKey(resolveKeyParam(params.feeScheduleKey, operatorKey, signing));
      if (params.autoRenewAccountId) transaction.setAutoRenewAccountId(params.autoRenewAccountId);
      if (params.autoRenewPeriodSeconds !== undefined)
        transaction.setAutoRenewPeriod(params.autoRenewPeriodSeconds);
      if (params.expirationTime) transaction.setExpirationTime(params.expirationTime);
      if (params.memo !== undefined) transaction.setTokenMemo(params.memo);
      if (params.maxFee !== undefined) transaction.setMaxTransactionFee(toHbar(params.maxFee));
      return transaction;
    }
    case "tokens.fees": {
      const params = tx.params;
      const transaction = new TokenFeeScheduleUpdateTransaction()
        .setTokenId(params.tokenId)
        .setCustomFees(params.customFees.map(buildCustomFee));
      if (params.memo) transaction.setTransactionMemo(params.memo);
      if (params.maxFee !== undefined) transaction.setMaxTransactionFee(toHbar(params.maxFee));
      return transaction;
    }
    case "hcs.create": {
      const params = tx.params;
      const transaction = new TopicCreateTransaction();
      if (params.adminKey !== undefined)
        transaction.setAdminKey(resolveKeyParam(params.adminKey, operatorKey, signing));
      if (params.submitKey !== undefined)
        transaction.setSubmitKey(resolveKeyParam(params.submitKey, operatorKey, signing));
      if (params.feeScheduleKey !== undefined)
        transaction.setFeeScheduleKey(resolveKeyParam(params.feeScheduleKey, operatorKey, signing));
      if (params.autoRenewAccountId) transaction.setAutoRenewAccountId(params.autoRenewAccountId);
      if (params.autoRenewPeriodSeconds !== undefined)
        transaction.setAutoRenewPeriod(params.autoRenewPeriodSeconds);
      if (params.customFees) {
        for (const fee of params.customFees) {
          transaction.addCustomFee(buildTopicCustomFee(fee));
        }
      }
      if (params.feeExemptKeys) {
        transaction.setFeeExemptKeys(
          params.feeExemptKeys.map((k) => PrivateKey.fromStringDer(k).publicKey),
        );
      }
      if (params.memo) transaction.setTopicMemo(params.memo);
      if (params.maxFee !== undefined) transaction.setMaxTransactionFee(toHbar(params.maxFee));
      return transaction;
    }
    case "hcs.update": {
      const params = tx.params;
      const transaction = new TopicUpdateTransaction().setTopicId(params.topicId);
      if (params.adminKey !== undefined)
        transaction.setAdminKey(resolveKeyParam(params.adminKey, operatorKey, signing));
      if (params.submitKey !== undefined)
        transaction.setSubmitKey(resolveKeyParam(params.submitKey, operatorKey, signing));
      if (params.feeScheduleKey !== undefined)
        transaction.setFeeScheduleKey(resolveKeyParam(params.feeScheduleKey, operatorKey, signing));
      if (params.autoRenewAccountId) transaction.setAutoRenewAccountId(params.autoRenewAccountId);
      if (params.autoRenewPeriodSeconds !== undefined)
        transaction.setAutoRenewPeriod(params.autoRenewPeriodSeconds);
      if (params.expirationTime) transaction.setExpirationTime(params.expirationTime);
      if (params.customFees) {
        for (const fee of params.customFees) {
          transaction.addCustomFee(buildTopicCustomFee(fee));
        }
      }
      if (params.feeExemptKeys) {
        transaction.setFeeExemptKeys(
          params.feeExemptKeys.map((k) => PrivateKey.fromStringDer(k).publicKey),
        );
      }
      if (params.clearAdminKey) transaction.clearAdminKey();
      if (params.clearSubmitKey) transaction.clearSubmitKey();
      if (params.clearAutoRenewAccountId) transaction.clearAutoRenewAccountId();
      if (params.clearFeeScheduleKey) transaction.clearFeeScheduleKey();
      if (params.clearFeeExemptKeys) transaction.clearFeeExemptKeys();
      if (params.clearCustomFees) transaction.clearCustomFees();
      if (params.memo !== undefined) transaction.setTopicMemo(params.memo);
      if (params.maxFee !== undefined) transaction.setMaxTransactionFee(toHbar(params.maxFee));
      return transaction;
    }
    case "hcs.delete": {
      const params = tx.params;
      const transaction = new TopicDeleteTransaction().setTopicId(params.topicId);
      if (params.memo) transaction.setTransactionMemo(params.memo);
      if (params.maxFee !== undefined) transaction.setMaxTransactionFee(toHbar(params.maxFee));
      return transaction;
    }
    case "hcs.submit": {
      const params = tx.params;
      const transaction = new TopicMessageSubmitTransaction().setTopicId(params.topicId);
      if (typeof params.message === "string") {
        transaction.setMessage(params.message);
      } else if (params.message instanceof Uint8Array) {
        transaction.setMessage(params.message);
      } else {
        transaction.setMessage(JSON.stringify(params.message));
      }
      if (params.maxChunks !== undefined) transaction.setMaxChunks(params.maxChunks);
      if (params.chunkSize !== undefined) transaction.setChunkSize(params.chunkSize);
      if (params.memo) transaction.setTransactionMemo(params.memo);
      if (params.maxFee !== undefined) transaction.setMaxTransactionFee(toHbar(params.maxFee));
      return transaction;
    }
    case "contracts.deploy": {
      const params = tx.params;
      const transaction = new ContractCreateTransaction().setBytecode(hexToBytes(params.bytecode));
      if (params.gas !== undefined) transaction.setGas(params.gas);
      if (params.constructorParams) {
        transaction.setConstructorParameters(
          buildContractFunctionParameters(params.constructorParams),
        );
      }
      if (params.adminKey !== undefined)
        transaction.setAdminKey(resolveKeyParam(params.adminKey, operatorKey, signing));
      if (params.initialBalance !== undefined)
        transaction.setInitialBalance(toHbar(params.initialBalance));
      if (params.autoRenewPeriodSeconds !== undefined)
        transaction.setAutoRenewPeriod(params.autoRenewPeriodSeconds);
      if (params.autoRenewAccountId) transaction.setAutoRenewAccountId(params.autoRenewAccountId);
      if (params.maxAutomaticTokenAssociations !== undefined)
        transaction.setMaxAutomaticTokenAssociations(params.maxAutomaticTokenAssociations);
      if (params.stakedAccountId) transaction.setStakedAccountId(params.stakedAccountId);
      if (params.stakedNodeId !== undefined) transaction.setStakedNodeId(params.stakedNodeId);
      if (params.declineStakingReward !== undefined)
        transaction.setDeclineStakingReward(params.declineStakingReward);
      if (params.memo) transaction.setContractMemo(params.memo);
      if (params.maxFee !== undefined) transaction.setMaxTransactionFee(toHbar(params.maxFee));
      return transaction;
    }
    case "contracts.execute": {
      const params = tx.params;
      const transaction = new ContractExecuteTransaction().setContractId(params.id);
      if (params.gas !== undefined) transaction.setGas(params.gas);
      const functionParams = buildContractFunctionParametersFromArgs(params.args);
      if (functionParams) {
        transaction.setFunction(params.fn, functionParams);
      } else {
        transaction.setFunction(params.fn);
      }
      if (params.payableAmount !== undefined)
        transaction.setPayableAmount(toHbar(params.payableAmount));
      if (params.memo) transaction.setTransactionMemo(params.memo);
      if (params.maxFee !== undefined) transaction.setMaxTransactionFee(toHbar(params.maxFee));
      return transaction;
    }
    case "contracts.delete": {
      const params = tx.params;
      const transaction = new ContractDeleteTransaction().setContractId(params.contractId);
      if (params.transferAccountId) transaction.setTransferAccountId(params.transferAccountId);
      if (params.transferContractId) transaction.setTransferContractId(params.transferContractId);
      if (params.permanentRemoval !== undefined)
        transaction.setPermanentRemoval(params.permanentRemoval);
      if (params.memo) transaction.setTransactionMemo(params.memo);
      if (params.maxFee !== undefined) transaction.setMaxTransactionFee(toHbar(params.maxFee));
      return transaction;
    }
    case "contracts.update": {
      const params = tx.params;
      const transaction = new ContractUpdateTransaction().setContractId(params.contractId);
      if (params.adminKey !== undefined)
        transaction.setAdminKey(resolveKeyParam(params.adminKey, operatorKey, signing));
      if (params.expirationTime) transaction.setExpirationTime(params.expirationTime);
      if (params.autoRenewPeriodSeconds !== undefined)
        transaction.setAutoRenewPeriod(params.autoRenewPeriodSeconds);
      if (params.autoRenewAccountId) transaction.setAutoRenewAccountId(params.autoRenewAccountId);
      if (params.maxAutomaticTokenAssociations !== undefined)
        transaction.setMaxAutomaticTokenAssociations(params.maxAutomaticTokenAssociations);
      if (params.stakedAccountId) transaction.setStakedAccountId(params.stakedAccountId);
      if (params.stakedNodeId !== undefined) transaction.setStakedNodeId(params.stakedNodeId);
      if (params.declineStakingReward !== undefined)
        transaction.setDeclineStakingReward(params.declineStakingReward);
      if (params.memo !== undefined) transaction.setContractMemo(params.memo);
      if (params.maxFee !== undefined) transaction.setMaxTransactionFee(toHbar(params.maxFee));
      return transaction;
    }
    case "files.create": {
      const params = tx.params;
      const transaction = new FileCreateTransaction();
      if (typeof params.contents === "string") {
        transaction.setContents(params.contents);
      } else {
        transaction.setContents(params.contents);
      }
      if (params.keys) {
        transaction.setKeys(params.keys.map((k) => PrivateKey.fromStringDer(k).publicKey));
      }
      if (params.expirationTime) transaction.setExpirationTime(params.expirationTime);
      if (params.memo) transaction.setFileMemo(params.memo);
      if (params.maxFee !== undefined) transaction.setMaxTransactionFee(toHbar(params.maxFee));
      return transaction;
    }
    case "files.append": {
      const params = tx.params;
      const transaction = new FileAppendTransaction().setFileId(params.fileId);
      if (typeof params.contents === "string") {
        transaction.setContents(params.contents);
      } else {
        transaction.setContents(params.contents);
      }
      if (params.maxChunks !== undefined) transaction.setMaxChunks(params.maxChunks);
      if (params.chunkSize !== undefined) transaction.setChunkSize(params.chunkSize);
      if (params.memo) transaction.setTransactionMemo(params.memo);
      if (params.maxFee !== undefined) transaction.setMaxTransactionFee(toHbar(params.maxFee));
      return transaction;
    }
    case "files.update": {
      const params = tx.params;
      const transaction = new FileUpdateTransaction().setFileId(params.fileId);
      if (params.contents !== undefined) {
        if (typeof params.contents === "string") {
          transaction.setContents(params.contents);
        } else {
          transaction.setContents(params.contents);
        }
      }
      if (params.keys) {
        transaction.setKeys(params.keys.map((k) => PrivateKey.fromStringDer(k).publicKey));
      }
      if (params.expirationTime) transaction.setExpirationTime(params.expirationTime);
      if (params.memo) transaction.setFileMemo(params.memo);
      if (params.maxFee !== undefined) transaction.setMaxTransactionFee(toHbar(params.maxFee));
      return transaction;
    }
    case "files.delete": {
      const params = tx.params;
      const transaction = new FileDeleteTransaction().setFileId(params.fileId);
      if (params.memo) transaction.setTransactionMemo(params.memo);
      if (params.maxFee !== undefined) transaction.setMaxTransactionFee(toHbar(params.maxFee));
      return transaction;
    }
    case "schedules.create": {
      const params = tx.params;
      const scheduled = buildTransaction(params.tx, operatorKey, signing);
      const transaction = new ScheduleCreateTransaction().setScheduledTransaction(scheduled);
      if (params.adminKey !== undefined)
        transaction.setAdminKey(resolveKeyParam(params.adminKey, operatorKey, signing));
      if (params.payerAccountId)
        transaction.setPayerAccountId(AccountId.fromString(params.payerAccountId));
      if (params.expirationTime)
        transaction.setExpirationTime(Timestamp.fromDate(params.expirationTime));
      if (params.waitForExpiry !== undefined) transaction.setWaitForExpiry(params.waitForExpiry);
      if (params.memo) transaction.setScheduleMemo(params.memo);
      if (params.maxFee !== undefined) transaction.setMaxTransactionFee(toHbar(params.maxFee));
      return transaction;
    }
    case "schedules.sign": {
      const params = tx.params;
      const transaction = new ScheduleSignTransaction().setScheduleId(params.scheduleId);
      if (params.memo) transaction.setTransactionMemo(params.memo);
      if (params.maxFee !== undefined) transaction.setMaxTransactionFee(toHbar(params.maxFee));
      return transaction;
    }
    case "schedules.delete": {
      const params = tx.params;
      const transaction = new ScheduleDeleteTransaction().setScheduleId(params.scheduleId);
      if (params.memo) transaction.setTransactionMemo(params.memo);
      if (params.maxFee !== undefined) transaction.setMaxTransactionFee(toHbar(params.maxFee));
      return transaction;
    }
  }
}

export async function submitTransaction(
  context: SubmitContext,
  descriptor: TransactionDescriptor,
): Promise<Result<TransactionReceiptData>> {
  try {
    const operatorKey = context.signing.kind === "operator" ? context.signing.key : undefined;
    const nativeTx = buildTransaction(descriptor, operatorKey, context.signing);

    const signedTx =
      context.signing.kind === "signer"
        ? await (
            await nativeTx.freezeWithSigner(context.signing.signer)
          ).signWithSigner(context.signing.signer)
        : await (
            await nativeTx.freezeWith(context.client)
          ).sign(PrivateKey.fromStringDer(context.signing.key));

    const signedTxId = signedTx.transactionId?.toString() ?? "unknown";

    const submitted =
      context.signing.kind === "signer"
        ? await signedTx.executeWithSigner(context.signing.signer)
        : await signedTx.execute(context.client);

    const txId = submitted.transactionId?.toString() ?? signedTxId;

    const receipt =
      context.signing.kind === "signer"
        ? await submitted.getReceiptWithSigner(context.signing.signer)
        : await submitted.getReceipt(context.client);

    const accountIdStr = receipt.accountId?.toString();
    const receiptData: TransactionReceiptData = {
      status: receipt.status.toString(),
      transactionId: txId,
      ...(accountIdStr ? { accountId: asEntityId(accountIdStr) } : {}),
      ...(receipt.fileId ? { fileId: asEntityId(receipt.fileId.toString()) } : {}),
      ...(receipt.contractId ? { contractId: asEntityId(receipt.contractId.toString()) } : {}),
      ...(receipt.topicId ? { topicId: asEntityId(receipt.topicId.toString()) } : {}),
      ...(receipt.tokenId ? { tokenId: asEntityId(receipt.tokenId.toString()) } : {}),
      ...(receipt.scheduleId ? { scheduleId: asEntityId(receipt.scheduleId.toString()) } : {}),
      ...(receipt.totalSupply !== undefined && receipt.totalSupply !== null
        ? { totalSupply: receipt.totalSupply.toString() }
        : {}),
      ...(receipt.serials ? { serialNumbers: receipt.serials.map((s) => s.toNumber()) } : {}),
      ...(receipt.topicSequenceNumber
        ? { topicSequenceNumber: receipt.topicSequenceNumber.toString() }
        : {}),
    };

    return ok(receiptData);
  } catch (error) {
    if (error instanceof ReceiptStatusError) {
      const txId = error.transactionId?.toString() ?? "unknown";
      const statusStr = error.status.toString();

      if (INSUFFICIENT_BALANCE_STATUSES.has(statusStr)) {
        return err(
          createError(
            `HEDERA_${statusStr}`,
            `Transaction ${txId} failed with status ${statusStr}`,
            {
              hint: "Check account balance or reduce amount",
              transactionId: txId,
              details: { status: statusStr },
            },
          ),
        );
      }

      if (INVALID_SIGNATURE_STATUSES.has(statusStr)) {
        return err(
          createError("TX_PRECHECK_FAILED", `Transaction ${txId} has an invalid signature`, {
            hint: "Ensure the correct signer or operator key is used",
            transactionId: txId,
            details: { status: statusStr },
          }),
        );
      }

      return err(
        createError(`HEDERA_${statusStr}`, `Transaction ${txId} failed with status ${statusStr}`, {
          transactionId: txId,
          details: { status: statusStr },
        }),
      );
    }

    if (error instanceof Error) {
      return err(
        createError("UNEXPECTED_ERROR", error.message, {
          hint: "Check network connectivity and transaction parameters",
        }),
      );
    }

    return err(createError("UNEXPECTED_ERROR", "Unknown error"));
  }
}

export async function callContract(
  context: SubmitContext,
  params: {
    readonly id: EntityId;
    readonly fn: string;
    readonly args?: ReadonlyArray<unknown>;
    readonly gas: number;
    readonly senderAccountId?: EntityId;
  },
): Promise<
  Result<{
    readonly gasUsed: number;
    readonly errorMessage: string;
    readonly raw: Uint8Array;
    readonly getString: (index?: number) => string;
    readonly getBool: (index?: number) => boolean;
    readonly getAddress: (index?: number) => string;
    readonly getBytes32: (index?: number) => Uint8Array;
    readonly getInt8: (index?: number) => number;
    readonly getInt16: (index?: number) => number;
    readonly getInt32: (index?: number) => number;
    readonly getInt64: (index?: number) => import("bignumber.js").BigNumber;
    readonly getInt256: (index?: number) => import("bignumber.js").BigNumber;
    readonly getUint8: (index?: number) => number;
    readonly getUint16: (index?: number) => number;
    readonly getUint32: (index?: number) => number;
    readonly getUint64: (index?: number) => import("bignumber.js").BigNumber;
    readonly getUint256: (index?: number) => import("bignumber.js").BigNumber;
  }>
> {
  try {
    const query = new ContractCallQuery().setContractId(params.id);
    query.setGas(params.gas);
    if (params.senderAccountId) query.setSenderAccountId(params.senderAccountId);
    const fnParams = buildContractFunctionParametersFromArgs(params.args);
    if (fnParams) query.setFunction(params.fn, fnParams);
    else query.setFunction(params.fn);

    const result =
      context.signing.kind === "signer"
        ? await query.executeWithSigner(context.signing.signer)
        : await query.execute(context.client);

    return ok({
      gasUsed: result.gasUsed.toNumber(),
      errorMessage: result.errorMessage ?? "",
      raw: result.asBytes(),
      getString: (index?: number) => result.getString(index),
      getBool: (index?: number) => result.getBool(index),
      getAddress: (index?: number) => result.getAddress(index),
      getBytes32: (index?: number) => result.getBytes32(index),
      getInt8: (index?: number) => result.getInt8(index),
      getInt16: (index?: number) => result.getInt16(index),
      getInt32: (index?: number) => result.getInt32(index),
      getInt64: (index?: number) => result.getInt64(index),
      getInt256: (index?: number) => result.getInt256(index),
      getUint8: (index?: number) => result.getUint8(index),
      getUint16: (index?: number) => result.getUint16(index),
      getUint32: (index?: number) => result.getUint32(index),
      getUint64: (index?: number) => result.getUint64(index),
      getUint256: (index?: number) => result.getUint256(index),
    });
  } catch (error) {
    if (error instanceof Error) {
      return err(
        createError(
          "CONTRACT_CALL_FAILED",
          `Contract call to ${params.id} failed: ${error.message}`,
          {
            hint: "Verify ABI, function name, and argument types",
          },
        ),
      );
    }
    return err(
      createError("CONTRACT_CALL_FAILED", `Contract call to ${params.id} failed`, {
        hint: "Verify ABI, function name, and argument types",
      }),
    );
  }
}

export async function queryFileInfo(
  context: SubmitContext,
  fileId: EntityId,
): Promise<Result<import("@hiero-ledger/sdk").FileInfo>> {
  try {
    const query = new FileInfoQuery().setFileId(fileId);
    const result =
      context.signing.kind === "signer"
        ? await query.executeWithSigner(context.signing.signer)
        : await query.execute(context.client);
    return ok(result);
  } catch (error) {
    if (error instanceof Error) {
      return err(
        createError("FILE_QUERY_FAILED", `File info query failed: ${error.message}`, {
          hint: "Verify file id and network connectivity",
        }),
      );
    }
    return err(
      createError("FILE_QUERY_FAILED", "File info query failed", {
        hint: "Verify file id and network connectivity",
      }),
    );
  }
}

export async function queryFileContents(
  context: SubmitContext,
  fileId: EntityId,
): Promise<Result<Uint8Array>> {
  try {
    const query = new FileContentsQuery().setFileId(fileId);
    const result =
      context.signing.kind === "signer"
        ? await query.executeWithSigner(context.signing.signer)
        : await query.execute(context.client);
    return ok(result);
  } catch (error) {
    if (error instanceof Error) {
      return err(
        createError("FILE_QUERY_FAILED", `File contents query failed: ${error.message}`, {
          hint: "Verify file id and network connectivity",
        }),
      );
    }
    return err(
      createError("FILE_QUERY_FAILED", "File contents query failed", {
        hint: "Verify file id and network connectivity",
      }),
    );
  }
}

export async function queryTransactionRecord(
  context: SubmitContext,
  transactionId: string,
): Promise<Result<import("@hiero-ledger/sdk").TransactionRecord>> {
  try {
    const query = new TransactionRecordQuery().setTransactionId(
      TransactionId.fromString(transactionId),
    );
    const result =
      context.signing.kind === "signer"
        ? await query.executeWithSigner(context.signing.signer)
        : await query.execute(context.client);
    return ok(result);
  } catch (error) {
    if (error instanceof Error) {
      return err(
        createError("TX_RECORD_QUERY_FAILED", `Transaction record query failed: ${error.message}`, {
          hint: "Verify transaction id and network connectivity",
        }),
      );
    }
    return err(
      createError("TX_RECORD_QUERY_FAILED", "Transaction record query failed", {
        hint: "Verify transaction id and network connectivity",
      }),
    );
  }
}

export async function queryTransactionReceipt(
  context: SubmitContext,
  transactionId: string,
  options?: {
    readonly includeChildren?: boolean;
    readonly includeDuplicates?: boolean;
    readonly validateStatus?: boolean;
  },
): Promise<Result<import("@hiero-ledger/sdk").TransactionReceipt>> {
  try {
    const query = new TransactionReceiptQuery().setTransactionId(
      TransactionId.fromString(transactionId),
    );
    if (options?.includeChildren !== undefined) {
      query.setIncludeChildren(options.includeChildren);
    }
    if (options?.includeDuplicates !== undefined) {
      query.setIncludeDuplicates(options.includeDuplicates);
    }
    if (options?.validateStatus !== undefined) {
      query.setValidateStatus(options.validateStatus);
    }
    const result =
      context.signing.kind === "signer"
        ? await query.executeWithSigner(context.signing.signer)
        : await query.execute(context.client);
    return ok(result);
  } catch (error) {
    if (error instanceof Error) {
      return err(
        createError("TX_RECEIPT_QUERY_FAILED", `Transaction receipt query failed: ${error.message}`, {
          hint: "Verify transaction id and network connectivity",
        }),
      );
    }
    return err(
      createError("TX_RECEIPT_QUERY_FAILED", "Transaction receipt query failed", {
        hint: "Verify transaction id and network connectivity",
      }),
    );
  }
}

export async function queryAccountRecords(
  context: SubmitContext,
  accountId: EntityId,
): Promise<Result<AccountRecordsData>> {
  try {
    const query = new AccountRecordsQuery().setAccountId(accountId);
    const result =
      context.signing.kind === "signer"
        ? await query.executeWithSigner(context.signing.signer)
        : await query.execute(context.client);
    return ok({ accountId, records: result });
  } catch (error) {
    if (error instanceof Error) {
      return err(
        createError(
          "ACCOUNT_RECORDS_QUERY_FAILED",
          `Account records query failed: ${error.message}`,
          {
            hint: "Verify account id and network connectivity",
          },
        ),
      );
    }
    return err(
      createError("ACCOUNT_RECORDS_QUERY_FAILED", "Account records query failed", {
        hint: "Verify account id and network connectivity",
      }),
    );
  }
}

export async function queryContractBytecode(
  context: SubmitContext,
  contractId: EntityId,
): Promise<Result<ContractBytecodeData>> {
  try {
    const query = new ContractByteCodeQuery().setContractId(contractId);
    const result =
      context.signing.kind === "signer"
        ? await query.executeWithSigner(context.signing.signer)
        : await query.execute(context.client);
    return ok({ contractId, bytecode: result });
  } catch (error) {
    if (error instanceof Error) {
      return err(
        createError(
          "CONTRACT_BYTECODE_QUERY_FAILED",
          `Contract bytecode query failed: ${error.message}`,
          {
            hint: "Verify contract id and network connectivity",
          },
        ),
      );
    }
    return err(
      createError("CONTRACT_BYTECODE_QUERY_FAILED", "Contract bytecode query failed", {
        hint: "Verify contract id and network connectivity",
      }),
    );
  }
}

export async function queryTokenNftInfo(
  context: SubmitContext,
  nftId: string,
): Promise<Result<TokenNftInfoData>> {
  try {
    const query = new TokenNftInfoQuery().setNftId(nftId);
    const result =
      context.signing.kind === "signer"
        ? await query.executeWithSigner(context.signing.signer)
        : await query.execute(context.client);
    return ok({ nftId, nfts: result });
  } catch (error) {
    if (error instanceof Error) {
      return err(
        createError("TOKEN_NFT_QUERY_FAILED", `Token NFT query failed: ${error.message}`, {
          hint: "Verify NFT id format (tokenId/serial) and network connectivity",
        }),
      );
    }
    return err(
      createError("TOKEN_NFT_QUERY_FAILED", "Token NFT query failed", {
        hint: "Verify NFT id format (tokenId/serial) and network connectivity",
      }),
    );
  }
}

export async function queryMirrorContractCall(context: {
  readonly client: Client;
  readonly contractId: EntityId;
  readonly functionName: string;
  readonly args?: ReadonlyArray<unknown>;
  readonly senderEvmAddress?: string;
  readonly gas?: number;
  readonly value?: string | number | bigint;
  readonly gasPrice?: string | number | bigint;
  readonly blockNumber?: string | number | bigint;
}): Promise<Result<MirrorContractCallData>> {
  try {
    const query = new MirrorNodeContractCallQuery().setContractId(
      ContractId.fromString(context.contractId),
    );
    if (context.senderEvmAddress) query.setSenderEvmAddress(context.senderEvmAddress);
    if (context.args) {
      const params = buildContractFunctionParametersFromArgs(context.args);
      query.setFunction(
        context.functionName,
        params ?? new ContractFunctionParameters(),
      );
    } else {
      query.setFunction(context.functionName, new ContractFunctionParameters());
    }
    if (context.gas !== undefined) query.setGasLimit(Long.fromNumber(context.gas));
    if (context.value !== undefined) query.setValue(Long.fromString(String(context.value)));
    if (context.gasPrice !== undefined) query.setGasPrice(Long.fromString(String(context.gasPrice)));
    if (context.blockNumber !== undefined)
      query.setBlockNumber(Long.fromString(String(context.blockNumber)));
    const raw = await query.execute(context.client);
    return ok({ contractId: context.contractId, raw, bytes: hexToBytes(raw) });
  } catch (error) {
    if (error instanceof Error) {
      return err(
        createError(
          "MIRROR_CONTRACT_QUERY_FAILED",
          `Mirror contract call failed: ${error.message}`,
          { hint: "Verify mirror node and EVM address inputs" },
        ),
      );
    }
    return err(
      createError("MIRROR_CONTRACT_QUERY_FAILED", "Mirror contract call failed", {
        hint: "Verify mirror node and EVM address inputs",
      }),
    );
  }
}

export async function queryMirrorContractEstimate(context: {
  readonly client: Client;
  readonly contractId: EntityId;
  readonly functionName: string;
  readonly args?: ReadonlyArray<unknown>;
  readonly senderEvmAddress?: string;
  readonly gas?: number;
  readonly value?: string | number | bigint;
  readonly gasPrice?: string | number | bigint;
  readonly blockNumber?: string | number | bigint;
}): Promise<Result<MirrorContractEstimateData>> {
  try {
    const query = new MirrorNodeContractEstimateQuery().setContractId(
      ContractId.fromString(context.contractId),
    );
    if (context.senderEvmAddress) query.setSenderEvmAddress(context.senderEvmAddress);
    if (context.args) {
      const params = buildContractFunctionParametersFromArgs(context.args);
      query.setFunction(
        context.functionName,
        params ?? new ContractFunctionParameters(),
      );
    } else {
      query.setFunction(context.functionName, new ContractFunctionParameters());
    }
    if (context.gas !== undefined) query.setGasLimit(Long.fromNumber(context.gas));
    if (context.value !== undefined) query.setValue(Long.fromString(String(context.value)));
    if (context.gasPrice !== undefined) query.setGasPrice(Long.fromString(String(context.gasPrice)));
    if (context.blockNumber !== undefined)
      query.setBlockNumber(Long.fromString(String(context.blockNumber)));
    const gas = await query.execute(context.client);
    return ok({ contractId: context.contractId, gas });
  } catch (error) {
    if (error instanceof Error) {
      return err(
        createError(
          "MIRROR_CONTRACT_QUERY_FAILED",
          `Mirror contract estimate failed: ${error.message}`,
          { hint: "Verify mirror node and EVM address inputs" },
        ),
      );
    }
    return err(
      createError("MIRROR_CONTRACT_QUERY_FAILED", "Mirror contract estimate failed", {
        hint: "Verify mirror node and EVM address inputs",
      }),
    );
  }
}
export function requireSigningContext(input: {
  readonly operatorKey: string | undefined;
  readonly signer: HieroSigner | undefined;
}): Result<SigningContext> {
  if (input.signer) {
    return ok({ kind: "signer", signer: input.signer });
  }
  if (input.operatorKey) {
    return ok({ kind: "operator", key: input.operatorKey });
  }
  return err(
    createError("SIGNER_REQUIRED", "A signer or operator key is required to sign transactions", {
      hint: "Pass signer in client config or provide operator key",
    }),
  );
}

export function resolveQueryContext(input: {
  readonly operatorKey: string | undefined;
  readonly signer: HieroSigner | undefined;
}): Result<SigningContext> {
  if (input.signer) {
    return ok({ kind: "signer", signer: input.signer });
  }
  if (input.operatorKey) {
    return ok({ kind: "operator", key: input.operatorKey });
  }
  return err(
    createError("SIGNER_REQUIRED", "A signer or operator key is required to execute queries", {
      hint: "Pass signer in client config or provide operator key",
    }),
  );
}

export function inferAccountId(
  signer: HieroSigner | undefined,
  operator?: EntityId,
): Result<EntityId> {
  if (operator) return ok(operator);
  if (!signer) {
    return err(
      createError("SIGNER_ACCOUNT_ID_REQUIRED", "Account id is required to infer sender", {
        hint: "Provide from or set operator in client config",
      }),
    );
  }
  const accountId = signer.getAccountId();
  return ok(asEntityId(accountId.toString()));
}

export function mapReceiptField<T extends keyof TransactionReceiptData>(
  receipt: TransactionReceiptData,
  field: T,
  label: string,
): Result<NonNullable<TransactionReceiptData[T]>> {
  const value = receipt[field];
  if (!value) {
    return err(
      createError("TX_MISSING_RECEIPT_FIELD", `Receipt missing ${label}`, {
        hint: "Verify transaction succeeded and receipt includes expected data",
        transactionId: receipt.transactionId,
        details: { field },
      }),
    );
  }
  return ok(value);
}

export function ensureScheduleId(result: Result<TransactionReceiptData>): Result<EntityId> {
  if (!result.ok) return result;
  return mapReceiptField(result.value, "scheduleId", "scheduleId");
}

export function ensureTokenId(result: Result<TransactionReceiptData>): Result<EntityId> {
  if (!result.ok) return result;
  return mapReceiptField(result.value, "tokenId", "tokenId");
}

export function ensureAccountId(result: Result<TransactionReceiptData>): Result<EntityId> {
  if (!result.ok) return result;
  return mapReceiptField(result.value, "accountId", "accountId");
}

export function ensureTopicId(result: Result<TransactionReceiptData>): Result<EntityId> {
  if (!result.ok) return result;
  return mapReceiptField(result.value, "topicId", "topicId");
}

export function ensureContractId(result: Result<TransactionReceiptData>): Result<EntityId> {
  if (!result.ok) return result;
  return mapReceiptField(result.value, "contractId", "contractId");
}

export function ensureFileId(result: Result<TransactionReceiptData>): Result<EntityId> {
  if (!result.ok) return result;
  return mapReceiptField(result.value, "fileId", "fileId");
}

export function ensureTopicSequence(result: Result<TransactionReceiptData>): Result<string> {
  if (!result.ok) return result;
  return mapReceiptField(result.value, "topicSequenceNumber", "topicSequenceNumber");
}
