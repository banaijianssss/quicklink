"use client";

type Phase3Limits = {
  abTesting: boolean;
  linkScheduling: boolean;
};

export function Phase3Fields({ limits }: { limits: Phase3Limits }) {
  if (!limits.abTesting && !limits.linkScheduling) return null;

  return (
    <div className="space-y-3 rounded-lg border border-[var(--border)] bg-slate-50/50 p-4">
      <p className="text-sm font-medium">高级投放（Pro+）</p>
      {limits.linkScheduling && (
        <div>
          <label className="mb-1 block text-xs text-[var(--muted)]">定时上线（可选）</label>
          <input
            name="startsAt"
            type="datetime-local"
            className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm"
          />
        </div>
      )}
      {limits.abTesting && (
        <div>
          <label className="mb-1 block text-xs text-[var(--muted)]">
            A/B 测试（每行：名称,权重,URL — 至少 2 条）
          </label>
          <textarea
            name="abVariants"
            className="w-full min-h-[88px] rounded-lg border border-[var(--border)] p-2 text-sm"
            placeholder={"落地页A,50,https://a.example.com\n落地页B,50,https://b.example.com"}
          />
        </div>
      )}
    </div>
  );
}

export function formatAbVariantsField(variants: unknown): string {
  if (!Array.isArray(variants)) return "";
  return variants
    .map((item) => {
      if (!item || typeof item !== "object") return "";
      const row = item as { label?: string; weight?: number; destination?: string };
      return `${row.label || "Variant"},${row.weight || 1},${row.destination || ""}`;
    })
    .filter((line) => line.length > 2)
    .join("\n");
}