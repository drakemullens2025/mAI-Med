-- mAI Telemedicine Schema
-- Run this in your Supabase SQL Editor

-- Profiles: extended user data (id matches Stack Auth user ID)
CREATE TABLE profiles (
  id TEXT PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('patient', 'doctor')),
  full_name TEXT NOT NULL,
  phone TEXT,
  date_of_birth DATE,
  license_number TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Consent records: Oklahoma telemedicine consent
CREATE TABLE consent_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id TEXT NOT NULL REFERENCES profiles(id),
  consent_text TEXT NOT NULL,
  consented_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  ip_address TEXT,
  user_agent TEXT
);

-- Consultations: the core request object
CREATE TABLE consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id TEXT NOT NULL REFERENCES profiles(id),
  doctor_id TEXT REFERENCES profiles(id),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN (
      'pending',
      'accepted',
      'in_review',
      'prescribed',
      'follow_up',
      'completed',
      'cancelled'
    )),
  chief_complaint TEXT NOT NULL,
  video_url TEXT,
  video_duration_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  accepted_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- Intake responses: structured Q&A from intake
CREATE TABLE intake_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id UUID NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
  question_key TEXT NOT NULL,
  question_text TEXT NOT NULL,
  answer TEXT NOT NULL,
  sort_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Prescriptions
CREATE TABLE prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id UUID NOT NULL REFERENCES consultations(id),
  doctor_id TEXT NOT NULL REFERENCES profiles(id),
  medication_name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  duration TEXT NOT NULL,
  quantity INTEGER,
  refills INTEGER DEFAULT 0,
  pharmacy_notes TEXT,
  notes_to_patient TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Doctor notes
CREATE TABLE doctor_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id UUID NOT NULL REFERENCES consultations(id),
  doctor_id TEXT NOT NULL REFERENCES profiles(id),
  note_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_consultations_patient ON consultations(patient_id);
CREATE INDEX idx_consultations_doctor ON consultations(doctor_id);
CREATE INDEX idx_consultations_status ON consultations(status);
CREATE INDEX idx_intake_consultation ON intake_responses(consultation_id);
CREATE INDEX idx_prescriptions_consultation ON prescriptions(consultation_id);
CREATE INDEX idx_consent_patient ON consent_records(patient_id);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE intake_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Profiles
CREATE POLICY "Users read own profile" ON profiles FOR SELECT USING (auth.uid()::text = id);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid()::text = id);
CREATE POLICY "Service role insert profiles" ON profiles FOR INSERT WITH CHECK (true);

-- Consent
CREATE POLICY "Patients read own consent" ON consent_records FOR SELECT USING (auth.uid()::text = patient_id);
CREATE POLICY "Service role insert consent" ON consent_records FOR INSERT WITH CHECK (true);

-- Consultations
CREATE POLICY "Patients see own consultations" ON consultations FOR SELECT USING (auth.uid()::text = patient_id);
CREATE POLICY "Doctors see available and own" ON consultations FOR SELECT USING (status = 'pending' OR auth.uid()::text = doctor_id);
CREATE POLICY "Service role insert consultations" ON consultations FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role update consultations" ON consultations FOR UPDATE USING (true);

-- Intake
CREATE POLICY "Intake visible to participants" ON intake_responses FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM consultations c
    WHERE c.id = consultation_id
    AND (c.patient_id = auth.uid()::text OR c.doctor_id = auth.uid()::text)
  )
);
CREATE POLICY "Service role insert intake" ON intake_responses FOR INSERT WITH CHECK (true);

-- Prescriptions
CREATE POLICY "Prescriptions visible to participants" ON prescriptions FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM consultations c
    WHERE c.id = consultation_id
    AND (c.patient_id = auth.uid()::text OR c.doctor_id = auth.uid()::text)
  )
);
CREATE POLICY "Service role insert prescriptions" ON prescriptions FOR INSERT WITH CHECK (true);

-- Doctor notes
CREATE POLICY "Doctor sees own notes" ON doctor_notes FOR SELECT USING (auth.uid()::text = doctor_id);
CREATE POLICY "Service role insert notes" ON doctor_notes FOR INSERT WITH CHECK (true);

-- Enable realtime on consultations
ALTER PUBLICATION supabase_realtime ADD TABLE consultations;

-- Create storage bucket for consultation videos
INSERT INTO storage.buckets (id, name, public) VALUES ('consultation-videos', 'consultation-videos', false);

-- Storage policies: patients upload to their folder, doctors download for their consultations
CREATE POLICY "Patients upload videos" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'consultation-videos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Participants view videos" ON storage.objects FOR SELECT
  USING (bucket_id = 'consultation-videos');
