// Core Application & Domain Types for Vortiq

export type UserRole = 'OWNER' | 'ADMIN' | 'MANAGER' | 'MEMBER';
export type UserStatus = 'active' | 'invited' | 'disabled';
export type PlanTier = 'starter' | 'pro' | 'enterprise';

export interface Tenant {
  id: string;
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
