import React, { useState } from 'react';
import {
  Card,
  Button,
  Badge,
  DataTable,
  Modal,
  Toast,
  Column,
} from '@/design-system';
import { RBACGuard } from '@/auth/RBACGuard';
import {
  SubscriptionPlanDefinition,
  RazorpayAuditLog,
  AdminSubscription,
} from './types';
import {
  CreditCard,
  CheckCircle2,
  RefreshCw,
  Zap,
  ShieldCheck,
  Building2,
  Sparkles,
  AlertCircle,
} from 'lucide-react';

const SUBSCRIPTION_PLANS: SubscriptionPlanDefinition[] = [
  {
    id: 'starter',
    name: 'Starter Plan',
    price_monthly: 2999,
    price_yearly: 29990,
    max_users: 5,
    max_storage_gb: 10,
    features: [
      'Up to 5 Team Members',
      'Basic CRM & Pipeline',
      'Task Board & Workflow',
      'Standard Email Alerts',
      'Community Support',
    ],
  },
  {
    id: 'pro',
    name: 'Pro Business',
    price_monthly: 7999,
    price_yearly: 79990,
    max_users: 25,
    max_storage_gb: 100,
    popular: true,
    features: [
      'Up to 25 Team Members',
      'Advanced Lead Scoring & CRM',
      'Automated Task Workflows',
      'WhatsApp & SMS Notifications',
      'Inventory QR Code Scanner',
      'Razorpay Auto-Debit Billing',
      'Priority 24/7 Support',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise Scale',
    price_monthly: 19999,
    price_yearly: 199990,
    max_users: 100,
    max_storage_gb: 500,
    features: [
      'Unlimited Team Members',
      'Dedicated Database RLS Isolation',
      'Custom Role-Based Access Control',
      'Real-time Telemetry & Audits',
      'Dedicated Account Manager',
      'Custom Webhook Integrations',
      '99.9% SLA Guarantee',
    ],
  },
];

const INITIAL_AUDIT_LOGS: RazorpayAuditLog[] = [
  {
    id: 'pay_N8a71bX9821',
    tenant_id: 'tenant-acme-001',
    tenant_name: 'Acme Corp',
    amount: 7999,
    currency: 'INR',
    status: 'captured',
    method: 'upi',
    razorpay_payment_id: 'pay_N8a71bX9821',
    razorpay_subscription_id: 'sub_M718aBx891',
    created_at: '2026-07-22T10:15:30Z',
  },
  {
    id: 'pay_N7x62aY1930',
    tenant_id: 'tenant-tech-002',
    tenant_name: 'TechNova Solutions',
    amount: 19999,
    currency: 'INR',
    status: 'captured',
    method: 'card',
    razorpay_payment_id: 'pay_N7x62aY1930',
    razorpay_subscription_id: 'sub_M627bCy782',
    created_at: '2026-07-21T14:30:00Z',
  },
  {
    id: 'pay_N6z91cZ4820',
    tenant_id: 'tenant-global-003',
    tenant_name: 'Global Retailers Ltd',
    amount: 2999,
    currency: 'INR',
    status: 'failed',
    method: 'netbanking',
    razorpay_payment_id: 'pay_N6z91cZ4820',
    razorpay_subscription_id: 'sub_M516cDy673',
    created_at: '2026-07-20T08:45:12Z',
    error_description: 'Bank server timeout during OTP verification',
  },
  {
    id: 'pay_N5y44dX1029',
    tenant_id: 'tenant-alpha-004',
    tenant_name: 'Alpha Logistics',
    amount: 7999,
    currency: 'INR',
    status: 'captured',
    method: 'wallet',
    razorpay_payment_id: 'pay_N5y44dX1029',
    razorpay_subscription_id: 'sub_M405dEy564',
    created_at: '2026-07-18T18:20:45Z',
  },
];

const MOCK_CURRENT_SUBSCRIPTION: AdminSubscription = {
  id: 'sub_M718aBx891',
  tenant_id: 'tenant-acme-001',
  plan_name: 'Pro Business',
  amount: 7999,
  billing_cycle: 'monthly',
  status: 'active',
  current_period_start: '2026-07-01T00:00:00Z',
  current_period_end: '2026-08-01T00:00:00Z',
  created_at: '2026-01-01T00:00:00Z',
  razorpay_subscription_id: 'sub_M718aBx891',
  razorpay_payment_id: 'pay_N8a71bX9821',
  last_payment_status: 'captured',
  last_payment_at: '2026-07-22T10:15:30Z',
  next_billing_at: '2026-08-01T00:00:00Z',
  auto_renew: true,
};

export const SubscriptionManager: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [currentSub, setCurrentSub] = useState<AdminSubscription>(MOCK_CURRENT_SUBSCRIPTION);
  const [auditLogs, setAuditLogs] = useState<RazorpayAuditLog[]>(INITIAL_AUDIT_LOGS);
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedPlanModal, setSelectedPlanModal] = useState<SubscriptionPlanDefinition | null>(null);
  const [isSimulatingPayment, setIsSimulatingPayment] = useState(false);
  const [toastNotification, setToastNotification] = useState<{ id: string; type: 'success' | 'info' | 'warning' | 'error'; title: string; message: string } | null>(null);

  const handleSyncRazorpay = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      const newAuditLog: RazorpayAuditLog = {
        id: `pay_N${Math.floor(100000 + Math.random() * 900000)}`,
        tenant_id: currentSub.tenant_id,
        tenant_name: 'Current Tenant',
        amount: currentSub.amount,
        currency: 'INR',
        status: 'captured',
        method: 'upi',
        razorpay_payment_id: `pay_${Math.random().toString(36).substring(7)}`,
        razorpay_subscription_id: currentSub.razorpay_subscription_id || 'sub_demo',
        created_at: new Date().toISOString(),
      };
      setAuditLogs((prev) => [newAuditLog, ...prev]);
      setToastNotification({
        id: Date.now().toString(),
        type: 'success',
        title: 'Razorpay Sync Complete',
        message: 'All payment webhooks and subscription states verified with Razorpay API.',
      });
    }, 1200);
  };

  const handleConfirmPlanChange = () => {
    if (!selectedPlanModal) return;
    setIsSimulatingPayment(true);
    setTimeout(() => {
      setIsSimulatingPayment(false);
      const newAmount = billingCycle === 'monthly' ? selectedPlanModal.price_monthly : selectedPlanModal.price_yearly;
      const updatedSub: AdminSubscription = {
        ...currentSub,
        plan_name: selectedPlanModal.name,
        amount: newAmount,
        billing_cycle: billingCycle,
        status: 'active',
        last_payment_status: 'captured',
        last_payment_at: new Date().toISOString(),
        razorpay_payment_id: `pay_${Math.random().toString(36).substring(7)}`,
      };
      setCurrentSub(updatedSub);
      setSelectedPlanModal(null);
      setToastNotification({
        id: Date.now().toString(),
        type: 'success',
        title: 'Subscription Updated',
        message: `Tenant upgraded to ${selectedPlanModal.name} (${billingCycle}). Razorpay order verified.`,
      });
    }, 1500);
  };

  const columns: Column<RazorpayAuditLog>[] = [
    {
      key: 'id',
      header: 'Payment ID',
      sortable: true,
      render: (item) => (
        <span className="font-mono text-brand-400 font-medium text-xs">
          {item.razorpay_payment_id}
        </span>
      ),
    },
    {
      key: 'tenant_name',
      header: 'Tenant Client',
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-2">
          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="font-medium text-slate-200">{item.tenant_name}</span>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      sortable: true,
      render: (item) => (
        <span className="font-mono text-slate-100 font-semibold">
          ₹{item.amount.toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      key: 'method',
      header: 'Method',
      sortable: true,
      render: (item) => (
        <Badge variant="blue" size="sm" className="uppercase font-mono">
          {item.method}
        </Badge>
      ),
    },
    {
      key: 'status',
      header: 'Gateway Status',
      sortable: true,
      render: (item) => (
        <Badge
          variant={
            item.status === 'captured'
              ? 'emerald'
              : item.status === 'failed'
              ? 'rose'
              : item.status === 'refunded'
              ? 'amber'
              : 'blue'
          }
          dot
        >
          {item.status}
        </Badge>
      ),
    },
    {
      key: 'created_at',
      header: 'Timestamp',
      sortable: true,
      render: (item) => (
        <span className="text-2xs text-slate-400 font-mono">
          {new Date(item.created_at).toLocaleString()}
        </span>
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

      {/* Current Active Plan Banner */}
      <Card className="bg-gradient-to-r from-dark-surface via-dark-card to-dark-surface border-brand-500/30 p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-2xs font-semibold uppercase tracking-wider text-brand-400 font-mono">
                Current Active Subscription
              </span>
              <Badge variant="emerald" dot>
                {currentSub.status.toUpperCase()}
              </Badge>
              <Badge variant="violet" size="sm">
                Razorpay Autodebit
              </Badge>
            </div>
            <h3 className="text-xl font-bold text-slate-100 font-display flex items-center gap-2">
              {currentSub.plan_name}
              <span className="text-sm font-normal text-slate-400 font-mono">
                (₹{currentSub.amount.toLocaleString('en-IN')} / {currentSub.billing_cycle})
              </span>
            </h3>
            <p className="text-xs text-slate-400 flex items-center gap-3 font-mono">
              <span>Sub ID: {currentSub.razorpay_subscription_id}</span>
              <span>•</span>
              <span>Next Renewal: {new Date(currentSub.next_billing_at || '').toLocaleDateString()}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <RBACGuard requiredRole="ADMIN" fallback={
              <Badge variant="slate" size="sm">Admin Role Required to Sync</Badge>
            }>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />}
                onClick={handleSyncRazorpay}
                isLoading={isSyncing}
              >
                Sync Gateway
              </Button>
            </RBACGuard>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<CreditCard className="w-4 h-4" />}
              onClick={() => setSelectedPlanModal(SUBSCRIPTION_PLANS[1])}
            >
              Manage / Upgrade Plan
            </Button>
          </div>
        </div>
      </Card>

      {/* Subscription Plans Selection */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-100 font-display flex items-center gap-2">
              <Zap className="w-4 h-4 text-brand-400" />
              Available SaaS Subscription Plans
            </h3>
            <p className="text-xs text-slate-400">Choose the right tier for your organization scale</p>
          </div>

          {/* Billing Cycle Switcher */}
          <div className="inline-flex items-center p-1 bg-dark-surface rounded-lg border border-dark-border self-start">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                billingCycle === 'monthly'
                  ? 'bg-brand-500 text-dark-bg font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                billingCycle === 'yearly'
                  ? 'bg-brand-500 text-dark-bg font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Annual Billing
              <Badge variant="amber" size="sm">Save 20%</Badge>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {SUBSCRIPTION_PLANS.map((plan) => {
            const isCurrentPlan = currentSub.plan_name.toLowerCase().includes(plan.id);
            const price = billingCycle === 'monthly' ? plan.price_monthly : plan.price_yearly;

            return (
              <Card
                key={plan.id}
                bordered
                hoverable
                className={`relative flex flex-col justify-between p-6 transition-all ${
                  plan.popular ? 'border-brand-500/60 shadow-brand-500/10' : ''
                } ${isCurrentPlan ? 'bg-brand-950/10 border-brand-500/40' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 right-4">
                    <Badge variant="emerald" size="sm" className="shadow-md">
                      <Sparkles className="w-3 h-3 mr-1" /> Most Popular
                    </Badge>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-bold text-slate-100 font-display">{plan.name}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Up to {plan.max_users} users • {plan.max_storage_gb}GB cloud storage
                    </p>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold text-slate-100 font-display">
                      ₹{price.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-slate-400">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                  </div>

                  <div className="h-px bg-dark-border/80" />

                  <ul className="space-y-2.5 text-xs text-slate-300">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-dark-border/40">
                  <RBACGuard requiredRole="ADMIN" fallback={
                    <Button variant="outline" size="sm" className="w-full" disabled>
                      Admin Restricted
                    </Button>
                  }>
                    <Button
                      variant={isCurrentPlan ? 'secondary' : plan.popular ? 'primary' : 'outline'}
                      size="sm"
                      className="w-full"
                      disabled={isCurrentPlan}
                      onClick={() => setSelectedPlanModal(plan)}
                    >
                      {isCurrentPlan ? 'Current Active Tier' : `Select ${plan.name}`}
                    </Button>
                  </RBACGuard>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Razorpay Gateway Audit & Transaction History */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-100 font-display flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-400" />
              Razorpay Payment Audit Trail
            </h3>
            <p className="text-xs text-slate-400">Verified transaction webhooks and recurring auto-debit logs</p>
          </div>
          <Badge variant="blue" size="sm" className="font-mono">
            Gateway: Razorpay Live API (v1)
          </Badge>
        </div>

        <DataTable
          columns={columns}
          data={auditLogs}
          keyExtractor={(item) => item.id}
          searchPlaceholder="Search payment ID, tenant or status..."
        />
      </div>

      {/* Plan Upgrade / Change Modal with Razorpay Simulation */}
      <Modal
        isOpen={!!selectedPlanModal}
        onClose={() => setSelectedPlanModal(null)}
        title={`Confirm Subscription: ${selectedPlanModal?.name}`}
        maxWidth="md"
        footer={
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedPlanModal(null)}
              disabled={isSimulatingPayment}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleConfirmPlanChange}
              isLoading={isSimulatingPayment}
              leftIcon={<ShieldCheck className="w-4 h-4" />}
            >
              Proceed to Razorpay Checkout
            </Button>
          </>
        }
      >
        {selectedPlanModal && (
          <div className="space-y-4">
            <div className="p-4 bg-dark-surface rounded-xl border border-dark-border space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Target Plan</span>
                <span className="font-semibold text-slate-100">{selectedPlanModal.name}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Billing Interval</span>
                <span className="font-semibold text-brand-400 capitalize">{billingCycle}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Total Price</span>
                <span className="font-mono font-bold text-slate-100 text-sm">
                  ₹{(billingCycle === 'monthly' ? selectedPlanModal.price_monthly : selectedPlanModal.price_yearly).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="p-3 bg-blue-950/20 border border-blue-500/30 rounded-lg text-xs text-blue-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div>
                Updating your plan will issue a prorated charge on your registered Razorpay payment method (UPI / Card auto-debit).
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
