// ─────────────────────────────────────────────────────────────
// Vortiq Stage 1b Module F: Finance (India-ready)
// Central Finance Workspace View with 4 Core Operational Tabs
// ─────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { Card, Button, Badge, DataTable, Column } from '@/design-system';
import {
  ExtendedInvoice,
  Customer,
  PaymentRecord,
  TdsRecord,
  SEED_INVOICES,
  SEED_CUSTOMERS,
  SEED_PAYMENTS,
  SEED_TDS_RECORDS,
  formatINR,
  InvoiceStatus,
} from './types';
import { InvoiceBuilder } from './InvoiceBuilder';
import { PaymentTracker } from './PaymentTracker';
import { TdsLedger } from './TdsLedger';
import { WonLeadConverter } from './WonLeadConverter';
import {
  FileText,
  CreditCard,
  ShieldCheck,
  BarChart3,
  Plus,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Edit2,
} from 'lucide-react';

export type FinanceTab = 'invoices' | 'payments' | 'tds' | 'gst_summary';

export const FinanceModule: React.FC = () => {
  // ── Central Finance State ──────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<FinanceTab>('invoices');
  const [invoices, setInvoices] = useState<ExtendedInvoice[]>(SEED_INVOICES);
  const [customers, setCustomers] = useState<Customer[]>(SEED_CUSTOMERS);
  const [payments, setPayments] = useState<PaymentRecord[]>(SEED_PAYMENTS);
  const [tdsRecords, setTdsRecords] = useState<TdsRecord[]>(SEED_TDS_RECORDS);

  // View state for Invoice Editor & Won Lead Converter Modal
  const [isBuildingInvoice, setIsBuildingInvoice] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<ExtendedInvoice | null>(null);
  const [isWonLeadModalOpen, setIsWonLeadModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleSaveInvoice = (savedInvoice: ExtendedInvoice, newCustomer?: Customer) => {
    if (newCustomer) {
      setCustomers((prev) => [newCustomer, ...prev]);
    }

    setInvoices((prev) => {
      const idx = prev.findIndex((i) => i.id === savedInvoice.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = savedInvoice;
        return copy;
      }
      return [savedInvoice, ...prev];
    });

    setIsBuildingInvoice(false);
    setEditingInvoice(null);
  };

  const handleInvoiceCreatedFromWonLead = (draftInvoice: ExtendedInvoice, customer: Customer) => {
    setCustomers((prev) => {
      if (prev.some((c) => c.id === customer.id)) return prev;
      return [customer, ...prev];
    });

    setInvoices((prev) => [draftInvoice, ...prev]);
    setEditingInvoice(draftInvoice);
    setIsBuildingInvoice(true);
  };

  const handleRecordPayment = (payment: PaymentRecord, updatedInvoice: ExtendedInvoice) => {
    setPayments((prev) => [payment, ...prev]);
    setInvoices((prev) => prev.map((i) => (i.id === updatedInvoice.id ? updatedInvoice : i)));
  };

  const handleUpdateTdsRecord = (updatedRecord: TdsRecord) => {
    setTdsRecords((prev) => prev.map((r) => (r.id === updatedRecord.id ? updatedRecord : r)));
  };

  // ── Metrics & Calculations ─────────────────────────────────────────────────
  const totalBilledPaise = invoices.reduce((sum, i) => sum + i.total_paise, 0);
  const totalCollectedPaise = invoices.reduce((sum, i) => sum + i.amount_paid_paise, 0);
  const totalOutstandingPaise = invoices.reduce((sum, i) => sum + i.balance_due_paise, 0);
  const overdueInvoices = invoices.filter((i) => i.status === 'overdue');
  const totalOverduePaise = overdueInvoices.reduce((sum, i) => sum + i.balance_due_paise, 0);

  // Filter invoices for list view
  const filteredInvoices = invoices.filter((inv) => {
    if (statusFilter === 'ALL') return true;
    return inv.status === statusFilter;
  });

  // Invoice Table Columns
  const invoiceColumns: Column<ExtendedInvoice>[] = [
    {
      key: 'invoice_number',
      header: 'Invoice #',
      sortable: true,
      render: (inv) => (
        <div>
          <span className="font-mono font-bold text-brand-400">{inv.invoice_number}</span>
          <div className="text-2xs text-slate-400 font-mono">Date: {inv.invoice_date}</div>
        </div>
      ),
    },
    {
      key: 'customer_name',
      header: 'Customer',
      sortable: true,
      render: (inv) => (
        <div>
          <div className="font-medium text-slate-100">{inv.customer_name || 'Customer'}</div>
          <div className="text-2xs text-slate-400 font-mono">{inv.customer_gstin || 'B2C'}</div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (inv) => {
        const variants: Record<InvoiceStatus, 'emerald' | 'blue' | 'rose' | 'amber' | 'slate' | 'violet'> = {
          paid: 'emerald',
          sent: 'blue',
          overdue: 'rose',
          draft: 'amber',
          cancelled: 'slate',
          credit_note: 'violet',
        };
        return (
          <Badge variant={variants[inv.status]} size="sm" dot={inv.status === 'paid'}>
            {inv.status.toUpperCase()}
          </Badge>
        );
      },
    },
    {
      key: 'total_paise',
      header: 'Gross Total (₹)',
      sortable: true,
      render: (inv) => (
        <span className="font-mono text-slate-100 font-bold text-right block">
          {formatINR(inv.total_paise)}
        </span>
      ),
    },
    {
      key: 'amount_paid_paise',
      header: 'Paid (₹)',
      sortable: true,
      render: (inv) => (
        <span className="font-mono text-emerald-400 text-right block font-medium">
          {formatINR(inv.amount_paid_paise)}
        </span>
      ),
    },
    {
      key: 'balance_due_paise',
      header: 'Balance Due (₹)',
      sortable: true,
      render: (inv) => (
        <span className={`font-mono text-right block font-bold ${inv.balance_due_paise > 0 ? 'text-amber-400' : 'text-slate-500'}`}>
          {formatINR(inv.balance_due_paise)}
        </span>
      ),
    },
    {
      key: 'id',
      header: 'Action',
      render: (inv) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setEditingInvoice(inv);
            setIsBuildingInvoice(true);
          }}
          leftIcon={<Edit2 className="w-3.5 h-3.5" />}
          className="text-2xs py-1"
        >
          Edit / View
        </Button>
      ),
    },
  ];

  // GST Summary Calculations
  const totalCgstPaise = invoices.reduce((sum, i) => sum + i.cgst_paise, 0);
  const totalSgstPaise = invoices.reduce((sum, i) => sum + i.sgst_paise, 0);
  const totalIgstPaise = invoices.reduce((sum, i) => sum + i.igst_paise, 0);
  const totalGstLiabilityPaise = totalCgstPaise + totalSgstPaise + totalIgstPaise;

  const intraStateInvoices = invoices.filter((i) => !i.is_igst);
  const interStateInvoices = invoices.filter((i) => i.is_igst);

  if (isBuildingInvoice) {
    return (
      <InvoiceBuilder
        invoice={editingInvoice}
        customers={customers}
        onSave={handleSaveInvoice}
        onCancel={() => {
          setIsBuildingInvoice(false);
          setEditingInvoice(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner & Module Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-dark-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-100 font-display tracking-tight">
              Finance & Tax Operations
            </h1>
            <span className="text-2xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono font-semibold">
              India GST & TDS Ready
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Automated Invoicing, Payment Collections, Form 26Q TDS Ledger, and GST Output Summary.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsWonLeadModalOpen(true)}
            leftIcon={<UserCheck className="w-4 h-4 text-brand-400" />}
          >
            Convert Won Lead
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setEditingInvoice(null);
              setIsBuildingInvoice(true);
            }}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Create Invoice
          </Button>
        </div>
      </div>

      {/* Tab Selector Pills */}
      <div className="flex items-center gap-2 bg-dark-surface/60 p-1.5 rounded-xl border border-dark-border overflow-x-auto">
        <button
          onClick={() => setActiveTab('invoices')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'invoices'
              ? 'bg-brand-500 text-dark-bg font-bold shadow-md shadow-brand-500/20'
              : 'text-slate-300 hover:text-white hover:bg-dark-border/50'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Invoices & Billing</span>
          <span className="ml-1 text-2xs px-1.5 py-0.2 rounded-full bg-dark-bg/40 font-mono">
            {invoices.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'payments'
              ? 'bg-brand-500 text-dark-bg font-bold shadow-md shadow-brand-500/20'
              : 'text-slate-300 hover:text-white hover:bg-dark-border/50'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Payments Received</span>
          <span className="ml-1 text-2xs px-1.5 py-0.2 rounded-full bg-dark-bg/40 font-mono">
            {payments.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('tds')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'tds'
              ? 'bg-brand-500 text-dark-bg font-bold shadow-md shadow-brand-500/20'
              : 'text-slate-300 hover:text-white hover:bg-dark-border/50'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>TDS Ledger (Form 26Q)</span>
        </button>

        <button
          onClick={() => setActiveTab('gst_summary')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'gst_summary'
              ? 'bg-brand-500 text-dark-bg font-bold shadow-md shadow-brand-500/20'
              : 'text-slate-300 hover:text-white hover:bg-dark-border/50'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>GST Summary Report</span>
        </button>
      </div>

      {/* ── TAB 1: INVOICES & BILLING ────────────────────────────────────────── */}
      {activeTab === 'invoices' && (
        <div className="space-y-6">
          {/* Summary KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4 space-y-1">
              <div className="text-2xs font-medium text-slate-400 uppercase tracking-wider">Total Revenue Billed</div>
              <div className="text-2xl font-bold font-mono text-slate-100">{formatINR(totalBilledPaise)}</div>
              <div className="text-2xs text-slate-400">{invoices.length} total invoices</div>
            </Card>

            <Card className="p-4 space-y-1">
              <div className="text-2xs font-medium text-slate-400 uppercase tracking-wider">Total Collected</div>
              <div className="text-2xl font-bold font-mono text-emerald-400">{formatINR(totalCollectedPaise)}</div>
              <div className="text-2xs text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Bank collections settled
              </div>
            </Card>

            <Card className="p-4 space-y-1">
              <div className="text-2xs font-medium text-slate-400 uppercase tracking-wider">Outstanding Receivables</div>
              <div className="text-2xl font-bold font-mono text-amber-400">{formatINR(totalOutstandingPaise)}</div>
              <div className="text-2xs text-amber-400 font-medium flex items-center gap-1">
                <Clock className="w-3 h-3" /> Pending settlement
              </div>
            </Card>

            <Card className="p-4 space-y-1">
              <div className="text-2xs font-medium text-slate-400 uppercase tracking-wider">Overdue Invoices</div>
              <div className="text-2xl font-bold font-mono text-rose-400">{formatINR(totalOverduePaise)}</div>
              <div className="text-2xs text-rose-400 font-medium flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {overdueInvoices.length} invoices overdue
              </div>
            </Card>
          </div>

          {/* Filter Pills Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-mono">Filter Status:</span>
              {['ALL', 'draft', 'sent', 'paid', 'overdue'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-md text-xs font-mono uppercase font-semibold transition-all ${
                    statusFilter === st
                      ? 'bg-brand-500 text-dark-bg'
                      : 'bg-dark-surface text-slate-400 hover:text-slate-200 border border-dark-border'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Invoices Table */}
          <DataTable
            columns={invoiceColumns}
            data={filteredInvoices}
            keyExtractor={(i) => i.id}
            searchPlaceholder="Search by invoice #, customer name, GSTIN..."
            emptyTitle="No Invoices Found"
            emptyDescription="Create your first invoice or convert a won sales lead from CRM."
          />
        </div>
      )}

      {/* ── TAB 2: PAYMENTS RECEIVED ────────────────────────────────────────── */}
      {activeTab === 'payments' && (
        <PaymentTracker
          invoices={invoices}
          payments={payments}
          onRecordPayment={handleRecordPayment}
        />
      )}

      {/* ── TAB 3: TDS LEDGER ────────────────────────────────────────────────── */}
      {activeTab === 'tds' && (
        <TdsLedger
          tdsRecords={tdsRecords}
          onUpdateTdsRecord={handleUpdateTdsRecord}
        />
      )}

      {/* ── TAB 4: GST SUMMARY REPORT ────────────────────────────────────────── */}
      {activeTab === 'gst_summary' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-100 font-display flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-brand-400" />
                GST Output Tax Summary Report (GSTR-1 & GSTR-3B Format)
              </h2>
              <p className="text-xs text-slate-400">
                Breakdown of intra-state (CGST 9% + SGST 9%) vs inter-state (IGST 18%) tax liabilities.
              </p>
            </div>
          </div>

          {/* Tax Liability Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4 space-y-1">
              <div className="text-2xs font-medium text-slate-400 uppercase tracking-wider">CGST Collected (9%)</div>
              <div className="text-xl font-bold font-mono text-emerald-400">{formatINR(totalCgstPaise)}</div>
              <div className="text-2xs text-slate-400 font-mono">Intra-State Central Tax</div>
            </Card>

            <Card className="p-4 space-y-1">
              <div className="text-2xs font-medium text-slate-400 uppercase tracking-wider">SGST Collected (9%)</div>
              <div className="text-xl font-bold font-mono text-emerald-400">{formatINR(totalSgstPaise)}</div>
              <div className="text-2xs text-slate-400 font-mono">Intra-State State Tax</div>
            </Card>

            <Card className="p-4 space-y-1">
              <div className="text-2xs font-medium text-slate-400 uppercase tracking-wider">IGST Collected (18%)</div>
              <div className="text-xl font-bold font-mono text-blue-400">{formatINR(totalIgstPaise)}</div>
              <div className="text-2xs text-slate-400 font-mono">Inter-State Integrated Tax</div>
            </Card>

            <Card className="p-4 space-y-1 bg-brand-500/10 border-brand-500/30">
              <div className="text-2xs font-medium text-brand-400 uppercase tracking-wider">Total Output GST Liability</div>
              <div className="text-xl font-bold font-mono text-brand-300">{formatINR(totalGstLiabilityPaise)}</div>
              <div className="text-2xs text-brand-400 font-mono">Net GSTR-3B Tax Liability</div>
            </Card>
          </div>

          {/* Detailed Tax Breakdown Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Intra-State Breakdown */}
            <Card className="p-4 space-y-3 bg-dark-surface/60 border-dark-border">
              <div className="flex items-center justify-between border-b border-dark-border pb-2">
                <h3 className="text-sm font-semibold text-slate-200">Intra-State Supplies (CGST + SGST)</h3>
                <Badge variant="emerald" size="sm">{intraStateInvoices.length} Invoices</Badge>
              </div>

              <div className="space-y-2 text-xs font-mono">
                {intraStateInvoices.map((inv) => (
                  <div key={inv.id} className="p-2 bg-dark-bg/60 rounded border border-dark-border/60 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-200">{inv.invoice_number} • {inv.customer_name}</div>
                      <div className="text-2xs text-slate-400">Place of Supply: {inv.place_of_supply}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-emerald-400 font-bold">
                        CGST: {formatINR(inv.cgst_paise)} + SGST: {formatINR(inv.sgst_paise)}
                      </div>
                      <div className="text-2xs text-slate-400">Taxable: {formatINR(inv.subtotal_paise)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Inter-State Breakdown */}
            <Card className="p-4 space-y-3 bg-dark-surface/60 border-dark-border">
              <div className="flex items-center justify-between border-b border-dark-border pb-2">
                <h3 className="text-sm font-semibold text-slate-200">Inter-State Supplies (IGST 18%)</h3>
                <Badge variant="blue" size="sm">{interStateInvoices.length} Invoices</Badge>
              </div>

              <div className="space-y-2 text-xs font-mono">
                {interStateInvoices.map((inv) => (
                  <div key={inv.id} className="p-2 bg-dark-bg/60 rounded border border-dark-border/60 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-200">{inv.invoice_number} • {inv.customer_name}</div>
                      <div className="text-2xs text-slate-400">Place of Supply: {inv.place_of_supply}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-blue-400 font-bold">IGST: {formatINR(inv.igst_paise)}</div>
                      <div className="text-2xs text-slate-400">Taxable: {formatINR(inv.subtotal_paise)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Won Lead Converter Modal */}
      <WonLeadConverter
        isOpen={isWonLeadModalOpen}
        onClose={() => setIsWonLeadModalOpen(false)}
        existingInvoices={invoices}
        onInvoiceCreated={handleInvoiceCreatedFromWonLead}
      />
    </div>
  );
};
