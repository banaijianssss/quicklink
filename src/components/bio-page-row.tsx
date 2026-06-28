"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type BioLinkItem = { id: string; title: string; url: string; active: boolean };

type BioPage = {
  id: string;
  slug: string;
  title: string | null;
  bio: string | null;
  links: unknown;
  active: boolean;
  _count: { views: number };
};

function formatLinksForTextarea(links: unknown): string {
  if (!Array.isArray(links)) return "";
  return links
    .map((item) => {
      if (!item || typeof item !== "object") return "";
      const row = item as BioLinkItem;
      return `${row.title || ""},${row.url || ""}`;
    })
    .filter(Boolean)
    .join("\n");
}

export function BioPageRow({ page, publicUrl }: { page: BioPage; publicUrl: string }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(page.title ?? "");
  const [bio, setBio] = useState(page.bio ?? "");
  const [links, setLinks] = useState(formatLinksForTextarea(page.links));
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function save() {
    setPending(true);
    setError(null);
    const parsedLinks = links
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line, i) => {
        const [t, u] = line.split(",").map((s) => s.trim());
        return { id: `l-${i}`, title: t, url: u, active: true };
      });

    const res = await fetch(`/api/bio/${page.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, bio, links: parsedLinks }),
    });
    const data = await res.json();
    setPending(false);
    if (!res.ok) {
      setError(data.error || "保存失败");
      return;
    }
    setEditing(false);
    router.refresh();
  }

  async function toggleActive() {
    const res = await fetch(`/api/bio/${page.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !page.active }),
    });
    if (res.ok) router.refresh();
  }

  return (
    <div className="rounded-xl border border-[var(--border)] bg-white p-4 space-y-3">
      {editing ? (
        <>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="页面标题" />
          <Input value={bio} onChange={(e) => setBio(e.target.value)} placeholder="简介（可选）" />
          <textarea
            className="w-full min-h-[100px] rounded-lg border border-[var(--border)] p-3 text-sm"
            value={links}
            onChange={(e) => setLinks(e.target.value)}
            placeholder={"每行：标题,URL"}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2">
            <Button onClick={save} disabled={pending}>保存</Button>
            <Button variant="ghost" onClick={() => setEditing(false)}>取消</Button>
          </div>
        </>
      ) : (
        <>
          <p className="font-medium">{page.title || page.slug}</p>
          <a
            href={publicUrl}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-[var(--primary)] hover:underline"
          >
            {publicUrl}
          </a>
          <p className="text-xs text-[var(--muted)]">
            {page._count.views} 次浏览 · {page.active ? "启用" : "暂停"}
          </p>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setEditing(true)}>编辑</Button>
            <Button variant="ghost" onClick={toggleActive}>
              {page.active ? "暂停" : "启用"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}