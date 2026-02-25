"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { useUser } from "@stackframe/stack";
import { PageShell } from "@/components/layout/page-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/status-pill";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { VideoPlayer } from "@/components/video/video-player";
import { PrescriptionForm, type PrescriptionData } from "@/components/prescription/prescription-form";
import { formatDate } from "@/lib/utils";
import type { Consultation, IntakeResponse, Prescription, Profile } from "@/lib/types";

interface ConsultationDetail extends Consultation {
  intake_responses: IntakeResponse[];
  prescriptions: Prescription[];
  patient: Profile | null;
  video_signed_url: string | null;
}

export default function DoctorConsultationPage() {
  useUser({ or: "redirect" });
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<ConsultationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showPrescribe, setShowPrescribe] = useState(false);
  const [followUpNote, setFollowUpNote] = useState("");
  const [showFollowUp, setShowFollowUp] = useState(false);

  const fetchData = useCallback(async () => {
    const res = await fetch(`/api/consultations/${id}`);
    if (res.ok) setData(await res.json());
    setLoading(false);
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function doAction(body: any) {
    setActionLoading(true);
    await fetch(`/api/consultations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    await fetchData();
    setActionLoading(false);
    setShowPrescribe(false);
    setShowFollowUp(false);
  }

  async function handlePrescribe(prescription: PrescriptionData, note: string) {
    await doAction({ action: "prescribe", prescription, note: note || undefined });
  }

  if (loading) return <PageShell><div className="flex justify-center py-12"><Spinner /></div></PageShell>;
  if (!data) return <PageShell><p className="text-center text-text-secondary">Not found</p></PageShell>;

  return (
    <PageShell>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-text">{data.chief_complaint}</h1>
            {data.patient && (
              <p className="mt-1 text-sm text-text-secondary">
                {data.patient.full_name}
                {data.patient.date_of_birth && ` — DOB: ${formatDate(data.patient.date_of_birth)}`}
              </p>
            )}
          </div>
          <StatusPill status={data.status} />
        </div>

        {/* Video */}
        {data.video_signed_url && (
          <Card>
            <h3 className="mb-3 text-sm font-semibold text-text">Patient Video</h3>
            <VideoPlayer src={data.video_signed_url} />
          </Card>
        )}

        {/* Intake Responses */}
        <Card>
          <h3 className="mb-3 text-sm font-semibold text-text">Intake Responses</h3>
          <div className="space-y-3">
            {data.intake_responses.map((r) => (
              <div key={r.id} className="rounded-xl bg-surface p-3">
                <p className="text-xs font-medium text-text-secondary">{r.question_text}</p>
                <p className="mt-1 text-sm text-text">{r.answer}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Existing prescriptions */}
        {data.prescriptions.length > 0 && (
          <Card>
            <h3 className="mb-3 text-sm font-semibold text-text">Prescription(s)</h3>
            {data.prescriptions.map((rx) => (
              <div key={rx.id} className="rounded-xl bg-green-50 p-3">
                <p className="font-medium text-text">{rx.medication_name} — {rx.dosage}</p>
                <p className="text-sm text-text-secondary">{rx.frequency} for {rx.duration}</p>
              </div>
            ))}
          </Card>
        )}

        {/* Actions */}
        {["accepted", "in_review"].includes(data.status) && !showPrescribe && !showFollowUp && (
          <div className="space-y-3">
            {data.status === "accepted" && (
              <Button onClick={() => doAction({ action: "start_review" })} loading={actionLoading} className="w-full" size="lg">
                Begin Review
              </Button>
            )}
            {data.status === "in_review" && (
              <>
                <Button onClick={() => setShowPrescribe(true)} className="w-full" size="lg">
                  Write Prescription
                </Button>
                <Button variant="secondary" onClick={() => setShowFollowUp(true)} className="w-full">
                  Request Follow-up
                </Button>
              </>
            )}
          </div>
        )}

        {/* Prescription form */}
        {showPrescribe && (
          <Card>
            <h3 className="mb-4 text-sm font-semibold text-text">Write Prescription</h3>
            <PrescriptionForm onSubmit={handlePrescribe} loading={actionLoading} />
          </Card>
        )}

        {/* Follow-up form */}
        {showFollowUp && (
          <Card>
            <h3 className="mb-4 text-sm font-semibold text-text">Follow-up Note</h3>
            <Textarea
              value={followUpNote}
              onChange={(e) => setFollowUpNote(e.target.value)}
              placeholder="Describe what additional info you need from the patient..."
            />
            <div className="mt-3 flex gap-3">
              <Button variant="secondary" onClick={() => setShowFollowUp(false)} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={() => doAction({ action: "follow_up", note: followUpNote })}
                loading={actionLoading}
                className="flex-1"
              >
                Send Follow-up
              </Button>
            </div>
          </Card>
        )}

        {/* Complete button for prescribed consultations */}
        {data.status === "prescribed" && (
          <Button onClick={() => doAction({ action: "complete" })} loading={actionLoading} variant="secondary" className="w-full">
            Mark as Completed
          </Button>
        )}
      </div>
    </PageShell>
  );
}
