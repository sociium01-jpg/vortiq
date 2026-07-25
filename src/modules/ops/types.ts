// ─────────────────────────────────────────────────────────────
// Vortiq Internal Ops Backend — Types & Seed Data
// Superadmin Client Directory, Manual Payment Ledger, & Ops Alerts
// ─────────────────────────────────────────────────────────────

export type OpsSubscriptionStatus = 'active' | 'trial' | 'suspended' | 'cancelled';
export type OpsPlanTier = 'starter' | 'pro' | 'enterprise';
export type ManualPaymentMethod = 'Bank Transfer (NEFT/RTGS)' | 'Cheque' | 'Manual Card' | 'Cash';

export interface OpsClientOrg {
  id: string; // tenant_id
  org_name: string;
  org_code: string;
  admin_name: string;
  admin_email: string;
  plan_tier: OpsPlanTier;
  subscription_status: OpsSubscriptionStatus;
  signup_date: string;
  billing_period_end: string; // ISO date string
  seats_allocated: number;
  seats_used: number;
  last_payment_date?: string;
  total_paid_rupees: number;
  notes?: string;
}

export interface ManualPaymentRecord {
  id: string;
  tenant_id: string;
  org_name: string;
  amount_rupees: number;
  payment_method: ManualPaymentMethod;
  payment_date: string;
  period_covered: string; // e.g. "July 2026 - August 2026"
  recorded_by_name: string; // Vortiq employee
  reference_number: string;
  is_manually_recorded: true;
  created_at: string;
}

export interface OpsAlert {
  id: string;
  tenant_id: string;
  org_name: string;
  alert_type: 'trial_expiring' | 'payment_overdue' | 'seat_limit_exceeded';
  severity: 'high' | 'warning' | 'info';
  message: string;
  due_date: string;
  read: boolean;
  created_at: string;
}

export const SEED_OPS_CLIENTS: OpsClientOrg[] = [
  {
    id: 'tenant-prod-001',
    org_name: 'Vortiq Logistics & Manufacturing',
    org_code: 'ORG-9901-VTQ',
    admin_name: 'Alex Vance',
    admin_email: 'admin@vortiq.biz',
    plan_tier: 'pro',
    subscription_status: 'active',
    signup_date: '2026-01-15',
    billing_period_end: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
    seats_allocated: 25,
    seats_used: 18,
    last_payment_date: '2026-07-01',
    total_paid_rupees: 149994,
    notes: 'Key Enterprise account withcustom Tally sync',
  },
  {
    id: 'tenant-org-1002',
    org_name: 'Reliance Retail Logistics',
    org_code: 'ORG-1002-VTQ',
    admin_name: 'Vikram Malhotra',
    admin_email: 'vikram@relianceretail.com',
    plan_tier: 'enterprise',
    subscription_status: 'active',
    signup_date: '2026-03-01',
    billing_period_end: new Date(Date.now() + 45 * 86400000).toISOString().split('T')[0],
    seats_allocated: 100,
    seats_used: 64,
    last_payment_date: '2026-06-15',
    total_paid_rupees: 450000,
    notes: 'Annual Enterprise Plan paid by NEFT',
  },
  {
    id: 'tenant-org-1003',
    org_name: 'Kavita Traders Mumbai',
    org_code: 'ORG-1003-VTQ',
    admin_name: 'Kavita Sharma',
    admin_email: 'kavita@kavitatraders.in',
    plan_tier: 'starter',
    subscription_status: 'trial',
    signup_date: new Date(Date.now() - 11 * 86400000).toISOString().split('T')[0],
    billing_period_end: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0], // 3 days remaining!
    seats_allocated: 5,
    seats_used: 3,
    total_paid_rupees: 0,
    notes: 'Trial expiring in 3 days. Internal sales follow-up required.',
  },
  {
    id: 'tenant-org-1004',
    org_name: 'Verma Constructions Pune',
    org_code: 'ORG-1004-VTQ',
    admin_name: 'Rahul Verma',
    admin_email: 'rahul@vermaconstructions.com',
    plan_tier: 'pro',
    subscription_status: 'suspended',
    signup_date: '2026-02-10',
    billing_period_end: new Date(Date.now() - 10 * 86400000).toISOString().split('T')[0], // Overdue by 10 days!
    seats_allocated: 15,
    seats_used: 12,
    last_payment_date: '2026-05-10',
    total_paid_rupees: 74997,
    notes: 'Overdue billing period by 10 days. Account temporarily suspended.',
  },
];

export const SEED_MANUAL_PAYMENTS: ManualPaymentRecord[] = [
  {
    id: 'mp-001',
    tenant_id: 'tenant-prod-001',
    org_name: 'Vortiq Logistics & Manufacturing',
    amount_rupees: 24999,
    payment_method: 'Bank Transfer (NEFT/RTGS)',
    payment_date: '2026-07-01',
    period_covered: 'July 2026 - August 2026',
    recorded_by_name: 'Priya Sharma (Internal Ops)',
    reference_number: 'NEFT-HDFC-9901882',
    is_manually_recorded: true,
    created_at: '2026-07-01T10:30:00Z',
  },
  {
    id: 'mp-002',
    tenant_id: 'tenant-org-1002',
    org_name: 'Reliance Retail Logistics',
    amount_rupees: 450000,
    payment_method: 'Bank Transfer (NEFT/RTGS)',
    payment_date: '2026-06-15',
    period_covered: 'Annual 2026-2027',
    recorded_by_name: 'Alex Vance (Superadmin)',
    reference_number: 'RTGS-ICICI-4411029',
    is_manually_recorded: true,
    created_at: '2026-06-15T14:15:00Z',
  },
];

export const SEED_OPS_ALERTS: OpsAlert[] = [
  {
    id: 'oa-001',
    tenant_id: 'tenant-org-1003',
    org_name: 'Kavita Traders Mumbai',
    alert_type: 'trial_expiring',
    severity: 'warning',
    message: 'Trial expiring in 3 days (July 28, 2026). Contact admin Kavita Sharma.',
    due_date: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
    read: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 'oa-002',
    tenant_id: 'tenant-org-1004',
    org_name: 'Verma Constructions Pune',
    alert_type: 'payment_overdue',
    severity: 'high',
    message: 'No payment logged past period end date (July 15, 2026). Account suspended.',
    due_date: new Date(Date.now() - 10 * 86400000).toISOString().split('T')[0],
    read: false,
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
];
