import type { ApiResult } from "@hieco/utils";
import type { JsonRpcResponse } from "../protocol/rpc";
import { isJsonRpcErrorCode, mapJsonRpcErrorCode } from "../protocol/errors";
import type { RelayMessage, RelaySubscription } from "./subscription";

interface PendingSubscribe {
  resolve: (result: ApiResult<string>) => void;
  callback: (message: RelayMessage) => void;
  localSubscriptionId: string;
  isRestoration?: boolean;
}

interface PendingUnsubscribe {
  resolve: (result: ApiResult<boolean>) => void;
  localSubscriptionId: string;
}

interface PendingChainId {
  resolve: (result: ApiResult<string>) => void;
}

interface TrackedSubscription {
  subscription: RelaySubscription;
  callbacks: Set<(message: RelayMessage) => void>;
}

export class SubscriptionManager {
  private pendingSubscribes: Map<number, PendingSubscribe> = new Map();
  private pendingUnsubscribes: Map<number, PendingUnsubscribe> = new Map();
  private pendingChainIds: Map<number, PendingChainId> = new Map();
  private serverToLocalSubscriptions: Map<string, string> = new Map();
  private trackedSubscriptions: Map<string, TrackedSubscription> = new Map();
  private subscriptions: Map<string, Set<(message: RelayMessage) => void>> = new Map();

  subscribe(
    requestId: number,
    localSubscriptionId: string,
    subscription: RelaySubscription,
    callback: (message: RelayMessage) => void,
    resolve: (result: ApiResult<string>) => void,
    options?: {
      readonly isRestoration?: boolean;
    },
  ): void {
    const existing = this.trackedSubscriptions.get(localSubscriptionId);
    if (existing) {
      existing.callbacks.add(callback);
    } else {
      this.trackedSubscriptions.set(localSubscriptionId, {
        subscription,
        callbacks: new Set([callback]),
      });
    }

    this.pendingSubscribes.set(requestId, {
      resolve,
      callback,
      localSubscriptionId,
      ...(options?.isRestoration ? { isRestoration: true } : {}),
    });
  }

  unsubscribe(
    requestId: number,
    subscriptionId: string,
    resolve: (result: ApiResult<boolean>) => void,
  ): void {
    this.pendingUnsubscribes.set(requestId, { resolve, localSubscriptionId: subscriptionId });
  }

  getServerSubscriptionIdByLocalId(localSubscriptionId: string): string | null {
    for (const [serverId, localId] of this.serverToLocalSubscriptions) {
      if (localId === localSubscriptionId) {
        return serverId;
      }
    }
    return null;
  }

  getLocalSubscriptionId(serverSubscriptionId: string): string | null {
    return this.serverToLocalSubscriptions.get(serverSubscriptionId) ?? null;
  }

  setServerSubscription(localId: string, serverId: string): void {
    this.serverToLocalSubscriptions.set(serverId, localId);
  }

  deleteServerSubscription(serverId: string): void {
    this.serverToLocalSubscriptions.delete(serverId);
  }

  handleSubscribeResponse(
    response: JsonRpcResponse & { id: number },
  ): PendingSubscribe | undefined {
    const pending = this.pendingSubscribes.get(response.id);
    if (!pending) return undefined;

    this.pendingSubscribes.delete(response.id);
    return pending;
  }

  handleUnsubscribeResponse(
    response: JsonRpcResponse & { id: number },
  ): PendingUnsubscribe | undefined {
    const pending = this.pendingUnsubscribes.get(response.id);
    if (!pending) return undefined;

    this.pendingUnsubscribes.delete(response.id);
    return pending;
  }

  handleChainIdResponse(response: JsonRpcResponse & { id: number }): PendingChainId | undefined {
    const pending = this.pendingChainIds.get(response.id);
    if (!pending) return undefined;

    this.pendingChainIds.delete(response.id);
    return pending;
  }

  setChainId(requestId: number, pending: PendingChainId): void {
    this.pendingChainIds.set(requestId, pending);
  }

  handleError(response: JsonRpcResponse & { id: number }): void {
    if (!response.error) return;

    const errorTag = isJsonRpcErrorCode(response.error.code)
      ? mapJsonRpcErrorCode(response.error.code)
      : "UnknownError";
    const { message, code } = response.error;

    const subscribePending = this.pendingSubscribes.get(response.id);
    if (subscribePending) {
      this.pendingSubscribes.delete(response.id);
      subscribePending.resolve({
        success: false,
        error: { _tag: errorTag, message, code: code.toString() },
      });
    }

    const unsubscribePending = this.pendingUnsubscribes.get(response.id);
    if (unsubscribePending) {
      this.pendingUnsubscribes.delete(response.id);
      unsubscribePending.resolve({
        success: false,
        error: { _tag: errorTag, message, code: code.toString() },
      });
    }

    const chainIdPending = this.pendingChainIds.get(response.id);
    if (chainIdPending) {
      this.pendingChainIds.delete(response.id);
      chainIdPending.resolve({
        success: false,
        error: { _tag: errorTag, message, code: code.toString() },
      });
    }
  }

  getCallbacks(subscriptionId: string): Set<(message: RelayMessage) => void> | undefined {
    return this.subscriptions.get(subscriptionId);
  }

  setCallbacks(subscriptionId: string, callbacks: Set<(message: RelayMessage) => void>): void {
    this.subscriptions.set(subscriptionId, callbacks);
  }

  deleteCallbacks(subscriptionId: string): void {
    this.subscriptions.delete(subscriptionId);
  }

  deleteTracked(subscriptionId: string): void {
    this.trackedSubscriptions.delete(subscriptionId);
  }

  clear(): void {
    this.subscriptions.clear();
    this.serverToLocalSubscriptions.clear();
    this.trackedSubscriptions.clear();
    this.pendingSubscribes.clear();
    this.pendingUnsubscribes.clear();
    this.pendingChainIds.clear();
  }

  get tracked(): Map<string, TrackedSubscription> {
    return this.trackedSubscriptions;
  }
}
