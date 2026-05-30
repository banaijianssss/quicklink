import { describe, it, expect } from "vitest";
import { normalizeDestination } from "./links";

describe("normalizeDestination", () => {
  it("adds https when missing", () => {
    expect(normalizeDestination("example.com")).toBe("https://example.com/");
  });

  it("keeps valid https url", () => {
    expect(normalizeDestination("https://foo.bar/baz")).toBe("https://foo.bar/baz");
  });

  it("rejects empty", () => {
    expect(normalizeDestination("")).toBeNull();
  });

  it("rejects invalid url", () => {
    expect(normalizeDestination("not a url !!!")).toBeNull();
  });
});
