// Local Admin Types extending global DB schema
import { Tenant, TenantSubscription, UserProfile, PlanTier } from '@/types';

export interface AdminTenant extends Tenant {
  active_users_count: number;
  mrr: number;
  last_activity: string;
  razorpay_customer_id?: string;
  contact_email: string;
}

export interface AdminSubscription extends TenantSubscription {
  razorpay_payment_id?: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
  last_payment_status: 'captured' | 'failed' | 'pending' | 'refunded';
  last_payment_at?: string;
  next_billing_at?: string;
  auto_renew: boolean;
}

export interface AdminUser extends UserProfile {
  last_login_at?: string;
  mfa_enabled: boolean;
}

export interface SubscriptionPlanDefinition {
  id: PlanTier;
  name: string;
  price_monthly: number;
  price_yearly: number;
  features: string[];
  max_users: number;
  max_storage_gb: number;
  popular?: boolean;
}

export interface RazorpayAuditLog {
  id: string;
  tenant_id: string;
  tenant_name: string;
  amount: number;
  currency: string;
  status: 'captured' | 'failed' | 'authorized' | 'refunded';
  method: 'card' | 'upi' | 'netbanking' | 'wallet';
  razorpay_payment_id: string;
  razorpay_subscription_id: string;
  created_at: string;
  error_description?: string;
}

export interface SystemAlert {
  id: string;
  severity: 'info' | 'warning' | 'critical';
  component: 'Database' | 'Razorpay Gateway' | 'RBAC Auth' | 'Object Storage' | 'Webhooks';
  title: string;
  message: string;
  timestamp: string;
  resolved: boolean;
}

export interface SystemHealthService {
  id: string;
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  latency_ms: number;
  uptime_percentage: number;
  last_check: string;
}
