"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@stackframe/stack";
import { PageShell } from "@/components/layout/page-shell";
import { QueueCard } from "@/components/consultation/queue-card";
import { RequestCard } from "@/components/consultation/request-card";
import { Spinner } from "@/components/ui/spinner";
import { createSupabaseClient } from "@/supabase/client";
import { useRealtimeTable } from "@/lib/realtime";
import type { Consultation } from "@/lib/types";

export default function DoctorDashboard() {
  const user = useUser({ or: "redirect" });
  const router = useRouter();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  const fetchConsultations = useCallback(async () => {
    const res = await fetch("/api/consultations");
    if (res.ok) setConsultations(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchConsultations(); }, [fetchConsultations]);

  const supabase = createSupabaseClient();
  useRealtimeTable(supabase, "consultations", undefined, fetchConsultations);

  async function handleAccept(id: string) {
    setAcceptingId(id);
    const res = await fetch(`/api/consultations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "accept" }),
    });
    if (res.ok) {
      router.push(`/doctor/consultation/${id}`);
    } else {
      fetchConsultations();
    }
    setAcceptingId(null);
  }

  const pending = consultations.filter((c) => c.status === "pending");
  const active = consultations.filter((c) => ["accepted", "in_review"].includes(c.status) && c.doctor_id === user.id);
  const done = consultations.filter((c) => ["prescribed", "follow_up", "completed"].includes(c.status) && c.doctor_id === user.id);

  return (
    <PageShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text">Dr. {user.displayName?.split(" ").pop()}</h1>
        <p className="text-sm text-text-secondary">
          {pending.length} patient{pending.length !== 1 ? "s" : ""} waiting
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : (
        <div className="space-y-6">
          {pending.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-secondary">Incoming Requests</h2>
              <div className="space-y-3">
                {pending.map((c) => (
                  <QueueCard
                    key={c.id}
                    consultation={c}
                    onAccept={handleAccept}
                    accepting={acceptingId === c.id}
                  />
                ))}
              </div>
            </section>
          )}

          {active.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-secondary">Active</h2>
              <div className="space-y-3">
                {active.map((c) => <RequestCard key={c.id} consultation={c} basePath="/doctor" />)}
              </div>
            </section>
          )}

          {done.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-secondary">Completed</h2>
              <div className="space-y-3">
                {done.map((c) => <RequestCard key={c.id} consultation={c} basePath="/doctor" />)}
              </div>
            </section>
          )}

          {pending.length === 0 && active.length === 0 && done.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-lg font-medium text-text">No patients yet</p>
              <p className="mt-1 text-sm text-text-secondary">New requests will appear here in real-time</p>
            </div>
          )}
        </div>
      )}
    </PageShell>
  );
}
