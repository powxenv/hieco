import type { CreateAccountParams, RetryConfig, Mutable } from "../types.ts";

export class AccountBuilder {
  private readonly params: Mutable<Partial<CreateAccountParams>> = {};

  publicKey(key: string): AccountBuilder {
    this.params.publicKey = key;
    return this;
  }

  initialBalance(balance: number | string): AccountBuilder {
    this.params.initialBalance = balance;
    return this;
  }

  memo(memo: string): AccountBuilder {
    this.params.memo = memo;
    return this;
  }

  maxAutomaticTokenAssociations(max: number): AccountBuilder {
    this.params.maxAutomaticTokenAssociations = max;
    return this;
  }

  receiverSignatureRequired(required: boolean): AccountBuilder {
    this.params.receiverSignatureRequired = required;
    return this;
  }

  autoRenewPeriodSeconds(seconds: number): AccountBuilder {
    this.params.autoRenewPeriodSeconds = seconds;
    return this;
  }

  maxFee(fee: number | string): AccountBuilder {
    this.params.maxFee = fee;
    return this;
  }

  retry(config: RetryConfig | false): AccountBuilder {
    this.params.retry = config;
    return this;
  }

  build(): CreateAccountParams {
    if (!this.params.publicKey) throw new Error("Public key is required");

    return this.params as CreateAccountParams;
  }
}
