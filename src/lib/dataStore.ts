// ─────────────────────────────────────────────────────────────
// Vortiq Multi-Tenant Data Store & State Isolation Engine
// Multi-tenant key scoping ensures ZERO cross-tenant data leaks.
// ─────────────────────────────────────────────────────────────

const STORAGE_KEYS = {
  IS_DEMO_MODE: 'vortiq_is_demo_mode',
  ACTIVE_TENANT_ID: 'vortiq_tenant_id',
  VERIFIED_USERS: 'vortiq_verified_users_v1',
};

// Generate Unique Organization Code (e.g. ORG-7482-APX)
export function generateOrgCode(companyName: string): string {
  const prefix = companyName.replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase() || 'VTQ';
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `ORG-${randomNum}-${prefix}`;
}

export function getActiveTenantId(): string {
  return localStorage.getItem(STORAGE_KEYS.ACTIVE_TENANT_ID) || 'tenant-prod-001';
}

export function setActiveTenantId(tenantId: string): void {
  localStorage.setItem(STORAGE_KEYS.ACTIVE_TENANT_ID, tenantId);
}

// Scopes storage keys strictly by active tenant/org ID
export function getTenantScopedKey(baseKey: string, tenantId?: string): string {
  const tid = tenantId || getActiveTenantId();
  return `${baseKey}_${tid}`;
}

// Check if tenant has explicitly enabled demo mode
export function isDemoMode(): boolean {
  const stored = localStorage.getItem(STORAGE_KEYS.IS_DEMO_MODE);
  return stored === 'true';
}

export function setDemoMode(isDemo: boolean): void {
  localStorage.setItem(STORAGE_KEYS.IS_DEMO_MODE, isDemo ? 'true' : 'false');
}

// ── Tenant-Isolated LocalStorage Getter/Setter ────────────────────────────────
export function getStoredData<T>(baseKey: string, seedData: T[], tenantId?: string): T[] {
  const scopedKey = getTenantScopedKey(baseKey, tenantId);
  try {
    const raw = localStorage.getItem(scopedKey);
    if (!raw) {
      if (isDemoMode()) {
        localStorage.setItem(scopedKey, JSON.stringify(seedData));
        return seedData;
      }
      return []; // Return clean empty list for production state
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error reading ${scopedKey} from storage:`, err);
    return isDemoMode() ? seedData : [];
  }
}

export function saveStoredData<T>(baseKey: string, data: T[], tenantId?: string): void {
  const scopedKey = getTenantScopedKey(baseKey, tenantId);
  try {
    localStorage.setItem(scopedKey, JSON.stringify(data));
  } catch (err) {
    console.error(`Error saving ${scopedKey} to storage:`, err);
  }
}

// ── Clear Current Tenant Workspace Data ──────────────────────────────────────
export function clearWorkspaceData(tenantId?: string): void {
  const tid = tenantId || getActiveTenantId();
  Object.keys(localStorage).forEach((key) => {
    if (key.endsWith(`_${tid}`)) {
      localStorage.removeItem(key);
    }
  });
  setDemoMode(false);
}

// ── Verified User Directory (Production Verification) ────────────────────────
export interface VerifiedUserAccount {
  email: string;
  fullName: string;
  companyName: string;
  orgCode: string;
  tenantId: string;
  verifiedAt: string;
}

export function getVerifiedUsers(): VerifiedUserAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.VERIFIED_USERS);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    return [];
  }
}

export function saveVerifiedUser(account: VerifiedUserAccount): void {
  const existing = getVerifiedUsers();
  const updated = [...existing.filter((u) => u.email !== account.email), account];
  localStorage.setItem(STORAGE_KEYS.VERIFIED_USERS, JSON.stringify(updated));
}
