// ─────────────────────────────────────────────────────────────
// Vortiq Recurring Invoices & Subscription Billing Engine
// Zoho Books Parity
// ─────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { Card, Badge, Button, Modal, Input, Select } from '@/design-system';
import { RecurringInvoice, SEED_RECURRING_INVOICES } from './types';
import { Repeat, Plus, Calendar, Play, Pause } from 'lucide-react';

export const RecurringInvoiceManager: React.FC = () => {
  const [recurringProfiles, setRecurringProfiles] = useState<RecurringInvoice[]>(SEED_RECURRING_INVOICES);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Profile State
  const [customerName, setCustomerName] = useState('Apollo Hospital Procurement Cell');
  const [profileName, setProfileName] = useState('Monthly ERP License Subscription');
  const [frequency, setFrequency] = useState<any>('monthly');
  const [amountInput, setAmountInput] = useState('150000');

  const handleCreateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amountInput) || 10000;

    const newProfile: RecurringInvoice = {
      id: `rec-${Date.now()}`,
      tenant_id: 'tenant-prod-001',
      customer_name: customerName,
      profile_name: profileName,
      frequency: frequency,
      amount: amt,
      next_run_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      status: 'active',
      created_at: new Date().toISOString(),
    };

    setRecurringProfiles([newProfile, ...recurringProfiles]);
    setIsModalOpen(false);
  };

  const toggleProfileStatus = (profileId: string) => {
    setRecurringProfiles((prev) =>
      prev.map((p) =>
        p.id === profileId ? { ...p, status: p.status === 'active' ? 'paused' : 'active' } : p
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Recurring Profiles Table */}
      <Card className="p-5 bg-dark-card border-dark-border space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-display flex items-center gap-2">
              <Repeat className="w-4 h-4 text-brand-400" />
              Recurring Invoice Profiles & Subscriptions ({recurringProfiles.length})
            </h4>
            <p className="text-2xs text-slate-400 mt-0.5">Automated subscription billing schedules and auto-charge profiles</p>
          </div>

          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setIsModalOpen(true)}
          >
            Create Subscription Profile
          </Button>
        </div>

        <div className="space-y-3">
          {recurringProfiles.map((prof) => (
            <div key={prof.id} className="p-4 bg-dark-surface/60 rounded-xl border border-dark-border flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-100 font-display">{prof.profile_name}</span>
                  <Badge variant={prof.status === 'active' ? 'emerald' : 'slate'} size="sm">
                    {prof.status}
                  </Badge>
                  <Badge variant="violet" size="sm" className="font-mono uppercase">{prof.frequency}</Badge>
                </div>
                <p className="text-2xs text-slate-300 font-mono">Customer: {prof.customer_name}</p>
                <p className="text-2xs text-slate-400 font-mono flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-brand-400" /> Next Invoice Run: {prof.next_run_date}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm font-black font-mono text-emerald-400">₹{prof.amount.toLocaleString('en-IN')} / {prof.frequency}</span>

                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={prof.status === 'active' ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
                  onClick={() => toggleProfileStatus(prof.id)}
                >
                  {prof.status === 'active' ? 'Pause Schedule' : 'Resume Schedule'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Create Subscription Profile Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Create Automated Recurring Invoice Profile"
          maxWidth="md"
        >
          <form onSubmit={handleCreateProfile} className="space-y-4">
            <div>
              <label className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Customer Name</label>
              <Input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Profile Name</label>
              <Input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Billing Frequency</label>
                <Select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value as any)}
                  options={[
                    { value: 'monthly', label: 'Monthly' },
                    { value: 'quarterly', label: 'Quarterly' },
                    { value: 'annual', label: 'Annual' },
                  ]}
                />
              </div>
              <div>
                <label className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Billing Amount (₹)</label>
                <Input
                  type="number"
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button variant="primary" size="md" className="w-full" type="submit" leftIcon={<Repeat className="w-4 h-4" />}>
              Save Recurring Profile
            </Button>
          </form>
        </Modal>
      )}
    </div>
  );
};
