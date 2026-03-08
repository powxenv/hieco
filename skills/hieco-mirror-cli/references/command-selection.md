# Command Selection

Use this file to choose the right command before opening the full API references.

## Accounts And Balances

Use:

- `account` for one account
- `balance` for one account’s HBAR and token balances
- `balances` or `balances:list` for many balances
- `account:tokens`, `account:nfts`, `account:rewards`, and allowance or airdrop commands for account subresources
- `accounts:list` for filtered account discovery

Load: [api-accounts.md](api-accounts.md)

## Tokens And NFTs

Use:

- `token` for one token
- `token:balances` for token holders
- `token:nfts` and `token:nft` for NFT inventory
- `token:nft:transactions` for NFT history
- `tokens:list` for filtered token discovery

Load: [api-tokens.md](api-tokens.md)

## Transactions

Use:

- `transaction` for one transaction
- `transactions:account` for one account’s transaction history
- `transactions:list` for broader transaction search

Load: [api-transactions.md](api-transactions.md)

## Blocks

Use:

- `block` for one block
- `blocks` for filtered block queries
- `blocks:list` for general block listings

Load: [api-blocks.md](api-blocks.md)

## Contracts

Use:

- `contract` for contract metadata
- `contract:call` for mirror read calls
- `contract:results`, `contract:result`, `contracts:results`, `contract:by-tx`, `contract:actions`, and `contract:opcodes` for execution history
- `contract:state` for storage state
- `contract:logs` for event logs
- `contracts:list` for discovery

Load: [api-contracts.md](api-contracts.md)

## Schedules

Use:

- `schedule` for one schedule
- `schedules:list` for schedule discovery and filtering

Load: [api-schedules.md](api-schedules.md)

## Topics

Use:

- `topic` for topic metadata
- `topic:messages` for a topic’s message stream
- `topic:message` for one message by sequence number
- `topic:message-by-timestamp` for message lookup by consensus timestamp
- `topics:list` for discovery

Load: [api-topics.md](api-topics.md)

## Network

Use:

- `network` for one aggregate network report
- `network:exchange-rate`, `network:fees`, `network:nodes`, `network:stake`, and `network:supply` for focused network reads
- `network:nodes:list` for node listings

Load: [api-network.md](api-network.md)
