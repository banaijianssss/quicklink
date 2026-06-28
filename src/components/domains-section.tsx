"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

type Domain = {
  id: string;
  hostname: string;
  verified: boolean;
  verificationToken: string;
};

export function DomainsSection({ initialDomains }: { initialDomains: Domain[] }) {
  const [domains, setDomains] = useState(initialDomains);
  const [hostname, setHostname] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function addDomain() {
    setPending(true);
    setError(null);
    const res = await fetch("/api/domains", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hostname }),
    });
    const data = await res.json();
    setPending(false);
    if (!res.ok) {
      setError(data.error || "Failed");
      return;
    }
    setDomains((d) => [data.domain, ...d]);
    setHostname("");
  }

  async function verifyDomain(id: string) {
    const res = await fetch(`/api/domains/${id}/verify`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Verification failed");
      return;
    }
    setDomains((list) => list.map((d) => (d.id === id ? data.domain : d)));
    setError(null);
  }

  return (
    <Card className="space-y-4">
      <div>
        <h2 className="font-semibold">自定义域名</h2>
        <p className="text-sm text-[var(--muted)]">
          在 DNS 添加 TXT 记录后点击验证。CNAME 指向你的 Vercel 部署域名。
        </p>
      </div>
      <div className="flex gap-2">
        <Input
          value={hostname}
          onChange={(e) => setHostname(e.target.value)}
          placeholder="links.example.com"
        />
        <Button onClick={addDomain} disabled={pending || !hostname.trim()}>
          添加
        </Button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <ul className="space-y-3">
        {domains.map((d) => (
          <li key={d.id} className="rounded-lg border border-[var(--border)] p-3 text-sm">
            <p className="font-medium">{d.hostname}</p>
            <p className="text-[var(--muted)]">
              {d.verified ? "✓ 已验证" : "待验证"}
            </p>
            {!d.verified && (
              <>
                <p className="mt-2 text-xs break-all">
                  TXT: _quicklink-verify.{d.hostname} = {d.verificationToken}
                </p>
                <Button className="mt-2" variant="secondary" onClick={() => verifyDomain(d.id)}>
                  验证 DNS
                </Button>
              </>
            )}
          </li>
        ))}
      </ul>
    </Card>
  );
}