import React, { useState, useCallback } from 'react';
import { Button } from '@/design-system';
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
} from './types';
import { KanbanBoard } from './KanbanBoard';
import { LeadListView } from './LeadListView';
import { LeadDetailPage } from './LeadDetailPage';
import { TodayDashboard } from './TodayDashboard';
import { BulkLeadImporterModal } from './BulkLeadImporterModal';
import {
  LayoutGrid,
  List,
  Calendar,
  Upload,
  Plus,
  TrendingUp,
  IndianRupee,
  Users,
  AlertCircle,
} from 'lucide-react';

type View = 'kanban' | 'list' | 'today';

// ── New Lead Defaults ──────────────────────────────────────────────────────────
const makeNewLead = (): CrmLead => ({
  id: `lead-${Date.now()}`,
  organization_id: 'org-1',
  title: 'New Lead',
  name: '',
  contact_person: '',
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
  // ── State ──────────────────────────────────────────────────────────────────
  const [view, setView] = useState<View>('kanban');
  const [leads, setLeads] = useState<CrmLead[]>(SEED_LEADS);
  const [activities, setActivities] = useState<Record<string, CrmActivity[]>>(SEED_ACTIVITIES);
  const [calls, setCalls] = useState<Record<string, CrmCall>>({});
  const [followups, setFollowups] = useState<CrmFollowup[]>(SEED_FOLLOWUPS);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [showImporter, setShowImporter] = useState(false);

  // ── Derived state ──────────────────────────────────────────────────────────
  const selectedLead = selectedLeadId ? leads.find(l => l.id === selectedLeadId) : null;
  const selectedActivities = selectedLeadId ? (activities[selectedLeadId] || []) : [];
  const followupsMap = Object.fromEntries(followups.map(f => [f.id, f]));

  const totalPipelineValue = leads.reduce((sum, l) => sum + (l.estimated_value || 0), 0);
  const openLeads = leads.filter(l => l.stage_id !== 'won' && l.stage_id !== 'lost');
  const overdueFollowups = followups.filter(f => f.status === 'pending' && f.due_date < new Date().toISOString().split('T')[0]);

  // ── Lead actions ───────────────────────────────────────────────────────────
  const addActivity = useCallback((leadId: string, act: CrmActivity) => {
    setActivities(prev => ({
      ...prev,
      [leadId]: [act, ...(prev[leadId] || [])],
    }));
  }, []);

  const handleLeadStageChange = useCallback((leadId: string, newStageId: string) => {
    setLeads(prev => prev.map(l => {
      if (l.id !== leadId) return l;
      const act: CrmActivity = {
        id: `act-${Date.now()}`,
        lead_id: leadId,
        organization_id: 'org-1',
        type: 'stage_change',
        performed_by_id: 'u-1',
        performed_by_name: 'Alex Vance',
        performed_at: new Date().toISOString(),
        stage_from: l.stage_id,
        stage_to: newStageId as LeadStageId,
      };
      addActivity(leadId, act);
      return { ...l, stage_id: newStageId as LeadStageId, updated_at: new Date().toISOString() };
    }));
  }, [addActivity]);

  const handleLeadAssigneeChange = useCallback((leadId: string, newAssigneeId: string) => {
    setLeads(prev => prev.map(l => {
      if (l.id !== leadId) return l;
      const act: CrmActivity = {
        id: `act-${Date.now()}`,
        lead_id: leadId,
        organization_id: 'org-1',
        type: 'reassignment',
        performed_by_id: 'u-1',
        performed_by_name: 'Alex Vance',
        performed_at: new Date().toISOString(),
        assignee_from_id: l.assignee_id,
        assignee_from_name: l.assignee_name,
        assignee_to_id: newAssigneeId,
        assignee_to_name: newAssigneeId,
      };
      addActivity(leadId, act);
      return { ...l, assignee_id: newAssigneeId, updated_at: new Date().toISOString() };
    }));
  }, [addActivity]);

  const handleLeadUpdate = useCallback((updated: CrmLead) => {
    setLeads(prev => prev.map(l => l.id === updated.id ? updated : l));
  }, []);

  const handleLeadRemove = useCallback((leadId: string) => {
    // In a real app: POST to notification API for Owner/Admin
    console.warn('[VORTIQ] Removal alert: Lead removed by Alex Vance — Owner/Admin notified.');
    setLeads(prev => prev.filter(l => l.id !== leadId));
    setSelectedLeadId(null);
  }, []);

  const handleCallLogged = useCallback((call: CrmCall, activity: CrmActivity) => {
    if (call.id) {
      setCalls(prev => ({ ...prev, [call.id]: call }));
      setLeads(prev => prev.map(l =>
        l.id === call.lead_id ? { ...l, calls_count: (l.calls_count || 0) + 1 } : l
      ));
    }
    if (activity.lead_id) addActivity(activity.lead_id, activity);
  }, [addActivity]);

  const handleFollowupCreated = useCallback((followup: CrmFollowup, activity: CrmActivity) => {
    setFollowups(prev => [followup, ...prev]);
    setLeads(prev => prev.map(l =>
      l.id === followup.lead_id
        ? { ...l, followups_count: (l.followups_count || 0) + 1, open_followups_count: (l.open_followups_count || 0) + 1 }
        : l
    ));
    addActivity(activity.lead_id, activity);
  }, [addActivity]);

  const handleNoteAdded = useCallback((_leadId: string, _note: string, activity: CrmActivity) => {
    addActivity(activity.lead_id, activity);
    setLeads(prev => prev.map(l => l.id === activity.lead_id ? { ...l, notes_count: (l.notes_count || 0) + 1 } : l));
  }, [addActivity]);

  const handleMarkFollowupDone = useCallback((followupId: string) => {
    setFollowups(prev => prev.map(f =>
      f.id === followupId ? { ...f, status: 'done', completed_at: new Date().toISOString() } : f
    ));
    const fu = followups.find(f => f.id === followupId);
    if (fu) {
      setLeads(prev => prev.map(l => l.id === fu.lead_id ? { ...l, open_followups_count: Math.max(0, (l.open_followups_count || 1) - 1) } : l));
    }
  }, [followups]);

  const handleAddLead = useCallback((stageId?: string) => {
    const lead = makeNewLead();
    if (stageId) lead.stage_id = stageId as LeadStageId;
    setLeads(prev => [lead, ...prev]);
    setSelectedLeadId(lead.id);
    setActivities(prev => ({
      ...prev,
      [lead.id]: [{
        id: `act-${Date.now()}`,
        lead_id: lead.id,
        organization_id: 'org-1',
        type: 'lead_created',
        performed_by_id: 'u-1',
        performed_by_name: 'Alex Vance',
        performed_at: new Date().toISOString(),
      }],
    }));
  }, []);

  const handleImportComplete = useCallback((importedLeads: Partial<CrmLead>[]) => {
    const valid = importedLeads.filter(l => !!l.name) as CrmLead[];
    setLeads(prev => [...valid, ...prev]);
    valid.forEach(l => {
      addActivity(l.id, {
        id: `act-import-${l.id}`,
        lead_id: l.id,
        organization_id: 'org-1',
        type: 'import_created',
        performed_by_id: 'u-1',
        performed_by_name: 'Alex Vance',
        performed_at: new Date().toISOString(),
      });
    });
  }, [addActivity]);

  // ── Lead detail page ───────────────────────────────────────────────────────
  if (selectedLead) {
    return (
      <LeadDetailPage
        lead={selectedLead}
        activities={selectedActivities}
        calls={calls}
        followups={followupsMap}
        onBack={() => setSelectedLeadId(null)}
        onUpdate={handleLeadUpdate}
        onRemove={handleLeadRemove}
        onCallLogged={handleCallLogged}
        onFollowupCreated={handleFollowupCreated}
        onNoteAdded={handleNoteAdded}
      />
    );
  }

  // ── Main module layout ─────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full min-h-0">
      {/* ── Module Header ──────────────────────────────────────────────────── */}
      <div className="shrink-0 px-6 pt-6 pb-4 border-b border-dark-border/60 bg-dark-bg">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-5 h-5 text-[#E5A93C]" />
              <h1 className="text-xl font-bold text-slate-100 font-display">Sales Pipeline</h1>
            </div>
            <p className="text-sm text-slate-500">Track leads, manage followups, close more deals.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Upload className="w-4 h-4" />}
              onClick={() => setShowImporter(true)}
            >
              Import Leads
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => handleAddLead()}
            >
              Add Lead
            </Button>
          </div>
        </div>

        {/* Stats strip */}
        <div className="flex items-center gap-6 mb-4">
          <div className="flex items-center gap-1.5 text-sm">
            <Users className="w-4 h-4 text-slate-500" />
            <span className="font-mono font-bold text-slate-200">{openLeads.length}</span>
            <span className="text-slate-500">open leads</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <IndianRupee className="w-4 h-4 text-emerald-500" />
            <span className="font-mono font-bold text-emerald-400">{(totalPipelineValue / 100000).toFixed(1)}L</span>
            <span className="text-slate-500">pipeline value</span>
          </div>
          {overdueFollowups.length > 0 && (
            <div className="flex items-center gap-1.5 text-sm">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              <span className="font-mono font-bold text-rose-400">{overdueFollowups.length}</span>
              <span className="text-slate-500">overdue followups</span>
              <button
                className="text-2xs text-brand-400 hover:text-brand-300 underline underline-offset-2"
                onClick={() => setView('today')}
              >
                view
              </button>
            </div>
          )}
        </div>

        {/* View switcher */}
        <div className="flex items-center gap-1 p-1 bg-dark-surface rounded-xl border border-dark-border/60 w-fit">
          {([ 
            { id: 'kanban', icon: LayoutGrid, label: 'Kanban' },
            { id: 'list', icon: List, label: 'List' },
            { id: 'today', icon: Calendar, label: 'Today' },
          ] as const).map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setView(id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                view === id
                  ? 'bg-dark-card text-slate-100 shadow-sm'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
              {id === 'today' && overdueFollowups.length > 0 && (
                <span className="ml-0.5 w-4 h-4 rounded-full bg-rose-500 text-white text-2xs font-bold flex items-center justify-center">
                  {overdueFollowups.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── View Content ───────────────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 overflow-auto px-6 py-5">
        {view === 'kanban' && (
          <KanbanBoard
            stages={PIPELINE_STAGES}
            leads={leads}
            onLeadClick={(lead) => setSelectedLeadId(lead.id)}
            onLeadStageChange={handleLeadStageChange}
            onAddLeadToStage={handleAddLead}
          />
        )}

        {view === 'list' && (
          <LeadListView
            leads={leads}
            onLeadClick={(lead) => setSelectedLeadId(lead.id)}
            onLeadStageChange={handleLeadStageChange}
            onLeadAssigneeChange={handleLeadAssigneeChange}
          />
        )}

        {view === 'today' && (
          <TodayDashboard
            followups={followups}
            onLeadClick={(leadId) => setSelectedLeadId(leadId)}
            onMarkDone={handleMarkFollowupDone}
            onReschedule={() => {}} // wire FollowupModal for reschedule
          />
        )}
      </div>

      {/* Importer */}
      <BulkLeadImporterModal
        isOpen={showImporter}
        onClose={() => setShowImporter(false)}
        onImportComplete={handleImportComplete}
        organizationId="org-1"
      />
    </div>
  );
};

// Default export for App.tsx routing
export default SalesPipelineModule;
