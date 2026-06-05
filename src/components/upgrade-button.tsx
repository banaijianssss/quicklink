"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface UpgradeButtonProps {
  label?: string;
  plan?: string;
  billing?: "monthly" | "annual";
  className?: string;
  variant?: "primary" | "secondary" | "ghost" | "danger";
}

export function UpgradeButton({
  label = "升级到 Pro",
  plan = "pro",
  billing = "monthly",
  className,
  variant = "primary",
}: UpgradeButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function checkout() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, billing }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Checkout failed");
        return;
      }
      if (data.url) window.location.href = data.url;
    } catch {
      setError("网络错误");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Button onClick={checkout} disabled={loading} className={className} variant={variant}>
        {loading ? "跳转中…" : label}
      </Button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
