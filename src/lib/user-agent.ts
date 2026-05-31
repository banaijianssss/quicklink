function parseBrowser(ua: string | null): string {
  if (!ua) return "Unknown";
  if (/bot|crawl|spider|slurp|facebookexternalhit|preview/i.test(ua)) return "Bot";
  if (/Edg\//i.test(ua)) return "Edge";
  if (/Chrome\//i.test(ua) && !/Edg\//i.test(ua)) return "Chrome";
  if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) return "Safari";
  if (/Firefox\//i.test(ua)) return "Firefox";
  return "Other";
}

export { parseBrowser };
