// ─────────────────────────────────────────────────────────────
// Vortiq App Shell — Sidebar Navigation Component
// Matches exact visual design from reference screenshot
// Sectioned by OVERVIEW, WORKSPACE, SYSTEM with active blue pill highlights
// ─────────────────────────────────────────────────────────────

import React from 'react';
import {
  LayoutDashboard,
  FolderKanban,
  LineChart,
  FileText,
  Users,
  Building2,
  Share2,
  Settings,
  HelpCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Database,
} from 'lucide-react';
import { ModuleTab } from './AppLayout';

interface SidebarProps {
  activeTab: ModuleTab;
  setActiveTab: (tab: ModuleTab) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onOpenCommandPalette: () => void;
}

interface NavItem {
  id: ModuleTab | string;
  label: string;
  icon: React.ReactNode;
  isAction?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  collapsed,
  onToggleCollapse,
  onOpenCommandPalette,
}) => {
  const overviewGroup: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'tasks', label: 'Projects', icon: <FolderKanban className="w-4 h-4" /> },
    { id: 'crm', label: 'Analytics', icon: <LineChart className="w-4 h-4" /> },
    { id: 'finance', label: 'Reports', icon: <FileText className="w-4 h-4" /> },
  ];

  const workspaceGroup: NavItem[] = [
    { id: 'hr', label: 'Team', icon: <Users className="w-4 h-4" /> },
    { id: 'marketing', label: 'Clients', icon: <Building2 className="w-4 h-4" /> },
    { id: 'inventory', label: 'Integrations', icon: <Share2 className="w-4 h-4" /> },
  ];

  const systemGroup: NavItem[] = [
    { id: 'admin', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
    { id: 'vault', label: 'Data Vault', icon: <Database className="w-4 h-4" /> },
    { id: 'notifications', label: 'Support', icon: <HelpCircle className="w-4 h-4" /> },
  ];

  const renderNavList = (items: NavItem[]) => (
    <ul className="space-y-1">
      {items.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <li key={item.id}>
            <button
              onClick={() => setActiveTab(item.id as ModuleTab)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-50 text-blue-600 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <span className={isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}>
                {item.icon}
              </span>
              {!collapsed && <span>{item.label}</span>}
            </button>
          </li>
        );
      })}
    </ul>
  );

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-30 flex flex-col bg-white/90 dark:bg-[#12151F]/90 backdrop-blur-md border-r border-slate-200/80 dark:border-white/10 transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-60'
      }`}
    >
      {/* Sidebar Header & Brand Ribbon Logo */}
      <div className="p-5 flex items-center justify-between border-b border-slate-100 dark:border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-white font-extrabold text-lg font-display shadow-md shadow-blue-500/20">
            V
          </div>
          {!collapsed && (
            <span className="text-xl font-bold text-slate-900 dark:text-slate-100 font-display tracking-tight">
              Vortiq
            </span>
          )}
        </div>

        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Global Command Search Trigger */}
      {!collapsed && (
        <div className="px-4 py-3">
          <button
            onClick={onOpenCommandPalette}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-100/80 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 text-xs text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5" />
              <span>Search workspace...</span>
            </div>
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-dark-surface rounded border border-slate-200 dark:border-white/10 text-slate-400">
              ⌘K
            </kbd>
          </button>
        </div>
      )}

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6">
        {/* OVERVIEW SECTION */}
        <div>
          {!collapsed && (
            <h4 className="px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
              OVERVIEW
            </h4>
          )}
          {renderNavList(overviewGroup)}
        </div>

        {/* WORKSPACE SECTION */}
        <div>
          {!collapsed && (
            <h4 className="px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
              WORKSPACE
            </h4>
          )}
          {renderNavList(workspaceGroup)}
        </div>

        {/* SYSTEM SECTION */}
        <div>
          {!collapsed && (
            <h4 className="px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
              SYSTEM
            </h4>
          )}
          {renderNavList(systemGroup)}
        </div>
      </div>

      {/* Bottom Profile / Realm Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-2xs text-slate-500 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Org Admin Scope</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
