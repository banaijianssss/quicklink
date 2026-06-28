"use client";

type DomainOption = {
  id: string;
  hostname: string;
};

export function DomainSelect({
  domains,
  defaultValue,
}: {
  domains: DomainOption[];
  defaultValue?: string | null;
}) {
  if (!domains.length) return null;

  return (
    <div>
      <label className="mb-1 block text-sm font-medium">自定义域名（可选）</label>
      <select
        name="domainId"
        defaultValue={defaultValue ?? ""}
        className="w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm"
      >
        <option value="">默认域名</option>
        {domains.map((d) => (
          <option key={d.id} value={d.id}>
            {d.hostname}
          </option>
        ))}
      </select>
    </div>
  );
}