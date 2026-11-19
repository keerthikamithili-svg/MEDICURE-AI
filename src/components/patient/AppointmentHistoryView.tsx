import React, { useMemo, useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileText,
  MapPin,
  Plus,
  RotateCcw,
  Search,
  Video,
  XCircle,
} from 'lucide-react';
import { AppointmentRecord } from '../../types/medicure';
import { ClinicalAvatar } from '../ClinicalVisuals';

interface AppointmentHistoryViewProps {
  appointments: AppointmentRecord[];
  onBookNew: () => void;
  onBookFollowUp: (doctorId: string) => void;
  onViewConfirmation: (apt: AppointmentRecord) => void;
  onReschedule: (id: string, newDate: string, newTime: string) => Promise<void>;
  onCancel: (id: string) => Promise<void>;
}

export const AppointmentHistoryView: React.FC<AppointmentHistoryViewProps> = ({
  appointments,
  onBookNew,
  onBookFollowUp,
  onViewConfirmation,
  onReschedule,
  onCancel,
}) => {
  const [filterTab, setFilterTab] = useState<'all' | 'completed' | 'upcoming' | 'cancelled'>('all');
  const [search, setSearch] = useState('');
  const [modeFilter, setModeFilter] = useState<'all' | 'in-person' | 'telehealth'>('all');
  const [rescheduleTarget, setRescheduleTarget] = useState<AppointmentRecord | null>(null);
  const [newDate, setNewDate] = useState('Mon, Oct 28, 2024');
  const [newTime, setNewTime] = useState('09:00 AM');

  const counts = useMemo(() => {
    const completed = appointments.filter((a) => a.status === 'completed').length;
    const upcoming = appointments.filter(
      (a) => a.status === 'scheduled' || a.status === 'checked-in' || a.status === 'in-exam'
    ).length;
    const cancelled = appointments.filter((a) => a.status === 'cancelled').length;
    return { total: appointments.length, completed, upcoming, cancelled };
  }, [appointments]);

  const filtered = useMemo(() => {
    return appointments.filter((apt) => {
      if (filterTab === 'completed' && apt.status !== 'completed') return false;
      if (
        filterTab === 'upcoming' &&
        apt.status !== 'scheduled' &&
        apt.status !== 'checked-in' &&
        apt.status !== 'in-exam'
      )
        return false;
      if (filterTab === 'cancelled' && apt.status !== 'cancelled') return false;
      if (modeFilter !== 'all' && apt.visitMode !== modeFilter) return false;

      const q = search.trim().toLowerCase();
      if (!q) return true;
      return (
        apt.doctorName.toLowerCase().includes(q) ||
        apt.specialty.toLowerCase().includes(q) ||
        apt.chiefComplaint.toLowerCase().includes(q) ||
        (apt.physicianSummary || '').toLowerCase().includes(q)
      );
    });
  }, [appointments, filterTab, modeFilter, search]);

  const handleExportCsv = () => {
    const rows = [
      ['ID', 'Doctor', 'Specialty', 'Date', 'Time', 'Mode', 'Status', 'Copay'],
      ...filtered.map((a) => [
        a.id,
        a.doctorName,
        a.specialty,
        a.appointmentDate,
        a.appointmentTime,
        a.visitMode,
        a.status,
        `$${a.copayAmount}`,
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'medicure-appointment-history.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs text-[#64748B] font-medium mb-1">
            Patient Portal &gt; Appointments &gt;{' '}
            <span className="text-[#0B1C30] font-semibold">Appointment History</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-[#0B1C30]">
            Appointment History
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            Review, filter, and access digital receipts, clinical visit summaries, and follow-up care notes.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleExportCsv}
            className="h-9 px-3.5 bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#0B1C30] rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export History</span>
          </button>
          <button
            onClick={onBookNew}
            className="h-9 px-4 bg-[#006B5F] hover:bg-[#005048] text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Book New Appointment</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Tiles */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 clinical-shadow">
          <div className="text-[10px] font-bold text-[#64748B] uppercase">TOTAL CONSULTATIONS</div>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="font-display text-2xl font-bold text-[#0B1C30] tabular-nums">
              {counts.total}
            </span>
            <span className="text-xs text-[#64748B]">visits</span>
          </div>
          <div className="text-[11px] text-[#64748B] mt-1">Lifetime MediCure records</div>
        </div>
        <div className="bg-white border border-[#A7F3D0] rounded-xl p-4 clinical-shadow">
          <div className="text-[10px] font-bold text-[#006B5F] uppercase">COMPLETED VISITS</div>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="font-display text-2xl font-bold text-[#0B1C30] tabular-nums">
              {counts.completed}
            </span>
            <span className="text-xs text-[#64748B]">verified</span>
          </div>
          <div className="text-[11px] font-semibold text-[#006B5F] mt-1">
            Clinical notes &amp; Rx ready
          </div>
        </div>
        <div className="bg-white border border-[#BAE6FD] rounded-xl p-4 clinical-shadow">
          <div className="text-[10px] font-bold text-[#0284C7] uppercase">UPCOMING SCHEDULED</div>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="font-display text-2xl font-bold text-[#0B1C30] tabular-nums">
              {counts.upcoming}
            </span>
            <span className="text-xs text-[#64748B]">active</span>
          </div>
          <div className="text-[11px] font-semibold text-[#002541] mt-1">
            Next: Tomorrow, 10:30 AM
          </div>
        </div>
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 clinical-shadow">
          <div className="text-[10px] font-bold text-[#64748B] uppercase">CANCELLED / REBOOKED</div>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="font-display text-2xl font-bold text-[#0B1C30] tabular-nums">
              {counts.cancelled}
            </span>
            <span className="text-xs text-[#64748B]">adjusted</span>
          </div>
          <div className="text-[11px] text-[#64748B] mt-1">Fee refunds confirmed</div>
        </div>
      </div>

      {/* Filter Card */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 clinical-shadow space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {(
            [
              { id: 'all', label: `All Consultations (${counts.total})` },
              { id: 'completed', label: `Completed (${counts.completed})` },
              { id: 'upcoming', label: `Upcoming / Active (${counts.upcoming})` },
              { id: 'cancelled', label: `Cancelled & Rebooked (${counts.cancelled})` },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                filterTab === tab.id
                  ? 'bg-[#002541] text-white'
                  : 'bg-[#F8FAFC] text-[#42474E] hover:bg-[#F1F5F9]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by doctor, specialty, diagnosis, or summary..."
              className="w-full h-9 pl-9 pr-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs text-[#0B1C30] focus:outline-none focus:border-[#14B8A6]"
            />
          </div>

          <select
            value={modeFilter}
            onChange={(e) => setModeFilter(e.target.value as 'all' | 'in-person' | 'telehealth')}
            className="h-9 px-3 bg-white border border-[#E2E8F0] rounded-lg text-xs font-medium text-[#0B1C30]"
          >
            <option value="all">All Consultation Types</option>
            <option value="in-person">In-Person Visits</option>
            <option value="telehealth">HD Video Telehealth</option>
          </select>
        </div>
      </div>

      {/* Appointments List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-8 text-center clinical-shadow">
            <p className="text-sm font-semibold text-[#0B1C30]">
              No appointments found matching your filters.
            </p>
          </div>
        ) : (
          filtered.map((apt) => {
            const isCancelled = apt.status === 'cancelled';
            const isCompleted = apt.status === 'completed';

            return (
              <div
                key={apt.id}
                className="bg-white border border-[#E2E8F0] rounded-xl p-5 clinical-shadow space-y-3"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <ClinicalAvatar
                      avatarKey={
                        apt.doctorId.includes('elena')
                          ? 'elena-rostova'
                          : apt.doctorId.includes('marcus')
                          ? 'marcus-vance'
                          : apt.doctorId.includes('david')
                          ? 'david-chen'
                          : 'sarah-jenkins'
                      }
                      name={apt.doctorName}
                      size="md"
                    />
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2
                          className={`font-display text-base font-bold ${
                            isCancelled ? 'line-through text-[#64748B]' : 'text-[#0B1C30]'
                          }`}
                        >
                          {apt.doctorName}, {apt.doctorCredentials || 'MD'}
                        </h2>
                        {isCompleted && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#006B5F] text-[10px] font-bold">
                            <CheckCircle2 className="w-3 h-3" /> Completed Visit
                          </span>
                        )}
                        {!isCompleted && !isCancelled && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#EFF4FF] text-[#002541] text-[10px] font-bold">
                            <Clock className="w-3 h-3" /> {apt.status.toUpperCase()}
                          </span>
                        )}
                        {isCancelled && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FEF2F2] text-[#DC2626] text-[10px] font-bold">
                            <XCircle className="w-3 h-3" /> Cancelled by Patient
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded bg-[#F1F5F9] text-[#42474E] text-[10px] font-semibold inline-flex items-center gap-1">
                          {apt.visitMode === 'telehealth' && <Video className="w-3 h-3" />}
                          {apt.visitMode === 'telehealth' ? 'HD Video Telehealth' : 'In-Person'}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-[#006B5F] mt-0.5">
                        {apt.specialty} • {apt.chiefComplaint}
                      </p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-[#64748B]">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" /> {apt.appointmentDate}
                        </span>
                        <span className="inline-flex items-center gap-1 font-mono-tabular">
                          <Clock className="w-3.5 h-3.5" /> {apt.appointmentTime}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" /> {apt.location}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      onClick={() => onViewConfirmation(apt)}
                      className="h-8 px-3 bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] rounded-lg text-xs font-semibold text-[#0B1C30] inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Details</span>
                    </button>

                    {!isCompleted && !isCancelled && (
                      <>
                        <button
                          onClick={() => setRescheduleTarget(apt)}
                          className="h-8 px-3 bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] rounded-lg text-xs font-semibold text-[#0B1C30] cursor-pointer"
                        >
                          Reschedule
                        </button>
                        <button
                          onClick={() => onCancel(apt.id)}
                          className="h-8 px-3 bg-[#FEF2F2] border border-[#FECACA] rounded-lg text-xs font-semibold text-[#DC2626] cursor-pointer"
                        >
                          Cancel
                        </button>
                      </>
                    )}

                    {(isCompleted || isCancelled) && (
                      <button
                        onClick={() => onBookFollowUp(apt.doctorId)}
                        className="h-8 px-3 bg-[#002541] hover:bg-[#123B5D] text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>{isCancelled ? 'Rebook Session' : 'Book Follow-up'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {apt.physicianSummary && (
                  <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="text-[#42474E]">
                      <span className="font-bold text-[#0B1C30]">
                        {isCancelled ? 'Cancellation Notice: ' : 'Physician Summary: '}
                      </span>
                      {apt.physicianSummary}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="px-2 py-0.5 rounded bg-[#EFF4FF] text-[#002541] text-[10px] font-semibold">
                        <FileText className="w-3 h-3 inline mr-1" />
                        {isCancelled ? 'Refund Processed' : `Copay $${apt.copayAmount}`}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Reschedule Modal */}
      {rescheduleTarget && (
        <div className="fixed inset-0 z-50 bg-[#002541]/40 flex items-center justify-center p-4">
          <div className="bg-white border border-[#E2E8F0] rounded-xl max-w-md w-full p-5 clinical-shadow-md space-y-4">
            <h3 className="font-display text-base font-bold text-[#0B1C30]">
              Reschedule {rescheduleTarget.doctorName}
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#0B1C30] mb-1">New Clinical Date</label>
                <select
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full h-9 px-3 border border-[#E2E8F0] rounded-lg"
                >
                  <option value="Sat, Oct 26, 2024">Sat, Oct 26, 2024</option>
                  <option value="Mon, Oct 28, 2024">Mon, Oct 28, 2024</option>
                  <option value="Wed, Oct 30, 2024">Wed, Oct 30, 2024</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-[#0B1C30] mb-1">New Time Slot</label>
                <select
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full h-9 px-3 border border-[#E2E8F0] rounded-lg"
                >
                  <option value="09:00 AM">09:00 AM</option>
                  <option value="11:15 AM">11:15 AM</option>
                  <option value="02:00 PM">02:00 PM</option>
                  <option value="03:30 PM">03:30 PM</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setRescheduleTarget(null)}
                className="h-9 px-4 border border-[#E2E8F0] rounded-lg text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await onReschedule(rescheduleTarget.id, newDate, newTime);
                  setRescheduleTarget(null);
                }}
                className="h-9 px-4 bg-[#006B5F] text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Confirm New Slot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
