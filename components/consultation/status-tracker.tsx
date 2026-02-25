import { cn } from "@/lib/utils";
import type { ConsultationStatus } from "@/lib/types";

const STEPS: { status: ConsultationStatus; label: string }[] = [
  { status: "pending", label: "Submitted" },
  { status: "accepted", label: "Doctor Assigned" },
  { status: "in_review", label: "Under Review" },
  { status: "prescribed", label: "Prescribed" },
  { status: "completed", label: "Completed" },
];

const STATUS_ORDER: Record<string, number> = {
  pending: 0,
  accepted: 1,
  in_review: 2,
  prescribed: 3,
  follow_up: 3,
  completed: 4,
  cancelled: -1,
};

export function StatusTracker({ status }: { status: ConsultationStatus }) {
  const currentOrder = STATUS_ORDER[status] ?? 0;

  if (status === "cancelled") {
    return (
      <div className="rounded-xl bg-red-50 p-4 text-center">
        <p className="text-sm font-medium text-danger">Consultation Cancelled</p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {STEPS.map((step, i) => {
        const stepOrder = STATUS_ORDER[step.status];
        const isActive = stepOrder <= currentOrder;
        const isCurrent = stepOrder === currentOrder;
        return (
          <div key={step.status} className="flex items-center gap-3">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "h-3 w-3 rounded-full border-2 transition-colors",
                  isActive ? "border-primary bg-primary" : "border-border bg-white",
                  isCurrent && "ring-4 ring-primary/20"
                )}
              />
              {i < STEPS.length - 1 && (
                <div className={cn("h-8 w-0.5", isActive ? "bg-primary" : "bg-border")} />
              )}
            </div>
            <span
              className={cn(
                "text-sm",
                isActive ? "font-medium text-text" : "text-text-secondary"
              )}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
