// ─────────────────────────────────────────────────────────────
// Vortiq Internal Ops — Manual Payment & Renewal Ledger
// Offline payment logging (Pre-Razorpay integration placeholder)
// ─────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { Modal, Button, Input, Select, Badge } from '@/design-system';
import { OpsClientOrg, ManualPaymentMethod, ManualPaymentRecord } from './types';
import { DollarSign, CheckCircle2, History } from 'lucide-react';

interface ManualPaymentLedgerModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: OpsClientOrg;
  paymentHistory: ManualPaymentRecord[];
  onRecordPayment: (payment: ManualPaymentRecord, extensionMonths: number) => void;
}

export const ManualPaymentLedgerModal: React.FC<ManualPaymentLedgerModalProps> = ({
  isOpen,
  onClose,
  client,
  paymentHistory,
  onRecordPayment,
}) => {
  const [amountRupees, setAmountRupees] = useState<number>(24999);
  const [paymentMethod, setPaymentMethod] = useState<ManualPaymentMethod>('Bank Transfer (NEFT/RTGS)');
  const [periodCovered, setPeriodCovered] = useState('August 2026 - August 2027 (Annual)');
  const [extensionMonths, setExtensionMonths] = useState<number>(12);
  const [referenceNumber, setReferenceNumber] = useState(`NEFT-HDFC-${Math.floor(100000 + Math.random() * 900000)}`);
  const [recordedByName] = useState('Alex Vance (Superadmin)');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const clientPayments = paymentHistory.filter((p) => p.tenant_id === client.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newPayment: ManualPaymentRecord = {
      id: `mp-${Date.now()}`,
      tenant_id: client.id,
      org_name: client.org_name,
      amount_rupees: amountRupees,
      payment_method: paymentMethod,
      payment_date: new Date().toISOString().split('T')[0],
      period_covered: periodCovered,
      recorded_by_name: recordedByName,
      reference_number: referenceNumber,
      is_manually_recorded: true,
      created_at: new Date().toISOString(),
    };

    onRecordPayment(newPayment, extensionMonths);
    setSuccessMsg(`SUCCESS: Payment of ₹${amountRupees.toLocaleString('en-IN')} logged for ${client.org_name}. Subscription extended by ${extensionMonths} months.`);
    setTimeout(() => {
      setSuccessMsg(null);
      onClose();
    }, 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Manual Payment & Renewal Logging (Pre-Razorpay)"
      maxWidth="md"
    >
      <div className="space-y-4 text-xs font-mono">
        {/* Placeholder Badge Notice */}
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-2xs text-amber-300 flex items-center justify-between font-mono">
          <span>MANUALLY RECORDED (PRE-RAZORPAY INTERIM LEDGER)</span>
          <Badge variant="amber" size="sm" className="uppercase font-mono font-bold">Manual Entry</Badge>
        </div>

        {successMsg && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-2xs text-emerald-300 flex items-center gap-2 font-mono animate-pulse">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Client Info Banner */}
        <div className="p-3 bg-dark-surface rounded-xl border border-dark-border flex items-center justify-between">
          <div>
            <span className="font-bold text-slate-100 block text-xs">{client.org_name}</span>
            <span className="text-2xs text-slate-400">{client.admin_email} • Current End: <strong className="text-brand-300">{client.billing_period_end}</strong></span>
          </div>
          <Badge variant="emerald" size="sm" className="uppercase">{client.subscription_status}</Badge>
        </div>

        {/* Manual Payment Form */}
        <form onSubmit={handleSubmit} className="p-4 bg-dark-card rounded-xl border border-dark-border space-y-3">
          <h4 className="font-bold text-slate-200 font-display text-2xs uppercase tracking-wider">Record Offline Payment Received</h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Payment Amount (₹)</label>
              <Input
                type="number"
                value={amountRupees}
                onChange={(e) => setAmountRupees(parseFloat(e.target.value))}
                required
              />
            </div>

            <div>
              <label className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Payment Method</label>
              <Select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as ManualPaymentMethod)}
                options={[
                  { value: 'Bank Transfer (NEFT/RTGS)', label: 'Bank Transfer (NEFT/RTGS)' },
                  { value: 'Cheque', label: 'Cheque' },
                  { value: 'Manual Card', label: 'Manual Card Transaction' },
                  { value: 'Cash', label: 'Cash / Direct Deposit' },
                ]}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Period Covered</label>
              <Input
                type="text"
                value={periodCovered}
                onChange={(e) => setPeriodCovered(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Extend Subscription By</label>
              <Select
                value={extensionMonths.toString()}
                onChange={(e) => setExtensionMonths(parseInt(e.target.value, 10))}
                options={[
                  { value: '1', label: '+ 1 Month' },
                  { value: '3', label: '+ 3 Months' },
                  { value: '6', label: '+ 6 Months' },
                  { value: '12', label: '+ 12 Months (1 Year)' },
                ]}
              />
            </div>
          </div>

          <div>
            <label className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Bank / UTR Reference #</label>
            <Input
              type="text"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              required
            />
          </div>

          <Button variant="primary" size="md" className="w-full" type="submit" leftIcon={<DollarSign className="w-4 h-4" />}>
            Record Payment & Update Subscription Lifecycle
          </Button>
        </form>

        {/* Existing Payment Ledger History */}
        <div className="space-y-2">
          <h4 className="font-bold text-slate-200 font-display text-2xs uppercase tracking-wider flex items-center gap-1.5">
            <History className="w-3.5 h-3.5 text-brand-400" />
            Client Payment History ({clientPayments.length})
          </h4>

          <div className="space-y-2 max-h-36 overflow-y-auto">
            {clientPayments.length === 0 ? (
              <div className="p-3 text-center text-2xs text-slate-500">No payment history recorded for this client.</div>
            ) : (
              clientPayments.map((p) => (
                <div key={p.id} className="p-2.5 bg-dark-surface rounded-lg border border-dark-border flex items-center justify-between text-2xs">
                  <div>
                    <span className="font-bold text-emerald-400">₹{p.amount_rupees.toLocaleString('en-IN')}</span>
                    <span className="text-slate-400 ml-2 font-sans">via {p.payment_method}</span>
                    <p className="text-2xs text-slate-500">Ref: {p.reference_number} • Recorded by {p.recorded_by_name}</p>
                  </div>
                  <Badge variant="amber" size="sm" className="uppercase font-mono">Manual</Badge>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
