import type { ReactNode } from "react";
import type { ConnectOptions, WalletOption, WalletPrompt, WalletStatus } from "@hieco/wallet";
import {
  useConnectionStatus,
  useDisconnect,
  useWallet,
  useWalletAccount,
  useWalletError,
  useWalletModal,
  useWalletSigner,
  useWallets,
} from "@hieco/wallet-react";
import { WalletButton, WalletDialog } from "@hieco/wallet-react/ui";
import { walletRuntimeMode } from "./wallet";
import "./App.css";

function formatStatusLabel(status: WalletStatus): string {
  switch (status) {
    case "idle":
      return "Idle";
    case "connecting":
      return "Connecting";
    case "connected":
      return "Connected";
    case "restoring":
      return "Restoring";
    case "disconnecting":
      return "Disconnecting";
    case "error":
      return "Error";
  }

  throw new Error(`Unsupported wallet status: ${status}`);
}

function formatPromptLabel(prompt: WalletPrompt | null): string {
  if (!prompt) {
    return "None";
  }

  switch (prompt.kind) {
    case "qr":
      return "QR pairing";
    case "deeplink":
      return "Mobile deeplink";
    case "return":
      return "Return to app";
  }

  throw new Error("Unsupported wallet prompt.");
}

function formatTransportLabel(transport: ReturnType<typeof useWallet>["transport"]): string {
  if (!transport) {
    return "Not active";
  }

  return transport === "extension" ? "Desktop extension" : "WalletConnect";
}

function formatWalletAvailability(wallet: ReturnType<typeof useWallets>[number]): string {
  switch (wallet.readyState) {
    case "installed":
      return "Installed in this browser";
    case "loadable":
      return "Ready on this device";
    case "install-required":
      return "Install required";
    case "cross-device":
      return "Pair from another device";
    case "unsupported":
      return "Unsupported on this device";
  }

  throw new Error(`Unsupported wallet ready state: ${wallet.readyState}`);
}

function shortenValue(value: string | undefined): string {
  if (!value) {
    return "Not available";
  }

  if (value.length <= 54) {
    return value;
  }

  return `${value.slice(0, 30)}...${value.slice(-16)}`;
}

function startConnection(wallet: ReturnType<typeof useWallet>, options: ConnectOptions): void {
  void wallet.connect(options).catch(() => {});
}

function App(): ReactNode {
  return (
    <>
      <WalletShowcase />
      <WalletDialog />
    </>
  );
}

function WalletShowcase(): ReactNode {
  const wallet = useWallet();
  const wallets: readonly WalletOption[] = useWallets();
  const account = useWalletAccount();
  const signer = useWalletSigner();
  const error = useWalletError();
  const status = useConnectionStatus();
  const disconnect = useDisconnect();
  const modal = useWalletModal();

  return (
    <main className="shell">
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">Hedera wallet example</span>
          <h1>Connect once. Inspect the state. Swap to headless control when you need it.</h1>
          <p className="lead">
            This example uses <code>@hieco/wallet</code> for the runtime and{" "}
            <code>@hieco/wallet-react</code> for the provider, hooks, QR dialog, and connect button.
          </p>
          <div className="hero-actions">
            <WalletButton />
            <button
              onClick={() => {
                void wallet.restore();
              }}
              type="button"
            >
              Restore session
            </button>
            <button onClick={modal.openModal} type="button">
              Open dialog
            </button>
          </div>
        </div>

        <div className="hero-panel">
          <InfoRow
            label="Runtime mode"
            value={walletRuntimeMode === "explicit" ? "Explicit project ID" : "Managed mode"}
          />
          <InfoRow label="Status" value={formatStatusLabel(status)} />
          <InfoRow label="Wallet" value={wallet.wallet?.name ?? "Not connected"} />
          <InfoRow label="Account" value={account?.accountId ?? "No account yet"} />
          <InfoRow label="Chain" value={wallet.chain.id} />
          <InfoRow label="Transport" value={formatTransportLabel(wallet.transport)} />
          <InfoRow label="Signer" value={signer ? "Ready" : "Unavailable"} />
          <InfoRow label="Prompt" value={formatPromptLabel(wallet.prompt)} />
        </div>
      </section>

      <section className="grid">
        <Panel
          title="Wallet catalog"
          description="Use the built-in dialog, or connect directly from your own UI."
        >
          <div className="wallet-list">
            {wallets.map((item) => (
              <div key={item.id} className="wallet-row">
                <div className="wallet-row-copy">
                  <span className="wallet-name">{item.name}</span>
                  <span className="wallet-meta">{formatWalletAvailability(item)}</span>
                </div>
                <div className="hero-actions">
                  {item.readyState === "installed" || item.readyState === "loadable" ? (
                    <button
                      disabled={wallet.status === "connecting" || wallet.status === "restoring"}
                      onClick={() => {
                        startConnection(wallet, {
                          wallet: item.id,
                          transport: item.defaultTransport ?? undefined,
                        });
                      }}
                      type="button"
                    >
                      {wallet.wallet?.id === item.id && wallet.status === "connected"
                        ? "Connected"
                        : "Connect"}
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
                          disabled={wallet.status === "connecting" || wallet.status === "restoring"}
                          onClick={() => {
                            startConnection(wallet, {
                              wallet: item.id,
                              presentation: "qr",
                              transport: "walletconnect",
                            });
                          }}
                          type="button"
                        >
                          Pair from another device
                        </button>
                      ) : null}
                    </>
                  ) : null}

                  {item.readyState === "cross-device" ? (
                    <button
                      disabled={wallet.status === "connecting" || wallet.status === "restoring"}
                      onClick={() => {
                        startConnection(wallet, {
                          wallet: item.id,
                          presentation: "qr",
                          transport: "walletconnect",
                        });
                      }}
                      type="button"
                    >
                      Pair from another device
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel
          title="Live session"
          description="Everything below comes from hooks. This is the same state your own UI can read."
        >
          <dl className="facts">
            <Fact label="Wallet account" value={account?.accountId ?? "Not connected"} />
            <Fact label="Connected wallets" value={String(wallet.accounts.length)} />
            <Fact label="Prompt details" value={readPromptDetails(wallet.prompt)} />
            <Fact label="Modal state" value={modal.isOpen ? "Open" : "Closed"} />
            <Fact
              label="Project setup"
              value={
                walletRuntimeMode === "explicit"
                  ? "Production-style config"
                  : "Managed development mode"
              }
            />
          </dl>
        </Panel>

        <Panel
          title="Recovery and control"
          description="These actions use the headless runtime directly through React hooks."
        >
          <div className="action-stack">
            <button
              disabled={wallet.status !== "connected"}
              onClick={() => {
                void disconnect();
              }}
              type="button"
            >
              Disconnect wallet
            </button>
            <button
              onClick={() => {
                void wallet.restore();
              }}
              type="button"
            >
              Restore saved session
            </button>
            <button
              onClick={() => {
                void wallet.switchChain("hedera:testnet");
              }}
              type="button"
            >
              Reset chain to testnet
            </button>
          </div>
        </Panel>

        <Panel
          title="Developer notes"
          description="This example uses the wallet runtime directly and connects through an explicit WalletConnect project ID."
        >
          <ul className="notes">
            <li>
              Add <code>VITE_WALLETCONNECT_PROJECT_ID</code> to <code>.env.local</code> before
              trying a real wallet connection.
            </li>
            <li>
              Desktop browsers prefer installed wallet extensions. QR is only used for explicit
              cross-device pairing.
            </li>
            <li>
              Pair <code>useWalletSigner()</code> with <code>@hieco/react</code> when you want query
              and mutation hooks.
            </li>
          </ul>
        </Panel>
      </section>

      {error ? (
        <section className="error-panel">
          <strong>{error.message}</strong>
          <span>{error.hint ?? "Try the request again from the wallet dialog."}</span>
        </section>
      ) : null}
    </main>
  );
}

function readPromptDetails(prompt: WalletPrompt | null): string {
  if (!prompt) {
    return "No pairing prompt is active.";
  }

  if (prompt.kind === "return") {
    return prompt.href
      ? `Return link: ${shortenValue(prompt.href)}`
      : "Waiting for the wallet app.";
  }

  return shortenValue(prompt.uri);
}

interface PanelProps {
  readonly title: string;
  readonly description: string;
  readonly children: ReactNode;
}

function Panel({ title, description, children }: PanelProps): ReactNode {
  return (
    <section className="panel">
      <header className="panel-header">
        <h2>{title}</h2>
        <p>{description}</p>
      </header>
      {children}
    </section>
  );
}

interface InfoRowProps {
  readonly label: string;
  readonly value: string;
}

function InfoRow({ label, value }: InfoRowProps): ReactNode {
  return (
    <div className="info-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

interface FactProps {
  readonly label: string;
  readonly value: string;
}

function Fact({ label, value }: FactProps): ReactNode {
  return (
    <>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </>
  );
}

export default App;
