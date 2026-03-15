import { createFileRoute } from "@tanstack/react-router";
import type { ReactElement } from "react";
import { Button } from "../components/ui/button";
import DemoTabs from "../components/demo-tabs";
import preactLogo from "../assets/tech-icons/preact.svg";
import reactLogo from "../assets/tech-icons/react.svg";
import solidLogo from "../assets/tech-icons/solid.svg";
import typescriptLogo from "../assets/tech-icons/ts.svg";
import heroImg from "../assets/hero.jpeg";
import SolarArrowRightLineDuotone from "~icons/solar/arrow-right-line-duotone";
import { createSeo } from "#/lib/seo";

export const Route = createFileRoute("/")({
  head: () =>
    createSeo({
      title: "TypeScript Toolkit for Hedera Apps",
      description:
        "Build Hedera apps with type-safe wallet flows, Mirror Node reads, realtime subscriptions, and framework-native tooling from Hieco.",
      path: "/",
    }),
  component: App,
});

function App(): ReactElement {
  return (
    <>
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
              <Button size="lg">
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
