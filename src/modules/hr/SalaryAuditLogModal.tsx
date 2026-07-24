// ─────────────────────────────────────────────────────────────
// Vortiq DB-Level Salary Correction Audit Log Viewer
// Tracks all CTC compensation modifications with timestamp & reason
// ─────────────────────────────────────────────────────────────

import React from 'react';
import { Modal, Button } from '@/design-system';
import { SalaryChangeLog } from './types';

export interface SalaryAuditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: SalaryChangeLog[];
}

export const SalaryAuditLogModal: React.FC<SalaryAuditLogModalProps> = ({ isOpen, onClose, logs }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Compensation Adjustment & Salary Audit Logs"
      maxWidth="md"
    >
      <div className="space-y-4">
        <p className="text-xs text-slate-400">
          Database-level immutable audit log recording all CTC adjustments, user authorizations, and timestamps.
        </p>

        <div className="space-y-3 max-h-80 overflow-y-auto">
          {logs.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400 font-mono">No salary changes recorded yet.</div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="p-3.5 bg-dark-surface/60 rounded-xl border border-dark-border space-y-1.5 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-100 font-display">{log.employee_name}</span>
                  <span className="text-2xs text-slate-400">{new Date(log.created_at).toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between text-2xs">
                  <span className="text-slate-400">Old CTC: ₹{log.old_ctc.toLocaleString('en-IN')}</span>
                  <span className="font-bold text-emerald-400">New CTC: ₹{log.new_ctc.toLocaleString('en-IN')}</span>
                </div>

                <p className="text-2xs text-slate-300">Changed by: <span className="text-brand-300">{log.changed_by_name}</span></p>
                <p className="text-2xs text-slate-400">Reason: {log.reason}</p>
              </div>
            ))
          )}
        </div>

        <Button variant="ghost" size="md" className="w-full" onClick={onClose}>
          Close Audit Viewer
        </Button>
      </div>
    </Modal>
  );
};
