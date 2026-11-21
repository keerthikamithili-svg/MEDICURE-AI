-- ==============================================================================
-- MediCure AI Health Platform - Hardened Permission & Security Upgrade Script
-- Idempotent upgrade for existing Supabase projects
-- ==============================================================================

-- 1. Ensure Table Structure & Relations
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS user_uid TEXT UNIQUE;
ALTER TABLE public.prescriptions ADD COLUMN IF NOT EXISTS doctor_id TEXT REFERENCES public.doctors(id) ON DELETE SET NULL;
ALTER TABLE public.medical_records ADD COLUMN IF NOT EXISTS doctor_id TEXT REFERENCES public.doctors(id) ON DELETE SET NULL;

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

-- 2. Revoke Unsafe Blanket Anon Grants
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
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO service_role;

-- 3. Install Security Functions with Safe search_path
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

GRANT EXECUTE ON FUNCTION public.get_current_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_current_doctor_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_doctor_assigned_to_patient(TEXT, TEXT) TO authenticated;

-- 4. Install Database-Level Validation Triggers
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

-- 5. Drop ALL Existing Permissive Policies to Eliminate Security Loopholes
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN
        SELECT policyname, tablename
        FROM pg_policies
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
    END LOOP;
END $$;

-- 6. Apply Hardened Least-Privilege Policies

-- User Profiles
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
CREATE POLICY "Public directory read on doctors" ON public.doctors
    FOR SELECT TO anon, authenticated USING (is_active = true OR public.is_admin());

CREATE POLICY "Doctors can update own profile" ON public.doctors
    FOR UPDATE TO authenticated
    USING (user_uid = auth.uid()::text OR id = auth.uid()::text)
    WITH CHECK (user_uid = auth.uid()::text OR id = auth.uid()::text);

CREATE POLICY "Admin full control on doctors" ON public.doctors
    FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Departments
CREATE POLICY "Public directory read on departments" ON public.departments
    FOR SELECT TO anon, authenticated USING (is_active = true OR public.is_admin());

CREATE POLICY "Admin full control on departments" ON public.departments
    FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Appointments
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

-- 7. Storage Bucket & Policies
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
