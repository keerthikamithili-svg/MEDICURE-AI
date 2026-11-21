import React, { useState } from 'react';
import {
  Building2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  Stethoscope,
  User,
  UserCheck,
  ArrowRight,
  Phone,
  UserPlus,
  KeyRound,
} from 'lucide-react';
import { UserRole } from '../types/medicure';

interface LoginScreenProps {
  onSignIn: (email: string, password: string, role: UserRole) => Promise<void>;
  onSignUp: (email: string, password: string, displayName: string, role: UserRole) => Promise<void>;
  isSigningIn: boolean;
  authError: string | null;
  isSupabaseConnected?: boolean;
}

const ROLE_OPTIONS: { id: UserRole; label: string; icon: React.ReactNode; hint: string; defaultEmail: string }[] = [
  { id: 'patient', label: 'Patient', icon: <User className="w-4 h-4" />, hint: 'Primary Patient Account', defaultEmail: 'patient@medicure.demo' },
  { id: 'doctor', label: 'Doctor', icon: <Stethoscope className="w-4 h-4" />, hint: 'Physician / NPI Account', defaultEmail: 'dr.sarah@medicure.demo' },
  { id: 'receptionist', label: 'Front Desk', icon: <Building2 className="w-4 h-4" />, hint: 'Desk Coordinator Account', defaultEmail: 'receptionist@medicure.demo' },
  { id: 'admin', label: 'Admin', icon: <UserCheck className="w-4 h-4" />, hint: 'Clinical Director Account', defaultEmail: 'admin@medicure.demo' },
];

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onSignIn,
  onSignUp,
  isSigningIn,
  authError,
  isSupabaseConnected,
}) => {
  const [authMode, setAuthMode] = useState<'signin' | 'register'>('signin');
  const [selectedRole, setSelectedRole] = useState<UserRole>('patient');
  const [displayNameInput, setDisplayNameInput] = useState('');
  const [emailInput, setEmailInput] = useState('patient@medicure.demo');
  const [passwordInput, setPasswordInput] = useState('Pass1234!');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);

  const currentRoleOption = ROLE_OPTIONS.find((r) => r.id === selectedRole) || ROLE_OPTIONS[0];

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    setNotice(null);
    const target = ROLE_OPTIONS.find((r) => r.id === role);
    if (target && emailInput.endsWith('@medicure.demo')) {
      setEmailInput(target.defaultEmail);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotice(null);

    if (!emailInput.trim() || !passwordInput.trim()) {
      setNotice('Please provide both your email address and password.');
      return;
    }

    if (authMode === 'register' && !displayNameInput.trim()) {
      setNotice('Please enter your full name for clinical registration.');
      return;
    }

    try {
      if (authMode === 'signin') {
        await onSignIn(emailInput.trim(), passwordInput, selectedRole);
      } else {
        await onSignUp(emailInput.trim(), passwordInput, displayNameInput.trim(), selectedRole);
        setNotice('Registration successful! Connecting to your secure clinical dashboard...');
      }
    } catch {
      // Error is tracked in authError prop from useMediCureData
    }
  };

  const handleQuickDemoFill = (role: UserRole) => {
    handleRoleChange(role);
    const target = ROLE_OPTIONS.find((r) => r.id === role);
    if (target) {
      setEmailInput(target.defaultEmail);
      setPasswordInput('Pass1234!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0F7FF] via-[#F8FAFC] to-[#E6F7F5] flex flex-col justify-between">
      {/* Top Gateway Header */}
      <header className="w-full px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#002541] text-white flex items-center justify-center font-display font-bold shadow-xs">
            <span className="text-lg leading-none">+</span>
          </div>
          <div>
            <div className="font-display font-bold text-base text-[#002541] leading-tight">
              MediCure
            </div>
            <div className="text-[11px] text-[#64748B] font-medium">
              Your Health. Your Time. Our Care.
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div
            title={
              isSupabaseConnected
                ? 'Connected to Supabase PostgreSQL Database & Auth'
                : 'Supabase ready for credentials in .env (VITE_SUPABASE_URL)'
            }
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-semibold clinical-shadow transition-colors ${
              isSupabaseConnected
                ? 'bg-[#F0FDF4] border-[#BBF7D0] text-[#16A34A]'
                : 'bg-white border-[#E2E8F0] text-[#64748B]'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isSupabaseConnected ? 'bg-[#16A34A] animate-pulse' : 'bg-[#94A3B8]'
              }`}
            />
            <span>{isSupabaseConnected ? 'SUPABASE CONNECTED' : 'SUPABASE READY'}</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#E2E8F0] text-[11px] font-semibold text-[#006B5F] clinical-shadow">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>256-BIT SSL ENCRYPTED</span>
          </div>
        </div>
      </header>

      {/* Main Auth Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-6">
        <div className="w-full max-w-[490px] bg-white rounded-2xl border border-[#E2E8F0] clinical-shadow-md overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-[#002541] via-[#123B5D] to-[#14B8A6]" />

          <div className="p-7 sm:p-8">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-12 h-12 rounded-xl bg-[#002541] text-white flex items-center justify-center mb-3 relative shadow-xs">
                <div className="w-6 h-6 border-2 border-white/80 rounded-md flex items-center justify-center text-sm font-bold">
                  +
                </div>
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#14B8A6] border-2 border-white" />
              </div>

              <div className="flex items-center gap-2 mb-1">
                <h1 className="font-display text-xl font-bold text-[#002541]">MediCure</h1>
                <span className="px-2 py-0.5 rounded bg-[#EFF4FF] text-[#006B5F] text-[10px] font-bold tracking-wider">
                  CLINICAL GATEWAY
                </span>
              </div>
              <p className="text-xs text-[#64748B] mb-3">Your Health. Your Time. Our Care.</p>

              <h2 className="font-display text-lg font-bold text-[#0B1C30]">
                {authMode === 'signin' ? 'Sign in to MediCure' : 'Create MediCure Account'}
              </h2>
              <p className="text-xs text-[#64748B] mt-1">
                {authMode === 'signin'
                  ? 'Select your role and authenticate with Supabase credentials.'
                  : 'Enter your clinical details to register a new account.'}
              </p>
            </div>

            {/* Mode Switcher (Sign In vs Register) */}
            <div className="flex rounded-lg bg-[#F1F5F9] p-1 mb-5 text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signin');
                  setNotice(null);
                }}
                className={`flex-1 py-1.5 rounded-md transition-all cursor-pointer ${
                  authMode === 'signin'
                    ? 'bg-white text-[#002541] shadow-xs'
                    : 'text-[#64748B] hover:text-[#002541]'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  setNotice(null);
                }}
                className={`flex-1 py-1.5 rounded-md transition-all cursor-pointer ${
                  authMode === 'register'
                    ? 'bg-white text-[#002541] shadow-xs'
                    : 'text-[#64748B] hover:text-[#002541]'
                }`}
              >
                Register New Account
              </button>
            </div>

            {/* Role Selector Tabs (Patient, Doctor, Front Desk, Admin) */}
            <div className="grid grid-cols-4 gap-1.5 p-1 bg-[#F1F5F9] rounded-xl mb-5">
              {ROLE_OPTIONS.map((role) => {
                const active = selectedRole === role.id;
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => handleRoleChange(role.id)}
                    className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                      active
                        ? 'bg-[#002541] text-white shadow-xs'
                        : 'text-[#42474E] hover:text-[#002541] hover:bg-white/60'
                    }`}
                  >
                    {role.icon}
                    <span>{role.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Quick Demo Pre-fill Pills */}
            <div className="mb-4 p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl">
              <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Demo Fast-Fill:</span>
                <span className="text-[#006B5F] font-semibold">Pass: Pass1234!</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {ROLE_OPTIONS.map((role) => (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => handleQuickDemoFill(role.id)}
                    className={`px-2 py-1 rounded text-[11px] font-medium border transition-colors cursor-pointer ${
                      selectedRole === role.id
                        ? 'bg-[#002541] text-white border-[#002541]'
                        : 'bg-white text-[#42474E] border-[#E2E8F0] hover:border-[#CBD5E1]'
                    }`}
                  >
                    {role.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Error Message */}
            {authError && (
              <div className="mb-4 p-3 rounded-lg bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#DC2626]">
                {authError}
              </div>
            )}

            {/* Notice / Feedback Message */}
            {notice && (
              <div className="mb-4 p-3 rounded-lg bg-[#F0F9FF] border border-[#BAE6FD] text-xs text-[#0284C7]">
                {notice}
              </div>
            )}

            {/* Credentials Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {authMode === 'register' && (
                <div>
                  <label className="block text-xs font-semibold text-[#0B1C30] mb-1.5">
                    Full Legal Name
                  </label>
                  <div className="relative">
                    <UserPlus className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={displayNameInput}
                      onChange={(e) => setDisplayNameInput(e.target.value)}
                      placeholder="e.g. Eleanor Vance"
                      className="w-full h-10 pl-9 pr-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm text-[#0B1C30] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#14B8A6] focus:bg-white transition-colors"
                    />
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-[#0B1C30]">
                    Email Address
                  </label>
                  <span className="text-[11px] text-[#64748B]">{currentRoleOption.hint}</span>
                </div>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="e.g. user@medicure-health.org"
                    className="w-full h-10 pl-9 pr-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm text-[#0B1C30] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#14B8A6] focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0B1C30] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Enter your account password"
                    className="w-full h-10 pl-9 pr-10 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm text-[#0B1C30] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#14B8A6] focus:bg-white transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0B1C30] cursor-pointer"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {authMode === 'signin' && (
                <div className="flex items-center justify-between text-xs">
                  <label className="inline-flex items-center gap-2 text-[#42474E] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberDevice}
                      onChange={(e) => setRememberDevice(e.target.checked)}
                      className="rounded border-[#CBD5E1] text-[#006B5F] focus:ring-[#14B8A6]"
                    />
                    <span>Remember this device</span>
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setNotice('Please contact your hospital IT administrator to reset your credentials.')
                    }
                    className="font-semibold text-[#002541] hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={isSigningIn}
                className="w-full h-11 bg-[#002541] hover:bg-[#123B5D] text-white rounded-lg text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-60"
              >
                <span>
                  {isSigningIn
                    ? 'Authenticating with Supabase...'
                    : authMode === 'signin'
                    ? `Sign In as ${currentRoleOption.label}`
                    : `Create ${currentRoleOption.label} Account`}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-5 pt-4 border-t border-[#E2E8F0] text-center space-y-2">
              <p className="text-xs text-[#64748B]">
                {authMode === 'signin' ? (
                  <>
                    New patient or staff member?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('register');
                        setNotice(null);
                      }}
                      className="font-semibold text-[#006B5F] hover:underline cursor-pointer"
                    >
                      Register here
                    </button>
                  </>
                ) : (
                  <>
                    Already have a MediCure account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('signin');
                        setNotice(null);
                      }}
                      className="font-semibold text-[#006B5F] hover:underline cursor-pointer"
                    >
                      Sign In
                    </button>
                  </>
                )}
              </p>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F0FDFA] border border-[#CCFBF1] text-[11px] font-medium text-[#006B5F]">
                <KeyRound className="w-3 h-3" />
                <span>Supabase PostgreSQL Auth • 256-bit SSL HIPAA Compliant</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Compliance Footer */}
      <footer className="w-full max-w-6xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#64748B]">
        <div className="flex flex-wrap items-center gap-4">
          <span className="inline-flex items-center gap-1 font-medium text-[#006B5F]">
            <ShieldCheck className="w-3.5 h-3.5" /> HIPAA COMPLIANT
          </span>
          <span className="inline-flex items-center gap-1 font-medium text-[#002541]">
            <ShieldCheck className="w-3.5 h-3.5" /> SOC 2 TYPE II
          </span>
          <span className="inline-flex items-center gap-1 font-medium">
            <Lock className="w-3.5 h-3.5" /> END-TO-END ENCRYPTED
          </span>
        </div>
        <div className="inline-flex items-center gap-1.5">
          <Phone className="w-3.5 h-3.5 text-[#002541]" />
          <span>Hospital Clinical Desk &amp; IT Hotline:</span>
          <span className="font-bold text-[#002541]">1-800-MEDICURE</span>
        </div>
      </footer>
    </div>
  );
};
