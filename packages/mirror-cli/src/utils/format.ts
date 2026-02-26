import Table from "cli-table3";
import chalk from "chalk";

const TINYBARS_PER_HBAR = 100_000_000;

export interface FormatOptions {
  json?: boolean;
}

export function formatOutput(output: unknown, options: FormatOptions = {}): string {
  if (options.json) {
    return JSON.stringify(output, null, 2);
  }
  return formatPretty(output);
}

function formatPretty(data: unknown): string {
  if (typeof data === "string") return data;
  if (typeof data === "number" || typeof data === "boolean") return String(data);
  if (data == null) return chalk.gray("N/A");
  if (Array.isArray(data)) {
    if (data.length === 0) return chalk.gray("No results");
    return data.map((element) => formatPretty(element)).join("\n\n");
  }
  if (typeof data === "object") {
    const record = data as Record<string, unknown>;
    const table = new Table({
      head: [chalk.cyan("Field"), chalk.cyan("Value")],
      colWidths: [30, 70],
      wordWrap: true,
    });

    for (const [fieldName, fieldValue] of Object.entries(record)) {
      table.push([formatFieldName(fieldName), formatFieldValue(fieldValue)]);
    }

    return table.toString();
  }
  return String(data);
}

function formatFieldName(fieldName: string): string {
  return chalk.yellow(fieldName);
}

function formatFieldValue(fieldValue: unknown): string {
  if (fieldValue == null) return chalk.gray("N/A");
  if (typeof fieldValue === "boolean") {
    return fieldValue ? chalk.green("true") : chalk.red("false");
  }
  if (typeof fieldValue === "number") return chalk.white(String(fieldValue));
  if (typeof fieldValue === "string") {
    if (fieldValue.startsWith("0.0.")) return chalk.cyan(fieldValue);
    if (/^\d+$/.test(fieldValue)) return chalk.green(fieldValue);
    if (fieldValue.includes("\n")) return "\n" + chalk.gray(fieldValue);
    return fieldValue;
  }
  if (Array.isArray(fieldValue)) {
    return fieldValue.length === 0 ? chalk.gray("[]") : chalk.gray(`[${fieldValue.length} items]`);
  }
  if (typeof fieldValue === "object") {
    const keys = Object.keys(fieldValue);
    return keys.length === 0 ? chalk.gray("{}") : chalk.gray(`{${keys.length} keys}`);
  }
  return String(fieldValue);
}

export function formatError(error: Error): string {
  return chalk.red(`Error: ${error.message}`);
}

export function formatYesNo(value: boolean | undefined | null): string {
  return value ? "Yes" : "No";
}

function convertTinybarToHbar(tinybar: number | bigint): number {
  return Number(tinybar) / TINYBARS_PER_HBAR;
}

export function formatHbar(tinybar: number | bigint): string {
  const hbar = convertTinybarToHbar(tinybar);
  return `${chalk.green(hbar.toFixed(8))} ${chalk.cyan("ℏ")}`;
}
