import React, { useState, useRef } from 'react';
import { Modal, Button, Badge, Select } from '@/design-system';
import { CrmLead, ImportFieldMapping, ImportedRow, SystemField, SYSTEM_FIELDS, PIPELINE_STAGES, LEAD_SOURCES } from './types';
import {
  Upload,
  FileSpreadsheet,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  SkipForward,
  Download,
} from 'lucide-react';

interface BulkLeadImporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: (leads: Partial<CrmLead>[]) => void;
  organizationId: string;
}

type Step = 'upload' | 'mapping' | 'preview' | 'summary';

const TEMPLATE_CSV = `name,company,phone,email,source,stage,assignee,notes
Priya Mehra,Fintech Corp India,+91 98200 12345,priya@fintechcorp.in,referral,new,Alex Vance,"Interested in Enterprise plan"
Rajesh Agarwal,Rajesh Traders,+91 99887 66554,rajesh@rajeshtraders.com,website,contacted,Priya Sharma,"Evaluating 2 vendors"`;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[+]?[\d\s\-().]{7,}$/;

const REQUIRED_FIELDS: SystemField[] = ['name'];

// Parse a CSV string into rows
function parseCSV(text: string): { headers: string[]; rows: string[][] } {
  const lines = text.trim().split('\n').filter(Boolean);
  if (!lines.length) return { headers: [], rows: [] };

  const parse = (line: string) => {
    const result: string[] = [];
    let inQuote = false;
    let cell = '';
    for (let i = 0; i < line.length; i++) {
      if (line[i] === '"') { inQuote = !inQuote; continue; }
      if (line[i] === ',' && !inQuote) { result.push(cell.trim()); cell = ''; continue; }
      cell += line[i];
    }
    result.push(cell.trim());
    return result;
  };

  return { headers: parse(lines[0]), rows: lines.slice(1).map(parse) };
}

function guessMapping(csvCol: string): SystemField {
  const c = csvCol.toLowerCase().replace(/[^a-z]/g, '');
  if (['name', 'contactname', 'contact', 'fullname'].includes(c)) return 'name';
  if (['company', 'companyname', 'organization', 'firm'].includes(c)) return 'company_name';
  if (['phone', 'mobile', 'tel', 'phonenumber'].includes(c)) return 'phone';
  if (['email', 'emailaddress', 'mail'].includes(c)) return 'email';
  if (['source', 'leadsource', 'origin'].includes(c)) return 'source';
  if (['stage', 'pipelinestage', 'status'].includes(c)) return 'stage_id';
  if (['assignee', 'assignedto', 'owner', 'rep'].includes(c)) return 'assignee_name';
  if (['notes', 'note', 'comment', 'comments'].includes(c)) return 'notes';
  if (['value', 'estimatedvalue', 'dealvalue', 'amount'].includes(c)) return 'estimated_value';
  return 'skip';
}

export const BulkLeadImporterModal: React.FC<BulkLeadImporterModalProps> = ({
  isOpen,
  onClose,
  onImportComplete,
  organizationId,
}) => {
  const [step, setStep] = useState<Step>('upload');
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvRows, setCsvRows] = useState<string[][]>([]);
  const [fileName, setFileName] = useState('');
  const [mappings, setMappings] = useState<ImportFieldMapping[]>([]);
  const [validatedRows, setValidatedRows] = useState<ImportedRow[]>([]);
  const [importSummary, setImportSummary] = useState({ imported: 0, skipped: 0, warned: 0 });
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setStep('upload');
    setCsvHeaders([]);
    setCsvRows([]);
    setFileName('');
    setMappings([]);
    setValidatedRows([]);
    setImportSummary({ imported: 0, skipped: 0, warned: 0 });
  };

  // ── Step 1: Upload ──────────────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const { headers, rows } = parseCSV(text);
      setCsvHeaders(headers);
      setCsvRows(rows);
      const auto = headers.map(h => ({ csvColumn: h, systemField: guessMapping(h) }));
      setMappings(auto);
    };
    reader.readAsText(file);
  };

  const handleDownloadTemplate = () => {
    const blob = new Blob([TEMPLATE_CSV], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vortiq_leads_import_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Step 2: Mapping → Step 3: Validate ─────────────────────────────────────
  const handleValidate = () => {
    const rows: ImportedRow[] = csvRows.map((row, idx) => {
      const entry: ImportedRow = { _rowIndex: idx + 2, _valid: true, _errors: [], _skipped: false };

      mappings.forEach(({ csvColumn, systemField }) => {
        if (systemField === 'skip') return;
        const colIdx = csvHeaders.indexOf(csvColumn);
        const val = colIdx >= 0 ? (row[colIdx] || '').trim() : '';
        entry[systemField] = val;
      });

      // Validate required
      for (const req of REQUIRED_FIELDS) {
        if (!entry[req]) {
          entry._errors.push(`Missing required field: ${SYSTEM_FIELDS.find(f => f.value === req)?.label || req}`);
          entry._valid = false;
        }
      }

      // Validate email
      if (entry['email'] && !EMAIL_REGEX.test(entry['email'])) {
        entry._errors.push(`Invalid email: "${entry['email']}"`);
        entry._valid = false;
      }

      // Validate phone
      if (entry['phone'] && !PHONE_REGEX.test(entry['phone'])) {
        entry._errors.push(`Suspicious phone: "${entry['phone']}"`);
      }

      // Coerce stage
      if (entry['stage_id']) {
        const valid = PIPELINE_STAGES.find(s => s.id === entry['stage_id'] || s.name.toLowerCase() === entry['stage_id'].toLowerCase());
        entry['stage_id'] = valid ? valid.id : 'new';
      } else {
        entry['stage_id'] = 'new';
      }

      return entry;
    });

    setValidatedRows(rows);
    setStep('preview');
  };

  // ── Step 3: Preview → Import ────────────────────────────────────────────────
  const handleImport = () => {
    const toImport = validatedRows.filter(r => !r._skipped && r._valid);
    const skipped = validatedRows.filter(r => r._skipped || !r._valid);
    const warned = validatedRows.filter(r => !r._skipped && r._valid && r._errors.length > 0);

    const leads: Partial<CrmLead>[] = toImport.map(row => ({
      id: `imported-${Date.now()}-${row._rowIndex}`,
      organization_id: organizationId,
      title: row['company_name'] ? `${row['name']} — ${row['company_name']}` : row['name'] || 'Imported Lead',
      name: row['name'] || '',
      company_name: row['company_name'],
      contact_person: row['name'] || '',
      phone: row['phone'],
      email: row['email'],
      source: LEAD_SOURCES.find(s => s.label.toLowerCase() === (row['source'] || '').toLowerCase())?.value || undefined,
      stage_id: (row['stage_id'] as CrmLead['stage_id']) || 'new',
      assignee_name: row['assignee_name'],
      notes: row['notes'],
      estimated_value: Number(row['estimated_value']) || 0,
      currency: 'INR',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    setImportSummary({
      imported: toImport.length,
      skipped: skipped.length,
      warned: warned.length,
    });
    onImportComplete(leads);
    setStep('summary');
  };

  const toggleSkip = (rowIndex: number) => {
    setValidatedRows(prev =>
      prev.map(r => r._rowIndex === rowIndex ? { ...r, _skipped: !r._skipped } : r)
    );
  };

  // ── Render steps ────────────────────────────────────────────────────────────

  const stepLabels: Step[] = ['upload', 'mapping', 'preview', 'summary'];
  const stepTitles = { upload: 'Upload File', mapping: 'Map Columns', preview: 'Validate', summary: 'Complete' };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => { reset(); onClose(); }}
      title="Bulk Import Leads"
      maxWidth="xl"
      footer={
        step === 'upload' ? (
          <>
            <Button variant="ghost" size="sm" onClick={() => { reset(); onClose(); }}>Cancel</Button>
            <Button
              variant="primary"
              size="sm"
              rightIcon={<ArrowRight className="w-4 h-4" />}
              onClick={() => setStep('mapping')}
              disabled={csvHeaders.length === 0}
            >
              Continue to Column Mapping
            </Button>
          </>
        ) : step === 'mapping' ? (
          <>
            <Button variant="ghost" size="sm" onClick={() => setStep('upload')}>← Back</Button>
            <Button
              variant="primary"
              size="sm"
              rightIcon={<ArrowRight className="w-4 h-4" />}
              onClick={handleValidate}
            >
              Validate Data
            </Button>
          </>
        ) : step === 'preview' ? (
          <>
            <Button variant="ghost" size="sm" onClick={() => setStep('mapping')}>← Back</Button>
            <Button
              variant="primary"
              size="sm"
              rightIcon={<CheckCircle2 className="w-4 h-4" />}
              onClick={handleImport}
              disabled={validatedRows.filter(r => !r._skipped && r._valid).length === 0}
            >
              Import {validatedRows.filter(r => !r._skipped && r._valid).length} Leads
            </Button>
          </>
        ) : (
          <Button variant="primary" size="sm" onClick={() => { reset(); onClose(); }}>Close</Button>
        )
      }
    >
      <div className="space-y-5">
        {/* Step indicator */}
        <div className="flex items-center gap-0">
          {stepLabels.map((s, i) => {
            const isActive = s === step;
            const isDone = stepLabels.indexOf(step) > i;
            return (
              <React.Fragment key={s}>
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  isActive ? 'bg-brand-500/20 text-brand-400 border border-brand-500/40' :
                  isDone ? 'text-emerald-400' : 'text-slate-600'
                }`}>
                  {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : (
                    <span className={`w-4 h-4 rounded-full text-2xs flex items-center justify-center border ${isActive ? 'border-brand-500 bg-brand-500/20' : 'border-slate-600'}`}>{i + 1}</span>
                  )}
                  {stepTitles[s]}
                </div>
                {i < stepLabels.length - 1 && <div className="h-px w-4 bg-dark-border/60 shrink-0" />}
              </React.Fragment>
            );
          })}
        </div>

        {/* ─── Step 1: Upload ───────────────────────────────────────────────── */}
        {step === 'upload' && (
          <div className="space-y-4">
            <button
              onClick={handleDownloadTemplate}
              className="flex items-center gap-2 text-xs text-brand-400 hover:text-brand-300 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download template CSV (name, company, phone, email, source, stage, assignee, notes)
            </button>

            <label
              className={`flex flex-col items-center justify-center gap-3 p-10 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
                fileName ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-dark-border/60 bg-dark-surface/20 hover:border-brand-500/40 hover:bg-brand-500/5'
              }`}
            >
              {fileName ? (
                <>
                  <FileSpreadsheet className="w-10 h-10 text-emerald-400" />
                  <p className="text-sm font-semibold text-emerald-300">{fileName}</p>
                  <p className="text-2xs text-slate-500">{csvRows.length} data rows detected, {csvHeaders.length} columns</p>
                  <p className="text-2xs text-brand-400">Click to change file</p>
                </>
              ) : (
                <>
                  <Upload className="w-10 h-10 text-slate-500" />
                  <p className="text-sm font-semibold text-slate-300">Drop your CSV or Excel file here</p>
                  <p className="text-2xs text-slate-500">or click to browse</p>
                  <p className="text-2xs text-slate-600">Accepts .csv files</p>
                </>
              )}
              <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleFileChange} />
            </label>

            {fileName && (
              <div className="flex items-center gap-2 px-3 py-2 bg-dark-surface/40 border border-dark-border/40 rounded-xl text-2xs text-slate-500">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                Columns found: <span className="font-mono text-slate-300">{csvHeaders.join(', ')}</span>
              </div>
            )}
          </div>
        )}

        {/* ─── Step 2: Mapping ──────────────────────────────────────────────── */}
        {step === 'mapping' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-400">
              Map each column from your file to a Vortiq field. The system auto-guessed these — correct any that are wrong.
            </p>
            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
              {mappings.map((m, idx) => (
                <div key={m.csvColumn} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-dark-surface/30 border border-dark-border/50">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-mono font-semibold text-slate-200 truncate">{m.csvColumn}</p>
                    <p className="text-2xs text-slate-500 truncate">
                      Sample: <span className="text-slate-400">{csvRows[0]?.[csvHeaders.indexOf(m.csvColumn)] || '—'}</span>
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />
                  <div className="w-48 shrink-0">
                    <Select
                      value={m.systemField}
                      onChange={(e) => {
                        setMappings(prev => prev.map((pm, pi) =>
                          pi === idx ? { ...pm, systemField: e.target.value as SystemField } : pm
                        ));
                      }}
                      options={SYSTEM_FIELDS}
                    />
                  </div>
                  {REQUIRED_FIELDS.includes(m.systemField) && (
                    <Badge variant="amber" size="sm">Required</Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── Step 3: Preview ──────────────────────────────────────────────── */}
        {step === 'preview' && (
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-2xs font-mono">
              <span className="text-emerald-400">{validatedRows.filter(r => r._valid && !r._skipped).length} valid</span>
              <span className="text-slate-600">·</span>
              <span className="text-rose-400">{validatedRows.filter(r => !r._valid).length} invalid</span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-500">{validatedRows.filter(r => r._skipped).length} skipped</span>
            </div>
            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
              {validatedRows.map(row => (
                <div
                  key={row._rowIndex}
                  className={`px-4 py-3 rounded-xl border text-xs transition-all ${
                    row._skipped ? 'opacity-40 border-dark-border/30 bg-dark-surface/10' :
                    !row._valid ? 'border-rose-500/40 bg-rose-500/5' :
                    'border-dark-border/50 bg-dark-surface/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 space-y-0.5">
                      <p className="font-semibold text-slate-200 truncate">
                        Row {row._rowIndex}: {row['name'] || <span className="text-slate-500 italic">no name</span>}
                        {row['company_name'] && <span className="text-slate-500"> · {row['company_name']}</span>}
                      </p>
                      <p className="text-slate-500 font-mono">{row['email'] || ''} {row['phone'] || ''}</p>
                      {row._errors.map((err, i) => (
                        <p key={i} className="flex items-center gap-1 text-rose-400">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          {err}
                        </p>
                      ))}
                    </div>
                    <button
                      onClick={() => toggleSkip(row._rowIndex)}
                      className={`shrink-0 flex items-center gap-1 px-2 py-1 rounded-lg text-2xs font-medium transition-colors ${
                        row._skipped
                          ? 'bg-dark-surface text-slate-400 hover:text-slate-200'
                          : 'text-slate-500 hover:text-amber-300 hover:bg-amber-500/10'
                      }`}
                    >
                      {row._skipped ? (
                        <><CheckCircle2 className="w-3 h-3" /> Include</>
                      ) : (
                        <><SkipForward className="w-3 h-3" /> Skip</>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── Step 4: Summary ──────────────────────────────────────────────── */}
        {step === 'summary' && (
          <div className="py-8 flex flex-col items-center justify-center gap-6 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100 font-display mb-1">Import Complete</h3>
              <p className="text-sm text-slate-400">Your leads have been added to the Sales Pipeline.</p>
            </div>
            <div className="flex gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold font-mono text-emerald-400">{importSummary.imported}</p>
                <p className="text-xs text-slate-500">Imported</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold font-mono text-slate-400">{importSummary.skipped}</p>
                <p className="text-xs text-slate-500">Skipped</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold font-mono text-amber-400">{importSummary.warned}</p>
                <p className="text-xs text-slate-500">Warnings</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
