"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@stackframe/stack";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ConsentForm } from "@/components/consent/consent-form";
import type { UserRole } from "@/lib/types";

export default function OnboardingPage() {
  const user = useUser({ or: "redirect" });
  const router = useRouter();

  const [step, setStep] = useState<"role" | "profile" | "consent">("role");
  const [role, setRole] = useState<UserRole | null>(null);
  const [fullName, setFullName] = useState(user.displayName || "");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Skip onboarding if already done
  if (user.clientReadOnlyMetadata?.onboarded) {
    const userRole = user.clientReadOnlyMetadata?.role as UserRole;
    router.replace(userRole === "doctor" ? "/doctor" : "/patient");
    return null;
  }

  async function submitOnboarding() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/set-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          full_name: fullName,
          phone: phone || undefined,
          date_of_birth: dob || undefined,
          license_number: licenseNumber || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Something went wrong");
      }
      router.replace(role === "doctor" ? "/doctor" : "/patient");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-surface px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary">mAI</h1>
          <p className="mt-1 text-text-secondary">Welcome — let&apos;s get you set up</p>
        </div>

        {step === "role" && (
          <div className="space-y-3">
            <p className="text-center text-sm font-medium text-text">I am a...</p>
            <Card
              className="cursor-pointer border-2 transition-colors hover:border-primary"
              onClick={() => { setRole("patient"); setStep("profile"); }}
            >
              <div className="text-center">
                <p className="text-lg font-semibold">Patient</p>
                <p className="text-sm text-text-secondary">I need to see a doctor</p>
              </div>
            </Card>
            <Card
              className="cursor-pointer border-2 transition-colors hover:border-primary"
              onClick={() => { setRole("doctor"); setStep("profile"); }}
            >
              <div className="text-center">
                <p className="text-lg font-semibold">Doctor</p>
                <p className="text-sm text-text-secondary">I want to see patients</p>
              </div>
            </Card>
          </div>
        )}

        {step === "profile" && (
          <Card>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                if (role === "patient") setStep("consent");
                else submitOnboarding();
              }}
            >
              <Input
                label="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="Dr. Jane Smith"
              />
              <Input
                label="Phone Number"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(405) 555-1234"
              />
              {role === "patient" && (
                <Input
                  label="Date of Birth"
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                />
              )}
              {role === "doctor" && (
                <Input
                  label="Medical License Number"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  required
                  placeholder="OK-12345"
                />
              )}
              {error && <p className="text-sm text-danger">{error}</p>}
              <div className="flex gap-3">
                <Button variant="secondary" type="button" onClick={() => setStep("role")} className="flex-1">
                  Back
                </Button>
                <Button type="submit" loading={loading} className="flex-1">
                  {role === "patient" ? "Next" : "Complete Setup"}
                </Button>
              </div>
            </form>
          </Card>
        )}

        {step === "consent" && (
          <Card>
            <ConsentForm onConsent={submitOnboarding} />
            {error && <p className="mt-2 text-sm text-danger">{error}</p>}
          </Card>
        )}
      </div>
    </div>
  );
}
