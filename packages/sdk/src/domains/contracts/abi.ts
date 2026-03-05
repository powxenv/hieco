import type { Result } from "../../shared/results.ts";
import { err, ok } from "../../shared/results.ts";
import { createError } from "../../shared/errors.ts";

export type ReturnTypeHint =
  | "string"
  | "bool"
  | "address"
  | "bytes"
  | "bytes32"
  | "int8"
  | "int16"
  | "int32"
  | "int64"
  | "int256"
  | "uint8"
  | "uint16"
  | "uint32"
  | "uint64"
  | "uint256";

type ContractResultReader = {
  readonly raw: Uint8Array;
  readonly getString: (index?: number) => string;
  readonly getBool: (index?: number) => boolean;
  readonly getAddress: (index?: number) => string;
  readonly getBytes32: (index?: number) => Uint8Array;
  readonly getInt8: (index?: number) => number;
  readonly getInt16: (index?: number) => number;
  readonly getInt32: (index?: number) => number;
  readonly getInt64: (index?: number) => import("bignumber.js").BigNumber;
  readonly getInt256: (index?: number) => import("bignumber.js").BigNumber;
  readonly getUint8: (index?: number) => number;
  readonly getUint16: (index?: number) => number;
  readonly getUint32: (index?: number) => number;
  readonly getUint64: (index?: number) => import("bignumber.js").BigNumber;
  readonly getUint256: (index?: number) => import("bignumber.js").BigNumber;
};

export function decodeReturn(
  result: ContractResultReader,
  returns?: ReturnTypeHint,
): Result<unknown> {
  if (!returns) return ok(result.raw);
  try {
    switch (returns) {
      case "string":
        return ok(result.getString(0));
      case "bool":
        return ok(result.getBool(0));
      case "address":
        return ok(result.getAddress(0));
      case "bytes":
        return ok(result.raw);
      case "bytes32":
        return ok(result.getBytes32(0));
      case "int8":
        return ok(result.getInt8(0));
      case "int16":
        return ok(result.getInt16(0));
      case "int32":
        return ok(result.getInt32(0));
      case "int64":
        return ok(result.getInt64(0));
      case "int256":
        return ok(result.getInt256(0));
      case "uint8":
        return ok(result.getUint8(0));
      case "uint16":
        return ok(result.getUint16(0));
      case "uint32":
        return ok(result.getUint32(0));
      case "uint64":
        return ok(result.getUint64(0));
      case "uint256":
        return ok(result.getUint256(0));
    }
  } catch (error) {
    if (error instanceof Error) {
      return err(
        createError("CONTRACT_ARGUMENT_MISMATCH", error.message, {
          hint: "Ensure return type matches contract ABI",
        }),
      );
    }
  }

  return err(
    createError("CONTRACT_ARGUMENT_MISMATCH", "Unsupported contract return type", {
      hint: "Ensure return type matches contract ABI",
    }),
  );
}
