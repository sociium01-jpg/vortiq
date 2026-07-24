// ─────────────────────────────────────────────────────────────
// Vortiq Employee Directory & PII Data Masking
// Shared identity with users table, click-to-reveal PII masking, & Flag/Call triggers
// ─────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { Card, Badge, Button, Modal, Input } from '@/design-system';
import { EmployeeWithUser } from './types';
import { Eye, EyeOff, ShieldAlert, Flag, PhoneCall, DollarSign } from 'lucide-react';

export interface EmployeeDirectoryProps {
  employees: EmployeeWithUser[];
  onUpdateSalary: (employeeId: string, newCtc: number, reason: string) => void;
}

export const EmployeeDirectory: React.FC<EmployeeDirectoryProps> = ({ employees, onUpdateSalary }) => {
  const [empList, setEmpList] = useState<EmployeeWithUser[]>(employees);
  const [auditNotification, setAuditNotification] = useState<string | null>(null);

  // Salary edit modal state
  const [editingEmp, setEditingEmp] = useState<EmployeeWithUser | null>(null);
  const [ctcInput, setCtcInput] = useState('2400000');
  const [reasonInput, setReasonInput] = useState('Annual Performance Promotion');

  const toggleRevealPan = (empId: string) => {
    setEmpList((prev) =>
      prev.map((e) => {
        if (e.id === empId) {
          const nextState = !e.is_pan_revealed;
          if (nextState) {
            setAuditNotification(`SECURITY AUDIT: PAN details revealed for employee ${e.full_name}. Admin notified.`);
            setTimeout(() => setAuditNotification(null), 4000);
          }
          return { ...e, is_pan_revealed: nextState };
        }
        return e;
      })
    );
  };

  const toggleRevealBank = (empId: string) => {
    setEmpList((prev) =>
      prev.map((e) => {
        if (e.id === empId) {
          const nextState = !e.is_bank_revealed;
          if (nextState) {
            setAuditNotification(`SECURITY AUDIT: Bank account details revealed for employee ${e.full_name}. Admin notified.`);
            setTimeout(() => setAuditNotification(null), 4000);
          }
          return { ...e, is_bank_revealed: nextState };
        }
        return e;
      })
    );
  };

  const toggleRevealSalary = (empId: string) => {
    setEmpList((prev) =>
      prev.map((e) => {
        if (e.id === empId) {
          const nextState = !e.is_salary_revealed;
          if (nextState) {
            setAuditNotification(`SECURITY AUDIT: Compensation figures revealed for employee ${e.full_name}. Admin notified.`);
            setTimeout(() => setAuditNotification(null), 4000);
          }
          return { ...e, is_salary_revealed: nextState };
        }
        return e;
      })
    );
  };

  const handleSaveSalary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmp) return;
    const newCtc = parseFloat(ctcInput);
    if (!newCtc || newCtc <= 0) return;

    onUpdateSalary(editingEmp.id, newCtc, reasonInput);
    setEmpList((prev) =>
      prev.map((e) => (e.id === editingEmp.id ? { ...e, ctc_annual: newCtc, basic_monthly: Math.round(newCtc / 24) } : e))
    );
    setEditingEmp(null);
  };

  return (
    <div className="space-y-6">
      {/* Security Audit Notification Banner */}
      {auditNotification && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-2xs text-amber-300 flex items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{auditNotification}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" leftIcon={<Flag className="w-3.5 h-3.5 text-rose-400" />}>
              Flag Audit Log
            </Button>
            <Button variant="secondary" size="sm" leftIcon={<PhoneCall className="w-3.5 h-3.5 text-emerald-400" />}>
              Call HR Lead
            </Button>
          </div>
        </div>
      )}

      {/* Directory Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {empList.map((emp) => (
          <Card key={emp.id} className="p-5 bg-dark-card border-dark-border space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-100 font-display text-sm">{emp.full_name}</h3>
                <p className="text-2xs text-slate-400 font-mono">{emp.designation} • {emp.department}</p>
              </div>
              <Badge variant="violet" size="sm" className="font-mono font-bold">{emp.role}</Badge>
            </div>

            {/* PII Masked Fields Block */}
            <div className="space-y-2 p-3 bg-dark-surface/60 rounded-xl border border-dark-border text-2xs font-mono">
              {/* PAN Number */}
              <div className="flex items-center justify-between">
                <span className="text-slate-400">PAN Card Number:</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-200">
                    {emp.is_pan_revealed ? emp.pan_unmasked : '••••••••1234'}
                  </span>
                  <button
                    onClick={() => toggleRevealPan(emp.id)}
                    className="p-1 text-slate-400 hover:text-brand-300"
                    title="Click to reveal PAN (Triggers Security Audit)"
                  >
                    {emp.is_pan_revealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Bank Account */}
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Bank Account & IFSC:</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-200">
                    {emp.is_bank_revealed ? `${emp.bank_account_unmasked} (${emp.ifsc_code})` : '••••••••9847'}
                  </span>
                  <button
                    onClick={() => toggleRevealBank(emp.id)}
                    className="p-1 text-slate-400 hover:text-brand-300"
                    title="Click to reveal Bank Account (Triggers Security Audit)"
                  >
                    {emp.is_bank_revealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Annual CTC */}
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Annual Compensation CTC:</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-emerald-400">
                    {emp.is_salary_revealed ? `₹${emp.ctc_annual.toLocaleString('en-IN')}` : '₹ •••••••••'}
                  </span>
                  <button
                    onClick={() => toggleRevealSalary(emp.id)}
                    className="p-1 text-slate-400 hover:text-brand-300"
                    title="Click to reveal CTC (Triggers Security Audit)"
                  >
                    {emp.is_salary_revealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-dark-border flex items-center justify-between">
              <span className="text-2xs text-slate-400 font-mono">Joined: {emp.date_of_joining}</span>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<DollarSign className="w-3.5 h-3.5 text-emerald-400" />}
                onClick={() => {
                  setEditingEmp(emp);
                  setCtcInput(String(emp.ctc_annual));
                }}
              >
                Modify Compensation
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Salary Edit Modal */}
      {editingEmp && (
        <Modal
          isOpen={!!editingEmp}
          onClose={() => setEditingEmp(null)}
          title={`Modify Compensation: ${editingEmp.full_name}`}
          maxWidth="md"
        >
          <form onSubmit={handleSaveSalary} className="space-y-4">
            <div>
              <label className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">New Annual CTC (₹)</label>
              <Input
                type="number"
                value={ctcInput}
                onChange={(e) => setCtcInput(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Audit Reason for Compensation Adjustment *</label>
              <Input
                type="text"
                placeholder="e.g. Annual Appraisal Promotion Q3 2026"
                value={reasonInput}
                onChange={(e) => setReasonInput(e.target.value)}
                required
              />
            </div>

            <Button variant="primary" size="md" className="w-full" type="submit" leftIcon={<DollarSign className="w-4 h-4" />}>
              Save & Log Salary Correction
            </Button>
          </form>
        </Modal>
      )}
    </div>
  );
};
