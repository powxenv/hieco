import { describe, test, expect, beforeEach } from "bun:test";
import { transactionBuilder } from "../src/builders";
import { stakingAccountBuilder, mockStakedAccount, state } from "../src";

describe("transactionBuilder", () => {
  beforeEach(() => {
    state.reset();
  });

  test("creates crypto transfer transaction", () => {
    const tx = transactionBuilder.cryptoTransfer({
      hbarTransfers: [
        { accountId: "0.0.1" as const, amount: -1000 },
        { accountId: "0.0.2" as const, amount: 1000 },
      ],
    });

    expect(tx.name).toBe("CRYPTOTRANSFER");
    expect(tx.result).toBe("SUCCESS");
    expect(tx.transfers).toHaveLength(2);
  });

  test("creates crypto create account transaction", () => {
    const tx = transactionBuilder.cryptoCreateAccount({
      accountId: "0.0.100" as const,
    });

    expect(tx.name).toBe("CRYPTOCREATEACCOUNT");
  });

  test("creates token transfer transaction", () => {
    const tx = transactionBuilder.transferToken({
      tokenId: "0.0.500" as const,
      from: "0.0.1" as const,
      to: "0.0.2" as const,
      amount: 100,
    });

    expect(tx.name).toBe("CRYPTOTRANSFER");
    expect(tx.token_transfers).toHaveLength(2);
    expect(tx.token_transfers[0]?.account).toBe("0.0.1");
    expect(tx.token_transfers[0]?.amount).toBe(-100);
    expect(tx.token_transfers[1]?.account).toBe("0.0.2");
    expect(tx.token_transfers[1]?.amount).toBe(100);
  });

  test("creates NFT transfer transaction", () => {
    const tx = transactionBuilder.transferNft({
      tokenId: "0.0.600" as const,
      from: "0.0.1" as const,
      to: "0.0.2" as const,
      serialNumber: 42,
    });

    expect(tx.nft_transfers).toHaveLength(1);
    expect(tx.nft_transfers[0]?.token_id).toBe("0.0.600");
    expect(tx.nft_transfers[0]?.sender_account_id).toBe("0.0.1");
    expect(tx.nft_transfers[0]?.receiver_account_id).toBe("0.0.2");
    expect(tx.nft_transfers[0]?.serial_number).toBe(42);
  });

  test("creates mint token transaction", () => {
    const tx = transactionBuilder.mintToken({
      tokenId: "0.0.500" as const,
      amount: 1000,
    });

    expect(tx.name).toBe("TOKENMINT");
  });

  test("creates burn token transaction", () => {
    const tx = transactionBuilder.burnToken({
      tokenId: "0.0.500" as const,
      amount: 500,
    });

    expect(tx.name).toBe("TOKENBURN");
  });

  test("creates associate token transaction", () => {
    const tx = transactionBuilder.associateToken({
      accountId: "0.0.100" as const,
      tokenIds: ["0.0.500" as const, "0.0.501" as const],
    });

    expect(tx.name).toBe("TOKENASSOCIATE");
  });

  test("creates smart contract call transaction", () => {
    const tx = transactionBuilder.smartContract({
      contractId: "0.0.200" as const,
      from: "0.0.1" as const,
      gas: 100000,
      amount: 50,
    });

    expect(tx.name).toBe("CONTRACTCALL");
    expect(tx.entity_id).toBe("0.0.200");
  });
});

describe("stakingAccountBuilder", () => {
  beforeEach(() => {
    state.reset();
  });

  test("creates node staker account", () => {
    const account = stakingAccountBuilder.nodeStaker({
      account: "0.0.100" as const,
      nodeId: 3,
      hbar: 1000000,
      pendingReward: 500,
    });

    expect(account.staked_node_id).toBe(3);
    expect(account.staked_account_id).toBeNull();
    expect(account.pending_reward).toBe(500);
  });

  test("creates account staker", () => {
    const account = stakingAccountBuilder.accountStaker({
      account: "0.0.100" as const,
      stakedAccountId: "0.0.50" as const,
      hbar: 500000,
      pendingReward: 250,
    });

    expect(account.staked_account_id).toBe("0.0.50");
    expect(account.staked_node_id).toBeNull();
    expect(account.pending_reward).toBe(250);
  });

  test("creates declined rewards account", () => {
    const account = stakingAccountBuilder.declinedRewards({
      account: "0.0.100" as const,
      hbar: 100000,
    });

    expect(account.decline_reward).toBe(true);
    expect(account.staked_account_id).toBeNull();
    expect(account.staked_node_id).toBeNull();
    expect(account.pending_reward).toBe(0);
  });
});

describe("mockStakedAccount", () => {
  beforeEach(() => {
    state.reset();
  });

  test("generates staked account with defaults", () => {
    const account = mockStakedAccount.build();

    expect(account.account).toBe("0.0.0");
    expect(account.staked_node_id).toBeNull();
    expect(account.staked_account_id).toBeNull();
    expect(account.pending_reward).toBe(0);
  });

  test("accepts staking options", () => {
    const account = mockStakedAccount.build({
      account: "0.0.100" as const,
      stakedNodeId: 5,
      pendingReward: 1000,
      declineReward: false,
    });

    expect(account.account).toBe("0.0.100");
    expect(account.staked_node_id).toBe(5);
    expect(account.pending_reward).toBe(1000);
  });
});
