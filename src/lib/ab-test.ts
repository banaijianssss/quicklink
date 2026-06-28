export type AbVariant = {
  destination: string;
  weight: number;
  label?: string;
};

export function parseAbVariants(raw: unknown): AbVariant[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((item) => item && typeof item === "object")
    .map((item, index) => ({
      destination: String((item as AbVariant).destination || "").trim(),
      weight: Math.max(1, Number((item as AbVariant).weight) || 1),
      label: String((item as AbVariant).label || `Variant ${index + 1}`).slice(0, 40),
    }))
    .filter((v) => v.destination);
}

export function parseAbVariantsFromText(raw?: string): AbVariant[] {
  if (!raw?.trim()) return [];
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const parts = line.split(",").map((s) => s.trim());
      if (parts.length >= 3) {
        return {
          label: parts[0],
          weight: Math.max(1, Number(parts[1]) || 1),
          destination: parts.slice(2).join(","),
        };
      }
      const [weightOrUrl, ...rest] = parts;
      const asWeight = Number(weightOrUrl);
      if (Number.isFinite(asWeight) && rest.length) {
        return {
          label: `Variant ${index + 1}`,
          weight: Math.max(1, asWeight),
          destination: rest.join(","),
        };
      }
      return {
        label: `Variant ${index + 1}`,
        weight: 1,
        destination: line,
      };
    })
    .filter((v) => v.destination);
}

export function formatAbVariantsForForm(variants: unknown): string {
  const parsed = parseAbVariants(variants);
  if (!parsed.length) return "";
  return parsed
    .map((v) => `${v.label || "Variant"},${v.weight},${v.destination}`)
    .join("\n");
}

export function pickAbVariant(variants: AbVariant[]): { index: number; destination: string } {
  if (!variants.length) {
    return { index: 0, destination: "" };
  }
  const total = variants.reduce((sum, v) => sum + v.weight, 0);
  let roll = Math.random() * total;
  for (let i = 0; i < variants.length; i++) {
    roll -= variants[i].weight;
    if (roll <= 0) {
      return { index: i, destination: variants[i].destination };
    }
  }
  const last = variants[variants.length - 1];
  return { index: variants.length - 1, destination: last.destination };
}