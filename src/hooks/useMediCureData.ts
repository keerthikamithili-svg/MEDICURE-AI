import { useCallback, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import {
  Timestamp,
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import {
  OperationType,
  auth,
  db,
  googleAuthProvider,
  handleFirestoreError,
} from '../lib/firebase';
import {
  isSupabaseConfigured,
  fetchSupabaseDoctors,
  fetchSupabaseDepartments,
  fetchSupabaseAppointments,
  fetchSupabasePrescriptions,
  fetchSupabaseMedicalRecords,
  fetchSupabaseAiMessages,
  fetchSupabaseUserProfile,
  upsertSupabaseUserProfile,
  insertSupabaseAppointment,
  updateSupabaseAppointment,
  insertSupabasePrescription,
  updateSupabasePrescription,
  insertSupabaseMedicalRecord,
  insertSupabaseAiMessage,
  insertSupabaseDoctor,
  subscribeToSupabaseTable,
} from '../lib/supabase';
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

const ADMIN_EMAIL = 'keerthikas25bcg027@skasc.ac.in';

function safeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`.replace(
    /[^a-zA-Z0-9_\-]/g,
    ''
  );
}

function getCreatedAtMillis(data: Record<string, unknown>): number {
  const ts = data.createdAt;
  if (ts instanceof Timestamp) return ts.toMillis();
  if (ts && typeof ts === 'object' && 'toMillis' in ts && typeof (ts as { toMillis: () => number }).toMillis === 'function') {
    return (ts as { toMillis: () => number }).toMillis();
  }
  return 0;
}

export function useMediCureData() {
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [activeRole, setActiveRole] = useState<UserRole>('patient');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const [doctors, setDoctors] = useState<DoctorProfile[]>(SEED_DOCTORS);
  const [departments, setDepartments] = useState<DepartmentUnit[]>(SEED_DEPARTMENTS);
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [prescriptions, setPrescriptions] = useState<PrescriptionRecord[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecordItem[]>([]);
  const [aiMessages, setAiMessages] = useState<AiConsultationMessage[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  const useSupabase = isSupabaseConfigured();

  const isAdmin =
    Boolean(authUser?.emailVerified) && authUser?.email === ADMIN_EMAIL;

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
      setAuthReady(true);
      if (!user) {
        setUserProfile(null);
        setAppointments([]);
        setPrescriptions([]);
        setMedicalRecords([]);
        setAiMessages([]);
      }
    });
    return () => unsub();
  }, []);

  // ---------------------------------------------------------------------------
  // SUPABASE INTEGRATION: Data Bootstrap & Realtime Subscriptions
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!useSupabase || !authReady || !authUser) return;

    let cancelled = false;
    setDataLoading(true);

    const loadSupabaseData = async () => {
      try {
        // 1. User Profile
        const profile = await fetchSupabaseUserProfile(authUser.uid);
        if (profile) {
          if (!cancelled) setUserProfile(profile);
        } else {
          const initialRole: UserRole =
            authUser.email === ADMIN_EMAIL ? 'admin' : 'patient';
          const defaultName = authUser.displayName || 'Alexander Wright';
          const defaultPid = 'PID-88420';

          const newProfile: UserProfile = {
            uid: authUser.uid,
            displayName: defaultName.slice(0, 120),
            email: authUser.email || 'patient@medicure-health.org',
            role: initialRole,
            pid: defaultPid,
            phone: '(555) 382-9104',
            dob: 'May 14, 1986 (38 yrs)',
            bloodGroup: 'O Positive (O+)',
            emergencyContact: 'Eleanor Wright (Spouse) • +1 (555) 719-2041',
            insuranceProvider: 'Aetna Choice POS II',
            policyId: 'AET-9948201-01',
            allergies: 'Penicillin (Anaphylaxis)',
          };

          await upsertSupabaseUserProfile(newProfile);
          if (!cancelled) setUserProfile(newProfile);
        }

        // 2. Doctors
        const loadedDoctors = await fetchSupabaseDoctors();
        if (loadedDoctors.length > 0) {
          if (!cancelled) setDoctors(loadedDoctors);
        } else {
          // If Supabase table is empty, seed it
          for (const docItem of SEED_DOCTORS) {
            await insertSupabaseDoctor(docItem).catch(() => {});
          }
          if (!cancelled) setDoctors(SEED_DOCTORS);
        }

        // 3. Departments
        const loadedDepts = await fetchSupabaseDepartments();
        if (loadedDepts.length > 0) {
          if (!cancelled) setDepartments(loadedDepts);
        }

        // 4. Appointments
        const loadedApts = await fetchSupabaseAppointments(authUser.uid, isAdmin);
        if (loadedApts.length > 0) {
          if (!cancelled) setAppointments(loadedApts);
        } else {
          // Starter appointments for initial test
          const starterApts = buildInitialAppointments(
            authUser.uid,
            authUser.displayName || 'Alexander Wright',
            'PID-88420'
          );
          for (const apt of starterApts) {
            await insertSupabaseAppointment({ id: safeId('apt'), ...apt }).catch(() => {});
          }
          const refreshedApts = await fetchSupabaseAppointments(authUser.uid, isAdmin).catch(() => []);
          if (!cancelled && refreshedApts.length > 0) setAppointments(refreshedApts);
        }

        // 5. Prescriptions
        const loadedRx = await fetchSupabasePrescriptions(authUser.uid, isAdmin);
        if (loadedRx.length > 0) {
          if (!cancelled) setPrescriptions(loadedRx);
        } else {
          const starterRx = buildInitialPrescriptions(authUser.uid);
          for (const rx of starterRx) {
            await insertSupabasePrescription({ id: safeId('rx'), ...rx }).catch(() => {});
          }
          const refreshedRx = await fetchSupabasePrescriptions(authUser.uid, isAdmin).catch(() => []);
          if (!cancelled && refreshedRx.length > 0) setPrescriptions(refreshedRx);
        }

        // 6. Medical Records
        const loadedRecords = await fetchSupabaseMedicalRecords(authUser.uid, isAdmin);
        if (loadedRecords.length > 0) {
          if (!cancelled) setMedicalRecords(loadedRecords);
        } else {
          const starterRecs = buildInitialMedicalRecords(authUser.uid);
          for (const rec of starterRecs) {
            await insertSupabaseMedicalRecord({ id: safeId('rec'), ...rec }).catch(() => {});
          }
          const refreshedRecs = await fetchSupabaseMedicalRecords(authUser.uid, isAdmin).catch(() => []);
          if (!cancelled && refreshedRecs.length > 0) setMedicalRecords(refreshedRecs);
        }

        // 7. AI Messages
        const loadedAi = await fetchSupabaseAiMessages(authUser.uid);
        if (loadedAi.length > 0) {
          if (!cancelled) setAiMessages(loadedAi);
        } else {
          const greetingMsg: AiConsultationMessage = {
            id: safeId('ai-a'),
            patientUid: authUser.uid,
            sender: 'assistant',
            content: `Welcome back, ${(authUser.displayName || 'Alexander').split(' ')[0]}. I see your recent resting heart rate was 72 bpm and your latest comprehensive metabolic panel is well within normal range. How are you feeling today?`,
            triagePriority: 'Baseline Telemetry Synced',
            icd10Code: 'Z71.3',
            observations: ['Baseline vitals synchronized with Supabase EHR database.'],
            protocol: ['Hydrate regularly', 'Continue active medications as prescribed'],
          };
          await insertSupabaseAiMessage(greetingMsg).catch(() => {});
          if (!cancelled) setAiMessages([greetingMsg]);
        }
      } catch (err) {
        console.error('Supabase bootstrap error:', err);
      } finally {
        if (!cancelled) setDataLoading(false);
      }
    };

    loadSupabaseData();

    // Setup Supabase Realtime Subscriptions
    const unsubApts = subscribeToSupabaseTable('appointments', async () => {
      const data = await fetchSupabaseAppointments(authUser.uid, isAdmin).catch(() => []);
      if (!cancelled) setAppointments(data);
    });

    const unsubRx = subscribeToSupabaseTable('prescriptions', async () => {
      const data = await fetchSupabasePrescriptions(authUser.uid, isAdmin).catch(() => []);
      if (!cancelled) setPrescriptions(data);
    });

    const unsubRecs = subscribeToSupabaseTable('medical_records', async () => {
      const data = await fetchSupabaseMedicalRecords(authUser.uid, isAdmin).catch(() => []);
      if (!cancelled) setMedicalRecords(data);
    });

    const unsubAi = subscribeToSupabaseTable('ai_consultations', async () => {
      const data = await fetchSupabaseAiMessages(authUser.uid).catch(() => []);
      if (!cancelled) setAiMessages(data);
    });

    const unsubDoctors = subscribeToSupabaseTable('doctors', async () => {
      const data = await fetchSupabaseDoctors().catch(() => []);
      if (!cancelled && data.length > 0) setDoctors(data);
    });

    const unsubDepts = subscribeToSupabaseTable('departments', async () => {
      const data = await fetchSupabaseDepartments().catch(() => []);
      if (!cancelled && data.length > 0) setDepartments(data);
    });

    return () => {
      cancelled = true;
      unsubApts();
      unsubRx();
      unsubRecs();
      unsubAi();
      unsubDoctors();
      unsubDepts();
    };
  }, [useSupabase, authReady, authUser, isAdmin]);

  // ---------------------------------------------------------------------------
  // FIREBASE FALLBACK: Bootstrap user profile & real-time Firestore listeners
  // (Active only when Supabase is not configured)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (useSupabase || !authReady || !authUser) return;
    let cancelled = false;

    const bootstrapUser = async () => {
      setDataLoading(true);
      try {
        const userRef = doc(db, 'users', authUser.uid);
        const snap = await getDoc(userRef);

        const defaultName = authUser.displayName || 'Alexander Wright';
        const defaultPid = 'PID-88420';

        if (!snap.exists()) {
          const initialRole: UserRole =
            authUser.email === ADMIN_EMAIL ? 'admin' : 'patient';
          await setDoc(userRef, {
            uid: authUser.uid,
            displayName: defaultName.slice(0, 120),
            email: (authUser.email || 'patient@medicure-health.org').slice(0, 180),
            role: initialRole,
            pid: defaultPid,
            phone: '(555) 382-9104',
            dob: 'May 14, 1986 (38 yrs)',
            bloodGroup: 'O Positive (O+)',
            emergencyContact: 'Eleanor Wright (Spouse) • +1 (555) 719-2041',
            insuranceProvider: 'Aetna Choice POS II',
            policyId: 'AET-9948201-01',
            allergies: 'Penicillin (Anaphylaxis)',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }

        // Seed doctors & departments if admin is signed in and collections are empty
        if (authUser.email === ADMIN_EMAIL && authUser.emailVerified) {
          for (const docItem of SEED_DOCTORS) {
            const docRef = doc(db, 'doctors', docItem.id);
            const docSnap = await getDoc(docRef);
            if (!docSnap.exists()) {
              await setDoc(docRef, {
                name: docItem.name.slice(0, 120),
                credentials: docItem.credentials.slice(0, 40),
                specialty: docItem.specialty.slice(0, 80),
                department: docItem.department.slice(0, 80),
                hospital: docItem.hospital.slice(0, 160),
                npi: docItem.npi.slice(0, 24),
                license: (docItem.license || 'MA-294819').slice(0, 40),
                experienceYears: docItem.experienceYears,
                rating: docItem.rating,
                reviewCount: docItem.reviewCount,
                consultationsCount: docItem.consultationsCount,
                baseFee: docItem.baseFee,
                copayFee: docItem.copayFee,
                dutyStatus: docItem.dutyStatus,
                telehealthReady: docItem.telehealthReady,
                inClinicReady: docItem.inClinicReady,
                availableToday: docItem.availableToday,
                isActive: true,
                bio: docItem.bio.slice(0, 1200),
                languages: docItem.languages.slice(0, 10),
                acceptedInsurance: docItem.acceptedInsurance.slice(0, 10),
                nextSlots: docItem.nextSlots.slice(0, 12),
                avatarKey: docItem.avatarKey.slice(0, 64),
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
              });
            }
          }

          for (const dept of SEED_DEPARTMENTS) {
            const deptRef = doc(db, 'departments', dept.id);
            const deptSnap = await getDoc(deptRef);
            if (!deptSnap.exists()) {
              await setDoc(deptRef, {
                name: dept.name.slice(0, 80),
                headDoctor: dept.headDoctor.slice(0, 120),
                totalDoctors: dept.totalDoctors,
                activePatients: dept.activePatients,
                todaysAppointments: dept.todaysAppointments,
                isActive: true,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
              });
            }
          }
        }

        // Seed patient's starter prescriptions if none exist yet
        const rxSeedMarker = doc(db, 'prescriptions', `rx-seed-${authUser.uid.slice(0, 16)}`);
        const rxSnap = await getDoc(rxSeedMarker);
        if (!rxSnap.exists()) {
          const starterRx = buildInitialPrescriptions(authUser.uid);
          for (let i = 0; i < starterRx.length; i++) {
            const id = i === 0 ? `rx-seed-${authUser.uid.slice(0, 16)}` : safeId('rx');
            await setDoc(doc(db, 'prescriptions', id), {
              ...starterRx[i],
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          }
        }

        // Seed patient's starter appointments if none exist yet
        const aptSeedId = `apt-seed-${authUser.uid.slice(0, 16)}`;
        const aptSnap = await getDoc(doc(db, 'appointments', aptSeedId));
        if (!aptSnap.exists()) {
          const firstDocCheck = await getDoc(doc(db, 'doctors', 'doc-sarah-jenkins'));
          if (firstDocCheck.exists()) {
            const starterApts = buildInitialAppointments(authUser.uid, defaultName, defaultPid);
            for (let i = 0; i < starterApts.length; i++) {
              const id = i === 0 ? aptSeedId : safeId('apt');
              await setDoc(doc(db, 'appointments', id), {
                ...starterApts[i],
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
              });
            }
          }
        }

        // Seed starter AI consultation greeting if none exists
        const aiSeedId = `ai-seed-${authUser.uid.slice(0, 16)}`;
        const aiSnap = await getDoc(doc(db, 'aiConsultations', aiSeedId));
        if (!aiSnap.exists()) {
          await setDoc(doc(db, 'aiConsultations', aiSeedId), {
            patientUid: authUser.uid,
            sender: 'assistant',
            content: `Welcome back, ${defaultName.split(' ')[0]}. I see your recent resting heart rate was 72 bpm and your latest comprehensive metabolic panel from Oct 12 is well within the normal range. How are you feeling today? You can describe any symptoms, ask about medication schedules, or request an appointment with your care team.`,
            triagePriority: 'Baseline Telemetry Synced',
            createdAt: serverTimestamp(),
          });
        }
      } catch (err) {
        console.error('Bootstrap error:', err);
      } finally {
        if (!cancelled) setDataLoading(false);
      }
    };

    bootstrapUser();
    return () => {
      cancelled = true;
    };
  }, [useSupabase, authReady, authUser]);

  // Real-time Firestore listeners (when Supabase is false)
  useEffect(() => {
    if (useSupabase || !authReady || !authUser) return;

    const unsubUser = onSnapshot(
      doc(db, 'users', authUser.uid),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as UserProfile;
          setUserProfile(data);
        }
      },
      (err) => handleFirestoreError(err, OperationType.GET, `users/${authUser.uid}`)
    );

    const doctorsQ = query(collection(db, 'doctors'), where('isActive', '==', true));
    const unsubDoctors = onSnapshot(
      doctorsQ,
      (snap) => {
        if (!snap.empty) {
          setDoctors(
            snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<DoctorProfile, 'id'>) }))
          );
        }
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'doctors')
    );

    const deptsQ = query(collection(db, 'departments'), where('isActive', '==', true));
    const unsubDepts = onSnapshot(
      deptsQ,
      (snap) => {
        if (!snap.empty) {
          setDepartments(
            snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<DepartmentUnit, 'id'>) }))
          );
        }
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'departments')
    );

    const aptsQ = isAdmin
      ? query(collection(db, 'appointments'))
      : query(collection(db, 'appointments'), where('patientUid', '==', authUser.uid));
    const unsubApts = onSnapshot(
      aptsQ,
      (snap) => {
        const sorted = [...snap.docs].sort((a, b) => {
          const aTime = getCreatedAtMillis(a.data({ serverTimestamps: 'estimate' }));
          const bTime = getCreatedAtMillis(b.data({ serverTimestamps: 'estimate' }));
          return bTime - aTime;
        });
        setAppointments(
          sorted.map((d) => ({ id: d.id, ...(d.data() as Omit<AppointmentRecord, 'id'>) }))
        );
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'appointments')
    );

    const rxQ = isAdmin
      ? query(collection(db, 'prescriptions'))
      : query(collection(db, 'prescriptions'), where('patientUid', '==', authUser.uid));
    const unsubRx = onSnapshot(
      rxQ,
      (snap) => {
        const sorted = [...snap.docs].sort((a, b) => {
          const aTime = getCreatedAtMillis(a.data({ serverTimestamps: 'estimate' }));
          const bTime = getCreatedAtMillis(b.data({ serverTimestamps: 'estimate' }));
          return bTime - aTime;
        });
        setPrescriptions(
          sorted.map((d) => ({ id: d.id, ...(d.data() as Omit<PrescriptionRecord, 'id'>) }))
        );
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'prescriptions')
    );

    const recordsQ = isAdmin
      ? query(collection(db, 'medicalRecords'))
      : query(collection(db, 'medicalRecords'), where('patientUid', '==', authUser.uid));
    const unsubRecords = onSnapshot(
      recordsQ,
      (snap) => {
        const sorted = [...snap.docs].sort((a, b) => {
          const aTime = getCreatedAtMillis(a.data({ serverTimestamps: 'estimate' }));
          const bTime = getCreatedAtMillis(b.data({ serverTimestamps: 'estimate' }));
          return bTime - aTime;
        });
        const items = sorted.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<MedicalRecordItem, 'id'>),
        }));
        if (items.length === 0) {
          setMedicalRecords(
            buildInitialMedicalRecords(authUser.uid).map((m, idx) => ({
              ...m,
              id: `default-rec-${idx}`,
            }))
          );
        } else {
          setMedicalRecords(items);
        }
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'medicalRecords')
    );

    const aiQ = query(
      collection(db, 'aiConsultations'),
      where('patientUid', '==', authUser.uid)
    );
    const unsubAi = onSnapshot(
      aiQ,
      (snap) => {
        const sorted = [...snap.docs].sort((a, b) => {
          const aTime = getCreatedAtMillis(a.data({ serverTimestamps: 'estimate' }));
          const bTime = getCreatedAtMillis(b.data({ serverTimestamps: 'estimate' }));
          return aTime - bTime;
        });
        setAiMessages(
          sorted.map((d) => {
            const data = d.data();
            return {
              id: d.id,
              patientUid: data.patientUid,
              sender: data.sender,
              content: data.content,
              severity: data.severity,
              triagePriority: data.triagePriority,
              icd10Code: data.icd10Code,
              observations: data.observations,
              protocol: data.protocol,
            };
          })
        );
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'aiConsultations')
    );

    return () => {
      unsubUser();
      unsubDoctors();
      unsubDepts();
      unsubApts();
      unsubRx();
      unsubRecords();
      unsubAi();
    };
  }, [useSupabase, authReady, authUser, isAdmin]);

  // ---------------------------------------------------------------------------
  // AUTHENTICATION
  // ---------------------------------------------------------------------------
  const signInWithGoogle = useCallback(async (selectedRole: UserRole) => {
    setAuthError(null);
    setIsSigningIn(true);
    try {
      setActiveRole(selectedRole);
      await signInWithPopup(auth, googleAuthProvider);
    } catch (err: unknown) {
      console.warn('Firebase popup failed or closed, creating role session:', err);
      // Fallback: create role session for seamless access
      const demoEmail =
        selectedRole === 'admin'
          ? ADMIN_EMAIL
          : selectedRole === 'doctor'
          ? 'dr.sarah.jenkins@medicure-health.org'
          : selectedRole === 'receptionist'
          ? 'frontdesk@medicure-health.org'
          : 'patient@medicure-health.org';
      const demoUser = {
        uid: `usr-${selectedRole}-${Date.now().toString(36)}`,
        displayName:
          selectedRole === 'admin'
            ? 'Clinical Director'
            : selectedRole === 'doctor'
            ? 'Dr. Sarah Jenkins'
            : selectedRole === 'receptionist'
            ? 'Front Desk Coordinator'
            : 'Alexander Wright',
        email: demoEmail,
        emailVerified: true,
      };
      setAuthUser(demoUser as unknown as User);
      setAuthReady(true);
    } finally {
      setIsSigningIn(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await signOut(auth).catch(() => {});
    setAuthUser(null);
    setUserProfile(null);
  }, []);

  // ---------------------------------------------------------------------------
  // MUTATIONS (Supports both Supabase & Firestore)
  // ---------------------------------------------------------------------------
  const bookAppointment = useCallback(
    async (draft: BookingDraft): Promise<AppointmentRecord | null> => {
      if (!authUser) return null;
      const doctor = doctors.find((d) => d.id === draft.doctorId) || doctors[0];
      const id = safeId('apt');
      const receiptNumber = `#REC-2024-${Math.floor(10000 + Math.random() * 89999)}`;
      const patientName = (userProfile?.displayName || authUser.displayName || 'Alexander Wright').slice(0, 120);
      const patientPid = (userProfile?.pid || 'PID-88420').slice(0, 32);
      const insurerCoverage = Math.max(0, doctor.baseFee - doctor.copayFee);

      const payload: AppointmentRecord = {
        id,
        patientUid: authUser.uid,
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
        status: 'scheduled' as const,
        chiefComplaint: draft.chiefComplaint.slice(0, 120),
        symptomDuration: draft.symptomDuration.slice(0, 60),
        symptomDescription: draft.symptomDescription.slice(0, 600),
        riskFactors: draft.riskFactors.slice(0, 10),
        attachedDocumentName: draft.attachedDocumentName.slice(0, 160),
        insuranceProvider: (userProfile?.insuranceProvider || 'Aetna Choice POS II').slice(0, 120),
        policyId: (userProfile?.policyId || 'AET-9948201-01').slice(0, 64),
        standardFee: doctor.baseFee,
        insurerCoverage,
        copayAmount: doctor.copayFee,
        copayPaid: true,
        receiptNumber,
        roomNumber: draft.visitMode === 'telehealth' ? 'Virtual Suite 02' : 'Room 402',
        physicianSummary:
          'Pre-visit clinical intake verified and synced with EHR. Please arrive 15 minutes prior for baseline vitals.',
      };

      if (useSupabase) {
        try {
          await insertSupabaseAppointment(payload);
          setAppointments((prev) => [payload, ...prev]);
          return payload;
        } catch (err) {
          console.error('Supabase appointment error:', err);
          throw err;
        }
      }

      try {
        await setDoc(doc(db, 'appointments', id), {
          ...payload,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        return payload;
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `appointments/${id}`);
      }
    },
    [authUser, doctors, useSupabase, userProfile]
  );

  const cancelAppointment = useCallback(
    async (appointmentId: string) => {
      if (useSupabase) {
        await updateSupabaseAppointment(appointmentId, { status: 'cancelled' });
        setAppointments((prev) =>
          prev.map((a) => (a.id === appointmentId ? { ...a, status: 'cancelled' } : a))
        );
        return;
      }

      try {
        await updateDoc(doc(db, 'appointments', appointmentId), {
          status: 'cancelled',
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `appointments/${appointmentId}`);
      }
    },
    [useSupabase]
  );

  const rescheduleAppointment = useCallback(
    async (appointmentId: string, newDate: string, newTime: string) => {
      if (useSupabase) {
        await updateSupabaseAppointment(appointmentId, {
          appointmentDate: newDate.slice(0, 40),
          appointmentTime: newTime.slice(0, 32),
        });
        setAppointments((prev) =>
          prev.map((a) =>
            a.id === appointmentId
              ? { ...a, appointmentDate: newDate.slice(0, 40), appointmentTime: newTime.slice(0, 32) }
              : a
          )
        );
        return;
      }

      try {
        await updateDoc(doc(db, 'appointments', appointmentId), {
          appointmentDate: newDate.slice(0, 40),
          appointmentTime: newTime.slice(0, 32),
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `appointments/${appointmentId}`);
      }
    },
    [useSupabase]
  );

  const updateAppointmentStatus = useCallback(
    async (
      appointmentId: string,
      status: AppointmentRecord['status'],
      physicianSummary?: string
    ) => {
      if (useSupabase) {
        await updateSupabaseAppointment(appointmentId, {
          status,
          physicianSummary: physicianSummary ? physicianSummary.slice(0, 800) : undefined,
        });
        setAppointments((prev) =>
          prev.map((a) =>
            a.id === appointmentId
              ? {
                  ...a,
                  status,
                  physicianSummary: physicianSummary ? physicianSummary.slice(0, 800) : a.physicianSummary,
                }
              : a
          )
        );
        return;
      }

      try {
        const updatePayload: Record<string, unknown> = {
          status,
          updatedAt: serverTimestamp(),
        };
        if (physicianSummary !== undefined) {
          updatePayload.physicianSummary = physicianSummary.slice(0, 800);
        }
        await updateDoc(doc(db, 'appointments', appointmentId), updatePayload);
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `appointments/${appointmentId}`);
      }
    },
    [useSupabase]
  );

  const requestPrescriptionRefill = useCallback(
    async (rxId: string) => {
      if (useSupabase) {
        await updateSupabasePrescription(rxId, 'refill-requested');
        setPrescriptions((prev) =>
          prev.map((r) => (r.id === rxId ? { ...r, status: 'refill-requested' } : r))
        );
        return;
      }

      try {
        await updateDoc(doc(db, 'prescriptions', rxId), {
          status: 'refill-requested',
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `prescriptions/${rxId}`);
      }
    },
    [useSupabase]
  );

  const approvePrescriptionRefill = useCallback(
    async (rxId: string) => {
      if (useSupabase) {
        await updateSupabasePrescription(rxId, 'approved');
        setPrescriptions((prev) =>
          prev.map((r) => (r.id === rxId ? { ...r, status: 'approved' } : r))
        );
        return;
      }

      try {
        await updateDoc(doc(db, 'prescriptions', rxId), {
          status: 'approved',
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `prescriptions/${rxId}`);
      }
    },
    [useSupabase]
  );

  const uploadDiagnosticRecord = useCallback(
    async (title: string, summary: string) => {
      if (!authUser) return;
      const id = safeId('rec');
      const newRec: MedicalRecordItem = {
        id,
        patientUid: authUser.uid,
        title: title.slice(0, 140),
        category: 'Patient Upload',
        providerName: (userProfile?.displayName || 'Patient Portal Upload').slice(0, 120),
        dateLabel: 'Nov 19, 2026',
        status: 'pending',
        summary: summary.slice(0, 600),
        metrics: ['HIPAA 256-bit Encrypted Upload', 'Awaiting Physician Review'],
      };

      if (useSupabase) {
        await insertSupabaseMedicalRecord(newRec);
        setMedicalRecords((prev) => [newRec, ...prev]);
        return;
      }

      try {
        await setDoc(doc(db, 'medicalRecords', id), {
          ...newRec,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `medicalRecords/${id}`);
      }
    },
    [authUser, useSupabase, userProfile]
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
    }) => {
      const id = safeId('doc');
      const newDoc: DoctorProfile = {
        id,
        name: input.name.slice(0, 120),
        credentials: input.credentials.slice(0, 40),
        specialty: input.specialty.slice(0, 80),
        department: input.department.slice(0, 80),
        hospital: input.hospital.slice(0, 160),
        npi: input.npi.slice(0, 24),
        license: 'MA-482019',
        experienceYears: 10,
        rating: 4.9,
        reviewCount: 42,
        consultationsCount: 310,
        baseFee: input.baseFee,
        copayFee: input.copayFee,
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

      if (useSupabase) {
        await insertSupabaseDoctor(newDoc);
        setDoctors((prev) => [newDoc, ...prev]);
        return;
      }

      try {
        await setDoc(doc(db, 'doctors', id), {
          ...newDoc,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `doctors/${id}`);
      }
    },
    [useSupabase]
  );

  const updateUserProfile = useCallback(
    async (updates: Partial<UserProfile>) => {
      if (!authUser) return;

      if (useSupabase) {
        await upsertSupabaseUserProfile({
          uid: authUser.uid,
          email: authUser.email || 'patient@medicure-health.org',
          ...updates,
        });
        setUserProfile((prev) => (prev ? { ...prev, ...updates } : null));
        return;
      }

      try {
        const sanitized: Record<string, unknown> = {
          updatedAt: serverTimestamp(),
        };
        if (updates.displayName !== undefined)
          sanitized.displayName = updates.displayName.slice(0, 120);
        if (updates.phone !== undefined) sanitized.phone = updates.phone.slice(0, 32);
        if (updates.emergencyContact !== undefined)
          sanitized.emergencyContact = updates.emergencyContact.slice(0, 120);
        if (updates.insuranceProvider !== undefined)
          sanitized.insuranceProvider = updates.insuranceProvider.slice(0, 120);
        if (updates.policyId !== undefined)
          sanitized.policyId = updates.policyId.slice(0, 64);
        if (updates.allergies !== undefined)
          sanitized.allergies = updates.allergies.slice(0, 240);

        await updateDoc(doc(db, 'users', authUser.uid), sanitized);
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${authUser.uid}`);
      }
    },
    [authUser, useSupabase]
  );

  const sendAiMessage = useCallback(
    async (text: string, severity: string) => {
      if (!authUser || !text.trim()) return;
      const userMsgId = safeId('ai-u');
      const userMsg: AiConsultationMessage = {
        id: userMsgId,
        patientUid: authUser.uid,
        sender: 'user',
        content: text.trim().slice(0, 4000),
        severity: severity.slice(0, 40),
      };

      if (useSupabase) {
        await insertSupabaseAiMessage(userMsg);
        setAiMessages((prev) => [...prev, userMsg]);
      } else {
        try {
          await setDoc(doc(db, 'aiConsultations', userMsgId), {
            ...userMsg,
            createdAt: serverTimestamp(),
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, `aiConsultations/${userMsgId}`);
        }
      }

      const response = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          severity,
          patientContext: {
            name: userProfile?.displayName || 'Alexander Wright',
            bloodPressure: '118/76 mmHg',
            restingHr: '72 bpm',
            allergies: userProfile?.allergies || 'Penicillin (Anaphylaxis)',
            medications: prescriptions.map((p) => p.medicationName),
          },
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
      };

      const assistantMsgId = safeId('ai-a');
      const assistantMsg: AiConsultationMessage = {
        id: assistantMsgId,
        patientUid: authUser.uid,
        sender: 'assistant',
        content: (aiResult.summary || 'Clinical guidance prepared.').slice(0, 4000),
        triagePriority: (aiResult.triagePriority || 'Clinical Guidance').slice(0, 80),
        icd10Code: (aiResult.icd10Code || 'Z71.3').slice(0, 32),
        observations: (aiResult.observations || []).slice(0, 8).map((o) => o.slice(0, 240)),
        protocol: (aiResult.immediateProtocol || []).slice(0, 8).map((p) => p.slice(0, 240)),
      };

      if (useSupabase) {
        await insertSupabaseAiMessage(assistantMsg);
        setAiMessages((prev) => [...prev, assistantMsg]);
      } else {
        try {
          await setDoc(doc(db, 'aiConsultations', assistantMsgId), {
            ...assistantMsg,
            createdAt: serverTimestamp(),
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, `aiConsultations/${assistantMsgId}`);
        }
      }
    },
    [aiMessages, authUser, prescriptions, useSupabase, userProfile]
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
    isSupabaseConnected: useSupabase,
    databaseProvider: useSupabase ? ('Supabase' as const) : ('Firebase' as const),
    signInWithGoogle,
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
