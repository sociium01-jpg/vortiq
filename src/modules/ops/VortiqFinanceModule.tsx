// ─────────────────────────────────────────────────────────────
// Vortiq Internal Ops — Section 3: Vortiq Platform Billing & Revenue Finance
// MRR/ARR Analytics, Platform Invoices, Operating Cost Ledger, & Gmail Integration
// ─────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { Card, Button, Badge, Input, Modal, Select } from '@/design-system';
import { VortiqPlatformInvoice, VortiqOperatingExpense, OpsClientOrg } from './types';
import {
  Plus,
  Mail,
  CheckCircle2,
} from 'lucide-react';

interface VortiqFinanceModuleProps {
  clients: OpsClientOrg[];
  onOpenManualPaymentModal: (client: OpsClientOrg) => void;
}

export const VortiqFinanceModule: React.FC<VortiqFinanceModuleProps> = ({
  clients,
}) => {
  const [activeTab, setActiveTab] = useState<'revenue' | 'invoices' | 'expenses'>('revenue');
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  const [isGenerateInvoiceModalOpen, setIsGenerateInvoiceModalOpen] = useState(false);

  // Email Dispatch Toast State
  const [emailSuccessMessage, setEmailSuccessMessage] = useState<string | null>(null);

  // Mock Vortiq Platform Operating Costs Ledger
  const [expenses, setExpenses] = useState<VortiqOperatingExpense[]>([
    { id: 'exp-1', vendor_name: 'Google Cloud Platform (GCP)', category: 'Infrastructure & GCP', amount_rupees: 42500, expense_date: '2026-07-20', recorded_by: 'Alex Vance (Ops Lead)' },
    { id: 'exp-2', vendor_name: 'Supabase Enterprise Postgres', category: 'Infrastructure & GCP', amount_rupees: 28000, expense_date: '2026-07-18', recorded_by: 'Alex Vance (Ops Lead)' },
    { id: 'exp-3', vendor_name: 'Twilio SMS & WhatsApp Gateway', category: 'Twilio SMS & WhatsApp', amount_rupees: 14500, expense_date: '2026-07-15', recorded_by: 'Operations Team' },
    { id: 'exp-4', vendor_name: 'Sentry.io APM Crash Telemetry', category: 'APM & Sentry', amount_rupees: 18000, expense_date: '2026-07-10', recorded_by: 'Alex Vance (Ops Lead)' },
  ]);

  // Mock Vortiq Invoices Issued to Client Orgs
  const [invoices, setInvoices] = useState<VortiqPlatformInvoice[]>([
    { id: 'v-inv-101', invoice_number: 'VTQ-INV-2026-001', client_name: 'Apex Industrial Logistics', client_email: 'finance@apexind.com', amount_rupees: 49999, tax_amount_gst: 8999, tds_deducted_rupees: 1000, billing_date: '2026-07-01', due_date: '2026-07-15', status: 'paid', plan_tier: 'enterprise', is_manually_logged: true },
    { id: 'v-inv-102', invoice_number: 'VTQ-INV-2026-002', client_name: 'Reliance Retail Logistics', client_email: 'billing@relianceretail.in', amount_rupees: 49999, tax_amount_gst: 8999, tds_deducted_rupees: 1000, billing_date: '2026-07-05', due_date: '2026-07-20', status: 'paid', plan_tier: 'enterprise', is_manually_logged: true },
    { id: 'v-inv-103', invoice_number: 'VTQ-INV-2026-003', client_name: 'MedLife Diagnostics Pvt Ltd', client_email: 'accounts@medlifediag.in', amount_rupees: 24999, tax_amount_gst: 4499, tds_deducted_rupees: 0, billing_date: '2026-07-10', due_date: '2026-07-25', status: 'pending', plan_tier: 'pro', is_manually_logged: false },
    { id: 'v-inv-104', invoice_number: 'VTQ-INV-2026-004', client_name: 'Starlight Tech Solutions', client_email: 'admin@starlighttech.com', amount_rupees: 24999, tax_amount_gst: 4499, tds_deducted_rupees: 0, billing_date: '2026-06-15', due_date: '2026-06-30', status: 'overdue', plan_tier: 'pro', is_manually_logged: false },
  ]);

  // Form states for new invoice
  const [selectedClientForInv, setSelectedClientForInv] = useState(clients[0]?.id || '');
  const [invAmount, setInvAmount] = useState('24999');

  // Form state for new expense
  const [newVendor, setNewVendor] = useState('');
  const [newCategory, setNewCategory] = useState<VortiqOperatingExpense['category']>('Infrastructure & GCP');
  const [newAmount, setNewAmount] = useState('');

  // Revenue Totals
  const totalBilled = invoices.reduce((acc, i) => acc + i.amount_rupees, 0);
  const totalPaid = invoices.filter((i) => i.status === 'paid').reduce((acc, i) => acc + i.amount_rupees, 0);
  const totalTdsDeducted = invoices.reduce((acc, i) => acc + (i.tds_deducted_rupees || 0), 0);
  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount_rupees, 0);
  const netOperatingProfit = totalPaid - totalExpenses;

  const handleSendInvoiceEmail = (inv: VortiqPlatformInvoice) => {
    setEmailSuccessMessage(`Invoice ${inv.invoice_number} sent via Gmail (billing@vortiq.biz) to ${inv.client_email}`);
    setTimeout(() => setEmailSuccessMessage(null), 4000);
  };

  const handleGenerateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const client = clients.find((c) => c.id === selectedClientForInv) || clients[0];
    const amountNum = parseFloat(invAmount) || 24999;
    const gstNum = Math.round(amountNum * 0.18);

    const newInv: VortiqPlatformInvoice = {
      id: `v-inv-${Date.now()}`,
      invoice_number: `VTQ-INV-2026-00${invoices.length + 1}`,
      client_name: client ? client.org_name : 'New Client',
      client_email: client ? client.registered_admin_email : 'billing@client.com',
      amount_rupees: amountNum,
      tax_amount_gst: gstNum,
      tds_deducted_rupees: 0,
      billing_date: new Date().toISOString().split('T')[0],
      due_date: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
      status: 'pending',
      plan_tier: client ? client.plan_tier : 'pro',
      is_manually_logged: true,
    };

    setInvoices([newInv, ...invoices]);
    setIsGenerateInvoiceModalOpen(false);
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVendor || !newAmount) return;

    const createdExpense: VortiqOperatingExpense = {
      id: `exp-${Date.now()}`,
      vendor_name: newVendor,
      category: newCategory,
      amount_rupees: parseFloat(newAmount),
      expense_date: new Date().toISOString().split('T')[0],
      recorded_by: 'Alex Vance (Ops Lead)',
    };

    setExpenses([createdExpense, ...expenses]);
    setNewVendor('');
    setNewAmount('');
    setIsAddExpenseModalOpen(false);
  };

  return (
    <div className="space-y-6 font-mono text-xs text-slate-100">
      {/* Top Banner & Tab Navigation */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 bg-dark-card border border-dark-border rounded-xl shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-100 font-display">Vortiq Platform Financials</h2>
            <Badge variant="blue" size="sm">Vortiq Revenue & Costs</Badge>
          </div>
          <p className="text-3xs text-slate-400 mt-0.5">
            Internal P&L ledger: SaaS subscription billing, TDS deductions, and infrastructure expenses.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex p-1 bg-dark-surface rounded-lg border border-dark-border">
            <button
              onClick={() => setActiveTab('revenue')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeTab === 'revenue' ? 'bg-brand-500 text-dark-bg font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Revenue Summary
            </button>
            <button
              onClick={() => setActiveTab('invoices')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeTab === 'invoices' ? 'bg-brand-500 text-dark-bg font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Platform Invoices ({invoices.length})
            </button>
            <button
              onClick={() => setActiveTab('expenses')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeTab === 'expenses' ? 'bg-brand-500 text-dark-bg font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Operating Expenses ({expenses.length})
            </button>
          </div>

          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setIsGenerateInvoiceModalOpen(true)}
          >
            Generate Invoice
          </Button>
        </div>
      </div>

      {emailSuccessMessage && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-emerald-300 text-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{emailSuccessMessage}</span>
        </div>
      )}

      {/* REVENUE SUMMARY TAB */}
      {activeTab === 'revenue' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Card className="p-4 space-y-1 bg-dark-card border-dark-border">
              <span className="text-3xs text-slate-400 uppercase tracking-wider block">Total Billed Revenue</span>
              <span className="text-lg font-bold text-slate-100">₹{totalBilled.toLocaleString('en-IN')}</span>
              <span className="text-3xs text-slate-500 block">Inc. 18% GST</span>
            </Card>

            <Card className="p-4 space-y-1 bg-dark-card border-emerald-500/30">
              <span className="text-3xs text-slate-400 uppercase tracking-wider block">Collected Cash</span>
              <span className="text-lg font-bold text-emerald-400">₹{totalPaid.toLocaleString('en-IN')}</span>
              <span className="text-3xs text-emerald-500 block">Manually Verified</span>
            </Card>

            <Card className="p-4 space-y-1 bg-dark-card border-amber-500/30">
              <span className="text-3xs text-slate-400 uppercase tracking-wider block">TDS Deductions (Form 26Q)</span>
              <span className="text-lg font-bold text-amber-300">₹{totalTdsDeducted.toLocaleString('en-IN')}</span>
              <span className="text-3xs text-slate-400 block">Claimable Income Tax</span>
            </Card>

            <Card className="p-4 space-y-1 bg-dark-card border-blue-500/30">
              <span className="text-3xs text-slate-400 uppercase tracking-wider block">Net Operating Profit</span>
              <span className="text-lg font-bold text-blue-400">₹{netOperatingProfit.toLocaleString('en-IN')}</span>
              <span className="text-3xs text-slate-400 block">After GCP & Vendor Costs</span>
            </Card>
          </div>
        </div>
      )}

      {/* PLATFORM INVOICES TAB */}
      {activeTab === 'invoices' && (
        <Card className="p-4 bg-dark-card border-dark-border">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-dark-border text-2xs uppercase font-mono text-slate-400 bg-dark-surface/50">
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Client Name</th>
                  <th className="py-3 px-4">Plan Tier</th>
                  <th className="py-3 px-4 text-right">Amount (₹)</th>
                  <th className="py-3 px-4 text-right">TDS (₹)</th>
                  <th className="py-3 px-4">Payment Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border text-xs font-mono">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-800/20">
                    <td className="py-3 px-4 font-bold text-brand-400">{inv.invoice_number}</td>
                    <td className="py-3 px-4 text-slate-200">{inv.client_name}</td>
                    <td className="py-3 px-4 uppercase text-2xs text-slate-300">{inv.plan_tier}</td>
                    <td className="py-3 px-4 text-right font-bold text-slate-100">₹{inv.amount_rupees.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-right text-amber-300">₹{(inv.tds_deducted_rupees || 0).toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <Badge variant={inv.status === 'paid' ? 'emerald' : inv.status === 'pending' ? 'amber' : 'rose'} size="sm">
                          {inv.status.toUpperCase()}
                        </Badge>
                        {inv.is_manually_logged && (
                          <span className="text-3xs text-slate-500 uppercase font-bold">(Manual)</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<Mail className="w-3.5 h-3.5 text-blue-400" />}
                        onClick={() => handleSendInvoiceEmail(inv)}
                      >
                        Send Gmail
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* OPERATING EXPENSES TAB */}
      {activeTab === 'expenses' && (
        <Card className="p-4 bg-dark-card border-dark-border">
          <div className="flex justify-between items-center px-4 py-3 border-b border-dark-border">
            <h3 className="text-xs font-bold text-slate-200 uppercase font-mono tracking-wider">Vortiq Operating Expenses</h3>
            <Button variant="outline" size="sm" onClick={() => setIsAddExpenseModalOpen(true)}>
              + Record Expense
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-dark-border text-2xs uppercase font-mono text-slate-400 bg-dark-surface/50">
                  <th className="py-3 px-4">Vendor</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Amount (₹)</th>
                  <th className="py-3 px-4">Recorded By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border text-xs font-mono">
                {expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-800/20">
                    <td className="py-3 px-4 font-bold text-slate-200">{exp.vendor_name}</td>
                    <td className="py-3 px-4 text-slate-400">{exp.category}</td>
                    <td className="py-3 px-4 text-slate-400">{exp.expense_date}</td>
                    <td className="py-3 px-4 text-right font-bold text-rose-400">₹{exp.amount_rupees.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-slate-400">{exp.recorded_by}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Generate Invoice Modal */}
      {isGenerateInvoiceModalOpen && (
        <Modal
          isOpen={isGenerateInvoiceModalOpen}
          onClose={() => setIsGenerateInvoiceModalOpen(false)}
          title="Generate Vortiq Platform Invoice"
        >
          <form onSubmit={handleGenerateInvoice} className="space-y-4 py-2 font-sans">
            <Select
              label="Target Client Organization"
              value={selectedClientForInv}
              onChange={(e) => setSelectedClientForInv(e.target.value)}
              options={clients.map((c) => ({ value: c.id, label: `${c.org_name} (${c.plan_tier.toUpperCase()})` }))}
            />
            <Input
              label="Billing Amount (₹)"
              type="number"
              value={invAmount}
              onChange={(e) => setInvAmount(e.target.value)}
              required
            />
            <p className="text-2xs text-slate-400 font-mono">
              + 18% GST (₹{Math.round((parseFloat(invAmount) || 0) * 0.18).toLocaleString('en-IN')}) will be added automatically.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setIsGenerateInvoiceModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Create Invoice
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Add Expense Modal */}
      {isAddExpenseModalOpen && (
        <Modal
          isOpen={isAddExpenseModalOpen}
          onClose={() => setIsAddExpenseModalOpen(false)}
          title="Record Operating Expense"
        >
          <form onSubmit={handleAddExpense} className="space-y-4 py-2 font-sans">
            <Input
              label="Vendor Name"
              value={newVendor}
              onChange={(e) => setNewVendor(e.target.value)}
              placeholder="e.g. AWS / Google Cloud"
              required
            />
            <Select
              label="Category"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as any)}
              options={[
                { value: 'Infrastructure & GCP', label: 'Infrastructure & GCP' },
                { value: 'APM & Sentry', label: 'APM & Sentry' },
                { value: 'Twilio SMS & WhatsApp', label: 'Twilio SMS & WhatsApp' },
                { value: 'Database Backup', label: 'Database Backup' },
                { value: 'Legal & Compliance', label: 'Legal & Compliance' },
              ]}
            />
            <Input
              label="Expense Amount (₹)"
              type="number"
              value={newAmount}
              onChange={(e) => setNewAmount(e.target.value)}
              required
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setIsAddExpenseModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Save Expense Entry
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
