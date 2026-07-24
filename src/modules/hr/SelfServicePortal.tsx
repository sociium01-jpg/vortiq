// ─────────────────────────────────────────────────────────────
// Vortiq Employee Self-Service (ESS) Portal
// Employee self-view for payslips, leave requests, & non-sensitive profile updates
// ─────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { Card, Badge, Button, Input } from '@/design-system';
import { EmployeeWithUser, LeaveRequestWithUser } from './types';
import { UserCheck, Calendar, FileText, CheckCircle2, Lock } from 'lucide-react';

export interface SelfServicePortalProps {
  currentEmployee: EmployeeWithUser;
  onApplyLeave: (req: Partial<LeaveRequestWithUser>) => void;
  onViewPayslip: () => void;
}

export const SelfServicePortal: React.FC<SelfServicePortalProps> = ({
  currentEmployee,
  onApplyLeave,
  onViewPayslip,
}) => {
  const [phoneInput, setPhoneInput] = useState(currentEmployee.phone || '+91 98200 11223');
  const [emergencyInput, setEmergencyInput] = useState(currentEmployee.custom_fields?.emergency_contact || '+91 98200 99887');
  const [updateNotification, setUpdateNotification] = useState<string | null>(null);

  // Leave Form
  const [leaveType, setLeaveType] = useState<any>('casual');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('Personal leave request');

  const handleUpdateNonSensitiveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateNotification('Profile details updated successfully! (Sensitive changes like Bank/PAN require Admin approval).');
    setTimeout(() => setUpdateNotification(null), 3000);
  };

  const handleLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onApplyLeave({
      leave_type: leaveType,
      start_date: startDate,
      end_date: endDate,
      reason: reason,
    });
    setUpdateNotification(`Leave request (${leaveType}) submitted for manager approval!`);
    setTimeout(() => setUpdateNotification(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {updateNotification && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-2xs text-emerald-300 flex items-center gap-2 animate-pulse font-mono">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{updateNotification}</span>
        </div>
      )}

      {/* Header Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Card */}
        <Card className="p-5 bg-dark-card border-dark-border space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-display flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-brand-400" />
              Employee Self-Service (ESS) Profile
            </h3>
            <Badge variant="violet" size="sm">Self-Service</Badge>
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-dark-surface/60 rounded-xl border border-dark-border space-y-1 text-xs">
              <span className="font-bold text-slate-100 font-display text-sm">{currentEmployee.full_name}</span>
              <p className="text-2xs text-slate-400 font-mono">{currentEmployee.designation} • {currentEmployee.department}</p>
              <p className="text-2xs text-slate-400 font-mono">Email: {currentEmployee.email}</p>
            </div>

            <form onSubmit={handleUpdateNonSensitiveProfile} className="space-y-3">
              <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider block font-display">Update Contact Details</span>
              <div>
                <label className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Phone Number</label>
                <Input
                  type="text"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                />
              </div>

              <div>
                <label className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Emergency Contact</label>
                <Input
                  type="text"
                  value={emergencyInput}
                  onChange={(e) => setEmergencyInput(e.target.value)}
                />
              </div>

              <div className="p-2.5 bg-dark-surface/40 rounded-lg border border-dark-border flex items-center gap-2 text-2xs text-slate-400 font-mono">
                <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Modifications to PAN, Bank Account, or CTC require Admin/HR approval.</span>
              </div>

              <Button variant="primary" size="sm" className="w-full" type="submit">
                Save Contact Updates
              </Button>
            </form>
          </div>
        </Card>

        {/* Quick Actions & Payslip Card */}
        <Card className="p-5 bg-dark-card border-dark-border space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-display flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              Quick ESS Actions & Statutory Payslips
            </h3>
            <Button variant="secondary" size="sm" onClick={onViewPayslip}>
              View Latest Payslip
            </Button>
          </div>

          {/* Quick Leave Application Form */}
          <form onSubmit={handleLeaveSubmit} className="p-4 bg-dark-surface/60 rounded-xl border border-dark-border space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-display flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-brand-400" /> Apply For Time Off (Leave)
            </h4>

            <div>
              <label className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Leave Type</label>
              <select
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value)}
                className="w-full p-2 bg-dark-card border border-dark-border rounded-lg text-xs font-mono text-slate-200"
              >
                <option value="casual">Casual Leave (CL)</option>
                <option value="sick">Sick Leave (SL)</option>
                <option value="earned">Earned Leave (EL)</option>
                <option value="maternity">Maternity/Paternity Leave</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Start Date</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">End Date</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Reason for Leave</label>
              <Input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              />
            </div>

            <Button variant="primary" size="md" className="w-full" type="submit" leftIcon={<Calendar className="w-4 h-4" />}>
              Submit Leave Application
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};
