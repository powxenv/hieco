export function createHiecoQueryKey(
  clientKey: string,
  operationName: string,
  args: ReadonlyArray<unknown>,
): readonly ["hieco", string, string, ...ReadonlyArray<unknown>] {
  return ["hieco", clientKey, operationName, ...args];
}

export function createHiecoMutationKey(
  clientKey: string,
  operationName: string,
): readonly ["hieco", string, "mutation", string] {
  return ["hieco", clientKey, "mutation", operationName];
}
