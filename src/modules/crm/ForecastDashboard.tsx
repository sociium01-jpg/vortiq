// ─────────────────────────────────────────────────────────────
// Vortiq Weighted Revenue Forecasting Dashboard
// Stage Win Probabilities (10% to 100%) and Monthly/Quarterly Revenue Projections
// ─────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { Card, Badge, Select } from '@/design-system';
import { CrmLead, CrmPipelineStage } from './types';
import { TrendingUp, Target, DollarSign, BarChart3, PieChart } from 'lucide-react';

export interface ForecastDashboardProps {
  leads: CrmLead[];
  stages: CrmPipelineStage[];
}

export const ForecastDashboard: React.FC<ForecastDashboardProps> = ({ leads, stages }) => {
  const [period, setPeriod] = useState<'this_month' | 'this_quarter' | 'this_year'>('this_month');

  // Probability map for stages
  const stageProbabilities: Record<string, number> = {
    new: 10,
    contacted: 25,
    qualified: 50,
    won: 100,
    lost: 0,
  };

  const getLeadStage = (l: CrmLead): string => l.stage || l.stage_id || 'new';

  // Compute metrics
  const totalPipelineValue = leads.reduce((acc, l) => acc + l.estimated_value, 0);

  const totalWeightedValue = leads.reduce((acc, l) => {
    const stg = getLeadStage(l);
    const prob = stageProbabilities[stg] || 20;
    return acc + (l.estimated_value * prob) / 100;
  }, 0);

  const wonDealsValue = leads.filter((l) => getLeadStage(l) === 'won').reduce((acc, l) => acc + l.estimated_value, 0);
  const openDealsCount = leads.filter((l) => {
    const stg = getLeadStage(l);
    return stg !== 'won' && stg !== 'lost';
  }).length;

  const quotaTarget = 2500000; // ₹25,00,000 target
  const quotaAttainment = Math.min(100, Math.round((wonDealsValue / quotaTarget) * 100));

  const formatINR = (val: number) => `₹${val.toLocaleString('en-IN')}`;

  return (
    <div className="space-y-6">
      {/* Top Banner & Target Attainment Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Pipeline Value */}
        <Card className="p-4 bg-dark-card border-dark-border hover:border-brand-500/40">
          <div className="flex items-center justify-between">
            <span className="text-2xs font-semibold uppercase text-slate-400 tracking-wider">Total Pipeline Value</span>
            <DollarSign className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black font-mono text-slate-100">{formatINR(totalPipelineValue)}</span>
            <Badge variant="blue" size="sm">{leads.length} Deals</Badge>
          </div>
          <p className="mt-2 text-2xs text-slate-400 font-mono">Gross unweighted value</p>
        </Card>

        {/* Weighted Pipeline Revenue */}
        <Card className="p-4 bg-dark-card border-dark-border hover:border-emerald-500/40">
          <div className="flex items-center justify-between">
            <span className="text-2xs font-semibold uppercase text-emerald-400 tracking-wider">Weighted Forecast</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black font-mono text-emerald-400">{formatINR(Math.round(totalWeightedValue))}</span>
            <Badge variant="emerald" size="sm">Prob Weighted</Badge>
          </div>
          <p className="mt-2 text-2xs text-slate-400 font-mono">Value × Stage Win Probability %</p>
        </Card>

        {/* Won Revenue & Quota */}
        <Card className="p-4 bg-dark-card border-dark-border hover:border-brand-500/40">
          <div className="flex items-center justify-between">
            <span className="text-2xs font-semibold uppercase text-amber-400 tracking-wider">Closed Won Revenue</span>
            <Target className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black font-mono text-amber-300">{formatINR(wonDealsValue)}</span>
            <Badge variant="amber" size="sm">{quotaAttainment}% Target</Badge>
          </div>
          <p className="mt-2 text-2xs text-slate-400 font-mono">Quota: {formatINR(quotaTarget)}</p>
        </Card>

        {/* Open Deals Count */}
        <Card className="p-4 bg-dark-card border-dark-border hover:border-brand-500/40">
          <div className="flex items-center justify-between">
            <span className="text-2xs font-semibold uppercase text-violet-400 tracking-wider">Active Open Deals</span>
            <BarChart3 className="w-4 h-4 text-violet-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black font-mono text-slate-100">{openDealsCount}</span>
            <Badge variant="violet" size="sm">In Progress</Badge>
          </div>
          <p className="mt-2 text-2xs text-slate-400 font-mono">Excludes Won & Lost deals</p>
        </Card>
      </div>

      {/* Stage Breakdown & Probability Table */}
      <Card className="p-5 bg-dark-card border-dark-border space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 font-display flex items-center gap-2">
              <PieChart className="w-4 h-4 text-brand-400" />
              Stage Weighted Pipeline Breakdown
            </h3>
            <p className="text-2xs text-slate-400 mt-0.5">Calculates expected revenue using deal stage win probabilities</p>
          </div>

          <Select
            value={period}
            onChange={(e) => setPeriod(e.target.value as any)}
            options={[
              { value: 'this_month', label: 'This Month (Q3)' },
              { value: 'this_quarter', label: 'This Quarter' },
              { value: 'this_year', label: 'FY 2026-27' },
            ]}
            className="text-xs py-1 w-40"
          />
        </div>

        <div className="space-y-3">
          {stages.map((stg) => {
            const stageLeads = leads.filter((l) => getLeadStage(l) === stg.id);
            const stageGross = stageLeads.reduce((acc, l) => acc + l.estimated_value, 0);
            const prob = stageProbabilities[stg.id] || 0;
            const stageWeighted = (stageGross * prob) / 100;
            const percentOfTotal = totalPipelineValue > 0 ? Math.round((stageGross / totalPipelineValue) * 100) : 0;

            return (
              <div key={stg.id} className="p-3 bg-dark-surface/60 rounded-xl border border-dark-border space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stg.color }} />
                    <span className="font-bold text-slate-200">{stg.name}</span>
                    <Badge variant="slate" size="sm">{stageLeads.length} deals</Badge>
                  </div>
                  <div className="flex items-center gap-4 font-mono">
                    <span className="text-slate-400">Win Prob: <strong className="text-amber-400">{prob}%</strong></span>
                    <span className="text-slate-300">Gross: {formatINR(stageGross)}</span>
                    <span className="font-bold text-emerald-400">Weighted: {formatINR(Math.round(stageWeighted))}</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-dark-bg h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${percentOfTotal}%`, backgroundColor: stg.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
