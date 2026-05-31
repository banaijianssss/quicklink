"use client";

import { useState } from "react";
import { deleteLinkAction, toggleLinkAction, updateLinkAction } from "@/actions/links";
import { buildShortUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BarChart3, Copy, Pencil, QrCode, Trash2 } from "lucide-react";
import Link from "next/link";
import { isPro } from "@/lib/plans";

type LinkItem = {
  id: string;
  slug: string;
  destination: string;
  title: string | null;
  active: boolean;
  _count: { clicks: number };
};

export function LinkRow({ link, plan }: { link: LinkItem; plan: string }) {
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const shortUrl = buildShortUrl(link.slug);

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
            <p className="mt-1 text-xs text-[var(--muted)]">
              {link._count.clicks} 次点击 · {link.active ? "启用" : "已暂停"}
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
