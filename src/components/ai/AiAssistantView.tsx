import React, { useState } from 'react';
import {
  Activity,
  Bot,
  Calendar,
  CheckCircle2,
  Download,
  HeartPulse,
  PhoneCall,
  RotateCcw,
  Send,
  ShieldCheck,
  Sparkles,
  Video,
} from 'lucide-react';
import {
  AiConsultationMessage,
  DoctorProfile,
  UserProfile,
} from '../../types/medicure';
import { ClinicalAvatar, HeadacheSparkline } from '../ClinicalVisuals';

interface AiAssistantViewProps {
  userProfile: UserProfile | null;
  messages: AiConsultationMessage[];
  doctors: DoctorProfile[];
  onSendMessage: (text: string, severity: string) => Promise<void>;
  onBookDoctor: (doctorId: string, mode?: 'in-person' | 'telehealth') => void;
}

const SUGGESTED_INQUIRIES = [
  'Can I take Ibuprofen with Lisinopril?',
  'What do my elevated LDL cholesterol results mean?',
  'Tips for improving deep REM sleep cycles',
  'When should a temple headache be seen in Urgent Care?',
];

export const AiAssistantView: React.FC<AiAssistantViewProps> = ({
  userProfile,
  messages,
  doctors,
  onSendMessage,
  onBookDoctor,
}) => {
  const [input, setInput] = useState('');
  const [severity, setSeverity] = useState('Mild (3/10)');
  const [sending, setSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const firstName = (userProfile?.displayName || 'Patient').split(' ')[0];

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend ?? input).trim();
    if (!query || sending) return;
    setErrorMsg(null);
    if (!textToSend) setInput('');
    setSending(true);
    try {
      await onSendMessage(query, severity);
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : 'Unable to reach Dr. Nova Clinical AI right now.'
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#002541] text-[#6DF5E1] flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-2xl font-bold text-[#0B1C30]">
                Hello {firstName}, I&apos;m Dr. Nova — MediCure AI Assistant
              </h1>
              <span className="px-2 py-0.5 rounded bg-[#ECFDF5] text-[#006B5F] text-[10px] font-bold">
                V4.2 CERTIFIED
              </span>
            </div>
            <p className="text-xs text-[#64748B] mt-1">
              Your 24/7 clinical companion for symptom assessment, medical record inquiries, and instant doctor booking.
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] font-semibold">
              <span className="px-2 py-0.5 rounded bg-[#ECFDF5] text-[#006B5F]">
                AI Active &amp; Medically Supervised
              </span>
              <span className="px-2 py-0.5 rounded bg-[#EFF4FF] text-[#002541]">
                EMR FHIR v4 Synced
              </span>
              <span className="px-2 py-0.5 rounded bg-[#FEF2F2] text-[#DC2626]">
                Emergency Protocol Ready (Dial 911 for acute crises)
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => window.print()}
            className="h-9 px-3.5 bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Summary (PDF)</span>
          </button>
        </div>
      </div>

      {/* Main 12-Col Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left 8 Columns: Chat Workspace */}
        <div className="xl:col-span-8 bg-white border border-[#E2E8F0] rounded-xl overflow-hidden clinical-shadow flex flex-col">
          {/* Chat Banner */}
          <div className="px-5 py-3 bg-[#FAFCFF] border-b border-[#E2E8F0] flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#002541] text-[#6DF5E1] flex items-center justify-center font-bold">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-[#0B1C30]">
                  Nova Clinical AI • <span className="text-[#006B5F]">Active Triage Mode</span>
                </div>
                <div className="text-[11px] text-[#64748B]">
                  Informed by patient EMR telemetry &amp; MediCure clinical guidelines
                </div>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#006B5F]">
              <ShieldCheck className="w-3.5 h-3.5" /> 256-Bit Encrypted Session
            </span>
          </div>

          {/* Messages Stream */}
          <div className="p-5 space-y-4 max-h-[560px] overflow-y-auto bg-[#FAFCFF]">
            {messages.map((msg) => {
              if (msg.sender === 'user') {
                return (
                  <div key={msg.id} className="flex justify-end">
                    <div className="max-w-xl bg-[#002541] text-white rounded-2xl rounded-tr-sm px-4 py-3 text-xs leading-relaxed shadow-xs">
                      <div className="text-[10px] text-[#A6CAF3] mb-1 font-semibold">
                        You ({firstName}) • {msg.severity || 'Clinical Inquiry'}
                      </div>
                      <p>{msg.content}</p>
                    </div>
                  </div>
                );
              }

              return (
                <div key={msg.id} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#006B5F] text-white flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="flex-1 bg-white border border-[#E2E8F0] rounded-2xl rounded-tl-sm p-4 clinical-shadow space-y-3">
                    {msg.triagePriority && (
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#E2E8F0]">
                        <span className="text-xs font-bold text-[#006B5F] flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4" />
                          Triage Result: {msg.triagePriority}
                        </span>
                        {msg.icd10Code && (
                          <span className="px-2 py-0.5 rounded bg-[#F1F5F9] text-[10px] font-mono-tabular font-semibold text-[#42474E]">
                            {msg.icd10Code}
                          </span>
                        )}
                      </div>
                    )}

                    <p className="text-xs text-[#0B1C30] leading-relaxed">{msg.content}</p>

                    {msg.observations && msg.observations.length > 0 && (
                      <div className="p-3 rounded-lg bg-[#F0FDFA] border border-[#CCFBF1] space-y-1">
                        <div className="text-[10px] font-bold text-[#006B5F] uppercase">
                          CLINICAL OBSERVATIONS &amp; RULE-OUTS
                        </div>
                        <ul className="space-y-1 text-xs text-[#00201C]">
                          {msg.observations.map((obs, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#006B5F] shrink-0 mt-0.5" />
                              <span>{obs}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {msg.protocol && msg.protocol.length > 0 && (
                      <div className="space-y-1.5">
                        <div className="text-[10px] font-bold text-[#002541] uppercase">
                          Recommended Immediate Protocol
                        </div>
                        <ul className="space-y-1 text-xs text-[#42474E] list-disc pl-4">
                          {msg.protocol.map((step, idx) => (
                            <li key={idx}>{step}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        onClick={() => onBookDoctor(doctors[0]?.id || 'doc-sarah-jenkins', 'telehealth')}
                        className="h-8 px-3 bg-[#006B5F] hover:bg-[#005048] text-white rounded-lg text-[11px] font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Book Telehealth Consult</span>
                      </button>
                      <button
                        onClick={() => onBookDoctor(doctors[0]?.id || 'doc-sarah-jenkins', 'in-person')}
                        className="h-8 px-3 bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#0B1C30] rounded-lg text-[11px] font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Schedule In-Clinic Visit</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {sending && (
              <div className="flex items-center gap-2 text-xs text-[#006B5F] font-semibold">
                <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                <span>Dr. Nova is analyzing your clinical inquiry and telemetry...</span>
              </div>
            )}
          </div>

          {/* Suggested Inquiries & Composer */}
          <div className="p-4 border-t border-[#E2E8F0] bg-white space-y-3">
            {errorMsg && (
              <div className="p-2.5 rounded-lg bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#DC2626]">
                {errorMsg}
              </div>
            )}

            <div>
              <div className="flex items-center justify-between text-[10px] font-bold text-[#64748B] uppercase mb-1.5">
                <span>SUGGESTED INQUIRIES FOR {firstName.toUpperCase()}</span>
                <span>Tap to ask</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_INQUIRIES.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => handleSend(prompt)}
                    disabled={sending}
                    className="px-2.5 py-1 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#14B8A6] text-[11px] font-medium text-[#002541] cursor-pointer disabled:opacity-50"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="border border-[#E2E8F0] rounded-xl p-2.5 bg-[#FAFCFF] space-y-2"
            >
              <textarea
                rows={2}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Describe your symptoms, medications, or ask a health question..."
                className="w-full bg-transparent text-xs text-[#0B1C30] focus:outline-none resize-none"
              />
              <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#E2E8F0]">
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="h-7 px-2 bg-white border border-[#E2E8F0] rounded-md text-[11px] font-semibold text-[#0B1C30]"
                >
                  <option value="Mild (3/10)">Severity: Mild (3/10)</option>
                  <option value="Moderate (6/10)">Severity: Moderate (6/10)</option>
                  <option value="Severe (8/10)">Severity: Severe (8/10)</option>
                </select>
                <button
                  type="submit"
                  disabled={sending || !input.trim()}
                  className="h-8 px-4 bg-[#002541] hover:bg-[#123B5D] text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <span>Send</span>
                  <Send className="w-3 h-3" />
                </button>
              </div>
            </form>

            <p className="text-[10px] text-[#64748B]">
              MediCure AI provides clinical guidance and triage, not definitive diagnostic decisions. In life-threatening emergencies, call 911 immediately.
            </p>
          </div>
        </div>

        {/* Right 4 Columns: Telemetry & Specialists */}
        <div className="xl:col-span-4 space-y-5">
          {/* Health Telemetry Snapshot */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 clinical-shadow space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-[#006B5F]" />
                <div>
                  <h2 className="font-display text-sm font-bold text-[#0B1C30]">
                    Health Telemetry Snapshot
                  </h2>
                  <p className="text-[10px] text-[#64748B]">Live from Patient EMR &amp; Wearables</p>
                </div>
              </div>
              <span className="w-2 h-2 rounded-full bg-[#10B981]" />
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                <div className="text-[10px] font-bold text-[#64748B] uppercase">BLOOD PRESSURE</div>
                <div className="font-display text-lg font-bold text-[#0B1C30] font-mono-tabular">
                  118/76 <span className="text-[10px] font-normal">mmHg</span>
                </div>
                <div className="text-[10px] font-semibold text-[#006B5F]">Optimal Stage</div>
              </div>
              <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                <div className="text-[10px] font-bold text-[#64748B] uppercase">RESTING HR</div>
                <div className="font-display text-lg font-bold text-[#0B1C30] font-mono-tabular">
                  72 <span className="text-[10px] font-normal">bpm</span>
                </div>
                <div className="text-[10px] font-semibold text-[#006B5F]">Normal Rhythm</div>
              </div>
              <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                <div className="text-[10px] font-bold text-[#64748B] uppercase">WATER INTAKE</div>
                <div className="font-display text-lg font-bold text-[#0B1C30] font-mono-tabular">
                  1.8 <span className="text-[10px] font-normal">/ 2.5L</span>
                </div>
                <div className="text-[10px] text-[#64748B]">72% of Daily Goal</div>
              </div>
              <div className="p-3 rounded-lg bg-[#FEF2F2] border border-[#FECACA]">
                <div className="text-[10px] font-bold text-[#DC2626] uppercase">DAILY SCREEN TIME</div>
                <div className="font-display text-lg font-bold text-[#0B1C30] font-mono-tabular">
                  7h 45m
                </div>
                <div className="text-[10px] font-semibold text-[#DC2626]">Elevated Exposure</div>
              </div>
            </div>

            <div className="pt-2 border-t border-[#E2E8F0]">
              <div className="flex items-center justify-between text-[11px] font-semibold text-[#0B1C30] mb-2">
                <span>7-Day Symptom vs Screen Load</span>
                <span className="text-[#006B5F]">Correlated</span>
              </div>
              <HeadacheSparkline />
            </div>

            <div className="p-3 rounded-lg bg-[#F0FDFA] border border-[#CCFBF1] text-xs">
              <div className="font-bold text-[#006B5F] flex items-center gap-1 mb-0.5">
                <Activity className="w-3.5 h-3.5" /> Health Tip of the Day
              </div>
              <p className="text-[#00201C] leading-relaxed">
                Keep monitor eye level at 20–24 inches. Elevating your gaze slightly prevents neck hyperextension that triggers occipital tension headaches.
              </p>
            </div>
          </div>

          {/* Recommended Specialists */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 clinical-shadow space-y-3">
            <div>
              <h3 className="font-display text-sm font-bold text-[#0B1C30]">
                Recommended Specialists
              </h3>
              <p className="text-[11px] text-[#64748B]">Matched to clinical history &amp; symptoms</p>
            </div>
            <div className="space-y-2.5">
              {doctors.slice(0, 3).map((doc) => (
                <div
                  key={doc.id}
                  className="p-3 rounded-xl border border-[#E2E8F0] flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <ClinicalAvatar avatarKey={doc.avatarKey} name={doc.name} size="sm" />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-[#0B1C30] truncate">{doc.name}</div>
                      <div className="text-[11px] text-[#64748B] truncate">{doc.specialty}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => onBookDoctor(doc.id)}
                    className="h-7 px-2.5 bg-[#006B5F] text-white rounded-md text-[11px] font-semibold shrink-0 cursor-pointer"
                  >
                    Book (${doc.copayFee})
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 24/7 Triage Nurse Line */}
          <div className="bg-[#002541] text-white rounded-xl p-5 clinical-shadow space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold flex items-center gap-1.5">
                <PhoneCall className="w-4 h-4 text-[#6DF5E1]" />
                24/7 Triage Nurse Line
              </span>
              <span className="px-2 py-0.5 rounded bg-[#DC2626] text-white text-[9px] font-bold">
                EMERGENCY PRIORITY
              </span>
            </div>
            <p className="text-xs text-[#DCE9FF] leading-relaxed">
              If symptoms escalate to severe throbbing, sudden visual disturbances, or chest tightness, contact clinical triage immediately.
            </p>
            <div className="p-3 rounded-lg bg-[#123B5D] flex items-center justify-between">
              <div>
                <div className="text-[10px] text-[#A6CAF3] uppercase">DEDICATED HOTLINE</div>
                <div className="font-display text-base font-bold font-mono-tabular">
                  1-800-MEDICURE
                </div>
              </div>
              <span className="px-2 py-0.5 rounded bg-white/10 text-[11px] font-mono-tabular">
                Ext: 4
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
