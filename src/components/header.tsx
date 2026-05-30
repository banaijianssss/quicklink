import Link from "next/link";
import { auth, signOut } from "@/auth";
import { Button } from "@/components/ui/button";

export async function Header() {
  const session = await auth();

  return (
    <header className="border-b border-[var(--border)] bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-bold tracking-tight">
          Quick<span className="text-[var(--primary)]">Link</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/pricing" className="text-[var(--muted)] hover:text-foreground">
            定价
          </Link>
          {session?.user ? (
            <>
              <Link href="/dashboard">仪表盘</Link>
              <Link href="/settings">设置</Link>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <Button type="submit" variant="ghost" className="!px-2">
                  退出
                </Button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="text-[var(--muted)] hover:text-foreground">
                登录
              </Link>
              <Link href="/register">
                <Button>免费注册</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
