export interface RelaySubscription {
  readonly type: "logs" | "newHeads";
  readonly filter: {
    readonly address?: string | readonly string[];
    readonly topics?: readonly (string | readonly string[] | null)[];
  };
}

export interface LogResult {
  readonly address: string;
  readonly blockHash: string;
  readonly blockNumber: string;
  readonly data: string;
  readonly logIndex: string;
  readonly topics: readonly string[];
  readonly transactionHash: string;
  readonly transactionIndex: string;
}

export interface NewHeadsResult {
  readonly hash: string;
  readonly parentHash: string;
  readonly sha3Uncles: string;
  readonly logsBloom: string;
  readonly transactionsRoot: string;
  readonly stateRoot: string;
  readonly receiptsRoot: string;
  readonly number: string;
  readonly gasLimit: string;
  readonly gasUsed: string;
  readonly timestamp: string;
  readonly extraData: string;
  readonly difficulty: string;
  readonly miner: string;
  readonly nonce: string;
  readonly size?: string;
  readonly totalDifficulty?: string;
  readonly mixHash?: string;
}

export interface RelayMessage {
  readonly subscription: string;
  readonly result: LogResult | NewHeadsResult;
}
