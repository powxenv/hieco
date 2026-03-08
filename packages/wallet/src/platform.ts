export function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

export type WalletPlatform = "server" | "desktop" | "mobile";

export function isMobileBrowser(): boolean {
  if (!isBrowser()) {
    return false;
  }

  const userAgentData = Reflect.get(navigator, "userAgentData");
  const mobile =
    userAgentData && typeof userAgentData === "object"
      ? Reflect.get(userAgentData, "mobile")
      : undefined;

  if (typeof mobile === "boolean") {
    return mobile;
  }

  return /Android|iPhone|iPad|iPod|Mobile|Opera Mini|IEMobile/i.test(navigator.userAgent);
}

export function getWalletPlatform(): WalletPlatform {
  if (!isBrowser()) {
    return "server";
  }

  return isMobileBrowser() ? "mobile" : "desktop";
}
