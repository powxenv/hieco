import { isBrowser } from "./platform";

const MANAGED_PROJECT_ID_GLOBAL = "__HIECO_WALLET_PROJECT_ID__";
const MANAGED_PROJECT_ID_META = 'meta[name="hieco-wallet-project-id"]';
const MANAGED_PROJECT_ID_ENDPOINT = "/.well-known/hieco/wallet/project-id";

function readGlobalProjectId(): string | null {
  if (!isBrowser()) {
    return null;
  }

  const value = Reflect.get(globalThis, MANAGED_PROJECT_ID_GLOBAL);
  return typeof value === "string" && value.length > 0 ? value : null;
}

function readMetaProjectId(): string | null {
  if (!isBrowser()) {
    return null;
  }

  const value = document.querySelector(MANAGED_PROJECT_ID_META)?.getAttribute("content");
  return value && value.length > 0 ? value : null;
}

function parseManagedProjectId(value: unknown): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  if (!value || typeof value !== "object") {
    return null;
  }

  const projectId = Reflect.get(value, "projectId");
  return typeof projectId === "string" && projectId.length > 0 ? projectId : null;
}

async function readEndpointProjectId(): Promise<string | null> {
  if (!isBrowser() || typeof fetch !== "function") {
    return null;
  }

  try {
    const response = await fetch(MANAGED_PROJECT_ID_ENDPOINT, {
      headers: {
        accept: "application/json, text/plain;q=0.9, */*;q=0.8",
      },
    });

    if (!response.ok) {
      return null;
    }

    const contentType = response.headers.get("content-type") ?? "";

    if (contentType.includes("application/json")) {
      return parseManagedProjectId(await response.json());
    }

    return parseManagedProjectId(await response.text());
  } catch {
    return null;
  }
}

export async function resolveManagedProjectId(): Promise<string | null> {
  return readGlobalProjectId() ?? readMetaProjectId() ?? (await readEndpointProjectId());
}
