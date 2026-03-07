const ENTITY_ID_REGEX = /^(\d{1,10})\.(\d{1,10})\.(\d{1,10})$/;

export function isValidEntityId(value: string): boolean {
  return ENTITY_ID_REGEX.test(value);
}
