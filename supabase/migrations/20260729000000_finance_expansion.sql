-- ==========================================
-- VORTIQ FINANCE & ACCOUNTING MODULE EXPANSION
-- Migration Version: 20260729000000
-- Description: Recurring Invoices & Subscriptions, Expense Receipt Photo Capture,
--              Vendor Bills & Accounts Payable (AP), Department/Project Budgets,
--              Financial Statements (P&L, Balance Sheet), & High-Visibility Financial Audit Logs.
-- ==========================================

-- 1. RECURRING INVOICES & SUBSCRIPTION BILLING
CREATE TABLE IF NOT EXISTS public.finance_recurring_invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    customer_name VARCHAR(200) NOT NULL,
    profile_name VARCHAR(150) NOT NULL,
    frequency VARCHAR(30) DEFAULT 'monthly' CHECK (frequency IN ('monthly', 'quarterly', 'annual')),
    amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    next_run_date DATE NOT NULL,
    status VARCHAR(30) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. EXPENSES & RECEIPT PHOTO CAPTURE
CREATE TABLE IF NOT EXISTS public.finance_expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    vendor_name VARCHAR(200),
    is_billable BOOLEAN DEFAULT false,
    customer_name VARCHAR(200),
    gst_itc_claimable NUMERIC(12,2) DEFAULT 0.00,
    receipt_url TEXT,
    notes TEXT,
    expense_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. VENDOR BILLS & ACCOUNTS PAYABLE (AP)
CREATE TABLE IF NOT EXISTS public.finance_vendor_bills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    vendor_name VARCHAR(200) NOT NULL,
    bill_number VARCHAR(50) NOT NULL,
    due_date DATE NOT NULL,
    total_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    paid_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    status VARCHAR(30) DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'partially_paid', 'paid', 'overdue')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. DEPARTMENT & PROJECT BUDGETS
CREATE TABLE IF NOT EXISTS public.finance_budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    department VARCHAR(100) NOT NULL,
    budget_cap NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    actual_spent NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    period_month INT DEFAULT 7,
    period_year INT DEFAULT 2026,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, department, period_month, period_year)
);

-- 5. HIGH-VISIBILITY FINANCIAL AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.finance_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    action_type VARCHAR(50) NOT NULL, -- deletion, modification, refund
    entity_name VARCHAR(200) NOT NULL,
    amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    performed_by_name VARCHAR(150) NOT NULL,
    reason TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS POLICIES
ALTER TABLE public.finance_recurring_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finance_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finance_vendor_bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finance_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finance_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_recurring ON public.finance_recurring_invoices FOR ALL USING (tenant_id = public.current_tenant_id());
CREATE POLICY tenant_isolation_expenses ON public.finance_expenses FOR ALL USING (tenant_id = public.current_tenant_id());
CREATE POLICY tenant_isolation_vendor_bills ON public.finance_vendor_bills FOR ALL USING (tenant_id = public.current_tenant_id());
CREATE POLICY tenant_isolation_budgets ON public.finance_budgets FOR ALL USING (tenant_id = public.current_tenant_id());
CREATE POLICY tenant_isolation_finance_audits ON public.finance_audit_logs FOR ALL USING (tenant_id = public.current_tenant_id());
