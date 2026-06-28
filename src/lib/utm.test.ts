import { describe, expect, it } from "vitest";
import { appendUtmParams, parseTagsInput } from "./utm";

describe("appendUtmParams", () => {
  it("appends utm params to url", () => {
    const out = appendUtmParams("https://example.com", {
      utmSource: "newsletter",
      utmMedium: "email",
      utmCampaign: "spring",
    });
    const url = new URL(out);
    expect(url.searchParams.get("utm_source")).toBe("newsletter");
    expect(url.searchParams.get("utm_medium")).toBe("email");
    expect(url.searchParams.get("utm_campaign")).toBe("spring");
  });

  it("returns original url when no utm", () => {
    expect(appendUtmParams("https://example.com", {})).toBe("https://example.com");
  });
});

describe("parseTagsInput", () => {
  it("parses comma separated tags", () => {
    expect(parseTagsInput("Blog, Product, blog")).toEqual(["blog", "product", "blog"]);
  });
});