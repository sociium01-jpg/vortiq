// ─────────────────────────────────────────────────────────────
// Vortiq Internal Ops — Client Directory & Subscription Lifecycle
// Superadmin view across all client tenant spaces with Days Remaining countdown & Client Inspector
// ─────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { Card, Button, Badge, Input, Select } from '@/design-system';
import { OpsClientOrg, OpsSubscriptionStatus } from './types';
import { Search, Clock, Building2, Plus, IndianRupee, Eye } from 'lucide-react';

interface OpsClientDirectoryProps {
  clients: OpsClientOrg[];
  onUpdateStatus: (clientId: string, newStatus: OpsSubscriptionStatus) => void;
  onOpenProvisioningModal: () => void;
  onOpenManualPaymentModal: (client: OpsClientOrg) => void;
  onInspectClient: (client: OpsClientOrg) => void;
  initialStatusFilter?: string;
}

export const OpsClientDirectory: React.FC<OpsClientDirectoryProps> = ({
  clients,
  onUpdateStatus,
  onOpenProvisioningModal,
  onOpenManualPaymentModal,
  onInspectClient,
  initialStatusFilter = 'all',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterExpiringSoon, setFilterExpiringSoon] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>(initialStatusFilter);

  // Calculate days remaining helper
  const getDaysRemaining = (endDateStr: string): number => {
    const end = new Date(endDateStr).getTime();
    const now = new Date().getTime();
    const diffDays = Math.ceil((end - now) / (1000 * 3600 * 24));
    return diffDays;
  };

  const filteredClients = clients.filter((c) => {
    const matchesSearch =
      c.org_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.registered_admin_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.org_code.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || c.subscription_status === statusFilter;

    const daysLeft = getDaysRemaining(c.billing_period_end);
    const matchesExpiring = !filterExpiringSoon || (daysLeft <= 7 && daysLeft >= 0);

    return matchesSearch && matchesStatus && matchesExpiring;
  });

  return (
    <div className="space-y-6 font-mono text-xs text-slate-100">
      {/* Search & Filter Header Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 bg-dark-card border border-dark-border rounded-xl shadow-sm">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by company name, email, or org code..."
              className="pl-9"
            />
          </div>

          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Subscription Statuses' },
              { value: 'active', label: 'Active Subscriptions' },
              { value: 'trial', label: 'Free Trial Period' },
              { value: 'renewal_due', label: 'Renewal Due' },
              { value: 'suspended', label: 'Suspended Accounts' },
              { value: 'cancelled', label: 'Cancelled Accounts' },
            ]}
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={filterExpiringSoon ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilterExpiringSoon((prev) => !prev)}
            leftIcon={<Clock className="w-3.5 h-3.5" />}
          >
            {filterExpiringSoon ? 'Showing Expiring (≤7 Days)' : 'Filter Expiring Soon'}
          </Button>

          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={onOpenProvisioningModal}
          >
            Provision Client
          </Button>
        </div>
      </div>

      {/* Directory Count */}
      <div className="flex items-center justify-between text-2xs text-slate-400 font-semibold uppercase tracking-wider">
        <span>Vortiq Client Directory ({filteredClients.length} Organizations)</span>
        <span>Manual Superadmin Control Realm</span>
      </div>

      {/* Client Directory List Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredClients.map((client) => {
          const daysLeft = getDaysRemaining(client.billing_period_end);
          const isExpiringSoon = daysLeft <= 7 && daysLeft >= 0;
          const isOverdue = daysLeft < 0;

          return (
            <Card
              key={client.id}
              className={`p-5 bg-dark-card border transition-all space-y-4 ${
                isOverdue
                  ? 'border-rose-500/50 bg-rose-950/10'
                  : isExpiringSoon
                  ? 'border-amber-500/50 bg-amber-950/10'
                  : 'border-dark-border'
              }`}
            >
              {/* Header: Company & Tier */}
              <div className="flex items-start justify-between gap-3 border-b border-dark-border pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-brand-500/10 text-brand-400 shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-100 font-display text-sm">{client.org_name}</h3>
                      <Badge variant="emerald" size="sm" className="font-mono text-3xs font-bold uppercase">
                        {client.org_code}
                      </Badge>
                    </div>
                    <p className="text-3xs text-slate-400 font-mono mt-0.5">{client.registered_admin_email}</p>
                  </div>
                </div>

                <Badge variant="violet" size="sm" className="uppercase font-bold shrink-0">
                  {client.plan_tier}
                </Badge>
              </div>

              {/* Status Pills & Days Remaining */}
              <div className="grid grid-cols-2 gap-3 text-2xs font-mono">
                <div>
                  <span className="text-3xs text-slate-400 font-semibold uppercase tracking-wider block mb-1">Status Override</span>
                  <select
                    value={client.subscription_status}
                    onChange={(e) => onUpdateStatus(client.id, e.target.value as OpsSubscriptionStatus)}
                    className="w-full bg-dark-surface border border-dark-border rounded-lg px-2 py-1 text-slate-200 font-mono focus:outline-none focus:border-brand-500"
                  >
                    <option value="active">ACTIVE</option>
                    <option value="trial">TRIAL</option>
                    <option value="renewal_due">RENEWAL DUE</option>
                    <option value="suspended">SUSPENDED</option>
                    <option value="cancelled">CANCELLED</option>
                  </select>
                </div>

                <div>
                  <span className="text-3xs text-slate-400 font-semibold uppercase tracking-wider block mb-1">Days Remaining</span>
                  <div className="flex items-center gap-1.5 pt-0.5">
                    <Badge
                      variant={isOverdue ? 'rose' : isExpiringSoon ? 'amber' : 'emerald'}
                      size="sm"
                      className="font-bold font-mono"
                    >
                      {isOverdue ? `EXPIRED (${Math.abs(daysLeft)}d overdue)` : `${daysLeft} Days Left`}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Seat Allocations & MRR */}
              <div className="flex items-center justify-between text-3xs border-t border-dark-border pt-3">
                <span className="text-slate-400 font-mono">
                  Seats: <strong className="text-slate-200">{client.seats_used} / {client.seats_allocated}</strong> Allocated
                </span>
                <span className="text-slate-400 font-mono">
                  MRR: <strong className="text-emerald-400">₹{(client.monthly_recurring_revenue || 0).toLocaleString('en-IN')}</strong>
                </span>
              </div>

              {/* Actions Footer Bar */}
              <div className="flex items-center justify-between gap-2 border-t border-dark-border pt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<Eye className="w-3.5 h-3.5 text-brand-400" />}
                  onClick={() => onInspectClient(client)}
                >
                  Inspect Account
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<IndianRupee className="w-3.5 h-3.5 text-emerald-400" />}
                  onClick={() => onOpenManualPaymentModal(client)}
                >
                  Record Payment
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
