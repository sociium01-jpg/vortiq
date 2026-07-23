import React, { useState } from 'react';
import {
  Card,
  Button,
  Badge,
  DataTable,
  Modal,
  Drawer,
  Toast,
  Select,
  Input,
  Column,
} from '@/design-system';
import { RBACGuard } from '@/auth/RBACGuard';
import { SubscriptionManager } from './SubscriptionManager';
import { UserRbacManager } from './UserRbacManager';
import {
  AdminTenant,
  SystemAlert,
  SystemHealthService,
} from './types';
import {
  Building2,
  Users,
  CreditCard,
  Activity,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Server,
  Plus,
} from 'lucide-react';

const INITIAL_TENANTS: AdminTenant[] = [
  {
    id: 'tenant-acme-001',
    name: 'Acme Corp',
    slug: 'acme-corp',
    domain: 'acme.vortiq.app',
    plan_tier: 'pro',
    status: 'active',
    active_users_count: 18,
    mrr: 7999,
    contact_email: 'billing@acme.com',
    razorpay_customer_id: 'cust_N109aBx718',
    last_activity: '2026-07-23T14:10:00Z',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-07-23T14:10:00Z',
  },
  {
    id: 'tenant-tech-002',
    name: 'TechNova Solutions',
    slug: 'technova',
    domain: 'technova.vortiq.app',
    plan_tier: 'enterprise',
    status: 'active',
    active_users_count: 64,
    mrr: 19999,
    contact_email: 'admin@technova.io',
    razorpay_customer_id: 'cust_N210cCy829',
    last_activity: '2026-07-23T13:45:00Z',
    created_at: '2026-02-15T00:00:00Z',
    updated_at: '2026-07-23T13:45:00Z',
  },
  {
    id: 'tenant-global-003',
    name: 'Global Retailers Ltd',
    slug: 'global-retail',
    plan_tier: 'starter',
    status: 'trialing',
    active_users_count: 4,
    mrr: 2999,
    contact_email: 'ops@globalretail.com',
    last_activity: '2026-07-22T09:15:00Z',
    created_at: '2026-07-10T00:00:00Z',
    updated_at: '2026-07-22T09:15:00Z',
  },
  {
    id: 'tenant-alpha-004',
    name: 'Alpha Logistics',
    slug: 'alpha-logistics',
    plan_tier: 'pro',
    status: 'suspended',
    active_users_count: 12,
    mrr: 0,
    contact_email: 'support@alphalog.in',
    last_activity: '2026-07-01T10:00:00Z',
    created_at: '2026-03-01T00:00:00Z',
    updated_at: '2026-07-01T10:00:00Z',
  },
];

const INITIAL_HEALTH_SERVICES: SystemHealthService[] = [
  {
    id: 'srv-db',
    name: 'PostgreSQL Multi-Tenant DB (RLS)',
    status: 'healthy',
    latency_ms: 12,
    uptime_percentage: 99.98,
    last_check: '2026-07-23T14:40:00Z',
  },
  {
    id: 'srv-razorpay',
    name: 'Razorpay Payment Gateway API',
    status: 'healthy',
    latency_ms: 145,
    uptime_percentage: 99.95,
    last_check: '2026-07-23T14:41:00Z',
  },
  {
    id: 'srv-auth',
    name: 'RBAC Auth & JWT Guard',
    status: 'healthy',
    latency_ms: 8,
    uptime_percentage: 100.0,
    last_check: '2026-07-23T14:42:00Z',
  },
  {
    id: 'srv-storage',
    name: 'S3/GCS Attachment Storage',
    status: 'healthy',
    latency_ms: 65,
    uptime_percentage: 99.9,
    last_check: '2026-07-23T14:39:00Z',
  },
  {
    id: 'srv-webhooks',
    name: 'Async Webhook Dispatcher',
    status: 'degraded',
    latency_ms: 420,
    uptime_percentage: 98.5,
    last_check: '2026-07-23T14:42:30Z',
  },
];

const INITIAL_ALERTS: SystemAlert[] = [
  {
    id: 'alt-001',
    severity: 'warning',
    component: 'Webhooks',
    title: 'Webhook Retry Queue Spiked',
    message: 'High latency detected in Razorpay subscription renewal webhook processor.',
    timestamp: '2026-07-23T14:15:00Z',
    resolved: false,
  },
  {
    id: 'alt-002',
    severity: 'critical',
    component: 'Razorpay Gateway',
    title: 'Bank OTP Timeout Rate Exceeded',
    message: 'Netbanking gateway experienced 4.2% drop in transaction completions for HDFC.',
    timestamp: '2026-07-22T19:30:00Z',
    resolved: true,
  },
  {
    id: 'alt-003',
    severity: 'info',
    component: 'Database',
    title: 'Weekly RLS Policy Verification Passed',
    message: 'Automated test suite verified 11 tenant tables for 100% data isolation compliance.',
    timestamp: '2026-07-21T00:00:00Z',
    resolved: true,
  },
];

export const AdminModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'subscriptions' | 'users' | 'health'>('overview');
  const [tenants, setTenants] = useState<AdminTenant[]>(INITIAL_TENANTS);
  const [alerts, setAlerts] = useState<SystemAlert[]>(INITIAL_ALERTS);
  const [healthServices] = useState<SystemHealthService[]>(INITIAL_HEALTH_SERVICES);
  const [selectedTenant, setSelectedTenant] = useState<AdminTenant | null>(null);
  const [isAddTenantModalOpen, setIsAddTenantModalOpen] = useState(false);
  const [newTenantName, setNewTenantName] = useState('');
  const [newTenantSlug, setNewTenantSlug] = useState('');
  const [newTenantEmail, setNewTenantEmail] = useState('');
  const [newTenantPlan, setNewTenantPlan] = useState<'starter' | 'pro' | 'enterprise'>('pro');
  const [toastNotification, setToastNotification] = useState<{ id: string; type: 'success' | 'info' | 'warning' | 'error'; title: string; message: string } | null>(null);

  const totalMrr = tenants.reduce((acc, t) => acc + (t.status === 'active' ? t.mrr : 0), 0);
  const totalUsers = tenants.reduce((acc, t) => acc + t.active_users_count, 0);

  const handleToggleTenantStatus = (tenantId: string) => {
    setTenants((prev) =>
      prev.map((t) => {
        if (t.id === tenantId) {
          const nextStatus = t.status === 'active' ? 'suspended' : 'active';
          return { ...t, status: nextStatus, updated_at: new Date().toISOString() };
        }
        return t;
      })
    );
    const target = tenants.find((t) => t.id === tenantId);
    const nextStatus = target?.status === 'active' ? 'suspended' : 'active';
    setToastNotification({
      id: Date.now().toString(),
      type: nextStatus === 'active' ? 'success' : 'warning',
      title: `Tenant ${nextStatus === 'active' ? 'Activated' : 'Suspended'}`,
      message: `${target?.name} status updated to ${nextStatus}.`,
    });
  };

  const handleCreateTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTenantName || !newTenantSlug || !newTenantEmail) return;

    const mrrValue = newTenantPlan === 'starter' ? 2999 : newTenantPlan === 'pro' ? 7999 : 19999;
    const newTenant: AdminTenant = {
      id: `tenant-${newTenantSlug}-${Math.floor(100 + Math.random() * 900)}`,
      name: newTenantName,
      slug: newTenantSlug,
      domain: `${newTenantSlug}.vortiq.app`,
      plan_tier: newTenantPlan,
      status: 'active',
      active_users_count: 1,
      mrr: mrrValue,
      contact_email: newTenantEmail,
      last_activity: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setTenants((prev) => [newTenant, ...prev]);
    setIsAddTenantModalOpen(false);
    setNewTenantName('');
    setNewTenantSlug('');
    setNewTenantEmail('');
    setToastNotification({
      id: Date.now().toString(),
      type: 'success',
      title: 'Tenant Provisioned',
      message: `New tenant ${newTenantName} created with ${newTenantPlan} plan.`,
    });
  };

  const handleResolveAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, resolved: true } : a))
    );
    setToastNotification({
      id: Date.now().toString(),
      type: 'success',
      title: 'Alert Resolved',
      message: `Alert ID ${alertId} marked as resolved.`,
    });
  };

  const tenantColumns: Column<AdminTenant>[] = [
    {
      key: 'name',
      header: 'Tenant / Client',
      sortable: true,
      render: (t) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-dark-surface border border-dark-border flex items-center justify-center font-bold text-brand-400 font-display">
            {t.name[0]}
          </div>
          <div>
            <div className="font-semibold text-slate-100">{t.name}</div>
            <div className="text-2xs text-slate-400 font-mono">{t.domain || `${t.slug}.vortiq.app`}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'plan_tier',
      header: 'Plan Tier',
      sortable: true,
      render: (t) => (
        <Badge
          variant={
            t.plan_tier === 'enterprise'
              ? 'violet'
              : t.plan_tier === 'pro'
              ? 'emerald'
              : 'blue'
          }
          className="uppercase font-mono text-2xs"
        >
          {t.plan_tier}
        </Badge>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (t) => (
        <Badge
          variant={
            t.status === 'active'
              ? 'emerald'
              : t.status === 'trialing'
              ? 'amber'
              : 'rose'
          }
          dot
        >
          {t.status}
        </Badge>
      ),
    },
    {
      key: 'active_users_count',
      header: 'Active Users',
      sortable: true,
      render: (t) => (
        <span className="font-mono text-xs text-slate-200">
          {t.active_users_count} users
        </span>
      ),
    },
    {
      key: 'mrr',
      header: 'MRR (INR)',
      sortable: true,
      render: (t) => (
        <span className="font-mono font-semibold text-xs text-slate-100">
          ₹{t.mrr.toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Manage',
      render: (t) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedTenant(t)}
          >
            Inspect
          </Button>
          <RBACGuard requiredRole="ADMIN">
            <Button
              variant={t.status === 'active' ? 'ghost' : 'outline'}
              size="sm"
              onClick={() => handleToggleTenantStatus(t.id)}
            >
              {t.status === 'active' ? 'Suspend' : 'Activate'}
            </Button>
          </RBACGuard>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {toastNotification && (
        <Toast
          id={toastNotification.id}
          type={toastNotification.type}
          title={toastNotification.title}
          message={toastNotification.message}
          onDismiss={() => setToastNotification(null)}
        />
      )}

      {/* Top Admin Dashboard Stats Header */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-brand-500 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xs font-medium text-slate-400 uppercase tracking-wider">
                Total Multi-Tenants
              </div>
              <div className="text-2xl font-extrabold text-slate-100 font-display mt-1">
                {tenants.length}
              </div>
              <div className="text-2xs text-emerald-400 font-mono mt-0.5">
                {tenants.filter((t) => t.status === 'active').length} Active • 1 Trialing
              </div>
            </div>
            <div className="p-3 bg-brand-500/10 rounded-xl text-brand-400">
              <Building2 className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="border-l-4 border-l-emerald-500 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xs font-medium text-slate-400 uppercase tracking-wider">
                Monthly Recurring Revenue
              </div>
              <div className="text-2xl font-extrabold text-slate-100 font-display mt-1">
                ₹{totalMrr.toLocaleString('en-IN')}
              </div>
              <div className="text-2xs text-emerald-400 font-mono mt-0.5">
                Razorpay Autodebit Healthy
              </div>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
              <CreditCard className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="border-l-4 border-l-blue-500 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xs font-medium text-slate-400 uppercase tracking-wider">
                Platform Active Users
              </div>
              <div className="text-2xl font-extrabold text-slate-100 font-display mt-1">
                {totalUsers}
              </div>
              <div className="text-2xs text-blue-400 font-mono mt-0.5">
                Across 4 Subscribed Clients
              </div>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="border-l-4 border-l-violet-500 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xs font-medium text-slate-400 uppercase tracking-wider">
                System Health Score
              </div>
              <div className="text-2xl font-extrabold text-slate-100 font-display mt-1">
                99.8%
              </div>
              <div className="text-2xs text-violet-400 font-mono mt-0.5">
                {alerts.filter((a) => !a.resolved).length} Pending Alerts
              </div>
            </div>
            <div className="p-3 bg-violet-500/10 rounded-xl text-violet-400">
              <Activity className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Admin Tabbed Navigation */}
      <div className="border-b border-dark-border flex items-center gap-6 text-sm font-medium">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 transition-colors relative ${
            activeTab === 'overview'
              ? 'text-brand-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Tenant Clients Overview
          </div>
          {activeTab === 'overview' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500 rounded-t-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('subscriptions')}
          className={`pb-3 transition-colors relative ${
            activeTab === 'subscriptions'
              ? 'text-brand-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Subscription & Razorpay Audit
          </div>
          {activeTab === 'subscriptions' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500 rounded-t-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 transition-colors relative ${
            activeTab === 'users'
              ? 'text-brand-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            User RBAC Manager
          </div>
          {activeTab === 'users' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500 rounded-t-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('health')}
          className={`pb-3 transition-colors relative ${
            activeTab === 'health'
              ? 'text-brand-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            System Health & Alerts
            {alerts.filter((a) => !a.resolved).length > 0 && (
              <Badge variant="rose" size="sm">
                {alerts.filter((a) => !a.resolved).length}
              </Badge>
            )}
          </div>
          {activeTab === 'health' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500 rounded-t-full" />
          )}
        </button>
      </div>

      {/* Tab 1: Tenant Clients Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-100 font-display">
                Multi-Tenant Client Registry
              </h3>
              <p className="text-xs text-slate-400">
                Registered tenants, RLS boundaries, and billing statuses
              </p>
            </div>
            <RBACGuard requiredRole="ADMIN">
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() => setIsAddTenantModalOpen(true)}
              >
                Provision New Tenant
              </Button>
            </RBACGuard>
          </div>

          <DataTable
            columns={tenantColumns}
            data={tenants}
            keyExtractor={(t) => t.id}
            searchPlaceholder="Search tenant name, slug, domain..."
            onRowClick={(t) => setSelectedTenant(t)}
          />
        </div>
      )}

      {/* Tab 2: Subscription & Razorpay Audit */}
      {activeTab === 'subscriptions' && <SubscriptionManager />}

      {/* Tab 3: User RBAC Manager */}
      {activeTab === 'users' && <UserRbacManager />}

      {/* Tab 4: System Health & Alerts */}
      {activeTab === 'health' && (
        <div className="space-y-6">
          {/* Health Service Grid */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-slate-100 font-display flex items-center gap-2">
              <Server className="w-4 h-4 text-brand-400" />
              Microservices & Infrastructure Telemetry
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {healthServices.map((srv) => (
                <Card key={srv.id} className="p-4 space-y-3 bg-dark-card border-dark-border">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-semibold text-slate-100">{srv.name}</h4>
                      <span className="text-2xs text-slate-400 font-mono">
                        Last check: {new Date(srv.last_check).toLocaleTimeString()}
                      </span>
                    </div>
                    <Badge
                      variant={
                        srv.status === 'healthy'
                          ? 'emerald'
                          : srv.status === 'degraded'
                          ? 'amber'
                          : 'rose'
                      }
                      dot
                    >
                      {srv.status}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono pt-2 border-t border-dark-border/40">
                    <span className="text-slate-400">Latency: <strong className="text-slate-200">{srv.latency_ms}ms</strong></span>
                    <span className="text-slate-400">Uptime: <strong className="text-emerald-400">{srv.uptime_percentage}%</strong></span>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* System Alerts Table */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-slate-100 font-display flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              System Event & Security Log
            </h3>

            <Card className="divide-y divide-dark-border/50 p-0 overflow-hidden bg-dark-card border-dark-border">
              {alerts.map((alt) => (
                <div key={alt.id} className="p-4 flex items-start justify-between gap-4 hover:bg-dark-surface/30 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                      alt.severity === 'critical'
                        ? 'bg-rose-500/10 text-rose-400'
                        : alt.severity === 'warning'
                        ? 'bg-amber-500/10 text-amber-400'
                        : 'bg-blue-500/10 text-blue-400'
                    }`}>
                      {alt.severity === 'critical' ? (
                        <AlertCircle className="w-4 h-4" />
                      ) : alt.severity === 'warning' ? (
                        <AlertTriangle className="w-4 h-4" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-100">{alt.title}</span>
                        <Badge variant="blue" size="sm">{alt.component}</Badge>
                        <span className="text-2xs text-slate-400 font-mono">
                          {new Date(alt.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{alt.message}</p>
                    </div>
                  </div>

                  <div>
                    {alt.resolved ? (
                      <Badge variant="emerald" size="sm">Resolved</Badge>
                    ) : (
                      <RBACGuard requiredRole="ADMIN">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResolveAlert(alt.id)}
                        >
                          Resolve Alert
                        </Button>
                      </RBACGuard>
                    )}
                  </div>
                </div>
              ))}
            </Card>
          </div>
        </div>
      )}

      {/* Provision New Tenant Modal */}
      <Modal
        isOpen={isAddTenantModalOpen}
        onClose={() => setIsAddTenantModalOpen(false)}
        title="Provision New Multi-Tenant Client"
        maxWidth="md"
        footer={
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsAddTenantModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleCreateTenant}
              leftIcon={<Building2 className="w-4 h-4" />}
            >
              Provision Tenant
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateTenant} className="space-y-4">
          <Input
            label="Tenant Organization Name"
            placeholder="e.g. Nexus Enterprises"
            value={newTenantName}
            onChange={(e) => {
              setNewTenantName(e.target.value);
              setNewTenantSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'));
            }}
            required
          />

          <Input
            label="Tenant Slug Subdomain"
            placeholder="nexus-ent"
            value={newTenantSlug}
            onChange={(e) => setNewTenantSlug(e.target.value)}
            helperText="App URL will be: https://[slug].vortiq.app"
            required
          />

          <Input
            label="Billing Contact Email"
            type="email"
            placeholder="billing@nexus.com"
            value={newTenantEmail}
            onChange={(e) => setNewTenantEmail(e.target.value)}
            required
          />

          <Select
            label="Initial Subscription Tier"
            options={[
              { value: 'starter', label: 'Starter Tier (₹2,999/mo - 5 Users)' },
              { value: 'pro', label: 'Pro Business Tier (₹7,999/mo - 25 Users)' },
              { value: 'enterprise', label: 'Enterprise Scale (₹19,999/mo - 100 Users)' },
            ]}
            value={newTenantPlan}
            onChange={(e) => setNewTenantPlan(e.target.value as any)}
          />
        </form>
      </Modal>

      {/* Tenant Detail Drawer */}
      <Drawer
        isOpen={!!selectedTenant}
        onClose={() => setSelectedTenant(null)}
        title="Tenant Client Inspection"
        width="lg"
      >
        {selectedTenant && (
          <div className="space-y-5 text-xs">
            <div className="p-4 bg-dark-surface rounded-xl border border-dark-border space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-bold text-slate-100">{selectedTenant.name}</h4>
                <Badge variant="emerald">{selectedTenant.status}</Badge>
              </div>
              <div className="text-2xs text-slate-400 font-mono">ID: {selectedTenant.id}</div>
              <div className="text-2xs text-brand-400 font-mono">Domain: {selectedTenant.domain}</div>
            </div>

            <div className="space-y-3">
              <h5 className="font-semibold text-slate-200">Subscription & Financials</h5>
              <div className="p-3 bg-dark-card border border-dark-border rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Subscription Tier</span>
                  <Badge variant="violet" className="uppercase">{selectedTenant.plan_tier}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Current MRR</span>
                  <span className="font-mono font-bold text-slate-100">₹{selectedTenant.mrr.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Razorpay Customer ID</span>
                  <span className="font-mono text-slate-300">{selectedTenant.razorpay_customer_id || 'Pending'}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h5 className="font-semibold text-slate-200">Usage & Telemetry</h5>
              <div className="p-3 bg-dark-card border border-dark-border rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Active Seat Users</span>
                  <span className="font-mono text-slate-100">{selectedTenant.active_users_count} seats</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Contact Email</span>
                  <span className="text-slate-200">{selectedTenant.contact_email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Last System Activity</span>
                  <span className="font-mono text-2xs text-slate-400">
                    {new Date(selectedTenant.last_activity).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default AdminModule;
