// ─────────────────────────────────────────────────────────────
// Vortiq Internal Ops — Section 2: Client Detail Inspector Modal
// Deep-dive inspector for client registration, plan history, payment ledger, & audit log
// ─────────────────────────────────────────────────────────────

import React from 'react';
import { Modal, Badge, Button } from '@/design-system';
import { OpsClientOrg, OpsSubscriptionStatus, OpsClientAuditLog } from './types';
import { Building2, Mail, Calendar, ShieldCheck, History, Lock, Unlock, Clock } from 'lucide-react';

interface ClientDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: OpsClientOrg | null;
  onUpdateClient: (updated: OpsClientOrg) => void;
}

export const ClientDetailModal: React.FC<ClientDetailModalProps> = ({
  isOpen,
  onClose,
  client,
  onUpdateClient,
}) => {

  if (!client) return null;

  const handleExtendTrial = (days: number) => {
    const currentEnd = new Date(client.billing_period_end).getTime();
    const newEnd = new Date(currentEnd + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const newAuditLog: OpsClientAuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      actor_name: 'Alex Vance (Ops Lead)',
      action_type: 'TRIAL_EXTENSION',
      details: `Extended trial by ${days} days until ${newEnd}`,
    };

    const updated: OpsClientOrg = {
      ...client,
      billing_period_end: newEnd,
      subscription_status: 'trial',
      audit_logs: [newAuditLog, ...(client.audit_logs || [])],
    };
    onUpdateClient(updated);
  };

  const handleAdjustSeats = (delta: number) => {
    const updatedSeats = Math.max(1, client.seats_allocated + delta);
    const newAuditLog: OpsClientAuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      actor_name: 'Alex Vance (Ops Lead)',
      action_type: 'SEAT_ADJUSTMENT',
      details: `Adjusted allocated seats from ${client.seats_allocated} to ${updatedSeats}`,
    };

    const updated: OpsClientOrg = {
      ...client,
      seats_allocated: updatedSeats,
      audit_logs: [newAuditLog, ...(client.audit_logs || [])],
    };
    onUpdateClient(updated);
  };

  const handleToggleDeactivation = () => {
    const newStatus: OpsSubscriptionStatus = client.subscription_status === 'suspended' ? 'active' : 'suspended';
    const actionLabel = newStatus === 'suspended' ? 'DEACTIVATION_LOCK' : 'STATUS_CHANGE';
    const detailText = newStatus === 'suspended'
      ? 'Soft-locked client access across all user accounts in org'
      : 'Restored active client access';

    const newAuditLog: OpsClientAuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      actor_name: 'Alex Vance (Ops Lead)',
      action_type: actionLabel,
      details: detailText,
    };

    const updated: OpsClientOrg = {
      ...client,
      subscription_status: newStatus,
      audit_logs: [newAuditLog, ...(client.audit_logs || [])],
    };
    onUpdateClient(updated);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Client Account Inspector — ${client.org_name}`}
      maxWidth="lg"
    >
      <div className="space-y-6 font-mono text-xs text-slate-100 py-2">
        {/* Header Profile Summary */}
        <div className="p-4 bg-dark-card border border-dark-border rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-brand-500/10 text-brand-400">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-100 font-display">{client.org_name}</h2>
                <Badge
                  variant={
                    client.subscription_status === 'active'
                      ? 'emerald'
                      : client.subscription_status === 'trial'
                      ? 'amber'
                      : 'rose'
                  }
                  size="sm"
                  className="uppercase font-bold"
                >
                  {client.subscription_status}
                </Badge>
              </div>
              <p className="text-3xs text-slate-400 mt-0.5 flex items-center gap-2">
                <Mail className="w-3 h-3 text-slate-500" />
                <span>{client.registered_admin_email}</span>
                <span>•</span>
                <span>Org Code: <strong className="text-brand-300">{client.org_code}</strong></span>
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-3xs font-semibold text-slate-400 uppercase tracking-wider block">Assigned Tier</span>
            <span className="text-sm font-bold font-display text-emerald-400 uppercase">{client.plan_tier} Plan</span>
          </div>
        </div>

        {/* Client Metadata Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 bg-dark-surface rounded-xl border border-dark-border space-y-1">
            <span className="text-3xs font-semibold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-500" /> Registration Date
            </span>
            <span className="text-xs font-bold text-slate-200">{client.signup_date}</span>
          </div>

          <div className="p-3 bg-dark-surface rounded-xl border border-dark-border space-y-1">
            <span className="text-3xs font-semibold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-500" /> Billing / Trial End
            </span>
            <span className="text-xs font-bold text-amber-300">{client.billing_period_end}</span>
          </div>

          <div className="p-3 bg-dark-surface rounded-xl border border-dark-border space-y-1">
            <span className="text-3xs font-semibold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-slate-500" /> Allocated Seats
            </span>
            <span className="text-xs font-bold text-slate-200">{client.seats_used} / {client.seats_allocated} Seats Used</span>
          </div>
        </div>

        {/* Interactive Actions Panel */}
        <div className="p-4 bg-dark-card border border-dark-border rounded-xl space-y-4">
          <h3 className="text-xs font-bold text-slate-200 uppercase font-mono tracking-wider">
            Superadmin Account Actions (Logged)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Grant Trial Extension */}
            <div className="space-y-2 p-3 bg-dark-surface rounded-lg border border-dark-border">
              <span className="text-2xs font-semibold text-slate-300 block">Grant Trial Extension</span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handleExtendTrial(7)}>
                  +7 Days
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleExtendTrial(15)}>
                  +15 Days
                </Button>
              </div>
            </div>

            {/* Adjust Allocated Seats */}
            <div className="space-y-2 p-3 bg-dark-surface rounded-lg border border-dark-border">
              <span className="text-2xs font-semibold text-slate-300 block">Adjust Seat Allocation</span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handleAdjustSeats(5)}>
                  +5 Seats
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleAdjustSeats(-5)}>
                  -5 Seats
                </Button>
              </div>
            </div>

            {/* Soft-Lock Deactivation */}
            <div className="space-y-2 p-3 bg-dark-surface rounded-lg border border-dark-border">
              <span className="text-2xs font-semibold text-slate-300 block">Access Control</span>
              <Button
                variant={client.subscription_status === 'suspended' ? 'primary' : 'danger'}
                size="sm"
                className="w-full"
                leftIcon={client.subscription_status === 'suspended' ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                onClick={handleToggleDeactivation}
              >
                {client.subscription_status === 'suspended' ? 'Reactivate Client Access' : 'Deactivate (Soft-Lock)'}
              </Button>
            </div>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-200 uppercase font-mono tracking-wider flex items-center gap-2">
              <History className="w-4 h-4 text-brand-400" /> Account Audit History (`ops_client_audit_logs`)
            </h3>
            <span className="text-2xs text-slate-400 font-mono">{client.audit_logs?.length || 0} Entries</span>
          </div>

          <div className="border border-dark-border rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-dark-border text-2xs uppercase font-mono text-slate-400 bg-dark-surface/50">
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Actor</th>
                  <th className="py-2.5 px-3">Action</th>
                  <th className="py-2.5 px-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border text-2xs font-mono">
                {client.audit_logs && client.audit_logs.length > 0 ? (
                  client.audit_logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/20">
                      <td className="py-2.5 px-3 text-slate-400">{log.timestamp}</td>
                      <td className="py-2.5 px-3 text-slate-200 font-semibold">{log.actor_name}</td>
                      <td className="py-2.5 px-3">
                        <Badge variant="blue" size="sm">{log.action_type}</Badge>
                      </td>
                      <td className="py-2.5 px-3 text-slate-300">{log.details}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-slate-500 font-mono text-xs">
                      No audit log entries recorded for this client.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close Inspector
          </Button>
        </div>
      </div>
    </Modal>
  );
};
