"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerUser } from "@/actions/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      const result = await registerUser(formData);
      return result ?? null;
    },
    null
  );

  return (
    <>
      <form action={formAction} className="mt-6 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">姓名</label>
          <Input name="name" required disabled={pending} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">邮箱</label>
          <Input name="email" type="email" required disabled={pending} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">密码（至少 8 位）</label>
          <Input name="password" type="password" minLength={8} required disabled={pending} />
        </div>
        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "创建中…" : "创建账号"}
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-[var(--muted)]">
        已有账号？{" "}
        <Link href="/login" className="text-[var(--primary)] hover:underline">
          登录
        </Link>
      </p>
    </>
  );
}
