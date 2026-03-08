import { isBrowser } from "./platform";
import type { WalletAppInput, WalletAppMetadata } from "./types";

function readDescription(): string {
  if (!isBrowser()) {
    return "";
  }

  const value = document.querySelector('meta[name="description"]')?.getAttribute("content");
  return value ?? "";
}

function readIcons(): readonly string[] {
  if (!isBrowser()) {
    return [];
  }

  const elements = Array.from(
    document.querySelectorAll<HTMLLinkElement>('link[rel*="icon"][href]'),
  );
  const values = elements
    .map((element) => element.href)
    .filter((value, index, all) => value.length > 0 && all.indexOf(value) === index);

  return values;
}

function readUrl(): string {
  if (!isBrowser()) {
    return "http://localhost";
  }

  return window.location.origin;
}

function readRedirect(): WalletAppMetadata["redirect"] {
  if (!isBrowser()) {
    return undefined;
  }

  return {
    universal: window.location.href,
  };
}

export function inferAppMetadata(input: WalletAppInput = {}): WalletAppMetadata {
  const redirect =
    input.redirect?.native || input.redirect?.universal
      ? {
          ...(input.redirect.native ? { native: input.redirect.native } : {}),
          ...(input.redirect.universal ? { universal: input.redirect.universal } : {}),
        }
      : readRedirect();

  return {
    name: input.name ?? (isBrowser() ? document.title || "Hieco App" : "Hieco App"),
    description: input.description ?? readDescription(),
    url: input.url ?? readUrl(),
    icons: input.icons ?? readIcons(),
    ...(redirect ? { redirect } : {}),
  };
}
