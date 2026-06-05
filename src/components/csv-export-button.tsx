"use client";

import { Button } from "@/components/ui/button";
import { Download, Lock } from "lucide-react";
import Link from "next/link";

interface CsvExportButtonProps {
  linkId: string;
  canExport: boolean;
}

export function CsvExportButton({ linkId, canExport }: CsvExportButtonProps) {
  if (!canExport) {
    return (
      <Link href="/pricing">
        <Button variant="secondary" className="text-sm gap-1.5 text-[var(--muted)]" title="Pro+ 功能：导出 CSV">
          <Lock className="h-3.5 w-3.5" />
          导出 CSV（Pro+）
        </Button>
      </Link>
    );
  }

  return (
    <a href={`/api/links/${linkId}/analytics/export`} download>
      <Button variant="secondary" className="text-sm gap-1.5">
        <Download className="h-3.5 w-3.5" />
        导出 CSV
      </Button>
    </a>
  );
}
