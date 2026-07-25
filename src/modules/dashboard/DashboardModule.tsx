// ─────────────────────────────────────────────────────────────
// Vortiq Executive Dashboard Module
// Primary landing view displaying live org metrics, quick triggers, and recent activity
// ─────────────────────────────────────────────────────────────

import React from 'react';
import { Card, Button, Badge } from '@/design-system';
import { useAuth } from '@/auth/AuthContext';
import {
  Users,
  IndianRupee,
  Package,
  UserCheck,
  ArrowRight,
  Plus,
} from 'lucide-react';

interface DashboardModuleProps {
  onNavigate: (tab: any) => void;
}

export const DashboardModule: React.FC<DashboardModuleProps> = ({ onNavigate }) => {
  const { user, tenant } = useAuth();

  return (
    <div className="space-y-6 font-sans">
      {/* Top Welcome Header */}
      <div className="p-6 bg-dark-card border border-dark-border rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-100 font-display tracking-tight">
              Welcome back, {user?.full_name || 'Alex Vance'} 👋
            </h1>
            <Badge variant="emerald" size="sm" className="font-mono font-bold">
              {tenant?.org_code || 'ORG-9901-VTQ'}
            </Badge>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            {tenant?.name || 'Vortiq Enterprise'} • Single-pane operational dashboard
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

      {/* Top 4 Primary KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
        <Card className="p-4 bg-dark-card border-dark-border space-y-2 hover:border-brand-500/40 transition-all cursor-pointer" onClick={() => onNavigate('crm')}>
          <div className="flex items-center justify-between">
            <span className="text-2xs text-slate-400 font-semibold uppercase tracking-wider">Active Sales Pipeline</span>
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-bold font-display text-slate-100 block">₹24,80,000</span>
            <span className="text-2xs text-slate-400 block mt-0.5">6 Qualified Deals in Pipeline</span>
          </div>
        </Card>

        <Card className="p-4 bg-dark-card border-dark-border space-y-2 hover:border-brand-500/40 transition-all cursor-pointer" onClick={() => onNavigate('finance')}>
          <div className="flex items-center justify-between">
            <span className="text-2xs text-slate-400 font-semibold uppercase tracking-wider">Accounts Receivable (AR)</span>
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-bold font-display text-amber-400 block">₹11,75,600</span>
            <span className="text-2xs text-slate-400 block mt-0.5">Outstanding Invoices</span>
          </div>
        </Card>

        <Card className="p-4 bg-dark-card border-dark-border space-y-2 hover:border-brand-500/40 transition-all cursor-pointer" onClick={() => onNavigate('inventory')}>
          <div className="flex items-center justify-between">
            <span className="text-2xs text-slate-400 font-semibold uppercase tracking-wider">Stock & Inventory Alert</span>
            <div className="p-2 bg-rose-500/10 rounded-lg text-rose-400">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-bold font-display text-rose-400 block">1 Low Stock Item</span>
            <span className="text-2xs text-slate-400 block mt-0.5">Hydraulic Valve SK-1002</span>
          </div>
        </Card>

        <Card className="p-4 bg-dark-card border-dark-border space-y-2 hover:border-brand-500/40 transition-all cursor-pointer" onClick={() => onNavigate('hr')}>
          <div className="flex items-center justify-between">
            <span className="text-2xs text-slate-400 font-semibold uppercase tracking-wider">Active Team</span>
            <div className="p-2 bg-violet-500/10 rounded-lg text-violet-400">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-bold font-display text-slate-100 block">18 Employees</span>
            <span className="text-2xs text-slate-400 block mt-0.5">Statutory Payroll Ready</span>
          </div>
        </Card>
      </div>

      {/* Module Quick Jump Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-display">
          Module Workspace Access
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 bg-dark-card border-dark-border hover:border-brand-500/40 transition-all flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Users className="w-4 h-4 text-emerald-400" />
                <h4 className="font-bold text-slate-100 font-display text-sm">Sales / Leads Pipeline</h4>
              </div>
              <p className="text-xs text-slate-400 font-sans">
                Manage incoming leads, followups, deal stages, and rep activity logs.
              </p>
            </div>
            <Button variant="ghost" size="sm" className="w-full justify-between" onClick={() => onNavigate('crm')} rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              Open Sales Pipeline
            </Button>
          </Card>

          <Card className="p-4 bg-dark-card border-dark-border hover:border-brand-500/40 transition-all flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <IndianRupee className="w-4 h-4 text-emerald-400" />
                <h4 className="font-bold text-slate-100 font-display text-sm">Finance & Tax Invoicing</h4>
              </div>
              <p className="text-xs text-slate-400 font-sans">
                Generate India GST invoices, Form 26Q TDS records, and Tally XML exports.
              </p>
            </div>
            <Button variant="ghost" size="sm" className="w-full justify-between" onClick={() => onNavigate('finance')} rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              Open Finance Workspace
            </Button>
          </Card>

          <Card className="p-4 bg-dark-card border-dark-border hover:border-brand-500/40 transition-all flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Package className="w-4 h-4 text-amber-400" />
                <h4 className="font-bold text-slate-100 font-display text-sm">Inventory & Stock Register</h4>
              </div>
              <p className="text-xs text-slate-400 font-sans">
                Track warehouse stock, serial items, reorder thresholds, and warehouse transfers.
              </p>
            </div>
            <Button variant="ghost" size="sm" className="w-full justify-between" onClick={() => onNavigate('inventory')} rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              Open Stock Register
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};
