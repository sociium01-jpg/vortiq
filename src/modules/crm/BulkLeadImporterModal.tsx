import React, { useState } from 'react';
import { Modal, Button, Select, Badge } from '@/design-system';
import { Upload, FileSpreadsheet, Download, CheckCircle2, ArrowRight } from 'lucide-react';

export interface BulkLeadImporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (importedLeads: any[]) => void;
}

export const BulkLeadImporterModal: React.FC<BulkLeadImporterModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [fileName, setFileName] = useState<string | null>(null);
  const [detectedColumns, setDetectedColumns] = useState<string[]>([]);
  
  // Field mappings state (CSV column -> System field)
  const [fieldMappings, setFieldMappings] = useState<Record<string, string>>({
    'Contact Name': 'name',
    'Company': 'company',
    'Mobile Phone': 'phone',
    'Email Address': 'email',
    'Lead Source': 'source',
    'Pipeline Stage': 'stage',
    'Assigned Owner': 'owner',
    'Notes': 'notes',
  });

  // Sample parsed & validated rows for Step 3
  const [previewRows, setPreviewRows] = useState([
    { id: 1, name: 'Ananya Roy', company: 'TechSolutions India', phone: '+91 98765 43210', email: 'ananya@techsolutions.in', source: 'Website', stage: 'New', owner: 'Priya Sharma', valid: true, error: null },
    { id: 2, name: 'Karan Malhotra', company: 'Malhotra Enterprises', phone: '9811122233', email: 'invalid-email-address', source: 'Referral', stage: 'Contacted', owner: 'Alex Vance', valid: false, error: 'Malformed email format' },
    { id: 3, name: 'Deepak Patel', company: 'Patel Logistics', phone: '+91 99222 33344', email: 'deepak@patellogistics.com', source: 'Cold Outreach', stage: 'Qualified', owner: 'Rajesh Kumar', valid: true, error: null },
  ]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setDetectedColumns([
        'Contact Name',
        'Company',
        'Mobile Phone',
        'Email Address',
        'Lead Source',
        'Pipeline Stage',
        'Assigned Owner',
        'Notes',
      ]);
      setStep(2);
    }
  };

  const handleDownloadTemplate = () => {
    const csvContent = 'data:text/csv;charset=utf-8,Contact Name,Company,Mobile Phone,Email Address,Lead Source,Pipeline Stage,Assigned Owner,Notes\nPriya Sharma,Fintech Corp,+91 98200 12345,priya@fintechcorp.in,Website,New,Alex Vance,Interested in Enterprise Pro plan';
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'vortiq_sales_pipeline_leads_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExecuteImport = () => {
    const validLeads = previewRows.filter((r) => r.valid);
    onImportSuccess(validLeads);
    setStep(4);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Bulk Import Leads into Sales Pipeline"
      maxWidth="xl"
    >
      {/* Wizard Steps Header */}
      <div className="flex items-center justify-between border-b border-dark-border pb-4 mb-4">
        {[
          { number: 1, label: 'Upload File' },
          { number: 2, label: 'Map Fields' },
          { number: 3, label: 'Validate & Preview' },
          { number: 4, label: 'Summary' },
        ].map((s) => (
          <div
            key={s.number}
            className={`flex items-center gap-2 text-xs font-semibold ${
              step === s.number ? 'text-brand-400 font-display' : step > s.number ? 'text-emerald-400' : 'text-slate-500'
            }`}
          >
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-2xs ${
                step === s.number
                  ? 'bg-brand-500 text-dark-bg font-bold'
                  : step > s.number
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-dark-surface border border-dark-border text-slate-500'
              }`}
            >
              {s.number}
            </span>
            <span className="hidden sm:inline">{s.label}</span>
          </div>
        ))}
      </div>

      {/* STEP 1: UPLOAD & TEMPLATE DOWNLOAD */}
      {step === 1 && (
        <div className="space-y-6 text-center py-4">
          <div className="p-8 border-2 border-dashed border-dark-border rounded-2xl bg-dark-surface/30 hover:border-brand-500/50 transition-colors">
            <FileSpreadsheet className="w-12 h-12 text-brand-400 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-slate-100 font-display">Upload CSV or Excel Lead File</h4>
            <p className="text-xs text-slate-400 mt-1 mb-4">Drag and drop your lead list file here, or click to browse.</p>
            <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-dark-bg font-semibold text-xs cursor-pointer shadow-lg shadow-brand-500/20 transition-all">
              <Upload className="w-4 h-4" />
              <span>Choose File (.csv, .xlsx)</span>
              <input type="file" accept=".csv,.xlsx" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-dark-surface/60 rounded-xl border border-dark-border">
            <div className="text-left">
              <div className="text-xs font-semibold text-slate-200">Need the standard import format?</div>
              <div className="text-2xs text-slate-400">Download our sample CSV template with standard column headers.</div>
            </div>
            <Button variant="outline" size="sm" leftIcon={<Download className="w-3.5 h-3.5" />} onClick={handleDownloadTemplate}>
              Download CSV Template
            </Button>
          </div>
        </div>
      )}

      {/* STEP 2: FIELD MAPPING */}
      {step === 2 && (
        <div className="space-y-4">
          <p className="text-xs text-slate-400">
            Map detected headers in <span className="font-semibold text-slate-200">{fileName}</span> to Vortiq Sales Pipeline fields.
          </p>

          <div className="space-y-2 max-h-64 overflow-y-auto p-2 bg-dark-surface/40 rounded-xl border border-dark-border">
            {detectedColumns.map((col) => (
              <div key={col} className="flex items-center justify-between gap-4 p-2 bg-dark-card rounded-lg border border-dark-border/60">
                <span className="text-xs font-mono text-slate-200">{col}</span>
                <ArrowRight className="w-4 h-4 text-slate-500 shrink-0" />
                <Select
                  options={[
                    { value: 'name', label: 'System Field: Lead Name (Required)' },
                    { value: 'company', label: 'System Field: Company' },
                    { value: 'phone', label: 'System Field: Phone' },
                    { value: 'email', label: 'System Field: Email' },
                    { value: 'source', label: 'System Field: Source' },
                    { value: 'stage', label: 'System Field: Pipeline Stage' },
                    { value: 'owner', label: 'System Field: Assigned Owner' },
                    { value: 'notes', label: 'System Field: Notes' },
                  ]}
                  value={fieldMappings[col] || 'name'}
                  onChange={(e) => setFieldMappings({ ...fieldMappings, [col]: e.target.value })}
                  className="text-xs py-1 px-2 w-64"
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setStep(1)}>Back</Button>
            <Button variant="primary" size="sm" onClick={() => setStep(3)}>Proceed to Validation</Button>
          </div>
        </div>
      )}

      {/* STEP 3: PRE-COMMIT VALIDATION PREVIEW */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-300">
              Validated <span className="font-bold text-slate-100">{previewRows.length}</span> parsed rows. Flagged items require attention.
            </div>
            <Badge variant="amber" dot>1 Invalid Row Flagged</Badge>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {previewRows.map((row) => (
              <div
                key={row.id}
                className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                  row.valid
                    ? 'bg-dark-surface/40 border-dark-border'
                    : 'bg-rose-950/20 border-rose-500/40'
                }`}
              >
                <div>
                  <div className="font-semibold text-slate-100">{row.name} ({row.company})</div>
                  <div className="text-2xs text-slate-400 font-mono">{row.email} • {row.phone}</div>
                </div>

                {row.valid ? (
                  <Badge variant="emerald">Valid</Badge>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-2xs text-rose-400">{row.error}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPreviewRows((prev) =>
                          prev.map((r) => (r.id === row.id ? { ...r, email: 'karan@malhotra.in', valid: true, error: null } : r))
                        )
                      }
                    >
                      Fix Email
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setStep(2)}>Back</Button>
            <Button variant="primary" size="sm" onClick={handleExecuteImport}>Confirm & Execute Import</Button>
          </div>
        </div>
      )}

      {/* STEP 4: IMPORT SUMMARY */}
      {step === 4 && (
        <div className="text-center py-6 space-y-4">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
          <h4 className="text-base font-bold text-slate-100 font-display">Bulk Import Execution Complete</h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Successfully imported <span className="font-bold text-emerald-400">3 leads</span> into your Sales Pipeline. Reassignment history and change logs have been initialized.
          </p>

          <div className="flex justify-center pt-2">
            <Button variant="primary" size="sm" onClick={onClose}>
              Return to Sales Pipeline
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
