// ─────────────────────────────────────────────────────────────
// Vortiq Data Vault — Types, Enums & Seed Definitions
// Department-Scoped Access Control, Export & Bulk Import Protocols
// ─────────────────────────────────────────────────────────────

export type VaultDepartment = 'crm' | 'hr' | 'finance' | 'inventory';
export type ExportFormat = 'csv' | 'excel' | 'pdf' | 'word' | 'ppt';

export interface VaultGrant {
  id: string;
  tenant_id: string;
  user_id: string;
  user_email: string;
  department: VaultDepartment;
  granted_by_id: string;
  granted_by_name: string;
  created_at: string;
}

export interface VaultExportLog {
  id: string;
  tenant_id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  department: VaultDepartment | 'all';
  format: ExportFormat;
  rows_count: number;
  active_filters?: Record<string, string>;
  created_at: string;
}

export interface VaultImportLog {
  id: string;
  tenant_id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  department: VaultDepartment;
  rows_imported: number;
  rows_skipped: number;
  rows_warned: number;
  created_at: string;
}

export interface VaultCorrectionLog {
  id: string;
  tenant_id: string;
  user_id: string;
  user_name: string;
  department: VaultDepartment;
  entity_type: string;
  entity_id: string;
  field_name: string;
  old_value: string;
  new_value: string;
  created_at: string;
}

// ── Department Field Definitions for Grid Rendering ─────────
export interface GridColumnDef {
  key: string;
  label: string;
  type: 'text' | 'number' | 'currency' | 'badge' | 'date';
  isCustom?: boolean;
}

export const DEPARTMENT_SCHEMAS: Record<VaultDepartment, GridColumnDef[]> = {
  crm: [
    { key: 'name', label: 'Lead Contact', type: 'text' },
    { key: 'company_name', label: 'Company / Organization', type: 'text' },
    { key: 'phone', label: 'Phone', type: 'text' },
    { key: 'email', label: 'Email', type: 'text' },
    { key: 'stage_id', label: 'Pipeline Stage', type: 'badge' },
    { key: 'estimated_value', label: 'Deal Value (₹)', type: 'currency' },
    { key: 'source', label: 'Lead Source', type: 'text' },
    { key: 'assignee_name', label: 'Assigned Representative', type: 'text' },
  ],
  hr: [
    { key: 'full_name', label: 'Employee Name', type: 'text' },
    { key: 'department', label: 'Department', type: 'badge' },
    { key: 'designation', label: 'Designation / Role', type: 'text' },
    { key: 'work_email', label: 'Work Email', type: 'text' },
    { key: 'phone_number', label: 'Phone Number', type: 'text' },
    { key: 'pan_number', label: 'PAN Card (Masked)', type: 'text' },
    { key: 'basic_salary', label: 'Monthly Basic (₹)', type: 'currency' },
    { key: 'status', label: 'Employment Status', type: 'badge' },
  ],
  finance: [
    { key: 'invoice_number', label: 'Invoice #', type: 'text' },
    { key: 'customer_name', label: 'Customer / Client', type: 'text' },
    { key: 'issue_date', label: 'Issue Date', type: 'date' },
    { key: 'due_date', label: 'Due Date', type: 'date' },
    { key: 'total_amount', label: 'Total Amount (₹)', type: 'currency' },
    { key: 'gst_amount', label: 'GST Tax (₹)', type: 'currency' },
    { key: 'tds_deducted', label: 'TDS Deducted (₹)', type: 'currency' },
    { key: 'status', label: 'Billing Status', type: 'badge' },
  ],
  inventory: [
    { key: 'sku', label: 'SKU / GTIN Barcode', type: 'text' },
    { key: 'item_name', label: 'Item Name', type: 'text' },
    { key: 'category', label: 'Category', type: 'badge' },
    { key: 'warehouse_location', label: 'Warehouse Bin', type: 'text' },
    { key: 'quantity_on_hand', label: 'Units On Hand', type: 'number' },
    { key: 'reorder_threshold', label: 'Reorder Level', type: 'number' },
    { key: 'unit_price', label: 'Unit Cost (₹)', type: 'currency' },
    { key: 'serial_tracking', label: 'Regulated Tracking', type: 'badge' },
  ],
};

// ── CSV Import Field Definitions ──────────────────────────────
export const DEPARTMENT_IMPORT_MAPS: Record<VaultDepartment, { field: string; label: string; required?: boolean }[]> = {
  crm: [
    { field: 'name', label: 'Contact Name', required: true },
    { field: 'company_name', label: 'Company Name' },
    { field: 'phone', label: 'Phone Number' },
    { field: 'email', label: 'Email Address' },
    { field: 'estimated_value', label: 'Estimated Value (₹)' },
    { field: 'stage_id', label: 'Stage ID' },
  ],
  hr: [
    { field: 'full_name', label: 'Full Name', required: true },
    { field: 'work_email', label: 'Work Email', required: true },
    { field: 'department', label: 'Department' },
    { field: 'designation', label: 'Designation' },
    { field: 'phone_number', label: 'Phone Number' },
    { field: 'basic_salary', label: 'Basic Salary (₹)' },
  ],
  finance: [
    { field: 'invoice_number', label: 'Invoice Number', required: true },
    { field: 'customer_name', label: 'Customer Name', required: true },
    { field: 'total_amount', label: 'Total Amount (₹)' },
    { field: 'gst_amount', label: 'GST Tax (₹)' },
    { field: 'status', label: 'Status' },
  ],
  inventory: [
    { field: 'sku', label: 'SKU / Barcode', required: true },
    { field: 'item_name', label: 'Item Name', required: true },
    { field: 'warehouse_location', label: 'Warehouse Bin' },
    { field: 'quantity_on_hand', label: 'Quantity On Hand' },
    { field: 'unit_price', label: 'Unit Cost (₹)' },
  ],
};

// ── Seed Logs ─────────────────────────────────────────────────
export const SEED_EXPORT_LOGS: VaultExportLog[] = [
  {
    id: 'vel-001',
    tenant_id: 'tenant-prod-001',
    user_id: 'u-1',
    user_name: 'Alex Vance',
    user_email: 'alex@vortiq.biz',
    department: 'finance',
    format: 'excel',
    rows_count: 14,
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: 'vel-002',
    tenant_id: 'tenant-prod-001',
    user_id: 'u-2',
    user_name: 'Priya Sharma',
    user_email: 'priya@vortiq.biz',
    department: 'hr',
    format: 'pdf',
    rows_count: 24,
    created_at: new Date(Date.now() - 5 * 3600000).toISOString(),
  },
];

export const SEED_IMPORT_LOGS: VaultImportLog[] = [
  {
    id: 'vil-001',
    tenant_id: 'tenant-prod-001',
    user_id: 'u-1',
    user_name: 'Alex Vance',
    user_email: 'alex@vortiq.biz',
    department: 'inventory',
    rows_imported: 45,
    rows_skipped: 2,
    rows_warned: 1,
    created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
  },
];
