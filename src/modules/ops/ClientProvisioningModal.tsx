// ─────────────────────────────────────────────────────────────
// Vortiq Internal Ops — Client Provisioning & Access Grant Modal
// Register new client organization & trigger main app provisioning
// ─────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { Modal, Button, Input, Select } from '@/design-system';
import { OpsPlanTier, OpsClientOrg } from './types';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';

export interface ClientProvisioningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProvisionClient: (newClient: OpsClientOrg) => void;
}

export const ClientProvisioningModal: React.FC<ClientProvisioningModalProps> = ({
  isOpen,
  onClose,
  onProvisionClient,
}) => {
  const [orgName, setOrgName] = useState('Zenith Industrial Automation Ltd');
  const [adminName, setAdminName] = useState('Rajesh Kumar');
  const [adminEmail, setAdminEmail] = useState('rajesh@zenithautomation.com');
  const [planTier, setPlanTier] = useState<OpsPlanTier>('pro');
  const [initialTrialDays, setInitialTrialDays] = useState('14');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trialDays = parseInt(initialTrialDays, 10);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + trialDays);

    const orgCode = `ORG-${Math.floor(1000 + Math.random() * 9000)}`;

    const newClient: OpsClientOrg = {
      id: `client-${Date.now()}`,
      org_name: orgName,
      registered_admin_email: adminEmail,
      registered_admin_name: adminName,
      plan_tier: planTier,
      subscription_status: 'trial',
      signup_date: new Date().toISOString().split('T')[0],
      billing_period_end: endDate.toISOString().split('T')[0],
      seats_allocated: planTier === 'starter' ? 5 : planTier === 'pro' ? 15 : 50,
      seats_used: 1,
      monthly_recurring_revenue: planTier === 'starter' ? 9999 : planTier === 'pro' ? 24999 : 49999,
      org_code: orgCode,
      notes: `Provisioned by superadmin. ${trialDays}-Day trial active.`,
    };

    onProvisionClient(newClient);
    setSuccessMsg(`SUCCESS: Client Space ${orgCode} (${orgName}) provisioned. Invite dispatched to ${adminEmail}.`);

    setTimeout(() => {
      setSuccessMsg(null);
      onClose();
    }, 1500);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Provision New Client Organization Space"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
        <div className="p-3 bg-brand-500/10 border border-brand-500/30 rounded-xl flex items-center gap-2 text-2xs text-brand-300">
          <ShieldCheck className="w-4 h-4 text-brand-400 shrink-0" />
          <span>Creates an isolated tenant database partition & dispatches primary admin access invite.</span>
        </div>

        {successMsg && (
          <div className="p-3 bg-emerald-500/20 border border-emerald-500/50 rounded-xl text-2xs text-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <div>
          <label className="text-3xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Company / Organization Name</label>
          <Input
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            placeholder="e.g. Zenith Industrial Automation Ltd"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-3xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Primary Admin Full Name</label>
            <Input
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
              placeholder="e.g. Rajesh Kumar"
              required
            />
          </div>

          <div>
            <label className="text-3xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Registered Admin Email</label>
            <Input
              type="email"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              placeholder="admin@zenithautomation.com"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-3xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Target Subscription Plan</label>
            <Select
              value={planTier}
              onChange={(e) => setPlanTier(e.target.value as OpsPlanTier)}
              options={[
                { value: 'starter', label: 'Starter Plan (5 Seats • ₹9,999/mo)' },
                { value: 'pro', label: 'Pro Plan (15 Seats • ₹24,999/mo)' },
                { value: 'enterprise', label: 'Enterprise Plan (50 Seats • ₹49,999/mo)' },
              ]}
            />
          </div>

          <div>
            <label className="text-3xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Initial Free Trial Period</label>
            <Select
              value={initialTrialDays}
              onChange={(e) => setInitialTrialDays(e.target.value)}
              options={[
                { value: '7', label: '7 Days Trial' },
                { value: '14', label: '14 Days Standard Trial' },
                { value: '30', label: '30 Days Extended Trial' },
              ]}
            />
          </div>
        </div>

        <Button variant="primary" size="md" className="w-full" type="submit">
          Provision Tenant Space & Dispatch Admin Key
        </Button>
      </form>
    </Modal>
  );
};
