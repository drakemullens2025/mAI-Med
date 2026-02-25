"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@stackframe/stack";
import { PageShell } from "@/components/layout/page-shell";
import { RequestCard } from "@/components/consultation/request-card";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { createSupabaseClient } from "@/supabase/client";
import { useRealtimeTable } from "@/lib/realtime";
import type { Consultation } from "@/lib/types";
import Link from "next/link";

export default function PatientDashboard() {
  const user = useUser({ or: "redirect" });
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConsultations = useCallback(async () => {
    const res = await fetch("/api/consultations");
    if (res.ok) {
      setConsultations(await res.json());
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchConsultations(); }, [fetchConsultations]);

  const supabase = createSupabaseClient();
  useRealtimeTable(supabase, "consultations", `patient_id=eq.${user.id}`, fetchConsultations);

  const active = consultations.filter((c) => !["completed", "cancelled"].includes(c.status));
  const past = consultations.filter((c) => ["completed", "cancelled"].includes(c.status));

  return (
    <PageShell>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Hi, {user.displayName?.split(" ")[0]}</h1>
          <p className="text-sm text-text-secondary">How are you feeling today?</p>
        </div>
        <Link href="/patient/new-request">
          <Button size="sm">New Visit</Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : consultations.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-lg font-medium text-text">No visits yet</p>
          <p className="mt-1 text-sm text-text-secondary">Start your first consultation</p>
          <Link href="/patient/new-request">
            <Button className="mt-4">Start a Visit</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {active.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-secondary">Active</h2>
              <div className="space-y-3">
                {active.map((c) => <RequestCard key={c.id} consultation={c} basePath="/patient" />)}
              </div>
            </section>
          )}
          {past.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-secondary">Past</h2>
              <div className="space-y-3">
                {past.map((c) => <RequestCard key={c.id} consultation={c} basePath="/patient" />)}
              </div>
            </section>
          )}
        </div>
      )}
    </PageShell>
  );
}
