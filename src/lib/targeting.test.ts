import { describe, expect, it } from "vitest";
import {
  parseDeviceRulesFromText,
  parseGeoRulesFromText,
  resolveDestination,
} from "./targeting";

describe("resolveDestination", () => {
  it("uses geo rule when country matches", () => {
    const dest = resolveDestination(
      {
        destination: "https://default.com",
        geoRules: [{ country: "US", destination: "https://us.com" }],
      },
      { country: "US", userAgent: "Mozilla/5.0" }
    );
    expect(dest).toBe("https://us.com");
  });

  it("parses geo rules from textarea", () => {
    const rules = parseGeoRulesFromText("US,https://us.com\nCN,https://cn.com");
    expect(rules).toEqual([
      { country: "US", destination: "https://us.com" },
      { country: "CN", destination: "https://cn.com" },
    ]);
  });

  it("parses device rules from textarea", () => {
    const rules = parseDeviceRulesFromText("ios,https://ios.com\nandroid,https://android.com");
    expect(rules).toEqual([
      { device: "ios", destination: "https://ios.com" },
      { device: "android", destination: "https://android.com" },
    ]);
  });

  it("uses ios destination on iPhone", () => {
    const dest = resolveDestination(
      {
        destination: "https://default.com",
        iosDestination: "https://ios.com",
      },
      { userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)" }
    );
    expect(dest).toBe("https://ios.com");
  });
});