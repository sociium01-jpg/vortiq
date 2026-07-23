import React, { useState } from 'react';
import { Modal, Button, Select } from '@/design-system';
import { CrmFollowup, FollowupType, FOLLOWUP_TYPES, SAMPLE_TEAM_MEMBERS } from './types';
import { Calendar, FileText } from 'lucide-react';

interface FollowupModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadId: string;
  leadTitle: string;
  currentUserId: string;
  currentUserName: string;
  onSave: (followup: CrmFollowup) => void;
}

export const FollowupModal: React.FC<FollowupModalProps> = ({
  isOpen,
  onClose,
  leadId,
  leadTitle,
  currentUserId,
  currentUserName,
  onSave,
}) => {
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const [type, setType] = useState<FollowupType>('call_back');
  const [dueDate, setDueDate] = useState(tomorrow);
  const [assigneeId, setAssigneeId] = useState(currentUserId);
  const [notes, setNotes] = useState('');

  const handleSubmit = () => {
    if (!dueDate) return;

    const assignee = SAMPLE_TEAM_MEMBERS.find(m => m.id === assigneeId);

    const followup: CrmFollowup = {
      id: `fu-${Date.now()}`,
      lead_id: leadId,
      lead_title: leadTitle,
      organization_id: 'org-1',
      type,
      due_date: dueDate,
      assignee_id: assigneeId,
      assignee_name: assignee?.name || currentUserName,
      status: 'pending',
      notes: notes.trim() || undefined,
      created_by_id: currentUserId,
      created_by_name: currentUserName,
      created_at: new Date().toISOString(),
    };

    onSave(followup);
    setType('call_back');
    setDueDate(tomorrow);
    setAssigneeId(currentUserId);
    setNotes('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Followup"
      maxWidth="md"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Calendar className="w-4 h-4" />}
            onClick={handleSubmit}
            disabled={!dueDate}
          >
            Schedule Followup
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        {/* Context */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-dark-surface border border-dark-border/60 text-xs text-slate-400">
          <Calendar className="w-3.5 h-3.5 text-violet-400" />
          <span>For lead:</span>
          <span className="font-semibold text-slate-200">{leadTitle}</span>
        </div>

        {/* Followup type */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-300">Followup Type</label>
          <div className="grid grid-cols-2 gap-2">
            {FOLLOWUP_TYPES.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setType(opt.value)}
                className={`px-3 py-2.5 rounded-xl border text-xs font-medium text-left transition-all ${
                  type === opt.value
                    ? 'border-violet-500/60 bg-violet-500/10 text-violet-200'
                    : 'border-dark-border/60 bg-dark-surface/40 text-slate-400 hover:border-dark-border hover:text-slate-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Due date */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-medium text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            Due Date
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full bg-dark-surface border border-dark-border rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-brand-500/80 transition-colors font-mono"
          />
        </div>

        {/* Assignee */}
        <Select
          label="Assign To"
          value={assigneeId}
          onChange={(e) => setAssigneeId(e.target.value)}
          options={SAMPLE_TEAM_MEMBERS.map(m => ({ value: m.id, label: `${m.name} (${m.role})` }))}
        />

        {/* Notes */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-medium text-slate-300">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            Notes (optional)
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="What needs to happen in this followup?"
            className="w-full bg-dark-surface border border-dark-border rounded-xl px-3 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-brand-500/80 transition-colors resize-none"
          />
        </div>
      </div>
    </Modal>
  );
};
