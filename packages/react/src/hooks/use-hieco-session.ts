import type { HiecoSession } from "../shared/session";
import { useHiecoContext } from "./use-hieco-context";

export function useHiecoSession(): HiecoSession {
  return useHiecoContext().session;
}
