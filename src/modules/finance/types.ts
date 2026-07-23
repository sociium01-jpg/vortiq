// ─────────────────────────────────────────────────────────────
// Vortiq Finance Module — Types & Seed Data (India GST & TDS Ready)
// ─────────────────────────────────────────────────────────────

import { Customer, Invoice, InvoiceLineItem, TdsRecord, InvoiceStatus, GstTreatment } from '@/types';

export type { Customer, Invoice, InvoiceLineItem, TdsRecord, InvoiceStatus, GstTreatment };

export type PaymentMode = 'UPI' | 'NEFT_RTGS' | 'Cheque' | 'Razorpay';

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
  amount_paid_paise: number;
  balance_due_paise: number;
  payments?: PaymentRecord[];
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

// Helper: Format paise into INR currency format string
export const formatINR = (paise: number, includeDecimals = true): string => {
  const rupees = paise / 100;
  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: includeDecimals ? 2 : 0,
    maximumFractionDigits: includeDecimals ? 2 : 0,
  }).format(rupees);
  return formatted;
};

// ── Initial Seed Data for Finance Module ─────────────────────────────────────

export const SEED_CUSTOMERS: Customer[] = [
  {
    id: 'cust-001',
    tenant_id: 'org-1',
    lead_id: 'lead-004',
    name: 'SunTech Manufacturing Pvt Ltd',
    gstin: '29AAACS1234F1Z5',
    pan: 'AAACS1234F',
    billing_address: 'Plot 42, Peenya Industrial Area, Stage 2, Bengaluru, Karnataka - 560058',
    state_code: '29',
    email: 'sunil@suntech.co.in',
    phone: '+91 80012 34567',
    created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'cust-002',
    tenant_id: 'org-1',
    lead_id: 'lead-002',
    name: 'Apex Solutions Enterprise',
    gstin: '27AAACA9876E1Z2',
    pan: 'AAACA9876E',
    billing_address: '9th Floor, Cyber Park, MIDC, Andheri East, Mumbai, Maharashtra - 400093',
    state_code: '27',
    email: 'finance@apexsolutions.com',
    phone: '+91 98220 11223',
    created_at: new Date(Date.now() - 45 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'cust-003',
    tenant_id: 'org-1',
    lead_id: 'lead-001',
    name: 'Patel Logistics Solutions',
    gstin: '24AAACP5544K1Z9',
    pan: 'AAACP5544K',
    billing_address: 'Transport Nagar, Narol, Ahmedabad, Gujarat - 382405',
    state_code: '24',
    email: 'deepak@patellogistics.com',
    phone: '+91 98111 22233',
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const SEED_INVOICES: ExtendedInvoice[] = [
  {
    id: 'inv-001',
    tenant_id: 'org-1',
    customer_id: 'cust-001',
    customer_name: 'SunTech Manufacturing Pvt Ltd',
    customer_gstin: '29AAACS1234F1Z5',
    customer_email: 'sunil@suntech.co.in',
    customer_phone: '+91 80012 34567',
    lead_id: 'lead-004',
    invoice_number: 'INV-2026-001',
    invoice_date: '2026-07-01',
    due_date: '2026-07-15',
    status: 'paid',
    place_of_supply: '29 - Karnataka',
    gst_treatment: 'b2b',
    is_igst: false,
    subtotal_paise: 32000000, // ₹3,20,000.00
    cgst_paise: 2880000,     // 9% CGST = ₹28,800.00
    sgst_paise: 2880000,     // 9% SGST = ₹28,800.00
    igst_paise: 0,
    tds_paise: 3200000,      // 10% TDS (194J) = ₹32,000.00
    total_paise: 37760000,   // ₹3,77,600.00 gross bill
    amount_paid_paise: 37760000,
    balance_due_paise: 0,
    notes: 'Annual SaaS Enterprise License Subscription & Onboarding setup.',
    created_by: 'Alex Vance',
    created_at: new Date(Date.now() - 22 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    line_items: [
      {
        id: 'li-001',
        invoice_id: 'inv-001',
        tenant_id: 'org-1',
        description: 'Vortiq ERP Platform License (Annual)',
        hsn_sac_code: '998313',
        quantity: 1,
        unit_price_paise: 25000000,
        gst_rate_percent: 18,
        amount_paise: 25000000,
        created_at: new Date().toISOString(),
      },
      {
        id: 'li-002',
        invoice_id: 'inv-001',
        tenant_id: 'org-1',
        description: 'Implementation & Custom Workflow Setup',
        hsn_sac_code: '998314',
        quantity: 1,
        unit_price_paise: 7000000,
        gst_rate_percent: 18,
        amount_paise: 7000000,
        created_at: new Date().toISOString(),
      },
    ],
  },
  {
    id: 'inv-002',
    tenant_id: 'org-1',
    customer_id: 'cust-002',
    customer_name: 'Apex Solutions Enterprise',
    customer_gstin: '27AAACA9876E1Z2',
    customer_email: 'finance@apexsolutions.com',
    customer_phone: '+91 98220 11223',
    lead_id: 'lead-002',
    invoice_number: 'INV-2026-002',
    invoice_date: '2026-07-10',
    due_date: '2026-07-24',
    status: 'sent',
    place_of_supply: '27 - Maharashtra',
    gst_treatment: 'b2b',
    is_igst: true,
    subtotal_paise: 15000000, // ₹1,50,000.00
    cgst_paise: 0,
    sgst_paise: 0,
    igst_paise: 2700000,     // 18% IGST = ₹27,000.00
    tds_paise: 1500000,      // 10% TDS (194J) = ₹15,000.00
    total_paise: 17700000,   // ₹1,77,000.00
    amount_paid_paise: 5000000, // ₹50,000 paid
    balance_due_paise: 12700000, // ₹1,27,000 balance
    notes: 'Inter-state software deployment service invoice.',
    created_by: 'Alex Vance',
    created_at: new Date(Date.now() - 13 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    line_items: [
      {
        id: 'li-003',
        invoice_id: 'inv-002',
        tenant_id: 'org-1',
        description: 'Vortiq Module Integration Services',
        hsn_sac_code: '998313',
        quantity: 1,
        unit_price_paise: 15000000,
        gst_rate_percent: 18,
        amount_paise: 15000000,
        created_at: new Date().toISOString(),
      },
    ],
  },
  {
    id: 'inv-003',
    tenant_id: 'org-1',
    customer_id: 'cust-003',
    customer_name: 'Patel Logistics Solutions',
    customer_gstin: '24AAACP5544K1Z9',
    customer_email: 'deepak@patellogistics.com',
    customer_phone: '+91 98111 22233',
    lead_id: 'lead-001',
    invoice_number: 'INV-2026-003',
    invoice_date: '2026-06-15',
    due_date: '2026-06-30',
    status: 'overdue',
    place_of_supply: '24 - Gujarat',
    gst_treatment: 'b2b',
    is_igst: true,
    subtotal_paise: 8500000,  // ₹85,000.00
    cgst_paise: 0,
    sgst_paise: 0,
    igst_paise: 1530000,     // 18% IGST = ₹15,300.00
    tds_paise: 170000,       // 2% TDS (194C) = ₹1,700.00
    total_paise: 10030000,   // ₹1,00,300.00
    amount_paid_paise: 0,
    balance_due_paise: 10030000,
    notes: 'Fleet tracking and logistics software module license.',
    created_by: 'Rajesh Kumar',
    created_at: new Date(Date.now() - 38 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    line_items: [
      {
        id: 'li-004',
        invoice_id: 'inv-003',
        tenant_id: 'org-1',
        description: 'Logistics Fleet Tracking Module',
        hsn_sac_code: '998314',
        quantity: 1,
        unit_price_paise: 8500000,
        gst_rate_percent: 18,
        amount_paise: 8500000,
        created_at: new Date().toISOString(),
      },
    ],
  },
];

export const SEED_PAYMENTS: PaymentRecord[] = [
  {
    id: 'pay-001',
    tenant_id: 'org-1',
    invoice_id: 'inv-001',
    invoice_number: 'INV-2026-001',
    customer_name: 'SunTech Manufacturing Pvt Ltd',
    amount_paise: 37760000,
    payment_mode: 'NEFT_RTGS',
    reference_number: 'HDFC2618290012',
    payment_date: '2026-07-05',
    notes: 'Full payment received via NEFT.',
    created_at: new Date(Date.now() - 18 * 86400000).toISOString(),
  },
  {
    id: 'pay-002',
    tenant_id: 'org-1',
    invoice_id: 'inv-002',
    invoice_number: 'INV-2026-002',
    customer_name: 'Apex Solutions Enterprise',
    amount_paise: 5000000,
    payment_mode: 'Razorpay',
    reference_number: 'pay_PzX981726354',
    payment_date: '2026-07-12',
    notes: 'Part advance payment via Razorpay gateway.',
    created_at: new Date(Date.now() - 11 * 86400000).toISOString(),
  },
];

export const SEED_TDS_RECORDS: TdsRecord[] = [
  {
    id: 'tds-001',
    tenant_id: 'org-1',
    invoice_id: 'inv-001',
    deductee_pan: 'AAACS1234F',
    section_code: '194J',
    tds_rate_percent: 10,
    base_amount_paise: 32000000,
    tds_amount_paise: 3200000,
    quarter: 'Q2',
    financial_year: '2026-27',
    challan_number: 'CHL-2026-0711',
    deposit_date: '2026-07-10',
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
  },
  {
    id: 'tds-002',
    tenant_id: 'org-1',
    invoice_id: 'inv-002',
    deductee_pan: 'AAACA9876E',
    section_code: '194J',
    tds_rate_percent: 10,
    base_amount_paise: 15000000,
    tds_amount_paise: 1500000,
    quarter: 'Q2',
    financial_year: '2026-27',
    challan_number: undefined,
    deposit_date: undefined,
    created_at: new Date(Date.now() - 12 * 86400000).toISOString(),
  },
  {
    id: 'tds-003',
    tenant_id: 'org-1',
    invoice_id: 'inv-003',
    deductee_pan: 'AAACP5544K',
    section_code: '194C',
    tds_rate_percent: 2,
    base_amount_paise: 8500000,
    tds_amount_paise: 170000,
    quarter: 'Q1',
    financial_year: '2026-27',
    challan_number: 'CHL-2026-0630',
    deposit_date: '2026-06-28',
    created_at: new Date(Date.now() - 35 * 86400000).toISOString(),
  },
];
