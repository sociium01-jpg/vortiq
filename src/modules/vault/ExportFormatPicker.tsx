// ─────────────────────────────────────────────────────────────
// Vortiq Data Vault — Multi-Format Export Picker Modal
// Excel/CSV, PDF Report, Word Summary & PowerPoint Narrative Exports
// ─────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { Modal, Button, Badge } from '@/design-system';
import { VaultDepartment, ExportFormat } from './types';
import { Download, FileSpreadsheet, FileText, Presentation, CheckCircle2 } from 'lucide-react';

interface ExportFormatPickerProps {
  isOpen: boolean;
  onClose: () => void;
  department: VaultDepartment | 'all';
  recordsCount: number;
  onConfirmExport: (format: ExportFormat) => void;
}

export const ExportFormatPicker: React.FC<ExportFormatPickerProps> = ({
  isOpen,
  onClose,
  department,
  recordsCount,
  onConfirmExport,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('csv');
  const [isExporting, setIsExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      onConfirmExport(selectedFormat);
      setIsExporting(false);
      setExportComplete(true);
      setTimeout(() => {
        setExportComplete(false);
        onClose();
      }, 1500);
    }, 800);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Export Data Vault — ${department.toUpperCase()}`}
      maxWidth="md"
    >
      <div className="space-y-5 text-xs font-mono">
        <div className="p-3 bg-dark-surface rounded-xl border border-dark-border flex items-center justify-between">
          <div>
            <p className="text-slate-200 font-bold font-display">Target Dataset: {department.toUpperCase()}</p>
            <p className="text-2xs text-slate-400">Total Filtered Rows: {recordsCount}</p>
          </div>
          <Badge variant="violet" size="sm" className="uppercase font-mono">{department}</Badge>
        </div>

        {exportComplete ? (
          <div className="p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto animate-bounce" />
            <h4 className="font-bold text-slate-100 font-display">Export Complete & Audit Logged</h4>
            <p className="text-2xs text-slate-300">File download triggered and logged to Vault Audit Trail.</p>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <label className="text-2xs font-semibold text-slate-400 uppercase tracking-wider block">
                Select Export Format & Output Style
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* CSV */}
                <div
                  onClick={() => setSelectedFormat('csv')}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    selectedFormat === 'csv'
                      ? 'bg-brand-500/10 border-brand-400 text-brand-300 font-bold'
                      : 'bg-dark-surface border-dark-border text-slate-300 hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                    <span className="font-display">CSV Raw Export</span>
                  </div>
                  <p className="text-2xs text-slate-400 font-sans">Full-fidelity row-level tabular data export for raw analysis.</p>
                </div>

                {/* Excel */}
                <div
                  onClick={() => setSelectedFormat('excel')}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    selectedFormat === 'excel'
                      ? 'bg-brand-500/10 border-brand-400 text-brand-300 font-bold'
                      : 'bg-dark-surface border-dark-border text-slate-300 hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                    <span className="font-display">Excel Workbook (.xlsx)</span>
                  </div>
                  <p className="text-2xs text-slate-400 font-sans">Formatted Excel spreadsheet with column headers and total rows.</p>
                </div>

                {/* PDF */}
                <div
                  onClick={() => setSelectedFormat('pdf')}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    selectedFormat === 'pdf'
                      ? 'bg-brand-500/10 border-brand-400 text-brand-300 font-bold'
                      : 'bg-dark-surface border-dark-border text-slate-300 hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="w-4 h-4 text-rose-400" />
                    <span className="font-display">PDF Formatted Report</span>
                  </div>
                  <p className="text-2xs text-slate-400 font-sans">Formatted printable PDF document respecting active filters.</p>
                </div>

                {/* Word Summary */}
                <div
                  onClick={() => setSelectedFormat('word')}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    selectedFormat === 'word'
                      ? 'bg-brand-500/10 border-brand-400 text-brand-300 font-bold'
                      : 'bg-dark-surface border-dark-border text-slate-300 hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="w-4 h-4 text-sky-400" />
                    <span className="font-display">Word Narrative Report (.docx)</span>
                  </div>
                  <p className="text-2xs text-slate-400 font-sans">Departmental executive summary narrative with key metrics & tables.</p>
                </div>

                {/* PowerPoint Summary */}
                <div
                  onClick={() => setSelectedFormat('ppt')}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    selectedFormat === 'ppt'
                      ? 'bg-brand-500/10 border-brand-400 text-brand-300 font-bold'
                      : 'bg-dark-surface border-dark-border text-slate-300 hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Presentation className="w-4 h-4 text-amber-400" />
                    <span className="font-display">PowerPoint Deck (.pptx)</span>
                  </div>
                  <p className="text-2xs text-slate-400 font-sans">Executive slide presentation highlighting top figures and department narrative.</p>
                </div>
              </div>
            </div>

            <Button
              variant="primary"
              size="md"
              className="w-full"
              onClick={handleExport}
              isLoading={isExporting}
              leftIcon={<Download className="w-4 h-4" />}
            >
              Export & Record Security Audit Log
            </Button>
          </>
        )}
      </div>
    </Modal>
  );
};
