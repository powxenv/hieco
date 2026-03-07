export interface ActionPlan<T> {
  readonly now: () => Promise<T>;
  readonly tx: () => import("../results/result.ts").Result<
    import("../shared/params.ts").TransactionDescriptor
  >;
  readonly schedule: (params?: {
    readonly adminKey?: string | true;
    readonly payerAccountId?: string;
    readonly expirationTime?: Date;
    readonly waitForExpiry?: boolean;
    readonly memo?: string;
    readonly maxFee?: import("../shared/params.ts").Amount;
  }) => Promise<
    import("../results/result.ts").Result<import("../results/shapes.ts").ScheduleReceipt>
  >;
}

export function actionPlan<T>(input: {
  readonly execute: () => Promise<T>;
  readonly descriptor?: () => import("../shared/params.ts").TransactionDescriptor;
  readonly schedule?: (
    params: {
      readonly adminKey?: string | true;
      readonly payerAccountId?: string;
      readonly expirationTime?: Date;
      readonly waitForExpiry?: boolean;
      readonly memo?: string;
      readonly maxFee?: import("../shared/params.ts").Amount;
    },
    descriptor: import("../shared/params.ts").TransactionDescriptor,
  ) => Promise<
    import("../results/result.ts").Result<import("../results/shapes.ts").ScheduleReceipt>
  >;
}): ActionPlan<T> {
  return {
    now: input.execute,
    tx: () => {
      if (!input.descriptor) {
        return {
          ok: false,
          error: {
            code: "UNEXPECTED_ERROR",
            message: "Transaction descriptor is unavailable for this action",
          },
        };
      }
      return { ok: true, value: input.descriptor() };
    },
    schedule: async (params = {}) => {
      if (!input.descriptor || !input.schedule) {
        return {
          ok: false,
          error: {
            code: "UNEXPECTED_ERROR",
            message: "Scheduling is unavailable for this action",
          },
        };
      }
      return input.schedule(params, input.descriptor());
    },
  };
}
