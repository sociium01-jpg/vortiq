-- ==========================================
-- VORTIQ MULTI-TENANT SCHEMA & RLS MIGRATION
-- Migration Version: 20260723000000
-- Description: Core Schema, RBAC, Multi-tenant Isolation via Row Level Security
-- ==========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------
-- 1. TENANTS & USERS
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS public.tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    domain VARCHAR(255),
    plan_tier VARCHAR(50) DEFAULT 'pro' CHECK (plan_tier IN ('starter', 'pro', 'enterprise')),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'trialing')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'MEMBER' CHECK (role IN ('OWNER', 'ADMIN', 'MANAGER', 'MEMBER')),
    avatar_url TEXT,
    phone VARCHAR(50),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'invited', 'disabled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_tenant_id ON public.users(tenant_id);

-- ------------------------------------------
-- 2. CRM MODULE TABLES
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS public.crm_pipeline_stages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    sort_order INT DEFAULT 0,
    color VARCHAR(20) DEFAULT '#10b981',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.crm_leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    company_name VARCHAR(255),
    contact_person VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    estimated_value NUMERIC(12, 2) DEFAULT 0.00,
    currency VARCHAR(10) DEFAULT 'INR',
    stage_id UUID REFERENCES public.crm_pipeline_stages(id) ON DELETE SET NULL,
    assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'won', 'lost', 'nurture')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_crm_leads_tenant_stage ON public.crm_leads(tenant_id, stage_id);

CREATE TABLE IF NOT EXISTS public.crm_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    lead_id UUID NOT NULL REFERENCES public.crm_leads(id) ON DELETE CASCADE,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    activity_type VARCHAR(50) NOT NULL CHECK (activity_type IN ('call', 'meeting', 'email', 'note', 'status_change')),
    content TEXT NOT NULL,
    scheduled_at TIMESTAMPTZ,
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------
-- 3. TASK MANAGEMENT TABLES
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'todo' CHECK (status IN ('backlog', 'todo', 'in_progress', 'review', 'done')),
    priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    assignee_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    creator_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    due_date TIMESTAMPTZ,
    related_lead_id UUID REFERENCES public.crm_leads(id) ON DELETE SET NULL,
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tasks_tenant_status ON public.tasks(tenant_id, status);

CREATE TABLE IF NOT EXISTS public.task_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------
-- 4. INVENTORY & PHOTO CAPTURE TABLES
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS public.inventory_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    sku VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    quantity_on_hand INT NOT NULL DEFAULT 0,
    reorder_threshold INT NOT NULL DEFAULT 10,
    unit_price NUMERIC(12, 2) DEFAULT 0.00,
    warehouse_location VARCHAR(100),
    qr_code VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_sku_per_tenant UNIQUE (tenant_id, sku)
);

CREATE INDEX idx_inventory_tenant_sku ON public.inventory_items(tenant_id, sku);

CREATE TABLE IF NOT EXISTS public.photo_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    inventory_item_id UUID REFERENCES public.inventory_items(id) ON DELETE CASCADE,
    task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    file_size_bytes INT,
    uploaded_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    caption TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------
-- 5. ADMIN, SUBSCRIPTIONS & NOTIFICATIONS
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    razorpay_subscription_id VARCHAR(255),
    plan_name VARCHAR(100) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    billing_cycle VARCHAR(50) DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'canceled', 'trialing')),
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'error', 'task', 'stock_alert')),
    channel VARCHAR(50) DEFAULT 'in_app' CHECK (channel IN ('in_app', 'email', 'sms', 'whatsapp')),
    read BOOLEAN DEFAULT false,
    link VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_tenant_user ON public.notifications(tenant_id, user_id, read);

-- ==========================================
-- HELPER FUNCTIONS FOR RLS & SECURITY
-- ==========================================

-- Extract Tenant ID from JWT claims
CREATE OR REPLACE FUNCTION public.current_tenant_id()
RETURNS UUID AS $$
BEGIN
    RETURN (auth.jwt() ->> 'tenant_id')::UUID;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Check User Role from Users table
CREATE OR REPLACE FUNCTION public.has_role(required_role TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role FROM public.users WHERE id = auth.uid();
    IF required_role = 'MEMBER' THEN RETURN TRUE; END IF;
    IF required_role = 'MANAGER' AND user_role IN ('MANAGER', 'ADMIN', 'OWNER') THEN RETURN TRUE; END IF;
    IF required_role = 'ADMIN' AND user_role IN ('ADMIN', 'OWNER') THEN RETURN TRUE; END IF;
    IF required_role = 'OWNER' AND user_role = 'OWNER' THEN RETURN TRUE; END IF;
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Enable RLS on all public tables
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photo_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Tenants Policy
CREATE POLICY tenant_isolation_policy ON public.tenants
    FOR ALL USING (id = public.current_tenant_id());

-- Users Policy
CREATE POLICY users_isolation_policy ON public.users
    FOR ALL USING (tenant_id = public.current_tenant_id());

-- CRM Stages Policy
CREATE POLICY crm_stages_isolation_policy ON public.crm_pipeline_stages
    FOR ALL USING (tenant_id = public.current_tenant_id());

-- CRM Leads Policy
CREATE POLICY crm_leads_isolation_policy ON public.crm_leads
    FOR ALL USING (tenant_id = public.current_tenant_id());

-- CRM Activities Policy
CREATE POLICY crm_activities_isolation_policy ON public.crm_activities
    FOR ALL USING (tenant_id = public.current_tenant_id());

-- Tasks Policy
CREATE POLICY tasks_isolation_policy ON public.tasks
    FOR ALL USING (tenant_id = public.current_tenant_id());

-- Task Comments Policy
CREATE POLICY task_comments_isolation_policy ON public.task_comments
    FOR ALL USING (tenant_id = public.current_tenant_id());

-- Inventory Items Policy
CREATE POLICY inventory_isolation_policy ON public.inventory_items
    FOR ALL USING (tenant_id = public.current_tenant_id());

-- Photo Attachments Policy
CREATE POLICY photo_attachments_isolation_policy ON public.photo_attachments
    FOR ALL USING (tenant_id = public.current_tenant_id());

-- Subscriptions Policy
CREATE POLICY subscriptions_isolation_policy ON public.subscriptions
    FOR ALL USING (tenant_id = public.current_tenant_id());

-- Notifications Policy
CREATE POLICY notifications_isolation_policy ON public.notifications
    FOR ALL USING (tenant_id = public.current_tenant_id());
