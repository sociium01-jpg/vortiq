import React, { useState } from 'react';
import {
  LeaveRequestWithUser,
  LeaveBalance,
  LeaveType,
  EmployeeWithUser,
} from './types';
import {
  Button,
  Card,
  Badge,
  Modal,
  Select,
  Input,
  Avatar,
} from '@/design-system';
import {
  Clock,
  Calendar,
  Plus,
  Search,
  Check,
  X,
  UserCheck,
} from 'lucide-react';

export interface LeaveManagerProps {
  leaveRequests: LeaveRequestWithUser[];
  leaveBalances: LeaveBalance[];
  employees: EmployeeWithUser[];
  onApproveRequest: (requestId: string) => void;
  onRejectRequest: (requestId: string) => void;
  onCreateLeaveRequest: (newRequest: Partial<LeaveRequestWithUser>) => void;
}

export const LeaveManager: React.FC<LeaveManagerProps> = ({
  leaveRequests,
  leaveBalances,
  employees,
  onApproveRequest,
  onRejectRequest,
  onCreateLeaveRequest,
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  // New leave request form state
  const [selectedEmployeeUserId, setSelectedEmployeeUserId] = useState<string>(employees[0]?.user_id || '');
  const [leaveType, setLeaveType] = useState<LeaveType>('casual');
  const [fromDate, setFromDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [toDate, setToDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState<string>('');

  // Calculate days count
  const calculateDays = (from: string, to: string): number => {
    if (!from || !to) return 1;
    const start = new Date(from);
    const end = new Date(to);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return isNaN(diffDays) ? 1 : diffDays;
  };

  const daysCount = calculateDays(fromDate, toDate);

  // Overall statistics
  const pendingCount = leaveRequests.filter((r) => r.status === 'pending').length;
  const approvedCount = leaveRequests.filter((r) => r.status === 'approved').length;
  const rejectedCount = leaveRequests.filter((r) => r.status === 'rejected').length;

  // Filter requests
  const filteredRequests = leaveRequests.filter((req) => {
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    const matchesSearch =
      req.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.employee_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (req.reason && req.reason.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="amber" dot>
            Pending Review
          </Badge>
        );
      case 'approved':
        return (
          <Badge variant="emerald" dot>
            Approved
          </Badge>
        );
      case 'rejected':
        return <Badge variant="rose">Rejected</Badge>;
      default:
        return <Badge variant="slate">{status}</Badge>;
    }
  };

  const getLeaveTypeBadge = (type: LeaveType) => {
    switch (type) {
      case 'casual':
        return <Badge variant="blue" size="sm">Casual Leave</Badge>;
      case 'sick':
        return <Badge variant="rose" size="sm">Sick Leave</Badge>;
      case 'earned':
        return <Badge variant="emerald" size="sm">Earned Leave</Badge>;
      case 'unpaid':
        return <Badge variant="slate" size="sm">Unpaid LWP</Badge>;
      default:
        return <Badge variant="slate" size="sm">{type}</Badge>;
    }
  };

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((e) => e.user_id === selectedEmployeeUserId) || employees[0];
    if (!emp) return;

    onCreateLeaveRequest({
      employee_user_id: emp.user_id,
      employee_name: emp.full_name,
      employee_code: emp.employee_code,
      department: emp.department,
      avatar_url: emp.avatar_url,
      leave_type: leaveType,
      from_date: fromDate,
      to_date: toDate,
      days_count: daysCount,
      reason,
      status: 'pending',
    });

    setIsApplyModalOpen(false);
    setReason('');
  };

  // Sum total balances across workspace
  const totalCasualAllocated = leaveBalances.reduce((acc, b) => acc + b.casual_allocated, 0);
  const totalCasualUsed = leaveBalances.reduce((acc, b) => acc + b.casual_used, 0);
  const totalSickAllocated = leaveBalances.reduce((acc, b) => acc + b.sick_allocated, 0);
  const totalSickUsed = leaveBalances.reduce((acc, b) => acc + b.sick_used, 0);
  const totalEarnedAllocated = leaveBalances.reduce((acc, b) => acc + b.earned_allocated, 0);
  const totalEarnedUsed = leaveBalances.reduce((acc, b) => acc + b.earned_used, 0);

  return (
    <div className="space-y-6">
      {/* Top Leave Balances & KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Casual Leave Balance */}
        <Card className="p-4 bg-dark-card border-dark-border">
          <div className="flex items-center justify-between">
            <span className="text-2xs font-semibold uppercase text-blue-400 tracking-wider">
              Casual Leave (CL)
            </span>
            <Calendar className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black font-mono text-slate-100">
              {totalCasualAllocated - totalCasualUsed} <span className="text-xs font-normal text-slate-400">days left</span>
            </span>
            <span className="text-2xs text-slate-400 font-mono">
              Used: {totalCasualUsed} / {totalCasualAllocated}
            </span>
          </div>
          <div className="mt-2 w-full bg-dark-surface h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-blue-500 h-full rounded-full transition-all"
              style={{
                width: `${Math.min(100, (totalCasualUsed / (totalCasualAllocated || 1)) * 100)}%`,
              }}
            />
          </div>
        </Card>

        {/* Sick Leave Balance */}
        <Card className="p-4 bg-dark-card border-dark-border">
          <div className="flex items-center justify-between">
            <span className="text-2xs font-semibold uppercase text-rose-400 tracking-wider">
              Sick Leave (SL)
            </span>
            <Calendar className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black font-mono text-slate-100">
              {totalSickAllocated - totalSickUsed} <span className="text-xs font-normal text-slate-400">days left</span>
            </span>
            <span className="text-2xs text-slate-400 font-mono">
              Used: {totalSickUsed} / {totalSickAllocated}
            </span>
          </div>
          <div className="mt-2 w-full bg-dark-surface h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-rose-500 h-full rounded-full transition-all"
              style={{
                width: `${Math.min(100, (totalSickUsed / (totalSickAllocated || 1)) * 100)}%`,
              }}
            />
          </div>
        </Card>

        {/* Earned Leave Balance */}
        <Card className="p-4 bg-dark-card border-dark-border">
          <div className="flex items-center justify-between">
            <span className="text-2xs font-semibold uppercase text-emerald-400 tracking-wider">
              Earned Leave (EL)
            </span>
            <Calendar className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black font-mono text-slate-100">
              {totalEarnedAllocated - totalEarnedUsed} <span className="text-xs font-normal text-slate-400">days left</span>
            </span>
            <span className="text-2xs text-slate-400 font-mono">
              Used: {totalEarnedUsed} / {totalEarnedAllocated}
            </span>
          </div>
          <div className="mt-2 w-full bg-dark-surface h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all"
              style={{
                width: `${Math.min(100, (totalEarnedUsed / (totalEarnedAllocated || 1)) * 100)}%`,
              }}
            />
          </div>
        </Card>

        {/* Pending Approvals */}
        <Card className="p-4 bg-dark-card border-dark-border">
          <div className="flex items-center justify-between">
            <span className="text-2xs font-semibold uppercase text-amber-400 tracking-wider">
              Pending Approvals
            </span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black font-mono text-amber-400">
              {pendingCount} <span className="text-xs font-normal text-slate-400">requests</span>
            </span>
            <Badge variant="amber" size="sm">Requires Action</Badge>
          </div>
          <div className="mt-2 text-2xs text-slate-400 font-mono">
            Total requests: {leaveRequests.length} ({approvedCount} approved, {rejectedCount} rejected)
          </div>
        </Card>
      </div>

      {/* Action Header & Search/Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-dark-card p-4 rounded-xl border border-dark-border">
        <div className="flex flex-1 items-center gap-3 max-w-md">
          <Input
            placeholder="Search request by employee, code or reason..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            className="text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Status Tabs */}
          <div className="flex items-center bg-dark-surface p-1 rounded-lg border border-dark-border text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                statusFilter === 'all' ? 'bg-brand-500 text-dark-bg font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({leaveRequests.length})
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                statusFilter === 'pending' ? 'bg-amber-500 text-dark-bg font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Pending ({pendingCount})
            </button>
            <button
              onClick={() => setStatusFilter('approved')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                statusFilter === 'approved' ? 'bg-emerald-500 text-dark-bg font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Approved ({approvedCount})
            </button>
          </div>

          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setIsApplyModalOpen(true)}
          >
            Request Leave
          </Button>
        </div>
      </div>

      {/* Leave Requests Table */}
      <div className="overflow-x-auto rounded-xl border border-dark-border/80 bg-dark-card shadow-lg">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-dark-border bg-dark-surface/70 text-2xs uppercase font-semibold text-slate-400 tracking-wider">
              <th className="py-3 px-4">Employee</th>
              <th className="py-3 px-3">Leave Type</th>
              <th className="py-3 px-3">Date Period</th>
              <th className="py-3 px-3 text-center">Days</th>
              <th className="py-3 px-4">Reason / Purpose</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-4 text-center">Action / Review</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-border/50 text-xs">
            {filteredRequests.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400">
                  No leave requests found matching the current filter.
                </td>
              </tr>
            ) : (
              filteredRequests.map((req) => (
                <tr key={req.id} className="hover:bg-dark-surface/50 transition-colors">
                  {/* Employee Info */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={req.employee_name} src={req.avatar_url} size="sm" />
                      <div>
                        <div className="font-semibold text-slate-100 flex items-center gap-1.5">
                          <span>{req.employee_name}</span>
                          <span className="text-2xs font-mono text-slate-400">({req.employee_code})</span>
                        </div>
                        <div className="text-2xs text-slate-400 font-mono">
                          {req.department}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Leave Type */}
                  <td className="py-3 px-3">
                    {getLeaveTypeBadge(req.leave_type)}
                  </td>

                  {/* Dates */}
                  <td className="py-3 px-3 font-mono text-slate-200">
                    <div className="flex items-center gap-1 text-xs">
                      <span>{req.from_date}</span>
                      <span className="text-slate-500">to</span>
                      <span>{req.to_date}</span>
                    </div>
                  </td>

                  {/* Days Count */}
                  <td className="py-3 px-3 text-center">
                    <span className="inline-flex items-center justify-center px-2 py-0.5 rounded bg-dark-surface text-brand-400 font-mono font-bold border border-dark-border">
                      {req.days_count} {req.days_count === 1 ? 'Day' : 'Days'}
                    </span>
                  </td>

                  {/* Reason */}
                  <td className="py-3 px-4 max-w-xs text-slate-300 truncate" title={req.reason}>
                    {req.reason || <span className="text-slate-500 italic">No reason provided</span>}
                  </td>

                  {/* Status */}
                  <td className="py-3 px-3">
                    {getStatusBadge(req.status)}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-center">
                    {req.status === 'pending' ? (
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          leftIcon={<Check className="w-3.5 h-3.5" />}
                          onClick={() => onApproveRequest(req.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-2xs py-1 px-2.5"
                        >
                          Approve
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          leftIcon={<X className="w-3.5 h-3.5" />}
                          onClick={() => onRejectRequest(req.id)}
                          className="text-2xs py-1 px-2.5"
                        >
                          Reject
                        </Button>
                      </div>
                    ) : (
                      <div className="text-2xs text-slate-400 font-mono flex items-center justify-center gap-1">
                        <UserCheck className="w-3 h-3 text-slate-500" />
                        <span>Reviewed {req.reviewed_at ? new Date(req.reviewed_at).toLocaleDateString('en-IN') : 'recently'}</span>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Apply Leave Modal */}
      <Modal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        title="Submit New Leave Request"
        maxWidth="md"
      >
        <form onSubmit={handleApplySubmit} className="space-y-4">
          <Select
            label="Select Employee"
            options={employees.map((e) => ({
              value: e.user_id,
              label: `${e.full_name} (${e.employee_code} - ${e.department})`,
            }))}
            value={selectedEmployeeUserId}
            onChange={(e) => setSelectedEmployeeUserId(e.target.value)}
          />

          <Select
            label="Leave Type"
            options={[
              { value: 'casual', label: 'Casual Leave (CL)' },
              { value: 'sick', label: 'Sick Leave (SL)' },
              { value: 'earned', label: 'Earned Leave (EL)' },
              { value: 'unpaid', label: 'Unpaid Leave (LWP)' },
            ]}
            value={leaveType}
            onChange={(e) => setLeaveType(e.target.value as LeaveType)}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="From Date"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              required
            />
            <Input
              label="To Date"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              required
            />
          </div>

          <div className="p-3 bg-dark-surface border border-dark-border rounded-lg flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Total Calculated Duration:</span>
            <span className="text-brand-400 font-bold text-sm">{daysCount} {daysCount === 1 ? 'Day' : 'Days'}</span>
          </div>

          <Input
            label="Reason / Remarks"
            placeholder="E.g. Family medical emergency, annual vacation..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
          />

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsApplyModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Submit Leave Request
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
