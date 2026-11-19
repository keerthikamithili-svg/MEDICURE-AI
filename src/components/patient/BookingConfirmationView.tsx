import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  MapPin,
  PhoneCall,
  Printer,
  Wallet,
} from 'lucide-react';
import { AppointmentRecord, PatientNavKey } from '../../types/medicure';
import { BostonCampusMap, ClinicalAvatar, FastTrackQrCode } from '../ClinicalVisuals';

interface BookingConfirmationViewProps {
  appointment: AppointmentRecord;
  onNavigate: (nav: PatientNavKey) => void;
  onCancelAppointment: (id: string) => Promise<void>;
}

export const BookingConfirmationView: React.FC<BookingConfirmationViewProps> = ({
  appointment,
  onNavigate,
  onCancelAppointment,
}) => {
  const [actionBanner, setActionBanner] = useState<string | null>(null);
  const firstName = appointment.patientName.split(' ')[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs text-[#64748B] font-medium">
          Patient Portal &gt; Appointments &gt;{' '}
          <span className="text-[#0B1C30] font-semibold">
            Booking Confirmed (#APT-{appointment.id.slice(-5).toUpperCase()})
          </span>
        </div>
        <span className="px-3 py-1 rounded-full bg-[#ECFDF5] text-[#006B5F] text-[11px] font-semibold">
          Electronic Health Record (EHR) Synced
        </span>
      </div>

      {/* 4-Step Completed Stepper */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 clinical-shadow grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { step: 'STEP 1', title: 'Consultation & Slot' },
          { step: 'STEP 2', title: 'Intake & Reason' },
          { step: 'STEP 3', title: 'Insurance & Copay' },
          { step: 'STEP 4 • FINAL', title: 'Confirmed & Receipt' },
        ].map((item) => (
          <div key={item.step} className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-full bg-[#006B5F] text-white flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </span>
            <div>
              <div className="text-[10px] font-bold text-[#006B5F] uppercase">{item.step}</div>
              <div className="text-xs font-bold text-[#0B1C30]">{item.title}</div>
            </div>
          </div>
        ))}
      </div>

      {actionBanner && (
        <div className="p-3 rounded-xl bg-[#EFF4FF] border border-[#DCE9FF] text-xs font-medium text-[#002541]">
          {actionBanner}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left 8 Columns */}
        <div className="xl:col-span-8 space-y-6">
          {/* Confirmation Hero */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 clinical-shadow">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#006B5F] flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded bg-[#CCFBF1] text-[#006B5F] text-[10px] font-bold uppercase">
                    APPOINTMENT CONFIRMED &amp; ADDED TO SCHEDULE
                  </span>
                  <span className="text-xs font-mono-tabular text-[#64748B]">
                    Ref: #MED-2024-88420
                  </span>
                </div>
                <h1 className="font-display text-2xl font-bold text-[#0B1C30]">
                  You&apos;re All Set, {firstName}!
                </h1>
                <p className="text-xs text-[#42474E] mt-1 leading-relaxed">
                  A confirmation email and SMS reminder have been dispatched. Booking reference{' '}
                  <strong className="font-mono-tabular">#MED-2024-88420</strong> is logged under your medical record.
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    onClick={() => setActionBanner('Calendar invitation (.ics) prepared for download.')}
                    className="h-9 px-3.5 bg-[#002541] hover:bg-[#123B5D] text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Add to Calendar</span>
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="h-9 px-3.5 bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#0B1C30] rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF Receipt</span>
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="h-9 px-3.5 bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#0B1C30] rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Summary</span>
                  </button>
                  <button
                    onClick={() => setActionBanner('Fast-Track Pass added to Digital Wallet.')}
                    className="h-9 px-3.5 bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#0B1C30] rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Wallet className="w-3.5 h-3.5" />
                    <span>Send to Wallet</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Consultation Dossier & QR Pass */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 clinical-shadow">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-4 border-b border-[#E2E8F0]">
              <h2 className="font-display text-base font-bold text-[#0B1C30]">
                Consultation Dossier &amp; Clinical Venue
              </h2>
              <span className="px-2.5 py-0.5 rounded bg-[#EFF4FF] text-[#002541] text-[11px] font-semibold">
                Type: {appointment.visitMode === 'telehealth' ? 'HD Telehealth Video' : 'In-Person Specialist Visit'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
              <div className="md:col-span-7 space-y-4">
                <div className="flex items-start gap-3">
                  <ClinicalAvatar avatarKey="sarah-jenkins" name={appointment.doctorName} size="md" activeDot />
                  <div>
                    <div className="text-base font-bold text-[#0B1C30]">
                      {appointment.doctorName}, {appointment.doctorCredentials || 'MD'}
                    </div>
                    <div className="text-xs font-semibold text-[#006B5F]">
                      {appointment.specialty} Specialist
                    </div>
                    <div className="text-[11px] text-[#64748B] mt-0.5">
                      4.96★ • Board Certified • EHR Linked
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                    <div className="text-[10px] font-bold text-[#64748B] uppercase">
                      DATE &amp; SCHEDULED TIME
                    </div>
                    <div className="font-bold text-[#0B1C30] mt-1">{appointment.appointmentDate}</div>
                    <div className="font-semibold text-[#006B5F] font-mono-tabular">
                      {appointment.appointmentTime}
                    </div>
                    <div className="text-[11px] text-[#64748B] mt-0.5">
                      Duration: {appointment.durationMinutes || 45} minutes
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                    <div className="text-[10px] font-bold text-[#64748B] uppercase">
                      CLINICAL LOCATION
                    </div>
                    <div className="font-bold text-[#0B1C30] mt-1">{appointment.location}</div>
                    <div className="text-[11px] text-[#64748B] mt-0.5">
                      {appointment.roomNumber || 'Wing B, Suite 402'}
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[#F0FDFA] border border-[#CCFBF1] flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-[#00201C]">Complimentary Valet Parking</div>
                    <div className="text-[11px] text-[#006B5F]">
                      Voucher: #V-8821 (East Pavilion Entrance B)
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-white text-[#006B5F] font-bold text-[10px]">
                    VALIDATED
                  </span>
                </div>
              </div>

              <div className="md:col-span-5 p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-center">
                <div className="text-[10px] font-bold text-[#64748B] uppercase mb-3">
                  FAST-TRACK PASS
                </div>
                <FastTrackQrCode code={`${appointment.patientPid}-APT94`} />
                <p className="text-[11px] text-[#64748B] mt-2 leading-relaxed">
                  Scan at any lobby self-service kiosk or present to receptionist upon arrival for rapid express check-in.
                </p>
              </div>
            </div>
          </div>

          {/* Clinical Pre-Visit Directives */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 clinical-shadow">
            <h2 className="font-display text-base font-bold text-[#0B1C30] mb-1">
              Clinical Pre-Visit Directives
            </h2>
            <p className="text-xs text-[#64748B] mb-4">
              Please observe these preparation guidelines to ensure accurate diagnostic evaluation.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-[#0B1C30]">8-Hour Fasting Required</span>
                  <span className="px-2 py-0.5 rounded bg-[#FEF2F2] text-[#DC2626] text-[10px] font-bold">
                    MANDATORY
                  </span>
                </div>
                <p className="text-[#42474E] leading-relaxed">
                  Overnight fast begins 8 hours prior for comprehensive lipid profile and metabolic blood draw. Pure drinking water is permitted.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-[#0B1C30]">What to Bring</span>
                  <span className="px-2 py-0.5 rounded bg-[#EFF4FF] text-[#002541] text-[10px] font-bold">
                    REQUIRED
                  </span>
                </div>
                <p className="text-[#42474E] leading-relaxed">
                  Government photo ID, physical or digital insurance card, and all current daily medication containers.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-[#0B1C30]">Uploaded Documentation</span>
                  <span className="px-2 py-0.5 rounded bg-[#ECFDF5] text-[#006B5F] text-[10px] font-bold">
                    Queued
                  </span>
                </div>
                <p className="text-[#42474E] leading-relaxed">
                  <FileText className="w-3.5 h-3.5 inline mr-1 text-[#006B5F]" />
                  {appointment.attachedDocumentName || 'ECG_Report_Aug2024.pdf'} — attached and ready for physician pre-round chart review.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-[#0B1C30]">Arrival &amp; Telemetry Check</span>
                  <span className="px-2 py-0.5 rounded bg-[#F1F5F9] text-[#0B1C30] text-[10px] font-bold font-mono-tabular">
                    <Clock className="w-3 h-3 inline mr-0.5" /> 15m Prior
                  </span>
                </div>
                <p className="text-[#42474E] leading-relaxed">
                  Please arrive 15 minutes before your slot to allow nursing staff to record baseline vitals and automated blood pressure.
                </p>
              </div>
            </div>
          </div>

          {/* Modifications */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 clinical-shadow flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-[#0B1C30]">Appointment Modifications</div>
              <div className="text-[11px] text-[#64748B]">
                Complimentary rescheduling or cancellation is available up to 24 hours prior.
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('my-appointments')}
                className="h-8 px-3 bg-white border border-[#E2E8F0] rounded-lg text-xs font-semibold text-[#0B1C30] cursor-pointer"
              >
                Reschedule
              </button>
              {appointment.status !== 'cancelled' && (
                <button
                  onClick={async () => {
                    await onCancelAppointment(appointment.id);
                    onNavigate('my-appointments');
                  }}
                  className="h-8 px-3 bg-[#FEF2F2] border border-[#FECACA] rounded-lg text-xs font-semibold text-[#DC2626] cursor-pointer"
                >
                  Cancel Consultation
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Receipt & Directions */}
        <div className="xl:col-span-4 space-y-5">
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 clinical-shadow space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold text-[#64748B] uppercase">
                  PAYMENT CONFIRMATION
                </div>
                <h3 className="font-display text-sm font-bold text-[#0B1C30]">
                  Digital Receipt &amp; Invoice
                </h3>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-[#ECFDF5] text-[#006B5F] text-[10px] font-bold">
                COPAY PAID
              </span>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-[#E2E8F0]">
              <div className="flex justify-between">
                <span className="text-[#64748B]">Receipt Number:</span>
                <span className="font-mono-tabular font-semibold">
                  {appointment.receiptNumber || '#REC-2024-99412'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Billed Patient:</span>
                <span className="font-semibold">
                  {appointment.patientName} ({appointment.patientPid})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Insurance:</span>
                <span className="font-semibold">
                  {appointment.insuranceProvider || 'Aetna Choice POS II'}
                </span>
              </div>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-[#E2E8F0]">
              <div className="flex justify-between">
                <span className="text-[#42474E]">Specialist Fee</span>
                <span className="font-mono-tabular">${appointment.standardFee || 120}.00</span>
              </div>
              <div className="flex justify-between text-[#006B5F]">
                <span>In-Network Coverage</span>
                <span className="font-mono-tabular">
                  -${appointment.insurerCoverage || 90}.00
                </span>
              </div>
              <div className="pt-2 border-t border-[#E2E8F0] flex items-center justify-between">
                <span className="font-bold text-[#0B1C30]">Total Copay Paid</span>
                <span className="font-display text-2xl font-bold text-[#0B1C30] font-mono-tabular">
                  ${appointment.copayAmount}.00
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 clinical-shadow space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-[#0B1C30] flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#006B5F]" />
                <span>Campus Directions</span>
              </h3>
              <span className="text-[#64748B]">Boston, MA</span>
            </div>
            <BostonCampusMap label="St. Jude Heart Center • East Pavilion" heightClass="h-28" />
            <p className="text-[#42474E]">
              <strong>720 Albany St, Boston, MA 02118</strong> — Free validated parking at Garage B (Level 2).
            </p>
          </div>

          <div className="bg-[#EFF4FF] border border-[#DCE9FF] rounded-xl p-4 text-xs space-y-1.5">
            <div className="font-bold text-[#002541] flex items-center gap-1.5">
              <PhoneCall className="w-4 h-4 text-[#006B5F]" />
              <span>Immediate Assistance</span>
            </div>
            <div className="flex justify-between text-[#42474E]">
              <span>Heart Center Desk:</span>
              <span className="font-bold font-mono-tabular">(555) 728-4000 Ext 402</span>
            </div>
            <div className="flex justify-between text-[#42474E]">
              <span>24/7 Clinical Triage:</span>
              <span className="font-bold text-[#006B5F] font-mono-tabular">(555) 728-9911</span>
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => onNavigate('dashboard')}
              className="w-full h-10 bg-[#002541] hover:bg-[#123B5D] text-white rounded-lg text-xs font-semibold cursor-pointer"
            >
              Go to Patient Dashboard
            </button>
            <button
              onClick={() => onNavigate('my-appointments')}
              className="w-full h-10 bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#0B1C30] rounded-lg text-xs font-semibold cursor-pointer"
            >
              View in My Appointments
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
