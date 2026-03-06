export type {
  HieroErrorShape,
  ErrorCode,
  ErrorDetails,
  ErrorKind,
  ErrorClassification,
} from "./errors-types.ts";
export {
  createError,
  HieroError,
  toHieroError,
  isHieroError,
  unwrap,
  classifyError,
  formatError,
} from "./errors.ts";
