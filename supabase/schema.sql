-- ==============================================================================
-- MediCure AI Health Platform - Supabase PostgreSQL Database Schema
-- ==============================================================================

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Helper function for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------------------------
-- 2. USER PROFILES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id TEXT PRIMARY KEY,                       -- User UID (matches auth UID)
    uid TEXT UNIQUE NOT NULL,                  -- Redundant alias for UID
    display_name TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'patient' CHECK (role IN ('patient', 'doctor', 'receptionist', 'admin')),
    pid TEXT NOT NULL DEFAULT 'PID-88420',
    phone TEXT DEFAULT '(555) 382-9104',
    dob TEXT DEFAULT 'May 14, 1986 (38 yrs)',
    blood_group TEXT DEFAULT 'O Positive (O+)',
    emergency_contact TEXT DEFAULT 'Eleanor Wright (Spouse) • +1 (555) 719-2041',
    insurance_provider TEXT DEFAULT 'Aetna Choice POS II',
    policy_id TEXT DEFAULT 'AET-9948201-01',
    allergies TEXT DEFAULT 'Penicillin (Anaphylaxis)',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_user_profiles_updated_at
BEFORE UPDATE ON public.user_profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 3. DOCTORS DIRECTORY TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.doctors (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    credentials TEXT NOT NULL,
    specialty TEXT NOT NULL,
    department TEXT NOT NULL,
    hospital TEXT NOT NULL,
    npi TEXT NOT NULL,
    license TEXT DEFAULT 'MA-482019',
    experience_years INTEGER NOT NULL DEFAULT 5,
    rating NUMERIC(3, 2) NOT NULL DEFAULT 4.9,
    review_count INTEGER NOT NULL DEFAULT 0,
    consultations_count INTEGER NOT NULL DEFAULT 0,
    base_fee NUMERIC(10, 2) NOT NULL DEFAULT 150.00,
    copay_fee NUMERIC(10, 2) NOT NULL DEFAULT 35.00,
    duty_status TEXT NOT NULL DEFAULT 'On Duty' CHECK (duty_status IN ('In Consultation', 'On Duty', 'Off Duty')),
    telehealth_ready BOOLEAN NOT NULL DEFAULT true,
    in_clinic_ready BOOLEAN NOT NULL DEFAULT true,
    available_today BOOLEAN NOT NULL DEFAULT true,
    is_active BOOLEAN NOT NULL DEFAULT true,
    bio TEXT NOT NULL DEFAULT '',
    languages JSONB NOT NULL DEFAULT '["English"]'::jsonb,
    accepted_insurance JSONB NOT NULL DEFAULT '["Aetna", "BlueCross", "UnitedHealthcare"]'::jsonb,
    next_slots JSONB NOT NULL DEFAULT '["09:30 AM", "11:00 AM", "02:30 PM"]'::jsonb,
    avatar_key TEXT NOT NULL DEFAULT 'sarah-jenkins',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_doctors_updated_at
BEFORE UPDATE ON public.doctors
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 4. DEPARTMENTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.departments (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    head_doctor TEXT NOT NULL,
    total_doctors INTEGER NOT NULL DEFAULT 0,
    active_patients INTEGER NOT NULL DEFAULT 0,
    todays_appointments INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_departments_updated_at
BEFORE UPDATE ON public.departments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 5. APPOINTMENTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.appointments (
    id TEXT PRIMARY KEY,
    patient_uid TEXT NOT NULL,
    patient_name TEXT NOT NULL,
    patient_pid TEXT NOT NULL,
    doctor_id TEXT NOT NULL REFERENCES public.doctors(id) ON DELETE RESTRICT,
    doctor_name TEXT NOT NULL,
    doctor_credentials TEXT,
    specialty TEXT NOT NULL,
    department TEXT,
    location TEXT NOT NULL,
    visit_mode TEXT NOT NULL CHECK (visit_mode IN ('in-person', 'telehealth')),
    appointment_date TEXT NOT NULL,
    appointment_time TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 45,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'checked-in', 'in-exam', 'completed', 'cancelled')),
    chief_complaint TEXT NOT NULL,
    symptom_duration TEXT,
    symptom_description TEXT,
    risk_factors JSONB NOT NULL DEFAULT '[]'::jsonb,
    attached_document_name TEXT,
    insurance_provider TEXT,
    policy_id TEXT,
    standard_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    insurer_coverage NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    copay_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    copay_paid BOOLEAN NOT NULL DEFAULT true,
    receipt_number TEXT,
    room_number TEXT,
    physician_summary TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_appointments_patient ON public.appointments(patient_uid);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor ON public.appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(appointment_date);

CREATE TRIGGER set_appointments_updated_at
BEFORE UPDATE ON public.appointments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 6. PRESCRIPTIONS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.prescriptions (
    id TEXT PRIMARY KEY,
    patient_uid TEXT NOT NULL,
    medication_name TEXT NOT NULL,
    dosage TEXT NOT NULL,
    frequency TEXT NOT NULL,
    prescriber_name TEXT NOT NULL,
    pharmacy TEXT NOT NULL DEFAULT 'CVS Pharmacy #4829 • Main St',
    refills_remaining INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'refill-requested', 'approved', 'completed')),
    last_filled_date TEXT,
    next_refill_due TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prescriptions_patient ON public.prescriptions(patient_uid);

CREATE TRIGGER set_prescriptions_updated_at
BEFORE UPDATE ON public.prescriptions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 7. MEDICAL RECORDS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.medical_records (
    id TEXT PRIMARY KEY,
    patient_uid TEXT NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    provider_name TEXT NOT NULL,
    date_label TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'normal' CHECK (status IN ('normal', 'attention', 'critical', 'pending')),
    summary TEXT NOT NULL,
    metrics JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_medical_records_patient ON public.medical_records(patient_uid);

CREATE TRIGGER set_medical_records_updated_at
BEFORE UPDATE ON public.medical_records
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 8. AI CONSULTATIONS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ai_consultations (
    id TEXT PRIMARY KEY,
    patient_uid TEXT NOT NULL,
    sender TEXT NOT NULL CHECK (sender IN ('user', 'assistant')),
    content TEXT NOT NULL,
    severity TEXT,
    triage_priority TEXT,
    icd10_code TEXT,
    observations JSONB NOT NULL DEFAULT '[]'::jsonb,
    protocol JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_consultations_patient ON public.ai_consultations(patient_uid);
CREATE INDEX IF NOT EXISTS idx_ai_consultations_created_at ON public.ai_consultations(created_at);

-- ------------------------------------------------------------------------------
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_consultations ENABLE ROW LEVEL SECURITY;

-- Allow read for active doctors & departments (Public directory)
CREATE POLICY "Allow public read on doctors" ON public.doctors
    FOR SELECT USING (is_active = true OR auth.role() = 'authenticated');

CREATE POLICY "Allow admin write on doctors" ON public.doctors
    FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

CREATE POLICY "Allow public read on departments" ON public.departments
    FOR SELECT USING (is_active = true OR auth.role() = 'authenticated');

CREATE POLICY "Allow admin write on departments" ON public.departments
    FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- Policies for user profiles
CREATE POLICY "Allow read profiles" ON public.user_profiles
    FOR SELECT USING (true);

CREATE POLICY "Allow write profiles" ON public.user_profiles
    FOR ALL USING (true);

-- Policies for appointments
CREATE POLICY "Allow read appointments" ON public.appointments
    FOR SELECT USING (true);

CREATE POLICY "Allow write appointments" ON public.appointments
    FOR ALL USING (true);

-- Policies for prescriptions
CREATE POLICY "Allow read prescriptions" ON public.prescriptions
    FOR SELECT USING (true);

CREATE POLICY "Allow write prescriptions" ON public.prescriptions
    FOR ALL USING (true);

-- Policies for medical records
CREATE POLICY "Allow read medical records" ON public.medical_records
    FOR SELECT USING (true);

CREATE POLICY "Allow write medical records" ON public.medical_records
    FOR ALL USING (true);

-- Policies for AI consultations
CREATE POLICY "Allow read ai consultations" ON public.ai_consultations
    FOR SELECT USING (true);

CREATE POLICY "Allow write ai consultations" ON public.ai_consultations
    FOR ALL USING (true);

-- ------------------------------------------------------------------------------
-- 10. REALTIME SUBSCRIPTION REGISTRATION
-- ------------------------------------------------------------------------------
-- Enable real-time change stream listening in Supabase
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'appointments'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'prescriptions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.prescriptions;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'medical_records'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.medical_records;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'ai_consultations'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.ai_consultations;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'doctors'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.doctors;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'departments'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.departments;
  END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 11. INITIAL SEED DATA
-- ------------------------------------------------------------------------------

-- Seed Doctors
INSERT INTO public.doctors (
    id, name, credentials, specialty, department, hospital, npi, license,
    experience_years, rating, review_count, consultations_count, base_fee,
    copay_fee, duty_status, telehealth_ready, in_clinic_ready, available_today,
    is_active, bio, languages, accepted_insurance, next_slots, avatar_key
) VALUES
(
    'doc-sarah-jenkins', 'Dr. Sarah Jenkins', 'MD, FACC', 'Cardiology',
    'Cardiovascular Medicine', 'Boston General Medical Center', 'NPI-1948201944', 'MA-294819',
    16, 4.96, 342, 2840, 240.00, 35.00, 'On Duty', true, true, true, true,
    'Dr. Sarah Jenkins is an interventional cardiologist specializing in lipid disorders, coronary artery disease, and preventative cardiac care with clinical fellowship at Johns Hopkins.',
    '["English", "Spanish"]'::jsonb,
    '["Aetna Choice POS II", "BlueCross BlueShield", "Medicare Part B", "UnitedHealthcare"]'::jsonb,
    '["09:30 AM", "11:00 AM", "02:30 PM", "04:15 PM"]'::jsonb,
    'sarah-jenkins'
),
(
    'doc-marcus-vance', 'Dr. Marcus Vance', 'MD, PhD', 'Neurology',
    'Clinical Neurosciences', 'Mass General Neurovascular Institute', 'NPI-2049182041', 'MA-402914',
    19, 4.92, 288, 1920, 280.00, 45.00, 'On Duty', true, true, true, true,
    'Dr. Vance leads advanced clinical protocols in migraine management, cerebrovascular disorders, and cognitive neuro-diagnostics.',
    '["English", "French"]'::jsonb,
    '["Aetna Choice POS II", "Cigna Open Access", "Harvard Pilgrim"]'::jsonb,
    '["10:00 AM", "01:30 PM", "03:45 PM"]'::jsonb,
    'marcus-vance'
),
(
    'doc-priya-patel', 'Dr. Priya Patel', 'MD, FACE', 'Endocrinology',
    'Metabolic & Endocrine Disorders', 'New England Ambulatory Specialty Pavilion', 'NPI-3920194821', 'MA-510293',
    12, 4.88, 194, 1430, 210.00, 30.00, 'In Consultation', true, true, false, true,
    'Specialist in insulin resistance pathways, thyroid nodules, and automated pump management. Recognized for empathetic lifestyle therapeutics.',
    '["English", "Hindi", "Gujarati"]'::jsonb,
    '["Aetna Choice POS II", "BlueCross", "Medicare", "Tufts Health Plan"]'::jsonb,
    '["Tomorrow 09:15 AM", "Tomorrow 11:30 AM"]'::jsonb,
    'priya-patel'
),
(
    'doc-elena-rostova', 'Dr. Elena Rostova', 'MD, FAAFP', 'Internal Medicine',
    'Primary Care & Preventive Health', 'Boston Metro Health Plaza', 'NPI-8492019402', 'MA-603912',
    14, 4.94, 412, 3600, 160.00, 25.00, 'On Duty', true, true, true, true,
    'Comprehensive primary care clinician focused on proactive wellness screenings, chronic hypertension, and coordinated specialty care.',
    '["English", "Russian"]'::jsonb,
    '["Aetna Choice POS II", "BlueCross", "Medicare", "UnitedHealthcare", "Humana"]'::jsonb,
    '["Today 02:00 PM", "Today 03:30 PM", "Today 05:00 PM"]'::jsonb,
    'elena-rostova'
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    specialty = EXCLUDED.specialty,
    department = EXCLUDED.department,
    hospital = EXCLUDED.hospital,
    base_fee = EXCLUDED.base_fee,
    copay_fee = EXCLUDED.copay_fee;

-- Seed Departments
INSERT INTO public.departments (
    id, name, head_doctor, total_doctors, active_patients, todays_appointments, is_active
) VALUES
('dept-cardio', 'Cardiovascular Medicine', 'Dr. Sarah Jenkins', 8, 412, 38, true),
('dept-neuro', 'Clinical Neurosciences', 'Dr. Marcus Vance', 6, 280, 24, true),
('dept-endocrine', 'Metabolic & Endocrinology', 'Dr. Priya Patel', 5, 340, 29, true),
('dept-primary', 'Internal Medicine & Primary Care', 'Dr. Elena Rostova', 14, 890, 76, true),
('dept-pulmo', 'Pulmonology & Critical Care', 'Dr. Arthur Pendelton', 4, 185, 17, true)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    head_doctor = EXCLUDED.head_doctor,
    total_doctors = EXCLUDED.total_doctors,
    active_patients = EXCLUDED.active_patients,
    todays_appointments = EXCLUDED.todays_appointments;
