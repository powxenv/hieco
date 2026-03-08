import { mkdir, rm } from "node:fs/promises";
import { basename, dirname, join } from "node:path";

const root = new URL("../src/hooks", import.meta.url).pathname;

type QueryArgument = {
  readonly name: string;
  readonly index: 0 | 1 | 2;
  readonly optional?: boolean;
};

type QueryHook = {
  readonly kind: "query";
  readonly hookName: string;
  readonly filePath: string;
  readonly methodPath: readonly string[];
  readonly args: ReadonlyArray<QueryArgument>;
};

type MutationHook = {
  readonly kind: "mutation";
  readonly hookName: string;
  readonly filePath: string;
  readonly methodPath: readonly string[];
  readonly mode: "none" | "single" | "custom";
  readonly usesAction: boolean;
  readonly variablesDeclaration?: string;
  readonly extraTypeImports?: ReadonlyArray<string>;
  readonly handleExpression?: string;
  readonly actionExpression?: string;
};

type HookDefinition = QueryHook | MutationHook;

function toKebab(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
}

function toPublicHookName(value: string): string {
  return value.replace(/(Query|Mutation)$/, "");
}

function toDomainFolder(folder: string): string {
  switch (folder) {
    case "account":
      return "accounts";
    case "contract":
      return "contracts";
    case "file":
      return "files";
    case "node":
      return "network";
    case "schedule":
      return "schedules";
    case "token":
      return "tokens";
    case "topic":
      return "topics";
    case "transaction":
      return "transactions";
    case "util":
      return "utilities";
    default:
      return folder;
  }
}

function filePath(folder: string, hookName: string): string {
  return `${toDomainFolder(folder)}/${toKebab(hookName)}.ts`;
}

function queryHook(
  folder: string,
  hookName: string,
  methodPath: readonly string[],
  args: ReadonlyArray<QueryArgument>,
): QueryHook {
  const publicHookName = toPublicHookName(hookName);

  return {
    kind: "query",
    hookName: publicHookName,
    filePath: filePath(folder, publicHookName),
    methodPath,
    args,
  };
}

function q0(folder: string, hookName: string, methodPath: readonly string[]): QueryHook {
  return queryHook(folder, hookName, methodPath, []);
}

function q1(
  folder: string,
  hookName: string,
  methodPath: readonly string[],
  arg0Name: string,
  optional0 = false,
): QueryHook {
  return queryHook(folder, hookName, methodPath, [
    { name: arg0Name, index: 0, optional: optional0 },
  ]);
}

function q2(
  folder: string,
  hookName: string,
  methodPath: readonly string[],
  arg0Name: string,
  arg1Name: string,
  optional1 = false,
): QueryHook {
  return queryHook(folder, hookName, methodPath, [
    { name: arg0Name, index: 0 },
    { name: arg1Name, index: 1, optional: optional1 },
  ]);
}

function q3(
  folder: string,
  hookName: string,
  methodPath: readonly string[],
  arg0Name: string,
  arg1Name: string,
  arg2Name: string,
  optional2 = false,
): QueryHook {
  return queryHook(folder, hookName, methodPath, [
    { name: arg0Name, index: 0 },
    { name: arg1Name, index: 1 },
    { name: arg2Name, index: 2, optional: optional2 },
  ]);
}

function mutationHook(
  folder: string,
  hookName: string,
  methodPath: readonly string[],
  mode: MutationHook["mode"],
  usesAction: boolean,
  options: Omit<
    MutationHook,
    "kind" | "hookName" | "filePath" | "methodPath" | "mode" | "usesAction"
  > = {},
): MutationHook {
  const publicHookName = toPublicHookName(hookName);

  return {
    kind: "mutation",
    hookName: publicHookName,
    filePath: filePath(folder, publicHookName),
    methodPath,
    mode,
    usesAction,
    ...options,
  };
}

function m0(
  folder: string,
  hookName: string,
  methodPath: readonly string[],
  usesAction = false,
): MutationHook {
  return mutationHook(folder, hookName, methodPath, "none", usesAction);
}

function m1(
  folder: string,
  hookName: string,
  methodPath: readonly string[],
  usesAction: boolean,
): MutationHook {
  return mutationHook(folder, hookName, methodPath, "single", usesAction);
}

function mc(
  folder: string,
  hookName: string,
  methodPath: readonly string[],
  usesAction: boolean,
  options: Omit<
    MutationHook,
    "kind" | "hookName" | "filePath" | "methodPath" | "mode" | "usesAction"
  >,
): MutationHook {
  return mutationHook(folder, hookName, methodPath, "custom", usesAction, options);
}

function createMethodType(methodPath: readonly string[]): string {
  return methodPath.reduce((current, segment) => `${current}["${segment}"]`, "HiecoClient");
}

function createQueryHookFile(definition: QueryHook): string {
  const methodType = createMethodType(definition.methodPath);
  const optionsType = `${definition.hookName.replace(/^use/, "Use")}Options`;
  const depth = definition.filePath.split("/").length - 1;
  const hooksPrefix = "../".repeat(depth);
  const internalPrefix = "../".repeat(depth + 1);
  const argTypeImports = definition.args
    .map((arg) => `OperationArg${String(arg.index)}`)
    .filter((value, index, array) => array.indexOf(value) === index)
    .join(",\n  ");
  const importBlock =
    argTypeImports.length > 0 ? `${argTypeImports},\n  OperationData` : "OperationData";
  const aliasLines = definition.args
    .map((arg) => `type Arg${String(arg.index)} = OperationArg${String(arg.index)}<Operation>;`)
    .join("\n");
  const signatureLines = definition.args.map(
    (arg) => `${arg.name}${arg.optional ? "?" : ""}: Arg${String(arg.index)}`,
  );
  const signature =
    signatureLines.length > 0
      ? `${signatureLines.join(",\n  ")},\n  options?: ${definition.hookName}Options<TData>`
      : `options?: ${definition.hookName}Options<TData>`;
  const invocation = definition.args.map((arg) => arg.name).join(", ");
  const keyArgs = definition.args.map((arg) => arg.name).join(", ");

  return `import type { HieroError, HiecoClient } from "@hieco/sdk";
import type { UseQueryResult } from "@tanstack/react-query";
import { useHiecoClient } from "${hooksPrefix}use-hieco-client";
import { useHiecoQuery } from "${internalPrefix}shared/use-hieco-query";
import type {
  HiecoQueryOptions,
  ${importBlock}
} from "${internalPrefix}shared/types";

type Operation = ${methodType};
type QueryFnData = OperationData<Operation>;
${aliasLines.length > 0 ? `${aliasLines}\n` : ""}
export type ${optionsType}<TData = QueryFnData> = HiecoQueryOptions<QueryFnData, TData>;

export function ${definition.hookName}<TData = QueryFnData>(
  ${signature.replaceAll(`${definition.hookName}Options`, optionsType)}
): UseQueryResult<TData, HieroError> {
  const client = useHiecoClient();

  return useHiecoQuery({
    operationName: "${definition.methodPath.join(".")}",
    args: [${keyArgs}],
    queryFn: () => client.${definition.methodPath.join(".")}(${invocation}).now(),
    options,
  });
}
`;
}

function createMutationHookFile(definition: MutationHook): string {
  const methodType = createMethodType(definition.methodPath);
  const optionsType = `${definition.hookName.replace(/^use/, "Use")}Options`;
  const depth = definition.filePath.split("/").length - 1;
  const hooksPrefix = "../".repeat(depth);
  const internalPrefix = "../".repeat(depth + 1);
  const resultType = definition.usesAction ? "HiecoActionMutationResult" : "HiecoMutationResult";
  const imports = ["HiecoMutationOptions", resultType, "OperationData"];
  const lines: string[] = [];

  if (definition.mode === "single") {
    imports.push("SingleOperationInput");
    lines.push("type Variables = SingleOperationInput<Operation>;");
  }

  if (definition.extraTypeImports) {
    for (const item of definition.extraTypeImports) {
      if (!imports.includes(item)) {
        imports.push(item);
      }
    }
  }

  if (definition.variablesDeclaration) {
    lines.push(definition.variablesDeclaration);
  }

  if (definition.mode === "none") {
    lines.push("type Variables = void;");
  }

  const handleExpression =
    definition.handleExpression ??
    (definition.mode === "none"
      ? `() => client.${definition.methodPath.join(".")}()`
      : `(variables) => client.${definition.methodPath.join(".")}(variables)`);
  const actionExpression =
    definition.actionExpression ??
    (definition.usesAction
      ? definition.mode === "none"
        ? `() => client.${definition.methodPath.join(".")}()`
        : `(variables) => client.${definition.methodPath.join(".")}(variables)`
      : undefined);
  const actionBlock = actionExpression ? `,\n    createAction: ${actionExpression}` : "";

  return `import type { HiecoClient } from "@hieco/sdk";
import { useHiecoClient } from "${hooksPrefix}use-hieco-client";
import { useHiecoMutation } from "${internalPrefix}shared/use-hieco-mutation";
import type {
  ${imports.join(",\n  ")}
} from "${internalPrefix}shared/types";

type Operation = ${methodType};
type MutationData = OperationData<Operation>;
${lines.join("\n")}

export type ${optionsType}<TContext = unknown> = HiecoMutationOptions<
  MutationData,
  Variables,
  TContext
>;

export function ${definition.hookName}<TContext = unknown>(
  options?: ${optionsType}<TContext>,
): ${resultType}<MutationData, Variables, TContext> {
  const client = useHiecoClient();

  return useHiecoMutation({
    operationName: "${definition.methodPath.join(".")}",
    createHandle: ${handleExpression}${actionBlock},
    variables: "${definition.mode === "none" ? "none" : "required"}",
    options,
  });
}
`;
}

const definitions: ReadonlyArray<HookDefinition> = [
  q1("transaction", "useTransactionRecordQuery", ["tx", "record"], "transactionId"),
  q2(
    "transaction",
    "useTransactionReceiptQuery",
    ["tx", "receipt"],
    "transactionId",
    "receiptOptions",
    true,
  ),
  m1("transaction", "useTransactionSubmitMutation", ["tx", "submit"], false),
  q1("account", "useAccountAllowanceSnapshotQuery", ["account", "allowanceSnapshot"], "accountId"),
  q1("account", "useAccountBalanceQuery", ["account", "balance"], "accountId", true),
  q1("account", "useAccountInfoQuery", ["account", "info"], "accountId"),
  q2(
    "account",
    "useAccountInfoFlowQuery",
    ["account", "infoFlow"],
    "accountId",
    "flowOptions",
    true,
  ),
  q1("account", "useAccountRecordsQuery", ["account", "records"], "accountId", true),
  ...[
    "Send",
    "Transfer",
    "Create",
    "Update",
    "Delete",
    "Allow",
    "Allowances",
    "AdjustAllowances",
    "RevokeNftAllowances",
    "AllowancesDeleteNft",
  ].map((name) =>
    m1(
      "account",
      `useAccount${name}Mutation`,
      [
        "account",
        name === "AdjustAllowances"
          ? "adjustAllowances"
          : name === "RevokeNftAllowances"
            ? "revokeNftAllowances"
            : name === "AllowancesDeleteNft"
              ? "allowancesDeleteNft"
              : name.charAt(0).toLowerCase() + name.slice(1),
      ],
      true,
    ),
  ),
  m1("account", "useAccountEnsureAllowancesMutation", ["account", "ensureAllowances"], false),
  q1("token", "useTokenInfoQuery", ["token", "info"], "tokenId"),
  q1("token", "useTokenNftQuery", ["token", "nft"], "nft"),
  q2("token", "useTokenAllowancesQuery", ["token", "allowances"], "accountId", "params", true),
  ...[
    "Create",
    "Mint",
    "Burn",
    "Send",
    "Transfer",
    "SendNft",
    "TransferNft",
    "Associate",
    "Dissociate",
    "Freeze",
    "Unfreeze",
    "GrantKyc",
    "RevokeKyc",
    "Pause",
    "Unpause",
    "Wipe",
    "Delete",
    "Update",
    "Fees",
    "Airdrop",
    "ClaimAirdrop",
    "CancelAirdrop",
    "Reject",
    "UpdateNfts",
  ].map((name) =>
    m1(
      "token",
      `useToken${name}Mutation`,
      [
        "token",
        name === "SendNft"
          ? "sendNft"
          : name === "TransferNft"
            ? "transferNft"
            : name === "GrantKyc"
              ? "grantKyc"
              : name === "RevokeKyc"
                ? "revokeKyc"
                : name === "ClaimAirdrop"
                  ? "claimAirdrop"
                  : name === "CancelAirdrop"
                    ? "cancelAirdrop"
                    : name === "UpdateNfts"
                      ? "updateNfts"
                      : name.charAt(0).toLowerCase() + name.slice(1),
      ],
      true,
    ),
  ),
  m1("token", "useTokenRejectFlowMutation", ["token", "rejectFlow"], false),
  q1("topic", "useTopicInfoQuery", ["topic", "info"], "topicId"),
  q2("topic", "useTopicMessagesQuery", ["topic", "messages"], "topicId", "params", true),
  ...(
    [
      ["Create", "create", true],
      ["Update", "update", true],
      ["Delete", "delete", true],
      ["Send", "send", true],
      ["Submit", "submit", true],
      ["SendJson", "sendJson", false],
      ["SubmitJson", "submitJson", false],
      ["SendMany", "sendMany", false],
      ["BatchSubmit", "batchSubmit", false],
    ] as const
  ).map(([name, method, usesAction]) =>
    m1("topic", `useTopic${name}Mutation`, ["topic", method], usesAction),
  ),
  q1("contract", "useContractCallQuery", ["contract", "call"], "params"),
  q1("contract", "useContractCallTypedQuery", ["contract", "callTyped"], "params"),
  q1("contract", "useContractPreflightQuery", ["contract", "preflight"], "params"),
  q1("contract", "useContractInfoQuery", ["contract", "info"], "contractId"),
  q2("contract", "useContractLogsQuery", ["contract", "logs"], "contractId", "params", true),
  q1("contract", "useContractBytecodeQuery", ["contract", "bytecode"], "contractId"),
  q1("contract", "useContractSimulateQuery", ["contract", "simulate"], "params"),
  q1("contract", "useContractEstimateQuery", ["contract", "estimate"], "params"),
  q1("contract", "useContractEstimateGasQuery", ["contract", "estimateGas"], "params"),
  ...(
    [
      ["Deploy", "deploy", true],
      ["DeployArtifact", "deployArtifact", false],
      ["Run", "run", true],
      ["Execute", "execute", true],
      ["RunTyped", "runTyped", true],
      ["ExecuteTyped", "executeTyped", true],
      ["Delete", "delete", true],
      ["Update", "update", true],
    ] as const
  ).map(([name, method, usesAction]) =>
    m1("contract", `useContract${name}Mutation`, ["contract", method], usesAction),
  ),
  q1("file", "useFileInfoQuery", ["file", "info"], "fileId"),
  q1("file", "useFileContentsQuery", ["file", "contents"], "fileId"),
  q1("file", "useFileTextQuery", ["file", "text"], "fileId"),
  q1("file", "useFileContentsTextQuery", ["file", "contentsText"], "fileId"),
  ...(
    [
      ["Create", "create", true],
      ["Append", "append", true],
      ["Update", "update", true],
      ["Delete", "delete", true],
      ["Upload", "upload", false],
      ["UpdateLarge", "updateLarge", false],
    ] as const
  ).map(([name, method, usesAction]) =>
    m1("file", `useFile${name}Mutation`, ["file", method], usesAction),
  ),
  q1("schedule", "useScheduleInfoQuery", ["schedule", "info"], "scheduleId"),
  q2("schedule", "useScheduleWaitQuery", ["schedule", "wait"], "scheduleId", "waitOptions", true),
  q2(
    "schedule",
    "useScheduleWaitForExecutionQuery",
    ["schedule", "waitForExecution"],
    "scheduleId",
    "waitOptions",
    true,
  ),
  m1("schedule", "useScheduleCreateMutation", ["schedule", "create"], true),
  mc("schedule", "useScheduleSignMutation", ["schedule", "sign"], false, {
    extraTypeImports: ["OperationArg0", "OperationArg1"],
    variablesDeclaration: `type Variables = {
  readonly scheduleId: OperationArg0<Operation>;
  readonly params?: OperationArg1<Operation>;
};`,
    handleExpression: `(variables) => client.schedule.sign(variables.scheduleId, variables.params)`,
  }),
  mc("schedule", "useScheduleDeleteMutation", ["schedule", "delete"], false, {
    extraTypeImports: ["OperationArg0", "OperationArg1"],
    variablesDeclaration: `type Variables = {
  readonly scheduleId: OperationArg0<Operation>;
  readonly params?: OperationArg1<Operation>;
};`,
    handleExpression: `(variables) => client.schedule.delete(variables.scheduleId, variables.params)`,
  }),
  ...(
    [
      ["CreateIdempotent", "createIdempotent"],
      ["Collect", "collect"],
      ["CollectSignatures", "collectSignatures"],
    ] as const
  ).map(([name, method]) =>
    m1("schedule", `useSchedule${name}Mutation`, ["schedule", method], false),
  ),
  ...(
    [
      ["Create", "create"],
      ["Update", "update"],
      ["Delete", "delete"],
    ] as const
  ).map(([name, method]) => m1("node", `useNode${name}Mutation`, ["node", method], true)),
  ...(
    [
      ["Freeze", "freeze"],
      ["DeleteEntity", "deleteEntity"],
      ["UndeleteEntity", "undeleteEntity"],
    ] as const
  ).map(([name, method]) => m1("system", `useSystem${name}Mutation`, ["system", method], true)),
  m1("util", "useUtilRandomMutation", ["util", "random"], true),
  m1("batch", "useBatchAtomicMutation", ["batch", "atomic"], true),
  q0("network", "useNetworkVersionQuery", ["net", "version"]),
  q1("network", "useNetworkAddressBookQuery", ["net", "addressBook"], "params", true),
  q1("network", "useNetworkPingQuery", ["net", "ping"], "nodeAccountId"),
  q0("network", "useNetworkPingAllQuery", ["net", "pingAll"]),
  m0("network", "useNetworkUpdateMutation", ["net", "update"], false),
  m1("evm", "useEvmSendRawMutation", ["evm", "sendRaw"], true),
  q1("legacy", "useLegacyLiveHashGetQuery", ["legacy", "liveHash", "get"], "params"),
  m1("legacy", "useLegacyLiveHashAddMutation", ["legacy", "liveHash", "add"], true),
  m1("legacy", "useLegacyLiveHashDeleteMutation", ["legacy", "liveHash", "delete"], true),
  q1("reads/accounts", "useReadAccountsListQuery", ["reads", "accounts", "list"], "params", true),
  q1(
    "reads/accounts",
    "useReadAccountsListPageByUrlQuery",
    ["reads", "accounts", "listPageByUrl"],
    "url",
  ),
  q2(
    "reads/accounts",
    "useReadAccountInfoQuery",
    ["reads", "accounts", "info"],
    "accountId",
    "params",
    true,
  ),
  q1(
    "reads/accounts",
    "useReadAccountBalancesQuery",
    ["reads", "accounts", "balances"],
    "accountId",
  ),
  q2(
    "reads/accounts",
    "useReadAccountTokensQuery",
    ["reads", "accounts", "tokens"],
    "accountId",
    "params",
    true,
  ),
  q2(
    "reads/accounts",
    "useReadAccountNftsQuery",
    ["reads", "accounts", "nfts"],
    "accountId",
    "params",
    true,
  ),
  q2(
    "reads/accounts",
    "useReadAccountRewardsQuery",
    ["reads", "accounts", "rewards"],
    "accountId",
    "params",
    true,
  ),
  q2(
    "reads/accounts",
    "useReadAccountCryptoAllowancesQuery",
    ["reads", "accounts", "allowances", "crypto"],
    "accountId",
    "params",
    true,
  ),
  q2(
    "reads/accounts",
    "useReadAccountTokenAllowancesQuery",
    ["reads", "accounts", "allowances", "token"],
    "accountId",
    "params",
    true,
  ),
  q2(
    "reads/accounts",
    "useReadAccountNftAllowancesQuery",
    ["reads", "accounts", "allowances", "nft"],
    "accountId",
    "params",
    true,
  ),
  q2(
    "reads/accounts",
    "useReadAccountOutstandingAirdropsQuery",
    ["reads", "accounts", "airdrops", "outstanding"],
    "accountId",
    "params",
    true,
  ),
  q2(
    "reads/accounts",
    "useReadAccountPendingAirdropsQuery",
    ["reads", "accounts", "airdrops", "pending"],
    "accountId",
    "params",
    true,
  ),
  q2(
    "reads/accounts",
    "useReadAccountHistoryQuery",
    ["reads", "accounts", "history"],
    "accountId",
    "params",
    true,
  ),
  q2(
    "reads/accounts",
    "useReadAccountTransfersQuery",
    ["reads", "accounts", "transfers"],
    "accountId",
    "params",
    true,
  ),
  q1("reads/tokens", "useReadTokensListQuery", ["reads", "tokens", "list"], "params", true),
  q1(
    "reads/tokens",
    "useReadTokensListPageByUrlQuery",
    ["reads", "tokens", "listPageByUrl"],
    "url",
  ),
  q2(
    "reads/tokens",
    "useReadTokenInfoQuery",
    ["reads", "tokens", "info"],
    "tokenId",
    "params",
    true,
  ),
  q2(
    "reads/tokens",
    "useReadTokenBalancesQuery",
    ["reads", "tokens", "balances"],
    "tokenId",
    "params",
    true,
  ),
  q2(
    "reads/tokens",
    "useReadTokenBalancesSnapshotQuery",
    ["reads", "tokens", "balancesSnapshot"],
    "tokenId",
    "params",
    true,
  ),
  q2(
    "reads/tokens",
    "useReadTokenNftsQuery",
    ["reads", "tokens", "nfts"],
    "tokenId",
    "params",
    true,
  ),
  q2("reads/tokens", "useReadTokenNftQuery", ["reads", "tokens", "nft"], "tokenId", "serial"),
  q3(
    "reads/tokens",
    "useReadTokenNftTransactionsQuery",
    ["reads", "tokens", "nftTransactions"],
    "tokenId",
    "serial",
    "params",
    true,
  ),
  q2(
    "reads/tokens",
    "useReadTokenRelationshipsQuery",
    ["reads", "tokens", "relationships"],
    "accountId",
    "params",
    true,
  ),
  q2(
    "reads/tokens",
    "useReadTokenTransfersQuery",
    ["reads", "tokens", "transfers"],
    "tokenId",
    "params",
    true,
  ),
  q1(
    "reads/contracts",
    "useReadContractsListQuery",
    ["reads", "contracts", "list"],
    "params",
    true,
  ),
  q1(
    "reads/contracts",
    "useReadContractsListPageByUrlQuery",
    ["reads", "contracts", "listPageByUrl"],
    "url",
  ),
  q2(
    "reads/contracts",
    "useReadContractInfoQuery",
    ["reads", "contracts", "info"],
    "contractIdOrAddress",
    "params",
    true,
  ),
  q1("reads/contracts", "useReadContractCallQuery", ["reads", "contracts", "call"], "params"),
  q2(
    "reads/contracts",
    "useReadContractResultsQuery",
    ["reads", "contracts", "results"],
    "contractId",
    "params",
    true,
  ),
  q2(
    "reads/contracts",
    "useReadContractResultQuery",
    ["reads", "contracts", "result"],
    "contractId",
    "timestamp",
  ),
  q2(
    "reads/contracts",
    "useReadContractStateQuery",
    ["reads", "contracts", "state"],
    "contractId",
    "params",
    true,
  ),
  q2(
    "reads/contracts",
    "useReadContractLogsQuery",
    ["reads", "contracts", "logs"],
    "contractId",
    "params",
    true,
  ),
  q1(
    "reads/contracts",
    "useReadContractsResultsAllQuery",
    ["reads", "contracts", "resultsAll"],
    "params",
    true,
  ),
  q2(
    "reads/contracts",
    "useReadContractResultByTransactionIdOrHashQuery",
    ["reads", "contracts", "resultByTransactionIdOrHash"],
    "transactionIdOrHash",
    "params",
    true,
  ),
  q2(
    "reads/contracts",
    "useReadContractResultActionsQuery",
    ["reads", "contracts", "resultActions"],
    "transactionIdOrHash",
    "params",
    true,
  ),
  q2(
    "reads/contracts",
    "useReadContractResultOpcodesQuery",
    ["reads", "contracts", "resultOpcodes"],
    "transactionIdOrHash",
    "params",
    true,
  ),
  q1(
    "reads/contracts",
    "useReadContractsLogsAllQuery",
    ["reads", "contracts", "logsAll"],
    "params",
    true,
  ),
  q2(
    "reads/transactions",
    "useReadTransactionQuery",
    ["reads", "transactions", "get"],
    "transactionId",
    "params",
    true,
  ),
  q2(
    "reads/transactions",
    "useReadTransactionsByAccountQuery",
    ["reads", "transactions", "byAccount"],
    "accountId",
    "params",
    true,
  ),
  q1(
    "reads/transactions",
    "useReadTransactionsListQuery",
    ["reads", "transactions", "list"],
    "params",
    true,
  ),
  q1(
    "reads/transactions",
    "useReadTransactionsListPageByUrlQuery",
    ["reads", "transactions", "listPageByUrl"],
    "url",
  ),
  q1(
    "reads/transactions",
    "useReadTransactionsSearchQuery",
    ["reads", "transactions", "search"],
    "params",
    true,
  ),
  q1("reads/topics", "useReadTopicsListQuery", ["reads", "topics", "list"], "params", true),
  q1(
    "reads/topics",
    "useReadTopicsListPageByUrlQuery",
    ["reads", "topics", "listPageByUrl"],
    "url",
  ),
  q1("reads/topics", "useReadTopicInfoQuery", ["reads", "topics", "info"], "topicId"),
  q2(
    "reads/topics",
    "useReadTopicMessagesQuery",
    ["reads", "topics", "messages"],
    "topicId",
    "params",
    true,
  ),
  q2(
    "reads/topics",
    "useReadTopicMessageQuery",
    ["reads", "topics", "message"],
    "topicId",
    "sequenceNumber",
  ),
  q1(
    "reads/topics",
    "useReadTopicMessageByTimestampQuery",
    ["reads", "topics", "messageByTimestamp"],
    "timestamp",
  ),
  q1(
    "reads/schedules",
    "useReadSchedulesListQuery",
    ["reads", "schedules", "list"],
    "params",
    true,
  ),
  q1(
    "reads/schedules",
    "useReadSchedulesListPageByUrlQuery",
    ["reads", "schedules", "listPageByUrl"],
    "url",
  ),
  q1("reads/schedules", "useReadScheduleInfoQuery", ["reads", "schedules", "info"], "scheduleId"),
  q1(
    "reads/network",
    "useReadNetworkExchangeRateQuery",
    ["reads", "network", "exchangeRate"],
    "params",
    true,
  ),
  q1("reads/network", "useReadNetworkFeesQuery", ["reads", "network", "fees"], "params", true),
  q1("reads/network", "useReadNetworkNodesQuery", ["reads", "network", "nodes"], "params", true),
  q1(
    "reads/network",
    "useReadNetworkNodesPageByUrlQuery",
    ["reads", "network", "nodesPageByUrl"],
    "url",
  ),
  q0("reads/network", "useReadNetworkStakeQuery", ["reads", "network", "stake"]),
  q0("reads/network", "useReadNetworkSupplyQuery", ["reads", "network", "supply"]),
  q1(
    "reads/balances",
    "useReadBalancesSnapshotQuery",
    ["reads", "balances", "snapshot"],
    "params",
    true,
  ),
  q1("reads/balances", "useReadBalancesListQuery", ["reads", "balances", "list"], "params", true),
  q1(
    "reads/balances",
    "useReadBalancesListPageByUrlQuery",
    ["reads", "balances", "listPageByUrl"],
    "url",
  ),
  q1("reads/blocks", "useReadBlocksSnapshotQuery", ["reads", "blocks", "snapshot"], "params", true),
  q1("reads/blocks", "useReadBlocksListQuery", ["reads", "blocks", "list"], "params", true),
  q1(
    "reads/blocks",
    "useReadBlocksListPageByUrlQuery",
    ["reads", "blocks", "listPageByUrl"],
    "url",
  ),
  q1("reads/blocks", "useReadBlockQuery", ["reads", "blocks", "get"], "hashOrNumber"),
];

async function main() {
  await rm(join(root, "generated"), { recursive: true, force: true });
  await mkdir(root, { recursive: true });

  const fileExportsByDirectory = new Map<string, string[]>();
  const allDirectories = new Set<string>();
  const topLevelDirectories = new Set<string>();

  function addDirectoryTree(directory: string): void {
    if (directory === "." || allDirectories.has(directory)) {
      return;
    }

    allDirectories.add(directory);
    const parentDirectory = dirname(directory);

    if (parentDirectory !== ".") {
      addDirectoryTree(parentDirectory);
    }
  }

  for (const definition of definitions) {
    topLevelDirectories.add(definition.filePath.split("/")[0] ?? definition.filePath);
    addDirectoryTree(dirname(definition.filePath));
  }

  for (const directory of topLevelDirectories) {
    await rm(join(root, directory), { recursive: true, force: true });
  }

  for (const definition of definitions) {
    const outputPath = join(root, definition.filePath);
    const directory = dirname(definition.filePath);
    const exportLines = fileExportsByDirectory.get(directory) ?? [];

    await mkdir(dirname(outputPath), { recursive: true });
    const contents =
      definition.kind === "query"
        ? createQueryHookFile(definition)
        : createMutationHookFile(definition);
    await Bun.write(outputPath, contents);
    exportLines.push(`export * from "./${basename(definition.filePath, ".ts")}";`);
    fileExportsByDirectory.set(directory, exportLines);
  }

  const orderedDirectories = [...allDirectories].sort(
    (left, right) => right.split("/").length - left.split("/").length,
  );

  for (const directory of orderedDirectories) {
    const childDirectoryExports = orderedDirectories
      .filter((candidate) => dirname(candidate) === directory)
      .map((candidate) => `export * from "./${basename(candidate)}";`);
    const fileExports = fileExportsByDirectory.get(directory) ?? [];
    const lines = [...childDirectoryExports, ...fileExports];

    await Bun.write(join(root, directory, "index.ts"), `${lines.join("\n")}\n`);
  }
}

await main();
