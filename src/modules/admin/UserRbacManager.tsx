import React, { useState } from 'react';
import {
  Card,
  Button,
  Badge,
  Avatar,
  DataTable,
  Modal,
  Toast,
  Select,
  Input,
  Column,
} from '@/design-system';
import { RBACGuard } from '@/auth/RBACGuard';
import { AdminUser } from './types';
import { UserRole, UserStatus } from '@/types';
import {
  UserPlus,
  ShieldCheck,
  UserCheck,
  UserX,
  Mail,
  Filter,
  Lock,
} from 'lucide-react';

const INITIAL_USERS: AdminUser[] = [
  {
    id: 'usr-001',
    tenant_id: 'tenant-acme-001',
    email: 'alex.owner@acme.com',
    full_name: 'Alex Vance',
    role: 'OWNER',
    status: 'active',
    mfa_enabled: true,
    last_login_at: '2026-07-23T12:00:00Z',
    created_at: '2026-01-10T09:00:00Z',
    updated_at: '2026-07-23T12:00:00Z',
  },
  {
    id: 'usr-002',
    tenant_id: 'tenant-acme-001',
    email: 'sarah.admin@acme.com',
    full_name: 'Sarah Connor',
    role: 'ADMIN',
    status: 'active',
    mfa_enabled: true,
    last_login_at: '2026-07-23T11:20:00Z',
    created_at: '2026-02-01T10:15:00Z',
    updated_at: '2026-07-23T11:20:00Z',
  },
  {
    id: 'usr-003',
    tenant_id: 'tenant-acme-001',
    email: 'michael.mgr@acme.com',
    full_name: 'Michael Scott',
    role: 'MANAGER',
    status: 'active',
    mfa_enabled: false,
    last_login_at: '2026-07-22T16:45:00Z',
    created_at: '2026-03-15T14:00:00Z',
    updated_at: '2026-07-22T16:45:00Z',
  },
  {
    id: 'usr-004',
    tenant_id: 'tenant-acme-001',
    email: 'dwight.member@acme.com',
    full_name: 'Dwight Schrute',
    role: 'MEMBER',
    status: 'active',
    mfa_enabled: false,
    last_login_at: '2026-07-21T09:30:00Z',
    created_at: '2026-04-01T11:30:00Z',
    updated_at: '2026-07-21T09:30:00Z',
  },
  {
    id: 'usr-005',
    tenant_id: 'tenant-acme-001',
    email: 'pam.invited@acme.com',
    full_name: 'Pam Beesly',
    role: 'MEMBER',
    status: 'invited',
    mfa_enabled: false,
    created_at: '2026-07-20T10:00:00Z',
    updated_at: '2026-07-20T10:00:00Z',
  },
  {
    id: 'usr-006',
    tenant_id: 'tenant-acme-001',
    email: 'ryan.temp@acme.com',
    full_name: 'Ryan Howard',
    role: 'MEMBER',
    status: 'disabled',
    mfa_enabled: false,
    last_login_at: '2026-06-15T08:00:00Z',
    created_at: '2026-05-01T09:00:00Z',
    updated_at: '2026-06-15T08:00:00Z',
  },
];

export const UserRbacManager: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>(INITIAL_USERS);
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteFullName, setInviteFullName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('MEMBER');
  const [toastNotification, setToastNotification] = useState<{ id: string; type: 'success' | 'info' | 'warning' | 'error'; title: string; message: string } | null>(null);

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole, updated_at: new Date().toISOString() } : u))
    );
    const targetUser = users.find((u) => u.id === userId);
    setToastNotification({
      id: Date.now().toString(),
      type: 'success',
      title: 'Role Updated',
      message: `User ${targetUser?.full_name || userId} role updated to ${newRole}.`,
    });
  };

  const handleToggleStatus = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const nextStatus: UserStatus = u.status === 'active' ? 'disabled' : 'active';
          return { ...u, status: nextStatus, updated_at: new Date().toISOString() };
        }
        return u;
      })
    );
    const targetUser = users.find((u) => u.id === userId);
    const newStatus = targetUser?.status === 'active' ? 'disabled' : 'active';
    setToastNotification({
      id: Date.now().toString(),
      type: newStatus === 'active' ? 'success' : 'warning',
      title: `User ${newStatus === 'active' ? 'Activated' : 'Disabled'}`,
      message: `${targetUser?.full_name}'s account status set to ${newStatus}.`,
    });
  };

  const handleInviteUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail || !inviteFullName) return;

    const newUser: AdminUser = {
      id: `usr-${Math.floor(100 + Math.random() * 900)}`,
      tenant_id: 'tenant-acme-001',
      email: inviteEmail,
      full_name: inviteFullName,
      role: inviteRole,
      status: 'invited',
      mfa_enabled: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setUsers((prev) => [newUser, ...prev]);
    setIsInviteModalOpen(false);
    setInviteFullName('');
    setInviteEmail('');
    setInviteRole('MEMBER');
    setToastNotification({
      id: Date.now().toString(),
      type: 'success',
      title: 'Invitation Sent',
      message: `Invitation email sent to ${inviteEmail} with role ${inviteRole}.`,
    });
  };

  const filteredUsers = users.filter((u) => {
    if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;
    if (statusFilter !== 'ALL' && u.status !== statusFilter) return false;
    return true;
  });

  const columns: Column<AdminUser>[] = [
    {
      key: 'full_name',
      header: 'User Profile',
      sortable: true,
      render: (userItem) => (
        <div className="flex items-center gap-3">
          <Avatar name={userItem.full_name} size="md" />
          <div>
            <div className="font-semibold text-slate-100 flex items-center gap-1.5">
              {userItem.full_name}
              {userItem.mfa_enabled && (
                <span title="MFA Enabled">
                  <Lock className="w-3 h-3 text-emerald-400" />
                </span>
              )}
            </div>
            <div className="text-2xs text-slate-400 font-mono">{userItem.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Assigned Role',
      sortable: true,
      render: (userItem) => (
        <RBACGuard
          requiredRole="ADMIN"
          fallback={
            <Badge
              variant={
                userItem.role === 'OWNER'
                  ? 'violet'
                  : userItem.role === 'ADMIN'
                  ? 'amber'
                  : userItem.role === 'MANAGER'
                  ? 'blue'
                  : 'slate'
              }
            >
              {userItem.role}
            </Badge>
          }
        >
          {userItem.role === 'OWNER' ? (
            <Badge variant="violet" size="md">
              OWNER (Locked)
            </Badge>
          ) : (
            <Select
              options={[
                { value: 'ADMIN', label: 'ADMIN' },
                { value: 'MANAGER', label: 'MANAGER' },
                { value: 'MEMBER', label: 'MEMBER' },
              ]}
              value={userItem.role}
              onChange={(e) => handleRoleChange(userItem.id, e.target.value as UserRole)}
              className="text-xs py-1 px-2.5 max-w-[130px]"
            />
          )}
        </RBACGuard>
      ),
    },
    {
      key: 'status',
      header: 'Account Status',
      sortable: true,
      render: (userItem) => (
        <Badge
          variant={
            userItem.status === 'active'
              ? 'emerald'
              : userItem.status === 'invited'
              ? 'amber'
              : 'rose'
          }
          dot
        >
          {userItem.status}
        </Badge>
      ),
    },
    {
      key: 'last_login_at',
      header: 'Last Active',
      sortable: true,
      render: (userItem) => (
        <span className="text-2xs text-slate-400 font-mono">
          {userItem.last_login_at
            ? new Date(userItem.last_login_at).toLocaleString()
            : 'Never logged in'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (userItem) => (
        <RBACGuard requiredRole="ADMIN">
          {userItem.role !== 'OWNER' && (
            <Button
              variant={userItem.status === 'active' ? 'ghost' : 'outline'}
              size="sm"
              onClick={() => handleToggleStatus(userItem.id)}
              leftIcon={
                userItem.status === 'active' ? (
                  <UserX className="w-3.5 h-3.5 text-rose-400" />
                ) : (
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                )
              }
            >
              {userItem.status === 'active' ? 'Disable' : 'Activate'}
            </Button>
          )}
        </RBACGuard>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {toastNotification && (
        <Toast
          id={toastNotification.id}
          type={toastNotification.type}
          title={toastNotification.title}
          message={toastNotification.message}
          onDismiss={() => setToastNotification(null)}
        />
      )}

      {/* Top Action Bar & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-100 font-display flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-brand-400" />
            User RBAC Directory & Permissions
          </h3>
          <p className="text-xs text-slate-400">
            Manage multi-tenant team access, role escalation & security controls
          </p>
        </div>

        <div className="flex items-center gap-3">
          <RBACGuard requiredRole="ADMIN">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<UserPlus className="w-4 h-4" />}
              onClick={() => setIsInviteModalOpen(true)}
            >
              Invite New User
            </Button>
          </RBACGuard>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <Card className="p-4 flex flex-wrap items-center justify-between gap-3 bg-dark-card/60">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <Filter className="w-3.5 h-3.5" />
            Filter by:
          </div>

          <Select
            options={[
              { value: 'ALL', label: 'All Roles' },
              { value: 'OWNER', label: 'OWNER' },
              { value: 'ADMIN', label: 'ADMIN' },
              { value: 'MANAGER', label: 'MANAGER' },
              { value: 'MEMBER', label: 'MEMBER' },
            ]}
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-xs py-1.5 px-3 max-w-[140px]"
          />

          <Select
            options={[
              { value: 'ALL', label: 'All Statuses' },
              { value: 'active', label: 'Active' },
              { value: 'invited', label: 'Invited' },
              { value: 'disabled', label: 'Disabled' },
            ]}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs py-1.5 px-3 max-w-[140px]"
          />
        </div>

        <div className="text-2xs text-slate-400 font-mono">
          Showing <span className="text-slate-200 font-semibold">{filteredUsers.length}</span> of{' '}
          {users.length} total users
        </div>
      </Card>

      {/* User Directory DataTable */}
      <DataTable
        columns={columns}
        data={filteredUsers}
        keyExtractor={(u) => u.id}
        searchPlaceholder="Search name, email or role..."
      />

      {/* Invite User Modal */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="Invite New User to Tenant"
        maxWidth="md"
        footer={
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsInviteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleInviteUser}
              leftIcon={<Mail className="w-4 h-4" />}
            >
              Send Invitation
            </Button>
          </>
        }
      >
        <form onSubmit={handleInviteUser} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="e.g. Rachel Green"
            value={inviteFullName}
            onChange={(e) => setInviteFullName(e.target.value)}
            required
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="rachel@company.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            required
          />

          <Select
            label="Assigned Role"
            options={[
              { value: 'MEMBER', label: 'MEMBER (Standard Read/Write)' },
              { value: 'MANAGER', label: 'MANAGER (Team & Lead Management)' },
              { value: 'ADMIN', label: 'ADMIN (Full Tenant Config & User Control)' },
            ]}
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value as UserRole)}
          />

          <div className="p-3 bg-dark-surface rounded-lg border border-dark-border text-2xs text-slate-400 space-y-1">
            <div className="font-semibold text-slate-300">RBAC Role Hierarchy Note:</div>
            <div>• OWNER: Full platform & billing control</div>
            <div>• ADMIN: User management, integrations, & settings</div>
            <div>• MANAGER: CRM leads, team assignment & reporting</div>
            <div>• MEMBER: Standard operational workflow access</div>
          </div>
        </form>
      </Modal>
    </div>
  );
};
