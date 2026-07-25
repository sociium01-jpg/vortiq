// ─────────────────────────────────────────────────────────────
// Vortiq Internal Ops — Security & System Alerts Center
// Surfaces trial expirations, seat limit overages, & security anomalies
// ─────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { Card, Badge, Button } from '@/design-system';
import { OpsAlert } from './types';
import { ShieldAlert, AlertTriangle, Clock, Users } from 'lucide-react';

export const OpsAlertsCenter: React.FC = () => {
  const [alerts, setAlerts] = useState<OpsAlert[]>([
    {
      id: 'alert-1',
      type: 'trial_expiring',
      severity: 'warning',
      title: 'Trial Expiring Soon',
      message: 'MedLife Diagnostics Pvt Ltd trial period expires in 3 days.',
      client_id: 'client-3',
      client_name: 'MedLife Diagnostics Pvt Ltd',
      created_at: new Date().toISOString(),
    },
    {
      id: 'alert-2',
      type: 'security_anomaly',
      severity: 'danger',
      title: 'Failed Auth Attempt Spike',
      message: 'Repeated failed login attempts detected for admin@starlighttech.com.',
      client_id: 'client-4',
      client_name: 'Starlight Tech Solutions',
      created_at: new Date().toISOString(),
    },
    {
      id: 'alert-3',
      type: 'seat_exceeded',
      severity: 'info',
      title: 'Seat Allocation Threshold (80%)',
      message: 'Reliance Retail Logistics has utilized 42 of 50 allocated seats.',
      client_id: 'client-2',
      client_name: 'Reliance Retail Logistics',
      created_at: new Date().toISOString(),
    },
  ]);

  const handleDismiss = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <Card className="p-5 bg-dark-card border-dark-border space-y-4">
      <div className="flex items-center justify-between border-b border-dark-border pb-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-amber-400" />
          <h2 className="text-sm font-bold text-slate-100 font-display">System & Security Monitoring Telemetry</h2>
        </div>
        <Badge variant="amber" size="sm">
          {alerts.length} Active Telemetry Signals
        </Badge>
      </div>

      <div className="space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-4 rounded-xl border flex items-start justify-between gap-4 font-mono text-xs ${
              alert.severity === 'danger'
                ? 'bg-rose-950/20 border-rose-500/40 text-rose-200'
                : alert.severity === 'warning'
                ? 'bg-amber-950/20 border-amber-500/40 text-amber-200'
                : 'bg-brand-950/20 border-brand-500/40 text-brand-200'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-dark-surface shrink-0 mt-0.5">
                {alert.type === 'trial_expiring' ? (
                  <Clock className="w-4 h-4 text-amber-400" />
                ) : alert.type === 'seat_exceeded' ? (
                  <Users className="w-4 h-4 text-brand-400" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-100">{alert.title}</span>
                  {alert.client_name && (
                    <Badge variant="violet" size="sm">{alert.client_name}</Badge>
                  )}
                </div>
                <p className="text-3xs text-slate-300 mt-1">{alert.message}</p>
              </div>
            </div>

            <Button variant="ghost" size="sm" onClick={() => handleDismiss(alert.id)}>
              Dismiss
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
};
