// ─────────────────────────────────────────────────────────────
// Vortiq Internal Ops — Section 4: Security Monitoring Dashboard
// Aggregated Infrastructure Security Telemetry: Supabase Auth, Rate-Limiting, & Data Vault Exports
// ─────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { Card, Badge, DataTable, Button } from '@/design-system';
import { SecuritySignalAlert } from './types';
import { ShieldAlert, Lock, Database, CheckCircle2, ShieldCheck } from 'lucide-react';

export const OpsSecurityCenter: React.FC = () => {
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  const [alerts, setAlerts] = useState<SecuritySignalAlert[]>([
    {
      id: 'sec-101',
      timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
      severity: 'critical',
      signal_source: 'Supabase Auth',
      alert_title: 'Repeated Failed Login Spike',
      details: '14 consecutive failed authentication attempts detected for email admin@starlighttech.com from IP 185.220.101.4.',
      ip_address: '185.220.101.4',
      actor_email: 'admin@starlighttech.com',
      is_resolved: false,
    },
    {
      id: 'sec-102',
      timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
      severity: 'high',
      signal_source: 'Data Vault Audit Engine',
      alert_title: 'Unusually Large Bulk Data Export Flagged',
      details: 'User Vikram Malhotra exported 8,420 HR Employee & Payroll records in a single CSV operation.',
      ip_address: '49.36.142.18',
      actor_email: 'vikram.m@relianceretail.in',
      is_resolved: false,
    },
    {
      id: 'sec-103',
      timestamp: new Date(Date.now() - 120 * 60000).toISOString(),
      severity: 'medium',
      signal_source: 'Public API Rate Limiter',
      alert_title: 'Endpoint Rate Limit Throttling Triggered',
      details: 'API key vtq_live_99201 exceeded 100 req/min rate limit on /api/v1/leads endpoint. Request throttled.',
      ip_address: '103.21.244.12',
      is_resolved: true,
    },
    {
      id: 'sec-104',
      timestamp: new Date(Date.now() - 360 * 60000).toISOString(),
      severity: 'low',
      signal_source: 'Supabase Auth',
      alert_title: 'New Admin Device Login',
      details: 'First-time login detected from Safari macOS for ops.lead@vortiq.biz.',
      ip_address: '122.172.88.90',
      actor_email: 'ops.lead@vortiq.biz',
      is_resolved: true,
    },
  ]);

  const handleResolveAlert = (id: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, is_resolved: true } : a)));
  };

  const filteredAlerts = alerts.filter((a) => severityFilter === 'all' || a.severity === severityFilter);
  const unresolvedCount = alerts.filter((a) => !a.is_resolved).length;

  return (
    <div className="space-y-6 font-mono text-xs text-slate-100">
      {/* Top Banner */}
      <div className="p-5 bg-dark-card border border-dark-border rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold font-display text-slate-100">Security Monitoring Telemetry</h1>
            <Badge variant="rose" size="sm" className="uppercase font-bold">
              {unresolvedCount} Active Signals
            </Badge>
          </div>
          <p className="text-2xs text-slate-400 mt-1">
            Aggregates real signals from Supabase Auth logs, API Rate Limiters, & Data Vault Audit Engines.
          </p>
        </div>

        {/* Severity Filters */}
        <div className="flex p-1 bg-dark-surface rounded-xl border border-dark-border text-xs font-semibold">
          {['all', 'critical', 'high', 'medium', 'low'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-3 py-1.5 rounded-lg capitalize cursor-pointer transition-all ${
                severityFilter === sev ? 'bg-brand-500 text-dark-bg font-bold shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Security Telemetry KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 bg-dark-card border-dark-border space-y-2">
          <div className="flex items-center justify-between text-2xs text-slate-400 font-semibold uppercase">
            <span>Supabase Auth Anomaly Telemetry</span>
            <div className="p-2 bg-rose-500/10 rounded-lg text-rose-400">
              <Lock className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-extrabold text-rose-400 font-display block">1 Flagged Attack</span>
          <span className="text-3xs text-slate-400">IP 185.220.101.4 under review</span>
        </Card>

        <Card className="p-4 bg-dark-card border-dark-border space-y-2">
          <div className="flex items-center justify-between text-2xs text-slate-400 font-semibold uppercase">
            <span>Data Vault Bulk Export Engine</span>
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-extrabold text-amber-400 font-display block">1 Large Export</span>
          <span className="text-3xs text-slate-400">Over 5,000 rows exported by Reliance Admin</span>
        </Card>

        <Card className="p-4 bg-dark-card border-dark-border space-y-2">
          <div className="flex items-center justify-between text-2xs text-slate-400 font-semibold uppercase">
            <span>API Throttling & Rate Limiters</span>
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-extrabold text-emerald-400 font-display block">100% Rate Shielded</span>
          <span className="text-3xs text-slate-400">100 req/min endpoint limit active</span>
        </Card>
      </div>

      {/* Security Signals Data Table */}
      <Card className="p-5 bg-dark-card border-dark-border space-y-4">
        <div className="flex items-center justify-between border-b border-dark-border pb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100 font-display flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            Live Infrastructure Security Signal Feed
          </h3>
        </div>

        <DataTable
          data={filteredAlerts}
          keyExtractor={(a) => a.id}
          columns={[
            {
              key: 'timestamp',
              header: 'Timestamp',
              render: (a) => new Date(a.timestamp).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
            },
            {
              key: 'severity',
              header: 'Severity',
              render: (a) => (
                <Badge
                  variant={a.severity === 'critical' || a.severity === 'high' ? 'rose' : a.severity === 'medium' ? 'amber' : 'emerald'}
                  size="sm"
                  className="uppercase font-bold"
                >
                  {a.severity}
                </Badge>
              ),
            },
            {
              key: 'signal_source',
              header: 'Signal Source',
              render: (a) => <Badge variant="violet" size="sm">{a.signal_source}</Badge>,
            },
            {
              key: 'alert_title',
              header: 'Alert Title & Details',
              render: (a) => (
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-100 font-display">{a.alert_title}</div>
                  <div className="text-3xs text-slate-400">{a.details}</div>
                </div>
              ),
            },
            {
              key: 'ip_address',
              header: 'IP Address',
              render: (a) => a.ip_address || '—',
            },
            {
              key: 'status',
              header: 'Status & Action',
              render: (a) => (
                <div>
                  {a.is_resolved ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Resolved
                    </span>
                  ) : (
                    <Button variant="outline" size="sm" onClick={() => handleResolveAlert(a.id)}>
                      Acknowledge
                    </Button>
                  )}
                </div>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
};
