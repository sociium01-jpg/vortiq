// ─────────────────────────────────────────────────────────────
// Vortiq Internal Ops — Manual Payment & Renewal Ledger
// Offline payment logging (Pre-Razorpay integration placeholder)
// ─────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { Modal, Button, Input, Select, Badge } from '@/design-system';
import { OpsClientOrg, ManualPaymentMethod, ManualPaymentRecord } from './types';
import { IndianRupee, CheckCircle2 } from 'lucide-react';

interface ManualPaymentLedgerModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: OpsClientOrg | null;
  onRecordPayment: (payment: ManualPaymentRecord) => void;
}

export const ManualPaymentLedgerModal: React.FC<ManualPaymentLedgerModalProps> = ({
  isOpen,
  onClose,
  client,
  onRecordPayment,
}) => {
  const [amount, setAmount] = useState('49999');
  const [paymentMethod, setPaymentMethod] = useState<ManualPaymentMethod>('neft_bank_transfer');
  const [referenceNo, setReferenceNo] = useState('NEFT-2026-9901');
  const [extensionMonths, setExtensionMonths] = useState('6');
  const [recordedByName, setRecordedByName] = useState('Alex Vance (Ops Lead)');
  const [notes, setNotes] = useState('Offline payment received and verified in HDFC corporate bank account.');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!client) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const amountRupees = parseFloat(amount) || 0;

    const newPayment: ManualPaymentRecord = {
      id: `pay-${Date.now()}`,
      client_id: client.id,
      client_name: client.org_name,
      amount_rupees: amountRupees,
      payment_date: new Date().toISOString().split('T')[0],
      payment_method: paymentMethod,
      reference_number: referenceNo,
      recorded_by_name: recordedByName,
      extension_months: parseInt(extensionMonths, 10),
      notes,
      is_manually_recorded: true,
    };

    onRecordPayment(newPayment);
    setSuccessMsg(`SUCCESS: Payment of ₹${amountRupees.toLocaleString('en-IN')} logged for ${client.org_name}. Subscription extended by ${extensionMonths} months.`);

    setTimeout(() => {
      setSuccessMsg(null);
      onClose();
    }, 1200);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Record Manual Payment — ${client.org_name}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between">
          <span className="text-amber-400 font-bold flex items-center gap-1.5">
            <IndianRupee className="w-4 h-4" />
            MANUALLY RECORDED (PRE-RAZORPAY INTERIM LEDGER)
          </span>
          <Badge variant="emerald" size="sm" className="uppercase font-bold">{client.subscription_status}</Badge>
        </div>

        {successMsg && (
          <div className="p-3 bg-emerald-500/20 border border-emerald-500/50 rounded-xl text-2xs text-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-3xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Payment Amount (₹)</label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="49999"
              required
            />
          </div>

          <div>
            <label className="text-3xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Payment Mode</label>
            <Select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as ManualPaymentMethod)}
              options={[
                { value: 'neft_bank_transfer', label: 'NEFT / RTGS Bank Transfer' },
                { value: 'cheque', label: 'Bank Cheque' },
                { value: 'card_offline', label: 'Offline Card POS' },
                { value: 'cash', label: 'Cash Receipt' },
              ]}
            />
          </div>

          <div>
            <label className="text-3xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Bank Reference / UTR Number</label>
            <Input
              value={referenceNo}
              onChange={(e) => setReferenceNo(e.target.value)}
              placeholder="e.g. NEFT-8890211A"
              required
            />
          </div>

          <div>
            <label className="text-3xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Extend Subscription By</label>
            <Select
              value={extensionMonths}
              onChange={(e) => setExtensionMonths(e.target.value)}
              options={[
                { value: '1', label: '1 Month Extension' },
                { value: '3', label: '3 Months Extension' },
                { value: '6', label: '6 Months Extension' },
                { value: '12', label: '12 Months (1 Year) Extension' },
              ]}
            />
          </div>
        </div>

        <div>
          <label className="text-3xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Vortiq Employee Name (Actor)</label>
          <Input
            value={recordedByName}
            onChange={(e) => setRecordedByName(e.target.value)}
            placeholder="Alex Vance (Ops Lead)"
            required
          />
        </div>

        <div>
          <label className="text-3xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Payment Verification Notes</label>
          <Input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Verified in corporate bank account ledger..."
          />
        </div>

        <Button variant="primary" size="md" className="w-full" type="submit">
          Record Payment & Extend Subscription
        </Button>
      </form>
    </Modal>
  );
};
