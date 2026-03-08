import type { WalletModalState } from "./context";
import { useWalletContext } from "./context";

export function useWalletModal(): WalletModalState {
  const { isOpen, openModal, closeModal, toggleModal } = useWalletContext();

  return {
    isOpen,
    openModal,
    closeModal,
    toggleModal,
  };
}
