import type { TransactionEvent, TransactionEventPayloads } from "../types.ts";

type Listener<E extends TransactionEvent> = (payload: TransactionEventPayloads[E]) => void;

type ListenerMap = {
  [E in TransactionEvent]?: Array<Listener<E>>;
};

export class TransactionEventEmitter {
  private listeners: ListenerMap = {};

  on<E extends TransactionEvent>(event: E, listener: Listener<E>): () => void {
    const list = (this.listeners[event] ?? []) as Array<Listener<E>>;
    list.push(listener);
    this.listeners[event] = list as ListenerMap[E];

    return () => {
      this.off(event, listener);
    };
  }

  off<E extends TransactionEvent>(event: E, listener: Listener<E>): void {
    const list = this.listeners[event] as Array<Listener<E>> | undefined;
    if (!list) return;

    const index = list.indexOf(listener);
    if (index !== -1) {
      list.splice(index, 1);
    }
  }

  emit<E extends TransactionEvent>(event: E, payload: TransactionEventPayloads[E]): void {
    const list = this.listeners[event] as Array<Listener<E>> | undefined;
    if (!list) return;

    for (const listener of list) {
      listener(payload);
    }
  }

  removeAllListeners(event?: TransactionEvent): void {
    if (event) {
      delete this.listeners[event];
    } else {
      this.listeners = {};
    }
  }
}
