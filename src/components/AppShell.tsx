import React, { useState } from 'react';
import {
  Activity,
  BarChart3,
  Bell,
  Bot,
  Building2,
  Calendar,
  ChevronDown,
  ClipboardList,
  ExternalLink,
  FileText,
  FlaskConical,
  HelpCircle,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  PhoneCall,
  Pill,
  Plus,
  Search,
  Settings,
  ShieldAlert,
  Stethoscope,
  UserCheck,
  Users,
  Video,
  X,
  Zap,
} from 'lucide-react';
import {
  AdminNavKey,
  DoctorNavKey,
  PatientNavKey,
  ReceptionistNavKey,
  UserProfile,
  UserRole,
} from '../types/medicure';
import { ClinicalAvatar } from './ClinicalVisuals';

interface AppShellProps {
  role: UserRole;
  onSwitchRole: (role: UserRole) => void;
  patientNav: PatientNavKey;
  onPatientNav: (nav: PatientNavKey) => void;
  doctorNav: DoctorNavKey;
  onDoctorNav: (nav: DoctorNavKey) => void;
  receptionistNav: ReceptionistNavKey;
  onReceptionistNav: (nav: ReceptionistNavKey) => void;
  adminNav: AdminNavKey;
  onAdminNav: (nav: AdminNavKey) => void;
  userProfile: UserProfile | null;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onQuickBook: () => void;
  onLogout: () => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  role,
  onSwitchRole,
  patientNav,
  onPatientNav,
  doctorNav,
  onDoctorNav,
  receptionistNav,
  onReceptionistNav,
  adminNav,
  onAdminNav,
  userProfile,
  searchQuery,
  onSearchChange,
  onQuickBook,
  onLogout,
  children,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const patientItems: { key: PatientNavKey; label: string; icon: React.ReactNode }[] = [
    { key: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { key: 'find-doctors', label: 'Find Doctors', icon: <Stethoscope className="w-4 h-4" /> },
    { key: 'my-appointments', label: 'My Appointments', icon: <Calendar className="w-4 h-4" /> },
    { key: 'medical-records', label: 'Medical Records', icon: <FileText className="w-4 h-4" /> },
    { key: 'prescriptions', label: 'Prescriptions', icon: <Pill className="w-4 h-4" /> },
    { key: 'messages', label: 'Messages & Alerts', icon: <MessageSquare className="w-4 h-4" /> },
    { key: 'ai-assistant', label: 'AI Health Assistant', icon: <Bot className="w-4 h-4" /> },
  ];

  const doctorItems: { key: DoctorNavKey; label: string; icon: React.ReactNode; badge?: string }[] = [
    { key: 'schedule-queue', label: 'Schedule & Queue', icon: <Calendar className="w-4 h-4" /> },
    { key: 'encounters-ehr', label: 'Encounters & EHR', icon: <ClipboardList className="w-4 h-4" /> },
    { key: 'lab-diagnostics', label: 'Lab & Diagnostics', icon: <FlaskConical className="w-4 h-4" /> },
    { key: 'erx-refills', label: 'e-Rx & Refills', icon: <Pill className="w-4 h-4" /> },
    { key: 'in-basket', label: 'In-Basket & Triage', icon: <Inbox className="w-4 h-4" />, badge: '5' },
    { key: 'telehealth-suite', label: 'Telehealth Suite', icon: <Video className="w-4 h-4" /> },
    { key: 'ai-assistant', label: 'AI Health Assistant', icon: <Bot className="w-4 h-4" /> },
  ];

  const receptionistItems: { key: ReceptionistNavKey; label: string; icon: React.ReactNode }[] = [
    { key: 'front-desk-queue', label: 'Check-In Queue', icon: <UserCheck className="w-4 h-4" /> },
    { key: 'walk-in-registration', label: 'Walk-In Intake', icon: <Users className="w-4 h-4" /> },
    { key: 'billing-copays', label: 'Copays & Receipts', icon: <FileText className="w-4 h-4" /> },
  ];

  const adminItems: { key: AdminNavKey; label: string; icon: React.ReactNode }[] = [
    { key: 'executive-overview', label: 'Executive Overview', icon: <BarChart3 className="w-4 h-4" /> },
    { key: 'manage-doctors', label: 'Manage Doctors', icon: <Stethoscope className="w-4 h-4" /> },
    { key: 'manage-departments', label: 'Departments', icon: <Building2 className="w-4 h-4" /> },
    { key: 'manage-patients', label: 'Patient Directory', icon: <Users className="w-4 h-4" /> },
  ];

  const displayName = userProfile?.displayName || 'Alexander Wright';
  const pid = userProfile?.pid || 'PID-88420';

  const renderNavSection = () => {
    if (role === 'patient') {
      return (
        <>
          <div className="px-3 mb-2 text-[10px] font-bold tracking-wider text-[#64748B] uppercase">
            PATIENT PORTAL
          </div>
          <nav className="space-y-1">
            {patientItems.map((item) => {
              const active =
                patientNav === item.key ||
                (item.key === 'find-doctors' &&
                  (patientNav === 'doctor-profile' ||
                    patientNav === 'book-appointment' ||
                    patientNav === 'booking-confirmed'));
              return (
                <button
                  key={item.key}
                  onClick={() => {
                    onPatientNav(item.key);
                    setMobileOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    active
                      ? 'bg-[#002541] text-white'
                      : 'text-[#42474E] hover:bg-[#F1F5F9] hover:text-[#002541]'
                  }`}
                >
                  {item.icon}
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </>
      );
    }

    if (role === 'doctor') {
      return (
        <>
          <div className="mx-1 mb-4 p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center gap-2.5">
            <ClinicalAvatar avatarKey="sarah-jenkins" name="Dr. Sarah Jenkins" size="sm" activeDot />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-[#0B1C30] truncate">
                  Dr. Sarah Jenkins
                </span>
                <span className="px-1.5 py-0.5 rounded bg-[#CCFBF1] text-[#006B5F] text-[9px] font-bold">
                  FACC
                </span>
              </div>
              <div className="text-[11px] text-[#64748B] truncate">Cardiology • St. Jude</div>
              <div className="text-[10px] font-semibold text-[#006B5F]">On Duty / In Clinic</div>
            </div>
          </div>
          <div className="px-3 mb-2 text-[10px] font-bold tracking-wider text-[#64748B] uppercase">
            CLINICAL OPERATIONS
          </div>
          <nav className="space-y-1">
            {doctorItems.map((item) => {
              const active = doctorNav === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => {
                    onDoctorNav(item.key);
                    setMobileOpen(false);
                  }}
                  className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    active
                      ? 'bg-[#002541] text-white'
                      : 'text-[#42474E] hover:bg-[#F1F5F9] hover:text-[#002541]'
                  }`}
                >
                  <span className="flex items-center gap-3 min-w-0">
                    {item.icon}
                    <span className="truncate">{item.label}</span>
                  </span>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 rounded-full bg-[#FEF2F2] text-[#DC2626] text-[10px] font-bold">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </>
      );
    }

    if (role === 'receptionist') {
      return (
        <>
          <div className="px-3 mb-2 text-[10px] font-bold tracking-wider text-[#64748B] uppercase">
            FRONT DESK OPERATIONS
          </div>
          <nav className="space-y-1">
            {receptionistItems.map((item) => {
              const active = receptionistNav === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => {
                    onReceptionistNav(item.key);
                    setMobileOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    active
                      ? 'bg-[#002541] text-white'
                      : 'text-[#42474E] hover:bg-[#F1F5F9] hover:text-[#002541]'
                  }`}
                >
                  {item.icon}
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </>
      );
    }

    return (
      <>
        <div className="px-3 mb-2 text-[10px] font-bold tracking-wider text-[#64748B] uppercase">
          HOSPITAL ADMINISTRATION
        </div>
        <nav className="space-y-1">
          {adminItems.map((item) => {
            const active = adminNav === item.key;
            return (
              <button
                key={item.key}
                onClick={() => {
                  onAdminNav(item.key);
                  setMobileOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  active
                    ? 'bg-[#002541] text-white'
                    : 'text-[#42474E] hover:bg-[#F1F5F9] hover:text-[#002541]'
                }`}
              >
                {item.icon}
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </>
    );
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-[#E2E8F0] w-[260px]">
      {/* Brand Lockup */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-[#E2E8F0] shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#002541] text-white flex items-center justify-center font-display font-bold text-base">
            +
          </div>
          <div>
            <div className="font-display font-bold text-sm text-[#002541] leading-tight">
              {role === 'doctor' ? 'MediCure EHR' : 'MediCure'}
            </div>
            <div className="text-[10px] font-semibold text-[#006B5F] tracking-wider uppercase">
              {role === 'doctor'
                ? 'PHYSICIAN PORTAL'
                : role === 'admin'
                ? 'ADMIN CONSOLE'
                : role === 'receptionist'
                ? 'FRONT DESK'
                : 'PATIENT PORTAL'}
            </div>
          </div>
        </div>
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden p-1.5 text-[#64748B] hover:text-[#002541]"
          aria-label="Close navigation"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Nav + Workspace Switcher */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div>{renderNavSection()}</div>

        <div className="pt-4 border-t border-[#E2E8F0]">
          <div className="px-3 mb-2 text-[10px] font-bold tracking-wider text-[#64748B] uppercase">
            SWITCH PORTAL
          </div>
          <div className="space-y-1">
            {role !== 'patient' && (
              <button
                onClick={() => {
                  onSwitchRole('patient');
                  setMobileOpen(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-[#42474E] hover:bg-[#F1F5F9] hover:text-[#002541] cursor-pointer"
              >
                <span className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-[#006B5F]" />
                  <span>Patient Portal</span>
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-[#94A3B8]" />
              </button>
            )}
            {role !== 'doctor' && (
              <button
                onClick={() => {
                  onSwitchRole('doctor');
                  setMobileOpen(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-[#42474E] hover:bg-[#F1F5F9] hover:text-[#002541] cursor-pointer"
              >
                <span className="flex items-center gap-2.5">
                  <Stethoscope className="w-4 h-4 text-[#002541]" />
                  <span>Doctor Portal</span>
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-[#94A3B8]" />
              </button>
            )}
            {role !== 'receptionist' && (
              <button
                onClick={() => {
                  onSwitchRole('receptionist');
                  setMobileOpen(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-[#42474E] hover:bg-[#F1F5F9] hover:text-[#002541] cursor-pointer"
              >
                <span className="flex items-center gap-2.5">
                  <Building2 className="w-4 h-4 text-[#0284C7]" />
                  <span>Receptionist Portal</span>
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-[#94A3B8]" />
              </button>
            )}
            {role !== 'admin' && (
              <button
                onClick={() => {
                  onSwitchRole('admin');
                  setMobileOpen(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-[#42474E] hover:bg-[#F1F5F9] hover:text-[#002541] cursor-pointer"
              >
                <span className="flex items-center gap-2.5">
                  <BarChart3 className="w-4 h-4 text-[#123B5D]" />
                  <span>Admin Portal</span>
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-[#94A3B8]" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Utility Links */}
      <div className="p-3 border-t border-[#E2E8F0] space-y-1 bg-[#FAFCFF]">
        {role === 'doctor' && (
          <div className="px-3 py-1.5 mb-1 flex items-center justify-between text-[11px] bg-[#F0FDFA] border border-[#CCFBF1] rounded-lg">
            <span className="font-semibold text-[#002541]">FHIR v4 Sync</span>
            <span className="font-bold text-[#006B5F]">ACTIVE</span>
          </div>
        )}
        <button
          onClick={() => {
            if (role === 'patient') onPatientNav('help');
            else onSwitchRole('patient');
            setMobileOpen(false);
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[#42474E] hover:bg-[#F1F5F9] cursor-pointer"
        >
          {role === 'doctor' ? (
            <>
              <ShieldAlert className="w-4 h-4 text-[#DC2626]" />
              <span className="text-[#DC2626] font-semibold">Hospital Code Paging</span>
            </>
          ) : (
            <>
              <HelpCircle className="w-4 h-4 text-[#64748B]" />
              <span>Help &amp; Support</span>
            </>
          )}
        </button>
        <button
          onClick={() => {
            if (role === 'patient') onPatientNav('settings');
            else if (role === 'doctor') onDoctorNav('settings');
            else if (role === 'receptionist') onReceptionistNav('settings');
            else onAdminNav('settings');
            setMobileOpen(false);
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[#42474E] hover:bg-[#F1F5F9] cursor-pointer"
        >
          <Settings className="w-4 h-4 text-[#64748B]" />
          <span>Settings</span>
        </button>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-[#DC2626] hover:bg-[#FEF2F2] cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-[#F5F8FC]">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block shrink-0 sticky top-0 h-screen">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-[#002541]/40 backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-10 h-full">{sidebarContent}</div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-[#E2E8F0] px-4 lg:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 max-w-xl">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg border border-[#E2E8F0] text-[#002541]"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={
                  role === 'patient'
                    ? 'Search doctors, specialties, appointments, records...'
                    : 'Search Master Patient Index, MRN, or clinical orders...'
                }
                className="w-full h-9 pl-9 pr-12 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs sm:text-sm text-[#0B1C30] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#14B8A6] focus:bg-white transition-colors"
              />
              <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded border border-[#E2E8F0] bg-white text-[10px] font-mono-tabular text-[#64748B] absolute right-2.5 top-1/2 -translate-y-1/2">
                ⌘K
              </span>
            </div>

            {role !== 'patient' && (
              <span className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#F1F5F9] text-xs font-medium text-[#002541] whitespace-nowrap">
                <Activity className="w-3.5 h-3.5 text-[#006B5F]" />
                Wing B • Rooms 401-408
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {role === 'patient' ? (
              <button
                onClick={onQuickBook}
                className="inline-flex items-center gap-1.5 h-9 px-3.5 bg-[#006B5F] hover:bg-[#005048] text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>Book Appointment</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={onQuickBook}
                  className="inline-flex items-center gap-1.5 h-9 px-3 bg-[#002541] hover:bg-[#123B5D] text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Encounter</span>
                </button>
                <button
                  onClick={() => onSwitchRole('doctor')}
                  className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3 bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#0B1C30] rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Zap className="w-3.5 h-3.5 text-[#006B5F]" />
                  <span>Rapid Order</span>
                </button>
              </div>
            )}

            <div className="relative">
              <button
                onClick={() => setNotifOpen((prev) => !prev)}
                className="relative w-9 h-9 rounded-lg border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] flex items-center justify-center text-[#42474E] cursor-pointer"
                aria-label="Clinical alerts"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#DC2626] text-white text-[9px] font-bold flex items-center justify-center">
                  2
                </span>
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-[#E2E8F0] rounded-xl clinical-shadow-md p-3 z-50">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#E2E8F0]">
                    <span className="text-xs font-bold text-[#0B1C30]">Clinical Alerts</span>
                    <button
                      onClick={() => setNotifOpen(false)}
                      className="text-[11px] font-semibold text-[#006B5F] cursor-pointer"
                    >
                      Dismiss
                    </button>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-[#F0FDFA] border border-[#CCFBF1]">
                      <div className="font-semibold text-[#002541]">
                        Cardiology Visit Confirmed
                      </div>
                      <div className="text-[#42474E] mt-0.5">
                        Dr. Sarah Jenkins • Fri, Oct 25 at 10:30 AM (8h fasting required)
                      </div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#EFF4FF] border border-[#DCE9FF]">
                      <div className="font-semibold text-[#002541]">
                        Blood Lipid Profile Validated
                      </div>
                      <div className="text-[#42474E] mt-0.5">
                        Full metabolic evaluation ready in Medical Records.
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                if (role === 'patient') onPatientNav('settings');
              }}
              className="flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-lg hover:bg-[#F8FAFC] transition-colors cursor-pointer"
            >
              <ClinicalAvatar
                avatarKey={role === 'doctor' ? 'sarah-jenkins' : role === 'admin' ? 'ceo' : 'patient'}
                name={role === 'doctor' ? 'Dr. Jenkins' : displayName}
                size="sm"
              />
              <div className="hidden md:block text-left">
                <div className="text-xs font-bold text-[#0B1C30] leading-tight">
                  {role === 'doctor' ? 'Dr. Jenkins' : displayName}
                </div>
                <div className="text-[10px] font-mono-tabular text-[#64748B]">
                  {role === 'doctor' ? 'In Consultation' : pid}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#64748B] hidden md:block" />
            </button>
          </div>
        </header>

        {/* Page Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-7 max-w-[1440px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
