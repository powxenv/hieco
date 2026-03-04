import {
  TransferTransaction,
  AccountCreateTransaction,
  AccountUpdateTransaction,
  AccountDeleteTransaction,
  AccountAllowanceApproveTransaction,
  TokenCreateTransaction,
  TokenMintTransaction,
  TokenBurnTransaction,
  TokenAssociateTransaction,
  TokenDissociateTransaction,
  TokenFreezeTransaction,
  TokenUnfreezeTransaction,
  TokenGrantKycTransaction,
  TokenRevokeKycTransaction,
  TokenPauseTransaction,
  TokenUnpauseTransaction,
  TokenWipeTransaction,
  TokenDeleteTransaction,
  TokenUpdateTransaction,
  TokenFeeScheduleUpdateTransaction,
  TopicCreateTransaction,
  TopicUpdateTransaction,
  TopicDeleteTransaction,
  TopicMessageSubmitTransaction,
  ContractCreateTransaction,
  ContractExecuteTransaction,
  ContractDeleteTransaction,
  ContractUpdateTransaction,
  ContractFunctionParameters,
  ScheduleCreateTransaction,
  ScheduleSignTransaction,
  ScheduleDeleteTransaction,
  FileCreateTransaction,
  FileAppendTransaction,
  FileUpdateTransaction,
  FileDeleteTransaction,
  Hbar,
  PrivateKey,
  TokenType,
  TokenSupplyType,
  CustomFixedFee,
  CustomFractionalFee,
  CustomRoyaltyFee,
  NftId,
  Long,
  FeeAssessmentMethod,
  AccountId,
  Timestamp,
  type Key,
} from "@hiero-ledger/sdk";
import type {
  TransactionType,
  TransferParams,
  CreateAccountParams,
  UpdateAccountParams,
  DeleteAccountParams,
  ApproveAllowanceParams,
  CreateTokenParams,
  MintTokenParams,
  BurnTokenParams,
  TransferTokenParams,
  TransferNftParams,
  AssociateTokenParams,
  DissociateTokenParams,
  FreezeTokenParams,
  UnfreezeTokenParams,
  GrantKycParams,
  RevokeKycParams,
  PauseTokenParams,
  UnpauseTokenParams,
  WipeTokenParams,
  DeleteTokenParams,
  UpdateTokenParams,
  UpdateTokenFeeScheduleParams,
  CreateTopicParams,
  UpdateTopicParams,
  DeleteTopicParams,
  SubmitMessageParams,
  DeployContractParams,
  ExecuteContractParams,
  DeleteContractParams,
  UpdateContractParams,
  ScheduleTransactionParams,
  SignScheduleParams,
  DeleteScheduleParams,
  CreateFileParams,
  AppendFileParams,
  UpdateFileParams,
  DeleteFileParams,
  FunctionParamsConfig,
  CustomFeeParams,
  CustomFixedFeeParams,
  SigningContext,
} from "../types.ts";

type NativeTransaction =
  | TransferTransaction
  | AccountCreateTransaction
  | AccountUpdateTransaction
  | AccountDeleteTransaction
  | AccountAllowanceApproveTransaction
  | TokenCreateTransaction
  | TokenMintTransaction
  | TokenBurnTransaction
  | TokenAssociateTransaction
  | TokenDissociateTransaction
  | TokenFreezeTransaction
  | TokenUnfreezeTransaction
  | TokenGrantKycTransaction
  | TokenRevokeKycTransaction
  | TokenPauseTransaction
  | TokenUnpauseTransaction
  | TokenWipeTransaction
  | TokenDeleteTransaction
  | TokenUpdateTransaction
  | TokenFeeScheduleUpdateTransaction
  | TopicCreateTransaction
  | TopicUpdateTransaction
  | TopicDeleteTransaction
  | TopicMessageSubmitTransaction
  | ContractCreateTransaction
  | ContractExecuteTransaction
  | ContractDeleteTransaction
  | ContractUpdateTransaction
  | ScheduleCreateTransaction
  | ScheduleSignTransaction
  | ScheduleDeleteTransaction
  | FileCreateTransaction
  | FileAppendTransaction
  | FileUpdateTransaction
  | FileDeleteTransaction;

function resolveKeyParam(
  value: string | true,
  operatorKey?: string,
  signing?: SigningContext,
): Key {
  if (value === true) {
    if (signing?._tag === "signer") {
      const accountKey = signing.signer.getAccountKey?.();
      if (!accountKey) throw new Error("Signer account key required when key param is true");
      return accountKey;
    }

    if (!operatorKey) throw new Error("Operator key required when key param is true");
    return PrivateKey.fromStringDer(operatorKey).publicKey;
  }
  return PrivateKey.fromStringDer(value).publicKey;
}

function hexToBytes(hex: string): Uint8Array {
  const cleanHex = hex.startsWith("0x") ? hex.slice(2) : hex;
  const bytes = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(cleanHex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

function buildCustomFee(
  fee: CustomFeeParams,
): CustomFixedFee | CustomFractionalFee | CustomRoyaltyFee {
  if (fee.type === "fixed") {
    const f = new CustomFixedFee()
      .setAmount(Number(fee.amount))
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
    if (fee.netOfTransfers !== undefined)
      f.setAssessmentMethod(
        fee.netOfTransfers ? FeeAssessmentMethod.Inclusive : FeeAssessmentMethod.Exclusive,
      );
    return f;
  }

  const f = new CustomRoyaltyFee()
    .setNumerator(fee.numerator)
    .setDenominator(fee.denominator)
    .setFeeCollectorAccountId(fee.feeCollectorAccountId);
  if (fee.fallbackAmount !== undefined) {
    const fallback = new CustomFixedFee().setAmount(Number(fee.fallbackAmount));
    if (fee.fallbackDenominatingTokenId)
      fallback.setDenominatingTokenId(fee.fallbackDenominatingTokenId);
    f.setFallbackFee(fallback);
  }
  return f;
}

function buildTopicCustomFee(fee: CustomFixedFeeParams): CustomFixedFee {
  const f = new CustomFixedFee()
    .setAmount(Number(fee.amount))
    .setFeeCollectorAccountId(fee.feeCollectorAccountId);
  if (fee.denominatingTokenId) f.setDenominatingTokenId(fee.denominatingTokenId);
  return f;
}

function resolveTransfer(params: TransferParams): TransferTransaction {
  const tx = new TransferTransaction()
    .addHbarTransfer(params.from, new Hbar(params.amount).negated())
    .addHbarTransfer(params.to, new Hbar(params.amount));

  if (params.memo) tx.setTransactionMemo(params.memo);
  if (params.maxFee !== undefined) tx.setMaxTransactionFee(new Hbar(params.maxFee));

  return tx;
}

function resolveCreateAccount(params: CreateAccountParams): AccountCreateTransaction {
  const key = PrivateKey.fromStringDer(params.publicKey).publicKey;
  const tx = new AccountCreateTransaction().setKeyWithoutAlias(key);

  if (params.initialBalance !== undefined) tx.setInitialBalance(new Hbar(params.initialBalance));
  if (params.memo) tx.setAccountMemo(params.memo);
  if (params.maxAutomaticTokenAssociations !== undefined)
    tx.setMaxAutomaticTokenAssociations(params.maxAutomaticTokenAssociations);
  if (params.receiverSignatureRequired !== undefined)
    tx.setReceiverSignatureRequired(params.receiverSignatureRequired);
  if (params.autoRenewPeriodSeconds !== undefined)
    tx.setAutoRenewPeriod(params.autoRenewPeriodSeconds);
  if (params.maxFee !== undefined) tx.setMaxTransactionFee(new Hbar(params.maxFee));

  return tx;
}

function resolveUpdateAccount(params: UpdateAccountParams): AccountUpdateTransaction {
  const tx = new AccountUpdateTransaction().setAccountId(params.accountId);

  if (params.key) tx.setKey(PrivateKey.fromStringDer(params.key).publicKey);
  if (params.memo !== undefined) tx.setAccountMemo(params.memo);
  if (params.maxAutomaticTokenAssociations !== undefined)
    tx.setMaxAutomaticTokenAssociations(params.maxAutomaticTokenAssociations);
  if (params.autoRenewPeriodSeconds !== undefined)
    tx.setAutoRenewPeriod(params.autoRenewPeriodSeconds);
  if (params.expirationTime) tx.setExpirationTime(params.expirationTime);
  if (params.stakedAccountId) tx.setStakedAccountId(params.stakedAccountId);
  if (params.stakedNodeId !== undefined) tx.setStakedNodeId(params.stakedNodeId);
  if (params.declineStakingReward !== undefined)
    tx.setDeclineStakingReward(params.declineStakingReward);
  if (params.maxFee !== undefined) tx.setMaxTransactionFee(new Hbar(params.maxFee));

  return tx;
}

function resolveDeleteAccount(params: DeleteAccountParams): AccountDeleteTransaction {
  const tx = new AccountDeleteTransaction()
    .setAccountId(params.accountId)
    .setTransferAccountId(params.transferAccountId);

  if (params.maxFee !== undefined) tx.setMaxTransactionFee(new Hbar(params.maxFee));

  return tx;
}

function resolveApproveAllowance(
  params: ApproveAllowanceParams,
): AccountAllowanceApproveTransaction {
  const tx = new AccountAllowanceApproveTransaction();

  if (params.hbarAllowances) {
    for (const a of params.hbarAllowances) {
      tx.approveHbarAllowance(a.ownerAccountId, a.spenderAccountId, new Hbar(a.amount));
    }
  }

  if (params.tokenAllowances) {
    for (const a of params.tokenAllowances) {
      tx.approveTokenAllowance(
        a.tokenId,
        a.ownerAccountId,
        a.spenderAccountId,
        Long.fromString(String(a.amount)),
      );
    }
  }

  if (params.nftAllowances) {
    for (const a of params.nftAllowances) {
      if (a.approveAll) {
        tx.approveTokenNftAllowanceAllSerials(a.tokenId, a.ownerAccountId, a.spenderAccountId);
      } else if (a.serial !== undefined) {
        tx.approveTokenNftAllowance(
          NftId.fromString(`${a.tokenId}/${String(a.serial)}`),
          a.ownerAccountId,
          a.spenderAccountId,
        );
      }
    }
  }

  if (params.memo) tx.setTransactionMemo(params.memo);
  if (params.maxFee !== undefined) tx.setMaxTransactionFee(new Hbar(params.maxFee));

  return tx;
}

function resolveCreateToken(
  params: CreateTokenParams,
  operatorKey?: string,
  signing?: SigningContext,
): TokenCreateTransaction {
  const tx = new TokenCreateTransaction().setTokenName(params.name).setTokenSymbol(params.symbol);

  if (params.decimals !== undefined) tx.setDecimals(params.decimals);
  if (params.initialSupply !== undefined)
    tx.setInitialSupply(Long.fromString(String(params.initialSupply)));
  if (params.treasury) tx.setTreasuryAccountId(params.treasury);
  if (params.tokenType === "NON_FUNGIBLE_UNIQUE") tx.setTokenType(TokenType.NonFungibleUnique);
  if (params.tokenType === "FUNGIBLE_COMMON") tx.setTokenType(TokenType.FungibleCommon);
  if (params.supplyType === "FINITE") tx.setSupplyType(TokenSupplyType.Finite);
  if (params.supplyType === "INFINITE") tx.setSupplyType(TokenSupplyType.Infinite);
  if (params.maxSupply !== undefined) tx.setMaxSupply(Long.fromString(String(params.maxSupply)));
  if (params.freezeDefault !== undefined) tx.setFreezeDefault(params.freezeDefault);

  if (params.adminKey !== undefined)
    tx.setAdminKey(resolveKeyParam(params.adminKey, operatorKey, signing));
  if (params.kycKey !== undefined)
    tx.setKycKey(resolveKeyParam(params.kycKey, operatorKey, signing));
  if (params.freezeKey !== undefined)
    tx.setFreezeKey(resolveKeyParam(params.freezeKey, operatorKey, signing));
  if (params.wipeKey !== undefined)
    tx.setWipeKey(resolveKeyParam(params.wipeKey, operatorKey, signing));
  if (params.supplyKey !== undefined)
    tx.setSupplyKey(resolveKeyParam(params.supplyKey, operatorKey, signing));
  if (params.pauseKey !== undefined)
    tx.setPauseKey(resolveKeyParam(params.pauseKey, operatorKey, signing));
  if (params.metadataKey !== undefined)
    tx.setMetadataKey(resolveKeyParam(params.metadataKey, operatorKey, signing));
  if (params.feeScheduleKey !== undefined)
    tx.setFeeScheduleKey(resolveKeyParam(params.feeScheduleKey, operatorKey, signing));

  if (params.customFees) tx.setCustomFees(params.customFees.map(buildCustomFee));
  if (params.autoRenewAccountId) tx.setAutoRenewAccountId(params.autoRenewAccountId);
  if (params.autoRenewPeriodSeconds !== undefined)
    tx.setAutoRenewPeriod(params.autoRenewPeriodSeconds);
  if (params.expirationTime) tx.setExpirationTime(params.expirationTime);
  if (params.memo) tx.setTokenMemo(params.memo);
  if (params.maxFee !== undefined) tx.setMaxTransactionFee(new Hbar(params.maxFee));

  return tx;
}

function resolveMintToken(params: MintTokenParams): TokenMintTransaction {
  const tx = new TokenMintTransaction().setTokenId(params.tokenId);

  if (params.amount !== undefined) tx.setAmount(Long.fromString(String(params.amount)));
  if (params.metadata) {
    for (const m of params.metadata) {
      tx.addMetadata(m);
    }
  }
  if (params.memo) tx.setTransactionMemo(params.memo);
  if (params.maxFee !== undefined) tx.setMaxTransactionFee(new Hbar(params.maxFee));

  return tx;
}

function resolveBurnToken(params: BurnTokenParams): TokenBurnTransaction {
  const tx = new TokenBurnTransaction().setTokenId(params.tokenId);

  if (params.amount !== undefined) tx.setAmount(Long.fromString(String(params.amount)));
  if (params.serials) tx.setSerials(params.serials.map((s) => Long.fromNumber(s)));
  if (params.memo) tx.setTransactionMemo(params.memo);
  if (params.maxFee !== undefined) tx.setMaxTransactionFee(new Hbar(params.maxFee));

  return tx;
}

function resolveTransferToken(params: TransferTokenParams): TransferTransaction {
  const tx = new TransferTransaction()
    .addTokenTransfer(params.tokenId, params.from, Long.fromString(String(params.amount)).negate())
    .addTokenTransfer(params.tokenId, params.to, Long.fromString(String(params.amount)));

  if (params.memo) tx.setTransactionMemo(params.memo);
  if (params.maxFee !== undefined) tx.setMaxTransactionFee(new Hbar(params.maxFee));

  return tx;
}

function resolveTransferNft(params: TransferNftParams): TransferTransaction {
  const tx = new TransferTransaction().addNftTransfer(
    params.tokenId,
    params.serial,
    params.from,
    params.to,
  );

  if (params.memo) tx.setTransactionMemo(params.memo);
  if (params.maxFee !== undefined) tx.setMaxTransactionFee(new Hbar(params.maxFee));

  return tx;
}

function resolveAssociateToken(params: AssociateTokenParams): TokenAssociateTransaction {
  const tx = new TokenAssociateTransaction()
    .setAccountId(params.accountId)
    .setTokenIds([...params.tokenIds]);

  if (params.memo) tx.setTransactionMemo(params.memo);
  if (params.maxFee !== undefined) tx.setMaxTransactionFee(new Hbar(params.maxFee));

  return tx;
}

function resolveDissociateToken(params: DissociateTokenParams): TokenDissociateTransaction {
  const tx = new TokenDissociateTransaction()
    .setAccountId(params.accountId)
    .setTokenIds([...params.tokenIds]);

  if (params.memo) tx.setTransactionMemo(params.memo);
  if (params.maxFee !== undefined) tx.setMaxTransactionFee(new Hbar(params.maxFee));

  return tx;
}

function resolveFreezeToken(params: FreezeTokenParams): TokenFreezeTransaction {
  const tx = new TokenFreezeTransaction().setTokenId(params.tokenId).setAccountId(params.accountId);

  if (params.memo) tx.setTransactionMemo(params.memo);
  if (params.maxFee !== undefined) tx.setMaxTransactionFee(new Hbar(params.maxFee));

  return tx;
}

function resolveUnfreezeToken(params: UnfreezeTokenParams): TokenUnfreezeTransaction {
  const tx = new TokenUnfreezeTransaction()
    .setTokenId(params.tokenId)
    .setAccountId(params.accountId);

  if (params.memo) tx.setTransactionMemo(params.memo);
  if (params.maxFee !== undefined) tx.setMaxTransactionFee(new Hbar(params.maxFee));

  return tx;
}

function resolveGrantKyc(params: GrantKycParams): TokenGrantKycTransaction {
  const tx = new TokenGrantKycTransaction()
    .setTokenId(params.tokenId)
    .setAccountId(params.accountId);

  if (params.memo) tx.setTransactionMemo(params.memo);
  if (params.maxFee !== undefined) tx.setMaxTransactionFee(new Hbar(params.maxFee));

  return tx;
}

function resolveRevokeKyc(params: RevokeKycParams): TokenRevokeKycTransaction {
  const tx = new TokenRevokeKycTransaction()
    .setTokenId(params.tokenId)
    .setAccountId(params.accountId);

  if (params.memo) tx.setTransactionMemo(params.memo);
  if (params.maxFee !== undefined) tx.setMaxTransactionFee(new Hbar(params.maxFee));

  return tx;
}

function resolvePauseToken(params: PauseTokenParams): TokenPauseTransaction {
  const tx = new TokenPauseTransaction().setTokenId(params.tokenId);

  if (params.memo) tx.setTransactionMemo(params.memo);
  if (params.maxFee !== undefined) tx.setMaxTransactionFee(new Hbar(params.maxFee));

  return tx;
}

function resolveUnpauseToken(params: UnpauseTokenParams): TokenUnpauseTransaction {
  const tx = new TokenUnpauseTransaction().setTokenId(params.tokenId);

  if (params.memo) tx.setTransactionMemo(params.memo);
  if (params.maxFee !== undefined) tx.setMaxTransactionFee(new Hbar(params.maxFee));

  return tx;
}

function resolveWipeToken(params: WipeTokenParams): TokenWipeTransaction {
  const tx = new TokenWipeTransaction().setTokenId(params.tokenId).setAccountId(params.accountId);

  if (params.amount !== undefined) tx.setAmount(Long.fromString(String(params.amount)));
  if (params.serials) tx.setSerials(params.serials.map((s) => Long.fromNumber(s)));
  if (params.memo) tx.setTransactionMemo(params.memo);
  if (params.maxFee !== undefined) tx.setMaxTransactionFee(new Hbar(params.maxFee));

  return tx;
}

function resolveDeleteToken(params: DeleteTokenParams): TokenDeleteTransaction {
  const tx = new TokenDeleteTransaction().setTokenId(params.tokenId);

  if (params.memo) tx.setTransactionMemo(params.memo);
  if (params.maxFee !== undefined) tx.setMaxTransactionFee(new Hbar(params.maxFee));

  return tx;
}

function resolveUpdateToken(
  params: UpdateTokenParams,
  operatorKey?: string,
  signing?: SigningContext,
): TokenUpdateTransaction {
  const tx = new TokenUpdateTransaction().setTokenId(params.tokenId);

  if (params.name) tx.setTokenName(params.name);
  if (params.symbol) tx.setTokenSymbol(params.symbol);
  if (params.treasury) tx.setTreasuryAccountId(params.treasury);

  if (params.adminKey !== undefined)
    tx.setAdminKey(resolveKeyParam(params.adminKey, operatorKey, signing));
  if (params.kycKey !== undefined)
    tx.setKycKey(resolveKeyParam(params.kycKey, operatorKey, signing));
  if (params.freezeKey !== undefined)
    tx.setFreezeKey(resolveKeyParam(params.freezeKey, operatorKey, signing));
  if (params.wipeKey !== undefined)
    tx.setWipeKey(resolveKeyParam(params.wipeKey, operatorKey, signing));
  if (params.supplyKey !== undefined)
    tx.setSupplyKey(resolveKeyParam(params.supplyKey, operatorKey, signing));
  if (params.pauseKey !== undefined)
    tx.setPauseKey(resolveKeyParam(params.pauseKey, operatorKey, signing));
  if (params.metadataKey !== undefined)
    tx.setMetadataKey(resolveKeyParam(params.metadataKey, operatorKey, signing));
  if (params.feeScheduleKey !== undefined)
    tx.setFeeScheduleKey(resolveKeyParam(params.feeScheduleKey, operatorKey, signing));

  if (params.autoRenewAccountId) tx.setAutoRenewAccountId(params.autoRenewAccountId);
  if (params.autoRenewPeriodSeconds !== undefined)
    tx.setAutoRenewPeriod(params.autoRenewPeriodSeconds);
  if (params.expirationTime) tx.setExpirationTime(params.expirationTime);
  if (params.memo !== undefined) tx.setTokenMemo(params.memo);
  if (params.maxFee !== undefined) tx.setMaxTransactionFee(new Hbar(params.maxFee));

  return tx;
}

function resolveUpdateTokenFeeSchedule(
  params: UpdateTokenFeeScheduleParams,
): TokenFeeScheduleUpdateTransaction {
  const tx = new TokenFeeScheduleUpdateTransaction()
    .setTokenId(params.tokenId)
    .setCustomFees(params.customFees.map(buildCustomFee));

  if (params.memo) tx.setTransactionMemo(params.memo);
  if (params.maxFee !== undefined) tx.setMaxTransactionFee(new Hbar(params.maxFee));

  return tx;
}

function resolveCreateTopic(
  params: CreateTopicParams,
  operatorKey?: string,
  signing?: SigningContext,
): TopicCreateTransaction {
  const tx = new TopicCreateTransaction();

  if (params.adminKey !== undefined)
    tx.setAdminKey(resolveKeyParam(params.adminKey, operatorKey, signing));
  if (params.submitKey !== undefined)
    tx.setSubmitKey(resolveKeyParam(params.submitKey, operatorKey, signing));
  if (params.feeScheduleKey !== undefined)
    tx.setFeeScheduleKey(resolveKeyParam(params.feeScheduleKey, operatorKey, signing));
  if (params.autoRenewAccountId) tx.setAutoRenewAccountId(params.autoRenewAccountId);
  if (params.autoRenewPeriodSeconds !== undefined)
    tx.setAutoRenewPeriod(params.autoRenewPeriodSeconds);
  if (params.customFees) {
    for (const fee of params.customFees) {
      tx.addCustomFee(buildTopicCustomFee(fee));
    }
  }
  if (params.feeExemptKeys) {
    tx.setFeeExemptKeys(params.feeExemptKeys.map((k) => PrivateKey.fromStringDer(k).publicKey));
  }
  if (params.memo) tx.setTopicMemo(params.memo);
  if (params.maxFee !== undefined) tx.setMaxTransactionFee(new Hbar(params.maxFee));

  return tx;
}

function resolveUpdateTopic(
  params: UpdateTopicParams,
  operatorKey?: string,
  signing?: SigningContext,
): TopicUpdateTransaction {
  const tx = new TopicUpdateTransaction().setTopicId(params.topicId);

  if (params.adminKey !== undefined)
    tx.setAdminKey(resolveKeyParam(params.adminKey, operatorKey, signing));
  if (params.submitKey !== undefined)
    tx.setSubmitKey(resolveKeyParam(params.submitKey, operatorKey, signing));
  if (params.feeScheduleKey !== undefined)
    tx.setFeeScheduleKey(resolveKeyParam(params.feeScheduleKey, operatorKey, signing));
  if (params.autoRenewAccountId) tx.setAutoRenewAccountId(params.autoRenewAccountId);
  if (params.autoRenewPeriodSeconds !== undefined)
    tx.setAutoRenewPeriod(params.autoRenewPeriodSeconds);
  if (params.expirationTime) tx.setExpirationTime(params.expirationTime);
  if (params.customFees) {
    for (const fee of params.customFees) {
      tx.addCustomFee(buildTopicCustomFee(fee));
    }
  }
  if (params.feeExemptKeys) {
    tx.setFeeExemptKeys(params.feeExemptKeys.map((k) => PrivateKey.fromStringDer(k).publicKey));
  }

  if (params.clearAdminKey) tx.clearAdminKey();
  if (params.clearSubmitKey) tx.clearSubmitKey();
  if (params.clearAutoRenewAccountId) tx.clearAutoRenewAccountId();
  if (params.clearFeeScheduleKey) tx.clearFeeScheduleKey();
  if (params.clearFeeExemptKeys) tx.clearFeeExemptKeys();
  if (params.clearCustomFees) tx.clearCustomFees();

  if (params.memo !== undefined) tx.setTopicMemo(params.memo);
  if (params.maxFee !== undefined) tx.setMaxTransactionFee(new Hbar(params.maxFee));

  return tx;
}

function resolveDeleteTopic(params: DeleteTopicParams): TopicDeleteTransaction {
  const tx = new TopicDeleteTransaction().setTopicId(params.topicId);

  if (params.memo) tx.setTransactionMemo(params.memo);
  if (params.maxFee !== undefined) tx.setMaxTransactionFee(new Hbar(params.maxFee));

  return tx;
}

function resolveSubmitMessage(params: SubmitMessageParams): TopicMessageSubmitTransaction {
  const tx = new TopicMessageSubmitTransaction().setTopicId(params.topicId);

  if (typeof params.message === "string") {
    tx.setMessage(params.message);
  } else if (params.message instanceof Uint8Array) {
    tx.setMessage(params.message);
  } else {
    tx.setMessage(JSON.stringify(params.message));
  }

  if (params.maxChunks !== undefined) tx.setMaxChunks(params.maxChunks);
  if (params.chunkSize !== undefined) tx.setChunkSize(params.chunkSize);
  if (params.memo) tx.setTransactionMemo(params.memo);
  if (params.maxFee !== undefined) tx.setMaxTransactionFee(new Hbar(params.maxFee));

  return tx;
}

export function buildContractFunctionParameters(
  config: FunctionParamsConfig,
): ContractFunctionParameters {
  const cfp = new ContractFunctionParameters();
  for (let i = 0; i < config.types.length; i++) {
    const solType = config.types[i]!;
    const val = config.values[i];
    addSolidityParam(cfp, solType, val);
  }
  return cfp;
}

function addSolidityParam(cfp: ContractFunctionParameters, solType: string, val: unknown): void {
  switch (solType) {
    case "string":
      cfp.addString(val as string);
      break;
    case "bool":
      cfp.addBool(val as boolean);
      break;
    case "address":
      cfp.addAddress(val as string);
      break;
    case "bytes":
      cfp.addBytes(val as Uint8Array);
      break;
    case "bytes32":
      cfp.addBytes32(val as Uint8Array);
      break;
    case "int8":
      cfp.addInt8(val as number);
      break;
    case "int16":
      cfp.addInt16(val as number);
      break;
    case "int32":
      cfp.addInt32(val as number);
      break;
    case "int64":
      cfp.addInt64(Long.fromValue(val as number | string));
      break;
    case "int256":
      cfp.addInt256(Long.fromValue(val as number | string));
      break;
    case "uint8":
      cfp.addUint8(val as number);
      break;
    case "uint16":
      cfp.addUint16(val as number);
      break;
    case "uint32":
      cfp.addUint32(val as number);
      break;
    case "uint64":
      cfp.addUint64(Long.fromValue(val as number | string));
      break;
    case "uint256":
      cfp.addUint256(Long.fromValue(val as number | string));
      break;
    default:
      throw new Error(`Unsupported Solidity type: ${solType}`);
  }
}

function resolveDeployContract(
  params: DeployContractParams,
  operatorKey?: string,
  signing?: SigningContext,
): ContractCreateTransaction {
  const bytecodeBytes = hexToBytes(params.bytecode);
  const tx = new ContractCreateTransaction().setBytecode(bytecodeBytes);

  if (params.gas !== undefined) tx.setGas(params.gas);
  if (params.constructorParams) {
    tx.setConstructorParameters(buildContractFunctionParameters(params.constructorParams));
  }
  if (params.adminKey !== undefined)
    tx.setAdminKey(resolveKeyParam(params.adminKey, operatorKey, signing));
  if (params.initialBalance !== undefined) tx.setInitialBalance(new Hbar(params.initialBalance));
  if (params.autoRenewPeriodSeconds !== undefined)
    tx.setAutoRenewPeriod(params.autoRenewPeriodSeconds);
  if (params.autoRenewAccountId) tx.setAutoRenewAccountId(params.autoRenewAccountId);
  if (params.maxAutomaticTokenAssociations !== undefined)
    tx.setMaxAutomaticTokenAssociations(params.maxAutomaticTokenAssociations);
  if (params.stakedAccountId) tx.setStakedAccountId(params.stakedAccountId);
  if (params.stakedNodeId !== undefined) tx.setStakedNodeId(params.stakedNodeId);
  if (params.declineStakingReward !== undefined)
    tx.setDeclineStakingReward(params.declineStakingReward);
  if (params.memo) tx.setContractMemo(params.memo);
  if (params.maxFee !== undefined) tx.setMaxTransactionFee(new Hbar(params.maxFee));

  return tx;
}

function resolveExecuteContract(params: ExecuteContractParams): ContractExecuteTransaction {
  const tx = new ContractExecuteTransaction().setContractId(params.contractId);

  if (params.gas !== undefined) tx.setGas(params.gas);
  if (params.functionParams) {
    tx.setFunction(params.functionName, buildContractFunctionParameters(params.functionParams));
  } else {
    tx.setFunction(params.functionName);
  }
  if (params.payableAmount !== undefined) tx.setPayableAmount(new Hbar(params.payableAmount));
  if (params.memo) tx.setTransactionMemo(params.memo);
  if (params.maxFee !== undefined) tx.setMaxTransactionFee(new Hbar(params.maxFee));

  return tx;
}

function resolveDeleteContract(params: DeleteContractParams): ContractDeleteTransaction {
  const tx = new ContractDeleteTransaction().setContractId(params.contractId);

  if (params.transferAccountId) tx.setTransferAccountId(params.transferAccountId);
  if (params.transferContractId) tx.setTransferContractId(params.transferContractId);
  if (params.permanentRemoval !== undefined) tx.setPermanentRemoval(params.permanentRemoval);
  if (params.memo) tx.setTransactionMemo(params.memo);
  if (params.maxFee !== undefined) tx.setMaxTransactionFee(new Hbar(params.maxFee));

  return tx;
}

function resolveUpdateContract(
  params: UpdateContractParams,
  operatorKey?: string,
  signing?: SigningContext,
): ContractUpdateTransaction {
  const tx = new ContractUpdateTransaction().setContractId(params.contractId);

  if (params.adminKey !== undefined)
    tx.setAdminKey(resolveKeyParam(params.adminKey, operatorKey, signing));
  if (params.expirationTime) tx.setExpirationTime(params.expirationTime);
  if (params.autoRenewPeriodSeconds !== undefined)
    tx.setAutoRenewPeriod(params.autoRenewPeriodSeconds);
  if (params.autoRenewAccountId) tx.setAutoRenewAccountId(params.autoRenewAccountId);
  if (params.maxAutomaticTokenAssociations !== undefined)
    tx.setMaxAutomaticTokenAssociations(params.maxAutomaticTokenAssociations);
  if (params.stakedAccountId) tx.setStakedAccountId(params.stakedAccountId);
  if (params.stakedNodeId !== undefined) tx.setStakedNodeId(params.stakedNodeId);
  if (params.declineStakingReward !== undefined)
    tx.setDeclineStakingReward(params.declineStakingReward);
  if (params.memo !== undefined) tx.setContractMemo(params.memo);
  if (params.maxFee !== undefined) tx.setMaxTransactionFee(new Hbar(params.maxFee));

  return tx;
}

function resolveScheduleTransaction(
  params: ScheduleTransactionParams,
  operatorKey?: string,
  signing?: SigningContext,
): ScheduleCreateTransaction {
  const innerTx = resolveTransaction(
    params.transaction.type,
    params.transaction.params,
    operatorKey,
    signing,
  );
  const tx = new ScheduleCreateTransaction().setScheduledTransaction(innerTx);

  if (params.adminKey !== undefined)
    tx.setAdminKey(resolveKeyParam(params.adminKey, operatorKey, signing));
  if (params.payerAccountId) tx.setPayerAccountId(AccountId.fromString(params.payerAccountId));
  if (params.expirationTime) tx.setExpirationTime(Timestamp.fromDate(params.expirationTime));
  if (params.waitForExpiry !== undefined) tx.setWaitForExpiry(params.waitForExpiry);
  if (params.memo) tx.setScheduleMemo(params.memo);
  if (params.maxFee !== undefined) tx.setMaxTransactionFee(new Hbar(params.maxFee));

  return tx;
}

function resolveSignSchedule(params: SignScheduleParams): ScheduleSignTransaction {
  const tx = new ScheduleSignTransaction().setScheduleId(params.scheduleId);

  if (params.memo) tx.setTransactionMemo(params.memo);
  if (params.maxFee !== undefined) tx.setMaxTransactionFee(new Hbar(params.maxFee));

  return tx;
}

function resolveDeleteSchedule(params: DeleteScheduleParams): ScheduleDeleteTransaction {
  const tx = new ScheduleDeleteTransaction().setScheduleId(params.scheduleId);

  if (params.memo) tx.setTransactionMemo(params.memo);
  if (params.maxFee !== undefined) tx.setMaxTransactionFee(new Hbar(params.maxFee));

  return tx;
}

function resolveCreateFile(params: CreateFileParams): FileCreateTransaction {
  const tx = new FileCreateTransaction();

  if (typeof params.contents === "string") {
    tx.setContents(params.contents);
  } else {
    tx.setContents(params.contents);
  }
  if (params.keys) {
    tx.setKeys(params.keys.map((k) => PrivateKey.fromStringDer(k).publicKey));
  }
  if (params.expirationTime) tx.setExpirationTime(params.expirationTime);
  if (params.memo) tx.setFileMemo(params.memo);
  if (params.maxFee !== undefined) tx.setMaxTransactionFee(new Hbar(params.maxFee));

  return tx;
}

function resolveAppendFile(params: AppendFileParams): FileAppendTransaction {
  const tx = new FileAppendTransaction().setFileId(params.fileId);

  if (typeof params.contents === "string") {
    tx.setContents(params.contents);
  } else {
    tx.setContents(params.contents);
  }
  if (params.maxChunks !== undefined) tx.setMaxChunks(params.maxChunks);
  if (params.chunkSize !== undefined) tx.setChunkSize(params.chunkSize);
  if (params.memo) tx.setTransactionMemo(params.memo);
  if (params.maxFee !== undefined) tx.setMaxTransactionFee(new Hbar(params.maxFee));

  return tx;
}

function resolveUpdateFile(params: UpdateFileParams): FileUpdateTransaction {
  const tx = new FileUpdateTransaction().setFileId(params.fileId);

  if (params.contents !== undefined) {
    if (typeof params.contents === "string") {
      tx.setContents(params.contents);
    } else {
      tx.setContents(params.contents);
    }
  }
  if (params.keys) {
    tx.setKeys(params.keys.map((k) => PrivateKey.fromStringDer(k).publicKey));
  }
  if (params.expirationTime) tx.setExpirationTime(params.expirationTime);
  if (params.memo) tx.setFileMemo(params.memo);
  if (params.maxFee !== undefined) tx.setMaxTransactionFee(new Hbar(params.maxFee));

  return tx;
}

function resolveDeleteFile(params: DeleteFileParams): FileDeleteTransaction {
  const tx = new FileDeleteTransaction().setFileId(params.fileId);

  if (params.memo) tx.setTransactionMemo(params.memo);
  if (params.maxFee !== undefined) tx.setMaxTransactionFee(new Hbar(params.maxFee));

  return tx;
}

export function resolveTransaction(
  type: TransactionType,
  params: Record<string, unknown>,
  operatorKey?: string,
  signing?: SigningContext,
): NativeTransaction {
  switch (type) {
    case "transfer":
      return resolveTransfer(params as unknown as TransferParams);
    case "createAccount":
      return resolveCreateAccount(params as unknown as CreateAccountParams);
    case "updateAccount":
      return resolveUpdateAccount(params as unknown as UpdateAccountParams);
    case "deleteAccount":
      return resolveDeleteAccount(params as unknown as DeleteAccountParams);
    case "approveAllowance":
      return resolveApproveAllowance(params as unknown as ApproveAllowanceParams);
    case "createToken":
      return resolveCreateToken(params as unknown as CreateTokenParams, operatorKey, signing);
    case "mintToken":
      return resolveMintToken(params as unknown as MintTokenParams);
    case "burnToken":
      return resolveBurnToken(params as unknown as BurnTokenParams);
    case "transferToken":
      return resolveTransferToken(params as unknown as TransferTokenParams);
    case "transferNft":
      return resolveTransferNft(params as unknown as TransferNftParams);
    case "associateToken":
      return resolveAssociateToken(params as unknown as AssociateTokenParams);
    case "dissociateToken":
      return resolveDissociateToken(params as unknown as DissociateTokenParams);
    case "freezeToken":
      return resolveFreezeToken(params as unknown as FreezeTokenParams);
    case "unfreezeToken":
      return resolveUnfreezeToken(params as unknown as UnfreezeTokenParams);
    case "grantKyc":
      return resolveGrantKyc(params as unknown as GrantKycParams);
    case "revokeKyc":
      return resolveRevokeKyc(params as unknown as RevokeKycParams);
    case "pauseToken":
      return resolvePauseToken(params as unknown as PauseTokenParams);
    case "unpauseToken":
      return resolveUnpauseToken(params as unknown as UnpauseTokenParams);
    case "wipeToken":
      return resolveWipeToken(params as unknown as WipeTokenParams);
    case "deleteToken":
      return resolveDeleteToken(params as unknown as DeleteTokenParams);
    case "updateToken":
      return resolveUpdateToken(params as unknown as UpdateTokenParams, operatorKey, signing);
    case "updateTokenFeeSchedule":
      return resolveUpdateTokenFeeSchedule(params as unknown as UpdateTokenFeeScheduleParams);
    case "createTopic":
      return resolveCreateTopic(params as unknown as CreateTopicParams, operatorKey, signing);
    case "updateTopic":
      return resolveUpdateTopic(params as unknown as UpdateTopicParams, operatorKey, signing);
    case "deleteTopic":
      return resolveDeleteTopic(params as unknown as DeleteTopicParams);
    case "submitMessage":
      return resolveSubmitMessage(params as unknown as SubmitMessageParams);
    case "deployContract":
      return resolveDeployContract(params as unknown as DeployContractParams, operatorKey, signing);
    case "executeContract":
      return resolveExecuteContract(params as unknown as ExecuteContractParams);
    case "deleteContract":
      return resolveDeleteContract(params as unknown as DeleteContractParams);
    case "updateContract":
      return resolveUpdateContract(params as unknown as UpdateContractParams, operatorKey, signing);
    case "scheduleTransaction":
      return resolveScheduleTransaction(
        params as unknown as ScheduleTransactionParams,
        operatorKey,
        signing,
      );
    case "signSchedule":
      return resolveSignSchedule(params as unknown as SignScheduleParams);
    case "deleteSchedule":
      return resolveDeleteSchedule(params as unknown as DeleteScheduleParams);
    case "createFile":
      return resolveCreateFile(params as unknown as CreateFileParams);
    case "appendFile":
      return resolveAppendFile(params as unknown as AppendFileParams);
    case "updateFile":
      return resolveUpdateFile(params as unknown as UpdateFileParams);
    case "deleteFile":
      return resolveDeleteFile(params as unknown as DeleteFileParams);
  }
}
