// ─────────────────────────────────────────────────────────────
// Vortiq Performance Appraisal & OKR Goals Module
// Review cycles, self-assessment + manager evaluation, & 9-Box grid
// ─────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { Card, Badge, Button, Modal, Input, Select } from '@/design-system';
import { PerformanceReview, SEED_PERFORMANCE_REVIEWS, EmployeeWithUser } from './types';
import { Award, Star, Plus, Target, BarChart2 } from 'lucide-react';

export interface PerformanceReviewModuleProps {
  employees: EmployeeWithUser[];
}

export const PerformanceReviewModule: React.FC<PerformanceReviewModuleProps> = ({ employees }) => {
  const [reviews, setReviews] = useState<PerformanceReview[]>(SEED_PERFORMANCE_REVIEWS);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Review Form
  const [selectedEmpId, setSelectedEmpId] = useState(employees[0]?.user_id || '');
  const [cycleName, setCycleName] = useState('Q3 2026 Appraisal Cycle');
  const [selfRating, setSelfRating] = useState('4');
  const [managerRating, setManagerRating] = useState('5');
  const [goalsSummary, setGoalsSummary] = useState('Achieved key engineering product expansion deliverables.');

  const handleCreateReview = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((e) => e.user_id === selectedEmpId);

    const newReview: PerformanceReview = {
      id: `pr-${Date.now()}`,
      tenant_id: 'tenant-prod-001',
      employee_id: selectedEmpId,
      employee_name: emp?.full_name || 'Team Member',
      reviewer_name: 'Alex Vance',
      cycle_name: cycleName,
      self_rating: parseInt(selfRating) || 4,
      manager_rating: parseInt(managerRating) || 5,
      goals_summary: goalsSummary,
      status: 'completed',
      created_at: new Date().toISOString(),
    };

    setReviews([newReview, ...reviews]);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 bg-dark-card border-dark-border">
          <div className="flex items-center justify-between">
            <span className="text-2xs font-semibold uppercase text-slate-400 tracking-wider">Active Review Cycles</span>
            <Award className="w-4 h-4 text-brand-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black font-mono text-slate-100">Q3 2026 Cycle</span>
            <Badge variant="emerald" size="sm">Active</Badge>
          </div>
          <p className="text-2xs text-slate-400 font-mono mt-1">OKRs & KRA Evaluations</p>
        </Card>

        <Card className="p-4 bg-dark-card border-dark-border">
          <div className="flex items-center justify-between">
            <span className="text-2xs font-semibold uppercase text-violet-400 tracking-wider">Avg Appraisal Rating</span>
            <Star className="w-4 h-4 text-violet-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black font-mono text-violet-300">4.5 / 5.0</span>
            <Badge variant="violet" size="sm">High Performer</Badge>
          </div>
          <p className="text-2xs text-slate-400 font-mono mt-1">Self & Manager assessments</p>
        </Card>

        <Card className="p-4 bg-dark-card border-dark-border">
          <div className="flex items-center justify-between">
            <span className="text-2xs font-semibold uppercase text-amber-400 tracking-wider">9-Box Talent Grid</span>
            <BarChart2 className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black font-mono text-amber-300">Star Performer</span>
            <Badge variant="amber" size="sm">Top 10%</Badge>
          </div>
          <p className="text-2xs text-slate-400 font-mono mt-1">Succession planning matrix</p>
        </Card>
      </div>

      {/* Reviews Table */}
      <Card className="p-5 bg-dark-card border-dark-border space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-display flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-400" />
              Completed & Active Appraisal Reviews ({reviews.length})
            </h4>
            <p className="text-2xs text-slate-400 mt-0.5">Track employee KRA goals and self vs manager evaluations</p>
          </div>

          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setIsModalOpen(true)}
          >
            Create Appraisal Review
          </Button>
        </div>

        <div className="space-y-3">
          {reviews.map((pr) => (
            <div key={pr.id} className="p-4 bg-dark-surface/60 rounded-xl border border-dark-border flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-100 font-display">{pr.employee_name}</span>
                  <Badge variant="emerald" size="sm">{pr.cycle_name}</Badge>
                </div>
                <p className="text-2xs text-slate-300 font-mono">Reviewer: {pr.reviewer_name}</p>
                <p className="text-2xs text-slate-400 font-mono">Goals & OKRs: {pr.goals_summary}</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right font-mono">
                  <span className="text-2xs text-slate-400 block">Self / Mgr Rating</span>
                  <span className="font-bold text-amber-300">★ {pr.self_rating}.0 / ★ {pr.manager_rating}.0</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Create Review Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Create Performance Appraisal Evaluation"
          maxWidth="md"
        >
          <form onSubmit={handleCreateReview} className="space-y-4">
            <div>
              <label className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Employee</label>
              <Select
                value={selectedEmpId}
                onChange={(e) => setSelectedEmpId(e.target.value)}
                options={employees.map((e) => ({ value: e.user_id, label: `${e.full_name} (${e.department})` }))}
              />
            </div>

            <div>
              <label className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Appraisal Cycle Name</label>
              <Input
                type="text"
                value={cycleName}
                onChange={(e) => setCycleName(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Self Assessment Rating (1-5)</label>
                <Input
                  type="number"
                  min="1"
                  max="5"
                  value={selfRating}
                  onChange={(e) => setSelfRating(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Manager Rating (1-5)</label>
                <Input
                  type="number"
                  min="1"
                  max="5"
                  value={managerRating}
                  onChange={(e) => setManagerRating(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">KRA Goals & Summary</label>
              <textarea
                value={goalsSummary}
                onChange={(e) => setGoalsSummary(e.target.value)}
                className="w-full h-20 p-3 bg-dark-surface border border-dark-border rounded-xl font-mono text-xs text-slate-200 focus:outline-none focus:border-brand-500"
                required
              />
            </div>

            <Button variant="primary" size="md" className="w-full" type="submit" leftIcon={<Target className="w-4 h-4" />}>
              Submit Performance Appraisal Review
            </Button>
          </form>
        </Modal>
      )}
    </div>
  );
};
