import type { TokenRelationship, EntityId } from "@hiecom/mirror-js";

export type TokenRelationshipFixtureOptions = Partial<
  Pick<
    TokenRelationship,
    "token_id" | "balance" | "decimals" | "freeze_status" | "kyc_status" | "automatic_association"
  >
>;

const createTokenRelationship = (
  accountId: string,
  options: TokenRelationshipFixtureOptions = {},
): TokenRelationship => {
  const timestamp = Date.now().toString();

  return {
    token_id: options.token_id ?? ("0.0.456" as EntityId),
    balance: options.balance ?? 100,
    created_timestamp: timestamp,
    decimals: options.decimals ?? 8,
    freeze_status: options.freeze_status ?? "UNFROZEN",
    kyc_status: options.kyc_status ?? "GRANTED",
    automatic_association: options.automatic_association ?? false,
  };
};

export const mockTokenRelationship: {
  build: (accountId: string, overrides?: TokenRelationshipFixtureOptions) => TokenRelationship;
  buildList: (
    accountId: string,
    count: number,
    overrides?: TokenRelationshipFixtureOptions,
  ) => TokenRelationship[];
} = {
  build: (accountId, overrides) => createTokenRelationship(accountId, overrides),
  buildList: (accountId, count, overrides) =>
    Array.from({ length: count }, (_, i) =>
      createTokenRelationship(accountId, {
        ...overrides,
        token_id: `0.0.${456 + i}` as EntityId,
      }),
    ),
};
