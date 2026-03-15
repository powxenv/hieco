import { MirrorNodeClient } from "@hieco/mirror";
import { ConnectionPool } from "@hieco/realtime";
import { classifyError, createError, formatError, unwrap } from "@hieco/sdk/errors";
import { err, ok } from "@hieco/sdk/result";
import { hederaTestnet } from "@hieco/wallet/chains";
import { getConnectableWallets, getUnavailableWallets } from "@hieco/wallet/selectors";
import { createWalletInitialState, type WalletState } from "@hieco/wallet/state";
import { getDefaultWallets, hashpack, kabila } from "@hieco/wallet/wallets";
import { isValidEntityId } from "@hieco/utils/entity";
import { getNetworkUrl, getRequiredNetworkUrl } from "@hieco/utils/network";
import { createFileRoute } from "@tanstack/react-router";
import type { ReactElement } from "react";
import { useState } from "react";
import { createSeo } from "#/lib/seo";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";

type WalletScenario = "blank-project-id" | "configured-project-id" | "mixed-availability";
type SdkScenario = "retryable-network" | "config-error" | "unwrap-error";
type NetworkLookupScenario = "testnet" | "demo" | "missing";

type Detail = {
  readonly label: string;
  readonly value: string;
};

type RealtimeCheck = {
  readonly poolStates: string;
  readonly activeSubscriptions: string;
  readonly outcome: string;
};

type DirectRoute = {
  readonly href: string;
  readonly label: string;
  readonly description: string;
};

const directRoutes: readonly DirectRoute[] = [
  {
    href: "/",
    label: "Landing page",
    description: "Header navigation, hero content, and wallet connect entry point.",
  },
  {
    href: "/showcase",
    label: "Showcase index",
    description: "Search, filter controls, and unauthenticated submission guardrails.",
  },
  {
    href: "/testsprite-lab",
    label: "Package harness",
    description: "Deterministic public-package behaviors exposed for TestSprite validation.",
  },
  {
    href: "/showcase/not-a-real-project",
    label: "Showcase not-found path",
    description: "Regression check for missing project handling.",
  },
] as const;

const customNetworkUrls = {
  demo: "https://mirror.demo.hieco.local",
} as const;

function isWalletScenario(value: string): value is WalletScenario {
  return (
    value === "blank-project-id" ||
    value === "configured-project-id" ||
    value === "mixed-availability"
  );
}

function isSdkScenario(value: string): value is SdkScenario {
  return value === "retryable-network" || value === "config-error" || value === "unwrap-error";
}

export const Route = createFileRoute("/testsprite-lab")({
  head: () =>
    createSeo({
      title: "TestSprite Lab",
      description:
        "Internal QA harness for TestSprite coverage across apps/web and public Hieco package APIs.",
      path: "/testsprite-lab",
    }),
  component: RouteComponent,
});

function getWalletState(scenario: WalletScenario): WalletState {
  if (scenario === "blank-project-id") {
    return createWalletInitialState({
      chain: hederaTestnet(),
      projectId: "   ",
      wallets: getDefaultWallets(),
    });
  }

  if (scenario === "configured-project-id") {
    return createWalletInitialState({
      chain: hederaTestnet(),
      projectId: "demo-project-id",
      wallets: getDefaultWallets(),
    });
  }

  const installedWallet = hashpack();
  const unavailableWallet = kabila();

  return {
    chain: hederaTestnet(),
    walletConnectEnabled: true,
    wallets: [
      {
        id: installedWallet.id,
        name: installedWallet.name,
        icon: installedWallet.icon,
        availability: "installed",
        canConnect: true,
        installUrl: installedWallet.installUrl,
      },
      {
        id: unavailableWallet.id,
        name: unavailableWallet.name,
        icon: unavailableWallet.icon,
        availability: "unavailable",
        canConnect: false,
        installUrl: unavailableWallet.installUrl,
      },
    ],
    session: null,
    connection: null,
  };
}

function getWalletDetails(scenario: WalletScenario): readonly Detail[] {
  const state = getWalletState(scenario);
  const connectable = getConnectableWallets(state);
  const unavailable = getUnavailableWallets(state);

  return [
    {
      label: "WalletConnect enabled",
      value: String(state.walletConnectEnabled),
    },
    {
      label: "Visible wallet count",
      value: String(state.wallets.length),
    },
    {
      label: "Connectable wallets",
      value: connectable.map((wallet) => wallet.name).join(", ") || "None",
    },
    {
      label: "Unavailable wallets",
      value: unavailable.map((wallet) => wallet.name).join(", ") || "None",
    },
  ];
}

function getSdkDetails(scenario: SdkScenario): readonly Detail[] {
  if (scenario === "retryable-network") {
    const shape = createError("NETWORK_QUERY_FAILED", "Relay temporarily busy", {
      details: { status: "BUSY" },
      hint: "Retry with backoff",
    });
    const classification = classifyError(shape);

    return [
      { label: "Kind", value: classification.kind },
      { label: "Retryable", value: String(classification.retryable) },
      { label: "Status", value: classification.status ?? "None" },
      { label: "Formatted", value: formatError(shape) },
    ];
  }

  if (scenario === "config-error") {
    const shape = createError("CONFIG_INVALID_OPERATOR", "Invalid operator account id: not-an-id", {
      hint: "Use the format shard.realm.num",
    });
    const classification = classifyError(shape);

    return [
      { label: "Kind", value: classification.kind },
      { label: "Retryable", value: String(classification.retryable) },
      { label: "Hint", value: classification.hint ?? "None" },
      { label: "Formatted", value: formatError(shape) },
    ];
  }

  let thrownMessage = "No error";

  try {
    unwrap(
      err(
        createError("CONFIG_INVALID_OPERATOR", "Invalid operator account id: not-an-id", {
          hint: "Use the format shard.realm.num",
        }),
      ),
    );
  } catch (error) {
    thrownMessage = formatError(error);
  }

  return [
    { label: "Unwrap ok()", value: unwrap(ok("ready")) },
    { label: "Thrown message", value: thrownMessage },
    {
      label: "Classification",
      value: classifyError(createError("UNEXPECTED_ERROR", "Thrown")).kind,
    },
  ];
}

function getNetworkLookupDetails(scenario: NetworkLookupScenario): readonly Detail[] {
  const network = scenario === "demo" ? "demo" : scenario === "missing" ? "missing" : "testnet";
  const resolved = getNetworkUrl(network, customNetworkUrls);

  let required = "";

  try {
    required = getRequiredNetworkUrl(network, customNetworkUrls);
  } catch (error) {
    required = error instanceof Error ? error.message : "Unknown error";
  }

  return [
    { label: "Lookup target", value: network },
    { label: "Resolved URL", value: resolved ?? "Unavailable" },
    { label: "Required URL result", value: required },
  ];
}

function getMirrorClientDetails(customMirrorUrl: string): readonly Detail[] {
  const trimmedCustomMirrorUrl = customMirrorUrl.trim();
  const defaultClient = new MirrorNodeClient({ network: "testnet" });
  const overriddenClient = new MirrorNodeClient({
    network: "testnet",
    mirrorNodeUrl: trimmedCustomMirrorUrl,
  });

  return [
    { label: "Default base URL", value: defaultClient.baseUrl },
    { label: "Override base URL", value: overriddenClient.baseUrl },
    { label: "Network", value: overriddenClient.networkType },
  ];
}

function DetailList({ details }: { details: readonly Detail[] }): ReactElement {
  return (
    <dl className="grid gap-3 sm:grid-cols-2">
      {details.map((detail) => (
        <div key={detail.label} className="rounded-2xl border border-zinc-200 bg-white p-4">
          <dt className="text-sm font-medium text-zinc-500">{detail.label}</dt>
          <dd className="mt-2 text-sm text-zinc-900 break-words">{detail.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function ScenarioButtonGroup<T extends string>({
  currentValue,
  options,
  setValue,
}: {
  readonly currentValue: T;
  readonly options: readonly { label: string; value: T }[];
  readonly setValue: (value: T) => void;
}): ReactElement {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <Button
          key={option.value}
          onClick={() => setValue(option.value)}
          type="button"
          variant={option.value === currentValue ? "default" : "outline"}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}

function RouteComponent(): ReactElement {
  const [walletScenario, setWalletScenario] = useState<WalletScenario>("blank-project-id");
  const [sdkScenario, setSdkScenario] = useState<SdkScenario>("retryable-network");
  const [networkLookupScenario, setNetworkLookupScenario] =
    useState<NetworkLookupScenario>("testnet");
  const [entityIdInput, setEntityIdInput] = useState("0.0.123");
  const [customMirrorUrl, setCustomMirrorUrl] = useState("https://mirror.override.hieco.local");
  const [realtimeCheck, setRealtimeCheck] = useState<RealtimeCheck>({
    poolStates: "0",
    activeSubscriptions: "0",
    outcome: "Not run",
  });

  const entityVerdict = isValidEntityId(entityIdInput)
    ? "Valid Hedera entity ID"
    : "Invalid Hedera entity ID";

  const runRealtimeGuard = async () => {
    const pool = new ConnectionPool({
      endpoint: "wss://relay.testnet.hieco.invalid/ws",
      network: "testnet",
      poolSize: 2,
      strategy: "least-loaded",
    });
    const result = await pool.subscribe({ type: "logs", filter: {} }, () => undefined);

    setRealtimeCheck({
      poolStates: String(pool.getPoolState().length),
      activeSubscriptions: String(pool.getTotalActiveSubscriptions()),
      outcome: result.success
        ? `Unexpected success: ${result.data}`
        : `${result.error._tag}: ${result.error.message}`,
    });
  };

  return (
    <main className="min-h-lvh bg-zinc-50 py-28">
      <div className="inner space-y-10">
        <section className="space-y-4">
          <div className="inline-flex rounded-full border border-zinc-200 bg-white px-3 py-1 text-sm text-zinc-600">
            Internal QA surface
          </div>
          <div className="space-y-3">
            <h1 className="text-5xl font-semibold tracking-tight">TestSprite Lab</h1>
            <p className="max-w-3xl text-lg text-zinc-600">
              This page exposes deterministic public-package behavior so TestSprite can validate
              meaningful failure paths and integration boundaries without falling back to Jest,
              Vitest, or hand-written unit tests.
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Primary Routes</h2>
          <div className="grid gap-4 lg:grid-cols-2">
            {directRoutes.map((route) => (
              <div key={route.href} className="rounded-3xl border border-zinc-200 bg-white p-6">
                <div className="space-y-2">
                  <p className="text-sm text-zinc-500">{route.href}</p>
                  <h3 className="text-xl font-medium">{route.label}</h3>
                  <p className="text-sm text-zinc-600">{route.description}</p>
                </div>
                <Button className="mt-4" render={<a href={route.href} />}>
                  Open {route.label}
                </Button>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <article className="rounded-3xl border border-zinc-200 bg-white p-6 space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-zinc-500">@hieco/wallet</p>
              <h2 className="text-2xl font-semibold">Wallet State Scenarios</h2>
              <p className="text-sm text-zinc-600">
                Exercises public state helpers without requiring a real wallet extension or QR
                session.
              </p>
            </div>
            <label className="space-y-2 text-sm font-medium text-zinc-700">
              Scenario
              <select
                className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm"
                onChange={(event) => {
                  const nextValue = event.target.value;

                  if (isWalletScenario(nextValue)) {
                    setWalletScenario(nextValue);
                  }
                }}
                value={walletScenario}
              >
                <option value="blank-project-id">Blank project ID disables WalletConnect</option>
                <option value="configured-project-id">
                  Configured project ID enables WalletConnect
                </option>
                <option value="mixed-availability">Mixed installed and unavailable wallets</option>
              </select>
            </label>
            <DetailList details={getWalletDetails(walletScenario)} />
          </article>

          <article className="rounded-3xl border border-zinc-200 bg-white p-6 space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-zinc-500">@hieco/sdk</p>
              <h2 className="text-2xl font-semibold">Error And Result Handling</h2>
              <p className="text-sm text-zinc-600">
                Validates the public error classification and unwrap behavior that downstream apps
                depend on.
              </p>
            </div>
            <label className="space-y-2 text-sm font-medium text-zinc-700">
              Scenario
              <select
                className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm"
                onChange={(event) => {
                  const nextValue = event.target.value;

                  if (isSdkScenario(nextValue)) {
                    setSdkScenario(nextValue);
                  }
                }}
                value={sdkScenario}
              >
                <option value="retryable-network">Retryable network failure</option>
                <option value="config-error">Configuration validation failure</option>
                <option value="unwrap-error">unwrap() throws on err()</option>
              </select>
            </label>
            <DetailList details={getSdkDetails(sdkScenario)} />
          </article>

          <article className="rounded-3xl border border-zinc-200 bg-white p-6 space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-zinc-500">@hieco/utils</p>
              <h2 className="text-2xl font-semibold">Network And Entity Validation</h2>
              <p className="text-sm text-zinc-600">
                Covers entity ID validation and custom network lookup behavior that other packages
                build on.
              </p>
            </div>
            <label className="space-y-2 text-sm font-medium text-zinc-700">
              Entity ID
              <Input
                onChange={(event) => setEntityIdInput(event.target.value)}
                value={entityIdInput}
              />
            </label>
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
              <p className="text-sm text-zinc-500">Validation result</p>
              <p className="mt-2 text-sm font-medium text-zinc-900">{entityVerdict}</p>
            </div>
            <label className="space-y-2 text-sm font-medium text-zinc-700">
              <span className="block">Network lookup</span>
              <ScenarioButtonGroup
                currentValue={networkLookupScenario}
                options={[
                  { label: "Default testnet", value: "testnet" },
                  { label: "Configured custom network", value: "demo" },
                  { label: "Missing custom network", value: "missing" },
                ]}
                setValue={setNetworkLookupScenario}
              />
            </label>
            <DetailList details={getNetworkLookupDetails(networkLookupScenario)} />
          </article>

          <article className="rounded-3xl border border-zinc-200 bg-white p-6 space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-zinc-500">@hieco/mirror</p>
              <h2 className="text-2xl font-semibold">Mirror Client Configuration</h2>
              <p className="text-sm text-zinc-600">
                Asserts that the public client respects default and overridden base URLs without
                making a live network request.
              </p>
            </div>
            <label className="space-y-2 text-sm font-medium text-zinc-700">
              Override base URL
              <Input
                onChange={(event) => setCustomMirrorUrl(event.target.value)}
                value={customMirrorUrl}
              />
            </label>
            <DetailList details={getMirrorClientDetails(customMirrorUrl)} />
          </article>

          <article className="rounded-3xl border border-zinc-200 bg-white p-6 space-y-4 xl:col-span-2">
            <div className="space-y-2">
              <p className="text-sm text-zinc-500">@hieco/realtime</p>
              <h2 className="text-2xl font-semibold">Connection Guard</h2>
              <p className="text-sm text-zinc-600">
                Confirms that subscription attempts fail fast before a pool is connected, which is a
                regression-prone boundary for callers.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => void runRealtimeGuard()}>
                Run pre-connect subscribe check
              </Button>
            </div>
            <DetailList
              details={[
                { label: "Pool states before connect", value: realtimeCheck.poolStates },
                {
                  label: "Active subscriptions before connect",
                  value: realtimeCheck.activeSubscriptions,
                },
                { label: "Guard result", value: realtimeCheck.outcome },
              ]}
            />
          </article>
        </section>

        <section className="rounded-3xl border border-zinc-200 bg-white p-6 space-y-3">
          <h2 className="text-2xl font-semibold">Intentional TestSprite Limits</h2>
          <p className="text-sm text-zinc-600">
            This setup avoids fake confidence from brittle or low-value cases. Live wallet signing,
            Convex write flows, external Mirror Node responses, realtime socket servers, and thin
            framework-wrapper packages without a dedicated runtime harness should be validated with
            targeted manual review or future purpose-built integration surfaces instead of forcing
            TestSprite to guess.
          </p>
        </section>
      </div>
    </main>
  );
}
