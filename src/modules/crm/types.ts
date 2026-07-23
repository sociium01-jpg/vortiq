// ─────────────────────────────────────────────────────────────
// Vortiq Sales Pipeline — Comprehensive Type Definitions
// All entities are multi-tenant scoped by organization_id
// ─────────────────────────────────────────────────────────────

// ── Enums / Unions ────────────────────────────────────────────

export type LeadStageId = 'new' | 'contacted' | 'qualified' | 'won' | 'lost';
export type LeadPriority = 'low' | 'medium' | 'high' | 'urgent';
export type LeadSource =
  | 'website'
  | 'referral'
  | 'cold_outreach'
  | 'inbound_call'
  | 'social_media'
  | 'trade_show'
  | 'partner'
  | 'other';

export type CallOutcome =
  | 'connected'
  | 'no_answer'
  | 'voicemail'
  | 'meeting_booked'
  | 'not_interested'
  | 'follow_up_required';

export type FollowupType = 'call_back' | 'send_proposal' | 'demo' | 'check_in' | 'other';
export type FollowupStatus = 'pending' | 'done' | 'skipped' | 'rescheduled';

export type ActivityType =
  | 'stage_change'
  | 'reassignment'
  | 'call_logged'
  | 'followup_created'
  | 'followup_done'
  | 'note_added'
  | 'field_correction'
  | 'lead_created'
  | 'import_created';

// ── Core Entities ─────────────────────────────────────────────

export interface CrmPipelineStage {
  id: LeadStageId;
  name: string;
  sort_order: number;
  color: string;
  badgeVariant: 'blue' | 'amber' | 'violet' | 'emerald' | 'rose' | 'slate';
  is_terminal?: boolean;
}

export interface CrmLead {
  id: string;
  organization_id: string;

  // Core fields
  title: string;           // display name for the lead
  name: string;            // contact person's name
  company_name?: string;
  contact_person: string;
  phone?: string;
  email?: string;
  source?: LeadSource;
  notes?: string;

  // Pipeline
  stage_id: LeadStageId;
  priority?: LeadPriority;
  estimated_value: number;
  currency: 'INR';
  expected_close_date?: string;

  // Assignment
  assignee_id?: string;
  assignee_name?: string;
  assignee_email?: string;

  // Meta counters (denormalized for card display)
  notes_count?: number;
  calls_count?: number;
  followups_count?: number;
  open_followups_count?: number;

  // Timestamps
  created_at: string;
  updated_at: string;
  created_by?: string;
}

// ── Activity Feed ──────────────────────────────────────────────

export interface CrmActivity {
  id: string;
  lead_id: string;
  organization_id: string;

  type: ActivityType;
  performed_by_id: string;
  performed_by_name: string;
  performed_at: string;

  // Type-specific payload (union discriminated by `type`)
  stage_from?: LeadStageId;
  stage_to?: LeadStageId;

  assignee_from_id?: string;
  assignee_from_name?: string;
  assignee_to_id?: string;
  assignee_to_name?: string;

  call_id?: string;
  followup_id?: string;

  // Field correction
  field_name?: string;
  field_before?: string;
  field_after?: string;

  note?: string;
}

// ── Call Log ───────────────────────────────────────────────────

export interface CrmCall {
  id: string;
  lead_id: string;
  organization_id: string;

  logged_by_id: string;
  logged_by_name: string;

  call_date: string;           // ISO
  duration_minutes: number;
  outcome: CallOutcome;
  notes?: string;

  // Voice note (placeholder — no transcription)
  voice_note_filename?: string;
  voice_note_url?: string;

  created_at: string;
}

// ── Followup ───────────────────────────────────────────────────

export interface CrmFollowup {
  id: string;
  lead_id: string;
  lead_title: string;
  organization_id: string;

  type: FollowupType;
  due_date: string;            // ISO date
  assignee_id?: string;
  assignee_name?: string;
  status: FollowupStatus;
  notes?: string;

  created_by_id: string;
  created_by_name: string;
  created_at: string;
  completed_at?: string;
}

// ── Reassignment Log ───────────────────────────────────────────

export interface ReassignmentLog {
  id: string;
  lead_id: string;
  organization_id: string;

  from_assignee_id?: string;
  from_assignee_name?: string;
  to_assignee_id: string;
  to_assignee_name: string;

  changed_by_id: string;
  changed_by_name: string;
  changed_at: string;
}

// ── Bulk Import ────────────────────────────────────────────────

export type SystemField =
  | 'name'
  | 'company_name'
  | 'phone'
  | 'email'
  | 'source'
  | 'stage_id'
  | 'assignee_name'
  | 'notes'
  | 'estimated_value'
  | 'skip';

export interface ImportedRow {
  _rowIndex: number;
  _valid: boolean;
  _errors: string[];
  _skipped: boolean;
  [key: string]: any;
}

export interface ImportFieldMapping {
  csvColumn: string;
  systemField: SystemField;
}

// ── Filters ───────────────────────────────────────────────────

export interface LeadFilters {
  search: string;
  stage_id: LeadStageId | 'all';
  assignee_id: string | 'all';
  source: LeadSource | 'all';
  date_from: string;
  date_to: string;
  priority: LeadPriority | 'all';
}

// ── Team Member (for assignment dropdowns) ────────────────────

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  role: 'OWNER' | 'ADMIN' | 'MANAGER' | 'MEMBER';
}

// ── Constants ─────────────────────────────────────────────────

export const PIPELINE_STAGES: CrmPipelineStage[] = [
  { id: 'new', name: 'New', sort_order: 0, color: '#3b82f6', badgeVariant: 'blue' },
  { id: 'contacted', name: 'Contacted', sort_order: 1, color: '#f59e0b', badgeVariant: 'amber' },
  { id: 'qualified', name: 'Qualified', sort_order: 2, color: '#8b5cf6', badgeVariant: 'violet' },
  { id: 'won', name: 'Won', sort_order: 3, color: '#10b981', badgeVariant: 'emerald', is_terminal: true },
  { id: 'lost', name: 'Lost', sort_order: 4, color: '#ef4444', badgeVariant: 'rose', is_terminal: true },
];

export const LEAD_SOURCES: { value: LeadSource; label: string }[] = [
  { value: 'website', label: 'Website' },
  { value: 'referral', label: 'Referral' },
  { value: 'cold_outreach', label: 'Cold Outreach' },
  { value: 'inbound_call', label: 'Inbound Call' },
  { value: 'social_media', label: 'Social Media' },
  { value: 'trade_show', label: 'Trade Show' },
  { value: 'partner', label: 'Partner' },
  { value: 'other', label: 'Other' },
];

export const CALL_OUTCOMES: { value: CallOutcome; label: string }[] = [
  { value: 'connected', label: 'Connected & Spoke' },
  { value: 'no_answer', label: 'No Answer' },
  { value: 'voicemail', label: 'Left Voicemail' },
  { value: 'meeting_booked', label: 'Meeting Booked ✓' },
  { value: 'not_interested', label: 'Not Interested' },
  { value: 'follow_up_required', label: 'Follow-up Required' },
];

export const FOLLOWUP_TYPES: { value: FollowupType; label: string }[] = [
  { value: 'call_back', label: 'Call Back' },
  { value: 'send_proposal', label: 'Send Proposal' },
  { value: 'demo', label: 'Schedule Demo' },
  { value: 'check_in', label: 'Check In' },
  { value: 'other', label: 'Other' },
];

export const SYSTEM_FIELDS: { value: SystemField; label: string; required?: boolean }[] = [
  { value: 'name', label: 'Contact Name', required: true },
  { value: 'company_name', label: 'Company' },
  { value: 'phone', label: 'Phone' },
  { value: 'email', label: 'Email' },
  { value: 'source', label: 'Lead Source' },
  { value: 'stage_id', label: 'Pipeline Stage' },
  { value: 'assignee_name', label: 'Assigned To' },
  { value: 'notes', label: 'Notes' },
  { value: 'estimated_value', label: 'Estimated Value (₹)' },
  { value: 'skip', label: '— Skip this column —' },
];

// ── Sample Data ───────────────────────────────────────────────

export const SAMPLE_TEAM_MEMBERS: TeamMember[] = [
  { id: 'u-1', name: 'Alex Vance', email: 'alex@acmeops.com', role: 'OWNER' },
  { id: 'u-2', name: 'Priya Sharma', email: 'priya@acmeops.com', role: 'ADMIN' },
  { id: 'u-3', name: 'Rajesh Kumar', email: 'rajesh@acmeops.com', role: 'MANAGER' },
  { id: 'u-4', name: 'Sneha Patel', email: 'sneha@acmeops.com', role: 'MEMBER' },
];

export const SEED_LEADS: CrmLead[] = [
  {
    id: 'lead-001',
    organization_id: 'org-1',
    title: 'Fintech Corp Enterprise Deal',
    name: 'Priya Mehra',
    company_name: 'Fintech Corp India',
    contact_person: 'Priya Mehra',
    email: 'priya.mehra@fintechcorp.in',
    phone: '+91 98200 12345',
    source: 'website',
    notes: 'Interested in full Enterprise plan for 50+ users. Decision by Q3.',
    stage_id: 'qualified',
    priority: 'high',
    estimated_value: 450000,
    currency: 'INR',
    expected_close_date: new Date(Date.now() + 30 * 86400000).toISOString(),
    assignee_id: 'u-1',
    assignee_name: 'Alex Vance',
    notes_count: 3,
    calls_count: 2,
    followups_count: 1,
    open_followups_count: 1,
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    created_by: 'u-1',
  },
  {
    id: 'lead-002',
    organization_id: 'org-1',
    title: 'Rajesh Traders — Inventory Module',
    name: 'Rajesh Agarwal',
    company_name: 'Rajesh Traders Pvt Ltd',
    contact_person: 'Rajesh Agarwal',
    email: 'rajesh@rajeshtraders.com',
    phone: '+91 99887 66554',
    source: 'referral',
    notes: 'Needs custom warehouse inventory integration. Evaluating 2 vendors.',
    stage_id: 'contacted',
    priority: 'urgent',
    estimated_value: 1200000,
    currency: 'INR',
    assignee_id: 'u-2',
    assignee_name: 'Priya Sharma',
    notes_count: 5,
    calls_count: 3,
    followups_count: 2,
    open_followups_count: 2,
    created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    created_by: 'u-2',
  },
  {
    id: 'lead-003',
    organization_id: 'org-1',
    title: 'Patel Logistics SME Plan',
    name: 'Deepak Patel',
    company_name: 'Patel Logistics Pvt Ltd',
    contact_person: 'Deepak Patel',
    email: 'deepak@patellogistics.com',
    phone: '+91 98111 22233',
    source: 'cold_outreach',
    notes: 'Demo scheduled for next week. Strong buying signals.',
    stage_id: 'new',
    priority: 'medium',
    estimated_value: 85000,
    currency: 'INR',
    assignee_id: 'u-3',
    assignee_name: 'Rajesh Kumar',
    notes_count: 1,
    calls_count: 1,
    followups_count: 1,
    open_followups_count: 1,
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    created_by: 'u-3',
  },
  {
    id: 'lead-004',
    organization_id: 'org-1',
    title: 'SunTech Manufacturing — Won',
    name: 'Sunil Krishnamurthy',
    company_name: 'SunTech Manufacturing',
    contact_person: 'Sunil Krishnamurthy',
    email: 'sunil@suntech.co.in',
    phone: '+91 80012 34567',
    source: 'inbound_call',
    stage_id: 'won',
    priority: 'high',
    estimated_value: 320000,
    currency: 'INR',
    assignee_id: 'u-1',
    assignee_name: 'Alex Vance',
    notes_count: 4,
    calls_count: 6,
    followups_count: 3,
    open_followups_count: 0,
    created_at: new Date(Date.now() - 45 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    created_by: 'u-1',
  },
  {
    id: 'lead-005',
    organization_id: 'org-1',
    title: 'Mehta Textiles Budget Renewal',
    name: 'Anita Mehta',
    company_name: 'Mehta Textiles Ltd',
    contact_person: 'Anita Mehta',
    email: 'anita@mehtatextiles.in',
    phone: '+91 77001 99887',
    source: 'partner',
    stage_id: 'new',
    priority: 'low',
    estimated_value: 45000,
    currency: 'INR',
    assignee_id: 'u-4',
    assignee_name: 'Sneha Patel',
    notes_count: 0,
    calls_count: 0,
    followups_count: 0,
    open_followups_count: 0,
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    created_by: 'u-2',
  },
];

export const SEED_ACTIVITIES: Record<string, CrmActivity[]> = {
  'lead-001': [
    {
      id: 'act-001-1',
      lead_id: 'lead-001',
      organization_id: 'org-1',
      type: 'lead_created',
      performed_by_id: 'u-1',
      performed_by_name: 'Alex Vance',
      performed_at: new Date(Date.now() - 7 * 86400000).toISOString(),
      note: 'Lead created from website contact form submission.',
    },
    {
      id: 'act-001-2',
      lead_id: 'lead-001',
      organization_id: 'org-1',
      type: 'stage_change',
      performed_by_id: 'u-1',
      performed_by_name: 'Alex Vance',
      performed_at: new Date(Date.now() - 6 * 86400000).toISOString(),
      stage_from: 'new',
      stage_to: 'contacted',
    },
    {
      id: 'act-001-3',
      lead_id: 'lead-001',
      organization_id: 'org-1',
      type: 'call_logged',
      performed_by_id: 'u-1',
      performed_by_name: 'Alex Vance',
      performed_at: new Date(Date.now() - 6 * 86400000).toISOString(),
      call_id: 'call-001',
      note: 'Initial discovery call. Connected and spoke. Decision maker is Priya Mehra (CFO). Very interested in the Enterprise plan.',
    },
    {
      id: 'act-001-4',
      lead_id: 'lead-001',
      organization_id: 'org-1',
      type: 'stage_change',
      performed_by_id: 'u-1',
      performed_by_name: 'Alex Vance',
      performed_at: new Date(Date.now() - 4 * 86400000).toISOString(),
      stage_from: 'contacted',
      stage_to: 'qualified',
    },
    {
      id: 'act-001-5',
      lead_id: 'lead-001',
      organization_id: 'org-1',
      type: 'field_correction',
      performed_by_id: 'u-2',
      performed_by_name: 'Priya Sharma',
      performed_at: new Date(Date.now() - 3 * 86400000).toISOString(),
      field_name: 'estimated_value',
      field_before: '350000',
      field_after: '450000',
      note: 'Updated deal value after second call — they need additional modules.',
    },
    {
      id: 'act-001-6',
      lead_id: 'lead-001',
      organization_id: 'org-1',
      type: 'followup_created',
      performed_by_id: 'u-1',
      performed_by_name: 'Alex Vance',
      performed_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      followup_id: 'fu-001',
      note: 'Send proposal PDF by Friday. Demo call to follow.',
    },
    {
      id: 'act-001-7',
      lead_id: 'lead-001',
      organization_id: 'org-1',
      type: 'note_added',
      performed_by_id: 'u-1',
      performed_by_name: 'Alex Vance',
      performed_at: new Date(Date.now() - 1 * 86400000).toISOString(),
      note: 'Priya confirmed budget approved internally. Waiting for legal sign-off on MSA.',
    },
  ],
  'lead-002': [
    {
      id: 'act-002-1',
      lead_id: 'lead-002',
      organization_id: 'org-1',
      type: 'lead_created',
      performed_by_id: 'u-2',
      performed_by_name: 'Priya Sharma',
      performed_at: new Date(Date.now() - 14 * 86400000).toISOString(),
      note: 'Inbound referral from existing customer SunTech.',
    },
    {
      id: 'act-002-2',
      lead_id: 'lead-002',
      organization_id: 'org-1',
      type: 'reassignment',
      performed_by_id: 'u-1',
      performed_by_name: 'Alex Vance',
      performed_at: new Date(Date.now() - 10 * 86400000).toISOString(),
      assignee_from_name: 'Alex Vance',
      assignee_to_name: 'Priya Sharma',
      note: 'Reassigned to Priya — she handles large enterprise accounts.',
    },
  ],
};

export const SEED_FOLLOWUPS: CrmFollowup[] = [
  {
    id: 'fu-001',
    lead_id: 'lead-001',
    lead_title: 'Fintech Corp Enterprise Deal',
    organization_id: 'org-1',
    type: 'send_proposal',
    due_date: new Date(Date.now() + 1 * 86400000).toISOString().split('T')[0],
    assignee_id: 'u-1',
    assignee_name: 'Alex Vance',
    status: 'pending',
    notes: 'Send full proposal with pricing breakdown and implementation timeline.',
    created_by_id: 'u-1',
    created_by_name: 'Alex Vance',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'fu-002',
    lead_id: 'lead-002',
    lead_title: 'Rajesh Traders — Inventory Module',
    organization_id: 'org-1',
    type: 'call_back',
    due_date: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0], // overdue
    assignee_id: 'u-2',
    assignee_name: 'Priya Sharma',
    status: 'pending',
    notes: 'Follow up on custom integration requirements. They were evaluating a competitor.',
    created_by_id: 'u-2',
    created_by_name: 'Priya Sharma',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'fu-003',
    lead_id: 'lead-003',
    lead_title: 'Patel Logistics SME Plan',
    organization_id: 'org-1',
    type: 'demo',
    due_date: new Date(Date.now()).toISOString().split('T')[0], // due today
    assignee_id: 'u-3',
    assignee_name: 'Rajesh Kumar',
    status: 'pending',
    notes: 'Product demo call scheduled for 3 PM IST.',
    created_by_id: 'u-3',
    created_by_name: 'Rajesh Kumar',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
];
