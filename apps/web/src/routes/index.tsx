import { createFileRoute } from "@tanstack/react-router";
import type { ReactElement } from "react";
import Button from "../components/ui/button";
import DemoTabs from "../components/demo-tabs";
import logo from "../assets/logo-white.svg";
import preactLogo from "../assets/tech-icons/preact.svg";
import reactLogo from "../assets/tech-icons/react.svg";
import solidLogo from "../assets/tech-icons/solid.svg";
import typescriptLogo from "../assets/tech-icons/ts.svg";
import heroImg from "../assets/hero.jpeg";
import SolarArrowRightLineDuotone from "~icons/solar/arrow-right-line-duotone";
import ConnectDialog from "../components/connect-dialog";

export const Route = createFileRoute("/")({
  component: App,
});

function App(): ReactElement {
  return (
    <>
      <header className="fixed top-4 left-1/2 -translate-x-1/2 z-10">
        <div className="flex gap-12 bg-zinc-800 h-14 items-center pl-5 pr-2 ring-4 ring-white/20 rounded-xl shadow-2xl shadow-black/6">
          <a href="" className="flex items-center gap-2 text-white text-xl">
            <img className="size-6" src={logo} alt="Hieco Logo" />
            Hieco
          </a>
          <nav className="flex gap-6">
            <a
              className="text-zinc-200 whitespace-nowrap hover:underline decoration-wavy hover:text-white transition-all"
              href="/docs"
            >
              Docs
            </a>
            <a
              className="text-zinc-200 whitespace-nowrap hover:underline decoration-wavy hover:text-white transition-all"
              href="/docs"
            >
              Ecosystem
            </a>
            <a
              className="text-zinc-200 whitespace-nowrap hover:underline decoration-wavy hover:text-white transition-all"
              href="/docs"
            >
              Examples
            </a>
          </nav>
          <ConnectDialog />
        </div>
      </header>

      <main className="min-h-lvh flex items-end relative">
        <img className="absolute size-full object-cover" src={heroImg} />
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-25% via-white/95 to-transparent"></div>

        <div className="inner isolate">
          <div className="flex flex-col items-center text-center gap-4">
            <h1 className="text-6xl tracking-tight">Build the future on Hedera</h1>
            <p className="text-xl max-w-xl text-zinc-600">
              Expressive, type-safe{" "}
              <img
                className="inline select-none size-8 rounded-lg align-top bg-white p-0.5"
                src={typescriptLogo}
                alt=""
              />{" "}
              tooling for building trusted Hedera apps with framework-native hooks, realtime
              subscriptions, wallet flows, and agent-ready tools
              <img
                className="inline select-none size-8 rounded-lg align-top bg-white p-0.5"
                src={reactLogo}
                alt=""
              />
              <img
                className="inline select-none size-8 rounded-lg align-top bg-white p-0.5"
                src={solidLogo}
                alt=""
              />
              <img
                className="inline select-none size-8 rounded-lg align-top bg-white p-0.5"
                src={preactLogo}
                alt=""
              />
              .
            </p>
            <div className="flex gap-4">
              <Button>
                Start building
                <SolarArrowRightLineDuotone />
              </Button>
            </div>
          </div>

          <DemoTabs />
        </div>
      </main>
    </>
  );
}
