-- ==========================================
-- VORTIQ TENANT ADMIN PANEL EXPANSION
-- Migration Version: 20260730000000
-- Description: Custom RBAC Roles & Field-Level Permissions, API Key Lifecycle,
--              Org Data Exporter & Backup, User Notification Preferences, & Admin Audit Logs.
-- ==========================================

-- 1. CUSTOM RBAC ROLES & FIELD-LEVEL PERMISSIONS
CREATE TABLE IF NOT EXISTS public.custom_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    role_name VARCHAR(100) NOT NULL,
    description TEXT,
    permissions JSONB NOT NULL DEFAULT '{}'::jsonb, -- { crm: { view: true, edit: true, delete: false, mask_financials: true } }
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, role_name)
);

-- 2. SECURITY-AUDITED API KEYS
CREATE TABLE IF NOT EXISTS public.api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    key_prefix VARCHAR(30) NOT NULL, -- e.g. vtq_live_89fa
    hashed_secret TEXT NOT NULL,
    scopes JSONB NOT NULL DEFAULT '["crm:read"]'::jsonb,
    rate_limit_per_min INT DEFAULT 100,
    allowed_ips TEXT[],
    status VARCHAR(30) DEFAULT 'active' CHECK (status IN ('active', 'revoked', 'expired')),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. USER NOTIFICATION PREFERENCES
CREATE TABLE IF NOT EXISTS public.user_notification_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    email_enabled BOOLEAN DEFAULT true,
    sms_enabled BOOLEAN DEFAULT false,
    whatsapp_enabled BOOLEAN DEFAULT true,
    in_app_enabled BOOLEAN DEFAULT true,
    notify_deletions BOOLEAN DEFAULT true,
    notify_salary_changes BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, user_id)
);

-- 4. ADMINISTRATIVE SECURITY AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    action_type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    performed_by_name VARCHAR(150) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS POLICIES
ALTER TABLE public.custom_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_custom_roles ON public.custom_roles FOR ALL USING (tenant_id = public.current_tenant_id());
CREATE POLICY tenant_isolation_api_keys ON public.api_keys FOR ALL USING (tenant_id = public.current_tenant_id());
CREATE POLICY tenant_isolation_notif_prefs ON public.user_notification_preferences FOR ALL USING (tenant_id = public.current_tenant_id());
CREATE POLICY tenant_isolation_admin_audits ON public.admin_audit_logs FOR ALL USING (tenant_id = public.current_tenant_id());
