// ─────────────────────────────────────────────────────────────
// Section 4: User Controls — Internal Vortiq Employee Accounts & Roles
// ─────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { Card, Button, Badge, Modal, Input, Select } from '@/design-system';
import { OpsEmployeeUser, OpsUserRole } from './types';
import { UserPlus } from 'lucide-react';

const SEED_EMPLOYEES: OpsEmployeeUser[] = [
  {
    id: 'emp-1',
    full_name: 'Alex Vance',
    email: 'alex.vance@vortiq.biz',
    role: 'super_admin',
    status: 'active',
    last_active_at: 'Just now',
  },
  {
    id: 'emp-2',
    full_name: 'Priya Sharma',
    email: 'priya.sharma@vortiq.biz',
    role: 'billing_manager',
    status: 'active',
    last_active_at: '10 mins ago',
  },
  {
    id: 'emp-3',
    full_name: 'Rohan Mehta',
    email: 'rohan.mehta@vortiq.biz',
    role: 'support_lead',
    status: 'active',
    last_active_at: '1 hour ago',
  },
  {
    id: 'emp-4',
    full_name: 'Kavita Patel',
    email: 'kavita.patel@vortiq.biz',
    role: 'read_only_analyst',
    status: 'inactive',
    last_active_at: '3 days ago',
  },
];

export const OpsUserControls: React.FC = () => {
  const [employees, setEmployees] = useState<OpsEmployeeUser[]>(SEED_EMPLOYEES);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<OpsUserRole>('support_lead');
  const [error, setError] = useState<string | null>(null);

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.endsWith('@vortiq.biz')) {
      setError('Employee invitation restricted strictly to @vortiq.biz email addresses.');
      return;
    }
    const created: OpsEmployeeUser = {
      id: `emp-${Date.now()}`,
      full_name: newName,
      email: newEmail.trim().toLowerCase(),
      role: newRole,
      status: 'active',
      last_active_at: 'Invited (Pending First Sign-in)',
    };
    setEmployees([created, ...employees]);
    setIsInviteModalOpen(false);
    setNewEmail('');
    setNewName('');
    setError(null);
  };

  const toggleStatus = (id: string) => {
    setEmployees((prev) =>
      prev.map((emp) =>
        emp.id === id
          ? { ...emp, status: emp.status === 'active' ? 'inactive' : 'active' }
          : emp
      )
    );
  };

  const changeRole = (id: string, role: OpsUserRole) => {
    setEmployees((prev) =>
      prev.map((emp) => (emp.id === id ? { ...emp, role } : emp))
    );
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-dark-card border border-dark-border rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-100 font-display">Vortiq Internal User Controls</h2>
            <Badge variant="blue" size="sm">Internal Employee Realm</Badge>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Manage Vortiq staff access, roles, and administrative privileges inside this Ops Portal.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          leftIcon={<UserPlus className="w-3.5 h-3.5" />}
          onClick={() => setIsInviteModalOpen(true)}
        >
          Add Vortiq Employee
        </Button>
      </div>

      <Card className="p-4 bg-dark-card border-dark-border">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-dark-border text-2xs uppercase font-mono text-slate-400 bg-dark-surface/50">
                <th className="py-3 px-4">Employee Name</th>
                <th className="py-3 px-4">Email Address</th>
                <th className="py-3 px-4">Portal Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Last Active</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border text-xs font-mono">
              {employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-800/20 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-200">{emp.full_name}</td>
                  <td className="py-3 px-4 text-slate-300">{emp.email}</td>
                  <td className="py-3 px-4">
                    <select
                      value={emp.role}
                      onChange={(e) => changeRole(emp.id, e.target.value as OpsUserRole)}
                      className="bg-dark-surface border border-dark-border rounded px-2 py-1 text-2xs text-slate-200 font-mono focus:outline-none focus:border-brand-500"
                    >
                      <option value="super_admin">Super Admin (Full Access)</option>
                      <option value="billing_manager">Billing Manager (Revenue Only)</option>
                      <option value="support_lead">Support Lead (Tickets & Clients)</option>
                      <option value="read_only_analyst">Read-Only Analyst</option>
                    </select>
                  </td>
                  <td className="py-3 px-4">
                    {emp.status === 'active' ? (
                      <Badge variant="emerald" size="sm">Active</Badge>
                    ) : (
                      <Badge variant="rose" size="sm">Inactive</Badge>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-400">{emp.last_active_at}</td>
                  <td className="py-3 px-4 text-right">
                    <Button
                      variant={emp.status === 'active' ? 'danger' : 'outline'}
                      size="sm"
                      onClick={() => toggleStatus(emp.id)}
                    >
                      {emp.status === 'active' ? 'Deactivate' : 'Reactivate'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Invite Modal */}
      {isInviteModalOpen && (
        <Modal
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
          title="Invite Vortiq Employee to Ops Portal"
        >
          <form onSubmit={handleInvite} className="space-y-4 py-2 font-sans">
            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs font-mono">
                {error}
              </div>
            )}
            <Input
              label="Full Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              required
            />
            <Input
              label="Vortiq Corporate Email (@vortiq.biz)"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="name@vortiq.biz"
              required
            />
            <Select
              label="Assigned Role"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as OpsUserRole)}
              options={[
                { value: 'super_admin', label: 'Super Admin (Full Access)' },
                { value: 'billing_manager', label: 'Billing Manager (Financial Operations)' },
                { value: 'support_lead', label: 'Support Lead (Customer Support & Provisioning)' },
                { value: 'read_only_analyst', label: 'Read-Only Analyst (View Metrics Only)' },
              ]}
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setIsInviteModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Send Invite
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
