import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '1mb' }));

  app.post('/api/ai-assistant', async (req, res) => {
    try {
      const { message, severity, patientContext, history } = req.body as {
        message?: string;
        severity?: string;
        patientContext?: {
          name?: string;
          bloodPressure?: string;
          restingHr?: string;
          allergies?: string;
          medications?: string[];
        };
        history?: { sender: string; content: string }[];
      };

      if (!message || typeof message !== 'string' || !message.trim()) {
        return res.status(400).json({ error: 'Symptom description or health question is required.' });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(503).json({
          error: 'GEMINI_API_KEY is not configured in environment secrets.',
        });
      }

      const contextSummary = [
        `Patient: ${patientContext?.name || 'Alexander Wright'}`,
        `Baseline BP: ${patientContext?.bloodPressure || '118/76 mmHg'}`,
        `Resting HR: ${patientContext?.restingHr || '72 bpm'}`,
        `Allergies: ${patientContext?.allergies || 'Penicillin (Anaphylaxis)'}`,
        `Active Medications: ${(patientContext?.medications || ['Lisinopril 10mg', 'Atorvastatin 20mg']).join(', ')}`,
        `Reported Severity: ${severity || 'Mild (3/10)'}`,
      ].join(' | ');

      const conversationHistory = (history || [])
        .slice(-6)
        .map((h) => `${h.sender === 'user' ? 'Patient' : 'Dr. Nova AI'}: ${h.content}`)
        .join('\n');

      const prompt = `
Patient Telemetry & Chart Context:
${contextSummary}

Recent Conversation:
${conversationHistory || 'Initial inquiry.'}

Current Patient Message:
"${message.trim()}"

Provide a concise, empathetic, medically grounded clinical triage assessment and practical next steps. Include a clear non-diagnostic disclaimer inside your summary and advise immediate 911 care if red-flag symptoms are present.
`;

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          systemInstruction:
            'You are Dr. Nova, MediCure Clinical AI Assistant. Respond in clear, calm, evidence-based clinical language suitable for a patient portal. Return structured JSON matching the schema. Keep observations and immediate protocol items concise (max 4 items each, under 180 characters per item).',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              triagePriority: {
                type: Type.STRING,
                description: 'Short triage classification, e.g. Low-Moderate Priority, Routine Guidance, or Urgent Evaluation Recommended.',
              },
              icd10Code: {
                type: Type.STRING,
                description: 'Relevant informational ICD-10 reference code, e.g. ICD-10 G44.2 or Z71.3.',
              },
              summary: {
                type: Type.STRING,
                description: 'Clear 2-4 sentence clinical explanation addressing the patient symptoms or question.',
              },
              observations: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Up to 3 concise clinical observations or red-flag checks.',
              },
              immediateProtocol: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Up to 4 actionable self-care or follow-up steps.',
              },
              recommendedSpecialty: {
                type: Type.STRING,
                description: 'Relevant medical specialty if follow-up is appropriate (e.g. Cardiology, Neurology, General Medicine).',
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

      const rawText = (response.text ?? '{}').trim();
      const parsed = JSON.parse(rawText);
      return res.json(parsed);
    } catch (error: unknown) {
      console.error('AI assistant error:', error);
      const errMessage =
        error instanceof Error ? error.message : 'Unable to process clinical AI request.';
      return res.status(500).json({ error: errMessage });
    }
  });

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

startServer();
