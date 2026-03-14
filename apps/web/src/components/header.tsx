import logo from "../assets/logo-white.svg";
import ConnectDialog from "../components/connect-dialog";
import { useWallet } from "@hieco/wallet-react";
import DisconnectDialog from "#/components/disconnect-dialog";
import { Link } from "@tanstack/react-router";

const Header = () => {
  const { session } = useWallet();

  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 z-10">
      <div className="flex gap-12 bg-zinc-800 h-14 items-center pl-5 pr-2 ring-4 ring-white/20 rounded-xl shadow-2xl shadow-black/6">
        <Link to="/" className="flex items-center gap-2 text-white text-xl">
          <img className="size-6" src={logo} alt="Hieco Logo" />
          Hieco
        </Link>
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
          <Link
            className="text-zinc-200 whitespace-nowrap hover:underline decoration-wavy hover:text-white transition-all"
            to="/showcase"
          >
            Showcase
          </Link>
        </nav>
        {session ? <DisconnectDialog /> : <ConnectDialog />}
      </div>
    </header>
  );
};

export default Header;
