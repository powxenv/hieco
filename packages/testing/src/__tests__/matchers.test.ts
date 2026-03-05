import { describe, test, expect } from "@jest/globals";
import { toBeHbar } from "../matchers/core/hbar.js";
import { toHaveStatus, toSucceed, toSucceedWith } from "../matchers/core/status.js";
import {
  toBeAccountId,
  toHaveShard,
  toHaveRealm,
  toHaveAccount,
} from "../matchers/core/account-id.js";
import { toBeValidTx } from "../matchers/core/transaction.js";
import { toBeHieroError, toFailWith, HieroErrorCode } from "../matchers/core/error.js";
import {
  toHaveTokenBalance,
  toBeToken,
  toHaveEmitted,
  toBeAssociated,
} from "../matchers/core/token.js";
import { toBeEntityId } from "../matchers/core/entity-id.js";

describe("Hbar Matchers", () => {
  class MockHbar {
    readonly #tinybars: bigint;

    constructor(tinybars: bigint | number) {
      this.#tinybars = BigInt(tinybars);
    }

    toBigNumber() {
      return {
        toString: () => this.#tinybars.toString(),
      };
    }

    toString() {
      return `${this.#tinybars / 100_000_000n} ℏ`;
    }
  }

  describe("toBeHbar", () => {
    test("compares hbar values correctly", () => {
      const hbar = new MockHbar(100_000_000n); // 1 Hbar in tinybars

      expect(toBeHbar(hbar, 1)).toBe(true); // number 1 = 1 Hbar
      expect(toBeHbar(hbar, 100_000_000n)).toBe(true); // bigint is tinybars
      expect(toBeHbar(hbar, "1")).toBe(true); // string 1 = 1 Hbar
    });

    test("returns false for non-matching values", () => {
      const hbar = new MockHbar(100_000_000n);

      expect(toBeHbar(hbar, 2)).toBe(false);
      expect(toBeHbar(hbar, 2n)).toBe(false);
    });

    test("handles decimal string inputs", () => {
      const hbar = new MockHbar(100_000_000n); // 1 Hbar

      expect(toBeHbar(hbar, "1")).toBe(true);
      expect(toBeHbar(hbar, "1.0")).toBe(true);
      expect(toBeHbar(hbar, "0.5")).toBe(false);
    });

    test("handles number inputs with decimal", () => {
      const hbar = new MockHbar(150_000_000n); // 1.5 Hbar

      expect(toBeHbar(hbar, 1.5)).toBe(true);
    });

    test("returns false for non-hbar values", () => {
      expect(toBeHbar("not hbar", 1)).toBe(false);
      expect(toBeHbar(null, 1)).toBe(false);
      expect(toBeHbar(undefined, 1)).toBe(false);
    });
  });
});

describe("Status Matchers", () => {
  describe("toHaveStatus", () => {
    test("matches exact status string", () => {
      expect(toHaveStatus("SUCCESS", "SUCCESS")).toBe(true);
      expect(toHaveStatus({ status: "SUCCESS" }, "SUCCESS")).toBe(true);
    });

    test("matches case-insensitive", () => {
      expect(toHaveStatus("success", "SUCCESS")).toBe(true);
      expect(toHaveStatus("Success", "SUCCESS")).toBe(true);
    });

    test("matches hierarchical status", () => {
      expect(toHaveStatus("OK", "OK")).toBe(true);
      expect(toHaveStatus("RESPONSE_CODE.OK", "OK")).toBe(true);
    });

    test("returns false for non-matching status", () => {
      expect(toHaveStatus("SUCCESS", "FAIL")).toBe(false);
    });

    test("handles Status-like objects", () => {
      const statusLike = {
        toString: () => "SUCCESS",
      };
      expect(toHaveStatus(statusLike, "SUCCESS")).toBe(true);
    });
  });

  describe("toSucceed", () => {
    test("matches SUCCESS status", () => {
      expect(toSucceed("SUCCESS")).toBe(true);
      expect(toSucceed({ status: "SUCCESS" })).toBe(true);
    });

    test("matches OK status", () => {
      expect(toSucceed("OK")).toBe(true);
      expect(toSucceed("RESPONSE_CODE.OK")).toBe(true);
    });

    test("returns false for failure status", () => {
      expect(toSucceed("FAIL")).toBe(false);
      expect(toSucceed({ status: "ERROR" })).toBe(false);
    });
  });

  describe("toSucceedWith", () => {
    test("matches success status with receipt data", () => {
      const receipt = {
        status: "SUCCESS",
        accountId: "0.0.123",
        exchangeRate: { hbars: 1000, tinybars: 100_000_000n },
      };

      expect(toSucceedWith(receipt, { accountId: "0.0.123" })).toBe(true);
    });

    test("matches partial receipt data", () => {
      const receipt = {
        status: "SUCCESS",
        accountId: "0.0.456",
        otherField: "ignored",
      };

      expect(toSucceedWith(receipt, { accountId: "0.0.456" })).toBe(true);
    });

    test("returns false when status is not success", () => {
      const receipt = {
        status: "FAIL",
        accountId: "0.0.123",
      };

      expect(toSucceedWith(receipt, { accountId: "0.0.123" })).toBe(false);
    });

    test("returns false when receipt data doesn't match", () => {
      const receipt = {
        status: "SUCCESS",
        accountId: "0.0.123",
      };

      expect(toSucceedWith(receipt, { accountId: "0.0.456" })).toBe(false);
    });

    test("handles substring matching for receipt values", () => {
      const receipt = {
        status: "SUCCESS",
        accountId: "0.0.1234",
      };

      expect(toSucceedWith(receipt, { accountId: "123" })).toBe(true);
    });
  });
});

describe("AccountId Matchers", () => {
  describe("toBeAccountId", () => {
    test("matches exact account ID string", () => {
      expect(toBeAccountId("0.0.123", "0.0.123")).toBe(true);
    });

    test("matches account ID from object with toString", () => {
      const accountIdLike = {
        toString: () => "0.0.456",
      };

      expect(toBeAccountId(accountIdLike, "0.0.456")).toBe(true);
    });

    test("returns false for non-matching IDs", () => {
      expect(toBeAccountId("0.0.123", "0.0.456")).toBe(false);
    });

    test("returns false for invalid entity IDs", () => {
      expect(toBeAccountId("invalid", "0.0.123")).toBe(false);
    });
  });

  describe("toHaveShard", () => {
    test("extracts and matches shard number", () => {
      expect(toHaveShard("1.0.123", 1)).toBe(true);
      expect(toHaveShard("5.2.1000", 5)).toBe(true);
    });

    test("returns false for non-matching shard", () => {
      expect(toHaveShard("1.0.123", 2)).toBe(false);
    });
  });

  describe("toHaveRealm", () => {
    test("extracts and matches realm number", () => {
      expect(toHaveRealm("0.1.123", 1)).toBe(true);
      expect(toHaveRealm("1.5.1000", 5)).toBe(true);
    });

    test("returns false for non-matching realm", () => {
      expect(toHaveRealm("0.1.123", 2)).toBe(false);
    });
  });

  describe("toHaveAccount", () => {
    test("extracts and matches account number", () => {
      expect(toHaveAccount("0.0.123", 123)).toBe(true);
      expect(toHaveAccount("1.5.1000", 1000)).toBe(true);
    });

    test("returns false for non-matching account", () => {
      expect(toHaveAccount("0.0.123", 456)).toBe(false);
    });
  });
});

describe("Transaction Matchers", () => {
  describe("toBeValidTx", () => {
    test("validates correct transaction ID format", () => {
      expect(toBeValidTx("0.0.123@1234567890.000000001")).toBe(true);
      expect(toBeValidTx("1.2.3@1234567890123.123456789")).toBe(true);
    });

    test("validates transaction ID from object", () => {
      const txIdLike = {
        toString: () => "0.0.456@1234567890.000000001",
      };

      expect(toBeValidTx(txIdLike)).toBe(true);
    });

    test("returns false for invalid formats", () => {
      expect(toBeValidTx("invalid")).toBe(false);
      expect(toBeValidTx("0.0.123")).toBe(false);
      expect(toBeValidTx("0.0.123@timestamp")).toBe(false);
      expect(toBeValidTx("")).toBe(false);
    });
  });
});

describe("Error Matchers", () => {
  describe("toBeHieroError", () => {
    test("matches error by numeric code", () => {
      expect(toBeHieroError({ code: 12 }, 12)).toBe(true);
      expect(toBeHieroError(12, 12)).toBe(true);
    });

    test("matches error by error name", () => {
      expect(
        toBeHieroError({ status: "INSUFFICIENT_PAYER_BALANCE" }, "INSUFFICIENT_PAYER_BALANCE"),
      ).toBe(true);
      expect(toBeHieroError("INSUFFICIENT_PAYER_BALANCE", "INSUFFICIENT_PAYER_BALANCE")).toBe(true);
    });

    test("matches error by numeric code", () => {
      expect(toBeHieroError({ code: 12 }, 12)).toBe(true);
      expect(toBeHieroError(12, 12)).toBe(true);
    });

    test("extracts error from message", () => {
      expect(
        toBeHieroError({ message: "Insufficient payer balance" }, "INSUFFICIENT_PAYER_BALANCE"),
      ).toBe(true);
    });

    test("returns false for non-matching errors", () => {
      expect(toBeHieroError({ code: 12 }, 49)).toBe(false);
    });

    test("returns false for invalid error codes", () => {
      expect(toBeHieroError({ code: 9999 }, 9999)).toBe(false);
    });
  });

  describe("toFailWith", () => {
    test("matches error by status string", () => {
      expect(toFailWith({ status: "INVALID_ACCOUNT_ID" }, "INVALID_ACCOUNT_ID")).toBe(true);
    });

    test("matches error with message", () => {
      expect(
        toFailWith(
          { status: "INVALID_ACCOUNT_ID", message: "Account not found" },
          { status: "INVALID_ACCOUNT_ID", message: "not found" },
        ),
      ).toBe(true);
    });

    test("matches message case-insensitively", () => {
      expect(
        toFailWith(
          { status: "INVALID_ACCOUNT_ID", message: "Account Not Found" },
          { status: "INVALID_ACCOUNT_ID", message: "account" },
        ),
      ).toBe(true);
    });

    test("returns false when message doesn't match", () => {
      expect(
        toFailWith(
          { status: "INVALID_ACCOUNT_ID", message: "Account not found" },
          { status: "INVALID_ACCOUNT_ID", message: "token" },
        ),
      ).toBe(false);
    });

    test("matches error by numeric code", () => {
      expect(toFailWith({ code: 49 }, 49)).toBe(true);
    });
  });

  describe("HieroErrorCode", () => {
    test("has all expected error codes", () => {
      expect(HieroErrorCode.INSUFFICIENT_PAYER_BALANCE).toBe(12);
      expect(HieroErrorCode.INVALID_ACCOUNT_ID).toBe(49);
      expect(HieroErrorCode.INVALID_TOKEN_ID).toBe(155);
      expect(HieroErrorCode.ACCOUNT_DELETED).toBe(102);
      expect(HieroErrorCode.TOKEN_DELETED).toBe(167);
      expect(HieroErrorCode.UNAUTHORIZED).toBe(146);
      expect(HieroErrorCode.TRANSACTION_EXPIRED).toBe(5);
    });
  });
});

describe("Token Matchers", () => {
  describe("toHaveTokenBalance", () => {
    test("matches token balance from object", () => {
      const tokenHolder = {
        getBalance: (tokenId: string) => (tokenId === "0.0.123" ? 1000n : undefined),
      };

      expect(toHaveTokenBalance(tokenHolder, "0.0.123", 1000)).toBe(true);
      expect(toHaveTokenBalance(tokenHolder, "0.0.123", 1000n)).toBe(true);
    });

    test("matches token balance with bigint", () => {
      const tokenHolder = {
        getBalance: () => 500n,
      };

      expect(toHaveTokenBalance(tokenHolder, "0.0.123", 500n)).toBe(true);
    });

    test("returns false when balance doesn't match", () => {
      const tokenHolder = {
        getBalance: () => 1000n,
      };

      expect(toHaveTokenBalance(tokenHolder, "0.0.123", 500)).toBe(false);
    });

    test("returns false when balance is undefined", () => {
      const tokenHolder = {
        getBalance: () => undefined,
      };

      expect(toHaveTokenBalance(tokenHolder, "0.0.123", 1000)).toBe(false);
    });
  });

  describe("toBeToken", () => {
    test("matches token by name", () => {
      const token = { name: "Test Token", symbol: "TT", decimals: 8 };
      expect(toBeToken(token, { name: "Test Token" })).toBe(true);
    });

    test("matches token by symbol", () => {
      const token = { name: "Test Token", symbol: "TT", decimals: 8 };
      expect(toBeToken(token, { symbol: "TT" })).toBe(true);
    });

    test("matches token by decimals", () => {
      const token = { name: "Test Token", symbol: "TT", decimals: 8 };
      expect(toBeToken(token, { decimals: 8 })).toBe(true);
    });

    test("matches token by multiple properties", () => {
      const token = { name: "Test Token", symbol: "TT", decimals: 8 };
      expect(toBeToken(token, { name: "Test Token", symbol: "TT" })).toBe(true);
    });

    test("returns false when properties don't match", () => {
      const token = { name: "Test Token", symbol: "TT", decimals: 8 };
      expect(toBeToken(token, { name: "Wrong Name" })).toBe(false);
    });

    test("matches when all specified properties match", () => {
      const token = { name: "Test Token", symbol: "TT", decimals: 8 };
      expect(toBeToken(token, { name: "Test Token", symbol: "TT", decimals: 8 })).toBe(true);
    });
  });

  describe("toHaveEmitted", () => {
    test("matches event by name", () => {
      const receipt = {
        events: [{ name: "Transfer", topics: [], data: "" }],
      };

      expect(toHaveEmitted(receipt, { name: "Transfer" })).toBe(true);
    });

    test("matches event by topics", () => {
      const receipt = {
        events: [{ name: "Transfer", topics: ["from", "to", "100"], data: "" }],
      };

      expect(toHaveEmitted(receipt, { topics: ["from", "to", "100"] })).toBe(true);
    });

    test("matches event by data", () => {
      const receipt = {
        events: [{ name: "Transfer", topics: [], data: "0x1234" }],
      };

      expect(toHaveEmitted(receipt, { data: "0x1234" })).toBe(true);
    });

    test("matches any event in array", () => {
      const receipt = {
        events: [
          { name: "Approval", topics: [], data: "" },
          { name: "Transfer", topics: [], data: "" },
        ],
      };

      expect(toHaveEmitted(receipt, { name: "Transfer" })).toBe(true);
    });

    test("returns false when no matching event", () => {
      const receipt = {
        events: [{ name: "Approval", topics: [], data: "" }],
      };

      expect(toHaveEmitted(receipt, { name: "Transfer" })).toBe(false);
    });

    test("returns false when events array is empty", () => {
      const receipt = { events: [] };
      expect(toHaveEmitted(receipt, { name: "Transfer" })).toBe(false);
    });

    test("returns false when events property is missing", () => {
      const receipt = {};
      expect(toHaveEmitted(receipt, { name: "Transfer" })).toBe(false);
    });
  });

  describe("toBeAssociated", () => {
    test("returns true when account is associated with token", () => {
      const account = {
        isAssociated: (tokenId: string) => tokenId === "0.0.123",
      };

      expect(toBeAssociated(account, "0.0.123")).toBe(true);
    });

    test("returns false when account is not associated", () => {
      const account = {
        isAssociated: () => false,
      };

      expect(toBeAssociated(account, "0.0.123")).toBe(false);
    });
  });
});

describe("EntityId Matchers", () => {
  describe("toBeEntityId", () => {
    test("matches exact entity ID string", () => {
      expect(toBeEntityId("0.0.123", "0.0.123")).toBe(true);
    });

    test("matches entity ID from object with toString", () => {
      const entityIdLike = {
        toString: () => "0.0.456",
      };

      expect(toBeEntityId(entityIdLike, "0.0.456")).toBe(true);
    });

    test("returns false for non-matching IDs", () => {
      expect(toBeEntityId("0.0.123", "0.0.456")).toBe(false);
    });

    test("returns false for invalid entity IDs", () => {
      expect(toBeEntityId("invalid", "0.0.123")).toBe(false);
      expect(toBeEntityId("0.0", "0.0.123")).toBe(false);
    });
  });
});
