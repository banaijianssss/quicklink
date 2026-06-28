"use client";

import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";

function AcceptForm() {
  const params = useSearchParams();
  const token = params.get("token") || "";
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");

  async function accept() {
    const res = await fetch("/api/team/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    const data = await res.json();
    if (!res.ok) {
      setStatus("error");
      setMessage(data.error || "接受失败");
      return;
    }
    setStatus("ok");
    setMessage("已成功加入团队，可返回仪表盘查看共享链接。");
  }

  return (
    <Card className="mx-auto max-w-md space-y-4 p-6">
      <h1 className="text-xl font-bold">接受团队邀请</h1>
      {!token ? (
        <p className="text-sm text-red-600">邀请链接无效，缺少 token。</p>
      ) : (
        <>
          <p className="text-sm text-[var(--muted)]">
            请使用被邀请邮箱登录后点击下方按钮完成加入。
          </p>
          <Button onClick={accept}>接受邀请</Button>
          {status === "ok" && <p className="text-sm text-green-700">{message}</p>}
          {status === "error" && <p className="text-sm text-red-600">{message}</p>}
        </>
      )}
      <Link href="/dashboard" className="text-sm text-[var(--primary)] hover:underline">
        返回仪表盘
      </Link>
    </Card>
  );
}

export default function TeamAcceptPage() {
  return (
    <div className="px-4 py-16">
      <Suspense fallback={<p className="text-center text-sm">加载中…</p>}>
        <AcceptForm />
      </Suspense>
    </div>
  );
}