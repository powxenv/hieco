import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import {
  getMirrorNetworkState,
  isNetworkSwitchAllowed,
  listMirrorNetworks,
  switchMirrorNetwork,
} from "../../client";
import { mirrorNodeUrlSchema, networkTypeSchema } from "../../schemas";

export const getCurrentNetwork = createTool({
  id: "get-current-network",
  description:
    "Get the MCP server's current active Hedera network, effective Mirror Node URL, " +
    "default startup network, and whether runtime network switching is enabled.",
  inputSchema: z.object({}),
  execute: async () => {
    return getMirrorNetworkState();
  },
});

export const listNetworks = createTool({
  id: "list-networks",
  description:
    "List the built-in Hedera networks supported by this MCP server and mark which " +
    "network is the startup default and which one is currently active.",
  inputSchema: z.object({}),
  execute: async () => {
    const state = getMirrorNetworkState();

    return {
      allowNetworkSwitch: state.allowNetworkSwitch,
      networks: listMirrorNetworks(),
    };
  },
});

export const switchNetwork = createTool({
  id: "switch-network",
  description:
    "Switch the MCP server's active Hedera network for subsequent tool calls. " +
    "This affects the current stdio session only and requires MIRROR_ALLOW_NETWORK_SWITCH=true.",
  inputSchema: z.object({
    network: networkTypeSchema.describe("Target Hedera network"),
    mirrorNodeUrl: mirrorNodeUrlSchema.describe("Optional custom Mirror Node URL override"),
  }),
  execute: async ({ network, mirrorNodeUrl }) => {
    return {
      before: getMirrorNetworkState(),
      after: switchMirrorNetwork(network, mirrorNodeUrl),
    };
  },
});

export function getRuntimeTools(): {
  readonly getCurrentNetwork: typeof getCurrentNetwork;
  readonly listNetworks: typeof listNetworks;
  readonly switchNetwork?: typeof switchNetwork;
} {
  if (isNetworkSwitchAllowed()) {
    return {
      getCurrentNetwork,
      listNetworks,
      switchNetwork,
    };
  }

  return {
    getCurrentNetwork,
    listNetworks,
  };
}
