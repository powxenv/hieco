import { useEffect, useState, type ReactNode } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { useAccountBalances, useAccountInfo } from "@hieco/mirror-react";
import { useWallet } from "@hieco/wallet-react";
import { QRCodeSVG } from "qrcode.react";

function formatValue(value: string | number | null | undefined, fallback: string): string {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  return `${value}`;
}

function formatHbarBalance(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return "Unavailable";
  }

  return `${value / 100_000_000} HBAR`;
}

function App(): ReactNode {
  const wallet = useWallet();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!wallet.session) {
      return;
    }

    setOpen(false);
  }, [wallet.session]);

  const handleOpenChange = (nextOpen: boolean): void => {
    setOpen(nextOpen);

    if (!nextOpen) {
      wallet.close();
      return;
    }

    void wallet.open();
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <main className="min-h-screen bg-zinc-50 px-4 py-6 font-sans text-zinc-950 sm:px-6 sm:py-8">
        <div className="mx-auto grid max-w-xl gap-8">
          <section className="grid gap-5">
            <div className="grid gap-2">
              <p className="text-sm font-medium text-zinc-500">Wallet example</p>
              <h1 className="max-w-lg text-3xl font-semibold tracking-tight text-zinc-950">
                Hedera wallet connect, stripped back to the essentials.
              </h1>
              <p className="max-w-md text-sm leading-6 text-zinc-600">
                Open the dialog, scan the QR, or pick an installed extension.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {wallet.session ? (
                <button
                  className="inline-flex h-9 items-center justify-center rounded-lg bg-zinc-950 px-3.5 text-sm font-medium text-white transition hover:bg-zinc-800"
                  onClick={() => {
                    void wallet.disconnect();
                  }}
                  type="button"
                >
                  Disconnect
                </button>
              ) : (
                <Dialog.Trigger className="inline-flex h-9 items-center justify-center rounded-lg bg-zinc-950 px-3.5 text-sm font-medium text-white transition hover:bg-zinc-800">
                  Connect wallet
                </Dialog.Trigger>
              )}
            </div>

            <dl className="grid gap-2 text-sm leading-6 text-zinc-600">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-zinc-500">Chain</dt>
                <dd className="font-medium text-zinc-950">{wallet.chain.id}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-zinc-500">Installed</dt>
                <dd className="font-medium text-zinc-950">{wallet.connectableWallets.length}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-zinc-500">Available to install</dt>
                <dd className="font-medium text-zinc-950">{wallet.unavailableWallets.length}</dd>
              </div>
            </dl>
          </section>

          <section className="grid gap-3">
            {wallet.session ? (
              <ConnectedAccountPanel
                accountId={wallet.session.accountId}
                walletName={wallet.session.wallet.name}
              />
            ) : (
              <div className="grid gap-1 text-sm leading-6 text-zinc-600">
                <p>The dialog starts QR automatically.</p>
                <p>Installed extensions join the same connection attempt.</p>
              </div>
            )}
          </section>
        </div>
      </main>

      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 bg-zinc-950/40 backdrop-blur-sm" />
        <Dialog.Viewport className="fixed inset-0 overflow-y-auto p-4">
          <div className="mx-auto flex min-h-full max-w-2xl items-center">
            <Dialog.Popup className="w-full overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-2xl shadow-zinc-950/15">
              <div className="px-4 py-4">
                <Dialog.Title className="text-lg font-semibold tracking-tight text-zinc-950">
                  Connect wallet
                </Dialog.Title>
              </div>

              {wallet.error ? (
                <div className="px-4 pb-3">
                  <Banner value={wallet.error.message} />
                </div>
              ) : null}

              {!wallet.ready ? (
                <div className="px-4 pb-3">
                  <Banner value="Add VITE_WALLETCONNECT_PROJECT_ID to enable wallet connections." />
                </div>
              ) : null}

              <div className="grid gap-0 border-t border-zinc-200 lg:grid-cols-2">
                <section className="bg-white p-4">
                  <div className="space-y-2.5">
                    {wallet.connectableWallets.length > 0 ? (
                      wallet.connectableWallets.map((walletOption) => (
                        <button
                          className="flex w-full items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-3 text-left transition hover:border-zinc-950 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={!walletOption.canConnect}
                          key={walletOption.id}
                          onClick={() => {
                            void wallet.connectExtension(walletOption.id);
                          }}
                          type="button"
                        >
                          <div className="flex size-10 items-center justify-center rounded-lg border border-zinc-200 bg-white">
                            <img
                              alt={`${walletOption.name} icon`}
                              className="size-8 object-contain p-1"
                              src={walletOption.icon}
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium text-zinc-950">
                              {walletOption.name}
                            </div>
                          </div>
                        </button>
                      ))
                    ) : (
                      <EmptyState value="No installed extensions." />
                    )}
                  </div>

                  {wallet.unavailableWallets.length > 0 ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {wallet.unavailableWallets.map((walletOption) => (
                        <div
                          className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-2"
                          key={walletOption.id}
                        >
                          <img
                            alt={`${walletOption.name} icon`}
                            className="size-5 object-contain opacity-70"
                            src={walletOption.icon}
                          />

                          <div className="text-xs font-medium text-zinc-600">
                            {walletOption.name}
                          </div>

                          {walletOption.installUrl ? (
                            <a
                              className="inline-flex h-7 items-center justify-center rounded-md bg-zinc-900 px-2.5 text-xs font-medium text-white transition hover:bg-zinc-800"
                              href={walletOption.installUrl}
                              rel="noreferrer"
                              target="_blank"
                            >
                              Install
                            </a>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  ) : null}
                </section>

                <section className="border-t border-zinc-200 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-800 p-4 text-white lg:border-l lg:border-t-0">
                  <div className="flex h-full flex-col gap-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-medium text-zinc-100">Scan with phone</div>
                      {wallet.qr.uri || wallet.qr.pending ? (
                        <ConnectionBadge
                          tone="dark"
                          value={wallet.qr.uri ? "Ready" : "Generating"}
                        />
                      ) : null}
                    </div>

                    <div className="flex flex-1 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900 p-4">
                      {wallet.qr.uri ? (
                        <div className="rounded-xl bg-white p-3 shadow-lg shadow-zinc-950/30">
                          <QRCodeSVG
                            bgColor="#ffffff"
                            fgColor="#18181b"
                            level="M"
                            marginSize={4}
                            size={176}
                            title="WalletConnect QR"
                            value={wallet.qr.uri}
                          />
                        </div>
                      ) : (
                        <div className="flex size-44 items-center justify-center rounded-xl border border-dashed border-zinc-700 bg-zinc-950 px-5 text-center text-sm text-zinc-400">
                          {!wallet.ready
                            ? "WalletConnect disabled"
                            : wallet.qr.pending
                              ? "Generating QR..."
                              : "QR pending"}
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              </div>
            </Dialog.Popup>
          </div>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

interface ConnectionBadgeProps {
  readonly tone: "dark" | "light";
  readonly value: string;
}

function ConnectionBadge({ tone, value }: ConnectionBadgeProps): ReactNode {
  return (
    <div
      className={
        tone === "dark"
          ? "inline-flex h-7 items-center rounded-md border border-zinc-700 bg-zinc-900 px-2.5 text-xs font-medium text-zinc-200"
          : "inline-flex h-7 items-center rounded-md border border-zinc-300 bg-white px-2.5 text-xs font-medium text-zinc-700"
      }
    >
      {value}
    </div>
  );
}

interface BannerProps {
  readonly value: string;
}

function Banner({ value }: BannerProps): ReactNode {
  return (
    <div className="rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-700">
      {value}
    </div>
  );
}

interface EmptyStateProps {
  readonly value: string;
}

function EmptyState({ value }: EmptyStateProps): ReactNode {
  return (
    <div className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 px-3 py-6 text-sm text-zinc-500">
      {value}
    </div>
  );
}

interface ConnectedAccountPanelProps {
  readonly accountId: string;
  readonly walletName: string;
}

function ConnectedAccountPanel({ accountId, walletName }: ConnectedAccountPanelProps): ReactNode {
  const balance = useAccountBalances({ accountId });
  const info = useAccountInfo({ accountId });

  if (balance.isPending || info.isPending) {
    return <EmptyState value="Loading account details..." />;
  }

  if (balance.isError || info.isError) {
    return (
      <Banner
        value={balance.error?.message ?? info.error?.message ?? "Unable to load account details."}
      />
    );
  }

  const account = info.data?.success ? info.data.data : null;
  const accountBalance = balance.data?.success ? balance.data.data : null;
  const staking =
    account?.staked_account_id ??
    (account?.staked_node_id !== null && account?.staked_node_id !== undefined
      ? `Node ${account.staked_node_id}`
      : "Not staking");

  return (
    <div className="grid gap-3">
      <div className="grid gap-1">
        <p className="text-sm font-medium text-zinc-500">Connected wallet</p>
        <h2 className="text-xl font-semibold tracking-tight text-zinc-950">{walletName}</h2>
      </div>

      <dl className="grid gap-2 text-sm leading-6 text-zinc-600">
        <div className="grid gap-0.5">
          <dt className="text-zinc-500">Account ID</dt>
          <dd className="break-all font-medium text-zinc-950">
            {formatValue(account?.account, accountId)}
          </dd>
        </div>
        <div className="grid gap-0.5">
          <dt className="text-zinc-500">HBAR</dt>
          <dd className="font-medium text-zinc-950">
            {formatHbarBalance(accountBalance?.balance)}
          </dd>
        </div>
        <div className="grid gap-0.5">
          <dt className="text-zinc-500">Tokens</dt>
          <dd className="font-medium text-zinc-950">
            {formatValue(accountBalance?.tokens?.length ?? 0, "0")}
          </dd>
        </div>
        <div className="grid gap-0.5">
          <dt className="text-zinc-500">EVM address</dt>
          <dd className="break-all font-medium text-zinc-950">
            {formatValue(account?.evm_address, "Unavailable")}
          </dd>
        </div>
        <div className="grid gap-0.5">
          <dt className="text-zinc-500">Staking</dt>
          <dd className="font-medium text-zinc-950">{formatValue(staking, "Not staking")}</dd>
        </div>
      </dl>
    </div>
  );
}

export default App;
