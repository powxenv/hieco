# @hieco/mirror-mcp

`@hieco/mirror-mcp` turns Hieco’s Mirror client into a local MCP server so agents can explore Hedera data through a clean, validated, read-only tool surface.

If `@hieco/mirror-cli` is for humans in a terminal, this package is for agents in an MCP-compatible host.

## Why This Package Exists

AI agents should not need custom wrappers every time they need blockchain reads. This package gives them:

- a ready-to-run stdio MCP server
- read-only tools across the main Mirror domains
- validated input schemas
- environment-driven startup config
- optional session-level network switching

## When To Use It

Choose `@hieco/mirror-mcp` when you want to:

- expose Hedera data to a local MCP client
- give an agent safe, structured Mirror access
- avoid hand-building tool definitions around the Mirror REST API
- keep agent tooling aligned with the same package family used elsewhere in the repo

## Run Without Installing

```bash
bunx @hieco/mirror-mcp
```

```bash
npx -y @hieco/mirror-mcp
```

```bash
pnpm dlx @hieco/mirror-mcp
```

```bash
yarn dlx @hieco/mirror-mcp
```

## Global Installation

```bash
npm install --global @hieco/mirror-mcp
```

```bash
pnpm add --global @hieco/mirror-mcp
```

```bash
yarn global add @hieco/mirror-mcp
```

```bash
bun add --global @hieco/mirror-mcp
```

The installed binary name is `mirror-mcp`.

## Quick Start

Example MCP client configuration with `npx`:

```json
{
  "mcpServers": {
    "hedera-mirror": {
      "command": "npx",
      "args": ["-y", "@hieco/mirror-mcp"],
      "env": {
        "MIRROR_NETWORK": "mainnet",
        "MIRROR_ALLOW_NETWORK_SWITCH": "true"
      }
    }
  }
}
```

Example MCP client configuration with `bunx`:

```json
{
  "mcpServers": {
    "hedera-mirror": {
      "command": "bunx",
      "args": ["@hieco/mirror-mcp"],
      "env": {
        "MIRROR_NETWORK": "mainnet",
        "MIRROR_ALLOW_NETWORK_SWITCH": "true"
      }
    }
  }
}
```

## Runtime Model

The server starts over stdio and keeps one in-memory `MirrorNodeClient` for the current process.

Environment variables shape startup behavior:

- `MIRROR_NETWORK`
- `MIRROR_NODE_URL`
- `MIRROR_ALLOW_NETWORK_SWITCH`

When network switching is enabled, the process can move to a different built-in network or custom Mirror endpoint for later tool calls.

## Notes

- This package is read-only.
- Tool inputs are validated before a Mirror call is made.
- Restarting the server resets the session to its startup defaults.
- The server is built on the same `@hieco/mirror` client used by the CLI and framework wrappers.

## Related Packages

- [`@hieco/mirror`](../mirror/README.md)
- [`@hieco/mirror-cli`](../mirror-cli/README.md)
