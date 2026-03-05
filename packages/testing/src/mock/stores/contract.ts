import type {
  ContractState,
  ContractCallInput,
  ContractCall,
  EntityId,
} from "../../types/hiero.js";

const INITIAL_CONTRACT_NUM = 3000;

type ContractId = EntityId;

export class ContractStore extends Map<ContractId, ContractState> {
  #calls: ContractCall[];
  #nextContractNum: number;
  readonly #now: () => Date;

  constructor(now: () => Date = () => new Date()) {
    super();
    this.#calls = [];
    this.#nextContractNum = INITIAL_CONTRACT_NUM;
    this.#now = now;
  }

  create(bytecode: string, adminKey?: string): ContractState {
    const contractId = `0.0.${this.#nextContractNum++}` as ContractId;

    const state: ContractState = {
      contractId,
      bytecode,
      adminKey,
      deleted: false,
    };

    this.set(contractId, state);
    return state;
  }

  recordCall(contractId: ContractId, input: ContractCallInput): void {
    const contract = this.get(contractId);
    if (!contract) return;

    const call: ContractCall = {
      contractId,
      functionName: input.functionName,
      args: input.args,
      result: input.result,
      gasUsed: input.gasUsed,
      timestamp: this.#now(),
    };

    this.#calls.push(call);
  }

  getCalls(contractId: ContractId): ContractCall[] {
    return this.#calls.filter((call) => call.contractId === contractId);
  }

  getCallsByFunction(contractId: ContractId, functionName: string): ContractCall[] {
    return this.#calls.filter(
      (call) => call.contractId === contractId && call.functionName === functionName,
    );
  }

  getAllCalls(): readonly ContractCall[] {
    return [...this.#calls];
  }

  clearCalls(): void {
    this.#calls = [];
  }

  update(contractId: ContractId, updates: Partial<Omit<ContractState, "contractId">>): boolean {
    const contract = this.get(contractId);
    if (!contract) return false;

    const updated: ContractState = {
      ...contract,
      ...updates,
    };

    this.set(contractId, updated);
    return true;
  }

  override delete(contractId: ContractId): boolean {
    const contract = this.get(contractId);
    if (!contract) return false;

    const updated: ContractState = { ...contract, deleted: true };
    this.set(contractId, updated);
    return true;
  }

  override clear(): void {
    super.clear();
    this.#calls = [];
    this.#nextContractNum = INITIAL_CONTRACT_NUM;
  }

  reset(): void {
    this.clear();
  }
}

export function createContractStore(): ContractStore {
  return new ContractStore();
}
