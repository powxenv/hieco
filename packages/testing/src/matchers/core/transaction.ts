const TRANSACTION_ID_REGEX = /^(\d{1,10})\.(\d{1,10})\.(\d{1,10})@(\d{10,13}\.\d{9})$/;

interface TransactionIdLike {
  readonly toString: () => string;
}

const hasToStringMethod = (obj: object): obj is TransactionIdLike => {
  const desc = Object.getOwnPropertyDescriptor(obj, "toString");
  return desc !== undefined && typeof desc.value === "function";
};

function isTransactionIdLike(value: unknown): value is TransactionIdLike {
  return typeof value === "object" && value !== null && hasToStringMethod(value);
}

function parseTransactionIdString(value: unknown): string | null {
  if (typeof value === "string") return value;

  if (isTransactionIdLike(value)) {
    return value.toString();
  }

  return null;
}

export function toBeValidTx(received: unknown): boolean {
  const txIdStr = parseTransactionIdString(received);
  if (!txIdStr) return false;

  return TRANSACTION_ID_REGEX.test(txIdStr);
}

export function toBeValidTxMessage(received: unknown, pass: boolean): string {
  const receivedStr = parseTransactionIdString(received) ?? String(received);

  return pass
    ? `expected ${receivedStr} not to be a valid transaction ID`
    : `expected ${receivedStr} to be a valid transaction ID (format: shard.realm.num@timestamp.sec.nsec)`;
}
