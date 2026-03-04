export interface Signer {
  readonly getPublicKey: () => string;
  readonly sign: (message: Uint8Array) => Promise<Uint8Array>;
}
