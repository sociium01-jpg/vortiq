// ─────────────────────────────────────────────────────────────
// Vortiq Internal Ops — Client Provisioning & Access Grant Modal
// Register new client organization & trigger main app provisioning
// ─────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { Modal, Button, Input, Select } from '@/design-system';
import { OpsPlanTier } from './types';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';

interface ClientProvisioningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProvisionClient: (newClient: any) => void;
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
  const [trialDays, setTrialDays] = useState<number>(14);
  const [notes, setNotes] = useState('New client registered via internal sales desk');
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProvisioning(true);

    setTimeout(() => {
      setIsProvisioning(false);
      const newTenantId = `tenant-org-${Math.floor(1000 + Math.random() * 9000)}`;
      const newOrgCode = `ORG-${Math.floor(1000 + Math.random() * 9000)}-VTQ`;
      const endIso = new Date(Date.now() + trialDays * 86400000).toISOString().split('T')[0];

      const newClient = {
        id: newTenantId,
        org_name: orgName,
        org_code: newOrgCode,
        admin_name: adminName,
        admin_email: adminEmail,
        plan_tier: planTier,
        subscription_status: 'trial',
        signup_date: new Date().toISOString().split('T')[0],
        billing_period_end: endIso,
        seats_allocated: planTier === 'enterprise' ? 100 : planTier === 'pro' ? 25 : 5,
        seats_used: 1,
        total_paid_rupees: 0,
        notes,
      };

      onProvisionClient(newClient);
      setSuccessMsg(`SUCCESS: Provisioned organization ${orgName} (${newOrgCode}). Access invite sent to ${adminEmail}.`);
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 2500);
    }, 800);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Register & Provision New Client Organization"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
        {successMsg && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-2xs text-emerald-300 flex items-center gap-2 animate-pulse">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="p-3 bg-dark-surface border border-dark-border rounded-xl text-2xs text-slate-300 font-sans">
          This action provisions a dedicated isolated tenant space, creates the registered Admin user account, and dispatches the main app onboarding invite.
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Company / Org Name</label>
            <Input
              type="text"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Registered Admin Name</label>
            <Input
              type="text"
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Admin Email Address</label>
            <Input
              type="email"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Initial Plan Tier</label>
            <Select
              value={planTier}
              onChange={(e) => setPlanTier(e.target.value as OpsPlanTier)}
              options={[
                { value: 'starter', label: 'Starter Plan (5 Seats)' },
                { value: 'pro', label: 'Pro Plan (25 Seats)' },
                { value: 'enterprise', label: 'Enterprise Plan (100 Seats)' },
              ]}
            />
          </div>
        </div>

        <div>
          <label className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Initial Trial Period (Days)</label>
          <Select
            value={trialDays.toString()}
            onChange={(e) => setTrialDays(parseInt(e.target.value, 10))}
            options={[
              { value: '7', label: '7 Days Trial' },
              { value: '14', label: '14 Days Trial' },
              { value: '30', label: '30 Days Trial' },
            ]}
          />
        </div>

        <div>
          <label className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Internal Notes</label>
          <Input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <Button
          variant="primary"
          size="md"
          className="w-full"
          type="submit"
          isLoading={isProvisioning}
          leftIcon={<ShieldCheck className="w-4 h-4" />}
        >
          Provision Tenant Space & Trigger Access Grant
        </Button>
      </form>
    </Modal>
  );
};
