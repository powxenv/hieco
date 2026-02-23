import { NETWORK_CONFIGS, type NetworkType } from "../types/rest-api";

export function buildMirrorNodeUrl(
  network: NetworkType,
  endpoint: string,
  mirrorNodeUrl?: string,
): string {
  const baseUrl = mirrorNodeUrl ?? NETWORK_CONFIGS[network].mirrorNode;
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
  return `${baseUrl}/api/v1/${cleanEndpoint}`;
}
