"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Folder = {
  id: string;
  name: string;
  color: string;
  _count: { links: number };
};

export function FoldersBar({ folders }: { folders: Folder[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const active = params.get("folder") || "";
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  function navigate(folderId: string) {
    const q = new URLSearchParams(params.toString());
    if (folderId) q.set("folder", folderId);
    else q.delete("folder");
    router.push(`/dashboard?${q.toString()}`);
  }

  async function createFolder() {
    setError(null);
    const res = await fetch("/api/folders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "创建失败");
      return;
    }
    setName("");
    router.refresh();
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant={active ? "ghost" : "secondary"}
          onClick={() => navigate("")}
        >
          全部
        </Button>
        {folders.map((f) => (
          <Button
            key={f.id}
            type="button"
            variant={active === f.id ? "secondary" : "ghost"}
            onClick={() => navigate(f.id)}
          >
            <span
              className="mr-2 inline-block h-2 w-2 rounded-full"
              style={{ background: f.color }}
            />
            {f.name} ({f._count.links})
          </Button>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="新建文件夹名称"
        />
        <Button type="button" onClick={createFolder} disabled={!name.trim()}>
          添加文件夹
        </Button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}