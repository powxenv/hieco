import type { ApiResult } from "@hieco/utils";
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

  handleSubscribeResponse(requestId: number): PendingSubscribe | undefined {
    const pending = this.pendingSubscribes.get(requestId);
    if (!pending) return undefined;

    this.pendingSubscribes.delete(requestId);
    return pending;
  }

  handleUnsubscribeResponse(requestId: number): PendingUnsubscribe | undefined {
    const pending = this.pendingUnsubscribes.get(requestId);
    if (!pending) return undefined;

    this.pendingUnsubscribes.delete(requestId);
    return pending;
  }

  handleChainIdResponse(requestId: number): PendingChainId | undefined {
    const pending = this.pendingChainIds.get(requestId);
    if (!pending) return undefined;

    this.pendingChainIds.delete(requestId);
    return pending;
  }

  setChainId(requestId: number, pending: PendingChainId): void {
    this.pendingChainIds.set(requestId, pending);
  }

  hasPendingSubscribe(requestId: number): boolean {
    return this.pendingSubscribes.has(requestId);
  }

  hasPendingUnsubscribe(requestId: number): boolean {
    return this.pendingUnsubscribes.has(requestId);
  }

  hasPendingChainId(requestId: number): boolean {
    return this.pendingChainIds.has(requestId);
  }

  handleError(requestId: number, error: { readonly code: number; readonly message: string }): void {
    const errorTag = toApiErrorTag(error.code);
    const { message, code } = error;

    const subscribePending = this.pendingSubscribes.get(requestId);
    if (subscribePending) {
      this.pendingSubscribes.delete(requestId);
      subscribePending.resolve({
        success: false,
        error: { _tag: errorTag, message, code: code.toString() },
      });
    }

    const unsubscribePending = this.pendingUnsubscribes.get(requestId);
    if (unsubscribePending) {
      this.pendingUnsubscribes.delete(requestId);
      unsubscribePending.resolve({
        success: false,
        error: { _tag: errorTag, message, code: code.toString() },
      });
    }

    const chainIdPending = this.pendingChainIds.get(requestId);
    if (chainIdPending) {
      this.pendingChainIds.delete(requestId);
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

function toApiErrorTag(code: number): "ValidationError" | "RateLimitError" | "UnknownError" {
  switch (code) {
    case -32600:
    case -32601:
    case -32602:
      return "ValidationError";
    case -32608:
      return "RateLimitError";
    default:
      return "UnknownError";
  }
}
