import { Tabs } from "@base-ui/react/tabs";
import ShikiHighlighter from "react-shiki";
import mcpLogo from "../assets/tech-icons/mcp.svg";
import preactLogo from "../assets/tech-icons/preact.svg";
import reactLogo from "../assets/tech-icons/react.svg";
import solidLogo from "../assets/tech-icons/solid.svg";
import skillsLogo from "../assets/tech-icons/skills.png";
import typescriptLogo from "../assets/tech-icons/ts.svg";

type Sample = {
  readonly value: string;
  readonly fileName: string;
  readonly language: "typescript" | "tsx" | "bash" | "json";
  readonly icon?: string;
  readonly code: string;
};

type Section = {
  readonly value: string;
  readonly label: string;
  readonly samples: readonly Sample[];
};

const sections: readonly Section[] = [
  {
    value: "hedera-sdk",
    label: "Hedera SDK",
    samples: [
      {
        value: "typescript",
        fileName: "send.ts",
        language: "typescript",
        icon: typescriptLogo.src,
        code: `import { hieco } from "@hieco/sdk";

const client = hieco.forTestnet();

const receipt = await client.account.send({
  to: "0.0.2002",
  hbar: 1,
}).now();

console.log(receipt);`,
      },
      {
        value: "react",
        fileName: "send-button.tsx",
        language: "tsx",
        icon: reactLogo.src,
        code: `import { useAccountSend } from "@hieco/react";

function SendButton() {
  const send = useAccountSend();

  return (
    <button
      disabled={send.isPending}
      onClick={() => send.mutate({ to: "0.0.2002", hbar: 1 })}
    >
      Send 1 HBAR instantly
    </button>
  );
}`,
      },
    ],
  },
  {
    value: "mirror-sdk",
    label: "Mirror SDK",
    samples: [
      {
        value: "typescript",
        fileName: "account.ts",
        language: "typescript",
        icon: typescriptLogo.src,
        code: `import { MirrorNodeClient } from "@hieco/mirror";

const client = new MirrorNodeClient({ network: "testnet" });

const account = await client.account.getInfo("0.0.1001");

if (account.success) {
  console.log(account.data);
}`,
      },
      {
        value: "react",
        fileName: "account-name.tsx",
        language: "tsx",
        icon: reactLogo.src,
        code: `import { useAccountInfo } from "@hieco/mirror-react";

function AccountName() {
  const account = useAccountInfo({ accountId: "0.0.1001" });

  if (account.isPending) return <div>Loading account...</div>;

  return <div>{account.data?.success ? account.data.data.account : "Account not found"}</div>;
}`,
      },
      {
        value: "preact",
        fileName: "account-name.tsx",
        language: "tsx",
        icon: preactLogo.src,
        code: `import { useAccountInfo } from "@hieco/mirror-preact";

function AccountName() {
  const account = useAccountInfo({ accountId: "0.0.1001" });

  if (account.isPending) return <div>Loading account...</div>;

  return <div>{account.data?.success ? account.data.data.account : "Account not found"}</div>;
}`,
      },
      {
        value: "solid",
        fileName: "account-name.tsx",
        language: "tsx",
        icon: solidLogo.src,
        code: `import type { JSX } from "solid-js";
import { createAccountInfo } from "@hieco/mirror-solid";

function AccountName(): JSX.Element {
  const account = createAccountInfo(() => ({ accountId: "0.0.1001" }));

  return (
    <div>
      {account.data?.success ? account.data.data.account : "Loading account..."}
    </div>
  );
}`,
      },
      {
        value: "cli",
        fileName: "terminal.sh",
        language: "bash",
        icon: typescriptLogo.src,
        code: `npx @hieco/mirror-cli account 0.0.1001
npx @hieco/mirror-cli balance 0.0.1001
npx @hieco/mirror-cli transactions:list --account 0.0.1001 --limit 10
npx @hieco/mirror-cli topic:messages 0.0.3003 --encoding utf-8`,
      },
    ],
  },
  {
    value: "realtime-sdk",
    label: "Realtime SDK",
    samples: [
      {
        value: "typescript",
        fileName: "subscribe.ts",
        language: "typescript",
        icon: typescriptLogo.src,
        code: `import { RelayWebSocketClient } from "@hieco/realtime";

const client = new RelayWebSocketClient({
  network: "testnet",
  endpoint: "wss://testnet.mirrornode.hedera.com/relay/ws",
});

await client.connect();

await client.subscribe({ type: "newHeads", filter: {} }, (message) => {
  console.log(message.result.number);
});`,
      },
      {
        value: "react",
        fileName: "live-logs.tsx",
        language: "tsx",
        icon: reactLogo.src,
        code: `import { useContractLogs, useStreamState } from "@hieco/realtime-react";

function LiveLogs() {
  const state = useStreamState();
  const { logs } = useContractLogs({
    address: "0x0000000000000000000000000000000000001389",
    enabled: state._tag === "Connected",
  });

  return <div>{logs.length} logs streaming live</div>;
}`,
      },
    ],
  },
  {
    value: "wallet-sdk",
    label: "Wallet SDK",
    samples: [
      {
        value: "typescript",
        fileName: "connect.ts",
        language: "typescript",
        icon: typescriptLogo.src,
        code: `import { createWallet } from "@hieco/wallet";

const wallet = createWallet({
  projectId: "YOUR_WALLETCONNECT_PROJECT_ID",
  app: {
    name: "Hieco Starter",
    description: "Fast wallet flows for Hedera apps",
    url: "https://example.com",
    icons: ["https://example.com/icon.png"],
  },
});

await wallet.connect({ wallet: "hashpack" });

console.log(wallet.snapshot().account?.accountId);`,
      },
      {
        value: "react",
        fileName: "connect-button.tsx",
        language: "tsx",
        icon: reactLogo.src,
        code: `import { useWallet } from "@hieco/wallet-react";

function ConnectButton() {
  const { account, connect } = useWallet();

  return (
    <button onClick={() => void connect({ wallet: "hashpack" })}>
      {account?.accountId ?? "Connect with HashPack"}
    </button>
  );
}`,
      },
    ],
  },
  {
    value: "ai-boost",
    label: "AI Boost",
    samples: [
      {
        value: "agent-skills",
        fileName: "Agent Skills",
        language: "bash",
        icon: skillsLogo.src,
        code: `npx flins add powxenv/hieco
npx flins add powxenv/hieco --skill hieco-sdk
npx flins add powxenv/hieco --skill hieco-wallet
npx flins add powxenv/hieco --skill hieco-mirror
npx flins add powxenv/hieco --skill hieco-realtime
npx flins add powxenv/hieco --skill hieco-mirror-cli`,
      },
      {
        value: "claude-code",
        fileName: "Claude Code",
        language: "bash",
        icon: mcpLogo.src,
        code: `claude mcp add --transport stdio \\
  --env MIRROR_NETWORK=testnet \\
  --env MIRROR_ALLOW_NETWORK_SWITCH=true \\
  hedera-mirror -- \\
  npx -y @hieco/mirror-mcp`,
      },
      {
        value: "codex",
        fileName: "Codex",
        language: "bash",
        icon: mcpLogo.src,
        code: `codex mcp add \\
  --env MIRROR_NETWORK=testnet \\
  --env MIRROR_ALLOW_NETWORK_SWITCH=true \\
  hedera-mirror -- \\
  npx -y @hieco/mirror-mcp`,
      },
      {
        value: "github-copilot",
        fileName: "GitHub Copilot",
        language: "json",
        icon: mcpLogo.src,
        code: `{
  "servers": {
    "hedera-mirror": {
      "command": "npx",
      "args": ["-y", "@hieco/mirror-mcp"],
      "env": {
        "MIRROR_NETWORK": "testnet",
        "MIRROR_ALLOW_NETWORK_SWITCH": "true"
      }
    }
  }
}`,
      },
      {
        value: "opencode",
        fileName: "OpenCode",
        language: "json",
        icon: mcpLogo.src,
        code: `{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "hedera-mirror": {
      "type": "local",
      "enabled": true,
      "command": ["npx", "-y", "@hieco/mirror-mcp"],
      "environment": {
        "MIRROR_NETWORK": "testnet",
        "MIRROR_ALLOW_NETWORK_SWITCH": "true"
      }
    }
  }
}`,
      },
      {
        value: "other-agents",
        fileName: "Other Agents",
        language: "json",
        icon: mcpLogo.src,
        code: `{
  "mcpServers": {
    "hedera-mirror": {
      "command": "npx",
      "args": ["-y", "@hieco/mirror-mcp"],
      "env": {
        "MIRROR_NETWORK": "testnet",
        "MIRROR_ALLOW_NETWORK_SWITCH": "true"
      }
    }
  }
}`,
      },
    ],
  },
];

const DemoTabs = () => {
  return (
    <div className="mt-10">
      <Tabs.Root defaultValue={sections[0]?.value} className="flex flex-col">
        <Tabs.List className="bg-white p-1 z-0 flex overflow-x-auto ring-4 ring-white/50 items-center rounded-t-xl max-w-full relative ms-auto">
          {sections.map((section) => (
            <Tabs.Tab
              key={section.value}
              className="inline-flex items-center h-10 px-4 transition-all text-zinc-600 hover:text-zinc-800 cursor-pointer duration-300 data-active:text-white"
              value={section.value}
            >
              {section.label}
            </Tabs.Tab>
          ))}
          <Tabs.Indicator className="absolute top-1/2 left-0 z-[-1] h-10 w-(--active-tab-width) translate-x-(--active-tab-left) -translate-y-1/2 rounded-lg bg-zinc-800 transition-all duration-300" />
        </Tabs.List>
        {sections.map((section) => (
          <Tabs.Panel key={section.value} value={section.value}>
            <div className="bg-white h-[50lvh] border shadow-2xl shadow-black/30 border-zinc-200 rounded-tl-xl ring-4 ring-white/50 overflow-hidden">
              {section.samples.length === 1 ? (
                <div className="h-full overflow-auto bg-white">
                  <ShikiHighlighter
                    language={section.samples[0]?.language ?? "bash"}
                    theme="github-light"
                  >
                    {section.samples[0]?.code ?? ""}
                  </ShikiHighlighter>
                </div>
              ) : (
                <Tabs.Root
                  defaultValue={section.samples[0]?.value}
                  className="flex h-full flex-col"
                >
                  <Tabs.List className="relative z-0 flex overflow-x-auto bg-zinc-100">
                    {section.samples.map((sample) => (
                      <Tabs.Tab
                        key={sample.value}
                        className="h-10 px-3 flex items-center gap-2 border-r border-zinc-300 border-b data-active:border-b-0 transition-all duration-200 text-sm text-zinc-700"
                        value={sample.value}
                      >
                        {sample.icon ? (
                          <img
                            className="size-5 rounded-md"
                            src={sample.icon}
                            alt=""
                          />
                        ) : null}
                        {sample.fileName}
                      </Tabs.Tab>
                    ))}
                    <Tabs.Indicator className="absolute top-1/2 left-0 z-[-1] h-10 w-(--active-tab-width) translate-x-(--active-tab-left) -translate-y-1/2 rounded-sm bg-white transition-all duration-200 ease-in-out" />
                  </Tabs.List>
                  {section.samples.map((sample) => (
                    <Tabs.Panel
                      key={sample.value}
                      value={sample.value}
                      className="h-[calc(50lvh-2.5rem)] overflow-auto bg-white"
                    >
                      <ShikiHighlighter
                        language={sample.language}
                        theme="github-light"
                      >
                        {sample.code}
                      </ShikiHighlighter>
                    </Tabs.Panel>
                  ))}
                </Tabs.Root>
              )}
            </div>
          </Tabs.Panel>
        ))}
      </Tabs.Root>
    </div>
  );
};

export default DemoTabs;
