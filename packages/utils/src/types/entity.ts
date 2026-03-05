export type EntityId = `${number}.${number}.${number}`;

export type Timestamp = string;

export interface Key {
  readonly _type: string;
  readonly key: string;
}
