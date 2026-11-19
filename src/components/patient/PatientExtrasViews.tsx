import React, { useState } from 'react';
import {
  CheckCircle2,
  Download,
  FileText,
  FlaskConical,
  HelpCircle,
  MessageSquare,
  PhoneCall,
  Pill,
  Plus,
  Send,
  ShieldCheck,
  UploadCloud,
} from 'lucide-react';
import {
  MedicalRecordItem,
  PrescriptionRecord,
  UserProfile,
} from '../../types/medicure';

export const MedicalRecordsView: React.FC<{
  records: MedicalRecordItem[];
  onUploadRecord: (title: string, summary: string) => Promise<void>;
}> = ({ records, onUploadRecord }) => {
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !summary.trim()) return;
    setUploading(true);
    try {
      await onUploadRecord(title.trim(), summary.trim());
      setTitle('');
      setSummary('');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#0B1C30]">
            Medical Records &amp; Lab Reports
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            Verified diagnostic imaging, laboratory panels, and patient-uploaded external records.
          </p>
        </div>
        <span className="px-3 py-1 rounded-full bg-[#ECFDF5] text-[#006B5F] text-xs font-semibold">
          FHIR v4 Synchronized
        </span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <div className="xl:col-span-8 space-y-4">
          {records.map((rec) => (
            <div
              key={rec.id}
              className="bg-white border border-[#E2E8F0] rounded-xl p-5 clinical-shadow space-y-3"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#EFF4FF] text-[#002541] flex items-center justify-center shrink-0">
                    <FlaskConical className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-display text-base font-bold text-[#0B1C30]">
                      {rec.title}
                    </h2>
                    <div className="text-xs text-[#64748B]">
                      {rec.category} • {rec.providerName} • {rec.dateLabel}
                    </div>
                  </div>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase ${
                    rec.status === 'normal'
                      ? 'bg-[#ECFDF5] text-[#006B5F]'
                      : rec.status === 'critical'
                      ? 'bg-[#FEF2F2] text-[#DC2626]'
                      : 'bg-[#FFFBEB] text-[#D97706]'
                  }`}
                >
                  {rec.status}
                </span>
              </div>

              <p className="text-xs text-[#42474E] leading-relaxed">{rec.summary}</p>

              {rec.metrics && rec.metrics.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {rec.metrics.map((m) => (
                    <span
                      key={m}
                      className="px-2.5 py-1 rounded-md bg-[#F8FAFC] border border-[#E2E8F0] text-[11px] font-mono-tabular font-medium text-[#0B1C30]"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              )}

              <div className="pt-2 border-t border-[#E2E8F0] flex justify-end">
                <button
                  onClick={() => window.print()}
                  className="h-8 px-3 bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] rounded-lg text-xs font-semibold text-[#0B1C30] inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Print / Save Report</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        <form
          onSubmit={handleUpload}
          className="xl:col-span-4 bg-white border border-[#E2E8F0] rounded-xl p-5 clinical-shadow space-y-4"
        >
          <div className="flex items-center gap-2">
            <UploadCloud className="w-4 h-4 text-[#006B5F]" />
            <h3 className="font-display text-sm font-bold text-[#0B1C30]">
              Upload External Diagnostic Note
            </h3>
          </div>
          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-[#0B1C30] mb-1">Report Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Outside Lipid Panel PDF"
                className="w-full h-9 px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#0B1C30] mb-1">Clinical Summary</label>
              <textarea
                rows={3}
                required
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Notes for attending physician review..."
                className="w-full p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={uploading}
            className="w-full h-9 bg-[#002541] hover:bg-[#123B5D] text-white rounded-lg text-xs font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{uploading ? 'Syncing to EHR...' : 'Add to Medical Records'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export const PrescriptionsView: React.FC<{
  prescriptions: PrescriptionRecord[];
  onRequestRefill: (id: string) => Promise<void>;
}> = ({ prescriptions, onRequestRefill }) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#0B1C30]">
            Active Prescriptions &amp; e-Rx Refills
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            Manage current medications, pharmacy routing, and submit one-click refill authorizations.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {prescriptions.map((rx) => (
          <div
            key={rx.id}
            className="bg-white border border-[#E2E8F0] rounded-xl p-5 clinical-shadow flex flex-col justify-between gap-4"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#F0FDFA] text-[#006B5F] flex items-center justify-center">
                    <Pill className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-display text-base font-bold text-[#0B1C30]">
                      {rx.medicationName}
                    </h2>
                    <div className="text-xs text-[#64748B]">
                      {rx.dosage} • {rx.frequency}
                    </div>
                  </div>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    rx.status === 'active' || rx.status === 'approved'
                      ? 'bg-[#ECFDF5] text-[#006B5F]'
                      : 'bg-[#FFFBEB] text-[#D97706]'
                  }`}
                >
                  {rx.status.replace('-', ' ')}
                </span>
              </div>

              <div className="mt-4 pt-3 border-t border-[#E2E8F0] grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[#64748B]">Prescriber:</span>
                  <div className="font-semibold text-[#0B1C30]">{rx.prescriberName}</div>
                </div>
                <div>
                  <span className="text-[#64748B]">Pharmacy:</span>
                  <div className="font-semibold text-[#0B1C30]">{rx.pharmacy}</div>
                </div>
                <div>
                  <span className="text-[#64748B]">Refills Left:</span>
                  <div className="font-bold font-mono-tabular text-[#0B1C30]">
                    {rx.refillsRemaining}
                  </div>
                </div>
                <div>
                  <span className="text-[#64748B]">Next Refill Due:</span>
                  <div className="font-semibold text-[#006B5F]">{rx.nextRefillDue}</div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              {rx.status === 'active' ? (
                <button
                  onClick={() => onRequestRefill(rx.id)}
                  className="h-9 px-4 bg-[#006B5F] hover:bg-[#005048] text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Request Refill Authorization
                </button>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#006B5F]">
                  <CheckCircle2 className="w-4 h-4" />
                  {rx.status === 'refill-requested' ? 'Pending Physician Sign-Off' : 'Refill Approved'}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const MessagesView: React.FC = () => {
  const [messages, setMessages] = useState([
    {
      id: 'm1',
      sender: 'Dr. Sarah Jenkins Care Team',
      time: 'Today, 9:15 AM',
      body: 'Reminder: Please maintain an 8-hour water-only fast prior to your 10:30 AM Cardiology lipid panel tomorrow.',
    },
    {
      id: 'm2',
      sender: 'MediCure Pharmacy Main',
      time: 'Oct 18, 4:20 PM',
      body: 'Your Lisinopril 10mg 90-day supply is verified and eligible for express refill.',
    },
  ]);
  const [draft, setDraft] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    setMessages((prev) => [
      ...prev,
      { id: `m-${Date.now()}`, sender: 'You (Patient)', time: 'Just now', body: draft.trim() },
    ]);
    setDraft('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-[#0B1C30]">
          Messages &amp; Care Team Alerts
        </h1>
        <p className="text-sm text-[#64748B] mt-1">
          HIPAA-encrypted direct messaging with your attending physicians and nursing desk.
        </p>
      </div>

      <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 clinical-shadow space-y-4">
        <div className="space-y-3">
          {messages.map((m) => (
            <div key={m.id} className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-[#002541] flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-[#006B5F]" />
                  {m.sender}
                </span>
                <span className="text-[#64748B]">{m.time}</span>
              </div>
              <p className="text-xs text-[#42474E] leading-relaxed">{m.body}</p>
            </div>
          ))}
        </div>

        <form onSubmit={handleSend} className="flex gap-2 pt-2 border-t border-[#E2E8F0]">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Write a secure message to Dr. Sarah Jenkins's care team..."
            className="flex-1 h-10 px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs"
          />
          <button
            type="submit"
            className="h-10 px-4 bg-[#002541] text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export const SettingsSupportView: React.FC<{
  mode: 'settings' | 'help';
  userProfile: UserProfile | null;
  onUpdateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}> = ({ mode, userProfile, onUpdateProfile }) => {
  const [phone, setPhone] = useState(userProfile?.phone || '(555) 382-9104');
  const [emergencyContact, setEmergencyContact] = useState(
    userProfile?.emergencyContact || 'Eleanor Wright (Spouse) • +1 (555) 719-2041'
  );
  const [insuranceProvider, setInsuranceProvider] = useState(
    userProfile?.insuranceProvider || 'Aetna Choice POS II'
  );
  const [policyId, setPolicyId] = useState(userProfile?.policyId || 'AET-9948201-01');
  const [allergies, setAllergies] = useState(userProfile?.allergies || 'Penicillin (Anaphylaxis)');
  const [saved, setSaved] = useState(false);

  if (mode === 'help') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#0B1C30]">
            Help &amp; Clinical Support Desk
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            24/7 patient advocacy, technical support, and medical records transfer assistance.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 clinical-shadow space-y-2">
            <PhoneCall className="w-5 h-5 text-[#006B5F]" />
            <h2 className="font-display text-sm font-bold text-[#0B1C30]">24/7 Clinical Triage</h2>
            <p className="text-xs text-[#64748B]">Direct registered nurse hotline for urgent symptom questions.</p>
            <div className="font-mono-tabular text-sm font-bold text-[#002541]">1-800-MEDICURE (Ext. 4)</div>
          </div>
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 clinical-shadow space-y-2">
            <FileText className="w-5 h-5 text-[#002541]" />
            <h2 className="font-display text-sm font-bold text-[#0B1C30]">Medical Records Transfer</h2>
            <p className="text-xs text-[#64748B]">Synchronize records from external hospital networks within 24–48h.</p>
            <div className="font-mono-tabular text-sm font-bold text-[#002541]">1-800-MEDICURE (Ext. 2)</div>
          </div>
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 clinical-shadow space-y-2">
            <HelpCircle className="w-5 h-5 text-[#0284C7]" />
            <h2 className="font-display text-sm font-bold text-[#0B1C30]">IT &amp; Portal Desk</h2>
            <p className="text-xs text-[#64748B]">Telehealth device testing and portal access support.</p>
            <div className="font-mono-tabular text-sm font-bold text-[#002541]">support@medicure.org</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-[#0B1C30]">
          Clinical Profile &amp; Insurance Settings
        </h1>
        <p className="text-sm text-[#64748B] mt-1">
          Update your verified emergency contact, allergy alerts, and active insurance policy.
        </p>
      </div>

      {saved && (
        <div className="p-3 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] text-xs font-semibold text-[#006B5F]">
          Profile and insurance details saved to your EHR.
        </div>
      )}

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          await onUpdateProfile({
            phone,
            emergencyContact,
            insuranceProvider,
            policyId,
            allergies,
          });
          setSaved(true);
        }}
        className="bg-white border border-[#E2E8F0] rounded-xl p-6 clinical-shadow space-y-4 text-xs"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-[#0B1C30] mb-1">Primary Phone</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full h-9 px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg"
            />
          </div>
          <div>
            <label className="block font-semibold text-[#0B1C30] mb-1">Emergency Contact</label>
            <input
              type="text"
              value={emergencyContact}
              onChange={(e) => setEmergencyContact(e.target.value)}
              className="w-full h-9 px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg"
            />
          </div>
          <div>
            <label className="block font-semibold text-[#0B1C30] mb-1">Insurance Carrier</label>
            <input
              type="text"
              value={insuranceProvider}
              onChange={(e) => setInsuranceProvider(e.target.value)}
              className="w-full h-9 px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg"
            />
          </div>
          <div>
            <label className="block font-semibold text-[#0B1C30] mb-1">Policy Member ID</label>
            <input
              type="text"
              value={policyId}
              onChange={(e) => setPolicyId(e.target.value)}
              className="w-full h-9 px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg font-mono-tabular"
            />
          </div>
        </div>
        <div>
          <label className="block font-semibold text-[#0B1C30] mb-1">Critical Allergies</label>
          <input
            type="text"
            value={allergies}
            onChange={(e) => setAllergies(e.target.value)}
            className="w-full h-9 px-3 bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B] rounded-lg font-semibold"
          />
        </div>
        <div className="pt-2 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 text-[#006B5F] font-semibold">
            <ShieldCheck className="w-4 h-4" /> HIPAA Encrypted Profile
          </span>
          <button
            type="submit"
            className="h-9 px-5 bg-[#002541] hover:bg-[#123B5D] text-white rounded-lg font-semibold cursor-pointer"
          >
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
};
