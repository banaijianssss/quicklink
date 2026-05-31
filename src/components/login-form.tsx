"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginUser } from "@/actions/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function LoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      const result = await loginUser(formData);
      return result ?? null;
    },
    null
  );

  return (
    <>
      <form action={formAction} className="mt-6 space-y-4">
        {callbackUrl && (
          <input type="hidden" name="callbackUrl" value={callbackUrl} />
        )}
        <div>
          <label className="mb-1 block text-sm font-medium">邮箱</label>
          <Input name="email" type="email" required autoComplete="email" disabled={pending} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">密码</label>
          <Input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            disabled={pending}
          />
        </div>
        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "登录中…" : "登录"}
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-[var(--muted)]">
        还没有账号？{" "}
        <Link href="/register" className="text-[var(--primary)] hover:underline">
          注册
        </Link>
      </p>
    </>
  );
}
