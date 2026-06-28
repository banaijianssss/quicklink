import { describe, expect, it } from "vitest";
import {
  parseAbVariantsFromText,
  pickAbVariant,
} from "./ab-test";

describe("ab-test", () => {
  it("parses variants from textarea", () => {
    const variants = parseAbVariantsFromText(
      "A,50,https://a.com\nB,50,https://b.com"
    );
    expect(variants).toHaveLength(2);
    expect(variants[0].weight).toBe(50);
  });

  it("picks a variant destination", () => {
    const pick = pickAbVariant([
      { label: "A", weight: 1, destination: "https://a.com" },
      { label: "B", weight: 1, destination: "https://b.com" },
    ]);
    expect(["https://a.com", "https://b.com"]).toContain(pick.destination);
  });
});