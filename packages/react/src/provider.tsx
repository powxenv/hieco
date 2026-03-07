import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { hieco, type ClientConfig, type HiecoClient, type Signer } from "@hieco/sdk";
import {
  HydrationBoundary,
  QueryClient,
  QueryClientContext,
  QueryClientProvider,
  type DehydratedState,
} from "@tanstack/react-query";
import { createHiecoSession, createHiecoSessionKey, type HiecoSession } from "./internal/session";

export type HiecoQueryClientConfig = ConstructorParameters<typeof QueryClient>[0];

export type HiecoProviderConfig = Omit<ClientConfig, "key" | "operator" | "signer">;

export interface HiecoQueryLayerOptions {
  readonly queryClient?: QueryClient;
  readonly queryClientConfig?: HiecoQueryClientConfig;
  readonly dehydratedState?: DehydratedState;
}

export type HiecoProviderProps = {
  readonly children: ReactNode;
  readonly config?: HiecoProviderConfig;
  readonly signer?: Signer;
} & HiecoQueryLayerOptions;

export interface HiecoContextValue {
  readonly client: HiecoClient;
  readonly clientKey: string;
  readonly config: HiecoProviderConfig;
  readonly session: HiecoSession;
}

const EMPTY_PROVIDER_CONFIG: HiecoProviderConfig = {};

const invalidProviderConfigError = new Error(
  "HiecoProvider only accepts public client config. Pass signer via the signer prop and keep operator credentials in server-only @hieco/sdk code.",
);

export const HiecoContext = createContext<HiecoContextValue | null>(null);

function areProviderConfigsEqual(
  left: HiecoProviderConfig | undefined,
  right: HiecoProviderConfig | undefined,
): boolean {
  if (left === right) {
    return true;
  }

  if (!left || !right) {
    return left === right;
  }

  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);

  if (leftKeys.length !== rightKeys.length) {
    return false;
  }

  for (const key of leftKeys) {
    const typedKey = key as keyof HiecoProviderConfig;
    if (left[typedKey] !== right[typedKey]) {
      return false;
    }
  }

  return true;
}

function validateProviderConfig(
  config: HiecoProviderConfig | undefined,
): HiecoProviderConfig | undefined {
  if (!config) {
    return undefined;
  }

  if ("key" in config || "operator" in config || "signer" in config) {
    throw invalidProviderConfigError;
  }

  return config;
}

function shouldProvideQueryClient(
  queryClient: QueryClient | undefined,
  inheritedQueryClient: QueryClient | undefined,
): boolean {
  if (queryClient === undefined) {
    return inheritedQueryClient === undefined;
  }

  return queryClient !== inheritedQueryClient;
}

function HiecoQueryLayer({
  children,
  queryClient,
  queryClientConfig,
  dehydratedState,
}: {
  readonly children: ReactNode;
} & HiecoQueryLayerOptions): ReactNode {
  const inheritedQueryClient = useContext(QueryClientContext);
  const [ownedQueryClient] = useState<QueryClient | undefined>(() =>
    queryClient || inheritedQueryClient ? undefined : new QueryClient(queryClientConfig),
  );
  const activeQueryClient = queryClient ?? inheritedQueryClient ?? ownedQueryClient;

  if (!activeQueryClient) {
    throw new Error("HiecoProvider could not resolve a QueryClient.");
  }

  const content = dehydratedState ? (
    <HydrationBoundary state={dehydratedState}>{children}</HydrationBoundary>
  ) : (
    children
  );

  if (!shouldProvideQueryClient(queryClient, inheritedQueryClient)) {
    return content;
  }

  return <QueryClientProvider client={activeQueryClient}>{content}</QueryClientProvider>;
}

function HiecoRuntimeProvider({
  children,
  config: rawConfig,
  signer,
}: Omit<HiecoProviderProps, keyof HiecoQueryLayerOptions>): ReactNode {
  const nextConfig = validateProviderConfig(rawConfig) ?? EMPTY_PROVIDER_CONFIG;
  const configRef = useRef(nextConfig);

  if (!areProviderConfigsEqual(configRef.current, nextConfig)) {
    configRef.current = nextConfig;
  }

  const config = configRef.current;
  const baseClient = useMemo(() => hieco(config), [config]);

  useEffect(() => {
    return () => {
      baseClient.destroy();
    };
  }, [baseClient]);

  const session = useMemo(() => createHiecoSession(signer), [signer]);
  const client = useMemo(() => (signer ? baseClient.as(signer) : baseClient), [baseClient, signer]);

  useEffect(() => {
    if (client === baseClient) {
      return;
    }

    return () => {
      client.destroy();
    };
  }, [baseClient, client]);

  const baseClientKeyRef = useRef({ client: baseClient, key: 0 });
  if (baseClientKeyRef.current.client !== baseClient) {
    baseClientKeyRef.current = {
      client: baseClient,
      key: baseClientKeyRef.current.key + 1,
    };
  }

  const value = useMemo<HiecoContextValue>(
    () => ({
      client,
      clientKey: `${baseClientKeyRef.current.key}:${createHiecoSessionKey(session)}`,
      config,
      session,
    }),
    [client, config, session],
  );

  return <HiecoContext.Provider value={value}>{children}</HiecoContext.Provider>;
}

export function HiecoProvider(props: HiecoProviderProps): ReactNode {
  const { children, config, dehydratedState, queryClient, queryClientConfig, signer } = props;

  return (
    <HiecoQueryLayer
      dehydratedState={dehydratedState}
      queryClient={queryClient}
      queryClientConfig={queryClientConfig}
    >
      <HiecoRuntimeProvider config={config} signer={signer}>
        {children}
      </HiecoRuntimeProvider>
    </HiecoQueryLayer>
  );
}
