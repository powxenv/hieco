import type { WalletExtension } from "./types";

const EXTENSION_QUERY = "hedera-extension-query";
const EXTENSION_CONNECT = "hedera-extension-connect-";
const EXTENSION_OPEN = "hedera-extension-open-";
const EXTENSION_RESPONSE = "hedera-extension-response";
const IFRAME_QUERY = "hedera-iframe-query";
const IFRAME_RESPONSE = "hedera-iframe-response";
const IFRAME_CONNECT = "hedera-iframe-connect";
const DISCOVERY_DELAY_MS = 200;
const DISCOVERY_TIMEOUT_MS = 450;

interface ExtensionMessagePayload {
  readonly type: string;
  readonly metadata?: WalletExtensionMetadata;
}

interface WalletExtensionMetadata {
  readonly id: string;
  readonly name?: string;
  readonly icon?: string;
  readonly url?: string;
}

function toWalletExtension(
  metadata: WalletExtensionMetadata,
  availableInIframe: boolean,
): WalletExtension {
  return {
    id: metadata.id,
    name: metadata.name,
    icon: metadata.icon,
    url: metadata.url,
    availableInIframe,
  };
}

function readExtensionMessage(event: MessageEvent<unknown>): ExtensionMessagePayload | null {
  if (typeof event.data !== "object" || !event.data) {
    return null;
  }

  const type = Reflect.get(event.data, "type");
  const metadata = Reflect.get(event.data, "metadata");

  if (typeof type !== "string") {
    return null;
  }

  if (metadata === undefined) {
    return { type };
  }

  if (typeof metadata !== "object" || !metadata) {
    return null;
  }

  const id = Reflect.get(metadata, "id");
  const name = Reflect.get(metadata, "name");
  const icon = Reflect.get(metadata, "icon");
  const url = Reflect.get(metadata, "url");

  if (
    typeof id !== "string" ||
    (name !== undefined && typeof name !== "string") ||
    (icon !== undefined && typeof icon !== "string") ||
    (url !== undefined && typeof url !== "string")
  ) {
    return null;
  }

  return {
    type,
    metadata: {
      id,
      name,
      icon,
      url,
    },
  };
}

function postWindowMessage(type: string, pairingString?: string): void {
  if (!isBrowser()) {
    return;
  }

  window.postMessage(pairingString ? { type, pairingString } : { type }, window.location.origin);
}

function postParentMessage(type: string, pairingString?: string): void {
  if (!isBrowser() || !window.parent || window.parent === window) {
    return;
  }

  window.parent.postMessage(
    pairingString ? { type, pairingString } : { type },
    window.location.origin,
  );
}

export async function discoverExtensions(): Promise<readonly WalletExtension[]> {
  if (!isBrowser()) {
    return [];
  }

  return new Promise((resolve) => {
    const extensions = new Map<string, WalletExtension>();

    const finish = (): void => {
      window.removeEventListener("message", onMessage);
      resolve([...extensions.values()]);
    };

    const onMessage = (event: MessageEvent<unknown>): void => {
      if (event.source !== window && event.source !== window.parent) {
        return;
      }

      const message = readExtensionMessage(event);

      if (!message?.metadata) {
        return;
      }

      if (message.type === EXTENSION_RESPONSE) {
        const extension = toWalletExtension(message.metadata, false);
        extensions.set(extension.id, extension);
      }

      if (message.type === IFRAME_RESPONSE) {
        const extension = toWalletExtension(message.metadata, true);
        extensions.set(extension.id, extension);
      }
    };

    window.addEventListener("message", onMessage);

    window.setTimeout(() => {
      postWindowMessage(EXTENSION_QUERY);
      postParentMessage(IFRAME_QUERY);
    }, DISCOVERY_DELAY_MS);

    window.setTimeout(finish, DISCOVERY_TIMEOUT_MS);
  });
}

export function openExtension(id: string): void {
  postWindowMessage(`${EXTENSION_OPEN}${id}`);
}

export function pairExtension(extension: WalletExtension, pairingString: string): void {
  if (extension.availableInIframe) {
    postParentMessage(IFRAME_CONNECT, pairingString);
    return;
  }

  postWindowMessage(`${EXTENSION_CONNECT}${extension.id}`, pairingString);
}
function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof document !== "undefined";
}
