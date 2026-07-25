// ─────────────────────────────────────────────────────────────
// Vortiq Outreach Sequences (Cadence Engine)
// Multi-step rep-controlled email+call cadences with auto-pause
// ─────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { Card, Button, Badge, Modal, Input } from '@/design-system';
import { OutreachSequence, SEED_SEQUENCES } from './types';
import { Mail, Phone, MessageSquare, Plus, Play, Pause } from 'lucide-react';

export const SequenceManager: React.FC = () => {
  const [sequences, setSequences] = useState<OutreachSequence[]>(SEED_SEQUENCES);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New sequence form
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleCreateSequence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const newSeq: OutreachSequence = {
      id: `seq-${Date.now()}`,
      organization_id: 'tenant-prod-001',
      name,
      description,
      auto_pause_on_reply: true,
      auto_pause_on_stage_change: true,
      enrolled_count: 0,
      created_at: new Date().toISOString(),
      steps: [
        { step_number: 1, day_offset: 0, type: 'email', subject: 'Discovery & Intro', body_template: 'Introduction email template' },
        { step_number: 2, day_offset: 2, type: 'call_task', body_template: 'Discovery call task' },
      ],
    };

    setSequences([newSeq, ...sequences]);
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
            <Mail className="w-5 h-5 text-violet-400" />
            Outreach Cadence Sequences
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Multi-step B2B sales email + call cadences. Automatically pauses when a prospect replies or stage changes.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setIsModalOpen(true)}
        >
          Create New Cadence
        </Button>
      </div>

      {/* Sequence Cards */}
      <div className="grid grid-cols-1 gap-4">
        {sequences.map((seq) => (
          <Card key={seq.id} className="p-5 bg-dark-card border-dark-border space-y-4 hover:border-violet-500/30">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-100 font-display">{seq.name}</h4>
                  <Badge variant="violet" size="sm">{seq.enrolled_count} Enrolled Deals</Badge>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{seq.description}</p>
              </div>

              <div className="flex items-center gap-2 text-2xs font-mono text-slate-400">
                <span className="px-2 py-1 bg-dark-surface rounded-lg border border-dark-border flex items-center gap-1">
                  <Pause className="w-3 h-3 text-amber-400" /> Auto-pause on Reply
                </span>
              </div>
            </div>

            {/* Step Timeline */}
            <div className="p-4 bg-dark-surface/60 rounded-xl border border-dark-border space-y-3">
              <h5 className="text-2xs font-bold uppercase tracking-wider text-slate-300 font-display">
                Cadence Step Breakdown ({seq.steps.length} Steps)
              </h5>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {seq.steps.map((st) => (
                  <div key={st.step_number} className="p-3 bg-dark-card rounded-lg border border-dark-border space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-2xs font-bold text-violet-400 font-mono">Step {st.step_number}</span>
                      <span className="text-2xs text-slate-400 font-mono">Day {st.day_offset}</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                      {st.type === 'email' && <Mail className="w-3.5 h-3.5 text-blue-400" />}
                      {st.type === 'call_task' && <Phone className="w-3.5 h-3.5 text-emerald-400" />}
                      {st.type === 'whatsapp' && <MessageSquare className="w-3.5 h-3.5 text-amber-400" />}
                      <span className="capitalize">{st.type.replace('_', ' ')}</span>
                    </div>

                    <p className="text-2xs text-slate-400 truncate">{st.subject || st.body_template}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* New Cadence Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Outreach Sequence"
        maxWidth="md"
      >
        <form onSubmit={handleCreateSequence} className="space-y-4">
          <div>
            <label className="text-2xs font-semibold text-slate-300 uppercase tracking-wider mb-1 block">
              Cadence Name *
            </label>
            <Input
              type="text"
              placeholder="e.g. Mid-Market CFO Discovery Cadence"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-2xs font-semibold text-slate-300 uppercase tracking-wider mb-1 block">
              Description
            </label>
            <Input
              type="text"
              placeholder="Target persona and cadence goals"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="p-3 bg-violet-500/10 border border-violet-500/30 rounded-xl text-2xs text-violet-200">
            <p className="font-bold">Automated Outreach Safeguard:</p>
            <p className="mt-0.5 text-slate-300">
              When a prospect replies to an email or their stage advances to Won/Lost, the cadence automatically pauses to prevent spamming.
            </p>
          </div>

          <div className="flex gap-2 pt-2 border-t border-dark-border">
            <Button variant="ghost" size="md" className="flex-1" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="md" className="flex-1" type="submit" leftIcon={<Play className="w-4 h-4" />}>
              Create & Launch Cadence
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
