// Local Admin Types extending global DB schema & HubSpot/Zoho Admin Parity
import { Tenant, TenantSubscription, UserProfile, PlanTier } from '@/types';

export type AdminTab = 'overview' | 'users' | 'custom_roles' | 'api_keys' | 'data_export' | 'notifications';

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

export interface ModulePermission {
  can_view: boolean;
  can_edit: boolean;
  can_delete: boolean;
  mask_financials: boolean;
}

export interface CustomRole {
  id: string;
  tenant_id: string;
  role_name: string;
  description: string;
  permissions: {
    crm: ModulePermission;
    finance: ModulePermission;
    hr: ModulePermission;
    inventory: ModulePermission;
    tasks: ModulePermission;
  };
  created_at: string;
}

export interface ApiKeyProfile {
  id: string;
  tenant_id: string;
  name: string;
  key_prefix: string; // e.g. vtq_live_a89f...
  scopes: string[]; // e.g. ["crm:read", "finance:read", "inventory:write"]
  rate_limit_per_min: number;
  allowed_ips: string[];
  status: 'active' | 'revoked' | 'expired';
  expires_at?: string;
  created_at: string;
}

export interface UserNotificationPreference {
  id: string;
  tenant_id: string;
  user_id: string;
  user_name: string;
  email_enabled: boolean;
  sms_enabled: boolean;
  whatsapp_enabled: boolean;
  in_app_enabled: boolean;
  notify_deletions: boolean;
  notify_salary_changes: boolean;
}

export interface AdminAuditLog {
  id: string;
  tenant_id: string;
  action_type: 'role_created' | 'api_key_generated' | 'permission_updated' | 'user_invited' | 'data_exported';
  description: string;
  performed_by_name: string;
  created_at: string;
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

// ── Seed Datasets ─────────────────────────────────────────────

export const SEED_CUSTOM_ROLES: CustomRole[] = [
  {
    id: 'crole-101',
    tenant_id: 'tenant-prod-001',
    role_name: 'Regional Sales Manager',
    description: 'Full CRM lead pipeline access, read-only Inventory, masked compensation & financial values.',
    permissions: {
      crm: { can_view: true, can_edit: true, can_delete: false, mask_financials: false },
      finance: { can_view: false, can_edit: false, can_delete: false, mask_financials: true },
      hr: { can_view: false, can_edit: false, can_delete: false, mask_financials: true },
      inventory: { can_view: true, can_edit: false, can_delete: false, mask_financials: true },
      tasks: { can_view: true, can_edit: true, can_delete: false, mask_financials: false },
    },
    created_at: new Date().toISOString(),
  },
];

export const SEED_API_KEYS: ApiKeyProfile[] = [
  {
    id: 'apk-101',
    tenant_id: 'tenant-prod-001',
    name: 'Production ERP & Zapier Webhook Sync Key',
    key_prefix: 'vtq_live_89fa9102',
    scopes: ['crm:read', 'finance:read', 'inventory:write'],
    rate_limit_per_min: 100,
    allowed_ips: ['103.21.244.0/24'],
    status: 'active',
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
];

export const SEED_ADMIN_AUDIT_LOGS: AdminAuditLog[] = [
  {
    id: 'aal-101',
    tenant_id: 'tenant-prod-001',
    action_type: 'role_created',
    description: 'Created custom RBAC role: Regional Sales Manager with field-level financial masking',
    performed_by_name: 'Alex Vance',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
];
