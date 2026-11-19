// Phase 0 Security Test Specification for MediCure Firestore Rules
// Verifies that all "Dirty Dozen" adversarial payloads are rejected with PERMISSION_DENIED.

export interface DirtyDozenCase {
  id: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  path: string;
  auth: { uid: string; email: string; email_verified: boolean } | null;
  payload?: Record<string, unknown>;
  expected: 'PERMISSION_DENIED';
}

export const DIRTY_DOZEN_PAYLOADS: DirtyDozenCase[] = [
  {
    id: 'DD-01-unauthenticated-read',
    operation: 'get',
    path: '/appointments/apt-101',
    auth: null,
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-02-unverified-email-write',
    operation: 'create',
    path: '/appointments/apt-102',
    auth: { uid: 'user-1', email: 'unverified@example.com', email_verified: false },
    payload: { patientUid: 'user-1', doctorId: 'doc-sarah-jenkins' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-03-cross-patient-spoof',
    operation: 'create',
    path: '/appointments/apt-103',
    auth: { uid: 'attacker-uid', email: 'attacker@example.com', email_verified: true },
    payload: { patientUid: 'victim-uid', doctorId: 'doc-sarah-jenkins' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-04-role-self-escalation-create',
    operation: 'create',
    path: '/users/attacker-uid',
    auth: { uid: 'attacker-uid', email: 'attacker@example.com', email_verified: true },
    payload: { uid: 'attacker-uid', role: 'admin', displayName: 'Mallory', email: 'attacker@example.com', pid: 'PID-999' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-05-role-escalation-update',
    operation: 'update',
    path: '/users/patient-1',
    auth: { uid: 'patient-1', email: 'patient@example.com', email_verified: true },
    payload: { role: 'doctor' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-06-shadow-ghost-field',
    operation: 'create',
    path: '/appointments/apt-104',
    auth: { uid: 'patient-1', email: 'patient@example.com', email_verified: true },
    payload: { patientUid: 'patient-1', isVerified: true },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-07-id-poisoning',
    operation: 'create',
    path: '/appointments/invalid$id!poison',
    auth: { uid: 'patient-1', email: 'patient@example.com', email_verified: true },
    payload: { patientUid: 'patient-1' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-08-orphaned-doctor-ref',
    operation: 'create',
    path: '/appointments/apt-105',
    auth: { uid: 'patient-1', email: 'patient@example.com', email_verified: true },
    payload: { patientUid: 'patient-1', doctorId: 'non-existent-doc-999' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-09-terminal-state-mutation',
    operation: 'update',
    path: '/appointments/apt-completed-1',
    auth: { uid: 'patient-1', email: 'patient@example.com', email_verified: true },
    payload: { status: 'scheduled' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-10-timestamp-forgery',
    operation: 'create',
    path: '/appointments/apt-106',
    auth: { uid: 'patient-1', email: 'patient@example.com', email_verified: true },
    payload: { patientUid: 'patient-1', createdAt: '2020-01-01T00:00:00Z' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-11-blanket-user-list',
    operation: 'list',
    path: '/users',
    auth: { uid: 'patient-1', email: 'patient@example.com', email_verified: true },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-12-unbounded-array',
    operation: 'create',
    path: '/appointments/apt-107',
    auth: { uid: 'patient-1', email: 'patient@example.com', email_verified: true },
    payload: { patientUid: 'patient-1', riskFactors: Array.from({ length: 15 }, (_, i) => `factor-${i}`) },
    expected: 'PERMISSION_DENIED',
  },
];
