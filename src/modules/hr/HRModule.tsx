import React, { useState } from 'react';
import {
  EmployeeWithUser,
  LeaveRequestWithUser,
  LeaveBalance,
  ExtendedPayrollRun,
  AuditLogNotification,
  HRTab,
  formatPaiseToRupees,
  PayslipDetails,
} from './types';
import { EmployeeTable } from './EmployeeTable';
import { PayslipModal } from './PayslipModal';
import { LeaveManager } from './LeaveManager';
import { useAuth } from '@/auth/AuthContext';
import { auditLogger } from '@/lib/auditLogger';
import {
  Button,
  Card,
  Badge,
  Toast,
} from '@/design-system';
import {
  Users,
  CalendarCheck,
  CreditCard,
  BarChart3,
  ShieldCheck,
  DollarSign,
  Plus,
  Building2,
  Lock,
  FileSpreadsheet,
  Download,
  Sparkles,
} from 'lucide-react';

export const HRModule: React.FC = () => {
  const { user, tenant } = useAuth();
  const [activeTab, setActiveTab] = useState<HRTab>('directory');

  // Active toast notification state
  const [toasts, setToasts] = useState<{ id: string; type: 'info' | 'warning' | 'success'; title: string; message: string }[]>([]);

  const addToast = (title: string, message: string, type: 'info' | 'warning' | 'success' = 'warning') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, title, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Mock Employee Data extending UserProfiles / users table
  const [employees, setEmployees] = useState<EmployeeWithUser[]>([
    {
      id: 'emp-101',
      user_id: 'usr-101',
      tenant_id: tenant?.id || 't-1',
      employee_code: 'EMP-001',
      full_name: 'Rajesh Sharma',
      email: 'rajesh.sharma@vortiq.io',
      role: 'MANAGER',
      designation: 'Head of Engineering',
      department: 'Engineering',
      date_of_joining: '2023-01-15',
      employment_type: 'full_time',
      work_location: 'Gurugram HQ',
      status: 'active',
      basic_salary_paise: 8250000,
      hra_paise: 4125000,
      special_allowance_paise: 4125000,
      gross_salary_paise: 16500000,
      pf_applicable: true,
      esi_applicable: false,
      pt_applicable: true,
      pan_masked: '•••• 1234',
      pan_unmasked: 'ABCDE1234F',
      bank_account_masked: '•••• 5678',
      bank_account_unmasked: '987654321012',
      bank_name: 'HDFC Bank',
      bank_ifsc: 'HDFC0001234',
      is_pan_revealed: false,
      is_bank_revealed: false,
      created_at: '2023-01-15T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    },
    {
      id: 'emp-102',
      user_id: 'usr-102',
      tenant_id: tenant?.id || 't-1',
      employee_code: 'EMP-002',
      full_name: 'Priya Sundaram',
      email: 'priya.sundaram@vortiq.io',
      role: 'MEMBER',
      designation: 'Staff Frontend Architect',
      department: 'Engineering',
      date_of_joining: '2023-04-01',
      employment_type: 'full_time',
      work_location: 'Bengaluru R&D',
      status: 'active',
      basic_salary_paise: 7000000,
      hra_paise: 3500000,
      special_allowance_paise: 3500000,
      gross_salary_paise: 14000000,
      pf_applicable: true,
      esi_applicable: false,
      pt_applicable: true,
      pan_masked: '•••• 2345',
      pan_unmasked: 'PQRSX5678Y',
      bank_account_masked: '•••• 6789',
      bank_account_unmasked: '876543210987',
      bank_name: 'ICICI Bank',
      bank_ifsc: 'ICIC0005678',
      is_pan_revealed: false,
      is_bank_revealed: false,
      created_at: '2023-04-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    },
    {
      id: 'emp-103',
      user_id: 'usr-103',
      tenant_id: tenant?.id || 't-1',
      employee_code: 'EMP-003',
      full_name: 'Amit Verma',
      email: 'amit.verma@vortiq.io',
      role: 'MEMBER',
      designation: 'Senior Product Manager',
      department: 'Product',
      date_of_joining: '2023-06-15',
      employment_type: 'full_time',
      work_location: 'Gurugram HQ',
      status: 'active',
      basic_salary_paise: 6750000,
      hra_paise: 3375000,
      special_allowance_paise: 3375000,
      gross_salary_paise: 13500000,
      pf_applicable: true,
      esi_applicable: false,
      pt_applicable: true,
      pan_masked: '•••• 3456',
      pan_unmasked: 'LMNOK9012Z',
      bank_account_masked: '•••• 7890',
      bank_account_unmasked: '765432109876',
      bank_name: 'Axis Bank',
      bank_ifsc: 'UTIB0000999',
      is_pan_revealed: false,
      is_bank_revealed: false,
      created_at: '2023-06-15T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    },
    {
      id: 'emp-104',
      user_id: 'usr-104',
      tenant_id: tenant?.id || 't-1',
      employee_code: 'EMP-004',
      full_name: 'Neha Patel',
      email: 'neha.patel@vortiq.io',
      role: 'HR_ADMIN',
      designation: 'Lead HR Manager',
      department: 'HR & Legal',
      date_of_joining: '2022-11-01',
      employment_type: 'full_time',
      work_location: 'Gurugram HQ',
      status: 'active',
      basic_salary_paise: 4750000,
      hra_paise: 2375000,
      special_allowance_paise: 2375000,
      gross_salary_paise: 9500000,
      pf_applicable: true,
      esi_applicable: false,
      pt_applicable: true,
      pan_masked: '•••• 4567',
      pan_unmasked: 'FGHIJ3456A',
      bank_account_masked: '•••• 8901',
      bank_account_unmasked: '654321098765',
      bank_name: 'State Bank of India',
      bank_ifsc: 'SBIN0001234',
      is_pan_revealed: false,
      is_bank_revealed: false,
      created_at: '2022-11-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    },
    {
      id: 'emp-105',
      user_id: 'usr-105',
      tenant_id: tenant?.id || 't-1',
      employee_code: 'EMP-005',
      full_name: 'Vikramaditya Rao',
      email: 'vikram.rao@vortiq.io',
      role: 'MEMBER',
      designation: 'Senior Backend Engineer',
      department: 'Engineering',
      date_of_joining: '2024-02-10',
      employment_type: 'full_time',
      work_location: 'Hyderabad Tech Park',
      status: 'on_leave',
      basic_salary_paise: 6000000,
      hra_paise: 3000000,
      special_allowance_paise: 3000000,
      gross_salary_paise: 12000000,
      pf_applicable: true,
      esi_applicable: false,
      pt_applicable: true,
      pan_masked: '•••• 5678',
      pan_unmasked: 'KLMNO7890B',
      bank_account_masked: '•••• 9012',
      bank_account_unmasked: '543210987654',
      bank_name: 'HDFC Bank',
      bank_ifsc: 'HDFC0005555',
      is_pan_revealed: false,
      is_bank_revealed: false,
      created_at: '2024-02-10T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    },
    {
      id: 'emp-106',
      user_id: 'usr-106',
      tenant_id: tenant?.id || 't-1',
      employee_code: 'EMP-006',
      full_name: 'Ananya Sen',
      email: 'ananya.sen@vortiq.io',
      role: 'FINANCE_ADMIN',
      designation: 'Financial Controller',
      department: 'Finance',
      date_of_joining: '2023-09-01',
      employment_type: 'full_time',
      work_location: 'Gurugram HQ',
      status: 'active',
      basic_salary_paise: 5500000,
      hra_paise: 2750000,
      special_allowance_paise: 2750000,
      gross_salary_paise: 11000000,
      pf_applicable: true,
      esi_applicable: false,
      pt_applicable: true,
      pan_masked: '•••• 6789',
      pan_unmasked: 'QRSTU1234C',
      bank_account_masked: '•••• 0123',
      bank_account_unmasked: '432109876543',
      bank_name: 'Kotak Mahindra Bank',
      bank_ifsc: 'KKBK0000444',
      is_pan_revealed: false,
      is_bank_revealed: false,
      created_at: '2023-09-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    },
    {
      id: 'emp-107',
      user_id: 'usr-107',
      tenant_id: tenant?.id || 't-1',
      employee_code: 'EMP-007',
      full_name: 'Rohan Gupta',
      email: 'rohan.gupta@vortiq.io',
      role: 'MEMBER',
      designation: 'Operations Specialist',
      department: 'Operations',
      date_of_joining: '2024-05-15',
      employment_type: 'contractor',
      work_location: 'Gurugram HQ',
      status: 'active',
      basic_salary_paise: 3250000,
      hra_paise: 1625000,
      special_allowance_paise: 1625000,
      gross_salary_paise: 6500000,
      pf_applicable: false,
      esi_applicable: true,
      pt_applicable: true,
      pan_masked: '•••• 7890',
      pan_unmasked: 'VWXYZ5678D',
      bank_account_masked: '•••• 1234',
      bank_account_unmasked: '321098765432',
      bank_name: 'State Bank of India',
      bank_ifsc: 'SBIN0008888',
      is_pan_revealed: false,
      is_bank_revealed: false,
      created_at: '2024-05-15T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    },
    {
      id: 'emp-108',
      user_id: 'usr-108',
      tenant_id: tenant?.id || 't-1',
      employee_code: 'EMP-008',
      full_name: 'Kavita Krishnan',
      email: 'kavita.k@vortiq.io',
      role: 'MEMBER',
      designation: 'UI/UX Product Designer',
      department: 'Product',
      date_of_joining: '2024-08-01',
      employment_type: 'full_time',
      work_location: 'Bengaluru R&D',
      status: 'active',
      basic_salary_paise: 3750000,
      hra_paise: 1875000,
      special_allowance_paise: 1875000,
      gross_salary_paise: 7500000,
      pf_applicable: true,
      esi_applicable: true,
      pt_applicable: true,
      pan_masked: '•••• 8901',
      pan_unmasked: 'ABCDX9012E',
      bank_account_masked: '•••• 2345',
      bank_account_unmasked: '210987654321',
      bank_name: 'HDFC Bank',
      bank_ifsc: 'HDFC0001234',
      is_pan_revealed: false,
      is_bank_revealed: false,
      created_at: '2024-08-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    },
  ]);

  // Mock Leave Requests
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequestWithUser[]>([
    {
      id: 'lr-1',
      tenant_id: tenant?.id || 't-1',
      employee_user_id: 'usr-105',
      employee_name: 'Vikramaditya Rao',
      employee_code: 'EMP-005',
      department: 'Engineering',
      leave_type: 'earned',
      from_date: '2026-07-20',
      to_date: '2026-07-25',
      days_count: 5,
      reason: 'Annual family holiday in Munnar',
      status: 'approved',
      reviewed_by: 'Rajesh Sharma',
      reviewed_at: '2026-07-18T10:30:00Z',
      created_at: '2026-07-17T09:00:00Z',
    },
    {
      id: 'lr-2',
      tenant_id: tenant?.id || 't-1',
      employee_user_id: 'usr-102',
      employee_name: 'Priya Sundaram',
      employee_code: 'EMP-002',
      department: 'Engineering',
      leave_type: 'sick',
      from_date: '2026-07-28',
      to_date: '2026-07-29',
      days_count: 2,
      reason: 'Viral fever rest recommended by doctor',
      status: 'pending',
      created_at: '2026-07-22T14:15:00Z',
    },
    {
      id: 'lr-3',
      tenant_id: tenant?.id || 't-1',
      employee_user_id: 'usr-107',
      employee_name: 'Rohan Gupta',
      employee_code: 'EMP-007',
      department: 'Operations',
      leave_type: 'casual',
      from_date: '2026-07-30',
      to_date: '2026-07-30',
      days_count: 1,
      reason: 'Personal bank work & home maintenance',
      status: 'pending',
      created_at: '2026-07-23T09:10:00Z',
    },
  ]);

  // Mock Leave Balances
  const [leaveBalances] = useState<LeaveBalance[]>([
    { employee_user_id: 'usr-101', employee_name: 'Rajesh Sharma', casual_allocated: 12, casual_used: 2, sick_allocated: 10, sick_used: 1, earned_allocated: 15, earned_used: 3 },
    { employee_user_id: 'usr-102', employee_name: 'Priya Sundaram', casual_allocated: 12, casual_used: 4, sick_allocated: 10, sick_used: 2, earned_allocated: 15, earned_used: 5 },
    { employee_user_id: 'usr-103', employee_name: 'Amit Verma', casual_allocated: 12, casual_used: 1, sick_allocated: 10, sick_used: 0, earned_allocated: 15, earned_used: 2 },
    { employee_user_id: 'usr-104', employee_name: 'Neha Patel', casual_allocated: 12, casual_used: 3, sick_allocated: 10, sick_used: 1, earned_allocated: 15, earned_used: 4 },
    { employee_user_id: 'usr-105', employee_name: 'Vikramaditya Rao', casual_allocated: 12, casual_used: 5, sick_allocated: 10, sick_used: 3, earned_allocated: 15, earned_used: 8 },
    { employee_user_id: 'usr-106', employee_name: 'Ananya Sen', casual_allocated: 12, casual_used: 2, sick_allocated: 10, sick_used: 0, earned_allocated: 15, earned_used: 1 },
    { employee_user_id: 'usr-107', employee_name: 'Rohan Gupta', casual_allocated: 12, casual_used: 1, sick_allocated: 10, sick_used: 1, earned_allocated: 15, earned_used: 0 },
    { employee_user_id: 'usr-108', employee_name: 'Kavita Krishnan', casual_allocated: 12, casual_used: 0, sick_allocated: 10, sick_used: 0, earned_allocated: 15, earned_used: 0 },
  ]);

  // Mock Payroll Runs
  const [payrollRuns, setPayrollRuns] = useState<ExtendedPayrollRun[]>([
    {
      id: 'pr-2026-06',
      tenant_id: tenant?.id || 't-1',
      pay_period_month: 6,
      pay_period_year: 2026,
      status: 'disbursed',
      total_gross_paise: 90500000,
      total_net_paise: 77830000,
      created_by: 'Neha Patel',
      approved_by: 'Rajesh Sharma',
      created_at: '2026-06-28T10:00:00Z',
      items_count: 8,
    },
    {
      id: 'pr-2026-07',
      tenant_id: tenant?.id || 't-1',
      pay_period_month: 7,
      pay_period_year: 2026,
      status: 'approved',
      total_gross_paise: 90500000,
      total_net_paise: 77830000,
      created_by: 'Neha Patel',
      approved_by: 'Rajesh Sharma',
      created_at: '2026-07-22T16:00:00Z',
      items_count: 8,
    },
  ]);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AuditLogNotification[]>([]);

  // Selected Employee for Payslip Modal
  const [selectedPayslipEmployee, setSelectedPayslipEmployee] = useState<EmployeeWithUser | null>(null);
  const [isPayslipModalOpen, setIsPayslipModalOpen] = useState<boolean>(false);

  // Click-to-reveal Sensitive Data Handlers
  const handleToggleRevealPan = (employeeId: string) => {
    setEmployees((prev) =>
      prev.map((emp) => {
        if (emp.id === employeeId) {
          const nextState = !emp.is_pan_revealed;
          if (nextState) {
            // Log security audit event
            auditLogger.logChange(
              tenant?.id || 't-1',
              'employee_profile',
              emp.id,
              'pan_unmasked',
              'MASKED (•••• ' + emp.pan_unmasked.slice(-4) + ')',
              emp.pan_unmasked,
              user?.id || 'admin-user'
            );

            const notif: AuditLogNotification = {
              id: `audit-${Date.now()}`,
              timestamp: new Date().toLocaleTimeString('en-IN'),
              actor_name: user?.full_name || 'Admin User',
              actor_role: user?.role || 'ADMIN',
              target_employee_name: emp.full_name,
              target_employee_code: emp.employee_code,
              field_revealed: 'PAN',
            };
            setAuditLogs((a) => [notif, ...a]);

            addToast(
              'Security Audit Alert: PAN Revealed',
              `User ${user?.full_name || 'Admin'} unmasked PAN for ${emp.full_name} (${emp.employee_code}). Audit log recorded.`,
              'warning'
            );
          }
          return { ...emp, is_pan_revealed: nextState };
        }
        return emp;
      })
    );
  };

  const handleToggleRevealBank = (employeeId: string) => {
    setEmployees((prev) =>
      prev.map((emp) => {
        if (emp.id === employeeId) {
          const nextState = !emp.is_bank_revealed;
          if (nextState) {
            // Log security audit event
            auditLogger.logChange(
              tenant?.id || 't-1',
              'employee_profile',
              emp.id,
              'bank_account_unmasked',
              'MASKED (•••• ' + emp.bank_account_unmasked.slice(-4) + ')',
              emp.bank_account_unmasked,
              user?.id || 'admin-user'
            );

            const notif: AuditLogNotification = {
              id: `audit-${Date.now()}`,
              timestamp: new Date().toLocaleTimeString('en-IN'),
              actor_name: user?.full_name || 'Admin User',
              actor_role: user?.role || 'ADMIN',
              target_employee_name: emp.full_name,
              target_employee_code: emp.employee_code,
              field_revealed: 'Bank Account',
            };
            setAuditLogs((a) => [notif, ...a]);

            addToast(
              'Security Audit Alert: Bank Account Revealed',
              `User ${user?.full_name || 'Admin'} unmasked bank details for ${emp.full_name} (${emp.employee_code}). Audit log recorded.`,
              'warning'
            );
          }
          return { ...emp, is_bank_revealed: nextState };
        }
        return emp;
      })
    );
  };

  const handleOpenPayslip = (emp: EmployeeWithUser) => {
    setSelectedPayslipEmployee(emp);
    setIsPayslipModalOpen(true);
  };

  const handleDisbursePayslip = (details: PayslipDetails) => {
    addToast(
      'Payslip Disbursed Successfully',
      `July 2026 Payslip for ${details.employee.full_name} processed. Take-home amount ${formatPaiseToRupees(details.net_salary_paise, true)}.`,
      'success'
    );
  };

  // Leave Handlers
  const handleApproveLeave = (id: string) => {
    setLeaveRequests((prev) =>
      prev.map((req) =>
        req.id === id
          ? {
              ...req,
              status: 'approved',
              reviewed_by: user?.full_name || 'HR Admin',
              reviewed_at: new Date().toISOString(),
            }
          : req
      )
    );
    const target = leaveRequests.find((r) => r.id === id);
    addToast(
      'Leave Request Approved',
      `Leave for ${target?.employee_name || 'Employee'} (${target?.days_count} days) has been approved.`,
      'success'
    );
  };

  const handleRejectLeave = (id: string) => {
    setLeaveRequests((prev) =>
      prev.map((req) =>
        req.id === id
          ? {
              ...req,
              status: 'rejected',
              reviewed_by: user?.full_name || 'HR Admin',
              reviewed_at: new Date().toISOString(),
            }
          : req
      )
    );
    const target = leaveRequests.find((r) => r.id === id);
    addToast(
      'Leave Request Rejected',
      `Leave for ${target?.employee_name || 'Employee'} has been rejected.`,
      'warning'
    );
  };

  const handleCreateLeaveRequest = (newReq: Partial<LeaveRequestWithUser>) => {
    const created: LeaveRequestWithUser = {
      id: `lr-${Date.now()}`,
      tenant_id: tenant?.id || 't-1',
      employee_user_id: newReq.employee_user_id || 'usr-101',
      employee_name: newReq.employee_name || 'Employee',
      employee_code: newReq.employee_code || 'EMP-000',
      department: newReq.department || 'Engineering',
      leave_type: newReq.leave_type || 'casual',
      from_date: newReq.from_date || '',
      to_date: newReq.to_date || '',
      days_count: newReq.days_count || 1,
      reason: newReq.reason,
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    setLeaveRequests((prev) => [created, ...prev]);
    addToast(
      'Leave Request Submitted',
      `New request for ${created.employee_name} (${created.days_count} days) added to pending workflow.`,
      'info'
    );
  };

  // Run new monthly payroll handler
  const handleInitiatePayrollRun = () => {
    const month = 8;
    const year = 2026;
    const newRun: ExtendedPayrollRun = {
      id: `pr-2026-08`,
      tenant_id: tenant?.id || 't-1',
      pay_period_month: month,
      pay_period_year: year,
      status: 'draft',
      total_gross_paise: totalGrossSalaryPaise,
      total_net_paise: Math.round(totalGrossSalaryPaise * 0.86),
      created_by: user?.full_name || 'HR Admin',
      created_at: new Date().toISOString(),
      items_count: employees.length,
    };
    setPayrollRuns((prev) => [newRun, ...prev]);
    addToast(
      'New Payroll Run Draft Created',
      `Initiated August 2026 Payroll Run for ${employees.length} employees. Total Gross: ${formatPaiseToRupees(totalGrossSalaryPaise)}.`,
      'info'
    );
  };

  // KPI Calculations
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter((e) => e.status === 'active').length;
  const totalGrossSalaryPaise = employees.reduce((acc, e) => acc + e.gross_salary_paise, 0);
  const pendingLeavesCount = leaveRequests.filter((l) => l.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Toast Notifications Stack */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <Toast
              id={t.id}
              type={t.type}
              title={t.title}
              message={t.message}
              onDismiss={removeToast}
            />
          </div>
        ))}
      </div>

      {/* Module Title & Quick Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-dark-card p-5 rounded-2xl border border-dark-border shadow-xl">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-500/10 border border-brand-500/30 text-brand-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-100 font-display tracking-tight flex items-center gap-2">
                <span>HR & Payroll Suite</span>
                <Badge variant="emerald" size="sm">
                  Stage 1b Module E
                </Badge>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Unified Employee Profiles, Statutory Payroll (PF/ESI/PT/TDS), Leave Approvals & Sensitive PII Protection.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<FileSpreadsheet className="w-3.5 h-3.5 text-brand-400" />}
            onClick={() => addToast('Exporting HR Records', 'Employee dataset exported as CSV.', 'info')}
          >
            Export CSV
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Sparkles className="w-3.5 h-3.5 text-dark-bg" />}
            onClick={handleInitiatePayrollRun}
          >
            Run Monthly Payroll
          </Button>
        </div>
      </div>

      {/* Metric Cards Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Headcount */}
        <Card className="p-4 bg-dark-card border-dark-border hover:border-brand-500/40">
          <div className="flex items-center justify-between">
            <span className="text-2xs font-semibold uppercase text-slate-400 tracking-wider">
              Total Headcount
            </span>
            <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black font-mono text-slate-100">{totalEmployees}</span>
            <Badge variant="emerald" size="sm" dot>
              {activeEmployees} Active
            </Badge>
          </div>
          <p className="mt-2 text-2xs text-slate-400 font-mono">
            Users extended via employee_profiles
          </p>
        </Card>

        {/* Monthly Gross Payroll */}
        <Card className="bg-dark-card border-dark-border hover:border-brand-500/40">
          <div className="flex items-center justify-between">
            <span className="text-2xs font-semibold uppercase text-slate-400 tracking-wider">
              Monthly Gross Payroll
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black font-mono text-emerald-400 text-right">
              {formatPaiseToRupees(totalGrossSalaryPaise)}
            </span>
          </div>
          <p className="mt-2 text-2xs text-slate-400 font-mono">
            Avg Cost: {formatPaiseToRupees(Math.round(totalGrossSalaryPaise / (totalEmployees || 1)))}/emp
          </p>
        </Card>

        {/* Pending Leave Requests */}
        <Card className="bg-dark-card border-dark-border hover:border-brand-500/40">
          <div className="flex items-center justify-between">
            <span className="text-2xs font-semibold uppercase text-slate-400 tracking-wider">
              Pending Leave Actions
            </span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black font-mono text-amber-400">
              {pendingLeavesCount}
            </span>
            {pendingLeavesCount > 0 ? (
              <Badge variant="amber" size="sm">Action Needed</Badge>
            ) : (
              <Badge variant="emerald" size="sm">All Clear</Badge>
            )}
          </div>
          <p className="mt-2 text-2xs text-slate-400 font-mono">
            Total Requests Logged: {leaveRequests.length}
          </p>
        </Card>

        {/* Statutory Compliance */}
        <Card className="bg-dark-card border-dark-border hover:border-brand-500/40">
          <div className="flex items-center justify-between">
            <span className="text-2xs font-semibold uppercase text-slate-400 tracking-wider">
              Statutory Compliance
            </span>
            <div className="p-1.5 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black font-mono text-violet-300">100%</span>
            <Badge variant="violet" size="sm">PF • ESI • PT • TDS</Badge>
          </div>
          <p className="mt-2 text-2xs text-slate-400 font-mono">
            Audit Security Logs: <strong className="text-slate-200">{auditLogs.length}</strong> events
          </p>
        </Card>
      </div>

      {/* Module Navigation Tabs */}
      <div className="border-b border-dark-border flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveTab('directory')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'directory'
              ? 'border-brand-500 text-brand-400 bg-brand-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-dark-surface'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Employee Directory</span>
          <span className="text-2xs px-1.5 py-0.2 rounded-full bg-dark-card border border-dark-border text-slate-300 font-mono">
            {employees.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('leave')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'leave'
              ? 'border-brand-500 text-brand-400 bg-brand-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-dark-surface'
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          <span>Leave Management</span>
          {pendingLeavesCount > 0 && (
            <span className="text-2xs px-1.5 py-0.2 rounded-full bg-amber-500 text-dark-bg font-bold font-mono">
              {pendingLeavesCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('payroll')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'payroll'
              ? 'border-brand-500 text-brand-400 bg-brand-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-dark-surface'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Payroll Runs</span>
          <span className="text-2xs px-1.5 py-0.2 rounded-full bg-dark-card border border-dark-border text-slate-300 font-mono">
            {payrollRuns.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'analytics'
              ? 'border-brand-500 text-brand-400 bg-brand-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-dark-surface'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>HR Analytics & Audit</span>
        </button>
      </div>

      {/* Tab Content Viewports */}
      <main className="space-y-6">
        {/* Tab 1: Employee Directory */}
        {activeTab === 'directory' && (
          <EmployeeTable
            employees={employees}
            onToggleRevealPan={handleToggleRevealPan}
            onToggleRevealBank={handleToggleRevealBank}
            onSelectEmployeeForPayslip={handleOpenPayslip}
          />
        )}

        {/* Tab 2: Leave Management */}
        {activeTab === 'leave' && (
          <LeaveManager
            leaveRequests={leaveRequests}
            leaveBalances={leaveBalances}
            employees={employees}
            onApproveRequest={handleApproveLeave}
            onRejectRequest={handleRejectLeave}
            onCreateLeaveRequest={handleCreateLeaveRequest}
          />
        )}

        {/* Tab 3: Payroll Runs */}
        {activeTab === 'payroll' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-dark-card p-4 rounded-xl border border-dark-border">
              <div>
                <h3 className="text-sm font-semibold text-slate-100 font-display">
                  Monthly Payroll Runs Register
                </h3>
                <p className="text-2xs text-slate-400">
                  Track pay periods, statutory compliance disbursements, gross earnings & net payouts.
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus className="w-3.5 h-3.5" />}
                onClick={handleInitiatePayrollRun}
              >
                Initiate New Payroll Run
              </Button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-dark-border/80 bg-dark-card shadow-lg">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-dark-border bg-dark-surface/70 text-2xs uppercase font-semibold text-slate-400 tracking-wider">
                    <th className="py-3 px-4">Pay Period</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-center">Employees</th>
                    <th className="py-3 px-4 text-right">Total Gross</th>
                    <th className="py-3 px-4 text-right">Total Net Disbursed</th>
                    <th className="py-3 px-3">Initiated By</th>
                    <th className="py-3 px-3">Approved By</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border/50 text-xs">
                  {payrollRuns.map((run) => (
                    <tr key={run.id} className="hover:bg-dark-surface/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-100 font-mono">
                          {new Date(run.pay_period_year, run.pay_period_month - 1).toLocaleString('en-IN', { month: 'long', year: 'numeric' })}
                        </div>
                        <div className="text-2xs text-slate-400 font-mono">ID: {run.id}</div>
                      </td>
                      <td className="py-3.5 px-3">
                        {run.status === 'disbursed' ? (
                          <Badge variant="emerald" dot>Disbursed</Badge>
                        ) : run.status === 'approved' ? (
                          <Badge variant="blue" dot>Approved</Badge>
                        ) : (
                          <Badge variant="amber" dot>Draft</Badge>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-center font-mono font-bold text-slate-300">
                        {run.items_count} Employees
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-medium text-slate-200">
                        {formatPaiseToRupees(run.total_gross_paise)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400">
                        {formatPaiseToRupees(run.total_net_paise)}
                      </td>
                      <td className="py-3.5 px-3 text-slate-300">{run.created_by || 'Admin'}</td>
                      <td className="py-3.5 px-3 text-slate-300">{run.approved_by || '—'}</td>
                      <td className="py-3.5 px-4 text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          leftIcon={<Download className="w-3.5 h-3.5 text-brand-400" />}
                          onClick={() => addToast('Exporting Payroll Summary', `Downloaded report for ${run.id}`, 'info')}
                          className="text-2xs py-1 px-2.5"
                        >
                          Summary
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: HR Analytics & Audit */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Department Distribution */}
              <Card className="bg-dark-card border-dark-border space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-display flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-brand-400" />
                  Department Headcount
                </h4>
                <div className="space-y-2 text-xs">
                  {[
                    { dept: 'Engineering', count: 3, percent: 37.5, color: 'bg-brand-500' },
                    { dept: 'Product', count: 2, percent: 25, color: 'bg-blue-500' },
                    { dept: 'HR & Legal', count: 1, percent: 12.5, color: 'bg-violet-500' },
                    { dept: 'Finance', count: 1, percent: 12.5, color: 'bg-emerald-500' },
                    { dept: 'Operations', count: 1, percent: 12.5, color: 'bg-amber-500' },
                  ].map((item) => (
                    <div key={item.dept} className="space-y-1">
                      <div className="flex justify-between text-2xs font-mono">
                        <span className="text-slate-300">{item.dept}</span>
                        <span className="text-slate-400">{item.count} emp ({item.percent}%)</span>
                      </div>
                      <div className="w-full bg-dark-surface h-1.5 rounded-full overflow-hidden">
                        <div className={`${item.color} h-full rounded-full`} style={{ width: `${item.percent}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Statutory Tax Breakdown */}
              <Card className="bg-dark-card border-dark-border space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-display flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                  Monthly Statutory Deductions
                </h4>
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-dark-surface/60 border border-dark-border">
                    <span className="text-slate-300">Provident Fund (PF 12%)</span>
                    <span className="font-mono font-bold text-emerald-400 text-right">
                      {formatPaiseToRupees(employees.reduce((acc, e) => acc + (e.pf_applicable ? Math.round(e.basic_salary_paise * 0.12) : 0), 0))}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-dark-surface/60 border border-dark-border">
                    <span className="text-slate-300">ESI (0.75% Gross)</span>
                    <span className="font-mono font-bold text-emerald-400 text-right">
                      {formatPaiseToRupees(employees.reduce((acc, e) => acc + (e.esi_applicable ? Math.round(e.gross_salary_paise * 0.0075) : 0), 0))}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-dark-surface/60 border border-dark-border">
                    <span className="text-slate-300">Professional Tax (PT)</span>
                    <span className="font-mono font-bold text-emerald-400 text-right">
                      {formatPaiseToRupees(employees.reduce((acc, e) => acc + (e.pt_applicable ? 20000 : 0), 0))}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Security Audit Feed */}
              <Card className="bg-dark-card border-dark-border space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-display flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-400" />
                  PII Access Audit Log Stream
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {auditLogs.length === 0 ? (
                    <div className="text-2xs text-slate-400 italic py-4 text-center">
                      No sensitive data reveal events in current session.
                    </div>
                  ) : (
                    auditLogs.map((log) => (
                      <div
                        key={log.id}
                        className="p-2 rounded bg-amber-500/10 border border-amber-500/20 text-2xs space-y-0.5"
                      >
                        <div className="flex items-center justify-between text-amber-300 font-mono font-semibold">
                          <span>Revealed {log.field_revealed}</span>
                          <span>{log.timestamp}</span>
                        </div>
                        <div className="text-slate-300">
                          Actor: <strong>{log.actor_name}</strong> ({log.actor_role})
                        </div>
                        <div className="text-slate-400 font-mono">
                          Target: {log.target_employee_name} ({log.target_employee_code})
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </div>
          </div>
        )}
      </main>

      {/* Payslip Generator Modal */}
      <PayslipModal
        isOpen={isPayslipModalOpen}
        onClose={() => setIsPayslipModalOpen(false)}
        employee={selectedPayslipEmployee}
        onDisbursePayslip={handleDisbursePayslip}
      />
    </div>
  );
};
