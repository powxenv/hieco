import type {
  CreateTokenParams,
  TokenTypeParam,
  TokenSupplyTypeParam,
  CustomFeeParams,
  RetryConfig,
  Mutable,
} from "../types.ts";
import type { EntityId } from "@hieco/types";

export class TokenBuilder {
  private readonly params: Mutable<Partial<CreateTokenParams>> = {};

  name(name: string): TokenBuilder {
    this.params.name = name;
    return this;
  }

  symbol(symbol: string): TokenBuilder {
    this.params.symbol = symbol;
    return this;
  }

  decimals(decimals: number): TokenBuilder {
    this.params.decimals = decimals;
    return this;
  }

  initialSupply(supply: number | string): TokenBuilder {
    this.params.initialSupply = supply;
    return this;
  }

  treasury(treasury: EntityId): TokenBuilder {
    this.params.treasury = treasury;
    return this;
  }

  tokenType(tokenType: TokenTypeParam): TokenBuilder {
    this.params.tokenType = tokenType;
    return this;
  }

  supplyType(supplyType: TokenSupplyTypeParam): TokenBuilder {
    this.params.supplyType = supplyType;
    return this;
  }

  maxSupply(maxSupply: number | string): TokenBuilder {
    this.params.maxSupply = maxSupply;
    return this;
  }

  freezeDefault(freeze: boolean): TokenBuilder {
    this.params.freezeDefault = freeze;
    return this;
  }

  adminKey(key: string | true): TokenBuilder {
    this.params.adminKey = key;
    return this;
  }

  kycKey(key: string | true): TokenBuilder {
    this.params.kycKey = key;
    return this;
  }

  freezeKey(key: string | true): TokenBuilder {
    this.params.freezeKey = key;
    return this;
  }

  wipeKey(key: string | true): TokenBuilder {
    this.params.wipeKey = key;
    return this;
  }

  supplyKey(key: string | true): TokenBuilder {
    this.params.supplyKey = key;
    return this;
  }

  pauseKey(key: string | true): TokenBuilder {
    this.params.pauseKey = key;
    return this;
  }

  metadataKey(key: string | true): TokenBuilder {
    this.params.metadataKey = key;
    return this;
  }

  feeScheduleKey(key: string | true): TokenBuilder {
    this.params.feeScheduleKey = key;
    return this;
  }

  customFees(fees: ReadonlyArray<CustomFeeParams>): TokenBuilder {
    this.params.customFees = fees;
    return this;
  }

  autoRenewAccountId(accountId: EntityId): TokenBuilder {
    this.params.autoRenewAccountId = accountId;
    return this;
  }

  autoRenewPeriodSeconds(seconds: number): TokenBuilder {
    this.params.autoRenewPeriodSeconds = seconds;
    return this;
  }

  expirationTime(time: Date): TokenBuilder {
    this.params.expirationTime = time;
    return this;
  }

  memo(memo: string): TokenBuilder {
    this.params.memo = memo;
    return this;
  }

  maxFee(fee: number | string): TokenBuilder {
    this.params.maxFee = fee;
    return this;
  }

  retry(config: RetryConfig | false): TokenBuilder {
    this.params.retry = config;
    return this;
  }

  build(): CreateTokenParams {
    if (!this.params.name) throw new Error("Token name is required");
    if (!this.params.symbol) throw new Error("Token symbol is required");

    return this.params as CreateTokenParams;
  }
}
