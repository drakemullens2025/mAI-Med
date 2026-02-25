"use client";

import { useState } from "react";
import { OKLAHOMA_CONSENT_TEXT } from "@/lib/constants";
import { Button } from "@/components/ui/button";

interface ConsentFormProps {
  onConsent: () => void;
}

export function ConsentForm({ onConsent }: ConsentFormProps) {
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Telemedicine Consent</h2>
      <div className="max-h-64 overflow-y-auto rounded-xl border border-border bg-surface p-4 text-xs leading-relaxed text-text-secondary whitespace-pre-line">
        {OKLAHOMA_CONSENT_TEXT}
      </div>
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
        />
        <span className="text-sm text-text">
          I have read and agree to the telemedicine consent above.
        </span>
      </label>
      <Button onClick={onConsent} disabled={!agreed} className="w-full" size="lg">
        I Consent
      </Button>
    </div>
  );
}
