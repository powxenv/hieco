import type { EntityId } from "@hieco/mirror-js";

const ENTITY_ID_REGEX = /^(\d{1,10})\.(\d{1,10})\.(\d{1,10})$/;

export function isValidEntityId(value: string): value is EntityId {
  return ENTITY_ID_REGEX.test(value);
}

export function parseEntityId(value: string): EntityId | null {
  if (isValidEntityId(value)) {
    return value as EntityId;
  }
  return null;
}

export function assertEntityId(value: string): asserts value is EntityId {
  if (!isValidEntityId(value)) {
    throw new Error(`Invalid EntityId format: ${value}. Expected format: "shard.realm.num"`);
  }
}

export function formatEntityId(shard: number, realm: number, num: number): EntityId {
  if (
    !Number.isInteger(shard) ||
    !Number.isInteger(realm) ||
    !Number.isInteger(num) ||
    shard < 0 ||
    realm < 0 ||
    num < 0 ||
    shard > 9999999999 ||
    realm > 9999999999 ||
    num > 9999999999
  ) {
    throw new Error(`Invalid EntityId components: shard=${shard}, realm=${realm}, num=${num}`);
  }

  return `${shard}.${realm}.${num}` as EntityId;
}

export function parseEntityIdParts(id: EntityId): [shard: number, realm: number, num: number] {
  const match = ENTITY_ID_REGEX.exec(id);

  if (!match || match.length < 4) {
    throw new Error(`Invalid EntityId format: ${id}`);
  }

  const shard = match[1];
  const realm = match[2];
  const num = match[3];

  if (shard === undefined || realm === undefined || num === undefined) {
    throw new Error(`Invalid EntityId format: ${id}`);
  }

  return [parseInt(shard, 10), parseInt(realm, 10), parseInt(num, 10)];
}

export function asEntityId(id: string): EntityId {
  return id as EntityId;
}
