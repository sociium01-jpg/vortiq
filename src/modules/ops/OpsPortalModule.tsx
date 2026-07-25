// ─────────────────────────────────────────────────────────────
// Vortiq Internal Ops — Main Portal Workspace Container
// Hosted Realm: Section 1 Dashboard, Section 2 Clients, Section 3 Vortiq Finance, Section 4 Security
// Restricted strictly to Vortiq Employees (@vortiq.biz) in Standalone Deployment
// ─────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { Button, Badge } from '@/design-system';
import { OpsClientDirectory } from './OpsClientDirectory';
import { OpsDashboardView } from './OpsDashboardView';
import { VortiqFinanceModule } from './VortiqFinanceModule';
import { OpsSecurityCenter } from './OpsSecurityCenter';
import { ClientProvisioningModal } from './ClientProvisioningModal';
import { ManualPaymentLedgerModal } from './ManualPaymentLedgerModal';
import { ClientDetailModal } from './ClientDetailModal';
import { OpsClientOrg, OpsSubscriptionStatus, ManualPaymentRecord } from './types';
import {
  LayoutDashboard,
  Users,
  IndianRupee,
  ShieldAlert,
  LogOut,
  Plus,
  Lock,
} from 'lucide-react';

interface OpsPortalModuleProps {
  opsUserEmail: string;
  onExitOpsPortal: () => void;
}

export type OpsTab = 'dashboard' | 'clients' | 'finance' | 'security';

export const OpsPortalModule: React.FC<OpsPortalModuleProps> = ({
  opsUserEmail,
  onExitOpsPortal,
}) => {
  const [activeTab, setActiveTab] = useState<OpsTab>('dashboard');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [isProvisioningModalOpen, setIsProvisioningModalOpen] = useState(false);
  const [selectedClientForPayment, setSelectedClientForPayment] = useState<OpsClientOrg | null>(null);
  const [inspectingClient, setInspectingClient] = useState<OpsClientOrg | null>(null);

  // Mock Seed Data for Vortiq Internal Ops Client Directory
  const [clients, setClients] = useState<OpsClientOrg[]>([
    {
      id: 'client-1',
      org_name: 'Apex Industrial Logistics',
      registered_admin_email: 'admin@apexind.com',
      registered_admin_name: 'Rajesh Sharma',
      plan_tier: 'enterprise',
      subscription_status: 'active',
      signup_date: '2026-01-15',
      billing_period_end: '2026-08-15',
      seats_allocated: 25,
      seats_used: 18,
      monthly_recurring_revenue: 49999,
      org_code: 'ORG-8801',
      notes: 'Key Enterprise Logistics Account. Annual upfront check cleared.',
      payment_history: [
        {
          id: 'pay-101',
          client_id: 'client-1',
          client_name: 'Apex Industrial Logistics',
          amount_rupees: 49999,
          payment_date: '2026-01-15',
          payment_method: 'neft_bank_transfer',
          reference_number: 'NEFT-8890211A',
          recorded_by_name: 'Alex Vance (Ops Lead)',
          extension_months: 6,
          is_manually_recorded: true,
        },
      ],
      audit_logs: [
        { id: 'log-1', timestamp: '2026-01-15 10:00', actor_name: 'Alex Vance', action_type: 'PROVISIONING', details: 'Provisioned enterprise space ORG-8801.' },
      ],
    },
    {
      id: 'client-2',
      org_name: 'Reliance Retail Logistics',
      registered_admin_email: 'vikram.m@relianceretail.in',
      registered_admin_name: 'Vikram Malhotra',
      plan_tier: 'enterprise',
      subscription_status: 'active',
      signup_date: '2026-02-10',
      billing_period_end: '2026-08-10',
      seats_allocated: 50,
      seats_used: 42,
      monthly_recurring_revenue: 49999,
      org_code: 'ORG-9901',
      notes: 'Enterprise account. Direct billing relationship.',
      payment_history: [
        {
          id: 'pay-102',
          client_id: 'client-2',
          client_name: 'Reliance Retail Logistics',
          amount_rupees: 49999,
          payment_date: '2026-02-10',
          payment_method: 'neft_bank_transfer',
          reference_number: 'NEFT-9910233B',
          recorded_by_name: 'Alex Vance (Ops Lead)',
          extension_months: 6,
          is_manually_recorded: true,
        },
      ],
    },
    {
      id: 'client-3',
      org_name: 'MedLife Diagnostics Pvt Ltd',
      registered_admin_email: 'accounts@medlifediag.in',
      registered_admin_name: 'Dr. Sunita Rao',
      plan_tier: 'pro',
      subscription_status: 'trial',
      signup_date: '2026-07-20',
      billing_period_end: '2026-08-03',
      seats_allocated: 10,
      seats_used: 4,
      monthly_recurring_revenue: 24999,
      org_code: 'ORG-7702',
      notes: '14-Day Free Trial initiated.',
    },
    {
      id: 'client-4',
      org_name: 'Starlight Tech Solutions',
      registered_admin_email: 'admin@starlighttech.com',
      registered_admin_name: 'Anish Verma',
      plan_tier: 'pro',
      subscription_status: 'suspended',
      signup_date: '2026-03-01',
      billing_period_end: '2026-06-30',
      seats_allocated: 15,
      seats_used: 12,
      monthly_recurring_revenue: 24999,
      org_code: 'ORG-6603',
      notes: 'Account suspended for payment delay past 30 days.',
    },
  ]);

  const handleUpdateStatus = (clientId: string, newStatus: OpsSubscriptionStatus) => {
    setClients((prev) =>
      prev.map((c) => (c.id === clientId ? { ...c, subscription_status: newStatus } : c))
    );
  };

  const handleClientProvisioned = (newClient: OpsClientOrg) => {
    setClients([newClient, ...clients]);
  };

  const handleRecordPayment = (payment: ManualPaymentRecord) => {
    setClients((prev) =>
      prev.map((c) => {
        if (c.id === payment.client_id) {
          const currentEnd = new Date(c.billing_period_end);
          currentEnd.setMonth(currentEnd.getMonth() + payment.extension_months);
          return {
            ...c,
            subscription_status: 'active',
            billing_period_end: currentEnd.toISOString().split('T')[0],
            payment_history: [payment, ...(c.payment_history || [])],
          };
        }
        return c;
      })
    );
    setSelectedClientForPayment(null);
  };

  const handleNavigateToClients = (filter: string = 'all') => {
    setStatusFilter(filter);
    setActiveTab('clients');
  };

  return (
    <div className="space-y-6 font-mono text-xs text-slate-100">
      {/* Top Superadmin App Bar */}
      <header className="p-4 bg-dark-card border border-dark-border rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-dark-bg font-extrabold text-2xl font-display shadow-lg shadow-brand-500/20">
            V
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-100 font-display">Vortiq Internal Operations & Superadmin Portal</h1>
              <Badge variant="emerald" size="sm" className="font-mono font-bold uppercase">
                Isolated Realm
              </Badge>
            </div>
            <p className="text-3xs text-slate-400 mt-0.5 flex items-center gap-1.5">
              <Lock className="w-3 h-3 text-emerald-400" />
              <span>Authenticated as <strong className="text-brand-300">{opsUserEmail}</strong> (Server Validated)</span>
            </p>
          </div>
        </div>

        {/* Global Navigation Tabs & Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex p-1 bg-dark-surface rounded-xl border border-dark-border text-xs font-semibold">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-all ${
                activeTab === 'dashboard' ? 'bg-brand-500 text-dark-bg font-bold shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('clients')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-all ${
                activeTab === 'clients' ? 'bg-brand-500 text-dark-bg font-bold shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Clients</span>
            </button>

            <button
              onClick={() => setActiveTab('finance')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-all ${
                activeTab === 'finance' ? 'bg-brand-500 text-dark-bg font-bold shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <IndianRupee className="w-3.5 h-3.5" />
              <span>Vortiq Finance</span>
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-all ${
                activeTab === 'security' ? 'bg-brand-500 text-dark-bg font-bold shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Security Monitoring</span>
            </button>
          </div>

          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setIsProvisioningModalOpen(true)}
          >
            Provision Client Space
          </Button>

          <Button
            variant="outline"
            size="sm"
            leftIcon={<LogOut className="w-3.5 h-3.5 text-rose-400" />}
            onClick={onExitOpsPortal}
            title="Exit Superadmin Realm"
          >
            Exit Realm
          </Button>
        </div>
      </header>

      {/* Rendered Ops Submodules */}
      <main className="space-y-6">
        {activeTab === 'dashboard' && (
          <OpsDashboardView
            clients={clients}
            onNavigateToClients={handleNavigateToClients}
          />
        )}

        {activeTab === 'clients' && (
          <OpsClientDirectory
            clients={clients}
            onUpdateStatus={handleUpdateStatus}
            onOpenProvisioningModal={() => setIsProvisioningModalOpen(true)}
            onOpenManualPaymentModal={(client) => setSelectedClientForPayment(client)}
            onInspectClient={(client) => setInspectingClient(client)}
            initialStatusFilter={statusFilter}
          />
        )}

        {activeTab === 'finance' && (
          <VortiqFinanceModule
            clients={clients}
            onOpenManualPaymentModal={(client) => setSelectedClientForPayment(client)}
          />
        )}

        {activeTab === 'security' && (
          <OpsSecurityCenter />
        )}
      </main>

      {/* Shared Modals */}
      <ClientProvisioningModal
        isOpen={isProvisioningModalOpen}
        onClose={() => setIsProvisioningModalOpen(false)}
        onProvisionClient={handleClientProvisioned}
      />

      <ManualPaymentLedgerModal
        isOpen={!!selectedClientForPayment}
        onClose={() => setSelectedClientForPayment(null)}
        client={selectedClientForPayment}
        onRecordPayment={handleRecordPayment}
      />

      <ClientDetailModal
        isOpen={!!inspectingClient}
        onClose={() => setInspectingClient(null)}
        client={inspectingClient}
      />
    </div>
  );
};
