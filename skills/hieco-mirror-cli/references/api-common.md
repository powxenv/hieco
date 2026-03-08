# Common CLI Contract

Canonical docs:

- [`@hieco/mirror-cli` README](https://github.com/powxenv/hieco/tree/main/packages/mirror-cli)
- Package sources and installed lookup paths: [sources.md](sources.md)

## Binary And Invocation

| Item                | Contract                                                                   |
| ------------------- | -------------------------------------------------------------------------- |
| package             | `@hieco/mirror-cli`                                                        |
| binary              | `hieco`                                                                    |
| recommended usage   | `bunx @hieco/mirror-cli [global-options] <command> [command-options]`      |
| alternate usage     | `npx @hieco/mirror-cli [global-options] <command> [command-options]`       |
| direct binary usage | `hieco [global-options] <command> [command-options]`                       |
| help                | `bunx @hieco/mirror-cli --help`, `bunx @hieco/mirror-cli <command> --help` |

## Global Flags

| Flag                      | What it does                               | Parameters                            | Return effect                                    |
| ------------------------- | ------------------------------------------ | ------------------------------------- | ------------------------------------------------ |
| `-n, --network <network>` | Choose the built-in network.               | `mainnet`, `testnet`, or `previewnet` | Changes the target Mirror Node network.          |
| `-u, --mirror-url <url>`  | Override the default Mirror Node endpoint. | full URL                              | Sends requests to a custom Mirror Node endpoint. |

The CLI defaults to `mainnet`.

## Common Local Flags

| Flag                          | What it does                                                   | Parameters       |
| ----------------------------- | -------------------------------------------------------------- | ---------------- |
| `-j, --json`                  | Print machine-friendly JSON instead of a formatted table.      | none             |
| `--limit <number>`            | Restrict the number of returned items for list-style commands. | positive integer |
| `--order <order>`             | Choose result order for commands that support ordering.        | `asc` or `desc`  |
| `-t, --timestamp <timestamp>` | Query at or around a specific consensus time.                  | timestamp string |

## Output Contract

| Mode     | Behavior                                                         |
| -------- | ---------------------------------------------------------------- |
| default  | Prints a formatted table or nested summary for terminal reading. |
| `--json` | Prints JSON produced from the CLI’s formatted output object.     |

Important: `--json` does not emit the raw Mirror Node REST payload. It emits the CLI’s normalized output model.

## Exit Behavior

| Exit code | Meaning                                                                                  |
| --------- | ---------------------------------------------------------------------------------------- |
| `0`       | command completed successfully                                                           |
| `1`       | mirror query failed, input could not be resolved, or the command handler raised an error |

## ID And Value Formats

| Value type          | Format                          | Example                                      |
| ------------------- | ------------------------------- | -------------------------------------------- |
| entity ID           | `shard.realm.num`               | `0.0.123`                                    |
| transaction ID      | `shard.realm.num@seconds@nanos` | `0.0.123@1700000000@123456789`               |
| consensus timestamp | `seconds.nanos`                 | `1700000000.123456789`                       |
| ISO timestamp       | `YYYY-MM-DDTHH:MM:SSZ`          | `2024-01-01T00:00:00Z`                       |
| EVM address         | `0x...`                         | `0x0000000000000000000000000000000000001234` |

## Command Naming Conventions

| Pattern                                                                     | Meaning                   |
| --------------------------------------------------------------------------- | ------------------------- |
| `account`, `token`, `transaction`, `block`, `contract`, `schedule`, `topic` | single-resource lookup    |
| `balances`, `blocks`, `network:nodes`, `contract:results`, `topic:messages` | filtered collection query |
| `accounts:list`, `tokens:list`, `contracts:list`, `topics:list`             | broad list view           |
| `account:*`, `token:*`, `contract:*`, `network:*`, `topic:*`                | domain subcommands        |

## Exact Installed Lookup Paths

Read these when an agent needs the live command registration:

1. `node_modules/@hieco/mirror-cli/package.json`
2. `node_modules/@hieco/mirror-cli/README.md`
3. `node_modules/@hieco/mirror-cli/dist/index.js`
