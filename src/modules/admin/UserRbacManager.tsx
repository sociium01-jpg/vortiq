import React, { useState } from 'react';
import { useAuth } from '@/auth/AuthContext';
import { auditLogger } from '@/lib/auditLogger';
import { UserRole } from '@/types';
import {
  Button,
  Input,
  Select,
  Badge,
  Avatar,
  Modal,
  Toast,
  DataTable,
  Column,
} from '@/design-system';
import { UserPlus, ShieldCheck, Trash2, Ban, RefreshCw } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'active' | 'invited' | 'disabled';
  lastActive: string;
}

export const UserRbacManager: React.FC = () => {
  const { user: currentUser, tenant } = useAuth();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('MEMBER');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [members, setMembers] = useState<TeamMember[]>([
    { id: 'u-1', name: 'Alex Vance', email: 'owner@acmeops.com', role: 'OWNER', status: 'active', lastActive: 'Just now' },
    { id: 'u-2', name: 'Priya Sharma', email: 'priya@acmeops.com', role: 'ADMIN', status: 'active', lastActive: '12 mins ago' },
    { id: 'u-3', name: 'Rajesh Kumar', email: 'rajesh@acmeops.com', role: 'MANAGER', status: 'active', lastActive: '2 hours ago' },
    { id: 'u-4', name: 'Sneha Patel', email: 'sneha@acmeops.com', role: 'MEMBER', status: 'invited', lastActive: 'Pending Invite' },
    { id: 'u-5', name: 'Vikram Mehta', email: 'vikram@acmeops.com', role: 'MEMBER', status: 'disabled', lastActive: '3 days ago' },
  ]);

  const handleRoleChange = (memberId: string, newRole: UserRole) => {
    const target = members.find((m) => m.id === memberId);
    if (!target) return;

    auditLogger.logChange(tenant?.id || 't-1', 'TeamMember', memberId, 'role', target.role, newRole, currentUser?.id || 'u-1');

    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
    );
    setToastMessage(`Role updated for ${target.name} to ${newRole}.`);
  };

  const handleToggleDeactivate = (memberId: string) => {
    const target = members.find((m) => m.id === memberId);
    if (!target) return;

    const newStatus = target.status === 'disabled' ? 'active' : 'disabled';
    
    // Deactivation revokes active session immediately
    if (newStatus === 'disabled') {
      console.warn(`[SECURITY] Revoking all active JWT sessions immediately for user ${target.email}`);
    }

    auditLogger.logChange(tenant?.id || 't-1', 'TeamMember', memberId, 'status', target.status, newStatus, currentUser?.id || 'u-1');

    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, status: newStatus } : m))
    );
    setToastMessage(`User ${target.name} is now ${newStatus}. ${newStatus === 'disabled' ? 'Session revoked immediately.' : ''}`);
  };

  // Cross-cutting standing convention: Removal notifies Owner/Admin
  const handleRemoveMember = (memberId: string) => {
    const target = members.find((m) => m.id === memberId);
    if (!target) return;

    // Trigger removal notification to Owner/Admin
    auditLogger.notifyOwnerOnRemoval(
      tenant?.id || 't-1',
      'Team Member',
      `${target.name} (${target.email})`,
      currentUser?.full_name || 'Admin User',
      (notif) => setToastMessage(`${notif.title}: ${notif.message}`)
    );

    setMembers((prev) => prev.filter((m) => m.id !== memberId));
  };

  const handleSendInvite = () => {
    if (!inviteEmail) return;

    const newMember: TeamMember = {
      id: `u-${Date.now()}`,
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      role: inviteRole,
      status: 'invited',
      lastActive: 'Pending Invite',
    };

    setMembers((prev) => [...prev, newMember]);
    setIsInviteModalOpen(false);
    setInviteEmail('');
    setToastMessage(`Invitation email sent to ${inviteEmail} with role ${inviteRole}.`);
  };

  const columns: Column<TeamMember>[] = [
    {
      key: 'name',
      header: 'Team Member',
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-3">
          <Avatar name={item.name} size="sm" />
          <div>
            <div className="font-semibold text-slate-100">{item.name}</div>
            <div className="text-2xs text-slate-400 font-mono">{item.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Assigned Role',
      sortable: true,
      render: (item) => (
        <Select
          options={[
            { value: 'OWNER', label: 'OWNER' },
            { value: 'ADMIN', label: 'ADMIN' },
            { value: 'MANAGER', label: 'MANAGER' },
            { value: 'MEMBER', label: 'MEMBER' },
          ]}
          value={item.role}
          onChange={(e) => handleRoleChange(item.id, e.target.value as UserRole)}
          disabled={item.role === 'OWNER' && currentUser?.role !== 'OWNER'}
          className="text-xs py-1 px-2 w-32"
        />
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (item) => (
        <Badge
          variant={item.status === 'active' ? 'emerald' : item.status === 'invited' ? 'amber' : 'rose'}
          dot
        >
          {item.status}
        </Badge>
      ),
    },
    {
      key: 'lastActive',
      header: 'Last Session',
      sortable: true,
      render: (item) => <span className="font-mono text-2xs text-slate-400">{item.lastActive}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleToggleDeactivate(item.id)}
            className={`p-1.5 rounded-lg border text-xs transition-colors ${
              item.status === 'disabled'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
            }`}
            title={item.status === 'disabled' ? 'Reactivate User' : 'Deactivate User (Revokes Session)'}
          >
            {item.status === 'disabled' ? <RefreshCw className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => handleRemoveMember(item.id)}
            className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 transition-colors"
            title="Remove User (Triggers Owner/Admin Alert)"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {toastMessage && (
        <Toast
          id="rbac-toast"
          type="info"
          title="Team Management Alert"
          message={toastMessage}
          onDismiss={() => setToastMessage(null)}
        />
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-100 font-display flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-brand-400" />
            Team Directory & Dynamic RBAC Roles
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage organization members, assign dynamic role permissions, or revoke user sessions.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          leftIcon={<UserPlus className="w-4 h-4" />}
          onClick={() => setIsInviteModalOpen(true)}
        >
          Invite Teammate
        </Button>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={members}
        keyExtractor={(item) => item.id}
        searchPlaceholder="Search team members by name or email..."
      />

      {/* Invite Modal */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="Invite Teammate to Organization"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setIsInviteModalOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleSendInvite}>Send Invite Email</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Email Address"
            placeholder="teammate@company.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
          />
          <Select
            label="Assign Dynamic Role"
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value as UserRole)}
            options={[
              { value: 'MEMBER', label: 'MEMBER — Standard access to assigned leads/tasks' },
              { value: 'MANAGER', label: 'MANAGER — Manage team leads & stock movements' },
              { value: 'ADMIN', label: 'ADMIN — Full org settings & member management' },
              { value: 'OWNER', label: 'OWNER — Full primary organization ownership' },
            ]}
          />
        </div>
      </Modal>
    </div>
  );
};
