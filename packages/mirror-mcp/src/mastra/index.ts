import { MCPServer } from "@mastra/mcp";
import * as accounts from "./tools/accounts";
import * as balances from "./tools/balances";
import * as blocks from "./tools/blocks";
import * as contracts from "./tools/contracts";
import * as network from "./tools/network";
import * as schedules from "./tools/schedules";
import * as tokens from "./tools/tokens";
import * as topics from "./tools/topics";
import * as transactions from "./tools/transactions";

const mcpServer = new MCPServer({
  id: "hedera-mirror-mcp",
  name: "Hedera Mirror Node MCP Server",
  version: "0.0.1",
  tools: {
    ...accounts,
    ...balances,
    ...blocks,
    ...contracts,
    ...network,
    ...schedules,
    ...tokens,
    ...topics,
    ...transactions,
  },
});

mcpServer.startStdio().catch((error) => {
  process.stderr.write(`MCP Server Error: ${error.message}\n`);
  process.exit(1);
});
