import type { EntityId, Timestamp, Key } from "../rest-api";

export interface ContractInfo {
  admin_key: Key | null;
  auto_renew_account: EntityId | null;
  auto_renew_period: number | null;
  contract_id: EntityId;
  created_timestamp: Timestamp;
  deleted: boolean;
  evm_address: string;
  expiration_timestamp: Timestamp | null;
  file_id: EntityId | null;
  max_automatic_token_associations: number | null;
  memo: string;
  obtainer_id: EntityId | null;
  permanent_removal: boolean | null;
  proxy_account_id: EntityId | null;
  timestamp: Timestamp | null;
}

export interface ContractResult {
  access_list: string | null;
  address: string;
  amount: number | null;
  block_gas_used: number | null;
  block_hash: string | null;
  block_number: number | null;
  bloom: string | null;
  call_result: string | null;
  chain_id: string | null;
  contract_id: EntityId;
  created_contract_ids: EntityId[];
  error_message: string | null;
  from: string | null;
  function_parameters: string;
  gas: number | null;
  gas_used: number;
  max_gas_allowance: number | null;
  nonce: number | null;
  parent_hash: string | null;
  result: string | null;
  timestamp: Timestamp;
  to: string;
  value: string | null;
}

export interface ContractLog {
  address: string;
  block_hash: string;
  block_number: number;
  contract_id: EntityId;
  data: string;
  index: number;
  root_contract_id: EntityId;
  timestamp: Timestamp;
  topics: string[];
  transaction_hash: string;
  transaction_index: number | null;
}

export interface ContractState {
  contract_id: EntityId;
  address: string;
  slot: string;
  value: string;
  timestamp: Timestamp;
}

export interface ContractCallParams {
  contractId: EntityId | string;
  from?: string;
  gas?: number;
  gasPrice?: number;
  data?: string;
  estimate?: boolean;
  block?: string;
  value?: number;
}

export interface ContractCallResult {
  result: string;
  error?: string;
}

export interface ContractResultDetails {
  access_list: string | null;
  amount: number | null;
  block_gas_used: number | null;
  block_hash: string | null;
  block_number: number | null;
  bloom: string | null;
  call_result: string | null;
  chain_id: string | null;
  contract_id: EntityId;
  created_contract_ids: EntityId[];
  error_message: string | null;
  from: string | null;
  function_parameters: string;
  gas: number | null;
  gas_used: number;
  hash: string;
  max_gas_allowance: number | null;
  nonce: number | null;
  parent_hash: string | null;
  result: string | null;
  timestamp: Timestamp;
  to: string;
  transaction_id: string;
  value: string | null;
}

export interface ContractResultsResponse {
  results: ContractResult[];
  links: {
    next?: string;
  };
}

export interface ContractAction {
  caller: string;
  call_depth: number;
  call_operation_type: string;
  call_type: string;
  destination_data: string;
  function_parameters: string;
  function_result_data: string;
  gas: number;
  index: number;
  input: string;
  recipient: string;
  result_data: string;
  type: string;
  value: number;
}

export interface ContractOpcodesResponse {
  opcodes: {
    address: string;
    instruction: string;
    opcode: number;
    gas: number;
  }[];
}
