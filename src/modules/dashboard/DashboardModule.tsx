// ─────────────────────────────────────────────────────────────
// Vortiq Executive Operational Dashboard
// Features Live Data Charts (Weekly Trend & Stage Donut) and Animated Count-Up Numbers
// Minimal Light-Theme Palette (Gold, Teal, Neutral Grays)
// ─────────────────────────────────────────────────────────────

import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from '@/design-system';
import { useAuth } from '@/auth/AuthContext';
import {
  Users,
  IndianRupee,
  Package,
  UserCheck,
  ArrowRight,
  Plus,
  TrendingUp,
  PieChart,
  Sparkles,
} from 'lucide-react';

interface DashboardModuleProps {
  onNavigate: (tab: any) => void;
}

// Custom hook for animated count-up numbers with prefers-reduced-motion support
function useCountUp(target: number, durationMs: number = 1000): number {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setCount(target);
      return;
    }

    let startTimestamp: number | null = null;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / durationMs, 1);
      // Ease-out quad formula
      const easedProgress = 1 - (1 - progress) * (1 - progress);
      setCount(Math.floor(easedProgress * target));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setCount(target);
      }
    };

    animationFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId);
  }, [target, durationMs]);

  return count;
}

export const DashboardModule: React.FC<DashboardModuleProps> = ({ onNavigate }) => {
  const { user, tenant } = useAuth();

  // Animated KPI numbers
  const pipelineValue = useCountUp(8750000);
  const activeDeals = useCountUp(42);
  const monthlyInvoices = useCountUp(1840000);
  const totalEmployees = useCountUp(28);

  // Weekly Trend Dataset for Bar/Area Visual
  const weeklyTrends = [
    { week: 'Wk 1', deals: 8, revenue: 1200000 },
    { week: 'Wk 2', deals: 12, revenue: 1850000 },
    { week: 'Wk 3', deals: 15, revenue: 2300000 },
    { week: 'Wk 4', deals: 19, revenue: 3400000 },
  ];

  // Stage Breakdown for Donut Visual
  const stageBreakdown = [
    { stage: 'Qualified', count: 14, percentage: 35, color: '#127A69' },
    { stage: 'Proposal', count: 10, percentage: 25, color: '#B8791F' },
    { stage: 'Contacted', count: 8, percentage: 20, color: '#3B82F6' },
    { stage: 'Won', count: 6, percentage: 15, color: '#10B981' },
    { stage: 'New', count: 4, percentage: 5, color: '#64748B' },
  ];

  return (
    <div className="space-y-6 font-sans text-slate-900">
      {/* Top Welcome Header */}
      <div className="p-6 bg-white border border-[#E3E3DF] rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 font-display tracking-tight">
              Welcome back, {user?.full_name || 'Alex Vance'} 👋
            </h1>
            <Badge variant="emerald" size="sm" className="font-mono font-bold">
              {tenant?.org_code || 'ORG-9901-VTQ'}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 font-mono mt-1">
            {tenant?.name || 'Vortiq Enterprise'} • Executive Operational Workspace
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => onNavigate('crm')}
          >
            Add New Lead
          </Button>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<IndianRupee className="w-3.5 h-3.5" />}
            onClick={() => onNavigate('finance')}
          >
            Create Invoice
          </Button>
        </div>
      </div>

      {/* Top 4 Primary KPI Summary Cards with Animated Numbers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
        <Card
          className="p-4 bg-white border-[#E3E3DF] space-y-2 hover:border-[#B8791F]/50 transition-all cursor-pointer shadow-sm"
          onClick={() => onNavigate('crm')}
        >
          <div className="flex items-center justify-between">
            <span className="text-2xs text-slate-500 font-semibold uppercase tracking-wider">Active Sales Pipeline</span>
            <div className="p-2 bg-[#127A69]/10 rounded-lg text-[#127A69]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-extrabold text-slate-900 font-display block">
              ₹{pipelineValue.toLocaleString('en-IN')}
            </span>
            <span className="text-3xs text-[#127A69] block mt-0.5 font-bold">
              {activeDeals} Deals Active in Stage
            </span>
          </div>
        </Card>

        <Card
          className="p-4 bg-white border-[#E3E3DF] space-y-2 hover:border-[#B8791F]/50 transition-all cursor-pointer shadow-sm"
          onClick={() => onNavigate('finance')}
        >
          <div className="flex items-center justify-between">
            <span className="text-2xs text-slate-500 font-semibold uppercase tracking-wider">Monthly Billing (MTD)</span>
            <div className="p-2 bg-[#B8791F]/10 rounded-lg text-[#B8791F]">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-extrabold text-slate-900 font-display block">
              ₹{monthlyInvoices.toLocaleString('en-IN')}
            </span>
            <span className="text-3xs text-[#B8791F] block mt-0.5 font-bold">
              100% Statutory Compliant
            </span>
          </div>
        </Card>

        <Card
          className="p-4 bg-white border-[#E3E3DF] space-y-2 hover:border-[#B8791F]/50 transition-all cursor-pointer shadow-sm"
          onClick={() => onNavigate('inventory')}
        >
          <div className="flex items-center justify-between">
            <span className="text-2xs text-slate-500 font-semibold uppercase tracking-wider">Stock Reorder Alerts</span>
            <div className="p-2 bg-rose-500/10 rounded-lg text-rose-600">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-extrabold text-slate-900 font-display block">2 SKUs Low</span>
            <span className="text-3xs text-slate-500 block mt-0.5">Warehouse 2 Reorder Triggered</span>
          </div>
        </Card>

        <Card
          className="p-4 bg-white border-[#E3E3DF] space-y-2 hover:border-[#B8791F]/50 transition-all cursor-pointer shadow-sm"
          onClick={() => onNavigate('hr')}
        >
          <div className="flex items-center justify-between">
            <span className="text-2xs text-slate-500 font-semibold uppercase tracking-wider">Active Employees</span>
            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-600">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-extrabold text-slate-900 font-display block">
              {totalEmployees} Staff Profiled
            </span>
            <span className="text-3xs text-[#127A69] block mt-0.5 font-bold">Payroll Approved</span>
          </div>
        </Card>
      </div>

      {/* Live Animated Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-mono text-xs">
        {/* Weekly Trend Bar Chart */}
        <Card className="lg:col-span-2 p-5 bg-white border-[#E3E3DF] space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#E3E3DF] pb-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-display flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#127A69]" />
                Weekly Deal Velocity & Revenue Growth
              </h3>
              <p className="text-3xs text-slate-500 mt-0.5">Live aggregated weekly pipeline growth and invoice run-rate</p>
            </div>
            <Badge variant="emerald" size="sm">+24% MoM Velocity</Badge>
          </div>

          {/* SVG Animated Bar Graphic */}
          <div className="h-48 flex items-end justify-between gap-4 pt-4 px-3">
            {weeklyTrends.map((bar, i) => (
              <div key={bar.week} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                <div className="text-3xs font-bold text-slate-700 group-hover:text-[#127A69] transition-colors">
                  ₹{(bar.revenue / 100000).toFixed(1)}L
                </div>

                <div className="w-full bg-slate-100 rounded-t-lg overflow-hidden flex flex-col justify-end h-36 p-1 border border-slate-200">
                  <div
                    style={{
                      height: `${(bar.revenue / 3500000) * 100}%`,
                      transitionDelay: `${i * 150}ms`,
                    }}
                    className="w-full bg-gradient-to-t from-[#127A69] to-teal-400 rounded-md transition-all duration-700 group-hover:from-teal-600 group-hover:to-teal-300"
                  />
                </div>
                <span className="text-3xs text-slate-500 uppercase font-semibold">{bar.week}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Pipeline Stage Breakdown Donut Visual */}
        <Card className="p-5 bg-white border-[#E3E3DF] space-y-4 shadow-sm flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-display flex items-center gap-2">
              <PieChart className="w-4 h-4 text-[#B8791F]" />
              Pipeline Stage Breakdown
            </h3>
            <p className="text-3xs text-slate-500">Distribution across active CRM deal stages</p>

            {/* SVG Donut Chart Visual */}
            <div className="flex items-center justify-center py-2">
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  {/* Segment 1: Qualified (35%) */}
                  <circle
                    cx="18"
                    cy="18"
                    r="15.915"
                    fill="transparent"
                    stroke="#127A69"
                    strokeWidth="3.8"
                    strokeDasharray="35 65"
                    strokeDashoffset="0"
                  />
                  {/* Segment 2: Proposal (25%) */}
                  <circle
                    cx="18"
                    cy="18"
                    r="15.915"
                    fill="transparent"
                    stroke="#B8791F"
                    strokeWidth="3.8"
                    strokeDasharray="25 75"
                    strokeDashoffset="-35"
                  />
                  {/* Segment 3: Contacted (20%) */}
                  <circle
                    cx="18"
                    cy="18"
                    r="15.915"
                    fill="transparent"
                    stroke="#3B82F6"
                    strokeWidth="3.8"
                    strokeDasharray="20 80"
                    strokeDashoffset="-60"
                  />
                  {/* Segment 4: Won (15%) */}
                  <circle
                    cx="18"
                    cy="18"
                    r="15.915"
                    fill="transparent"
                    stroke="#10B981"
                    strokeWidth="3.8"
                    strokeDasharray="15 85"
                    strokeDashoffset="-80"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-lg font-extrabold text-slate-900 font-display block">42</span>
                  <span className="text-3xs text-slate-500 uppercase font-semibold">Total Deals</span>
                </div>
              </div>
            </div>

            {/* Stage Legend */}
            <div className="space-y-1.5 pt-1">
              {stageBreakdown.map((s) => (
                <div key={s.stage} className="flex items-center justify-between text-3xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                    <span className="font-semibold text-slate-700">{s.stage}</span>
                  </div>
                  <span className="font-mono text-slate-500">{s.count} deals ({s.percentage}%)</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
        <Card className="p-4 bg-white border-[#E3E3DF] space-y-3 hover:border-slate-400 transition-all shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 font-display flex items-center gap-2">
              <Users className="w-4 h-4 text-[#127A69]" />
              Sales & Leads Pipeline
            </h3>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-3xs text-slate-500 font-sans">
            Inspect active leads, drag Kanban deal cards across stages, and convert Won deals into invoices.
          </p>
          <Button variant="outline" size="sm" className="w-full" onClick={() => onNavigate('crm')}>
            Open Sales Pipeline
          </Button>
        </Card>

        <Card className="p-4 bg-white border-[#E3E3DF] space-y-3 hover:border-slate-400 transition-all shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 font-display flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-[#B8791F]" />
              Finance & Invoicing
            </h3>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-3xs text-slate-500 font-sans">
            Issue customer GST invoices, log NEFT/UPI payments, and audit Form 26Q TDS deductions.
          </p>
          <Button variant="outline" size="sm" className="w-full" onClick={() => onNavigate('finance')}>
            Open Finance Module
          </Button>
        </Card>

        <Card className="p-4 bg-white border-[#E3E3DF] space-y-3 hover:border-slate-400 transition-all shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 font-display flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Data Vault Master Layer
            </h3>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-3xs text-slate-500 font-sans">
            Department-scoped master data grid with click-to-expand row details and bulk export.
          </p>
          <Button variant="outline" size="sm" className="w-full" onClick={() => onNavigate('vault')}>
            Open Data Vault
          </Button>
        </Card>
      </div>
    </div>
  );
};
