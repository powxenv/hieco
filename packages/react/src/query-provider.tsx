import type { ReactNode } from "react";
import { HiecoProvider, type HiecoProviderProps } from "./provider";

export type HiecoQueryProviderProps = HiecoProviderProps;

export function HiecoQueryProvider(props: HiecoQueryProviderProps): ReactNode {
  return <HiecoProvider {...props} />;
}
