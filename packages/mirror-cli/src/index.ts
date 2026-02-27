import { Command } from "commander";
import {
  getAccountInfo,
  getAccountBalance,
  getAccountTokens,
  getAccountNfts,
  getStakingRewards,
  getCryptoAllowances,
  getTokenAllowances,
  getNftAllowances,
  getOutstandingAirdrops,
  getPendingAirdrops,
  listAccounts,
} from "./commands/accounts";
import { getBalances, listBalances } from "./commands/balances";
import {
  getTokenInfo,
  getTokenBalances,
  getTokenNfts,
  getNftBySerial,
  getNftTransactions,
  listTokens,
} from "./commands/tokens";
import {
  getTransactionInfo,
  getTransactionsByAccount,
  listTransactions,
} from "./commands/transactions";
import { getBlockInfo, getBlocks, listBlocks } from "./commands/blocks";
import {
  getContractInfo,
  callContract,
  getContractResults,
  getContractResult,
  getContractState,
  getContractLogs,
  getAllContractResults,
  getResultByTransaction,
  getResultActions,
  getResultOpcodes,
  listContracts,
} from "./commands/contracts";
import { getScheduleInfo, listSchedules } from "./commands/schedules";
import {
  getTopicInfo,
  getTopicMessages,
  getTopicMessage,
  getMessageByTimestamp,
  listTopics,
} from "./commands/topics";
import {
  getNetworkState,
  getExchangeRate,
  getNetworkFees,
  getNetworkNodes,
  getNetworkStake,
  getNetworkSupply,
  listNetworkNodes,
} from "./commands/network";
import { version } from "../package.json";

const program = new Command();

program
  .name("hieco")
  .description("CLI tool for Hedera Mirror Node REST API")
  .version(version)
  .option("-n, --network <network>", "Network to query (mainnet, testnet, previewnet)", "mainnet")
  .option("-u, --mirror-url <url>", "Custom Mirror Node URL");

// Account commands
program
  .command("account")
  .description("Query account information")
  .argument("<accountId>", "Hedera account ID (e.g., 0.0.123)")
  .option("-t, --timestamp <timestamp>", "Query state at specific timestamp")
  .option("-j, --json", "Output as JSON")
  .action(getAccountInfo);

program
  .command("balance")
  .description("Query account balances (HBAR + tokens)")
  .argument("<accountId>", "Hedera account ID (e.g., 0.0.123)")
  .option("-j, --json", "Output as JSON")
  .action(getAccountBalance);

program
  .command("balances")
  .description("Query all account balances with filters")
  .option("--account <accountId>", "Filter by account ID")
  .option("--account-balance <balance>", "Filter by account balance (tinybars)")
  .option("--limit <number>", "Maximum results to return")
  .option("--order <order>", "Sort order (asc or desc)")
  .option("--public-key <key>", "Filter by public key")
  .option("-t, --timestamp <timestamp>", "Query at specific timestamp")
  .option("-j, --json", "Output as JSON")
  .action(getBalances);

program
  .command("balances:list")
  .description("List all account balances")
  .option("--account <accountId>", "Filter by account ID")
  .option("--account-balance <balance>", "Filter by account balance (tinybars)")
  .option("--limit <number>", "Maximum results to return")
  .option("--order <order>", "Sort order (asc or desc)")
  .option("--public-key <key>", "Filter by public key")
  .option("-t, --timestamp <timestamp>", "Query at specific timestamp")
  .option("-j, --json", "Output as JSON")
  .action(listBalances);

program
  .command("account:tokens")
  .description("Query all tokens associated with an account")
  .argument("<accountId>", "Hedera account ID (e.g., 0.0.123)")
  .option("--token-id <tokenId>", "Filter by token ID")
  .option("-j, --json", "Output as JSON")
  .action(getAccountTokens);

program
  .command("account:nfts")
  .description("Query all NFTs held by an account")
  .argument("<accountId>", "Hedera account ID (e.g., 0.0.123)")
  .option("--spender-id <spenderId>", "Filter by spender ID")
  .option("--token-id <tokenId>", "Filter by token ID")
  .option("--serial-number <number>", "Filter by serial number")
  .option("-j, --json", "Output as JSON")
  .action(getAccountNfts);

program
  .command("account:rewards")
  .description("Query staking rewards for an account")
  .argument("<accountId>", "Hedera account ID (e.g., 0.0.123)")
  .option("-t, --timestamp <timestamp>", "Query at specific timestamp")
  .option("-j, --json", "Output as JSON")
  .action(getStakingRewards);

program
  .command("account:crypto-allowances")
  .description("Query HBAR allowances granted by an account")
  .argument("<accountId>", "Hedera account ID (e.g., 0.0.123)")
  .option("--spender-id <spenderId>", "Filter by spender ID")
  .option("-j, --json", "Output as JSON")
  .action(getCryptoAllowances);

program
  .command("account:token-allowances")
  .description("Query token allowances granted by an account")
  .argument("<accountId>", "Hedera account ID (e.g., 0.0.123)")
  .option("--spender-id <spenderId>", "Filter by spender ID")
  .option("--token-id <tokenId>", "Filter by token ID")
  .option("-j, --json", "Output as JSON")
  .action(getTokenAllowances);

program
  .command("account:nft-allowances")
  .description("Query NFT allowances granted by an account")
  .argument("<accountId>", "Hedera account ID (e.g., 0.0.123)")
  .option("--account-id <accountId>", "Filter by account ID")
  .option("--token-id <tokenId>", "Filter by token ID")
  .option("--owner", "Filter by owner status")
  .option("-j, --json", "Output as JSON")
  .action(getNftAllowances);

program
  .command("account:airdrops:outstanding")
  .description("Query outstanding NFT airdrops for an account")
  .argument("<accountId>", "Hedera account ID (e.g., 0.0.123)")
  .option("--receiver-id <receiverId>", "Filter by receiver ID")
  .option("--serial-number <number>", "Filter by serial number")
  .option("--token-id <tokenId>", "Filter by token ID")
  .option("-j, --json", "Output as JSON")
  .action(getOutstandingAirdrops);

program
  .command("account:airdrops:pending")
  .description("Query pending NFT airdrops for an account")
  .argument("<accountId>", "Hedera account ID (e.g., 0.0.123)")
  .option("--sender-id <senderId>", "Filter by sender ID")
  .option("--serial-number <number>", "Filter by serial number")
  .option("--token-id <tokenId>", "Filter by token ID")
  .option("-j, --json", "Output as JSON")
  .action(getPendingAirdrops);

program
  .command("accounts:list")
  .description("List all Hedera accounts with filters")
  .option("--account <accountId>", "Filter by account ID")
  .option("--alias <alias>", "Filter by alias")
  .option("--balance <balance>", "Filter by exact HBAR balance (in tinybars)")
  .option("--balance-gte <balance>", "Filter by balance >=")
  .option("--balance-lte <balance>", "Filter by balance <=")
  .option("--evm-address <address>", "Filter by EVM address")
  .option("--key <key>", "Filter by public key")
  .option("--limit <number>", "Maximum results to return")
  .option("--memo <memo>", "Filter by memo")
  .option("--order <order>", "Sort order (asc or desc)")
  .option("--public-key <key>", "Filter by public key")
  .option("--smart-contract", "Filter for smart contracts only")
  .option("--staked-account <accountId>", "Filter by staked account ID")
  .option("--staked-node <nodeId>", "Filter by staked node ID")
  .option("-j, --json", "Output as JSON")
  .action(listAccounts);

// Token commands
program
  .command("token")
  .description("Query token information")
  .argument("<tokenId>", "Token ID (e.g., 0.0.456)")
  .option("-t, --timestamp <timestamp>", "Query at specific timestamp")
  .option("-j, --json", "Output as JSON")
  .action(getTokenInfo);

program
  .command("token:balances")
  .description("Query all account balances for a token")
  .argument("<tokenId>", "Token ID (e.g., 0.0.456)")
  .option("--account-id <accountId>", "Filter by account ID")
  .option("--account-balance <balance>", "Filter by account balance")
  .option("--account-public-key <key>", "Filter by account public key")
  .option("-t, --timestamp <timestamp>", "Query at specific timestamp")
  .option("-j, --json", "Output as JSON")
  .action(getTokenBalances);

program
  .command("token:nfts")
  .description("Query all NFTs for a token")
  .argument("<tokenId>", "Token ID (e.g., 0.0.456)")
  .option("--account-id <accountId>", "Filter by account ID")
  .option("--serial-number <number>", "Filter by serial number")
  .option("-j, --json", "Output as JSON")
  .action(getTokenNfts);

program
  .command("token:nft")
  .description("Query a specific NFT by token ID and serial number")
  .argument("<tokenId>", "Token ID (e.g., 0.0.456)")
  .argument("<serialNumber>", "NFT serial number")
  .option("-j, --json", "Output as JSON")
  .action(getNftBySerial);

program
  .command("token:nft:transactions")
  .description("Query all transactions for a specific NFT")
  .argument("<tokenId>", "Token ID (e.g., 0.0.456)")
  .argument("<serialNumber>", "NFT serial number")
  .option("-t, --timestamp <timestamp>", "Query at specific timestamp")
  .option("-j, --json", "Output as JSON")
  .action(getNftTransactions);

program
  .command("tokens:list")
  .description("List all Hedera tokens with filters")
  .option("--account-id <accountId>", "Filter by account ID")
  .option("--token-id <tokenId>", "Filter by token ID")
  .option("--limit <number>", "Maximum results to return")
  .option("--name <name>", "Filter by token name")
  .option("--order <order>", "Sort order (asc or desc)")
  .option("--public-key <key>", "Filter by public key")
  .option("--type <type>", "Filter by token type (FUNGIBLE_COMMON or NON_FUNGIBLE_UNIQUE)")
  .option("-j, --json", "Output as JSON")
  .action(listTokens);

// Transaction commands
program
  .command("transaction")
  .description("Query transaction details")
  .argument("<transactionId>", "Transaction ID")
  .option("--nonce <number>", "Transaction nonce for scheduled transactions")
  .option("--scheduled", "Whether this is a scheduled transaction")
  .option("-j, --json", "Output as JSON")
  .action(getTransactionInfo);

program
  .command("transactions:account")
  .description("Query all transactions for an account")
  .argument("<accountId>", "Hedera account ID (e.g., 0.0.123)")
  .option("--result <result>", "Filter by transaction result")
  .option("--scheduled", "Filter for scheduled transactions")
  .option("-t, --timestamp <timestamp>", "Query at specific timestamp")
  .option("--transaction-id <transactionId>", "Filter by transaction ID")
  .option("--transaction-hash <hash>", "Filter by transaction hash")
  .option("--transaction-type <type>", "Filter by transaction type")
  .option("--type <type>", "Filter by credit/debit type")
  .option("-j, --json", "Output as JSON")
  .action(getTransactionsByAccount);

program
  .command("transactions:list")
  .description("List all Hedera transactions with filters")
  .option("--account <accountId>", "Filter by account ID")
  .option("--account-id <accountId>", "Filter by account ID (array supported)")
  .option("--limit <number>", "Maximum results to return")
  .option("--order <order>", "Sort order (asc or desc)")
  .option("--result <result>", "Filter by transaction result")
  .option("--scheduled", "Filter for scheduled transactions")
  .option("-t, --timestamp <timestamp>", "Query at specific timestamp")
  .option("--transaction-hash <hash>", "Filter by transaction hash")
  .option("--transaction-id <transactionId>", "Filter by transaction ID")
  .option("--transaction-type <type>", "Filter by transaction type")
  .option("--transfers-account <accountId>", "Filter by transfers account ID")
  .option("--type <type>", "Filter by credit/debit type")
  .option("-j, --json", "Output as JSON")
  .action(listTransactions);

// Block commands
program
  .command("block")
  .description("Query block information")
  .argument("<blockHashOrNumber>", "Block hash or number")
  .option("-j, --json", "Output as JSON")
  .action(getBlockInfo);

program
  .command("blocks")
  .description("Query block information with filters")
  .option("--block-number <number>", "Filter by block number")
  .option("--limit <number>", "Maximum results to return")
  .option("--order <order>", "Sort order (asc or desc)")
  .option("-t, --timestamp <timestamp>", "Query at specific timestamp")
  .option("-j, --json", "Output as JSON")
  .action(getBlocks);

program
  .command("blocks:list")
  .description("List all Hedera blocks")
  .option("--block-number <number>", "Filter by block number")
  .option("--limit <number>", "Maximum results to return")
  .option("--order <order>", "Sort order (asc or desc)")
  .option("-t, --timestamp <timestamp>", "Query at specific timestamp")
  .option("-j, --json", "Output as JSON")
  .action(listBlocks);

// Contract commands
program
  .command("contract")
  .description("Query smart contract information")
  .argument("<contractId>", "Contract ID or EVM address")
  .option("-t, --timestamp <timestamp>", "Query at specific timestamp")
  .option("-j, --json", "Output as JSON")
  .action(getContractInfo);

program
  .command("contract:call")
  .description("Execute a read-only smart contract call")
  .argument("<contractId>", "Contract ID or EVM address")
  .option("--from <address>", "Caller EVM address")
  .option("--gas <number>", "Gas limit for the call")
  .option("--gas-price <number>", "Gas price in tinybars")
  .option("--data <data>", "Encoded function call data")
  .option("--estimate", "Whether to estimate gas")
  .option("--block <block>", "Block number or 'latest'")
  .option("--value <number>", "Value to send in tinybars")
  .option("-j, --json", "Output as JSON")
  .action(callContract);

program
  .command("contract:results")
  .description("Query all contract execution results")
  .argument("<contractId>", "Contract ID (e.g., 0.0.789)")
  .option("--block-hash <hash>", "Filter by block hash")
  .option("--block-number <number>", "Filter by block number")
  .option("--from <address>", "Filter by caller address")
  .option("--internal", "Filter for internal calls")
  .option("-t, --timestamp <timestamp>", "Query at specific timestamp")
  .option("--transaction-index <number>", "Filter by transaction index")
  .option("-j, --json", "Output as JSON")
  .action(getContractResults);

program
  .command("contract:result")
  .description("Query a specific contract result by timestamp")
  .argument("<contractId>", "Contract ID (e.g., 0.0.789)")
  .argument("<timestamp>", "ISO timestamp of the contract result")
  .option("-j, --json", "Output as JSON")
  .action(getContractResult);

program
  .command("contract:state")
  .description("Query contract storage state")
  .argument("<contractId>", "Contract ID (e.g., 0.0.789)")
  .option("--slot <slot>", "Filter by storage slot")
  .option("-t, --timestamp <timestamp>", "Query at specific timestamp")
  .option("-j, --json", "Output as JSON")
  .action(getContractState);

program
  .command("contract:logs")
  .description("Query event logs for a contract")
  .argument("<contractId>", "Contract ID (e.g., 0.0.789)")
  .option("--index <number>", "Filter by log index")
  .option("-t, --timestamp <timestamp>", "Query at specific timestamp")
  .option("--topic0 <topic>", "Filter by event signature (topic 0)")
  .option("--topic1 <topic>", "Filter by topic 1")
  .option("--topic2 <topic>", "Filter by topic 2")
  .option("--topic3 <topic>", "Filter by topic 3")
  .option("--transaction-hash <hash>", "Filter by transaction hash")
  .option("-j, --json", "Output as JSON")
  .action(getContractLogs);

program
  .command("contracts:results")
  .description("Query all contract execution results across all contracts")
  .option("--from <address>", "Filter by caller address")
  .option("--block-hash <hash>", "Filter by block hash")
  .option("--block-number <number>", "Filter by block number")
  .option("--internal", "Filter for internal calls")
  .option("-t, --timestamp <timestamp>", "Query at specific timestamp")
  .option("--transaction-index <number>", "Filter by transaction index")
  .option("-j, --json", "Output as JSON")
  .action(getAllContractResults);

program
  .command("contract:by-tx")
  .description("Query contract result by transaction ID or hash")
  .argument("<transactionIdOrHash>", "Transaction ID or hash")
  .option("--nonce <number>", "Transaction nonce")
  .option("-j, --json", "Output as JSON")
  .action(getResultByTransaction);

program
  .command("contract:actions")
  .description("Query contract result actions by transaction")
  .argument("<transactionIdOrHash>", "Transaction ID or hash")
  .option("--index <number>", "Filter by action index")
  .option("-j, --json", "Output as JSON")
  .action(getResultActions);

program
  .command("contract:opcodes")
  .description("Query contract result opcodes by transaction")
  .argument("<transactionIdOrHash>", "Transaction ID or hash")
  .option("--stack", "Include stack trace")
  .option("--memory", "Include memory dump")
  .option("--storage", "Include storage state")
  .option("-j, --json", "Output as JSON")
  .action(getResultOpcodes);

program
  .command("contracts:list")
  .description("List all Hedera smart contracts")
  .option("--address <address>", "Filter by EVM address")
  .option("--contract-id <contractId>", "Filter by contract ID")
  .option("--limit <number>", "Maximum results to return")
  .option("--order <order>", "Sort order (asc or desc)")
  .option("--smart-contract-id <contractId>", "Filter by smart contract ID")
  .option("-j, --json", "Output as JSON")
  .action(listContracts);

// Schedule commands
program
  .command("schedule")
  .description("Query scheduled transaction information")
  .argument("<scheduleId>", "Schedule ID (e.g., 0.0.321)")
  .option("-j, --json", "Output as JSON")
  .action(getScheduleInfo);

program
  .command("schedules:list")
  .description("List all Hedera scheduled transactions")
  .option("--account-id <accountId>", "Filter by account ID")
  .option("--admin-key <key>", "Filter by admin key")
  .option("--creator-account-id <accountId>", "Filter by creator account ID")
  .option("--deleted", "Filter for deleted schedules")
  .option("--executed-timestamp <timestamp>", "Filter by executed timestamp")
  .option("--expiration-timestamp <timestamp>", "Filter by expiration timestamp")
  .option("--limit <number>", "Maximum results to return")
  .option("--memo <memo>", "Filter by memo")
  .option("--order <order>", "Sort order (asc or desc)")
  .option("--payer-account-id <accountId>", "Filter by payer account ID")
  .option("--schedule-id <scheduleId>", "Filter by schedule ID")
  .option("-j, --json", "Output as JSON")
  .action(listSchedules);

// Topic commands
program
  .command("topic")
  .description("Query topic information")
  .argument("<topicId>", "Topic ID (e.g., 0.0.654)")
  .option("-j, --json", "Output as JSON")
  .action(getTopicInfo);

program
  .command("topic:messages")
  .description("Query all messages from a topic")
  .argument("<topicId>", "Topic ID (e.g., 0.0.654)")
  .option("--encoding <encoding>", "Message encoding format (base64 or utf-8)")
  .option("--sequence-number <number>", "Filter by sequence number")
  .option("-t, --timestamp <timestamp>", "Query at specific timestamp")
  .option("--transaction-id <transactionId>", "Filter by transaction ID")
  .option("--scheduled", "Filter for scheduled transactions")
  .option("-j, --json", "Output as JSON")
  .action(getTopicMessages);

program
  .command("topic:message")
  .description("Query a specific topic message by sequence number")
  .argument("<topicId>", "Topic ID (e.g., 0.0.654)")
  .argument("<sequenceNumber>", "Message sequence number")
  .option("-j, --json", "Output as JSON")
  .action(getTopicMessage);

program
  .command("topic:message-by-timestamp")
  .description("Query a topic message by its timestamp")
  .argument("<timestamp>", "ISO timestamp of the message")
  .option("-j, --json", "Output as JSON")
  .action(getMessageByTimestamp);

program
  .command("topics:list")
  .description("List all Hedera consensus topics")
  .option("--limit <number>", "Maximum results to return")
  .option("--order <order>", "Sort order (asc or desc)")
  .option("-j, --json", "Output as JSON")
  .action(listTopics);

// Network commands
program
  .command("network")
  .description("Query network information (exchange rate, fees, stake, supply)")
  .option("-j, --json", "Output as JSON")
  .action(getNetworkState);

program
  .command("network:exchange-rate")
  .description("Query the current HBAR to USD exchange rate")
  .option("-t, --timestamp <timestamp>", "Query at specific timestamp")
  .option("-j, --json", "Output as JSON")
  .action(getExchangeRate);

program
  .command("network:fees")
  .description("Query current network fee schedules")
  .option("--limit <number>", "Maximum results to return")
  .option("--order <order>", "Sort order (asc or desc)")
  .option("-t, --timestamp <timestamp>", "Query at specific timestamp")
  .option("-j, --json", "Output as JSON")
  .action(getNetworkFees);

program
  .command("network:nodes")
  .description("Query information about Hedera network nodes")
  .option("--file-id <fileId>", "Filter by file ID")
  .option("--node-id <nodeId>", "Filter by node ID")
  .option("--limit <number>", "Maximum results to return")
  .option("--order <order>", "Sort order (asc or desc)")
  .option("-j, --json", "Output as JSON")
  .action(getNetworkNodes);

program
  .command("network:stake")
  .description("Query current network staking information")
  .option("-j, --json", "Output as JSON")
  .action(getNetworkStake);

program
  .command("network:supply")
  .description("Query current HBAR token supply information")
  .option("-j, --json", "Output as JSON")
  .action(getNetworkSupply);

program
  .command("network:nodes:list")
  .description("List all Hedera network nodes")
  .option("--file-id <fileId>", "Filter by file ID")
  .option("--node-id <nodeId>", "Filter by node ID")
  .option("--limit <number>", "Maximum results to return")
  .option("--order <order>", "Sort order (asc or desc)")
  .option("-j, --json", "Output as JSON")
  .action(listNetworkNodes);

program.parse();
