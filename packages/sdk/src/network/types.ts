import type { EntityId } from "@hieco/utils";
import type { Amount } from "../shared/amount.ts";

export interface NodeServiceEndpointParams {
  readonly ipAddressV4?: Uint8Array;
  readonly domainName?: string;
  readonly port: number;
}

export interface NodeCreateParams {
  readonly accountId: EntityId;
  readonly description?: string;
  readonly gossipEndpoints: ReadonlyArray<NodeServiceEndpointParams>;
  readonly serviceEndpoints?: ReadonlyArray<NodeServiceEndpointParams>;
  readonly gossipCaCertificate: Uint8Array;
  readonly grpcCertificateHash?: Uint8Array;
  readonly grpcWebProxyEndpoint?: NodeServiceEndpointParams;
  readonly adminKey?: string | true;
  readonly declineReward?: boolean;
  readonly memo?: string;
  readonly maxFee?: Amount;
}

export interface NodeUpdateParams {
  readonly nodeId: string | number | bigint;
  readonly accountId?: EntityId;
  readonly description?: string;
  readonly clearDescription?: boolean;
  readonly gossipEndpoints?: ReadonlyArray<NodeServiceEndpointParams>;
  readonly serviceEndpoints?: ReadonlyArray<NodeServiceEndpointParams>;
  readonly gossipCaCertificate?: Uint8Array;
  readonly grpcCertificateHash?: Uint8Array;
  readonly grpcWebProxyEndpoint?: NodeServiceEndpointParams;
  readonly clearGrpcWebProxyEndpoint?: boolean;
  readonly adminKey?: string | true;
  readonly declineReward?: boolean;
  readonly memo?: string;
  readonly maxFee?: Amount;
}

export interface NodeDeleteParams {
  readonly nodeId: string | number | bigint;
  readonly memo?: string;
  readonly maxFee?: Amount;
}

export type FreezeIntent =
  | "freeze-only"
  | "prepare-upgrade"
  | "freeze-upgrade"
  | "freeze-abort"
  | "telemetry-upgrade";

export interface FreezeNetworkParams {
  readonly startTimestamp?: Date | string | number;
  readonly fileId?: EntityId;
  readonly fileHash?: Uint8Array | string;
  readonly type?: FreezeIntent;
  readonly memo?: string;
  readonly maxFee?: Amount;
}

export interface SystemDeleteParams {
  readonly fileId?: EntityId;
  readonly contractId?: EntityId;
  readonly expirationTime?: Date;
  readonly memo?: string;
  readonly maxFee?: Amount;
}

export interface SystemUndeleteParams {
  readonly fileId?: EntityId;
  readonly contractId?: EntityId;
  readonly memo?: string;
  readonly maxFee?: Amount;
}
