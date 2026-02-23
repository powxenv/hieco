import type { MirrorNodeConfig, NetworkType } from "../types/rest-api";
import { HttpClient } from "./http-client";
import { AccountApi } from "./apis/account-api";
import { TokenApi } from "./apis/token-api";
import { ContractApi } from "./apis/contract-api";
import { TransactionApi } from "./apis/transaction-api";
import { TopicApi } from "./apis/topic-api";
import { ScheduleApi } from "./apis/schedule-api";
import { NetworkApi } from "./apis/network-api";

export class MirrorNodeClient {
  readonly account: AccountApi;
  readonly token: TokenApi;
  readonly contract: ContractApi;
  readonly transaction: TransactionApi;
  readonly topic: TopicApi;
  readonly schedule: ScheduleApi;
  readonly network: NetworkApi;
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
  }
}
