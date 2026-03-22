import { describe, expect, test } from "bun:test";
import { formatError, formatHbar, formatOutput, formatYesNo } from "./format";

describe("CLI formatting helpers", () => {
  test("formats JSON output without alteration", () => {
    expect(
      formatOutput(
        {
          id: "0.0.123",
          active: true,
        },
        { json: true },
      ),
    ).toBe('{\n  "id": "0.0.123",\n  "active": true\n}');
  });

  test("formats primitive and structured output for terminal display", () => {
    expect(formatOutput("ready")).toBe("ready");
    expect(formatOutput([])).toContain("No results");

    const table = formatOutput({
      accountId: "0.0.123",
      active: true,
      nested: {
        one: 1,
      },
    });

    expect(table).toContain("accountId");
    expect(table).toContain("0.0.123");
    expect(table).toContain("active");
    expect(table).toContain("true");
    expect(table).toContain("nested");
  });

  test("formats errors, yes/no labels, and hbar values", () => {
    expect(formatError(new Error("boom"))).toContain("Error: boom");
    expect(formatYesNo(true)).toBe("Yes");
    expect(formatYesNo(false)).toBe("No");
    expect(formatYesNo(undefined)).toBe("No");

    const hbar = formatHbar(250_000_000);

    expect(hbar).toContain("2.50000000");
    expect(hbar).toContain("ℏ");
  });
});
