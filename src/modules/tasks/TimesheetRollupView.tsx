// ─────────────────────────────────────────────────────────────
// Vortiq Timesheet Rollup Dashboard (Zoho Projects Parity)
// Project & User timesheet rollup table with billable vs non-billable hours
// ─────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { Card, Badge, Button } from '@/design-system';
import { TaskTimeLog, SEED_TIME_LOGS } from './types';
import { Clock, DollarSign, Calendar, Plus, FileSpreadsheet } from 'lucide-react';

export const TimesheetRollupView: React.FC = () => {
  const [timeLogs, setTimeLogs] = useState<TaskTimeLog[]>(SEED_TIME_LOGS);

  const totalLoggedHours = timeLogs.reduce((acc, l) => acc + l.hours, 0);
  const billableHours = timeLogs.filter((l) => l.is_billable).reduce((acc, l) => acc + l.hours, 0);
  const billableRatio = totalLoggedHours > 0 ? Math.round((billableHours / totalLoggedHours) * 100) : 0;

  const handleQuickLogTime = () => {
    const newLog: TaskTimeLog = {
      id: `tl-${Date.now()}`,
      tenant_id: 'tenant-prod-001',
      task_id: 'task-101',
      task_title: 'Design GST Form 26Q Automated Ledger Component',
      user_id: 'u-1',
      user_name: 'Alex Vance',
      hours: 2.5,
      notes: 'Logged engineering development time',
      is_billable: true,
      logged_date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(),
    };

    setTimeLogs([newLog, ...timeLogs]);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Rollup Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 bg-dark-card border-dark-border">
          <div className="flex items-center justify-between">
            <span className="text-2xs font-semibold uppercase text-slate-400 tracking-wider">Total Hours Logged</span>
            <Clock className="w-4 h-4 text-brand-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black font-mono text-slate-100">{totalLoggedHours.toFixed(1)} hrs</span>
            <Badge variant="violet" size="sm">{timeLogs.length} Entries</Badge>
          </div>
          <p className="text-2xs text-slate-400 font-mono mt-1">Total team project time</p>
        </Card>

        <Card className="p-4 bg-dark-card border-dark-border">
          <div className="flex items-center justify-between">
            <span className="text-2xs font-semibold uppercase text-emerald-400 tracking-wider">Billable Hours</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black font-mono text-emerald-400">{billableHours.toFixed(1)} hrs</span>
            <Badge variant="emerald" size="sm">{billableRatio}% Billable</Badge>
          </div>
          <p className="text-2xs text-slate-400 font-mono mt-1">Ready for Invoicing export</p>
        </Card>

        <Card className="p-4 bg-dark-card border-dark-border">
          <div className="flex items-center justify-between">
            <span className="text-2xs font-semibold uppercase text-amber-400 tracking-wider">Non-Billable Time</span>
            <Calendar className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black font-mono text-amber-300">
              {(totalLoggedHours - billableHours).toFixed(1)} hrs
            </span>
            <Badge variant="slate" size="sm">Internal Ops</Badge>
          </div>
          <p className="text-2xs text-slate-400 font-mono mt-1">Internal meetings & maintenance</p>
        </Card>
      </div>

      {/* Timesheet Summary Table */}
      <Card className="p-5 bg-dark-card border-dark-border space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-display flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              Timesheet Rollup Entries ({timeLogs.length})
            </h4>
            <p className="text-2xs text-slate-400 mt-0.5">Detailed task time log breakdown per team member</p>
          </div>

          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={handleQuickLogTime}
          >
            Log Time Entry (2.5h)
          </Button>
        </div>

        <div className="space-y-2">
          {timeLogs.map((log) => (
            <div key={log.id} className="p-3 bg-dark-surface/60 rounded-xl border border-dark-border flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-200 font-display">{log.task_title}</span>
                  <Badge variant={log.is_billable ? 'emerald' : 'slate'} size="sm">
                    {log.is_billable ? 'Billable' : 'Non-billable'}
                  </Badge>
                </div>
                <p className="text-2xs text-slate-400 font-mono">
                  Logged by: {log.user_name} • Date: {log.logged_date} • Notes: {log.notes}
                </p>
              </div>

              <div className="text-right">
                <span className="text-base font-black font-mono text-brand-400">{log.hours.toFixed(1)} hrs</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
