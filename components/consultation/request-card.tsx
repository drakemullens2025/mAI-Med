"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/status-pill";
import { timeAgo } from "@/lib/utils";
import type { Consultation } from "@/lib/types";

export function RequestCard({ consultation, basePath }: { consultation: Consultation; basePath: string }) {
  return (
    <Link href={`${basePath}/consultation/${consultation.id}`}>
      <Card className="active:bg-surface-2 transition-colors">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="font-medium text-text truncate">{consultation.chief_complaint}</p>
            <p className="mt-1 text-xs text-text-secondary">{timeAgo(consultation.created_at)}</p>
          </div>
          <StatusPill status={consultation.status} />
        </div>
      </Card>
    </Link>
  );
}
