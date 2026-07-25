// ─────────────────────────────────────────────────────────────
// Vortiq Internal Ops — Client Directory & Subscription Lifecycle
// Superadmin view across all client tenant spaces with Days Remaining countdown
// ─────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { Card, Button, Badge, Input, Select } from '@/design-system';
import { OpsClientOrg, OpsSubscriptionStatus } from './types';
import { Search, Clock, Building2, Plus, DollarSign } from 'lucide-react';

interface OpsClientDirectoryProps {
  clients: OpsClientOrg[];
  onUpdateStatus: (clientId: string, newStatus: OpsSubscriptionStatus) => void;
  onOpenProvisioningModal: () => void;
  onOpenPaymentModal: (client: OpsClientOrg) => void;
}

export const OpsClientDirectory: React.FC<OpsClientDirectoryProps> = ({
  clients,
  onUpdateStatus,
  onOpenProvisioningModal,
  onOpenPaymentModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterExpiringSoon, setFilterExpiringSoon] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Calculate days remaining helper
  const getDaysRemaining = (endDateStr: string): number => {
    const end = new Date(endDateStr).getTime();
    const now = new Date().getTime();
    return Math.ceil((end - now) / (1000 * 3600 * 24));
  };

  const filteredClients = clients.filter((c) => {
    const daysLeft = getDaysRemaining(c.billing_period_end);
    const matchesExpiringSoon = !filterExpiringSoon || (daysLeft <= 7 && daysLeft >= 0);
    const matchesStatus = statusFilter === 'all' || c.subscription_status === statusFilter;
    const matchesSearch =
      !searchQuery.trim() ||
      c.org_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.admin_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.org_code.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesExpiringSoon && matchesStatus && matchesSearch;
  });

  return (
    <Card className="p-5 bg-dark-card border-dark-border space-y-4 font-mono text-xs">
      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-dark-border pb-3">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-display flex items-center gap-2">
            <Building2 className="w-4 h-4 text-brand-400" />
            Client Directory & Subscription Tracker ({filteredClients.length})
          </h3>
          <p className="text-2xs text-slate-400 font-mono mt-0.5">
            Phase 1 Manual Lifecycle Tracking • Clean Enums for Future Razorpay Webhooks
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className={filterExpiringSoon ? 'bg-amber-500/20 border-amber-500/50 text-amber-300' : ''}
            leftIcon={<Clock className="w-3.5 h-3.5 text-amber-400" />}
            onClick={() => setFilterExpiringSoon(!filterExpiringSoon)}
          >
            Expiring Soon (≤7 Days)
          </Button>

          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={onOpenProvisioningModal}
          >
            Provision New Client
          </Button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:w-72">
          <Input
            type="text"
            placeholder="Search company, email, or org code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-3.5 h-3.5 text-slate-400" />}
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-2xs text-slate-400 uppercase tracking-wider">Status:</span>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'active', label: 'Active' },
              { value: 'trial', label: 'Trial' },
              { value: 'suspended', label: 'Suspended' },
              { value: 'cancelled', label: 'Cancelled' },
            ]}
          />
        </div>
      </div>

      {/* Client List Table */}
      <div className="overflow-x-auto border border-dark-border rounded-xl">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-dark-surface border-b border-dark-border text-2xs text-slate-400 uppercase tracking-wider font-semibold">
              <th className="p-3">Client Organization</th>
              <th className="p-3">Registered Admin</th>
              <th className="p-3">Plan Tier</th>
              <th className="p-3 text-center">Status</th>
              <th className="p-3 text-center">Days Remaining</th>
              <th className="p-3 text-right">Total Revenue</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-border/60">
            {filteredClients.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-400 font-sans">
                  No matching client organization records found.
                </td>
              </tr>
            ) : (
              filteredClients.map((client) => {
                const daysLeft = getDaysRemaining(client.billing_period_end);
                const isOverdue = daysLeft < 0;

                return (
                  <tr key={client.id} className="hover:bg-dark-surface/40 transition-colors">
                    <td className="p-3">
                      <span className="font-bold text-slate-100 block">{client.org_name}</span>
                      <span className="text-2xs text-brand-400 font-mono">{client.org_code}</span>
                    </td>
                    <td className="p-3">
                      <span className="text-slate-200 block font-sans">{client.admin_name}</span>
                      <span className="text-2xs text-slate-400 font-mono">{client.admin_email}</span>
                    </td>
                    <td className="p-3">
                      <Badge variant={client.plan_tier === 'enterprise' ? 'violet' : client.plan_tier === 'pro' ? 'emerald' : 'blue'} size="sm" className="uppercase font-mono font-bold">
                        {client.plan_tier}
                      </Badge>
                    </td>
                    <td className="p-3 text-center">
                      <select
                        value={client.subscription_status}
                        onChange={(e) => onUpdateStatus(client.id, e.target.value as OpsSubscriptionStatus)}
                        className={`px-2 py-1 rounded-md text-2xs font-bold uppercase font-mono border cursor-pointer ${
                          client.subscription_status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : client.subscription_status === 'trial'
                            ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                            : client.subscription_status === 'suspended'
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            : 'bg-slate-500/10 text-slate-400 border-slate-500/30'
                        }`}
                      >
                        <option value="active">ACTIVE</option>
                        <option value="trial">TRIAL</option>
                        <option value="suspended">SUSPENDED</option>
                        <option value="cancelled">CANCELLED</option>
                      </select>
                    </td>
                    <td className="p-3 text-center font-mono">
                      <span
                        className={`px-2 py-0.5 rounded font-bold ${
                          isOverdue
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                            : daysLeft <= 7
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-dark-surface text-slate-300'
                        }`}
                      >
                        {isOverdue ? `${Math.abs(daysLeft)} days overdue` : `${daysLeft} days left`}
                      </span>
                    </td>
                    <td className="p-3 text-right font-bold text-slate-100 font-mono">
                      ₹{client.total_paid_rupees.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3 text-right">
                      <Button
                        variant="secondary"
                        size="sm"
                        leftIcon={<DollarSign className="w-3 h-3 text-emerald-400" />}
                        onClick={() => onOpenPaymentModal(client)}
                      >
                        Log Payment
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
