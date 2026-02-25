"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { useUser } from "@stackframe/stack";
import { PageShell } from "@/components/layout/page-shell";
import { Card } from "@/components/ui/card";
import { StatusTracker } from "@/components/consultation/status-tracker";
import { IntakeSummary } from "@/components/intake/intake-summary";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { createSupabaseClient } from "@/supabase/client";
import { useRealtimeTable } from "@/lib/realtime";
import type { Consultation, IntakeResponse, Prescription } from "@/lib/types";

interface ConsultationDetail extends Consultation {
  intake_responses: IntakeResponse[];
  prescriptions: Prescription[];
  video_signed_url: string | null;
}

export default function PatientConsultationPage() {
  useUser({ or: "redirect" });
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<ConsultationDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const res = await fetch(`/api/consultations/${id}`);
    if (res.ok) setData(await res.json());
    setLoading(false);
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const supabase = createSupabaseClient();
  useRealtimeTable(supabase, "consultations", `id=eq.${id}`, fetchData);

  async function handleCancel() {
    await fetch(`/api/consultations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "cancel" }),
    });
    fetchData();
  }

  if (loading) return <PageShell><div className="flex justify-center py-12"><Spinner /></div></PageShell>;
  if (!data) return <PageShell><p className="text-center text-text-secondary">Consultation not found</p></PageShell>;

  const answers = Object.fromEntries(data.intake_responses.map((r) => [r.question_key, r.answer]));

  return (
    <PageShell title={data.chief_complaint}>
      <div className="space-y-4">
        <Card>
          <StatusTracker status={data.status} />
        </Card>

        {data.prescriptions.length > 0 && (
          <Card>
            <h3 className="mb-3 text-sm font-semibold text-text">Prescription</h3>
            {data.prescriptions.map((rx) => (
              <div key={rx.id} className="space-y-2">
                <div className="rounded-xl bg-green-50 p-3">
                  <p className="font-medium text-text">{rx.medication_name}</p>
                  <p className="text-sm text-text-secondary">{rx.dosage} — {rx.frequency}</p>
                  <p className="text-sm text-text-secondary">Duration: {rx.duration}</p>
                  {rx.quantity && <p className="text-sm text-text-secondary">Qty: {rx.quantity}, Refills: {rx.refills}</p>}
                </div>
                {rx.notes_to_patient && (
                  <div className="rounded-xl bg-blue-50 p-3">
                    <p className="text-xs font-medium text-primary">Doctor&apos;s Note</p>
                    <p className="mt-1 text-sm text-text">{rx.notes_to_patient}</p>
                  </div>
                )}
                {rx.pharmacy_notes && (
                  <div className="rounded-xl bg-surface p-3">
                    <p className="text-xs font-medium text-text-secondary">Pharmacy Instructions</p>
                    <p className="mt-1 text-sm text-text">{rx.pharmacy_notes}</p>
                  </div>
                )}
              </div>
            ))}
          </Card>
        )}

        <Card>
          <IntakeSummary answers={answers} />
        </Card>

        {data.status === "pending" && (
          <Button variant="danger" onClick={handleCancel} className="w-full">
            Cancel Request
          </Button>
        )}
      </div>
    </PageShell>
  );
}
