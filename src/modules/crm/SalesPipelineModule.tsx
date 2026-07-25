// ─────────────────────────────────────────────────────────────
// Vortiq Sales Pipeline (HubSpot Sales Hub & Zoho CRM Parity)
// Includes Stage-Gated Blueprints, Workflows, Forecasting, Cadences,
// Lead Scoring, Call Transcripts UI, Booking Links, & Custom Objects.
// ─────────────────────────────────────────────────────────────

import React, { useState, useCallback } from 'react';
import { Button, Badge } from '@/design-system';
import {
  CrmLead,
  CrmActivity,
  CrmCall,
  CrmFollowup,
  LeadStageId,
  PIPELINE_STAGES,
  SEED_LEADS,
  SEED_ACTIVITIES,
  SEED_FOLLOWUPS,
  SEED_STAGE_REQUIREMENTS,
  SEED_WORKFLOW_RULES,
  StageRequirement,
} from './types';
import { KanbanBoard } from './KanbanBoard';
import { LeadDetailPage } from './LeadDetailPage';
import { BulkLeadImporterModal } from './BulkLeadImporterModal';
import { BlueprintValidationModal } from './BlueprintValidationModal';
import { ForecastDashboard } from './ForecastDashboard';
import { WorkflowBuilder } from './WorkflowBuilder';
import { SequenceManager } from './SequenceManager';
import { LeadScoringManager } from './LeadScoringManager';
import { SchedulingLinkGenerator } from './SchedulingLinkGenerator';
import { CustomFieldManager } from './CustomFieldManager';
import { evaluateAndRunWorkflows } from './WorkflowEngine';
import {
  LayoutGrid,
  Upload,
  Plus,
  TrendingUp,
  Zap,
  Mail,
  Flame,
  Link2,
  Sliders,
} from 'lucide-react';

type View = 'kanban' | 'forecast' | 'workflows' | 'cadences' | 'scoring' | 'scheduling' | 'customizer';

const makeNewLead = (): CrmLead => ({
  id: `lead-${Date.now()}`,
  organization_id: 'tenant-prod-001',
  title: 'New Lead',
  name: '',
  contact_person: '',
  stage: 'new',
  stage_id: 'new',
  estimated_value: 0,
  currency: 'INR',
  notes_count: 0,
  calls_count: 0,
  followups_count: 0,
  open_followups_count: 0,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  created_by: 'u-1',
});

export const SalesPipelineModule: React.FC = () => {
  const [view, setView] = useState<View>('kanban');
  const [leads, setLeads] = useState<CrmLead[]>(SEED_LEADS);
  const [activities, setActivities] = useState<Record<string, CrmActivity[]>>(SEED_ACTIVITIES);
  const [calls, setCalls] = useState<Record<string, CrmCall>>({});
  const [followups, setFollowups] = useState<CrmFollowup[]>(SEED_FOLLOWUPS);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [showImporter, setShowImporter] = useState(false);

  // Blueprint Stage-Gating State
  const [blueprintModalOpen, setBlueprintModalOpen] = useState(false);
  const [pendingAdvance, setPendingAdvance] = useState<{
    lead: CrmLead;
    targetStage: LeadStageId;
    requirement: StageRequirement;
  } | null>(null);

  // Handle stage change request with Blueprint Stage-Gating Check
  const handleStageChangeRequest = useCallback(
    (leadId: string, newStageId: string) => {
      const targetLead = leads.find((l) => l.id === leadId);
      if (!targetLead) return;

      const currentStage = (targetLead.stage || targetLead.stage_id || 'new') as LeadStageId;
      const targetStage = newStageId as LeadStageId;

      if (currentStage === targetStage) return;

      // Find stage-gating requirement
      const req = SEED_STAGE_REQUIREMENTS.find(
        (r) => r.from_stage === currentStage && r.to_stage === targetStage
      );

      // Check if lead has missing required fields
      let hasMissing = false;
      if (req) {
        req.required_fields.forEach((f) => {
          if (!targetLead[f] || (typeof targetLead[f] === 'number' && (targetLead[f] as number) <= 0)) {
            hasMissing = true;
          }
        });
      }

      if (req && (hasMissing || req.checklist_items.length > 0)) {
        // Enforce Blueprint Stage-Gating Modal
        setPendingAdvance({ lead: targetLead, targetStage, requirement: req });
        setBlueprintModalOpen(true);
        return;
      }

      // If no missing requirements, update stage immediately
      executeStageAdvance(leadId, targetStage, {});
    },
    [leads]
  );

  const executeStageAdvance = (leadId: string, targetStage: LeadStageId, updates: Partial<CrmLead>) => {
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id !== leadId) return l;
        const updated: CrmLead = {
          ...l,
          ...updates,
          stage: targetStage,
          stage_id: targetStage,
          updated_at: new Date().toISOString(),
        };

        // Run Workflow Rules Engine on stage change
        evaluateAndRunWorkflows(updated, 'stage_changed', SEED_WORKFLOW_RULES, {
          prevStage: (l.stage || l.stage_id) as LeadStageId,
          newStage: targetStage,
        });

        return updated;
      })
    );
  };

  const handleCreateLead = () => {
    const fresh = makeNewLead();
    setLeads((prev) => [fresh, ...prev]);
    setSelectedLeadId(fresh.id);
  };

  const selectedLead = leads.find((l) => l.id === selectedLeadId) || null;

  return (
    <div className="space-y-6">
      {/* Top Header & Navigation Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-dark-card border border-dark-border rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-100 font-display tracking-tight">Sales / Leads Pipeline</h1>
            <Badge variant="emerald" size="sm" className="font-mono font-bold">Enterprise Pipeline Engine</Badge>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Stage-Gated Blueprints • Workflows • Forecasting • Cadences • Scoring
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Sub-module View Switcher */}
          <div className="flex p-1 bg-dark-surface rounded-xl border border-dark-border overflow-x-auto text-xs font-semibold">
            {[
              { id: 'kanban', label: 'Kanban', icon: LayoutGrid },
              { id: 'forecast', label: 'Forecast', icon: TrendingUp },
              { id: 'workflows', label: 'Workflows', icon: Zap },
              { id: 'cadences', label: 'Cadences', icon: Mail },
              { id: 'scoring', label: 'Scoring', icon: Flame },
              { id: 'scheduling', label: 'Links/Macros', icon: Link2 },
              { id: 'customizer', label: 'Custom Fields', icon: Sliders },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setView(id as View)}
                className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all whitespace-nowrap ${
                  view === id
                    ? 'bg-brand-500 text-dark-bg font-bold shadow-md shadow-brand-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            leftIcon={<Upload className="w-3.5 h-3.5" />}
            onClick={() => setShowImporter(true)}
          >
            Import CSV
          </Button>

          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={handleCreateLead}
          >
            New Deal
          </Button>
        </div>
      </div>

      {/* Main Viewport */}
      {view === 'kanban' && (
        <KanbanBoard
          stages={PIPELINE_STAGES}
          leads={leads}
          onLeadClick={(lead) => setSelectedLeadId(lead.id)}
          onLeadStageChange={handleStageChangeRequest}
          onAddLeadToStage={(stageId) => {
            const fresh: CrmLead = { ...makeNewLead(), stage: stageId as LeadStageId, stage_id: stageId as LeadStageId };
            setLeads((prev) => [fresh, ...prev]);
            setSelectedLeadId(fresh.id);
          }}
        />
      )}

      {view === 'forecast' && (
        <ForecastDashboard leads={leads} stages={PIPELINE_STAGES} />
      )}

      {view === 'workflows' && <WorkflowBuilder />}

      {view === 'cadences' && <SequenceManager />}

      {view === 'scoring' && <LeadScoringManager leads={leads} />}

      {view === 'scheduling' && <SchedulingLinkGenerator />}

      {view === 'customizer' && <CustomFieldManager stages={PIPELINE_STAGES} />}

      {/* Lead Detail Drawer */}
      {selectedLead && (
        <LeadDetailPage
          lead={selectedLead}
          activities={activities[selectedLead.id] || []}
          calls={calls}
          followups={followups.reduce((acc, f) => ({ ...acc, [f.id]: f }), {})}
          onBack={() => setSelectedLeadId(null)}
          onUpdate={(updated) => {
            setLeads((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
          }}
          onRemove={(leadId) => {
            setLeads((prev) => prev.filter((l) => l.id !== leadId));
            setSelectedLeadId(null);
          }}
          onCallLogged={(call, act) => {
            if (call.id) setCalls((prev) => ({ ...prev, [call.id]: call }));
            setActivities((prev) => ({
              ...prev,
              [selectedLead.id]: [act, ...(prev[selectedLead.id] || [])],
            }));
          }}
          onFollowupCreated={(followup, act) => {
            setFollowups((prev) => [followup, ...prev]);
            setActivities((prev) => ({
              ...prev,
              [selectedLead.id]: [act, ...(prev[selectedLead.id] || [])],
            }));
          }}
          onNoteAdded={(_leadId, _note, act) => {
            setActivities((prev) => ({
              ...prev,
              [selectedLead.id]: [act, ...(prev[selectedLead.id] || [])],
            }));
          }}
        />
      )}

      {/* Stage-Gated Blueprint Validation Modal */}
      {pendingAdvance && (
        <BlueprintValidationModal
          isOpen={blueprintModalOpen}
          onClose={() => {
            setBlueprintModalOpen(false);
            setPendingAdvance(null);
          }}
          lead={pendingAdvance.lead}
          targetStage={pendingAdvance.targetStage}
          requirement={pendingAdvance.requirement}
          onConfirmAdvance={(updates) => {
            executeStageAdvance(pendingAdvance.lead.id, pendingAdvance.targetStage, updates);
            setPendingAdvance(null);
          }}
        />
      )}

      {/* Bulk Lead Importer */}
      {showImporter && (
        <BulkLeadImporterModal
          isOpen={showImporter}
          onClose={() => setShowImporter(false)}
          organizationId="tenant-prod-001"
          onImportComplete={(imported) => {
            setLeads((prev) => [...(imported as CrmLead[]), ...prev]);
            setShowImporter(false);
          }}
        />
      )}
    </div>
  );
};
