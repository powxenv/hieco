import * as stylex from "@stylexjs/stylex";
import { create } from "qrcode";
import { useMemo, type ReactNode } from "react";
import { walletUiStyles } from "./styles.stylex";

const qrProps = stylex.props(walletUiStyles.qr);

function createQrDataUrl(value: string): string {
  const code = create(value, {
    errorCorrectionLevel: "M",
  });
  const size = code.modules.size + 2;
  const cells: string[] = [];

  for (let row = 0; row < code.modules.size; row += 1) {
    for (let column = 0; column < code.modules.size; column += 1) {
      if (code.modules.get(row, column) === 0) {
        continue;
      }

      cells.push(`<rect x="${column + 1}" y="${row + 1}" width="1" height="1" />`);
    }
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges"><rect width="${size}" height="${size}" fill="#ffffff" /><g fill="#000000">${cells.join("")}</g></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

interface WalletQrProps {
  readonly value: string;
}

export function WalletQr({ value }: WalletQrProps): ReactNode {
  const src = useMemo(() => createQrDataUrl(value), [value]);

  return <img alt="Wallet connection QR code" height={256} src={src} width={256} {...qrProps} />;
}
