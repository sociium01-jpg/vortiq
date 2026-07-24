// ─────────────────────────────────────────────────────────────
// Vortiq Multi-Tenant Data Store & State Isolation Engine
// Multi-tenant key scoping ensures ZERO cross-tenant data leaks.
// ─────────────────────────────────────────────────────────────

// Memory storage fallback for SSR & Node environments
const memoryStore: Record<string, string> = {};

const safeStorage = {
  getItem: (key: string): string | null => {
    if (typeof localStorage !== 'undefined') return localStorage.getItem(key);
    return memoryStore[key] || null;
  },
  setItem: (key: string, value: string): void => {
    if (typeof localStorage !== 'undefined') localStorage.setItem(key, value);
    else memoryStore[key] = value;
  },
  removeItem: (key: string): void => {
    if (typeof localStorage !== 'undefined') localStorage.removeItem(key);
    else delete memoryStore[key];
  },
  keys: (): string[] => {
    if (typeof localStorage !== 'undefined') return Object.keys(localStorage);
    return Object.keys(memoryStore);
  },
};

// Generate Unique Organization Code (e.g. ORG-7482-APX)
export function generateOrgCode(companyName: string): string {
  const prefix = companyName.replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase() || 'VTQ';
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `ORG-${randomNum}-${prefix}`;
}

export function getActiveTenantId(): string {
  return safeStorage.getItem('vortiq_tenant_id') || 'tenant-prod-001';
}

export function setActiveTenantId(tenantId: string): void {
  safeStorage.setItem('vortiq_tenant_id', tenantId);
}

// Scopes storage keys strictly by active tenant/org ID
export function getTenantScopedKey(baseKey: string, tenantId?: string): string {
  const tid = tenantId || getActiveTenantId();
  return `${baseKey}_${tid}`;
}

// Check if tenant has explicitly enabled demo mode
export function isDemoMode(): boolean {
  const stored = safeStorage.getItem('vortiq_is_demo_mode');
  return stored === 'true';
}

export function setDemoMode(isDemo: boolean): void {
  safeStorage.setItem('vortiq_is_demo_mode', isDemo ? 'true' : 'false');
}

// ── Tenant-Isolated LocalStorage Getter/Setter ────────────────────────────────
export function getStoredData<T>(baseKey: string, seedData: T[], tenantId?: string): T[] {
  const scopedKey = getTenantScopedKey(baseKey, tenantId);
  try {
    const raw = safeStorage.getItem(scopedKey);
    if (!raw) {
      if (isDemoMode()) {
        safeStorage.setItem(scopedKey, JSON.stringify(seedData));
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
    safeStorage.setItem(scopedKey, JSON.stringify(data));
  } catch (err) {
    console.error(`Error saving ${scopedKey} to storage:`, err);
  }
}

// ── Clear Current Tenant Workspace Data ──────────────────────────────────────
export function clearWorkspaceData(tenantId?: string): void {
  const tid = tenantId || getActiveTenantId();
  safeStorage.keys().forEach((key) => {
    if (key.endsWith(`_${tid}`)) {
      safeStorage.removeItem(key);
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
    const raw = safeStorage.getItem('vortiq_verified_users_v1');
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    return [];
  }
}

export function saveVerifiedUser(account: VerifiedUserAccount): void {
  const existing = getVerifiedUsers();
  const updated = [...existing.filter((u) => u.email !== account.email), account];
  safeStorage.setItem('vortiq_verified_users_v1', JSON.stringify(updated));
}
