import React, { useState } from 'react';
import { useAuth } from '@/auth/AuthContext';
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
  Command,
  Layers,
  ChevronRight,
  IndianRupee,
  Database,
  LayoutDashboard,
  LogOut,
  Globe,
} from 'lucide-react';
import { AuthModal } from '@/auth/AuthModal';
import { OnboardingWizardModal } from '@/auth/OnboardingWizardModal';

export type ModuleTab = 'dashboard' | 'crm' | 'finance' | 'hr' | 'marketing' | 'tasks' | 'inventory' | 'vault' | 'admin' | 'notifications';

export const AppLayout: React.FC = () => {
  const { user, tenant, logout, isOnboardingOpen, setIsOnboardingOpen } = useAuth();
  const [activeTab, setActiveTab] = useState<ModuleTab>('dashboard');
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isNotifDrawerOpen, setIsNotifDrawerOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

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

  const navItems: { id: ModuleTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'crm', label: 'Sales / Leads Pipeline', icon: <Users className="w-4 h-4" /> },
    { id: 'finance', label: 'Finance & Tax', icon: <IndianRupee className="w-4 h-4" /> },
    { id: 'hr', label: 'HR & Payroll', icon: <UserCheck className="w-4 h-4" /> },
    { id: 'marketing', label: 'Marketing & Data', icon: <Megaphone className="w-4 h-4" /> },
    { id: 'tasks', label: 'Tasks & Docs', icon: <CheckSquare className="w-4 h-4" /> },
    { id: 'inventory', label: 'Inventory & Floor', icon: <Package className="w-4 h-4" />, badge: 'Alert' },
    { id: 'vault', label: 'Data Vault', icon: <Database className="w-4 h-4 text-emerald-400" /> },
    { id: 'admin', label: 'Admin Settings', icon: <Shield className="w-4 h-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" />, badge: unreadCount > 0 ? `${unreadCount}` : undefined },
  ];

  return (
    <div className="min-h-screen bg-dark-bg text-dark-text flex flex-col font-sans">
      {/* Global Top Navbar */}
      <header className="sticky top-0 z-40 bg-dark-card/95 backdrop-blur-md border-b border-dark-border px-4 lg:px-6 py-2.5 flex items-center justify-between shadow-md">
        {/* Brand & Workspace */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-brand-400 flex items-center justify-center shadow-lg shadow-brand-500/20 text-dark-bg font-black text-xl tracking-wider font-display">
              V
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold text-slate-100 font-display tracking-tight">VOR TIQ</span>
                <span className="text-2xs px-1.5 py-0.5 rounded bg-brand-500/10 text-brand-400 border border-brand-500/30 font-mono font-bold">
                  {tenant?.org_code || 'ORG-9901-VTQ'}
                </span>
              </div>
              <p className="text-2xs text-slate-400 font-mono hidden sm:block">
                {tenant?.name || 'Vortiq Enterprise'} • <span className="text-emerald-400 font-medium">Isolated Tenant Space</span>
              </p>
            </div>
          </div>
        </div>

        {/* Global Module Navigation Pills (Desktop) */}
        <nav className="hidden lg:flex items-center gap-1 bg-dark-surface/60 p-1 rounded-xl border border-dark-border/80">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-brand-500 text-dark-bg font-bold shadow-md shadow-brand-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-dark-border/50'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`text-2xs px-1.5 py-0.2 rounded-full font-bold font-mono ${
                      isActive
                        ? 'bg-dark-bg text-brand-400'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Global Controls & In-App User Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Command Palette */}
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Command className="w-3.5 h-3.5 text-brand-400" />}
            onClick={() => setIsCommandOpen(true)}
            className="hidden sm:inline-flex text-xs"
          >
            <kbd className="text-2xs font-mono bg-dark-surface px-1 py-0.5 rounded border border-dark-border">Ctrl+K</kbd>
          </Button>

          {/* Back to Website Link */}
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Globe className="w-3.5 h-3.5 text-brand-400" />}
            onClick={() => {
              window.location.href = '/';
            }}
            className="hidden xl:flex text-xs text-slate-300 hover:text-white"
          >
            Back to Website
          </Button>

          {/* Quick Notification Bell */}
          <button
            onClick={() => setIsNotifDrawerOpen(true)}
            className="relative p-2 rounded-lg bg-dark-surface border border-dark-border text-slate-300 hover:text-white hover:bg-dark-border transition-colors cursor-pointer"
            title="Notification Center"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-2xs font-bold font-mono flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          <div className="h-6 w-px bg-dark-border hidden sm:block" />

          {/* User Profile & Sign Out */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Avatar name={user?.full_name || 'Admin User'} size="sm" />
              <div className="hidden xl:block text-left font-mono">
                <div className="text-xs font-semibold text-slate-200">{user?.full_name}</div>
                <div className="text-2xs text-brand-400 font-medium">{user?.role} • {tenant?.org_code}</div>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              leftIcon={<LogOut className="w-3.5 h-3.5 text-rose-400" />}
              onClick={() => logout()}
              className="text-xs text-rose-300 hover:bg-rose-500/10 hover:border-rose-500/30"
              title="Sign Out"
            >
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Breadcrumb Module Header */}
      <div className="bg-dark-surface/40 border-b border-dark-border/60 px-6 py-2 flex items-center justify-between text-xs text-slate-400 font-mono">
        <div className="flex items-center gap-2 text-2xs">
          <Layers className="w-3.5 h-3.5 text-brand-400" />
          <span>Vortiq System</span>
          <ChevronRight className="w-3 h-3 text-slate-600" />
          <span className="text-slate-200 uppercase font-bold">{activeTab === 'crm' ? 'Sales / Leads Pipeline' : activeTab} Workspace</span>
        </div>
        <div className="hidden sm:block text-2xs text-slate-400">
          Design System: <span className="text-brand-400">Vortiq Design Tokens</span> • Security: Encrypted Tenant Space
        </div>
      </div>

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
          { id: '0', title: 'Executive Operational Dashboard', category: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4 text-emerald-400" />, onSelect: () => setActiveTab('dashboard') },
          { id: '1', title: 'Sales / Leads Pipeline & Deals', category: 'Sales', icon: <Users className="w-4 h-4 text-emerald-400" />, onSelect: () => setActiveTab('crm') },
          { id: '2', title: 'Finance & Tax Invoicing', category: 'Finance', icon: <IndianRupee className="w-4 h-4 text-emerald-400" />, onSelect: () => setActiveTab('finance') },
          { id: '3', title: 'HR Directory & Statutory Payroll', category: 'HR', icon: <UserCheck className="w-4 h-4 text-brand-400" />, onSelect: () => setActiveTab('hr') },
          { id: '4', title: 'Marketing Campaigns & Segments', category: 'Marketing', icon: <Megaphone className="w-4 h-4 text-amber-400" />, onSelect: () => setActiveTab('marketing') },
          { id: '5', title: 'Task Board & Documentation Wiki', category: 'Tasks', icon: <CheckSquare className="w-4 h-4 text-blue-400" />, onSelect: () => setActiveTab('tasks') },
          { id: '6', title: 'Inventory Register & Photo Scan', category: 'Inventory', icon: <Package className="w-4 h-4 text-amber-400" />, onSelect: () => setActiveTab('inventory') },
          { id: '7', title: 'Admin Settings & Security Log', category: 'Admin', icon: <Shield className="w-4 h-4 text-violet-400" />, onSelect: () => setActiveTab('admin') },
          { id: '8', title: 'Notifications Center', category: 'Notifications', icon: <Bell className="w-4 h-4 text-rose-400" />, onSelect: () => setActiveTab('notifications') },
        ]}
      />

      {/* Auth & Setup Modals */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <OnboardingWizardModal isOpen={isOnboardingOpen} onClose={() => setIsOnboardingOpen(false)} />
    </div>
  );
};
