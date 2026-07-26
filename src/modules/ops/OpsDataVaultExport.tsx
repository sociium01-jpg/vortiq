// ─────────────────────────────────────────────────────────────
// Section 8: Settings — Client Data Vault (Ops Export & Audit)
// ─────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { Card, Button, Badge } from '@/design-system';
import { OpsVaultExportLog } from './types';
import { Database, Download, FileSpreadsheet, FileText } from 'lucide-react';

const SEED_EXPORT_LOGS: OpsVaultExportLog[] = [
  {
    id: 'oxl-101',
    exported_by_email: 'alex.vance@vortiq.biz',
    format: 'xlsx',
    data_scope: 'All Client Organizations & MRR Financials',
    row_count: 4,
    timestamp: '2026-07-26 10:15',
  },
  {
    id: 'oxl-102',
    exported_by_email: 'priya.sharma@vortiq.biz',
    format: 'pdf',
    data_scope: 'Vortiq Q2 Revenue & TDS Report',
    row_count: 12,
    timestamp: '2026-07-25 16:45',
  },
];

export const OpsDataVaultExport: React.FC = () => {
  const [logs, setLogs] = useState<OpsVaultExportLog[]>(SEED_EXPORT_LOGS);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = (format: 'xlsx' | 'pdf' | 'csv') => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      const newLog: OpsVaultExportLog = {
        id: `oxl-${Date.now()}`,
        exported_by_email: 'alex.vance@vortiq.biz',
        format,
        data_scope: 'Full Client Master Database + Billing History',
        row_count: 4,
        timestamp: 'Just now',
      };
      setLogs([newLog, ...logs]);

      // Mock file download trigger
      const dummyContent = `Vortiq Ops Master Export\nFormat: ${format.toUpperCase()}\nExported At: ${new Date().toISOString()}\n`;
      const blob = new Blob([dummyContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `vortiq_ops_master_export_${Date.now()}.${format}`;
      link.click();
      URL.revokeObjectURL(url);
    }, 800);
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-dark-card border border-dark-border rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-100 font-display">Client Data Vault — Superadmin Export</h2>
            <Badge variant="rose" size="sm">Owner Access Only</Badge>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Bulk export all client orgs, billing ledgers, and platform invoices. Every export is permanently logged.
          </p>
        </div>
      </div>

      {/* Export Action Card */}
      <Card className="p-6 space-y-4 bg-dark-card border-dark-border">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-brand-500/10 border border-brand-500/30 rounded-xl text-brand-400">
            <Database className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-100">Export Master Ops Database</h3>
            <p className="text-xs text-slate-400 font-mono">
              Includes Client Directory, Subscription Status, MRR Revenues, Platform Invoices, and Security Audit Logs.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <Button
            variant="primary"
            size="sm"
            isLoading={isExporting}
            leftIcon={<FileSpreadsheet className="w-4 h-4" />}
            onClick={() => handleExport('xlsx')}
          >
            Export Excel (.xlsx)
          </Button>

          <Button
            variant="outline"
            size="sm"
            isLoading={isExporting}
            leftIcon={<FileText className="w-4 h-4 text-rose-400" />}
            onClick={() => handleExport('pdf')}
          >
            Export PDF Report
          </Button>

          <Button
            variant="ghost"
            size="sm"
            isLoading={isExporting}
            leftIcon={<Download className="w-4 h-4 text-slate-400" />}
            onClick={() => handleExport('csv')}
          >
            Export CSV
          </Button>
        </div>
      </Card>

      {/* Export Audit Log Table */}
      <Card className="p-4 space-y-3 bg-dark-card border-dark-border">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-xs font-bold text-slate-200 uppercase font-mono tracking-wider">
            Export Audit History (`ops_export_logs`)
          </h3>
          <span className="text-2xs text-slate-400 font-mono">{logs.length} Exports Logged</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-dark-border text-2xs uppercase font-mono text-slate-400 bg-dark-surface/50">
                <th className="py-2.5 px-4">Exported By</th>
                <th className="py-2.5 px-4">Format</th>
                <th className="py-2.5 px-4">Data Scope</th>
                <th className="py-2.5 px-4">Record Count</th>
                <th className="py-2.5 px-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border text-xs font-mono">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/20">
                  <td className="py-3 px-4 font-bold text-slate-200">{log.exported_by_email}</td>
                  <td className="py-3 px-4 uppercase text-brand-400 font-bold">{log.format}</td>
                  <td className="py-3 px-4 text-slate-300">{log.data_scope}</td>
                  <td className="py-3 px-4 text-slate-300">{log.row_count} rows</td>
                  <td className="py-3 px-4 text-slate-400">{log.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
