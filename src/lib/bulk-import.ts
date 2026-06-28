import { createLinkForUser } from "@/lib/links";

export type BulkRow = { destination: string; title?: string; slug?: string };

export function parseBulkCsv(text: string): BulkRow[] {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (!lines.length) return [];

  const rows: BulkRow[] = [];
  const start = lines[0].toLowerCase().includes("destination") ? 1 : 0;

  for (const line of lines.slice(start)) {
    const parts = line.split(",").map((p) => p.trim().replace(/^"|"$/g, ""));
    const destination = parts[0];
    if (!destination) continue;
    rows.push({
      destination,
      title: parts[1] || undefined,
      slug: parts[2] || undefined,
    });
  }
  return rows.slice(0, 100);
}

export async function bulkCreateLinks(params: {
  userId: string;
  plan: string;
  rows: BulkRow[];
}) {
  const results: { ok: boolean; destination: string; slug?: string; error?: string }[] = [];

  for (const row of params.rows) {
    const result = await createLinkForUser({
      userId: params.userId,
      plan: params.plan,
      destination: row.destination,
      title: row.title,
      customSlug: row.slug,
    });
    if ("error" in result) {
      results.push({ ok: false, destination: row.destination, error: result.error });
      continue;
    }
    results.push({ ok: true, destination: row.destination, slug: result.link.slug });
  }

  return results;
}