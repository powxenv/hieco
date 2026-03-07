import { useContext } from "react";
import { HiecoContext } from "../provider";
import type { HiecoContextValue } from "../provider";

export function useHiecoContext(): HiecoContextValue {
  const context = useContext(HiecoContext);

  if (context === null) {
    throw new Error("useHiecoContext must be used within a HiecoProvider");
  }

  return context;
}
