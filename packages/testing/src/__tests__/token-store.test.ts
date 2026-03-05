import { describe, test, expect, beforeEach } from "@jest/globals";
import { TokenStore, type TokenCreationConfig } from "../mock/stores/token.js";

describe("TokenStore", () => {
  let store: TokenStore;

  beforeEach(() => {
    store = new TokenStore();
  });

  const defaultTokenConfig: TokenCreationConfig = {
    name: "Test Token",
    symbol: "TT",
    decimals: 8,
    initialSupply: 1_000_000n,
    treasury: "0.0.1000",
  };

  describe("createToken", () => {
    test("creates token with config", () => {
      const token = store.createToken(defaultTokenConfig);

      expect(token.tokenId).toBe("0.0.2000");
      expect(token.name).toBe("Test Token");
      expect(token.symbol).toBe("TT");
      expect(token.decimals).toBe(8);
      expect(token.totalSupply).toBe(1_000_000n);
      expect(token.treasury).toBe("0.0.1000");
    });

    test("creates token with all keys", () => {
      const config: TokenCreationConfig = {
        ...defaultTokenConfig,
        adminKey: "admin-key",
        kycKey: "kyc-key",
        freezeKey: "freeze-key",
        wipeKey: "wipe-key",
        supplyKey: "supply-key",
        pauseKey: "pause-key",
        feeScheduleKey: "fee-key",
      };

      const token = store.createToken(config);

      expect(token.adminKey).toBe("admin-key");
      expect(token.kycKey).toBe("kyc-key");
      expect(token.freezeKey).toBe("freeze-key");
      expect(token.wipeKey).toBe("wipe-key");
      expect(token.supplyKey).toBe("supply-key");
      expect(token.pauseKey).toBe("pause-key");
      expect(token.feeScheduleKey).toBe("fee-key");
    });

    test("increments token number", () => {
      const first = store.createToken(defaultTokenConfig);
      const second = store.createToken(defaultTokenConfig);

      expect(first.tokenId).toBe("0.0.2000");
      expect(second.tokenId).toBe("0.0.2001");
    });
  });

  describe("associate", () => {
    test("associates account with token", () => {
      const token = store.createToken(defaultTokenConfig);
      const accountId = "0.0.1001";

      const result = store.associate(accountId, token.tokenId);

      expect(result).toBe(true);
      expect(store.isAssociated(accountId, token.tokenId)).toBe(true);
    });

    test("grants KYC automatically when no kycKey", () => {
      const token = store.createToken(defaultTokenConfig);
      const accountId = "0.0.1001";

      store.associate(accountId, token.tokenId);

      const assoc = store.getAssociation(accountId, token.tokenId);
      expect(assoc?.kycGranted).toBe(true);
    });

    test("does not grant KYC when kycKey exists", () => {
      const config: TokenCreationConfig = {
        ...defaultTokenConfig,
        kycKey: "kyc-key",
      };
      const token = store.createToken(config);
      const accountId = "0.0.1001";

      store.associate(accountId, token.tokenId);

      const assoc = store.getAssociation(accountId, token.tokenId);
      expect(assoc?.kycGranted).toBe(false);
    });

    test("returns false for duplicate association", () => {
      const token = store.createToken(defaultTokenConfig);
      const accountId = "0.0.1001";

      store.associate(accountId, token.tokenId);
      const result = store.associate(accountId, token.tokenId);

      expect(result).toBe(false);
    });

    test("returns false for deleted token", () => {
      const token = store.createToken(defaultTokenConfig);
      store.delete(token.tokenId);

      const result = store.associate("0.0.1001", token.tokenId);

      expect(result).toBe(false);
    });
  });

  describe("dissociate", () => {
    test("dissociates account from token", () => {
      const token = store.createToken(defaultTokenConfig);
      const accountId = "0.0.1001";

      store.associate(accountId, token.tokenId);
      const result = store.dissociate(accountId, token.tokenId);

      expect(result).toBe(true);
      expect(store.isAssociated(accountId, token.tokenId)).toBe(false);
    });

    test("returns false for non-existent association", () => {
      const result = store.dissociate("0.0.9999", "0.0.2000");
      expect(result).toBe(false);
    });
  });

  describe("getBalance", () => {
    test("returns undefined for non-existent association", () => {
      expect(store.getBalance("0.0.1001", "0.0.2000")).toBeUndefined();
    });

    test("returns balance after association", () => {
      const token = store.createToken(defaultTokenConfig);
      const accountId = "0.0.1001";

      store.associate(accountId, token.tokenId);
      store.setBalance(accountId, token.tokenId, 500n);

      expect(store.getBalance(accountId, token.tokenId)).toBe(500n);
    });
  });

  describe("setBalance", () => {
    test("sets balance for associated account", () => {
      const token = store.createToken(defaultTokenConfig);
      const accountId = "0.0.1001";

      store.associate(accountId, token.tokenId);
      const result = store.setBalance(accountId, token.tokenId, 1000n);

      expect(result).toBe(true);
      expect(store.getBalance(accountId, token.tokenId)).toBe(1000n);
    });

    test("returns false for non-existent association", () => {
      const result = store.setBalance("0.0.1001", "0.0.2000", 100n);
      expect(result).toBe(false);
    });
  });

  describe("transfer", () => {
    beforeEach(() => {
      const token = store.createToken(defaultTokenConfig);
      store.associate("0.0.1001", token.tokenId);
      store.associate("0.0.1002", token.tokenId);
      store.setBalance("0.0.1001", token.tokenId, 500n);
      store.setBalance("0.0.1002", token.tokenId, 200n);
    });

    test("transfers tokens between accounts", () => {
      const result = store.transfer("0.0.1001", "0.0.1002", "0.0.2000", 100n);

      expect(result.success).toBe(true);
      expect(result.fromBalance).toBe(400n);
      expect(result.toBalance).toBe(300n);
    });

    test("fails when insufficient balance", () => {
      const result = store.transfer("0.0.1002", "0.0.1001", "0.0.2000", 500n);

      expect(result.success).toBe(false);
      expect(result.fromBalance).toBe(200n);
    });

    test("fails when sender not associated", () => {
      const result = store.transfer("0.0.9999", "0.0.1001", "0.0.2000", 100n);

      expect(result.success).toBe(false);
      expect(result.fromBalance).toBeNull();
    });

    test("fails when receiver not associated", () => {
      const result = store.transfer("0.0.1001", "0.0.9999", "0.0.2000", 100n);

      expect(result.success).toBe(false);
      expect(result.toBalance).toBeNull();
    });

    test("fails when sender is frozen", () => {
      const token = store.createToken({
        ...defaultTokenConfig,
        freezeKey: "freeze-key",
      });
      store.associate("0.0.1003", token.tokenId);
      store.associate("0.0.1004", token.tokenId);
      store.setBalance("0.0.1003", token.tokenId, 500n);
      store.freeze("0.0.1003", token.tokenId, true);

      const result = store.transfer("0.0.1003", "0.0.1004", token.tokenId, 100n);

      expect(result.success).toBe(false);
    });

    test("fails when receiver is frozen", () => {
      const token = store.createToken({
        ...defaultTokenConfig,
        freezeKey: "freeze-key",
      });
      store.associate("0.0.1003", token.tokenId);
      store.associate("0.0.1004", token.tokenId);
      store.setBalance("0.0.1003", token.tokenId, 500n);
      store.freeze("0.0.1004", token.tokenId, true);

      const result = store.transfer("0.0.1003", "0.0.1004", token.tokenId, 100n);

      expect(result.success).toBe(false);
    });

    test("fails when sender KYC not granted", () => {
      const token = store.createToken({
        ...defaultTokenConfig,
        kycKey: "kyc-key",
      });
      store.associate("0.0.1003", token.tokenId);
      store.associate("0.0.1004", token.tokenId);
      store.setBalance("0.0.1003", token.tokenId, 500n);

      const result = store.transfer("0.0.1003", "0.0.1004", token.tokenId, 100n);

      expect(result.success).toBe(false);
    });

    test("fails when receiver KYC not granted", () => {
      const token = store.createToken({
        ...defaultTokenConfig,
        kycKey: "kyc-key",
      });
      store.associate("0.0.1003", token.tokenId);
      store.associate("0.0.1004", token.tokenId);
      store.setBalance("0.0.1003", token.tokenId, 500n);
      store.grantKyc("0.0.1003", token.tokenId);

      const result = store.transfer("0.0.1003", "0.0.1004", token.tokenId, 100n);

      expect(result.success).toBe(false);
    });
  });

  describe("mint", () => {
    test("mints tokens to treasury", () => {
      const token = store.createToken({
        ...defaultTokenConfig,
        supplyKey: "supply-key",
      });
      store.associate(token.treasury, token.tokenId);

      const newSupply = store.mint(token.tokenId, 1000n);

      expect(newSupply).toBe(1_001_000n);
      expect(store.get(token.tokenId)?.totalSupply).toBe(1_001_000n);
    });

    test("returns null when no supplyKey", () => {
      const token = store.createToken(defaultTokenConfig);

      const result = store.mint(token.tokenId, 1000n);

      expect(result).toBeNull();
    });

    test("returns null when token is paused", () => {
      const token = store.createToken({
        ...defaultTokenConfig,
        supplyKey: "supply-key",
        pauseKey: "pause-key",
      });
      store.pause(token.tokenId);

      const result = store.mint(token.tokenId, 1000n);

      expect(result).toBeNull();
    });

    test("returns null when token is deleted", () => {
      const token = store.createToken({
        ...defaultTokenConfig,
        supplyKey: "supply-key",
      });
      store.delete(token.tokenId);

      const result = store.mint(token.tokenId, 1000n);

      expect(result).toBeNull();
    });
  });

  describe("burn", () => {
    test("burns tokens from total supply", () => {
      const token = store.createToken({
        ...defaultTokenConfig,
        supplyKey: "supply-key",
      });

      const newSupply = store.burn(token.tokenId, 1000n);

      expect(newSupply).toBe(999_000n);
      expect(store.get(token.tokenId)?.totalSupply).toBe(999_000n);
    });

    test("returns null when burning more than supply", () => {
      const token = store.createToken({
        ...defaultTokenConfig,
        supplyKey: "supply-key",
      });

      const result = store.burn(token.tokenId, 2_000_000n);

      expect(result).toBeNull();
    });

    test("returns null when no supplyKey", () => {
      const token = store.createToken(defaultTokenConfig);

      const result = store.burn(token.tokenId, 1000n);

      expect(result).toBeNull();
    });
  });

  describe("freeze", () => {
    test("freezes account association", () => {
      const token = store.createToken({
        ...defaultTokenConfig,
        freezeKey: "freeze-key",
      });
      store.associate("0.0.1001", token.tokenId);

      const result = store.freeze("0.0.1001", token.tokenId, true);

      expect(result).toBe(true);
      expect(store.getAssociation("0.0.1001", token.tokenId)?.frozen).toBe(true);
    });

    test("unfreezes account association", () => {
      const token = store.createToken({
        ...defaultTokenConfig,
        freezeKey: "freeze-key",
      });
      store.associate("0.0.1001", token.tokenId);
      store.freeze("0.0.1001", token.tokenId, true);

      store.freeze("0.0.1001", token.tokenId, false);

      expect(store.getAssociation("0.0.1001", token.tokenId)?.frozen).toBe(false);
    });

    test("returns false when no freezeKey", () => {
      const token = store.createToken(defaultTokenConfig);
      store.associate("0.0.1001", token.tokenId);

      const result = store.freeze("0.0.1001", token.tokenId, true);

      expect(result).toBe(false);
    });
  });

  describe("grantKyc", () => {
    test("grants KYC to account", () => {
      const token = store.createToken({
        ...defaultTokenConfig,
        kycKey: "kyc-key",
      });
      store.associate("0.0.1001", token.tokenId);

      const result = store.grantKyc("0.0.1001", token.tokenId);

      expect(result).toBe(true);
      expect(store.getAssociation("0.0.1001", token.tokenId)?.kycGranted).toBe(true);
    });

    test("returns false when no kycKey", () => {
      const token = store.createToken(defaultTokenConfig);
      store.associate("0.0.1001", token.tokenId);

      const result = store.grantKyc("0.0.1001", token.tokenId);

      expect(result).toBe(false);
    });
  });

  describe("revokeKyc", () => {
    test("revokes KYC from account", () => {
      const token = store.createToken({
        ...defaultTokenConfig,
        kycKey: "kyc-key",
      });
      store.associate("0.0.1001", token.tokenId);
      store.grantKyc("0.0.1001", token.tokenId);

      const result = store.revokeKyc("0.0.1001", token.tokenId);

      expect(result).toBe(true);
      expect(store.getAssociation("0.0.1001", token.tokenId)?.kycGranted).toBe(false);
    });
  });

  describe("wipe", () => {
    test("wipes tokens from account", () => {
      const token = store.createToken({
        ...defaultTokenConfig,
        wipeKey: "wipe-key",
      });
      store.associate("0.0.1001", token.tokenId);
      store.setBalance("0.0.1001", token.tokenId, 500n);

      const result = store.wipe("0.0.1001", token.tokenId, 200n);

      expect(result).toBe(true);
      expect(store.getBalance("0.0.1001", token.tokenId)).toBe(300n);
      expect(store.get(token.tokenId)?.totalSupply).toBe(999_800n);
    });

    test("returns false when insufficient balance", () => {
      const token = store.createToken({
        ...defaultTokenConfig,
        wipeKey: "wipe-key",
      });
      store.associate("0.0.1001", token.tokenId);
      store.setBalance("0.0.1001", token.tokenId, 100n);

      const result = store.wipe("0.0.1001", token.tokenId, 200n);

      expect(result).toBe(false);
    });

    test("returns false when no wipeKey", () => {
      const token = store.createToken(defaultTokenConfig);
      store.associate("0.0.1001", token.tokenId);
      store.setBalance("0.0.1001", token.tokenId, 500n);

      const result = store.wipe("0.0.1001", token.tokenId, 100n);

      expect(result).toBe(false);
    });
  });

  describe("pause/unpause", () => {
    test("pauses token", () => {
      const token = store.createToken({
        ...defaultTokenConfig,
        pauseKey: "pause-key",
      });

      const result = store.pause(token.tokenId);

      expect(result).toBe(true);
      expect(store.get(token.tokenId)?.paused).toBe(true);
    });

    test("unpauses token", () => {
      const token = store.createToken({
        ...defaultTokenConfig,
        pauseKey: "pause-key",
      });
      store.pause(token.tokenId);

      const result = store.unpause(token.tokenId);

      expect(result).toBe(true);
      expect(store.get(token.tokenId)?.paused).toBe(false);
    });

    test("returns false when no pauseKey", () => {
      const token = store.createToken(defaultTokenConfig);

      expect(store.pause(token.tokenId)).toBe(false);
      expect(store.unpause(token.tokenId)).toBe(false);
    });
  });

  describe("clear", () => {
    test("clears all tokens and associations", () => {
      store.createToken(defaultTokenConfig);
      store.associate("0.0.1001", "0.0.2000");

      store.clear();

      expect(store.size).toBe(0);
      expect(store.associations.size).toBe(0);

      const newToken = store.createToken(defaultTokenConfig);
      expect(newToken.tokenId).toBe("0.0.2000");
    });
  });
});
