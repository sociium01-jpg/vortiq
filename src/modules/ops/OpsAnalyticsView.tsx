// ─────────────────────────────────────────────────────────────
// Section 6: Analytics — Churn, MRR Growth, & Plan Distribution
// ─────────────────────────────────────────────────────────────

import React from 'react';
import { Card, Badge } from '@/design-system';
import { TrendingUp, Users, PieChart, Activity } from 'lucide-react';

export const OpsAnalyticsView: React.FC = () => {
  return (
    <div className="space-y-6 font-mono text-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-dark-card border border-dark-border rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-100 font-display">Platform Business Analytics</h2>
            <Badge variant="emerald" size="sm">Real-time Metrics</Badge>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            SaaS Growth Metrics: Churn Rate, MRR Cohorts, and Plan Distribution across all active clients.
          </p>
        </div>
      </div>

      {/* Analytics KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono">
        <Card className="p-4 space-y-1 bg-dark-card border-emerald-500/20">
          <div className="flex items-center justify-between text-2xs text-slate-400">
            <span>MRR Growth (MoM)</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-slate-100">+18.4%</div>
          <div className="text-3xs text-emerald-400">₹1,24,997 net addition</div>
        </Card>

        <Card className="p-4 space-y-1 bg-dark-card border-blue-500/20">
          <div className="flex items-center justify-between text-2xs text-slate-400">
            <span>Net Logo Churn Rate</span>
            <Activity className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl font-bold text-slate-100">1.2%</div>
          <div className="text-3xs text-slate-400">Target &lt; 2.5%</div>
        </Card>

        <Card className="p-4 space-y-1 bg-dark-card border-amber-500/20">
          <div className="flex items-center justify-between text-2xs text-slate-400">
            <span>Average Revenue / User (ARPU)</span>
            <Users className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-slate-100">₹31,249</div>
          <div className="text-3xs text-slate-400">Per Organization / Mo</div>
        </Card>

        <Card className="p-4 space-y-1 bg-dark-card border-violet-500/20">
          <div className="flex items-center justify-between text-2xs text-slate-400">
            <span>Trial-to-Paid Conversion</span>
            <PieChart className="w-4 h-4 text-violet-400" />
          </div>
          <div className="text-xl font-bold text-slate-100">68.5%</div>
          <div className="text-3xs text-emerald-400">+4.2% vs last month</div>
        </Card>
      </div>

      {/* Plan Distribution & Cohorts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-mono">
        <Card className="p-5 space-y-4 bg-dark-card border-dark-border">
          <h3 className="text-sm font-bold text-slate-100">Plan Tier Distribution (%)</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">Enterprise Tier (₹49,999/mo)</span>
                <span className="font-bold text-emerald-400">50% (2 Orgs)</span>
              </div>
              <div className="w-full bg-dark-surface h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-1/2"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">Pro Tier (₹24,999/mo)</span>
                <span className="font-bold text-blue-400">50% (2 Orgs)</span>
              </div>
              <div className="w-full bg-dark-surface h-2 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full w-1/2"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">Starter Tier (₹9,999/mo)</span>
                <span className="font-bold text-slate-500">0%</span>
              </div>
              <div className="w-full bg-dark-surface h-2 rounded-full overflow-hidden">
                <div className="bg-slate-600 h-full w-0"></div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-5 space-y-4 bg-dark-card border-dark-border">
          <h3 className="text-sm font-bold text-slate-100">Client Retention Cohort (Q1-Q3 2026)</h3>
          <div className="p-4 bg-dark-surface rounded-xl border border-dark-border space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Jan 2026 Cohort:</span>
              <span className="font-bold text-slate-200">100% Retained (1/1)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Feb 2026 Cohort:</span>
              <span className="font-bold text-slate-200">100% Retained (1/1)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Mar 2026 Cohort:</span>
              <span className="font-bold text-amber-400">0% (Suspended for non-payment)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Jul 2026 Cohort:</span>
              <span className="font-bold text-blue-400">100% Active Trial (1/1)</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
