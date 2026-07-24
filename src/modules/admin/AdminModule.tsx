// ─────────────────────────────────────────────────────────────
// Vortiq Tenant Admin Panel (HubSpot & Zoho Admin Parity)
// Org Profile, Team RBAC, Custom Roles & Field-Level Permissions,
// API Key Management, Data Exporter, & Security Audit Logs
// ─────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { RBACGuard } from '@/auth/RBACGuard';
import { OrgProfileManager } from './OrgProfileManager';
import { UserRbacManager } from './UserRbacManager';
import { CustomRoleManager } from './CustomRoleManager';
import { ApiKeyManager } from './ApiKeyManager';
import { OrgDataExporter } from './OrgDataExporter';
import { NotificationPreferenceManager } from './NotificationPreferenceManager';
import { AdminAuditLogModal } from './AdminAuditLogModal';
import { AdminTab, AdminAuditLog, SEED_ADMIN_AUDIT_LOGS } from './types';
import { Button, Badge } from '@/design-system';
import {
  Building2,
  Users,
  ShieldCheck,
  Key,
  Database,
  Bell,
  History,
} from 'lucide-react';

export const AdminModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('profile' as any);
  const [adminAuditLogs, setAdminAuditLogs] = useState<AdminAuditLog[]>(SEED_ADMIN_AUDIT_LOGS);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);

  const handleRoleCreated = (newRole: any) => {
    const newLog: AdminAuditLog = {
      id: `aal-${Date.now()}`,
      tenant_id: 'tenant-prod-001',
      action_type: 'role_created',
      description: `Created custom RBAC role: ${newRole.role_name} with field-level permission control`,
      performed_by_name: 'Alex Vance',
      created_at: new Date().toISOString(),
    };
    setAdminAuditLogs([newLog, ...adminAuditLogs]);
  };

  const handleApiKeyGenerated = (newKey: any) => {
    const newLog: AdminAuditLog = {
      id: `aal-${Date.now()}`,
      tenant_id: 'tenant-prod-001',
      action_type: 'api_key_generated',
      description: `Generated API key token: ${newKey.name} (${newKey.key_prefix})`,
      performed_by_name: 'Alex Vance',
      created_at: new Date().toISOString(),
    };
    setAdminAuditLogs([newLog, ...adminAuditLogs]);
  };

  return (
    <RBACGuard requiredRole="ADMIN">
      <div className="space-y-6">
        {/* Top Header & Submodule Navigation Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-dark-card border border-dark-border rounded-2xl shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-100 font-display tracking-tight">Tenant Settings & Admin Control</h1>
              <Badge variant="violet" size="sm" className="font-mono font-bold">HubSpot & Zoho Admin Parity</Badge>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Team RBAC • Custom Roles & Field Permissions • API Keys • Data Backup Exporter • Audit Logs
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Submodule View Switcher */}
            <div className="flex p-1 bg-dark-surface rounded-xl border border-dark-border overflow-x-auto text-xs font-semibold">
              {[
                { id: 'profile', label: 'Org Profile', icon: Building2 },
                { id: 'users', label: 'Team Members', icon: Users },
                { id: 'custom_roles', label: 'Custom Roles', icon: ShieldCheck },
                { id: 'api_keys', label: 'API Keys', icon: Key },
                { id: 'data_export', label: 'Data Backup', icon: Database },
                { id: 'notifications', label: 'Alert Prefs', icon: Bell },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as AdminTab)}
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
              Admin Audit Logs ({adminAuditLogs.length})
            </Button>
          </div>
        </div>

        {/* Main Viewport */}
        {activeTab === ('profile' as any) && <OrgProfileManager />}

        {activeTab === ('users' as any) && <UserRbacManager />}

        {activeTab === 'custom_roles' && <CustomRoleManager onRoleCreated={handleRoleCreated} />}

        {activeTab === 'api_keys' && <ApiKeyManager onApiKeyGenerated={handleApiKeyGenerated} />}

        {activeTab === 'data_export' && <OrgDataExporter />}

        {activeTab === 'notifications' && <NotificationPreferenceManager />}

        {/* Administrative Security Audit Log Modal */}
        {isAuditModalOpen && (
          <AdminAuditLogModal
            isOpen={isAuditModalOpen}
            onClose={() => setIsAuditModalOpen(false)}
            logs={adminAuditLogs}
          />
        )}
      </div>
    </RBACGuard>
  );
};
