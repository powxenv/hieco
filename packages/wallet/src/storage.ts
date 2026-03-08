import { isBrowser } from "./platform.ts";
import type { WalletStorage } from "./types.ts";

export function createStorage(): WalletStorage {
  if (!isBrowser()) {
    return {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    };
  }

  return {
    getItem: (key) => localStorage.getItem(key),
    setItem: (key, value) => {
      localStorage.setItem(key, value);
    },
    removeItem: (key) => {
      localStorage.removeItem(key);
    },
  };
}
