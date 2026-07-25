// ─────────────────────────────────────────────────────────────
// Vortiq Finance — Invoice & Accounts Receivable (AR) Workspace
// Invoice Creation (Manual, Tally Sync, Custom Template Parser) & Payment Recording
// ─────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { Card, Button, Badge, Input, Select } from '@/design-system';
import { ExtendedInvoice, Customer, formatINR } from './types';
import { InvoiceBuilder } from './InvoiceBuilder';
import { PaymentTracker } from './PaymentTracker';
import { TallySyncModal } from './TallySyncModal';
import { CustomInvoiceTemplateModal } from './CustomInvoiceTemplateModal';
import {
  FileText,
  Plus,
  Search,
  RefreshCw,
  LayoutTemplate,
} from 'lucide-react';

interface InvoiceArManagerProps {
  invoices: ExtendedInvoice[];
  customers: Customer[];
  onSaveInvoice: (inv: ExtendedInvoice, newCust?: Customer) => void;
  onRecordPayment: (payment: any) => void;
}

export const InvoiceArManager: React.FC<InvoiceArManagerProps> = ({
  invoices,
  customers,
  onSaveInvoice,
  onRecordPayment,
}) => {
  const [selectedInvoice, setSelectedInvoice] = useState<ExtendedInvoice | null>(null);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isTallySyncOpen, setIsTallySyncOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Live Metrics Calculations
  const totalInvoicedPaise = invoices.reduce((acc, i) => acc + (i.total_amount_paise || i.total_paise || 0), 0);
  const totalArBalancePaise = invoices.reduce((acc, i) => acc + (i.balance_due_paise || 0), 0);
  const totalGstCollectedPaise = invoices.reduce((acc, i) => acc + (i.total_gst_paise || (i.cgst_paise + i.sgst_paise + i.igst_paise) || 0), 0);
  const overdueCount = invoices.filter((i) => i.status === 'overdue' || (i.balance_due_paise > 0 && i.due_date && new Date(i.due_date) < new Date())).length;

  const filteredInvoices = invoices.filter((inv) => {
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    const matchesSearch =
      !searchQuery.trim() ||
      inv.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inv.customer_name && inv.customer_name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* AR Metrics Header Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        <Card className="p-4 bg-dark-card border-dark-border space-y-1">
          <span className="text-2xs text-slate-400 font-semibold uppercase tracking-wider block">Total Invoiced</span>
          <span className="text-xl font-bold font-display text-slate-100">{formatINR(totalInvoicedPaise)}</span>
          <span className="text-2xs text-slate-500 block">{invoices.length} invoices generated</span>
        </Card>

        <Card className="p-4 bg-dark-card border-dark-border space-y-1">
          <span className="text-2xs text-slate-400 font-semibold uppercase tracking-wider block">Accounts Receivable (AR)</span>
          <span className="text-xl font-bold font-display text-amber-400">{formatINR(totalArBalancePaise)}</span>
          <span className="text-2xs text-slate-500 block">Outstanding balance due</span>
        </Card>

        <Card className="p-4 bg-dark-card border-dark-border space-y-1">
          <span className="text-2xs text-slate-400 font-semibold uppercase tracking-wider block">Total GST Collected</span>
          <span className="text-xl font-bold font-display text-emerald-400">{formatINR(totalGstCollectedPaise)}</span>
          <span className="text-2xs text-slate-500 block">18% CGST/SGST/IGST</span>
        </Card>

        <Card className="p-4 bg-dark-card border-dark-border space-y-1">
          <span className="text-2xs text-slate-400 font-semibold uppercase tracking-wider block">Overdue Invoices</span>
          <span className="text-xl font-bold font-display text-rose-400">{overdueCount} Invoices</span>
          <span className="text-2xs text-slate-500 block">Requires follow-up</span>
        </Card>
      </div>

      {/* Main Workspace Card & Toolbar */}
      <Card className="p-5 bg-dark-card border-dark-border space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-display flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-400" />
              Invoices & Accounts Receivable (AR) Register ({filteredInvoices.length})
            </h3>
            <p className="text-2xs text-slate-400 font-mono mt-0.5">
              Create invoices via Manual Builder, Path A (Tally XML Sync), or Path B (Custom Template Parser)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<RefreshCw className="w-3.5 h-3.5 text-emerald-400" />}
              onClick={() => setIsTallySyncOpen(true)}
            >
              Path A: Tally Sync
            </Button>

            <Button
              variant="outline"
              size="sm"
              leftIcon={<LayoutTemplate className="w-3.5 h-3.5 text-violet-400" />}
              onClick={() => {
                setSelectedInvoice(invoices[0] || null);
                setIsTemplateModalOpen(true);
              }}
            >
              Path B: Custom Template
            </Button>

            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => {
                setSelectedInvoice(null);
                setIsBuilderOpen(true);
              }}
            >
              New Invoice
            </Button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-xs">
          <div className="w-full sm:w-64">
            <Input
              type="text"
              placeholder="Search invoice # or customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-3.5 h-3.5 text-slate-400" />}
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-2xs text-slate-400 uppercase tracking-wider">Status:</span>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Statuses' },
                { value: 'draft', label: 'Draft' },
                { value: 'sent', label: 'Sent / Issued' },
                { value: 'paid', label: 'Fully Paid' },
                { value: 'partially_paid', label: 'Partially Paid' },
                { value: 'overdue', label: 'Overdue' },
              ]}
            />
          </div>
        </div>

        {/* Invoice Data Table */}
        <div className="overflow-x-auto border border-dark-border rounded-xl">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="bg-dark-surface border-b border-dark-border text-2xs text-slate-400 uppercase tracking-wider font-semibold">
                <th className="p-3">Invoice #</th>
                <th className="p-3">Customer / Client</th>
                <th className="p-3">Issue Date</th>
                <th className="p-3">Due Date</th>
                <th className="p-3 text-right">Total Amount</th>
                <th className="p-3 text-right">Balance Due</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border/60">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 font-sans">
                    No matching invoice records found.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-dark-surface/40 transition-colors">
                    <td className="p-3 font-bold text-slate-100">{inv.invoice_number}</td>
                    <td className="p-3 text-slate-200 font-sans">{inv.customer_name}</td>
                    <td className="p-3 text-slate-400 text-2xs">{new Date(inv.invoice_date).toLocaleDateString()}</td>
                    <td className="p-3 text-slate-400 text-2xs">{inv.due_date ? new Date(inv.due_date).toLocaleDateString() : '-'}</td>
                    <td className="p-3 text-right font-bold text-slate-100">{formatINR(inv.total_amount_paise || inv.total_paise)}</td>
                    <td className="p-3 text-right font-bold text-amber-400">{formatINR(inv.balance_due_paise)}</td>
                    <td className="p-3 text-center">
                      <Badge
                        variant={
                          inv.status === 'paid'
                            ? 'emerald'
                            : inv.status === 'sent'
                            ? 'blue'
                            : inv.status === 'partially_paid'
                            ? 'amber'
                            : inv.status === 'overdue'
                            ? 'rose'
                            : 'violet'
                        }
                        size="sm"
                        className="uppercase"
                      >
                        {inv.status}
                      </Badge>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedInvoice(inv);
                            setIsPaymentOpen(true);
                          }}
                          className="text-emerald-400 hover:text-emerald-300"
                        >
                          Record Payment
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedInvoice(inv);
                            setIsBuilderOpen(true);
                          }}
                        >
                          Edit
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* MODALS */}
      {isBuilderOpen && (
        <InvoiceBuilder
          invoice={selectedInvoice}
          customers={customers}
          onSave={(inv, newCust) => {
            onSaveInvoice(inv, newCust);
            setIsBuilderOpen(false);
          }}
          onCancel={() => setIsBuilderOpen(false)}
        />
      )}

      {isPaymentOpen && selectedInvoice && (
        <PaymentTracker
          isOpen={isPaymentOpen}
          onClose={() => setIsPaymentOpen(false)}
          invoice={selectedInvoice}
          onRecordPayment={(pmt) => {
            onRecordPayment(pmt);
            setIsPaymentOpen(false);
          }}
        />
      )}

      {isTallySyncOpen && (
        <TallySyncModal
          isOpen={isTallySyncOpen}
          onClose={() => setIsTallySyncOpen(false)}
          invoices={invoices}
          onImportTallyInvoices={(newInvs) => {
            newInvs.forEach((i) => onSaveInvoice(i));
          }}
        />
      )}

      {isTemplateModalOpen && selectedInvoice && (
        <CustomInvoiceTemplateModal
          isOpen={isTemplateModalOpen}
          onClose={() => setIsTemplateModalOpen(false)}
          invoice={selectedInvoice}
          onSaveTemplateMapping={() => {
            setIsTemplateModalOpen(false);
          }}
        />
      )}
    </div>
  );
};
