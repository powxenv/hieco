import type { Signer as HieroSigner } from "@hiero-ledger/sdk";
import { HieroClient } from "./client/client.ts";
import { createTelepathic, type TelepathicClient } from "./telepathic/client.ts";
import type { ClientRuntimeConfig } from "./client/runtime.ts";
import type { Result } from "./results/result.ts";
import type * as Params from "./shared/params.ts";

export type HiecoClient = TelepathicClient;

export type HiecoFactory = ((config?: Params.ClientConfig) => HiecoClient) & {
  readonly validateConfig: (config?: Params.ClientConfig) => Result<ClientRuntimeConfig>;
  readonly fromEnv: (options?: { readonly allowMissingSigner?: boolean }) => HiecoClient;
  readonly forTestnet: () => HiecoClient;
  readonly forMainnet: () => HiecoClient;
  readonly forPreviewnet: () => HiecoClient;
  readonly withSigner: (signer: HieroSigner, config?: Params.ClientConfig) => HiecoClient;
};

const hiecoFactory = (config: Params.ClientConfig = {}): HiecoClient =>
  createTelepathic(new HieroClient(config));

export const hieco: HiecoFactory = Object.assign(hiecoFactory, {
  validateConfig: (config?: Params.ClientConfig) => HieroClient.validateConfig(config ?? {}),
  fromEnv: (options?: { readonly allowMissingSigner?: boolean }) =>
    createTelepathic(HieroClient.fromEnv(options)),
  forTestnet: () => createTelepathic(HieroClient.forTestnet()),
  forMainnet: () => createTelepathic(HieroClient.forMainnet()),
  forPreviewnet: () => createTelepathic(HieroClient.forPreviewnet()),
  withSigner: (signer: HieroSigner, config: Params.ClientConfig = {}) =>
    createTelepathic(new HieroClient({ ...config, signer })),
});
