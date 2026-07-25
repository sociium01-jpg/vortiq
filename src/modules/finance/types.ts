// ─────────────────────────────────────────────────────────────
// Vortiq Finance Module — Types & Seed Data (India GST, TDS, Zoho Books Parity)
// Multi-tenant scoped by tenant_id
// ─────────────────────────────────────────────────────────────

import { Customer, Invoice, InvoiceLineItem, TdsRecord, InvoiceStatus, GstTreatment } from '@/types';

export type { Customer, Invoice, InvoiceLineItem, TdsRecord, InvoiceStatus, GstTreatment };

export type PaymentMode = 'UPI' | 'NEFT_RTGS' | 'Cheque' | 'Razorpay';
export type FinanceTab = 'invoices' | 'recurring' | 'expenses' | 'vendor_bills' | 'budgets' | 'statements' | 'tds_ledger';

export function formatINR(paise: number): string {
  const rupees = (paise || 0) / 100;
  return `₹${rupees.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export interface PaymentRecord {
  id: string;
  tenant_id: string;
  invoice_id: string;
  invoice_number: string;
  customer_name: string;
  amount_paise: number;
  payment_mode: PaymentMode;
  reference_number: string;
  payment_date: string;
  notes?: string;
  created_at: string;
}

export interface ExtendedInvoice extends Invoice {
  customer_name?: string;
  customer_gstin?: string;
  customer_email?: string;
  customer_phone?: string;
  total_amount_paise?: number;
  total_gst_paise?: number;
  amount_paid_paise: number;
  balance_due_paise: number;
  payments?: PaymentRecord[];
}

export interface RecurringInvoice {
  id: string;
  tenant_id: string;
  customer_name: string;
  profile_name: string;
  frequency: 'monthly' | 'quarterly' | 'annual';
  amount: number;
  next_run_date: string;
  status: 'active' | 'paused' | 'cancelled';
  created_at: string;
}

export interface FinanceExpense {
  id: string;
  tenant_id: string;
  category: string;
  amount: number;
  vendor_name: string;
  is_billable: boolean;
  customer_name?: string;
  gst_itc_claimable: number;
  receipt_url?: string;
  notes?: string;
  expense_date: string;
}

export interface VendorBill {
  id: string;
  tenant_id: string;
  vendor_name: string;
  bill_number: string;
  due_date: string;
  total_amount: number;
  paid_amount: number;
  status: 'unpaid' | 'partially_paid' | 'paid' | 'overdue';
  created_at: string;
}

export interface DepartmentBudget {
  id: string;
  tenant_id: string;
  department: string;
  budget_cap: number;
  actual_spent: number;
  period_month: number;
  period_year: number;
}

export interface FinancialAuditLog {
  id: string;
  tenant_id: string;
  action_type: 'deletion' | 'modification' | 'refund';
  entity_name: string;
  amount: number;
  performed_by_name: string;
  reason: string;
  created_at: string;
}

export type TdsSectionCode = '194C' | '194J' | '192';

export interface TdsSectionInfo {
  section_code: TdsSectionCode;
  description: string;
  default_rate_percent: number;
  threshold_paise?: number;
}

export const TDS_SECTIONS: TdsSectionInfo[] = [
  { section_code: '194C', description: 'Contractors & Sub-contractors', default_rate_percent: 2 },
  { section_code: '194J', description: 'Professional & Technical Services (10% / 2%)', default_rate_percent: 10 },
  { section_code: '192', description: 'Salaries & Compensation', default_rate_percent: 10 },
];

export interface GstSummaryRow {
  period: string;
  taxable_value_paise: number;
  cgst_paise: number;
  sgst_paise: number;
  igst_paise: number;
  total_gst_paise: number;
  total_invoice_value_paise: number;
  invoice_count: number;
}

// ── Seed Datasets ─────────────────────────────────────────────

export const SEED_RECURRING_INVOICES: RecurringInvoice[] = [
  {
    id: 'rec-101',
    tenant_id: 'tenant-prod-001',
    customer_name: 'Apollo Hospital Procurement Cell',
    profile_name: 'Monthly Healthcare ERP License Subscription',
    frequency: 'monthly',
    amount: 150000,
    next_run_date: '2026-08-01',
    status: 'active',
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
];

export const SEED_FINANCE_EXPENSES: FinanceExpense[] = [
  {
    id: 'exp-101',
    tenant_id: 'tenant-prod-001',
    category: 'Cloud Infrastructure & GCP',
    amount: 42500,
    vendor_name: 'Google Cloud Asia-South1',
    is_billable: false,
    gst_itc_claimable: 7650, // 18% GST ITC claimable
    notes: 'Cloud Run & AlloyDB production hosting',
    expense_date: new Date().toISOString().split('T')[0],
  },
];

export const SEED_VENDOR_BILLS: VendorBill[] = [
  {
    id: 'vb-101',
    tenant_id: 'tenant-prod-001',
    vendor_name: 'Apex Industrial Component Suppliers Ltd',
    bill_number: 'BILL-2026-8891',
    due_date: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
    total_amount: 125000,
    paid_amount: 0,
    status: 'unpaid',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
];

export const SEED_BUDGETS: DepartmentBudget[] = [
  { id: 'bgt-101', tenant_id: 'tenant-prod-001', department: 'Engineering & Product', budget_cap: 1000000, actual_spent: 425000, period_month: 7, period_year: 2026 },
  { id: 'bgt-102', tenant_id: 'tenant-prod-001', department: 'Sales & Growth Marketing', budget_cap: 500000, actual_spent: 180000, period_month: 7, period_year: 2026 },
];

export const SEED_FINANCE_AUDIT_LOGS: FinancialAuditLog[] = [
  {
    id: 'fa-101',
    tenant_id: 'tenant-prod-001',
    action_type: 'modification',
    entity_name: 'Invoice INV-2026-0041',
    amount: 150000,
    performed_by_name: 'Alex Vance',
    reason: 'Corrected Form 26Q TDS 194J 10% deduction rate',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
];
