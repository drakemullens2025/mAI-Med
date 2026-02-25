"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@stackframe/stack";
import { PageShell } from "@/components/layout/page-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IntakeWizard } from "@/components/intake/intake-wizard";
import { VideoRecorder } from "@/components/video/video-recorder";

type Step = "intake" | "video" | "submitting";

export default function NewRequestPage() {
  useUser({ or: "redirect" });
  const router = useRouter();

  const [step, setStep] = useState<Step>("intake");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [error, setError] = useState("");

  async function handleVideoRecorded(blob: Blob, durationSeconds: number) {
    setStep("submitting");
    setError("");

    try {
      // Get signed upload URL
      const uploadRes = await fetch("/api/upload", { method: "POST" });
      if (!uploadRes.ok) throw new Error("Failed to get upload URL");
      const { signedUrl, path, token } = await uploadRes.json();

      // Upload video directly to Supabase Storage
      const uploadResponse = await fetch(signedUrl, {
        method: "PUT",
        headers: { "Content-Type": "video/webm" },
        body: blob,
      });
      if (!uploadResponse.ok) throw new Error("Video upload failed");

      // Create consultation
      const res = await fetch("/api/consultations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers,
          video_url: path,
          video_duration_seconds: durationSeconds,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create consultation");
      }

      const { id } = await res.json();
      router.replace(`/patient/consultation/${id}`);
    } catch (err: any) {
      setError(err.message);
      setStep("video");
    }
  }

  async function handleSkipVideo() {
    setStep("submitting");
    setError("");

    try {
      const res = await fetch("/api/consultations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers,
          video_url: null,
          video_duration_seconds: null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create consultation");
      }

      const { id } = await res.json();
      router.replace(`/patient/consultation/${id}`);
    } catch (err: any) {
      setError(err.message);
      setStep("video");
    }
  }

  return (
    <PageShell title="New Visit">
      {step === "intake" && (
        <Card>
          <IntakeWizard
            onComplete={(ans) => {
              setAnswers(ans);
              setStep("video");
            }}
          />
        </Card>
      )}

      {step === "video" && (
        <div className="space-y-4">
          <Card>
            <VideoRecorder onRecorded={handleVideoRecorded} />
          </Card>
          <Button variant="ghost" onClick={handleSkipVideo} className="w-full text-text-secondary">
            Skip video — submit with questionnaire only
          </Button>
          {error && <p className="text-center text-sm text-danger">{error}</p>}
        </div>
      )}

      {step === "submitting" && (
        <div className="flex flex-col items-center gap-4 py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-text-secondary">Submitting your visit...</p>
        </div>
      )}
    </PageShell>
  );
}
