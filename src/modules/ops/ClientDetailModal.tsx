// ─────────────────────────────────────────────────────────────
// Vortiq Internal Ops — Section 2: Client Detail Inspector Modal
// Deep-dive inspector for client registration, plan history, payment ledger, & audit log
// ─────────────────────────────────────────────────────────────

import React from 'react';
import { Modal, Badge, DataTable } from '@/design-system';
import { OpsClientOrg } from './types';
import { Building2, Mail, Calendar, ShieldCheck, CreditCard, History, IndianRupee } from 'lucide-react';

interface ClientDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: OpsClientOrg | null;
}

export const ClientDetailModal: React.FC<ClientDetailModalProps> = ({
  isOpen,
  onClose,
  client,
}) => {
  if (!client) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Client Account Inspector — ${client.org_name}`}
      maxWidth="lg"
    >
      <div className="space-y-6 font-mono text-xs text-slate-100">
        {/* Header Profile Summary */}
        <div className="p-4 bg-dark-card border border-dark-border rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-brand-500/10 text-brand-400">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-100 font-display">{client.org_name}</h2>
                <Badge variant={client.subscription_status === 'active' ? 'emerald' : 'amber'} size="sm" className="uppercase font-bold">
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
            <span className="text-xs font-bold text-slate-200">{new Date(client.signup_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
          </div>

          <div className="p-3 bg-dark-surface rounded-xl border border-dark-border space-y-1">
            <span className="text-3xs font-semibold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-slate-500" /> Seat Allocation
            </span>
            <span className="text-xs font-bold text-slate-200">{client.seats_used} / {client.seats_allocated} Seats Used</span>
          </div>

          <div className="p-3 bg-dark-surface rounded-xl border border-dark-border space-y-1">
            <span className="text-3xs font-semibold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
              <IndianRupee className="w-3 h-3 text-emerald-400" /> Billing Period End
            </span>
            <span className="text-xs font-bold text-emerald-400">{new Date(client.billing_period_end).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
          </div>
        </div>

        {/* Client Payment History Ledger */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-display flex items-center gap-1.5">
            <CreditCard className="w-4 h-4 text-emerald-400" />
            Client Payment Ledger & Renewal History
          </h3>

          <DataTable
            data={client.payment_history || []}
            keyExtractor={(item) => item.id}
            columns={[
              {
                key: 'payment_date',
                header: 'Payment Date',
                render: (item) => new Date(item.payment_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
              },
              {
                key: 'amount',
                header: 'Amount',
                render: (item) => `₹${item.amount_rupees.toLocaleString('en-IN')}`,
              },
              {
                key: 'payment_method',
                header: 'Payment Mode',
                render: (item) => <span className="uppercase text-3xs font-bold text-slate-300">{item.payment_method.replace(/_/g, ' ')}</span>,
              },
              {
                key: 'reference_number',
                header: 'Reference #',
                render: (item) => item.reference_number,
              },
              {
                key: 'recorded_by_name',
                header: 'Recorded By',
                render: (item) => item.recorded_by_name,
              },
            ]}
          />
        </div>

        {/* Internal Ops Audit Logs */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-display flex items-center gap-1.5">
            <History className="w-4 h-4 text-brand-400" />
            Internal Superadmin Audit Log Stream
          </h3>

          <DataTable
            data={client.audit_logs || []}
            keyExtractor={(log) => log.id}
            columns={[
              {
                key: 'timestamp',
                header: 'Timestamp',
                render: (log) => new Date(log.timestamp).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
              },
              {
                key: 'actor_name',
                header: 'Actor',
                render: (log) => log.actor_name,
              },
              {
                key: 'action_type',
                header: 'Action Type',
                render: (log) => <Badge variant="violet" size="sm">{log.action_type}</Badge>,
              },
              {
                key: 'details',
                header: 'Details',
                render: (log) => log.details,
              },
            ]}
          />
        </div>
      </div>
    </Modal>
  );
};
