import { type ReactElement } from "react";
import { Dialog } from "@base-ui/react/dialog";
import SolarWalletMoneyLineDuotone from "~icons/solar/wallet-money-line-duotone";

export default function ConnectDialog(): ReactElement {
  return (
    <Dialog.Root>
      <Dialog.Trigger className="inline-flex h-10 items-center gap-1 rounded-lg bg-white px-4 text-sm font-medium text-zinc-950 transition-all hover:bg-white/90">
        <SolarWalletMoneyLineDuotone />
        Connect
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-20 min-h-dvh bg-black/45 transition-all duration-150 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 supports-[-webkit-touch-callout:none]:absolute" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 z-20 flex w-[min(32rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 flex-col gap-5 rounded-2xl border border-zinc-200 bg-white p-6 text-zinc-950 shadow-2xl shadow-black/10 transition-all duration-150 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0">
          Lorem, ipsum dolor sit amet consectetur adipisicing elit. Ipsa officiis velit, modi
          repellendus libero quo! Reiciendis magnam reprehenderit sit optio, omnis nulla cumque esse
          accusantium necessitatibus, nesciunt perferendis repellat numquam.
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
