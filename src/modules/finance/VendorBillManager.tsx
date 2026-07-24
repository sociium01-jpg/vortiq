// ─────────────────────────────────────────────────────────────
// Vortiq Vendor Bills & Accounts Payable (AP) Manager
// Accounts Payable tracking alongside Invoicing & Accounts Receivable (AR)
// ─────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { Card, Badge, Button, Modal, Input } from '@/design-system';
import { VendorBill, SEED_VENDOR_BILLS } from './types';
import { CreditCard, Plus, Calendar, DollarSign } from 'lucide-react';

export const VendorBillManager: React.FC = () => {
  const [vendorBills, setVendorBills] = useState<VendorBill[]>(SEED_VENDOR_BILLS);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Vendor Bill Form
  const [vendorName, setVendorName] = useState('Apex Industrial Component Suppliers Ltd');
  const [billNumber, setBillNumber] = useState('BILL-2026-9901');
  const [totalAmountInput, setTotalAmountInput] = useState('125000');
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0]);

  const handleCreateBill = (e: React.FormEvent) => {
    e.preventDefault();
    const tot = parseFloat(totalAmountInput) || 0;

    const newBill: VendorBill = {
      id: `vb-${Date.now()}`,
      tenant_id: 'tenant-prod-001',
      vendor_name: vendorName,
      bill_number: billNumber,
      due_date: dueDate,
      total_amount: tot,
      paid_amount: 0,
      status: 'unpaid',
      created_at: new Date().toISOString(),
    };

    setVendorBills([newBill, ...vendorBills]);
    setIsModalOpen(false);
  };

  const handleRecordPayment = (billId: string) => {
    setVendorBills((prev) =>
      prev.map((b) =>
        b.id === billId ? { ...b, paid_amount: b.total_amount, status: 'paid' } : b
      )
    );
  };

  const totalApUnpaid = vendorBills
    .filter((b) => b.status !== 'paid')
    .reduce((acc, b) => acc + (b.total_amount - b.paid_amount), 0);

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="p-4 bg-dark-card border-dark-border">
          <div className="flex items-center justify-between">
            <span className="text-2xs font-semibold uppercase text-slate-400 tracking-wider">Total Accounts Payable (AP)</span>
            <CreditCard className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black font-mono text-rose-400">₹{totalApUnpaid.toLocaleString('en-IN')}</span>
            <Badge variant="rose" size="sm">Outstanding AP</Badge>
          </div>
          <p className="text-2xs text-slate-400 font-mono mt-1">Pending vendor bill liabilities</p>
        </Card>

        <Card className="p-4 bg-dark-card border-dark-border">
          <div className="flex items-center justify-between">
            <span className="text-2xs font-semibold uppercase text-slate-400 tracking-wider">Total Vendor Bills</span>
            <Calendar className="w-4 h-4 text-brand-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black font-mono text-slate-100">{vendorBills.length}</span>
            <Badge variant="violet" size="sm">Active Vendors</Badge>
          </div>
          <p className="text-2xs text-slate-400 font-mono mt-1">AP lifecycle management</p>
        </Card>
      </div>

      {/* Vendor Bills List Table */}
      <Card className="p-5 bg-dark-card border-dark-border space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-display flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-brand-400" />
              Vendor Bills & Accounts Payable ({vendorBills.length})
            </h4>
            <p className="text-2xs text-slate-400 mt-0.5">Track supplier invoices and payables balance</p>
          </div>

          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setIsModalOpen(true)}
          >
            Create Vendor Bill
          </Button>
        </div>

        <div className="space-y-3">
          {vendorBills.map((bill) => (
            <div key={bill.id} className="p-4 bg-dark-surface/60 rounded-xl border border-dark-border flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-100 font-display">{bill.vendor_name}</span>
                  <Badge variant={bill.status === 'paid' ? 'emerald' : 'rose'} size="sm">
                    {bill.status}
                  </Badge>
                  <span className="text-2xs font-mono text-slate-400">{bill.bill_number}</span>
                </div>
                <p className="text-2xs text-slate-300 font-mono">Due Date: {bill.due_date}</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right font-mono">
                  <span className="text-2xs text-slate-400 block">Total / Paid</span>
                  <span className="font-bold text-slate-100">
                    ₹{bill.total_amount.toLocaleString('en-IN')} / <span className="text-emerald-400">₹{bill.paid_amount.toLocaleString('en-IN')}</span>
                  </span>
                </div>

                {bill.status !== 'paid' && (
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<DollarSign className="w-3.5 h-3.5" />}
                    onClick={() => handleRecordPayment(bill.id)}
                  >
                    Record Bill Payment
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Create Vendor Bill Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Record New Vendor Bill (Accounts Payable)"
          maxWidth="md"
        >
          <form onSubmit={handleCreateBill} className="space-y-4">
            <div>
              <label className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Vendor Name</label>
              <Input
                type="text"
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Vendor Bill Number</label>
              <Input
                type="text"
                value={billNumber}
                onChange={(e) => setBillNumber(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Total Bill Amount (₹)</label>
                <Input
                  type="number"
                  value={totalAmountInput}
                  onChange={(e) => setTotalAmountInput(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Payment Due Date</label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button variant="primary" size="md" className="w-full" type="submit" leftIcon={<CreditCard className="w-4 h-4" />}>
              Save Vendor Bill
            </Button>
          </form>
        </Modal>
      )}
    </div>
  );
};
