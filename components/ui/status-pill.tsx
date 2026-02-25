import { Badge } from "./badge";
import { getStatusConfig } from "@/lib/utils";
import type { ConsultationStatus } from "@/lib/types";

export function StatusPill({ status }: { status: ConsultationStatus }) {
  const config = getStatusConfig(status);
  return <Badge className={config.color}>{config.label}</Badge>;
}
