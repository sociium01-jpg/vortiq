// ─────────────────────────────────────────────────────────────
// Vortiq Main Application Shell Layout
// Collapsible Sidebar, Minimal Top Bar, Roboto + Helvetica Stack, 3-Way Persisted Theme
// ─────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { useAuth } from '@/auth/AuthContext';
import { useTheme, ThemeMode } from '@/theme/ThemeContext';
import { Sidebar } from './Sidebar';
import { DashboardModule } from '@/modules/dashboard/DashboardModule';
import { SalesPipelineModule } from '@/modules/crm/SalesPipelineModule';
import { FinanceModule } from '@/modules/finance/FinanceModule';
import { HRModule } from '@/modules/hr/HRModule';
import { MarketingModule } from '@/modules/marketing/MarketingModule';
import { TaskModule } from '@/modules/tasks/TaskModule';
import { InventoryModule } from '@/modules/inventory/InventoryModule';
import { AdminModule } from '@/modules/admin/AdminModule';
import { VaultModule } from '@/modules/vault/VaultModule';
import { NotificationsModule } from '@/modules/notifications/NotificationsModule';
import { NotificationDrawer } from '@/modules/notifications/NotificationDrawer';
import { AppNotification } from '@/types';
import {
  Button,
  Avatar,
  CommandPalette,
  ErrorBoundary,
} from '@/design-system';
import {
  Users,
  UserCheck,
  Megaphone,
  CheckSquare,
  Package,
  Shield,
  Bell,
  Layers,
  ChevronRight,
  IndianRupee,
  LayoutDashboard,
  LogOut,
  Globe,
  Sun,
  Moon,
  Laptop,
} from 'lucide-react';
import { AuthModal } from '@/auth/AuthModal';
import { OnboardingWizardModal } from '@/auth/OnboardingWizardModal';

export type ModuleTab = 'dashboard' | 'crm' | 'finance' | 'hr' | 'marketing' | 'tasks' | 'inventory' | 'vault' | 'admin' | 'notifications';

export const AppLayoutContent: React.FC = () => {
  const { user, tenant, logout, isOnboardingOpen, setIsOnboardingOpen } = useAuth();
  const { themeMode, setThemeMode } = useTheme();

  const [activeTab, setActiveTab] = useState<ModuleTab>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isNotifDrawerOpen, setIsNotifDrawerOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);

  // Mock global notifications feed for header & drawer
  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: 'notif-1',
      tenant_id: tenant?.id || 't-1',
      user_id: user?.id || 'u-1',
      title: 'Low Stock Alert: Hydraulic Seal SK-1002',
      message: 'Warehouse 3B balance is 4 units (reorder threshold: 15). Immediate PO required.',
      type: 'stock_alert',
      channel: 'in_app',
      read: false,
      created_at: new Date(Date.now() - 300000).toISOString(),
    },
    {
      id: 'notif-2',
      tenant_id: tenant?.id || 't-1',
      user_id: user?.id || 'u-1',
      title: 'New High Value Lead: FinTech Corp',
      message: 'Deal value ₹4,50,000 assigned to your pipeline by Alex Vance.',
      type: 'task',
      channel: 'email',
      read: false,
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleMarkRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const handleSelectNotification = (notif: AppNotification) => {
    handleMarkRead(notif.id);
    if (notif.type === 'stock_alert') setActiveTab('inventory');
    else if (notif.type === 'task') setActiveTab('crm');
    else setActiveTab('notifications');
  };

  const getBreadcrumbTitle = (tab: ModuleTab): string => {
    switch (tab) {
      case 'dashboard': return 'Executive Dashboard';
      case 'crm': return 'Sales / Leads Pipeline';
      case 'tasks': return 'Tasks & Projects';
      case 'inventory': return 'Inventory & Stock';
      case 'hr': return 'HR & Statutory Payroll';
      case 'finance': return 'Finance & Accounts Receivable';
      case 'marketing': return 'Marketing & Data Segments';
      case 'vault': return 'Data Vault';
      case 'admin': return 'Tenant Admin Settings';
      case 'notifications': return 'Notifications Center';
      default: return 'Workspace';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0E17] text-slate-900 dark:text-[#EDEEF3] flex font-sans transition-colors relative">
      {/* Fixed Two-Tone Ambient Mesh Gradient Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-40 dark:opacity-25">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl" />
      </div>

      {/* Collapsible Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        onOpenCommand={() => setIsCommandOpen(true)}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 relative z-10 ${
          isSidebarCollapsed ? 'ml-18' : 'ml-64'
        }`}
      >
        {/* Minimal Glass Top Bar */}
        <header className="sticky top-0 z-30 h-16 px-4 sm:px-6 backdrop-blur-md bg-white/70 dark:bg-[#12151F]/70 border-b border-slate-200/80 dark:border-white/10 flex items-center justify-between shadow-xs">
          {/* Breadcrumb Trail */}
          <div className="flex items-center gap-2 font-mono text-xs text-slate-500 dark:text-slate-400">
            <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="hidden sm:inline">Vortiq</span>
            <ChevronRight className="w-3 h-3 text-slate-400 dark:text-slate-600 hidden sm:inline" />
            <span className="font-bold text-slate-900 dark:text-slate-100 font-display">
              {getBreadcrumbTitle(activeTab)}
            </span>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Back to Website Button */}
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
              onClick={() => {
                window.location.href = '/';
              }}
              className="hidden lg:flex text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            >
              Back to Website
            </Button>

            {/* 3-Way Persisted Theme Toggle Menu */}
            <div className="relative">
              <button
                onClick={() => setIsThemeMenuOpen((prev) => !prev)}
                className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                title="Theme Mode (Light / Dark / System)"
              >
                {themeMode === 'light' && <Sun className="w-4 h-4 text-amber-500" />}
                {themeMode === 'dark' && <Moon className="w-4 h-4 text-indigo-400" />}
                {themeMode === 'system' && <Laptop className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />}
              </button>

              {isThemeMenuOpen && (
                <div className="absolute right-0 mt-2 w-36 py-1 bg-white dark:bg-[#171B27] border border-slate-200 dark:border-white/10 rounded-xl shadow-xl z-50 text-xs font-mono">
                  {(['light', 'dark', 'system'] as ThemeMode[]).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => {
                        setThemeMode(mode);
                        setIsThemeMenuOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-left flex items-center gap-2 capitalize transition-colors cursor-pointer ${
                        themeMode === mode
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'
                      }`}
                    >
                      {mode === 'light' && <Sun className="w-3.5 h-3.5 text-amber-500" />}
                      {mode === 'dark' && <Moon className="w-3.5 h-3.5 text-indigo-400" />}
                      {mode === 'system' && <Laptop className="w-3.5 h-3.5 text-emerald-500" />}
                      <span>{mode} Mode</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notification Bell */}
            <button
              onClick={() => setIsNotifDrawerOpen(true)}
              className="relative p-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              title="Notification Center"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-3xs font-bold font-mono flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            <div className="h-6 w-px bg-slate-200 dark:bg-white/10 hidden sm:block" />

            {/* User Profile & Sign Out */}
            <div className="flex items-center gap-2">
              <Avatar name={user?.full_name || 'Admin User'} size="sm" />
              <div className="hidden xl:block text-left font-mono">
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">{user?.full_name}</div>
                <div className="text-3xs text-emerald-600 dark:text-emerald-400 font-medium">{user?.role} • {tenant?.org_code}</div>
              </div>

              <Button
                variant="outline"
                size="sm"
                leftIcon={<LogOut className="w-3.5 h-3.5 text-rose-500" />}
                onClick={() => logout()}
                className="text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 border-slate-200 dark:border-white/10"
                title="Sign Out"
              >
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Active Module Viewport */}
        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto space-y-6">
          <ErrorBoundary moduleName={`${activeTab.toUpperCase()} Module`}>
            {activeTab === 'dashboard' && <DashboardModule onNavigate={(tab) => setActiveTab(tab)} />}
            {activeTab === 'crm' && <SalesPipelineModule />}
            {activeTab === 'finance' && <FinanceModule />}
            {activeTab === 'hr' && <HRModule />}
            {activeTab === 'marketing' && <MarketingModule />}
            {activeTab === 'tasks' && <TaskModule />}
            {activeTab === 'inventory' && <InventoryModule />}
            {activeTab === 'vault' && <VaultModule />}
            {activeTab === 'admin' && <AdminModule />}
            {activeTab === 'notifications' && <NotificationsModule />}
          </ErrorBoundary>
        </main>
      </div>

      {/* Slide-over Notification Drawer */}
      <NotificationDrawer
        isOpen={isNotifDrawerOpen}
        onClose={() => setIsNotifDrawerOpen(false)}
        notifications={notifications}
        onMarkAsRead={handleMarkRead}
        onMarkAllAsRead={handleMarkAllRead}
        onSelectNotification={handleSelectNotification}
      />

      {/* Command Palette (Ctrl+K) */}
      <CommandPalette
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
        items={[
          { id: '0', title: 'Executive Operational Dashboard', category: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4 text-emerald-500" />, onSelect: () => setActiveTab('dashboard') },
          { id: '1', title: 'Sales / Leads Pipeline & Deals', category: 'Sales', icon: <Users className="w-4 h-4 text-emerald-500" />, onSelect: () => setActiveTab('crm') },
          { id: '2', title: 'Finance & Tax Invoicing', category: 'Finance', icon: <IndianRupee className="w-4 h-4 text-emerald-500" />, onSelect: () => setActiveTab('finance') },
          { id: '3', title: 'HR Directory & Statutory Payroll', category: 'HR', icon: <UserCheck className="w-4 h-4 text-emerald-500" />, onSelect: () => setActiveTab('hr') },
          { id: '4', title: 'Marketing Campaigns & Segments', category: 'Marketing', icon: <Megaphone className="w-4 h-4 text-amber-500" />, onSelect: () => setActiveTab('marketing') },
          { id: '5', title: 'Task Board & Documentation Wiki', category: 'Tasks', icon: <CheckSquare className="w-4 h-4 text-blue-500" />, onSelect: () => setActiveTab('tasks') },
          { id: '6', title: 'Inventory Register & Photo Scan', category: 'Inventory', icon: <Package className="w-4 h-4 text-amber-500" />, onSelect: () => setActiveTab('inventory') },
          { id: '7', title: 'Admin Settings & Security Log', category: 'Admin', icon: <Shield className="w-4 h-4 text-violet-500" />, onSelect: () => setActiveTab('admin') },
          { id: '8', title: 'Notifications Center', category: 'Notifications', icon: <Bell className="w-4 h-4 text-rose-500" />, onSelect: () => setActiveTab('notifications') },
        ]}
      />

      {/* Auth & Setup Modals */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <OnboardingWizardModal isOpen={isOnboardingOpen} onClose={() => setIsOnboardingOpen(false)} />
    </div>
  );
};

export const AppLayout: React.FC = () => (
  <AppLayoutContent />
);
