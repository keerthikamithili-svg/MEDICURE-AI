import React, { useState } from 'react';
import {
  Building2,
  Calendar,
  Download,
  FileText,
  Plus,
  ShieldCheck,
  Stethoscope,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import {
  AdminNavKey,
  AppointmentRecord,
  DepartmentUnit,
  DoctorProfile,
} from '../../types/medicure';
import { ClinicalAvatar, MonthlyAppointmentsChart } from '../ClinicalVisuals';

interface AdminPortalViewProps {
  activeNav: AdminNavKey;
  onNavigate: (nav: AdminNavKey) => void;
  doctors: DoctorProfile[];
  departments: DepartmentUnit[];
  appointments: AppointmentRecord[];
  isAdmin: boolean;
  onAddDoctor: (input: {
    name: string;
    credentials: string;
    specialty: string;
    department: string;
    hospital: string;
    npi: string;
    baseFee: number;
    copayFee: number;
  }) => Promise<void>;
}

export const AdminPortalView: React.FC<AdminPortalViewProps> = ({
  activeNav,
  onNavigate,
  doctors,
  departments,
  appointments,
  isAdmin,
  onAddDoctor,
}) => {
  const [chartMode, setChartMode] = useState<'Monthly' | 'Quarterly' | 'Annual'>('Monthly');
  const [showAddDoctor, setShowAddDoctor] = useState(false);
  const [docName, setDocName] = useState('');
  const [docCreds, setDocCreds] = useState('MD');
  const [docSpec, setDocSpec] = useState('Cardiology');
  const [docDept, setDocDept] = useState('Cardiology');
  const [docHospital, setDocHospital] = useState('St. Jude Heart Center • Wing B');
  const [docNpi, setDocNpi] = useState('1928374650');
  const [docFee, setDocFee] = useState(125);
  const [docError, setDocError] = useState<string | null>(null);

  const handleCreateDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    setDocError(null);
    try {
      await onAddDoctor({
        name: docName,
        credentials: docCreds,
        specialty: docSpec,
        department: docDept,
        hospital: docHospital,
        npi: docNpi,
        baseFee: docFee,
        copayFee: 30,
      });
      setShowAddDoctor(false);
      setDocName('');
    } catch (err: unknown) {
      setDocError(
        err instanceof Error
          ? err.message
          : 'Admin privileges required in Supabase security policies to add new physicians.'
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="text-xs text-[#64748B] font-medium mb-1">
            Admin Console &gt; Operations Intelligence &gt;{' '}
            <span className="text-[#0B1C30] font-semibold">Executive Overview</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-[#0B1C30]">
            Hospital Administration &amp; Operations
          </h1>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px]">
            <span className="px-2 py-0.5 rounded bg-[#ECFDF5] text-[#006B5F] font-semibold">
              Operational Management Portal
            </span>
            <span className="px-2 py-0.5 rounded bg-[#EFF4FF] text-[#002541] font-semibold">
              Main Campus &amp; Outpatient Clinics
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="h-9 px-3 bg-white border border-[#E2E8F0] rounded-lg text-xs font-semibold flex items-center gap-1.5 text-[#0B1C30]">
            <Calendar className="w-3.5 h-3.5 text-[#64748B]" />
            <span>Oct 1 - Oct 31, 2024 (MTD)</span>
          </div>
          <button
            onClick={() => window.print()}
            className="h-9 px-3.5 bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Report (CSV/PDF)</span>
          </button>
          <button
            onClick={() => setShowAddDoctor(true)}
            className="h-9 px-3.5 bg-[#002541] hover:bg-[#123B5D] text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Doctor</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 clinical-shadow">
          <div className="text-[10px] font-bold text-[#64748B] uppercase">TOTAL PATIENTS</div>
          <div className="font-display text-3xl font-bold text-[#0B1C30] mt-1 tabular-nums">
            24,850
          </div>
          <div className="text-[11px] font-semibold text-[#006B5F] mt-2">
            +8.4% vs. last month • Active registered files
          </div>
        </div>
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 clinical-shadow">
          <div className="text-[10px] font-bold text-[#64748B] uppercase">TOTAL DOCTORS</div>
          <div className="font-display text-3xl font-bold text-[#0B1C30] mt-1 tabular-nums">
            {136 + doctors.length} Active
          </div>
          <div className="text-[11px] text-[#002541] font-semibold mt-2">
            +6 new this month • Across {departments.length} departments
          </div>
        </div>
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 clinical-shadow">
          <div className="text-[10px] font-bold text-[#64748B] uppercase">TOTAL APPOINTMENTS</div>
          <div className="font-display text-3xl font-bold text-[#0B1C30] mt-1 tabular-nums">
            1,840
          </div>
          <div className="text-[11px] text-[#006B5F] font-semibold mt-2">
            Monthly Total • In-person &amp; telehealth
          </div>
        </div>
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 clinical-shadow">
          <div className="text-[10px] font-bold text-[#64748B] uppercase">TODAY&apos;S APPOINTMENTS</div>
          <div className="font-display text-3xl font-bold text-[#0B1C30] mt-1 tabular-nums">
            128
          </div>
          <div className="text-[11px] text-[#64748B] mt-2">
            42 Completed • 18 In Consultation • 68 Pending
          </div>
        </div>
      </div>

      {/* Administration Hub */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 clinical-shadow">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
            HOSPITAL ADMINISTRATION HUB
          </span>
          <span className="text-[11px] text-[#64748B]">
            Select a management directory to view and update staffing or records
          </span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {(
            [
              { key: 'manage-doctors', title: 'Manage Doctors', sub: `${doctors.length} Featured Roster`, icon: <Stethoscope className="w-4 h-4 text-[#002541]" /> },
              { key: 'manage-patients', title: 'Manage Patients', sub: '24,850 Files', icon: <Users className="w-4 h-4 text-[#006B5F]" /> },
              { key: 'executive-overview', title: 'Manage Receptionists', sub: '16 Front-Desk Staff', icon: <UserPlus className="w-4 h-4 text-[#0284C7]" /> },
              { key: 'manage-departments', title: 'Manage Departments', sub: `${departments.length} Clinical Units`, icon: <Building2 className="w-4 h-4 text-[#123B5D]" /> },
            ] as const
          ).map((hub) => (
            <button
              key={hub.title}
              onClick={() => onNavigate(hub.key)}
              className={`p-3 rounded-xl border text-left flex items-center gap-3 cursor-pointer transition-colors ${
                activeNav === hub.key
                  ? 'bg-[#EFF4FF] border-[#002541]'
                  : 'bg-[#F8FAFC] border-[#E2E8F0] hover:bg-[#EFF4FF]'
              }`}
            >
              <div className="w-9 h-9 rounded-lg bg-white border border-[#E2E8F0] flex items-center justify-center shrink-0">
                {hub.icon}
              </div>
              <div>
                <div className="text-xs font-bold text-[#0B1C30]">{hub.title}</div>
                <div className="text-[11px] text-[#64748B]">{hub.sub}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main 12-Col Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <div className="xl:col-span-8 space-y-6">
          {/* Monthly Stats Chart */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 clinical-shadow space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-base font-bold text-[#0B1C30]">
                  Appointment Overview &amp; Monthly Statistics
                </h2>
                <p className="text-xs text-[#64748B]">
                  Monthly consultation volumes and scheduling throughput across outpatient clinics
                </p>
              </div>

              <div className="flex items-center gap-1 p-1 bg-[#F1F5F9] rounded-lg">
                {(['Monthly', 'Quarterly', 'Annual'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setChartMode(m)}
                    className={`px-3 py-1 rounded-md text-xs font-semibold cursor-pointer ${
                      chartMode === m ? 'bg-white text-[#002541] shadow-xs' : 'text-[#64748B]'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <MonthlyAppointmentsChart mode={chartMode} />

            <div className="grid grid-cols-3 gap-4 pt-3 border-t border-[#E2E8F0] text-center sm:text-left">
              <div>
                <div className="text-[11px] text-[#64748B]">Attendance Rate</div>
                <div className="text-sm font-bold text-[#0B1C30]">96.2% On-Time</div>
              </div>
              <div>
                <div className="text-[11px] text-[#64748B]">Avg Consultation Time</div>
                <div className="text-sm font-bold text-[#0B1C30]">22 Minutes</div>
              </div>
              <div>
                <div className="text-[11px] text-[#64748B]">Patient Feedback</div>
                <div className="text-sm font-bold text-[#0B1C30]">4.9 / 5.0 Rating</div>
              </div>
            </div>
          </div>

          {/* Hospital Departments Overview */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden clinical-shadow">
            <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
              <div>
                <h2 className="font-display text-base font-bold text-[#0B1C30]">
                  Hospital Departments Overview
                </h2>
                <p className="text-xs text-[#64748B]">
                  Department heads, assigned medical personnel, and live consultation volumes
                </p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-4">Department</th>
                    <th className="py-2.5 px-4">Head of Department</th>
                    <th className="py-2.5 px-4">Total Doctors</th>
                    <th className="py-2.5 px-4">Active Patients</th>
                    <th className="py-2.5 px-4">Today&apos;s Appointments</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {departments.map((dept) => (
                    <tr key={dept.id} className="hover:bg-[#F8FAFC]">
                      <td className="py-3 px-4 font-bold text-[#0B1C30]">{dept.name}</td>
                      <td className="py-3 px-4 text-[#42474E]">{dept.headDoctor}</td>
                      <td className="py-3 px-4 font-mono-tabular">{dept.totalDoctors} Doctors</td>
                      <td className="py-3 px-4 font-mono-tabular">
                        {dept.activePatients.toLocaleString()} Patients
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#CCFBF1] text-[#006B5F] font-bold">
                          {dept.todaysAppointments} Scheduled
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Doctor Directory & Duty Status */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden clinical-shadow">
            <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
              <div>
                <h2 className="font-display text-base font-bold text-[#0B1C30]">
                  Doctor Directory &amp; Duty Status
                </h2>
                <p className="text-xs text-[#64748B]">
                  Active doctors, specialty, scheduled consultations, and current clinical duty
                </p>
              </div>
              <button
                onClick={() => setShowAddDoctor(true)}
                className="h-8 px-3 bg-[#002541] text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Doctor</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-4">Doctor Name</th>
                    <th className="py-2.5 px-4">Specialty / Department</th>
                    <th className="py-2.5 px-4">Fee</th>
                    <th className="py-2.5 px-4">Duty Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {doctors.map((doc) => (
                    <tr key={doc.id} className="hover:bg-[#F8FAFC]">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <ClinicalAvatar avatarKey={doc.avatarKey} name={doc.name} size="sm" />
                          <div>
                            <div className="font-bold text-[#0B1C30]">
                              {doc.name}, {doc.credentials}
                            </div>
                            <div className="text-[11px] text-[#64748B] font-mono-tabular">
                              NPI: {doc.npi}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[#42474E]">{doc.specialty}</td>
                      <td className="py-3 px-4 font-mono-tabular font-semibold">${doc.baseFee}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                            doc.dutyStatus === 'In Consultation'
                              ? 'bg-[#CCFBF1] text-[#006B5F]'
                              : 'bg-[#EFF4FF] text-[#002541]'
                          }`}
                        >
                          {doc.dutyStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Live Appointment Queue */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden clinical-shadow">
            <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
              <h2 className="font-display text-base font-bold text-[#0B1C30]">
                Today&apos;s Appointments &amp; Patient Queue
              </h2>
              <span className="text-xs font-semibold text-[#006B5F]">
                {appointments.length} Active Records
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-4">Patient</th>
                    <th className="py-2.5 px-4">Doctor Assigned</th>
                    <th className="py-2.5 px-4">Department</th>
                    <th className="py-2.5 px-4">Time Slot</th>
                    <th className="py-2.5 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {appointments.slice(0, 6).map((apt) => (
                    <tr key={apt.id} className="hover:bg-[#F8FAFC]">
                      <td className="py-3 px-4 font-bold text-[#0B1C30]">
                        {apt.patientName}
                        <div className="text-[10px] font-mono-tabular text-[#64748B]">
                          {apt.patientPid}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[#42474E]">{apt.doctorName}</td>
                      <td className="py-3 px-4">{apt.specialty}</td>
                      <td className="py-3 px-4 font-mono-tabular">{apt.appointmentTime}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-[#EFF4FF] text-[#002541] font-semibold">
                          {apt.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right 4 Columns */}
        <div className="xl:col-span-4 space-y-5">
          {/* CEO Executive Card */}
          <div className="bg-[#002541] text-white rounded-xl p-5 clinical-shadow space-y-3">
            <div className="flex items-center gap-3">
              <ClinicalAvatar avatarKey="ceo" name="Dr. Arthur Vance" size="md" />
              <div>
                <div className="text-[10px] font-bold tracking-wider text-[#6DF5E1] uppercase">
                  CHIEF EXECUTIVE OFFICER
                </div>
                <div className="font-display text-base font-bold">Dr. Arthur Vance, MD</div>
                <div className="text-xs text-[#A6CAF3]">Hospital Chief Administrator • St. Jude HQ</div>
              </div>
            </div>
            <div className="pt-3 border-t border-white/15 flex items-center justify-between text-[11px]">
              <span className="text-[#A6CAF3]">Security Clearance: Tier 5 (Gov/HIPAA)</span>
              <span className="inline-flex items-center gap-1 text-[#6DF5E1] font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" /> Encrypted
              </span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 clinical-shadow space-y-2.5 text-xs">
            <h3 className="font-display text-sm font-bold text-[#0B1C30] mb-1">
              Quick Hospital Management Actions
            </h3>
            <button
              onClick={() => setShowAddDoctor(true)}
              className="w-full p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] hover:bg-[#EFF4FF] flex items-center justify-between font-semibold text-[#0B1C30] cursor-pointer"
            >
              <span>Add New Doctor</span>
              <span>&rarr;</span>
            </button>
            <button
              onClick={() => onNavigate('manage-patients')}
              className="w-full p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] hover:bg-[#EFF4FF] flex items-center justify-between font-semibold text-[#0B1C30] cursor-pointer"
            >
              <span>Register Patient</span>
              <span>&rarr;</span>
            </button>
            <button
              onClick={() => onNavigate('manage-departments')}
              className="w-full p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] hover:bg-[#EFF4FF] flex items-center justify-between font-semibold text-[#0B1C30] cursor-pointer"
            >
              <span>Manage Departments</span>
              <span>&rarr;</span>
            </button>
            <button
              onClick={() => window.print()}
              className="w-full p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] hover:bg-[#EFF4FF] flex items-center justify-between font-semibold text-[#0B1C30] cursor-pointer"
            >
              <span>Generate Report</span>
              <FileText className="w-3.5 h-3.5 text-[#006B5F]" />
            </button>
          </div>

          {/* Recent Activities */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 clinical-shadow space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-sm font-bold text-[#0B1C30]">Recent Activities</h3>
              <span className="text-[11px] font-semibold text-[#006B5F]">Live Log</span>
            </div>
            <div className="space-y-3">
              <div>
                <div className="font-bold text-[#0B1C30]">Consultation Completed</div>
                <div className="text-[#64748B]">
                  Dr. Sarah Jenkins completed consultation with Alexander Wright • 4m ago
                </div>
              </div>
              <div>
                <div className="font-bold text-[#0B1C30]">Front-Desk Staff Added</div>
                <div className="text-[#64748B]">
                  Admin assigned Receptionist Clara Kent to South Wing Desk • 18m ago
                </div>
              </div>
              <div>
                <div className="font-bold text-[#0B1C30]">New Appointment Booked</div>
                <div className="text-[#64748B]">
                  Patient Emily Clark booked appointment with Dr. Robert Chen • 32m ago
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Doctor Modal */}
      {showAddDoctor && (
        <div className="fixed inset-0 z-50 bg-[#002541]/40 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateDoctor}
            className="bg-white border border-[#E2E8F0] rounded-xl max-w-md w-full p-6 clinical-shadow-md space-y-4 text-xs"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display text-base font-bold text-[#0B1C30]">
                Onboard Accredited Physician
              </h3>
              <button
                type="button"
                onClick={() => setShowAddDoctor(false)}
                className="text-[#64748B] hover:text-[#0B1C30] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {!isAdmin && (
              <div className="p-2.5 rounded-lg bg-[#FFFBEB] border border-[#FDE68A] text-[#92400E]">
                Note: Supabase security policies restrict creating new physician records to verified Admin accounts.
              </div>
            )}

            {docError && (
              <div className="p-2.5 rounded-lg bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626]">
                {docError}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block font-semibold text-[#0B1C30] mb-1">Physician Full Name</label>
                <input
                  type="text"
                  required
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  placeholder="Dr. Clara Bennett"
                  className="w-full h-9 px-3 border border-[#E2E8F0] rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#0B1C30] mb-1">Credentials</label>
                  <input
                    type="text"
                    required
                    value={docCreds}
                    onChange={(e) => setDocCreds(e.target.value)}
                    className="w-full h-9 px-3 border border-[#E2E8F0] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#0B1C30] mb-1">Specialty</label>
                  <input
                    type="text"
                    required
                    value={docSpec}
                    onChange={(e) => setDocSpec(e.target.value)}
                    className="w-full h-9 px-3 border border-[#E2E8F0] rounded-lg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#0B1C30] mb-1">Department</label>
                  <input
                    type="text"
                    required
                    value={docDept}
                    onChange={(e) => setDocDept(e.target.value)}
                    className="w-full h-9 px-3 border border-[#E2E8F0] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#0B1C30] mb-1">NPI Number</label>
                  <input
                    type="text"
                    required
                    value={docNpi}
                    onChange={(e) => setDocNpi(e.target.value)}
                    className="w-full h-9 px-3 border border-[#E2E8F0] rounded-lg font-mono-tabular"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-[#0B1C30] mb-1">Hospital Wing / Suite</label>
                <input
                  type="text"
                  required
                  value={docHospital}
                  onChange={(e) => setDocHospital(e.target.value)}
                  className="w-full h-9 px-3 border border-[#E2E8F0] rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#0B1C30] mb-1">Consultation Fee ($)</label>
                <input
                  type="number"
                  required
                  min={50}
                  max={1000}
                  value={docFee}
                  onChange={(e) => setDocFee(Number(e.target.value))}
                  className="w-full h-9 px-3 border border-[#E2E8F0] rounded-lg font-mono-tabular"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddDoctor(false)}
                className="h-9 px-4 border border-[#E2E8F0] rounded-lg font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="h-9 px-4 bg-[#006B5F] text-white rounded-lg font-semibold cursor-pointer"
              >
                Save Physician
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
