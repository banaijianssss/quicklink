const SLUG_CHARS = "abcdefghijklmnopqrstuvwxyz0123456789";
const RESERVED = new Set([
  "api",
  "login",
  "register",
  "dashboard",
  "pricing",
  "settings",
  "billing",
  "r",
  "admin",
  "auth",
  "_next",
]);

export function generateSlug(length = 6): string {
  let slug = "";
  for (let i = 0; i < length; i++) {
    slug += SLUG_CHARS[Math.floor(Math.random() * SLUG_CHARS.length)];
  }
  return slug;
}

export function validateCustomSlug(slug: string): string | null {
  if (!slug || slug.length < 3 || slug.length > 32) {
    return "Slug must be 3–32 characters";
  }
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return "Only lowercase letters, numbers, and hyphens";
  }
  if (RESERVED.has(slug)) {
    return "This slug is reserved";
  }
  return null;
}

export function isReservedSlug(slug: string): boolean {
  return RESERVED.has(slug);
}
