import React, { useState } from 'react';
import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  GraduationCap,
  HeartPulse,
  MapPin,
  ShieldAlert,
  Star,
  Stethoscope,
  Video,
} from 'lucide-react';
import { DoctorProfile } from '../../types/medicure';
import { BostonCampusMap, ClinicalAvatar } from '../ClinicalVisuals';

interface DoctorProfileViewProps {
  doctor: DoctorProfile;
  onBack: () => void;
  onContinueBooking: (preset: {
    visitMode: 'in-person' | 'telehealth';
    appointmentDate: string;
    appointmentTime: string;
  }) => void;
}

export const DoctorProfileView: React.FC<DoctorProfileViewProps> = ({
  doctor,
  onBack,
  onContinueBooking,
}) => {
  const [activeTab, setActiveTab] = useState<'about' | 'credentials' | 'procedures' | 'reviews'>('about');
  const [visitMode, setVisitMode] = useState<'in-person' | 'telehealth'>('in-person');
  const [selectedDate, setSelectedDate] = useState('Fri, Oct 25, 2024');
  const [selectedTime, setSelectedTime] = useState(doctor.nextSlots[1] || '10:30 AM');

  const dates = [
    { day: 'THU', num: '24', label: 'Filled', value: 'Thu, Oct 24, 2024', disabled: true },
    { day: 'FRI', num: '25', label: '6 Slots', value: 'Fri, Oct 25, 2024', disabled: false },
    { day: 'SAT', num: '26', label: '2 Slots', value: 'Sat, Oct 26, 2024', disabled: false },
    { day: 'MON', num: '28', label: '8 Slots', value: 'Mon, Oct 28, 2024', disabled: false },
  ];

  const morningSlots = doctor.nextSlots.slice(0, 3);
  const afternoonSlots = doctor.nextSlots.slice(3, 6);

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs text-[#64748B] font-medium">
          <button onClick={onBack} className="hover:text-[#002541] cursor-pointer">
            Patient Portal &gt; Find Doctors
          </button>{' '}
          &gt; {doctor.specialty} &gt;{' '}
          <span className="text-[#0B1C30] font-semibold">
            {doctor.name}, {doctor.credentials}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full bg-[#ECFDF5] text-[#006B5F] text-[11px] font-semibold">
            Accepting New Patients
          </span>
          <span className="px-2.5 py-1 rounded-full bg-[#EFF4FF] text-[#002541] text-[11px] font-semibold">
            EHR Integrated Profile
          </span>
        </div>
      </div>

      {/* Hero Profile Card */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden clinical-shadow">
        <div className="bg-[#002541] px-5 py-2.5 flex flex-wrap items-center justify-between gap-2 text-white text-[11px]">
          <div className="flex items-center gap-2 font-semibold">
            <span className="px-2 py-0.5 rounded bg-[#123B5D] text-[#A6CAF3] font-mono-tabular">
              SPECIALIST CODE: CAR-8820-MA
            </span>
            <span className="tracking-wider uppercase text-[#E5EEFF]">
              DIVISION OF {doctor.department.toUpperCase()}
            </span>
          </div>
          <span className="text-[#6DF5E1] font-medium">
            Verified License &amp; Credentials • Last Audited: Oct 18, 2024
          </span>
        </div>

        <div className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
            <div className="flex flex-col sm:flex-row items-start gap-5 flex-1">
              <div className="shrink-0">
                <ClinicalAvatar avatarKey={doctor.avatarKey} name={doctor.name} size="xl" activeDot />
                <div className="mt-2 text-center">
                  <span className="px-2 py-0.5 rounded-full bg-[#002541] text-white text-[10px] font-semibold">
                    Active In-Clinic
                  </span>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-display text-2xl font-bold text-[#0B1C30]">
                    {doctor.name}, {doctor.credentials}
                  </h1>
                  <span className="px-2 py-0.5 rounded-full bg-[#EFF4FF] text-[#002541] text-[11px] font-semibold">
                    Board Certified Fellow
                  </span>
                </div>
                <p className="text-sm font-medium text-[#42474E] mt-1">
                  Senior Attending {doctor.specialty} Specialist • Director of Non-Invasive Diagnostics
                </p>
                <p className="text-xs text-[#64748B] mt-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#006B5F]" />
                  {doctor.hospital} • 720 Albany St, Boston, MA
                </p>

                {/* 4 Metric Mini Tiles */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                  <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                    <div className="text-[10px] font-bold text-[#64748B] uppercase">RATING SCORE</div>
                    <div className="font-display text-lg font-bold text-[#0B1C30] mt-0.5 tabular-nums">
                      {doctor.rating} <span className="text-xs font-normal text-[#64748B]">/ 5.0</span>
                    </div>
                    <div className="text-[11px] text-[#64748B]">{doctor.reviewCount} Verified Reviews</div>
                  </div>

                  <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                    <div className="text-[10px] font-bold text-[#64748B] uppercase">EXPERIENCE</div>
                    <div className="font-display text-lg font-bold text-[#0B1C30] mt-0.5 tabular-nums">
                      {doctor.experienceYears} <span className="text-xs font-normal text-[#64748B]">Years</span>
                    </div>
                    <div className="text-[11px] text-[#64748B]">Harvard Medical Alum</div>
                  </div>

                  <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                    <div className="text-[10px] font-bold text-[#64748B] uppercase">ESTIMATED COPAY</div>
                    <div className="font-display text-lg font-bold text-[#006B5F] mt-0.5 tabular-nums">
                      ${doctor.copayFee}.00{' '}
                      <span className="text-xs line-through text-[#94A3B8]">${doctor.baseFee}</span>
                    </div>
                    <div className="text-[11px] text-[#006B5F] font-semibold">Aetna POS Active</div>
                  </div>

                  <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                    <div className="text-[10px] font-bold text-[#64748B] uppercase">CONSULTATIONS</div>
                    <div className="font-display text-lg font-bold text-[#0B1C30] mt-0.5 tabular-nums">
                      {doctor.consultationsCount.toLocaleString()}+
                    </div>
                    <div className="text-[11px] text-[#64748B]">Heart Center Triage</div>
                  </div>
                </div>

                {/* Credential Chips */}
                <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-mono-tabular">
                  <span className="px-2 py-0.5 rounded bg-[#F1F5F9] text-[#0B1C30] font-semibold">
                    NPI: {doctor.npi}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#F1F5F9] text-[#0B1C30] font-semibold">
                    License: {doctor.license || 'MA-294819'}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#ECFDF5] text-[#006B5F] font-semibold">
                    DEA Certified
                  </span>
                  {doctor.telehealthReady && (
                    <span className="px-2 py-0.5 rounded bg-[#F0F9FF] text-[#0284C7] font-semibold">
                      Telehealth Ready
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded bg-[#EFF4FF] text-[#002541] font-semibold">
                    In-Clinic Ready
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() =>
                onContinueBooking({
                  visitMode,
                  appointmentDate: selectedDate,
                  appointmentTime: selectedTime,
                })
              }
              className="h-10 px-5 bg-[#002541] hover:bg-[#123B5D] text-white rounded-lg text-xs font-semibold shrink-0 cursor-pointer"
            >
              Schedule Consultation
            </button>
          </div>
        </div>
      </div>

      {/* Main 12-Col Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left 8 Columns */}
        <div className="xl:col-span-8 space-y-6">
          {/* Sub-navigation Tabs */}
          <div className="flex flex-wrap items-center gap-2 bg-white border border-[#E2E8F0] rounded-xl p-1.5 clinical-shadow">
            {(
              [
                { id: 'about', label: 'About & Philosophy' },
                { id: 'credentials', label: 'Credentials & Training' },
                { id: 'procedures', label: 'Procedures & Specialties' },
                { id: 'reviews', label: 'Reviews & Research' },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === t.id
                    ? 'bg-[#002541] text-white'
                    : 'text-[#42474E] hover:bg-[#F8FAFC]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {(activeTab === 'about' || activeTab === 'credentials') && (
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 clinical-shadow space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-display text-lg font-bold text-[#0B1C30]">
                  About {doctor.name} &amp; Philosophy of Care
                </h2>
                <span className="px-3 py-1 rounded-full bg-[#F0FDFA] text-[#006B5F] text-[11px] font-semibold">
                  Holistic Cardiovascular Approach
                </span>
              </div>

              <p className="text-sm text-[#42474E] leading-relaxed">{doctor.bio}</p>

              <blockquote className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-sm text-[#172B4D] italic leading-relaxed">
                &ldquo;My practice is grounded in the conviction that clinical care should be proactive, meticulous, and deeply communicative. By uniting cutting-edge diagnostics with lifestyle and metabolic optimization, we identify risk markers long before symptomatic disease develops.&rdquo;
              </blockquote>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-[#FAFCFF] border border-[#E2E8F0]">
                  <HeartPulse className="w-5 h-5 text-[#006B5F] mb-2" />
                  <h3 className="text-xs font-bold text-[#0B1C30]">Preventive Diagnostics</h3>
                  <p className="text-xs text-[#64748B] mt-1">
                    Early plaque detection, advanced biomarker analysis, and lifestyle intervention plans.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[#FAFCFF] border border-[#E2E8F0]">
                  <Stethoscope className="w-5 h-5 text-[#002541] mb-2" />
                  <h3 className="text-xs font-bold text-[#0B1C30]">Precision Imaging</h3>
                  <p className="text-xs text-[#64748B] mt-1">
                    Level III echocardiography, strain rate mechanics, and stress perfusion diagnostics.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[#FAFCFF] border border-[#E2E8F0]">
                  <CheckCircle2 className="w-5 h-5 text-[#006B5F] mb-2" />
                  <h3 className="text-xs font-bold text-[#0B1C30]">Shared Decision Care</h3>
                  <p className="text-xs text-[#64748B] mt-1">
                    Comprehensive treatment mappings with personalized risk calculators and EHR syncing.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Verified Medical Education & Training */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 clinical-shadow space-y-5">
            <div className="flex items-center gap-2.5">
              <GraduationCap className="w-5 h-5 text-[#002541]" />
              <div>
                <h2 className="font-display text-base font-bold text-[#0B1C30]">
                  Verified Medical Education &amp; Training
                </h2>
                <p className="text-xs text-[#64748B]">
                  Primary source verified through the Federation of State Medical Boards (FSMB)
                </p>
              </div>
            </div>

            <div className="space-y-4 pl-3 border-l-2 border-[#E2E8F0]">
              <div className="relative pl-4">
                <span className="w-2.5 h-2.5 rounded-full bg-[#006B5F] absolute -left-[22px] top-1.5" />
                <div className="flex items-center justify-between text-xs font-bold text-[#0B1C30]">
                  <span>Brigham and Women&apos;s Hospital / Harvard Medical School</span>
                  <span className="font-mono-tabular text-[#64748B]">2011 — 2014</span>
                </div>
                <div className="text-xs font-medium text-[#42474E] mt-0.5">
                  Clinical Fellowship (Chief Fellow, 2013-2014)
                </div>
              </div>

              <div className="relative pl-4">
                <span className="w-2.5 h-2.5 rounded-full bg-[#002541] absolute -left-[22px] top-1.5" />
                <div className="flex items-center justify-between text-xs font-bold text-[#0B1C30]">
                  <span>Massachusetts General Hospital (MGH)</span>
                  <span className="font-mono-tabular text-[#64748B]">2008 — 2011</span>
                </div>
                <div className="text-xs font-medium text-[#42474E] mt-0.5">
                  Internal Medicine Residency &amp; Primary Medical Service
                </div>
              </div>

              <div className="relative pl-4">
                <span className="w-2.5 h-2.5 rounded-full bg-[#002541] absolute -left-[22px] top-1.5" />
                <div className="flex items-center justify-between text-xs font-bold text-[#0B1C30]">
                  <span>Harvard Medical School</span>
                  <span className="font-mono-tabular text-[#64748B]">2004 — 2008</span>
                </div>
                <div className="text-xs font-medium text-[#42474E] mt-0.5">
                  Doctor of Medicine (MD), Magna Cum Laude
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-[#EFF4FF] border border-[#DCE9FF]">
                <div className="flex items-center gap-2 text-xs font-bold text-[#002541]">
                  <Award className="w-4 h-4 text-[#006B5F]" />
                  <span>American Board of Internal Medicine (ABIM)</span>
                </div>
                <p className="text-[11px] text-[#006B5F] font-semibold mt-1">
                  Active (Certified 2014 • Recertified through 2034)
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-[#EFF4FF] border border-[#DCE9FF]">
                <div className="flex items-center gap-2 text-xs font-bold text-[#002541]">
                  <Award className="w-4 h-4 text-[#006B5F]" />
                  <span>National Board of Clinical Diagnostics</span>
                </div>
                <p className="text-[11px] text-[#006B5F] font-semibold mt-1">
                  Active • Level III Senior Imaging Competency
                </p>
              </div>
            </div>
          </div>

          {/* Procedures Table */}
          {(activeTab === 'procedures' || activeTab === 'about') && (
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 clinical-shadow">
              <h2 className="font-display text-base font-bold text-[#0B1C30] mb-3">
                Clinical Specialties &amp; In-Office Procedures
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[#E2E8F0] text-[#64748B] uppercase text-[10px]">
                      <th className="py-2.5 pr-4">Clinical Diagnostic Procedure</th>
                      <th className="py-2.5 pr-4">Diagnostic Modality</th>
                      <th className="py-2.5">Typical EHR Turnaround</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    <tr>
                      <td className="py-3 pr-4 font-semibold text-[#0B1C30]">Transthoracic Echo (TTE)</td>
                      <td className="py-3 pr-4 text-[#42474E]">Ultrasound Imaging Suite</td>
                      <td className="py-3 font-semibold text-[#006B5F]">Same-Day Report &amp; Video Review</td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4 font-semibold text-[#0B1C30]">Exercise Stress Treadmill ECG</td>
                      <td className="py-3 pr-4 text-[#42474E]">Stress Laboratory Suite B</td>
                      <td className="py-3 font-semibold text-[#006B5F]">Immediate Post-Test Review</td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4 font-semibold text-[#0B1C30]">Holter 24-Hr / 14-Day Patch Monitor</td>
                      <td className="py-3 pr-4 text-[#42474E]">Continuous Telemetry Unit</td>
                      <td className="py-3 font-semibold text-[#0284C7]">48h Telemetry Dispatch</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Reviews & Research */}
          {(activeTab === 'reviews' || activeTab === 'about') && (
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 clinical-shadow space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-base font-bold text-[#0B1C30]">
                    Verified Patient Reviews
                  </h2>
                  <p className="text-xs text-[#64748B]">
                    100% verified visits conducted within MediCure Patient Portal
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-[#ECFDF5] text-[#006B5F] text-[11px] font-semibold">
                  Press Ganey Audited
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <div className="md:col-span-4">
                  <div className="font-display text-3xl font-bold text-[#0B1C30] tabular-nums">
                    {doctor.rating} <span className="text-sm font-normal text-[#64748B]">/ 5.0</span>
                  </div>
                  <div className="flex items-center gap-1 my-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B]" />
                    ))}
                  </div>
                  <p className="text-[11px] text-[#64748B]">
                    Based on {doctor.reviewCount} patient surveys submitted over the past 12 months
                  </p>
                </div>
                <div className="md:col-span-8 space-y-2 text-xs">
                  {[
                    { label: 'Bedside Manner & Empathy', score: '5.0 / 5.0', pct: '100%' },
                    { label: 'Clear Explanation of Diagnosis & Plan', score: '5.0 / 5.0', pct: '100%' },
                    { label: 'Staff & Nursing Professionalism', score: '4.9 / 5.0', pct: '98%' },
                    { label: 'Appointment Punctuality & Wait Time', score: '4.8 / 5.0', pct: '96%' },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between mb-1 font-semibold text-[#0B1C30]">
                        <span>{item.label}</span>
                        <span className="font-mono-tabular">{item.score}</span>
                      </div>
                      <div className="h-1.5 w-full bg-[#E2E8F0] rounded-full overflow-hidden">
                        <div className="h-full bg-[#006B5F]" style={{ width: item.pct }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-xl border border-[#E2E8F0]">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-bold text-[#0B1C30]">Robert M. • Verified Patient</span>
                    <span className="text-[#64748B]">Oct 12, 2024</span>
                  </div>
                  <p className="text-xs text-[#42474E] leading-relaxed">
                    &ldquo;{doctor.name} was exceptionally attentive. She listened to the exact triggers of my symptoms, performed the diagnostic evaluation herself, and explained every finding with crystalline clarity.&rdquo;
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-[#E2E8F0]">
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="w-4 h-4 text-[#002541]" />
                  <h3 className="text-sm font-bold text-[#0B1C30]">
                    Research &amp; Peer-Reviewed Publications
                  </h3>
                </div>
                <div className="p-3.5 rounded-lg bg-[#FAFCFF] border border-[#E2E8F0] text-xs">
                  <div className="font-bold text-[#0B1C30]">
                    Predictive Stratification in Asymptomatic Coronary Calcification: High-Resolution Echocardiographic Correlates
                  </div>
                  <div className="text-[#64748B] mt-1">
                    Journal of the American College of Cardiology (JACC), 81(14), 1380–1392 (2023)
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Sticky Booking Rail */}
        <div className="xl:col-span-4 space-y-5 xl:sticky xl:top-20">
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 clinical-shadow space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-base font-bold text-[#0B1C30]">
                  Schedule Consultation
                </h2>
                <p className="text-[11px] text-[#64748B]">Next appointment available tomorrow</p>
              </div>
              <Calendar className="w-5 h-5 text-[#006B5F]" />
            </div>

            <div>
              <div className="text-[10px] font-bold text-[#64748B] uppercase mb-1.5">
                SELECT VISIT MODALITY
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setVisitMode('in-person')}
                  className={`h-9 rounded-lg border text-xs font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer ${
                    visitMode === 'in-person'
                      ? 'bg-[#F0FDFA] border-[#006B5F] text-[#006B5F]'
                      : 'bg-white border-[#E2E8F0] text-[#42474E]'
                  }`}
                >
                  <Stethoscope className="w-3.5 h-3.5" />
                  <span>In-Clinic Visit</span>
                </button>
                <button
                  type="button"
                  onClick={() => setVisitMode('telehealth')}
                  disabled={!doctor.telehealthReady}
                  className={`h-9 rounded-lg border text-xs font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-45 ${
                    visitMode === 'telehealth'
                      ? 'bg-[#F0FDFA] border-[#006B5F] text-[#006B5F]'
                      : 'bg-white border-[#E2E8F0] text-[#42474E]'
                  }`}
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Telehealth Call</span>
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-[10px] font-bold text-[#64748B] uppercase mb-1.5">
                <span>APPOINTMENT DATE</span>
                <span className="text-[#006B5F]">October 2024</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {dates.map((d) => {
                  const active = selectedDate === d.value;
                  return (
                    <button
                      key={d.value}
                      type="button"
                      disabled={d.disabled}
                      onClick={() => setSelectedDate(d.value)}
                      className={`py-2 rounded-lg border text-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                        active
                          ? 'bg-[#002541] border-[#002541] text-white'
                          : 'bg-white border-[#E2E8F0] text-[#0B1C30]'
                      }`}
                    >
                      <div className="text-[10px] font-semibold opacity-80">{d.day}</div>
                      <div className="text-sm font-bold font-mono-tabular">{d.num}</div>
                      <div className="text-[10px] font-semibold text-[#4FDBC8]">{d.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="text-[10px] font-bold text-[#64748B] uppercase mb-1.5">
                MORNING WINDOWS
              </div>
              <div className="grid grid-cols-3 gap-2">
                {morningSlots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedTime(slot)}
                    className={`h-8 rounded-lg border text-xs font-semibold font-mono-tabular cursor-pointer ${
                      selectedTime === slot
                        ? 'bg-[#006B5F] border-[#006B5F] text-white'
                        : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#0B1C30]'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            {afternoonSlots.length > 0 && (
              <div>
                <div className="text-[10px] font-bold text-[#64748B] uppercase mb-1.5">
                  AFTERNOON WINDOWS
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {afternoonSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedTime(slot)}
                      className={`h-8 rounded-lg border text-xs font-semibold font-mono-tabular cursor-pointer ${
                        selectedTime === slot
                          ? 'bg-[#006B5F] border-[#006B5F] text-white'
                          : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#0B1C30]'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="p-3.5 rounded-xl bg-[#F0FDFA] border border-[#CCFBF1] text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#0B1C30]">Aetna Choice POS II</span>
                <span className="text-[10px] font-bold text-[#006B5F]">Active Member</span>
              </div>
              <div className="flex justify-between text-[#42474E]">
                <span>Specialist Consultation Rate</span>
                <span className="font-mono-tabular font-semibold">${doctor.baseFee}.00</span>
              </div>
              <div className="flex justify-between text-[#006B5F]">
                <span>Aetna In-Network Coverage</span>
                <span className="font-mono-tabular font-semibold">
                  -${Math.max(0, doctor.baseFee - doctor.copayFee)}.00
                </span>
              </div>
              <div className="pt-2 border-t border-[#CCFBF1] flex items-center justify-between font-bold text-[#0B1C30]">
                <span>Due at Time of Visit:</span>
                <span className="font-display text-lg font-mono-tabular">
                  ${doctor.copayFee}.00 Copay
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                onContinueBooking({
                  visitMode,
                  appointmentDate: selectedDate,
                  appointmentTime: selectedTime,
                })
              }
              className="w-full h-11 bg-[#006B5F] hover:bg-[#005048] text-white rounded-lg text-xs font-semibold cursor-pointer"
            >
              Continue to Booking Intake (${doctor.copayFee}) &rarr;
            </button>
            <p className="text-[11px] text-center text-[#64748B]">
              No fee cancellation up to 24 hours prior to appointment.
            </p>
          </div>

          <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 clinical-shadow space-y-3">
            <div className="font-bold text-sm text-[#0B1C30]">St. Jude Heart Center</div>
            <BostonCampusMap label="St. Jude Heart Center Campus" heightClass="h-24" />
            <div className="text-[11px] text-[#64748B] space-y-1">
              <div>Clinic Hours: Mon – Fri (8:00 AM – 5:00 PM EST)</div>
              <div>Direct Office: (617) 555-0194</div>
            </div>
          </div>

          <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-xl p-4 text-xs text-[#991B1B]">
            <div className="font-bold flex items-center gap-1.5 mb-1">
              <ShieldAlert className="w-4 h-4 text-[#DC2626]" />
              <span>Experiencing Acute Symptoms?</span>
            </div>
            <p className="leading-relaxed">
              If you have sudden chest tightness, crushing pain, radiating arm discomfort, or severe shortness of breath, immediately call <strong>911</strong> or visit the nearest emergency department.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
