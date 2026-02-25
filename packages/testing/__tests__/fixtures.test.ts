import { describe, test, expect } from "bun:test";
import { mockAccount, mockTransaction, mockToken, mockBalance } from "../src/fixtures";

describe("mockAccount", () => {
  test("generates valid account with defaults", () => {
    const account = mockAccount.build();

    expect(account.account).toMatch(/^0\.0\.\d+$/);
    expect(account.balance.balance).toBeGreaterThan(0);
    expect(account.expiry_timestamp).toBeNull();
  });

  test("accepts custom options", () => {
    const account = mockAccount.build({
      account: "0.0.1234" as const,
      hbar: 5000,
    });

    expect(account.account).toBe("0.0.1234");
    expect(account.balance.balance).toBe(5000);
  });

  test("generates list of accounts", () => {
    const accounts = mockAccount.buildList(5);

    expect(accounts).toHaveLength(5);
    accounts.forEach((account) => {
      expect(account.account).toMatch(/^0\.0\.\d+$/);
    });
  });
});

describe("mockTransaction", () => {
  test("generates valid transaction with defaults", () => {
    const transaction = mockTransaction.build();

    expect(transaction.transaction_id).toMatch(/^\d+-0-\d+$/);
    expect(transaction.result).toBe("SUCCESS");
    expect(transaction.name).toBe("CRYPTOTRANSFER");
  });

  test("accepts custom options", () => {
    const transaction = mockTransaction.build({
      transaction_id: "123-0-999999999",
      name: "CRYPTOCREATEACCOUNT",
      result: "FAILED",
      charged_tx_fee: 500000,
    });

    expect(transaction.transaction_id).toBe("123-0-999999999");
    expect(transaction.name).toBe("CRYPTOCREATEACCOUNT");
    expect(transaction.result).toBe("FAILED");
    expect(transaction.charged_tx_fee).toBe(500000);
  });

  test("generates list of transactions", () => {
    const transactions = mockTransaction.buildList(3);

    expect(transactions).toHaveLength(3);
    transactions.forEach((transaction) => {
      expect(transaction.transaction_id).toMatch(/^\d+-0-\d+$/);
    });
  });
});

describe("mockToken", () => {
  test("generates valid token with defaults", () => {
    const token = mockToken.build();

    expect(token.token_id).toMatch(/^0\.0\.\d+$/);
    expect(token.decimals).toBe(8);
    expect(token.type).toBe("FUNGIBLE_COMMON");
  });

  test("accepts custom options", () => {
    const token = mockToken.build({
      token_id: "0.0.5678" as const,
      name: "My Token",
      symbol: "MT",
      decimals: 18,
      type: "NON_FUNGIBLE_UNIQUE",
    });

    expect(token.token_id).toBe("0.0.5678");
    expect(token.name).toBe("My Token");
    expect(token.symbol).toBe("MT");
    expect(token.decimals).toBe(18);
    expect(token.type).toBe("NON_FUNGIBLE_UNIQUE");
  });

  test("generates list of tokens", () => {
    const tokens = mockToken.buildList(10);

    expect(tokens).toHaveLength(10);
    tokens.forEach((token) => {
      expect(token.token_id).toMatch(/^0\.0\.\d+$/);
    });
  });
});

describe("mockBalance", () => {
  test("generates valid balance with defaults", () => {
    const balance = mockBalance.build();

    expect(balance.account).toBe("0.0.0");
    expect(balance.balance).toBe(100000000000);
    expect(balance.tokens).toHaveLength(0);
  });

  test("accepts custom options", () => {
    const balance = mockBalance.build({
      account: "0.0.9999" as const,
      hbar: 5000,
      tokens: [
        { token_id: "0.0.1111", balance: 100 },
        { token_id: "0.0.2222", balance: 200 },
      ],
    });

    expect(balance.account).toBe("0.0.9999");
    expect(balance.balance).toBe(5000);
    expect(balance.tokens).toHaveLength(2);
    const firstToken = balance.tokens[0];
    if (firstToken) {
      expect(firstToken.token_id).toBe("0.0.1111");
      expect(firstToken.balance).toBe(100);
    }
  });

  test("generates list of balances", () => {
    const balances = mockBalance.buildList(7);

    expect(balances).toHaveLength(7);
    balances.forEach((balance) => {
      expect(balance.balance).toBeGreaterThan(0);
    });
  });
});
