// ─────────────────────────────────────────────────────────────
// Vortiq Department & Project Budget vs. Actual Variance Engine
// Zoho Books Parity
// ─────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { Card, Badge, Button, Modal, Input } from '@/design-system';
import { DepartmentBudget, SEED_BUDGETS } from './types';
import { PieChart, Plus } from 'lucide-react';

export const BudgetVsActualReporter: React.FC = () => {
  const [budgets, setBudgets] = useState<DepartmentBudget[]>(SEED_BUDGETS);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Budget Form
  const [department, setDepartment] = useState('Operations & Floor Logistics');
  const [budgetCapInput, setBudgetCapInput] = useState('750000');
  const [actualSpentInput, setActualSpentInput] = useState('320000');

  const handleCreateBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const cap = parseFloat(budgetCapInput) || 0;
    const spent = parseFloat(actualSpentInput) || 0;

    const newBgt: DepartmentBudget = {
      id: `bgt-${Date.now()}`,
      tenant_id: 'tenant-prod-001',
      department: department,
      budget_cap: cap,
      actual_spent: spent,
      period_month: 7,
      period_year: 2026,
    };

    setBudgets([newBgt, ...budgets]);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Department Budget Cards */}
      <Card className="p-5 bg-dark-card border-dark-border space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-display flex items-center gap-2">
              <PieChart className="w-4 h-4 text-brand-400" />
              Department & Project Budget vs. Actual Breakdown ({budgets.length})
            </h4>
            <p className="text-2xs text-slate-400 mt-0.5">Track monthly spending caps against actual operating expenses</p>
          </div>

          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setIsModalOpen(true)}
          >
            Create Department Budget
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgets.map((bgt) => {
            const usagePercent = Math.min(100, Math.round((bgt.actual_spent / bgt.budget_cap) * 100));
            const isOverBudget = bgt.actual_spent > bgt.budget_cap;

            return (
              <Card key={bgt.id} className="p-4 bg-dark-surface/60 border-dark-border space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="font-extrabold text-slate-100 font-display text-xs">{bgt.department}</h5>
                  <Badge variant={isOverBudget ? 'rose' : 'emerald'} size="sm" className="font-mono">
                    {usagePercent}% Used
                  </Badge>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-dark-card h-2 rounded-full overflow-hidden border border-dark-border">
                  <div
                    className={`h-full transition-all ${
                      isOverBudget ? 'bg-rose-500' : usagePercent > 80 ? 'bg-amber-400' : 'bg-brand-500'
                    }`}
                    style={{ width: `${usagePercent}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-2xs font-mono">
                  <span className="text-slate-400">Actual Spent: <strong className="text-slate-200">₹{bgt.actual_spent.toLocaleString('en-IN')}</strong></span>
                  <span className="text-slate-400">Budget Cap: <strong className="text-emerald-400">₹{bgt.budget_cap.toLocaleString('en-IN')}</strong></span>
                </div>
              </Card>
            );
          })}
        </div>
      </Card>

      {/* Create Budget Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Create Department Monthly Budget Cap"
          maxWidth="md"
        >
          <form onSubmit={handleCreateBudget} className="space-y-4">
            <div>
              <label className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Department / Project Name</label>
              <Input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Monthly Budget Cap (₹)</label>
                <Input
                  type="number"
                  value={budgetCapInput}
                  onChange={(e) => setBudgetCapInput(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Actual Spent (₹)</label>
                <Input
                  type="number"
                  value={actualSpentInput}
                  onChange={(e) => setActualSpentInput(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button variant="primary" size="md" className="w-full" type="submit" leftIcon={<PieChart className="w-4 h-4" />}>
              Save Department Budget Cap
            </Button>
          </form>
        </Modal>
      )}
    </div>
  );
};
