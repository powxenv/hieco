import type { QueryClient } from "@tanstack/react-query";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { HeadContent, Scripts, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import type { ReactNode } from "react";
import ConvexProvider from "../integrations/convex/provider";
import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";
import TanStackQueryProvider from "../integrations/tanstack-query/root-provider";
import appCss from "../styles.css?url";
import { hederaMainnet, hederaPreviewnet, hederaTestnet, hashpack, kabila } from "@hieco/wallet";
import { WalletProvider } from "@hieco/wallet-react";
import { env } from "#/env";
import { TooltipProvider } from "@/components/ui/tooltip";
import Header from "#/components/header";

interface MyRouterContext {
  queryClient: QueryClient;
}

// const THEME_INIT_SCRIPT = `const theme = localStorage.getItem('theme') || 'system';const prefers_dark = window.matchMedia('(prefers-color-scheme: dark)').matches;if (theme === 'dark' || (theme === 'system' && prefers_dark)) {document.documentElement.classList.add('dark');}`;

function getConfiguredChain() {
  if (env.VITE_HEDERA_NETWORK === "mainnet") {
    return hederaMainnet();
  }

  if (env.VITE_HEDERA_NETWORK === "previewnet") {
    return hederaPreviewnet();
  }

  return hederaTestnet();
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        name: "theme-color",
        content: "#000000",
      },
      {
        name: "msapplication-TileColor",
        content: "#000000",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "icon",
        type: "image/svg+xml",
        href: "/favicon.svg",
      },
      {
        rel: "icon",
        href: "/favicon.ico",
      },
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: "/apple-touch-icon.png",
      },
      {
        rel: "manifest",
        href: "/manifest.json",
      },
    ],
  }),
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: ReactNode }): ReactNode {
  return (
    <html lang="en" suppressHydrationWarning className="light">
      <head>
        {/* <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} /> */}
        <HeadContent />
      </head>
      <body>
        <ConvexProvider>
          <TanStackQueryProvider>
            <WalletProvider
              app={{
                name: "Hieco Wallet Example",
                description: "Hieco Connect",
                url: env.VITE_APP_URL,
                icons: [new URL("/wallet-icon.svg", env.VITE_APP_URL).toString()],
              }}
              chain={getConfiguredChain()}
              projectId={env.VITE_WALLETCONNECT_PROJECT_ID}
              restoreOnStart
              wallets={[hashpack(), kabila()]}
            >
              <TooltipProvider>
                <Header />
                {children}
              </TooltipProvider>
            </WalletProvider>

            <TanStackDevtools
              config={{
                position: "bottom-right",
              }}
              plugins={[
                {
                  name: "Tanstack Router",
                  render: <TanStackRouterDevtoolsPanel />,
                },
                TanStackQueryDevtools,
              ]}
            />
          </TanStackQueryProvider>
        </ConvexProvider>
        <Scripts />
      </body>
    </html>
  );
}
