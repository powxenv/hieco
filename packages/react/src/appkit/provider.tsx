import type { ReactNode } from "react";
import { HiecoProvider, type HiecoProviderProps } from "../provider";
import { useHiecoAppKitSigner, type UseHiecoAppKitSignerOptions } from "./use-hieco-appkit-signer";

export type HiecoAppKitProviderProps = Omit<HiecoProviderProps, "signer"> &
  UseHiecoAppKitSignerOptions;

export function HiecoAppKitProvider({
  children,
  namespace,
  ...props
}: HiecoAppKitProviderProps): ReactNode {
  const signer = useHiecoAppKitSigner({ namespace });

  return (
    <HiecoProvider {...props} signer={signer}>
      {children}
    </HiecoProvider>
  );
}
