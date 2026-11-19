export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          uid: string;
          display_name: string;
          email: string;
          role: 'patient' | 'doctor' | 'receptionist' | 'admin';
          pid: string;
          phone: string | null;
          dob: string | null;
          blood_group: string | null;
          emergency_contact: string | null;
          insurance_provider: string | null;
          policy_id: string | null;
          allergies: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          uid: string;
          display_name: string;
          email: string;
          role?: 'patient' | 'doctor' | 'receptionist' | 'admin';
          pid?: string;
          phone?: string | null;
          dob?: string | null;
          blood_group?: string | null;
          emergency_contact?: string | null;
          insurance_provider?: string | null;
          policy_id?: string | null;
          allergies?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          uid?: string;
          display_name?: string;
          email?: string;
          role?: 'patient' | 'doctor' | 'receptionist' | 'admin';
          pid?: string;
          phone?: string | null;
          dob?: string | null;
          blood_group?: string | null;
          emergency_contact?: string | null;
          insurance_provider?: string | null;
          policy_id?: string | null;
          allergies?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      doctors: {
        Row: {
          id: string;
          name: string;
          credentials: string;
          specialty: string;
          department: string;
          hospital: string;
          npi: string;
          license: string | null;
          experience_years: number;
          rating: number;
          review_count: number;
          consultations_count: number;
          base_fee: number;
          copay_fee: number;
          duty_status: 'In Consultation' | 'On Duty' | 'Off Duty';
          telehealth_ready: boolean;
          in_clinic_ready: boolean;
          available_today: boolean;
          is_active: boolean;
          bio: string;
          languages: string[];
          accepted_insurance: string[];
          next_slots: string[];
          avatar_key: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          credentials: string;
          specialty: string;
          department: string;
          hospital: string;
          npi: string;
          license?: string | null;
          experience_years?: number;
          rating?: number;
          review_count?: number;
          consultations_count?: number;
          base_fee?: number;
          copay_fee?: number;
          duty_status?: 'In Consultation' | 'On Duty' | 'Off Duty';
          telehealth_ready?: boolean;
          in_clinic_ready?: boolean;
          available_today?: boolean;
          is_active?: boolean;
          bio?: string;
          languages?: string[];
          accepted_insurance?: string[];
          next_slots?: string[];
          avatar_key?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          credentials?: string;
          specialty?: string;
          department?: string;
          hospital?: string;
          npi?: string;
          license?: string | null;
          experience_years?: number;
          rating?: number;
          review_count?: number;
          consultations_count?: number;
          base_fee?: number;
          copay_fee?: number;
          duty_status?: 'In Consultation' | 'On Duty' | 'Off Duty';
          telehealth_ready?: boolean;
          in_clinic_ready?: boolean;
          available_today?: boolean;
          is_active?: boolean;
          bio?: string;
          languages?: string[];
          accepted_insurance?: string[];
          next_slots?: string[];
          avatar_key?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      departments: {
        Row: {
          id: string;
          name: string;
          head_doctor: string;
          total_doctors: number;
          active_patients: number;
          todays_appointments: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          head_doctor: string;
          total_doctors?: number;
          active_patients?: number;
          todays_appointments?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          head_doctor?: string;
          total_doctors?: number;
          active_patients?: number;
          todays_appointments?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      appointments: {
        Row: {
          id: string;
          patient_uid: string;
          patient_name: string;
          patient_pid: string;
          doctor_id: string;
          doctor_name: string;
          doctor_credentials: string | null;
          specialty: string;
          department: string | null;
          location: string;
          visit_mode: 'in-person' | 'telehealth';
          appointment_date: string;
          appointment_time: string;
          duration_minutes: number;
          status: 'scheduled' | 'checked-in' | 'in-exam' | 'completed' | 'cancelled';
          chief_complaint: string;
          symptom_duration: string | null;
          symptom_description: string | null;
          risk_factors: string[];
          attached_document_name: string | null;
          insurance_provider: string | null;
          policy_id: string | null;
          standard_fee: number;
          insurer_coverage: number;
          copay_amount: number;
          copay_paid: boolean;
          receipt_number: string | null;
          room_number: string | null;
          physician_summary: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          patient_uid: string;
          patient_name: string;
          patient_pid: string;
          doctor_id: string;
          doctor_name: string;
          doctor_credentials?: string | null;
          specialty: string;
          department?: string | null;
          location: string;
          visit_mode: 'in-person' | 'telehealth';
          appointment_date: string;
          appointment_time: string;
          duration_minutes?: number;
          status?: 'scheduled' | 'checked-in' | 'in-exam' | 'completed' | 'cancelled';
          chief_complaint: string;
          symptom_duration?: string | null;
          symptom_description?: string | null;
          risk_factors?: string[];
          attached_document_name?: string | null;
          insurance_provider?: string | null;
          policy_id?: string | null;
          standard_fee?: number;
          insurer_coverage?: number;
          copay_amount?: number;
          copay_paid?: boolean;
          receipt_number?: string | null;
          room_number?: string | null;
          physician_summary?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          patient_uid?: string;
          patient_name?: string;
          patient_pid?: string;
          doctor_id?: string;
          doctor_name?: string;
          doctor_credentials?: string | null;
          specialty?: string;
          department?: string | null;
          location?: string;
          visit_mode?: 'in-person' | 'telehealth';
          appointment_date?: string;
          appointment_time?: string;
          duration_minutes?: number;
          status?: 'scheduled' | 'checked-in' | 'in-exam' | 'completed' | 'cancelled';
          chief_complaint?: string;
          symptom_duration?: string | null;
          symptom_description?: string | null;
          risk_factors?: string[];
          attached_document_name?: string | null;
          insurance_provider?: string | null;
          policy_id?: string | null;
          standard_fee?: number;
          insurer_coverage?: number;
          copay_amount?: number;
          copay_paid?: boolean;
          receipt_number?: string | null;
          room_number?: string | null;
          physician_summary?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      prescriptions: {
        Row: {
          id: string;
          patient_uid: string;
          medication_name: string;
          dosage: string;
          frequency: string | null;
          prescriber_name: string;
          pharmacy: string | null;
          refills_remaining: number;
          status: 'active' | 'refill-requested' | 'approved' | 'completed';
          last_filled_date: string | null;
          next_refill_due: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          patient_uid: string;
          medication_name: string;
          dosage: string;
          frequency?: string | null;
          prescriber_name: string;
          pharmacy?: string | null;
          refills_remaining?: number;
          status?: 'active' | 'refill-requested' | 'approved' | 'completed';
          last_filled_date?: string | null;
          next_refill_due?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          patient_uid?: string;
          medication_name?: string;
          dosage?: string;
          frequency?: string | null;
          prescriber_name?: string;
          pharmacy?: string | null;
          refills_remaining?: number;
          status?: 'active' | 'refill-requested' | 'approved' | 'completed';
          last_filled_date?: string | null;
          next_refill_due?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      medical_records: {
        Row: {
          id: string;
          patient_uid: string;
          title: string;
          category: string;
          provider_name: string;
          date_label: string;
          status: 'normal' | 'attention' | 'critical' | 'pending';
          summary: string;
          metrics: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          patient_uid: string;
          title: string;
          category: string;
          provider_name: string;
          date_label: string;
          status?: 'normal' | 'attention' | 'critical' | 'pending';
          summary: string;
          metrics?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          patient_uid?: string;
          title?: string;
          category?: string;
          provider_name?: string;
          date_label?: string;
          status?: 'normal' | 'attention' | 'critical' | 'pending';
          summary?: string;
          metrics?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      ai_consultations: {
        Row: {
          id: string;
          patient_uid: string;
          sender: 'user' | 'assistant';
          content: string;
          severity: string | null;
          triage_priority: string | null;
          icd10_code: string | null;
          observations: string[];
          protocol: string[];
          created_at: string;
        };
        Insert: {
          id: string;
          patient_uid: string;
          sender: 'user' | 'assistant';
          content: string;
          severity?: string | null;
          triage_priority?: string | null;
          icd10_code?: string | null;
          observations?: string[];
          protocol?: string[];
          created_at?: string;
        };
        Update: {
          id?: string;
          patient_uid?: string;
          sender?: 'user' | 'assistant';
          content?: string;
          severity?: string | null;
          triage_priority?: string | null;
          icd10_code?: string | null;
          observations?: string[];
          protocol?: string[];
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
