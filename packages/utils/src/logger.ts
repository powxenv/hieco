import pino, { type Logger } from "pino";

const DEFAULT_LEVEL = "warn";

function canUseBrowserLogger(): boolean {
  return typeof window !== "undefined";
}

export function createInternalLogger(name: string): Logger {
  return pino({
    name,
    level: DEFAULT_LEVEL,
    browser: canUseBrowserLogger()
      ? {
          asObject: true,
          disabled: false,
        }
      : undefined,
  });
}
