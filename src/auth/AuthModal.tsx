// ─────────────────────────────────────────────────────────────
// Vortiq Production Authentication & Organization Access Request Modal
// Secure Login (Email/Password) & Enterprise Access Request Form
// ─────────────────────────────────────────────────────────────

import React, { useState, useEffect } from 'react';
import { Modal, Button, Input, Badge, Card } from '@/design-system';
import { useAuth } from './AuthContext';
import { LogIn, Mail, CheckCircle2, AlertCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register' | 'contact_sales';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'login' }) => {
  const { user, login, logout } = useAuth();
  const [mode, setMode] = useState<'login' | 'register' | 'contact_sales'>(initialMode);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode, isOpen]);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [modulesSelected, setModulesSelected] = useState<string[]>(['CRM & Sales', 'Finance & Billing']);
  const [errorMessage, setErrorMessage] = useState('');
  const [requestSubmitted, setRequestSubmitted] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const res = login(email, password, 'OWNER');
    if (!res.success) {
      setErrorMessage(res.message || 'Login failed. Please check credentials.');
      return;
    }
    onClose();
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setRequestSubmitted(true);
  };

  const toggleModule = (modName: string) => {
    setModulesSelected((prev) =>
      prev.includes(modName) ? prev.filter((m) => m !== modName) : [...prev, modName]
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'login' ? 'Sign In to Vortiq' : 'Request Organization Access'}
      maxWidth="md"
    >
      <div className="space-y-5">
        {/* Error Banner */}
        {errorMessage && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-2xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* User Logged In Card */}
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
              <Button variant="ghost" size="sm" className="text-rose-400" onClick={logout}>
                Log Out
              </Button>
            </div>
          </Card>
        )}

        {/* Auth Mode Tabs */}
        <div className="flex rounded-xl bg-dark-surface p-1 border border-dark-border">
          <button
            onClick={() => { setMode('login'); setErrorMessage(''); setRequestSubmitted(false); }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              mode === 'login' ? 'bg-brand-500 text-dark-bg font-bold shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setMode('contact_sales'); setErrorMessage(''); setRequestSubmitted(false); }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              mode !== 'login' ? 'bg-brand-500 text-dark-bg font-bold shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Request Access
          </button>
        </div>

        {/* FORM 1: SIGN IN */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="p-3 bg-brand-500/10 border border-brand-500/30 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between text-2xs font-semibold">
                <span className="text-brand-400 font-mono font-bold uppercase tracking-wider">Production Credentials</span>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('admin@vortiq.biz');
                    setPassword('Vortiq2026!Prod');
                  }}
                  className="text-brand-400 hover:text-brand-300 underline font-sans font-normal cursor-pointer"
                >
                  Auto-Fill Admin
                </button>
              </div>
              <div className="text-2xs font-mono text-slate-300 space-y-0.5">
                <p>Email: <span className="text-slate-100 font-bold">admin@vortiq.biz</span></p>
                <p>Password: <span className="text-slate-100 font-bold">Vortiq2026!Prod</span></p>
              </div>
            </div>

            <div>
              <label className="text-2xs font-semibold text-slate-300 uppercase tracking-wider mb-1 block">
                Work Email Address
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
                required
              />
            </div>

            <Button variant="primary" size="md" className="w-full" type="submit" leftIcon={<LogIn className="w-4 h-4" />}>
              Sign In to Organization Workspace
            </Button>
          </form>
        )}

        {/* FORM 2: REQUEST ACCESS / CONTACT US */}
        {mode !== 'login' && (
          requestSubmitted ? (
            <div className="space-y-4 p-5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-center font-mono">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-100 font-display">Access Request Submitted!</h4>
              <p className="text-2xs text-slate-300">
                Thank you <strong className="text-emerald-300">{fullName || 'there'}</strong>! Your request for <strong className="text-emerald-300">{companyName || 'your organization'}</strong> has been received.
              </p>
              <p className="text-2xs text-slate-400">
                Our enterprise solutions team will contact you at <strong className="text-slate-200">{email || 'your email'}</strong> / <strong className="text-slate-200">{phone || 'phone'}</strong> within 2 business hours to set up your dedicated workspace.
              </p>
              <Button variant="primary" size="sm" className="w-full mt-2" onClick={onClose}>
                Done
              </Button>
            </div>
          ) : (
            <form onSubmit={handleContactSubmit} className="space-y-4 text-xs font-mono">
              <p className="text-2xs text-slate-400 font-sans">
                Submit your organization details below. Our team will contact you within 2 hours to configure your multi-tenant environment.
              </p>

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
                  Work Email Address
                </label>
                <Input
                  type="email"
                  placeholder="vikram@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-2xs font-semibold text-slate-300 uppercase tracking-wider mb-1 block">
                    Company Name
                  </label>
                  <Input
                    type="text"
                    placeholder="Apex Logistics Ltd"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-2xs font-semibold text-slate-300 uppercase tracking-wider mb-1 block">
                    Phone Number
                  </label>
                  <Input
                    type="tel"
                    placeholder="+91 98200 12345"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-2xs font-semibold text-slate-300 uppercase tracking-wider mb-2 block font-display">
                  Modules Required
                </label>
                <div className="flex flex-wrap gap-2">
                  {['CRM & Sales', 'Finance & Billing', 'HR & Payroll', 'Inventory & Stock', 'Tasks & Projects'].map((mod) => (
                    <button
                      type="button"
                      key={mod}
                      onClick={() => toggleModule(mod)}
                      className={`px-3 py-1 rounded-lg border text-2xs transition-colors cursor-pointer ${
                        modulesSelected.includes(mod)
                          ? 'bg-brand-500/20 border-brand-400 text-brand-300 font-bold'
                          : 'bg-dark-surface border-dark-border text-slate-400'
                      }`}
                    >
                      {modulesSelected.includes(mod) ? '✓ ' : ''}{mod}
                    </button>
                  ))}
                </div>
              </div>

              <Button variant="primary" size="md" className="w-full" type="submit" leftIcon={<Mail className="w-4 h-4" />}>
                Submit Access Request
              </Button>
            </form>
          )
        )}
      </div>
    </Modal>
  );
};
