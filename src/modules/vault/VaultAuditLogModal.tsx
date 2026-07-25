// ─────────────────────────────────────────────────────────────
// Vortiq Data Vault — Audit Log Viewer Modal
// Audit trail for downloads, exports, bulk imports, and record corrections
// ─────────────────────────────────────────────────────────────

import React from 'react';
import { Modal, Button, Badge } from '@/design-system';
import { VaultExportLog, VaultImportLog, VaultCorrectionLog } from './types';

interface VaultAuditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  exportLogs: VaultExportLog[];
  importLogs: VaultImportLog[];
  correctionLogs: VaultCorrectionLog[];
}

export const VaultAuditLogModal: React.FC<VaultAuditLogModalProps> = ({
  isOpen,
  onClose,
  exportLogs,
  importLogs,
  correctionLogs,
}) => {
  const [tab, setTab] = React.useState<'exports' | 'imports' | 'corrections'>('exports');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Data Vault Security Audit & Download Logs"
      maxWidth="lg"
    >
      <div className="space-y-4 text-xs font-mono">
        <div className="flex rounded-xl bg-dark-surface p-1 border border-dark-border text-2xs font-semibold">
          <button
            onClick={() => setTab('exports')}
            className={`flex-1 py-1.5 rounded-lg transition-all ${tab === 'exports' ? 'bg-brand-500 text-dark-bg font-bold' : 'text-slate-400'}`}
          >
            Export Logs ({exportLogs.length})
          </button>
          <button
            onClick={() => setTab('imports')}
            className={`flex-1 py-1.5 rounded-lg transition-all ${tab === 'imports' ? 'bg-brand-500 text-dark-bg font-bold' : 'text-slate-400'}`}
          >
            Import Logs ({importLogs.length})
          </button>
          <button
            onClick={() => setTab('corrections')}
            className={`flex-1 py-1.5 rounded-lg transition-all ${tab === 'corrections' ? 'bg-brand-500 text-dark-bg font-bold' : 'text-slate-400'}`}
          >
            DB Overwrite Corrections ({correctionLogs.length})
          </button>
        </div>

        <div className="max-h-72 overflow-y-auto space-y-2">
          {tab === 'exports' && (
            exportLogs.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-2xs">No export logs recorded.</div>
            ) : (
              exportLogs.map((log) => (
                <div key={log.id} className="p-3 bg-dark-surface/60 rounded-xl border border-dark-border space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">{log.user_name} ({log.user_email})</span>
                    <Badge variant="emerald" size="sm" className="uppercase">{log.format}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-2xs text-slate-400">
                    <span>Department: <strong className="text-brand-300">{log.department.toUpperCase()}</strong> • Rows: {log.rows_count}</span>
                    <span>{new Date(log.created_at).toLocaleString()}</span>
                  </div>
                </div>
              ))
            )
          )}

          {tab === 'imports' && (
            importLogs.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-2xs">No bulk import logs recorded.</div>
            ) : (
              importLogs.map((log) => (
                <div key={log.id} className="p-3 bg-dark-surface/60 rounded-xl border border-dark-border space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">{log.user_name} ({log.user_email})</span>
                    <Badge variant="amber" size="sm" className="uppercase">Bulk Import</Badge>
                  </div>
                  <div className="flex items-center justify-between text-2xs text-slate-400">
                    <span>Department: <strong className="text-brand-300">{log.department.toUpperCase()}</strong> • Imported: {log.rows_imported} | Skipped: {log.rows_skipped}</span>
                    <span>{new Date(log.created_at).toLocaleString()}</span>
                  </div>
                </div>
              ))
            )
          )}

          {tab === 'corrections' && (
            correctionLogs.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-2xs">No DB overwrite correction logs recorded.</div>
            ) : (
              correctionLogs.map((log) => (
                <div key={log.id} className="p-3 bg-dark-surface/60 rounded-xl border border-dark-border space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">{log.user_name} (Record #{log.entity_id})</span>
                    <Badge variant="rose" size="sm" className="uppercase">Overwrite Log</Badge>
                  </div>
                  <p className="text-2xs text-slate-400">
                    Field <strong className="text-amber-300">{log.field_name}</strong> changed from <span className="text-slate-300 font-bold">"{log.old_value}"</span> to <span className="text-emerald-300 font-bold">"{log.new_value}"</span>
                  </p>
                </div>
              ))
            )
          )}
        </div>

        <Button variant="ghost" size="sm" className="w-full" onClick={onClose}>
          Close Audit Log Viewer
        </Button>
      </div>
    </Modal>
  );
};
