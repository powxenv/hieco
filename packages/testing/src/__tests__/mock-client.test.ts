import { describe, test, expect, beforeEach } from "@jest/globals";
import { Hbar, AccountId, PrivateKey, PublicKey } from "@hiero-ledger/sdk";
import { MockHieroClient } from "../mock/client.js";

describe("MockHieroClient", () => {
  let client: MockHieroClient;

  beforeEach(() => {
    client = new MockHieroClient();
  });

  describe("constructor", () => {
    test("initializes with stores", () => {
      expect(client.accounts).toBeDefined();
      expect(client.tokens).toBeDefined();
      expect(client.contracts).toBeDefined();
      expect(client.topics).toBeDefined();
    });

    test("initializes with time controller", () => {
      expect(client.time).toBeDefined();
      expect(client.time.now()).toBeInstanceOf(Date);
    });

    test("initializes with snapshot manager", () => {
      expect(client.snapshot).toBeDefined();
    });

    test("initializes with mock functions", () => {
      expect(client.execute).toBeDefined();
      expect(client._setOperatorMock).toBeDefined();
    });

    test("initializes with default network", () => {
      const network = client.network;
      expect(network["0.0.3"]).toBeDefined();
    });

    test("initializes with default mirror network", () => {
      const mirror = client.mirrorNetwork;
      expect(mirror).toContain("https://testnet.mirrornode.hedera.com");
    });

    test("initializes with no operator", () => {
      expect(client.operatorAccountId).toBeNull();
      expect(client.operatorPublicKey).toBeNull();
    });
  });

  describe("network", () => {
    test("gets network config", () => {
      const network = client.network;
      expect(network).toEqual({ "0.0.3": "0.testnet.hedera.com:50211" });
    });

    test("sets network from object", () => {
      const newNetwork = { "0.0.4": "1.testnet.hedera.com:50211" };
      client.setNetwork(newNetwork);

      expect(client.network).toEqual(newNetwork);
    });

    test("sets network from string", () => {
      client.setNetwork("custom-node.com:50211");

      expect(client.network["0.0.3"]).toBe("custom-node.com:50211");
    });

    test("getNetwork returns network config", () => {
      const network = client.getNetwork();
      expect(network).toEqual(client.network);
    });
  });

  describe("mirrorNetwork", () => {
    test("gets mirror network", () => {
      const mirror = client.mirrorNetwork;
      expect(mirror).toContain("https://testnet.mirrornode.hedera.com");
    });

    test("sets mirror network from array", () => {
      const newMirror = ["https://custom.mirror.com"];
      client.setMirrorNetwork(newMirror);

      expect(client.mirrorNetwork).toEqual(newMirror);
    });

    test("sets mirror network from string", () => {
      client.setMirrorNetwork("https://custom.mirror.com");

      expect(client.mirrorNetwork).toContain("https://custom.mirror.com");
    });

    test("getMirrorNetwork returns mirror network", () => {
      const mirror = client.getMirrorNetwork();
      expect(mirror).toEqual(client.mirrorNetwork);
    });
  });

  describe("maxQueryPayment", () => {
    test("gets default max query payment", () => {
      const maxPayment = client.maxQueryPayment;
      expect(maxPayment.toBigNumber().toNumber()).toBe(1);
    });

    test("sets max query payment", () => {
      const newMax = new Hbar(5);
      client.setMaxQueryPayment(newMax);

      expect(client.maxQueryPayment.toBigNumber().toNumber()).toBe(5);
    });

    test("setMaxQueryPayment returns this for chaining", () => {
      const result = client.setMaxQueryPayment(new Hbar(10));
      expect(result).toBe(client);
    });

    test("setDefaultMaxQueryPayment alias works", () => {
      const newMax = new Hbar(2);
      client.setDefaultMaxQueryPayment(newMax);

      expect(client.maxQueryPayment.toBigNumber().toNumber()).toBe(2);
    });

    test("getMaxQueryPayment returns max payment", () => {
      const maxPayment = client.getMaxQueryPayment();
      expect(maxPayment).toBe(client.maxQueryPayment);
    });
  });

  describe("maxTransactionFee", () => {
    test("gets default max transaction fee", () => {
      const maxFee = client.maxTransactionFee;
      expect(maxFee?.toBigNumber().toNumber()).toBe(10);
    });

    test("sets max transaction fee", () => {
      const newMax = new Hbar(20);
      client.setMaxTransactionFee(newMax);

      expect(client.maxTransactionFee?.toBigNumber().toNumber()).toBe(20);
    });

    test("setDefaultMaxTransactionFee alias works", () => {
      const newMax = new Hbar(5);
      client.setDefaultMaxTransactionFee(newMax);

      expect(client.maxTransactionFee?.toBigNumber().toNumber()).toBe(5);
    });

    test("defaultMaxTransactionFee getter works", () => {
      const maxFee = client.defaultMaxTransactionFee;
      expect(maxFee?.toBigNumber().toNumber()).toBe(10);
    });
  });

  describe("shard and realm", () => {
    test("gets default shard", () => {
      expect(client.shard).toBe(0);
    });

    test("gets default realm", () => {
      expect(client.realm).toBe(0);
    });
  });

  describe("operator", () => {
    test("sets operator with AccountId and PrivateKey", () => {
      const accountId = AccountId.fromString("0.0.123");
      const privateKey = PrivateKey.generate();

      client.setOperator(accountId, privateKey);

      expect(client.operatorAccountId?.toString()).toBe("0.0.123");
      expect(client.operatorPublicKey?.toString()).toBe(privateKey.publicKey.toString());
    });

    test("sets operator with strings", () => {
      const privateKey = PrivateKey.generate();
      const privateKeyString = privateKey.toString();

      client.setOperator("0.0.456", privateKeyString);

      expect(client.operatorAccountId?.toString()).toBe("0.0.456");
    });

    test("setOperator returns this for chaining", () => {
      const result = client.setOperator("0.0.123", PrivateKey.generate());
      expect(result).toBe(client);
    });

    test("getOperator returns operator info", () => {
      const accountId = AccountId.fromString("0.0.789");
      const privateKey = PrivateKey.generate();

      client.setOperator(accountId, privateKey);

      const op = client.getOperator();
      expect(op?.accountId.toString()).toBe("0.0.789");
      expect(op?.publicKey.toString()).toBe(privateKey.publicKey.toString());
    });

    test("returns null when no operator set", () => {
      expect(client.getOperator()).toBeNull();
    });

    test("setOperatorWith sets operator with transaction signer", () => {
      const accountId = AccountId.fromString("0.0.100");
      const publicKey = PublicKey.fromString(
        "0a5a854e39dda0f9097679b0c3f8fe19b640f923545e23acacc6529a57def6137e",
      );

      const signer = async (_message: Uint8Array) => new Uint8Array([]);

      client.setOperatorWith(accountId, publicKey, signer);

      expect(client.operatorAccountId?.toString()).toBe("0.0.100");
    });
  });

  describe("requestTimeout", () => {
    test("gets default request timeout", () => {
      expect(client.requestTimeout).toBe(60000);
    });

    test("sets request timeout", () => {
      client.setRequestTimeout(30000);

      expect(client.requestTimeout).toBe(30000);
    });

    test("setRequestTimeout returns this for chaining", () => {
      const result = client.setRequestTimeout(10000);
      expect(result).toBe(client);
    });
  });

  describe("grpcDeadline", () => {
    test("gets default grpc deadline", () => {
      expect(client.grpcDeadline).toBe(10000);
    });

    test("sets grpc deadline", () => {
      client.setGrpcDeadline(5000);

      expect(client.grpcDeadline).toBe(5000);
    });
  });

  describe("maxNodesPerTransaction", () => {
    test("gets default max nodes per transaction", () => {
      expect(client.maxNodesPerTransaction).toBe(0);
    });

    test("sets max nodes per transaction", () => {
      client.setMaxNodesPerTransaction(3);

      expect(client.maxNodesPerTransaction).toBe(3);
    });
  });

  describe("autoValidateChecksums", () => {
    test("gets default auto validate checksums", () => {
      expect(client.isAutoValidateChecksumsEnabled()).toBe(true);
    });

    test("sets auto validate checksums", () => {
      client.setAutoValidateChecksums(false);

      expect(client.isAutoValidateChecksumsEnabled()).toBe(false);
    });
  });

  describe("defaultRegenerateTransactionId", () => {
    test("gets default regenerate transaction id", () => {
      expect(client.defaultRegenerateTransactionId).toBe(true);
    });

    test("sets default regenerate transaction id", () => {
      client.setDefaultRegenerateTransactionId(false);

      expect(client.defaultRegenerateTransactionId).toBe(false);
    });
  });

  describe("isClientShutDown", () => {
    test("returns false initially", () => {
      expect(client.isClientShutDown).toBe(false);
    });

    test("returns true after close", () => {
      client.close();

      expect(client.isClientShutDown).toBe(true);
    });
  });

  describe("time control", () => {
    test("setTime sets time on time controller", () => {
      const timestamp = new Date("2024-01-01T00:00:00Z");
      client.setTime(timestamp);

      expect(client.time.now().toISOString()).toBe(timestamp.toISOString());
    });

    test("freezeTime freezes time", () => {
      client.freezeTime();
      expect(client.time.isFrozen).toBe(true);
    });

    test("freezeTime at specific time", () => {
      const timestamp = new Date("2024-06-15T12:00:00Z");
      client.freezeTime(timestamp);

      expect(client.time.now().toISOString()).toBe(timestamp.toISOString());
    });

    test("unfreezeTime unfreezes time", () => {
      client.freezeTime();
      client.unfreezeTime();

      expect(client.time.isFrozen).toBe(false);
    });

    test("advanceTime advances time", () => {
      client.freezeTime(new Date("2024-01-01T00:00:00Z"));
      client.advanceTime(5000);

      expect(client.time.now().toISOString()).toBe("2024-01-01T00:00:05.000Z");
    });
  });

  describe("reset", () => {
    test("resets all stores", () => {
      client.accounts.create(Hbar.fromTinybars(1000));
      client.tokens.createToken({
        name: "Test",
        symbol: "T",
        decimals: 8,
        initialSupply: 1000n,
        treasury: "0.0.1000",
      });
      client.contracts.create("0x6001");
      client.topics.create("memo");

      client.reset();

      expect(client.accounts.size).toBe(0);
      expect(client.tokens.size).toBe(0);
      expect(client.contracts.size).toBe(0);
      expect(client.topics.size).toBe(0);
    });

    test("resets time controller", () => {
      client.freezeTime(new Date("2024-01-01T00:00:00Z"));

      client.reset();

      expect(client.time.isFrozen).toBe(false);
      expect(client.time.offset).toBe(0);
    });
  });

  describe("mockTransactionResponse", () => {
    test("can be called without error", () => {
      const txId = "0.0.123@1234567890.000000001";
      const receipt = { status: "SUCCESS" };

      expect(() => client.mockTransactionResponse(txId, receipt)).not.toThrow();
    });
  });

  describe("mockQueryResponse", () => {
    test("can be called without error", () => {
      const queryType = "AccountInfo";
      const response = { accountId: "0.0.123" };

      expect(() => client.mockQueryResponse(queryType, response)).not.toThrow();
    });
  });

  describe("clearMocks", () => {
    test("can be called without error", () => {
      client.execute.mockImplementation(() => "result");

      expect(() => client.clearMocks()).not.toThrow();
    });
  });

  describe("mock functions", () => {
    test("execute is callable with mockImplementation", () => {
      client.execute.mockImplementation((a: unknown, b: unknown) => {
        if (typeof a === "number" && typeof b === "number") {
          return a + b;
        }
        return "result";
      });

      expect(client.execute(1, 2)).toBe(3);
    });

    test("execute.mockReturnValueOnce works", () => {
      client.execute.mockReturnValueOnce("first");

      expect(client.execute()).toBe("first");
    });

    test("execute.mockResolvedValueOnce works", async () => {
      client.execute.mockResolvedValueOnce(Promise.resolve("async-result"));

      await expect(client.execute()).resolves.toBe("async-result");
    });

    test("execute.mockRejectedValueOnce works", () => {
      const error = new Error("test error");
      client.execute.mockRejectedValueOnce(error);

      expect(() => client.execute()).toThrow("test error");
    });
  });

  describe("ping methods", () => {
    test("ping resolves", async () => {
      await expect(client.ping("0.0.3")).resolves.toBeUndefined();
    });

    test("pingAll resolves", async () => {
      await expect(client.pingAll()).resolves.toBeUndefined();
    });
  });

  describe("updateNetwork", () => {
    test("resolves with client instance", async () => {
      const result = await client.updateNetwork();
      expect(result).toBe(client);
    });
  });

  describe("close", () => {
    test("sets isShutdown to true", () => {
      client.close();

      expect(client.isClientShutDown).toBe(true);
    });
  });
});
