// ─────────────────────────────────────────────────────────────
// Vortiq Data Vault — Cross-Department Access Grant Manager
// Explicit grants for cross-department vault visibility (logged)
// ─────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { Modal, Button, Input, Select, Badge } from '@/design-system';
import { VaultGrant, VaultDepartment } from './types';
import { Plus } from 'lucide-react';

interface VaultGrantManagerProps {
  isOpen: boolean;
  onClose: () => void;
  grants: VaultGrant[];
  onAddGrant: (grant: VaultGrant) => void;
}

export const VaultGrantManager: React.FC<VaultGrantManagerProps> = ({
  isOpen,
  onClose,
  grants,
  onAddGrant,
}) => {
  const [userEmail, setUserEmail] = useState('ops.lead@vortiq.biz');
  const [selectedDept, setSelectedDept] = useState<VaultDepartment>('inventory');

  const handleGrant = (e: React.FormEvent) => {
    e.preventDefault();
    const newGrant: VaultGrant = {
      id: `vg-${Date.now()}`,
      tenant_id: 'tenant-prod-001',
      user_id: `u-${Date.now()}`,
      user_email: userEmail,
      department: selectedDept,
      granted_by_id: 'u-1',
      granted_by_name: 'Alex Vance (Owner)',
      created_at: new Date().toISOString(),
    };

    onAddGrant(newGrant);
    setUserEmail('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Explicit Cross-Department Vault Access Grants"
      maxWidth="md"
    >
      <div className="space-y-4 text-xs font-mono">
        <p className="text-2xs text-slate-400 font-sans">
          Grant specific users read/export access to an additional department vault beyond their primary role. All grants are security-audited.
        </p>

        {/* Grant Form */}
        <form onSubmit={handleGrant} className="p-3 bg-dark-surface rounded-xl border border-dark-border space-y-3">
          <h4 className="font-bold text-slate-200 font-display text-2xs uppercase tracking-wider">New Cross-Department Access Grant</h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">User Email</label>
              <Input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="user@vortiq.biz"
                required
              />
            </div>
            <div>
              <label className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Target Department</label>
              <Select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value as VaultDepartment)}
                options={[
                  { value: 'crm', label: 'CRM & Sales Pipeline' },
                  { value: 'hr', label: 'HR & Payroll Vault' },
                  { value: 'finance', label: 'Finance & Invoicing Vault' },
                  { value: 'inventory', label: 'Inventory & Stock Vault' },
                ]}
              />
            </div>
          </div>

          <Button variant="primary" size="sm" className="w-full" type="submit" leftIcon={<Plus className="w-3.5 h-3.5" />}>
            Grant Explicit Cross-Department Access
          </Button>
        </form>

        {/* Active Grants List */}
        <div className="space-y-2">
          <h4 className="font-bold text-slate-200 font-display text-2xs uppercase tracking-wider">Active Cross-Department Grants ({grants.length})</h4>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {grants.length === 0 ? (
              <div className="p-4 text-center text-2xs text-slate-500">No explicit cross-department grants configured.</div>
            ) : (
              grants.map((g) => (
                <div key={g.id} className="p-2.5 bg-dark-card rounded-lg border border-dark-border flex items-center justify-between text-2xs">
                  <div>
                    <span className="font-bold text-slate-100">{g.user_email}</span>
                    <p className="text-2xs text-slate-400">Granted by {g.granted_by_name} on {new Date(g.created_at).toLocaleDateString()}</p>
                  </div>
                  <Badge variant="violet" size="sm" className="uppercase font-mono">{g.department}</Badge>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
