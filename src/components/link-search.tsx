"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function LinkSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const tag = searchParams.get("tag") ?? "";

  function onSubmit(formData: FormData) {
    const nextQ = String(formData.get("q") ?? "").trim();
    const nextTag = String(formData.get("tag") ?? "").trim();
    const params = new URLSearchParams();
    if (nextQ) params.set("q", nextQ);
    if (nextTag) params.set("tag", nextTag);
    router.push(`/dashboard${params.toString() ? `?${params.toString()}` : ""}`);
  }

  return (
    <form action={onSubmit} className="mb-4 flex flex-wrap gap-2">
      <Input
        name="q"
        defaultValue={q}
        placeholder="搜索 slug / 标题 / URL"
        className="min-w-[220px] flex-1"
      />
      <Input
        name="tag"
        defaultValue={tag}
        placeholder="按标签筛选"
        className="w-36"
      />
      <Button type="submit" variant="secondary">搜索</Button>
    </form>
  );
}