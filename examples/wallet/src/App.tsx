import { useEffect, type ReactNode } from "react";
import type { WalletOption, WalletStatus } from "@hieco/wallet";
import { Dialog } from "@base-ui/react/dialog";
import { QRCodeSVG } from "qrcode.react";
import { useWallet } from "@hieco/wallet-react";
import { walletRuntimeMode } from "./wallet";

const statusLabels: Record<WalletStatus, string> = {
  idle: "Ready",
  connecting: "Connecting",
  connected: "Connected",
  restoring: "Restoring",
  disconnecting: "Disconnecting",
  error: "Try again",
};

function supportsExtension(wallet: WalletOption): boolean {
  return wallet.transports.includes("extension");
}

function shortenAccount(value: string | null | undefined): string {
  if (!value) {
    return "No wallet connected";
  }

  if (value.length <= 18) {
    return value;
  }

  return `${value.slice(0, 8)}...${value.slice(-6)}`;
}

function App(): ReactNode {
  return <WalletDemo />;
}

function WalletDemo(): ReactNode {
  const wallet = useWallet();
  const extensionWallets = wallet.wallets.filter(supportsExtension).slice(0, 2);
  const qrWalletId =
    wallet.wallets.find(
      (item) => item.id === "hedera-wallet" && item.transports.includes("walletconnect"),
    )?.id ??
    wallet.wallets.find((item) => item.transports.includes("walletconnect"))?.id ??
    null;
  const qrUri = wallet.prompt?.kind === "qr" ? wallet.prompt.uri : null;
  const busy =
    wallet.status === "connecting" ||
    wallet.status === "restoring" ||
    wallet.status === "disconnecting";

  useEffect(() => {
    if (!wallet.account || !wallet.isModalOpen) {
      return;
    }

    wallet.closeModal();
  }, [wallet.account, wallet.closeModal, wallet.isModalOpen]);

  useEffect(() => {
    if (!wallet.isModalOpen || wallet.account || wallet.prompt || !qrWalletId) {
      return;
    }

    if (wallet.status !== "idle" && wallet.status !== "error") {
      return;
    }

    void wallet
      .prepareQr({
        wallet: qrWalletId,
        chain: wallet.chain.id,
      })
      .catch(() => undefined);
  }, [
    qrWalletId,
    wallet.account,
    wallet.chain.id,
    wallet.isModalOpen,
    wallet.prepareQr,
    wallet.prompt,
    wallet.status,
  ]);

  return (
    <Dialog.Root
      onOpenChange={(open: boolean): void => {
        if (open) {
          wallet.openModal();
          return;
        }

        wallet.closeModal();
      }}
      open={wallet.isModalOpen}
    >
      <main className="relative min-h-screen overflow-hidden px-4 py-8 sm:px-6 sm:py-10">
        <div className="absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_top,rgba(45,212,191,0.24),transparent_58%)]" />
        <div className="absolute right-0 top-24 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl" />
        <div className="absolute left-0 top-40 h-72 w-72 rounded-full bg-indigo-200/40 blur-3xl" />

        <section className="relative mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl items-center justify-center">
          <div className="w-full rounded-[40px] border border-white/70 bg-white/80 p-6 shadow-[0_30px_120px_rgba(15,23,42,0.12)] backdrop-blur xl:p-8">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-end">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold tracking-[0.24em] text-slate-500 uppercase">
                  Wallet Demo
                </div>

                <div className="space-y-4">
                  <h1 className="max-w-xl text-4xl font-semibold tracking-[-0.06em] text-slate-950 sm:text-5xl">
                    Open a simple wallet modal with QR and browser extensions.
                  </h1>
                  <p className="max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                    Tailwind CSS v4 styles the shell, Base UI handles the dialog, and the wallet
                    runtime supplies the WalletConnect QR plus the available desktop extensions.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Dialog.Trigger className="inline-flex h-12 items-center justify-center rounded-full bg-slate-950 px-6 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950">
                    {wallet.account ? "Connected" : "Connect wallet"}
                  </Dialog.Trigger>
                  <button
                    className="inline-flex h-12 items-center justify-center rounded-full border border-slate-300 bg-white px-6 text-sm font-semibold text-slate-700 transition hover:border-slate-950 hover:text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950"
                    onClick={() => {
                      void wallet.restore();
                    }}
                    type="button"
                  >
                    Restore session
                  </button>
                </div>

                {wallet.error ? (
                  <div className="rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {wallet.error.message}
                  </div>
                ) : null}
              </div>

              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                <MetricCard label="Status" value={statusLabels[wallet.status]} />
                <MetricCard label="Wallet" value={wallet.wallet?.name ?? "Choose a wallet"} />
                <MetricCard label="Account" value={shortenAccount(wallet.account?.accountId)} />
              </div>
            </div>
          </div>
        </section>
      </main>

      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 bg-slate-950/45 backdrop-blur-sm transition duration-200 data-[starting-style]:opacity-0 data-[ending-style]:opacity-0" />
        <Dialog.Viewport className="fixed inset-0 flex items-center justify-center p-4 sm:p-6">
          <Dialog.Popup className="w-full max-w-4xl rounded-[32px] border border-slate-200 bg-white p-4 shadow-[0_40px_120px_rgba(15,23,42,0.24)] transition duration-200 data-[starting-style]:scale-[0.97] data-[starting-style]:opacity-0 data-[ending-style]:scale-[0.97] data-[ending-style]:opacity-0 sm:p-5">
            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
              <section className="rounded-[28px] bg-[linear-gradient(160deg,#0f172a_0%,#1e293b_55%,#0f172a_100%)] p-6 text-white">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="text-xs font-semibold tracking-[0.24em] text-slate-300 uppercase">
                      WalletConnect
                    </div>
                    <Dialog.Title className="text-2xl font-semibold tracking-[-0.05em]">
                      Scan with your phone
                    </Dialog.Title>
                    <Dialog.Description className="max-w-sm text-sm leading-6 text-slate-300">
                      Pair a mobile wallet with the QR code below or continue with one of the
                      desktop extensions on the right.
                    </Dialog.Description>
                  </div>
                </div>

                <div className="mt-8 flex flex-col items-center gap-5 rounded-[28px] border border-white/10 bg-white/5 p-5">
                  <div className="rounded-[24px] bg-white p-4 shadow-[0_20px_50px_rgba(15,23,42,0.22)]">
                    {qrUri ? (
                      <QRCodeSVG
                        bgColor="#ffffff"
                        fgColor="#0f172a"
                        level="M"
                        marginSize={4}
                        size={196}
                        title="WalletConnect QR"
                        value={qrUri}
                      />
                    ) : (
                      <div className="flex size-[196px] items-center justify-center rounded-[16px] bg-slate-100 text-sm font-medium text-slate-500">
                        {busy ? "Opening wallet..." : "Preparing QR..."}
                      </div>
                    )}
                  </div>

                  <div className="w-full rounded-2xl border border-white/10 bg-black/15 px-4 py-3 text-sm leading-6 text-slate-300">
                    <div className="font-medium text-white">
                      {walletRuntimeMode === "explicit"
                        ? "WalletConnect project ID detected"
                        : "Managed runtime mode"}
                    </div>
                    <div>Chain: {wallet.chain.id}</div>
                    <div>
                      {wallet.account
                        ? `Connected with ${wallet.wallet?.name ?? "wallet"}`
                        : "Use QR for a paired-device flow when no extension is available."}
                    </div>
                  </div>
                </div>
              </section>

              <section className="flex flex-col rounded-[28px] bg-slate-50 p-6">
                <div className="space-y-2">
                  <div className="text-xs font-semibold tracking-[0.24em] text-slate-500 uppercase">
                    Browser extensions
                  </div>
                  <h2 className="text-2xl font-semibold tracking-[-0.05em] text-slate-950">
                    Continue in this browser
                  </h2>
                  <p className="text-sm leading-6 text-slate-600">
                    These options come directly from the wallet catalog. Installed extensions can be
                    opened immediately.
                  </p>
                </div>

                <div className="mt-6 space-y-3">
                  {extensionWallets.map((item) => (
                    <ExtensionCard
                      connected={wallet.wallet?.id === item.id && wallet.status === "connected"}
                      key={item.id}
                      onConnect={() => {
                        void wallet
                          .connect({
                            wallet: item.id,
                            transport: "extension",
                          })
                          .catch(() => undefined);
                      }}
                      wallet={item}
                    />
                  ))}
                </div>

                {wallet.account ? (
                  <div className="mt-auto pt-6">
                    <button
                      className="inline-flex h-12 items-center justify-center rounded-full border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:border-slate-950 hover:text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
                      onClick={() => {
                        void wallet.disconnect();
                      }}
                      type="button"
                    >
                      Disconnect
                    </button>
                  </div>
                ) : null}
              </section>
            </div>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

interface MetricCardProps {
  readonly label: string;
  readonly value: string;
}

function MetricCard({ label, value }: MetricCardProps): ReactNode {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-slate-50/80 p-4">
      <div className="text-xs font-semibold tracking-[0.22em] text-slate-500 uppercase">
        {label}
      </div>
      <div className="mt-2 text-base font-semibold tracking-[-0.03em] text-slate-950">{value}</div>
    </div>
  );
}

interface ExtensionCardProps {
  readonly connected: boolean;
  readonly onConnect: () => void;
  readonly wallet: WalletOption;
}

function ExtensionCard({ connected, onConnect, wallet }: ExtensionCardProps): ReactNode {
  return (
    <article className="flex items-center gap-4 rounded-[24px] border border-slate-200 bg-white p-4">
      <img
        alt={`${wallet.name} icon`}
        className="size-12 rounded-2xl bg-slate-100 object-contain p-2"
        src={wallet.icon}
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold tracking-[-0.03em] text-slate-950">
            {wallet.name}
          </h3>
          <span
            className={`rounded-full px-2 py-1 text-[11px] font-semibold uppercase ${
              wallet.extension ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
            }`}
          >
            {wallet.extension ? "Installed" : "Extension"}
          </span>
        </div>
        <p className="mt-1 text-sm text-slate-600">
          {wallet.extension
            ? "Continue in browser with the detected extension."
            : "Install the extension first, then reconnect from this dialog."}
        </p>
      </div>

      {wallet.extension ? (
        <button
          className="inline-flex h-11 items-center justify-center rounded-full bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950"
          onClick={onConnect}
          type="button"
        >
          {connected ? "Connected" : "Open"}
        </button>
      ) : (
        <a
          className="inline-flex h-11 items-center justify-center rounded-full border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-950 hover:text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950"
          href={wallet.installUrl}
          rel="noreferrer"
          target="_blank"
        >
          Install
        </a>
      )}
    </article>
  );
}

export default App;
