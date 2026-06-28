function parseBrowser(ua: string | null): string {
  if (!ua) return "Unknown";
  if (/bot|crawl|spider|slurp|facebookexternalhit|preview/i.test(ua)) return "Bot";
  if (/Edg\//i.test(ua)) return "Edge";
  if (/Chrome\//i.test(ua) && !/Edg\//i.test(ua)) return "Chrome";
  if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) return "Safari";
  if (/Firefox\//i.test(ua)) return "Firefox";
  return "Other";
}

function parseDevice(ua: string | null): "ios" | "android" | "desktop" {
  if (!ua) return "desktop";
  if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
  if (/Android/i.test(ua)) return "android";
  return "desktop";
}

function parseOs(ua: string | null): string {
  if (!ua) return "Unknown";
  if (/Windows NT/i.test(ua)) return "Windows";
  if (/Mac OS X/i.test(ua) && !/iPhone|iPad|iPod/i.test(ua)) return "macOS";
  if (/iPhone|iPad|iPod/i.test(ua)) return "iOS";
  if (/Android/i.test(ua)) return "Android";
  if (/Linux/i.test(ua)) return "Linux";
  return "Other";
}

export { parseBrowser, parseDevice, parseOs };
