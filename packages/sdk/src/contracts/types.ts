import type { Amount } from "../shared/amount.ts";
import type { ReturnTypeHint } from "./abi.ts";

export interface ConstructorParamsConfig {
  readonly types: ReadonlyArray<string>;
  readonly values: ReadonlyArray<unknown>;
}

export interface FunctionParamsConfig {
  readonly types: ReadonlyArray<string>;
  readonly values: ReadonlyArray<unknown>;
}

export interface DeployContractBase {
  readonly gas?: number;
  readonly constructorParams?: ConstructorParamsConfig;
  readonly adminKey?: string | true;
  readonly initialBalance?: Amount;
  readonly autoRenewPeriodSeconds?: number;
  readonly autoRenewAccountId?: string;
  readonly maxAutomaticTokenAssociations?: number;
  readonly stakedAccountId?: string;
  readonly stakedNodeId?: number;
  readonly declineStakingReward?: boolean;
  readonly memo?: string;
  readonly maxFee?: Amount;
}

export type DeployContractParams =
  | (DeployContractBase & {
      readonly bytecode: string;
      readonly bytecodeFileId?: never;
    })
  | (DeployContractBase & {
      readonly bytecode?: never;
      readonly bytecodeFileId: string;
    });

export interface DeployArtifactParams extends DeployContractBase {
  readonly bytecode: string | Uint8Array;
  readonly chunkSize?: number;
  readonly fileKeys?: ReadonlyArray<string>;
  readonly forceFile?: boolean;
}

export interface AccountInfoFlowOptions {
  readonly maxAttempts?: number;
  readonly retryDelayMs?: number;
}

export interface ExecuteContractParams {
  readonly id: string;
  readonly fn: string;
  readonly args?: ReadonlyArray<unknown>;
  readonly gas?: number;
  readonly payableAmount?: Amount;
  readonly memo?: string;
  readonly maxFee?: Amount;
}

export interface ExecuteContractParamsTyped {
  readonly id: string;
  readonly fn: string;
  readonly params: FunctionParamsConfig;
  readonly gas?: number;
  readonly payableAmount?: Amount;
  readonly memo?: string;
  readonly maxFee?: Amount;
}

export interface CallContractParams {
  readonly id: string;
  readonly fn: string;
  readonly args?: ReadonlyArray<unknown>;
  readonly gas?: number;
  readonly senderAccountId?: string;
  readonly returns?: ReturnTypeHint;
}

export interface DeleteContractParams {
  readonly contractId: string;
  readonly transferAccountId?: string;
  readonly transferContractId?: string;
  readonly permanentRemoval?: boolean;
  readonly memo?: string;
  readonly maxFee?: Amount;
}

export interface UpdateContractParams {
  readonly contractId: string;
  readonly adminKey?: string | true;
  readonly expirationTime?: Date;
  readonly autoRenewPeriodSeconds?: number;
  readonly autoRenewAccountId?: string;
  readonly maxAutomaticTokenAssociations?: number;
  readonly stakedAccountId?: string;
  readonly stakedNodeId?: number;
  readonly declineStakingReward?: boolean;
  readonly memo?: string;
  readonly maxFee?: Amount;
}
