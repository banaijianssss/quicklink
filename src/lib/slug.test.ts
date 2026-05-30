import { describe, it, expect } from "vitest";
import { generateSlug, validateCustomSlug, isReservedSlug } from "./slug";

describe("slug", () => {
  it("generates slug of requested length", () => {
    const slug = generateSlug(8);
    expect(slug).toHaveLength(8);
    expect(slug).toMatch(/^[a-z0-9]+$/);
  });

  it("rejects reserved slugs", () => {
    expect(isReservedSlug("api")).toBe(true);
    expect(validateCustomSlug("api")).toBeTruthy();
  });

  it("accepts valid custom slug", () => {
    expect(validateCustomSlug("my-campaign-2024")).toBeNull();
  });

  it("rejects invalid characters", () => {
    expect(validateCustomSlug("UPPER")).toBeTruthy();
  });
});
