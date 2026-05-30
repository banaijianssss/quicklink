"use client";

import { useState } from "react";
import { deleteLinkAction, toggleLinkAction } from "@/actions/links";
import { buildShortUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { BarChart3, Copy, QrCode, Trash2 } from "lucide-react";
import Link from "next/link";

type LinkItem = {
  id: string;
  slug: string;
  destination: string;
  title: string | null;
  active: boolean;
  _count: { clicks: number };
};

export function LinkRow({ link }: { link: LinkItem }) {
  const [copied, setCopied] = useState(false);
  const shortUrl = buildShortUrl(link.slug);

  async function copyUrl() {
    await navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-[var(--border)] bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 flex-1">
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
      </div>
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
        <form
          action={async () => {
            await toggleLinkAction(link.id, !link.active);
          }}
        >
          <Button variant="ghost" type="submit">
            {link.active ? "暂停" : "启用"}
          </Button>
        </form>
        <form
          action={async () => {
            if (confirm("确定删除此链接？")) await deleteLinkAction(link.id);
          }}
        >
          <Button variant="danger" type="submit">
            <Trash2 className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
