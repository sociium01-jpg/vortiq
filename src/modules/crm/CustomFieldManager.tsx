// ─────────────────────────────────────────────────────────────
// Vortiq Admin Custom Objects & Custom Fields Manager
// Lets org admins model pipeline stages and custom fields around their process
// ─────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { Card, Button, Badge, Modal, Input, Select } from '@/design-system';
import { CustomFieldDefinition, SEED_CUSTOM_FIELDS, CrmPipelineStage } from './types';
import { Sliders, Plus, Settings, Layers } from 'lucide-react';

export interface CustomFieldManagerProps {
  stages: CrmPipelineStage[];
}

export const CustomFieldManager: React.FC<CustomFieldManagerProps> = ({ stages }) => {
  const [customFields, setCustomFields] = useState<CustomFieldDefinition[]>(SEED_CUSTOM_FIELDS);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form
  const [label, setLabel] = useState('');
  const [fieldType, setFieldType] = useState<'text' | 'number' | 'select' | 'date' | 'checkbox'>('text');

  const handleCreateField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label) return;

    const newField: CustomFieldDefinition = {
      id: `cf-${Date.now()}`,
      field_key: label.toLowerCase().replace(/[^a-z0-9]/g, '_'),
      label,
      field_type: fieldType,
      is_required: false,
    };

    setCustomFields([...customFields, newField]);
    setIsModalOpen(false);
    setLabel('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-dark-card border border-dark-border rounded-xl">
        <div>
          <h3 className="text-base font-bold uppercase tracking-wider text-slate-100 font-display flex items-center gap-2">
            <Sliders className="w-5 h-5 text-brand-400" />
            Custom Fields & Pipeline Stages Customizer
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Configure custom deal attributes and stage definitions for your organization's unique business workflow.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setIsModalOpen(true)}
        >
          Add Custom Deal Field
        </Button>
      </div>

      {/* Active Pipeline Stages Overview */}
      <Card className="p-5 bg-dark-card border-dark-border space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-display flex items-center gap-2">
          <Layers className="w-4 h-4 text-violet-400" />
          Active Pipeline Stages ({stages.length})
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {stages.map((stg) => (
            <div key={stg.id} className="p-3 bg-dark-surface/60 rounded-xl border border-dark-border space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stg.color }} />
                <span className="text-xs font-bold text-slate-200">{stg.name}</span>
              </div>
              <span className="text-2xs text-slate-400 font-mono">Stage ID: {stg.id}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Custom Fields List */}
      <Card className="p-5 bg-dark-card border-dark-border space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-display flex items-center gap-2">
          <Settings className="w-4 h-4 text-amber-400" />
          Defined Custom Fields ({customFields.length})
        </h4>

        <div className="space-y-2">
          {customFields.map((cf) => (
            <div key={cf.id} className="p-3 bg-dark-surface/60 rounded-xl border border-dark-border flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-200 font-display">{cf.label}</p>
                <p className="text-2xs text-slate-400 font-mono">Field Key: <code className="text-brand-400">{cf.field_key}</code></p>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="blue" size="sm" className="capitalize font-mono">
                  {cf.field_type}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Custom Deal Field"
        maxWidth="md"
      >
        <form onSubmit={handleCreateField} className="space-y-4">
          <div>
            <label className="text-2xs font-semibold text-slate-300 uppercase tracking-wider mb-1 block">
              Field Label *
            </label>
            <Input
              type="text"
              placeholder="e.g. Contract Tenure (Months)"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-2xs font-semibold text-slate-300 uppercase tracking-wider mb-1 block">
              Field Data Type
            </label>
            <Select
              value={fieldType}
              onChange={(e) => setFieldType(e.target.value as any)}
              options={[
                { value: 'text', label: 'Short Text' },
                { value: 'number', label: 'Numeric Number' },
                { value: 'date', label: 'Calendar Date' },
                { value: 'checkbox', label: 'Boolean Checkbox' },
              ]}
            />
          </div>

          <div className="flex gap-2 pt-2 border-t border-dark-border">
            <Button variant="ghost" size="md" className="flex-1" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="md" className="flex-1" type="submit" leftIcon={<Plus className="w-4 h-4" />}>
              Save Custom Field
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
