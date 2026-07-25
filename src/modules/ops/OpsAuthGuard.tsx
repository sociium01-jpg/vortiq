// ─────────────────────────────────────────────────────────────
// Vortiq Internal Ops — Superadmin Auth Guard Modal
// Internal Auth Realm for Vortiq Employees Only
// ─────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { Modal, Button, Input } from '@/design-system';
import { ShieldCheck, Lock, AlertCircle } from 'lucide-react';

interface OpsAuthGuardProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticated: (opsUserEmail: string) => void;
}

export const OpsAuthGuard: React.FC<OpsAuthGuardProps> = ({
  isOpen,
  onClose,
  onAuthenticated,
}) => {
  const [email, setEmail] = useState('ops@vortiq.biz');
  const [password, setPassword] = useState('VortiqOps2026!Master');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    setTimeout(() => {
      setIsLoading(false);
      if (email.endsWith('@vortiq.biz') && password.length >= 6) {
        onAuthenticated(email);
      } else {
        setError('ACCESS DENIED: Credentials restricted to authorized Vortiq internal employees (@vortiq.biz).');
      }
    }, 600);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Vortiq Internal Employee Ops Portal — Authentication Realm"
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2 text-2xs text-rose-300">
          <Lock className="w-4 h-4 text-rose-400 shrink-0" />
          <span>Restricted Portal: Access reserved strictly for Vortiq internal operations and superadmins.</span>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/20 border border-rose-500/50 rounded-xl text-2xs text-rose-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Internal Ops Email</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ops@vortiq.biz"
            required
          />
        </div>

        <div>
          <label className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Superadmin Keycode</label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            required
          />
        </div>

        <Button
          variant="primary"
          size="md"
          className="w-full"
          type="submit"
          isLoading={isLoading}
          leftIcon={<ShieldCheck className="w-4 h-4" />}
        >
          Authenticate & Launch Ops Portal
        </Button>
      </form>
    </Modal>
  );
};
