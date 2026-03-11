import type { ReactNode } from "react";
import type {
  ConnectOptions,
  WalletError,
  WalletOption,
  WalletPrompt,
  WalletStatus,
} from "@hieco/wallet";
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
  return prompt ? "WalletConnect QR" : "None";
}

function formatTransportLabel(transport: ReturnType<typeof useWallet>["transport"]): string {
  if (!transport) {
    return "Not active";
  }

  return transport === "extension" ? "Desktop extension" : "WalletConnect";
}

function formatWalletAvailability(wallet: ReturnType<typeof useWallets>[number]): string {
  if (wallet.extension) {
    return "Installed in this browser";
  }

  if (wallet.transports.includes("extension") && wallet.desktop?.extension) {
    return "Install required";
  }

  if (wallet.transports.includes("walletconnect")) {
    return "Connect with WalletConnect";
  }

  return "Unavailable";
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

function walletErrorSummary(error: WalletError): {
  readonly title: string;
  readonly message: string;
} {
  if (error.code === "USER_REJECTED") {
    return {
      title: "Connection canceled",
      message: "You canceled the wallet request. Try again whenever you're ready.",
    };
  }

  if (error.code === "WALLET_NOT_INSTALLED") {
    return {
      title: "Wallet not installed",
      message: "Install the wallet extension first, then try connecting again.",
    };
  }

  if (error.code === "CONNECT_FAILED") {
    return {
      title: "Couldn't connect",
      message: "We couldn't connect to the wallet. Try again from the wallet dialog.",
    };
  }

  return {
    title: error.message,
    message: "Try the request again from the wallet dialog.",
  };
}

function App(): ReactNode {
  return <WalletShowcase />;
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
  const errorSummary = error ? walletErrorSummary(error) : null;

  return (
    <main className="shell">
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">Hedera wallet example</span>
          <h1>Connect once. Inspect the state. Swap to headless control when you need it.</h1>
          <p className="lead">
            This example uses <code>@hieco/wallet</code> for the runtime and{" "}
            <code>@hieco/wallet-react</code> for the provider and hooks.
          </p>
          <div className="hero-actions">
            <button onClick={modal.openModal} type="button">
              {account ? "Connected" : "Connect Wallet"}
            </button>
            <button
              onClick={() => {
                void wallet.restore();
              }}
              type="button"
            >
              Restore session
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
        <Panel title="Wallet catalog" description="Connect directly from your own UI.">
          <div className="wallet-list">
            {wallets.map((item) => (
              <div key={item.id} className="wallet-row">
                <div className="wallet-row-copy">
                  <span className="wallet-name">{item.name}</span>
                  <span className="wallet-meta">{formatWalletAvailability(item)}</span>
                </div>
                <div className="hero-actions">
                  {item.extension ? (
                    <button
                      disabled={wallet.status === "connecting" || wallet.status === "restoring"}
                      onClick={() => {
                        startConnection(wallet, {
                          wallet: item.id,
                          transport: "extension",
                        });
                      }}
                      type="button"
                    >
                      {wallet.wallet?.id === item.id && wallet.status === "connected"
                        ? "Connected"
                        : "Connect"}
                    </button>
                  ) : null}

                  {!item.extension && item.transports.includes("extension") && item.installUrl ? (
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
                          transport: "walletconnect",
                        });
                      }}
                      type="button"
                    >
                      Connect with WalletConnect
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
              Desktop browsers prefer installed wallet extensions. Use the WalletConnect option for
              explicit cross-device pairing.
            </li>
            <li>
              Pair <code>useWalletSigner()</code> with <code>@hieco/react</code> when you want query
              and mutation hooks.
            </li>
          </ul>
        </Panel>
      </section>

      {errorSummary ? (
        <section className="error-panel">
          <strong>{errorSummary.title}</strong>
          <span>{errorSummary.message}</span>
        </section>
      ) : null}
    </main>
  );
}

function readPromptDetails(prompt: WalletPrompt | null): string {
  if (!prompt) {
    return "No pairing prompt is active.";
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
