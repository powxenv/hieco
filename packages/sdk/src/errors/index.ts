export type {
  HieroErrorShape,
  ErrorCode,
  ErrorDetails,
  ErrorKind,
  ErrorClassification,
} from "./types.ts";
export {
  createError,
  HieroError,
  toHieroError,
  isHieroError,
  unwrap,
  classifyError,
  formatError,
} from "./error.ts";
