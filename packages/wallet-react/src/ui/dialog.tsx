import { useEffect, useState, type ReactNode } from "react";
import { formatWalletError, type ConnectOptions, type WalletOption } from "@hieco/wallet";
import { useDisconnect } from "../use-disconnect";
import { useWallet } from "../use-wallet";
import { useWalletModal } from "../use-wallet-modal";
import { WalletQr } from "./qr";

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(5, 16, 28, 0.56)",
  display: "grid",
  placeItems: "center",
  padding: "1rem",
  zIndex: 1000,
} as const;

const dialogStyle = {
  width: "100%",
  maxWidth: "34rem",
  background: "#ffffff",
  borderRadius: "1.25rem",
  padding: "1.25rem",
  boxShadow: "0 28px 80px rgba(15, 23, 42, 0.28)",
  display: "grid",
  gap: "1rem",
} as const;

const sectionStyle = {
  display: "grid",
  gap: "0.75rem",
} as const;

const subtleStyle = {
  color: "#475569",
  fontSize: "0.95rem",
  lineHeight: 1.5,
} as const;

const walletStateLabels: Record<WalletOption["readyState"], string> = {
  installed: "Installed in this browser",
  loadable: "Ready on this device",
  "install-required": "Install required",
  "cross-device": "Available on another device",
  unsupported: "Not supported on this device",
};

const walletStateDescriptions: Record<WalletOption["readyState"], string> = {
  installed: "Connect with the browser extension already installed.",
  loadable: "Open the wallet app and approve the connection.",
  "install-required":
    "Install the browser extension, or show a QR code to connect from another device.",
  "cross-device": "Show a QR code and scan it from another phone or device.",
  unsupported: "This wallet does not support the current platform.",
};

function launchWallet(href: string): void {
  window.location.assign(href);
}

async function copyText(value: string): Promise<boolean> {
  if (!navigator.clipboard) {
    return false;
  }

  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
}

function walletStateLabel(wallet: WalletOption): string {
  return walletStateLabels[wallet.readyState];
}

function walletStateDescription(wallet: WalletOption): string {
  return walletStateDescriptions[wallet.readyState];
}

function isConnectDisabled(status: ReturnType<typeof useWallet>["status"]): boolean {
  return status === "restoring" || status === "disconnecting";
}

function isQrPromptActive(wallet: ReturnType<typeof useWallet>, item: WalletOption): boolean {
  return wallet.prompt?.kind === "qr" && wallet.prompt.wallet.id === item.id;
}

function isExtensionApprovalPending(
  wallet: ReturnType<typeof useWallet>,
  item: WalletOption,
): boolean {
  return (
    wallet.status === "connecting" &&
    wallet.transport === "extension" &&
    !wallet.prompt &&
    wallet.wallet?.id === item.id
  );
}

function connectButtonLabel(wallet: ReturnType<typeof useWallet>, item: WalletOption): string {
  if (isExtensionApprovalPending(wallet, item)) {
    return `Open ${item.name} again`;
  }

  return "Connect";
}

function pairButtonLabel(wallet: ReturnType<typeof useWallet>, item: WalletOption): string {
  return isQrPromptActive(wallet, item) ? "QR code ready" : "Show QR code";
}

function startConnection(wallet: ReturnType<typeof useWallet>, options: ConnectOptions): void {
  void wallet.connect(options).catch(() => {});
}

export function WalletDialog(): ReactNode {
  const { isOpen, closeModal } = useWalletModal();
  const wallet = useWallet();
  const activeWallet = wallet.wallet;
  const disconnect = useDisconnect();
  const [copied, setCopied] = useState(false);
  const [attemptedDeepLinkUri, setAttemptedDeepLinkUri] = useState<string | null>(null);
  const [deepLinkNeedsManualRetry, setDeepLinkNeedsManualRetry] = useState(false);

  useEffect(() => {
    if (!isOpen || wallet.status !== "connected" || !wallet.account) {
      return;
    }

    closeModal();
  }, [closeModal, isOpen, wallet.account, wallet.status]);

  useEffect(() => {
    if (!isOpen || !wallet.prompt || wallet.prompt.kind !== "deeplink") {
      setAttemptedDeepLinkUri(null);
      setDeepLinkNeedsManualRetry(false);
      return;
    }

    if (attemptedDeepLinkUri === wallet.prompt.uri) {
      return;
    }

    setAttemptedDeepLinkUri(wallet.prompt.uri);
    setDeepLinkNeedsManualRetry(false);

    try {
      launchWallet(wallet.prompt.href);
    } catch {
      setDeepLinkNeedsManualRetry(true);
      return;
    }

    const timeout = window.setTimeout(() => {
      if (document.visibilityState === "visible") {
        setDeepLinkNeedsManualRetry(true);
      }
    }, 1500);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [attemptedDeepLinkUri, isOpen, wallet.prompt]);

  if (!isOpen) {
    return null;
  }

  return (
    <div aria-modal="true" role="dialog" style={overlayStyle}>
      <div style={dialogStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "grid", gap: "0.25rem" }}>
            <strong>Wallet</strong>
            <span style={subtleStyle}>
              Choose a wallet below. Use the installed browser extension when available, or open a
              QR code when you want to connect from another device.
            </span>
          </div>
          <button onClick={closeModal} type="button">
            Close
          </button>
        </div>

        {activeWallet && wallet.account ? (
          <ConnectedWalletCard
            accountId={wallet.account.accountId}
            chainId={wallet.chain.id}
            onDisconnect={() => {
              void disconnect().finally(closeModal);
            }}
            transport={wallet.transport}
            walletName={activeWallet.name}
          />
        ) : (
          <WalletList />
        )}

        {wallet.prompt ? (
          <WalletPromptCard
            copied={copied}
            deepLinkNeedsManualRetry={deepLinkNeedsManualRetry}
            onCopy={async () => {
              const prompt = wallet.prompt;

              if (!prompt) {
                return;
              }

              const uri = prompt.uri;

              if (!uri) {
                return;
              }

              const didCopy = await copyText(uri);
              setCopied(didCopy);

              if (didCopy) {
                window.setTimeout(() => {
                  setCopied(false);
                }, 1400);
              }
            }}
            onOpenWallet={() => {
              const prompt = wallet.prompt;

              if (!prompt || prompt.kind !== "deeplink") {
                return;
              }

              launchWallet(prompt.href);
            }}
            wallet={wallet}
          />
        ) : wallet.status === "connecting" || wallet.status === "restoring" ? (
          <div style={sectionStyle}>
            <strong>
              {wallet.status === "restoring"
                ? "Restoring session"
                : wallet.transport === "walletconnect"
                  ? "Preparing QR code"
                  : "Open your wallet to continue"}
            </strong>
            <span style={subtleStyle}>
              {wallet.status === "restoring"
                ? "Checking whether a previous wallet session is still available."
                : wallet.transport === "extension"
                  ? `Approve the request in ${wallet.wallet?.name ?? "your wallet extension"}. If the wallet window was closed or nothing happened, open it again or cancel this request.`
                  : "Getting the QR code ready now."}
            </span>
            {wallet.status === "connecting" ? (
              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                {wallet.transport === "extension" && activeWallet ? (
                  <button
                    onClick={() => {
                      startConnection(wallet, {
                        wallet: activeWallet.id,
                        transport: "extension",
                      });
                    }}
                    type="button"
                  >
                    Open {activeWallet.name} again
                  </button>
                ) : null}
                <button
                  onClick={() => {
                    wallet.cancel();
                  }}
                  type="button"
                >
                  Cancel request
                </button>
              </div>
            ) : null}
          </div>
        ) : null}

        {wallet.error ? (
          <div
            style={{
              ...sectionStyle,
              color: "#b42318",
              background: "#fff1f3",
              borderRadius: "0.9rem",
              padding: "0.9rem 1rem",
            }}
          >
            <strong>Wallet request failed</strong>
            <span>{formatWalletError(wallet.error)}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

interface ConnectedWalletCardProps {
  readonly walletName: string;
  readonly accountId: string;
  readonly chainId: string;
  readonly transport: ReturnType<typeof useWallet>["transport"];
  readonly onDisconnect: () => void;
}

function ConnectedWalletCard({
  walletName,
  accountId,
  chainId,
  transport,
  onDisconnect,
}: ConnectedWalletCardProps): ReactNode {
  return (
    <div style={sectionStyle}>
      <strong>{walletName}</strong>
      <span style={subtleStyle}>{accountId}</span>
      <span style={subtleStyle}>{chainId}</span>
      <span style={subtleStyle}>
        {transport === "extension"
          ? "Connected through desktop extension"
          : "Connected through WalletConnect"}
      </span>
      <button onClick={onDisconnect} type="button">
        Disconnect
      </button>
    </div>
  );
}

interface WalletPromptCardProps {
  readonly wallet: ReturnType<typeof useWallet>;
  readonly copied: boolean;
  readonly deepLinkNeedsManualRetry: boolean;
  readonly onCopy: () => void;
  readonly onOpenWallet: () => void;
}

function WalletPromptCard({
  wallet,
  copied,
  deepLinkNeedsManualRetry,
  onCopy,
  onOpenWallet,
}: WalletPromptCardProps): ReactNode {
  const prompt = wallet.prompt;

  if (!prompt) {
    return null;
  }

  if (prompt.kind === "qr") {
    return (
      <div style={{ ...sectionStyle, justifyItems: "center", textAlign: "center" }}>
        <strong>Pair with {prompt.wallet.name}</strong>
        <span style={subtleStyle}>
          Open the wallet on another device and scan this QR code to approve the connection.
        </span>
        <WalletQr value={prompt.uri} />
        <button onClick={onCopy} type="button">
          {copied ? "Pairing link copied" : "Copy pairing link"}
        </button>
      </div>
    );
  }

  if (prompt.kind === "deeplink") {
    return (
      <div style={sectionStyle}>
        <strong>Open {prompt.wallet.name}</strong>
        <span style={subtleStyle}>
          Approve the request in your wallet, then return here. If nothing happened, open the wallet
          again.
        </span>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <button onClick={onOpenWallet} type="button">
            {deepLinkNeedsManualRetry ? "Open wallet again" : `Open ${prompt.wallet.name}`}
          </button>
          <button onClick={onCopy} type="button">
            {copied ? "Pairing link copied" : "Copy pairing link"}
          </button>
          {prompt.wallet.installUrl ? (
            <a href={prompt.wallet.installUrl} rel="noreferrer" target="_blank">
              Install wallet
            </a>
          ) : null}
        </div>
      </div>
    );
  }

  const returnHref = prompt.href;

  return (
    <div style={sectionStyle}>
      <strong>Finish in your wallet</strong>
      <span style={subtleStyle}>Open the wallet, approve the request, then return to the app.</span>
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
        {returnHref ? (
          <button
            onClick={() => {
              launchWallet(returnHref);
            }}
            type="button"
          >
            Open app
          </button>
        ) : null}
        {prompt.uri ? (
          <button onClick={onCopy} type="button">
            {copied ? "Pairing link copied" : "Copy pairing link"}
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function WalletList(): ReactNode {
  const wallet = useWallet();
  const disabled = isConnectDisabled(wallet.status);

  return (
    <div style={sectionStyle}>
      {wallet.wallets.map((item) => (
        <div
          key={item.id}
          style={{
            display: "grid",
            gap: "0.75rem",
            padding: "0.95rem 1rem",
            borderRadius: "1rem",
            border: "1px solid #e2e8f0",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <img alt="" height={28} src={item.icon} width={28} />
            <div style={{ display: "grid", gap: "0.2rem" }}>
              <strong>{item.name}</strong>
              <span style={subtleStyle}>{walletStateLabel(item)}</span>
              <span style={subtleStyle}>{walletStateDescription(item)}</span>
            </div>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            {item.readyState === "installed" || item.readyState === "loadable" ? (
              <button
                disabled={disabled}
                onClick={() => {
                  startConnection(wallet, {
                    wallet: item.id,
                    transport: item.defaultTransport ?? undefined,
                  });
                }}
                type="button"
              >
                {connectButtonLabel(wallet, item)}
              </button>
            ) : null}

            {item.readyState === "install-required" ? (
              <>
                {item.installUrl ? (
                  <a href={item.installUrl} rel="noreferrer" target="_blank">
                    Install
                  </a>
                ) : null}
                {item.transports.includes("walletconnect") ? (
                  <button
                    disabled={disabled || isQrPromptActive(wallet, item)}
                    onClick={() => {
                      startConnection(wallet, {
                        wallet: item.id,
                        presentation: "qr",
                        transport: "walletconnect",
                      });
                    }}
                    type="button"
                  >
                    {pairButtonLabel(wallet, item)}
                  </button>
                ) : null}
              </>
            ) : null}

            {item.readyState === "cross-device" ? (
              <button
                disabled={disabled || isQrPromptActive(wallet, item)}
                onClick={() => {
                  startConnection(wallet, {
                    wallet: item.id,
                    presentation: "qr",
                    transport: "walletconnect",
                  });
                }}
                type="button"
              >
                {pairButtonLabel(wallet, item)}
              </button>
            ) : null}

            {item.readyState === "unsupported" && item.installUrl ? (
              <a href={item.installUrl} rel="noreferrer" target="_blank">
                Learn more
              </a>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
