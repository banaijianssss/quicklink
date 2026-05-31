"use client";

export default function DashboardError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <h2 className="text-xl font-bold">加载失败</h2>
      <p className="mt-2 text-sm text-[var(--muted)]">仪表盘出现问题，请重试。</p>
      <button
        onClick={reset}
        className="mt-6 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm text-white"
      >
        重试
      </button>
    </div>
  );
}
