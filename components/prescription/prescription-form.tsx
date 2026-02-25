"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface PrescriptionFormProps {
  onSubmit: (data: PrescriptionData, note: string) => void;
  loading?: boolean;
}

export interface PrescriptionData {
  medication_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number | null;
  refills: number;
  pharmacy_notes: string;
  notes_to_patient: string;
}

export function PrescriptionForm({ onSubmit, loading }: PrescriptionFormProps) {
  const [rx, setRx] = useState<PrescriptionData>({
    medication_name: "",
    dosage: "",
    frequency: "",
    duration: "",
    quantity: null,
    refills: 0,
    pharmacy_notes: "",
    notes_to_patient: "",
  });
  const [note, setNote] = useState("");

  const canSubmit = rx.medication_name && rx.dosage && rx.frequency && rx.duration;

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (canSubmit) onSubmit(rx, note);
      }}
    >
      <Input
        label="Medication Name"
        value={rx.medication_name}
        onChange={(e) => setRx((p) => ({ ...p, medication_name: e.target.value }))}
        required
        placeholder="Amoxicillin"
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Dosage"
          value={rx.dosage}
          onChange={(e) => setRx((p) => ({ ...p, dosage: e.target.value }))}
          required
          placeholder="500mg"
        />
        <Input
          label="Frequency"
          value={rx.frequency}
          onChange={(e) => setRx((p) => ({ ...p, frequency: e.target.value }))}
          required
          placeholder="3x daily"
        />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Input
          label="Duration"
          value={rx.duration}
          onChange={(e) => setRx((p) => ({ ...p, duration: e.target.value }))}
          required
          placeholder="10 days"
        />
        <Input
          label="Quantity"
          type="number"
          value={rx.quantity?.toString() || ""}
          onChange={(e) => setRx((p) => ({ ...p, quantity: e.target.value ? parseInt(e.target.value) : null }))}
          placeholder="30"
        />
        <Input
          label="Refills"
          type="number"
          value={rx.refills.toString()}
          onChange={(e) => setRx((p) => ({ ...p, refills: parseInt(e.target.value) || 0 }))}
          placeholder="0"
        />
      </div>
      <Textarea
        label="Notes to Patient"
        value={rx.notes_to_patient}
        onChange={(e) => setRx((p) => ({ ...p, notes_to_patient: e.target.value }))}
        placeholder="Take with food..."
      />
      <Textarea
        label="Pharmacy Notes"
        value={rx.pharmacy_notes}
        onChange={(e) => setRx((p) => ({ ...p, pharmacy_notes: e.target.value }))}
        placeholder="Optional instructions for pharmacist..."
      />
      <Textarea
        label="Clinical Note (internal)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Internal clinical notes..."
      />
      <Button type="submit" disabled={!canSubmit} loading={loading} className="w-full" size="lg">
        Submit Prescription
      </Button>
    </form>
  );
}
