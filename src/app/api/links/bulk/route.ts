import { auth } from "@/auth";
import { bulkCreateLinks, parseBulkCsv } from "@/lib/bulk-import";
import { getPlanLimits } from "@/lib/plans";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limits = getPlanLimits(session.user.plan);
  if (!limits.bulkImport) {
    return NextResponse.json({ error: "Bulk import requires Pro plan" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const csv = String(body.csv || "");
  const rows = parseBulkCsv(csv);
  if (!rows.length) {
    return NextResponse.json({ error: "No valid rows in CSV" }, { status: 400 });
  }

  const results = await bulkCreateLinks({
    userId: session.user.id,
    plan: session.user.plan,
    rows,
  });

  const ok = results.filter((r) => r.ok).length;
  return NextResponse.json({ imported: ok, total: results.length, results });
}