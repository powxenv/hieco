import type { CreateTopicParams, CustomFixedFeeParams, RetryConfig, Mutable } from "../types.ts";
import type { EntityId } from "@hieco/types";

export class TopicBuilder {
  private readonly params: Mutable<Partial<CreateTopicParams>> = {};

  adminKey(key: string | true): TopicBuilder {
    this.params.adminKey = key;
    return this;
  }

  submitKey(key: string | true): TopicBuilder {
    this.params.submitKey = key;
    return this;
  }

  feeScheduleKey(key: string | true): TopicBuilder {
    this.params.feeScheduleKey = key;
    return this;
  }

  autoRenewAccountId(accountId: EntityId): TopicBuilder {
    this.params.autoRenewAccountId = accountId;
    return this;
  }

  autoRenewPeriodSeconds(seconds: number): TopicBuilder {
    this.params.autoRenewPeriodSeconds = seconds;
    return this;
  }

  customFees(fees: ReadonlyArray<CustomFixedFeeParams>): TopicBuilder {
    this.params.customFees = fees;
    return this;
  }

  feeExemptKeys(keys: ReadonlyArray<string>): TopicBuilder {
    this.params.feeExemptKeys = keys;
    return this;
  }

  memo(memo: string): TopicBuilder {
    this.params.memo = memo;
    return this;
  }

  maxFee(fee: number | string): TopicBuilder {
    this.params.maxFee = fee;
    return this;
  }

  retry(config: RetryConfig | false): TopicBuilder {
    this.params.retry = config;
    return this;
  }

  build(): CreateTopicParams {
    return this.params as CreateTopicParams;
  }
}
