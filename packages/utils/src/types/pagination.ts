export interface PaginationParams {
  readonly limit?: number;
  readonly order?: "asc" | "desc";
}

export type QueryOperator<T extends string | number | boolean> =
  | T
  | `eq:${T}`
  | `ne:${T}`
  | `gt:${T}`
  | `gte:${T}`
  | `lt:${T}`
  | `lte:${T}`;
