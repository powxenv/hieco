import { type ReactElement } from "react";
import { Dialog } from "@base-ui/react/dialog";
import SolarWalletMoneyLineDuotone from "~icons/solar/wallet-money-line-duotone";
import { useWallet } from "@hieco/wallet-react";
import { QRCode } from "react-qrcode-logo";
import logo from "../assets/logo-with-bg.svg";
import SolarRefreshLineDuotone from "~icons/solar/refresh-line-duotone";
import SolarDownloadMinimalisticLineDuotone from "~icons/solar/download-minimalistic-line-duotone";
import SolarCloseCircleLineDuotone from "~icons/solar/close-circle-line-duotone";

export default function ConnectDialog(): ReactElement {
  const wallet = useWallet();

  return (
    <Dialog.Root
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          wallet.close();
          return;
        }

        void wallet.open();
      }}
    >
      <Dialog.Trigger className="inline-flex h-10 items-center gap-1 rounded-lg bg-white px-4 text-sm font-medium text-zinc-950 transition-all hover:bg-white/90">
        <SolarWalletMoneyLineDuotone />
        Connect
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-20 min-h-dvh bg-black/45 transition-all duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0 supports-[-webkit-touch-callout:none]:absolute" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 z-20 flex w-[min(40rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 flex-col gap-2 rounded-2xl border border-zinc-200 bg-white p-6 text-zinc-950 shadow-2xl shadow-black/10 transition-all duration-150 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Connect Wallet</h2>

            <Dialog.Close>
              <SolarCloseCircleLineDuotone />
            </Dialog.Close>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="aspect-square rounded-xl overflow-hidden">
                {((!wallet.qr.uri && !wallet.qr.pending) || wallet.qr.expired) && (
                  <div className="flex items-center bg-zinc-900 justify-center size-full">
                    <button
                      className="bg-white text-sm h-9 px-3 rounded-lg [&>svg]:size-4 inline-flex items-center gap-1"
                      onClick={() => void wallet.reload()}
                    >
                      <SolarRefreshLineDuotone />
                      Reload Connection
                    </button>
                  </div>
                )}

                {wallet.qr.uri && (
                  <QRCode
                    qrStyle="dots"
                    style={{ width: "100%", height: "100%" }}
                    logoImage={logo}
                    value={wallet.qr.uri}
                    eyeRadius={20}
                    removeQrCodeBehindLogo
                    logoPaddingStyle="circle"
                    logoWidth={60}
                    ecLevel="Q"
                    size={340}
                    fgColor="#fff"
                    bgColor="var(--color-zinc-900)"
                  />
                )}

                {wallet.qr.pending && (
                  <div className="relative size-full bg-zinc-900">
                    <div className="square" id="sq1"></div>
                    <div className="square" id="sq2"></div>
                    <div className="square" id="sq3"></div>
                    <div className="square" id="sq4"></div>
                    <div className="square" id="sq5"></div>
                    <div className="square" id="sq6"></div>
                    <div className="square" id="sq7"></div>
                    <div className="square" id="sq8"></div>
                    <div className="square" id="sq9"></div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-sm text-zinc-600">Installed</span>

              {wallet.connectableWallets.length > 0 && (
                <div className="divide-y">
                  {wallet.connectableWallets.map((walletOption) => (
                    <button
                      key={walletOption.id}
                      className="flex items-center w-full gap-2 p-2 hover:bg-zinc-100 rounded-xl cursor-pointer disabled:bg-zinc-100 disabled:opacity-80 disabled:cursor-not-allowed"
                      disabled={!wallet.qr.uri}
                      onClick={() => {
                        void wallet.connectExtension(walletOption.id);
                      }}
                    >
                      <img
                        className="size-10 rounded-lg"
                        src={walletOption.icon}
                        alt={walletOption.name}
                      />
                      <span className="font-semibold">{walletOption.name}</span>
                    </button>
                  ))}
                </div>
              )}

              <span className="text-sm text-zinc-600">Not Installed</span>

              {wallet.unavailableWallets.length > 0 && (
                <div className="divide-y">
                  {wallet.unavailableWallets.map((walletOption) => (
                    <div
                      key={walletOption.id}
                      className="flex items-center gap-2 p-2 bg-zinc-100 rounded-xl"
                    >
                      <img
                        className="size-10 rounded-lg"
                        src={walletOption.icon}
                        alt={walletOption.name}
                      />

                      <span className="font-semibold">{walletOption.name}</span>

                      <a
                        href={walletOption.installUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-auto border border-zinc-300 h-9 text-sm px-3 gap-1 rounded-lg bg-white inline-flex items-center [&>svg]:size-4"
                      >
                        <SolarDownloadMinimalisticLineDuotone />
                        Install
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
