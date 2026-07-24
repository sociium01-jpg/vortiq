-- ==========================================
-- VORTIQ TASK MANAGEMENT & DOC SPACE EXPANSION
-- Migration Version: 20260726000000
-- Description: Multi-view, Task Dependencies, Recurrence, Time Tracking Timesheets,
--              Custom Workflow Statuses, Confluence Wiki Pages + Version History, & @Mentions.
-- ==========================================

-- 1. TASK TIME LOGS & TIMESHEETS
CREATE TABLE IF NOT EXISTS public.task_time_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    hours NUMERIC(6,2) NOT NULL CHECK (hours > 0),
    notes TEXT,
    is_billable BOOLEAN DEFAULT true,
    logged_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TASK CUSTOM WORKFLOW STATUSES
CREATE TABLE IF NOT EXISTS public.task_custom_statuses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    project_id VARCHAR(100) DEFAULT 'default',
    name VARCHAR(100) NOT NULL,
    color VARCHAR(30) DEFAULT '#8D93AC',
    sort_order INT DEFAULT 0,
    is_terminal BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, project_id, name)
);

-- 3. DOC PAGES & VERSION HISTORY (WIKI SPACE)
CREATE TABLE IF NOT EXISTS public.doc_pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    category VARCHAR(50) DEFAULT 'general',
    version_number INT DEFAULT 1,
    linked_task_ids UUID[] DEFAULT '{}',
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.doc_page_revisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    page_id UUID NOT NULL REFERENCES public.doc_pages(id) ON DELETE CASCADE,
    version_number INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    edited_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, page_id, version_number)
);

-- 4. TASK MENTIONS & NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.task_mentions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    mentioned_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    comment_text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. RLS POLICIES
ALTER TABLE public.task_time_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_custom_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doc_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doc_page_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_mentions ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_time_logs ON public.task_time_logs FOR ALL USING (tenant_id = public.current_tenant_id());
CREATE POLICY tenant_isolation_custom_statuses ON public.task_custom_statuses FOR ALL USING (tenant_id = public.current_tenant_id());
CREATE POLICY tenant_isolation_doc_pages ON public.doc_pages FOR ALL USING (tenant_id = public.current_tenant_id());
CREATE POLICY tenant_isolation_doc_revisions ON public.doc_page_revisions FOR ALL USING (tenant_id = public.current_tenant_id());
CREATE POLICY tenant_isolation_mentions ON public.task_mentions FOR ALL USING (tenant_id = public.current_tenant_id());
