// ─────────────────────────────────────────────────────────────
// Vortiq Admin Custom Project Workflow Status Manager
// Admin-configurable task statuses (e.g. Backlog, QA Testing, Done)
// ─────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { Modal, Button, Input } from '@/design-system';
import { TaskCustomStatus, SEED_CUSTOM_STATUSES } from './types';
import { Plus } from 'lucide-react';

export interface CustomStatusManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CustomStatusManagerModal: React.FC<CustomStatusManagerModalProps> = ({ isOpen, onClose }) => {
  const [statuses, setStatuses] = useState<TaskCustomStatus[]>(SEED_CUSTOM_STATUSES);
  const [nameInput, setNameInput] = useState('');
  const [colorInput, setColorInput] = useState('#E5A93C');

  const handleAddStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput) return;

    const newSt: TaskCustomStatus = {
      id: `st-${Date.now()}`,
      tenant_id: 'tenant-prod-001',
      project_id: 'proj-alpha',
      name: nameInput,
      color: colorInput,
      sort_order: statuses.length + 1,
      is_terminal: false,
    };

    setStatuses([...statuses, newSt]);
    setNameInput('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Custom Project Workflow Statuses"
      maxWidth="md"
    >
      <div className="space-y-5">
        <p className="text-xs text-slate-400">
          Define custom workflow columns and statuses tailored to your team's project pipeline.
        </p>

        {/* Status List */}
        <div className="space-y-2">
          {statuses.map((st) => (
            <div key={st.id} className="p-3 bg-dark-surface/60 rounded-xl border border-dark-border flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: st.color }} />
                <span className="text-xs font-bold text-slate-100 font-display">{st.name}</span>
              </div>
              <span className="text-2xs text-slate-400 font-mono">Order: {st.sort_order}</span>
            </div>
          ))}
        </div>

        {/* Add Status Form */}
        <form onSubmit={handleAddStatus} className="p-4 bg-dark-surface rounded-xl border border-dark-border space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-display">Add Workflow Status Column</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Status Name</label>
              <Input
                type="text"
                placeholder="e.g. Security Audit"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Badge Hex Color</label>
              <Input
                type="text"
                placeholder="#8B5CF6"
                value={colorInput}
                onChange={(e) => setColorInput(e.target.value)}
                required
              />
            </div>
          </div>
          <Button variant="primary" size="md" className="w-full" type="submit" leftIcon={<Plus className="w-4 h-4" />}>
            Add Workflow Status
          </Button>
        </form>

        <Button variant="ghost" size="md" className="w-full" onClick={onClose}>
          Close Manager
        </Button>
      </div>
    </Modal>
  );
};
