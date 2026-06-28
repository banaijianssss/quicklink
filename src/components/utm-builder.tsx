"use client";

import { Input } from "@/components/ui/input";

export function UtmBuilder({ disabled }: { disabled?: boolean }) {
  return (
    <details className="rounded-lg border border-[var(--border)] bg-slate-50/80 p-3">
      <summary className="cursor-pointer text-sm font-medium text-[var(--foreground)]">
        UTM 参数（营销追踪）
      </summary>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs text-[var(--muted)]">utm_source</label>
          <Input name="utmSource" placeholder="newsletter" disabled={disabled} />
        </div>
        <div>
          <label className="mb-1 block text-xs text-[var(--muted)]">utm_medium</label>
          <Input name="utmMedium" placeholder="email" disabled={disabled} />
        </div>
        <div>
          <label className="mb-1 block text-xs text-[var(--muted)]">utm_campaign</label>
          <Input name="utmCampaign" placeholder="spring-sale" disabled={disabled} />
        </div>
        <div>
          <label className="mb-1 block text-xs text-[var(--muted)]">utm_term</label>
          <Input name="utmTerm" placeholder="keyword" disabled={disabled} />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs text-[var(--muted)]">utm_content</label>
          <Input name="utmContent" placeholder="cta-button" disabled={disabled} />
        </div>
      </div>
      <p className="mt-2 text-xs text-[var(--muted)]">
        创建时自动附加到目标 URL，便于 Google Analytics 等工具追踪来源。
      </p>
    </details>
  );
}