"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, RefreshCw, Trash2, Eye, EyeOff } from "lucide-react";

interface ApiKeySectionProps {
  initialApiKey: string | null;
}

export function ApiKeySection({ initialApiKey }: ApiKeySectionProps) {
  const [apiKey, setApiKey] = useState<string | null>(initialApiKey);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  async function generateKey() {
    setLoading(true);
    try {
      const res = await fetch("/api/account/api-key", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setApiKey(data.apiKey);
        setVisible(true);
      }
    } finally {
      setLoading(false);
    }
  }

  async function revokeKey() {
    if (!confirm("确认吊销 API Key？现有集成将立即失效。")) return;
    setLoading(true);
    try {
      const res = await fetch("/api/account/api-key", { method: "DELETE" });
      if (res.ok) setApiKey(null);
    } finally {
      setLoading(false);
    }
  }

  function copyKey() {
    if (!apiKey) return;
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const maskedKey = apiKey ? `ql_${"•".repeat(20)}${apiKey.slice(-6)}` : null;

  return (
    <Card>
      <p className="text-sm font-semibold">API Key（Business）</p>
      <p className="mt-1 text-xs text-[var(--muted)]">
        通过 <code className="bg-gray-100 px-1 rounded text-xs">Authorization: Bearer &lt;key&gt;</code> 头调用
        <code className="bg-gray-100 px-1 rounded text-xs ml-1">GET/POST /api/v1/links</code>
      </p>

      {apiKey ? (
        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 font-mono text-xs break-all">
            <span className="flex-1">{visible ? apiKey : maskedKey}</span>
            <button
              onClick={() => setVisible((v) => !v)}
              className="shrink-0 text-gray-400 hover:text-gray-600"
              title={visible ? "隐藏" : "显示"}
            >
              {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={copyKey} className="text-xs gap-1">
              <Copy className="h-3.5 w-3.5" />
              {copied ? "已复制！" : "复制"}
            </Button>
            <Button variant="secondary" onClick={generateKey} disabled={loading} className="text-xs gap-1">
              <RefreshCw className="h-3.5 w-3.5" />
              重新生成
            </Button>
            <Button variant="secondary" onClick={revokeKey} disabled={loading} className="text-xs gap-1 text-red-600 hover:text-red-700">
              <Trash2 className="h-3.5 w-3.5" />
              吊销
            </Button>
          </div>
          <p className="text-xs text-amber-600">请妥善保管，不要泄露给第三方。</p>
        </div>
      ) : (
        <div className="mt-4">
          <p className="text-sm text-[var(--muted)]">尚未生成 API Key。</p>
          <Button onClick={generateKey} disabled={loading} className="mt-3 text-sm">
            {loading ? "生成中…" : "生成 API Key"}
          </Button>
        </div>
      )}
    </Card>
  );
}
