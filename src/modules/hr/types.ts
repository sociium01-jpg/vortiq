// ─────────────────────────────────────────────────────────────
// Vortiq HR & Payroll Types (Zoho People Parity 2026)
// Multi-tenant scoped by tenant_id
// ─────────────────────────────────────────────────────────────

import { EmployeeProfile, LeaveRequest } from '@/types';

export type HRTab = 'directory' | 'leave' | 'performance' | 'documents' | 'checklists' | 'self_service' | 'payroll';
export type LeaveType = 'casual' | 'sick' | 'earned' | 'maternity' | 'unpaid';

// ── Helper Utility Functions ──────────────────────────────────
export function formatPaiseToRupees(paise: number): string {
  const rupees = (paise || 0) / 100;
  return `₹${rupees.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function maskSensitiveField(value?: string, visibleChars = 4): string {
  if (!value) return '••••••••';
  if (value.length <= visibleChars) return '••••' + value;
  return '••••••••' + value.slice(-visibleChars);
}

// ── Statutory India Tax Rate Constants ────────────────────────
export const STATUTORY_RATES = {
  PF_BASIC_CAP: 15000,
  PF_EMPLOYEE_RATE: 0.12,
  ESI_GROSS_CAP: 21000,
  ESI_EMPLOYEE_RATE: 0.0075,
  ESI_EMPLOYER_RATE: 0.0325,
  PROFESSIONAL_TAX_MONTHLY: 200,
  TDS_194J_DEFAULT_RATE: 0.10,
  TDS_194J_TECH_RATE: 0.02,
};

export interface EmployeeWithUser extends Partial<EmployeeProfile> {
  id: string;
  user_id: string;
  tenant_id: string;
  full_name: string;
  email: string;
  role: string;
  department: string;
  designation: string;
  date_of_joining: string;
  ctc_annual: number;
  basic_monthly: number;
  avatar_url?: string;
  phone?: string;
  employee_code?: string;
  bank_account_no?: string;
  gross_salary_paise?: number;

  // Unmasked sensitive information stored securely for click-to-reveal
  pan_unmasked: string;
  bank_account_unmasked: string;
  ifsc_code: string;

  // Transient UI reveal state
  is_pan_revealed?: boolean;
  is_bank_revealed?: boolean;
  is_salary_revealed?: boolean;

  custom_fields?: Record<string, string>;
}

export interface LeaveRequestWithUser extends Partial<LeaveRequest> {
  id: string;
  tenant_id: string;
  employee_id: string;
  employee_name: string;
  employee_code?: string;
  department: string;
  avatar_url?: string;
  leave_type: LeaveType;
  start_date: string;
  end_date: string;
  days_count: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface LeaveBalance {
  employee_user_id: string;
  employee_name: string;
  casual_allocated: number;
  casual_used: number;
  sick_allocated: number;
  sick_used: number;
  earned_allocated: number;
  earned_used: number;
}

export interface PerformanceReview {
  id: string;
  tenant_id: string;
  employee_id: string;
  employee_name: string;
  reviewer_name: string;
  cycle_name: string;
  self_rating: number; // 1-5
  manager_rating: number; // 1-5
  goals_summary: string;
  status: 'draft' | 'submitted' | 'completed';
  created_at: string;
}

export interface HRDocument {
  id: string;
  tenant_id: string;
  employee_id: string;
  employee_name: string;
  doc_type: string; // Passport, Visa, Offer Letter, Aadhaar, PAN
  file_name: string;
  expiry_date?: string;
  is_expiring_soon?: boolean;
  notes?: string;
  created_at: string;
}

export interface ChecklistItem {
  id: string;
  task_title: string;
  is_completed: boolean;
}

export interface HRChecklist {
  id: string;
  tenant_id: string;
  employee_id: string;
  employee_name: string;
  type: 'onboarding' | 'offboarding';
  title: string;
  items: ChecklistItem[];
  created_at: string;
}

export interface SalaryChangeLog {
  id: string;
  tenant_id: string;
  employee_id: string;
  employee_name: string;
  old_ctc: number;
  new_ctc: number;
  changed_by_name: string;
  reason: string;
  created_at: string;
}

export interface PayslipDetails {
  id: string;
  payroll_run_id?: string;
  status?: string;
  disbursed_at?: string;
  employee: EmployeeWithUser;
  pay_period_month: number;
  pay_period_year: number;
  days_in_month: number;
  days_worked: number;
  leave_without_pay_days: number;

  // Earnings in INR Paise
  basic_salary_paise: number;
  hra_paise: number;
  special_allowance_paise: number;
  gross_salary_paise: number;

  // Statutory Deductions in INR Paise
  pf_employee_paise: number;
  esi_employee_paise: number;
  pt_paise: number;
  tds_paise: number;
  total_deductions_paise: number;
  net_salary_paise: number;
}

// ── Seed Datasets ─────────────────────────────────────────────

export const SEED_EMPLOYEES: EmployeeWithUser[] = [
  {
    id: 'emp-101',
    user_id: 'u-1',
    tenant_id: 'tenant-prod-001',
    full_name: 'Alex Vance',
    email: 'alex.vance@vortiq.biz',
    role: 'ADMIN',
    department: 'Engineering',
    designation: 'Lead Solutions Architect',
    date_of_joining: '2024-03-15',
    ctc_annual: 2400000,
    basic_monthly: 100000,
    pan_unmasked: 'ABCDE1234F',
    bank_account_no: '918237129847',
    bank_account_unmasked: '918237129847',
    ifsc_code: 'HDFC0001234',
    is_pan_revealed: false,
    is_bank_revealed: false,
    is_salary_revealed: false,
    custom_fields: {
      blood_group: 'O+',
      emergency_contact: '+91 98200 11223',
    },
  },
  {
    id: 'emp-102',
    user_id: 'u-2',
    tenant_id: 'tenant-prod-001',
    full_name: 'Priya Sharma',
    email: 'priya.sharma@vortiq.biz',
    role: 'MANAGER',
    department: 'Product Management',
    designation: 'Senior Product Manager',
    date_of_joining: '2024-06-01',
    ctc_annual: 1800000,
    basic_monthly: 75000,
    pan_unmasked: 'PQRSW9876K',
    bank_account_no: '445100998822',
    bank_account_unmasked: '445100998822',
    ifsc_code: 'ICIC0005544',
    is_pan_revealed: false,
    is_bank_revealed: false,
    is_salary_revealed: false,
    custom_fields: {
      blood_group: 'A+',
      emergency_contact: '+91 98450 33445',
    },
  },
];

export const SEED_LEAVE_REQUESTS: LeaveRequestWithUser[] = [
  {
    id: 'lr-101',
    tenant_id: 'tenant-prod-001',
    employee_id: 'u-2',
    employee_name: 'Priya Sharma',
    department: 'Product Management',
    leave_type: 'casual',
    start_date: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
    end_date: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
    days_count: 2,
    reason: 'Personal family event',
    status: 'pending',
    created_at: new Date().toISOString(),
  },
];

export const SEED_PERFORMANCE_REVIEWS: PerformanceReview[] = [
  {
    id: 'pr-101',
    tenant_id: 'tenant-prod-001',
    employee_id: 'u-2',
    employee_name: 'Priya Sharma',
    reviewer_name: 'Alex Vance',
    cycle_name: 'Q3 2026 Appraisal Cycle',
    self_rating: 4,
    manager_rating: 5,
    goals_summary: 'Delivered Sales Pipeline & Task Management expansions on schedule.',
    status: 'completed',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
];

export const SEED_HR_DOCUMENTS: HRDocument[] = [
  {
    id: 'doc-101',
    tenant_id: 'tenant-prod-001',
    employee_id: 'u-1',
    employee_name: 'Alex Vance',
    doc_type: 'Passport & Work Visa',
    file_name: 'Alex_Vance_Passport_2026.pdf',
    expiry_date: new Date(Date.now() + 25 * 86400000).toISOString().split('T')[0], // Expiring in 25 days
    is_expiring_soon: true,
    notes: 'US B1/B2 Business Visa Renewal Required',
    created_at: new Date(Date.now() - 100 * 86400000).toISOString(),
  },
];

export const SEED_HR_CHECKLISTS: HRChecklist[] = [
  {
    id: 'chk-101',
    tenant_id: 'tenant-prod-001',
    employee_id: 'u-2',
    employee_name: 'Priya Sharma',
    type: 'onboarding',
    title: 'Senior Product Manager Onboarding Checklist',
    items: [
      { id: 'i-1', task_title: 'IT Hardware Laptop & Security Token Allocation', is_completed: true },
      { id: 'i-2', task_title: 'Sign NDA & Proprietary Rights Agreement', is_completed: true },
      { id: 'i-3', task_title: 'Form 11 Provident Fund Declaration Submission', is_completed: false },
    ],
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
];
