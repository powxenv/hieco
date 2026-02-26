import { MCPServer } from "@mastra/mcp";
import { allMirrorTools } from "./tools";

const server = new MCPServer({
  id: "mirror-mcp-server",
  name: "Hedera Mirror Node MCP Server",
  version: "0.0.1",
  tools: allMirrorTools,
});

server.startStdio().catch((error) => {
  console.error("Error running MCP server:", error);
  process.exit(1);
});
