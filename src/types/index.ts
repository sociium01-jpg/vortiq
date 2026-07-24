// Core Application & Domain Types for Vortiq

export type UserRole = 'OWNER' | 'ADMIN' | 'MANAGER' | 'MEMBER' | 'HR_ADMIN' | 'FINANCE_ADMIN';
export type UserStatus = 'active' | 'invited' | 'disabled';
export type PlanTier = 'starter' | 'pro' | 'enterprise';

export interface Tenant {
  id: string;
  org_code: string;
  name: string;
  slug: string;
  domain?: string;
  plan_tier: PlanTier;
  status: 'active' | 'suspended' | 'trialing';
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  tenant_id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  phone?: string;
  status: UserStatus;
  created_at: string;
  updated_at: string;
}

// CRM Module Types
export type LeadStatus = 'open' | 'won' | 'lost' | 'nurture';

export interface PipelineStage {
  id: string;
  tenant_id: string;
  name: string;
  sort_order: number;
  color: string;
  created_at: string;
}

export interface Lead {
  id: string;
  tenant_id: string;
  title: string;
  company_name?: string;
  contact_person: string;
  email?: string;
  phone?: string;
  estimated_value: number;
  currency: string;
  stage_id?: string;
  assigned_to?: string;
  status: LeadStatus;
  created_at: string;
  updated_at: string;
}

// Task Module Types
export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  id: string;
  tenant_id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee_id?: string;
  creator_id?: string;
  due_date?: string;
  related_lead_id?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

// Inventory & Photo Capture Types
export interface InventoryItem {
  id: string;
  tenant_id: string;
  sku: string;
  name: string;
  category?: string;
  quantity_on_hand: number;
  reorder_threshold: number;
  unit_price: number;
  warehouse_location?: string;
  qr_code?: string;
  created_at: string;
  updated_at: string;
}

export interface PhotoAttachment {
  id: string;
  tenant_id: string;
  inventory_item_id?: string;
  task_id?: string;
  image_url: string;
  file_size_bytes?: number;
  uploaded_by?: string;
  caption?: string;
  created_at: string;
}

// Notifications Types
export type NotificationType = 'info' | 'warning' | 'success' | 'error' | 'task' | 'stock_alert';
export type NotificationChannel = 'in_app' | 'email' | 'sms' | 'whatsapp';

export interface AppNotification {
  id: string;
  tenant_id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  channel: NotificationChannel;
  read: boolean;
  link?: string;
  created_at: string;
}

// Subscriptions & Payments
export interface TenantSubscription {
  id: string;
  tenant_id: string;
  razorpay_subscription_id?: string;
  plan_name: string;
  amount: number;
  billing_cycle: 'monthly' | 'yearly';
  status: 'active' | 'past_due' | 'canceled' | 'trialing';
  current_period_start?: string;
  current_period_end?: string;
  created_at: string;
}

// Phase 2: HR & Payroll Types
export type EmploymentType = 'full_time' | 'part_time' | 'contractor' | 'intern';
export type EmployeeStatus = 'active' | 'on_leave' | 'terminated';

export interface EmployeeProfile {
  id: string;
  user_id: string;
  tenant_id: string;
  employee_code: string;
  designation: string;
  department: string;
  date_of_joining: string;
  employment_type: EmploymentType;
  work_location: string;
  manager_user_id?: string;
  status: EmployeeStatus;

  // Financials in INR Paise
  basic_salary_paise: number;
  hra_paise: number;
  special_allowance_paise: number;
  gross_salary_paise: number;

  pf_applicable: boolean;
  esi_applicable: boolean;
  pt_applicable: boolean;

  pan_masked?: string;
  bank_account_masked?: string;
  bank_ifsc?: string;
  bank_name?: string;

  created_at: string;
  updated_at: string;
}

export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface LeaveRequest {
  id: string;
  tenant_id: string;
  employee_user_id: string;
  leave_policy_id?: string;
  from_date: string;
  to_date: string;
  days_count: number;
  reason?: string;
  status: LeaveStatus;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
}

export interface PayrollRun {
  id: string;
  tenant_id: string;
  pay_period_month: number;
  pay_period_year: number;
  status: 'draft' | 'approved' | 'disbursed';
  total_gross_paise: number;
  total_net_paise: number;
  created_by?: string;
  approved_by?: string;
  created_at: string;
}

// Phase 2: Finance Types
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled' | 'credit_note';
export type GstTreatment = 'b2b' | 'b2c' | 'export' | 'sez' | 'exempt';

export interface Customer {
  id: string;
  tenant_id: string;
  lead_id?: string;
  name: string;
  gstin?: string;
  pan?: string;
  billing_address?: string;
  state_code?: string;
  email?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface InvoiceLineItem {
  id: string;
  invoice_id: string;
  tenant_id: string;
  description: string;
  hsn_sac_code?: string;
  quantity: number;
  unit_price_paise: number;
  gst_rate_percent: number;
  amount_paise: number;
  created_at: string;
}

export interface Invoice {
  id: string;
  tenant_id: string;
  customer_id: string;
  lead_id?: string;
  invoice_number: string;
  invoice_date: string;
  due_date?: string;
  status: InvoiceStatus;
  place_of_supply?: string;
  gst_treatment: GstTreatment;
  is_igst: boolean;
  subtotal_paise: number;
  cgst_paise: number;
  sgst_paise: number;
  igst_paise: number;
  tds_paise: number;
  total_paise: number;
  notes?: string;
  line_items?: InvoiceLineItem[];
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface TdsRecord {
  id: string;
  tenant_id: string;
  invoice_id?: string;
  deductee_pan: string;
  section_code: string; // '194C', '194J', '192'
  tds_rate_percent: number;
  base_amount_paise: number;
  tds_amount_paise: number;
  quarter?: string;
  financial_year: string;
  challan_number?: string;
  deposit_date?: string;
  created_at: string;
}

// Phase 2: Marketing Types
export interface MarketingSegment {
  id: string;
  tenant_id: string;
  name: string;
  description?: string;
  filter_rules: Record<string, any>;
  member_count: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface CampaignTemplate {
  id: string;
  tenant_id: string;
  name: string;
  channel: 'email' | 'whatsapp' | 'sms' | 'in_app';
  subject?: string;
  body: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Campaign {
  id: string;
  tenant_id: string;
  name: string;
  template_id?: string;
  segment_id?: string;
  channel: 'email' | 'whatsapp' | 'sms' | 'in_app';
  status: 'draft' | 'scheduled' | 'running' | 'completed' | 'paused';
  scheduled_at?: string;
  sent_count: number;
  open_count: number;
  click_count: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

