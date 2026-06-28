import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import { getPlanLimits } from "@/lib/plans";
import { buildBioUrl } from "@/lib/utils";
import { BioPageForm } from "@/components/bio-page-form";
import { BioPageRow } from "@/components/bio-page-row";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function BioDashboardPage() {
  const session = await requireSession();
  const limits = getPlanLimits(session.user.plan);

  const pages = await prisma.bioPage.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { views: true } } },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Link-in-bio 落地页</h1>
          <p className="text-sm text-[var(--muted)]">
            已用 {pages.length}/{limits.maxBioPages === -1 ? "∞" : limits.maxBioPages} 页
          </p>
        </div>
        <Link href="/dashboard">
          <Button variant="secondary">返回仪表盘</Button>
        </Link>
      </div>

      {limits.bioPages && <BioPageForm />}

      <section className="space-y-4">
        <h2 className="font-semibold">我的落地页</h2>
        {pages.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">还没有落地页，在上方创建第一个。</p>
        ) : (
          pages.map((p) => (
            <BioPageRow key={p.id} page={p} publicUrl={buildBioUrl(p.slug)} />
          ))
        )}
      </section>
    </div>
  );
}