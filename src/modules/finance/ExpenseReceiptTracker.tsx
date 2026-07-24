// ─────────────────────────────────────────────────────────────
// Vortiq Expense Tracker & Receipt Photo Capture Surface
// Receipt photo upload (reusing Inventory pattern) & GST ITC claimable calculation
// ─────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { Card, Badge, Button, Modal, Input } from '@/design-system';
import { FinanceExpense, SEED_FINANCE_EXPENSES } from './types';
import { Receipt, Camera, Plus, DollarSign, Image } from 'lucide-react';

export const ExpenseReceiptTracker: React.FC = () => {
  const [expenses, setExpenses] = useState<FinanceExpense[]>(SEED_FINANCE_EXPENSES);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Expense Form State
  const [category, setCategory] = useState('Cloud Infrastructure & Server Hosting');
  const [amountInput, setAmountInput] = useState('42500');
  const [vendorName, setVendorName] = useState('Google Cloud Asia-South1');
  const [isBillable, setIsBillable] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amountInput) || 0;
    const itc = Math.round(amt * 0.18); // 18% GST Input Tax Credit claimable

    const newExpense: FinanceExpense = {
      id: `exp-${Date.now()}`,
      tenant_id: 'tenant-prod-001',
      category: category,
      amount: amt,
      vendor_name: vendorName,
      is_billable: isBillable,
      customer_name: isBillable ? customerName : undefined,
      gst_itc_claimable: itc,
      receipt_url: receiptUrl || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400',
      notes: 'Recorded with receipt photo attachment',
      expense_date: new Date().toISOString().split('T')[0],
    };

    setExpenses([newExpense, ...expenses]);
    setIsModalOpen(false);
  };

  const totalExpense = expenses.reduce((acc, e) => acc + e.amount, 0);
  const totalItc = expenses.reduce((acc, e) => acc + e.gst_itc_claimable, 0);

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="p-4 bg-dark-card border-dark-border">
          <div className="flex items-center justify-between">
            <span className="text-2xs font-semibold uppercase text-slate-400 tracking-wider">Total Recorded Expenses</span>
            <Receipt className="w-4 h-4 text-brand-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black font-mono text-slate-100">₹{totalExpense.toLocaleString('en-IN')}</span>
            <Badge variant="violet" size="sm">{expenses.length} Receipts</Badge>
          </div>
          <p className="text-2xs text-slate-400 font-mono mt-1">Operational & Infrastructure expenses</p>
        </Card>

        <Card className="p-4 bg-dark-card border-dark-border">
          <div className="flex items-center justify-between">
            <span className="text-2xs font-semibold uppercase text-emerald-400 tracking-wider">GST Input Tax Credit (ITC) Claimable</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black font-mono text-emerald-400">₹{totalItc.toLocaleString('en-IN')}</span>
            <Badge variant="emerald" size="sm">18% GST ITC</Badge>
          </div>
          <p className="text-2xs text-slate-400 font-mono mt-1">Setoff against GSTR-3B liability</p>
        </Card>
      </div>

      {/* Expense List Table */}
      <Card className="p-5 bg-dark-card border-dark-border space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-display flex items-center gap-2">
              <Receipt className="w-4 h-4 text-brand-400" />
              Recorded Business Expenses ({expenses.length})
            </h4>
            <p className="text-2xs text-slate-400 mt-0.5">Track receipt photo attachments and GST Input Tax Credit (ITC)</p>
          </div>

          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setIsModalOpen(true)}
          >
            Record Expense & Receipt
          </Button>
        </div>

        <div className="space-y-3">
          {expenses.map((exp) => (
            <div key={exp.id} className="p-4 bg-dark-surface/60 rounded-xl border border-dark-border flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-100 font-display">{exp.category}</span>
                  {exp.is_billable && <Badge variant="amber" size="sm">Billable</Badge>}
                  <Badge variant="emerald" size="sm" className="font-mono">ITC Claimable: ₹{exp.gst_itc_claimable.toLocaleString('en-IN')}</Badge>
                </div>
                <p className="text-2xs text-slate-300 font-mono">Vendor: {exp.vendor_name} • Date: {exp.expense_date}</p>
                {exp.notes && <p className="text-2xs text-slate-400 font-mono">Notes: {exp.notes}</p>}
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm font-black font-mono text-slate-100">₹{exp.amount.toLocaleString('en-IN')}</span>
                {exp.receipt_url && (
                  <a href={exp.receipt_url} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg bg-dark-card border border-dark-border text-brand-400 hover:text-brand-300 flex items-center gap-1 text-2xs font-mono">
                    <Image className="w-3.5 h-3.5" /> Receipt
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Record Expense Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Record Business Expense & Attach Receipt Photo"
          maxWidth="md"
        >
          <form onSubmit={handleCreateExpense} className="space-y-4">
            <div>
              <label className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Expense Category</label>
              <Input
                type="text"
                placeholder="Cloud Infrastructure / Office Supplies"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Vendor / Supplier Name</label>
              <Input
                type="text"
                placeholder="Google Cloud / AWS"
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Amount (₹)</label>
                <Input
                  type="number"
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Receipt Image URL</label>
                <Input
                  type="text"
                  placeholder="https://..."
                  value={receiptUrl}
                  onChange={(e) => setReceiptUrl(e.target.value)}
                />
              </div>
            </div>

            <div className="p-3 bg-dark-surface rounded-xl border border-dark-border space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isBillable}
                  onChange={(e) => setIsBillable(e.target.checked)}
                  className="rounded border-dark-border text-brand-500 focus:ring-brand-500"
                />
                <span className="text-xs font-bold text-slate-200 font-display">Mark as Billable to Customer</span>
              </label>

              {isBillable && (
                <div>
                  <label className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Customer Name</label>
                  <Input
                    type="text"
                    placeholder="Apollo Hospital"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                </div>
              )}
            </div>

            <Button variant="primary" size="md" className="w-full" type="submit" leftIcon={<Camera className="w-4 h-4" />}>
              Save Expense & Receipt
            </Button>
          </form>
        </Modal>
      )}
    </div>
  );
};
