-- ==========================================
-- VORTIQ SALES PIPELINE EXPANSION MIGRATION
-- Migration Version: 20260725000000
-- Description: Blueprints (Stage-Gating), Workflows, Sequences, Lead Scoring,
--              Call Transcripts, Scheduling Links, Macros, and Custom Fields.
-- ==========================================

-- ------------------------------------------
-- 1. BLUEPRINTS & STAGE-GATING REQUIREMENTS
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS public.crm_stage_requirements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    from_stage VARCHAR(50) NOT NULL,
    to_stage VARCHAR(50) NOT NULL,
    required_fields TEXT[] NOT NULL DEFAULT '{}',
    checklist_items TEXT[] NOT NULL DEFAULT '{}',
    win_probability_percent INT DEFAULT 50 CHECK (win_probability_percent BETWEEN 0 AND 100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, from_stage, to_stage)
);

-- ------------------------------------------
-- 2. WORKFLOW AUTOMATION ENGINE
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS public.crm_workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    trigger_type VARCHAR(50) NOT NULL CHECK (trigger_type IN ('lead_created', 'stage_changed', 'value_threshold', 'lead_assigned', 'inactive_days')),
    trigger_conditions JSONB NOT NULL DEFAULT '{}'::jsonb,
    actions JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------
-- 3. OUTREACH CADENCE SEQUENCES
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS public.crm_sequences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    steps JSONB NOT NULL DEFAULT '[]'::jsonb, -- [{step: 1, day: 0, type: 'email', subject: '', body: ''}]
    auto_pause_on_reply BOOLEAN DEFAULT true,
    auto_pause_on_stage_change BOOLEAN DEFAULT true,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.crm_sequence_enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    sequence_id UUID NOT NULL REFERENCES public.crm_sequences(id) ON DELETE CASCADE,
    lead_id UUID NOT NULL REFERENCES public.crm_leads(id) ON DELETE CASCADE,
    enrolled_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    current_step INT DEFAULT 1,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'unsubscribed')),
    next_step_due_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------
-- 4. LEAD SCORING & ROUND-ROBIN ROTATION
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS public.crm_lead_score_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    rule_name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('behavioral', 'demographic', 'deal_size', 'inactivity')),
    condition_json JSONB NOT NULL,
    points_delta INT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.crm_lead_rotation_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    assignee_user_ids UUID[] NOT NULL,
    last_assigned_index INT DEFAULT 0,
    criteria JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------
-- 5. CALL TRANSCRIPTS, SCHEDULING, MACROS & CUSTOM FIELDS
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS public.crm_call_transcripts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    lead_id UUID NOT NULL REFERENCES public.crm_leads(id) ON DELETE CASCADE,
    audio_url TEXT,
    duration_seconds INT DEFAULT 0,
    speaker_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    transcript_text TEXT NOT NULL,
    summary TEXT,
    sentiment VARCHAR(20) DEFAULT 'positive' CHECK (sentiment IN ('positive', 'neutral', 'hesitant', 'negative')),
    action_items TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.crm_scheduling_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    slug VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    duration_minutes INT DEFAULT 30,
    available_days TEXT[] DEFAULT '{"Mon","Tue","Wed","Thu","Fri"}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, slug)
);

CREATE TABLE IF NOT EXISTS public.crm_canned_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    shortcut VARCHAR(50) NOT NULL, -- e.g. /pricing, /proposal
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'general',
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, shortcut)
);

CREATE TABLE IF NOT EXISTS public.crm_custom_field_definitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    field_key VARCHAR(100) NOT NULL,
    label VARCHAR(255) NOT NULL,
    field_type VARCHAR(30) NOT NULL CHECK (field_type IN ('text', 'number', 'select', 'date', 'checkbox')),
    options TEXT[] DEFAULT '{}',
    is_required BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, field_key)
);

-- ------------------------------------------
-- 6. RLS POLICIES & INDEXING
-- ------------------------------------------
ALTER TABLE public.crm_stage_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_sequence_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_lead_score_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_lead_rotation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_call_transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_scheduling_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_canned_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_custom_field_definitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_stage_reqs ON public.crm_stage_requirements FOR ALL USING (tenant_id = public.current_tenant_id());
CREATE POLICY tenant_isolation_workflows ON public.crm_workflows FOR ALL USING (tenant_id = public.current_tenant_id());
CREATE POLICY tenant_isolation_sequences ON public.crm_sequences FOR ALL USING (tenant_id = public.current_tenant_id());
CREATE POLICY tenant_isolation_seq_enrollments ON public.crm_sequence_enrollments FOR ALL USING (tenant_id = public.current_tenant_id());
CREATE POLICY tenant_isolation_score_rules ON public.crm_lead_score_rules FOR ALL USING (tenant_id = public.current_tenant_id());
CREATE POLICY tenant_isolation_call_transcripts ON public.crm_call_transcripts FOR ALL USING (tenant_id = public.current_tenant_id());
CREATE POLICY tenant_isolation_scheduling_links ON public.crm_scheduling_links FOR ALL USING (tenant_id = public.current_tenant_id());
CREATE POLICY tenant_isolation_canned_responses ON public.crm_canned_responses FOR ALL USING (tenant_id = public.current_tenant_id());
CREATE POLICY tenant_isolation_custom_fields ON public.crm_custom_field_definitions FOR ALL USING (tenant_id = public.current_tenant_id());
