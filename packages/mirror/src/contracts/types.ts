import type { Key } from "@hieco/utils";

export interface ContractInfo {
  readonly admin_key: Key | null;
  readonly auto_renew_account: string | null;
  readonly auto_renew_period: number | null;
  readonly contract_id: string;
  readonly created_timestamp: string;
  readonly deleted: boolean;
  readonly evm_address: string;
  readonly expiration_timestamp: string | null;
  readonly file_id: string | null;
  readonly max_automatic_token_associations: number | null;
  readonly memo: string;
  readonly obtainer_id: string | null;
  readonly permanent_removal: boolean | null;
  readonly proxy_account_id: string | null;
  readonly timestamp: string | null;
}

export interface ContractResult {
  readonly access_list: string | null;
  readonly address: string;
  readonly amount: number | null;
  readonly block_gas_used: number | null;
  readonly block_hash: string | null;
  readonly block_number: number | null;
  readonly bloom: string | null;
  readonly call_result: string | null;
  readonly chain_id: string | null;
  readonly contract_id: string;
  readonly created_contract_ids: readonly string[];
  readonly error_message: string | null;
  readonly from: string | null;
  readonly function_parameters: string;
  readonly gas: number | null;
  readonly gas_used: number;
  readonly max_gas_allowance: number | null;
  readonly nonce: number | null;
  readonly parent_hash: string | null;
  readonly result: string | null;
  readonly timestamp: string;
  readonly to: string;
  readonly value: string | null;
}

export interface ContractLog {
  readonly address: string;
  readonly block_hash: string;
  readonly block_number: number;
  readonly contract_id: string;
  readonly data: string;
  readonly index: number;
  readonly root_contract_id: string;
  readonly timestamp: string;
  readonly topics: readonly string[];
  readonly transaction_hash: string;
  readonly transaction_index: number | null;
}

export interface ContractState {
  readonly contract_id: string;
  readonly address: string;
  readonly slot: string;
  readonly value: string;
  readonly timestamp: string;
}

export interface ContractCallParams {
  readonly contractId: string;
  readonly from?: string;
  readonly gas?: number;
  readonly gasPrice?: number;
  readonly data?: string;
  readonly estimate?: boolean;
  readonly block?: string;
  readonly value?: number;
}

export interface ContractCallResult {
  readonly result: string;
  readonly error?: string;
}

export interface ContractResultDetails {
  readonly access_list: string | null;
  readonly amount: number | null;
  readonly block_gas_used: number | null;
  readonly block_hash: string | null;
  readonly block_number: number | null;
  readonly bloom: string | null;
  readonly call_result: string | null;
  readonly chain_id: string | null;
  readonly contract_id: string;
  readonly created_contract_ids: readonly string[];
  readonly error_message: string | null;
  readonly from: string | null;
  readonly function_parameters: string;
  readonly gas: number | null;
  readonly gas_used: number;
  readonly hash: string;
  readonly max_gas_allowance: number | null;
  readonly nonce: number | null;
  readonly parent_hash: string | null;
  readonly result: string | null;
  readonly timestamp: string;
  readonly to: string;
  readonly transaction_id: string;
  readonly value: string | null;
}

export interface ContractResultsResponse {
  readonly results: readonly ContractResult[];
  readonly links: {
    readonly next?: string;
  };
}

export interface ContractAction {
  readonly caller: string;
  readonly call_depth: number;
  readonly call_operation_type: string;
  readonly call_type: string;
  readonly destination_data: string;
  readonly function_parameters: string;
  readonly function_result_data: string;
  readonly gas: number;
  readonly index: number;
  readonly input: string;
  readonly recipient: string;
  readonly result_data: string;
  readonly type: string;
  readonly value: number;
}

export interface ContractOpcodesResponse {
  readonly opcodes: readonly {
    readonly address: string;
    readonly instruction: string;
    readonly opcode: number;
    readonly gas: number;
  }[];
}
