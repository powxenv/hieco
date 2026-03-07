import type { HiecoSession } from "../internal/session";
import { useHiecoContext } from "./use-hieco-context";

export function useHiecoSession(): HiecoSession {
  return useHiecoContext().session;
}
