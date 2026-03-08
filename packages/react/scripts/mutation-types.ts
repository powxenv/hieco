import { useAccountSend } from "../src/hooks/accounts/use-account-send";
import { useTopicSubmitJson } from "../src/hooks/topics/use-topic-submit-json";
import { useHiecoMutation } from "../src/shared/use-hieco-mutation";
import type { ActionHandle, QueryHandle, QueueParams } from "../src/shared/types";

type Expect<T extends true> = T;

type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;

type HasKey<T, K extends PropertyKey> = K extends keyof T ? true : false;

type AccountSendResult = ReturnType<typeof useAccountSend>;
type TopicSubmitJsonResult = ReturnType<typeof useTopicSubmitJson>;

type _TopicSubmitJsonHasNoBuildTx = Expect<Equal<HasKey<TopicSubmitJsonResult, "buildTx">, false>>;
type _TopicSubmitJsonHasNoQueue = Expect<Equal<HasKey<TopicSubmitJsonResult, "queue">, false>>;
type _AccountSendBuildTxRequiresVariables = Expect<
  Equal<Parameters<AccountSendResult["buildTx"]>[0], Parameters<AccountSendResult["mutate"]>[0]>
>;
type _AccountSendQueueRequiresVariables = Expect<
  Equal<Parameters<AccountSendResult["queue"]>[0], Parameters<AccountSendResult["mutate"]>[0]>
>;

declare const queryHandle: QueryHandle<number>;
declare const actionHandle: ActionHandle<number>;

function useZeroArgActionFixture() {
  return useHiecoMutation({
    operationName: "fixture.zero-arg-action",
    createHandle: () => queryHandle,
    createAction: () => actionHandle,
    variables: "none",
  });
}

type ZeroArgActionResult = ReturnType<typeof useZeroArgActionFixture>;

type _ZeroArgBuildTxHasNoVariables = Expect<Equal<Parameters<ZeroArgActionResult["buildTx"]>, []>>;
type _ZeroArgQueueUsesOnlyQueueParams = Expect<
  Equal<Parameters<ZeroArgActionResult["queue"]>, [params?: QueueParams]>
>;
