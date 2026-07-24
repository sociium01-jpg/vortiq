// ─────────────────────────────────────────────────────────────
// Vortiq Blueprint Stage-Gating Validation Modal
// Enforces mandatory fields and checklist verification before deal stage advance
// ─────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { Modal, Button, Input } from '@/design-system';
import { CrmLead, StageRequirement, LeadStageId } from './types';
import { Lock, CheckCircle2, ArrowRight } from 'lucide-react';

export interface BlueprintValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: CrmLead | null;
  targetStage: LeadStageId;
  requirement: StageRequirement;
  onConfirmAdvance: (updatedFields: Partial<CrmLead>) => void;
}

export const BlueprintValidationModal: React.FC<BlueprintValidationModalProps> = ({
  isOpen,
  onClose,
  lead,
  targetStage,
  requirement,
  onConfirmAdvance,
}) => {
  if (!lead) return null;

  // Form states for missing fields
  const [phoneInput, setPhoneInput] = useState(lead.phone || '');
  const [emailInput, setEmailInput] = useState(lead.email || '');
  const [companyInput, setCompanyInput] = useState(lead.company_name || '');
  const [valueInput, setValueInput] = useState(lead.estimated_value ? String(lead.estimated_value) : '');

  // Checklist items completion state
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({});

  const toggleChecklist = (item: string) => {
    setCompletedItems((prev) => ({ ...prev, [item]: !prev[item] }));
  };

  const allChecklistDone = requirement.checklist_items.every((item) => completedItems[item]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!allChecklistDone) return;

    const updates: Partial<CrmLead> = {
      phone: phoneInput || lead.phone,
      email: emailInput || lead.email,
      company_name: companyInput || lead.company_name,
      estimated_value: valueInput ? parseFloat(valueInput) : lead.estimated_value,
    };

    onConfirmAdvance(updates);
    onClose();
  };

  const currentStageName = (lead.stage || lead.stage_id || 'new').toUpperCase();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Stage-Gated Blueprint Requirement"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Header Alert */}
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-3">
          <Lock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-2xs text-amber-200">
            <p className="font-bold text-xs text-amber-300">
              Stage Blueprint Locked: {currentStageName} <ArrowRight className="w-3 h-3 inline mx-1" /> {targetStage.toUpperCase()}
            </p>
            <p className="mt-0.5 text-slate-300">
              Zoho/HubSpot Blueprint compliance requires completing mandatory deal fields and verification checklist items before advancing.
            </p>
          </div>
        </div>

        {/* Required Field Inputs */}
        {requirement.required_fields.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-display">
              Mandatory Deal Fields ({requirement.required_fields.length})
            </h4>

            {requirement.required_fields.includes('phone') && (
              <div>
                <label className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">
                  Contact Phone Number *
                </label>
                <Input
                  type="text"
                  placeholder="+91 98765 43210"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  required
                />
              </div>
            )}

            {requirement.required_fields.includes('email') && (
              <div>
                <label className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">
                  Contact Email Address *
                </label>
                <Input
                  type="email"
                  placeholder="contact@company.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  required
                />
              </div>
            )}

            {requirement.required_fields.includes('company_name') && (
              <div>
                <label className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">
                  Company / Entity Name *
                </label>
                <Input
                  type="text"
                  placeholder="Acme India Pvt Ltd"
                  value={companyInput}
                  onChange={(e) => setCompanyInput(e.target.value)}
                  required
                />
              </div>
            )}

            {requirement.required_fields.includes('estimated_value') && (
              <div>
                <label className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">
                  Estimated Deal Value (INR ₹) *
                </label>
                <Input
                  type="number"
                  placeholder="250000"
                  value={valueInput}
                  onChange={(e) => setValueInput(e.target.value)}
                  required
                />
              </div>
            )}
          </div>
        )}

        {/* Mandatory Checklist Items */}
        {requirement.checklist_items.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-display">
              Stage Advance Checklist (Mandatory)
            </h4>
            <div className="space-y-1.5">
              {requirement.checklist_items.map((item) => (
                <label
                  key={item}
                  onClick={() => toggleChecklist(item)}
                  className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    completedItems[item]
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                      : 'bg-dark-surface border-dark-border text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="text-xs font-medium">{item}</span>
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                    completedItems[item] ? 'bg-emerald-500 border-emerald-400 text-dark-bg' : 'border-dark-border'
                  }`}>
                    {completedItems[item] && <CheckCircle2 className="w-3.5 h-3.5 font-bold" />}
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex gap-2 pt-2 border-t border-dark-border">
          <Button variant="ghost" size="md" className="flex-1" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            className="flex-1"
            type="submit"
            disabled={!allChecklistDone}
            leftIcon={<CheckCircle2 className="w-4 h-4" />}
          >
            Verify & Advance Stage
          </Button>
        </div>
      </form>
    </Modal>
  );
};
