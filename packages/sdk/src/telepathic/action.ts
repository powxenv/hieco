import type { Result } from "../foundation/results.ts";
import type { TransactionDescriptor, ScheduleCreateParams } from "../foundation/params.ts";
import type { ScheduleReceipt } from "../foundation/results-shapes.ts";
import { err, ok } from "../foundation/results.ts";
import { createError } from "../foundation/errors.ts";

type ActionExecutor<R> = () => Promise<R>;

type DescriptorFactory = () => TransactionDescriptor;

type ScheduleExecutor = (
  params: Omit<ScheduleCreateParams, "tx">,
  descriptor: TransactionDescriptor,
) => Promise<Result<ScheduleReceipt>>;

export class ActionPlan<T> {
  readonly #execute: ActionExecutor<T>;
  readonly #descriptor: DescriptorFactory | undefined;
  readonly #schedule: ScheduleExecutor | undefined;

  constructor(input: {
    readonly execute: ActionExecutor<T>;
    readonly descriptor?: DescriptorFactory;
    readonly schedule?: ScheduleExecutor;
  }) {
    this.#execute = input.execute;
    this.#descriptor = input.descriptor;
    this.#schedule = input.schedule;
  }

  now(): Promise<T> {
    return this.#execute();
  }

  tx(): Result<TransactionDescriptor> {
    if (!this.#descriptor) {
      return err(
        createError("UNEXPECTED_ERROR", "This operation has no single transaction descriptor", {
          hint: "Use now() directly",
        }),
      );
    }
    try {
      return ok(this.#descriptor());
    } catch (error) {
      const message = error instanceof Error ? error.message : "Descriptor resolution failed";
      return err(
        createError("UNEXPECTED_ERROR", message, {
          hint: "Verify required fields before calling tx()",
        }),
      );
    }
  }

  schedule(params: Omit<ScheduleCreateParams, "tx"> = {}): Promise<Result<ScheduleReceipt>> {
    if (!this.#descriptor || !this.#schedule) {
      return Promise.resolve(
        err(
          createError("UNEXPECTED_ERROR", "This operation cannot be scheduled", {
            hint: "Use now() directly",
          }),
        ),
      );
    }

    const descriptor = this.tx();
    if (!descriptor.ok) {
      return Promise.resolve(err(descriptor.error));
    }
    return this.#schedule(params, descriptor.value);
  }
}

export function actionPlan<T>(input: {
  readonly execute: ActionExecutor<T>;
  readonly descriptor?: DescriptorFactory;
  readonly schedule?: ScheduleExecutor;
}): ActionPlan<T> {
  return new ActionPlan(input);
}
