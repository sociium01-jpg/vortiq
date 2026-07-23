// ─────────────────────────────────────────────────────────────
// Vortiq Finance — Invoice Builder & Editor View
// Full India GST (CGST/SGST vs IGST), HSN/SAC, and TDS 194C/194J Support
// ─────────────────────────────────────────────────────────────

import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Select } from '@/design-system';
import {
  ExtendedInvoice,
  InvoiceLineItem,
  Customer,
  GstTreatment,
  formatINR,
} from './types';
import { Plus, Trash2, ArrowLeft, Save, FileText, Percent, ShieldCheck, Printer } from 'lucide-react';

export interface InvoiceBuilderProps {
  invoice?: ExtendedInvoice | null;
  customers: Customer[];
  onSave: (savedInvoice: ExtendedInvoice, newCustomer?: Customer) => void;
  onCancel: () => void;
}

export const InvoiceBuilder: React.FC<InvoiceBuilderProps> = ({
  invoice,
  customers,
  onSave,
  onCancel,
}) => {
  // ── Form State ─────────────────────────────────────────────────────────────
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(invoice?.customer_id || 'new');
  const [customerName, setCustomerName] = useState<string>(invoice?.customer_name || '');
  const [customerGstin, setCustomerGstin] = useState<string>(invoice?.customer_gstin || '');
  const [customerEmail, setCustomerEmail] = useState<string>(invoice?.customer_email || '');
  const [customerPhone, setCustomerPhone] = useState<string>(invoice?.customer_phone || '');

  const [invoiceNumber, setInvoiceNumber] = useState<string>(
    invoice?.invoice_number || `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
  );
  const [invoiceDate, setInvoiceDate] = useState<string>(
    invoice?.invoice_date || new Date().toISOString().split('T')[0]
  );
  const [dueDate, setDueDate] = useState<string>(() => {
    if (invoice?.due_date) return invoice.due_date;
    const d = new Date();
    d.setDate(d.getDate() + 15);
    return d.toISOString().split('T')[0];
  });

  const [placeOfSupply, setPlaceOfSupply] = useState<string>(invoice?.place_of_supply || '29 - Karnataka');
  const [gstTreatment, setGstTreatment] = useState<GstTreatment>(invoice?.gst_treatment || 'b2b');
  const [isIgst, setIsIgst] = useState<boolean>(invoice?.is_igst || false);
  const [status, setStatus] = useState<ExtendedInvoice['status']>(invoice?.status || 'draft');
  const [notes, setNotes] = useState<string>(invoice?.notes || 'Payment terms: Net 15 Days. Bank details: HDFC Bank A/c 50200012345678, IFSC HDFC0001234');

  // Line items state
  const [lineItems, setLineItems] = useState<
    {
      id: string;
      description: string;
      hsn_sac_code: string;
      quantity: number;
      unitPriceRupees: number;
      gstRatePercent: number;
    }[]
  >(() => {
    if (invoice?.line_items && invoice.line_items.length > 0) {
      return invoice.line_items.map((li) => ({
        id: li.id,
        description: li.description,
        hsn_sac_code: li.hsn_sac_code || '998313',
        quantity: li.quantity,
        unitPriceRupees: li.unit_price_paise / 100,
        gstRatePercent: li.gst_rate_percent,
      }));
    }
    return [
      {
        id: `li-${Date.now()}-1`,
        description: 'Vortiq Software License & Enterprise Integration',
        hsn_sac_code: '998313',
        quantity: 1,
        unitPriceRupees: 100000,
        gstRatePercent: 18,
      },
    ];
  });

  // TDS Deduction Section
  const [selectedTdsSection, setSelectedTdsSection] = useState<string>('NONE');

  // Sync customer selection
  useEffect(() => {
    if (selectedCustomerId !== 'new') {
      const found = customers.find((c) => c.id === selectedCustomerId);
      if (found) {
        setCustomerName(found.name);
        setCustomerGstin(found.gstin || '');
        setCustomerEmail(found.email || '');
        setCustomerPhone(found.phone || '');
        if (found.gstin) {
          setGstTreatment('b2b');
          if (!found.gstin.startsWith('29')) {
            setIsIgst(true);
          }
        }
      }
    }
  }, [selectedCustomerId, customers]);

  // Line item handlers
  const handleAddLineItem = () => {
    setLineItems((prev) => [
      ...prev,
      {
        id: `li-${Date.now()}-${prev.length + 1}`,
        description: '',
        hsn_sac_code: '998313',
        quantity: 1,
        unitPriceRupees: 0,
        gstRatePercent: 18,
      },
    ]);
  };

  const handleRemoveLineItem = (id: string) => {
    if (lineItems.length === 1) return;
    setLineItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleUpdateLineItem = (
    id: string,
    field: 'description' | 'hsn_sac_code' | 'quantity' | 'unitPriceRupees' | 'gstRatePercent',
    value: any
  ) => {
    setLineItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  // Calculations (all in Paise)
  const lineCalculations = lineItems.map((item) => {
    const qty = Math.max(0, item.quantity || 0);
    const priceRupees = Math.max(0, item.unitPriceRupees || 0);
    const subtotalPaise = Math.round(qty * priceRupees * 100);
    return {
      subtotalPaise,
      gstRatePercent: item.gstRatePercent,
    };
  });

  const subtotalPaise = lineCalculations.reduce((sum, item) => sum + item.subtotalPaise, 0);

  // Overall tax calculation
  const totalGstPaise = lineCalculations.reduce((sum, item) => {
    return sum + Math.round(item.subtotalPaise * (item.gstRatePercent / 100));
  }, 0);

  let cgstPaise = 0;
  let sgstPaise = 0;
  let igstPaise = 0;

  if (isIgst) {
    igstPaise = totalGstPaise;
  } else {
    cgstPaise = Math.round(totalGstPaise / 2);
    sgstPaise = totalGstPaise - cgstPaise;
  }

  // TDS Calculation
  let tdsRatePercent = 0;
  if (selectedTdsSection === '194J') tdsRatePercent = 10;
  else if (selectedTdsSection === '194C') tdsRatePercent = 2;
  else if (selectedTdsSection === '192') tdsRatePercent = 10;

  const tdsPaise = Math.round(subtotalPaise * (tdsRatePercent / 100));

  const totalPaise = subtotalPaise + totalGstPaise;
  const netReceivablePaise = totalPaise - tdsPaise;

  const handleSaveInvoice = (e: React.FormEvent) => {
    e.preventDefault();

    let customerId = selectedCustomerId;
    let newCustomerObj: Customer | undefined = undefined;

    if (selectedCustomerId === 'new') {
      customerId = `cust-${Date.now()}`;
      newCustomerObj = {
        id: customerId,
        tenant_id: 'org-1',
        name: customerName || 'Unnamed Customer',
        gstin: customerGstin || undefined,
        billing_address: `${placeOfSupply} Address`,
        email: customerEmail || undefined,
        phone: customerPhone || undefined,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }

    const compiledLineItems: InvoiceLineItem[] = lineItems.map((li) => {
      const sub = Math.round((li.quantity || 1) * (li.unitPriceRupees || 0) * 100);
      return {
        id: li.id,
        invoice_id: invoice?.id || `inv-${Date.now()}`,
        tenant_id: 'org-1',
        description: li.description || 'Line Item',
        hsn_sac_code: li.hsn_sac_code || '998313',
        quantity: li.quantity || 1,
        unit_price_paise: Math.round((li.unitPriceRupees || 0) * 100),
        gst_rate_percent: li.gstRatePercent,
        amount_paise: sub,
        created_at: new Date().toISOString(),
      };
    });

    const savedInvoice: ExtendedInvoice = {
      id: invoice?.id || `inv-${Date.now()}`,
      tenant_id: 'org-1',
      customer_id: customerId,
      customer_name: customerName || 'Customer',
      customer_gstin: customerGstin || undefined,
      customer_email: customerEmail || undefined,
      customer_phone: customerPhone || undefined,
      lead_id: invoice?.lead_id,
      invoice_number: invoiceNumber,
      invoice_date: invoiceDate,
      due_date: dueDate,
      status: status,
      place_of_supply: placeOfSupply,
      gst_treatment: gstTreatment,
      is_igst: isIgst,
      subtotal_paise: subtotalPaise,
      cgst_paise: cgstPaise,
      sgst_paise: sgstPaise,
      igst_paise: igstPaise,
      tds_paise: tdsPaise,
      total_paise: totalPaise,
      amount_paid_paise: invoice?.amount_paid_paise || 0,
      balance_due_paise: invoice ? invoice.balance_due_paise : totalPaise,
      notes: notes,
      line_items: compiledLineItems,
      created_by: invoice?.created_by || 'Alex Vance',
      created_at: invoice?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    onSave(savedInvoice, newCustomerObj);
  };

  return (
    <form onSubmit={handleSaveInvoice} className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-dark-border pb-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Back
          </Button>
          <div>
            <h2 className="text-xl font-bold text-slate-100 font-display flex items-center gap-2">
              {invoice ? `Edit Invoice ${invoice.invoice_number}` : 'Create New GST Invoice'}
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              India GST Ready (Intra 9%+9% / Inter 18% IGST) • Form 26Q TDS Calculation
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={() => window.print()}
            leftIcon={<Printer className="w-4 h-4" />}
          >
            Print / PDF
          </Button>
          <Button
            variant="primary"
            size="sm"
            type="submit"
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save Invoice
          </Button>
        </div>
      </div>

      {/* Customer & Invoice Meta Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Info Card */}
        <Card className="p-4 space-y-3 bg-dark-surface/60 border-dark-border lg:col-span-2">
          <h3 className="text-sm font-semibold text-slate-200 border-b border-dark-border pb-2 flex items-center gap-2">
            <FileText className="w-4 h-4 text-brand-400" /> Customer & Billing Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Select Existing Customer"
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              options={[
                { value: 'new', label: '+ Create New Customer' },
                ...customers.map((c) => ({ value: c.id, label: `${c.name} (${c.gstin || 'B2C'})` })),
              ]}
            />

            <Input
              label="Customer Name *"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. SunTech Manufacturing Pvt Ltd"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="GSTIN (15-digit)"
              value={customerGstin}
              onChange={(e) => setCustomerGstin(e.target.value.toUpperCase())}
              placeholder="29AAACS1234F1Z5"
              className="font-mono uppercase"
            />

            <Input
              label="Email Address"
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder="finance@customer.com"
            />

            <Input
              label="Phone Number"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="+91 98000 11223"
            />
          </div>
        </Card>

        {/* Invoice Meta & Status */}
        <Card className="p-4 space-y-3 bg-dark-surface/60 border-dark-border">
          <h3 className="text-sm font-semibold text-slate-200 border-b border-dark-border pb-2">
            Invoice Properties
          </h3>

          <Input
            label="Invoice Number"
            value={invoiceNumber}
            onChange={(e) => setInvoiceNumber(e.target.value)}
            className="font-mono font-bold text-brand-400"
            required
          />

          <div className="grid grid-cols-2 gap-2">
            <Input
              label="Invoice Date"
              type="date"
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
            />
            <Input
              label="Due Date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <Select
            label="Invoice Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            options={[
              { value: 'draft', label: 'Draft' },
              { value: 'sent', label: 'Sent / Open' },
              { value: 'paid', label: 'Paid' },
              { value: 'overdue', label: 'Overdue' },
              { value: 'cancelled', label: 'Cancelled' },
            ]}
          />
        </Card>
      </div>

      {/* Tax Configuration & Place of Supply */}
      <Card className="p-4 bg-dark-surface/60 border-dark-border space-y-3">
        <h3 className="text-sm font-semibold text-slate-200 border-b border-dark-border pb-2 flex items-center gap-2">
          <Percent className="w-4 h-4 text-emerald-400" /> GST Tax Configuration
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
          <Select
            label="Place of Supply (State)"
            value={placeOfSupply}
            onChange={(e) => setPlaceOfSupply(e.target.value)}
            options={[
              { value: '29 - Karnataka', label: '29 - Karnataka (Home State)' },
              { value: '27 - Maharashtra', label: '27 - Maharashtra' },
              { value: '24 - Gujarat', label: '24 - Gujarat' },
              { value: '07 - Delhi', label: '07 - Delhi' },
              { value: '33 - Tamil Nadu', label: '33 - Tamil Nadu' },
            ]}
          />

          <Select
            label="GST Treatment"
            value={gstTreatment}
            onChange={(e) => setGstTreatment(e.target.value as GstTreatment)}
            options={[
              { value: 'b2b', label: 'B2B Registered Business' },
              { value: 'b2c', label: 'B2C Retail Customer' },
              { value: 'sez', label: 'SEZ Unit (Zero Rated)' },
              { value: 'export', label: 'Export Outside India' },
              { value: 'exempt', label: 'Exempt / Nil Rated' },
            ]}
          />

          <div className="flex items-center gap-3 pt-4">
            <input
              type="checkbox"
              id="is_igst"
              checked={isIgst}
              onChange={(e) => setIsIgst(e.target.checked)}
              className="w-4 h-4 rounded border-dark-border bg-dark-bg text-brand-500 focus:ring-brand-500"
            />
            <label htmlFor="is_igst" className="text-xs text-slate-200 font-medium">
              Inter-State Supply (Apply 18% IGST instead of CGST + SGST 9%+9%)
            </label>
          </div>
        </div>
      </Card>

      {/* Line Items Table */}
      <Card className="p-4 space-y-4 bg-dark-surface/60 border-dark-border">
        <div className="flex items-center justify-between border-b border-dark-border pb-2">
          <h3 className="text-sm font-semibold text-slate-200">Invoice Line Items</h3>
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={handleAddLineItem}
            leftIcon={<Plus className="w-3.5 h-3.5 text-brand-400" />}
          >
            Add Line Item
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-dark-border text-slate-400 uppercase tracking-wider font-mono text-2xs">
                <th className="py-2 px-2">#</th>
                <th className="py-2 px-2 min-w-[220px]">Item / Description</th>
                <th className="py-2 px-2 w-[110px]">HSN / SAC</th>
                <th className="py-2 px-2 w-[80px]">Qty</th>
                <th className="py-2 px-2 w-[130px] text-right">Unit Price (₹)</th>
                <th className="py-2 px-2 w-[100px]">GST %</th>
                <th className="py-2 px-2 w-[140px] text-right">Amount (₹)</th>
                <th className="py-2 px-2 w-[50px]"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border/60">
              {lineItems.map((item, index) => {
                const sub = Math.round((item.quantity || 0) * (item.unitPriceRupees || 0) * 100);
                return (
                  <tr key={item.id} className="hover:bg-dark-bg/40">
                    <td className="py-2 px-2 text-slate-500 font-mono">{index + 1}</td>
                    <td className="py-2 px-2">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => handleUpdateLineItem(item.id, 'description', e.target.value)}
                        placeholder="Description of goods or service"
                        className="w-full bg-dark-bg border border-dark-border rounded px-2 py-1 text-slate-100 text-xs focus:ring-1 focus:ring-brand-500"
                        required
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="text"
                        value={item.hsn_sac_code}
                        onChange={(e) => handleUpdateLineItem(item.id, 'hsn_sac_code', e.target.value)}
                        placeholder="998313"
                        className="w-full bg-dark-bg border border-dark-border rounded px-2 py-1 text-slate-100 font-mono text-xs text-center"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleUpdateLineItem(item.id, 'quantity', parseFloat(e.target.value))}
                        className="w-full bg-dark-bg border border-dark-border rounded px-2 py-1 text-slate-100 font-mono text-xs text-center"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.unitPriceRupees}
                        onChange={(e) => handleUpdateLineItem(item.id, 'unitPriceRupees', parseFloat(e.target.value))}
                        className="w-full bg-dark-bg border border-dark-border rounded px-2 py-1 text-slate-100 font-mono text-xs text-right"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <select
                        value={item.gstRatePercent}
                        onChange={(e) => handleUpdateLineItem(item.id, 'gstRatePercent', parseInt(e.target.value))}
                        className="w-full bg-dark-bg border border-dark-border rounded px-1 py-1 text-slate-100 text-xs font-mono"
                      >
                        <option value={0}>0%</option>
                        <option value={5}>5%</option>
                        <option value={12}>12%</option>
                        <option value={18}>18%</option>
                        <option value={28}>28%</option>
                      </select>
                    </td>
                    <td className="py-2 px-2 font-mono text-right text-slate-100 font-medium">
                      {formatINR(sub)}
                    </td>
                    <td className="py-2 px-2 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveLineItem(item.id)}
                        disabled={lineItems.length === 1}
                        className="text-slate-500 hover:text-rose-400 disabled:opacity-30 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Tax & TDS Summary Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Notes & Terms */}
        <Card className="p-4 bg-dark-surface/60 border-dark-border space-y-3">
          <h3 className="text-sm font-semibold text-slate-200">Notes & Terms of Service</h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className="w-full bg-dark-bg border border-dark-border rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
            placeholder="Payment instructions, bank account details..."
          />
        </Card>

        {/* Calculated Financial Summary Box */}
        <Card className="p-4 bg-dark-surface/80 border-dark-border space-y-3 font-mono text-xs">
          <h3 className="text-sm font-semibold text-slate-200 font-sans border-b border-dark-border pb-2 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-brand-400" /> GST Tax & TDS Breakdown
          </h3>

          <div className="flex justify-between py-1 border-b border-dark-border/40">
            <span className="text-slate-400">Subtotal (Taxable Value):</span>
            <span className="text-slate-100 text-right">{formatINR(subtotalPaise)}</span>
          </div>

          {!isIgst ? (
            <>
              <div className="flex justify-between py-1 border-b border-dark-border/40">
                <span className="text-slate-400">CGST (9%):</span>
                <span className="text-emerald-400 text-right">{formatINR(cgstPaise)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-dark-border/40">
                <span className="text-slate-400">SGST (9%):</span>
                <span className="text-emerald-400 text-right">{formatINR(sgstPaise)}</span>
              </div>
            </>
          ) : (
            <div className="flex justify-between py-1 border-b border-dark-border/40">
              <span className="text-slate-400">IGST (18% Inter-State):</span>
              <span className="text-emerald-400 text-right">{formatINR(igstPaise)}</span>
            </div>
          )}

          <div className="flex justify-between py-1 border-b border-dark-border/40 font-bold">
            <span className="text-slate-200">Gross Invoice Total (with GST):</span>
            <span className="text-slate-100 text-right">{formatINR(totalPaise)}</span>
          </div>

          {/* TDS Section Dropdown */}
          <div className="pt-2 border-t border-dark-border/60">
            <div className="flex items-center justify-between mb-1.5 font-sans">
              <label className="text-xs text-slate-300 font-medium">TDS Deduction Section (Form 26Q)</label>
            </div>
            <select
              value={selectedTdsSection}
              onChange={(e) => setSelectedTdsSection(e.target.value)}
              className="w-full bg-dark-bg border border-dark-border text-xs rounded-md p-1.5 text-slate-200 font-mono mb-2"
            >
              <option value="NONE">No TDS Deduction (0%)</option>
              <option value="194J">Sec 194J - Tech / Professional Services (10%)</option>
              <option value="194C">Sec 194C - Contractors / Sub-contractors (2%)</option>
              <option value="192">Sec 192 - Salaries / Compensation (10%)</option>
            </select>

            {tdsPaise > 0 && (
              <div className="flex justify-between py-1 text-rose-400 font-bold">
                <span>(-) Less TDS Deducted ({tdsRatePercent}%):</span>
                <span className="text-right">-{formatINR(tdsPaise)}</span>
              </div>
            )}
          </div>

          <div className="flex justify-between py-2 border-t-2 border-dark-border font-bold text-sm bg-dark-bg/60 p-2.5 rounded-lg">
            <span className="text-brand-400 font-sans">Net Amount Receivable:</span>
            <span className="text-emerald-400 font-mono text-right">{formatINR(netReceivablePaise)}</span>
          </div>
        </Card>
      </div>
    </form>
  );
};
