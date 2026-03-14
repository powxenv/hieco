import { useEffect, useState, type ReactNode } from "react";
import { Badge, Banner, Button, Dialog, LinkButton, Text } from "@cloudflare/kumo";
import { useAccountBalances, useAccountInfo } from "@hieco/mirror-react";
import { useWallet } from "@hieco/wallet-react";
import { QRCodeSVG } from "qrcode.react";

type InstalledWalletOption = ReturnType<typeof useWallet>["connectableWallets"][number];
type DiscoverableWalletOption = ReturnType<typeof useWallet>["unavailableWallets"][number];

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

  const qrStatus = !wallet.ready
    ? "Needs project ID"
    : wallet.qr.uri
      ? "Ready"
      : wallet.qr.pending
        ? "Generating"
        : "Waiting";

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);

        if (!nextOpen) {
          wallet.close();
          return;
        }

        void wallet.open();
      }}
    >
      <main className="min-h-screen bg-kumo-base px-4 py-10 text-kumo-default sm:px-6">
        <div className="mx-auto max-w-3xl">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-kumo-line pb-4">
            <div className="space-y-1">
              <Text as="h1" variant="heading2">
                Wallet
              </Text>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{wallet.chain.id}</Badge>
                <Badge variant={wallet.session ? "success" : "secondary"}>
                  {wallet.session ? wallet.session.wallet.name : qrStatus}
                </Badge>
                <Badge variant="secondary">{wallet.connectableWallets.length} installed</Badge>
              </div>
            </div>

            {wallet.session ? (
              <Button
                onClick={() => {
                  void wallet.disconnect();
                }}
                variant="secondary"
              >
                Disconnect
              </Button>
            ) : (
              <Dialog.Trigger
                render={(props) => (
                  <Button {...props} variant="primary">
                    Connect
                  </Button>
                )}
              />
            )}
          </div>

          <div className="py-5">
            {wallet.session ? (
              <ConnectedAccountPanel
                accountId={wallet.session.accountId}
                walletName={wallet.session.wallet.name}
              />
            ) : (
              <Text as="p" size="sm" variant="secondary">
                Open the dialog to connect.
              </Text>
            )}
          </div>
        </div>
      </main>

      <Dialog className="space-y-5 p-5 sm:p-6" size="lg">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1">
            <Dialog.Title>Connect wallet</Dialog.Title>
            <Dialog.Description>Extension or QR.</Dialog.Description>
          </div>

          <Dialog.Close
            render={(props) => (
              <Button {...props} aria-label="Close dialog" shape="square" size="sm" variant="ghost">
                X
              </Button>
            )}
          />
        </div>

        {wallet.error ? (
          <Banner
            description={
              wallet.qr.expired
                ? "The QR expired. Create a new one to continue."
                : wallet.error.message
            }
            title="Connection failed"
            variant="error"
          />
        ) : null}

        {!wallet.ready ? (
          <Banner
            description="Set VITE_WALLETCONNECT_PROJECT_ID."
            title="WalletConnect disabled"
            variant="alert"
          />
        ) : null}

        <div className="grid gap-5 lg:grid-cols-[1fr,220px]">
          <section className="space-y-4">
            <div className="space-y-2 border-b border-kumo-line pb-4">
              <div className="flex items-center justify-between gap-3">
                <Text as="h2" variant="heading3">
                  Installed
                </Text>
                <Badge variant="secondary">{wallet.connectableWallets.length}</Badge>
              </div>

              {wallet.connectableWallets.length > 0 ? (
                <div className="divide-y divide-kumo-line">
                  {wallet.connectableWallets.map((walletOption) => (
                    <InstalledWalletRow
                      key={walletOption.id}
                      onConnect={() => {
                        void wallet.connectExtension(walletOption.id);
                      }}
                      walletOption={walletOption}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState value="No extension found." />
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <Text as="h2" variant="heading3">
                  Install
                </Text>
                <Badge variant="secondary">{wallet.unavailableWallets.length}</Badge>
              </div>

              {wallet.unavailableWallets.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {wallet.unavailableWallets.map((walletOption) => (
                    <InstallWalletRow key={walletOption.id} walletOption={walletOption} />
                  ))}
                </div>
              ) : (
                <EmptyState value="No install links." />
              )}
            </div>
          </section>

          <section className="space-y-3 border-t border-kumo-line pt-5 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
            <div className="flex items-center justify-between gap-3">
              <Text as="h2" variant="heading3">
                QR
              </Text>
              <div className="flex items-center gap-2">
                <Badge variant={wallet.qr.uri ? "success" : "secondary"}>{qrStatus}</Badge>
                {wallet.ready && !wallet.session ? (
                  <Button
                    onClick={() => {
                      void wallet.reload();
                    }}
                    size="sm"
                    variant={wallet.qr.expired ? "primary" : "secondary"}
                  >
                    {wallet.qr.expired ? "Recreate QR" : "Reload"}
                  </Button>
                ) : null}
              </div>
            </div>

            <div className="flex min-h-56 items-center justify-center">
              {wallet.qr.uri ? (
                <div className="rounded-lg bg-white p-3">
                  <QRCodeSVG
                    bgColor="#ffffff"
                    fgColor="#111827"
                    level="M"
                    marginSize={3}
                    size={176}
                    title="WalletConnect QR"
                    value={wallet.qr.uri}
                  />
                </div>
              ) : (
                <Text as="p" size="sm" variant="secondary">
                  {!wallet.ready
                    ? "Disabled"
                    : wallet.qr.pending
                      ? "Generating QR..."
                      : "Waiting..."}
                </Text>
              )}
            </div>
          </section>
        </div>
      </Dialog>
    </Dialog.Root>
  );
}

interface InstalledWalletRowProps {
  readonly onConnect: () => void;
  readonly walletOption: InstalledWalletOption;
}

function InstalledWalletRow({ onConnect, walletOption }: InstalledWalletRowProps): ReactNode {
  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <img
          alt={`${walletOption.name} icon`}
          className="h-8 w-8 rounded-md"
          src={walletOption.icon}
        />
        <div className="min-w-0">
          <Text as="p" bold>
            {walletOption.name}
          </Text>
        </div>
      </div>

      <Button disabled={!walletOption.canConnect} onClick={onConnect} size="sm" variant="primary">
        Connect
      </Button>
    </div>
  );
}

interface InstallWalletRowProps {
  readonly walletOption: DiscoverableWalletOption;
}

function InstallWalletRow({ walletOption }: InstallWalletRowProps): ReactNode {
  if (!walletOption.installUrl) {
    return <Badge variant="secondary">{walletOption.name}</Badge>;
  }

  return (
    <LinkButton external href={walletOption.installUrl} size="sm" variant="secondary">
      {walletOption.name}
    </LinkButton>
  );
}

interface EmptyStateProps {
  readonly value: string;
}

function EmptyState({ value }: EmptyStateProps): ReactNode {
  return (
    <Text as="p" size="sm" variant="secondary">
      {value}
    </Text>
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
    return <EmptyState value="Loading..." />;
  }

  if (balance.isError || info.isError) {
    return (
      <Banner
        description={
          balance.error?.message ?? info.error?.message ?? "Unable to load account details."
        }
        title="Account lookup failed"
        variant="error"
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
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="success">{walletName}</Badge>
        <Badge variant="outline">{accountId}</Badge>
      </div>

      <dl className="divide-y divide-kumo-line border-t border-kumo-line">
        <AccountDetail label="HBAR" value={formatHbarBalance(accountBalance?.balance)} />
        <AccountDetail
          label="Tokens"
          value={formatValue(accountBalance?.tokens?.length ?? 0, "0")}
        />
        <AccountDetail
          label="EVM"
          value={formatValue(account?.evm_address, "Unavailable")}
          wrap="break-all"
        />
        <AccountDetail label="Staking" value={formatValue(staking, "Not staking")} />
      </dl>
    </div>
  );
}

interface AccountDetailProps {
  readonly label: string;
  readonly value: string;
  readonly wrap?: "break-all";
}

function AccountDetail({ label, value, wrap }: AccountDetailProps): ReactNode {
  return (
    <div className="grid grid-cols-[72px,1fr] gap-3 py-3">
      <Text as="dt" size="sm" variant="secondary">
        {label}
      </Text>
      <Text DANGEROUS_className={wrap === "break-all" ? "break-all" : undefined} as="dd" bold>
        {value}
      </Text>
    </div>
  );
}

export default App;
