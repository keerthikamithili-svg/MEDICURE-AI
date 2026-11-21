-- ==============================================================================
-- MediCure AI Health Platform - Production Supabase PostgreSQL Database Schema
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Timestamp Trigger Function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------------------------
-- 3. USER PROFILES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id TEXT PRIMARY KEY,                       -- Matches auth.users.id
    uid TEXT UNIQUE NOT NULL,                  -- Redundant alias for UID
    display_name TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'patient' CHECK (role IN ('patient', 'doctor', 'receptionist', 'admin')),
    pid TEXT NOT NULL DEFAULT 'PID-88420',
    phone TEXT,
    dob TEXT,
    blood_group TEXT,
    emergency_contact TEXT,
    insurance_provider TEXT,
    policy_id TEXT,
    allergies TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS set_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER set_user_profiles_updated_at
BEFORE UPDATE ON public.user_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 4. DOCTORS DIRECTORY TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.doctors (
    id TEXT PRIMARY KEY,                       -- e.g. 'doc-sarah-jenkins'
    user_uid TEXT UNIQUE,                      -- Linked auth.users UID
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
    accepted_insurance JSONB NOT NULL DEFAULT '["Aetna Choice POS II", "BlueCross", "UnitedHealthcare"]'::jsonb,
    next_slots JSONB NOT NULL DEFAULT '["09:30 AM", "11:00 AM", "02:30 PM"]'::jsonb,
    avatar_key TEXT NOT NULL DEFAULT 'sarah-jenkins',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS set_doctors_updated_at ON public.doctors;
CREATE TRIGGER set_doctors_updated_at
BEFORE UPDATE ON public.doctors
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 5. DEPARTMENTS TABLE
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

DROP TRIGGER IF EXISTS set_departments_updated_at ON public.departments;
CREATE TRIGGER set_departments_updated_at
BEFORE UPDATE ON public.departments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 6. APPOINTMENTS TABLE
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
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(appointment_date);

DROP TRIGGER IF EXISTS set_appointments_updated_at ON public.appointments;
CREATE TRIGGER set_appointments_updated_at
BEFORE UPDATE ON public.appointments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 7. DOCTOR-PATIENT ASSIGNMENTS TABLE (Explicit Clinical Relationship)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.doctor_patient_assignments (
    id TEXT PRIMARY KEY,
    doctor_id TEXT NOT NULL REFERENCES public.doctors(id) ON DELETE RESTRICT,
    patient_uid TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'discharged')),
    assigned_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_until TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_doctor_patient UNIQUE (doctor_id, patient_uid)
);

CREATE INDEX IF NOT EXISTS idx_assignments_doctor ON public.doctor_patient_assignments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_assignments_patient ON public.doctor_patient_assignments(patient_uid);

DROP TRIGGER IF EXISTS set_assignments_updated_at ON public.doctor_patient_assignments;
CREATE TRIGGER set_assignments_updated_at
BEFORE UPDATE ON public.doctor_patient_assignments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 8. PRESCRIPTIONS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.prescriptions (
    id TEXT PRIMARY KEY,
    patient_uid TEXT NOT NULL,
    doctor_id TEXT REFERENCES public.doctors(id) ON DELETE SET NULL,
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
CREATE INDEX IF NOT EXISTS idx_prescriptions_doctor ON public.prescriptions(doctor_id);

DROP TRIGGER IF EXISTS set_prescriptions_updated_at ON public.prescriptions;
CREATE TRIGGER set_prescriptions_updated_at
BEFORE UPDATE ON public.prescriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 9. MEDICAL RECORDS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.medical_records (
    id TEXT PRIMARY KEY,
    patient_uid TEXT NOT NULL,
    doctor_id TEXT REFERENCES public.doctors(id) ON DELETE SET NULL,
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
CREATE INDEX IF NOT EXISTS idx_medical_records_doctor ON public.medical_records(doctor_id);

DROP TRIGGER IF EXISTS set_medical_records_updated_at ON public.medical_records;
CREATE TRIGGER set_medical_records_updated_at
BEFORE UPDATE ON public.medical_records
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 10. AI CONSULTATIONS TABLE (Patient-Private Clinical Triage)
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
-- 11. SECURITY DEFINER HELPER FUNCTIONS
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_role TEXT;
BEGIN
    v_role := auth.jwt() -> 'app_metadata' ->> 'role';
    IF v_role IS NOT NULL AND v_role IN ('patient', 'doctor', 'receptionist', 'admin') THEN
        RETURN v_role;
    END IF;

    SELECT role INTO v_role
    FROM public.user_profiles
    WHERE id = auth.uid()::text;

    RETURN COALESCE(v_role, 'patient');
END;
$$;

CREATE OR REPLACE FUNCTION public.get_current_doctor_id()
RETURNS TEXT
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_doc_id TEXT;
BEGIN
    v_doc_id := auth.jwt() -> 'app_metadata' ->> 'doctor_id';
    IF v_doc_id IS NOT NULL THEN
        RETURN v_doc_id;
    END IF;

    SELECT id INTO v_doc_id
    FROM public.doctors
    WHERE user_uid = auth.uid()::text OR id = auth.uid()::text
    LIMIT 1;

    RETURN v_doc_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
    SELECT (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin' OR public.get_current_user_role() = 'admin');
$$;

CREATE OR REPLACE FUNCTION public.is_doctor_assigned_to_patient(p_doctor_id TEXT, p_patient_uid TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    IF p_doctor_id IS NULL OR p_patient_uid IS NULL THEN
        RETURN false;
    END IF;

    IF EXISTS (
        SELECT 1 FROM public.doctor_patient_assignments
        WHERE doctor_id = p_doctor_id 
          AND patient_uid = p_patient_uid 
          AND status = 'active'
          AND (valid_until IS NULL OR valid_until >= NOW())
    ) THEN
        RETURN true;
    END IF;

    IF EXISTS (
        SELECT 1 FROM public.appointments
        WHERE doctor_id = p_doctor_id 
          AND patient_uid = p_patient_uid
          AND (
              status IN ('scheduled', 'checked-in', 'in-exam')
              OR (status = 'completed' AND updated_at >= NOW() - INTERVAL '30 days')
          )
    ) THEN
        RETURN true;
    END IF;

    RETURN false;
END;
$$;

-- ------------------------------------------------------------------------------
-- 12. DATABASE-LEVEL VALIDATION TRIGGERS
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.validate_user_profile_update()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.role IS DISTINCT FROM OLD.role AND NOT public.is_admin() THEN
        RAISE EXCEPTION 'Access Denied: Account role cannot be modified by user.';
    END IF;

    IF (NEW.id IS DISTINCT FROM OLD.id OR NEW.uid IS DISTINCT FROM OLD.uid) THEN
        RAISE EXCEPTION 'Access Denied: Immutable user authentication identity.';
    END IF;

    IF NEW.pid IS DISTINCT FROM OLD.pid AND NOT public.is_admin() THEN
        RAISE EXCEPTION 'Access Denied: Patient ID (PID) is assigned by clinical administration.';
    END IF;

    IF NEW.created_at IS DISTINCT FROM OLD.created_at THEN
        NEW.created_at := OLD.created_at;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trg_validate_user_profile ON public.user_profiles;
CREATE TRIGGER trg_validate_user_profile
BEFORE UPDATE ON public.user_profiles
FOR EACH ROW
EXECUTE FUNCTION public.validate_user_profile_update();

CREATE OR REPLACE FUNCTION public.validate_appointment_update()
RETURNS TRIGGER AS $$
DECLARE
    v_role TEXT;
BEGIN
    v_role := public.get_current_user_role();

    IF v_role = 'receptionist' THEN
        IF NEW.patient_uid IS DISTINCT FROM OLD.patient_uid OR
           NEW.doctor_id IS DISTINCT FROM OLD.doctor_id OR
           NEW.chief_complaint IS DISTINCT FROM OLD.chief_complaint OR
           NEW.symptom_duration IS DISTINCT FROM OLD.symptom_duration OR
           NEW.symptom_description IS DISTINCT FROM OLD.symptom_description OR
           NEW.risk_factors IS DISTINCT FROM OLD.risk_factors OR
           NEW.physician_summary IS DISTINCT FROM OLD.physician_summary OR
           NEW.standard_fee IS DISTINCT FROM OLD.standard_fee OR
           NEW.insurer_coverage IS DISTINCT FROM OLD.insurer_coverage OR
           NEW.copay_amount IS DISTINCT FROM OLD.copay_amount THEN
            RAISE EXCEPTION 'Receptionists may only update operational fields (status, room, time, copay status).';
        END IF;

        IF NEW.status NOT IN ('scheduled', 'checked-in', 'cancelled') THEN
            RAISE EXCEPTION 'Receptionists cannot mark visits as in-exam or completed.';
        END IF;
    END IF;

    IF v_role = 'patient' THEN
        IF NEW.status IS DISTINCT FROM 'cancelled' THEN
            RAISE EXCEPTION 'Patients can only update appointments to cancel them.';
        END IF;

        IF NEW.patient_uid IS DISTINCT FROM OLD.patient_uid OR
           NEW.doctor_id IS DISTINCT FROM OLD.doctor_id OR
           NEW.appointment_date IS DISTINCT FROM OLD.appointment_date OR
           NEW.appointment_time IS DISTINCT FROM OLD.appointment_time OR
           NEW.chief_complaint IS DISTINCT FROM OLD.chief_complaint OR
           NEW.symptom_duration IS DISTINCT FROM OLD.symptom_duration OR
           NEW.symptom_description IS DISTINCT FROM OLD.symptom_description OR
           NEW.room_number IS DISTINCT FROM OLD.room_number OR
           NEW.physician_summary IS DISTINCT FROM OLD.physician_summary OR
           NEW.standard_fee IS DISTINCT FROM OLD.standard_fee OR
           NEW.copay_amount IS DISTINCT FROM OLD.copay_amount OR
           NEW.copay_paid IS DISTINCT FROM OLD.copay_paid THEN
            RAISE EXCEPTION 'Patients cannot modify appointment details when requesting cancellation.';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trg_validate_appointment ON public.appointments;
CREATE TRIGGER trg_validate_appointment
BEFORE UPDATE ON public.appointments
FOR EACH ROW
EXECUTE FUNCTION public.validate_appointment_update();

CREATE OR REPLACE FUNCTION public.prevent_patient_prescription_tampering()
RETURNS TRIGGER AS $$
DECLARE
    v_role TEXT;
BEGIN
    v_role := public.get_current_user_role();
    
    IF v_role = 'patient' THEN
        IF NEW.medication_name IS DISTINCT FROM OLD.medication_name OR
           NEW.dosage IS DISTINCT FROM OLD.dosage OR
           NEW.frequency IS DISTINCT FROM OLD.frequency OR
           NEW.prescriber_name IS DISTINCT FROM OLD.prescriber_name OR
           NEW.pharmacy IS DISTINCT FROM OLD.pharmacy OR
           NEW.refills_remaining IS DISTINCT FROM OLD.refills_remaining OR
           NEW.patient_uid IS DISTINCT FROM OLD.patient_uid THEN
            RAISE EXCEPTION 'Patients cannot modify clinical prescription fields.';
        END IF;

        IF NEW.status IS DISTINCT FROM 'refill-requested' AND NEW.status IS DISTINCT FROM OLD.status THEN
            RAISE EXCEPTION 'Patients may only request refills on active prescriptions.';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trg_prevent_prescription_tampering ON public.prescriptions;
CREATE TRIGGER trg_prevent_prescription_tampering
BEFORE UPDATE ON public.prescriptions
FOR EACH ROW
EXECUTE FUNCTION public.prevent_patient_prescription_tampering();

-- ------------------------------------------------------------------------------
-- 13. LEAST-PRIVILEGE SCHEMA & TABLE GRANTS
-- ------------------------------------------------------------------------------
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL ROUTINES IN SCHEMA public FROM anon;

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

GRANT SELECT ON TABLE public.doctors TO anon;
GRANT SELECT ON TABLE public.departments TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.user_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.doctors TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.departments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.appointments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.doctor_patient_assignments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.prescriptions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.medical_records TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.ai_consultations TO authenticated;

GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_current_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_current_doctor_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_doctor_assigned_to_patient(TEXT, TEXT) TO authenticated;

GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO service_role;

-- ------------------------------------------------------------------------------
-- 14. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_patient_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_consultations ENABLE ROW LEVEL SECURITY;

-- Clean pre-existing policies
DROP POLICY IF EXISTS "Users can read own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Staff can read patient profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admin full control on user_profiles" ON public.user_profiles;

CREATE POLICY "Users can read own profile" ON public.user_profiles
    FOR SELECT TO authenticated USING (id = auth.uid()::text);

CREATE POLICY "Staff can read patient profiles" ON public.user_profiles
    FOR SELECT TO authenticated
    USING ((auth.jwt() -> 'app_metadata' ->> 'role') IN ('doctor', 'receptionist', 'admin'));

CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT TO authenticated WITH CHECK (id = auth.uid()::text);

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE TO authenticated USING (id = auth.uid()::text) WITH CHECK (id = auth.uid()::text);

CREATE POLICY "Admin full control on user_profiles" ON public.user_profiles
    FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Doctors
DROP POLICY IF EXISTS "Public directory read on doctors" ON public.doctors;
DROP POLICY IF EXISTS "Doctors can update own profile" ON public.doctors;
DROP POLICY IF EXISTS "Admin full control on doctors" ON public.doctors;

CREATE POLICY "Public directory read on doctors" ON public.doctors
    FOR SELECT TO anon, authenticated USING (is_active = true OR public.is_admin());

CREATE POLICY "Doctors can update own profile" ON public.doctors
    FOR UPDATE TO authenticated
    USING (user_uid = auth.uid()::text OR id = auth.uid()::text)
    WITH CHECK (user_uid = auth.uid()::text OR id = auth.uid()::text);

CREATE POLICY "Admin full control on doctors" ON public.doctors
    FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Departments
DROP POLICY IF EXISTS "Public directory read on departments" ON public.departments;
DROP POLICY IF EXISTS "Admin full control on departments" ON public.departments;

CREATE POLICY "Public directory read on departments" ON public.departments
    FOR SELECT TO anon, authenticated USING (is_active = true OR public.is_admin());

CREATE POLICY "Admin full control on departments" ON public.departments
    FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Appointments
DROP POLICY IF EXISTS "Patients can view own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Doctors can view assigned appointments" ON public.appointments;
DROP POLICY IF EXISTS "Receptionists can view clinic appointments" ON public.appointments;
DROP POLICY IF EXISTS "Patients can book own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Receptionists can book appointments" ON public.appointments;
DROP POLICY IF EXISTS "Patients can cancel own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Doctors can update assigned appointments" ON public.appointments;
DROP POLICY IF EXISTS "Receptionists can update appointments" ON public.appointments;
DROP POLICY IF EXISTS "Admin full control on appointments" ON public.appointments;

CREATE POLICY "Patients can view own appointments" ON public.appointments
    FOR SELECT TO authenticated USING (patient_uid = auth.uid()::text);

CREATE POLICY "Doctors can view assigned appointments" ON public.appointments
    FOR SELECT TO authenticated
    USING (public.get_current_user_role() = 'doctor' AND doctor_id = public.get_current_doctor_id());

CREATE POLICY "Receptionists can view clinic appointments" ON public.appointments
    FOR SELECT TO authenticated USING (public.get_current_user_role() = 'receptionist');

CREATE POLICY "Patients can book own appointments" ON public.appointments
    FOR INSERT TO authenticated WITH CHECK (patient_uid = auth.uid()::text AND status = 'scheduled');

CREATE POLICY "Receptionists can book appointments" ON public.appointments
    FOR INSERT TO authenticated WITH CHECK (public.get_current_user_role() = 'receptionist');

CREATE POLICY "Patients can cancel own appointments" ON public.appointments
    FOR UPDATE TO authenticated
    USING (patient_uid = auth.uid()::text)
    WITH CHECK (patient_uid = auth.uid()::text AND status = 'cancelled');

CREATE POLICY "Doctors can update assigned appointments" ON public.appointments
    FOR UPDATE TO authenticated
    USING (public.get_current_user_role() = 'doctor' AND doctor_id = public.get_current_doctor_id());

CREATE POLICY "Receptionists can update appointments" ON public.appointments
    FOR UPDATE TO authenticated
    USING (public.get_current_user_role() = 'receptionist')
    WITH CHECK (public.get_current_user_role() = 'receptionist');

CREATE POLICY "Admin full control on appointments" ON public.appointments
    FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Assignments
DROP POLICY IF EXISTS "Patients can view own assignments" ON public.doctor_patient_assignments;
DROP POLICY IF EXISTS "Doctors can view own assignments" ON public.doctor_patient_assignments;
DROP POLICY IF EXISTS "Staff can manage assignments" ON public.doctor_patient_assignments;

CREATE POLICY "Patients can view own assignments" ON public.doctor_patient_assignments
    FOR SELECT TO authenticated USING (patient_uid = auth.uid()::text);

CREATE POLICY "Doctors can view own assignments" ON public.doctor_patient_assignments
    FOR SELECT TO authenticated
    USING (public.get_current_user_role() = 'doctor' AND doctor_id = public.get_current_doctor_id());

CREATE POLICY "Staff can manage assignments" ON public.doctor_patient_assignments
    FOR ALL TO authenticated
    USING (public.get_current_user_role() IN ('doctor', 'admin'))
    WITH CHECK (public.get_current_user_role() IN ('doctor', 'admin'));

-- Prescriptions
DROP POLICY IF EXISTS "Patients can view own prescriptions" ON public.prescriptions;
DROP POLICY IF EXISTS "Doctors can view assigned patient prescriptions" ON public.prescriptions;
DROP POLICY IF EXISTS "Doctors can create prescriptions for assigned patients" ON public.prescriptions;
DROP POLICY IF EXISTS "Doctors can update prescriptions for assigned patients" ON public.prescriptions;
DROP POLICY IF EXISTS "Patients can request refills" ON public.prescriptions;
DROP POLICY IF EXISTS "Admin full control on prescriptions" ON public.prescriptions;

CREATE POLICY "Patients can view own prescriptions" ON public.prescriptions
    FOR SELECT TO authenticated USING (patient_uid = auth.uid()::text);

CREATE POLICY "Doctors can view assigned patient prescriptions" ON public.prescriptions
    FOR SELECT TO authenticated
    USING (
        public.get_current_user_role() = 'doctor'
        AND public.is_doctor_assigned_to_patient(public.get_current_doctor_id(), patient_uid)
    );

CREATE POLICY "Doctors can create prescriptions for assigned patients" ON public.prescriptions
    FOR INSERT TO authenticated
    WITH CHECK (
        public.get_current_user_role() = 'doctor'
        AND public.is_doctor_assigned_to_patient(public.get_current_doctor_id(), patient_uid)
    );

CREATE POLICY "Doctors can update prescriptions for assigned patients" ON public.prescriptions
    FOR UPDATE TO authenticated
    USING (
        public.get_current_user_role() = 'doctor'
        AND public.is_doctor_assigned_to_patient(public.get_current_doctor_id(), patient_uid)
    );

CREATE POLICY "Patients can request refills" ON public.prescriptions
    FOR UPDATE TO authenticated
    USING (patient_uid = auth.uid()::text)
    WITH CHECK (patient_uid = auth.uid()::text AND status = 'refill-requested');

CREATE POLICY "Admin full control on prescriptions" ON public.prescriptions
    FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Medical Records
DROP POLICY IF EXISTS "Patients can view own medical records" ON public.medical_records;
DROP POLICY IF EXISTS "Doctors can view assigned patient medical records" ON public.medical_records;
DROP POLICY IF EXISTS "Patients can upload own medical records" ON public.medical_records;
DROP POLICY IF EXISTS "Doctors can create patient medical records" ON public.medical_records;
DROP POLICY IF EXISTS "Admin full control on medical records" ON public.medical_records;

CREATE POLICY "Patients can view own medical records" ON public.medical_records
    FOR SELECT TO authenticated USING (patient_uid = auth.uid()::text);

CREATE POLICY "Doctors can view assigned patient medical records" ON public.medical_records
    FOR SELECT TO authenticated
    USING (
        public.get_current_user_role() = 'doctor'
        AND public.is_doctor_assigned_to_patient(public.get_current_doctor_id(), patient_uid)
    );

CREATE POLICY "Patients can upload own medical records" ON public.medical_records
    FOR INSERT TO authenticated WITH CHECK (patient_uid = auth.uid()::text);

CREATE POLICY "Doctors can create patient medical records" ON public.medical_records
    FOR INSERT TO authenticated
    WITH CHECK (
        public.get_current_user_role() = 'doctor'
        AND public.is_doctor_assigned_to_patient(public.get_current_doctor_id(), patient_uid)
    );

CREATE POLICY "Admin full control on medical records" ON public.medical_records
    FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- AI Consultations
DROP POLICY IF EXISTS "Service role full access on ai_consultations" ON public.ai_consultations;
DROP POLICY IF EXISTS "Patients can view own ai consultations" ON public.ai_consultations;
DROP POLICY IF EXISTS "Patients can insert own ai consultations" ON public.ai_consultations;
DROP POLICY IF EXISTS "Patients can update own ai consultations" ON public.ai_consultations;
DROP POLICY IF EXISTS "Admin can view ai consultations" ON public.ai_consultations;

CREATE POLICY "Service role full access on ai_consultations" ON public.ai_consultations
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Patients can view own ai consultations" ON public.ai_consultations
    FOR SELECT TO authenticated USING (patient_uid = auth.uid()::text);

CREATE POLICY "Patients can insert own ai consultations" ON public.ai_consultations
    FOR INSERT TO authenticated WITH CHECK (patient_uid = auth.uid()::text);

CREATE POLICY "Patients can update own ai consultations" ON public.ai_consultations
    FOR UPDATE TO authenticated
    USING (patient_uid = auth.uid()::text)
    WITH CHECK (patient_uid = auth.uid()::text);

CREATE POLICY "Admin can view ai consultations" ON public.ai_consultations
    FOR SELECT TO authenticated USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- 15. STORAGE BUCKET & RLS POLICIES
-- ------------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'clinical-records',
    'clinical-records',
    false,
    10485760,
    ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET public = false, file_size_limit = 10485760;

DROP POLICY IF EXISTS "Read clinical records" ON storage.objects;
DROP POLICY IF EXISTS "Upload clinical records" ON storage.objects;
DROP POLICY IF EXISTS "Delete clinical records" ON storage.objects;

CREATE POLICY "Read clinical records" ON storage.objects
    FOR SELECT TO authenticated
    USING (
        bucket_id = 'clinical-records'
        AND (
            (storage.foldername(name))[1] = auth.uid()::text
            OR (
                public.get_current_user_role() = 'doctor' 
                AND public.is_doctor_assigned_to_patient(public.get_current_doctor_id(), (storage.foldername(name))[1])
            )
            OR public.is_admin()
        )
    );

CREATE POLICY "Upload clinical records" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'clinical-records'
        AND (
            (storage.foldername(name))[1] = auth.uid()::text
            OR (
                public.get_current_user_role() = 'doctor' 
                AND public.is_doctor_assigned_to_patient(public.get_current_doctor_id(), (storage.foldername(name))[1])
            )
            OR public.is_admin()
        )
    );

CREATE POLICY "Delete clinical records" ON storage.objects
    FOR DELETE TO authenticated
    USING (
        bucket_id = 'clinical-records'
        AND (
            (storage.foldername(name))[1] = auth.uid()::text
            OR public.is_admin()
        )
    );

-- ------------------------------------------------------------------------------
-- 16. REALTIME REGISTRATION
-- ------------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'appointments') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'prescriptions') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.prescriptions;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'medical_records') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.medical_records;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'ai_consultations') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.ai_consultations;
  END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 17. INITIAL SEED DATA (Preserved with ON CONFLICT safety)
-- ------------------------------------------------------------------------------
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
