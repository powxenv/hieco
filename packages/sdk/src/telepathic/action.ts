export interface ActionPlan<T> {
  readonly now: () => Promise<T>;
  readonly tx: () => import("../foundation/results.ts").Result<
    import("../foundation/params.ts").TransactionDescriptor
  >;
  readonly schedule: (params?: {
    readonly adminKey?: string | true;
    readonly payerAccountId?: import("@hieco/utils").EntityId;
    readonly expirationTime?: Date;
    readonly waitForExpiry?: boolean;
    readonly memo?: string;
    readonly maxFee?: import("../foundation/params.ts").Amount;
  }) => Promise<
    import("../foundation/results.ts").Result<
      import("../foundation/results-shapes.ts").ScheduleReceipt
    >
  >;
}

export function actionPlan<T>(input: {
  readonly execute: () => Promise<T>;
  readonly descriptor?: () => import("../foundation/params.ts").TransactionDescriptor;
  readonly schedule?: (
    params: {
      readonly adminKey?: string | true;
      readonly payerAccountId?: import("@hieco/utils").EntityId;
      readonly expirationTime?: Date;
      readonly waitForExpiry?: boolean;
      readonly memo?: string;
      readonly maxFee?: import("../foundation/params.ts").Amount;
    },
    descriptor: import("../foundation/params.ts").TransactionDescriptor,
  ) => Promise<
    import("../foundation/results.ts").Result<
      import("../foundation/results-shapes.ts").ScheduleReceipt
    >
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
