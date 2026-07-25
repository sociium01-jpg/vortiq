// ─────────────────────────────────────────────────────────────
// Vortiq Collapsible Left Sidebar Navigation Component
// Grouped Sections: Overview, Workspace, System
// Collapsible to icon-only mode with glassmorphism styling
// ─────────────────────────────────────────────────────────────

import React from 'react';
import { ModuleTab } from './AppLayout';
import { useAuth } from '@/auth/AuthContext';
import {
  LayoutDashboard,
  Users,
  IndianRupee,
  UserCheck,
  Megaphone,
  CheckSquare,
  Package,
  Database,
  Shield,
  Search,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface SidebarProps {
  activeTab: ModuleTab;
  onSelectTab: (tab: ModuleTab) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onOpenCommand: () => void;
}

interface NavGroup {
  groupTitle: string;
  items: {
    id: ModuleTab;
    label: string;
    icon: React.ReactNode;
    badge?: string;
  }[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
  onOpenCommand,
}) => {
  const { tenant } = useAuth();

  const navGroups: NavGroup[] = [
    {
      groupTitle: 'Overview',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
      ],
    },
    {
      groupTitle: 'Workspace',
      items: [
        { id: 'crm', label: 'Sales / Leads Pipeline', icon: <Users className="w-4 h-4" /> },
        { id: 'tasks', label: 'Tasks & Projects', icon: <CheckSquare className="w-4 h-4" /> },
        { id: 'inventory', label: 'Inventory', icon: <Package className="w-4 h-4" />, badge: 'Alert' },
        { id: 'hr', label: 'HR & Payroll', icon: <UserCheck className="w-4 h-4" /> },
        { id: 'finance', label: 'Finance & Tax', icon: <IndianRupee className="w-4 h-4" /> },
        { id: 'marketing', label: 'Marketing & Data', icon: <Megaphone className="w-4 h-4" /> },
      ],
    },
    {
      groupTitle: 'System',
      items: [
        { id: 'vault', label: 'Data Vault', icon: <Database className="w-4 h-4 text-emerald-500 dark:text-emerald-400" /> },
        { id: 'admin', label: 'Tenant Admin', icon: <Shield className="w-4 h-4" /> },
      ],
    },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-40 transition-all duration-300 flex flex-col backdrop-blur-md bg-white/70 dark:bg-[#12151F]/70 border-r border-slate-200 dark:border-white/10 ${
        isCollapsed ? 'w-18' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-slate-200/80 dark:border-white/10 shrink-0">
        <div className="flex items-center gap-3 overflow-hidden cursor-pointer" onClick={() => onSelectTab('dashboard')}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 flex items-center justify-center shadow-md shadow-emerald-500/20 text-white font-black text-xl font-display shrink-0">
            V
          </div>

          {!isCollapsed && (
            <div className="truncate">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-extrabold text-slate-900 dark:text-slate-100 font-display tracking-tight">VOR TIQ</span>
                <span className="text-3xs px-1 py-0.2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                  {tenant?.org_code || 'ORG-9901'}
                </span>
              </div>
              <p className="text-3xs text-slate-500 dark:text-slate-400 font-mono truncate">
                {tenant?.name || 'Vortiq Enterprise'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Command Search Bar */}
      <div className="p-3 border-b border-slate-200/60 dark:border-white/5">
        <button
          onClick={onOpenCommand}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs bg-slate-100/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer ${
            isCollapsed ? 'justify-center px-0' : 'justify-between'
          }`}
          title="Search App (Ctrl+K)"
        >
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            {!isCollapsed && <span className="font-mono">Quick Search...</span>}
          </div>
          {!isCollapsed && (
            <kbd className="text-3xs font-mono bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 shadow-2xs">
              ⌘K
            </kbd>
          )}
        </button>
      </div>

      {/* Navigation Group List */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-4 font-mono text-xs select-none">
        {navGroups.map((group) => (
          <div key={group.groupTitle} className="space-y-1">
            {!isCollapsed && (
              <h4 className="px-3 text-3xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-sans">
                {group.groupTitle}
              </h4>
            )}

            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectTab(item.id)}
                    title={isCollapsed ? item.label : undefined}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                      isActive
                        ? 'bg-emerald-500 text-white font-bold shadow-md shadow-emerald-500/20 dark:bg-emerald-500 dark:text-slate-950'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                    } ${isCollapsed ? 'justify-center px-0' : ''}`}
                  >
                    <span className="shrink-0">{item.icon}</span>
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                    {!isCollapsed && item.badge && (
                      <span
                        className={`ml-auto text-3xs px-1.5 py-0.2 rounded-full font-bold ${
                          isActive
                            ? 'bg-slate-900 text-emerald-400 dark:bg-slate-950 dark:text-emerald-300'
                            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Collapse Toggle */}
      <div className="p-3 border-t border-slate-200/80 dark:border-white/10 shrink-0">
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          {!isCollapsed && <span className="font-mono font-medium">Collapse Sidebar</span>}
        </button>
      </div>
    </aside>
  );
};
