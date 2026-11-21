import {
  createClient,
  SupabaseClient,
  User,
  Session,
  AuthError,
  AuthChangeEvent,
} from '@supabase/supabase-js';
import { Database } from '../types/supabase';
import {
  AiConsultationMessage,
  AppointmentRecord,
  DepartmentUnit,
  DoctorProfile,
  MedicalRecordItem,
  PrescriptionRecord,
  UserProfile,
  UserRole,
} from '../types/medicure';

export type { User, Session, AuthError };

// -----------------------------------------------------------------------------
// Environment Variables & Client Initialization
// -----------------------------------------------------------------------------
export function normalizeSupabaseUrl(rawUrl?: string): string {
  if (!rawUrl) return '';
  let url = rawUrl.trim();
  url = url.replace(/\/+$/, '');
  url = url.replace(/\/rest\/v1\/?$/i, '');
  return url;
}

const rawEnvUrl =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
  (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_URL) ||
  '';

const envUrl = normalizeSupabaseUrl(rawEnvUrl);

const envAnonKey =
  ((typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
    (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_ANON_KEY) ||
    '').trim();

export const isSupabaseConfigured = (): boolean => {
  return (
    Boolean(envUrl) &&
    Boolean(envAnonKey) &&
    !envUrl.includes('placeholder') &&
    !envUrl.includes('your-project') &&
    envUrl.startsWith('https://')
  );
};

// Fallback dummy URL so createClient does not throw on module import if env is empty
const defaultUrl = isSupabaseConfigured() ? envUrl : 'https://placeholder-project.supabase.co';
const defaultKey = isSupabaseConfigured() ? envAnonKey : 'placeholder-anon-key';

export const supabase: SupabaseClient<Database> = createClient<Database>(
  defaultUrl,
  defaultKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

// -----------------------------------------------------------------------------
// Authentication Operations (Supabase Email & Password)
// -----------------------------------------------------------------------------

export async function signInWithEmail(
  email: string,
  password: string
): Promise<{
  user: User | null;
  session: Session | null;
  error: AuthError | null;
}> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured. Please check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  return { user: data.user, session: data.session, error };
}

export async function signUpWithEmail(
  email: string,
  password: string,
  displayName: string,
  role: UserRole = 'patient'
): Promise<{
  user: User | null;
  session: Session | null;
  error: AuthError | null;
}> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured. Please check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
  }

  // Prevent users from granting themselves administrator status via client metadata
  const safeRole: UserRole = role === 'admin' ? 'patient' : role;

  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: {
      data: {
        display_name: displayName.trim(),
        role: safeRole,
      },
    },
  });

  return { user: data.user, session: data.session, error };
}

export async function signOutSupabase(): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Error signing out of Supabase:', error);
    throw error;
  }
}

export function listenToSupabaseAuth(
  callback: (event: AuthChangeEvent, session: Session | null) => void
): () => void {
  if (!isSupabaseConfigured()) {
    return () => {};
  }

  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });

  return () => {
    data.subscription.unsubscribe();
  };
}

export async function getSupabaseSession(): Promise<Session | null> {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.warn('Error reading Supabase session:', error.message);
    return null;
  }
  return data.session;
}

// -----------------------------------------------------------------------------
// Data Mappers: Supabase (snake_case) <-> Application (camelCase)
// -----------------------------------------------------------------------------

export function mapDoctorFromRow(row: Database['public']['Tables']['doctors']['Row']): DoctorProfile {
  return {
    id: row.id,
    name: row.name,
    credentials: row.credentials,
    specialty: row.specialty,
    department: row.department,
    hospital: row.hospital,
    npi: row.npi,
    license: row.license || undefined,
    experienceYears: row.experience_years,
    rating: Number(row.rating),
    reviewCount: row.review_count,
    consultationsCount: row.consultations_count,
    baseFee: Number(row.base_fee),
    copayFee: Number(row.copay_fee),
    dutyStatus: row.duty_status,
    telehealthReady: row.telehealth_ready,
    inClinicReady: row.in_clinic_ready,
    availableToday: row.available_today,
    isActive: row.is_active,
    bio: row.bio,
    languages: Array.isArray(row.languages) ? row.languages : [],
    acceptedInsurance: Array.isArray(row.accepted_insurance) ? row.accepted_insurance : [],
    nextSlots: Array.isArray(row.next_slots) ? row.next_slots : [],
    avatarKey: row.avatar_key,
  };
}

export function mapDepartmentFromRow(row: Database['public']['Tables']['departments']['Row']): DepartmentUnit {
  return {
    id: row.id,
    name: row.name,
    headDoctor: row.head_doctor,
    totalDoctors: row.total_doctors,
    activePatients: row.active_patients,
    todaysAppointments: row.todays_appointments,
    isActive: row.is_active,
  };
}

export function mapAppointmentFromRow(row: Database['public']['Tables']['appointments']['Row']): AppointmentRecord {
  return {
    id: row.id,
    patientUid: row.patient_uid,
    patientName: row.patient_name,
    patientPid: row.patient_pid,
    doctorId: row.doctor_id,
    doctorName: row.doctor_name,
    doctorCredentials: row.doctor_credentials || undefined,
    specialty: row.specialty,
    department: row.department || undefined,
    location: row.location,
    visitMode: row.visit_mode,
    appointmentDate: row.appointment_date,
    appointmentTime: row.appointment_time,
    durationMinutes: row.duration_minutes,
    status: row.status,
    chiefComplaint: row.chief_complaint,
    symptomDuration: row.symptom_duration || undefined,
    symptomDescription: row.symptom_description || undefined,
    riskFactors: Array.isArray(row.risk_factors) ? row.risk_factors : [],
    attachedDocumentName: row.attached_document_name || undefined,
    insuranceProvider: row.insurance_provider || undefined,
    policyId: row.policy_id || undefined,
    standardFee: row.standard_fee ? Number(row.standard_fee) : undefined,
    insurerCoverage: row.insurer_coverage ? Number(row.insurer_coverage) : undefined,
    copayAmount: Number(row.copay_amount),
    copayPaid: row.copay_paid,
    receiptNumber: row.receipt_number || undefined,
    roomNumber: row.room_number || undefined,
    physicianSummary: row.physician_summary || undefined,
  };
}

export function mapPrescriptionFromRow(row: Database['public']['Tables']['prescriptions']['Row']): PrescriptionRecord {
  return {
    id: row.id,
    patientUid: row.patient_uid,
    medicationName: row.medication_name,
    dosage: row.dosage,
    frequency: row.frequency || undefined,
    prescriberName: row.prescriber_name,
    pharmacy: row.pharmacy || undefined,
    refillsRemaining: row.refills_remaining,
    status: row.status,
    lastFilledDate: row.last_filled_date || undefined,
    nextRefillDue: row.next_refill_due || undefined,
  };
}

export function mapMedicalRecordFromRow(row: Database['public']['Tables']['medical_records']['Row']): MedicalRecordItem {
  return {
    id: row.id,
    patientUid: row.patient_uid,
    title: row.title,
    category: row.category,
    providerName: row.provider_name,
    dateLabel: row.date_label,
    status: row.status,
    summary: row.summary,
    metrics: Array.isArray(row.metrics) ? row.metrics : [],
  };
}

export function mapAiMessageFromRow(row: Database['public']['Tables']['ai_consultations']['Row']): AiConsultationMessage {
  return {
    id: row.id,
    patientUid: row.patient_uid,
    sender: row.sender,
    content: row.content,
    severity: row.severity || undefined,
    triagePriority: row.triage_priority || undefined,
    icd10Code: row.icd10_code || undefined,
    observations: Array.isArray(row.observations) ? row.observations : [],
    protocol: Array.isArray(row.protocol) ? row.protocol : [],
  };
}

export function mapUserProfileFromRow(row: Database['public']['Tables']['user_profiles']['Row']): UserProfile {
  return {
    uid: row.uid,
    displayName: row.display_name,
    email: row.email,
    role: row.role,
    pid: row.pid,
    phone: row.phone || undefined,
    dob: row.dob || undefined,
    bloodGroup: row.blood_group || undefined,
    emergencyContact: row.emergency_contact || undefined,
    insuranceProvider: row.insurance_provider || undefined,
    policyId: row.policy_id || undefined,
    allergies: row.allergies || undefined,
  };
}

// -----------------------------------------------------------------------------
// Database Query & Mutation Operations
// -----------------------------------------------------------------------------

export async function fetchSupabaseDoctors(): Promise<DoctorProfile[]> {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase
    .from('doctors')
    .select('*')
    .eq('is_active', true)
    .order('name');
  if (error) {
    console.error('Error fetching Supabase doctors:', error);
    throw error;
  }
  return (data || []).map(mapDoctorFromRow);
}

export async function fetchSupabaseDepartments(): Promise<DepartmentUnit[]> {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase
    .from('departments')
    .select('*')
    .eq('is_active', true)
    .order('name');
  if (error) {
    console.error('Error fetching Supabase departments:', error);
    throw error;
  }
  return (data || []).map(mapDepartmentFromRow);
}

export async function fetchSupabaseAppointments(
  patientUid?: string,
  isAdmin?: boolean
): Promise<AppointmentRecord[]> {
  if (!isSupabaseConfigured()) return [];
  let query = supabase.from('appointments').select('*').order('created_at', { ascending: false });
  if (!isAdmin && patientUid) {
    query = query.eq('patient_uid', patientUid);
  }
  const { data, error } = await query;
  if (error) {
    console.error('Error fetching Supabase appointments:', error);
    throw error;
  }
  return (data || []).map(mapAppointmentFromRow);
}

export async function fetchSupabasePrescriptions(
  patientUid?: string,
  isAdmin?: boolean
): Promise<PrescriptionRecord[]> {
  if (!isSupabaseConfigured()) return [];
  let query = supabase.from('prescriptions').select('*').order('created_at', { ascending: false });
  if (!isAdmin && patientUid) {
    query = query.eq('patient_uid', patientUid);
  }
  const { data, error } = await query;
  if (error) {
    console.error('Error fetching Supabase prescriptions:', error);
    throw error;
  }
  return (data || []).map(mapPrescriptionFromRow);
}

export async function fetchSupabaseMedicalRecords(
  patientUid?: string,
  isAdmin?: boolean
): Promise<MedicalRecordItem[]> {
  if (!isSupabaseConfigured()) return [];
  let query = supabase.from('medical_records').select('*').order('created_at', { ascending: false });
  if (!isAdmin && patientUid) {
    query = query.eq('patient_uid', patientUid);
  }
  const { data, error } = await query;
  if (error) {
    console.error('Error fetching Supabase medical records:', error);
    throw error;
  }
  return (data || []).map(mapMedicalRecordFromRow);
}

export async function fetchSupabaseAiMessages(patientUid: string): Promise<AiConsultationMessage[]> {
  if (!patientUid) return [];

  // 1. Direct Supabase Query
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('ai_consultations')
        .select('*')
        .eq('patient_uid', patientUid)
        .order('created_at', { ascending: true });

      if (!error && data) {
        return data.map(mapAiMessageFromRow);
      }
    } catch (err) {
      console.warn('Direct Supabase AI consultation query threw, trying API fallback:', err);
    }
  }

  // 2. Fallback to authenticated server endpoint
  try {
    const session = await getSupabaseSession();
    const token = session?.access_token;
    const res = await fetch(`/api/ai-consultations?patientUid=${encodeURIComponent(patientUid)}`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (res.ok) {
      const data = await res.json();
      return (data || []).map(mapAiMessageFromRow);
    }
  } catch (err) {
    console.error('API endpoint fetch for AI consultations failed:', err);
  }

  return [];
}

export async function fetchSupabaseUserProfile(uid: string): Promise<UserProfile | null> {
  if (!isSupabaseConfigured() || !uid) return null;
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('uid', uid)
    .maybeSingle();
  if (error) {
    console.error('Error fetching Supabase user profile:', error);
    return null;
  }
  return data ? mapUserProfileFromRow(data) : null;
}

/**
 * Creates or updates a user profile without hardcoded patient data.
 * Each authenticated user gets their authentic email, display name, and unique PID.
 */
export async function upsertSupabaseUserProfile(
  profile: Partial<UserProfile> & { uid: string; email: string; displayName?: string }
): Promise<void> {
  if (!isSupabaseConfigured()) return;

  const uniquePid = profile.pid || `PID-${Math.floor(10000 + Math.random() * 89999)}`;
  const resolvedDisplayName =
    profile.displayName?.trim() ||
    profile.email.split('@')[0] ||
    'New Patient';

  const row: Database['public']['Tables']['user_profiles']['Insert'] = {
    id: profile.uid,
    uid: profile.uid,
    display_name: resolvedDisplayName,
    email: profile.email.toLowerCase().trim(),
    role: profile.role || 'patient',
    pid: uniquePid,
    phone: profile.phone || null,
    dob: profile.dob || null,
    blood_group: profile.bloodGroup || null,
    emergency_contact: profile.emergencyContact || null,
    insurance_provider: profile.insuranceProvider || null,
    policy_id: profile.policyId || null,
    allergies: profile.allergies || null,
  };

  const { error } = await supabase
    .from('user_profiles')
    .upsert(row, { onConflict: 'uid' });

  if (error) {
    console.error('Error upserting Supabase user profile:', error);
    throw error;
  }
}

export async function updateSupabaseUserProfile(
  uid: string,
  updates: Partial<UserProfile>
): Promise<void> {
  if (!isSupabaseConfigured() || !uid) return;

  const rowUpdates: Database['public']['Tables']['user_profiles']['Update'] = {};

  if (updates.displayName !== undefined) rowUpdates.display_name = updates.displayName.slice(0, 120);
  if (updates.phone !== undefined) rowUpdates.phone = updates.phone ? updates.phone.slice(0, 40) : null;
  if (updates.dob !== undefined) rowUpdates.dob = updates.dob ? updates.dob.slice(0, 40) : null;
  if (updates.bloodGroup !== undefined) rowUpdates.blood_group = updates.bloodGroup ? updates.bloodGroup.slice(0, 30) : null;
  if (updates.emergencyContact !== undefined) rowUpdates.emergency_contact = updates.emergencyContact ? updates.emergencyContact.slice(0, 120) : null;
  if (updates.insuranceProvider !== undefined) rowUpdates.insurance_provider = updates.insuranceProvider ? updates.insuranceProvider.slice(0, 120) : null;
  if (updates.policyId !== undefined) rowUpdates.policy_id = updates.policyId ? updates.policyId.slice(0, 64) : null;
  if (updates.allergies !== undefined) rowUpdates.allergies = updates.allergies ? updates.allergies.slice(0, 240) : null;

  const { error } = await supabase
    .from('user_profiles')
    .update(rowUpdates)
    .eq('uid', uid);

  if (error) {
    console.error('Error updating Supabase user profile:', error);
    throw error;
  }
}

export async function insertSupabaseAppointment(apt: AppointmentRecord): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const row: Database['public']['Tables']['appointments']['Insert'] = {
    id: apt.id,
    patient_uid: apt.patientUid,
    patient_name: apt.patientName,
    patient_pid: apt.patientPid,
    doctor_id: apt.doctorId,
    doctor_name: apt.doctorName,
    doctor_credentials: apt.doctorCredentials || null,
    specialty: apt.specialty,
    department: apt.department || null,
    location: apt.location,
    visit_mode: apt.visitMode,
    appointment_date: apt.appointmentDate,
    appointment_time: apt.appointmentTime,
    duration_minutes: apt.durationMinutes || 45,
    status: apt.status,
    chief_complaint: apt.chiefComplaint,
    symptom_duration: apt.symptomDuration || null,
    symptom_description: apt.symptomDescription || null,
    risk_factors: apt.riskFactors || [],
    attached_document_name: apt.attachedDocumentName || null,
    insurance_provider: apt.insuranceProvider || null,
    policy_id: apt.policyId || null,
    standard_fee: apt.standardFee || 0,
    insurer_coverage: apt.insurerCoverage || 0,
    copay_amount: apt.copayAmount || 0,
    copay_paid: apt.copayPaid ?? true,
    receipt_number: apt.receiptNumber || null,
    room_number: apt.roomNumber || null,
    physician_summary: apt.physicianSummary || null,
  };

  const { error } = await supabase.from('appointments').insert(row);
  if (error) {
    console.error('Error inserting Supabase appointment:', error);
    throw error;
  }
}

export async function updateSupabaseAppointment(
  appointmentId: string,
  updates: Partial<AppointmentRecord>
): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const rowUpdates: Database['public']['Tables']['appointments']['Update'] = {};

  if (updates.status !== undefined) rowUpdates.status = updates.status;
  if (updates.appointmentDate !== undefined) rowUpdates.appointment_date = updates.appointmentDate;
  if (updates.appointmentTime !== undefined) rowUpdates.appointment_time = updates.appointmentTime;
  if (updates.physicianSummary !== undefined) rowUpdates.physician_summary = updates.physicianSummary;
  if (updates.roomNumber !== undefined) rowUpdates.room_number = updates.roomNumber;
  if (updates.copayPaid !== undefined) rowUpdates.copay_paid = updates.copayPaid;
  if (updates.receiptNumber !== undefined) rowUpdates.receipt_number = updates.receiptNumber;

  const { error } = await supabase
    .from('appointments')
    .update(rowUpdates)
    .eq('id', appointmentId);

  if (error) {
    console.error('Error updating Supabase appointment:', error);
    throw error;
  }
}

export async function insertSupabasePrescription(rx: PrescriptionRecord): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const row: Database['public']['Tables']['prescriptions']['Insert'] = {
    id: rx.id,
    patient_uid: rx.patientUid,
    medication_name: rx.medicationName,
    dosage: rx.dosage,
    frequency: rx.frequency || null,
    prescriber_name: rx.prescriberName,
    pharmacy: rx.pharmacy || 'CVS Pharmacy #4829 • Main St',
    refills_remaining: rx.refillsRemaining,
    status: rx.status,
    last_filled_date: rx.lastFilledDate || null,
    next_refill_due: rx.nextRefillDue || null,
  };

  const { error } = await supabase.from('prescriptions').insert(row);
  if (error) {
    console.error('Error inserting Supabase prescription:', error);
    throw error;
  }
}

export async function updateSupabasePrescription(
  rxId: string,
  status: PrescriptionRecord['status']
): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const { error } = await supabase
    .from('prescriptions')
    .update({ status })
    .eq('id', rxId);

  if (error) {
    console.error('Error updating Supabase prescription:', error);
    throw error;
  }
}

export async function insertSupabaseMedicalRecord(rec: MedicalRecordItem): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const row: Database['public']['Tables']['medical_records']['Insert'] = {
    id: rec.id,
    patient_uid: rec.patientUid,
    title: rec.title,
    category: rec.category,
    provider_name: rec.providerName,
    date_label: rec.dateLabel,
    status: rec.status,
    summary: rec.summary,
    metrics: rec.metrics || [],
  };

  const { error } = await supabase.from('medical_records').insert(row);
  if (error) {
    console.error('Error inserting Supabase medical record:', error);
    throw error;
  }
}

export async function insertSupabaseAiMessage(msg: AiConsultationMessage): Promise<void> {
  if (!msg.patientUid) return;
  const row: Database['public']['Tables']['ai_consultations']['Insert'] = {
    id: msg.id,
    patient_uid: msg.patientUid,
    sender: msg.sender,
    content: msg.content,
    severity: msg.severity || null,
    triage_priority: msg.triagePriority || null,
    icd10_code: msg.icd10Code || null,
    observations: msg.observations || [],
    protocol: msg.protocol || [],
  };

  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase.from('ai_consultations').upsert(row, { onConflict: 'id' });
      if (error) {
        console.warn('Direct Supabase AI consultation upsert note (persisted via server):', error.message);
      }
    } catch (err) {
      console.warn('Supabase AI consultation upsert error:', err);
    }
  }
}

export async function insertSupabaseDoctor(doc: DoctorProfile): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const row: Database['public']['Tables']['doctors']['Insert'] = {
    id: doc.id,
    name: doc.name,
    credentials: doc.credentials,
    specialty: doc.specialty,
    department: doc.department,
    hospital: doc.hospital,
    npi: doc.npi,
    license: doc.license || null,
    experience_years: doc.experienceYears,
    rating: doc.rating,
    review_count: doc.reviewCount,
    consultations_count: doc.consultationsCount,
    base_fee: doc.baseFee,
    copay_fee: doc.copayFee,
    duty_status: doc.dutyStatus,
    telehealth_ready: doc.telehealthReady,
    in_clinic_ready: doc.inClinicReady,
    available_today: doc.availableToday,
    is_active: doc.isActive,
    bio: doc.bio,
    languages: doc.languages,
    accepted_insurance: doc.acceptedInsurance,
    next_slots: doc.nextSlots,
    avatar_key: doc.avatarKey,
  };

  const { error } = await supabase.from('doctors').insert(row);
  if (error) {
    console.error('Error inserting Supabase doctor:', error);
    throw error;
  }
}

// -----------------------------------------------------------------------------
// Storage Operations (Supabase Storage Bucket: clinical-records)
// -----------------------------------------------------------------------------

export async function uploadDiagnosticFile(
  patientUid: string,
  file: File
): Promise<{ path: string }> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured.');
  }

  const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const filePath = `${patientUid}/${Date.now()}_${safeFileName}`;

  const { data, error } = await supabase.storage
    .from('clinical-records')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('Error uploading clinical file to Supabase Storage:', error);
    throw error;
  }

  return { path: data.path };
}

export async function getDiagnosticFileSignedUrl(
  filePath: string,
  expiresInSeconds: number = 3600
): Promise<string | null> {
  if (!isSupabaseConfigured() || !filePath) return null;

  const { data, error } = await supabase.storage
    .from('clinical-records')
    .createSignedUrl(filePath, expiresInSeconds);

  if (error) {
    console.error('Error creating signed URL for clinical file:', error);
    return null;
  }

  return data.signedUrl;
}

// -----------------------------------------------------------------------------
// Realtime Subscriptions
// -----------------------------------------------------------------------------

export function subscribeToSupabaseTable(
  table: 'appointments' | 'prescriptions' | 'medical_records' | 'ai_consultations' | 'doctors' | 'departments' | 'user_profiles',
  onChange: () => void
): () => void {
  if (!isSupabaseConfigured()) return () => {};

  const channel = supabase
    .channel(`public:${table}-changes-${Math.random().toString(36).slice(2, 7)}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table,
      },
      () => {
        onChange();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// -----------------------------------------------------------------------------
// Connection Diagnostics
// -----------------------------------------------------------------------------

export async function testSupabaseConnection(): Promise<{
  success: boolean;
  message: string;
  error?: string;
}> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      message: 'Supabase credentials are not configured yet in .env',
    };
  }

  try {
    const { count, error } = await supabase
      .from('doctors')
      .select('*', { count: 'exact', head: true });

    if (error) {
      return {
        success: false,
        message: `Connected to Supabase, but encountered error: ${error.message}. Please verify table schema in Supabase SQL Editor.`,
        error: error.message,
      };
    }

    return {
      success: true,
      message: `Supabase database connected successfully! (Found ${count ?? 0} doctors in directory)`,
    };
  } catch (err) {
    return {
      success: false,
      message: 'Failed to connect to Supabase endpoint.',
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
