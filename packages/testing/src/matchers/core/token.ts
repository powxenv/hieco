interface TokenBalanceHolder {
  readonly getBalance: (tokenId: string) => bigint | undefined;
}

interface TokenInfo {
  readonly name?: string;
  readonly symbol?: string;
  readonly decimals?: number;
}

interface EventLike {
  readonly name?: string;
  readonly topics?: readonly unknown[];
  readonly data?: string;
}

interface EventsHolder {
  readonly events?: readonly unknown[];
}

interface AssociationHolder {
  readonly isAssociated: (tokenId: string) => boolean;
}

const hasGetBalanceMethod = (obj: object): obj is TokenBalanceHolder => {
  const desc = Object.getOwnPropertyDescriptor(obj, "getBalance");
  return desc !== undefined && typeof desc.value === "function";
};

const hasIsAssociatedMethod = (obj: object): obj is AssociationHolder => {
  const desc = Object.getOwnPropertyDescriptor(obj, "isAssociated");
  return desc !== undefined && typeof desc.value === "function";
};

function isTokenBalanceHolder(value: unknown): value is TokenBalanceHolder {
  return typeof value === "object" && value !== null && hasGetBalanceMethod(value);
}

function isTokenInfo(value: unknown): value is TokenInfo {
  return typeof value === "object" && value !== null;
}

function isEventsHolder(value: unknown): value is EventsHolder {
  return typeof value === "object" && value !== null;
}

function isEventLike(value: unknown): value is EventLike {
  return typeof value === "object" && value !== null;
}

function isAssociationHolder(value: unknown): value is AssociationHolder {
  return typeof value === "object" && value !== null && hasIsAssociatedMethod(value);
}

export function toHaveTokenBalance(
  received: unknown,
  tokenId: string,
  balance: bigint | number,
): boolean {
  if (!isTokenBalanceHolder(received)) return false;

  const actualBalance = received.getBalance(tokenId);
  if (actualBalance === undefined) return false;

  const expectedBalance = typeof balance === "bigint" ? balance : BigInt(balance);

  return actualBalance === expectedBalance;
}

export function toBeToken(received: unknown, expected: TokenInfo): boolean {
  if (!isTokenInfo(received)) return false;

  if (expected.name !== undefined && received.name !== expected.name) {
    return false;
  }

  if (expected.symbol !== undefined && received.symbol !== expected.symbol) {
    return false;
  }

  if (expected.decimals !== undefined && received.decimals !== expected.decimals) {
    return false;
  }

  return true;
}

export function toHaveEmitted(received: unknown, expected: EventInfoInput): boolean {
  if (!isEventsHolder(received)) return false;

  const { events } = received;
  if (!Array.isArray(events) || events.length === 0) return false;

  for (const event of events) {
    if (!isEventLike(event)) continue;

    let match = true;

    if (expected.name !== undefined && event.name !== expected.name) {
      match = false;
    }

    if (
      expected.topics !== undefined &&
      Array.isArray(expected.topics) &&
      (!Array.isArray(event.topics) ||
        expected.topics.some((topic, i) => event.topics![i] !== topic))
    ) {
      match = false;
    }

    if (expected.data !== undefined && event.data !== expected.data) {
      match = false;
    }

    if (match) return true;
  }

  return false;
}

export function toBeAssociated(received: unknown, tokenId: string): boolean {
  if (!isAssociationHolder(received)) return false;

  return received.isAssociated(tokenId);
}

export function toHaveTokenBalanceMessage(
  received: unknown,
  tokenId: string,
  balance: bigint | number,
  pass: boolean,
): string {
  const actualBalance = isTokenBalanceHolder(received) ? received.getBalance(tokenId) : undefined;

  return pass
    ? `expected token ${tokenId} balance not to be ${balance}`
    : `expected token ${tokenId} balance to be ${balance}, but got ${actualBalance}`;
}

export function toBeTokenMessage(received: unknown, expected: TokenInfo, pass: boolean): string {
  return pass
    ? `expected token not to match ${JSON.stringify(expected)}`
    : `expected token to match ${JSON.stringify(expected)}`;
}

export function toHaveEmittedMessage(
  received: unknown,
  expected: EventInfoInput,
  pass: boolean,
): string {
  return pass
    ? `expected event not to be emitted matching ${JSON.stringify(expected)}`
    : `expected event to be emitted matching ${JSON.stringify(expected)}`;
}

export function toBeAssociatedMessage(received: unknown, tokenId: string, pass: boolean): string {
  return pass
    ? `expected account not to be associated with token ${tokenId}`
    : `expected account to be associated with token ${tokenId}`;
}

interface EventInfoInput {
  readonly name?: string;
  readonly topics?: readonly unknown[];
  readonly data?: string;
}
