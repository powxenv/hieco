import type { Transaction, Transfer } from "@hiecom/mirror-js";
import type { EntityId } from "@hiecom/mirror-js";
import { mockTransaction as createMockTransaction } from "../fixtures/transaction.js";

interface HbarTransfer {
  readonly accountId: EntityId;
  readonly amount: number;
}

const buildTransfers = (hbarTransfers: readonly HbarTransfer[]): readonly Transfer[] => {
  if (hbarTransfers.length === 0) return [];

  const results: Transfer[] = [];

  for (const transfer of hbarTransfers) {
    results.push({
      account: transfer.accountId,
      amount: transfer.amount,
      is_approval: false,
    });
  }

  return results;
};

export const transactionBuilder = {
  cryptoTransfer(options: {
    readonly hbarTransfers: readonly HbarTransfer[];
    readonly timestamp?: Date;
    readonly transactionId?: string;
  }): Transaction {
    const transfers = buildTransfers(options.hbarTransfers);

    return {
      ...createMockTransaction.build({
        name: "CRYPTOTRANSFER",
        timestamp: options.timestamp,
        transaction_id: options.transactionId,
      }),
      transfers,
    };
  },

  cryptoCreateAccount(options: {
    readonly accountId: EntityId;
    readonly key?: string;
    readonly initialBalance?: number;
    readonly timestamp?: Date;
  }): Transaction {
    return createMockTransaction.build({
      name: "CRYPTOCREATEACCOUNT",
      timestamp: options.timestamp,
    });
  },

  transferToken(options: {
    readonly tokenId: EntityId;
    readonly from: EntityId;
    readonly to: EntityId;
    readonly amount: number;
    readonly timestamp?: Date;
  }): Transaction {
    return {
      ...createMockTransaction.build({
        name: "CRYPTOTRANSFER",
        timestamp: options.timestamp,
      }),
      token_transfers: [
        {
          token_id: options.tokenId,
          account: options.from,
          amount: -options.amount,
          is_approval: false,
        },
        {
          token_id: options.tokenId,
          account: options.to,
          amount: options.amount,
          is_approval: false,
        },
      ],
    };
  },

  transferNft(options: {
    readonly tokenId: EntityId;
    readonly from: EntityId;
    readonly to: EntityId;
    readonly serialNumber: number;
    readonly timestamp?: Date;
  }): Transaction {
    return {
      ...createMockTransaction.build({
        name: "CRYPTOTRANSFER",
        timestamp: options.timestamp,
      }),
      nft_transfers: [
        {
          token_id: options.tokenId,
          sender_account_id: options.from,
          receiver_account_id: options.to,
          serial_number: options.serialNumber,
          is_approval: false,
        },
      ],
    };
  },

  mintToken(options: {
    readonly tokenId: EntityId;
    readonly amount: number;
    readonly timestamp?: Date;
  }): Transaction {
    return createMockTransaction.build({
      name: "TOKENMINT",
      timestamp: options.timestamp,
    });
  },

  burnToken(options: {
    readonly tokenId: EntityId;
    readonly amount: number;
    readonly timestamp?: Date;
  }): Transaction {
    return createMockTransaction.build({
      name: "TOKENBURN",
      timestamp: options.timestamp,
    });
  },

  associateToken(options: {
    readonly accountId: EntityId;
    readonly tokenIds: readonly EntityId[];
    readonly timestamp?: Date;
  }): Transaction {
    return createMockTransaction.build({
      name: "TOKENASSOCIATE",
      timestamp: options.timestamp,
    });
  },

  smartContract(options: {
    readonly contractId: EntityId;
    readonly from?: EntityId;
    readonly gas: number;
    readonly amount?: number;
    readonly functionParameters?: string;
    readonly timestamp?: Date;
  }): Transaction {
    return {
      ...createMockTransaction.build({
        name: "CONTRACTCALL",
        timestamp: options.timestamp,
      }),
      entity_id: options.contractId,
    };
  },
};
