// ─────────────────────────────────────────────────────────────
// Vortiq Custom RBAC Roles & Field-Level Permission Builder
// HubSpot & Zoho Admin Settings Parity
// ─────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { Card, Badge, Button, Modal, Input } from '@/design-system';
import { CustomRole, SEED_CUSTOM_ROLES, ModulePermission } from './types';
import { ShieldCheck, Plus, Eye, Edit3, Trash2, Lock } from 'lucide-react';

export interface CustomRoleManagerProps {
  onRoleCreated?: (role: CustomRole) => void;
}

export const CustomRoleManager: React.FC<CustomRoleManagerProps> = ({ onRoleCreated }) => {
  const [customRoles, setCustomRoles] = useState<CustomRole[]>(SEED_CUSTOM_ROLES);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Role Form State
  const [roleName, setRoleName] = useState('Senior Operations Audit Manager');
  const [description, setDescription] = useState('Full Inventory and Floor access with masked compensation and financial fields.');

  // Permission Matrix State
  const [permCrm, setPermCrm] = useState<ModulePermission>({ can_view: true, can_edit: true, can_delete: false, mask_financials: false });
  const [permFinance, setPermFinance] = useState<ModulePermission>({ can_view: true, can_edit: false, can_delete: false, mask_financials: true });
  const [permHr, setPermHr] = useState<ModulePermission>({ can_view: false, can_edit: false, can_delete: false, mask_financials: true });
  const [permInventory, setPermInventory] = useState<ModulePermission>({ can_view: true, can_edit: true, can_delete: true, mask_financials: false });

  const handleSaveRole = (e: React.FormEvent) => {
    e.preventDefault();
    const newRole: CustomRole = {
      id: `crole-${Date.now()}`,
      tenant_id: 'tenant-prod-001',
      role_name: roleName,
      description: description,
      permissions: {
        crm: permCrm,
        finance: permFinance,
        hr: permHr,
        inventory: permInventory,
        tasks: { can_view: true, can_edit: true, can_delete: false, mask_financials: false },
      },
      created_at: new Date().toISOString(),
    };

    setCustomRoles([newRole, ...customRoles]);
    onRoleCreated?.(newRole);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Roles List Card */}
      <Card className="p-5 bg-dark-card border-dark-border space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-display flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-400" />
              Custom RBAC Roles & Field-Level Permission Profiles ({customRoles.length})
            </h4>
            <p className="text-2xs text-slate-400 mt-0.5">Granular view, edit, delete, and field-masking permissions per module</p>
          </div>

          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setIsModalOpen(true)}
          >
            Create Custom Role
          </Button>
        </div>

        <div className="space-y-3">
          {customRoles.map((role) => (
            <div key={role.id} className="p-4 bg-dark-surface/60 rounded-xl border border-dark-border space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-extrabold text-slate-100 font-display text-sm flex items-center gap-2">
                    {role.role_name}
                    <Badge variant="violet" size="sm" className="font-mono">Custom Role</Badge>
                  </h5>
                  <p className="text-2xs text-slate-400 mt-0.5 font-mono">{role.description}</p>
                </div>
              </div>

              {/* Module Permission Matrix Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-2xs font-mono">
                {Object.entries(role.permissions).map(([mod, perm]) => (
                  <div key={mod} className="p-2 bg-dark-card rounded-lg border border-dark-border space-y-1">
                    <span className="font-bold text-brand-300 uppercase block">{mod} Module</span>
                    <div className="flex items-center gap-1.5 text-slate-300">
                      {perm.can_view && <Eye className="w-3 h-3 text-emerald-400" />}
                      {perm.can_edit && <Edit3 className="w-3 h-3 text-amber-400" />}
                      {perm.can_delete && <Trash2 className="w-3 h-3 text-rose-400" />}
                      {perm.mask_financials && <Lock className="w-3 h-3 text-violet-400" />}
                    </div>
                    <span className="text-2xs text-slate-400 block">
                      {perm.mask_financials ? 'Financials Masked' : 'Full Field Access'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Create Custom Role Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Create Custom Role & Set Field-Level Permissions"
          maxWidth="lg"
        >
          <form onSubmit={handleSaveRole} className="space-y-4">
            <div>
              <label className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Role Name</label>
              <Input
                type="text"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Description</label>
              <Input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            {/* Granular Permission Matrix */}
            <div className="space-y-3 p-4 bg-dark-surface rounded-xl border border-dark-border text-xs">
              <h5 className="font-bold text-slate-200 uppercase tracking-wider font-display text-2xs">Granular Module & Field Permissions</h5>

              {/* CRM Module Row */}
              <div className="flex items-center justify-between p-2 bg-dark-card rounded-lg border border-dark-border">
                <span className="font-bold text-slate-100 font-display">CRM & Sales Pipeline</span>
                <div className="flex items-center gap-4 text-2xs font-mono">
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input type="checkbox" checked={permCrm.can_view} onChange={(e) => setPermCrm({ ...permCrm, can_view: e.target.checked })} /> View
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input type="checkbox" checked={permCrm.can_edit} onChange={(e) => setPermCrm({ ...permCrm, can_edit: e.target.checked })} /> Edit
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input type="checkbox" checked={permCrm.mask_financials} onChange={(e) => setPermCrm({ ...permCrm, mask_financials: e.target.checked })} /> Mask Deal Values
                  </label>
                </div>
              </div>

              {/* Finance Module Row */}
              <div className="flex items-center justify-between p-2 bg-dark-card rounded-lg border border-dark-border">
                <span className="font-bold text-slate-100 font-display">Finance & Billing</span>
                <div className="flex items-center gap-4 text-2xs font-mono">
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input type="checkbox" checked={permFinance.can_view} onChange={(e) => setPermFinance({ ...permFinance, can_view: e.target.checked })} /> View
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input type="checkbox" checked={permFinance.can_edit} onChange={(e) => setPermFinance({ ...permFinance, can_edit: e.target.checked })} /> Edit
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input type="checkbox" checked={permFinance.mask_financials} onChange={(e) => setPermFinance({ ...permFinance, mask_financials: e.target.checked })} /> Mask Financial Amounts
                  </label>
                </div>
              </div>

              {/* HR Module Row */}
              <div className="flex items-center justify-between p-2 bg-dark-card rounded-lg border border-dark-border">
                <span className="font-bold text-slate-100 font-display">HR & Payroll</span>
                <div className="flex items-center gap-4 text-2xs font-mono">
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input type="checkbox" checked={permHr.can_view} onChange={(e) => setPermHr({ ...permHr, can_view: e.target.checked })} /> View
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input type="checkbox" checked={permHr.can_edit} onChange={(e) => setPermHr({ ...permHr, can_edit: e.target.checked })} /> Edit
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input type="checkbox" checked={permHr.mask_financials} onChange={(e) => setPermHr({ ...permHr, mask_financials: e.target.checked })} /> Mask Salary CTC
                  </label>
                </div>
              </div>

              {/* Inventory Module Row */}
              <div className="flex items-center justify-between p-2 bg-dark-card rounded-lg border border-dark-border">
                <span className="font-bold text-slate-100 font-display">Inventory & Operations</span>
                <div className="flex items-center gap-4 text-2xs font-mono">
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input type="checkbox" checked={permInventory.can_view} onChange={(e) => setPermInventory({ ...permInventory, can_view: e.target.checked })} /> View
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input type="checkbox" checked={permInventory.can_edit} onChange={(e) => setPermInventory({ ...permInventory, can_edit: e.target.checked })} /> Edit
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input type="checkbox" checked={permInventory.can_delete} onChange={(e) => setPermInventory({ ...permInventory, can_delete: e.target.checked })} /> Delete Stock
                  </label>
                </div>
              </div>
            </div>

            <Button variant="primary" size="md" className="w-full" type="submit" leftIcon={<ShieldCheck className="w-4 h-4" />}>
              Save Custom Role
            </Button>
          </form>
        </Modal>
      )}
    </div>
  );
};
