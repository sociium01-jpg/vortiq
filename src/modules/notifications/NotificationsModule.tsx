import React, { useState, useMemo } from 'react';
import {
  Button,
  Select,
  Card,
  Badge,
  Avatar,
  DataTable,
  Column,
  LoadingSkeleton,
  Toast,
} from '@/design-system';
import {
  Bell,
  Mail,
  MessageSquare,
  Phone,
  Send,
  CheckCheck,
  RefreshCw,
  Clock,
  ExternalLink,
  Trash2,
  Inbox,
  ShieldCheck,
  Activity,
  Check,
} from 'lucide-react';
import {
  ExtendedNotification,
  NotificationFilterState,
  NotificationTriggerPayload,
  NotificationStats,
} from './types';
import { NotificationType, NotificationChannel } from '@/types';
import { NotificationDrawer } from './NotificationDrawer';
import { NotificationTriggerModal } from './NotificationTriggerModal';

// Initial Mock Dataset for Notifications Engine
const INITIAL_NOTIFICATIONS: ExtendedNotification[] = [
  {
    id: 'notif-101',
    tenant_id: 'tenant-demo',
    user_id: 'usr-1',
    title: 'Low Stock Critical Alert: SKU-9942',
    message: 'Raw Steel Sheet (Grade A) quantity has dropped below threshold (4 units remaining vs threshold 15). Reorder required immediately.',
    type: 'stock_alert',
    channel: 'whatsapp',
    read: false,
    link: '/modules/inventory',
    action_label: 'View Inventory Item',
    created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    recipient_name: 'Procurement Desk',
    metadata: {
      sender_name: 'Inventory Daemon',
      recipient_phone: '+91 98765 43210',
      whatsapp_template_id: 'WAPP_STOCK_REORDER_ALERT_V1',
      delivery_status: 'delivered',
      delivery_timestamp: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
      entity_id: 'SKU-9942',
      entity_type: 'inventory',
    },
  },
  {
    id: 'notif-102',
    tenant_id: 'tenant-demo',
    user_id: 'usr-2',
    title: 'High Priority Task Assigned: Security Audit',
    message: 'Sarah Jenkins assigned you to "Execute Q3 Multi-Tenant RLS & Security Policy Audit". Due in 48 hours.',
    type: 'task',
    channel: 'in_app',
    read: false,
    link: '/modules/tasks',
    action_label: 'Open Task Detail',
    created_at: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    recipient_name: 'Alex Rivera',
    metadata: {
      sender_name: 'Sarah Jenkins',
      delivery_status: 'delivered',
      entity_id: 'TASK-881',
      entity_type: 'task',
    },
  },
  {
    id: 'notif-103',
    tenant_id: 'tenant-demo',
    user_id: 'usr-3',
    title: 'New Lead Qualified: Apex Fintech Corp',
    message: 'Deal value estimated at ₹45,00,000. Assigned to Senior Enterprise Rep.',
    type: 'success',
    channel: 'email',
    read: true,
    link: '/modules/crm',
    action_label: 'Inspect Lead',
    created_at: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    recipient_name: 'Sales Leads Group',
    metadata: {
      sender_name: 'CRM Webhook',
      recipient_email: 'sales-team@vortiq.com',
      email_subject: '[CRM] New Qualified Enterprise Lead - Apex Fintech',
      delivery_status: 'delivered',
      entity_id: 'LEAD-502',
      entity_type: 'lead',
    },
  },
  {
    id: 'notif-104',
    tenant_id: 'tenant-demo',
    user_id: 'usr-1',
    title: 'Payment Failed: Subscription Renewal',
    message: 'Razorpay webhook reported auto-debit failure for Pro Tier Monthly Plan. Retry scheduled in 24 hours.',
    type: 'error',
    channel: 'sms',
    read: false,
    link: '/admin/billing',
    action_label: 'Update Payment Method',
    created_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    recipient_name: 'Account Owner',
    metadata: {
      sender_name: 'Billing Gateway',
      recipient_phone: '+91 99000 11223',
      delivery_status: 'delivered',
      error_message: 'INSUFFICIENT_FUNDS',
      entity_id: 'SUB-2026-9',
      entity_type: 'subscription',
    },
  },
  {
    id: 'notif-105',
    tenant_id: 'tenant-demo',
    user_id: 'usr-4',
    title: 'Weekly Automated System Diagnostics Complete',
    message: 'All 11 Database RLS tables verified. Storage optimization completed with 0 errors.',
    type: 'info',
    channel: 'in_app',
    read: true,
    created_at: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    recipient_name: 'All Admins',
    metadata: {
      sender_name: 'System Cron',
      delivery_status: 'read',
      entity_type: 'system',
    },
  },
  {
    id: 'notif-106',
    tenant_id: 'tenant-demo',
    user_id: 'usr-1',
    title: 'WhatsApp Dispatch: Daily Delivery Dispatch List',
    message: 'Dispatched 24 shipment notifications to client WhatsApp handles with tracking IDs.',
    type: 'success',
    channel: 'whatsapp',
    read: true,
    created_at: new Date(Date.now() - 1000 * 60 * 720).toISOString(),
    recipient_name: 'Logistics Team',
    metadata: {
      sender_name: 'WhatsApp Engine',
      whatsapp_template_id: 'WAPP_SHIPMENT_TRACKING_V2',
      delivery_status: 'delivered',
    },
  },
  {
    id: 'notif-107',
    tenant_id: 'tenant-demo',
    user_id: 'usr-5',
    title: 'Stock Depletion Warning: Bearing Unit B-20',
    message: 'Warehouse 2A reported sudden drop to 8 units. Reorder threshold is 10.',
    type: 'warning',
    channel: 'email',
    read: false,
    link: '/modules/inventory',
    action_label: 'Manage Stock',
    created_at: new Date(Date.now() - 1000 * 60 * 1100).toISOString(),
    recipient_name: 'Warehouse Manager',
    metadata: {
      sender_name: 'Inventory Daemon',
      recipient_email: 'warehouse@vortiq.com',
      email_subject: 'WARNING: Bearing Unit B-20 Low Stock',
      delivery_status: 'delivered',
    },
  },
  {
    id: 'notif-108',
    tenant_id: 'tenant-demo',
    user_id: 'usr-2',
    title: 'SMS OTP Sent: Member Verification',
    message: 'One-Time Passcode sent for new user onboarding flow.',
    type: 'info',
    channel: 'sms',
    read: true,
    created_at: new Date(Date.now() - 1000 * 60 * 1400).toISOString(),
    recipient_name: 'David Miller',
    metadata: {
      sender_name: 'Auth Provider',
      recipient_phone: '+91 91234 56789',
      delivery_status: 'delivered',
    },
  },
];

export const NotificationsModule: React.FC = () => {
  const [notifications, setNotifications] = useState<ExtendedNotification[]>(INITIAL_NOTIFICATIONS);
  const [filters, setFilters] = useState<NotificationFilterState>({
    channel: 'all',
    type: 'all',
    readStatus: 'all',
    searchTerm: '',
  });

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toastInfo, setToastInfo] = useState<{ id: string; title: string; message?: string; type: 'success' | 'info' | 'warning' | 'error' } | null>({
    id: 'init-toast',
    title: 'Notifications Module Active',
    message: 'In-App Center & Email/SMS/WhatsApp dispatches ready.',
    type: 'info',
  });

  // Calculate statistics
  const stats: NotificationStats = useMemo(() => {
    const total = notifications.length;
    const unread = notifications.filter((n) => !n.read).length;
    const inAppCount = notifications.filter((n) => n.channel === 'in_app').length;
    const emailCount = notifications.filter((n) => n.channel === 'email').length;
    const smsCount = notifications.filter((n) => n.channel === 'sms').length;
    const whatsappCount = notifications.filter((n) => n.channel === 'whatsapp').length;
    const deliveredCount = notifications.filter((n) => n.metadata?.delivery_status === 'delivered' || n.read).length;
    const deliverySuccessRate = total > 0 ? Math.round((deliveredCount / total) * 100) : 100;

    return {
      total,
      unread,
      inAppCount,
      emailCount,
      smsCount,
      whatsappCount,
      deliverySuccessRate,
    };
  }, [notifications]);

  // Filtered dataset
  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      // Channel filter
      if (filters.channel !== 'all' && n.channel !== filters.channel) return false;
      // Type filter
      if (filters.type !== 'all' && n.type !== filters.type) return false;
      // Read status filter
      if (filters.readStatus === 'unread' && n.read) return false;
      if (filters.readStatus === 'read' && !n.read) return false;
      // Search term
      if (filters.searchTerm.trim()) {
        const query = filters.searchTerm.toLowerCase();
        const matchesTitle = n.title.toLowerCase().includes(query);
        const matchesMsg = n.message.toLowerCase().includes(query);
        const matchesRecipient = n.recipient_name?.toLowerCase().includes(query) || false;
        const matchesSender = n.metadata?.sender_name?.toLowerCase().includes(query) || false;
        if (!matchesTitle && !matchesMsg && !matchesRecipient && !matchesSender) return false;
      }
      return true;
    });
  }, [notifications, filters]);

  // Actions
  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setToastInfo({
      id: Date.now().toString(),
      title: 'Inbox Updated',
      message: 'All notifications marked as read.',
      type: 'success',
    });
  };

  const handleDelete = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    setToastInfo({
      id: Date.now().toString(),
      title: 'Notification Removed',
      message: 'Notification log deleted successfully.',
      type: 'info',
    });
  };

  const handleSendBroadcast = (payload: NotificationTriggerPayload) => {
    const newNotifications: ExtendedNotification[] = payload.channels.map((ch, idx) => ({
      id: `notif-${Date.now()}-${idx}`,
      tenant_id: 'tenant-demo',
      user_id: 'usr-broadcast',
      title: payload.title,
      message: payload.message,
      type: payload.type,
      channel: ch,
      read: false,
      link: payload.link,
      action_label: payload.action_label,
      created_at: new Date().toISOString(),
      recipient_name:
        payload.targetType === 'all'
          ? 'All Members'
          : payload.targetType === 'role'
          ? `Role: ${payload.targetRole}`
          : 'Selected Group',
      metadata: {
        sender_name: 'Admin Broadcast',
        delivery_status: 'delivered',
        whatsapp_template_id: payload.templateId,
        delivery_timestamp: new Date().toISOString(),
      },
    }));

    setNotifications((prev) => [...newNotifications, ...prev]);
    setToastInfo({
      id: Date.now().toString(),
      title: 'Broadcast Dispatched!',
      message: `Sent notification to ${payload.channels.length} channel(s) (${payload.channels.join(', ')}).`,
      type: 'success',
    });
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setToastInfo({
        id: Date.now().toString(),
        title: 'Refreshed',
        message: 'Notification queue synchronized with database.',
        type: 'info',
      });
    }, 400);
  };

  // Channel helper styling
  const getChannelBadge = (channel: NotificationChannel) => {
    switch (channel) {
      case 'in_app':
        return (
          <Badge variant="blue" size="sm">
            <span className="flex items-center gap-1">
              <Bell className="w-3 h-3" /> In-App
            </span>
          </Badge>
        );
      case 'email':
        return (
          <Badge variant="amber" size="sm">
            <span className="flex items-center gap-1">
              <Mail className="w-3 h-3" /> Email
            </span>
          </Badge>
        );
      case 'sms':
        return (
          <Badge variant="violet" size="sm">
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3" /> SMS
            </span>
          </Badge>
        );
      case 'whatsapp':
        return (
          <Badge variant="emerald" size="sm">
            <span className="flex items-center gap-1">
              <MessageSquare className="w-3 h-3" /> WhatsApp
            </span>
          </Badge>
        );
    }
  };

  const getTypeBadge = (type: NotificationType) => {
    switch (type) {
      case 'info':
        return <Badge variant="slate" size="sm">Info</Badge>;
      case 'warning':
        return <Badge variant="amber" size="sm">Warning</Badge>;
      case 'success':
        return <Badge variant="emerald" size="sm">Success</Badge>;
      case 'error':
        return <Badge variant="rose" size="sm">Error</Badge>;
      case 'task':
        return <Badge variant="violet" size="sm">Task</Badge>;
      case 'stock_alert':
        return <Badge variant="rose" size="sm">Stock Alert</Badge>;
    }
  };

  // DataTable Columns definition
  const columns: Column<ExtendedNotification>[] = [
    {
      key: 'title',
      header: 'Subject & Details',
      sortable: true,
      render: (item) => (
        <div className="flex items-start gap-2.5 py-1">
          {!item.read && (
            <span className="w-2 h-2 rounded-full bg-brand-400 mt-1.5 shrink-0 animate-pulse" title="Unread" />
          )}
          <div className="space-y-0.5 min-w-0">
            <div className="font-semibold text-slate-100 flex items-center gap-2">
              <span className="truncate">{item.title}</span>
            </div>
            <p className="text-2xs text-slate-400 line-clamp-1 max-w-md">{item.message}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'channel',
      header: 'Channel',
      sortable: true,
      width: '120px',
      render: (item) => getChannelBadge(item.channel),
    },
    {
      key: 'type',
      header: 'Type',
      sortable: true,
      width: '110px',
      render: (item) => getTypeBadge(item.type),
    },
    {
      key: 'recipient',
      header: 'Recipient / Target',
      sortable: true,
      width: '160px',
      render: (item) => (
        <div className="flex items-center gap-2">
          <Avatar name={item.recipient_name || 'User'} size="sm" />
          <span className="text-xs text-slate-200 truncate">{item.recipient_name || 'All Members'}</span>
        </div>
      ),
    },
    {
      key: 'delivery_status',
      header: 'Status',
      sortable: true,
      width: '110px',
      render: (item) => (
        <Badge
          variant={
            item.read
              ? 'slate'
              : item.metadata?.delivery_status === 'delivered'
              ? 'emerald'
              : item.metadata?.delivery_status === 'failed'
              ? 'rose'
              : 'amber'
          }
          dot={!item.read}
          size="sm"
        >
          {item.read ? 'Read' : item.metadata?.delivery_status || 'Sent'}
        </Badge>
      ),
    },
    {
      key: 'created_at',
      header: 'Timestamp',
      sortable: true,
      width: '130px',
      render: (item) => (
        <span className="text-2xs font-mono text-slate-400 flex items-center gap-1">
          <Clock className="w-3 h-3 text-slate-500" />
          {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      width: '110px',
      render: (item) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          {!item.read && (
            <button
              title="Mark as Read"
              onClick={() => handleMarkAsRead(item.id)}
              className="p-1 hover:bg-dark-surface text-brand-400 hover:text-brand-300 rounded transition-colors"
            >
              <Check className="w-4 h-4" />
            </button>
          )}
          {item.link && (
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              title="Open Link"
              className="p-1 hover:bg-dark-surface text-slate-400 hover:text-slate-200 rounded transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
          <button
            title="Delete Log"
            onClick={(e) => handleDelete(item.id, e)}
            className="p-1 hover:bg-dark-surface text-slate-500 hover:text-rose-400 rounded transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto">
      {/* Toast Feedback */}
      {toastInfo && (
        <div className="fixed bottom-5 right-5 z-50">
          <Toast
            id={toastInfo.id}
            type={toastInfo.type}
            title={toastInfo.title}
            message={toastInfo.message}
            onDismiss={() => setToastInfo(null)}
          />
        </div>
      )}

      {/* Module Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-dark-card/60 p-5 rounded-2xl border border-dark-border/80 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-brand-500/10 text-brand-400 rounded-xl border border-brand-500/20">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-100 font-display tracking-tight">
                  Notifications Engine
                </h1>
                <Badge variant="emerald" size="sm">
                  Stage 1 Module E
                </Badge>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                In-app notification center, multi-channel triggers (Email, SMS, WhatsApp), and tenant broadcasts.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
            onClick={handleRefresh}
          >
            Refresh
          </Button>

          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Inbox className="w-4 h-4 text-brand-400" />}
            onClick={() => setIsDrawerOpen(true)}
            rightIcon={
              stats.unread > 0 ? (
                <Badge variant="rose" size="sm">
                  {stats.unread}
                </Badge>
              ) : undefined
            }
          >
            Unread Drawer
          </Button>

          <Button
            variant="outline"
            size="sm"
            leftIcon={<CheckCheck className="w-3.5 h-3.5 text-emerald-400" />}
            onClick={handleMarkAllAsRead}
            disabled={stats.unread === 0}
          >
            Mark All Read
          </Button>

          <Button
            variant="primary"
            size="sm"
            leftIcon={<Send className="w-4 h-4" />}
            onClick={() => setIsModalOpen(true)}
          >
            Broadcast Notification
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-brand-500 flex items-center justify-between">
          <div>
            <div className="text-2xs font-medium text-slate-400 uppercase tracking-wider">Total Dispatches</div>
            <div className="text-2xl font-bold text-slate-100 mt-1 font-mono">{stats.total}</div>
            <div className="text-2xs text-slate-400 mt-1">Logged across all channels</div>
          </div>
          <div className="p-3 bg-brand-500/10 text-brand-400 rounded-xl">
            <Activity className="w-6 h-6" />
          </div>
        </Card>

        <Card className="border-l-4 border-l-rose-500 flex items-center justify-between">
          <div>
            <div className="text-2xs font-medium text-slate-400 uppercase tracking-wider">Unread In-App</div>
            <div className="text-2xl font-bold text-slate-100 mt-1 font-mono">{stats.unread}</div>
            <div className="text-2xs text-rose-400 font-mono mt-1">Awaiting user review</div>
          </div>
          <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl">
            <Bell className="w-6 h-6" />
          </div>
        </Card>

        <Card className="border-l-4 border-l-emerald-500 flex items-center justify-between">
          <div>
            <div className="text-2xs font-medium text-slate-400 uppercase tracking-wider">WhatsApp & SMS</div>
            <div className="text-2xl font-bold text-slate-100 mt-1 font-mono">
              {stats.whatsappCount + stats.smsCount}
            </div>
            <div className="text-2xs text-emerald-400 font-mono mt-1">
              WA: {stats.whatsappCount} • SMS: {stats.smsCount}
            </div>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <MessageSquare className="w-6 h-6" />
          </div>
        </Card>

        <Card className="border-l-4 border-l-amber-500 flex items-center justify-between">
          <div>
            <div className="text-2xs font-medium text-slate-400 uppercase tracking-wider">Delivery Rate</div>
            <div className="text-2xl font-bold text-slate-100 mt-1 font-mono">{stats.deliverySuccessRate}%</div>
            <div className="text-2xs text-emerald-400 font-mono mt-1">Email: {stats.emailCount} dispatches</div>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </Card>
      </div>

      {/* Filter & Control Bar */}
      <Card className="p-4 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Channel Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {[
              { id: 'all', label: 'All Channels', count: stats.total },
              { id: 'in_app', label: 'In-App', count: stats.inAppCount, icon: <Bell className="w-3.5 h-3.5 text-blue-400" /> },
              { id: 'email', label: 'Email', count: stats.emailCount, icon: <Mail className="w-3.5 h-3.5 text-amber-400" /> },
              { id: 'sms', label: 'SMS', count: stats.smsCount, icon: <Phone className="w-3.5 h-3.5 text-violet-400" /> },
              { id: 'whatsapp', label: 'WhatsApp', count: stats.whatsappCount, icon: <MessageSquare className="w-3.5 h-3.5 text-emerald-400" /> },
            ].map((ch) => {
              const isActive = filters.channel === ch.id;
              return (
                <button
                  key={ch.id}
                  onClick={() => setFilters((prev) => ({ ...prev, channel: ch.id as any }))}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
                    isActive
                      ? 'bg-brand-500 text-dark-bg font-semibold shadow-md'
                      : 'bg-dark-surface/60 text-slate-400 hover:text-slate-200 hover:bg-dark-surface'
                  }`}
                >
                  {ch.icon}
                  <span>{ch.label}</span>
                  <span
                    className={`ml-1 text-2xs px-1.5 py-0.2 rounded-full font-mono ${
                      isActive ? 'bg-dark-bg/30 text-dark-bg' : 'bg-dark-border/60 text-slate-400'
                    }`}
                  >
                    {ch.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Secondary Dropdown Filters */}
          <div className="flex items-center gap-3">
            <div className="w-44">
              <Select
                value={filters.type}
                onChange={(e) => setFilters((prev) => ({ ...prev, type: e.target.value as any }))}
                options={[
                  { value: 'all', label: 'Filter: All Types' },
                  { value: 'info', label: 'Info' },
                  { value: 'warning', label: 'Warning' },
                  { value: 'success', label: 'Success' },
                  { value: 'error', label: 'Error' },
                  { value: 'task', label: 'Task' },
                  { value: 'stock_alert', label: 'Stock Alert' },
                ]}
              />
            </div>

            <div className="w-36">
              <Select
                value={filters.readStatus}
                onChange={(e) => setFilters((prev) => ({ ...prev, readStatus: e.target.value as any }))}
                options={[
                  { value: 'all', label: 'Status: All' },
                  { value: 'unread', label: 'Unread Only' },
                  { value: 'read', label: 'Read Only' },
                ]}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Main DataTable Section */}
      <div className="space-y-3">
        {isLoading ? (
          <Card>
            <LoadingSkeleton count={6} height="h-10" />
          </Card>
        ) : (
          <DataTable
            columns={columns}
            data={filteredNotifications}
            keyExtractor={(item) => item.id}
            searchPlaceholder="Search notifications by title, content, sender or recipient..."
            emptyTitle="No Notifications Found"
            emptyDescription="There are no notifications matching your search or channel filters."
            onRowClick={(item) => {
              if (!item.read) handleMarkAsRead(item.id);
              setIsDrawerOpen(true);
            }}
          />
        )}
      </div>

      {/* Slide-over Drawer for Unread & Inspector */}
      <NotificationDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        notifications={notifications}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
        onOpenTriggerModal={() => {
          setIsDrawerOpen(false);
          setIsModalOpen(true);
        }}
      />

      {/* Broadcast Modal */}
      <NotificationTriggerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSend={handleSendBroadcast}
      />
    </div>
  );
};
