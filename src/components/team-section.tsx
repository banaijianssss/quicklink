"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

type Member = {
  id: string;
  email: string;
  role: string;
  acceptedAt: string | null;
  token: string;
  member: { email: string; name: string | null } | null;
};

export function TeamSection({
  initialMembers,
  appUrl,
}: {
  initialMembers: Member[];
  appUrl: string;
}) {
  const [members, setMembers] = useState(initialMembers);
  const [email, setEmail] = useState("");
  const [lastInviteUrl, setLastInviteUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function invite() {
    setError(null);
    setLastInviteUrl(null);
    const res = await fetch("/api/team", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role: "editor" }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "邀请失败");
      return;
    }
    setMembers((list) => [data.invite, ...list.filter((m) => m.id !== data.invite.id)]);
    setLastInviteUrl(data.inviteUrl || `${appUrl}/team/accept?token=${data.invite.token}`);
    setEmail("");
  }

  return (
    <Card className="space-y-4">
      <div>
        <h2 className="font-semibold">团队协作（Business）</h2>
        <p className="text-sm text-[var(--muted)]">
          邀请成员共同管理链接。成员接受邀请后可访问你的工作区。
        </p>
      </div>
      <div className="flex gap-2">
        <Input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="member@example.com"
        />
        <Button onClick={invite} disabled={!email.trim()}>邀请</Button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {lastInviteUrl && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm break-all">
          邀请链接：<a href={lastInviteUrl} className="text-[var(--primary)] underline">{lastInviteUrl}</a>
        </div>
      )}
      <ul className="space-y-2 text-sm">
        {members.map((m) => (
          <li key={m.id} className="rounded border border-[var(--border)] p-2">
            <p className="font-medium">{m.email}</p>
            <p className="text-[var(--muted)]">
              {m.acceptedAt ? `已加入 · ${m.role}` : `待接受 · ${m.role}`}
            </p>
          </li>
        ))}
      </ul>
    </Card>
  );
}