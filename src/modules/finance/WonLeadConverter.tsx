// ─────────────────────────────────────────────────────────────
// Vortiq Finance — Won Lead Converter Modal
// Reads crm_leads (Single source of truth) and converts to Draft Invoice
// ─────────────────────────────────────────────────────────────

import React, { useState, useEffect } from 'react';
import { Modal, Button, Card, Badge, DataTable, Column } from '@/design-system';
import { ExtendedInvoice, Customer, formatINR } from './types';
import { CrmLead, SEED_LEADS } from '@/modules/crm/types';
import { ArrowRight, UserCheck, Sparkles, Building, Phone, Mail } from 'lucide-react';

export interface WonLeadConverterProps {
  isOpen: boolean;
  onClose: () => void;
  existingInvoices: ExtendedInvoice[];
  onInvoiceCreated: (newInvoice: ExtendedInvoice, customer: Customer) => void;
}

export const WonLeadConverter: React.FC<WonLeadConverterProps> = ({
  isOpen,
  onClose,
  existingInvoices,
  onInvoiceCreated,
}) => {
  const [wonLeads, setWonLeads] = useState<CrmLead[]>([]);
  const [selectedLead, setSelectedLead] = useState<CrmLead | null>(null);
  const [placeOfSupply, setPlaceOfSupply] = useState<string>('29 - Karnataka');
  const [isIgst, setIsIgst] = useState<boolean>(false);
  const [gstinInput, setGstinInput] = useState<string>('');
  const [panInput, setPanInput] = useState<string>('');

  // Read crm_leads from localStorage single source of truth, fallback to SEED_LEADS
  useEffect(() => {
    let leads: CrmLead[] = [];
    try {
      const stored = localStorage.getItem('crm_leads');
      if (stored) {
        leads = JSON.parse(stored);
      }
    } catch {
      // Fallback
    }

    if (!leads || leads.length === 0) {
      leads = SEED_LEADS;
    }

    // Filter only WON leads
    const won = leads.filter((l) => l.stage_id === 'won');
    setWonLeads(won);

    if (won.length > 0 && !selectedLead) {
      setSelectedLead(won[0]);
    }
  }, [isOpen]);

  const handleSelectLead = (lead: CrmLead) => {
    setSelectedLead(lead);
    // Preset mock GSTIN & PAN if available
    if (lead.company_name?.includes('SunTech')) {
      setGstinInput('29AAACS1234F1Z5');
      setPanInput('AAACS1234F');
    } else {
      setGstinInput('');
      setPanInput('');
    }
  };

  const handleConvert = () => {
    if (!selectedLead) return;

    const customerName = selectedLead.company_name || selectedLead.name || selectedLead.contact_person || 'New Customer';
    const estimatedRupees = selectedLead.estimated_value || 50000;
    const subtotalPaise = Math.round(estimatedRupees * 100);

    const gstRate = 18;
    const gstPaise = Math.round(subtotalPaise * (gstRate / 100));

    let cgstPaise = 0;
    let sgstPaise = 0;
    let igstPaise = 0;

    if (isIgst) {
      igstPaise = gstPaise;
    } else {
      cgstPaise = Math.round(gstPaise / 2);
      sgstPaise = gstPaise - cgstPaise;
    }

    const totalPaise = subtotalPaise + gstPaise;

    const customerId = `cust-lead-${selectedLead.id}`;
    const newCustomer: Customer = {
      id: customerId,
      tenant_id: selectedLead.organization_id || 'org-1',
      lead_id: selectedLead.id,
      name: customerName,
      gstin: gstinInput || undefined,
      pan: panInput || undefined,
      billing_address: `${selectedLead.title} Billing Office`,
      email: selectedLead.email,
      phone: selectedLead.phone,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const invoiceId = `inv-${Date.now()}`;
    const invNumber = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const todayStr = new Date().toISOString().split('T')[0];
    const dueDateObj = new Date();
    dueDateObj.setDate(dueDateObj.getDate() + 15);
    const dueDateStr = dueDateObj.toISOString().split('T')[0];

    const draftInvoice: ExtendedInvoice = {
      id: invoiceId,
      tenant_id: selectedLead.organization_id || 'org-1',
      customer_id: customerId,
      customer_name: customerName,
      customer_gstin: gstinInput || undefined,
      customer_email: selectedLead.email,
      customer_phone: selectedLead.phone,
      lead_id: selectedLead.id,
      invoice_number: invNumber,
      invoice_date: todayStr,
      due_date: dueDateStr,
      status: 'draft',
      place_of_supply: placeOfSupply,
      gst_treatment: gstinInput ? 'b2b' : 'b2c',
      is_igst: isIgst,
      subtotal_paise: subtotalPaise,
      cgst_paise: cgstPaise,
      sgst_paise: sgstPaise,
      igst_paise: igstPaise,
      tds_paise: 0,
      total_paise: totalPaise,
      amount_paid_paise: 0,
      balance_due_paise: totalPaise,
      notes: `Converted seamlessly from Won Lead #${selectedLead.id}: ${selectedLead.title}`,
      created_by: 'Finance Manager',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      line_items: [
        {
          id: `li-${Date.now()}-1`,
          invoice_id: invoiceId,
          tenant_id: selectedLead.organization_id || 'org-1',
          description: selectedLead.title || 'Professional Services / Product Delivery',
          hsn_sac_code: '998313',
          quantity: 1,
          unit_price_paise: subtotalPaise,
          gst_rate_percent: gstRate,
          amount_paise: subtotalPaise,
          created_at: new Date().toISOString(),
        },
      ],
    };

    onInvoiceCreated(draftInvoice, newCustomer);
    onClose();
  };

  const columns: Column<CrmLead>[] = [
    {
      key: 'title',
      header: 'Lead Name & Company',
      render: (lead) => (
        <div>
          <div className="font-medium text-slate-100">{lead.company_name || lead.title}</div>
          <div className="text-2xs text-slate-400">{lead.contact_person} • {lead.email || 'No email'}</div>
        </div>
      ),
    },
    {
      key: 'estimated_value',
      header: 'Deal Value',
      render: (lead) => (
        <span className="font-mono text-emerald-400 font-semibold text-right block">
          {formatINR(lead.estimated_value * 100)}
        </span>
      ),
    },
    {
      key: 'id',
      header: 'Invoice Status',
      render: (lead) => {
        const hasInvoice = existingInvoices.some((inv) => inv.lead_id === lead.id);
        return hasInvoice ? (
          <Badge variant="emerald" size="sm" dot>Invoiced</Badge>
        ) : (
          <Badge variant="amber" size="sm">Ready to Convert</Badge>
        );
      },
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Convert Won Sales Lead to Invoice"
      maxWidth="xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="text-2xs text-slate-400">
            Source: <span className="font-mono text-brand-400">crm_leads</span> (Single Source of Truth)
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={!selectedLead}
              leftIcon={<Sparkles className="w-4 h-4" />}
              onClick={handleConvert}
            >
              Generate Draft Invoice
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Banner */}
        <div className="p-3 bg-brand-500/10 border border-brand-500/30 rounded-lg flex items-center gap-3">
          <UserCheck className="w-5 h-5 text-brand-400 shrink-0" />
          <div className="text-xs text-slate-300">
            Select a <span className="text-brand-400 font-semibold">Won Lead</span> from CRM. Customer details, email, contact person, and deal value will be automatically imported into a new draft invoice.
          </div>
        </div>

        {/* Won Leads List */}
        <div>
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Won Deals Pipeline ({wonLeads.length})
          </h4>
          {wonLeads.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400 bg-dark-surface/50 rounded-lg border border-dark-border">
              No Won leads available in `crm_leads`. Move a lead to "Won" in the CRM Pipeline first.
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={wonLeads}
              keyExtractor={(lead) => lead.id}
              onRowClick={handleSelectLead}
              searchPlaceholder="Search won deals..."
            />
          )}
        </div>

        {/* Selected Lead Conversion Config */}
        {selectedLead && (
          <Card className="bg-dark-surface/60 border-brand-500/40 p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-dark-border pb-2">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-brand-400" />
                <span className="font-semibold text-slate-100 text-sm">
                  {selectedLead.company_name || selectedLead.title}
                </span>
              </div>
              <Badge variant="emerald" size="sm">
                Stage: WON
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="flex items-center gap-1.5 text-slate-300">
                <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                <span>{selectedLead.contact_person}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-300">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{selectedLead.email || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-300">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{selectedLead.phone || 'N/A'}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-dark-border/60">
              <div>
                <label className="block text-2xs font-medium text-slate-400 mb-1">
                  Place of Supply (State Code)
                </label>
                <select
                  value={placeOfSupply}
                  onChange={(e) => setPlaceOfSupply(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border text-xs rounded-md p-1.5 text-slate-200"
                >
                  <option value="29 - Karnataka">29 - Karnataka (Intra-State)</option>
                  <option value="27 - Maharashtra">27 - Maharashtra (Inter-State IGST)</option>
                  <option value="24 - Gujarat">24 - Gujarat (Inter-State IGST)</option>
                  <option value="07 - Delhi">07 - Delhi (Inter-State IGST)</option>
                  <option value="33 - Tamil Nadu">33 - Tamil Nadu (Inter-State IGST)</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-4">
                <input
                  type="checkbox"
                  id="igst-check"
                  checked={isIgst}
                  onChange={(e) => setIsIgst(e.target.checked)}
                  className="rounded border-dark-border bg-dark-bg text-brand-500 focus:ring-brand-500"
                />
                <label htmlFor="igst-check" className="text-xs text-slate-300 font-medium">
                  Inter-State IGST (18%) instead of CGST/SGST (9%+9%)
                </label>
              </div>
            </div>

            {/* Estimated Billing Summary */}
            <div className="flex items-center justify-between bg-dark-bg/80 p-3 rounded-lg border border-dark-border font-mono text-xs">
              <div>
                <span className="text-slate-400 block text-2xs">Estimated Deal Value</span>
                <span className="text-slate-200 font-bold">
                  {formatINR(selectedLead.estimated_value * 100)}
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500" />
              <div>
                <span className="text-slate-400 block text-2xs">Est. Taxable Subtotal</span>
                <span className="text-brand-400 font-bold">
                  {formatINR(selectedLead.estimated_value * 100)}
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500" />
              <div>
                <span className="text-slate-400 block text-2xs">Est. Gross Invoice Total (with 18% GST)</span>
                <span className="text-emerald-400 font-bold text-sm">
                  {formatINR(selectedLead.estimated_value * 118)}
                </span>
              </div>
            </div>
          </Card>
        )}
      </div>
    </Modal>
  );
};
