export type UtmParams = {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
};

export function appendUtmParams(url: string, utm: UtmParams): string {
  const hasAny = Object.values(utm).some((v) => v?.trim());
  if (!hasAny) return url;

  try {
    const parsed = new URL(url);
    const set = (key: string, value?: string) => {
      const v = value?.trim();
      if (v) parsed.searchParams.set(key, v);
    };
    set("utm_source", utm.utmSource);
    set("utm_medium", utm.utmMedium);
    set("utm_campaign", utm.utmCampaign);
    set("utm_term", utm.utmTerm);
    set("utm_content", utm.utmContent);
    return parsed.toString();
  } catch {
    return url;
  }
}

export function parseTagsInput(raw?: string): string[] {
  if (!raw?.trim()) return [];
  return raw
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter((t) => t.length > 0 && t.length <= 32)
    .slice(0, 10);
}