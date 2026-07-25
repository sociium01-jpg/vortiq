// ─────────────────────────────────────────────────────────────
// Vortiq Finance — Payment Tracker Component
// Record & View Payments against open invoices with auto-status updates
// ─────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { Card, Button, Input, Select, Modal, Badge, DataTable, Column } from '@/design-system';
import { ExtendedInvoice, PaymentRecord, PaymentMode, formatINR } from './types';
import { Plus, CreditCard, CheckCircle2, AlertCircle } from 'lucide-react';

export interface PaymentTrackerProps {
  invoices?: ExtendedInvoice[];
  payments?: PaymentRecord[];
  onRecordPayment: (payment: any, updatedInvoice?: ExtendedInvoice) => void;
  isOpen?: boolean;
  onClose?: () => void;
  invoice?: ExtendedInvoice | null;
}

export const PaymentTracker: React.FC<PaymentTrackerProps> = ({
  invoices = [],
  payments = [],
  onRecordPayment,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>('');
  const [paymentAmountRupees, setPaymentAmountRupees] = useState<string>('');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('NEFT_RTGS');
  const [referenceNumber, setReferenceNumber] = useState<string>('');
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState<string>('');
  const [formError, setFormError] = useState<string>('');

  // Filter open or unpaid / partially paid invoices
  const openInvoices = invoices.filter(inv => inv.status !== 'cancelled' && inv.balance_due_paise > 0);
  const selectedInvoice = invoices.find(inv => inv.id === selectedInvoiceId);

  const handleOpenModal = (inv?: ExtendedInvoice) => {
    setFormError('');
    if (inv) {
      setSelectedInvoiceId(inv.id);
      setPaymentAmountRupees((inv.balance_due_paise / 100).toString());
    } else if (openInvoices.length > 0) {
      setSelectedInvoiceId(openInvoices[0].id);
      setPaymentAmountRupees((openInvoices[0].balance_due_paise / 100).toString());
    } else {
      setSelectedInvoiceId('');
      setPaymentAmountRupees('0');
    }
    setIsModalOpen(true);
  };

  const handleInvoiceChange = (invId: string) => {
    setSelectedInvoiceId(invId);
    const inv = invoices.find(i => i.id === invId);
    if (inv) {
      setPaymentAmountRupees((inv.balance_due_paise / 100).toString());
    }
  };

  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!selectedInvoice) {
      setFormError('Please select a valid invoice.');
      return;
    }

    const amountRupees = parseFloat(paymentAmountRupees);
    if (isNaN(amountRupees) || amountRupees <= 0) {
      setFormError('Please enter a valid positive payment amount.');
      return;
    }

    const paymentPaise = Math.round(amountRupees * 100);
    if (paymentPaise > selectedInvoice.balance_due_paise) {
      setFormError(`Payment amount cannot exceed balance due of ${formatINR(selectedInvoice.balance_due_paise)}.`);
      return;
    }

    if (!referenceNumber.trim()) {
      setFormError('Reference / Transaction ID is required.');
      return;
    }

    const newPayment: PaymentRecord = {
      id: `pay-${Date.now()}`,
      tenant_id: selectedInvoice.tenant_id,
      invoice_id: selectedInvoice.id,
      invoice_number: selectedInvoice.invoice_number,
      customer_name: selectedInvoice.customer_name || 'Customer',
      amount_paise: paymentPaise,
      payment_mode: paymentMode,
      reference_number: referenceNumber.trim(),
      payment_date: paymentDate,
      notes: notes.trim() || undefined,
      created_at: new Date().toISOString(),
    };

    const newPaidPaise = selectedInvoice.amount_paid_paise + paymentPaise;
    const newBalancePaise = selectedInvoice.total_paise - newPaidPaise;

    let updatedStatus = selectedInvoice.status;
    if (newBalancePaise <= 0) {
      updatedStatus = 'paid';
    } else if (newPaidPaise > 0) {
      // Keep or update status
      updatedStatus = 'sent';
    }

    const updatedInvoice: ExtendedInvoice = {
      ...selectedInvoice,
      amount_paid_paise: newPaidPaise,
      balance_due_paise: Math.max(0, newBalancePaise),
      status: updatedStatus,
      payments: [...(selectedInvoice.payments || []), newPayment],
      updated_at: new Date().toISOString(),
    };

    onRecordPayment(newPayment, updatedInvoice);
    setIsModalOpen(false);
    // Reset form
    setReferenceNumber('');
    setNotes('');
  };

  const totalCollectedPaise = payments.reduce((sum, p) => sum + p.amount_paise, 0);

  const columns: Column<PaymentRecord>[] = [
    {
      key: 'payment_date',
      header: 'Date',
      sortable: true,
      render: (p) => <span className="font-mono text-slate-300">{p.payment_date}</span>,
    },
    {
      key: 'invoice_number',
      header: 'Invoice #',
      sortable: true,
      render: (p) => (
        <span className="font-mono font-semibold text-brand-400">
          {p.invoice_number}
        </span>
      ),
    },
    {
      key: 'customer_name',
      header: 'Customer',
      sortable: true,
      render: (p) => <span className="font-medium text-slate-100">{p.customer_name}</span>,
    },
    {
      key: 'payment_mode',
      header: 'Mode',
      sortable: true,
      render: (p) => {
        const variants: Record<PaymentMode, 'blue' | 'emerald' | 'violet' | 'amber'> = {
          UPI: 'emerald',
          NEFT_RTGS: 'blue',
          Cheque: 'amber',
          Razorpay: 'violet',
        };
        return <Badge variant={variants[p.payment_mode]} size="sm">{p.payment_mode.replace('_', '/')}</Badge>;
      },
    },
    {
      key: 'reference_number',
      header: 'Ref / UTR #',
      render: (p) => <span className="font-mono text-slate-300 text-xs">{p.reference_number}</span>,
    },
    {
      key: 'amount_paise',
      header: 'Amount Collected',
      sortable: true,
      render: (p) => (
        <span className="font-mono text-emerald-400 font-bold text-right block">
          {formatINR(p.amount_paise)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 font-display">Payments Received Ledger</h2>
          <p className="text-xs text-slate-400">
            Record customer collections, UTR reference numbers, and auto-settle open invoices.
          </p>
        </div>

        <Button
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => handleOpenModal()}
        >
          Record New Payment
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="flex items-center justify-between p-4">
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Received</p>
            <p className="text-2xl font-bold font-mono text-emerald-400 mt-1">
              {formatINR(totalCollectedPaise)}
            </p>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </Card>

        <Card className="flex items-center justify-between p-4">
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Payment Receipts</p>
            <p className="text-2xl font-bold font-mono text-slate-100 mt-1">
              {payments.length} <span className="text-xs text-slate-400 font-sans font-normal">transactions</span>
            </p>
          </div>
          <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
            <CreditCard className="w-6 h-6" />
          </div>
        </Card>

        <Card className="flex items-center justify-between p-4">
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Open Invoices Awaiting Settle</p>
            <p className="text-2xl font-bold font-mono text-amber-400 mt-1">
              {openInvoices.length} <span className="text-xs text-slate-400 font-sans font-normal">invoices</span>
            </p>
          </div>
          <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400">
            <AlertCircle className="w-6 h-6" />
          </div>
        </Card>
      </div>

      {/* Payments DataTable */}
      <DataTable
        columns={columns}
        data={payments}
        keyExtractor={(p) => p.id}
        searchPlaceholder="Search by customer, invoice #, ref #..."
        emptyTitle="No payments recorded yet"
        emptyDescription="Click 'Record New Payment' to log collections against open customer invoices."
      />

      {/* Record Payment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Payment Receipt"
        maxWidth="lg"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSubmitPayment}>
              Save Payment Receipt
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSubmitPayment} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-rose-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Invoice Selection */}
          <Select
            label="Select Invoice"
            value={selectedInvoiceId}
            onChange={(e) => handleInvoiceChange(e.target.value)}
            options={
              openInvoices.length > 0
                ? openInvoices.map((inv) => ({
                    value: inv.id,
                    label: `${inv.invoice_number} - ${inv.customer_name} (Balance: ${formatINR(inv.balance_due_paise)})`,
                  }))
                : [{ value: '', label: 'No open invoices available' }]
            }
          />

          {selectedInvoice && (
            <div className="p-3 bg-dark-surface/60 rounded-lg border border-dark-border space-y-1 text-xs font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Total Bill Amount:</span>
                <span className="text-slate-200">{formatINR(selectedInvoice.total_paise)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Already Paid:</span>
                <span className="text-emerald-400">{formatINR(selectedInvoice.amount_paid_paise)}</span>
              </div>
              <div className="flex justify-between text-slate-300 font-bold border-t border-dark-border pt-1">
                <span>Current Balance Due:</span>
                <span className="text-amber-400">{formatINR(selectedInvoice.balance_due_paise)}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Amount */}
            <Input
              label="Amount Received (₹)"
              type="number"
              step="0.01"
              value={paymentAmountRupees}
              onChange={(e) => setPaymentAmountRupees(e.target.value)}
              placeholder="e.g. 50000"
              className="font-mono text-right"
            />

            {/* Payment Mode */}
            <Select
              label="Payment Mode"
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}
              options={[
                { value: 'NEFT_RTGS', label: 'NEFT / RTGS / IMPS' },
                { value: 'UPI', label: 'UPI (GPay / PhonePe / Paytm)' },
                { value: 'Razorpay', label: 'Razorpay Payment Gateway' },
                { value: 'Cheque', label: 'Bank Cheque / Draft' },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Reference Number */}
            <Input
              label="Reference / UTR / Cheque #"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              placeholder="e.g. UTR19283746102"
              className="font-mono"
            />

            {/* Payment Date */}
            <Input
              label="Payment Date"
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
            />
          </div>

          {/* Notes */}
          <Input
            label="Internal Notes (Optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Received via HDFC Bank main account"
          />
        </form>
      </Modal>
    </div>
  );
};
