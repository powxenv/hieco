import * as stylex from "@stylexjs/stylex";
import { toDataURL } from "qrcode";
import { useEffect, useState, type ReactNode } from "react";
import { walletUiStyles } from "./styles.stylex";

const qrProps = stylex.props(walletUiStyles.qr);

interface WalletQrProps {
  readonly value: string;
}

export function WalletQr({ value }: WalletQrProps): ReactNode {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadQr = async (): Promise<void> => {
      const next = await toDataURL(value, {
        margin: 1,
        width: 256,
      });

      if (!cancelled) {
        setSrc(next);
      }
    };

    void loadQr();

    return () => {
      cancelled = true;
    };
  }, [value]);

  if (!src) {
    return null;
  }

  return <img alt="Wallet connection QR code" height={256} src={src} width={256} {...qrProps} />;
}
