# Best Practices

## Pick The Smallest Command That Solves The Task

- Use single-resource commands like `account`, `token`, `transaction`, `block`, `contract`, `schedule`, and `topic` when you already know the target ID.
- Use `*:list` commands when you need a broad listing.
- Use filtered collection commands like `balances`, `blocks`, `contract:results`, `topic:messages`, and `transactions:list` when the task needs query parameters.

## Prefer `--json` For Automation

- Use table output for human inspection.
- Use `--json` for scripts, pipes, snapshots, and AI post-processing.
- The CLI JSON output is the CLI’s formatted object, not the raw Mirror Node REST payload.

## Always Set The Network Explicitly In Examples

- Use `--network testnet` or `--network previewnet` when the example is not clearly mainnet-specific.
- The CLI defaults to `mainnet`.
- Use `--mirror-url` when the task requires a custom endpoint.

## Use Filters Instead Of Fetching Everything

- Pair `--limit` with list commands.
- Use `--order desc` when the task needs recent data first.
- Use timestamp filters when looking for specific time windows.

## Match The ID Format To The Command

- entity commands expect `shard.realm.num`, such as `0.0.123`
- transaction commands expect `shard.realm.num@seconds@nanos`
- topic message timestamp lookups expect `seconds.nanos`
- contract commands may accept contract ID or EVM address where documented

## Handle Failures As CLI Failures

- success path exits with code `0`
- mirror fetch or command failures exit with code `1`
- use `--json` plus shell exit checks in scripts

## Contract Calls Need Encoded Data

- `contract:call` is for read-only mirror calls
- pass encoded calldata with `--data`
- use `--estimate` when the task is about approximate gas behavior

## Understand The Network Command Split

- `network` aggregates exchange rate, fees, stake, and supply into one report
- `network:exchange-rate`, `network:fees`, `network:nodes`, `network:stake`, and `network:supply` are narrower and easier to script

## Read The Generated Help For Exact Usage

- `hieco --help`
- `hieco <command> --help`

This is the fastest way to confirm the live argument and option contract.
