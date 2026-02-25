"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { timeAgo } from "@/lib/utils";
import type { Consultation } from "@/lib/types";

interface QueueCardProps {
  consultation: Consultation;
  onAccept: (id: string) => void;
  accepting?: boolean;
}

export function QueueCard({ consultation, onAccept, accepting }: QueueCardProps) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-medium text-text">{consultation.chief_complaint}</p>
          <div className="mt-2 flex items-center gap-2">
            <Badge className="bg-amber-100 text-amber-800">Waiting</Badge>
            <span className="text-xs text-text-secondary">{timeAgo(consultation.created_at)}</span>
            {consultation.video_url && (
              <Badge className="bg-blue-100 text-blue-800">Video</Badge>
            )}
          </div>
        </div>
        <Button
          size="sm"
          onClick={() => onAccept(consultation.id)}
          loading={accepting}
        >
          Accept
        </Button>
      </div>
    </Card>
  );
}
