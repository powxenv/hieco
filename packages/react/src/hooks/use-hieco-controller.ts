import type { HiecoController } from "../provider";
import { useHiecoContext } from "./use-hieco-context";

export function useHiecoController(): HiecoController {
  return useHiecoContext().controller;
}
