// ─────────────────────────────────────────────────────────────
// Vortiq Secure Login & Registration Modal
// Supports multi-role login, demo role switching, & clean org registration
// ─────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { Modal, Button, Input, Badge, Card } from '@/design-system';
import { useAuth } from './AuthContext';
import { UserRole } from '@/types';
import { ArrowRight, Sparkles, LogIn } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { user, login, register, loginDemo, logout, toggleDemoData, isDemoData } = useAuth();
  const [mode, setMode] = useState<'login' | 'register' | 'switch_role'>('login');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    login(email, 'ADMIN');
    onClose();
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !companyName) return;
    register(fullName, email, companyName);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'register' ? 'Create Vortiq Account' : mode === 'switch_role' ? 'Switch Role Demo' : 'Secure Login'}
      maxWidth="md"
    >
      <div className="space-y-5">
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
            onClick={() => setMode('login')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              mode === 'login' ? 'bg-brand-500 text-dark-bg font-bold shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Log In
          </button>
          <button
            onClick={() => setMode('register')}
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
            {/* Quick Fill Production Credentials Banner */}
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
                Work Email
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
                Work Email
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

            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-2xs text-amber-300 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                New registration starts with a <strong>Clean Workspace</strong> (empty state). You can add real business data or toggle demo data anytime.
              </span>
            </div>

            <Button variant="primary" size="md" className="w-full" type="submit" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Create Organization & Launch
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
  );
};
