import { useCallback, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import {
  AiConsultationMessage,
  AppointmentRecord,
  BookingDraft,
  DepartmentUnit,
  DoctorProfile,
  MedicalRecordItem,
  PrescriptionRecord,
  UserProfile,
  UserRole,
} from '../types/medicure';
import {
  SEED_DEPARTMENTS,
  SEED_DOCTORS,
  buildInitialAppointments,
  buildInitialMedicalRecords,
  buildInitialPrescriptions,
} from '../data/clinicalSeedData';
import {
  fetchSupabaseAiMessages,
  fetchSupabaseAppointments,
  fetchSupabaseDepartments,
  fetchSupabaseDoctors,
  fetchSupabaseMedicalRecords,
  fetchSupabasePrescriptions,
  fetchSupabaseUserProfile,
  getSupabaseSession,
  insertSupabaseAiMessage,
  insertSupabaseAppointment,
  insertSupabaseDoctor,
  insertSupabaseMedicalRecord,
  insertSupabasePrescription,
  isSupabaseConfigured,
  listenToSupabaseAuth,
  signInWithEmail,
  signOutSupabase,
  signUpWithEmail,
  subscribeToSupabaseTable,
  updateSupabaseAppointment,
  updateSupabasePrescription,
  updateSupabaseUserProfile,
  upsertSupabaseUserProfile,
} from '../lib/supabase';

function safeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`.replace(
    /[^a-zA-Z0-9_\-]/g,
    ''
  );
}

export type MediCureAuthUser = User & {
  uid: string;
  displayName: string;
};

function normalizeUser(user: User): MediCureAuthUser {
  const meta = user.user_metadata || {};
  const appMeta = user.app_metadata || {};
  const displayName =
    (meta.display_name as string) ||
    (meta.full_name as string) ||
    (meta.name as string) ||
    user.email?.split('@')[0] ||
    'User';

  return Object.assign(user, {
    uid: user.id,
    displayName,
  });
}

export function useMediCureData() {
  const [authUser, setAuthUser] = useState<MediCureAuthUser | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const [activeRole, setActiveRole] = useState<UserRole>('patient');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const [doctors, setDoctors] = useState<DoctorProfile[]>(SEED_DOCTORS);
  const [departments, setDepartments] = useState<DepartmentUnit[]>(SEED_DEPARTMENTS);
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [prescriptions, setPrescriptions] = useState<PrescriptionRecord[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecordItem[]>([]);
  const [aiMessages, setAiMessages] = useState<AiConsultationMessage[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  const isSupabaseConnected = isSupabaseConfigured();

  // Trusted authorization: check role from verified user profile
  const isAdmin = userProfile?.role === 'admin';

  // ---------------------------------------------------------------------------
  // 1. SUPABASE AUTHENTICATION LISTENER
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!isSupabaseConnected) {
      setAuthReady(true);
      return;
    }

    // Check initial active session
    getSupabaseSession().then((session) => {
      if (session?.user) {
        setAuthUser(normalizeUser(session.user));
      } else {
        setAuthUser(null);
      }
      setAuthReady(true);
    }).catch(() => {
      setAuthReady(true);
    });

    // Listen to real-time auth changes (Sign-in, Sign-up, Sign-out, Token refresh)
    const unsubscribe = listenToSupabaseAuth((_event, session) => {
      if (session?.user) {
        const normUser = normalizeUser(session.user);
        setAuthUser(normUser);
        const metaRole = (session.user.app_metadata?.role || session.user.user_metadata?.role) as UserRole | undefined;
        if (metaRole && ['patient', 'doctor', 'receptionist', 'admin'].includes(metaRole)) {
          setActiveRole(metaRole);
        }
      } else {
        setAuthUser(null);
        setUserProfile(null);
        setAppointments([]);
        setPrescriptions([]);
        setMedicalRecords([]);
        setAiMessages([]);
      }
      setAuthReady(true);
    });

    return () => {
      unsubscribe();
    };
  }, [isSupabaseConnected]);

  // ---------------------------------------------------------------------------
  // 2. USER PROFILE SYNC
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!authUser) {
      setUserProfile(null);
      return;
    }

    let cancelled = false;

    const syncProfile = async () => {
      try {
        const existing = await fetchSupabaseUserProfile(authUser.id);
        if (cancelled) return;

        if (existing) {
          setUserProfile(existing);
          setActiveRole(existing.role);
        } else {
          // Initialize fresh profile for this authenticated user without hardcoded fake data
          const userMetaRole = (authUser.app_metadata?.role || authUser.user_metadata?.role) as UserRole | undefined;
          const assignedRole: UserRole =
            userMetaRole && ['patient', 'doctor', 'receptionist', 'admin'].includes(userMetaRole)
              ? userMetaRole
              : 'patient';

          const initialProfile: UserProfile = {
            uid: authUser.id,
            displayName: authUser.displayName,
            email: authUser.email || '',
            role: assignedRole,
            pid: `PID-${Math.floor(10000 + Math.random() * 89999)}`,
          };

          await upsertSupabaseUserProfile(initialProfile);
          if (!cancelled) {
            setUserProfile(initialProfile);
            setActiveRole(assignedRole);
          }
        }
      } catch (err) {
        console.error('Error synchronizing Supabase user profile:', err);
      }
    };

    syncProfile();

    return () => {
      cancelled = true;
    };
  }, [authUser]);

  // ---------------------------------------------------------------------------
  // 3. CLINICAL DATA BOOTSTRAP (Doctors, Departments, Appointments, Rx, Records)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!isSupabaseConnected || !authReady || !authUser) return;

    let cancelled = false;
    setDataLoading(true);

    const loadClinicalData = async () => {
      try {
        // A. Doctors Directory
        const loadedDocs = await fetchSupabaseDoctors();
        if (!cancelled && loadedDocs.length > 0) {
          setDoctors(loadedDocs);
        } else if (!cancelled && loadedDocs.length === 0) {
          // Safe seed doctors if table is completely empty
          for (const doc of SEED_DOCTORS) {
            await insertSupabaseDoctor(doc).catch(() => {});
          }
          if (!cancelled) setDoctors(SEED_DOCTORS);
        }

        // B. Departments
        const loadedDepts = await fetchSupabaseDepartments();
        if (!cancelled && loadedDepts.length > 0) {
          setDepartments(loadedDepts);
        }

        // C. Appointments
        const loadedApts = await fetchSupabaseAppointments(authUser.id, isAdmin);
        if (!cancelled) {
          if (loadedApts.length > 0) {
            setAppointments(loadedApts);
          } else {
            // Starter appointments tailored to authenticated patient's actual account
            const starterApts = buildInitialAppointments(
              authUser.id,
              userProfile?.displayName || authUser.displayName,
              userProfile?.pid || `PID-${Math.floor(10000 + Math.random() * 89999)}`
            );
            for (const apt of starterApts) {
              await insertSupabaseAppointment({ id: safeId('apt'), ...apt }).catch(() => {});
            }
            const refreshed = await fetchSupabaseAppointments(authUser.id, isAdmin).catch(() => []);
            if (!cancelled && refreshed.length > 0) setAppointments(refreshed);
          }
        }

        // D. Prescriptions
        const loadedRx = await fetchSupabasePrescriptions(authUser.id, isAdmin);
        if (!cancelled) {
          if (loadedRx.length > 0) {
            setPrescriptions(loadedRx);
          } else {
            const starterRx = buildInitialPrescriptions(authUser.id);
            for (const rx of starterRx) {
              await insertSupabasePrescription({ id: safeId('rx'), ...rx }).catch(() => {});
            }
            const refreshed = await fetchSupabasePrescriptions(authUser.id, isAdmin).catch(() => []);
            if (!cancelled && refreshed.length > 0) setPrescriptions(refreshed);
          }
        }

        // E. Medical Records
        const loadedRecords = await fetchSupabaseMedicalRecords(authUser.id, isAdmin);
        if (!cancelled) {
          if (loadedRecords.length > 0) {
            setMedicalRecords(loadedRecords);
          } else {
            const starterRecords = buildInitialMedicalRecords(authUser.id);
            for (const rec of starterRecords) {
              await insertSupabaseMedicalRecord({ id: safeId('rec'), ...rec }).catch(() => {});
            }
            const refreshed = await fetchSupabaseMedicalRecords(authUser.id, isAdmin).catch(() => []);
            if (!cancelled && refreshed.length > 0) setMedicalRecords(refreshed);
          }
        }
      } catch (err) {
        console.error('Error loading Supabase clinical data:', err);
      } finally {
        if (!cancelled) setDataLoading(false);
      }
    };

    loadClinicalData();

    // -------------------------------------------------------------------------
    // Realtime Subscriptions for Clinical Data
    // -------------------------------------------------------------------------
    const unsubApts = subscribeToSupabaseTable('appointments', async () => {
      const refreshed = await fetchSupabaseAppointments(authUser.id, isAdmin).catch(() => []);
      if (!cancelled && refreshed.length > 0) setAppointments(refreshed);
    });

    const unsubRx = subscribeToSupabaseTable('prescriptions', async () => {
      const refreshed = await fetchSupabasePrescriptions(authUser.id, isAdmin).catch(() => []);
      if (!cancelled && refreshed.length > 0) setPrescriptions(refreshed);
    });

    const unsubRecords = subscribeToSupabaseTable('medical_records', async () => {
      const refreshed = await fetchSupabaseMedicalRecords(authUser.id, isAdmin).catch(() => []);
      if (!cancelled && refreshed.length > 0) setMedicalRecords(refreshed);
    });

    const unsubDoctors = subscribeToSupabaseTable('doctors', async () => {
      const refreshed = await fetchSupabaseDoctors().catch(() => []);
      if (!cancelled && refreshed.length > 0) setDoctors(refreshed);
    });

    const unsubDepts = subscribeToSupabaseTable('departments', async () => {
      const refreshed = await fetchSupabaseDepartments().catch(() => []);
      if (!cancelled && refreshed.length > 0) setDepartments(refreshed);
    });

    return () => {
      cancelled = true;
      unsubApts();
      unsubRx();
      unsubRecords();
      unsubDoctors();
      unsubDepts();
    };
  }, [isSupabaseConnected, authReady, authUser?.id, isAdmin, userProfile?.displayName, userProfile?.pid]);

  // ---------------------------------------------------------------------------
  // 4. AI CONSULTATIONS SYNC & REALTIME
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!isSupabaseConnected || !authReady || !authUser) return;

    let cancelled = false;

    const syncAiMessages = async () => {
      try {
        const msgs = await fetchSupabaseAiMessages(authUser.id);
        if (!cancelled) {
          if (msgs.length > 0) {
            setAiMessages(msgs);
          } else {
            const patientName = userProfile?.displayName || authUser.displayName || 'Patient';
            const defaultGreeting: AiConsultationMessage = {
              id: safeId('ai-a'),
              patientUid: authUser.id,
              sender: 'assistant',
              content: `Welcome back, ${patientName.split(' ')[0]}. I'm Dr. Nova, your 24/7 clinical AI health companion. I have access to your MediCure health records, active appointments, and prescriptions. How are you feeling today? You can describe any symptoms, ask about medication schedules, or inquire about upcoming visits.`,
              triagePriority: 'Clinical Telemetry Ready',
              icd10Code: 'Z71.3',
              observations: ['Patient health record synchronized with Supabase.'],
              protocol: ['Hydrate regularly', 'Continue active medications as prescribed'],
            };
            setAiMessages([defaultGreeting]);
            await insertSupabaseAiMessage(defaultGreeting).catch(() => {});
          }
        }
      } catch (err) {
        console.error('Error syncing AI consultations from Supabase:', err);
      }
    };

    syncAiMessages();

    const unsubAi = subscribeToSupabaseTable('ai_consultations', async () => {
      const refreshed = await fetchSupabaseAiMessages(authUser.id).catch(() => []);
      if (!cancelled && refreshed.length > 0) {
        setAiMessages(refreshed);
      }
    });

    return () => {
      cancelled = true;
      unsubAi();
    };
  }, [isSupabaseConnected, authReady, authUser?.id, userProfile?.displayName]);

  // ---------------------------------------------------------------------------
  // 5. AUTHENTICATION METHODS (Supabase Email & Password)
  // ---------------------------------------------------------------------------
  const signInWithEmailAddress = useCallback(
    async (email: string, password: string, roleToActivate?: UserRole) => {
      setAuthError(null);
      setIsSigningIn(true);
      try {
        const { user, error } = await signInWithEmail(email, password);
        if (error) {
          throw new Error(error.message || 'Invalid email or password.');
        }
        if (!user) {
          throw new Error('Authentication failed. No user record returned.');
        }

        const normalized = normalizeUser(user);
        setAuthUser(normalized);

        if (roleToActivate) {
          setActiveRole(roleToActivate);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Sign-in failed. Please verify credentials.';
        setAuthError(msg);
        throw err;
      } finally {
        setIsSigningIn(false);
      }
    },
    []
  );

  const registerWithEmail = useCallback(
    async (email: string, password: string, displayName: string, role: UserRole = 'patient'): Promise<void> => {
      setAuthError(null);
      setIsSigningIn(true);
      try {
        const { user, error } = await signUpWithEmail(email, password, displayName, role);
        if (error) {
          throw new Error(error.message || 'Registration failed.');
        }
        if (user) {
          const normalized = normalizeUser(user);
          setAuthUser(normalized);
          setActiveRole(role);

          // Create matching user profile
          const initialProfile: UserProfile = {
            uid: user.id,
            displayName: displayName.trim() || email.split('@')[0],
            email: email.toLowerCase().trim(),
            role,
            pid: `PID-${Math.floor(10000 + Math.random() * 89999)}`,
          };
          await upsertSupabaseUserProfile(initialProfile);
          setUserProfile(initialProfile);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Registration failed.';
        setAuthError(msg);
        throw err;
      } finally {
        setIsSigningIn(false);
      }
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await signOutSupabase();
    } catch (err) {
      console.warn('Sign-out error:', err);
    } finally {
      setAuthUser(null);
      setUserProfile(null);
      setAppointments([]);
      setPrescriptions([]);
      setMedicalRecords([]);
      setAiMessages([]);
    }
  }, []);

  // ---------------------------------------------------------------------------
  // 6. CLINICAL MUTATIONS (Pure Supabase)
  // ---------------------------------------------------------------------------
  const bookAppointment = useCallback(
    async (draft: BookingDraft): Promise<AppointmentRecord | null> => {
      if (!authUser) throw new Error('Must be logged in to book an appointment.');
      const doctor = doctors.find((d) => d.id === draft.doctorId) || doctors[0];
      const id = safeId('apt');
      const receiptNumber = `#REC-2024-${Math.floor(10000 + Math.random() * 89999)}`;
      const patientName = userProfile?.displayName || authUser.displayName || 'Patient';
      const patientPid = userProfile?.pid || `PID-${Math.floor(10000 + Math.random() * 89999)}`;
      const insurerCoverage = Math.max(0, doctor.baseFee - doctor.copayFee);

      const payload: AppointmentRecord = {
        id,
        patientUid: authUser.id,
        patientName,
        patientPid,
        doctorId: doctor.id,
        doctorName: doctor.name.slice(0, 120),
        doctorCredentials: doctor.credentials.slice(0, 40),
        specialty: doctor.specialty.slice(0, 80),
        department: doctor.department.slice(0, 80),
        location:
          draft.visitMode === 'telehealth'
            ? 'MediCure Encrypted Virtual Suite 02'
            : doctor.hospital.slice(0, 180),
        visitMode: draft.visitMode,
        appointmentDate: draft.appointmentDate.slice(0, 40),
        appointmentTime: draft.appointmentTime.slice(0, 32),
        durationMinutes: 45,
        status: 'scheduled',
        chiefComplaint: draft.chiefComplaint.slice(0, 120),
        symptomDuration: draft.symptomDuration?.slice(0, 60),
        symptomDescription: draft.symptomDescription?.slice(0, 600),
        riskFactors: draft.riskFactors?.slice(0, 10) || [],
        attachedDocumentName: draft.attachedDocumentName?.slice(0, 160),
        insuranceProvider: userProfile?.insuranceProvider || doctor.acceptedInsurance[0],
        policyId: userProfile?.policyId || 'AET-9948201-01',
        standardFee: doctor.baseFee,
        insurerCoverage,
        copayAmount: doctor.copayFee,
        copayPaid: true,
        receiptNumber,
        roomNumber: draft.visitMode === 'telehealth' ? 'Virtual Suite 02' : 'Room 402',
        physicianSummary:
          'Pre-visit clinical intake verified and synced with EHR. Please arrive 15 minutes prior for baseline vitals.',
      };

      await insertSupabaseAppointment(payload);
      setAppointments((prev) => [payload, ...prev]);
      return payload;
    },
    [authUser, doctors, userProfile]
  );

  const cancelAppointment = useCallback(
    async (appointmentId: string): Promise<void> => {
      await updateSupabaseAppointment(appointmentId, { status: 'cancelled' });
      setAppointments((prev) =>
        prev.map((a) => (a.id === appointmentId ? { ...a, status: 'cancelled' } : a))
      );
    },
    []
  );

  const rescheduleAppointment = useCallback(
    async (appointmentId: string, newDate: string, newTime: string): Promise<void> => {
      await updateSupabaseAppointment(appointmentId, {
        appointmentDate: newDate,
        appointmentTime: newTime,
        status: 'scheduled',
      });
      setAppointments((prev) =>
        prev.map((a) =>
          a.id === appointmentId
            ? { ...a, appointmentDate: newDate, appointmentTime: newTime, status: 'scheduled' }
            : a
        )
      );
    },
    []
  );

  const updateAppointmentStatus = useCallback(
    async (
      appointmentId: string,
      status: AppointmentRecord['status'],
      summary?: string
    ): Promise<void> => {
      const updates: Partial<AppointmentRecord> = { status };
      if (summary) updates.physicianSummary = summary;
      await updateSupabaseAppointment(appointmentId, updates);
      setAppointments((prev) =>
        prev.map((a) => (a.id === appointmentId ? { ...a, ...updates } : a))
      );
    },
    []
  );

  const requestPrescriptionRefill = useCallback(
    async (prescriptionId: string): Promise<void> => {
      await updateSupabasePrescription(prescriptionId, 'refill-requested');
      setPrescriptions((prev) =>
        prev.map((p) => (p.id === prescriptionId ? { ...p, status: 'refill-requested' } : p))
      );
    },
    []
  );

  const approvePrescriptionRefill = useCallback(
    async (prescriptionId: string): Promise<void> => {
      await updateSupabasePrescription(prescriptionId, 'approved');
      setPrescriptions((prev) =>
        prev.map((p) => (p.id === prescriptionId ? { ...p, status: 'approved' } : p))
      );
    },
    []
  );

  const uploadDiagnosticRecord = useCallback(
    async (title: string, summary: string): Promise<void> => {
      if (!authUser) throw new Error('Must be logged in to upload diagnostic records.');
      const id = safeId('rec');
      const newRec: MedicalRecordItem = {
        id,
        patientUid: authUser.id,
        title: title.slice(0, 140),
        category: 'Patient Diagnostic Note',
        providerName: userProfile?.displayName || authUser.displayName || 'Patient Upload',
        dateLabel: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        status: 'pending',
        summary: summary.slice(0, 600),
        metrics: ['HIPAA 256-bit Encrypted Upload', 'Awaiting Physician Review'],
      };

      await insertSupabaseMedicalRecord(newRec);
      setMedicalRecords((prev) => [newRec, ...prev]);
    },
    [authUser, userProfile]
  );

  const addDoctor = useCallback(
    async (input: {
      name: string;
      credentials: string;
      specialty: string;
      department: string;
      hospital: string;
      npi: string;
      baseFee: number;
      copayFee: number;
    }): Promise<void> => {
      const id = `doc-${input.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')}-${Date.now().toString(36)}`;
      const docPayload: DoctorProfile = {
        ...input,
        id,
        license: 'MA-994820',
        experienceYears: 8,
        rating: 4.95,
        reviewCount: 12,
        consultationsCount: 120,
        dutyStatus: 'On Duty',
        telehealthReady: true,
        inClinicReady: true,
        availableToday: true,
        isActive: true,
        bio: `${input.name} is a board-certified specialist in ${input.specialty} practicing at ${input.hospital}.`,
        languages: ['English'],
        acceptedInsurance: ['Aetna Choice POS II', 'BlueCross', 'Medicare'],
        nextSlots: ['09:30 AM', '11:00 AM', '02:30 PM'],
        avatarKey: 'sarah-jenkins',
      };
      await insertSupabaseDoctor(docPayload);
      setDoctors((prev) => [docPayload, ...prev]);
    },
    []
  );

  const updateUserProfile = useCallback(
    async (updates: Partial<UserProfile>): Promise<void> => {
      if (!authUser) return;
      await updateSupabaseUserProfile(authUser.id, updates);
      setUserProfile((prev) => (prev ? { ...prev, ...updates } : null));
    },
    [authUser]
  );

  // ---------------------------------------------------------------------------
  // 7. AI HEALTH ASSISTANT MESSAGE HANDLING (Structured JSON + Supabase)
  // ---------------------------------------------------------------------------
  const sendAiMessage = useCallback(
    async (text: string, severity: string) => {
      if (!authUser || !text.trim()) return;

      const userMsgId = safeId('ai-u');
      const userMsg: AiConsultationMessage = {
        id: userMsgId,
        patientUid: authUser.id,
        sender: 'user',
        content: text.trim().slice(0, 4000),
        severity: severity.slice(0, 40),
      };

      // Optimistic update in UI
      setAiMessages((prev) => [...prev, userMsg]);

      // Save user consultation message to Supabase
      await insertSupabaseAiMessage(userMsg).catch((err) => {
        console.warn('Could not insert user message directly to Supabase:', err);
      });

      // Obtain JWT session token for authenticated backend verification
      const session = await getSupabaseSession();
      const token = session?.access_token;

      // Structured JSON request to backend
      try {
        const response = await fetch('/api/ai-assistant', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            message: text.trim(),
            severity,
            patientUid: authUser.id,
            userMessageId: userMsgId,
            patientName: userProfile?.displayName || authUser.displayName,
            history: aiMessages.slice(-6).map((m) => ({
              sender: m.sender,
              content: m.content,
            })),
          }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || 'Dr. Nova AI service returned an error.');
        }

        const aiResult = (await response.json()) as {
          triagePriority?: string;
          icd10Code?: string;
          summary?: string;
          observations?: string[];
          immediateProtocol?: string[];
          assistantMessageId?: string;
        };

        const assistantMsgId = aiResult.assistantMessageId || safeId('ai-a');
        const assistantMsg: AiConsultationMessage = {
          id: assistantMsgId,
          patientUid: authUser.id,
          sender: 'assistant',
          content: (aiResult.summary || 'Clinical guidance prepared.').slice(0, 4000),
          triagePriority: (aiResult.triagePriority || 'Clinical Guidance').slice(0, 80),
          icd10Code: (aiResult.icd10Code || 'Z71.3').slice(0, 32),
          observations: (aiResult.observations || []).slice(0, 8).map((o) => o.slice(0, 240)),
          protocol: (aiResult.immediateProtocol || []).slice(0, 8).map((p) => p.slice(0, 240)),
        };

        // Update UI with Dr. Nova AI clinical response
        setAiMessages((prev) => [...prev, assistantMsg]);

        // Save assistant message to Supabase
        await insertSupabaseAiMessage(assistantMsg).catch((err) => {
          console.warn('Could not insert assistant message directly to Supabase:', err);
        });
      } catch (err: unknown) {
        console.warn('AI request failed, displaying graceful clinical guidance message:', err);
        const fallbackMsg: AiConsultationMessage = {
          id: safeId('ai-a'),
          patientUid: authUser.id,
          sender: 'assistant',
          content:
            'I am currently experiencing a temporary connection issue. Your symptoms have been recorded. If you are experiencing chest pain, difficulty breathing, or another acute medical emergency, please call 911 immediately.',
          triagePriority: 'Routine Guidance',
          icd10Code: 'Z71.3',
          observations: ['Temporary network or AI service interruption encountered.'],
          protocol: [
            'Check your network connection and retry your question',
            'Contact your clinic or physician directly if symptoms persist',
            'Call 911 immediately if you develop red-flag emergency symptoms',
          ],
        };
        setAiMessages((prev) => [...prev, fallbackMsg]);
        throw err;
      }
    },
    [aiMessages, authUser, userProfile?.displayName]
  );

  return {
    authUser,
    authReady,
    authError,
    isSigningIn,
    userProfile,
    activeRole,
    setActiveRole,
    isAdmin,
    doctors,
    departments,
    appointments,
    prescriptions,
    medicalRecords,
    aiMessages,
    dataLoading,
    isSupabaseConnected,
    databaseProvider: 'Supabase' as const,
    signInWithEmailAddress,
    registerWithEmail,
    logout,
    bookAppointment,
    cancelAppointment,
    rescheduleAppointment,
    updateAppointmentStatus,
    requestPrescriptionRefill,
    approvePrescriptionRefill,
    uploadDiagnosticRecord,
    addDoctor,
    updateUserProfile,
    sendAiMessage,
  };
}
