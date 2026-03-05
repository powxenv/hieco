export const enum HieroErrorCode {
  INSUFFICIENT_PAYER_BALANCE = 12,
  INVALID_ACCOUNT_ID = 49,
  INVALID_TOKEN_ID = 155,
  ACCOUNT_DELETED = 102,
  TOKEN_DELETED = 167,
  CONTRACT_DELETED = 96,
  UNAUTHORIZED = 146,
  TRANSACTION_EXPIRED = 5,
  INVALID_SIGNATURE = 7,
  DUPLICATE_TRANSACTION = 11,
  BUSY = 12,
  UNKNOWN = 20,
}

const VALID_ERROR_CODES = new Set<number>([
  HieroErrorCode.INSUFFICIENT_PAYER_BALANCE,
  HieroErrorCode.INVALID_ACCOUNT_ID,
  HieroErrorCode.INVALID_TOKEN_ID,
  HieroErrorCode.ACCOUNT_DELETED,
  HieroErrorCode.TOKEN_DELETED,
  HieroErrorCode.CONTRACT_DELETED,
  HieroErrorCode.UNAUTHORIZED,
  HieroErrorCode.TRANSACTION_EXPIRED,
  HieroErrorCode.INVALID_SIGNATURE,
  HieroErrorCode.DUPLICATE_TRANSACTION,
  HieroErrorCode.BUSY,
  HieroErrorCode.UNKNOWN,
]);

const ERROR_NAME_MAP: Readonly<Record<string, HieroErrorCode>> = {
  INSUFFICIENT_PAYER_BALANCE: HieroErrorCode.INSUFFICIENT_PAYER_BALANCE,
  INVALID_ACCOUNT_ID: HieroErrorCode.INVALID_ACCOUNT_ID,
  INVALID_TOKEN_ID: HieroErrorCode.INVALID_TOKEN_ID,
  ACCOUNT_DELETED: HieroErrorCode.ACCOUNT_DELETED,
  TOKEN_DELETED: HieroErrorCode.TOKEN_DELETED,
  CONTRACT_DELETED: HieroErrorCode.CONTRACT_DELETED,
  UNAUTHORIZED: HieroErrorCode.UNAUTHORIZED,
  TRANSACTION_EXPIRED: HieroErrorCode.TRANSACTION_EXPIRED,
  INVALID_SIGNATURE: HieroErrorCode.INVALID_SIGNATURE,
  DUPLICATE_TRANSACTION: HieroErrorCode.DUPLICATE_TRANSACTION,
  BUSY: HieroErrorCode.BUSY,
  UNKNOWN: HieroErrorCode.UNKNOWN,
} as const;

interface ErrorLike {
  readonly code?: number;
  readonly status?: string;
  readonly message?: string;
}

function isErrorLike(value: unknown): value is ErrorLike {
  return typeof value === "object" && value !== null;
}

function parseErrorCodeFromName(errorName: string): HieroErrorCode | null {
  const upperName = errorName.toUpperCase().replace(/\s+/g, "_");
  return ERROR_NAME_MAP[upperName] ?? null;
}

function parseErrorCode(value: unknown): HieroErrorCode | null {
  if (typeof value === "number") {
    if (VALID_ERROR_CODES.has(value)) {
      return value as HieroErrorCode;
    }
    return null;
  }

  if (typeof value === "string") {
    const numeric = Number.parseInt(value, 10);
    if (!Number.isNaN(numeric)) {
      return parseErrorCode(numeric);
    }
    return parseErrorCodeFromName(value);
  }

  if (isErrorLike(value)) {
    if (typeof value.code === "number") {
      return parseErrorCode(value.code);
    }

    if (value.status) {
      const fromName = parseErrorCodeFromName(value.status);
      if (fromName !== null) return fromName;
    }

    if (value.message) {
      const normalizedMessage = value.message.toUpperCase().replace(/\s+/g, "_");
      for (const [name, code] of Object.entries(ERROR_NAME_MAP)) {
        if (normalizedMessage.includes(name)) {
          return code;
        }
      }
    }
  }

  return null;
}

export function toBeHieroError(received: unknown, expected: string | number): boolean {
  const receivedCode = parseErrorCode(received);
  if (receivedCode === null) return false;

  const expectedCode =
    typeof expected === "string" ? parseErrorCodeFromName(expected) : parseErrorCode(expected);

  return receivedCode === expectedCode;
}

export function toFailWith(
  received: unknown,
  expected: string | number | { status: string; message?: string },
): boolean {
  if (!isErrorLike(received)) return false;

  const expectedValue = typeof expected === "object" ? expected.status : expected;
  const errorMatch = toBeHieroError(received, expectedValue);

  if (!errorMatch) return false;

  if (typeof expected === "object" && expected.message) {
    const receivedMessage = (received as { message?: string }).message;
    if (!receivedMessage) return false;

    const expectedMsg = expected.message.toLowerCase();
    const receivedMsg = receivedMessage.toLowerCase();

    return receivedMsg.includes(expectedMsg) || expectedMsg.includes(receivedMsg);
  }

  return true;
}

export function toBeHieroErrorMessage(
  received: unknown,
  expected: string | number,
  pass: boolean,
): string {
  const receivedCode = parseErrorCode(received);
  const expectedCode =
    typeof expected === "string" ? parseErrorCodeFromName(expected) : parseErrorCode(expected);

  return pass
    ? `expected error not to be ${expected} (code ${String(expectedCode)})`
    : `expected error to be ${expected} (code ${String(expectedCode)}), but got code ${String(receivedCode)}`;
}

export function toFailWithMessage(received: unknown, expected: unknown, pass: boolean): string {
  const expectedStr = typeof expected === "object" ? JSON.stringify(expected) : String(expected);

  return pass ? `expected not to fail with ${expectedStr}` : `expected to fail with ${expectedStr}`;
}
