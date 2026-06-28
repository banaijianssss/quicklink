"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

type Hook = {
  id: string;
  url: string;
  active: boolean;
  createdAt: string;
};

type CreatedHook = Hook & { secret: string };

export function WebhooksSection({ initialHooks }: { initialHooks: Hook[] }) {
  const [hooks, setHooks] = useState(initialHooks);
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [lastSecret, setLastSecret] = useState<string | null>(null);

  async function createHook() {
    setError(null);
    setLastSecret(null);
    const res = await fetch("/api/webhooks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed");
      return;
    }
    const created = data.webhook as CreatedHook;
    setHooks((h) => [
      { id: created.id, url: created.url, active: created.active, createdAt: created.createdAt },
      ...h,
    ]);
    setLastSecret(created.secret);
    setUrl("");
  }

  async function deleteHook(id: string) {
    setError(null);
    const res = await fetch(`/api/webhooks/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Delete failed");
      return;
    }
    setHooks((h) => h.filter((hook) => hook.id !== id));
  }

  return (
    <Card className="space-y-4">
      <div>
        <h2 className="font-semibold">点击 Webhook（Pro+）</h2>
        <p className="text-sm text-[var(--muted)]">
          每次短链点击会向你的 HTTPS 端点发送 JSON，签名头 X-QuickLink-Signature。
        </p>
      </div>
      <div className="flex gap-2">
        <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com/webhook" />
        <Button onClick={createHook} disabled={!url.trim()}>添加</Button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {lastSecret && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm">
          <p className="font-medium text-amber-900">Webhook 密钥（仅显示一次，请妥善保存）</p>
          <code className="mt-2 block break-all text-xs">{lastSecret}</code>
        </div>
      )}
      <ul className="space-y-2 text-sm">
        {hooks.map((h) => (
          <li key={h.id} className="flex items-start justify-between gap-3 rounded border border-[var(--border)] p-2">
            <span className="break-all">{h.url}</span>
            <Button variant="danger" type="button" onClick={() => deleteHook(h.id)}>
              删除
            </Button>
          </li>
        ))}
      </ul>
    </Card>
  );
}