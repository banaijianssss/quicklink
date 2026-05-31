import { describe, it, expect } from "vitest";
import { parseBrowser } from "./user-agent";

describe("parseBrowser", () => {
  it("detects Chrome", () => {
    expect(parseBrowser("Mozilla/5.0 Chrome/120.0.0.0 Safari/537.36")).toBe("Chrome");
  });

  it("detects Safari", () => {
    expect(parseBrowser("Mozilla/5.0 Macintosh Safari/605.1.15")).toBe("Safari");
  });

  it("detects bots", () => {
    expect(parseBrowser("Googlebot/2.1")).toBe("Bot");
  });

  it("handles null", () => {
    expect(parseBrowser(null)).toBe("Unknown");
  });
});
