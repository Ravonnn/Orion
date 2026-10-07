import { describe, expect, it } from "vitest";
import en from "./locales/en.json";
import nl from "./locales/nl.json";

function flatten(obj: Record<string, unknown>, prefix = ""): string[] {
  return Object.entries(obj).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return flatten(value as Record<string, unknown>, path);
    }
    return [path];
  });
}

describe("locale files", () => {
  it("en and nl expose the same keys", () => {
    expect(flatten(nl).sort()).toEqual(flatten(en).sort());
  });
});
