// ─────────────────────────────────────────────────────────────
// Vortiq Finance — Path B: Custom Invoice Template Builder
// Template Upload, Visual Field Mapping, & Custom Format Renderer
// ─────────────────────────────────────────────────────────────

import React, { useState, useRef } from 'react';
import { Modal, Button, Badge, Select } from '@/design-system';
import { ExtendedInvoice } from './types';
import { Upload, ArrowRight, LayoutTemplate, Printer } from 'lucide-react';

interface CustomInvoiceTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: ExtendedInvoice;
  onSaveTemplateMapping: (templateName: string, mappings: Record<string, string>) => void;
}

type Step = 'upload' | 'mapping' | 'preview';

const SYSTEM_INVOICE_FIELDS = [
  { key: 'invoice_number', label: 'Invoice Number' },
  { key: 'customer_name', label: 'Customer / Client Name' },
  { key: 'customer_gstin', label: 'Customer GSTIN' },
  { key: 'invoice_date', label: 'Invoice Date' },
  { key: 'due_date', label: 'Payment Due Date' },
  { key: 'total_amount_paise', label: 'Total Amount (₹)' },
  { key: 'total_gst_paise', label: 'GST Tax (₹)' },
  { key: 'notes', label: 'Payment Terms & Bank Info' },
];

export const CustomInvoiceTemplateModal: React.FC<CustomInvoiceTemplateModalProps> = ({
  isOpen,
  onClose,
  invoice,
  onSaveTemplateMapping,
}) => {
  const [step, setStep] = useState<Step>('upload');
  const [templateName, setTemplateName] = useState('');
  const [detectedPlaceholders, setDetectedPlaceholders] = useState<string[]>([]);
  const [fieldMappings, setFieldMappings] = useState<Record<string, string>>({});

  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setTemplateName(file.name);

    // Mock parsed placeholders from uploaded template file
    const placeholders = ['{{Invoice_No}}', '{{Client_Name}}', '{{Client_GST}}', '{{Inv_Date}}', '{{Grand_Total}}', '{{Tax_Amount}}'];
    setDetectedPlaceholders(placeholders);

    // Auto-guess mapping
    const initialMap: Record<string, string> = {
      '{{Invoice_No}}': 'invoice_number',
      '{{Client_Name}}': 'customer_name',
      '{{Client_GST}}': 'customer_gstin',
      '{{Inv_Date}}': 'invoice_date',
      '{{Grand_Total}}': 'total_amount_paise',
      '{{Tax_Amount}}': 'total_gst_paise',
    };
    setFieldMappings(initialMap);
    setStep('mapping');
  };

  const handleConfirmMapping = () => {
    onSaveTemplateMapping(templateName, fieldMappings);
    setStep('preview');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Path B: Custom Invoice Template Parser & Format Builder"
      maxWidth="lg"
    >
      <div className="space-y-4 text-xs font-mono">
        {/* Step Indicator */}
        <div className="flex items-center justify-between p-3 bg-dark-surface rounded-xl border border-dark-border">
          {[
            { id: 'upload', label: '1. Upload Template' },
            { id: 'mapping', label: '2. Field Mapping' },
            { id: 'preview', label: '3. Format Preview' },
          ].map((s) => (
            <span
              key={s.id}
              className={`font-semibold ${step === s.id ? 'text-brand-300 font-bold underline' : 'text-slate-500'}`}
            >
              {s.label}
            </span>
          ))}
        </div>

        {/* STEP 1: UPLOAD TEMPLATE */}
        {step === 'upload' && (
          <div className="p-6 bg-dark-surface/40 rounded-xl border border-dark-border text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-brand-500/10 text-brand-400 mx-auto flex items-center justify-center">
              <LayoutTemplate className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-100 font-display text-xs">Upload Client Invoice Template File</h4>
              <p className="text-2xs text-slate-400 mt-0.5">Upload existing template (.docx, .xlsx, .pdf, or .html) to map fields</p>
            </div>

            <input ref={fileRef} type="file" accept=".docx,.xlsx,.pdf,.html" onChange={handleFileUpload} className="hidden" />

            <Button variant="primary" size="md" onClick={() => fileRef.current?.click()} leftIcon={<Upload className="w-4 h-4" />}>
              Choose Custom Template File
            </Button>
          </div>
        )}

        {/* STEP 2: FIELD MAPPING */}
        {step === 'mapping' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200">Map Detected Template Placeholders to System Fields</span>
              <Badge variant="emerald" size="sm">{detectedPlaceholders.length} Placeholders</Badge>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {detectedPlaceholders.map((ph) => (
                <div key={ph} className="p-2.5 bg-dark-surface rounded-lg border border-dark-border flex items-center justify-between gap-3">
                  <span className="font-bold text-brand-300 font-mono">{ph}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <div className="w-1/2">
                    <Select
                      value={fieldMappings[ph] || 'skip'}
                      onChange={(e) => setFieldMappings({ ...fieldMappings, [ph]: e.target.value })}
                      options={[
                        { value: 'skip', label: '-- Skip Mapping --' },
                        ...SYSTEM_INVOICE_FIELDS.map((f) => ({ value: f.key, label: f.label })),
                      ]}
                    />
                  </div>
                </div>
              ))}
            </div>

            <Button variant="primary" size="md" className="w-full" onClick={handleConfirmMapping} rightIcon={<ArrowRight className="w-4 h-4" />}>
              Save Mapping & Render Custom Format
            </Button>
          </div>
        )}

        {/* STEP 3: FORMAT PREVIEW & GENERATOR */}
        {step === 'preview' && (
          <div className="space-y-4">
            <div className="p-4 bg-dark-card border border-dark-border rounded-xl space-y-3">
              <div className="flex items-center justify-between border-b border-dark-border pb-2">
                <span className="font-bold text-slate-100 font-display">Client Custom Template Preview ({templateName})</span>
                <Badge variant="violet" size="sm">Mapped & Active</Badge>
              </div>

              <div className="p-4 bg-dark-surface rounded-lg space-y-2 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Invoice Number:</span>
                  <span className="font-bold text-slate-100">{invoice.invoice_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Customer:</span>
                  <span className="font-bold text-slate-100">{invoice.customer_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">GSTIN:</span>
                  <span className="text-slate-300">{invoice.customer_gstin || '27AAAAA0000A1Z5'}</span>
                </div>
                <div className="flex justify-between border-t border-dark-border pt-2">
                  <span className="text-slate-400">Total Amount:</span>
                  <span className="font-bold text-emerald-400">₹{(((invoice.total_amount_paise || invoice.total_paise) || 0) / 100).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="primary" size="md" className="flex-1" onClick={() => window.print()} leftIcon={<Printer className="w-4 h-4" />}>
                Print in Client Custom Layout
              </Button>
              <Button variant="outline" size="md" className="flex-1" onClick={onClose}>
                Done
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
