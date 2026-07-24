// ─────────────────────────────────────────────────────────────
// Vortiq Secure Login, Registration & Email Verification Modal
// Email Validation, OTP Verification, and Multi-Tenant Isolation
// ─────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { Modal, Button, Input, Badge, Card } from '@/design-system';
import { useAuth } from './AuthContext';
import { UserRole } from '@/types';
import { ArrowRight, LogIn, Mail, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const {
    user,
    login,
    initiateRegistration,
    confirmEmailOTP,
    cancelVerification,
    pendingVerification,
    isVerifyModalOpen,
    loginDemo,
    logout,
    toggleDemoData,
    isDemoData,
  } = useAuth();

  const [mode, setMode] = useState<'login' | 'register' | 'switch_role'>('login');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const res = login(email, password, 'OWNER');
    if (!res.success) {
      setErrorMessage(res.message || 'Login failed');
      return;
    }
    onClose();
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const res = initiateRegistration(fullName, email, companyName);
    if (!res.success) {
      setErrorMessage(res.message || 'Registration failed');
      return;
    }
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const res = confirmEmailOTP(otpInput);
    if (!res.success) {
      setErrorMessage(res.message || 'Verification failed');
      return;
    }
    onClose();
  };

  return (
    <>
      {/* Primary Auth Modal */}
      <Modal
        isOpen={isOpen && !isVerifyModalOpen}
        onClose={onClose}
        title={mode === 'register' ? 'Create Organization Account' : mode === 'switch_role' ? 'Switch Role Demo' : 'Secure Login'}
        maxWidth="md"
      >
        <div className="space-y-5">
          {/* Error Banner if any */}
          {errorMessage && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-2xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Account Status Card if logged in */}
          {user && mode === 'login' && (
            <Card className="p-4 bg-dark-surface/60 border-dark-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-200">{user.full_name}</p>
                  <p className="text-2xs text-slate-400 font-mono">{user.email}</p>
                </div>
                <Badge variant="emerald" size="sm">{user.role}</Badge>
              </div>
              <div className="mt-3 flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setMode('switch_role')}>
                  Switch Role
                </Button>
                <Button variant="ghost" size="sm" className="text-rose-400" onClick={logout}>
                  Log Out
                </Button>
              </div>
            </Card>
          )}

          {/* Auth Mode Toggle */}
          <div className="flex rounded-xl bg-dark-surface p-1 border border-dark-border">
            <button
              onClick={() => { setMode('login'); setErrorMessage(''); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                mode === 'login' ? 'bg-brand-500 text-dark-bg font-bold shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Log In
            </button>
            <button
              onClick={() => { setMode('register'); setErrorMessage(''); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                mode === 'register' ? 'bg-brand-500 text-dark-bg font-bold shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              New Organization Setup
            </button>
          </div>

          {/* Form: Login */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="p-3 bg-brand-500/10 border border-brand-500/30 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between text-2xs font-semibold">
                  <span className="text-brand-400 font-mono font-bold uppercase tracking-wider">Production Account Credentials</span>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('admin@vortiq.biz');
                      setPassword('Vortiq2026!Prod');
                    }}
                    className="text-brand-400 hover:text-brand-300 underline font-sans font-normal"
                  >
                    Quick Auto-Fill
                  </button>
                </div>
                <div className="text-2xs font-mono text-slate-300 space-y-0.5">
                  <p>Email: <span className="text-slate-100 font-bold">admin@vortiq.biz</span></p>
                  <p>Password: <span className="text-slate-100 font-bold">Vortiq2026!Prod</span></p>
                </div>
              </div>

              <div>
                <label className="text-2xs font-semibold text-slate-300 uppercase tracking-wider mb-1 block">
                  Work Email (RFC Validated)
                </label>
                <Input
                  type="email"
                  placeholder="admin@vortiq.biz"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-2xs font-semibold text-slate-300 uppercase tracking-wider mb-1 block">
                  Password
                </label>
                <Input
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <Button variant="primary" size="md" className="w-full" type="submit" leftIcon={<LogIn className="w-4 h-4" />}>
                Sign In to Production Workspace
              </Button>
            </form>
          )}

          {/* Form: Register New Organization */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="text-2xs font-semibold text-slate-300 uppercase tracking-wider mb-1 block">
                  Full Name
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Vikram Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-2xs font-semibold text-slate-300 uppercase tracking-wider mb-1 block">
                  Valid Work Email Address (Email OTP Required)
                </label>
                <Input
                  type="email"
                  placeholder="vikram@yourcompany.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-2xs font-semibold text-slate-300 uppercase tracking-wider mb-1 block">
                  Company / Organization Name
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Apex Enterprises Pvt Ltd"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                />
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-2xs text-amber-300 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Unique Organization ID Assigned Automatically</span>
                </div>
                <p className="text-slate-400">
                  Your organization gets a unique Org Code (e.g. <code className="text-amber-300 font-mono">ORG-8419-APE</code>) ensuring 100% isolated data storage.
                </p>
              </div>

              <Button variant="primary" size="md" className="w-full" type="submit" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Send Verification OTP Code
              </Button>
            </form>
          )}

          {/* Role Quick Switcher Demo */}
          {mode === 'switch_role' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400">Select a role to simulate RBAC access controls:</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { role: 'OWNER', label: 'Owner (All Access)' },
                  { role: 'ADMIN', label: 'System Admin' },
                  { role: 'HR_ADMIN', label: 'HR & Payroll Admin' },
                  { role: 'FINANCE_ADMIN', label: 'Finance & Tax Admin' },
                  { role: 'MANAGER', label: 'Manager' },
                  { role: 'MEMBER', label: 'Team Member' },
                ].map(({ role, label }) => (
                  <button
                    key={role}
                    onClick={() => {
                      loginDemo(role as UserRole);
                      setMode('login');
                      onClose();
                    }}
                    className="p-2.5 rounded-xl border border-dark-border bg-dark-card hover:bg-dark-surface text-left text-xs transition-colors"
                  >
                    <p className="font-semibold text-slate-200">{role}</p>
                    <p className="text-2xs text-slate-400">{label}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Workspace Mode Switcher Footer */}
          <div className="pt-3 border-t border-dark-border/60 flex items-center justify-between text-xs">
            <span className="text-slate-400">Sample Demo Data</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleDemoData(!isDemoData)}
              className={isDemoData ? 'text-amber-400 font-semibold' : 'text-slate-400'}
            >
              {isDemoData ? 'Enabled (Click to Clear)' : 'Disabled (Click to Load)'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Email Verification OTP Modal */}
      <Modal
        isOpen={isVerifyModalOpen}
        onClose={cancelVerification}
        title="Verify Work Email Address"
        maxWidth="sm"
      >
        <form onSubmit={handleOtpSubmit} className="space-y-5">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 flex items-center justify-center mx-auto">
              <Mail className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-100 font-display">Verification Code Sent</h4>
            <p className="text-xs text-slate-400">
              We sent a 6-digit verification OTP code to <span className="text-slate-200 font-bold font-mono">{pendingVerification?.email}</span>.
            </p>
          </div>

          {/* Verification Code Box */}
          <div className="p-3 bg-dark-surface border border-dark-border rounded-xl text-center space-y-1">
            <span className="text-2xs uppercase text-slate-400 tracking-wider font-semibold">Verification OTP Code</span>
            <div className="text-2xl font-black font-mono tracking-widest text-brand-400">
              {pendingVerification?.otpCode}
            </div>
            <p className="text-2xs text-slate-400 italic">Enter the 6-digit code above to complete setup.</p>
          </div>

          {errorMessage && (
            <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-2xs text-rose-300 text-center">
              {errorMessage}
            </div>
          )}

          <div>
            <label className="text-2xs font-semibold text-slate-300 uppercase tracking-wider mb-1 block">
              Enter 6-Digit OTP Code
            </label>
            <Input
              type="text"
              placeholder="e.g. 849201"
              value={otpInput}
              onChange={(e) => setOtpInput(e.target.value)}
              className="text-center font-mono text-lg tracking-wider"
              maxLength={6}
              required
            />
          </div>

          <div className="flex gap-2">
            <Button variant="ghost" size="md" className="flex-1" type="button" onClick={cancelVerification}>
              Cancel
            </Button>
            <Button variant="primary" size="md" className="flex-1" type="submit" leftIcon={<CheckCircle2 className="w-4 h-4" />}>
              Verify & Complete
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};
