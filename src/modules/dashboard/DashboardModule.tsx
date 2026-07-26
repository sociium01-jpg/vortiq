// ─────────────────────────────────────────────────────────────
// Vortiq Executive Dashboard Module
// 100% Visual Parity match for attached reference screenshot
// ─────────────────────────────────────────────────────────────

import React, { useState, useEffect } from 'react';
import { Card } from '@/design-system';
import {
  CheckCircle2,
  AlertCircle,
  MoreHorizontal,
  CheckSquare,
  ListTodo,
} from 'lucide-react';

interface DashboardModuleProps {
  onNavigate?: (tab: any) => void;
}

// Custom hook for animated count-up numbers with prefers-reduced-motion support
function useCountUp(target: number, durationMs: number = 1000): number {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
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

export const DashboardModule: React.FC<DashboardModuleProps> = () => {
  const revenueVal = useCountUp(84250);
  const activeUsersVal = useCountUp(3120);

  return (
    <div className="space-y-6 font-sans text-slate-900">
      {/* Title */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-slate-900 font-display tracking-tight">
          Dashboard
        </h1>
      </div>

      {/* 4 Stat Cards matching reference screenshot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: TOTAL REVENUE */}
        <Card className="relative overflow-hidden p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-3">
          <div className="absolute top-0 right-0 w-24 h-24 blob-blue rounded-full pointer-events-none" />
          <div className="text-3xs font-bold uppercase tracking-wider text-slate-500 font-mono">
            TOTAL REVENUE
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 font-display tracking-tight">
              ${revenueVal.toLocaleString('en-US')}.00
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-600 font-mono">
              +12.5%
            </span>
          </div>
          <p className="text-2xs text-slate-400 font-sans leading-relaxed">
            Litment trandsmorshant total revenue
          </p>
        </Card>

        {/* Card 2: ACTIVE USERS */}
        <Card className="relative overflow-hidden p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-3">
          <div className="absolute top-0 right-0 w-24 h-24 blob-green rounded-full pointer-events-none" />
          <div className="text-3xs font-bold uppercase tracking-wider text-slate-500 font-mono">
            ACTIVE USERS
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 font-display tracking-tight">
              {activeUsersVal.toLocaleString('en-US')}
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-600 font-mono">
              +7.8%
            </span>
          </div>
          <p className="text-2xs text-slate-400 font-sans leading-relaxed">
            Active users of optimize users and diserators
          </p>
        </Card>

        {/* Card 3: CONVERSION RATE */}
        <Card className="relative overflow-hidden p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-3">
          <div className="absolute top-0 right-0 w-24 h-24 blob-orange rounded-full pointer-events-none" />
          <div className="text-3xs font-bold uppercase tracking-wider text-slate-500 font-mono">
            CONVERSION RATE
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 font-display tracking-tight">
              4.1%
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-600 font-mono">
              +0.9%
            </span>
          </div>
          <p className="text-2xs text-slate-400 font-sans leading-relaxed">
            Conversion rate of online collections
          </p>
        </Card>

        {/* Card 4: PROJECT PERFORMANCE */}
        <Card className="relative overflow-hidden p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-3">
          <div className="absolute top-0 right-0 w-24 h-24 blob-purple rounded-full pointer-events-none" />
          <div className="text-3xs font-bold uppercase tracking-wider text-slate-500 font-mono">
            PROJECT PERFORMANCE
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 font-display tracking-tight">
              96.3%
            </span>
            <span className="text-2xs font-bold text-emerald-600 font-mono">
              On Track
            </span>
          </div>
          <p className="text-2xs text-slate-400 font-sans leading-relaxed">
            Project performance and performance
          </p>
        </Card>
      </div>

      {/* Main Content Grid: Revenue Trends (Left 2/3) & Top Performing Projects / Tasks (Right 1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2/3: Revenue Trends (30 Days) Smooth Spline Line Chart */}
        <Card className="lg:col-span-2 p-6 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 font-display">
              Revenue Trends (30 Days)
            </h3>
          </div>

          {/* Smooth SVG Spline Line Chart matching reference image */}
          <div className="relative h-64 w-full pt-4">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 500 200" preserveAspectRatio="none">
              <defs>
                <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid Lines */}
              <line x1="30" y1="20" x2="490" y2="20" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="30" y1="60" x2="490" y2="60" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="30" y1="100" x2="490" y2="100" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="30" y1="140" x2="490" y2="140" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="30" y1="180" x2="490" y2="180" stroke="#E2E8F0" strokeWidth="1" />

              {/* Y Axis Labels */}
              <text x="0" y="24" fill="#94A3B8" fontSize="9" fontFamily="monospace">$2,500</text>
              <text x="0" y="64" fill="#94A3B8" fontSize="9" fontFamily="monospace">$2,000</text>
              <text x="0" y="104" fill="#94A3B8" fontSize="9" fontFamily="monospace">$1,500</text>
              <text x="0" y="144" fill="#94A3B8" fontSize="9" fontFamily="monospace">$1,000</text>
              <text x="10" y="184" fill="#94A3B8" fontSize="9" fontFamily="monospace">$500</text>

              {/* Area Gradient Fill under Path */}
              <path
                d="M 30 170 Q 90 140, 140 120 T 250 90 T 350 40 T 490 20 L 490 180 L 30 180 Z"
                fill="url(#blueGradient)"
              />

              {/* Smooth Blue Spline Curve */}
              <path
                d="M 30 170 Q 90 140, 140 120 T 250 90 T 350 40 T 490 20"
                fill="none"
                stroke="#2563EB"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>

            {/* X Axis Labels */}
            <div className="flex justify-between pl-8 pr-2 pt-2 text-[10px] font-mono text-slate-400">
              <span>0</span>
              <span>6</span>
              <span>9</span>
              <span>12</span>
              <span>15</span>
              <span>18</span>
              <span>21</span>
              <span>24</span>
              <span>27</span>
              <span>30</span>
            </div>
          </div>
        </Card>

        {/* Right 1/3: Top Performing Projects & Task Summary */}
        <div className="space-y-6">
          {/* Top Performing Projects Card */}
          <Card className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 font-display">
                Top Performing Projects
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead>
                  <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    <th className="pb-2">PROJECT</th>
                    <th className="pb-2">REVENUE</th>
                    <th className="pb-2">STATUS</th>
                    <th className="pb-2 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-blue-500 text-white font-bold text-[10px] flex items-center justify-center">
                          V1
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 leading-tight">Project Vort 1</div>
                          <div className="text-[10px] text-slate-400">Growth Project</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 font-bold font-mono text-slate-900">$84,250.00</td>
                    <td className="py-2.5">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Track
                      </span>
                    </td>
                    <td className="py-2.5 text-right text-slate-400">
                      <MoreHorizontal className="w-4 h-4 cursor-pointer hover:text-slate-600" />
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-emerald-500 text-white font-bold text-[10px] flex items-center justify-center">
                          V2
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 leading-tight">Project Vort 2</div>
                          <div className="text-[10px] text-slate-400">Growth Project</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 font-bold font-mono text-slate-900">$84,250.00</td>
                    <td className="py-2.5">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Trant
                      </span>
                    </td>
                    <td className="py-2.5 text-right text-slate-400">
                      <MoreHorizontal className="w-4 h-4 cursor-pointer hover:text-slate-600" />
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-amber-500 text-white font-bold text-[10px] flex items-center justify-center">
                          V3
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 leading-tight">Project Vort 3</div>
                          <div className="text-[10px] text-slate-400">Growth Project</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 font-bold font-mono text-slate-900">$3,120</td>
                    <td className="py-2.5">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600">
                        <AlertCircle className="w-3.5 h-3.5" /> Track
                      </span>
                    </td>
                    <td className="py-2.5 text-right text-slate-400">
                      <MoreHorizontal className="w-4 h-4 cursor-pointer hover:text-slate-600" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>

          {/* Task Summary Card */}
          <Card className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 font-display border-b border-slate-100 pb-2">
              Task summary
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 space-y-1">
                <div className="flex items-center gap-1.5 text-blue-600 text-xs font-bold">
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>First tasting</span>
                </div>
                <p className="text-[10px] text-slate-400">Get task performance</p>
              </div>

              <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100 space-y-1">
                <div className="flex items-center gap-1.5 text-amber-600 text-xs font-bold">
                  <ListTodo className="w-3.5 h-3.5" />
                  <span>List of task</span>
                </div>
                <p className="text-[10px] text-slate-400">Project performance</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
