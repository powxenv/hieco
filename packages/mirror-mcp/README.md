# @hiecom/mirror-mcp

MCP server for Hedera Mirror Node REST API. Provides **55 tools** across 9 API modules for interacting with Hedera blockchain data.

## Installation

```bash
bun add @hiecom/mirror-mcp
```

## Quick Start

Run directly:

```bash
bunx @hiecom/mirror-mcp
```

## Environment Variables

| Variable          | Description                                           | Default         |
| ----------------- | ----------------------------------------------------- | --------------- |
| `MIRROR_NETWORK`  | Hedera network: `mainnet`, `testnet`, or `previewnet` | `mainnet`       |
| `MIRROR_NODE_URL` | Custom Mirror Node URL (optional)                     | Network default |

---

## AI Agent Configuration

<details>
<summary>Claude Code</summary>

**Global**: `~/.claude.json` (macOS/Linux) or `%USERPROFILE%\.claude.json` (Windows)

**Project**: `.mcp.json` in project root

```json
{
  "mcpServers": {
    "mirror-mcp": {
      "command": "bunx",
      "args": ["@hiecom/mirror-mcp"],
      "env": {
        "MIRROR_NETWORK": "mainnet"
      }
    }
  }
}
```

</details>

<details>
<summary>OpenCode</summary>

**Global**: `~/.config/opencode/opencode.json` (or `.jsonc`)

**Project**: `opencode.json` in project root (or `opencode.jsonc`)

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "mirror-mcp": {
      "type": "local",
      "command": ["bunx", "@hiecom/mirror-mcp"],
      "enabled": true,
      "environment": {
        "MIRROR_NETWORK": "mainnet"
      }
    }
  }
}
```

</details>

<details>
<summary>Codex CLI</summary>

**Global**: `~/.codex/config.toml` (macOS/Linux) or `%USERPROFILE%\.codex\config.toml` (Windows)

```toml
[mcp_servers.mirror-mcp]
command = "bunx"
args = ["@hiecom/mirror-mcp"]
env = { MIRROR_NETWORK = "mainnet" }
```

</details>

<details>
<summary>Gemini CLI</summary>

**Global**: `~/.gemini/settings.json`

```json
{
  "mcpServers": {
    "mirror-mcp": {
      "command": "bunx",
      "args": ["@hiecom/mirror-mcp"],
      "env": {
        "MIRROR_NETWORK": "mainnet"
      }
    }
  }
}
```

</details>

<details>
<summary>VS Code with GitHub Copilot</summary>

**Project**: `.vscode/mcp.json` in workspace

**Global**: User `settings.json` (search for "MCP" in settings)

```json
{
  "servers": {
    "mirror-mcp": {
      "command": "bunx",
      "args": ["@hiecom/mirror-mcp"],
      "env": {
        "MIRROR_NETWORK": "mainnet"
      }
    }
  }
}
```

</details>

<details>
<summary>Amp</summary>

**Global**:

- macOS/Linux: `~/.config/amp/settings.json`
- Windows: `%APPDATA%\amp\settings.json`

**Project**: `.amp/settings.json` in project root

```json
{
  "mcpServers": {
    "mirror-mcp": {
      "type": "stdio",
      "command": "bunx",
      "args": ["@hiecom/mirror-mcp"],
      "env": {
        "MIRROR_NETWORK": "mainnet"
      }
    }
  }
}
```

</details>

<details>
<summary>Cline</summary>

**Global**: `~/.cline/data/settings/cline_mcp_settings.json` (macOS/Linux) or `%USERPROFILE%\.cline\data\settings\cline_mcp_settings.json` (Windows)

Access via: MCP Servers icon → Configure

```json
{
  "mcpServers": {
    "mirror-mcp": {
      "command": "bunx",
      "args": ["@hiecom/mirror-mcp"],
      "env": {
        "MIRROR_NETWORK": "mainnet"
      }
    }
  }
}
```

</details>

<details>
<summary>Kilo Code</summary>

**Global (CLI)**: `~/.kilocode/cli/global/settings/mcp_settings.json`

**Project**: `.kilocode/mcp.json` in project root

```json
{
  "mcpServers": {
    "mirror-mcp": {
      "command": "bunx",
      "args": ["@hiecom/mirror-mcp"],
      "env": {
        "MIRROR_NETWORK": "mainnet"
      }
    }
  }
}
```

</details>

<details>
<summary>Zed</summary>

**Global**: `~/.zed/settings.json` (macOS/Linux) or `%USERPROFILE%\.zed\settings.json` (Windows)

Or add via: Agent Panel → Settings → Add Custom Server

```json
{
  "context_servers": {
    "mirror-mcp": {
      "command": "bunx",
      "args": ["@hiecom/mirror-mcp"],
      "env": {
        "MIRROR_NETWORK": "mainnet"
      }
    }
  }
}
```

</details>

<details>
<summary>Roo Code</summary>

**Global**: User `settings.json` with `rooCode.mcpServers` namespace

```json
{
  "rooCode.mcpServers": {
    "mirror-mcp": {
      "command": "bunx",
      "args": ["@hiecom/mirror-mcp"],
      "env": {
        "MIRROR_NETWORK": "mainnet"
      }
    }
  }
}
```

</details>

<details>
<summary>Crush</summary>

**Configuration Priority**: `.crush.json` → `crush.json` → `$HOME/.config/crush/crush.json`

**Project**: `.crush.json` or `crush.json` in project root

**Global**: `$HOME/.config/crush/crush.json` (macOS/Linux) or `%USERPROFILE%\.config\crush\crush.json` (Windows)

```json
{
  "mcp": {
    "mirror-mcp": {
      "type": "stdio",
      "command": "bunx",
      "args": ["@hiecom/mirror-mcp"]
    }
  }
}
```

</details>

<details>
<summary>Cursor</summary>

**Global**: `~/.cursor/mcp.json` (macOS/Linux) or `%USERPROFILE%\.cursor\mcp.json` (Windows)

**Project**: `.cursor/mcp.json` in project root

```json
{
  "mcpServers": {
    "mirror-mcp": {
      "command": "bunx",
      "args": ["@hiecom/mirror-mcp"],
      "env": {
        "MIRROR_NETWORK": "mainnet"
      }
    }
  }
}
```

</details>

<details>
<summary>Trae</summary>

**Global**: `~/.cursor/mcp.json`

**Project**: `.trae/mcp.json` in project root

```json
{
  "mcpServers": {
    "mirror-mcp": {
      "command": "bunx",
      "args": ["@hiecom/mirror-mcp"],
      "env": {
        "MIRROR_NETWORK": "mainnet"
      }
    }
  }
}
```

</details>

<details>
<summary>Droid (Factory)</summary>

**Global**: `~/.factory/mcp.json`

**Project**: `.factory/mcp.json` in project root

```json
{
  "mcpServers": {
    "mirror-mcp": {
      "type": "stdio",
      "command": "bunx",
      "args": ["@hiecom/mirror-mcp"],
      "env": {
        "MIRROR_NETWORK": "mainnet"
      }
    }
  }
}
```

</details>

<details>
<summary>Letta</summary>

Letta MCP servers are configured through the host platform's MCP configuration:

- **Droid/Factory**: `~/.factory/mcp.json` or `.factory/mcp.json`
- **Claude Desktop**: `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "letta-cloud": {
      "command": "node",
      "args": ["/path/to/letta-cloud-mcp/dist/index.js"],
      "env": {
        "LETTA_API_KEY": "your-api-key"
      }
    }
  }
}
```

</details>

<details>
<summary>Goose</summary>

**Global**: `~/.config/goose/config.yaml` (YAML format)

```yaml
extensions:
  - type: mcp
    name: mirror-mcp
    enabled: true
    cmd: bunx
    args:
      - "@hiecom/mirror-mcp"
    envs:
      MIRROR_NETWORK: mainnet
```

</details>

<details>
<summary>Qwen Code</summary>

**Global**: `~/.qwen/settings.json`

**Project**: `.qwen/settings.json` in project root

```json
{
  "mcpServers": {
    "mirror-mcp": {
      "command": "bunx",
      "args": ["@hiecom/mirror-mcp"],
      "env": {
        "MIRROR_NETWORK": "mainnet"
      }
    }
  }
}
```

</details>

---

## Tools Reference

<details>
<summary>Account Tools (11)</summary>

| Tool                       | Description                                           |
| -------------------------- | ----------------------------------------------------- |
| `get-account-info`         | Get account details including balance, memo, and keys |
| `get-account-balances`     | Get all token balances for an account                 |
| `get-account-tokens`       | Get all tokens associated with an account             |
| `get-account-nfts`         | Get all NFTs held by an account                       |
| `get-staking-rewards`      | Get staking rewards for an account                    |
| `get-crypto-allowances`    | Get HBAR allowances granted by an account             |
| `get-token-allowances`     | Get token allowances granted by an account            |
| `get-nft-allowances`       | Get NFT allowances granted by an account              |
| `get-outstanding-airdrops` | Get outstanding airdrops for an account               |
| `get-pending-airdrops`     | Get pending airdrops for an account                   |
| `list-accounts`            | List all Hedera accounts                              |

</details>

<details>
<summary>Token Tools (6)</summary>

| Tool                   | Description                                          |
| ---------------------- | ---------------------------------------------------- |
| `get-token-info`       | Get token information including name, symbol, supply |
| `get-token-balances`   | Get all account balances for a token                 |
| `get-token-nfts`       | Get all NFTs for a token                             |
| `get-nft-by-serial`    | Get a specific NFT by serial number                  |
| `get-nft-transactions` | Get transactions for an NFT                          |
| `list-tokens`          | List all Hedera tokens                               |

</details>

<details>
<summary>Contract Tools (11)</summary>

| Tool                        | Description                                       |
| --------------------------- | ------------------------------------------------- |
| `get-contract-info`         | Get smart contract information including bytecode |
| `call-contract`             | Execute a read-only smart contract call           |
| `get-contract-results`      | Get contract execution results                    |
| `get-contract-result`       | Get a specific contract result                    |
| `get-contract-state`        | Get contract storage state                        |
| `get-contract-logs`         | Get contract event logs                           |
| `get-all-contract-results`  | Get all contract results across contracts         |
| `get-result-by-transaction` | Get result by transaction ID/hash                 |
| `get-result-actions`        | Get contract result actions (internal calls)      |
| `get-result-opcodes`        | Get contract result opcodes (execution trace)     |
| `list-contracts`            | List all smart contracts                          |

</details>

<details>
<summary>Transaction Tools (3)</summary>

| Tool                          | Description                          |
| ----------------------------- | ------------------------------------ |
| `get-transaction`             | Get detailed transaction information |
| `get-transactions-by-account` | Get all transactions for an account  |
| `list-transactions`           | List all Hedera transactions         |

</details>

<details>
<summary>Topic Tools (5)</summary>

| Tool                       | Description                     |
| -------------------------- | ------------------------------- |
| `get-topic-info`           | Get consensus topic information |
| `get-topic-messages`       | Get messages from a topic       |
| `get-topic-message`        | Get a specific topic message    |
| `get-message-by-timestamp` | Get a message by timestamp      |
| `list-topics`              | List all consensus topics       |

</details>

<details>
<summary>Schedule Tools (2)</summary>

| Tool                | Description                           |
| ------------------- | ------------------------------------- |
| `get-schedule-info` | Get scheduled transaction information |
| `list-schedules`    | List all scheduled transactions       |

</details>

<details>
<summary>Balance Tools (2)</summary>

| Tool            | Description                       |
| --------------- | --------------------------------- |
| `get-balances`  | Get account balances with filters |
| `list-balances` | List all account balances         |

</details>

<details>
<summary>Block Tools (3)</summary>

| Tool          | Description                         |
| ------------- | ----------------------------------- |
| `get-blocks`  | Get block information               |
| `get-block`   | Get a specific block by hash/number |
| `list-blocks` | List all Hedera blocks              |

</details>

<details>
<summary>Network Tools (6)</summary>

| Tool                 | Description                     |
| -------------------- | ------------------------------- |
| `get-exchange-rate`  | Get HBAR to USD exchange rate   |
| `get-network-fees`   | Get network fee schedules       |
| `get-network-nodes`  | Get network node information    |
| `get-network-stake`  | Get network staking information |
| `get-network-supply` | Get HBAR token supply           |
| `list-network-nodes` | List all network nodes          |

</details>

---

## Usage Examples

### Query Account Balance

```
Use get-account-info with account ID "0.0.123" to get account details and balance
```

### Get Token Information

```
Use get-token-info with token ID "0.0.456" to get token details
```

### List Transactions

```
Use list-transactions with account filter "0.0.123" and limit of 10 results
```

### Get Exchange Rate

```
Use get-exchange-rate to get current HBAR to USD exchange rate
```

---

## Common Parameters

| Parameter                              | Type                | Description                               |
| -------------------------------------- | ------------------- | ----------------------------------------- |
| `accountId` / `tokenId` / `contractId` | string              | Entity ID in format `0.0.123`             |
| `timestamp`                            | string              | ISO 8601 timestamp for time-based queries |
| `limit`                                | number              | Maximum results to return                 |
| `order`                                | `"asc"` \| `"desc"` | Sort order                                |
| `transactionId`                        | string              | Hedera transaction ID                     |

---

## Development

```bash
bun run build         # Build the package
bun run typecheck     # Run TypeScript checks
bun run lint          # Run linting
bun run fmt           # Format code
bun run inspect       # Test with MCP Inspector
```

## Testing with MCP Inspector

```bash
bun run inspect
```

This opens the MCP Inspector UI to test all tools interactively.

## License

MIT
