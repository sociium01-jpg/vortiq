import React, { useState } from 'react';
import {
  EmployeeWithUser,
  formatPaiseToRupees,
  maskSensitiveField,
} from './types';
import {
  Button,
  Badge,
  Select,
  Avatar,
  Input,
  Card,
} from '@/design-system';
import {
  Eye,
  EyeOff,
  FileText,
  Search,
  Filter,
  CreditCard,
  Building2,
  ShieldAlert,
} from 'lucide-react';

export interface EmployeeTableProps {
  employees: EmployeeWithUser[];
  onToggleRevealPan: (employeeId: string) => void;
  onToggleRevealBank: (employeeId: string) => void;
  onSelectEmployeeForPayslip: (employee: EmployeeWithUser) => void;
  isLoading?: boolean;
}

export const EmployeeTable: React.FC<EmployeeTableProps> = ({
  employees,
  onToggleRevealPan,
  onToggleRevealBank,
  onSelectEmployeeForPayslip,
  isLoading = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [employmentTypeFilter, setEmploymentTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Department choices extracted dynamically
  const departments = ['ALL', ...Array.from(new Set(employees.map((e) => e.department)))];

  // Filtering
  const filteredEmployees = employees.filter((emp) => {
    const code = emp.employee_code || 'EMP-001';
    const matchesSearch =
      emp.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDept = departmentFilter === 'ALL' || emp.department === departmentFilter;
    const matchesType = employmentTypeFilter === 'ALL' || (emp.employment_type || 'full_time') === employmentTypeFilter;
    const matchesStatus = statusFilter === 'ALL' || (emp.status || 'active') === statusFilter;

    return matchesSearch && matchesDept && matchesType && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="emerald" dot>Active</Badge>;
      case 'on_leave':
        return <Badge variant="amber" dot>On Leave</Badge>;
      case 'terminated':
        return <Badge variant="rose">Terminated</Badge>;
      default:
        return <Badge variant="slate">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'full_time':
        return <Badge variant="blue" size="sm">Full-Time</Badge>;
      case 'part_time':
        return <Badge variant="violet" size="sm">Part-Time</Badge>;
      case 'contractor':
        return <Badge variant="amber" size="sm">Contractor</Badge>;
      case 'intern':
        return <Badge variant="slate" size="sm">Intern</Badge>;
      default:
        return <Badge variant="slate" size="sm">{type}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Header */}
      <Card className="p-4 space-y-3 bg-dark-card border-dark-border">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Search by name, code, designation or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
              className="text-xs"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              <Filter className="w-3.5 h-3.5 text-brand-400" />
              <span>Filter:</span>
            </div>

            <Select
              options={departments.map((dept) => ({
                value: dept,
                label: dept === 'ALL' ? 'All Departments' : dept,
              }))}
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="text-xs py-1.5 px-2.5 w-40"
            />

            <Select
              options={[
                { value: 'ALL', label: 'All Types' },
                { value: 'full_time', label: 'Full-Time' },
                { value: 'part_time', label: 'Part-Time' },
                { value: 'contractor', label: 'Contractor' },
                { value: 'intern', label: 'Intern' },
              ]}
              value={employmentTypeFilter}
              onChange={(e) => setEmploymentTypeFilter(e.target.value)}
              className="text-xs py-1.5 px-2.5 w-32"
            />

            <Select
              options={[
                { value: 'ALL', label: 'All Status' },
                { value: 'active', label: 'Active' },
                { value: 'on_leave', label: 'On Leave' },
                { value: 'terminated', label: 'Terminated' },
              ]}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs py-1.5 px-2.5 w-32"
            />
          </div>
        </div>

        {/* Sensitive data audit info bar */}
        <div className="flex items-center justify-between text-2xs bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-1.5 text-amber-300">
          <div className="flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-amber-400" />
            <span>
              <strong>PII Compliance Active:</strong> Sensitive fields (PAN & Bank Account) are masked by default. Revealing unmasked data will trigger an automated security audit log notification.
            </span>
          </div>
          <span className="font-mono text-slate-400">
            {filteredEmployees.length} of {employees.length} employees
          </span>
        </div>
      </Card>

      {/* Dense Table */}
      <div className="overflow-x-auto rounded-xl border border-dark-border/80 bg-dark-card shadow-lg">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-dark-border bg-dark-surface/70 text-2xs uppercase font-semibold text-slate-400 tracking-wider">
              <th className="py-3 px-4">Employee</th>
              <th className="py-3 px-3">Designation & Dept</th>
              <th className="py-3 px-3">Type & Status</th>
              <th className="py-3 px-3 text-right">Basic Salary</th>
              <th className="py-3 px-3 text-right">Gross Salary</th>
              <th className="py-3 px-3">PAN Card (Masked)</th>
              <th className="py-3 px-3">Bank Account</th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-border/50 text-xs">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400">
                  Loading employee records...
                </td>
              </tr>
            ) : filteredEmployees.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400">
                  No employee profiles match the selected filters.
                </td>
              </tr>
            ) : (
              filteredEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-dark-surface/50 transition-colors">
                  {/* Employee Name & Code */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={emp.full_name} src={emp.avatar_url} size="md" />
                      <div>
                        <div className="font-semibold text-slate-100 flex items-center gap-2">
                          <span>{emp.full_name}</span>
                          <span className="text-2xs font-mono px-1.5 py-0.5 rounded bg-dark-surface border border-dark-border text-slate-400">
                            {emp.employee_code}
                          </span>
                        </div>
                        <div className="text-2xs text-slate-400 font-mono mt-0.5">
                          {emp.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Designation & Department */}
                  <td className="py-3 px-3">
                    <div className="font-medium text-slate-200">{emp.designation}</div>
                    <div className="mt-1">
                      <span className="inline-flex items-center gap-1 text-2xs px-2 py-0.5 rounded-md bg-dark-surface text-slate-300 border border-dark-border/80">
                        <Building2 className="w-3 h-3 text-brand-400" />
                        {emp.department}
                      </span>
                    </div>
                  </td>

                  {/* Type & Status */}
                  <td className="py-3 px-3">
                    <div className="flex flex-col gap-1 items-start">
                      {getStatusBadge(emp.status || 'active')}
                      {getTypeBadge(emp.employment_type || 'full_time')}
                    </div>
                  </td>

                  {/* Basic Salary - Right-aligned & font-mono */}
                  <td className="py-3 px-3 text-right font-mono font-medium text-slate-200">
                    {formatPaiseToRupees(emp.basic_salary_paise || (emp.basic_monthly || 0) * 100)}
                  </td>

                  {/* Gross Salary - Right-aligned & font-mono */}
                  <td className="py-3 px-3 text-right font-mono font-semibold text-emerald-400">
                    {formatPaiseToRupees(emp.gross_salary_paise || (emp.ctc_annual || 0) * 100 / 12)}
                  </td>

                  {/* PAN Card with Click-to-reveal */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-mono text-xs px-2 py-1 rounded bg-dark-surface border ${
                          emp.is_pan_revealed
                            ? 'border-brand-500/50 text-brand-300 bg-brand-500/10'
                            : 'border-dark-border text-slate-400'
                        }`}
                      >
                        {emp.is_pan_revealed
                          ? emp.pan_unmasked
                          : maskSensitiveField(emp.pan_unmasked || emp.pan_masked)}
                      </span>
                      <button
                        onClick={() => onToggleRevealPan(emp.id)}
                        className="p-1 rounded text-slate-400 hover:text-brand-400 hover:bg-dark-surface transition-colors cursor-pointer"
                        title={emp.is_pan_revealed ? 'Hide PAN' : 'Reveal PAN (Triggers Audit Log)'}
                      >
                        {emp.is_pan_revealed ? (
                          <EyeOff className="w-3.5 h-3.5 text-brand-400" />
                        ) : (
                          <Eye className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </td>

                  {/* Bank Account with Click-to-reveal */}
                  <td className="py-3 px-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-mono text-xs px-2 py-1 rounded bg-dark-surface border ${
                            emp.is_bank_revealed
                              ? 'border-brand-500/50 text-brand-300 bg-brand-500/10'
                              : 'border-dark-border text-slate-400'
                          }`}
                        >
                          {emp.is_bank_revealed
                            ? emp.bank_account_unmasked
                            : maskSensitiveField(emp.bank_account_unmasked || emp.bank_account_masked)}
                        </span>
                        <button
                          onClick={() => onToggleRevealBank(emp.id)}
                          className="p-1 rounded text-slate-400 hover:text-brand-400 hover:bg-dark-surface transition-colors cursor-pointer"
                          title={emp.is_bank_revealed ? 'Hide Bank Account' : 'Reveal Bank Account (Triggers Audit Log)'}
                        >
                          {emp.is_bank_revealed ? (
                            <EyeOff className="w-3.5 h-3.5 text-brand-400" />
                          ) : (
                            <Eye className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                      {(emp.bank_name || emp.bank_ifsc) && (
                        <div className="text-2xs text-slate-400 font-mono flex items-center gap-1">
                          <CreditCard className="w-3 h-3 text-slate-500" />
                          <span>{emp.bank_name || 'Bank'}</span>
                          {emp.bank_ifsc && <span>({emp.bank_ifsc})</span>}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-center">
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<FileText className="w-3.5 h-3.5 text-brand-400" />}
                      onClick={() => onSelectEmployeeForPayslip(emp)}
                      className="text-xs py-1 px-2.5 hover:border-brand-500/50 hover:text-brand-300"
                    >
                      Payslip
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
