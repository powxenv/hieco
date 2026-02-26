export const LIMITS = {
  MIN_LIMIT: 1,
  MAX_LIMIT: 1000,
  DEFAULT_PAGE_LIMIT: 25,
  MAX_NODE_ID: 1000,
} as const;

export const timestampRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})?$/;

export const entityIdRegex = /^\d+\.\d+\.\d+$/;

export const evmAddressRegex = /^0x[a-fA-F0-9]{40}$/;

export const hex64Regex = /^0x[a-fA-F0-9]{64}$/;

export const txIdRegex = /^\d+\.\d+\.\d+@\d{10}(\.\d+)?$/;
