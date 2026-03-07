export type EntityId = string;

export type Timestamp = string;

export interface Key {
  readonly _type: string;
  readonly key: string;
}
