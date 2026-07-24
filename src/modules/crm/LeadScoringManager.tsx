// ─────────────────────────────────────────────────────────────
// Vortiq Behavioral & Record Lead Scoring Engine
// Configurable score matrix (+points for attributes/events, -points for inactivity)
// ─────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { Card, Button, Badge, Modal, Input, Select } from '@/design-system';
import { LeadScoreRule, SEED_LEAD_SCORE_RULES, CrmLead, calculateLeadScore } from './types';
import { Flame, Zap, Snowflake, Plus, Sliders } from 'lucide-react';

export interface LeadScoringManagerProps {
  leads: CrmLead[];
}

export const LeadScoringManager: React.FC<LeadScoringManagerProps> = ({ leads }) => {
  const [rules, setRules] = useState<LeadScoreRule[]>(SEED_LEAD_SCORE_RULES);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Rule Form
  const [ruleName, setRuleName] = useState('');
  const [category, setCategory] = useState<'deal_size' | 'behavioral' | 'demographic'>('deal_size');
  const [pointsDelta, setPointsDelta] = useState('20');

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleName) return;

    const newRule: LeadScoreRule = {
      id: `score-${Date.now()}`,
      rule_name: ruleName,
      category,
      condition_field: 'estimated_value',
      operator: 'greater_than',
      expected_value: 200000,
      points_delta: parseInt(pointsDelta) || 10,
    };

    setRules([...rules, newRule]);
    setIsModalOpen(false);
    setRuleName('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-dark-card border border-dark-border rounded-xl">
        <div>
          <h3 className="text-base font-bold uppercase tracking-wider text-slate-100 font-display flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-400" />
            Lead Scoring & Qualification Matrix
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Automatically calculates dynamic lead scores to prioritize high-intent prospects for rep outreach.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setIsModalOpen(true)}
        >
          Add Scoring Rule
        </Button>
      </div>

      {/* Live Lead Qualification Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Hot Leads */}
        <Card className="p-4 bg-dark-card border-dark-border border-l-4 border-l-rose-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-rose-400" />
              <span className="text-xs font-bold text-slate-200">Hot Leads (Score &ge; 50)</span>
            </div>
            <Badge variant="rose" size="sm">High Priority</Badge>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black font-mono text-rose-400">
              {leads.filter((l) => calculateLeadScore(l, rules) >= 50).length} Deals
            </span>
            <p className="text-2xs text-slate-400 font-mono mt-0.5">High deal size or active engagement</p>
          </div>
        </Card>

        {/* Warm Leads */}
        <Card className="p-4 bg-dark-card border-dark-border border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-slate-200">Warm Leads (Score 20–49)</span>
            </div>
            <Badge variant="amber" size="sm">Evaluating</Badge>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black font-mono text-amber-400">
              {leads.filter((l) => {
                const sc = calculateLeadScore(l, rules);
                return sc >= 20 && sc < 50;
              }).length} Deals
            </span>
            <p className="text-2xs text-slate-400 font-mono mt-0.5">Standard qualification criteria met</p>
          </div>
        </Card>

        {/* Cold Leads */}
        <Card className="p-4 bg-dark-card border-dark-border border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Snowflake className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-bold text-slate-200 font-display">Cold Leads (Score &lt; 20)</span>
            </div>
            <Badge variant="blue" size="sm">Nurture</Badge>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black font-mono text-blue-400">
              {leads.filter((l) => calculateLeadScore(l, rules) < 20).length} Deals
            </span>
            <p className="text-2xs text-slate-400 font-mono mt-0.5">Requires cadence sequence nurturing</p>
          </div>
        </Card>
      </div>

      {/* Rules Matrix Table */}
      <Card className="p-5 bg-dark-card border-dark-border space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-display flex items-center gap-2">
          <Sliders className="w-4 h-4 text-brand-400" />
          Active Scoring Rules Matrix ({rules.length})
        </h4>

        <div className="space-y-2">
          {rules.map((rl) => (
            <div key={rl.id} className="p-3 bg-dark-surface/60 rounded-xl border border-dark-border flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-200 font-display">{rl.rule_name}</p>
                <p className="text-2xs text-slate-400 font-mono capitalize">
                  Category: {rl.category} • Field: {String(rl.condition_field)}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Badge variant={rl.points_delta > 0 ? 'emerald' : 'rose'} size="md">
                  {rl.points_delta > 0 ? `+${rl.points_delta} pts` : `${rl.points_delta} pts`}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* New Rule Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Lead Qualification Scoring Rule"
        maxWidth="md"
      >
        <form onSubmit={handleAddRule} className="space-y-4">
          <div>
            <label className="text-2xs font-semibold text-slate-300 uppercase tracking-wider mb-1 block">
              Rule Name *
            </label>
            <Input
              type="text"
              placeholder="e.g. Budget > ₹5,00,000"
              value={ruleName}
              onChange={(e) => setRuleName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-2xs font-semibold text-slate-300 uppercase tracking-wider mb-1 block">
                Rule Category
              </label>
              <Select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                options={[
                  { value: 'deal_size', label: 'Deal Size / Value' },
                  { value: 'behavioral', label: 'Behavioral Engagement' },
                  { value: 'demographic', label: 'Demographic / Industry' },
                ]}
              />
            </div>

            <div>
              <label className="text-2xs font-semibold text-slate-300 uppercase tracking-wider mb-1 block">
                Points Delta (+/-)
              </label>
              <Input
                type="number"
                placeholder="20"
                value={pointsDelta}
                onChange={(e) => setPointsDelta(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2 border-t border-dark-border">
            <Button variant="ghost" size="md" className="flex-1" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="md" className="flex-1" type="submit" leftIcon={<Flame className="w-4 h-4" />}>
              Save Scoring Rule
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
