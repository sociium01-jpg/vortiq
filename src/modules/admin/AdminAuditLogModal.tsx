// ─────────────────────────────────────────────────────────────
// Vortiq Administrative Security Audit Log Viewer
// Master Directive: Flag and Call triggers on administrative updates
// ─────────────────────────────────────────────────────────────

import React from 'react';
import { Modal, Button, Badge } from '@/design-system';
import { AdminAuditLog } from './types';
import { Flag, PhoneCall } from 'lucide-react';

export interface AdminAuditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: AdminAuditLog[];
}

export const AdminAuditLogModal: React.FC<AdminAuditLogModalProps> = ({ isOpen, onClose, logs }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Administrative Security & RBAC Audit Logs"
      maxWidth="md"
    >
      <div className="space-y-4 font-mono text-xs">
        <p className="text-xs text-slate-400 font-sans">
          Immutable DB-level administrative audit log recording all role modifications, API key creations, user invitations, and permission changes.
        </p>

        <div className="space-y-3 max-h-80 overflow-y-auto">
          {logs.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">No administrative audit records found.</div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="p-3.5 bg-dark-surface/60 rounded-xl border border-dark-border space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-100 font-display">{log.description}</span>
                  <Badge variant="violet" size="sm" className="uppercase font-mono">
                    {log.action_type}
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-2xs">
                  <span className="text-slate-400">Performed by: <strong className="text-brand-300">{log.performed_by_name}</strong></span>
                  <span className="text-slate-400">{new Date(log.created_at).toLocaleString()}</span>
                </div>

                {/* Flag & Call Action Buttons */}
                <div className="pt-2 border-t border-dark-border flex items-center justify-end gap-2">
                  <Button variant="ghost" size="sm" leftIcon={<Flag className="w-3 h-3 text-rose-400" />}>
                    Flag Security Event
                  </Button>
                  <Button variant="secondary" size="sm" leftIcon={<PhoneCall className="w-3 h-3 text-emerald-400" />}>
                    Call Owner
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        <Button variant="ghost" size="md" className="w-full" onClick={onClose}>
          Close Administrative Audit Viewer
        </Button>
      </div>
    </Modal>
  );
};
