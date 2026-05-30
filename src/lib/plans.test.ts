import { describe, it, expect } from "vitest";
import { getPlanLimits, isPro } from "./plans";

describe("plans", () => {
  it("free limits", () => {
    const limits = getPlanLimits("free");
    expect(limits.maxLinks).toBe(5);
    expect(limits.customSlug).toBe(false);
  });

  it("pro limits", () => {
    const limits = getPlanLimits("pro");
    expect(limits.maxLinks).toBe(1000);
    expect(isPro("pro")).toBe(true);
  });
});
