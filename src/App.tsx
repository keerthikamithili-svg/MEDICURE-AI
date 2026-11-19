import { useMemo, useState } from 'react';
import { AppShell } from './components/AppShell';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LoginScreen } from './components/LoginScreen';
import { AdminPortalView } from './components/admin/AdminPortalView';
import { AiAssistantView } from './components/ai/AiAssistantView';
import { DoctorPortalView } from './components/doctor/DoctorPortalView';
import { AppointmentHistoryView } from './components/patient/AppointmentHistoryView';
import { BookAppointmentView } from './components/patient/BookAppointmentView';
import { BookingConfirmationView } from './components/patient/BookingConfirmationView';
import { DoctorProfileView } from './components/patient/DoctorProfileView';
import { FindDoctorsView } from './components/patient/FindDoctorsView';
import { PatientDashboard } from './components/patient/PatientDashboard';
import {
  MedicalRecordsView,
  MessagesView,
  PrescriptionsView,
  SettingsSupportView,
} from './components/patient/PatientExtrasViews';
import { ReceptionistPortalView } from './components/receptionist/ReceptionistPortalView';
import { useMediCureData } from './hooks/useMediCureData';
import {
  AdminNavKey,
  AppointmentRecord,
  BookingDraft,
  DoctorNavKey,
  PatientNavKey,
  ReceptionistNavKey,
  UserRole,
} from './types/medicure';

const DEFAULT_DRAFT: BookingDraft = {
  doctorId: 'doc-sarah-jenkins',
  visitMode: 'in-person',
  appointmentDate: 'Fri, Oct 25, 2024',
  appointmentTime: '10:30 AM',
  chiefComplaint: 'Routine Cardiology Follow-up',
  symptomDuration: '1 - 4 Weeks',
  symptomDescription: '',
  riskFactors: ['Hypertension'],
  attachedDocumentName: '',
};

function MediCureWorkspace() {
  const {
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
    databaseProvider,
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
  } = useMediCureData();

  const [patientNav, setPatientNav] = useState<PatientNavKey>('dashboard');
  const [doctorNav, setDoctorNav] = useState<DoctorNavKey>('schedule-queue');
  const [receptionistNav, setReceptionistNav] = useState<ReceptionistNavKey>('front-desk-queue');
  const [adminNav, setAdminNav] = useState<AdminNavKey>('executive-overview');

  const [searchQuery, setSearchQuery] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('All');
  const [selectedDoctorId, setSelectedDoctorId] = useState('doc-sarah-jenkins');
  const [bookingDraft, setBookingDraft] = useState<BookingDraft>(DEFAULT_DRAFT);
  const [confirmedAppointment, setConfirmedAppointment] = useState<AppointmentRecord | null>(null);

  const selectedDoctor = useMemo(
    () => doctors.find((d) => d.id === selectedDoctorId) || doctors[0],
    [doctors, selectedDoctorId]
  );

  const filteredDoctorsByGlobalSearch = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return doctors;
    return doctors.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.specialty.toLowerCase().includes(q) ||
        d.department.toLowerCase().includes(q) ||
        d.hospital.toLowerCase().includes(q)
    );
  }, [doctors, searchQuery]);

  const filteredAppointmentsByGlobalSearch = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return appointments;
    return appointments.filter(
      (a) =>
        a.patientName.toLowerCase().includes(q) ||
        a.patientPid.toLowerCase().includes(q) ||
        a.doctorName.toLowerCase().includes(q) ||
        a.specialty.toLowerCase().includes(q) ||
        a.chiefComplaint.toLowerCase().includes(q)
    );
  }, [appointments, searchQuery]);

  if (!authReady) {
    return (
      <div className="min-h-screen bg-[#F5F8FC] flex items-center justify-center p-6">
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 clinical-shadow flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#002541] text-white flex items-center justify-center font-display font-bold text-lg animate-pulse">
            +
          </div>
          <div>
            <div className="font-display font-bold text-sm text-[#002541]">
              MediCure Clinical Gateway
            </div>
            <div className="text-xs text-[#64748B]">Verifying encrypted EHR session...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!authUser) {
    return (
      <LoginScreen
        onGoogleSignIn={signInWithGoogle}
        isSigningIn={isSigningIn}
        authError={authError}
        isSupabaseConnected={isSupabaseConnected}
        databaseProvider={databaseProvider}
      />
    );
  }

  const handleOpenBooking = (
    doctorId: string,
    preset?: {
      visitMode?: 'in-person' | 'telehealth';
      date?: string;
      appointmentDate?: string;
      appointmentTime?: string;
      time?: string;
    }
  ) => {
    const docItem = doctors.find((d) => d.id === doctorId) || doctors[0];
    setSelectedDoctorId(docItem.id);
    setBookingDraft({
      ...DEFAULT_DRAFT,
      doctorId: docItem.id,
      visitMode: preset?.visitMode || 'in-person',
      appointmentDate: preset?.appointmentDate || preset?.date || 'Fri, Oct 25, 2024',
      appointmentTime:
        preset?.appointmentTime || preset?.time || docItem.nextSlots[0] || '10:30 AM',
      chiefComplaint: `${docItem.specialty} Consultation`,
    });
    setActiveRole('patient');
    setPatientNav('book-appointment');
  };

  const handleConfirmBooking = async (draft: BookingDraft) => {
    const created = await bookAppointment(draft);
    if (created) {
      setConfirmedAppointment(created);
      setPatientNav('booking-confirmed');
    }
  };

  const handleSwitchRole = (nextRole: UserRole) => {
    setActiveRole(nextRole);
    setSearchQuery('');
  };

  const handleQuickBook = () => {
    setActiveRole('patient');
    setBookingDraft({
      ...DEFAULT_DRAFT,
      doctorId: selectedDoctor?.id || 'doc-sarah-jenkins',
    });
    setPatientNav('book-appointment');
  };

  const renderPatientView = () => {
    switch (patientNav) {
      case 'dashboard':
        return (
          <PatientDashboard
            userProfile={userProfile}
            appointments={appointments}
            prescriptions={prescriptions}
            medicalRecords={medicalRecords}
            doctors={doctors}
            onNavigate={(nav) => {
              if (nav === 'find-doctors') setSpecialtyFilter('All');
              setPatientNav(nav);
            }}
            onSelectDoctor={(id) => {
              setSelectedDoctorId(id);
              setPatientNav('doctor-profile');
            }}
            onBookWithDoctor={handleOpenBooking}
            onSelectSpecialty={(spec) => {
              setSpecialtyFilter(spec);
              setPatientNav('find-doctors');
            }}
            onViewConfirmation={(apt) => {
              setConfirmedAppointment(apt);
              setPatientNav('booking-confirmed');
            }}
          />
        );

      case 'find-doctors':
        return (
          <FindDoctorsView
            key={`find-${specialtyFilter}`}
            doctors={filteredDoctorsByGlobalSearch}
            initialSpecialty={specialtyFilter}
            onSelectDoctor={(id) => {
              setSelectedDoctorId(id);
              setPatientNav('doctor-profile');
            }}
            onBookDoctor={handleOpenBooking}
            onOpenAiTriage={() => setPatientNav('ai-assistant')}
          />
        );

      case 'doctor-profile':
        return (
          <DoctorProfileView
            doctor={selectedDoctor}
            onBack={() => setPatientNav('find-doctors')}
            onContinueBooking={(preset) => handleOpenBooking(selectedDoctor.id, preset)}
          />
        );

      case 'book-appointment':
        return (
          <BookAppointmentView
            doctors={doctors}
            initialDraft={bookingDraft}
            userProfile={userProfile}
            onChangeDoctor={() => setPatientNav('find-doctors')}
            onConfirmBooking={handleConfirmBooking}
            onCancel={() => setPatientNav('dashboard')}
          />
        );

      case 'booking-confirmed': {
        const targetApt = confirmedAppointment || appointments[0];
        if (!targetApt) {
          return (
            <PatientDashboard
              userProfile={userProfile}
              appointments={appointments}
              prescriptions={prescriptions}
              medicalRecords={medicalRecords}
              doctors={doctors}
              onNavigate={setPatientNav}
              onSelectDoctor={(id) => {
                setSelectedDoctorId(id);
                setPatientNav('doctor-profile');
              }}
              onBookWithDoctor={handleOpenBooking}
              onSelectSpecialty={(spec) => {
                setSpecialtyFilter(spec);
                setPatientNav('find-doctors');
              }}
              onViewConfirmation={(apt) => {
                setConfirmedAppointment(apt);
                setPatientNav('booking-confirmed');
              }}
            />
          );
        }
        return (
          <BookingConfirmationView
            appointment={targetApt}
            onNavigate={setPatientNav}
            onCancelAppointment={async (id) => {
              await cancelAppointment(id);
              setPatientNav('my-appointments');
            }}
          />
        );
      }

      case 'my-appointments':
        return (
          <AppointmentHistoryView
            appointments={filteredAppointmentsByGlobalSearch}
            onBookNew={handleQuickBook}
            onBookFollowUp={(doctorId) => handleOpenBooking(doctorId)}
            onViewConfirmation={(apt) => {
              setConfirmedAppointment(apt);
              setPatientNav('booking-confirmed');
            }}
            onReschedule={rescheduleAppointment}
            onCancel={cancelAppointment}
          />
        );

      case 'medical-records':
        return (
          <MedicalRecordsView
            records={medicalRecords}
            onUploadRecord={uploadDiagnosticRecord}
          />
        );

      case 'prescriptions':
        return (
          <PrescriptionsView
            prescriptions={prescriptions}
            onRequestRefill={requestPrescriptionRefill}
          />
        );

      case 'messages':
        return <MessagesView />;

      case 'ai-assistant':
        return (
          <AiAssistantView
            userProfile={userProfile}
            messages={aiMessages}
            doctors={doctors}
            onSendMessage={sendAiMessage}
            onBookDoctor={(doctorId, mode) =>
              handleOpenBooking(doctorId, { visitMode: mode || 'in-person' })
            }
          />
        );

      case 'help':
      case 'settings':
        return (
          <SettingsSupportView
            mode={patientNav}
            userProfile={userProfile}
            onUpdateProfile={updateUserProfile}
          />
        );
    }
  };

  const renderDoctorView = () => {
    if (doctorNav === 'ai-assistant') {
      return (
        <AiAssistantView
          userProfile={userProfile}
          messages={aiMessages}
          doctors={doctors}
          onSendMessage={sendAiMessage}
          onBookDoctor={(doctorId, mode) =>
            handleOpenBooking(doctorId, { visitMode: mode || 'in-person' })
          }
        />
      );
    }
    if (doctorNav === 'settings') {
      return (
        <SettingsSupportView
          mode="settings"
          userProfile={userProfile}
          onUpdateProfile={updateUserProfile}
        />
      );
    }
    return (
      <DoctorPortalView
        activeNav={doctorNav}
        appointments={filteredAppointmentsByGlobalSearch}
        prescriptions={prescriptions}
        onUpdateStatus={updateAppointmentStatus}
        onApproveRefill={approvePrescriptionRefill}
        onNavigate={setDoctorNav}
      />
    );
  };

  const renderReceptionistView = () => {
    if (receptionistNav === 'settings') {
      return (
        <SettingsSupportView
          mode="settings"
          userProfile={userProfile}
          onUpdateProfile={updateUserProfile}
        />
      );
    }
    return (
      <ReceptionistPortalView
        activeNav={receptionistNav}
        appointments={filteredAppointmentsByGlobalSearch}
        onCheckIn={async (id) => {
          await updateAppointmentStatus(id, 'checked-in');
        }}
        onQuickBook={handleQuickBook}
      />
    );
  };

  const renderAdminView = () => {
    if (adminNav === 'settings') {
      return (
        <SettingsSupportView
          mode="settings"
          userProfile={userProfile}
          onUpdateProfile={updateUserProfile}
        />
      );
    }
    return (
      <AdminPortalView
        activeNav={adminNav}
        onNavigate={setAdminNav}
        doctors={filteredDoctorsByGlobalSearch}
        departments={departments}
        appointments={filteredAppointmentsByGlobalSearch}
        isAdmin={isAdmin}
        onAddDoctor={addDoctor}
      />
    );
  };

  return (
    <AppShell
      role={activeRole}
      onSwitchRole={handleSwitchRole}
      patientNav={patientNav}
      onPatientNav={(nav) => {
        if (nav === 'find-doctors') setSpecialtyFilter('All');
        setPatientNav(nav);
      }}
      doctorNav={doctorNav}
      onDoctorNav={setDoctorNav}
      receptionistNav={receptionistNav}
      onReceptionistNav={setReceptionistNav}
      adminNav={adminNav}
      onAdminNav={setAdminNav}
      userProfile={userProfile}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      onQuickBook={handleQuickBook}
      onLogout={logout}
      isSupabaseConnected={isSupabaseConnected}
      databaseProvider={databaseProvider}
    >
      {dataLoading && appointments.length === 0 ? (
        <div className="mb-4 px-4 py-2.5 rounded-xl bg-white border border-[#E2E8F0] text-xs font-medium text-[#64748B]">
          Synchronizing clinical records with MediCure EHR...
        </div>
      ) : null}

      {activeRole === 'patient' && renderPatientView()}
      {activeRole === 'doctor' && renderDoctorView()}
      {activeRole === 'receptionist' && renderReceptionistView()}
      {activeRole === 'admin' && renderAdminView()}
    </AppShell>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <MediCureWorkspace />
    </ErrorBoundary>
  );
}
