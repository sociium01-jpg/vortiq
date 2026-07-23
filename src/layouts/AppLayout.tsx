import React, { useState } from 'react';
import { useAuth } from '@/auth/AuthContext';
import { CrmModule } from '@/modules/crm/CrmModule';
import { TaskModule } from '@/modules/tasks/TaskModule';
import { InventoryModule } from '@/modules/inventory/InventoryModule';
import { AdminModule } from '@/modules/admin/AdminModule';
import { NotificationsModule } from '@/modules/notifications/NotificationsModule';
import { NotificationDrawer } from '@/modules/notifications/NotificationDrawer';
import { AppNotification } from '@/types';
import {
  Button,
  Select,
  Avatar,
  CommandPalette,
} from '@/design-system';
import {
  Users,
  CheckSquare,
  Package,
  Shield,
  Bell,
  Command,
  Layers,
  ChevronRight,
} from 'lucide-react';

export type ModuleTab = 'crm' | 'tasks' | 'inventory' | 'admin' | 'notifications';

export const AppLayout: React.FC = () => {
  const { user, tenant, loginDemo } = useAuth();
  const [activeTab, setActiveTab] = useState<ModuleTab>('crm');
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isNotifDrawerOpen, setIsNotifDrawerOpen] = useState(false);

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
    {
      id: 'notif-3',
      tenant_id: tenant?.id || 't-1',
      user_id: user?.id || 'u-1',
      title: 'Razorpay Auto-Renewal Succeeded',
      message: 'Pro Plan invoice ₹24,999 processed successfully.',
      type: 'success',
      channel: 'in_app',
      read: true,
      created_at: new Date(Date.now() - 86400000).toISOString(),
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
    { id: 'crm', label: 'CRM Pipeline', icon: <Users className="w-4 h-4" /> },
    { id: 'tasks', label: 'Tasks & Docs', icon: <CheckSquare className="w-4 h-4" /> },
    { id: 'inventory', label: 'Inventory & Floor', icon: <Package className="w-4 h-4" />, badge: 'Alert' },
    { id: 'admin', label: 'Admin & Billing', icon: <Shield className="w-4 h-4" /> },
    { id: 'notifications', label: 'Notifications Center', icon: <Bell className="w-4 h-4" />, badge: unreadCount > 0 ? `${unreadCount}` : undefined },
  ];

  return (
    <div className="min-h-screen bg-dark-bg text-dark-text flex flex-col font-sans">
      {/* Global Top Navbar */}
      <header className="sticky top-0 z-40 bg-dark-card/95 backdrop-blur-md border-b border-dark-border px-4 lg:px-6 py-2.5 flex items-center justify-between shadow-md">
        {/* Brand & Workspace */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab('crm')}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-brand-400 flex items-center justify-center shadow-lg shadow-brand-500/20 text-dark-bg font-black text-xl tracking-wider font-display">
              V
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold text-slate-100 font-display tracking-tight">VOR TIQ</span>
                <span className="text-2xs px-1.5 py-0.5 rounded bg-brand-500/10 text-brand-400 border border-brand-500/30 font-mono font-medium">v1.0</span>
              </div>
              <p className="text-2xs text-slate-400 font-mono hidden sm:block">
                {tenant?.name || 'Acme Operations Ltd'} • <span className="text-emerald-400">Multi-tenant RLS Active</span>
              </p>
            </div>
          </div>
        </div>

        {/* Global Module Navigation Pills (Desktop) */}
        <nav className="hidden md:flex items-center gap-1.5 bg-dark-surface/60 p-1 rounded-xl border border-dark-border/80">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
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

        {/* Global Controls & User Profile */}
        <div className="flex items-center gap-3">
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

          <div className="h-6 w-px bg-dark-border" />

          {/* RBAC Role Switcher & User Profile */}
          <div className="flex items-center gap-2">
            <Avatar name={user?.full_name || 'Admin User'} size="sm" />
            <div className="hidden lg:block text-left">
              <div className="text-xs font-semibold text-slate-200">{user?.full_name}</div>
              <div className="text-2xs text-brand-400 font-mono font-medium">{user?.role}</div>
            </div>
            <Select
              options={[
                { value: 'OWNER', label: 'OWNER' },
                { value: 'ADMIN', label: 'ADMIN' },
                { value: 'MANAGER', label: 'MANAGER' },
                { value: 'MEMBER', label: 'MEMBER' },
              ]}
              value={user?.role}
              onChange={(e) => loginDemo(e.target.value as any)}
              className="text-xs py-1 px-2 w-28"
            />
          </div>
        </div>
      </header>

      {/* Mobile Navigation Sub-Bar */}
      <div className="md:hidden bg-dark-surface border-b border-dark-border px-3 py-2 flex items-center gap-1 overflow-x-auto scrollbar-none">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
              activeTab === item.id
                ? 'bg-brand-500 text-dark-bg font-bold'
                : 'text-slate-300 bg-dark-card border border-dark-border'
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {/* Breadcrumb Module Header */}
      <div className="bg-dark-surface/40 border-b border-dark-border/60 px-6 py-2 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2 font-mono text-2xs">
          <Layers className="w-3.5 h-3.5 text-brand-400" />
          <span>Vortiq</span>
          <ChevronRight className="w-3 h-3 text-slate-600" />
          <span className="text-slate-200 capitalize">{activeTab} Module</span>
        </div>
        <div className="hidden sm:block text-2xs text-slate-400">
          Design Tokens: <span className="text-brand-400 font-mono">#10b981 Emerald</span> • Architecture: Shared Primitives
        </div>
      </div>

      {/* Active Module Viewport */}
      <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto space-y-6">
        {activeTab === 'crm' && <CrmModule />}
        {activeTab === 'tasks' && <TaskModule />}
        {activeTab === 'inventory' && <InventoryModule />}
        {activeTab === 'admin' && <AdminModule />}
        {activeTab === 'notifications' && <NotificationsModule />}
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
          { id: '1', title: 'CRM Pipeline & Deals', category: 'CRM', icon: <Users className="w-4 h-4 text-emerald-400" />, onSelect: () => setActiveTab('crm') },
          { id: '2', title: 'Task Board & Confluence Wiki', category: 'Tasks', icon: <CheckSquare className="w-4 h-4 text-blue-400" />, onSelect: () => setActiveTab('tasks') },
          { id: '3', title: 'Inventory Register & Photo Scan', category: 'Inventory', icon: <Package className="w-4 h-4 text-amber-400" />, onSelect: () => setActiveTab('inventory') },
          { id: '4', title: 'Admin Settings & Razorpay Payments', category: 'Admin', icon: <Shield className="w-4 h-4 text-violet-400" />, onSelect: () => setActiveTab('admin') },
          { id: '5', title: 'Notifications Center', category: 'Notifications', icon: <Bell className="w-4 h-4 text-rose-400" />, onSelect: () => setActiveTab('notifications') },
        ]}
      />
    </div>
  );
};
