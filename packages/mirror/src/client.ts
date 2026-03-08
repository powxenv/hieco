import type { MirrorNodeConfig, NetworkType } from "@hieco/utils";
import { HttpClient } from "./shared/http";
import { AccountApi } from "./accounts";
import { TokenApi } from "./tokens";
import { ContractApi } from "./contracts";
import { TransactionApi } from "./transactions";
import { TopicApi } from "./topics";
import { ScheduleApi } from "./schedules";
import { NetworkApi } from "./network";
import { BalanceApi } from "./balances";
import { BlockApi } from "./blocks";

export class MirrorNodeClient {
  readonly account: AccountApi;
  readonly token: TokenApi;
  readonly contract: ContractApi;
  readonly transaction: TransactionApi;
  readonly topic: TopicApi;
  readonly schedule: ScheduleApi;
  readonly network: NetworkApi;
  readonly balance: BalanceApi;
  readonly block: BlockApi;
  readonly networkType: NetworkType;
  readonly baseUrl: string;
  private readonly httpClient: HttpClient;

  constructor(config: MirrorNodeConfig) {
    this.httpClient = new HttpClient(config);
    this.networkType = config.network;
    this.baseUrl = this.httpClient.baseUrl;

    this.account = new AccountApi(this.httpClient);
    this.token = new TokenApi(this.httpClient);
    this.contract = new ContractApi(this.httpClient);
    this.transaction = new TransactionApi(this.httpClient);
    this.topic = new TopicApi(this.httpClient);
    this.schedule = new ScheduleApi(this.httpClient);
    this.network = new NetworkApi(this.httpClient);
    this.balance = new BalanceApi(this.httpClient);
    this.block = new BlockApi(this.httpClient);
  }
}
