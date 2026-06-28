"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function BioPageForm() {
  const router = useRouter();
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [bio, setBio] = useState("");
  const [links, setLinks] = useState("我的网站,https://example.com");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit() {
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

    const res = await fetch("/api/bio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, title, bio, links: parsedLinks }),
    });
    const data = await res.json();
    setPending(false);
    if (!res.ok) {
      setError(data.error || "创建失败");
      return;
    }
    router.refresh();
    setSlug("");
    setTitle("");
    setBio("");
  }

  return (
    <Card className="space-y-3">
      <h2 className="font-semibold">新建落地页</h2>
      <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="slug（如 my-links）" />
      <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="页面标题" />
      <Input value={bio} onChange={(e) => setBio(e.target.value)} placeholder="简介（可选）" />
      <textarea
        className="w-full min-h-[100px] rounded-lg border border-[var(--border)] p-3 text-sm"
        value={links}
        onChange={(e) => setLinks(e.target.value)}
        placeholder={"每行：标题,URL\n博客,https://blog.example.com"}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button onClick={submit} disabled={pending || !slug.trim()}>创建落地页</Button>
    </Card>
  );
}