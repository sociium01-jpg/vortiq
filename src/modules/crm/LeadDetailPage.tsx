import React, { useState, useCallback } from 'react';
import { Button, Badge, Select } from '@/design-system';
import {
  CrmLead,
  CrmActivity,
  CrmCall,
  CrmFollowup,
  LeadStageId,
  PIPELINE_STAGES,
  LEAD_SOURCES,
  SAMPLE_TEAM_MEMBERS,
} from './types';
import { ActivityTimeline } from './ActivityTimeline';
import { CallLogModal } from './CallLogModal';
import { FollowupModal } from './FollowupModal';
import { CallTranscriptPlayer } from './CallTranscriptPlayer';
import { SEED_CALL_TRANSCRIPTS } from './types';
import {
  ArrowLeft,
  Phone,
  Calendar,
  Edit3,
  Save,
  X,
  Trash2,
  Building2,
  Mail,
  PhoneCall,
  Globe,
  IndianRupee,
  User,
  FileText,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

interface LeadDetailPageProps {
  lead: CrmLead;
  activities: CrmActivity[];
  calls: Record<string, CrmCall>;
  followups: Record<string, CrmFollowup>;
  onBack: () => void;
  onUpdate: (updated: CrmLead) => void;
  onRemove: (leadId: string) => void;
  onCallLogged: (call: CrmCall, activity: CrmActivity) => void;
  onFollowupCreated: (followup: CrmFollowup, activity: CrmActivity) => void;
  onNoteAdded: (leadId: string, note: string, activity: CrmActivity) => void;
}

const CURRENT_USER = { id: 'u-1', name: 'Alex Vance' };

// ── Inline editable field ──────────────────────────────────────────────────────

function EditableField({
  label,
  value,
  icon,
  type = 'text',
  placeholder,
  onSave,
  mono = false,
}: {
  label: string;
  value: string | number | undefined;
  icon?: React.ReactNode;
  type?: 'text' | 'email' | 'tel' | 'number' | 'textarea';
  placeholder?: string;
  onSave: (val: string) => void;
  mono?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value ?? ''));

  const handleSave = () => {
    if (draft !== String(value ?? '')) onSave(draft);
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && type !== 'textarea') handleSave();
    if (e.key === 'Escape') { setDraft(String(value ?? '')); setEditing(false); }
  };

  return (
    <div className="group">
      <div className="flex items-center gap-1.5 mb-1">
        {icon && <span className="text-slate-500">{icon}</span>}
        <span className="text-2xs font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
      </div>

      {editing ? (
        <div className="flex items-start gap-2">
          {type === 'textarea' ? (
            <textarea
              autoFocus
              rows={3}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-dark-surface border border-brand-500/60 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none resize-none"
            />
          ) : (
            <input
              autoFocus
              type={type}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              className={`flex-1 bg-dark-surface border border-brand-500/60 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none ${mono ? 'font-mono' : ''}`}
              placeholder={placeholder}
            />
          )}
          <div className="flex gap-1 mt-0.5">
            <button
              onClick={handleSave}
              className="p-1.5 rounded-lg bg-brand-500/20 text-brand-400 hover:bg-brand-500/30 transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => { setDraft(String(value ?? '')); setEditing(false); }}
              className="p-1.5 rounded-lg bg-dark-surface text-slate-500 hover:text-slate-300 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <div
          className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-transparent hover:border-dark-border/80 hover:bg-dark-surface/40 cursor-pointer group/field transition-all"
          onClick={() => setEditing(true)}
        >
          <span className={`text-sm flex-1 ${value ? 'text-slate-100' : 'text-slate-600 italic'} ${mono ? 'font-mono' : ''}`}>
            {value ? String(value) : placeholder ?? `Set ${label.toLowerCase()}...`}
          </span>
          <Edit3 className="w-3.5 h-3.5 text-slate-600 opacity-0 group-hover/field:opacity-100 transition-opacity shrink-0" />
        </div>
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export const LeadDetailPage: React.FC<LeadDetailPageProps> = ({
  lead,
  activities,
  calls,
  followups,
  onBack,
  onUpdate,
  onRemove,
  onCallLogged,
  onFollowupCreated,
  onNoteAdded,
}) => {
  const [showCallModal, setShowCallModal] = useState(false);
  const [showFollowupModal, setShowFollowupModal] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [noteSaved, setNoteSaved] = useState(false);

  const stage = PIPELINE_STAGES.find(s => s.id === lead.stage_id);

  // Generic field update with field correction logging
  const handleFieldSave = useCallback((field: keyof CrmLead, newVal: string) => {
    const before = String(lead[field] ?? '');
    const after = newVal;
    if (before === after) return;

    const correctionActivity: CrmActivity = {
      id: `act-${Date.now()}`,
      lead_id: lead.id,
      organization_id: lead.organization_id,
      type: 'field_correction',
      performed_by_id: CURRENT_USER.id,
      performed_by_name: CURRENT_USER.name,
      performed_at: new Date().toISOString(),
      field_name: field,
      field_before: before,
      field_after: after,
    };

    const updatedLead = { ...lead, [field]: field === 'estimated_value' ? Number(newVal) : newVal, updated_at: new Date().toISOString() };
    onUpdate(updatedLead);
    // Emit field_correction activity
    onCallLogged({ id: '', lead_id: lead.id, organization_id: lead.organization_id, logged_by_id: CURRENT_USER.id, logged_by_name: CURRENT_USER.name, call_date: '', duration_minutes: 0, outcome: 'connected', created_at: '' }, correctionActivity);
  }, [lead, onUpdate, onCallLogged]);

  const handleStageChange = (newStageId: string) => {
    const prevStage = lead.stage_id;
    if (prevStage === newStageId) return;

    const act: CrmActivity = {
      id: `act-${Date.now()}`,
      lead_id: lead.id,
      organization_id: lead.organization_id,
      type: 'stage_change',
      performed_by_id: CURRENT_USER.id,
      performed_by_name: CURRENT_USER.name,
      performed_at: new Date().toISOString(),
      stage_from: prevStage,
      stage_to: newStageId as LeadStageId,
    };
    onUpdate({ ...lead, stage_id: newStageId as LeadStageId, updated_at: new Date().toISOString() });
    onCallLogged({ id: '', lead_id: lead.id, organization_id: lead.organization_id, logged_by_id: CURRENT_USER.id, logged_by_name: CURRENT_USER.name, call_date: '', duration_minutes: 0, outcome: 'connected', created_at: '' }, act);
  };

  const handleAssigneeChange = (newAssigneeId: string) => {
    const prevAssignee = SAMPLE_TEAM_MEMBERS.find(m => m.id === lead.assignee_id);
    const newAssignee = SAMPLE_TEAM_MEMBERS.find(m => m.id === newAssigneeId);
    if (!newAssignee || lead.assignee_id === newAssigneeId) return;

    const act: CrmActivity = {
      id: `act-${Date.now()}`,
      lead_id: lead.id,
      organization_id: lead.organization_id,
      type: 'reassignment',
      performed_by_id: CURRENT_USER.id,
      performed_by_name: CURRENT_USER.name,
      performed_at: new Date().toISOString(),
      assignee_from_id: lead.assignee_id,
      assignee_from_name: prevAssignee?.name,
      assignee_to_id: newAssigneeId,
      assignee_to_name: newAssignee.name,
    };
    onUpdate({ ...lead, assignee_id: newAssigneeId, assignee_name: newAssignee.name, updated_at: new Date().toISOString() });
    onCallLogged({ id: '', lead_id: lead.id, organization_id: lead.organization_id, logged_by_id: CURRENT_USER.id, logged_by_name: CURRENT_USER.name, call_date: '', duration_minutes: 0, outcome: 'connected', created_at: '' }, act);
  };

  const handleSaveNote = () => {
    if (!noteText.trim()) return;
    const act: CrmActivity = {
      id: `act-${Date.now()}`,
      lead_id: lead.id,
      organization_id: lead.organization_id,
      type: 'note_added',
      performed_by_id: CURRENT_USER.id,
      performed_by_name: CURRENT_USER.name,
      performed_at: new Date().toISOString(),
      note: noteText.trim(),
    };
    onNoteAdded(lead.id, noteText.trim(), act);
    setNoteText('');
    setAddingNote(false);
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2000);
  };

  const handleCallLogged = (call: CrmCall) => {
    const act: CrmActivity = {
      id: `act-${Date.now()}`,
      lead_id: lead.id,
      organization_id: lead.organization_id,
      type: 'call_logged',
      performed_by_id: CURRENT_USER.id,
      performed_by_name: CURRENT_USER.name,
      performed_at: new Date().toISOString(),
      call_id: call.id,
      note: call.notes,
    };
    onCallLogged(call, act);
  };

  const handleFollowupCreated = (followup: CrmFollowup) => {
    const act: CrmActivity = {
      id: `act-${Date.now()}`,
      lead_id: lead.id,
      organization_id: lead.organization_id,
      type: 'followup_created',
      performed_by_id: CURRENT_USER.id,
      performed_by_name: CURRENT_USER.name,
      performed_at: new Date().toISOString(),
      followup_id: followup.id,
      note: followup.notes,
    };
    onFollowupCreated(followup, act);
  };

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* ── Page Header ───────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 bg-dark-bg/95 backdrop-blur-sm border-b border-dark-border/60">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between gap-4">
          {/* Left: Back + title */}
          <div className="flex items-center gap-3 min-w-0">
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<ArrowLeft className="w-4 h-4" />}
              onClick={onBack}
              className="shrink-0"
            >
              Pipeline
            </Button>
            <div className="h-5 w-px bg-dark-border/60" />
            <div className="min-w-0">
              <h1 className="text-base font-bold text-slate-100 font-display truncate">{lead.title}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge variant={stage?.badgeVariant || 'slate'} dot size="sm">{stage?.name}</Badge>
                {lead.company_name && (
                  <span className="text-2xs text-slate-500 truncate">· {lead.company_name}</span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Phone className="w-4 h-4 text-teal-400" />}
              onClick={() => setShowCallModal(true)}
            >
              Log Call
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Calendar className="w-4 h-4 text-violet-400" />}
              onClick={() => setShowFollowupModal(true)}
            >
              Add Followup
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
              leftIcon={<Trash2 className="w-4 h-4" />}
              onClick={() => setShowRemoveConfirm(true)}
            >
              Remove
            </Button>
          </div>
        </div>
      </div>

      {/* ── Two-column layout ──────────────────────────────────────── */}
      <div className="max-w-[1400px] mx-auto px-6 py-6 grid grid-cols-[1fr,480px] gap-8">

        {/* ── LEFT: Lead Fields ──────────────────────────────────── */}
        <div className="space-y-6">

          {/* Pipeline & Value card */}
          <div className="bg-dark-card border border-dark-border/60 rounded-2xl p-5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Pipeline</h3>
            <div className="grid grid-cols-2 gap-5">

              {/* Stage selector */}
              <div>
                <label className="text-2xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">Stage</label>
                <Select
                  value={lead.stage_id}
                  onChange={(e) => handleStageChange(e.target.value)}
                  options={PIPELINE_STAGES.map(s => ({ value: s.id, label: s.name }))}
                />
              </div>

              {/* Assignee */}
              <div>
                <label className="text-2xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">Assigned To</label>
                <Select
                  value={lead.assignee_id || ''}
                  onChange={(e) => handleAssigneeChange(e.target.value)}
                  options={SAMPLE_TEAM_MEMBERS.map(m => ({ value: m.id, label: m.name }))}
                />
              </div>

              {/* Deal value */}
              <div>
                <label className="text-2xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                  <span className="flex items-center gap-1"><IndianRupee className="w-3 h-3" /> Estimated Value</span>
                </label>
                <EditableField
                  label="Estimated Value"
                  value={lead.estimated_value}
                  type="number"
                  placeholder="0"
                  onSave={(v) => handleFieldSave('estimated_value', v)}
                  mono
                />
              </div>

              {/* Expected close */}
              <div>
                <label className="text-2xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">Expected Close</label>
                <EditableField
                  label="Expected Close Date"
                  value={lead.expected_close_date ? new Date(lead.expected_close_date).toLocaleDateString('en-IN') : ''}
                  placeholder="Not set"
                  onSave={(v) => handleFieldSave('expected_close_date', v)}
                />
              </div>
            </div>
          </div>

          {/* Contact Info card */}
          <div className="bg-dark-card border border-dark-border/60 rounded-2xl p-5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Contact Information</h3>
            <div className="space-y-1">
              <EditableField
                label="Contact Name"
                value={lead.contact_person}
                icon={<User className="w-3.5 h-3.5" />}
                placeholder="Full name"
                onSave={(v) => handleFieldSave('contact_person', v)}
              />
              <EditableField
                label="Company"
                value={lead.company_name}
                icon={<Building2 className="w-3.5 h-3.5" />}
                placeholder="Company name"
                onSave={(v) => handleFieldSave('company_name', v)}
              />
              <EditableField
                label="Email"
                value={lead.email}
                icon={<Mail className="w-3.5 h-3.5" />}
                type="email"
                placeholder="contact@company.com"
                onSave={(v) => handleFieldSave('email', v)}
              />
              <EditableField
                label="Phone"
                value={lead.phone}
                icon={<PhoneCall className="w-3.5 h-3.5" />}
                type="tel"
                placeholder="+91 XXXXX XXXXX"
                onSave={(v) => handleFieldSave('phone', v)}
                mono
              />

              {/* Source */}
              <div className="pt-1">
                <div className="flex items-center gap-1.5 mb-1">
                  <Globe className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-2xs font-semibold text-slate-500 uppercase tracking-wider">Lead Source</span>
                </div>
                <Select
                  value={lead.source || ''}
                  onChange={(e) => handleFieldSave('source', e.target.value)}
                  options={[{ value: '', label: '— Not set —' }, ...LEAD_SOURCES]}
                />
              </div>
            </div>
          </div>

          {/* Notes card */}
          <div className="bg-dark-card border border-dark-border/60 rounded-2xl p-5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Notes</h3>
            <EditableField
              label="Notes"
              value={lead.notes}
              icon={<FileText className="w-3.5 h-3.5" />}
              type="textarea"
              placeholder="Add notes about this lead..."
              onSave={(v) => handleFieldSave('notes', v)}
            />
          </div>

          {/* Meta */}
          <div className="flex items-center gap-4 text-2xs text-slate-600 font-mono px-1">
            <span>Created {new Date(lead.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            <span>·</span>
            <span>Updated {new Date(lead.updated_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            <span>·</span>
            <span>{lead.calls_count || 0} calls</span>
            <span>·</span>
            <span>{lead.followups_count || 0} followups</span>
          </div>
        </div>

        {/* ── RIGHT: Activity Timeline ─────────────────────────── */}
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-200 font-display">Activity Timeline</h2>
            <span className="text-2xs font-mono text-slate-500">{activities.length} events</span>
          </div>

          {/* Quick note input */}
          <div className="bg-dark-card border border-dark-border/60 rounded-2xl p-3 space-y-2">
            {addingNote ? (
              <>
                <textarea
                  autoFocus
                  rows={2}
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Add a note to this lead's timeline..."
                  className="w-full bg-dark-bg border border-dark-border rounded-xl px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-brand-500/60 resize-none transition-colors"
                  onKeyDown={(e) => { if (e.key === 'Escape') setAddingNote(false); }}
                />
                <div className="flex gap-2 justify-end">
                  <Button variant="ghost" size="sm" onClick={() => { setNoteText(''); setAddingNote(false); }}>Cancel</Button>
                  <Button variant="primary" size="sm" onClick={handleSaveNote} disabled={!noteText.trim()}>
                    Add Note
                  </Button>
                </div>
              </>
            ) : (
              <button
                onClick={() => setAddingNote(true)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-500 hover:text-slate-300 rounded-xl hover:bg-dark-surface/40 transition-all text-left"
              >
                {noteSaved ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Edit3 className="w-4 h-4" />
                )}
                {noteSaved ? 'Note saved!' : 'Add a note to this timeline...'}
              </button>
            )}
          </div>

          {/* Call Transcript AI Analysis */}
          <CallTranscriptPlayer transcript={SEED_CALL_TRANSCRIPTS[0]} />

          {/* Timeline */}
          <ActivityTimeline
            activities={activities}
            calls={calls}
            followups={followups}
          />
        </div>
      </div>

      {/* ── Remove Confirm ──────────────────────────────────────── */}
      {showRemoveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-dark-card border border-rose-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100">Remove Lead</h3>
                <p className="text-2xs text-slate-500">This action will notify Owner & Admin</p>
              </div>
            </div>
            <p className="text-sm text-slate-300 mb-1">
              Remove <strong className="text-slate-100">{lead.title}</strong>?
            </p>
            <p className="text-2xs text-slate-500 mb-5">
              Alex Vance, Priya Sharma will receive an in-app notification: what was removed, by whom, and when.
            </p>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" size="sm" onClick={() => setShowRemoveConfirm(false)}>Cancel</Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                leftIcon={<Trash2 className="w-4 h-4" />}
                onClick={() => { onRemove(lead.id); setShowRemoveConfirm(false); }}
              >
                Remove Lead
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <CallLogModal
        isOpen={showCallModal}
        onClose={() => setShowCallModal(false)}
        leadId={lead.id}
        leadTitle={lead.title}
        currentUserId={CURRENT_USER.id}
        currentUserName={CURRENT_USER.name}
        onSave={handleCallLogged}
      />
      <FollowupModal
        isOpen={showFollowupModal}
        onClose={() => setShowFollowupModal(false)}
        leadId={lead.id}
        leadTitle={lead.title}
        currentUserId={CURRENT_USER.id}
        currentUserName={CURRENT_USER.name}
        onSave={handleFollowupCreated}
      />
    </div>
  );
};
