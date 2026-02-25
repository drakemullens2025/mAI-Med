// Database types matching Supabase schema

export type ConsultationStatus =
  | "pending"
  | "accepted"
  | "in_review"
  | "prescribed"
  | "follow_up"
  | "completed"
  | "cancelled";

export type UserRole = "patient" | "doctor";

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  phone: string | null;
  date_of_birth: string | null;
  license_number: string | null;
  created_at: string;
  updated_at: string;
}

export interface ConsentRecord {
  id: string;
  patient_id: string;
  consent_text: string;
  consented_at: string;
  expires_at: string;
  ip_address: string | null;
  user_agent: string | null;
}

export interface Consultation {
  id: string;
  patient_id: string;
  doctor_id: string | null;
  status: ConsultationStatus;
  chief_complaint: string;
  video_url: string | null;
  video_duration_seconds: number | null;
  created_at: string;
  updated_at: string;
  accepted_at: string | null;
  completed_at: string | null;
}

export interface IntakeResponse {
  id: string;
  consultation_id: string;
  question_key: string;
  question_text: string;
  answer: string;
  sort_order: number;
  created_at: string;
}

export interface Prescription {
  id: string;
  consultation_id: string;
  doctor_id: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number | null;
  refills: number;
  pharmacy_notes: string | null;
  notes_to_patient: string | null;
  created_at: string;
}

export interface DoctorNote {
  id: string;
  consultation_id: string;
  doctor_id: string;
  note_text: string;
  created_at: string;
}

// Supabase Database type for typed client
export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile> & { id: string; role: UserRole; full_name: string }; Update: Partial<Profile> };
      consent_records: { Row: ConsentRecord; Insert: Omit<ConsentRecord, "id" | "consented_at">; Update: Partial<ConsentRecord> };
      consultations: { Row: Consultation; Insert: Partial<Consultation> & { patient_id: string; chief_complaint: string }; Update: Partial<Consultation> };
      intake_responses: { Row: IntakeResponse; Insert: Omit<IntakeResponse, "id" | "created_at">; Update: Partial<IntakeResponse> };
      prescriptions: { Row: Prescription; Insert: Omit<Prescription, "id" | "created_at">; Update: Partial<Prescription> };
      doctor_notes: { Row: DoctorNote; Insert: Omit<DoctorNote, "id" | "created_at">; Update: Partial<DoctorNote> };
    };
  };
}

// Intake question definition
export interface IntakeQuestion {
  key: string;
  text: string;
  type: "text" | "textarea" | "select";
  options?: string[];
  required?: boolean;
}
