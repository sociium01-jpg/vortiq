// ─────────────────────────────────────────────────────────────
// Vortiq HR & Payroll Module (Zoho People Parity 2026)
// Directory, Leave & Holidays, Performance Reviews, Document Vault,
// Employee Self-Service (ESS), Statutory Payroll, & PII Data Masking
// ─────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { useAuth } from '@/auth/AuthContext';
import { EmployeeDirectory } from './EmployeeDirectory';
import { LeaveManager } from './LeaveManager';
import { PerformanceReviewModule } from './PerformanceReviewModule';
import { DocumentVaultModule } from './DocumentVaultModule';
import { SelfServicePortal } from './SelfServicePortal';
import { SalaryAuditLogModal } from './SalaryAuditLogModal';
import { EmployeeWithUser, SalaryChangeLog, SEED_EMPLOYEES, HRTab } from './types';
import { Button, Badge } from '@/design-system';
import {
  Users,
  CalendarCheck,
  Award,
  FileText,
  UserCheck,
  History,
} from 'lucide-react';

export const HRModule: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<HRTab>('directory');
  const [employees, setEmployees] = useState<EmployeeWithUser[]>(SEED_EMPLOYEES);
  const [salaryLogs, setSalaryLogs] = useState<SalaryChangeLog[]>([]);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);

  const handleSalaryUpdate = (empId: string, newCtc: number, reason: string) => {
    const emp = employees.find((e) => e.id === empId);
    if (!emp) return;

    const newLog: SalaryChangeLog = {
      id: `slog-${Date.now()}`,
      tenant_id: 'tenant-prod-001',
      employee_id: empId,
      employee_name: emp.full_name,
      old_ctc: emp.ctc_annual,
      new_ctc: newCtc,
      changed_by_name: user?.full_name || 'Alex Vance',
      reason: reason,
      created_at: new Date().toISOString(),
    };

    setSalaryLogs([newLog, ...salaryLogs]);
    setEmployees((prev) =>
      prev.map((e) => (e.id === empId ? { ...e, ctc_annual: newCtc, basic_monthly: Math.round(newCtc / 24) } : e))
    );
  };

  const currentEmp = employees[0] || SEED_EMPLOYEES[0];

  return (
    <div className="space-y-6">
      {/* Top Header & Submodule Navigation Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-dark-card border border-dark-border rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-100 font-display tracking-tight">HR & Statutory Payroll</h1>
            <Badge variant="emerald" size="sm" className="font-mono font-bold">Statutory Payroll Engine</Badge>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Leave & Holidays • Performance Reviews • Doc Vault • ESS Portal • Masked PII & Salary Audit Logs
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Submodule View Switcher */}
          <div className="flex p-1 bg-dark-surface rounded-xl border border-dark-border overflow-x-auto text-xs font-semibold">
            {[
              { id: 'directory', label: 'Directory & PII', icon: Users },
              { id: 'leave', label: 'Leave & Holidays', icon: CalendarCheck },
              { id: 'performance', label: 'Performance & OKRs', icon: Award },
              { id: 'documents', label: 'Doc Vault', icon: FileText },
              { id: 'self_service', label: 'ESS Self-Service', icon: UserCheck },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as HRTab)}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all whitespace-nowrap ${
                  activeTab === id
                    ? 'bg-brand-500 text-dark-bg font-bold shadow-md shadow-brand-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            leftIcon={<History className="w-3.5 h-3.5 text-violet-400" />}
            onClick={() => setIsAuditModalOpen(true)}
          >
            Salary Audit Logs ({salaryLogs.length})
          </Button>
        </div>
      </div>

      {/* Main Viewport */}
      {activeTab === 'directory' && (
        <EmployeeDirectory employees={employees} onUpdateSalary={handleSalaryUpdate} />
      )}

      {activeTab === 'leave' && <LeaveManager employees={employees} />}

      {activeTab === 'performance' && <PerformanceReviewModule employees={employees} />}

      {activeTab === 'documents' && <DocumentVaultModule employees={employees} />}

      {activeTab === 'self_service' && (
        <SelfServicePortal
          currentEmployee={currentEmp}
          onApplyLeave={() => setActiveTab('leave')}
          onViewPayslip={() => setActiveTab('directory')}
        />
      )}

      {/* Salary Correction Audit Log Modal */}
      {isAuditModalOpen && (
        <SalaryAuditLogModal
          isOpen={isAuditModalOpen}
          onClose={() => setIsAuditModalOpen(false)}
          logs={salaryLogs}
        />
      )}
    </div>
  );
};
