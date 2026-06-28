"use client";

import { useState } from "react";
import { deleteLinkAction, toggleLinkAction, updateLinkAction } from "@/actions/links";
import { buildShortUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BarChart3, Copy, Pencil, QrCode, Trash2 } from "lucide-react";
import Link from "next/link";
import { getPlanLimits, isPro } from "@/lib/plans";
import {
  formatDeviceRulesForForm,
  formatGeoRulesForForm,
} from "@/components/targeting-fields";
import { DomainSelect } from "@/components/domain-select";
import { FolderSelect } from "@/components/folder-select";
import { formatAbVariantsField } from "@/components/phase3-fields";

type LinkItem = {
  id: string;
  slug: string;
  destination: string;
  title: string | null;
  tags?: string[];
  expiresAt?: Date | string | null;
  passwordHash?: string | null;
  iosDestination?: string | null;
  androidDestination?: string | null;
  geoRules?: unknown;
  deviceRules?: unknown;
  domainId?: string | null;
  domain?: { hostname: string } | null;
  folderId?: string | null;
  folder?: { id: string; name: string; color: string } | null;
  startsAt?: Date | string | null;
  abVariants?: unknown;
  active: boolean;
  _count: { clicks: number };
};

type VerifiedDomain = { id: string; hostname: string };
type FolderOption = { id: string; name: string; color?: string };

export function LinkRow({
  link,
  plan,
  verifiedDomains = [],
  folders = [],
}: {
  link: LinkItem;
  plan: string;
  verifiedDomains?: VerifiedDomain[];
  folders?: FolderOption[];
}) {
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const limits = getPlanLimits(plan);
  const shortUrl = buildShortUrl(link.slug, link.domain?.hostname);

  async function copyUrl() {
    await navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleUpdate(formData: FormData) {
    setError(null);
    const result = await updateLinkAction(link.id, formData);
    if (result?.error) {
      setError(result.error);
      return;
    }
    setEditing(false);
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-[var(--border)] bg-white p-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 flex-1">
        {editing ? (
          <form action={handleUpdate} className="space-y-3">
            <Input name="destination" defaultValue={link.destination} required />
            <Input name="title" defaultValue={link.title ?? ""} placeholder="标题（可选）" />
            {isPro(plan) && (
              <Input name="customSlug" defaultValue={link.slug} placeholder="自定义 slug" />
            )}
            {limits.customDomain && verifiedDomains.length > 0 && (
              <DomainSelect domains={verifiedDomains} defaultValue={link.domainId} />
            )}
            {limits.linkFolders && folders.length > 0 && (
              <FolderSelect folders={folders} defaultValue={link.folderId} />
            )}
            {limits.linkScheduling && (
              <input
                name="startsAt"
                type="datetime-local"
                defaultValue={
                  link.startsAt
                    ? new Date(link.startsAt).toISOString().slice(0, 16)
                    : ""
                }
                className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm"
              />
            )}
            {limits.abTesting && (
              <textarea
                name="abVariants"
                defaultValue={formatAbVariantsField(link.abVariants)}
                className="w-full min-h-[88px] rounded-lg border border-[var(--border)] p-2 text-sm"
                placeholder="A/B：名称,权重,URL"
              />
            )}
            {limits.deviceTargeting && (
              <>
                <Input
                  name="iosDestination"
                  defaultValue={link.iosDestination ?? ""}
                  placeholder="iOS 跳转 URL（可选）"
                />
                <Input
                  name="androidDestination"
                  defaultValue={link.androidDestination ?? ""}
                  placeholder="Android 跳转 URL（可选）"
                />
                <textarea
                  name="deviceRules"
                  defaultValue={formatDeviceRulesForForm(link.deviceRules)}
                  className="w-full min-h-[72px] rounded-lg border border-[var(--border)] p-2 text-sm"
                  placeholder="设备规则：ios,URL"
                />
              </>
            )}
            {limits.geoTargeting && (
              <textarea
                name="geoRules"
                defaultValue={formatGeoRulesForForm(link.geoRules)}
                className="w-full min-h-[72px] rounded-lg border border-[var(--border)] p-2 text-sm"
                placeholder="地区规则：US,URL"
              />
            )}
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex gap-2">
              <Button type="submit">保存</Button>
              <Button type="button" variant="ghost" onClick={() => setEditing(false)}>
                取消
              </Button>
            </div>
          </form>
        ) : (
          <>
            <p className="font-medium truncate">{link.title || link.slug}</p>
            <a
              href={shortUrl}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-[var(--primary)] hover:underline"
            >
              {shortUrl}
            </a>
            <p className="mt-1 text-xs text-[var(--muted)] truncate">{link.destination}</p>
            {link.tags && link.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {link.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] text-blue-700">
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <p className="mt-1 text-xs text-[var(--muted)]">
              {link._count.clicks} 次点击 · {link.active ? "启用" : "已暂停"}
              {link.passwordHash ? " · 🔒 密码保护" : ""}
              {link.expiresAt ? ` · ⏱ ${new Date(link.expiresAt).toLocaleString("zh-CN")} 过期` : ""}
              {link.folder?.name ? ` · 📁 ${link.folder.name}` : ""}
              {link.domain?.hostname ? ` · 🌐 ${link.domain.hostname}` : ""}
              {link.startsAt ? ` · ⏳ ${new Date(link.startsAt).toLocaleString("zh-CN")} 上线` : ""}
              {Array.isArray(link.abVariants) && link.abVariants.length >= 2 ? " · 🔀 A/B" : ""}
              {(link.iosDestination || link.androidDestination) ? " · 📱 设备定向" : ""}
              {Array.isArray(link.geoRules) && link.geoRules.length ? " · 🌍 地区定向" : ""}
            </p>
          </>
        )}
      </div>
      {!editing && (
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={copyUrl} type="button">
            <Copy className="h-4 w-4" />
            {copied ? "已复制" : "复制"}
          </Button>
          <a href={`/api/qr/${link.slug}`} target="_blank" rel="noreferrer">
            <Button variant="secondary" type="button">
              <QrCode className="h-4 w-4" />
              二维码
            </Button>
          </a>
          <Link href={`/dashboard/links/${link.id}`}>
            <Button variant="secondary" type="button">
              <BarChart3 className="h-4 w-4" />
              分析
            </Button>
          </Link>
          <Button variant="ghost" type="button" onClick={() => setEditing(true)}>
            <Pencil className="h-4 w-4" />
            编辑
          </Button>
          <form
            action={async () => {
              await toggleLinkAction(link.id, !link.active);
            }}
          >
            <Button variant="ghost" type="submit">
              {link.active ? "暂停" : "启用"}
            </Button>
          </form>
          {confirmDelete ? (
            <div className="flex gap-2">
              <form
                action={async () => {
                  await deleteLinkAction(link.id);
                }}
              >
                <Button variant="danger" type="submit">确认删除</Button>
              </form>
              <Button variant="ghost" type="button" onClick={() => setConfirmDelete(false)}>
                取消
              </Button>
            </div>
          ) : (
            <Button variant="danger" type="button" onClick={() => setConfirmDelete(true)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
