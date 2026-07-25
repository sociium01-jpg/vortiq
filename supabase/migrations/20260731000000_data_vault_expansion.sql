-- ─────────────────────────────────────────────────────────────
-- Vortiq Data Vault — Security, Access Control & Audit Logging Migration
-- Department-Scoped Access, Explicit Cross-Grants, Export & Import Logs
-- ─────────────────────────────────────────────────────────────

-- 1. Explicit Cross-Department Vault Access Grants
CREATE TABLE IF NOT EXISTS public.vault_grants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id VARCHAR(100) NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id VARCHAR(100) NOT NULL,
  user_email VARCHAR(255) NOT NULL,
  department VARCHAR(50) NOT NULL CHECK (department IN ('crm', 'hr', 'finance', 'inventory')),
  granted_by_id VARCHAR(100) NOT NULL,
  granted_by_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Audit Trail of All Data Vault Downloads & Exports
CREATE TABLE IF NOT EXISTS public.vault_export_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id VARCHAR(100) NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id VARCHAR(100) NOT NULL,
  user_name VARCHAR(255) NOT NULL,
  user_email VARCHAR(255) NOT NULL,
  department VARCHAR(50) NOT NULL CHECK (department IN ('crm', 'hr', 'finance', 'inventory', 'all')),
  format VARCHAR(20) NOT NULL CHECK (format IN ('csv', 'excel', 'pdf', 'word', 'ppt')),
  rows_count INT NOT NULL DEFAULT 0,
  active_filters JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Audit Trail of All Bulk Import Operations
CREATE TABLE IF NOT EXISTS public.vault_import_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id VARCHAR(100) NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id VARCHAR(100) NOT NULL,
  user_name VARCHAR(255) NOT NULL,
  user_email VARCHAR(255) NOT NULL,
  department VARCHAR(50) NOT NULL CHECK (department IN ('crm', 'hr', 'finance', 'inventory')),
  rows_imported INT NOT NULL DEFAULT 0,
  rows_skipped INT NOT NULL DEFAULT 0,
  rows_warned INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. DB-Level Correction Log for Overwritten Records
CREATE TABLE IF NOT EXISTS public.vault_record_corrections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id VARCHAR(100) NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id VARCHAR(100) NOT NULL,
  user_name VARCHAR(255) NOT NULL,
  department VARCHAR(50) NOT NULL CHECK (department IN ('crm', 'hr', 'finance', 'inventory')),
  entity_type VARCHAR(100) NOT NULL,
  entity_id VARCHAR(100) NOT NULL,
  field_name VARCHAR(100) NOT NULL,
  old_value TEXT,
  new_value TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Enable Row Level Security (RLS) ──────────────────────────
ALTER TABLE public.vault_grants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vault_export_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vault_import_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vault_record_corrections ENABLE ROW LEVEL SECURITY;

-- ── Multi-Tenant RLS Policies ────────────────────────────────
CREATE POLICY vault_grants_tenant_policy ON public.vault_grants
  FOR ALL USING (tenant_id = current_setting('app.current_tenant_id', true));

CREATE POLICY vault_export_logs_tenant_policy ON public.vault_export_logs
  FOR ALL USING (tenant_id = current_setting('app.current_tenant_id', true));

CREATE POLICY vault_import_logs_tenant_policy ON public.vault_import_logs
  FOR ALL USING (tenant_id = current_setting('app.current_tenant_id', true));

CREATE POLICY vault_record_corrections_tenant_policy ON public.vault_record_corrections
  FOR ALL USING (tenant_id = current_setting('app.current_tenant_id', true));

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_vault_grants_user ON public.vault_grants(tenant_id, user_id);
CREATE INDEX IF NOT EXISTS idx_vault_export_logs_created ON public.vault_export_logs(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_vault_import_logs_created ON public.vault_import_logs(tenant_id, created_at DESC);
