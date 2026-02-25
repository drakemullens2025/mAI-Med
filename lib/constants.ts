import type { IntakeQuestion, ConsultationStatus } from "./types";

export const INTAKE_QUESTIONS: IntakeQuestion[] = [
  { key: "chief_complaint", text: "What is your main concern today?", type: "text", required: true },
  { key: "symptoms", text: "Describe your symptoms in detail.", type: "textarea", required: true },
  { key: "duration", text: "How long have you had these symptoms?", type: "text", required: true },
  { key: "severity", text: "On a scale of 1-10, how severe are your symptoms?", type: "select", options: ["1","2","3","4","5","6","7","8","9","10"], required: true },
  { key: "current_medications", text: "List any medications you are currently taking.", type: "textarea" },
  { key: "allergies", text: "Do you have any known drug allergies?", type: "textarea", required: true },
  { key: "medical_history", text: "Do you have any chronic conditions or past surgeries?", type: "textarea" },
  { key: "previous_treatment", text: "Have you tried any treatments for this issue?", type: "textarea" },
];

export const STATUS_CONFIG: Record<ConsultationStatus, { label: string; color: string }> = {
  pending: { label: "Waiting for Doctor", color: "bg-amber-100 text-amber-800" },
  accepted: { label: "Doctor Assigned", color: "bg-blue-100 text-blue-800" },
  in_review: { label: "Under Review", color: "bg-indigo-100 text-indigo-800" },
  prescribed: { label: "Prescription Ready", color: "bg-green-100 text-green-800" },
  follow_up: { label: "Follow-up Needed", color: "bg-orange-100 text-orange-800" },
  completed: { label: "Completed", color: "bg-gray-100 text-gray-600" },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-800" },
};

export const OKLAHOMA_CONSENT_TEXT = `OKLAHOMA TELEMEDICINE INFORMED CONSENT

I understand and agree to the following:

1. Telemedicine involves the use of electronic communications to enable healthcare providers at different locations to share individual patient medical information for the purpose of improving patient care.

2. The laws that protect the confidentiality of my medical information also apply to telemedicine. I understand that the information may be used for diagnosis, therapy, follow-up, and/or patient education, and that my information will be handled in accordance with HIPAA regulations.

3. I understand that I have the right to withhold or withdraw consent at any time without affecting my right to future care or treatment.

4. I understand that store-and-forward telemedicine involves the transmission of my medical information, including video recordings and intake questionnaire responses, from an originating site to a distant healthcare provider for evaluation.

5. I understand that the healthcare provider will adhere to the same standard of care as in traditional in-person settings.

6. I understand that this platform does not prescribe controlled substances (Schedule II-V drugs).

7. I understand that in an emergency, I should call 911 or go to the nearest emergency room.

8. I have read and understand the information provided above. I consent to participate in telemedicine services through mAI.

This consent is valid for one (1) year from the date of signing, per Oklahoma law (59 O.S. § 478.1).`;

export const MAX_VIDEO_DURATION_SECONDS = 180;
