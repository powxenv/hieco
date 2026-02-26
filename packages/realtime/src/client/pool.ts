import type { StreamState, StreamConfig } from "../types/stream";
import type { RelaySubscription, RelayMessage } from "../types/subscription";
import type { ApiResult } from "@hiecom/types";
import { RelayWebSocketClient } from "./relay";

export type LoadBalancingStrategy = "round-robin" | "least-loaded" | "random";

export interface ConnectionPoolConfig extends Omit<StreamConfig, "reconnection"> {
  readonly poolSize: number;
  readonly strategy: LoadBalancingStrategy;
  readonly reconnection?: StreamConfig["reconnection"];
}

interface PooledConnection {
  client: RelayWebSocketClient;
  activeSubscriptions: number;
  index: number;
}

interface PooledSubscription {
  localId: string;
  connectionIndex: number;
  serverId: string | null;
}

export class ConnectionPool {
  private readonly config: ConnectionPoolConfig;
  private readonly connections: PooledConnection[] = [];
  private roundRobinIndex: number = 0;
  private pooledSubscriptions: Map<string, PooledSubscription> = new Map();
  private isInitialized: boolean = false;

  constructor(config: ConnectionPoolConfig) {
    this.config = config;
  }

  async connect(): Promise<ApiResult<null>> {
    if (this.isInitialized) {
      return { success: true, data: null };
    }

    const connectPromises: Promise<ApiResult<null>>[] = [];

    for (let i = 0; i < this.config.poolSize; i++) {
      const client = new RelayWebSocketClient({
        network: this.config.network,
        endpoint: this.config.endpoint,
        reconnection: this.config.reconnection,
      });

      this.connections.push({
        client,
        activeSubscriptions: 0,
        index: i,
      });

      connectPromises.push(client.connect());
    }

    const results = await Promise.allSettled(connectPromises);

    for (const result of results) {
      if (
        result.status === "rejected" ||
        (result.status === "fulfilled" && !result.value.success)
      ) {
        this.disconnect();
        return {
          success: false,
          error: {
            _tag: "NetworkError",
            message: "Failed to initialize connection pool",
          },
        };
      }
    }

    this.isInitialized = true;
    return { success: true, data: null };
  }

  async disconnect(): Promise<void> {
    const disconnectPromises = this.connections.map((conn) => conn.client.disconnect());
    await Promise.allSettled(disconnectPromises);
    this.connections.length = 0;
    this.pooledSubscriptions.clear();
    this.roundRobinIndex = 0;
    this.isInitialized = false;
  }

  subscribe(
    subscription: RelaySubscription,
    callback: (message: RelayMessage) => void,
  ): Promise<ApiResult<string>> {
    if (!this.isInitialized) {
      return Promise.resolve({
        success: false,
        error: {
          _tag: "NetworkError",
          message: "Pool not initialized",
        },
      });
    }

    const connectionIndex = this.selectConnection();
    const connection = this.connections[connectionIndex];

    if (!connection) {
      return Promise.resolve({
        success: false,
        error: {
          _tag: "NetworkError",
          message: "No available connection",
        },
      });
    }

    const localId = crypto.randomUUID();

    const pooledSub: PooledSubscription = {
      localId,
      connectionIndex,
      serverId: null,
    };

    this.pooledSubscriptions.set(localId, pooledSub);

    return connection.client.subscribe(subscription, callback).then((result) => {
      if (result.success) {
        connection.activeSubscriptions += 1;
        pooledSub.serverId = result.data;
        return { success: true, data: localId };
      }
      this.pooledSubscriptions.delete(localId);
      return result;
    });
  }

  async unsubscribe(subscriptionId: string): Promise<ApiResult<boolean>> {
    const pooled = this.pooledSubscriptions.get(subscriptionId);
    if (!pooled) {
      return {
        success: false,
        error: {
          _tag: "NotFoundError",
          message: "Subscription not found",
        },
      };
    }

    const connection = this.connections[pooled.connectionIndex];
    if (!connection) {
      return {
        success: false,
        error: {
          _tag: "NotFoundError",
          message: "Connection not found",
        },
      };
    }

    const serverId = pooled.serverId;
    if (!serverId) {
      return {
        success: false,
        error: {
          _tag: "NotFoundError",
          message: "Server subscription ID not found",
        },
      };
    }

    const result = await connection.client.unsubscribe(serverId);

    if (result.success) {
      connection.activeSubscriptions = Math.max(0, connection.activeSubscriptions - 1);
      this.pooledSubscriptions.delete(subscriptionId);
    }

    return result;
  }

  getPoolState(): readonly {
    connectionIndex: number;
    state: StreamState;
    activeSubscriptions: number;
  }[] {
    return this.connections.map((conn) => ({
      connectionIndex: conn.index,
      state: conn.client.getState(),
      activeSubscriptions: conn.activeSubscriptions,
    }));
  }

  getTotalActiveSubscriptions(): number {
    return this.connections.reduce((sum, conn) => sum + conn.activeSubscriptions, 0);
  }

  private selectConnection(): number {
    const strategy = this.config.strategy;

    switch (strategy) {
      case "round-robin":
        return this.selectRoundRobin();
      case "least-loaded":
        return this.selectLeastLoaded();
      case "random":
        return this.selectRandom();
      default:
        return this.selectLeastLoaded();
    }
  }

  private selectRoundRobin(): number {
    const index = this.roundRobinIndex % this.connections.length;
    this.roundRobinIndex += 1;
    return index;
  }

  private selectLeastLoaded(): number {
    if (this.connections.length === 0) {
      return 0;
    }

    let minIndex = 0;
    const firstConnection = this.connections[0];
    let minSubscriptions = firstConnection?.activeSubscriptions ?? 0;

    for (let i = 1; i < this.connections.length; i++) {
      const conn = this.connections[i];
      if (conn && conn.activeSubscriptions < minSubscriptions) {
        minSubscriptions = conn.activeSubscriptions;
        minIndex = i;
      }
    }

    return minIndex;
  }

  private selectRandom(): number {
    return Math.floor(Math.random() * this.connections.length);
  }
}
