import { useEffect, type ReactNode } from "react";
import { useHiecoController } from "../../hooks/use-hieco-controller";
import { useHiecoAppKitSigner, type UseHiecoAppKitSignerOptions } from "./use-hieco-appkit-signer";

export type HiecoAppKitBridgeProps = {
  readonly children: ReactNode;
} & UseHiecoAppKitSignerOptions;

export function HiecoAppKitBridge({ children, namespace }: HiecoAppKitBridgeProps): ReactNode {
  const signer = useHiecoAppKitSigner({ namespace });
  const { setSigner, clearSigner } = useHiecoController();

  useEffect(() => {
    if (signer) {
      setSigner(signer);
      return;
    }

    clearSigner();
  }, [clearSigner, setSigner, signer]);

  return children;
}
