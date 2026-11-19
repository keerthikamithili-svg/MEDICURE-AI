import React, { useState } from 'react';
import {
  Activity,
  Baby,
  Bone,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  FlaskConical,
  HeartPulse,
  MapPin,
  Navigation,
  PhoneCall,
  Pill,
  Search,
  Sparkles,
  Star,
  Stethoscope,
  Video,
  Brain,
} from 'lucide-react';
import {
  AppointmentRecord,
  DoctorProfile,
  MedicalRecordItem,
  PatientNavKey,
  PrescriptionRecord,
  UserProfile,
} from '../../types/medicure';
import { ClinicalAvatar } from '../ClinicalVisuals';

interface PatientDashboardProps {
  userProfile: UserProfile | null;
  appointments: AppointmentRecord[];
  prescriptions: PrescriptionRecord[];
  medicalRecords: MedicalRecordItem[];
  doctors: DoctorProfile[];
  onNavigate: (nav: PatientNavKey) => void;
  onSelectDoctor: (doctorId: string) => void;
  onBookWithDoctor: (doctorId: string, preset?: { visitMode?: 'in-person' | 'telehealth'; date?: string }) => void;
  onSelectSpecialty: (specialty: string) => void;
  onViewConfirmation: (apt: AppointmentRecord) => void;
}

export const PatientDashboard: React.FC<PatientDashboardProps> = ({
  userProfile,
  appointments,
  prescriptions,
  medicalRecords,
  doctors,
  onNavigate,
  onSelectDoctor,
  onBookWithDoctor,
  onSelectSpecialty,
  onViewConfirmation,
}) => {
  const [quickSpecialty, setQuickSpecialty] = useState('Cardiology');
  const [quickMode, setQuickMode] = useState<'in-person' | 'telehealth'>('in-person');
  const [quickDate, setQuickDate] = useState('2024-10-26');
  const [quickWindow, setQuickWindow] = useState<'Morning' | 'Afternoon' | 'Evening'>('Morning');

  const firstName = (userProfile?.displayName || 'Alexander').split(' ')[0];
  const upcomingAppointments = appointments.filter(
    (a) => a.status === 'scheduled' || a.status === 'checked-in' || a.status === 'in-exam'
  );
  const nextVisit = upcomingAppointments[0];
  const activePrescriptionsCount = prescriptions.filter(
    (p) => p.status === 'active' || p.status === 'approved' || p.status === 'refill-requested'
  ).length;

  const specialties = [
    { name: 'Cardiology', count: '14 Doctors', icon: <HeartPulse className="w-5 h-5 text-[#006B5F]" /> },
    { name: 'Neurology', count: '8 Doctors', icon: <Brain className="w-5 h-5 text-[#002541]" /> },
    { name: 'Pediatrics', count: '19 Doctors', icon: <Baby className="w-5 h-5 text-[#0284C7]" /> },
    { name: 'Orthopedics', count: '11 Doctors', icon: <Bone className="w-5 h-5 text-[#006B5F]" /> },
    { name: 'Dermatology', count: '7 Doctors', icon: <Sparkles className="w-5 h-5 text-[#002541]" /> },
    { name: 'Ophthalmology', count: '6 Doctors', icon: <Eye className="w-5 h-5 text-[#0284C7]" /> },
  ];

  const handleFindQuickSlots = () => {
    const matchedDoc =
      doctors.find((d) => d.specialty.toLowerCase() === quickSpecialty.toLowerCase()) ||
      doctors[0];
    onBookWithDoctor(matchedDoc.id, {
      visitMode: quickMode,
      date: quickDate,
    });
  };

  return (
    <div className="space-y-6">
      {/* Hero Greeting & Action Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="font-display text-2xl sm:text-[26px] font-bold text-[#0B1C30] tracking-tight">
              Good morning, {firstName}
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#ECFDF5] text-[#006B5F] text-[11px] font-semibold border border-[#A7F3D0]">
              <CheckCircle2 className="w-3 h-3" /> Verified Patient
            </span>
          </div>
          <p className="text-sm text-[#64748B] mt-1">
            Here is your health overview and scheduled visits for today, Thursday, Oct 24.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigate('find-doctors')}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 bg-[#006B5F] hover:bg-[#005048] text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Book Appointment</span>
          </button>
          <button
            onClick={() => onNavigate('prescriptions')}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#0B1C30] rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            <Pill className="w-3.5 h-3.5 text-[#006B5F]" />
            <span>Request Refill</span>
          </button>
          <button
            onClick={() => onNavigate('medical-records')}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#0B1C30] rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-[#002541]" />
            <span>Lab Reports</span>
          </button>
          <button
            onClick={() => onNavigate('ai-assistant')}
            className="inline-flex items-center gap-1.5 h-9 px-3 bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] hover:bg-[#FEE2E2] rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>24/7 On-Call Physician • Call Now</span>
          </button>
        </div>
      </div>

      {/* 4 Metric Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div
          onClick={() => onNavigate('my-appointments')}
          className="bg-white border border-[#E2E8F0] rounded-xl p-4 clinical-shadow hover:border-[#CBD5E1] transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[#64748B]">Upcoming Visits</span>
            <span className="w-8 h-8 rounded-lg bg-[#EFF4FF] text-[#002541] flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-3xl font-bold text-[#0B1C30] tabular-nums">
              {upcomingAppointments.length || 2}
            </span>
            <span className="text-xs font-medium text-[#64748B]">Scheduled</span>
          </div>
          <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#F0F9FF] text-[#0284C7] text-[11px] font-medium">
            <Clock className="w-3 h-3" /> Next: Tomorrow 10:30 AM
          </div>
        </div>

        <div
          onClick={() => onNavigate('prescriptions')}
          className="bg-white border border-[#E2E8F0] rounded-xl p-4 clinical-shadow hover:border-[#CBD5E1] transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[#64748B]">Active Prescriptions</span>
            <span className="w-8 h-8 rounded-lg bg-[#F0FDFA] text-[#006B5F] flex items-center justify-center">
              <Pill className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-3xl font-bold text-[#0B1C30] tabular-nums">
              {activePrescriptionsCount || 4}
            </span>
            <span className="text-xs font-medium text-[#64748B]">Medications</span>
          </div>
          <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#EFF4FF] text-[#123B5D] text-[11px] font-medium">
            1 Refill due in 3 days
          </div>
        </div>

        <div
          onClick={() => onNavigate('medical-records')}
          className="bg-white border border-[#E2E8F0] rounded-xl p-4 clinical-shadow hover:border-[#CBD5E1] transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[#64748B]">Recent Lab Results</span>
            <span className="w-8 h-8 rounded-lg bg-[#F0FDFA] text-[#006B5F] flex items-center justify-center">
              <FlaskConical className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-3xl font-bold text-[#0B1C30] tabular-nums">
              {medicalRecords.length || 3}
            </span>
            <span className="text-xs font-medium text-[#64748B]">New Reports</span>
          </div>
          <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#ECFDF5] text-[#006B5F] text-[11px] font-medium">
            <CheckCircle2 className="w-3 h-3" /> All Normal range
          </div>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 clinical-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[#64748B]">Care Index Score</span>
            <span className="w-8 h-8 rounded-lg bg-[#EFF4FF] text-[#002541] flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-1">
              <span className="font-display text-3xl font-bold text-[#0B1C30] tabular-nums">94</span>
              <span className="text-xs text-[#64748B] font-medium">/ 100</span>
            </div>
            <span className="text-xs font-bold text-[#006B5F]">Optimal</span>
          </div>
          <div className="mt-3 h-1.5 w-full bg-[#E2E8F0] rounded-full overflow-hidden">
            <div className="h-full w-[94%] bg-[#006B5F] rounded-full" />
          </div>
        </div>
      </div>

      {/* Main 12-Col Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left 8 Columns */}
        <div className="xl:col-span-8 space-y-6">
          {/* Priority Next Visit Card */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden clinical-shadow">
            <div className="bg-[#002541] px-5 py-2.5 flex items-center justify-between text-white">
              <span className="text-[11px] font-bold tracking-wider uppercase flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#4FDBC8]" />
                PRIORITY NEXT VISIT
              </span>
              <span className="inline-flex items-center gap-2 text-[11px]">
                <span className="px-2 py-0.5 rounded bg-[#006B5F] text-white font-semibold">
                  Confirmed In-Person Visit
                </span>
                <span className="text-[#A6CAF3] font-medium">In 22 hours</span>
              </span>
            </div>

            <div className="p-5">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <ClinicalAvatar
                    avatarKey="sarah-jenkins"
                    name={nextVisit?.doctorName || 'Dr. Sarah Jenkins'}
                    size="md"
                    activeDot
                  />
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-display text-base font-bold text-[#0B1C30]">
                        {nextVisit?.doctorName || 'Dr. Sarah Jenkins'},{' '}
                        {nextVisit?.doctorCredentials || 'MD'}
                      </h2>
                      <span className="px-1.5 py-0.5 rounded bg-[#F1F5F9] text-[#42474E] text-[10px] font-bold">
                        FACC
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-[#006B5F] mt-0.5">
                      Senior Cardiologist &amp; Cardiovascular Specialist
                    </p>
                    <p className="text-xs text-[#64748B] mt-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#006B5F]" />
                      {nextVisit?.location || 'St. Jude Heart Center • Suite 304, Clinical Wing B'}
                    </p>
                  </div>
                </div>

                <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-right shrink-0">
                  <div className="text-[10px] font-bold tracking-wider text-[#64748B] uppercase">
                    DATE &amp; TIME
                  </div>
                  <div className="text-sm font-bold text-[#0B1C30] mt-0.5">
                    {nextVisit?.appointmentDate || 'Fri, Oct 25, 2024'}
                  </div>
                  <div className="text-xs font-semibold text-[#006B5F] font-mono-tabular">
                    {nextVisit?.appointmentTime || '10:30 AM (EST)'}
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3.5 rounded-lg bg-[#F0F7FF] border border-[#DCE9FF] text-xs text-[#172B4D]">
                <div className="font-bold text-[#002541] mb-1">Appointment Preparation Note</div>
                <p className="text-[#42474E] leading-relaxed">
                  {nextVisit?.physicianSummary ||
                    'Fasting is strictly required 8 hours prior for comprehensive lipid panel testing. Please bring current medication bottles and previous ECG report.'}
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-[#E2E8F0] flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => {
                      if (nextVisit) onViewConfirmation(nextVisit);
                      else onNavigate('my-appointments');
                    }}
                    className="h-9 px-3.5 bg-[#002541] hover:bg-[#123B5D] text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Details</span>
                  </button>
                  <button
                    onClick={() => onNavigate('my-appointments')}
                    className="h-9 px-3.5 bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#0B1C30] rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Clock className="w-3.5 h-3.5 text-[#64748B]" />
                    <span>Reschedule</span>
                  </button>
                  <button
                    onClick={() => onNavigate('my-appointments')}
                    className="h-9 px-3.5 bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#0B1C30] rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5 text-[#64748B]" />
                    <span>Add to Calendar</span>
                  </button>
                </div>

                <button
                  onClick={() => {
                    if (nextVisit) onViewConfirmation(nextVisit);
                  }}
                  className="text-xs font-semibold text-[#006B5F] hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Get Driving Directions</span>
                </button>
              </div>
            </div>
          </div>

          {/* Browse Medical Specialties */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 clinical-shadow">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-display text-base font-bold text-[#0B1C30]">
                  Browse Medical Specialties
                </h2>
                <p className="text-xs text-[#64748B]">
                  Find board-certified physicians across 24 clinical departments
                </p>
              </div>
              <button
                onClick={() => onNavigate('find-doctors')}
                className="text-xs font-semibold text-[#006B5F] hover:underline cursor-pointer"
              >
                View All &gt;
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {specialties.map((spec) => (
                <button
                  key={spec.name}
                  onClick={() => onSelectSpecialty(spec.name)}
                  className="p-3 rounded-xl border border-[#E2E8F0] bg-[#FAFCFF] hover:bg-[#EFF4FF] hover:border-[#A6CAF3] transition-colors flex flex-col items-center text-center cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-lg bg-white border border-[#E2E8F0] flex items-center justify-center mb-2">
                    {spec.icon}
                  </div>
                  <div className="text-xs font-bold text-[#0B1C30]">{spec.name}</div>
                  <div className="text-[11px] text-[#64748B] mt-0.5">{spec.count}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Recommended Physicians */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 clinical-shadow">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-display text-base font-bold text-[#0B1C30]">
                  Recommended Physicians
                </h2>
                <p className="text-xs text-[#64748B]">
                  Based on your clinical history, insurance coverage, and top patient reviews
                </p>
              </div>
              <button
                onClick={() => onNavigate('find-doctors')}
                className="text-xs font-semibold text-[#006B5F] hover:underline cursor-pointer"
              >
                Explore Directory &gt;
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {doctors.slice(1, 4).map((doc) => (
                <div
                  key={doc.id}
                  className="border border-[#E2E8F0] rounded-xl p-4 bg-white hover:border-[#A6CAF3] transition-colors flex flex-col justify-between"
                >
                  <div>
                    <div
                      onClick={() => onSelectDoctor(doc.id)}
                      className="flex items-start gap-3 cursor-pointer"
                    >
                      <ClinicalAvatar avatarKey={doc.avatarKey} name={doc.name} size="md" activeDot />
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-[#0B1C30] truncate hover:text-[#006B5F]">
                          {doc.name}
                        </h3>
                        <p className="text-xs font-medium text-[#006B5F] truncate">
                          {doc.specialty} Specialist
                        </p>
                        <div className="flex items-center gap-1 mt-1 text-xs text-[#42474E]">
                          <Star className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" />
                          <span className="font-bold">{doc.rating}</span>
                          <span className="text-[#64748B]">({doc.reviewCount} reviews)</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-[#E2E8F0] flex items-center justify-between text-xs text-[#64748B]">
                      <span>Exp: {doc.experienceYears} Years</span>
                      <span className="font-bold text-[#0B1C30] font-mono-tabular">
                        Fee: ${doc.baseFee}
                      </span>
                    </div>
                    <div className="mt-2 text-[11px] font-semibold text-[#006B5F]">
                      {doc.availableToday ? 'Available Today' : 'Next slot: Monday'}
                    </div>
                  </div>

                  <button
                    onClick={() => onBookWithDoctor(doc.id)}
                    className="mt-3 w-full h-9 bg-[#006B5F] hover:bg-[#005048] text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Book Slot
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 4 Columns */}
        <div className="xl:col-span-4 space-y-6">
          {/* Quick Consultation Fast-Track */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 clinical-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#006B5F]" />
                <h2 className="font-display text-sm font-bold text-[#0B1C30]">
                  Quick Consultation
                </h2>
              </div>
              <span className="px-2 py-0.5 rounded bg-[#F1F5F9] text-[#42474E] text-[10px] font-semibold">
                Fast-Track
              </span>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-[#64748B] mb-1">
                  Select Specialty
                </label>
                <select
                  value={quickSpecialty}
                  onChange={(e) => setQuickSpecialty(e.target.value)}
                  className="w-full h-9 px-3 bg-white border border-[#E2E8F0] rounded-lg text-xs font-medium text-[#0B1C30] focus:outline-none focus:border-[#14B8A6]"
                >
                  <option value="Cardiology">Cardiology (Heart Health)</option>
                  <option value="Neurology">Neurology (Brain &amp; Nerves)</option>
                  <option value="Pediatrics">Pediatrics &amp; Family</option>
                  <option value="Orthopedics">Orthopedics &amp; Spine</option>
                  <option value="Dermatology">Dermatology</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#64748B] mb-1">
                  Consultation Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setQuickMode('in-person')}
                    className={`h-9 rounded-lg text-xs font-semibold inline-flex items-center justify-center gap-1.5 border cursor-pointer ${
                      quickMode === 'in-person'
                        ? 'bg-[#002541] text-white border-[#002541]'
                        : 'bg-white text-[#42474E] border-[#E2E8F0]'
                    }`}
                  >
                    <Stethoscope className="w-3.5 h-3.5" />
                    <span>In-Person</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickMode('telehealth')}
                    className={`h-9 rounded-lg text-xs font-semibold inline-flex items-center justify-center gap-1.5 border cursor-pointer ${
                      quickMode === 'telehealth'
                        ? 'bg-[#002541] text-white border-[#002541]'
                        : 'bg-white text-[#42474E] border-[#E2E8F0]'
                    }`}
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Telehealth</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#64748B] mb-1">
                  Preferred Date
                </label>
                <input
                  type="date"
                  value={quickDate}
                  onChange={(e) => setQuickDate(e.target.value)}
                  className="w-full h-9 px-3 bg-white border border-[#E2E8F0] rounded-lg text-xs font-medium text-[#0B1C30] focus:outline-none focus:border-[#14B8A6]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#64748B] mb-1">
                  Preferred Time Window
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { key: 'Morning', sub: '8am - 12pm' },
                      { key: 'Afternoon', sub: '12pm - 4pm' },
                      { key: 'Evening', sub: '4pm - 8pm' },
                    ] as const
                  ).map((slot) => (
                    <button
                      key={slot.key}
                      type="button"
                      onClick={() => setQuickWindow(slot.key)}
                      className={`py-2 px-1 rounded-lg border text-center cursor-pointer transition-colors ${
                        quickWindow === slot.key
                          ? 'bg-[#F0FDFA] border-[#006B5F] text-[#006B5F]'
                          : 'bg-white border-[#E2E8F0] text-[#42474E]'
                      }`}
                    >
                      <div className="text-[11px] font-bold">{slot.key}</div>
                      <div className="text-[10px] opacity-80">{slot.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleFindQuickSlots}
                className="w-full h-10 bg-[#006B5F] hover:bg-[#005048] text-white rounded-lg text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Find Available Slots</span>
              </button>
            </div>
          </div>

          {/* Recent Care Timeline */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 clinical-shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-sm font-bold text-[#0B1C30]">
                Recent Care Timeline
              </h2>
              <button
                onClick={() => onNavigate('medical-records')}
                className="text-xs font-semibold text-[#006B5F] hover:underline cursor-pointer"
              >
                All Records
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-[#F0FDFA] text-[#006B5F] flex items-center justify-center shrink-0 mt-0.5">
                  <FlaskConical className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#0B1C30]">
                      Blood Lipid Profile Uploaded
                    </span>
                    <span className="text-[11px] text-[#64748B]">Oct 18</span>
                  </div>
                  <p className="text-[11px] text-[#64748B] mt-0.5">
                    Validated by Dr. Sarah Jenkins • Full metabolic evaluation
                  </p>
                  <button
                    onClick={() => onNavigate('medical-records')}
                    className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#ECFDF5] text-[#006B5F] text-[11px] font-semibold cursor-pointer"
                  >
                    View Report (PDF)
                  </button>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-[#EFF4FF] text-[#002541] flex items-center justify-center shrink-0 mt-0.5">
                  <Pill className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#0B1C30]">
                      Prescription Refill Authorized
                    </span>
                    <span className="text-[11px] text-[#64748B]">Oct 12</span>
                  </div>
                  <p className="text-[11px] text-[#64748B] mt-0.5">
                    Lisinopril 10mg (90 days supply) approved • Picked up at MediCure Pharmacy Main
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-[#F1F5F9] text-[#42474E] flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#0B1C30]">
                      Dental Checkup Completed
                    </span>
                    <span className="text-[11px] text-[#64748B]">Sep 28</span>
                  </div>
                  <p className="text-[11px] text-[#64748B] mt-0.5">
                    Routine cleaning &amp; X-ray performed by Dr. Keith Miller. No cavities detected.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Clinical Wellness Note */}
          <div className="bg-[#F0FDFA] border border-[#CCFBF1] rounded-xl p-4">
            <div className="text-[11px] font-bold tracking-wider text-[#006B5F] uppercase mb-1">
              CLINICAL WELLNESS NOTE
            </div>
            <p className="text-xs text-[#00201C] leading-relaxed">
              Your blood pressure log has remained within the optimal 118/76 mmHg target for 14 consecutive days. Continue morning hydration prior to tomorrow&apos;s fasting lab draw.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
