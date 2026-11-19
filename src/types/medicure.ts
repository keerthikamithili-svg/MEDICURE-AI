export type UserRole = 'patient' | 'doctor' | 'receptionist' | 'admin';

export type PatientNavKey =
  | 'dashboard'
  | 'find-doctors'
  | 'doctor-profile'
  | 'book-appointment'
  | 'booking-confirmed'
  | 'my-appointments'
  | 'medical-records'
  | 'prescriptions'
  | 'messages'
  | 'ai-assistant'
  | 'help'
  | 'settings';

export type DoctorNavKey =
  | 'schedule-queue'
  | 'encounters-ehr'
  | 'lab-diagnostics'
  | 'erx-refills'
  | 'in-basket'
  | 'telehealth-suite'
  | 'ai-assistant'
  | 'settings';

export type ReceptionistNavKey =
  | 'front-desk-queue'
  | 'walk-in-registration'
  | 'billing-copays'
  | 'settings';

export type AdminNavKey =
  | 'executive-overview'
  | 'manage-doctors'
  | 'manage-departments'
  | 'manage-patients'
  | 'settings';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  role: UserRole;
  pid: string;
  phone?: string;
  dob?: string;
  bloodGroup?: string;
  emergencyContact?: string;
  insuranceProvider?: string;
  policyId?: string;
  allergies?: string;
}

export interface DoctorProfile {
  id: string;
  name: string;
  credentials: string;
  specialty: string;
  department: string;
  hospital: string;
  npi: string;
  license?: string;
  experienceYears: number;
  rating: number;
  reviewCount: number;
  consultationsCount: number;
  baseFee: number;
  copayFee: number;
  dutyStatus: 'In Consultation' | 'On Duty' | 'Off Duty';
  telehealthReady: boolean;
  inClinicReady: boolean;
  availableToday: boolean;
  isActive: boolean;
  bio: string;
  languages: string[];
  acceptedInsurance: string[];
  nextSlots: string[];
  avatarKey: string;
}

export interface DepartmentUnit {
  id: string;
  name: string;
  headDoctor: string;
  totalDoctors: number;
  activePatients: number;
  todaysAppointments: number;
  isActive: boolean;
}

export interface AppointmentRecord {
  id: string;
  patientUid: string;
  patientName: string;
  patientPid: string;
  doctorId: string;
  doctorName: string;
  doctorCredentials?: string;
  specialty: string;
  department?: string;
  location: string;
  visitMode: 'in-person' | 'telehealth';
  appointmentDate: string;
  appointmentTime: string;
  durationMinutes?: number;
  status: 'scheduled' | 'checked-in' | 'in-exam' | 'completed' | 'cancelled';
  chiefComplaint: string;
  symptomDuration?: string;
  symptomDescription?: string;
  riskFactors?: string[];
  attachedDocumentName?: string;
  insuranceProvider?: string;
  policyId?: string;
  standardFee?: number;
  insurerCoverage?: number;
  copayAmount: number;
  copayPaid: boolean;
  receiptNumber?: string;
  roomNumber?: string;
  physicianSummary?: string;
}

export interface PrescriptionRecord {
  id: string;
  patientUid: string;
  medicationName: string;
  dosage: string;
  frequency?: string;
  prescriberName: string;
  pharmacy?: string;
  refillsRemaining: number;
  status: 'active' | 'refill-requested' | 'approved' | 'completed';
  lastFilledDate?: string;
  nextRefillDue?: string;
}

export interface MedicalRecordItem {
  id: string;
  patientUid: string;
  title: string;
  category: string;
  providerName: string;
  dateLabel: string;
  status: 'normal' | 'attention' | 'critical' | 'pending';
  summary: string;
  metrics?: string[];
}

export interface AiConsultationMessage {
  id: string;
  patientUid: string;
  sender: 'user' | 'assistant';
  content: string;
  severity?: string;
  triagePriority?: string;
  icd10Code?: string;
  observations?: string[];
  protocol?: string[];
  timestampLabel?: string;
}

export interface BookingDraft {
  doctorId: string;
  visitMode: 'in-person' | 'telehealth';
  appointmentDate: string;
  appointmentTime: string;
  chiefComplaint: string;
  symptomDuration: string;
  symptomDescription: string;
  riskFactors: string[];
  attachedDocumentName: string;
}
