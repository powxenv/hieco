import { AlertDialog } from "@base-ui/react/alert-dialog";
import { useWallet } from "@hieco/wallet-react";
import SolarLinkBrokenBoldDuotone from "~icons/solar/link-broken-bold-duotone";

const DisconnectDialog = () => {
  const { session, disconnect } = useWallet();

  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger className="inline-flex h-10 items-center gap-1 rounded-lg bg-white px-4 text-sm font-medium text-zinc-950 transition-all hover:bg-white/90">
        {session?.accountId}
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className="fixed inset-0 min-h-dvh bg-black opacity-20 transition-all duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0 dark:opacity-70 supports-[-webkit-touch-callout:none]:absolute z-10" />
        <AlertDialog.Popup className="fixed top-1/2 left-1/2 -mt-8 w-96 max-w-[calc(100vw-3rem)] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-gray-50 p-6 text-gray-900 outline-1 outline-gray-200 transition-all duration-150 data-ending-style:scale-90 data-ending-style:opacity-0 data-starting-style:scale-90 data-starting-style:opacity-0 dark:outline-gray-300 z-10">
          <AlertDialog.Title className="-mt-1.5 mb-1 text-lg font-medium">
            You are connected to a wallet
          </AlertDialog.Title>
          <AlertDialog.Description className="mb-6 text-base text-gray-600">
            Do you want to disconnect your wallet?
          </AlertDialog.Description>
          <div className="flex justify-end gap-1">
            <AlertDialog.Close className="inline-flex h-10 items-center gap-1 rounded-lg text-white px-4 text-sm font-medium bg-zinc-900 transition-all hover:bg-zinc-900/90">
              Nevermind
            </AlertDialog.Close>
            <button
              onClick={() => void disconnect()}
              className="inline-flex h-10 items-center [&>svg]:size-4 gap-1 rounded-lg text-white px-4 text-sm font-medium bg-red-800 transition-all hover:bg-red-800/90"
            >
              <SolarLinkBrokenBoldDuotone />
              Disconnect
            </button>
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
};

export default DisconnectDialog;
