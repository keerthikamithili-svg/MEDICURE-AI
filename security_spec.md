# MediCure Security Specification (Phase 0)

## 1. Data Invariants
1. **Identity Integrity**: No user may create or list appointments, prescriptions, medical records, or AI triage messages on behalf of another `patientUid` unless verified as an authorized Administrator (`isAdmin()`).
2. **No Self-Assigned Roles**: On `/users/{userId}` creation, non-admin callers are strictly restricted to `role == 'patient'` and cannot promote themselves to `admin` or `doctor` via profile updates.
3. **Referential Integrity**: Every `/appointments/{appointmentId}` creation must reference an existing `/doctors/{doctorId}` document via `exists()`.
4. **Terminal State Locking**: Once an appointment reaches `completed` or `cancelled`, non-admin modifications are permanently blocked.
5. **PII Isolation**: User profiles (`/users/{userId}`) and private clinical records are strictly gated to `isOwner(userId) || isAdmin()`, with zero blanket `allow list` rules.
6. **Temporal Integrity**: All `createdAt` and `updatedAt` fields must equal `request.time` on write, and `createdAt` is immutable after creation.

## 2. The "Dirty Dozen" Payloads (Expected: PERMISSION_DENIED)
1. **Unauthenticated Read**: `GET /appointments/apt-1` without `request.auth`.
2. **Unverified Email Write**: `CREATE /appointments/apt-2` where `email_verified == false`.
3. **Cross-Patient Spoof**: `CREATE /appointments/apt-3` with `patientUid: "victim_uid"` by `attacker_uid`.
4. **Role Self-Escalation on Create**: `CREATE /users/attacker_uid` with `role: "admin"`.
5. **Role Escalation on Update**: `UPDATE /users/attacker_uid` attempting to change `role` to `"doctor"`.
6. **Shadow Ghost Field**: `CREATE /appointments/apt-4` containing undeclared `isVerified: true` field.
7. **ID Poisoning**: `CREATE /appointments/invalid$id*over*128chars...` failing `isValidId()`.
8. **Orphaned Doctor Reference**: `CREATE /appointments/apt-5` with non-existent `doctorId: "fake-doc-999"`.
9. **Terminal State Mutation**: `UPDATE /appointments/apt-completed` attempting to change `status` from `"completed"` to `"scheduled"`.
10. **Client Timestamp Forgery**: `CREATE /appointments/apt-6` with backdated `createdAt` instead of `request.time`.
11. **Blanket User List Scraping**: `LIST /users` by a regular patient user.
12. **Unbounded Array Injection**: `CREATE /appointments/apt-7` with `riskFactors` array exceeding 10 items.
