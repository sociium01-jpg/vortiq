// Local HR types extending global domain types for Stage 1b Module E: HR & Payroll

import { EmployeeProfile, LeaveRequest, PayrollRun } from '@/types';

export type HRTab = 'directory' | 'leave' | 'payroll' | 'analytics';
export type LeaveType = 'casual' | 'sick' | 'earned' | 'unpaid';

export interface EmployeeWithUser extends EmployeeProfile {
  // Extended user details (joined from users / UserProfile)
  full_name: string;
  email: string;
  role: string;
  avatar_url?: string;
  phone?: string;

  // Unmasked sensitive information stored securely for click-to-reveal
  pan_unmasked: string;
  bank_account_unmasked: string;

  // Transient UI reveal state
  is_pan_revealed?: boolean;
  is_bank_revealed?: boolean;
}

export interface LeaveRequestWithUser extends LeaveRequest {
  employee_name: string;
  employee_code: string;
  department: string;
  avatar_url?: string;
  leave_type: LeaveType;
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

export interface PayslipDetails {
  id: string;
  payroll_run_id?: string;
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

  // Net Disbursable Pay in INR Paise
  net_salary_paise: number;

  status: 'draft' | 'approved' | 'disbursed';
  disbursed_at?: string;
}

export interface AuditLogNotification {
  id: string;
  timestamp: string;
  actor_name: string;
  actor_role: string;
  target_employee_name: string;
  target_employee_code: string;
  field_revealed: 'PAN' | 'Bank Account';
  ip_address?: string;
}

export interface PayrollRunItem {
  employee_id: string;
  employee_name: string;
  employee_code: string;
  department: string;
  gross_paise: number;
  deductions_paise: number;
  net_paise: number;
  status: 'pending' | 'processed';
}

export interface ExtendedPayrollRun extends PayrollRun {
  items_count: number;
  items?: PayrollRunItem[];
}

/**
 * Utility helper to format monetary amounts in INR (Rupees) with standard Indian numbering formatting.
 * Right-aligned numbers should use `font-mono text-right`.
 */
export function formatPaiseToRupees(paise: number, includeDecimals = false): string {
  const rupees = (paise || 0) / 100;
  if (includeDecimals) {
    return `₹${rupees.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `₹${Math.round(rupees).toLocaleString('en-IN')}`;
}

/**
 * Utility helper to mask sensitive fields (PAN & Bank Account).
 * E.g. 'ABCDE1234F' -> '•••• 234F', '987654321098' -> '•••• 1098'
 */
export function maskSensitiveField(value?: string): string {
  if (!value) return '•••• ----';
  const clean = value.replace(/\s+/g, '');
  if (clean.length <= 4) return '•••• ' + clean;
  const lastFour = clean.slice(-4);
  return `•••• ${lastFour}`;
}
