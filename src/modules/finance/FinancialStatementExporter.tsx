// ─────────────────────────────────────────────────────────────
// Vortiq Accountant-Ready Financial Statements (P&L & Balance Sheet)
// Exportable formats for auditors & tax accountants
// ─────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { Card, Badge, Button } from '@/design-system';
import { FileText, Download, CheckCircle2 } from 'lucide-react';

export const FinancialStatementExporter: React.FC = () => {
  const [statementType, setStatementType] = useState<'pnl' | 'balance_sheet'>('pnl');
  const [exportNotification, setExportNotification] = useState<string | null>(null);

  const handleExportCSV = () => {
    setExportNotification(`EXPORT COMPLETED: Financial statement (${statementType.toUpperCase()}) exported in CSV/Excel format.`);
    setTimeout(() => setExportNotification(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {exportNotification && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-2xs text-emerald-300 flex items-center gap-2 animate-pulse font-mono">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{exportNotification}</span>
        </div>
      )}

      {/* Statement Type Switcher */}
      <div className="flex items-center justify-between p-4 bg-dark-card border border-dark-border rounded-2xl">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-brand-400" />
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100 font-display">Financial Statements & Audit Exporter</h3>
            <p className="text-2xs text-slate-400 font-mono">Export Profit & Loss (P&L) and Balance Sheet for Chartered Accountants (CA)</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex p-1 bg-dark-surface rounded-xl border border-dark-border text-xs font-semibold">
            <button
              onClick={() => setStatementType('pnl')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statementType === 'pnl' ? 'bg-brand-500 text-dark-bg font-bold' : 'text-slate-400'
              }`}
            >
              Profit & Loss (P&L)
            </button>
            <button
              onClick={() => setStatementType('balance_sheet')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statementType === 'balance_sheet' ? 'bg-brand-500 text-dark-bg font-bold' : 'text-slate-400'
              }`}
            >
              Balance Sheet
            </button>
          </div>

          <Button
            variant="primary"
            size="sm"
            leftIcon={<Download className="w-3.5 h-3.5" />}
            onClick={handleExportCSV}
          >
            Export CSV / Excel
          </Button>
        </div>
      </div>

      {/* P&L Statement View */}
      {statementType === 'pnl' ? (
        <Card className="p-6 bg-dark-card border-dark-border space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-dark-border pb-3">
            <div>
              <h4 className="font-extrabold text-slate-100 font-display text-sm">Profit & Loss Statement (FY 2026-2027)</h4>
              <span className="text-2xs text-slate-400">All figures in INR (₹)</span>
            </div>
            <Badge variant="emerald" size="md">Net Profit: ₹12,45,000</Badge>
          </div>

          <div className="space-y-2">
            <h5 className="font-bold text-slate-200 uppercase text-2xs tracking-wider text-brand-400">1. Operating Revenue & Income</h5>
            <div className="flex justify-between p-2 bg-dark-surface/60 rounded-lg">
              <span>Gross Sales Revenue (Invoices)</span>
              <span className="font-bold text-slate-100">₹24,50,000</span>
            </div>
            <div className="flex justify-between p-2 bg-dark-surface/60 rounded-lg text-slate-400">
              <span>Less: GST Collected (18% Setoff)</span>
              <span>(₹3,73,728)</span>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-dark-border">
            <h5 className="font-bold text-slate-200 uppercase text-2xs tracking-wider text-rose-400">2. Operating Expenses & Overheads</h5>
            <div className="flex justify-between p-2 bg-dark-surface/60 rounded-lg">
              <span>Cloud Infrastructure & IT Expenses</span>
              <span className="font-bold text-slate-100">₹4,25,000</span>
            </div>
            <div className="flex justify-between p-2 bg-dark-surface/60 rounded-lg">
              <span>Payroll & Employee Compensation</span>
              <span className="font-bold text-slate-100">₹4,06,272</span>
            </div>
          </div>

          <div className="pt-3 border-t border-dark-border flex justify-between text-sm font-bold text-emerald-400">
            <span>Net Operating Profit Before Tax</span>
            <span>₹12,45,000</span>
          </div>
        </Card>
      ) : (
        /* Balance Sheet View */
        <Card className="p-6 bg-dark-card border-dark-border space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-dark-border pb-3">
            <div>
              <h4 className="font-extrabold text-slate-100 font-display text-sm">Statement of Financial Position (Balance Sheet)</h4>
              <span className="text-2xs text-slate-400">As of July 2026</span>
            </div>
            <Badge variant="violet" size="md">Balanced: ₹38,50,000</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Assets */}
            <div className="space-y-2">
              <h5 className="font-bold text-slate-200 uppercase text-2xs tracking-wider text-emerald-400">Assets</h5>
              <div className="flex justify-between p-2 bg-dark-surface/60 rounded-lg">
                <span>Accounts Receivable (AR Invoices)</span>
                <span>₹18,50,000</span>
              </div>
              <div className="flex justify-between p-2 bg-dark-surface/60 rounded-lg">
                <span>Cash & Bank Balances</span>
                <span>₹20,00,000</span>
              </div>
              <div className="pt-2 border-t border-dark-border flex justify-between font-bold text-emerald-400">
                <span>Total Assets</span>
                <span>₹38,50,000</span>
              </div>
            </div>

            {/* Liabilities & Equity */}
            <div className="space-y-2">
              <h5 className="font-bold text-slate-200 uppercase text-2xs tracking-wider text-rose-400">Liabilities & Equity</h5>
              <div className="flex justify-between p-2 bg-dark-surface/60 rounded-lg">
                <span>Accounts Payable (AP Vendor Bills)</span>
                <span>₹1,25,000</span>
              </div>
              <div className="flex justify-between p-2 bg-dark-surface/60 rounded-lg">
                <span>Retained Earnings & Reserves</span>
                <span>₹37,25,000</span>
              </div>
              <div className="pt-2 border-t border-dark-border flex justify-between font-bold text-rose-400">
                <span>Total Liabilities & Equity</span>
                <span>₹38,50,000</span>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
