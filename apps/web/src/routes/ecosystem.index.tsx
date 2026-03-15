import { createFileRoute } from "@tanstack/react-router";
import heroImg from "../assets/hero.jpeg";
import hederaLogo from "../assets/tech-icons/hedera.svg";
import hieroLogo from "../assets/tech-icons/hiero.svg";
import lfDecentralizedTrustLogo from "../assets/tech-icons/lf-decentralized-trust.png";
import hiecoLogo from "../assets/logo.svg";

export const Route = createFileRoute("/ecosystem/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <div className="h-60 relative">
        <img
          alt="Ecosystem hero"
          className="absolute size-full object-cover object-top"
          src={heroImg}
        />
        <div className="absolute inset-0 bg-linear-to-b from-transparent to-white"></div>
      </div>
      <main className="relative">
        <article className="inner max-w-3xl space-y-10 pb-20">
          <header className="space-y-4">
            <h1 className="text-6xl font-bold">Ecosystem</h1>
            <p className="max-w-2xl text-xl text-zinc-600">
              Hieco fits into a wider stack. The easiest way to think about it
              is simple:{" "}
              <img
                alt=""
                className="inline size-7 rounded-lg align-top bg-white p-1 border"
                src={hederaLogo}
              />{" "}
              <a
                className="underline decoration-zinc-300 underline-offset-4"
                href="https://hedera.com/"
                rel="noreferrer"
                target="_blank"
              >
                Hedera
              </a>{" "}
              is the live network,{" "}
              <img
                alt=""
                className="inline size-7 rounded-lg align-top bg-white p-1 border"
                src={hieroLogo}
              />{" "}
              <a
                className="underline decoration-zinc-300 underline-offset-4"
                href="https://www.lfdecentralizedtrust.org/projects/hiero"
                rel="noreferrer"
                target="_blank"
              >
                Hiero
              </a>{" "}
              is the open source ledger codebase and tooling around it, and{" "}
              <img
                alt=""
                className="inline size-7 rounded-lg align-top bg-white p-1 border"
                src={hiecoLogo}
              />{" "}
              Hieco is the app-facing toolkit that helps those pieces feel
              easier to use together.
            </p>
          </header>

          <section className="space-y-3">
            <h2 className="flex items-center gap-3 text-2xl font-semibold">
              <img
                alt=""
                className="size-7 rounded-lg bg-white p-1 border"
                src={hiecoLogo}
              />
              What Hieco Is
            </h2>
            <p className="text-zinc-700">
              Hieco is a TypeScript-first toolkit for building apps on Hedera
              without stitching the whole stack together by hand. It brings
              wallet connection, signer-aware flows,{" "}
              <a
                className="underline decoration-zinc-300 underline-offset-4"
                href="https://docs.hedera.com/hedera/sdks-and-apis/rest-api"
                rel="noreferrer"
                target="_blank"
              >
                Mirror Node
              </a>{" "}
              reads, realtime subscriptions, CLI tooling, and framework bindings
              into one package family.
            </p>
            <p className="text-zinc-700">
              In practice, that means Hieco sits closer to application code than
              raw ledger infrastructure. You use it when you want to ship a
              product, not when you want to think about every lower-level moving
              part yourself.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="flex items-center gap-3 text-2xl font-semibold">
              <img
                alt=""
                className="size-7 rounded-lg bg-white p-1 border"
                src={hederaLogo}
              />
              What the Hedera Network Is
            </h2>
            <p className="text-zinc-700">
              The{" "}
              <a
                className="underline decoration-zinc-300 underline-offset-4"
                href="https://hedera.com/"
                rel="noreferrer"
                target="_blank"
              >
                Hedera Network
              </a>{" "}
              is the live public network where accounts, tokens, topics, smart
              contracts, and transactions actually exist. It is the runtime
              layer. When an app sends a transaction or reads public state, this
              is the network it ultimately depends on.
            </p>
            <p className="text-zinc-700">
              Around that live network are a few important access layers: SDKs
              for writing and signing transactions,{" "}
              <a
                className="underline decoration-zinc-300 underline-offset-4"
                href="https://docs.hedera.com/hedera/sdks-and-apis/rest-api"
                rel="noreferrer"
                target="_blank"
              >
                Mirror Nodes
              </a>{" "}
              for historical and indexed reads, and wallets for user-controlled
              signing. Most app development is really about getting these layers
              to work together cleanly.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="flex items-center gap-3 text-2xl font-semibold">
              <img
                alt=""
                className="size-7 rounded-lg bg-white p-1 border"
                src={hieroLogo}
              />
              What Hiero Is
            </h2>
            <p className="text-zinc-700">
              <a
                className="underline decoration-zinc-300 underline-offset-4"
                href="https://www.lfdecentralizedtrust.org/projects/hiero"
                rel="noreferrer"
                target="_blank"
              >
                Hiero
              </a>{" "}
              is the open source distributed ledger software used to build
              Hedera, now hosted by{" "}
              <a
                className="underline decoration-zinc-300 underline-offset-4"
                href="https://www.lfdecentralizedtrust.org/"
                rel="noreferrer"
                target="_blank"
              >
                LF Decentralized Trust
              </a>
              <img
                alt=""
                className="ml-2 inline size-7 rounded-lg align-top bg-white p-1 border"
                src={lfDecentralizedTrustLogo}
              />
              . It includes the lower-level codebase, core services, tooling,
              and libraries that sit underneath the application layer.
            </p>
            <p className="text-zinc-700">
              If Hedera is the network you deploy to, Hiero is much closer to
              the foundation that makes that network and its tooling possible.
              That is why Hieco and Hiero are related but not the same thing:
              Hiero is infrastructure and core tooling, while Hieco is focused
              on developer ergonomics higher up the stack.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">
              How the Pieces Fit Together
            </h2>
            <p className="text-zinc-700">
              A simple mental model is: users connect through wallets, wallets
              produce signers, apps use SDKs and app frameworks to build
              transactions, and public data is often read through Mirror Nodes.
              Underneath all of that, the live network is Hedera, and the open
              source ledger foundation is Hiero.
            </p>
            <p className="text-zinc-700">
              Hieco lives in the middle of that flow. It does not replace Hedera
              or Hiero. It wraps the parts app teams touch every day so the
              experience feels closer to modern TypeScript development and less
              like wiring infrastructure by hand.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">
              Other Parts Worth Knowing
            </h2>
            <p className="text-zinc-700">
              <a
                className="underline decoration-zinc-300 underline-offset-4"
                href="https://docs.hedera.com/hedera/sdks-and-apis/rest-api"
                rel="noreferrer"
                target="_blank"
              >
                Mirror Nodes
              </a>{" "}
              are the read-heavy side of the ecosystem. They make it practical
              to inspect account history, token data, transactions, topics, and
              contracts without asking an app to hit consensus nodes directly.
            </p>
            <p className="text-zinc-700">
              Wallets such as{" "}
              <a
                className="underline decoration-zinc-300 underline-offset-4"
                href="https://www.hashpack.app/"
                rel="noreferrer"
                target="_blank"
              >
                HashPack
              </a>{" "}
              give users control over keys and signatures. SDKs such as the{" "}
              <a
                className="underline decoration-zinc-300 underline-offset-4"
                href="https://github.com/hiero-ledger/hiero-sdk-js"
                rel="noreferrer"
                target="_blank"
              >
                Hiero SDK
              </a>{" "}
              expose lower-level capabilities. Hieco sits on top of those layers
              to make app code more cohesive.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">The Short Version</h2>
            <p className="text-zinc-700">
              If you are building a product, the shortest useful summary is
              this: Hedera is the network, Hiero is the open source ledger and
              tooling foundation, and Hieco is the developer toolkit that helps
              turn those capabilities into app-ready building blocks.
            </p>
          </section>
        </article>
      </main>
    </>
  );
}
