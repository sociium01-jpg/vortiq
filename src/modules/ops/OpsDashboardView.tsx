// ─────────────────────────────────────────────────────────────
// Vortiq Internal Ops — Section 1: Ops Executive Dashboard
// KPI Cards for Active Sessions, Pending Activations, Renewals, & MRR Trends
// ─────────────────────────────────────────────────────────────

import React from 'react';
import { Card, Button, Badge } from '@/design-system';
import { OpsClientOrg } from './types';
import {
  Users,
  UserCheck,
  Clock,
  RefreshCw,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  Activity,
  IndianRupee,
} from 'lucide-react';

interface OpsDashboardViewProps {
  clients: OpsClientOrg[];
  onNavigateToClients: (filterStatus?: string) => void;
}

export const OpsDashboardView: React.FC<OpsDashboardViewProps> = ({
  clients,
  onNavigateToClients,
}) => {
  const activeCount = clients.filter((c) => c.subscription_status === 'active').length;
  const trialCount = clients.filter((c) => c.subscription_status === 'trial').length;
  const renewalDueCount = clients.filter((c) => c.subscription_status === 'renewal_due' || c.subscription_status === 'trial').length;
  const totalMrr = clients.reduce((acc, c) => acc + (c.monthly_recurring_revenue || 0), 0);

  return (
    <div className="space-y-6 font-mono text-xs text-slate-100">
      {/* Top Banner */}
      <div className="p-5 bg-dark-card border border-dark-border rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold font-display text-slate-100">Vortiq Operational Intelligence</h1>
            <Badge variant="emerald" size="sm" className="uppercase font-bold">Live Production Realm</Badge>
          </div>
          <p className="text-2xs text-slate-400 mt-1">
            Superadmin Monitoring • Client Lifecycle • Platform Revenue • Security Signal Telemetry
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Users className="w-3.5 h-3.5" />}
            onClick={() => onNavigateToClients('all')}
          >
            View Full Client Directory
          </Button>
        </div>
      </div>

      {/* Section 1 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card
          className="p-4 bg-dark-card border-dark-border space-y-2 hover:border-brand-500/40 transition-all cursor-pointer"
          onClick={() => onNavigateToClients('active')}
        >
          <div className="flex items-center justify-between text-2xs text-slate-400 font-semibold uppercase">
            <span>Active Sessions</span>
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-extrabold text-slate-100 font-display block">14 Orgs</span>
            <span className="text-3xs text-emerald-400 block mt-0.5">Currently Signed In</span>
          </div>
        </Card>

        <Card
          className="p-4 bg-dark-card border-dark-border space-y-2 hover:border-brand-500/40 transition-all cursor-pointer"
          onClick={() => onNavigateToClients('trial')}
        >
          <div className="flex items-center justify-between text-2xs text-slate-400 font-semibold uppercase">
            <span>Pending Provisioning</span>
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-extrabold text-amber-400 font-display block">{trialCount} Orgs</span>
            <span className="text-3xs text-slate-400 block mt-0.5">Trial Setup Required</span>
          </div>
        </Card>

        <Card
          className="p-4 bg-dark-card border-dark-border space-y-2 hover:border-brand-500/40 transition-all cursor-pointer"
          onClick={() => onNavigateToClients('active')}
        >
          <div className="flex items-center justify-between text-2xs text-slate-400 font-semibold uppercase">
            <span>Recent Activations</span>
            <div className="p-2 bg-brand-500/10 rounded-lg text-brand-400">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-extrabold text-slate-100 font-display block">{activeCount} Orgs</span>
            <span className="text-3xs text-slate-400 block mt-0.5">Activated Last 30 Days</span>
          </div>
        </Card>

        <Card
          className="p-4 bg-dark-card border-dark-border space-y-2 hover:border-brand-500/40 transition-all cursor-pointer"
          onClick={() => onNavigateToClients('renewal_due')}
        >
          <div className="flex items-center justify-between text-2xs text-slate-400 font-semibold uppercase">
            <span>Upcoming Renewals</span>
            <div className="p-2 bg-rose-500/10 rounded-lg text-rose-400">
              <RefreshCw className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-extrabold text-rose-400 font-display block">{renewalDueCount} Orgs</span>
            <span className="text-3xs text-slate-400 block mt-0.5">Due Next 7–30 Days</span>
          </div>
        </Card>

        <Card
          className="p-4 bg-dark-card border-dark-border space-y-2 hover:border-emerald-500/40 transition-all cursor-pointer"
          onClick={() => onNavigateToClients('all')}
        >
          <div className="flex items-center justify-between text-2xs text-slate-400 font-semibold uppercase">
            <span>Monthly Revenue</span>
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-extrabold text-emerald-400 font-display block">₹{(totalMrr / 1000).toFixed(0)}k</span>
            <span className="text-3xs text-slate-400 block mt-0.5">Total Active MRR</span>
          </div>
        </Card>
      </div>

      {/* Signup Trend & Operational Feed Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Bar Visual */}
        <Card className="lg:col-span-2 p-5 bg-dark-card border-dark-border space-y-4">
          <div className="flex items-center justify-between border-b border-dark-border pb-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100 font-display flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                New Client Signup & Activation Trend
              </h3>
              <p className="text-3xs text-slate-400 mt-0.5">Monthly platform onboardings across Starter, Pro, & Enterprise tiers</p>
            </div>
            <Badge variant="emerald" size="sm">+28% Growth YoY</Badge>
          </div>

          <div className="h-44 flex items-end justify-between gap-3 pt-4 px-2">
            {[
              { month: 'Feb', signups: 4, mrr: 120000 },
              { month: 'Mar', signups: 6, mrr: 180000 },
              { month: 'Apr', signups: 8, mrr: 240000 },
              { month: 'May', signups: 11, mrr: 330000 },
              { month: 'Jun', signups: 15, mrr: 450000 },
              { month: 'Jul', signups: 19, mrr: 580000 },
            ].map((bar) => (
              <div key={bar.month} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                <div className="text-3xs text-slate-400 font-bold group-hover:text-emerald-400 transition-colors">
                  {bar.signups} orgs
                </div>
                <div className="w-full bg-dark-surface rounded-t-lg overflow-hidden flex flex-col justify-end h-32 p-1">
                  <div
                    style={{ height: `${(bar.signups / 20) * 100}%` }}
                    className="w-full bg-gradient-to-t from-emerald-600 to-teal-400 rounded-md transition-all group-hover:from-emerald-500 group-hover:to-teal-300"
                  />
                </div>
                <span className="text-3xs text-slate-400 uppercase font-semibold">{bar.month}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Operational Quick Actions */}
        <Card className="p-5 bg-dark-card border-dark-border space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100 font-display flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-400" />
              Superadmin Directives
            </h3>
            <p className="text-3xs text-slate-400">Quick management triggers for client accounts and revenue logging.</p>

            <div className="space-y-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-between"
                onClick={() => onNavigateToClients('trial')}
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Provision New Client Space
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="w-full justify-between"
                onClick={() => onNavigateToClients('all')}
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Record Manual Offline Payment
              </Button>
            </div>
          </div>

          <div className="p-3 bg-dark-surface rounded-xl border border-dark-border text-3xs text-slate-400">
            <span className="text-emerald-400 font-bold block mb-0.5">System Status: Healthy</span>
            <span>All Cloud Run services running on region asia-south1.</span>
          </div>
        </Card>
      </div>
    </div>
  );
};
