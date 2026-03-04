import type {
  DeployContractParams,
  ConstructorParamsConfig,
  RetryConfig,
  Mutable,
} from "../types.ts";
import type { EntityId } from "@hieco/types";

export class ContractBuilder {
  private readonly params: Mutable<Partial<DeployContractParams>> = {};

  bytecode(bytecode: string): ContractBuilder {
    this.params.bytecode = bytecode;
    return this;
  }

  gas(gas: number): ContractBuilder {
    this.params.gas = gas;
    return this;
  }

  constructorParams(config: ConstructorParamsConfig): ContractBuilder {
    this.params.constructorParams = config;
    return this;
  }

  adminKey(key: string | true): ContractBuilder {
    this.params.adminKey = key;
    return this;
  }

  initialBalance(balance: number | string): ContractBuilder {
    this.params.initialBalance = balance;
    return this;
  }

  autoRenewPeriodSeconds(seconds: number): ContractBuilder {
    this.params.autoRenewPeriodSeconds = seconds;
    return this;
  }

  autoRenewAccountId(accountId: EntityId): ContractBuilder {
    this.params.autoRenewAccountId = accountId;
    return this;
  }

  maxAutomaticTokenAssociations(max: number): ContractBuilder {
    this.params.maxAutomaticTokenAssociations = max;
    return this;
  }

  stakedAccountId(accountId: EntityId): ContractBuilder {
    this.params.stakedAccountId = accountId;
    return this;
  }

  stakedNodeId(nodeId: number): ContractBuilder {
    this.params.stakedNodeId = nodeId;
    return this;
  }

  declineStakingReward(decline: boolean): ContractBuilder {
    this.params.declineStakingReward = decline;
    return this;
  }

  memo(memo: string): ContractBuilder {
    this.params.memo = memo;
    return this;
  }

  maxFee(fee: number | string): ContractBuilder {
    this.params.maxFee = fee;
    return this;
  }

  retry(config: RetryConfig | false): ContractBuilder {
    this.params.retry = config;
    return this;
  }

  build(): DeployContractParams {
    if (!this.params.bytecode) throw new Error("Contract bytecode is required");

    return this.params as DeployContractParams;
  }
}
