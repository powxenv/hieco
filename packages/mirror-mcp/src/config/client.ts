import { createMirrorNodeClient } from "@hiecom/mirror-js";

const network = (process.env.MIRROR_NETWORK ?? "mainnet") as "mainnet" | "testnet" | "previewnet";
const mirrorNodeUrl = process.env.MIRROR_NODE_URL;

export const mirrorClient = createMirrorNodeClient(network, mirrorNodeUrl);
