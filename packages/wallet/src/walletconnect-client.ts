import type SignClient from "@walletconnect/sign-client";
import type { SessionTypes, SignClientTypes } from "@walletconnect/types";
import type { WalletAppMetadata } from "./types";

interface WalletConnectClientHandlers {
  readonly onSessionEvent: (
    event: SignClientTypes.EventArguments["session_event"],
  ) => void | Promise<void>;
  readonly onSessionUpdate: (
    event: SignClientTypes.EventArguments["session_update"],
  ) => void | Promise<void>;
  readonly onSessionDelete: (
    event: SignClientTypes.EventArguments["session_delete"],
  ) => void | Promise<void>;
}

export interface WalletConnectClientManager {
  readonly ensure: () => Promise<SignClient>;
  readonly clear: () => void;
  readonly current: () => SignClient | null;
}

export function findSession(client: SignClient, topic: string): SessionTypes.Struct | null {
  return client.session.getAll().find((session) => session.topic === topic) ?? null;
}

export function createWalletConnectClientManager(input: {
  readonly app: WalletAppMetadata;
  readonly projectId: string;
  readonly handlers: WalletConnectClientHandlers;
}): WalletConnectClientManager {
  let client: SignClient | null = null;
  let clientPromise: Promise<SignClient> | null = null;

  const bindClient = (nextClient: SignClient): SignClient => {
    if (client === nextClient) {
      return nextClient;
    }

    nextClient.on("session_event", (event) => {
      void input.handlers.onSessionEvent(event);
    });
    nextClient.on("session_update", (event) => {
      void input.handlers.onSessionUpdate(event);
    });
    nextClient.on("session_delete", (event) => {
      void input.handlers.onSessionDelete(event);
    });

    client = nextClient;

    return nextClient;
  };

  return {
    ensure: async () => {
      if (client) {
        return client;
      }

      if (!clientPromise) {
        clientPromise = import("@walletconnect/sign-client")
          .then(({ default: SignClient }) =>
            SignClient.init({
              projectId: input.projectId,
              metadata: {
                ...input.app,
                icons: [...input.app.icons],
              },
            }),
          )
          .then(bindClient);
      }

      return clientPromise;
    },
    clear: () => {
      client = null;
      clientPromise = null;
    },
    current: () => client,
  };
}
