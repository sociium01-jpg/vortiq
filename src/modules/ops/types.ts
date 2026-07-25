// ─────────────────────────────────────────────────────────────
// Vortiq Internal Ops — Domain Types & Data Models
// Restricted to Vortiq Employees Only (Separate Deployment Realm)
// ─────────────────────────────────────────────────────────────

export type OpsSubscriptionStatus = 'active' | 'trial' | 'suspended' | 'cancelled' | 'renewal_due';
export type OpsPlanTier = 'starter' | 'pro' | 'enterprise';
export type ManualPaymentMethod = 'neft_bank_transfer' | 'cheque' | 'card_offline' | 'cash';

export interface OpsClientOrg {
  id: string;
  org_name: string;
  registered_admin_email: string;
  registered_admin_name: string;
  plan_tier: OpsPlanTier;
  subscription_status: OpsSubscriptionStatus;
  signup_date: string;
  billing_period_end: string;
  seats_allocated: number;
  seats_used: number;
  monthly_recurring_revenue: number; // in INR (₹)
  org_code: string;
  notes?: string;
  payment_history?: ManualPaymentRecord[];
  audit_logs?: OpsClientAuditLog[];
}

export interface ManualPaymentRecord {
  id: string;
  client_id: string;
  client_name: string;
  amount_rupees: number;
  payment_date: string;
  payment_method: ManualPaymentMethod;
  reference_number: string;
  recorded_by_name: string;
  extension_months: number;
  notes?: string;
  is_manually_recorded: boolean;
}

export interface OpsClientAuditLog {
  id: string;
  timestamp: string;
  actor_name: string;
  action_type: 'STATUS_CHANGE' | 'SEAT_ADJUSTMENT' | 'TRIAL_EXTENSION' | 'PAYMENT_RECORDED' | 'PROVISIONING';
  details: string;
}

export interface VortiqPlatformInvoice {
  id: string;
  invoice_number: string;
  client_name: string;
  client_email: string;
  amount_rupees: number;
  tax_amount_gst: number; // 18% GST on SaaS
  billing_date: string;
  due_date: string;
  status: 'paid' | 'pending' | 'overdue';
  plan_tier: OpsPlanTier;
}

export interface VortiqOperatingExpense {
  id: string;
  vendor_name: string;
  category: 'Infrastructure & GCP' | 'APM & Sentry' | 'Twilio SMS & WhatsApp' | 'Database Backup' | 'Legal & Compliance';
  amount_rupees: number;
  expense_date: string;
  recorded_by: string;
  notes?: string;
}

export interface SecuritySignalAlert {
  id: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  signal_source: 'Supabase Auth' | 'Public API Rate Limiter' | 'Data Vault Audit Engine';
  alert_title: string;
  details: string;
  ip_address?: string;
  actor_email?: string;
  is_resolved: boolean;
}

export interface OpsAlert {
  id: string;
  type: 'trial_expiring' | 'payment_overdue' | 'seat_exceeded' | 'security_anomaly';
  severity: 'warning' | 'danger' | 'info';
  title: string;
  message: string;
  client_id?: string;
  client_name?: string;
  created_at: string;
}
