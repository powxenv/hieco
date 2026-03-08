import { useEffect, useState, type ReactNode } from "react";
import { formatWalletError } from "@hieco/wallet";
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
  maxWidth: "30rem",
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

export function WalletDialog(): ReactNode {
  const { isOpen, closeModal } = useWalletModal();
  const wallet = useWallet();
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
              Connect once, approve in your wallet, and Hieco will keep the session warm.
            </span>
          </div>
          <button onClick={closeModal} type="button">
            Close
          </button>
        </div>

        {wallet.wallet && wallet.account ? (
          <ConnectedWalletCard
            accountId={wallet.account.accountId}
            chainId={wallet.chain.id}
            onDisconnect={() => {
              void disconnect().finally(closeModal);
            }}
            walletName={wallet.wallet.name}
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

              if (!prompt || prompt.kind === "return") {
                return;
              }

              const didCopy = await copyText(prompt.uri);
              setCopied(didCopy);
              if (didCopy) {
                window.setTimeout(() => {
                  setCopied(false);
                }, 1400);
              }
            }}
            onOpenWallet={() => {
              const prompt = wallet.prompt;

              if (!prompt || prompt.kind === "qr" || prompt.kind === "return" || !prompt.href) {
                return;
              }

              launchWallet(prompt.href);
            }}
            wallet={wallet}
          />
        ) : wallet.status === "connecting" || wallet.status === "restoring" ? (
          <div style={sectionStyle}>
            <strong>
              {wallet.status === "restoring" ? "Restoring session" : "Waiting for approval"}
            </strong>
            <span style={subtleStyle}>
              Keep this dialog open while the wallet finishes the request.
            </span>
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
  readonly onDisconnect: () => void;
}

function ConnectedWalletCard({
  walletName,
  accountId,
  chainId,
  onDisconnect,
}: ConnectedWalletCardProps): ReactNode {
  return (
    <div style={sectionStyle}>
      <strong>{walletName}</strong>
      <span style={subtleStyle}>{accountId}</span>
      <span style={subtleStyle}>{chainId}</span>
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
        <strong>Scan with {prompt.wallet.name}</strong>
        <span style={subtleStyle}>
          Open your wallet on another device and scan this QR code to approve the connection.
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
          Approve the request in your wallet, then come back here. If nothing happened, open the
          wallet again.
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

  const href = prompt.href;

  return (
    <div style={sectionStyle}>
      <strong>Return to your app</strong>
      <span style={subtleStyle}>
        Finish the request in your wallet, then return here to continue.
      </span>
      {href ? (
        <button
          onClick={() => {
            launchWallet(href);
          }}
          type="button"
        >
          Open app
        </button>
      ) : null}
    </div>
  );
}

export function WalletList(): ReactNode {
  const wallet = useWallet();

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
              <span style={subtleStyle}>
                {item.readyState === "unsupported"
                  ? "This wallet is unavailable in the current environment."
                  : "Connect with the wallet you already use on Hedera."}
              </span>
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <button
              disabled={wallet.status === "connecting" || item.readyState === "unsupported"}
              onClick={() => {
                void wallet.connect({ wallet: item.id });
              }}
              type="button"
            >
              {wallet.status === "connecting" && wallet.wallet?.id === item.id
                ? "Waiting for wallet..."
                : "Connect"}
            </button>
            {item.installUrl ? (
              <a href={item.installUrl} rel="noreferrer" target="_blank">
                Install
              </a>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
