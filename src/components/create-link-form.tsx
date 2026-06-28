"use client";

import { useState } from "react";
import { createLinkAction } from "@/actions/links";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getPlanLimits, isPro } from "@/lib/plans";
import { buildShortUrl } from "@/lib/utils";
import { UtmBuilder } from "@/components/utm-builder";
import { TargetingFields } from "@/components/targeting-fields";
import { DomainSelect } from "@/components/domain-select";
import { FolderSelect } from "@/components/folder-select";
import { Phase3Fields } from "@/components/phase3-fields";

type VerifiedDomain = { id: string; hostname: string };
type FolderOption = { id: string; name: string; color?: string };

export function CreateLinkForm({
  plan,
  verifiedDomains = [],
  folders = [],
}: {
  plan: string;
  verifiedDomains?: VerifiedDomain[];
  folders?: FolderOption[];
}) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const limits = getPlanLimits(plan);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    setSuccess(null);
    const result = await createLinkAction(formData);
    setPending(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    if (result?.link) {
      setSuccess(buildShortUrl(result.link.slug));
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
          <label className="mb-1 block text-sm font-medium">自定义短链</label>
          <Input name="customSlug" placeholder="my-campaign" />
        </div>
      )}
      {limits.linkTags && (
        <div>
          <label className="mb-1 block text-sm font-medium">标签（逗号分隔）</label>
          <Input name="tags" placeholder="campaign, social, q2" />
        </div>
      )}
      {limits.utmBuilder && <UtmBuilder />}
      {limits.linkExpiration && (
        <div>
          <label className="mb-1 block text-sm font-medium">过期时间（可选）</label>
          <Input name="expiresAt" type="datetime-local" />
        </div>
      )}
      {limits.passwordProtection && (
        <div>
          <label className="mb-1 block text-sm font-medium">访问密码（可选，Pro）</label>
          <Input name="password" type="password" placeholder="设置后访客需输入密码" />
        </div>
      )}
      {limits.qrCustomization && (
        <div>
          <label className="mb-1 block text-sm font-medium">二维码颜色</label>
          <Input name="qrColor" type="color" defaultValue="#000000" className="h-10 w-20 p-1" />
        </div>
      )}
      {limits.customDomain && verifiedDomains.length > 0 && (
        <DomainSelect domains={verifiedDomains} />
      )}
      {limits.linkFolders && folders.length > 0 && (
        <FolderSelect folders={folders} />
      )}
      <TargetingFields limits={limits} />
      <Phase3Fields limits={limits} />
      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && (
        <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">
          创建成功：<a href={success} className="font-medium underline">{success}</a>
        </p>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? "创建中…" : "创建短链"}
      </Button>
    </form>
  );
}