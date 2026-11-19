import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Lock,
  MapPin,
  ShieldCheck,
  Stethoscope,
  UploadCloud,
  UserCheck,
  Video,
  X,
} from 'lucide-react';
import { BookingDraft, DoctorProfile, UserProfile } from '../../types/medicure';
import { BostonCampusMap, ClinicalAvatar } from '../ClinicalVisuals';

interface BookAppointmentViewProps {
  doctors: DoctorProfile[];
  initialDraft: BookingDraft;
  userProfile: UserProfile | null;
  onChangeDoctor: () => void;
  onConfirmBooking: (draft: BookingDraft) => Promise<void>;
  onCancel: () => void;
}

const COMPLAINT_OPTIONS = [
  'Routine Cardiology Follow-up',
  'Chest Discomfort / Palpitations',
  'Blood Pressure Check',
  'Post-Procedure Review',
  'Medication Adjustment',
  'Second Opinion',
];

const DURATION_OPTIONS = ['< 24 Hours', '2 - 7 Days', '1 - 4 Weeks', 'Chronic (> 1 Month)'];

const RISK_FACTOR_OPTIONS = [
  'Hypertension',
  'High Cholesterol (Dyslipidemia)',
  'Family History of CAD',
  'Diabetes Type 2',
  'Previous Stent / Surgery',
  'Asthma / COPD',
];

export const BookAppointmentView: React.FC<BookAppointmentViewProps> = ({
  doctors,
  initialDraft,
  userProfile,
  onChangeDoctor,
  onConfirmBooking,
  onCancel,
}) => {
  const [draft, setDraft] = useState<BookingDraft>(initialDraft);
  const [smsReminder, setSmsReminder] = useState(true);
  const [icsReminder, setIcsReminder] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [savedNotice, setSavedNotice] = useState(false);

  const doctor = doctors.find((d) => d.id === draft.doctorId) || doctors[0];
  const insurerCoverage = Math.max(0, doctor.baseFee - doctor.copayFee);

  const toggleRiskFactor = (factor: string) => {
    setDraft((prev) => ({
      ...prev,
      riskFactors: prev.riskFactors.includes(factor)
        ? prev.riskFactors.filter((f) => f !== factor)
        : [...prev.riskFactors, factor].slice(0, 10),
    }));
  };

  const handleSubmit = async () => {
    setErrorMsg(null);
    setSubmitting(true);
    try {
      await onConfirmBooking(draft);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to confirm appointment.');
    } finally {
      setSubmitting(false);
    }
  };

  const dates = [
    { sub: 'Today', label: 'Oct 24', info: 'Slots Filled', value: 'Thu, Oct 24, 2024', disabled: true },
    { sub: 'Tomorrow', label: 'Fri, Oct 25', info: '6 Slots Open', value: 'Fri, Oct 25, 2024', disabled: false },
    { sub: 'Saturday', label: 'Oct 26', info: '2 Slots Open', value: 'Sat, Oct 26, 2024', disabled: false },
    { sub: 'Monday', label: 'Oct 28', info: '8 Slots Open', value: 'Mon, Oct 28, 2024', disabled: false },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Stepper */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="text-xs text-[#64748B] font-medium mb-1">
            Patient Portal &gt; Find Doctors &gt; {doctor.name} &gt;{' '}
            <span className="text-[#0B1C30] font-semibold">Appointment Booking &amp; Clinical Intake</span>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="font-display text-2xl font-bold text-[#0B1C30]">
              Book Clinical Appointment
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#EFF4FF] text-[#002541] text-[10px] font-bold">
              ACCREDITED SPECIALIST CONSULTATION
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#ECFDF5] text-[#006B5F] text-[10px] font-bold">
              HIPAA Compliant &amp; Encrypted
            </span>
          </div>
          <p className="text-xs text-[#64748B] mt-1">
            Select consultation type, choose your preferred clinical slot, complete pre-visit medical intake, and verify real-time insurance coverage.
          </p>
        </div>

        <div className="px-3.5 py-2 rounded-xl bg-white border border-[#E2E8F0] text-xs clinical-shadow shrink-0">
          <div className="text-[10px] font-bold text-[#64748B] uppercase">PATIENT ID</div>
          <div className="font-bold text-[#0B1C30] font-mono-tabular">
            {userProfile?.pid || 'PID-88420'} ({userProfile?.displayName || 'Alexander Wright'})
          </div>
        </div>
      </div>

      {/* 4-Step Progress Bar */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 clinical-shadow grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 rounded-full bg-[#006B5F] text-white flex items-center justify-center text-xs font-bold">
            <CheckCircle2 className="w-4 h-4" />
          </span>
          <div>
            <div className="text-[10px] font-bold text-[#006B5F] uppercase">STEP 1</div>
            <div className="text-xs font-bold text-[#0B1C30]">Consultation &amp; Slot</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 rounded-full bg-[#002541] text-white flex items-center justify-center text-xs font-bold">
            2
          </span>
          <div>
            <div className="text-[10px] font-bold text-[#002541] uppercase">STEP 2 • ACTIVE</div>
            <div className="text-xs font-bold text-[#0B1C30]">Medical Reason &amp; Intake</div>
          </div>
        </div>
        <div className="flex items-center gap-3 opacity-70">
          <span className="w-7 h-7 rounded-full bg-[#F1F5F9] text-[#64748B] flex items-center justify-center text-xs font-bold">
            3
          </span>
          <div>
            <div className="text-[10px] font-bold text-[#64748B] uppercase">STEP 3</div>
            <div className="text-xs font-semibold text-[#42474E]">Insurance &amp; Copay</div>
          </div>
        </div>
        <div className="flex items-center gap-3 opacity-70">
          <span className="w-7 h-7 rounded-full bg-[#F1F5F9] text-[#64748B] flex items-center justify-center text-xs font-bold">
            4
          </span>
          <div>
            <div className="text-[10px] font-bold text-[#64748B] uppercase">STEP 4</div>
            <div className="text-xs font-semibold text-[#42474E]">Review &amp; Confirm</div>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#DC2626] font-medium">
          {errorMsg}
        </div>
      )}

      {savedNotice && (
        <div className="p-3.5 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] text-xs text-[#006B5F] font-medium">
          Booking intake draft saved locally. Complete confirmation when ready.
        </div>
      )}

      {/* Main 12-Col Form & Summary */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <div className="xl:col-span-8 space-y-6">
          {/* Section 1 */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 clinical-shadow space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-bold text-[#0B1C30] flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#006B5F]" />
                <span>1. Selected Specialist &amp; Visit Mode</span>
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-[#F1F5F9] text-[#42474E] text-[10px] font-semibold">
                Board Certified Specialist
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <ClinicalAvatar avatarKey={doctor.avatarKey} name={doctor.name} size="md" activeDot />
                <div>
                  <div className="text-sm font-bold text-[#0B1C30]">
                    {doctor.name}, {doctor.credentials}
                  </div>
                  <div className="text-xs text-[#64748B]">
                    Senior Attending {doctor.specialty} • {doctor.hospital}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={onChangeDoctor}
                className="h-8 px-3 bg-white border border-[#E2E8F0] rounded-lg text-xs font-semibold text-[#0B1C30] hover:bg-[#F1F5F9] cursor-pointer"
              >
                Change Physician
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0B1C30] mb-2">
                Select Consultation Modality
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDraft((prev) => ({ ...prev, visitMode: 'in-person' }))}
                  className={`p-4 rounded-xl border text-left transition-colors cursor-pointer ${
                    draft.visitMode === 'in-person'
                      ? 'bg-[#EFF4FF] border-[#002541]'
                      : 'bg-white border-[#E2E8F0]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="inline-flex items-center gap-1.5 text-sm font-bold text-[#0B1C30]">
                      <Stethoscope className="w-4 h-4 text-[#002541]" />
                      In-Person Clinic Visit
                    </span>
                    <span
                      className={`w-4 h-4 rounded-full border-2 ${
                        draft.visitMode === 'in-person'
                          ? 'border-[#002541] bg-[#002541]'
                          : 'border-[#CBD5E1]'
                      }`}
                    />
                  </div>
                  <p className="text-xs text-[#64748B]">
                    {doctor.hospital}. Includes on-site vital telemetry and 12-lead ECG if ordered.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setDraft((prev) => ({ ...prev, visitMode: 'telehealth' }))}
                  className={`p-4 rounded-xl border text-left transition-colors cursor-pointer ${
                    draft.visitMode === 'telehealth'
                      ? 'bg-[#EFF4FF] border-[#002541]'
                      : 'bg-white border-[#E2E8F0]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="inline-flex items-center gap-1.5 text-sm font-bold text-[#0B1C30]">
                      <Video className="w-4 h-4 text-[#006B5F]" />
                      Telehealth Video Call
                    </span>
                    <span
                      className={`w-4 h-4 rounded-full border-2 ${
                        draft.visitMode === 'telehealth'
                          ? 'border-[#002541] bg-[#002541]'
                          : 'border-[#CBD5E1]'
                      }`}
                    />
                  </div>
                  <p className="text-xs text-[#64748B]">
                    Encrypted HD Virtual Examination Room. Browser &amp; MediCure App Compatible.
                  </p>
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-[#0B1C30]">
                  Select Clinical Date &amp; Window
                </label>
                <span className="text-[11px] text-[#64748B]">
                  All times displayed in Eastern Standard Time (EST)
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {dates.map((d) => {
                  const active = draft.appointmentDate === d.value;
                  return (
                    <button
                      key={d.value}
                      type="button"
                      disabled={d.disabled}
                      onClick={() => setDraft((prev) => ({ ...prev, appointmentDate: d.value }))}
                      className={`p-3 rounded-xl border text-center cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed ${
                        active
                          ? 'bg-[#002541] border-[#002541] text-white'
                          : 'bg-white border-[#E2E8F0] text-[#0B1C30]'
                      }`}
                    >
                      <div className="text-[10px] opacity-80">{d.sub}</div>
                      <div className="text-xs font-bold mt-0.5">{d.label}</div>
                      <div
                        className={`text-[10px] font-semibold mt-0.5 ${
                          d.disabled ? 'text-[#DC2626]' : 'text-[#4FDBC8]'
                        }`}
                      >
                        {d.info}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="text-[10px] font-bold text-[#64748B] uppercase mb-2">
                AVAILABLE SESSIONS ({draft.appointmentDate})
              </div>
              <div className="flex flex-wrap gap-2">
                {doctor.nextSlots.map((slot) => {
                  const active = draft.appointmentTime === slot;
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setDraft((prev) => ({ ...prev, appointmentTime: slot }))}
                      className={`px-3.5 py-2 rounded-lg border text-xs font-semibold font-mono-tabular cursor-pointer ${
                        active
                          ? 'bg-[#006B5F] border-[#006B5F] text-white'
                          : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#0B1C30]'
                      }`}
                    >
                      {slot} {active ? '(Selected)' : ''}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 2: Clinical Reason & Pre-Visit Intake */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 clinical-shadow space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-bold text-[#0B1C30] flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#006B5F]" />
                <span>2. Clinical Reason &amp; Pre-Visit Intake</span>
              </h2>
              <span className="text-xs font-mono-tabular text-[#64748B]">
                Clinical Triage Form #CR-209
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0B1C30] mb-2">
                Primary Chief Complaint / Visit Reason <span className="text-[#DC2626]">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {COMPLAINT_OPTIONS.map((opt) => {
                  const active = draft.chiefComplaint === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setDraft((prev) => ({ ...prev, chiefComplaint: opt }))}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer ${
                        active
                          ? 'bg-[#002541] border-[#002541] text-white'
                          : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#42474E]'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0B1C30] mb-2">
                Onset &amp; Symptom Duration <span className="text-[#DC2626]">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {DURATION_OPTIONS.map((dur) => {
                  const active = draft.symptomDuration === dur;
                  return (
                    <button
                      key={dur}
                      type="button"
                      onClick={() => setDraft((prev) => ({ ...prev, symptomDuration: dur }))}
                      className={`h-9 rounded-lg border text-xs font-semibold cursor-pointer ${
                        active
                          ? 'bg-[#006B5F] border-[#006B5F] text-white'
                          : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#42474E]'
                      }`}
                    >
                      {dur}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-[#0B1C30]">
                  Detailed Description &amp; Symptom Trigger
                </label>
                <span className="text-[11px] font-mono-tabular text-[#64748B]">
                  {draft.symptomDescription.length} / 600 characters
                </span>
              </div>
              <textarea
                rows={3}
                maxLength={600}
                value={draft.symptomDescription}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, symptomDescription: e.target.value }))
                }
                placeholder="Describe symptom onset, triggers, and current medications..."
                className="w-full p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs text-[#0B1C30] focus:outline-none focus:border-[#14B8A6] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0B1C30] mb-2">
                Relevant Medical History / Risk Factors
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {RISK_FACTOR_OPTIONS.map((factor) => {
                  const checked = draft.riskFactors.includes(factor);
                  return (
                    <label
                      key={factor}
                      className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs cursor-pointer ${
                        checked
                          ? 'bg-[#F0FDFA] border-[#006B5F] text-[#00201C] font-semibold'
                          : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#42474E]'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleRiskFactor(factor)}
                        className="rounded border-[#CBD5E1] text-[#006B5F]"
                      />
                      <span>{factor}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0B1C30] mb-2">
                Attach Diagnostic Reports, Echo, or Recent ECG (Optional)
              </label>
              <label className="border-2 border-dashed border-[#CBD5E1] rounded-xl p-5 flex flex-col items-center justify-center text-center bg-[#FAFCFF] hover:border-[#14B8A6] cursor-pointer">
                <UploadCloud className="w-6 h-6 text-[#006B5F] mb-1.5" />
                <span className="text-xs font-semibold text-[#0B1C30]">
                  Click to attach clinical file
                </span>
                <span className="text-[11px] text-[#64748B] mt-0.5">
                  Supports PDF, DICOM, JPG, PNG up to 25MB each (HIPAA 256-bit encrypted storage)
                </span>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setDraft((prev) => ({ ...prev, attachedDocumentName: f.name }));
                  }}
                />
              </label>

              {draft.attachedDocumentName && (
                <div className="mt-2.5 px-3.5 py-2.5 rounded-lg bg-[#EFF4FF] border border-[#DCE9FF] flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-[#0B1C30]">{draft.attachedDocumentName}</div>
                    <div className="text-[11px] text-[#006B5F]">
                      1.8 MB • Clinical Document Verified
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDraft((prev) => ({ ...prev, attachedDocumentName: '' }))}
                    className="text-[#64748B] hover:text-[#DC2626] cursor-pointer"
                    aria-label="Remove attachment"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Verified Patient & Emergency Contact */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 clinical-shadow space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-bold text-[#0B1C30] flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#006B5F]" />
                <span>3. Verified Patient &amp; Emergency Contact</span>
              </h2>
              <span className="text-xs font-semibold text-[#006B5F] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Identity Confirmed
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <div className="text-[10px] font-bold text-[#64748B] uppercase">FULL LEGAL NAME</div>
                <div className="font-bold text-[#0B1C30] mt-0.5">
                  {userProfile?.displayName || 'Alexander Wright'}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-[#64748B] uppercase">DATE OF BIRTH (AGE)</div>
                <div className="font-bold text-[#0B1C30] mt-0.5">
                  {userProfile?.dob || 'May 14, 1986 (38 yrs)'}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-[#64748B] uppercase">PRIMARY CONTACT PHONE</div>
                <div className="font-bold text-[#0B1C30] mt-0.5 font-mono-tabular">
                  {userProfile?.phone || '(555) 382-9104'}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-[#64748B] uppercase">REGISTERED EMAIL</div>
                <div className="font-bold text-[#0B1C30] mt-0.5 truncate">
                  {userProfile?.email || 'a.wright@medicure-health.org'}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-[#64748B] uppercase">BLOOD GROUP &amp; RH</div>
                <div className="font-bold text-[#0B1C30] mt-0.5">
                  {userProfile?.bloodGroup || 'O Positive (O+)'}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-xs">
                <div className="text-[10px] font-bold text-[#64748B] uppercase mb-1">
                  Emergency Contact Person
                </div>
                <div className="font-bold text-[#0B1C30]">
                  {userProfile?.emergencyContact || 'Eleanor Wright (Spouse) • +1 (555) 719-2041'}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-xs space-y-1.5">
                <div className="text-[10px] font-bold text-[#64748B] uppercase">
                  Reminder Preferences
                </div>
                <label className="flex items-center justify-between cursor-pointer">
                  <span>SMS appointment reminder &amp; clinic updates</span>
                  <input
                    type="checkbox"
                    checked={smsReminder}
                    onChange={(e) => setSmsReminder(e.target.checked)}
                    className="rounded text-[#006B5F]"
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span>Digital calendar invite (.ics) &amp; prep instructions</span>
                  <input
                    type="checkbox"
                    checked={icsReminder}
                    onChange={(e) => setIcsReminder(e.target.checked)}
                    className="rounded text-[#006B5F]"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sticky Summary */}
        <div className="xl:col-span-4 space-y-5 xl:sticky xl:top-20">
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 clinical-shadow space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-bold text-[#0B1C30]">
                Appointment Summary
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-[#ECFDF5] text-[#006B5F] text-[10px] font-bold uppercase">
                {draft.visitMode === 'in-person' ? 'IN-PERSON' : 'TELEHEALTH'}
              </span>
            </div>

            <div className="flex items-center gap-3 pb-3 border-b border-[#E2E8F0]">
              <ClinicalAvatar avatarKey={doctor.avatarKey} name={doctor.name} size="sm" />
              <div>
                <div className="text-xs font-bold text-[#0B1C30]">
                  {doctor.name}, {doctor.credentials}
                </div>
                <div className="text-[11px] font-semibold text-[#006B5F]">
                  {doctor.specialty} Specialist
                </div>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-[#002541] shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-[#0B1C30]">
                    {draft.appointmentDate} at {draft.appointmentTime}
                  </div>
                  <div className="text-[#64748B]">45 Minutes Clinical Consultation</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#006B5F] shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-[#0B1C30]">
                    {draft.visitMode === 'telehealth'
                      ? 'MediCure Encrypted Virtual Suite'
                      : doctor.hospital}
                  </div>
                  <div className="text-[#64748B]">East Elevator • Suite 402</div>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#EFF4FF] border border-[#DCE9FF] text-[11px] text-[#172B4D]">
              <div className="font-bold text-[#002541] mb-0.5">PRE-VISIT CLINICAL NOTE</div>
              Fasting required: Please refrain from food or caffeinated beverages for 8 hours prior to scheduled appointment for lipid panel blood testing.
            </div>

            <div className="space-y-2 pt-2 border-t border-[#E2E8F0] text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#0B1C30]">Insurance &amp; Copay</span>
                <span className="text-[11px] font-semibold text-[#006B5F] flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified
                </span>
              </div>
              <div className="flex justify-between text-[#42474E]">
                <span>{userProfile?.insuranceProvider || 'Aetna Choice POS II'}</span>
                <span className="px-1.5 py-0.5 rounded bg-[#ECFDF5] text-[#006B5F] text-[10px] font-bold">
                  In-Network
                </span>
              </div>
              <div className="flex justify-between text-[#42474E]">
                <span>Standard Specialist Fee</span>
                <span className="font-mono-tabular font-semibold">${doctor.baseFee}.00</span>
              </div>
              <div className="flex justify-between text-[#006B5F]">
                <span>In-Network Insurer Coverage</span>
                <span className="font-mono-tabular font-semibold">-${insurerCoverage}.00</span>
              </div>
              <div className="p-3 rounded-lg bg-[#F0FDFA] border border-[#CCFBF1] flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold text-[#006B5F] uppercase">
                    ESTIMATED PATIENT COPAY
                  </div>
                  <div className="text-[11px] text-[#005048]">Due at reception check-in</div>
                </div>
                <div className="font-display text-2xl font-bold text-[#0B1C30] font-mono-tabular">
                  ${doctor.copayFee}.00
                </div>
              </div>
            </div>

            <button
              type="button"
              disabled={submitting}
              onClick={handleSubmit}
              className="w-full h-11 bg-[#006B5F] hover:bg-[#005048] text-white rounded-lg text-xs font-semibold inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>
                {submitting
                  ? 'Confirming Clinical Booking...'
                  : `Confirm & Book Appointment ($${doctor.copayFee}.00 Copay)`}
              </span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSavedNotice(true)}
                className="h-9 bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#0B1C30] rounded-lg text-xs font-semibold cursor-pointer"
              >
                Save Draft
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="h-9 bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#64748B] rounded-lg text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>

          <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 clinical-shadow space-y-2">
            <div className="text-xs font-bold text-[#0B1C30]">Clinic Campus Location</div>
            <BostonCampusMap label="East Pavilion • Entrance B" heightClass="h-24" />
          </div>
        </div>
      </div>
    </div>
  );
};
