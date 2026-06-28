import { parseDevice } from "@/lib/user-agent";

export type GeoRule = { country: string; destination: string };
export type DeviceRule = { device: "ios" | "android" | "desktop"; destination: string };

export function parseGeoRules(raw: unknown): GeoRule[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((r) => r && typeof r === "object")
    .map((r) => ({
      country: String((r as GeoRule).country || "").toUpperCase().slice(0, 2),
      destination: String((r as GeoRule).destination || "").trim(),
    }))
    .filter((r) => r.country && r.destination);
}

export function parseGeoRulesFromText(raw?: string): GeoRule[] {
  if (!raw?.trim()) return [];
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [country, ...rest] = line.split(",");
      return {
        country: country?.trim().toUpperCase().slice(0, 2) ?? "",
        destination: rest.join(",").trim(),
      };
    })
    .filter((r) => r.country && r.destination);
}

export function parseDeviceRulesFromText(raw?: string): DeviceRule[] {
  if (!raw?.trim()) return [];
  const allowed = new Set(["ios", "android", "desktop"]);
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [device, ...rest] = line.split(",");
      const d = device?.trim().toLowerCase() as DeviceRule["device"];
      return {
        device: d,
        destination: rest.join(",").trim(),
      };
    })
    .filter((r) => allowed.has(r.device) && r.destination);
}

export function parseDeviceRules(raw: unknown): DeviceRule[] {
  if (!Array.isArray(raw)) return [];
  const allowed = new Set(["ios", "android", "desktop"]);
  return raw
    .filter((r) => r && typeof r === "object")
    .map((r) => ({
      device: String((r as DeviceRule).device || "").toLowerCase() as DeviceRule["device"],
      destination: String((r as DeviceRule).destination || "").trim(),
    }))
    .filter((r) => allowed.has(r.device) && r.destination);
}

export function resolveDestination(
  link: {
    destination: string;
    iosDestination?: string | null;
    androidDestination?: string | null;
    geoRules?: unknown;
    deviceRules?: unknown;
  },
  meta: { country?: string | null; userAgent?: string | null }
): string {
  const country = meta.country?.toUpperCase().slice(0, 2);
  if (country) {
    for (const rule of parseGeoRules(link.geoRules)) {
      if (rule.country === country) return rule.destination;
    }
  }

  const device = parseDevice(meta.userAgent ?? null);
  if (device === "ios" && link.iosDestination) return link.iosDestination;
  if (device === "android" && link.androidDestination) return link.androidDestination;

  for (const rule of parseDeviceRules(link.deviceRules)) {
    if (rule.device === device) return rule.destination;
  }

  return link.destination;
}