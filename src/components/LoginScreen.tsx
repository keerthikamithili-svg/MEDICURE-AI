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
} from 'lucide-react';
import { UserRole } from '../types/medicure';

interface LoginScreenProps {
  onGoogleSignIn: (role: UserRole) => Promise<void>;
  isSigningIn: boolean;
  authError: string | null;
  isSupabaseConnected?: boolean;
  databaseProvider?: 'Supabase' | 'Firebase';
}

const ROLE_OPTIONS: { id: UserRole; label: string; icon: React.ReactNode; hint: string }[] = [
  { id: 'patient', label: 'Patient', icon: <User className="w-4 h-4" />, hint: 'Primary Patient ID' },
  { id: 'doctor', label: 'Doctor', icon: <Stethoscope className="w-4 h-4" />, hint: 'NPI / Physician ID' },
  { id: 'receptionist', label: 'Front Desk', icon: <Building2 className="w-4 h-4" />, hint: 'Desk Operator ID' },
  { id: 'admin', label: 'Admin', icon: <UserCheck className="w-4 h-4" />, hint: 'Executive Clearance ID' },
];

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onGoogleSignIn,
  isSigningIn,
  authError,
  isSupabaseConnected,
  databaseProvider,
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('patient');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);

  const currentRoleOption = ROLE_OPTIONS.find((r) => r.id === selectedRole) || ROLE_OPTIONS[0];

  const handleCredentialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotice(null);
    await onGoogleSignIn(selectedRole);
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
                ? 'Connected to Supabase PostgreSQL Database'
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
                  PORTAL GATEWAY
                </span>
              </div>
              <p className="text-xs text-[#64748B] mb-4">Your Health. Your Time. Our Care.</p>

              <h2 className="font-display text-lg font-bold text-[#0B1C30]">
                Sign in to MediCure
              </h2>
              <p className="text-xs text-[#64748B] mt-1">
                Select your user role to access your dedicated healthcare portal.
              </p>
            </div>

            {/* Role Selector Tabs */}
            <div className="grid grid-cols-4 gap-1.5 p-1 bg-[#F1F5F9] rounded-xl mb-5">
              {ROLE_OPTIONS.map((role) => {
                const active = selectedRole === role.id;
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setSelectedRole(role.id)}
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

            {/* Google Sign-In Button */}
            <button
              type="button"
              onClick={() => onGoogleSignIn(selectedRole)}
              disabled={isSigningIn}
              className="w-full flex items-center justify-center gap-2.5 h-10 px-4 bg-white border border-[#E2E8F0] rounded-lg text-sm font-semibold text-[#0B1C30] hover:bg-[#F8FAFC] hover:border-[#CBD5E1] transition-colors cursor-pointer disabled:opacity-60"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z"
                />
              </svg>
              <span>{isSigningIn ? 'Connecting to MediCure SSO...' : 'Continue with Google'}</span>
            </button>

            <div className="relative my-5 flex items-center justify-center">
              <div className="border-t border-[#E2E8F0] w-full" />
              <span className="bg-white px-3 text-[10px] font-semibold tracking-wider text-[#64748B] uppercase whitespace-nowrap">
                OR SIGN IN WITH CREDENTIALS
              </span>
              <div className="border-t border-[#E2E8F0] w-full" />
            </div>

            {authError && (
              <div className="mb-4 p-3 rounded-lg bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#DC2626]">
                {authError}
              </div>
            )}

            {notice && (
              <div className="mb-4 p-3 rounded-lg bg-[#F0F9FF] border border-[#BAE6FD] text-xs text-[#0284C7]">
                {notice}
              </div>
            )}

            <form onSubmit={handleCredentialSubmit} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-[#0B1C30]">
                    Email Address or Medical Record Phone
                  </label>
                  <span className="text-[11px] text-[#64748B]">{currentRoleOption.hint}</span>
                </div>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="e.g. sarah.jenkins@example.com or (555) 019-2834"
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

              <div className="flex items-center justify-between text-xs">
                <label className="inline-flex items-center gap-2 text-[#42474E] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberDevice}
                    onChange={(e) => setRememberDevice(e.target.checked)}
                    className="rounded border-[#CBD5E1] text-[#006B5F] focus:ring-[#14B8A6]"
                  />
                  <span>Remember me on this device</span>
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setNotice(
                      'MediCure uses verified Google Workspace / Identity SSO for clinical security. Click Continue with Google to access your portal.'
                    )
                  }
                  className="font-semibold text-[#002541] hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isSigningIn}
                className="w-full h-11 bg-[#002541] hover:bg-[#123B5D] text-white rounded-lg text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-60"
              >
                <span>Sign In as {currentRoleOption.label}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-5 pt-4 border-t border-[#E2E8F0] text-center space-y-2">
              <p className="text-xs text-[#64748B]">
                New patient or family dependent?{' '}
                <button
                  type="button"
                  onClick={() => onGoogleSignIn('patient')}
                  className="font-semibold text-[#006B5F] hover:underline cursor-pointer"
                >
                  Create a patient account
                </button>
              </p>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F0FDFA] border border-[#CCFBF1] text-[11px] font-medium text-[#006B5F]">
                <Lock className="w-3 h-3" />
                <span>Encrypted with 256-bit SSL &amp; HIPAA Patient Identity Standard</span>
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
