// ─────────────────────────────────────────────────────────────
// Vortiq Finance Module (Zoho Books Parity 2026)
// Invoices & Accounts Receivable (AR), Customer Subscriptions, Expense Receipt Tracker,
// Vendor Bills & Accounts Payable (AP), Department Budgets, Financial Statements P&L, & Audit Shielding
// ─────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { Button, Badge } from '@/design-system';
import {
  ExtendedInvoice,
  Customer,
  FinancialAuditLog,
  FinanceTab,
  SEED_FINANCE_AUDIT_LOGS,
} from './types';
import { InvoiceArManager } from './InvoiceArManager';
import { TdsLedger } from './TdsLedger';
import { RecurringInvoiceManager } from './RecurringInvoiceManager';
import { ExpenseReceiptTracker } from './ExpenseReceiptTracker';
import { VendorBillManager } from './VendorBillManager';
import { BudgetVsActualReporter } from './BudgetVsActualReporter';
import { FinancialStatementExporter } from './FinancialStatementExporter';
import { FinancialAuditLogModal } from './FinancialAuditLogModal';
import {
  FileText,
  Receipt,
  CreditCard,
  PieChart,
  BarChart3,
  ShieldAlert,
  History,
  Flag,
  PhoneCall,
  Percent,
} from 'lucide-react';

const SEED_CUSTOMERS: Customer[] = [
  { id: 'c-101', tenant_id: 'tenant-prod-001', name: 'Reliance Retail Logistics Ltd', gstin: '27AAAAA0000A1Z5', email: 'billing@relianceretail.com', phone: '+91 98200 44556', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'c-102', tenant_id: 'tenant-prod-001', name: 'Kavita Traders Mumbai', gstin: '27BBBBB1111B2Z6', email: 'accounts@kavitatraders.in', phone: '+91 98200 12345', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'c-103', tenant_id: 'tenant-prod-001', name: 'Verma Constructions Pune', gstin: '27CCCCC2222C3Z7', email: 'info@vermaconstructions.com', phone: '+91 97200 99887', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

const INITIAL_INVOICES: ExtendedInvoice[] = [
  {
    id: 'inv-101',
    tenant_id: 'tenant-prod-001',
    invoice_number: 'INV-2026-0041',
    customer_id: 'c-101',
    customer_name: 'Reliance Retail Logistics Ltd',
    customer_gstin: '27AAAAA0000A1Z5',
    invoice_date: '2026-07-01',
    due_date: '2026-07-31',
    status: 'paid',
    gst_treatment: 'b2b',
    is_igst: false,
    subtotal_paise: 85000000,
    cgst_paise: 7650000,
    sgst_paise: 7650000,
    igst_paise: 0,
    tds_paise: 0,
    total_paise: 100300000,
    total_amount_paise: 100300000,
    total_gst_paise: 15300000,
    amount_paid_paise: 100300000,
    balance_due_paise: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'inv-102',
    tenant_id: 'tenant-prod-001',
    invoice_number: 'INV-2026-0042',
    customer_id: 'c-102',
    customer_name: 'Kavita Traders Mumbai',
    customer_gstin: '27BBBBB1111B2Z6',
    invoice_date: '2026-07-10',
    due_date: '2026-08-10',
    status: 'sent',
    gst_treatment: 'b2b',
    is_igst: false,
    subtotal_paise: 42000000,
    cgst_paise: 3780000,
    sgst_paise: 3780000,
    igst_paise: 0,
    tds_paise: 0,
    total_paise: 49560000,
    total_amount_paise: 49560000,
    total_gst_paise: 7560000,
    amount_paid_paise: 0,
    balance_due_paise: 49560000,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'inv-103',
    tenant_id: 'tenant-prod-001',
    invoice_number: 'INV-2026-0043',
    customer_id: 'c-103',
    customer_name: 'Verma Constructions Pune',
    customer_gstin: '27CCCCC2222C3Z7',
    invoice_date: '2026-07-15',
    due_date: '2026-08-15',
    status: 'partially_paid',
    gst_treatment: 'b2b',
    is_igst: false,
    subtotal_paise: 100000000,
    cgst_paise: 9000000,
    sgst_paise: 9000000,
    igst_paise: 0,
    tds_paise: 0,
    total_paise: 118000000,
    total_amount_paise: 118000000,
    total_gst_paise: 18000000,
    amount_paid_paise: 50000000,
    balance_due_paise: 68000000,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const FinanceModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<FinanceTab>('invoices');
  const [invoices, setInvoices] = useState<ExtendedInvoice[]>(INITIAL_INVOICES);
  const [customers, setCustomers] = useState<Customer[]>(SEED_CUSTOMERS);
  const [financeAuditLogs, setFinanceAuditLogs] = useState<FinancialAuditLog[]>(SEED_FINANCE_AUDIT_LOGS);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [highVisibilityAlert] = useState<string | null>(null);

  const handleSaveInvoice = (savedInvoice: ExtendedInvoice, newCust?: Customer) => {
    if (newCust) setCustomers([newCust, ...customers]);

    setInvoices((prev) => {
      const idx = prev.findIndex((i) => i.id === savedInvoice.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = savedInvoice;
        return updated;
      }
      return [savedInvoice, ...prev];
    });

    const newLog: FinancialAuditLog = {
      id: `fa-${Date.now()}`,
      tenant_id: 'tenant-prod-001',
      action_type: 'modification',
      entity_name: `Invoice ${savedInvoice.invoice_number}`,
      amount: (savedInvoice.total_amount_paise || savedInvoice.total_paise || 0) / 100,
      performed_by_name: 'Alex Vance',
      reason: 'Invoice creation / modification audit log',
      created_at: new Date().toISOString(),
    };
    setFinanceAuditLogs([newLog, ...financeAuditLogs]);
  };

  const handleRecordPayment = (payment: any) => {
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id === payment.invoice_id) {
          const newPaid = inv.amount_paid_paise + payment.amount_paise;
          const totalVal = inv.total_amount_paise || inv.total_paise || 0;
          const newDue = Math.max(0, totalVal - newPaid);
          const newStatus = newDue === 0 ? 'paid' : 'partially_paid';
          return {
            ...inv,
            amount_paid_paise: newPaid,
            balance_due_paise: newDue,
            status: newStatus,
          };
        }
        return inv;
      })
    );
  };

  return (
    <div className="space-y-6">
      {/* Highest-Visibility Red Financial Alert Banner */}
      {highVisibilityAlert && (
        <div className="p-4 bg-rose-500/10 border-2 border-rose-500/50 rounded-2xl text-xs text-rose-300 flex items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
            <span className="font-bold font-mono">{highVisibilityAlert}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" leftIcon={<Flag className="w-3.5 h-3.5 text-rose-400" />}>
              Flag Deletion
            </Button>
            <Button variant="secondary" size="sm" leftIcon={<PhoneCall className="w-3.5 h-3.5 text-emerald-400" />}>
              Call Audit Lead
            </Button>
          </div>
        </div>
      )}

      {/* Top Header & Submodule Navigation Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-dark-card border border-dark-border rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-100 font-display tracking-tight">Finance & Accounts Receivable</h1>
            <Badge variant="emerald" size="sm" className="font-mono font-bold">India GST Compliant</Badge>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Invoice & AR • Path A Tally Sync • Path B Custom Templates • Expenses • AP • Statements
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Submodule View Switcher */}
          <div className="flex p-1 bg-dark-surface rounded-xl border border-dark-border overflow-x-auto text-xs font-semibold">
            {[
              { id: 'invoices', label: 'Invoices & AR', icon: FileText },
              { id: 'expenses', label: 'Expenses & ITC', icon: Receipt },
              { id: 'vendor_bills', label: 'Vendor Bills AP', icon: CreditCard },
              { id: 'tds_ledger', label: 'Form 26Q TDS', icon: Percent },
              { id: 'budgets', label: 'Budgets', icon: PieChart },
              { id: 'statements', label: 'Financial Statements', icon: BarChart3 },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as FinanceTab)}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === id
                    ? 'bg-brand-500 text-dark-bg font-bold shadow-md shadow-brand-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            leftIcon={<History className="w-3.5 h-3.5 text-violet-400" />}
            onClick={() => setIsAuditModalOpen(true)}
          >
            Audit Logs ({financeAuditLogs.length})
          </Button>
        </div>
      </div>

      {/* Main Submodule Viewport */}
      {activeTab === 'invoices' && (
        <InvoiceArManager
          invoices={invoices}
          customers={customers}
          onSaveInvoice={handleSaveInvoice}
          onRecordPayment={handleRecordPayment}
        />
      )}

      {activeTab === 'recurring' && <RecurringInvoiceManager />}
      {activeTab === 'expenses' && <ExpenseReceiptTracker />}
      {activeTab === 'vendor_bills' && <VendorBillManager />}
      {activeTab === 'tds_ledger' && <TdsLedger />}
      {activeTab === 'budgets' && <BudgetVsActualReporter />}
      {activeTab === 'statements' && <FinancialStatementExporter />}

      {/* Audit Log Modal */}
      {isAuditModalOpen && (
        <FinancialAuditLogModal
          isOpen={isAuditModalOpen}
          onClose={() => setIsAuditModalOpen(false)}
          logs={financeAuditLogs}
        />
      )}
    </div>
  );
};
