import type { MockHieroClient } from "../../mock/client.js";
import type {
  ContractState,
  ContractCallInput,
  ContractCall,
  EntityId,
} from "../../types/hiero.js";

export class ContractFixture {
  readonly state: ContractState;
  readonly client: MockHieroClient;

  constructor(state: ContractState, client: MockHieroClient) {
    this.state = state;
    this.client = client;
  }

  get contractId(): EntityId {
    return this.state.contractId;
  }

  get bytecode(): string {
    return this.state.bytecode;
  }

  call(input: ContractCallInput): void {
    this.client.contracts.recordCall(this.contractId, input);
  }

  getCalls(): readonly ContractCall[] {
    return this.client.contracts.getCalls(this.contractId);
  }

  getCallsByFunction(functionName: string): readonly ContractCall[] {
    return this.client.contracts.getCallsByFunction(this.contractId, functionName);
  }

  update(updates: Partial<Omit<ContractState, "contractId">>): boolean {
    return this.client.contracts.update(this.contractId, updates);
  }

  delete(): boolean {
    return this.client.contracts.delete(this.contractId);
  }
}

export interface ContractFixtureOptions {
  readonly bytecode: string;
  readonly adminKey?: string;
  readonly autoRenewAccount?: EntityId;
  readonly memo?: string;
}

export function createContractFixture(
  client: MockHieroClient,
  options: ContractFixtureOptions,
): ContractFixture {
  const state = client.contracts.create(options.bytecode, options.adminKey);

  if (options.autoRenewAccount || options.memo) {
    client.contracts.update(state.contractId, options);
  }

  return new ContractFixture(state, client);
}

export function deployContract(
  client: MockHieroClient,
  bytecode: string,
  options?: Omit<ContractFixtureOptions, "bytecode">,
): ContractFixture {
  return createContractFixture(client, { bytecode, ...options });
}
