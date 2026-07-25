// ─────────────────────────────────────────────────────────────
// Vortiq Internal Ops — Section 3: Vortiq Platform Billing & Revenue Finance
// MRR/ARR Analytics, Platform Invoices, Operating Cost Ledger, & Signup Hook
// ─────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { Card, Button, Badge, DataTable, Input, Modal } from '@/design-system';
import { VortiqPlatformInvoice, VortiqOperatingExpense, OpsClientOrg } from './types';
import {
  IndianRupee,
  TrendingUp,
  FileText,
  Receipt,
  Plus,
  Layers,
} from 'lucide-react';

interface VortiqFinanceModuleProps {
  clients: OpsClientOrg[];
  onOpenManualPaymentModal: (client: OpsClientOrg) => void;
}

export const VortiqFinanceModule: React.FC<VortiqFinanceModuleProps> = ({
  clients,
  onOpenManualPaymentModal,
}) => {
  const [activeTab, setActiveTab] = useState<'revenue' | 'invoices' | 'expenses'>('revenue');
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);

  // Mock Vortiq Platform Operating Costs Ledger
  const [expenses, setExpenses] = useState<VortiqOperatingExpense[]>([
    { id: 'exp-1', vendor_name: 'Google Cloud Platform (GCP)', category: 'Infrastructure & GCP', amount_rupees: 42500, expense_date: '2026-07-20', recorded_by: 'Alex Vance (Ops Lead)' },
    { id: 'exp-2', vendor_name: 'Supabase Enterprise Postgres', category: 'Infrastructure & GCP', amount_rupees: 28000, expense_date: '2026-07-18', recorded_by: 'Alex Vance (Ops Lead)' },
    { id: 'exp-3', vendor_name: 'Twilio SMS & WhatsApp Gateway', category: 'Twilio SMS & WhatsApp', amount_rupees: 14500, expense_date: '2026-07-15', recorded_by: 'Operations Team' },
    { id: 'exp-4', vendor_name: 'Sentry.io APM Crash Telemetry', category: 'APM & Sentry', amount_rupees: 18000, expense_date: '2026-07-10', recorded_by: 'Alex Vance (Ops Lead)' },
  ]);

  // Mock Vortiq Invoices Issued to Client Orgs
  const [invoices] = useState<VortiqPlatformInvoice[]>([
    { id: 'v-inv-101', invoice_number: 'VTQ-INV-2026-001', client_name: 'Apex Industrial Logistics', client_email: 'finance@apexind.com', amount_rupees: 49999, tax_amount_gst: 8999, billing_date: '2026-07-01', due_date: '2026-07-15', status: 'paid', plan_tier: 'enterprise' },
    { id: 'v-inv-102', invoice_number: 'VTQ-INV-2026-002', client_name: 'Reliance Retail Logistics', client_email: 'billing@relianceretail.in', amount_rupees: 49999, tax_amount_gst: 8999, billing_date: '2026-07-05', due_date: '2026-07-20', status: 'paid', plan_tier: 'enterprise' },
    { id: 'v-inv-103', invoice_number: 'VTQ-INV-2026-003', client_name: 'MedLife Diagnostics Pvt Ltd', client_email: 'accounts@medlifediag.in', amount_rupees: 24999, tax_amount_gst: 4499, billing_date: '2026-07-10', due_date: '2026-07-25', status: 'pending', plan_tier: 'pro' },
    { id: 'v-inv-104', invoice_number: 'VTQ-INV-2026-004', client_name: 'Starlight Tech Solutions', client_email: 'admin@starlighttech.com', amount_rupees: 24999, tax_amount_gst: 4499, billing_date: '2026-06-15', due_date: '2026-06-30', status: 'overdue', plan_tier: 'pro' },
  ]);

  // New Expense Form State
  const [newVendor, setNewVendor] = useState('');
  const [newCategory] = useState<VortiqOperatingExpense['category']>('Infrastructure & GCP');
  const [newAmount, setNewAmount] = useState('');

  const totalMrr = clients.reduce((acc, c) => acc + (c.monthly_recurring_revenue || 0), 0);
  const totalArr = totalMrr * 12;
  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount_rupees, 0);

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVendor || !newAmount) return;

    const newExpItem: VortiqOperatingExpense = {
      id: `exp-${Date.now()}`,
      vendor_name: newVendor,
      category: newCategory,
      amount_rupees: parseFloat(newAmount),
      expense_date: new Date().toISOString().split('T')[0],
      recorded_by: 'Alex Vance (Ops Lead)',
    };

    setExpenses([newExpItem, ...expenses]);
    setIsAddExpenseModalOpen(false);
    setNewVendor('');
    setNewAmount('');
  };

  return (
    <div className="space-y-6 font-mono text-xs text-slate-100">
      {/* Top Banner & Realm Clarification */}
      <div className="p-5 bg-dark-card border border-dark-border rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold font-display text-slate-100">Vortiq Platform Billing & Revenue Ledger</h1>
            <Badge variant="emerald" size="sm" className="uppercase font-bold">Vortiq Business Realm</Badge>
          </div>
          <p className="text-2xs text-slate-400 mt-1">
            Tracks Vortiq's own SaaS subscription MRR, client platform invoices, & operating cost ledger.
          </p>
        </div>

        {/* View Selector Tabs */}
        <div className="flex p-1 bg-dark-surface rounded-xl border border-dark-border text-xs font-semibold">
          <button
            onClick={() => setActiveTab('revenue')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-all ${
              activeTab === 'revenue' ? 'bg-brand-500 text-dark-bg font-bold shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>MRR & Revenue</span>
          </button>
          <button
            onClick={() => setActiveTab('invoices')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-all ${
              activeTab === 'invoices' ? 'bg-brand-500 text-dark-bg font-bold shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Platform Invoices</span>
          </button>
          <button
            onClick={() => setActiveTab('expenses')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-all ${
              activeTab === 'expenses' ? 'bg-brand-500 text-dark-bg font-bold shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Operating Costs</span>
          </button>
        </div>
      </div>

      {/* Revenue & MRR Overview Tab */}
      {activeTab === 'revenue' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Card className="p-4 bg-dark-card border-dark-border space-y-1">
              <span className="text-3xs font-semibold text-slate-400 uppercase tracking-wider block">Monthly Recurring Revenue (MRR)</span>
              <span className="text-2xl font-extrabold text-emerald-400 font-display block">₹{totalMrr.toLocaleString('en-IN')}</span>
              <span className="text-3xs text-emerald-400 block">+14% Growth from Last Month</span>
            </Card>

            <Card className="p-4 bg-dark-card border-dark-border space-y-1">
              <span className="text-3xs font-semibold text-slate-400 uppercase tracking-wider block">Annual Recurring Revenue (ARR)</span>
              <span className="text-2xl font-extrabold text-slate-100 font-display block">₹{totalArr.toLocaleString('en-IN')}</span>
              <span className="text-3xs text-slate-400 block">Projected 12-Month Run-Rate</span>
            </Card>

            <Card className="p-4 bg-dark-card border-dark-border space-y-1">
              <span className="text-3xs font-semibold text-slate-400 uppercase tracking-wider block">Operating Expenses (MTD)</span>
              <span className="text-2xl font-extrabold text-rose-400 font-display block">₹{totalExpenses.toLocaleString('en-IN')}</span>
              <span className="text-3xs text-slate-400 block">GCP & Vendor Services</span>
            </Card>

            <Card className="p-4 bg-dark-card border-dark-border space-y-1">
              <span className="text-3xs font-semibold text-slate-400 uppercase tracking-wider block">Net Operating Profit</span>
              <span className="text-2xl font-extrabold text-emerald-400 font-display block">₹{(totalMrr - totalExpenses).toLocaleString('en-IN')}</span>
              <span className="text-3xs text-emerald-400 block">Gross Profit Margin 78%</span>
            </Card>
          </div>

          {/* Client MRR Contribution Table */}
          <Card className="p-5 bg-dark-card border-dark-border space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100 font-display flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              Client Subscription Revenue Breakdown
            </h3>

            <DataTable
              data={clients}
              keyExtractor={(c) => c.id}
              columns={[
                {
                  key: 'org_name',
                  header: 'Client Company',
                  render: (c) => (
                    <div>
                      <div className="font-bold text-slate-100 font-display">{c.org_name}</div>
                      <div className="text-3xs text-slate-400">{c.registered_admin_email}</div>
                    </div>
                  ),
                },
                {
                  key: 'plan_tier',
                  header: 'Plan Tier',
                  render: (c) => <Badge variant="emerald" size="sm" className="uppercase font-bold">{c.plan_tier}</Badge>,
                },
                {
                  key: 'mrr',
                  header: 'Monthly MRR',
                  render: (c) => `₹${(c.monthly_recurring_revenue || 0).toLocaleString('en-IN')}`,
                },
                {
                  key: 'subscription_status',
                  header: 'Status',
                  render: (c) => <span className="uppercase text-3xs font-bold text-slate-300">{c.subscription_status}</span>,
                },
                {
                  key: 'actions',
                  header: 'Action',
                  render: (c) => (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onOpenManualPaymentModal(c)}
                      leftIcon={<IndianRupee className="w-3 h-3 text-emerald-400" />}
                    >
                      Record Payment
                    </Button>
                  ),
                },
              ]}
            />
          </Card>
        </div>
      )}

      {/* Platform Invoices Tab */}
      {activeTab === 'invoices' && (
        <Card className="p-5 bg-dark-card border-dark-border space-y-4">
          <div className="flex items-center justify-between border-b border-dark-border pb-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100 font-display flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand-400" />
                Vortiq Platform Subscription Invoices Issued
              </h3>
              <p className="text-3xs text-slate-400 mt-0.5">SaaS invoices issued to client organizations (18% GST included)</p>
            </div>
          </div>

          <DataTable
            data={invoices}
            keyExtractor={(inv) => inv.id}
            columns={[
              {
                key: 'invoice_number',
                header: 'Invoice #',
                render: (inv) => inv.invoice_number,
              },
              {
                key: 'client_name',
                header: 'Client Company',
                render: (inv) => (
                  <div>
                    <div className="font-bold text-slate-100">{inv.client_name}</div>
                    <div className="text-3xs text-slate-400">{inv.client_email}</div>
                  </div>
                ),
              },
              {
                key: 'amount',
                header: 'Amount + GST',
                render: (inv) => `₹${(inv.amount_rupees + inv.tax_amount_gst).toLocaleString('en-IN')}`,
              },
              {
                key: 'billing_date',
                header: 'Billing Date',
                render: (inv) => inv.billing_date,
              },
              {
                key: 'status',
                header: 'Status',
                render: (inv) => (
                  <Badge
                    variant={inv.status === 'paid' ? 'emerald' : inv.status === 'pending' ? 'amber' : 'rose'}
                    size="sm"
                    className="uppercase font-bold"
                  >
                    {inv.status}
                  </Badge>
                ),
              },
            ]}
          />
        </Card>
      )}

      {/* Operating Expense Ledger Tab */}
      {activeTab === 'expenses' && (
        <Card className="p-5 bg-dark-card border-dark-border space-y-4">
          <div className="flex items-center justify-between border-b border-dark-border pb-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100 font-display flex items-center gap-2">
                <Receipt className="w-4 h-4 text-rose-400" />
                Vortiq Operating Costs Ledger
              </h3>
              <p className="text-3xs text-slate-400 mt-0.5">Internal infrastructure, APM, & vendor operating expenses</p>
            </div>

            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => setIsAddExpenseModalOpen(true)}
            >
              Log New Expense
            </Button>
          </div>

          <DataTable
            data={expenses}
            keyExtractor={(exp) => exp.id}
            columns={[
              {
                key: 'vendor_name',
                header: 'Vendor Name',
                render: (exp) => exp.vendor_name,
              },
              {
                key: 'category',
                header: 'Category',
                render: (exp) => <Badge variant="violet" size="sm">{exp.category}</Badge>,
              },
              {
                key: 'amount',
                header: 'Expense Amount',
                render: (exp) => `₹${exp.amount_rupees.toLocaleString('en-IN')}`,
              },
              {
                key: 'expense_date',
                header: 'Date',
                render: (exp) => exp.expense_date,
              },
              {
                key: 'recorded_by',
                header: 'Recorded By',
                render: (exp) => exp.recorded_by,
              },
            ]}
          />
        </Card>
      )}

      {/* Log Operating Expense Modal */}
      <Modal
        isOpen={isAddExpenseModalOpen}
        onClose={() => setIsAddExpenseModalOpen(false)}
        title="Log Vortiq Operating Expense"
        maxWidth="sm"
      >
        <form onSubmit={handleAddExpense} className="space-y-4 text-xs font-mono">
          <div>
            <label className="text-3xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Vendor Name</label>
            <Input
              value={newVendor}
              onChange={(e) => setNewVendor(e.target.value)}
              placeholder="e.g. Google Cloud Platform"
              required
            />
          </div>

          <div>
            <label className="text-3xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Expense Amount (₹)</label>
            <Input
              type="number"
              value={newAmount}
              onChange={(e) => setNewAmount(e.target.value)}
              placeholder="42500"
              required
            />
          </div>

          <Button variant="primary" size="md" className="w-full" type="submit">
            Add Expense Record
          </Button>
        </form>
      </Modal>
    </div>
  );
};
