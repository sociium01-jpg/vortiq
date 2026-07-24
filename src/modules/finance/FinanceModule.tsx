// ─────────────────────────────────────────────────────────────
// Vortiq Finance Module (Zoho Books Parity 2026)
// Invoices & Billing, Recurring Subscriptions, Expense Receipt Tracker,
// Vendor Bills & Accounts Payable (AP), Department Budgets, Financial Statements P&L, & High-Visibility Audit
// ─────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { Card, Button, Badge } from '@/design-system';
import {
  FinancialAuditLog,
  FinanceTab,
  SEED_FINANCE_AUDIT_LOGS,
} from './types';
import { TdsLedger } from './TdsLedger';
import { RecurringInvoiceManager } from './RecurringInvoiceManager';
import { ExpenseReceiptTracker } from './ExpenseReceiptTracker';
import { VendorBillManager } from './VendorBillManager';
import { BudgetVsActualReporter } from './BudgetVsActualReporter';
import { FinancialStatementExporter } from './FinancialStatementExporter';
import { FinancialAuditLogModal } from './FinancialAuditLogModal';
import {
  FileText,
  Repeat,
  Receipt,
  CreditCard,
  PieChart,
  BarChart3,
  ShieldAlert,
  History,
  Trash2,
  Flag,
  PhoneCall,
} from 'lucide-react';

export const FinanceModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<FinanceTab>('invoices');
  const [financeAuditLogs, setFinanceAuditLogs] = useState<FinancialAuditLog[]>(SEED_FINANCE_AUDIT_LOGS);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [highVisibilityAlert, setHighVisibilityAlert] = useState<string | null>(null);

  // Trigger high-visibility deletion log
  const handleSimulateDeletion = (entityName: string, amount: number) => {
    const newLog: FinancialAuditLog = {
      id: `fa-${Date.now()}`,
      tenant_id: 'tenant-prod-001',
      action_type: 'deletion',
      entity_name: entityName,
      amount: amount,
      performed_by_name: 'Alex Vance',
      reason: 'Mandatory financial audit logging on deletion request',
      created_at: new Date().toISOString(),
    };

    setFinanceAuditLogs([newLog, ...financeAuditLogs]);
    setHighVisibilityAlert(`CRITICAL FINANCIAL DELETION: ${entityName} (₹${amount.toLocaleString('en-IN')}) was deleted. Audit log recorded.`);
    setTimeout(() => setHighVisibilityAlert(null), 5000);
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
            <h1 className="text-xl font-black text-slate-100 font-display tracking-tight">Finance & Accounting</h1>
            <Badge variant="violet" size="sm" className="font-mono font-bold">Zoho Books Parity</Badge>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Invoicing & AR • Subscriptions • Expenses & ITC • Vendor Bills & AP • Budgets • P&L & Balance Sheet
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Submodule View Switcher */}
          <div className="flex p-1 bg-dark-surface rounded-xl border border-dark-border overflow-x-auto text-xs font-semibold">
            {[
              { id: 'invoices', label: 'Invoices & AR', icon: FileText },
              { id: 'recurring', label: 'Subscriptions', icon: Repeat },
              { id: 'expenses', label: 'Expenses & ITC', icon: Receipt },
              { id: 'vendor_bills', label: 'Vendor Bills AP', icon: CreditCard },
              { id: 'budgets', label: 'Budgets', icon: PieChart },
              { id: 'statements', label: 'Financial Statements', icon: BarChart3 },
              { id: 'tds_ledger', label: 'Form 26Q TDS', icon: FileText },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as FinanceTab)}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all whitespace-nowrap ${
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
            Financial Audit Logs ({financeAuditLogs.length})
          </Button>
        </div>
      </div>

      {/* Main Viewport */}
      {activeTab === 'invoices' && (
        <Card className="p-5 bg-dark-card border-dark-border space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-display flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-400" />
              Invoices & Accounts Receivable (AR)
            </h3>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Trash2 className="w-3.5 h-3.5 text-rose-400" />}
              onClick={() => handleSimulateDeletion('Draft Invoice INV-2026-0099', 75000)}
            >
              Test High-Visibility Deletion Alert
            </Button>
          </div>
          <p className="text-xs text-slate-400 font-mono">
            Generated GST invoices (CGST/SGST/IGST), HSN/SAC codes, and Form 26Q TDS deductions.
          </p>
        </Card>
      )}

      {activeTab === 'recurring' && <RecurringInvoiceManager />}

      {activeTab === 'expenses' && <ExpenseReceiptTracker />}

      {activeTab === 'vendor_bills' && <VendorBillManager />}

      {activeTab === 'budgets' && <BudgetVsActualReporter />}

      {activeTab === 'statements' && <FinancialStatementExporter />}

      {activeTab === 'tds_ledger' && <TdsLedger />}

      {/* Highest-Visibility Audit Log Modal */}
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
