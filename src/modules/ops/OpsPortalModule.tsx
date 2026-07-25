// ─────────────────────────────────────────────────────────────
// Vortiq Internal Ops Backend — Superadmin Ops Portal Workspace
// Isolated Realm for Vortiq Internal Employees Only
// ─────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { Card, Button, Badge } from '@/design-system';
import {
  OpsClientOrg,
  ManualPaymentRecord,
  OpsAlert,
  OpsSubscriptionStatus,
  SEED_OPS_CLIENTS,
  SEED_MANUAL_PAYMENTS,
  SEED_OPS_ALERTS,
} from './types';
import { OpsClientDirectory } from './OpsClientDirectory';
import { ClientProvisioningModal } from './ClientProvisioningModal';
import { ManualPaymentLedgerModal } from './ManualPaymentLedgerModal';
import { OpsAlertsCenter } from './OpsAlertsCenter';
import { ShieldCheck, LogOut } from 'lucide-react';

interface OpsPortalModuleProps {
  opsUserEmail: string;
  onExitOpsPortal: () => void;
}

export const OpsPortalModule: React.FC<OpsPortalModuleProps> = ({
  opsUserEmail,
  onExitOpsPortal,
}) => {
  const [clients, setClients] = useState<OpsClientOrg[]>(SEED_OPS_CLIENTS);
  const [payments, setPayments] = useState<ManualPaymentRecord[]>(SEED_MANUAL_PAYMENTS);
  const [alerts, setAlerts] = useState<OpsAlert[]>(SEED_OPS_ALERTS);

  // Active Modals
  const [isProvisioningOpen, setIsProvisioningOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedClientForPayment, setSelectedClientForPayment] = useState<OpsClientOrg | null>(null);

  // Status updates
  const handleUpdateStatus = (clientId: string, newStatus: OpsSubscriptionStatus) => {
    setClients((prev) =>
      prev.map((c) => (c.id === clientId ? { ...c, subscription_status: newStatus } : c))
    );
  };

  // Provisioning callback
  const handleProvisionClient = (newClient: OpsClientOrg) => {
    setClients([newClient, ...clients]);
  };

  // Payment callback
  const handleRecordPayment = (newPayment: ManualPaymentRecord, extensionMonths: number) => {
    setPayments([newPayment, ...payments]);

    setClients((prev) =>
      prev.map((c) => {
        if (c.id === newPayment.tenant_id) {
          const currentEnd = new Date(c.billing_period_end);
          currentEnd.setMonth(currentEnd.getMonth() + extensionMonths);
          return {
            ...c,
            subscription_status: 'active',
            billing_period_end: currentEnd.toISOString().split('T')[0],
            last_payment_date: newPayment.payment_date,
            total_paid_rupees: c.total_paid_rupees + newPayment.amount_rupees,
          };
        }
        return c;
      })
    );
  };

  // Alert mark read
  const handleMarkAlertRead = (alertId: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === alertId ? { ...a, read: true } : a)));
  };

  // Calculate high level metrics
  const activeCount = clients.filter((c) => c.subscription_status === 'active').length;
  const trialCount = clients.filter((c) => c.subscription_status === 'trial').length;
  const totalRevenue = clients.reduce((acc, c) => acc + c.total_paid_rupees, 0);

  return (
    <div className="space-y-6">
      {/* Top Header & Ops Branding */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-dark-card border-2 border-brand-500/40 rounded-2xl shadow-lg shadow-brand-500/10">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-100 font-display tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-brand-400" />
              Vortiq Internal Operations & Superadmin Portal
            </h1>
            <Badge variant="amber" size="sm" className="font-mono font-bold uppercase">
              Phase 1 Pre-Razorpay
            </Badge>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Authenticated Ops Realm: <strong className="text-brand-300">{opsUserEmail}</strong> • Isolated Superadmin Access
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<LogOut className="w-3.5 h-3.5 text-slate-400" />}
            onClick={onExitOpsPortal}
          >
            Exit Ops Portal
          </Button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
        <Card className="p-4 bg-dark-card border-dark-border space-y-1">
          <span className="text-2xs text-slate-400 font-semibold uppercase tracking-wider block">Total Managed Clients</span>
          <span className="text-xl font-bold font-display text-slate-100">{clients.length} Organizations</span>
          <span className="text-2xs text-slate-500 block">{activeCount} active, {trialCount} trial</span>
        </Card>

        <Card className="p-4 bg-dark-card border-dark-border space-y-1">
          <span className="text-2xs text-slate-400 font-semibold uppercase tracking-wider block">Total Platform Revenue</span>
          <span className="text-xl font-bold font-display text-emerald-400">₹{totalRevenue.toLocaleString('en-IN')}</span>
          <span className="text-2xs text-slate-500 block">Manually logged pre-Razorpay</span>
        </Card>

        <Card className="p-4 bg-dark-card border-dark-border space-y-1">
          <span className="text-2xs text-slate-400 font-semibold uppercase tracking-wider block">Active Trial Orgs</span>
          <span className="text-xl font-bold font-display text-amber-400">{trialCount} Clients</span>
          <span className="text-2xs text-slate-500 block">14-day default trial period</span>
        </Card>

        <Card className="p-4 bg-dark-card border-dark-border space-y-1">
          <span className="text-2xs text-slate-400 font-semibold uppercase tracking-wider block">Internal Ops Alerts</span>
          <span className="text-xl font-bold font-display text-rose-400">{alerts.filter(a => !a.read).length} Unread</span>
          <span className="text-2xs text-slate-500 block">Trial expirations & overdue</span>
        </Card>
      </div>

      {/* Internal Ops Alerts Center */}
      <OpsAlertsCenter
        alerts={alerts}
        onMarkRead={handleMarkAlertRead}
      />

      {/* Client Directory */}
      <OpsClientDirectory
        clients={clients}
        onUpdateStatus={handleUpdateStatus}
        onOpenProvisioningModal={() => setIsProvisioningOpen(true)}
        onOpenPaymentModal={(c) => {
          setSelectedClientForPayment(c);
          setIsPaymentModalOpen(true);
        }}
      />

      {/* MODALS */}
      {isProvisioningOpen && (
        <ClientProvisioningModal
          isOpen={isProvisioningOpen}
          onClose={() => setIsProvisioningOpen(false)}
          onProvisionClient={handleProvisionClient}
        />
      )}

      {isPaymentModalOpen && selectedClientForPayment && (
        <ManualPaymentLedgerModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          client={selectedClientForPayment}
          paymentHistory={payments}
          onRecordPayment={handleRecordPayment}
        />
      )}
    </div>
  );
};
