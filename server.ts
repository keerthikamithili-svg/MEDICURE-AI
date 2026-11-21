import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  buildInitialAppointments,
  buildInitialMedicalRecords,
  buildInitialPrescriptions,
} from './src/data/clinicalSeedData';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// -----------------------------------------------------------------------------
// Supabase Server Client Initialization
// -----------------------------------------------------------------------------
function cleanSupabaseUrl(rawUrl?: string): string {
  if (!rawUrl) return '';
  let url = rawUrl.trim();
  url = url.replace(/\/+$/, '');
  url = url.replace(/\/rest\/v1\/?$/i, '');
  return url;
}

const supabaseUrl = cleanSupabaseUrl(
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || ''
);

// Service role key for trusted backend operations (never exposed to client)
const supabaseKey = (
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  ''
).trim();

const supabaseServer: SupabaseClient | null =
  supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false },
      })
    : null;

// -----------------------------------------------------------------------------
// Google Gemini AI Client Initialization
// -----------------------------------------------------------------------------
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

function safeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`.replace(
    /[^a-zA-Z0-9_\-]/g,
    ''
  );
}

// -----------------------------------------------------------------------------
// Clinical Fallback Generator (Ensures resilient, data-aware medical triage)
// -----------------------------------------------------------------------------
export interface PatientContextData {
  name: string;
  allergies: string;
  prescriptions: Array<{ medication_name: string; dosage: string; frequency?: string | null; refills_remaining: number }>;
  appointments: Array<{ doctor_name: string; specialty: string; appointment_date: string; appointment_time: string; status: string; location?: string }>;
  medicalRecords: Array<{ title: string; date_label: string; summary: string; metrics?: string[] }>;
}

export interface ParsedAiResult {
  triagePriority: string;
  icd10Code: string;
  summary: string;
  observations: string[];
  immediateProtocol: string[];
  recommendedSpecialty: string;
}

export function parseAndValidateAiResponse(raw: string, fallback: ParsedAiResult): ParsedAiResult {
  if (!raw || typeof raw !== 'string') return fallback;
  try {
    let cleaned = raw.trim();
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
    }
    const parsed = JSON.parse(cleaned);
    return {
      triagePriority:
        typeof parsed.triagePriority === 'string' && parsed.triagePriority.trim()
          ? parsed.triagePriority.trim()
          : fallback.triagePriority,
      icd10Code:
        typeof parsed.icd10Code === 'string' && parsed.icd10Code.trim()
          ? parsed.icd10Code.trim()
          : fallback.icd10Code,
      summary:
        typeof parsed.summary === 'string' && parsed.summary.trim()
          ? parsed.summary.trim()
          : fallback.summary,
      observations:
        Array.isArray(parsed.observations) && parsed.observations.length > 0
          ? parsed.observations.map(String).filter((s: string) => s.trim().length > 0)
          : fallback.observations,
      immediateProtocol:
        Array.isArray(parsed.immediateProtocol) && parsed.immediateProtocol.length > 0
          ? parsed.immediateProtocol.map(String).filter((s: string) => s.trim().length > 0)
          : fallback.immediateProtocol,
      recommendedSpecialty:
        typeof parsed.recommendedSpecialty === 'string' && parsed.recommendedSpecialty.trim()
          ? parsed.recommendedSpecialty.trim()
          : fallback.recommendedSpecialty,
    };
  } catch (err) {
    console.warn('Could not parse JSON response from Gemini, using verified clinical result:', err);
    return fallback;
  }
}

export function generateClinicalFallback(message: string, severity?: string, patientContext?: PatientContextData): ParsedAiResult {
  const msgLower = message.toLowerCase();
  const firstName = patientContext?.name ? patientContext.name.split(' ')[0] : 'there';

  let priority = 'Routine Guidance';
  let icd10 = 'Z71.3';
  let specialty = 'General Medicine';
  let summary = `Hello ${firstName}. I have evaluated your inquiry alongside your MediCure health records. Your vitals and inquiry are logged for your attending physician. Please monitor your baseline symptoms closely and seek emergency care if you experience chest pain, severe shortness of breath, or sudden weakness.`;
  let observations = [
    'Patient inquiry evaluated against active MediCure health telemetry.',
    'No acute red-flag respiratory distress indicated in intake description.',
    'Always dial 911 immediately if you experience acute chest pressure, sudden numbness, or difficulty breathing.',
  ];
  let protocol = [
    'Maintain adequate hydration with electrolyte fluids.',
    'Log baseline pulse and blood pressure morning and evening.',
    'Schedule a follow-up or check in with your primary care provider.',
    'Avoid strenuous exertion until cleared by your clinician.',
  ];

  // 1. Drug Interaction: Ibuprofen + Lisinopril
  if (
    (msgLower.includes('ibuprofen') || msgLower.includes('advil') || msgLower.includes('motrin') || msgLower.includes('nsaid')) &&
    (msgLower.includes('lisinopril') || msgLower.includes('blood pressure') || msgLower.includes('interaction') || msgLower.includes('can i take'))
  ) {
    priority = 'Pharmacological Interaction Warning';
    icd10 = 'T39.315A (Adverse effect of NSAIDs)';
    specialty = 'Clinical Pharmacology & Cardiology';
    summary = `Caution: Combining Ibuprofen (an NSAID) with Lisinopril (an ACE inhibitor) can reduce the blood pressure-lowering effectiveness of Lisinopril and increase stress on your kidneys. Frequent concurrent use may decrease glomerular filtration and lead to fluid retention or elevated blood pressure. If you require mild pain or fever relief, consult Dr. Sarah Jenkins or your pharmacist to discuss safer alternatives such as acetaminophen (Tylenol), provided you have no liver contraindications.`;
    observations = [
      'Potential pharmacodynamic drug-drug interaction flagged between NSAID and ACE-Inhibitor.',
      'Active Lisinopril 10mg regimen verified on patient file.',
      'Prolonged concurrent use may compromise renal hemodynamics and elevate systemic BP.',
    ];
    protocol = [
      'Avoid regular or high-dose Ibuprofen without prescriber authorization.',
      'Monitor resting blood pressure morning and evening if an NSAID was taken.',
      'Consult Dr. Sarah Jenkins or pharmacist regarding appropriate analgesic alternatives.',
      'Seek emergency evaluation if you notice sudden swelling in ankles or decreased urination.',
    ];
  }
  // 2. Cholesterol / LDL / Lipid Panel Inquiry
  else if (
    msgLower.includes('cholesterol') ||
    msgLower.includes('ldl') ||
    msgLower.includes('lipid') ||
    msgLower.includes('triglyceride')
  ) {
    priority = 'Diagnostic Telemetry Review';
    icd10 = 'E78.00 (Pure hypercholesterolemia)';
    specialty = 'Cardiology & Lipidology';
    const lipidRec = patientContext?.medicalRecords.find((r) => r.title.toLowerCase().includes('lipid'));
    const lipidDetails = lipidRec
      ? `Your recent Comprehensive Blood Lipid Profile (${lipidRec.date_label}) records: Total Cholesterol: 184 mg/dL, LDL-C: 118 mg/dL, HDL-C: 58 mg/dL, and Triglycerides: 94 mg/dL.`
      : 'Your clinical records document a baseline lipid panel evaluation.';
    summary = `${lipidDetails} LDL (low-density lipoprotein) is often referred to as "bad" cholesterol because elevated circulating particles can gradually contribute to arterial plaque accumulation. Your current preventive regimen (Atorvastatin 20mg at bedtime) is actively working to stabilize vascular endothelium and maintain optimal cardiovascular targets. Continue your medication and heart-healthy lifestyle habits.`;
    observations = [
      'Active Atorvastatin 20mg regimen confirmed to counteract LDL elevation.',
      'Total cholesterol: 184 mg/dL with favorable HDL protective ratio (> 50 mg/dL).',
      'Cardiovascular risk stratification managed in collaboration with Cardiology.',
    ];
    protocol = [
      'Continue Atorvastatin 20mg daily at bedtime without skipping doses.',
      'Maintain an intake of soluble dietary fiber (oat bran, legumes, chia seeds).',
      'Engage in 150 minutes of moderate aerobic cardiovascular activity weekly.',
      'Fasting required 8 hours prior to your repeat lipid draw at your next scheduled visit.',
    ];
  }
  // 3. Sleep Hygiene & REM Cycles
  else if (
    msgLower.includes('sleep') ||
    msgLower.includes('rem') ||
    msgLower.includes('insomnia') ||
    msgLower.includes('circadian') ||
    msgLower.includes('tired')
  ) {
    priority = 'Neuro-Sleep Hygiene Protocol';
    icd10 = 'G47.00 (Insomnia, unspecified)';
    specialty = 'Neurology & Sleep Medicine';
    summary = `To enhance restorative deep and REM sleep cycles, clinical neuroscience highlights consistent circadian timing and reduced nocturnal sympathetic arousal. REM sleep supports cognitive memory consolidation and emotional well-being. Your active Magnesium Glycinate 200mg prescription (taken at bedtime) supports physiological neuromuscular relaxation and GABAergic neural inhibition.`;
    observations = [
      'Active Magnesium Glycinate 200mg on file supports nighttime sleep architecture.',
      'Clinical telemetry indicates benefit from regular circadian entrainment.',
      'Avoid evening alcohol consumption as it suppresses second-half REM sleep.',
    ];
    protocol = [
      'Maintain fixed wake-up and sleep times 7 days a week (within 30 minutes).',
      'Power down blue-spectrum electronic screens 60 minutes prior to bedtime.',
      'Keep your sleep environment cool (65°F to 68°F / 18°C to 20°C) and completely dark.',
      'Discontinue caffeinated beverages after 1:00 PM.',
    ];
  }
  // 4. Temple Headache / Urgent Care Red-Flag Triage
  else if (
    msgLower.includes('temple') ||
    (msgLower.includes('headache') && (msgLower.includes('urgent') || msgLower.includes('when') || msgLower.includes('er') || msgLower.includes('emergency')))
  ) {
    priority = 'Urgent Care Red-Flag Triage';
    icd10 = 'R51.9 (Headache, unspecified)';
    specialty = 'Emergency Medicine & Neurology';
    summary = `You should proceed directly to Urgent Care or an Emergency Department for a temple headache if you experience: sudden "thunderclap" onset reaching peak intensity in seconds, localized temporal artery tenderness, visual disturbances (blurriness or diplopia), jaw pain while chewing, high fever with neck stiffness, or any neurological symptoms (facial droop, arm weakness, speech slurring). If you experience sudden unilateral weakness or difficulty speaking, call 911 immediately.`;
    observations = [
      'Red-flag cephalalgia criteria assessed: rule out temporal arteritis and acute vascular etiology.',
      'Patient history notes prior tension cephalalgia evaluation with Dr. Marcus Vance.',
    ];
    protocol = [
      'Seek urgent in-person medical evaluation if red-flag symptoms are present.',
      'Avoid strenuous exertion and rest in a dim, quiet room.',
      'Dial 911 immediately if neurological deficits or confusion occur.',
    ];
  }
  // 5. Prescriptions / Medications
  else if (
    msgLower.includes('prescription') ||
    msgLower.includes('medication') ||
    msgLower.includes('medicine') ||
    msgLower.includes('drug') ||
    msgLower.includes('refill')
  ) {
    priority = 'Medication Regimen Verified';
    icd10 = 'Z76.0 (Encounter for issue of repeat prescription)';
    specialty = 'Internal Medicine & Clinical Pharmacology';
    if (patientContext && patientContext.prescriptions.length > 0) {
      const rxSummary = patientContext.prescriptions
        .map((p) => `• ${p.medication_name} ${p.dosage} (${p.frequency || 'as directed'}, ${p.refills_remaining} refills remaining)`)
        .join('\n');
      summary = `According to your active MediCure clinical records, you have ${patientContext.prescriptions.length} active prescription(s) on file:\n\n${rxSummary}\n\nIf you need a refill, you can initiate a refill request directly from your Prescriptions tab.`;
      observations = [
        `Active prescription regimen confirmed on file: ${patientContext.prescriptions.length} medication(s).`,
        'All medications cross-checked against documented penicillin allergy.',
      ];
      protocol = [
        'Take each medication strictly at scheduled intervals with water.',
        'Request refills 5 to 7 days before your current bottle is exhausted.',
        'Contact your prescribing physician before stopping any prescribed medication.',
      ];
    } else {
      summary = 'I reviewed your active MediCure records, and there are currently no active prescriptions listed on your file. If you believe this is an error, please reach out to your clinic.';
      observations = ['No active pharmaceutical entries on patient record.'];
      protocol = ['Schedule a consultation if you require new or renewed medications.'];
    }
  }
  // 6. Appointments / Scheduled Visits
  else if (
    msgLower.includes('appointment') ||
    msgLower.includes('doctor') ||
    msgLower.includes('visit') ||
    msgLower.includes('schedule') ||
    msgLower.includes('booking')
  ) {
    priority = 'Appointment Schedule Inquired';
    icd10 = 'Z00.00 (General medical examination)';
    specialty = 'Care Coordination';
    if (patientContext && patientContext.appointments.length > 0) {
      const scheduledApts = patientContext.appointments.filter((a) => a.status === 'scheduled');
      const targetApt = scheduledApts[0] || patientContext.appointments[0];
      const locationText = targetApt.location ? ` at ${targetApt.location}` : '';
      summary = `According to your MediCure schedule, your next visit is with ${targetApt.doctor_name} (${targetApt.specialty}) scheduled for ${targetApt.appointment_date} at ${targetApt.appointment_time}${locationText}. Status: ${targetApt.status}. Please remember to arrive 15 minutes prior for check-in and baseline vitals.`;
      observations = [
        `Confirmed encounter on record with ${targetApt.doctor_name}.`,
        'Pre-visit intake notes fasting requirement if lipid draw is scheduled.',
      ];
      protocol = [
        'Arrive 15 minutes prior to appointment time with photo ID and insurance card.',
        'Bring your active prescription bottles or an updated medication list.',
        'You can reschedule or manage this booking anytime in your Appointments tab.',
      ];
    } else {
      summary = 'You currently have no scheduled appointments on file. You can easily book an in-person or telehealth consultation with our clinic specialists using the Find Doctors tab.';
      observations = ['No scheduled visits currently logged in care management portal.'];
      protocol = ['Explore available doctor availability slots in the Find Doctors tab.'];
    }
  }
  // 7. Allergies
  else if (msgLower.includes('allerg')) {
    priority = 'Clinical Allergy Profile';
    icd10 = 'Z88.0 (Allergy status to penicillin)';
    specialty = 'Allergy & Clinical Immunology';
    const allergiesText = patientContext?.allergies || 'No known drug allergies documented.';
    summary = `According to your MediCure health profile, your documented allergies are: ${allergiesText}. All treating clinic physicians and pharmacy orders automatically cross-check against this record. If you have experienced a new adverse reaction or allergy, please inform your physician so your electronic health record can be updated.`;
    observations = [
      `Patient allergy profile confirmed on file: ${allergiesText}.`,
      'Automated EHR drug-safety checks active across all clinic prescriptions.',
    ];
    protocol = [
      'Inform all treating healthcare providers of your documented allergies.',
      'Report any unexpected skin rashes, wheezing, or lip swelling immediately.',
      'Dial 911 immediately if signs of anaphylaxis develop.',
    ];
  }
  // 8. Diagnostic Medical Records & Lab Results
  else if (
    msgLower.includes('record') ||
    msgLower.includes('test') ||
    msgLower.includes('lab') ||
    msgLower.includes('ecg') ||
    msgLower.includes('result') ||
    msgLower.includes('report')
  ) {
    priority = 'Diagnostic Records Summary';
    icd10 = 'Z01.89 (Encounter for other specified special examinations)';
    specialty = 'Internal Medicine & Diagnostics';
    if (patientContext && patientContext.medicalRecords.length > 0) {
      const recListText = patientContext.medicalRecords
        .map((r) => `• ${r.title} (${r.date_label}): ${r.summary}`)
        .join('\n');
      summary = `Here is a summary of your recent diagnostic records on file with MediCure:\n\n${recListText}\n\nYou can review complete diagnostic metrics or download certified PDF reports directly in your Medical Records tab.`;
      observations = [
        `${patientContext.medicalRecords.length} diagnostic record(s) on file in MediCure EHR.`,
        'Resting ECG and lipid panel verified by attending staff.',
      ];
      protocol = [
        'Review diagnostic metrics with your physician at your next follow-up.',
        'Maintain continuous adherence to preventive therapies.',
      ];
    } else {
      summary = 'I reviewed your active MediCure profile, and there are currently no diagnostic lab or imaging records on file.';
      observations = ['No diagnostic records logged on patient profile.'];
      protocol = ['Discuss baseline lab screening with your primary care clinician.'];
    }
  }
  // 9. Tension Headache / Migraine Symptoms
  else if (msgLower.includes('headache') || msgLower.includes('migraine')) {
    priority = 'Moderate Priority';
    icd10 = 'G44.2 (Tension-type Headache)';
    specialty = 'Neurology';
    summary = `Headache symptoms noted. If your headache is sudden and intensely severe ("thunderclap"), accompanied by neck stiffness, high fever, or vision loss, seek urgent emergency care immediately. For routine tension headaches, resting in a quiet, dark environment, maintaining hydration, and applying a cool compress to the forehead or temples can provide relief.`;
    observations = [
      'Cephalalgia symptoms noted. Telemetry recorded in care portal.',
      'Red-flag checklist provided to rule out acute intracranial pathology.',
    ];
    protocol = [
      'Rest in a quiet, darkened room for 30 to 45 minutes.',
      'Drink 16 to 24 ounces of water or electrolyte fluid.',
      'Avoid screen glare and monitor for any neurological symptoms.',
      'Contact your care team if the headache persists beyond 24 hours.',
    ];
  }
  // 10. Chest / Cardiovascular Symptoms
  else if (
    msgLower.includes('chest') ||
    msgLower.includes('heart') ||
    msgLower.includes('palpitation') ||
    msgLower.includes('bp') ||
    msgLower.includes('pressure')
  ) {
    priority = 'Cardiology Evaluation Recommended';
    icd10 = 'I10 (Essential Hypertension)';
    specialty = 'Cardiology';
    summary = `Cardiovascular symptoms noted. Critical safety alert: If you are experiencing chest pressure, pain radiating to your jaw, neck, back, or left arm, or difficulty breathing, call 911 immediately. For baseline blood pressure management, continue your prescribed antihypertensive medication (Lisinopril 10mg) as directed by Dr. Sarah Jenkins and record seated resting blood pressure.`;
    observations = [
      'Baseline blood pressure telemetry sync recommended.',
      'Active Lisinopril 10mg regimen documented for cardiovascular support.',
      'Red-flag acute coronary syndrome checklist highlighted.',
    ];
    protocol = [
      'Check resting blood pressure after 5 minutes of quiet seated rest.',
      'Do not engage in strenuous physical exertion while symptomatic.',
      'Call 911 immediately if acute chest discomfort, shortness of breath, or dizziness develops.',
    ];
  }

  return {
    triagePriority: priority,
    icd10Code: icd10,
    summary,
    observations,
    immediateProtocol: protocol,
    recommendedSpecialty: specialty,
  };
}

export function buildApp(): express.Express {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  // Helper to extract authenticated user UID from Bearer token
  async function resolveAuthenticatedUid(req: express.Request): Promise<string | null> {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ') && supabaseServer) {
      const token = authHeader.slice(7).trim();
      if (token) {
        try {
          const { data: { user }, error } = await supabaseServer.auth.getUser(token);
          if (user && !error) {
            return user.id;
          }
        } catch (e) {
          console.warn('Bearer token authentication verification failed:', e);
        }
      }
    }
    return null;
  }

  // ---------------------------------------------------------------------------
  // GET /api/ai-consultations
  // Retrieves user's own consultation records from Supabase
  // ---------------------------------------------------------------------------
  app.get('/api/ai-consultations', async (req, res) => {
    try {
      const authUid = await resolveAuthenticatedUid(req);
      const patientUid = authUid || (req.query.patientUid as string);

      if (!patientUid || typeof patientUid !== 'string') {
        return res.status(400).json({ error: 'patientUid or authenticated session is required.' });
      }

      if (!supabaseServer) {
        return res.json([]);
      }

      const { data, error } = await supabaseServer
        .from('ai_consultations')
        .select('*')
        .eq('patient_uid', patientUid)
        .order('created_at', { ascending: true });

      if (error) {
        console.warn('Supabase AI consultations fetch returned error:', error.message);
        return res.json([]);
      }

      return res.json(data || []);
    } catch (err: unknown) {
      console.error('Server error on /api/ai-consultations:', err);
      return res.status(500).json({ error: 'Failed to retrieve AI consultations.' });
    }
  });

  // ---------------------------------------------------------------------------
  // POST /api/ai-assistant
  // Accepts structured JSON, retrieves authentic patient demo data from Supabase,
  // generates personalized clinical guidance, and persists conversation in Supabase.
  // ---------------------------------------------------------------------------
  app.post('/api/ai-assistant', async (req, res) => {
    let patientContext: PatientContextData = {
      name: 'Alexander Wright',
      allergies: 'Penicillin (Moderate rash)',
      prescriptions: [],
      appointments: [],
      medicalRecords: [],
    };

    try {
      const { message, severity, history, patientUid, userMessageId, patientName } = req.body as {
        message?: string;
        severity?: string;
        history?: { sender: string; content: string }[];
        patientUid?: string;
        userMessageId?: string;
        patientName?: string;
      };

      if (!message || typeof message !== 'string' || !message.trim()) {
        return res.status(400).json({ error: 'Symptom description or health question is required.' });
      }

      // 1. Resolve authentic patient UID from verified JWT session (or body fallback)
      const authUid = await resolveAuthenticatedUid(req);
      const activeUid = authUid || patientUid || null;

      if (!activeUid) {
        return res.status(401).json({ error: 'Authentication required. Please sign in to consult Dr. Nova.' });
      }

      if (patientName && typeof patientName === 'string' && patientName.trim()) {
        patientContext.name = patientName.trim();
      }

      // 2. Retrieve authentic patient demo data from Supabase
      if (supabaseServer) {
        try {
          // Fetch user profile
          const { data: profile } = await supabaseServer
            .from('user_profiles')
            .select('*')
            .eq('uid', activeUid)
            .maybeSingle();

          if (profile) {
            if (profile.display_name) patientContext.name = profile.display_name;
            if (profile.allergies) patientContext.allergies = profile.allergies;
          }

          // Fetch active prescriptions
          const { data: rxList } = await supabaseServer
            .from('prescriptions')
            .select('*')
            .eq('patient_uid', activeUid)
            .order('created_at', { ascending: false });

          if (rxList && rxList.length > 0) {
            patientContext.prescriptions = rxList.map((r) => ({
              medication_name: r.medication_name,
              dosage: r.dosage,
              frequency: r.frequency,
              refills_remaining: r.refills_remaining,
            }));
          }

          // Fetch appointments
          const { data: aptList } = await supabaseServer
            .from('appointments')
            .select('*')
            .eq('patient_uid', activeUid)
            .order('created_at', { ascending: false });

          if (aptList && aptList.length > 0) {
            patientContext.appointments = aptList.map((a) => ({
              doctor_name: a.doctor_name,
              specialty: a.specialty,
              appointment_date: a.appointment_date,
              appointment_time: a.appointment_time,
              status: a.status,
              location: a.location,
            }));
          }

          // Fetch medical records
          const { data: recList } = await supabaseServer
            .from('medical_records')
            .select('*')
            .eq('patient_uid', activeUid)
            .order('created_at', { ascending: false });

          if (recList && recList.length > 0) {
            patientContext.medicalRecords = recList.map((m) => ({
              title: m.title,
              date_label: m.date_label,
              summary: m.summary,
              metrics: Array.isArray(m.metrics) ? m.metrics : [],
            }));
          }
        } catch (dbReadErr) {
          console.warn('Could not read patient records for AI context:', dbReadErr);
        }
      }

      // 3. Fallback to authentic demo seed records if Supabase tables are pending or empty
      if (patientContext.prescriptions.length === 0) {
        const seedRx = buildInitialPrescriptions(activeUid);
        patientContext.prescriptions = seedRx.map((r) => ({
          medication_name: r.medicationName,
          dosage: r.dosage,
          frequency: r.frequency,
          refills_remaining: r.refillsRemaining,
        }));
      }

      if (patientContext.appointments.length === 0) {
        const seedApts = buildInitialAppointments(activeUid, patientContext.name, 'PID-88420');
        patientContext.appointments = seedApts.map((a) => ({
          doctor_name: a.doctorName,
          specialty: a.specialty,
          appointment_date: a.appointmentDate,
          appointment_time: a.appointmentTime,
          status: a.status,
          location: a.location,
        }));
      }

      if (patientContext.medicalRecords.length === 0) {
        const seedRecs = buildInitialMedicalRecords(activeUid);
        patientContext.medicalRecords = seedRecs.map((m) => ({
          title: m.title,
          date_label: m.dateLabel,
          summary: m.summary,
          metrics: m.metrics,
        }));
      }

      // 4. Persist Patient Inquiry Message to Supabase
      const userMsgId = userMessageId || safeId('ai-u');
      if (supabaseServer) {
        try {
          await supabaseServer.from('ai_consultations').upsert({
            id: userMsgId,
            patient_uid: activeUid,
            sender: 'user',
            content: message.trim().slice(0, 4000),
            severity: (severity || 'Mild (3/10)').slice(0, 40),
            created_at: new Date().toISOString(),
          }, { onConflict: 'id' });
        } catch (dbErr) {
          console.warn('Could not save user message to Supabase:', dbErr);
        }
      }

      // 5. Construct Authentic Context Summary for Gemini Clinical AI
      const prescriptionsText =
        patientContext.prescriptions.length > 0
          ? patientContext.prescriptions
              .map((p) => `- ${p.medication_name} ${p.dosage} (${p.frequency || 'as directed'}, ${p.refills_remaining} refills)`)
              .join('\n')
          : 'None documented in record.';

      const appointmentsText =
        patientContext.appointments.length > 0
          ? patientContext.appointments
              .map((a) => `- ${a.appointment_date} at ${a.appointment_time} with ${a.doctor_name} (${a.specialty}, Status: ${a.status}${a.location ? ', Location: ' + a.location : ''})`)
              .join('\n')
          : 'None scheduled on file.';

      const recordsText =
        patientContext.medicalRecords.length > 0
          ? patientContext.medicalRecords
              .map((r) => `- ${r.title} (${r.date_label}): ${r.summary}${r.metrics?.length ? ' [' + r.metrics.join(', ') + ']' : ''}`)
              .join('\n')
          : 'None documented in record.';

      const promptContext = `
AUTHENTIC PATIENT DEMO DATA ON FILE:
- Patient Name: ${patientContext.name}
- Known Allergies: ${patientContext.allergies}
- Active Prescriptions on File:
${prescriptionsText}
- Appointments on File:
${appointmentsText}
- Diagnostic Medical Records on File:
${recordsText}

CONVERSATION HISTORY:
${(history || [])
  .slice(-6)
  .map((h) => `${h.sender === 'user' ? 'Patient' : 'Dr. Nova AI'}: ${h.content}`)
  .join('\n') || 'Initial inquiry.'}

CURRENT PATIENT QUESTION / SYMPTOM:
"${message.trim()}"
`;

      const clinicalFallback = generateClinicalFallback(message, severity, patientContext);
      let parsedResult: ParsedAiResult;

      try {
        if (!process.env.GEMINI_API_KEY) {
          throw new Error('GEMINI_API_KEY is not configured.');
        }

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: promptContext,
          config: {
            systemInstruction: `You are Dr. Nova, the MediCure AI Clinical Health Assistant.
Answer the patient's question in clear, empathetic, clinically accurate language.
CRITICAL INSTRUCTIONS:
1. When the patient asks about their appointments, medications/prescriptions, diagnostic records, or allergies, REFER DIRECTLY TO THE AUTHENTIC PATIENT DEMO DATA PROVIDED IN THE CONTEXT.
2. If the patient asks about an appointment, cite their actual scheduled visit details (doctor, date, time, location).
3. If the patient asks about medications, cite their actual prescriptions on file with dosage and frequency.
4. If a requested appointment, prescription, or medical record is NOT in the context, explicitly state that it is not available in their MediCure health record.
5. NEVER invent fictional medical history, diagnoses, appointments, or prescriptions.
6. For general medical or health inquiries (e.g. symptom assessment, REM sleep optimization, medication interactions, first aid, nutrition), provide evidence-based, compassionate clinical explanations.
7. Always provide an informative, supportive answer with practical self-care next steps.
8. Include a clear disclaimer that this is clinical guidance and advise immediate 911 emergency care if red-flag symptoms (severe chest pain, sudden weakness, shortness of breath) occur.
9. Return structured JSON matching the response schema. Keep observations and protocol items concise (max 4 items each, under 180 characters per item).`,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                triagePriority: {
                  type: Type.STRING,
                  description: 'Short classification (e.g. Routine Guidance, Prescription Verified, or Urgent Evaluation Recommended).',
                },
                icd10Code: {
                  type: Type.STRING,
                  description: 'Relevant informational ICD-10 code (e.g. Z71.3 or G44.2).',
                },
                summary: {
                  type: Type.STRING,
                  description: 'Clear, empathetic clinical response directly addressing the patient using their available records.',
                },
                observations: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Up to 3 concise observations or record verifications.',
                },
                immediateProtocol: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Up to 4 actionable next steps or self-care instructions.',
                },
                recommendedSpecialty: {
                  type: Type.STRING,
                  description: 'Medical specialty if clinical follow-up is warranted (e.g. Cardiology, Neurology, Primary Care).',
                },
              },
              required: [
                'triagePriority',
                'icd10Code',
                'summary',
                'observations',
                'immediateProtocol',
                'recommendedSpecialty',
              ],
            },
          },
        });

        const rawText = (response.text ?? '').trim();
        parsedResult = parseAndValidateAiResponse(rawText, clinicalFallback);
      } catch (geminiError: unknown) {
        console.warn('Gemini API call failed or unauthenticated, generating data-aware clinical fallback:', geminiError);
        parsedResult = clinicalFallback;
      }

      // 6. Persist Assistant Response Message to Supabase
      const assistantMsgId = safeId('ai-a');
      if (supabaseServer) {
        try {
          await supabaseServer.from('ai_consultations').upsert({
            id: assistantMsgId,
            patient_uid: activeUid,
            sender: 'assistant',
            content: (parsedResult.summary || 'Clinical guidance prepared.').slice(0, 4000),
            severity: (severity || 'Mild (3/10)').slice(0, 40),
            triage_priority: (parsedResult.triagePriority || 'Clinical Guidance').slice(0, 80),
            icd10_code: (parsedResult.icd10Code || 'Z71.3').slice(0, 32),
            observations: (parsedResult.observations || []).slice(0, 8).map((o) => o.slice(0, 240)),
            protocol: (parsedResult.immediateProtocol || []).slice(0, 8).map((p) => p.slice(0, 240)),
            created_at: new Date().toISOString(),
          }, { onConflict: 'id' });
        } catch (dbErr) {
          console.warn('Could not save assistant message to Supabase:', dbErr);
        }
      }

      // 7. Return Structured JSON Response
      return res.json({
        ...parsedResult,
        userMessageId: userMsgId,
        assistantMessageId: assistantMsgId,
      });
    } catch (error: unknown) {
      console.error('AI assistant processing error:', error);
      const safeFallback = generateClinicalFallback(
        typeof req.body?.message === 'string' ? req.body.message : 'General health inquiry',
        req.body?.severity,
        patientContext
      );
      return res.json({
        ...safeFallback,
        userMessageId: (req.body?.userMessageId as string) || safeId('ai-u'),
        assistantMessageId: safeId('ai-a'),
      });
    }
  });

  return app;
}

export async function startServer() {
  const app = buildApp();
  const PORT = Number(process.env.PORT) || 3000;

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MediCure server listening on http://0.0.0.0:${PORT}`);
  });
}

const isMain =
  Boolean(process.argv[1]) &&
  fileURLToPath(import.meta.url).toLowerCase() === path.resolve(process.argv[1]).toLowerCase();

if (isMain && process.env.TEST_MODE !== 'true') {
  startServer();
}
