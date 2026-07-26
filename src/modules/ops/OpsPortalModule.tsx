// ─────────────────────────────────────────────────────────────
// Vortiq Internal Ops — Main Portal Workspace Container
// Hosted Realm: 8 Full Operations Sections
// Restricted strictly to Vortiq Employees (@vortiq.biz) in Standalone Deployment
// ─────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { Button, Badge } from '@/design-system';
import { OpsClientDirectory } from './OpsClientDirectory';
import { OpsDashboardView } from './OpsDashboardView';
import { VortiqFinanceModule } from './VortiqFinanceModule';
import { OpsSecurityCenter } from './OpsSecurityCenter';
import { OpsUserControls } from './OpsUserControls';
import { OpsSupportCenter } from './OpsSupportCenter';
import { OpsAnalyticsView } from './OpsAnalyticsView';
import { OpsDataVaultExport } from './OpsDataVaultExport';
import { ClientProvisioningModal } from './ClientProvisioningModal';
import { ManualPaymentLedgerModal } from './ManualPaymentLedgerModal';
import { ClientDetailModal } from './ClientDetailModal';
import { OpsClientOrg, OpsSubscriptionStatus, ManualPaymentRecord } from './types';
import {
  LayoutDashboard,
  Users,
  IndianRupee,
  ShieldAlert,
  UserCheck,
  LifeBuoy,
  BarChart3,
  Database,
  LogOut,
  Plus,
} from 'lucide-react';

interface OpsPortalModuleProps {
  opsUserEmail: string;
  onExitOpsPortal: () => void;
}

export type OpsTab =
  | 'dashboard'
  | 'clients'
  | 'finance'
  | 'users'
  | 'support'
  | 'analytics'
  | 'security'
  | 'vault_export';

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

  const handleUpdateClient = (updated: OpsClientOrg) => {
    setClients((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    setInspectingClient(updated);
  };

  const handleClientProvisioned = (newClient: OpsClientOrg) => {
    setClients([newClient, ...clients]);
  };

  const handleRecordPayment = (payment: ManualPaymentRecord) => {
    setClients((prev) =>
      prev.map((c) => {
        if (c.id === payment.client_id) {
          const currentEnd = new Date(c.billing_period_end).getTime();
          const monthsInMs = payment.extension_months * 30 * 24 * 60 * 60 * 1000;
          const newEndStr = new Date(currentEnd + monthsInMs).toISOString().split('T')[0];

          return {
            ...c,
            subscription_status: 'active',
            billing_period_end: newEndStr,
            payment_history: [payment, ...(c.payment_history || [])],
          };
        }
        return c;
      })
    );
  };

  const handleNavigateToFilter = (status?: string) => {
    if (status) setStatusFilter(status);
    setActiveTab('clients');
  };

  return (
    <div className="min-h-screen bg-[#0B0E17] text-[#EDEEF3] font-sans antialiased selection:bg-brand-500/30 selection:text-brand-300">
      {/* Top Operations Header Bar */}
      <header className="border-b border-dark-border bg-dark-card/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-amber-400 flex items-center justify-center text-dark-bg font-extrabold text-sm font-display shadow-md shadow-brand-500/20">
              V
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-100 font-display tracking-tight">Vortiq Internal Operations</span>
                <Badge variant="amber" size="sm" className="font-mono font-bold">Vortiq Employee Portal</Badge>
              </div>
              <p className="text-3xs text-slate-400 font-mono">
                Authenticated: <span className="text-brand-300">{opsUserEmail}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-3.5 h-3.5 text-emerald-400" />}
              onClick={() => setIsProvisioningModalOpen(true)}
            >
              Provision New Client
            </Button>

            <Button
              variant="ghost"
              size="sm"
              leftIcon={<LogOut className="w-3.5 h-3.5 text-rose-400" />}
              onClick={onExitOpsPortal}
            >
              Exit Ops Portal
            </Button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Navigation Tabs (8 Sections) */}
        <div className="flex p-1.5 bg-dark-card rounded-xl border border-dark-border overflow-x-auto text-xs font-semibold font-mono">
          {[
            { id: 'dashboard', label: '1. Dashboard', icon: LayoutDashboard },
            { id: 'clients', label: '2. Clients', icon: Users },
            { id: 'finance', label: '3. Billing', icon: IndianRupee },
            { id: 'users', label: '4. User Controls', icon: UserCheck },
            { id: 'support', label: '5. Support', icon: LifeBuoy },
            { id: 'analytics', label: '6. Analytics', icon: BarChart3 },
            { id: 'security', label: '7. SOC / Security', icon: ShieldAlert },
            { id: 'vault_export', label: '8. Settings & Vault', icon: Database },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as OpsTab)}
              className={`px-3.5 py-2 rounded-lg flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === id
                  ? 'bg-brand-500 text-dark-bg font-bold shadow-md shadow-brand-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* SECTION 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <OpsDashboardView
            clients={clients}
            onNavigateToClients={handleNavigateToFilter}
          />
        )}

        {/* SECTION 2: CLIENT DIRECTORY */}
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

        {/* SECTION 3: BILLING & VORTIQ FINANCE */}
        {activeTab === 'finance' && (
          <VortiqFinanceModule
            clients={clients}
            onOpenManualPaymentModal={(client) => setSelectedClientForPayment(client)}
          />
        )}

        {/* SECTION 4: USER CONTROLS */}
        {activeTab === 'users' && <OpsUserControls />}

        {/* SECTION 5: SUPPORT DESK */}
        {activeTab === 'support' && <OpsSupportCenter />}

        {/* SECTION 6: ANALYTICS */}
        {activeTab === 'analytics' && <OpsAnalyticsView />}

        {/* SECTION 7: SOC / SECURITY */}
        {activeTab === 'security' && <OpsSecurityCenter />}

        {/* SECTION 8: SETTINGS & VAULT EXPORT */}
        {activeTab === 'vault_export' && <OpsDataVaultExport />}
      </main>

      {/* Provisioning Modal */}
      {isProvisioningModalOpen && (
        <ClientProvisioningModal
          isOpen={isProvisioningModalOpen}
          onClose={() => setIsProvisioningModalOpen(false)}
          onProvisionClient={handleClientProvisioned}
        />
      )}

      {/* Manual Payment Ledger Modal */}
      {selectedClientForPayment && (
        <ManualPaymentLedgerModal
          isOpen={!!selectedClientForPayment}
          onClose={() => setSelectedClientForPayment(null)}
          client={selectedClientForPayment}
          onRecordPayment={handleRecordPayment}
        />
      )}

      {/* Client Detail Inspector Modal */}
      {inspectingClient && (
        <ClientDetailModal
          isOpen={!!inspectingClient}
          onClose={() => setInspectingClient(null)}
          client={inspectingClient}
          onUpdateClient={handleUpdateClient}
        />
      )}
    </div>
  );
};
