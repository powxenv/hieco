import * as stylex from "@stylexjs/stylex";
import { useEffect, useState, type ReactNode } from "react";
import { type ConnectOptions, type WalletOption } from "@hieco/wallet";
import { useDisconnect } from "../use-disconnect";
import { useWallet } from "../use-wallet";
import { useWalletModal } from "../use-wallet-modal";
import { WalletQr } from "./qr";
import { walletUiStyles } from "./styles.stylex";

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
  "install-required": "Install the browser extension to connect in this browser.",
  "cross-device": "Connect with WalletConnect from another phone or device.",
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
  return walletStateLabels[wallet.readyState] ?? "Unavailable";
}

function walletStateDescription(wallet: WalletOption): string {
  return walletStateDescriptions[wallet.readyState] ?? "This wallet is not currently available.";
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

function walletConnectButtonLabel(
  wallet: ReturnType<typeof useWallet>,
  item: WalletOption,
): string {
  return isQrPromptActive(wallet, item) ? "WalletConnect QR ready" : "Connect with WalletConnect";
}

function startConnection(wallet: ReturnType<typeof useWallet>, options: ConnectOptions): void {
  void wallet.connect(options).catch(() => {});
}

const primaryButtonProps = stylex.props(
  walletUiStyles.interactive,
  walletUiStyles.focusRing,
  walletUiStyles.button,
);

const secondaryButtonProps = stylex.props(
  walletUiStyles.interactive,
  walletUiStyles.focusRing,
  walletUiStyles.button,
  walletUiStyles.buttonSecondary,
);

const linkProps = stylex.props(
  walletUiStyles.interactive,
  walletUiStyles.focusRing,
  walletUiStyles.link,
);

const overlayProps = stylex.props(walletUiStyles.overlay);

const dialogProps = stylex.props(walletUiStyles.dialog);

const headerProps = stylex.props(walletUiStyles.header);

const stackProps = stylex.props(walletUiStyles.stackSm);

const centeredStackProps = stylex.props(walletUiStyles.stackSm, walletUiStyles.centeredStack);

const titleProps = stylex.props(walletUiStyles.title);

const copyProps = stylex.props(walletUiStyles.copy);

const actionsProps = stylex.props(walletUiStyles.actions);

const cardProps = stylex.props(walletUiStyles.stackSm, walletUiStyles.card);

const errorProps = stylex.props(walletUiStyles.stackSm, walletUiStyles.error);

const walletListProps = stylex.props(walletUiStyles.walletList);

const walletProps = stylex.props(walletUiStyles.wallet);

const walletHeaderProps = stylex.props(walletUiStyles.walletHeader);

const walletCopyProps = stylex.props(walletUiStyles.walletCopy);

const walletMetaProps = stylex.props(walletUiStyles.walletMeta);

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
    <div aria-modal="true" role="dialog" {...overlayProps}>
      <div {...dialogProps}>
        <div {...headerProps}>
          <div {...stackProps}>
            <strong {...titleProps}>Wallet</strong>
            <span {...copyProps}>
              Choose a wallet below. Use the installed browser extension when available, or open a
              WalletConnect QR code when you want to connect from another device.
            </span>
          </div>
          <button onClick={closeModal} type="button" {...secondaryButtonProps}>
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
          <div {...stackProps}>
            <strong {...titleProps}>
              {wallet.status === "restoring"
                ? "Restoring session"
                : wallet.transport === "walletconnect"
                  ? "Preparing WalletConnect"
                  : "Open your wallet to continue"}
            </strong>
            <span {...copyProps}>
              {wallet.status === "restoring"
                ? "Checking whether a previous wallet session is still available."
                : wallet.transport === "extension"
                  ? `Approve the request in ${wallet.wallet?.name ?? "your wallet extension"}. If the wallet window was closed or nothing happened, open it again or cancel this request.`
                  : "Getting the WalletConnect QR code ready now."}
            </span>
            {wallet.status === "connecting" ? (
              <div {...actionsProps}>
                {wallet.transport === "extension" && activeWallet ? (
                  <button
                    onClick={() => {
                      startConnection(wallet, {
                        wallet: activeWallet.id,
                        transport: "extension",
                      });
                    }}
                    type="button"
                    {...primaryButtonProps}
                  >
                    Open {activeWallet.name} again
                  </button>
                ) : null}
                <button
                  onClick={() => {
                    wallet.cancel();
                  }}
                  type="button"
                  {...secondaryButtonProps}
                >
                  Cancel request
                </button>
              </div>
            ) : null}
          </div>
        ) : null}

        {wallet.error ? (
          <div {...errorProps}>
            <strong {...titleProps}>Wallet request failed</strong>
            <span {...copyProps}>{wallet.error.message}</span>
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
    <div {...cardProps}>
      <strong {...titleProps}>{walletName}</strong>
      <span {...copyProps}>{accountId}</span>
      <span {...copyProps}>{chainId}</span>
      <span {...copyProps}>
        {transport === "extension"
          ? "Connected through desktop extension"
          : "Connected through WalletConnect"}
      </span>
      <button onClick={onDisconnect} type="button" {...secondaryButtonProps}>
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
      <div {...centeredStackProps}>
        <strong {...titleProps}>Connect with WalletConnect</strong>
        <span {...copyProps}>
          Open a Hedera wallet on another device and scan this WalletConnect QR code to approve the
          connection.
        </span>
        <WalletQr value={prompt.uri} />
        <button onClick={onCopy} type="button" {...primaryButtonProps}>
          {copied ? "Pairing link copied" : "Copy pairing link"}
        </button>
      </div>
    );
  }

  if (prompt.kind === "deeplink") {
    return (
      <div {...stackProps}>
        <strong {...titleProps}>Open {prompt.wallet.name}</strong>
        <span {...copyProps}>
          Approve the request in your wallet, then return here. If nothing happened, open the wallet
          again.
        </span>
        <div {...actionsProps}>
          <button onClick={onOpenWallet} type="button" {...primaryButtonProps}>
            {deepLinkNeedsManualRetry ? "Open wallet again" : `Open ${prompt.wallet.name}`}
          </button>
          <button onClick={onCopy} type="button" {...secondaryButtonProps}>
            {copied ? "Pairing link copied" : "Copy pairing link"}
          </button>
          {prompt.wallet.installUrl ? (
            <a href={prompt.wallet.installUrl} rel="noreferrer" target="_blank" {...linkProps}>
              Install wallet
            </a>
          ) : null}
        </div>
      </div>
    );
  }

  const returnHref = prompt.href;

  return (
    <div {...stackProps}>
      <strong {...titleProps}>Finish in your wallet</strong>
      <span {...copyProps}>Open the wallet, approve the request, then return to the app.</span>
      <div {...actionsProps}>
        {returnHref ? (
          <button
            onClick={() => {
              launchWallet(returnHref);
            }}
            type="button"
            {...primaryButtonProps}
          >
            Open app
          </button>
        ) : null}
        {prompt.uri ? (
          <button onClick={onCopy} type="button" {...secondaryButtonProps}>
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
    <div {...walletListProps}>
      {wallet.wallets.map((item) => (
        <div key={item.id} {...walletProps}>
          <div {...walletHeaderProps}>
            <img
              alt=""
              height={28}
              src={item.icon}
              width={28}
              {...stylex.props(walletUiStyles.walletIcon)}
            />
            <div {...walletCopyProps}>
              <strong {...titleProps}>{item.name}</strong>
              <span {...walletMetaProps}>{walletStateLabel(item)}</span>
              <span {...walletMetaProps}>{walletStateDescription(item)}</span>
            </div>
          </div>

          <div {...actionsProps}>
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
                {...primaryButtonProps}
              >
                {connectButtonLabel(wallet, item)}
              </button>
            ) : null}

            {item.readyState === "install-required" ? (
              <>
                {item.installUrl ? (
                  <a href={item.installUrl} rel="noreferrer" target="_blank" {...linkProps}>
                    Install
                  </a>
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
                {...secondaryButtonProps}
              >
                {walletConnectButtonLabel(wallet, item)}
              </button>
            ) : null}

            {item.readyState === "unsupported" && item.installUrl ? (
              <a href={item.installUrl} rel="noreferrer" target="_blank" {...linkProps}>
                Learn more
              </a>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
