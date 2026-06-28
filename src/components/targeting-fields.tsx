"use client";

import { Input } from "@/components/ui/input";

type TargetingLimits = {
  geoTargeting: boolean;
  deviceTargeting: boolean;
};

export function TargetingFields({ limits }: { limits: TargetingLimits }) {
  if (!limits.geoTargeting && !limits.deviceTargeting) return null;

  return (
    <div className="space-y-3 rounded-lg border border-[var(--border)] bg-slate-50/50 p-4">
      <p className="text-sm font-medium">智能定向（Pro+）</p>
      {limits.deviceTargeting && (
        <>
          <div>
            <label className="mb-1 block text-xs text-[var(--muted)]">iOS 跳转 URL（可选）</label>
            <Input name="iosDestination" placeholder="https://apps.apple.com/..." />
          </div>
          <div>
            <label className="mb-1 block text-xs text-[var(--muted)]">Android 跳转 URL（可选）</label>
            <Input name="androidDestination" placeholder="https://play.google.com/..." />
          </div>
          <div>
            <label className="mb-1 block text-xs text-[var(--muted)]">
              设备规则（每行：设备,URL — ios / android / desktop）
            </label>
            <textarea
              name="deviceRules"
              className="w-full min-h-[72px] rounded-lg border border-[var(--border)] p-2 text-sm"
              placeholder={"ios,https://apps.apple.com/app\nandroid,https://play.google.com/store"}
            />
          </div>
        </>
      )}
      {limits.geoTargeting && (
        <div>
          <label className="mb-1 block text-xs text-[var(--muted)]">
            地区规则（每行：国家代码,URL — 如 US,https://us.example.com）
          </label>
          <textarea
            name="geoRules"
            className="w-full min-h-[72px] rounded-lg border border-[var(--border)] p-2 text-sm"
            placeholder={"US,https://us.example.com\nCN,https://cn.example.com"}
          />
        </div>
      )}
    </div>
  );
}

export function formatGeoRulesForForm(rules: unknown): string {
  if (!Array.isArray(rules)) return "";
  return rules
    .map((r) => {
      if (!r || typeof r !== "object") return "";
      const row = r as { country?: string; destination?: string };
      return `${row.country || ""},${row.destination || ""}`;
    })
    .filter((line) => line.length > 1)
    .join("\n");
}

export function formatDeviceRulesForForm(rules: unknown): string {
  if (!Array.isArray(rules)) return "";
  return rules
    .map((r) => {
      if (!r || typeof r !== "object") return "";
      const row = r as { device?: string; destination?: string };
      return `${row.device || ""},${row.destination || ""}`;
    })
    .filter((line) => line.length > 1)
    .join("\n");
}