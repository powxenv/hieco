import type { MirrorNodeConfig, NetworkType } from "@hieco/utils";
import { HttpClient } from "./shared/http";
import { AccountApi } from "./accounts/api";
import { TokenApi } from "./tokens/api";
import { ContractApi } from "./contracts/api";
import { TransactionApi } from "./transactions/api";
import { TopicApi } from "./topics/api";
import { ScheduleApi } from "./schedules/api";
import { NetworkApi } from "./network/api";
import { BalanceApi } from "./balances/api";
import { BlockApi } from "./blocks/api";

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
