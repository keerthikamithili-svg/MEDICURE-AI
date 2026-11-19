import React, { useState } from 'react';
import {
  CheckCircle2,
  CreditCard,
  QrCode,
  Search,
  UserCheck,
  UserPlus,
} from 'lucide-react';
import { AppointmentRecord, ReceptionistNavKey } from '../../types/medicure';

interface ReceptionistPortalViewProps {
  activeNav: ReceptionistNavKey;
  appointments: AppointmentRecord[];
  onCheckIn: (id: string) => Promise<void>;
  onQuickBook: () => void;
}

export const ReceptionistPortalView: React.FC<ReceptionistPortalViewProps> = ({
  activeNav,
  appointments,
  onCheckIn,
  onQuickBook,
}) => {
  const [passCode, setPassCode] = useState('');
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [walkInName, setWalkInName] = useState('');
  const [walkInReason, setWalkInReason] = useState('Urgent Triage Assessment');
  const [walkInSaved, setWalkInSaved] = useState<string | null>(null);

  const handleScanLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passCode.trim()) return;
    setScanResult(`Fast-Track Pass ${passCode.trim()} verified: Express Check-In ready for Wing B Room 402.`);
  };

  const totalCollected = appointments.reduce((acc, a) => acc + (a.copayPaid ? a.copayAmount : 0), 0);

  if (activeNav === 'walk-in-registration') {
    return (
      <div className="space-y-6 max-w-3xl">
        <div>
          <div className="text-xs text-[#64748B] font-medium mb-1">
            Front Desk Operations &gt; <span className="text-[#0B1C30] font-semibold">Walk-In Intake</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-[#0B1C30]">
            Walk-In &amp; Emergency Lobby Registration
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            Fast-track unscheduled arrivals directly into the attending clinical queue.
          </p>
        </div>

        {walkInSaved && (
          <div className="p-3.5 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] text-xs font-semibold text-[#006B5F] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{walkInSaved}</span>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!walkInName.trim()) return;
            setWalkInSaved(`Walk-In ticket generated for ${walkInName.trim()} (${walkInReason}). Routing to full EHR intake.`);
            setWalkInName('');
          }}
          className="bg-white border border-[#E2E8F0] rounded-xl p-6 clinical-shadow space-y-4 text-xs"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-[#0B1C30] mb-1">Patient Full Name</label>
              <input
                type="text"
                required
                value={walkInName}
                onChange={(e) => setWalkInName(e.target.value)}
                placeholder="e.g. Marcus Vance"
                className="w-full h-9 px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#0B1C30] mb-1">Arrival Priority / Reason</label>
              <select
                value={walkInReason}
                onChange={(e) => setWalkInReason(e.target.value)}
                className="w-full h-9 px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg"
              >
                <option>Urgent Triage Assessment</option>
                <option>Same-Day Cardiology Follow-Up</option>
                <option>Lab Draw / Lipid Panel Only</option>
              </select>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onQuickBook}
              className="h-9 px-4 bg-[#006B5F] hover:bg-[#005048] text-white rounded-lg font-semibold cursor-pointer"
            >
              Open Full Booking Wizard
            </button>
            <button
              type="submit"
              className="h-9 px-4 bg-[#002541] hover:bg-[#123B5D] text-white rounded-lg font-semibold cursor-pointer"
            >
              Issue Lobby Ticket
            </button>
          </div>
        </form>
      </div>
    );
  }

  if (activeNav === 'billing-copays') {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs text-[#64748B] font-medium mb-1">
              Front Desk Operations &gt; <span className="text-[#0B1C30] font-semibold">Copays &amp; Receipts</span>
            </div>
            <h1 className="font-display text-2xl font-bold text-[#0B1C30]">
              Point-of-Care Copay Ledger
            </h1>
          </div>
          <div className="px-4 py-2 rounded-xl bg-white border border-[#E2E8F0] clinical-shadow text-xs">
            <span className="text-[#64748B]">Settled Today: </span>
            <span className="font-mono-tabular font-bold text-[#006B5F] text-sm">
              ${totalCollected}.00
            </span>
          </div>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden clinical-shadow">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Receipt #</th>
                <th className="py-3 px-4">Patient</th>
                <th className="py-3 px-4">Insurer</th>
                <th className="py-3 px-4">Copay</th>
                <th className="py-3 px-4 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {appointments.map((apt) => (
                <tr key={apt.id} className="hover:bg-[#F8FAFC]">
                  <td className="py-3 px-4 font-mono-tabular font-semibold text-[#002541]">
                    {apt.receiptNumber || `#REC-${apt.id.slice(-5).toUpperCase()}`}
                  </td>
                  <td className="py-3 px-4 font-bold text-[#0B1C30]">{apt.patientName}</td>
                  <td className="py-3 px-4 text-[#42474E]">
                    {apt.insuranceProvider || 'Aetna Choice POS II'}
                  </td>
                  <td className="py-3 px-4 font-mono-tabular font-bold text-[#006B5F]">
                    ${apt.copayAmount}.00 ({apt.copayPaid ? 'Settled' : 'Due'})
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => window.print()}
                      className="h-8 px-3 bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] rounded-lg font-semibold cursor-pointer"
                    >
                      Print Receipt
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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs text-[#64748B] font-medium mb-1">
            Front Desk Operations &gt; <span className="text-[#0B1C30] font-semibold">Lobby Check-In Desk</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-[#0B1C30]">
            Receptionist &amp; Patient Check-In Portal
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            Verify Fast-Track QR passes, process copay settlements, and assign clinical exam rooms.
          </p>
        </div>
        <button
          onClick={onQuickBook}
          className="h-9 px-4 bg-[#006B5F] hover:bg-[#005048] text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Register Walk-In Visit</span>
        </button>
      </div>

      {/* Fast-Track QR Kiosk Verification */}
      <form
        onSubmit={handleScanLookup}
        className="bg-white border border-[#E2E8F0] rounded-xl p-5 clinical-shadow flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
      >
        <div className="flex items-center gap-2 text-xs font-bold text-[#002541] shrink-0">
          <QrCode className="w-5 h-5 text-[#006B5F]" />
          <span>Fast-Track Pass Scanner:</span>
        </div>
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={passCode}
            onChange={(e) => setPassCode(e.target.value)}
            placeholder="Scan or enter pass code (e.g. PID-88420-APT94)..."
            className="w-full h-9 pl-9 pr-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs font-mono-tabular"
          />
        </div>
        <button
          type="submit"
          className="h-9 px-4 bg-[#002541] text-white rounded-lg text-xs font-semibold cursor-pointer"
        >
          Verify Pass
        </button>
      </form>

      {scanResult && (
        <div className="p-3.5 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] text-xs font-semibold text-[#006B5F] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{scanResult}</span>
        </div>
      )}

      {/* Check-In Queue Table */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden clinical-shadow">
        <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
          <h2 className="font-display text-base font-bold text-[#0B1C30]">
            Lobby Arrival &amp; Copay Settlement Queue
          </h2>
          <span className="text-xs font-semibold text-[#006B5F]">
            {appointments.length} Scheduled Today
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Patient</th>
                <th className="py-3 px-4">Physician</th>
                <th className="py-3 px-4">Slot</th>
                <th className="py-3 px-4">Copay</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Front Desk Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {appointments.map((apt) => (
                <tr key={apt.id} className="hover:bg-[#F8FAFC]">
                  <td className="py-3 px-4 font-bold text-[#0B1C30]">
                    {apt.patientName}
                    <div className="text-[10px] font-mono-tabular text-[#64748B]">
                      {apt.patientPid}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-[#42474E]">{apt.doctorName}</td>
                  <td className="py-3 px-4 font-mono-tabular">
                    {apt.appointmentDate} • {apt.appointmentTime}
                  </td>
                  <td className="py-3 px-4 font-mono-tabular">
                    <span className="inline-flex items-center gap-1 text-[#006B5F] font-semibold">
                      <CreditCard className="w-3.5 h-3.5" /> ${apt.copayAmount}.00 (Paid)
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full bg-[#EFF4FF] text-[#002541] font-semibold">
                      {apt.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {apt.status === 'scheduled' ? (
                      <button
                        onClick={() => onCheckIn(apt.id)}
                        className="h-8 px-3 bg-[#006B5F] hover:bg-[#005048] text-white rounded-lg font-semibold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Check In Patient</span>
                      </button>
                    ) : (
                      <span className="text-[#64748B] font-medium">Processed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
