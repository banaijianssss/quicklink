import { describe, it, expect } from "vitest";
import { parseBrowser, parseOs, parseDevice } from "./user-agent";

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

describe("parseOs", () => {
  it("detects iOS", () => {
    expect(parseOs("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)")).toBe("iOS");
  });

  it("detects Windows", () => {
    expect(parseOs("Mozilla/5.0 (Windows NT 10.0; Win64; x64)")).toBe("Windows");
  });
});

describe("parseDevice", () => {
  it("detects android", () => {
    expect(parseDevice("Mozilla/5.0 (Linux; Android 13)")).toBe("android");
  });
});
