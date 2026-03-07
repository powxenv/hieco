import type { EntityId } from "@hieco/utils";
import type {
  AdjustAllowanceParams,
  ApproveAllowanceParams,
  CreateAccountParams,
  DeleteAccountParams,
  DeleteNftAllowancesParams,
  TransferParams,
  UpdateAccountParams,
} from "../accounts/types.ts";
import type {
  DeleteContractParams,
  DeployContractParams,
  ExecuteContractParams,
  ExecuteContractParamsTyped,
  UpdateContractParams,
} from "../contracts/types.ts";
import type {
  AppendFileParams,
  CreateFileParams,
  DeleteFileParams,
  UpdateFileParams,
} from "../files/types.ts";
import type {
  FreezeNetworkParams,
  NodeCreateParams,
  NodeDeleteParams,
  NodeUpdateParams,
  SystemDeleteParams,
  SystemUndeleteParams,
} from "../network/types.ts";
import type {
  ScheduleCreateParams,
  ScheduleDeleteParams,
  ScheduleSignParams,
} from "../schedules/types.ts";
import type { Amount } from "../shared/amount.ts";
import type {
  CreateTopicParams,
  DeleteTopicParams,
  SubmitMessageParams,
  UpdateTopicParams,
} from "../topics/types.ts";
import type {
  AssociateTokenParams,
  BurnTokenParams,
  CreateTokenParams,
  DeleteTokenParams,
  DissociateTokenParams,
  FreezeTokenParams,
  GrantKycParams,
  MintTokenParams,
  PauseTokenParams,
  RevokeKycParams,
  TokenAirdropParams,
  TokenCancelAirdropParams,
  TokenClaimAirdropParams,
  TokenRejectParams,
  TokenUpdateNftsParams,
  TransferNftParams,
  TransferTokenParams,
  UnfreezeTokenParams,
  UnpauseTokenParams,
  UpdateTokenFeeScheduleParams,
  UpdateTokenParams,
  WipeTokenParams,
} from "../tokens/types.ts";

export interface LiveHashAddParams {
  readonly accountId: EntityId;
  readonly hash: Uint8Array;
  readonly keys: ReadonlyArray<string>;
  readonly durationSeconds: number;
  readonly memo?: string;
  readonly maxFee?: Amount;
}

export interface LiveHashDeleteParams {
  readonly accountId: EntityId;
  readonly hash: Uint8Array;
  readonly memo?: string;
  readonly maxFee?: Amount;
}

export interface LiveHashQueryParams {
  readonly accountId: EntityId;
  readonly hash: Uint8Array;
}

export interface EthereumSendRawParams {
  readonly ethereumData: Uint8Array | string;
  readonly callDataFileId?: EntityId;
  readonly maxGasAllowance?: Amount;
  readonly memo?: string;
  readonly maxFee?: Amount;
}

export interface PrngParams {
  readonly range?: number;
  readonly memo?: string;
  readonly maxFee?: Amount;
}

export interface BatchAtomicParams {
  readonly txs: ReadonlyArray<TransactionDescriptor>;
  readonly batchKey: string;
  readonly memo?: string;
  readonly maxFee?: Amount;
}

export type TransactionDescriptor =
  | { readonly kind: "accounts.transfer"; readonly params: TransferParams }
  | { readonly kind: "accounts.create"; readonly params: CreateAccountParams }
  | { readonly kind: "accounts.update"; readonly params: UpdateAccountParams }
  | { readonly kind: "accounts.delete"; readonly params: DeleteAccountParams }
  | { readonly kind: "accounts.allowances"; readonly params: ApproveAllowanceParams }
  | { readonly kind: "accounts.allowances.adjust"; readonly params: AdjustAllowanceParams }
  | { readonly kind: "accounts.allowances.deleteNft"; readonly params: DeleteNftAllowancesParams }
  | { readonly kind: "legacy.liveHash.add"; readonly params: LiveHashAddParams }
  | { readonly kind: "legacy.liveHash.delete"; readonly params: LiveHashDeleteParams }
  | { readonly kind: "tokens.create"; readonly params: CreateTokenParams }
  | { readonly kind: "tokens.mint"; readonly params: MintTokenParams }
  | { readonly kind: "tokens.burn"; readonly params: BurnTokenParams }
  | { readonly kind: "tokens.transfer"; readonly params: TransferTokenParams }
  | { readonly kind: "tokens.transferNft"; readonly params: TransferNftParams }
  | { readonly kind: "tokens.associate"; readonly params: AssociateTokenParams }
  | { readonly kind: "tokens.dissociate"; readonly params: DissociateTokenParams }
  | { readonly kind: "tokens.freeze"; readonly params: FreezeTokenParams }
  | { readonly kind: "tokens.unfreeze"; readonly params: UnfreezeTokenParams }
  | { readonly kind: "tokens.grantKyc"; readonly params: GrantKycParams }
  | { readonly kind: "tokens.revokeKyc"; readonly params: RevokeKycParams }
  | { readonly kind: "tokens.pause"; readonly params: PauseTokenParams }
  | { readonly kind: "tokens.unpause"; readonly params: UnpauseTokenParams }
  | { readonly kind: "tokens.wipe"; readonly params: WipeTokenParams }
  | { readonly kind: "tokens.delete"; readonly params: DeleteTokenParams }
  | { readonly kind: "tokens.update"; readonly params: UpdateTokenParams }
  | { readonly kind: "tokens.fees"; readonly params: UpdateTokenFeeScheduleParams }
  | { readonly kind: "topics.create"; readonly params: CreateTopicParams }
  | { readonly kind: "topics.update"; readonly params: UpdateTopicParams }
  | { readonly kind: "topics.delete"; readonly params: DeleteTopicParams }
  | { readonly kind: "topics.submit"; readonly params: SubmitMessageParams }
  | { readonly kind: "contracts.deploy"; readonly params: DeployContractParams }
  | { readonly kind: "contracts.execute"; readonly params: ExecuteContractParams }
  | { readonly kind: "contracts.execute.typed"; readonly params: ExecuteContractParamsTyped }
  | { readonly kind: "contracts.delete"; readonly params: DeleteContractParams }
  | { readonly kind: "contracts.update"; readonly params: UpdateContractParams }
  | { readonly kind: "files.create"; readonly params: CreateFileParams }
  | { readonly kind: "files.append"; readonly params: AppendFileParams }
  | { readonly kind: "files.update"; readonly params: UpdateFileParams }
  | { readonly kind: "files.delete"; readonly params: DeleteFileParams }
  | { readonly kind: "tokens.airdrop"; readonly params: TokenAirdropParams }
  | { readonly kind: "tokens.claimAirdrop"; readonly params: TokenClaimAirdropParams }
  | { readonly kind: "tokens.cancelAirdrop"; readonly params: TokenCancelAirdropParams }
  | { readonly kind: "tokens.reject"; readonly params: TokenRejectParams }
  | { readonly kind: "tokens.updateNfts"; readonly params: TokenUpdateNftsParams }
  | { readonly kind: "nodes.create"; readonly params: NodeCreateParams }
  | { readonly kind: "nodes.update"; readonly params: NodeUpdateParams }
  | { readonly kind: "nodes.delete"; readonly params: NodeDeleteParams }
  | { readonly kind: "system.freeze"; readonly params: FreezeNetworkParams }
  | { readonly kind: "system.delete"; readonly params: SystemDeleteParams }
  | { readonly kind: "system.undelete"; readonly params: SystemUndeleteParams }
  | { readonly kind: "evm.ethereum"; readonly params: EthereumSendRawParams }
  | { readonly kind: "util.random"; readonly params: PrngParams }
  | { readonly kind: "batch.atomic"; readonly params: BatchAtomicParams }
  | { readonly kind: "schedules.create"; readonly params: ScheduleCreateParams }
  | { readonly kind: "schedules.sign"; readonly params: ScheduleSignParams }
  | { readonly kind: "schedules.delete"; readonly params: ScheduleDeleteParams };
