-- ==========================================
-- VORTIQ HR & PAYROLL MODULE EXPANSION
-- Migration Version: 20260728000000
-- Description: Leave & Holiday Calendar, Performance Reviews & OKR Goals,
--              Document Vault with Expiry Reminders, Onboarding/Offboarding Checklists,
--              Employee Self-Service (ESS), PII Masking, & Salary Correction Audit Logs.
-- ==========================================

-- 1. EXTENDED EMPLOYEE PROFILES (1-to-1 with users table)
CREATE TABLE IF NOT EXISTS public.employee_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    department VARCHAR(100) DEFAULT 'Engineering',
    designation VARCHAR(100) DEFAULT 'Senior Software Engineer',
    date_of_joining DATE DEFAULT CURRENT_DATE,
    ctc_annual NUMERIC(12,2) DEFAULT 900000.00,
    basic_monthly NUMERIC(12,2) DEFAULT 37500.00,
    pan_number VARCHAR(20) DEFAULT 'ABCDE1234F',
    bank_account_no VARCHAR(30) DEFAULT '918237129847',
    ifsc_code VARCHAR(20) DEFAULT 'HDFC0001234',
    custom_fields JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. LEAVE REQUESTS
CREATE TABLE IF NOT EXISTS public.hr_leave_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    employee_name VARCHAR(150) NOT NULL,
    leave_type VARCHAR(50) DEFAULT 'casual' CHECK (leave_type IN ('casual', 'sick', 'earned', 'maternity')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days_count INT DEFAULT 1,
    reason TEXT,
    status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PERFORMANCE REVIEWS & OKRS
CREATE TABLE IF NOT EXISTS public.hr_performance_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    employee_name VARCHAR(150) NOT NULL,
    reviewer_name VARCHAR(150) NOT NULL,
    cycle_name VARCHAR(100) DEFAULT 'Q3 2026 Performance Review',
    self_rating INT CHECK (self_rating BETWEEN 1 AND 5),
    manager_rating INT CHECK (manager_rating BETWEEN 1 AND 5),
    feedback_notes TEXT,
    status VARCHAR(30) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'completed')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. DOCUMENT VAULT & EXPIRY REMINDERS
CREATE TABLE IF NOT EXISTS public.hr_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    doc_type VARCHAR(100) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    expiry_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ONBOARDING & OFFBOARDING CHECKLISTS
CREATE TABLE IF NOT EXISTS public.hr_checklists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    type VARCHAR(30) NOT NULL CHECK (type IN ('onboarding', 'offboarding')),
    title VARCHAR(200) NOT NULL,
    items_json JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. SALARY CORRECTION AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.salary_change_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    old_ctc NUMERIC(12,2) NOT NULL,
    new_ctc NUMERIC(12,2) NOT NULL,
    changed_by_name VARCHAR(150) NOT NULL,
    reason TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS POLICIES
ALTER TABLE public.employee_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_performance_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salary_change_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_profiles ON public.employee_profiles FOR ALL USING (tenant_id = public.current_tenant_id());
CREATE POLICY tenant_isolation_leaves ON public.hr_leave_requests FOR ALL USING (tenant_id = public.current_tenant_id());
CREATE POLICY tenant_isolation_reviews ON public.hr_performance_reviews FOR ALL USING (tenant_id = public.current_tenant_id());
CREATE POLICY tenant_isolation_docs ON public.hr_documents FOR ALL USING (tenant_id = public.current_tenant_id());
CREATE POLICY tenant_isolation_checklists ON public.hr_checklists FOR ALL USING (tenant_id = public.current_tenant_id());
CREATE POLICY tenant_isolation_salary_logs ON public.salary_change_logs FOR ALL USING (tenant_id = public.current_tenant_id());
