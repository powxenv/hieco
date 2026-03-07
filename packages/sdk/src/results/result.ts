import type { HieroErrorShape } from "../errors/types.ts";

export type Result<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: HieroErrorShape };

export type Ok<T> = { readonly ok: true; readonly value: T };

export type Err = { readonly ok: false; readonly error: HieroErrorShape };

export function ok<T>(value: T): Ok<T> {
  return { ok: true, value };
}

export function err(error: HieroErrorShape): Err {
  return { ok: false, error };
}
