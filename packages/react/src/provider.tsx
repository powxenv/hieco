import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
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

export interface HiecoController {
  readonly config: HiecoProviderConfig;
  readonly signer?: Signer;
  readonly setSigner: Dispatch<SetStateAction<Signer | undefined>>;
  readonly clearSigner: () => void;
  readonly setConfig: Dispatch<SetStateAction<HiecoProviderConfig>>;
  readonly updateConfig: (patch: Partial<HiecoProviderConfig>) => void;
  readonly setNetwork: (network: NonNullable<HiecoProviderConfig["network"]>) => void;
  readonly setMirrorNetwork: (mirror: string | ReadonlyArray<string>) => void;
  readonly setMaxAttempts: (value: number) => void;
  readonly setMaxNodeAttempts: (value: number) => void;
  readonly setRequestTimeout: (value: number) => void;
  readonly setGrpcDeadline: (value: number) => void;
  readonly setMinBackoff: (value: number) => void;
  readonly setMaxBackoff: (value: number) => void;
}

export interface HiecoContextValue {
  readonly client: HiecoClient;
  readonly clientKey: string;
  readonly session: HiecoSession;
  readonly controller: HiecoController;
}

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

  const needsQueryClientProvider =
    queryClient === undefined
      ? inheritedQueryClient === undefined
      : queryClient !== inheritedQueryClient;

  const content = dehydratedState ? (
    <HydrationBoundary state={dehydratedState}>{children}</HydrationBoundary>
  ) : (
    children
  );

  if (!needsQueryClientProvider) {
    return content;
  }

  return <QueryClientProvider client={activeQueryClient}>{content}</QueryClientProvider>;
}

function HiecoRuntimeProvider({
  children,
  config: initialConfig,
  signer: initialSigner,
}: Omit<HiecoProviderProps, keyof HiecoQueryLayerOptions>): ReactNode {
  const safeInitialConfig = validateProviderConfig(initialConfig);
  const [config, setConfig] = useState<HiecoProviderConfig>(safeInitialConfig ?? {});
  const [signer, setSigner] = useState<Signer | undefined>(initialSigner);

  useEffect(() => {
    const nextConfig = validateProviderConfig(initialConfig) ?? {};
    setConfig((current) => (areProviderConfigsEqual(current, nextConfig) ? current : nextConfig));
  }, [initialConfig]);

  useEffect(() => {
    setSigner((current) => (current === initialSigner ? current : initialSigner));
  }, [initialSigner]);

  const baseClient = useMemo(() => hieco(config), [config]);

  useEffect(() => () => baseClient.destroy(), [baseClient]);

  const session = useMemo(() => createHiecoSession(signer), [signer]);
  const client = useMemo(() => (signer ? baseClient.as(signer) : baseClient), [baseClient, signer]);

  useEffect(() => {
    if (client === baseClient) {
      return;
    }

    return () => client.destroy();
  }, [baseClient, client]);

  const baseClientKeyRef = useRef({ client: baseClient, key: 0 });
  if (baseClientKeyRef.current.client !== baseClient) {
    baseClientKeyRef.current = {
      client: baseClient,
      key: baseClientKeyRef.current.key + 1,
    };
  }

  const controller = useMemo<HiecoController>(
    () => ({
      config,
      ...(signer ? { signer } : {}),
      setSigner,
      clearSigner: () => setSigner(undefined),
      setConfig,
      updateConfig: (patch) => setConfig((current) => ({ ...current, ...patch })),
      setNetwork: (network) => setConfig((current) => ({ ...current, network })),
      setMirrorNetwork: (mirror) =>
        setConfig((current) => ({
          ...current,
          mirrorUrl: typeof mirror === "string" ? mirror : mirror[0],
        })),
      setMaxAttempts: (value) => setConfig((current) => ({ ...current, maxAttempts: value })),
      setMaxNodeAttempts: (value) =>
        setConfig((current) => ({ ...current, maxNodeAttempts: value })),
      setRequestTimeout: (value) =>
        setConfig((current) => ({ ...current, requestTimeoutMs: value })),
      setGrpcDeadline: (value) => setConfig((current) => ({ ...current, grpcDeadlineMs: value })),
      setMinBackoff: (value) => setConfig((current) => ({ ...current, minBackoffMs: value })),
      setMaxBackoff: (value) => setConfig((current) => ({ ...current, maxBackoffMs: value })),
    }),
    [config, signer],
  );

  const value = useMemo<HiecoContextValue>(
    () => ({
      client,
      clientKey: `${baseClientKeyRef.current.key}:${createHiecoSessionKey(session)}`,
      session,
      controller,
    }),
    [client, controller, session],
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
