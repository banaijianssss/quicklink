"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function BulkImportForm() {
  const [csv, setCsv] = useState("destination,title,slug\nhttps://example.com,Example,example");
  const [result, setResult] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function runImport() {
    setPending(true);
    setResult(null);
    const res = await fetch("/api/links/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ csv }),
    });
    const data = await res.json();
    setPending(false);
    if (!res.ok) {
      setResult(data.error || "Import failed");
      return;
    }
    setResult(`成功导入 ${data.imported}/${data.total} 条`);
  }

  return (
    <Card className="space-y-3">
      <h2 className="font-semibold">批量导入 CSV（Pro+）</h2>
      <p className="text-sm text-[var(--muted)]">列：destination, title, slug（后两列可选）</p>
      <textarea
        className="w-full min-h-[120px] rounded-lg border border-[var(--border)] p-3 text-sm"
        value={csv}
        onChange={(e) => setCsv(e.target.value)}
      />
      <Button onClick={runImport} disabled={pending}>
        {pending ? "导入中…" : "批量创建"}
      </Button>
      {result && <p className="text-sm text-green-700">{result}</p>}
    </Card>
  );
}