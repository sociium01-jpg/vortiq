// ─────────────────────────────────────────────────────────────
// Vortiq Data Store & State Persistence Engine (Production Ready)
// Zero mock data default for production workspace environment
// ─────────────────────────────────────────────────────────────

const STORAGE_KEYS = {
  IS_DEMO_MODE: 'vortiq_is_demo_mode',
  TENANT_ID: 'vortiq_tenant_id',
  LEADS: 'vortiq_leads_v2',
  INVOICES: 'vortiq_invoices_v2',
  CUSTOMERS: 'vortiq_customers_v2',
  PAYMENTS: 'vortiq_payments_v2',
  TDS_RECORDS: 'vortiq_tds_v2',
  EMPLOYEES: 'vortiq_employees_v2',
  LEAVE_REQUESTS: 'vortiq_leaves_v2',
  TASKS: 'vortiq_tasks_v2',
  INVENTORY: 'vortiq_inventory_v2',
  CAMPAIGNS: 'vortiq_campaigns_v2',
  SEGMENTS: 'vortiq_segments_v2',
};

// Check if tenant has explicitly enabled demo mode (Defaults to false in Production)
export function isDemoMode(): boolean {
  const stored = localStorage.getItem(STORAGE_KEYS.IS_DEMO_MODE);
  return stored === 'true'; // Default is FALSE (Clean slate, zero mock data)
}

export function setDemoMode(isDemo: boolean): void {
  localStorage.setItem(STORAGE_KEYS.IS_DEMO_MODE, isDemo ? 'true' : 'false');
}

// ── Generic LocalStorage Getter/Setter ──────────────────────────────────────
export function getStoredData<T>(key: string, seedData: T[]): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      if (isDemoMode()) {
        localStorage.setItem(key, JSON.stringify(seedData));
        return seedData;
      }
      return []; // Return clean empty list for production state
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error reading ${key} from storage:`, err);
    return isDemoMode() ? seedData : [];
  }
}

export function saveStoredData<T>(key: string, data: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Error saving ${key} to storage:`, err);
  }
}

// ── Clear Workspace Data (For Fresh Production User Setup) ────────────────────
export function clearWorkspaceData(): void {
  Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
  setDemoMode(false);
}

// ── Load Sample Demo Data (Optional User Trigger) ──────────────────────────────
export function loadSampleDemoData<T>(seedMap: Record<string, T[]>): void {
  setDemoMode(true);
  Object.entries(seedMap).forEach(([key, val]) => {
    localStorage.setItem(key, JSON.stringify(val));
  });
}
