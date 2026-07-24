// ─────────────────────────────────────────────────────────────
// Vortiq Visual Workflow Automation Builder
// Trigger -> Condition -> Action visual builder (HubSpot / Zoho Parity)
// ─────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { Card, Button, Input, Select, Badge, Modal } from '@/design-system';
import { WorkflowRule, WorkflowTriggerType, SEED_WORKFLOW_RULES } from './types';
import { Zap, Plus, Globe, Bell, CheckSquare } from 'lucide-react';

export const WorkflowBuilder: React.FC = () => {
  const [workflows, setWorkflows] = useState<WorkflowRule[]>(SEED_WORKFLOW_RULES);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Rule State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [triggerType, setTriggerType] = useState<WorkflowTriggerType>('value_threshold');
  const [minValue, setMinValue] = useState('200000');
  const [actionType, setActionType] = useState<'send_notification' | 'create_task' | 'trigger_webhook'>('send_notification');
  const [actionMsg, setActionMsg] = useState('High Value Lead Alert');

  const toggleWorkflow = (id: string) => {
    setWorkflows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, is_active: !w.is_active } : w))
    );
  };

  const handleCreateWorkflow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const newRule: WorkflowRule = {
      id: `wf-${Date.now()}`,
      organization_id: 'tenant-prod-001',
      name,
      description,
      trigger_type: triggerType,
      trigger_conditions: { min_value: parseInt(minValue) || 0 },
      actions: [
        actionType === 'send_notification'
          ? { type: 'send_notification', notification_message: actionMsg }
          : actionType === 'create_task'
          ? { type: 'create_task', task_title: actionMsg }
          : { type: 'trigger_webhook', webhook_url: actionMsg || 'https://api.vortiq.biz/webhook' },
      ],
      is_active: true,
      created_at: new Date().toISOString(),
    };

    setWorkflows([newRule, ...workflows]);
    setIsModalOpen(false);
    setName('');
    setDescription('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-dark-card border border-dark-border rounded-xl">
        <div>
          <h3 className="text-base font-bold uppercase tracking-wider text-slate-100 font-display flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            Workflow Rules Automation Engine
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Automate tasks, notifications, field updates, and webhooks when deals meet trigger conditions
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setIsModalOpen(true)}
        >
          Create Workflow Rule
        </Button>
      </div>

      {/* Rules List */}
      <div className="grid grid-cols-1 gap-4">
        {workflows.map((rule) => (
          <Card key={rule.id} className="p-4 bg-dark-card border-dark-border space-y-3 hover:border-amber-500/30">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-100 font-display">{rule.name}</h4>
                  <Badge variant={rule.is_active ? 'emerald' : 'slate'} size="sm">
                    {rule.is_active ? 'Active' : 'Disabled'}
                  </Badge>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{rule.description}</p>
              </div>

              <Button
                variant={rule.is_active ? 'outline' : 'secondary'}
                size="sm"
                onClick={() => toggleWorkflow(rule.id)}
              >
                {rule.is_active ? 'Disable' : 'Enable'}
              </Button>
            </div>

            {/* Trigger -> Condition -> Action Flow Card */}
            <div className="p-3 bg-dark-surface/70 rounded-xl border border-dark-border grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              {/* Trigger */}
              <div className="space-y-1">
                <span className="text-2xs font-bold uppercase text-amber-400 tracking-wider">1. Trigger</span>
                <p className="font-semibold text-slate-200 capitalize font-mono">
                  {rule.trigger_type.replace('_', ' ')}
                </p>
              </div>

              {/* Condition */}
              <div className="space-y-1 border-t md:border-t-0 md:border-l border-dark-border pt-2 md:pt-0 md:pl-3">
                <span className="text-2xs font-bold uppercase text-blue-400 tracking-wider">2. Condition</span>
                <p className="font-semibold text-slate-300 font-mono">
                  {rule.trigger_conditions.min_value
                    ? `Value >= ₹${rule.trigger_conditions.min_value.toLocaleString()}`
                    : rule.trigger_conditions.stage
                    ? `Stage = ${rule.trigger_conditions.stage}`
                    : 'Any deal'}
                </p>
              </div>

              {/* Actions */}
              <div className="space-y-1 border-t md:border-t-0 md:border-l border-dark-border pt-2 md:pt-0 md:pl-3">
                <span className="text-2xs font-bold uppercase text-emerald-400 tracking-wider">3. Action</span>
                <div className="space-y-1">
                  {rule.actions.map((act, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-slate-200">
                      {act.type === 'send_notification' && <Bell className="w-3 h-3 text-amber-400" />}
                      {act.type === 'create_task' && <CheckSquare className="w-3 h-3 text-blue-400" />}
                      {act.type === 'trigger_webhook' && <Globe className="w-3 h-3 text-emerald-400" />}
                      <span className="truncate">{act.notification_message || act.task_title || act.webhook_url || act.type}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* New Workflow Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Build Automated Workflow Rule"
        maxWidth="md"
      >
        <form onSubmit={handleCreateWorkflow} className="space-y-4">
          <div>
            <label className="text-2xs font-semibold text-slate-300 uppercase tracking-wider mb-1 block">
              Rule Name *
            </label>
            <Input
              type="text"
              placeholder="e.g. VIP Lead Immediate Callback & Webhook"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-2xs font-semibold text-slate-300 uppercase tracking-wider mb-1 block">
              Rule Description
            </label>
            <Input
              type="text"
              placeholder="Brief description of when and why this rule fires"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-2xs font-semibold text-slate-300 uppercase tracking-wider mb-1 block">
                Trigger Event
              </label>
              <Select
                value={triggerType}
                onChange={(e) => setTriggerType(e.target.value as any)}
                options={[
                  { value: 'value_threshold', label: 'Value Threshold Crossed' },
                  { value: 'stage_changed', label: 'Stage Changed' },
                  { value: 'lead_created', label: 'Lead Created' },
                ]}
              />
            </div>

            <div>
              <label className="text-2xs font-semibold text-slate-300 uppercase tracking-wider mb-1 block">
                Min Deal Value (₹)
              </label>
              <Input
                type="number"
                placeholder="200000"
                value={minValue}
                onChange={(e) => setMinValue(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-2xs font-semibold text-slate-300 uppercase tracking-wider mb-1 block">
              Action Execution
            </label>
            <Select
              value={actionType}
              onChange={(e) => setActionType(e.target.value as any)}
              options={[
                { value: 'send_notification', label: 'Send In-App Notification' },
                { value: 'create_task', label: 'Create Follow-up Task' },
                { value: 'trigger_webhook', label: 'Trigger HTTP Webhook POST' },
              ]}
            />
          </div>

          <div>
            <label className="text-2xs font-semibold text-slate-300 uppercase tracking-wider mb-1 block">
              Action Message / Payload Title
            </label>
            <Input
              type="text"
              placeholder="Message or Webhook URL"
              value={actionMsg}
              onChange={(e) => setActionMsg(e.target.value)}
              required
            />
          </div>

          <div className="flex gap-2 pt-2 border-t border-dark-border">
            <Button variant="ghost" size="md" className="flex-1" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="md" className="flex-1" type="submit" leftIcon={<Zap className="w-4 h-4" />}>
              Save & Activate Workflow
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
