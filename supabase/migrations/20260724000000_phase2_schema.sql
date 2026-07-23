-- ==========================================
-- VORTIQ PHASE 2 SCHEMA EXTENSION MIGRATION
-- Migration Version: 20260724000000
-- Description: HR & Payroll, Finance (GST/TDS), Marketing, Access Audit, pgcrypto
-- ==========================================

-- Enable pgcrypto for sensitive field encryption (PAN, Bank Details)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------
-- 1. HR & PAYROLL MODULE TABLES
-- ------------------------------------------

-- Employee Profiles (1:1 FK to public.users)
CREATE TABLE IF NOT EXISTS public.employee_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    employee_code VARCHAR(50),
    designation VARCHAR(100),
    department VARCHAR(100),
    date_of_joining DATE,
    employment_type VARCHAR(30) DEFAULT 'full_time' CHECK (employment_type IN ('full_time', 'part_time', 'contractor', 'intern')),
    work_location VARCHAR(100) DEFAULT 'Head Office',
    manager_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'on_leave', 'terminated')),

    -- Salary structure (amounts stored in INR paise)
    basic_salary_paise BIGINT DEFAULT 0,
    hra_paise BIGINT DEFAULT 0,
    special_allowance_paise BIGINT DEFAULT 0,
    gross_salary_paise BIGINT GENERATED ALWAYS AS (basic_salary_paise + hra_paise + special_allowance_paise) STORED,

    -- Statutory settings
    pf_applicable BOOLEAN DEFAULT true,     -- PF: 12% basic (capped at ₹15,000 basic)
    esi_applicable BOOLEAN DEFAULT false,    -- ESI: gross <= ₹21,000/mo
    pt_applicable BOOLEAN DEFAULT false,     -- Professional Tax

    -- Sensitive encrypted fields (AES-256 via pgcrypto)
    pan_encrypted TEXT,
    bank_account_encrypted TEXT,
    bank_ifsc VARCHAR(12),
    bank_name VARCHAR(100),

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_employee_profiles_tenant ON public.employee_profiles(tenant_id);

CREATE TABLE IF NOT EXISTS public.leave_policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    days_per_year INT NOT NULL DEFAULT 12,
    carry_forward BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.leave_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    employee_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    leave_policy_id UUID REFERENCES public.leave_policies(id) ON DELETE SET NULL,
    from_date DATE NOT NULL,
    to_date DATE NOT NULL,
    days_count NUMERIC(4,1) NOT NULL,
    reason TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
    reviewed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.payroll_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    pay_period_month INT NOT NULL CHECK (pay_period_month BETWEEN 1 AND 12),
    pay_period_year INT NOT NULL,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'disbursed')),
    total_gross_paise BIGINT DEFAULT 0,
    total_net_paise BIGINT DEFAULT 0,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    approved_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, pay_period_month, pay_period_year)
);

CREATE TABLE IF NOT EXISTS public.payroll_line_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payroll_run_id UUID NOT NULL REFERENCES public.payroll_runs(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    employee_user_id UUID NOT NULL REFERENCES public.users(id),
    gross_paise BIGINT NOT NULL,
    pf_deduction_paise BIGINT DEFAULT 0,
    esi_deduction_paise BIGINT DEFAULT 0,
    pt_deduction_paise BIGINT DEFAULT 0,
    tds_deduction_paise BIGINT DEFAULT 0,
    other_deductions_paise BIGINT DEFAULT 0,
    net_paise BIGINT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------
-- 2. FINANCE MODULE TABLES (GST, Invoicing, TDS)
-- ------------------------------------------

-- Customers (derived from Won leads, single source of truth)
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES public.crm_leads(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    gstin VARCHAR(15),
    pan VARCHAR(10),
    billing_address TEXT,
    state_code VARCHAR(2),
    email VARCHAR(255),
    phone VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES public.crm_leads(id) ON DELETE SET NULL,
    invoice_number VARCHAR(50) NOT NULL,
    invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled', 'credit_note')),
    place_of_supply VARCHAR(2),
    gst_treatment VARCHAR(20) DEFAULT 'b2b' CHECK (gst_treatment IN ('b2b', 'b2c', 'export', 'sez', 'exempt')),
    is_igst BOOLEAN DEFAULT false,
    subtotal_paise BIGINT NOT NULL DEFAULT 0,
    cgst_paise BIGINT DEFAULT 0,
    sgst_paise BIGINT DEFAULT 0,
    igst_paise BIGINT DEFAULT 0,
    tds_paise BIGINT DEFAULT 0,
    total_paise BIGINT NOT NULL DEFAULT 0,
    notes TEXT,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, invoice_number)
);

CREATE TABLE IF NOT EXISTS public.invoice_line_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    description VARCHAR(500) NOT NULL,
    hsn_sac_code VARCHAR(10),
    quantity NUMERIC(10,3) NOT NULL DEFAULT 1,
    unit_price_paise BIGINT NOT NULL,
    gst_rate_percent NUMERIC(5,2) DEFAULT 18.00,
    amount_paise BIGINT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    payment_date DATE NOT NULL,
    amount_paise BIGINT NOT NULL,
    payment_mode VARCHAR(30) CHECK (payment_mode IN ('bank_transfer', 'cheque', 'upi', 'cash', 'razorpay', 'other')),
    reference_number VARCHAR(100),
    notes TEXT,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.tds_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
    deductee_pan VARCHAR(10) NOT NULL,
    section_code VARCHAR(10) NOT NULL, -- e.g. 194C, 194J (10%/2%), 192
    tds_rate_percent NUMERIC(5,2) NOT NULL,
    base_amount_paise BIGINT NOT NULL,
    tds_amount_paise BIGINT NOT NULL,
    quarter VARCHAR(5),
    financial_year VARCHAR(9),
    challan_number VARCHAR(50),
    deposit_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------
-- 3. MARKETING MODULE TABLES
-- ------------------------------------------

CREATE TABLE IF NOT EXISTS public.marketing_segments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    filter_rules JSONB NOT NULL DEFAULT '{}'::jsonb,
    member_count INT DEFAULT 0,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.campaign_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    channel VARCHAR(20) CHECK (channel IN ('email', 'whatsapp', 'sms', 'in_app')),
    subject VARCHAR(500),
    body TEXT NOT NULL,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    template_id UUID REFERENCES public.campaign_templates(id) ON DELETE SET NULL,
    segment_id UUID REFERENCES public.marketing_segments(id) ON DELETE SET NULL,
    channel VARCHAR(20) CHECK (channel IN ('email', 'whatsapp', 'sms', 'in_app')),
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'running', 'completed', 'paused')),
    scheduled_at TIMESTAMPTZ,
    sent_count INT DEFAULT 0,
    open_count INT DEFAULT 0,
    click_count INT DEFAULT 0,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.campaign_send_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES public.crm_leads(id) ON DELETE SET NULL,
    recipient_email VARCHAR(255),
    recipient_phone VARCHAR(50),
    sent_at TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'opened', 'clicked', 'failed', 'bounced')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------
-- 4. SENSITIVE DATA ACCESS LOG (AUDIT)
-- ------------------------------------------

CREATE TABLE IF NOT EXISTS public.sensitive_data_access_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    accessed_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    field_names TEXT[] NOT NULL,
    access_type VARCHAR(20) DEFAULT 'view' CHECK (access_type IN ('view', 'export', 'print')),
    ip_address INET,
    user_agent TEXT,
    accessed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------
-- 5. RLS & INDEXING
-- ------------------------------------------

ALTER TABLE public.employee_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tds_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_send_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sensitive_data_access_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_emp_profiles ON public.employee_profiles FOR ALL USING (tenant_id = public.current_tenant_id());
CREATE POLICY tenant_isolation_leave_policies ON public.leave_policies FOR ALL USING (tenant_id = public.current_tenant_id());
CREATE POLICY tenant_isolation_leave_requests ON public.leave_requests FOR ALL USING (tenant_id = public.current_tenant_id());
CREATE POLICY tenant_isolation_payroll_runs ON public.payroll_runs FOR ALL USING (tenant_id = public.current_tenant_id());
CREATE POLICY tenant_isolation_customers ON public.customers FOR ALL USING (tenant_id = public.current_tenant_id());
CREATE POLICY tenant_isolation_invoices ON public.invoices FOR ALL USING (tenant_id = public.current_tenant_id());
CREATE POLICY tenant_isolation_payments ON public.payments FOR ALL USING (tenant_id = public.current_tenant_id());
CREATE POLICY tenant_isolation_tds ON public.tds_records FOR ALL USING (tenant_id = public.current_tenant_id());
CREATE POLICY tenant_isolation_segments ON public.marketing_segments FOR ALL USING (tenant_id = public.current_tenant_id());
CREATE POLICY tenant_isolation_campaigns ON public.campaigns FOR ALL USING (tenant_id = public.current_tenant_id());
CREATE POLICY tenant_isolation_sensitive_logs ON public.sensitive_data_access_logs FOR ALL USING (tenant_id = public.current_tenant_id());
