import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  ClipboardList,
  Clock,
  FileText,
  FlaskConical,
  HeartPulse,
  PhoneCall,
  Pill,
  Stethoscope,
  Video,
} from 'lucide-react';
import {
  AppointmentRecord,
  DoctorNavKey,
  PrescriptionRecord,
} from '../../types/medicure';
import { ClinicalAvatar, EcgWaveform } from '../ClinicalVisuals';

interface DoctorPortalViewProps {
  activeNav: DoctorNavKey;
  appointments: AppointmentRecord[];
  prescriptions: PrescriptionRecord[];
  onUpdateStatus: (id: string, status: AppointmentRecord['status'], summary?: string) => Promise<void>;
  onApproveRefill: (id: string) => Promise<void>;
  onNavigate: (nav: DoctorNavKey) => void;
}

export const DoctorPortalView: React.FC<DoctorPortalViewProps> = ({
  activeNav,
  appointments,
  prescriptions,
  onUpdateStatus,
  onApproveRefill,
  onNavigate,
}) => {
  const [visitFilter, setVisitFilter] = useState<'all' | 'in-clinic' | 'telehealth' | 'high-acuity'>('all');
  const [clinicalNote, setClinicalNote] = useState(
    'Retrosternal chest tightness and sudden-onset palpitations radiating to the left shoulder, exacerbated by exertion. Sinus rhythm with rare PACs; troponin pending.'
  );
  const [noteSaved, setNoteSaved] = useState(false);
  const [pagedRn, setPagedRn] = useState(false);

  const activeExam = appointments.find((a) => a.status === 'in-exam') || appointments[0];

  if (activeNav === 'erx-refills') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#0B1C30]">
            e-Rx &amp; Refill Queue
          </h1>
          <p className="text-sm text-[#64748B]">
            Authorize electronic prescription renewals and pharmacy routing requests.
          </p>
        </div>
        <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden clinical-shadow">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] uppercase">
              <tr>
                <th className="py-3 px-4">Medication</th>
                <th className="py-3 px-4">Dosage &amp; Frequency</th>
                <th className="py-3 px-4">Pharmacy</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {prescriptions.map((rx) => (
                <tr key={rx.id} className="hover:bg-[#F8FAFC]">
                  <td className="py-3 px-4 font-bold text-[#0B1C30]">{rx.medicationName}</td>
                  <td className="py-3 px-4 text-[#42474E]">
                    {rx.dosage} • {rx.frequency}
                  </td>
                  <td className="py-3 px-4 text-[#64748B]">{rx.pharmacy}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#006B5F] font-semibold">
                      {rx.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => onApproveRefill(rx.id)}
                      className="h-8 px-3 bg-[#002541] text-white rounded-lg font-semibold cursor-pointer"
                    >
                      Quick Approve
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (activeNav === 'encounters-ehr') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-[#0B1C30]">
              Clinical Encounter &amp; EHR Note — {activeExam?.patientName || 'Alexander Wright'}
            </h1>
            <p className="text-sm text-[#64748B]">
              Exam Room 402 • Priority 1 Cardiac • Allergies: Penicillin (Anaphylaxis)
            </p>
          </div>
          <button
            onClick={() => onNavigate('schedule-queue')}
            className="h-9 px-3.5 bg-white border border-[#E2E8F0] rounded-lg text-xs font-semibold cursor-pointer"
          >
            Back to Queue
          </button>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 clinical-shadow space-y-4">
          <div className="text-xs font-bold text-[#002541] uppercase">SOAP Assessment &amp; Plan</div>
          <textarea
            rows={5}
            value={clinicalNote}
            onChange={(e) => setClinicalNote(e.target.value)}
            className="w-full p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm text-[#0B1C30]"
          />
          {noteSaved && (
            <div className="text-xs font-semibold text-[#006B5F]">
              Encounter note signed and synced to patient EHR.
            </div>
          )}
          <div className="flex justify-end gap-2">
            <button
              onClick={async () => {
                if (activeExam) {
                  await onUpdateStatus(activeExam.id, 'completed', clinicalNote);
                }
                setNoteSaved(true);
              }}
              className="h-9 px-4 bg-[#006B5F] text-white rounded-lg text-xs font-semibold cursor-pointer"
            >
              Sign &amp; Complete Encounter
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (activeNav === 'lab-diagnostics' || activeNav === 'in-basket' || activeNav === 'telehealth-suite') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-[#0B1C30]">
              {activeNav === 'lab-diagnostics'
                ? 'Lab & Diagnostic Alerts'
                : activeNav === 'in-basket'
                ? 'In-Basket & Clinical Triage'
                : 'HD Telehealth Consultation Suite'}
            </h1>
            <p className="text-sm text-[#64748B]">
              Real-time Wing B physician operations synchronized with FHIR v4.
            </p>
          </div>
          <button
            onClick={() => onNavigate('schedule-queue')}
            className="h-9 px-3.5 bg-[#002541] text-white rounded-lg text-xs font-semibold cursor-pointer"
          >
            Return to Schedule &amp; Queue
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border border-[#FECACA] rounded-xl p-5 clinical-shadow space-y-3">
            <span className="px-2 py-0.5 rounded bg-[#DC2626] text-white text-[10px] font-bold">
              HIGH TROPONIN I
            </span>
            <h2 className="font-display text-base font-bold text-[#0B1C30]">
              Patient: Robert Sterling (71y M)
            </h2>
            <p className="text-xs text-[#DC2626] font-semibold">
              Result: 0.08 ng/mL (Ref &lt;0.04). Scheduled 3:15 PM today.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPagedRn(true)}
                className="h-9 px-4 bg-[#DC2626] text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                {pagedRn ? 'RN Davis Paged' : 'Urgent Review & Page RN'}
              </button>
            </div>
          </div>

          <div className="bg-white border border-[#CCFBF1] rounded-xl p-5 clinical-shadow space-y-3">
            <span className="px-2 py-0.5 rounded bg-[#ECFDF5] text-[#006B5F] text-[10px] font-bold">
              TELEHEALTH LOBBY READY
            </span>
            <h2 className="font-display text-base font-bold text-[#0B1C30]">
              David K. Thornton (PID-90412)
            </h2>
            <p className="text-xs text-[#42474E]">
              Paroxysmal Atrial Fibrillation • Apple HealthKit Synced • 4 ECG strips attached.
            </p>
            <button
              onClick={() => onNavigate('schedule-queue')}
              className="h-9 px-4 bg-[#006B5F] text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Video className="w-3.5 h-3.5" />
              <span>Join Virtual Room</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded bg-[#CCFBF1] text-[#006B5F] text-[10px] font-bold uppercase">
              OUTPATIENT CARDIOLOGY WING B
            </span>
            <span className="text-xs text-[#64748B] font-mono-tabular">
              Session ID: CARD-402-LIVE • FHIR v4 Synchronized
            </span>
          </div>
          <h1 className="font-display text-2xl font-bold text-[#0B1C30]">
            Clinical Queue &amp; Daily Schedule
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            St. Jude Heart Center • Dr. Sarah Jenkins, MD, FACC • Friday, October 25, 2024
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="px-3 py-1.5 rounded-lg bg-white border border-[#E2E8F0] text-xs font-semibold text-[#0B1C30]">
            Today: Fri, Oct 25
          </div>
          <span className="px-3 py-1.5 rounded-lg bg-[#ECFDF5] border border-[#A7F3D0] text-xs font-semibold text-[#006B5F]">
            Auto-refresh: 30s Live
          </span>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 clinical-shadow">
          <div className="text-[10px] font-bold text-[#64748B] uppercase">TOTAL SCHEDULED TODAY</div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-display text-3xl font-bold text-[#0B1C30] tabular-nums">14</span>
            <span className="text-xs text-[#64748B]">Patients Active</span>
          </div>
          <div className="text-[11px] text-[#006B5F] font-semibold mt-2">
            6 Completed • 1 In-Exam • 7 Upcoming
          </div>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 clinical-shadow">
          <div className="text-[10px] font-bold text-[#64748B] uppercase">CURRENT CLINIC PACE</div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-display text-3xl font-bold text-[#0B1C30] tabular-nums">+4 min</span>
            <span className="px-2 py-0.5 rounded bg-[#ECFDF5] text-[#006B5F] text-[10px] font-bold">
              Optimal Flow
            </span>
          </div>
          <div className="text-[11px] text-[#64748B] mt-2">Avg turnaround: 32 min • Target: 35 min</div>
        </div>

        <div className="bg-white border border-[#FECACA] rounded-xl p-4 clinical-shadow">
          <div className="text-[10px] font-bold text-[#DC2626] uppercase">CRITICAL LAB ALERTS</div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-display text-3xl font-bold text-[#DC2626] tabular-nums">2</span>
            <span className="text-xs text-[#DC2626] font-semibold">Unreviewed</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[10px] font-bold">
            <span className="px-2 py-0.5 rounded bg-[#FEF2F2] text-[#DC2626]">Troponin I (0.08)</span>
            <span className="px-2 py-0.5 rounded bg-[#FEF2F2] text-[#DC2626]">K+ 3.1 mEq/L</span>
          </div>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 clinical-shadow">
          <div className="text-[10px] font-bold text-[#64748B] uppercase">TELEHEALTH READINESS</div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-display text-3xl font-bold text-[#0B1C30] tabular-nums">4</span>
            <span className="text-xs text-[#64748B]">Virtual Encounters</span>
          </div>
          <div className="text-[11px] text-[#0284C7] font-semibold mt-2">
            Next: 2:00 PM EST • AV Tested
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {(
          [
            { id: 'all', label: 'All Visits (14)' },
            { id: 'in-clinic', label: 'In-Clinic (10)' },
            { id: 'telehealth', label: 'Telehealth (4)' },
            { id: 'high-acuity', label: 'High Acuity (3)' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setVisitFilter(tab.id)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
              visitFilter === tab.id
                ? 'bg-[#002541] text-white'
                : 'bg-white border border-[#E2E8F0] text-[#42474E]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main 12-Col Split */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left 8 Columns: Active Patient & Queue */}
        <div className="xl:col-span-8 space-y-5">
          {/* Exam Room 402 Card */}
          <div className="bg-white border-2 border-[#006B5F] rounded-xl overflow-hidden clinical-shadow">
            <div className="bg-[#006B5F] px-5 py-2.5 flex flex-wrap items-center justify-between gap-2 text-white text-xs">
              <div className="flex items-center gap-2 font-bold">
                <span className="w-2 h-2 rounded-full bg-white" />
                <span>EXAM ROOM 402 • IN EXAM NOW</span>
                <span className="px-2 py-0.5 rounded bg-white/15 font-mono-tabular text-[11px]">
                  12m elapsed / 45m slot
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <span>Nurse Assign: R. Davis, RN</span>
                <span className="px-2 py-0.5 rounded bg-[#002541] font-bold">Priority 1 Cardiac</span>
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <ClinicalAvatar avatarKey="patient" name="Alexander Wright" size="md" />
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-display text-lg font-bold text-[#0B1C30]">
                        Alexander Wright
                      </h2>
                      <span className="px-2 py-0.5 rounded bg-[#F1F5F9] font-mono-tabular text-[11px] font-semibold text-[#42474E]">
                        PID-88420
                      </span>
                    </div>
                    <div className="text-xs text-[#64748B]">
                      38y M • DOB: 04/12/1986 • Aetna Choice POS II (Paid $30 Copay)
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:items-end gap-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#FEF2F2] text-[#DC2626] text-[11px] font-bold">
                    Penicillin (Anaphylaxis)
                  </span>
                  <span className="text-[11px] font-semibold text-[#002541]">
                    NPO 8 Hours (Verified)
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-xs">
                <div className="flex justify-between font-bold text-[#006B5F] uppercase text-[10px] mb-1">
                  <span>CHIEF COMPLAINT &amp; CLINICAL CONTEXT</span>
                  <span>Onset: 4 days ago</span>
                </div>
                <p className="text-[#0B1C30] leading-relaxed">{clinicalNote}</p>
              </div>

              {/* 4 Vitals Tiles */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg bg-[#FEF2F2] border border-[#FECACA]">
                  <div className="text-[10px] font-bold text-[#DC2626] uppercase">BLOOD PRESSURE</div>
                  <div className="font-display text-lg font-bold text-[#0B1C30] font-mono-tabular mt-0.5">
                    138/86 <span className="text-[11px] font-normal">mmHg</span>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                  <div className="text-[10px] font-bold text-[#64748B] uppercase">HEART RATE</div>
                  <div className="font-display text-lg font-bold text-[#0B1C30] font-mono-tabular mt-0.5">
                    78 <span className="text-[11px] font-normal">bpm reg</span>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                  <div className="text-[10px] font-bold text-[#64748B] uppercase">SPO2 OXYGEN</div>
                  <div className="font-display text-lg font-bold text-[#0B1C30] font-mono-tabular mt-0.5">
                    98% <span className="text-[11px] font-normal">Room air</span>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                  <div className="text-[10px] font-bold text-[#64748B] uppercase">ORAL TEMP</div>
                  <div className="font-display text-lg font-bold text-[#0B1C30] font-mono-tabular mt-0.5">
                    98.6°F <span className="text-[11px] font-semibold text-[#006B5F]">Afebrile</span>
                  </div>
                </div>
              </div>

              {/* 12-Lead ECG Strip */}
              <div className="p-3.5 rounded-lg bg-[#EFF4FF] border border-[#DCE9FF] flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <EcgWaveform />
                  <div className="text-xs">
                    <div className="font-bold text-[#0B1C30]">
                      12-Lead ECG (Recorded 10:48 AM)
                    </div>
                    <div className="text-[#42474E]">
                      Sinus rhythm with rare premature atrial complexes (PACs). QTc 418ms normal.
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => onNavigate('encounters-ehr')}
                  className="h-8 px-3 bg-white border border-[#E2E8F0] rounded-lg text-xs font-semibold text-[#0B1C30] cursor-pointer"
                >
                  Inspect Full Tracing
                </button>
              </div>

              <div className="flex flex-wrap gap-2 pt-2 border-t border-[#E2E8F0]">
                <button
                  onClick={() => onNavigate('encounters-ehr')}
                  className="h-9 px-4 bg-[#002541] text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <ClipboardList className="w-3.5 h-3.5" />
                  <span>Open Clinical Note / EHR</span>
                </button>
                <button
                  onClick={() => onNavigate('erx-refills')}
                  className="h-9 px-3.5 bg-white border border-[#E2E8F0] rounded-lg text-xs font-semibold text-[#0B1C30] cursor-pointer"
                >
                  Order Diagnostics / Rx
                </button>
              </div>
            </div>
          </div>

          {/* Upcoming Queue Cards */}
          {visitFilter !== 'telehealth' && (
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 clinical-shadow space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-[#CCFBF1] text-[#006B5F] text-[10px] font-bold">
                    NEXT IN QUEUE
                  </span>
                  <span className="text-xs font-bold font-mono-tabular text-[#0B1C30]">
                    11:15 AM - 11:45 AM
                  </span>
                </div>
                <span className="text-xs text-[#006B5F] font-semibold">
                  Waiting Sub-Lounge B • Ready for Room 404
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-bold text-[#0B1C30]">
                    Margaret Miller <span className="text-xs font-mono-tabular text-[#64748B]">PID-61902</span> • 64y F
                  </div>
                  <p className="text-xs text-[#42474E] mt-0.5">
                    Chief Concern: Routine Hypertension &amp; CAD follow-up, Metoprolol dosage review.
                  </p>
                </div>
                <button
                  onClick={() => onNavigate('encounters-ehr')}
                  className="h-9 px-3.5 bg-[#002541] text-white rounded-lg text-xs font-semibold shrink-0 cursor-pointer"
                >
                  Call Patient to Room 404
                </button>
              </div>
            </div>
          )}

          {/* Telehealth Session Card */}
          {(visitFilter === 'all' || visitFilter === 'telehealth') && (
            <div className="bg-white border border-[#BAE6FD] rounded-xl p-5 clinical-shadow space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-[#EFF4FF] text-[#0284C7] text-[10px] font-bold">
                    TELEHEALTH SESSION
                  </span>
                  <span className="text-xs font-bold font-mono-tabular text-[#0B1C30]">
                    2:00 PM - 2:30 PM
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-[#ECFDF5] text-[#006B5F] text-[10px] font-bold">
                  Device Test Passed • Waiting in Lobby
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-bold text-[#0B1C30]">
                    David K. Thornton <span className="text-xs font-mono-tabular text-[#64748B]">PID-90412</span> • 45y M • Paroxysmal AFib
                  </div>
                  <p className="text-xs text-[#42474E] mt-0.5">
                    Agenda: Flecainide &amp; Diltiazem adherence review. Apple Watch HealthKit synced (Resting HR: 68 bpm).
                  </p>
                </div>
                <button
                  onClick={() => onNavigate('telehealth-suite')}
                  className="h-9 px-4 bg-[#002541] text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Join Virtual Room</span>
                </button>
              </div>
            </div>
          )}

          {/* Afternoon Queue Summary Table */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden clinical-shadow">
            <div className="px-5 py-3.5 border-b border-[#E2E8F0] flex items-center justify-between">
              <h3 className="font-display text-sm font-bold text-[#0B1C30]">
                Afternoon Queue Summary (2:30 PM – 5:00 PM)
              </h3>
              <span className="text-xs text-[#64748B]">3 Additional Consults Scheduled</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-4">Time</th>
                    <th className="py-2.5 px-4">Patient</th>
                    <th className="py-2.5 px-4">Visit Type &amp; Location</th>
                    <th className="py-2.5 px-4">Clinical Indication</th>
                    <th className="py-2.5 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  <tr>
                    <td className="py-3 px-4 font-mono-tabular font-semibold">2:30 PM</td>
                    <td className="py-3 px-4 font-bold text-[#0B1C30]">Elena Vasquez</td>
                    <td className="py-3 px-4">In-Clinic • Room 403</td>
                    <td className="py-3 px-4 text-[#42474E]">Dyspnea on exertion, TTE follow-up</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-[#ECFDF5] text-[#006B5F] font-semibold">
                        Confirmed
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-mono-tabular font-semibold text-[#DC2626]">3:15 PM</td>
                    <td className="py-3 px-4 font-bold text-[#DC2626]">Robert Sterling</td>
                    <td className="py-3 px-4">In-Clinic • Room 401</td>
                    <td className="py-3 px-4 text-[#DC2626] font-semibold">
                      Aortic stenosis monitoring (Critical Lab Alert)
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => onNavigate('lab-diagnostics')}
                        className="px-2.5 py-1 rounded bg-[#DC2626] text-white font-semibold cursor-pointer"
                      >
                        Review Troponin
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-mono-tabular font-semibold">4:00 PM</td>
                    <td className="py-3 px-4 font-bold text-[#0B1C30]">Linda Wu</td>
                    <td className="py-3 px-4">Telehealth • Suite 01</td>
                    <td className="py-3 px-4 text-[#42474E]">Lipid panel titration &amp; Statin discussion</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-[#F1F5F9] text-[#42474E] font-semibold">
                        Scheduled
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right 4 Columns */}
        <div className="xl:col-span-4 space-y-5">
          {/* In-Basket Action Required */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 clinical-shadow space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-sm font-bold text-[#0B1C30]">
                In-Basket Action Required
              </h2>
              <span className="px-2 py-0.5 rounded bg-[#FEF2F2] text-[#DC2626] text-[10px] font-bold">
                2 Urgent
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#FEF2F2] border border-[#FECACA] space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded bg-[#DC2626] text-white text-[10px] font-bold">
                  HIGH TROPONIN I
                </span>
                <span className="text-[11px] text-[#DC2626]">10:52 AM Today</span>
              </div>
              <div className="font-bold text-[#0B1C30]">Patient: Robert Sterling (71y M)</div>
              <div className="text-[#DC2626] font-semibold">
                Result: 0.08 ng/mL (Ref &lt;0.04). Scheduled 3:15 PM today.
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => onNavigate('lab-diagnostics')}
                  className="flex-1 h-8 bg-[#DC2626] text-white rounded-lg font-semibold cursor-pointer"
                >
                  Urgent Review
                </button>
                <button
                  onClick={() => setPagedRn(true)}
                  className="h-8 px-3 bg-white border border-[#FECACA] text-[#DC2626] rounded-lg font-semibold cursor-pointer"
                >
                  {pagedRn ? 'Paged' : 'Page RN'}
                </button>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F0FDFA] border border-[#CCFBF1] space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded bg-[#006B5F] text-white text-[10px] font-bold">
                  E-RX REFILL REQUEST
                </span>
                <span className="text-[11px] text-[#64748B]">Walgreens #4102</span>
              </div>
              <div className="font-bold text-[#0B1C30]">
                Alexander Wright • Lisinopril 10mg PO QD
              </div>
              <p className="text-[#42474E]">
                90-day supply (Qty: 90). Normal BP in room now.
              </p>
              <button
                onClick={() => onNavigate('erx-refills')}
                className="w-full h-8 bg-[#002541] text-white rounded-lg font-semibold cursor-pointer"
              >
                Quick Approve Refill
              </button>
            </div>
          </div>

          {/* Wing B Room Status */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 clinical-shadow space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-sm font-bold text-[#0B1C30]">Wing B Room Status</h2>
              <span className="text-xs font-semibold text-[#006B5F]">4 / 4 Active</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="p-3 rounded-lg bg-[#ECFDF5] border border-[#A7F3D0]">
                <div className="font-bold text-[#0B1C30]">Room 401</div>
                <div className="text-[10px] font-bold text-[#006B5F]">CLEAN / READY</div>
                <div className="text-[11px] text-[#42474E] mt-1">Assigned: R. Sterling</div>
              </div>
              <div className="p-3 rounded-lg bg-[#F0FDFA] border border-[#14B8A6]">
                <div className="font-bold text-[#0B1C30]">Room 402</div>
                <div className="text-[10px] font-bold text-[#006B5F]">IN OCCUPANCY</div>
                <div className="text-[11px] text-[#42474E] mt-1">Dr. Jenkins &amp; A. Wright</div>
              </div>
              <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                <div className="font-bold text-[#0B1C30]">Room 403</div>
                <div className="text-[10px] font-bold text-[#0284C7]">NURSE PREP</div>
                <div className="text-[11px] text-[#42474E] mt-1">ECG calibration by RN</div>
              </div>
              <div className="p-3 rounded-lg bg-[#EFF4FF] border border-[#DCE9FF]">
                <div className="font-bold text-[#0B1C30]">Room 404</div>
                <div className="text-[10px] font-bold text-[#002541]">TELEMETRY SYNC</div>
                <div className="text-[11px] text-[#42474E] mt-1">Holter test unit</div>
              </div>
            </div>
          </div>

          {/* Clinical Tools & Rapid Sets */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 clinical-shadow space-y-2.5 text-xs">
            <h2 className="font-display text-sm font-bold text-[#0B1C30]">
              Clinical Tools &amp; Rapid Sets
            </h2>
            <div className="p-2.5 rounded-lg bg-[#F0FDFA] border border-[#CCFBF1] flex items-center justify-between font-semibold text-[#006B5F]">
              <span>Ambient Clinical Scribe</span>
              <span>Active</span>
            </div>
            {[
              'ACS / Chest Pain Rapid Evaluation',
              'AFib Rhythm Control & Anticoagulation',
              'Guideline Directed Medical Therapy (GDMT)',
            ].map((tool) => (
              <button
                key={tool}
                onClick={() => onNavigate('encounters-ehr')}
                className="w-full p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] hover:bg-[#EFF4FF] text-left font-semibold text-[#0B1C30] cursor-pointer"
              >
                {tool} &rarr;
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
