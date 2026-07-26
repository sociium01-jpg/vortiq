// ─────────────────────────────────────────────────────────────
// Vortiq Main Client Application Shell Layout
// Translucent chrome, sidebar navigation, top bar controls, and theme context
// ─────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { useAuth } from '@/auth/AuthContext';
import { Sidebar } from './Sidebar';
import { CommandPalette } from '@/design-system/primitives/CommandPalette';
import { NotificationDrawer } from '@/modules/notifications/NotificationDrawer';
import { ErrorBoundary } from '@/design-system/primitives/ErrorBoundary';
import { Button, Avatar } from '@/design-system';

// Import All Client Module Viewports
import { DashboardModule } from '@/modules/dashboard/DashboardModule';
import { SalesPipelineModule } from '@/modules/crm/SalesPipelineModule';
import { FinanceModule } from '@/modules/finance/FinanceModule';
import { HRModule } from '@/modules/hr/HRModule';
import { MarketingModule } from '@/modules/marketing/MarketingModule';
import { TaskModule } from '@/modules/tasks/TaskModule';
import { InventoryModule } from '@/modules/inventory/InventoryModule';
import { VaultModule } from '@/modules/vault/VaultModule';
import { AdminModule } from '@/modules/admin/AdminModule';
import { NotificationsModule } from '@/modules/notifications/NotificationsModule';

import {
  Bell,
  ChevronRight,
  LogOut,
} from 'lucide-react';

export type ModuleTab =
  | 'dashboard'
  | 'crm'
  | 'finance'
  | 'hr'
  | 'marketing'
  | 'tasks'
  | 'inventory'
  | 'vault'
  | 'admin'
  | 'notifications';

export const AppLayout: React.FC = () => {
  const { user, tenant, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<ModuleTab>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);

  // Dynamic breadcrumb text
  const getBreadcrumbTitle = (tab: ModuleTab) => {
    switch (tab) {
      case 'dashboard': return 'Project Vortiq';
      case 'crm': return 'Sales & Pipeline';
      case 'finance': return 'Invoices & Ledger';
      case 'hr': return 'Team Directory';
      case 'marketing': return 'Marketing Campaigns';
      case 'tasks': return 'Project Board';
      case 'inventory': return 'Inventory Stock';
      case 'vault': return 'Data Vault Master';
      case 'admin': return 'Tenant Admin';
      case 'notifications': return 'Notifications';
      default: return 'Overview';
    }
  };

  return (
    <div className="min-h-screen flex text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      {/* Collapsible Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onOpenCommandPalette={() => setCommandPaletteOpen(true)}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          sidebarCollapsed ? 'ml-20' : 'ml-60'
        }`}
      >
        {/* Top Minimal Navigation Bar Chrome */}
        <header className="sticky top-0 z-20 h-16 bg-white/80 dark:bg-[#12151F]/80 backdrop-blur-md border-b border-slate-200/80 dark:border-white/10 px-4 sm:px-6 flex items-center justify-between shadow-2xs">
          {/* Breadcrumb Trail matching reference screenshot */}
          <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
            <span>Home</span>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span>Analytics</span>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className="font-bold text-slate-900 font-sans">
              {getBreadcrumbTitle(activeTab)}
            </span>
          </div>

          {/* Right Action Controls matching reference screenshot */}
          <div className="flex items-center gap-3">
            {/* Notification Bell Badge */}
            <button
              onClick={() => setNotificationDrawerOpen(true)}
              className="relative p-2 rounded-full text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-bold text-[10px] flex items-center justify-center border-2 border-white">
                3
              </span>
            </button>

            {/* User Profile Pill Avatar */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
              <Avatar
                name={user?.full_name || 'Alex Chen'}
                size="sm"
                className="ring-2 ring-blue-500/20"
              />
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-slate-900 leading-tight">
                  {user?.full_name || 'Alex Chen'}
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  {tenant?.name || 'Vortiq'}
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => logout()}
                className="text-slate-400 hover:text-rose-600 p-1"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Active Module Viewport */}
        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto space-y-6">
          <ErrorBoundary moduleName={`${activeTab.toUpperCase()} Module`}>
            {activeTab === 'dashboard' && <DashboardModule onNavigate={(tab: any) => setActiveTab(tab)} />}
            {activeTab === 'crm' && <SalesPipelineModule />}
            {activeTab === 'finance' && <FinanceModule />}
            {activeTab === 'hr' && <HRModule />}
            {activeTab === 'marketing' && <MarketingModule />}
            {activeTab === 'tasks' && <TaskModule />}
            {activeTab === 'inventory' && <InventoryModule />}
            {activeTab === 'vault' && <VaultModule onNavigateToModule={(modKey) => setActiveTab(modKey as any)} />}
            {activeTab === 'admin' && <AdminModule />}
            {activeTab === 'notifications' && <NotificationsModule />}
          </ErrorBoundary>
        </main>
      </div>

      {/* Global Command Palette (Cmd/Ctrl+K) */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />

      {/* Slide-over Notification Drawer */}
      <NotificationDrawer
        isOpen={notificationDrawerOpen}
        onClose={() => setNotificationDrawerOpen(false)}
        notifications={[]}
        onMarkAsRead={() => {}}
        onMarkAllAsRead={() => {}}
      />
    </div>
  );
};
