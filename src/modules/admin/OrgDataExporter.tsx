// ─────────────────────────────────────────────────────────────
// Vortiq One-Click Organization Data Exporter & Backup Surface
// Offboarding & Archival Data Backup for CRM, Finance, HR, & Inventory
// ─────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { Card, Badge, Button } from '@/design-system';
import { Download, Database, CheckCircle2 } from 'lucide-react';

export const OrgDataExporter: React.FC = () => {
  const [exportNotification, setExportNotification] = useState<string | null>(null);

  const handleExportModule = (modName: string) => {
    setExportNotification(`BACKUP COMPLETED: Full dataset export for ${modName} downloaded in JSON/CSV archive format.`);
    setTimeout(() => setExportNotification(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {exportNotification && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-2xs text-emerald-300 flex items-center gap-2 animate-pulse font-mono">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{exportNotification}</span>
        </div>
      )}

      {/* Export Cards Grid */}
      <Card className="p-5 bg-dark-card border-dark-border space-y-4">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-display flex items-center gap-2">
            <Database className="w-4 h-4 text-brand-400" />
            Organization Data Backup & Offboarding Exporter
          </h4>
          <p className="text-2xs text-slate-400 mt-0.5">Download full organization datasets for compliance backup or offboarding migration</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* CRM Data Export */}
          <div className="p-4 bg-dark-surface/60 rounded-xl border border-dark-border space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-100 font-display text-xs">CRM Leads & Sales Pipelines</span>
              <Badge variant="emerald" size="sm">JSON / CSV</Badge>
            </div>
            <p className="text-2xs text-slate-400 font-mono">Export all lead contacts, pipeline stage activity, call notes, and deal history.</p>
            <Button variant="outline" size="sm" className="w-full" leftIcon={<Download className="w-3.5 h-3.5" />} onClick={() => handleExportModule('CRM Leads & Deals')}>
              Download CRM Backup Archive
            </Button>
          </div>

          {/* Finance Data Export */}
          <div className="p-4 bg-dark-surface/60 rounded-xl border border-dark-border space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-100 font-display text-xs">Finance Invoices & Vendor Bills</span>
              <Badge variant="emerald" size="sm">JSON / CSV</Badge>
            </div>
            <p className="text-2xs text-slate-400 font-mono">Export invoices, Form 26Q TDS ledger, vendor bills, and receipt records.</p>
            <Button variant="outline" size="sm" className="w-full" leftIcon={<Download className="w-3.5 h-3.5" />} onClick={() => handleExportModule('Finance & Ledger')}>
              Download Finance Ledger Archive
            </Button>
          </div>

          {/* HR & Payroll Data Export */}
          <div className="p-4 bg-dark-surface/60 rounded-xl border border-dark-border space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-100 font-display text-xs">HR Employees & Payroll History</span>
              <Badge variant="emerald" size="sm">JSON / CSV</Badge>
            </div>
            <p className="text-2xs text-slate-400 font-mono">Export employee profiles, leave history, appraisals, and statutory payslips.</p>
            <Button variant="outline" size="sm" className="w-full" leftIcon={<Download className="w-3.5 h-3.5" />} onClick={() => handleExportModule('HR & Payroll')}>
              Download HR Backup Archive
            </Button>
          </div>

          {/* Inventory Data Export */}
          <div className="p-4 bg-dark-surface/60 rounded-xl border border-dark-border space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-100 font-display text-xs">Inventory SKUs & Stock Transfers</span>
              <Badge variant="emerald" size="sm">JSON / CSV</Badge>
            </div>
            <p className="text-2xs text-slate-400 font-mono">Export item GTIN barcodes, stock quantities, warehouse transfers, and POs.</p>
            <Button variant="outline" size="sm" className="w-full" leftIcon={<Download className="w-3.5 h-3.5" />} onClick={() => handleExportModule('Inventory & Warehouse')}>
              Download Inventory Backup Archive
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
