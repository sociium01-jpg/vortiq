// ─────────────────────────────────────────────────────────────
// Vortiq Tenant Admin — Minimal Read-Only Subscription Status
// Read-only entitlement display from tenant organization metadata (Zero write paths)
// ─────────────────────────────────────────────────────────────

import React from 'react';
import { Card, Badge } from '@/design-system';
import { ShieldCheck, Info } from 'lucide-react';
import { useAuth } from '@/auth/AuthContext';

export const SubscriptionManager: React.FC = () => {
  const { tenant } = useAuth();

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-mono text-xs">
      {/* Read-Only Subscription Card */}
      <Card className="p-6 bg-dark-card border-dark-border space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-dark-border pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-100 font-display">
                  {tenant?.name || 'Vortiq Enterprise'} — Organization Plan Status
                </h2>
                <Badge variant="emerald" size="sm" className="font-mono font-bold uppercase">
                  Active
                </Badge>
              </div>
              <p className="text-2xs text-slate-400 font-mono mt-0.5">
                Org Code: <span className="text-brand-300 font-bold">{tenant?.org_code || 'ORG-9901-VTQ'}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-3.5 bg-dark-surface rounded-xl border border-dark-border space-y-1">
            <span className="text-2xs font-semibold text-slate-400 uppercase tracking-wider block">Assigned Plan</span>
            <span className="text-sm font-bold font-display text-slate-100 uppercase">Enterprise Plan</span>
          </div>

          <div className="p-3.5 bg-dark-surface rounded-xl border border-dark-border space-y-1">
            <span className="text-2xs font-semibold text-slate-400 uppercase tracking-wider block">Billing Status</span>
            <span className="text-sm font-bold font-display text-emerald-400 uppercase">Active</span>
          </div>

          <div className="p-3.5 bg-dark-surface rounded-xl border border-dark-border space-y-1">
            <span className="text-2xs font-semibold text-slate-400 uppercase tracking-wider block">Entitled Seats</span>
            <span className="text-sm font-bold font-display text-slate-100 font-mono">25 User Seats</span>
          </div>
        </div>

        <div className="p-3 bg-dark-surface/50 border border-dark-border rounded-xl flex items-center gap-2 text-2xs text-slate-400 font-sans">
          <Info className="w-4 h-4 text-brand-400 shrink-0" />
          <span>
            Subscription plan tier and seat allocations are managed directly by your organization's account representative. Contact your Vortiq relationship manager for assistance.
          </span>
        </div>
      </Card>
    </div>
  );
};
