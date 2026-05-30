"use client";

import { useState } from "react";
import { createLinkAction } from "@/actions/links";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { isPro } from "@/lib/plans";

export function CreateLinkForm({ plan }: { plan: string }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    const result = await createLinkAction(formData);
    setPending(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    const form = document.getElementById("create-link-form") as HTMLFormElement;
    form?.reset();
  }

  return (
    <form id="create-link-form" action={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium">目标 URL</label>
        <Input name="destination" placeholder="https://example.com/page" required />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">标题（可选）</label>
        <Input name="title" placeholder="营销活动落地页" />
      </div>
      {isPro(plan) && (
        <div>
          <label className="mb-1 block text-sm font-medium">自定义短链（Pro）</label>
          <Input name="customSlug" placeholder="my-campaign" />
        </div>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "创建中…" : "创建短链"}
      </Button>
    </form>
  );
}
