// ─────────────────────────────────────────────────────────────
// Vortiq Highest-Visibility Financial Deletion & Audit Log Viewer
// Master Directive: Financial deletions get the highest-visibility notification
// ─────────────────────────────────────────────────────────────

import React from 'react';
import { Modal, Button, Badge } from '@/design-system';
import { FinancialAuditLog } from './types';
import { ShieldAlert, Flag, PhoneCall } from 'lucide-react';

export interface FinancialAuditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: FinancialAuditLog[];
}

export const FinancialAuditLogModal: React.FC<FinancialAuditLogModalProps> = ({ isOpen, onClose, logs }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="High-Visibility Financial Deletion & Correction Audit Logs"
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Top Highest-Visibility Warning Banner */}
        <div className="p-3.5 bg-rose-500/10 border border-rose-500/40 rounded-xl text-2xs text-rose-300 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold uppercase tracking-wider font-display">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
              Highest-Visibility Financial Security Log
            </div>
            <Badge variant="rose" size="sm" className="font-mono font-bold">STRICT AUDIT</Badge>
          </div>
          <p className="text-2xs text-slate-300 font-mono">
            Every invoice deletion, bill adjustment, or financial correction is permanently logged with user authorization & audit reasons.
          </p>
        </div>

        <div className="space-y-3 max-h-80 overflow-y-auto font-mono text-xs">
          {logs.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">No financial deletion audit records.</div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="p-3.5 bg-dark-surface/60 rounded-xl border border-dark-border space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-100 font-display">{log.entity_name}</span>
                  <Badge variant={log.action_type === 'deletion' ? 'rose' : 'amber'} size="sm" className="uppercase font-mono">
                    {log.action_type}
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-2xs">
                  <span className="text-slate-400">Amount Impacted: <strong className="text-rose-400">₹{log.amount.toLocaleString('en-IN')}</strong></span>
                  <span className="text-slate-400">{new Date(log.created_at).toLocaleString()}</span>
                </div>

                <p className="text-2xs text-slate-300">Authorized by: <span className="text-brand-300">{log.performed_by_name}</span></p>
                <p className="text-2xs text-slate-400">Audit Reason: {log.reason}</p>

                {/* Flag & Call Buttons */}
                <div className="pt-2 border-t border-dark-border flex items-center justify-end gap-2">
                  <Button variant="ghost" size="sm" leftIcon={<Flag className="w-3 h-3 text-rose-400" />}>
                    Flag to CFO
                  </Button>
                  <Button variant="secondary" size="sm" leftIcon={<PhoneCall className="w-3 h-3 text-emerald-400" />}>
                    Call Compliance
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        <Button variant="ghost" size="md" className="w-full" onClick={onClose}>
          Close Financial Audit Log
        </Button>
      </div>
    </Modal>
  );
};
