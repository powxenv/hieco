import type { ReactNode } from "react";
import { HiecoAppKitProvider, type HiecoAppKitProviderProps } from "./hieco-appkit-provider";

export type HiecoAppKitQueryProviderProps = HiecoAppKitProviderProps;

export function HiecoAppKitQueryProvider(props: HiecoAppKitQueryProviderProps): ReactNode {
  return <HiecoAppKitProvider {...props} />;
}
