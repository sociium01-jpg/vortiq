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
  | 'import_created'
  | 'sequence_enrolled'
  | 'workflow_triggered'
  | 'score_updated'
  | 'transcript_added';

// ── Stage-Gating Blueprint Types ─────────────────────────────
export interface StageRequirement {
  id: string;
  from_stage: LeadStageId;
  to_stage: LeadStageId;
  required_fields: (keyof CrmLead)[];
  required_custom_field_keys?: string[];
  checklist_items: string[];
  win_probability_percent: number;
}

// ── Workflow Rules Engine Types ──────────────────────────────
export type WorkflowTriggerType = 'lead_created' | 'stage_changed' | 'value_threshold' | 'lead_assigned' | 'inactive_days';

export interface WorkflowAction {
  type: 'update_field' | 'create_task' | 'send_notification' | 'trigger_webhook' | 'enroll_sequence';
  target_field?: string;
  field_value?: any;
  task_title?: string;
  notification_message?: string;
  webhook_url?: string;
  sequence_id?: string;
}

export interface WorkflowRule {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  trigger_type: WorkflowTriggerType;
  trigger_conditions: {
    stage?: LeadStageId;
    min_value?: number;
    source?: LeadSource;
  };
  actions: WorkflowAction[];
  is_active: boolean;
  created_at: string;
}

// ── Sequence Cadence Types ────────────────────────────────────
export interface SequenceStep {
  step_number: number;
  day_offset: number;
  type: 'email' | 'call_task' | 'whatsapp' | 'manual_task';
  subject?: string;
  body_template: string;
}

export interface OutreachSequence {
  id: string;
  organization_id: string;
  name: string;
  description: string;
  steps: SequenceStep[];
  auto_pause_on_reply: boolean;
  auto_pause_on_stage_change: boolean;
  enrolled_count: number;
  created_at: string;
}

export interface SequenceEnrollment {
  id: string;
  sequence_id: string;
  lead_id: string;
  current_step: number;
  status: 'active' | 'paused' | 'completed' | 'unsubscribed';
  next_step_due_at: string;
  enrolled_at: string;
}

// ── Lead Scoring Types ────────────────────────────────────────
export type ScoreCategory = 'behavioral' | 'demographic' | 'deal_size' | 'inactivity';

export interface LeadScoreRule {
  id: string;
  rule_name: string;
  category: ScoreCategory;
  condition_field: keyof CrmLead | 'email_opened' | 'meeting_attended';
  operator: 'equals' | 'greater_than' | 'contains' | 'is_true';
  expected_value: any;
  points_delta: number;
  is_active?: boolean;
}

// ── Call Transcript Types ─────────────────────────────────────
export interface CallTranscript {
  id: string;
  lead_id: string;
  audio_url?: string;
  duration_seconds: number;
  speaker_name: string;
  transcript_text: string;
  summary: string;
  sentiment: 'positive' | 'neutral' | 'hesitant' | 'negative';
  action_items: string[];
  created_at: string;
}

// ── Scheduling & Macros & Custom Fields Types ─────────────────
export interface SchedulingLink {
  id: string;
  slug: string;
  title: string;
  duration_minutes: number;
  available_days: string[];
  booking_url: string;
}

export interface CannedResponse {
  id: string;
  shortcut: string; // e.g. /pricing, /proposal
  title: string;
  body: string;
  category: string;
}

export interface CustomFieldDefinition {
  id: string;
  field_key: string;
  label: string;
  field_type: 'text' | 'number' | 'select' | 'date' | 'checkbox';
  options?: string[];
  is_required: boolean;
}

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
  stage?: LeadStageId;
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

// ── Extended Seed Datasets ────────────────────────────────────

export const SEED_STAGE_REQUIREMENTS: StageRequirement[] = [
  {
    id: 'req-new-contacted',
    from_stage: 'new',
    to_stage: 'contacted',
    required_fields: ['phone', 'email'],
    checklist_items: ['Log initial contact attempt', 'Verify contact person designation'],
    win_probability_percent: 20,
  },
  {
    id: 'req-contacted-qualified',
    from_stage: 'contacted',
    to_stage: 'qualified',
    required_fields: ['company_name', 'estimated_value'],
    checklist_items: ['Identify decision maker', 'Define budget allocation', 'Confirm timeline'],
    win_probability_percent: 50,
  },
  {
    id: 'req-qualified-won',
    from_stage: 'qualified',
    to_stage: 'won',
    required_fields: ['company_name', 'estimated_value', 'email'],
    checklist_items: ['MSA signed by legal', 'Payment terms finalized (GST invoice ready)'],
    win_probability_percent: 100,
  },
];

export const SEED_WORKFLOW_RULES: WorkflowRule[] = [
  {
    id: 'wf-001',
    organization_id: 'tenant-prod-001',
    name: 'High Value Lead Alert (> ₹2,00,000)',
    description: 'Triggers notification to Owner/Admin and creates urgent follow-up when deal value exceeds ₹2L.',
    trigger_type: 'value_threshold',
    trigger_conditions: { min_value: 200000 },
    actions: [
      { type: 'send_notification', notification_message: 'High Value Lead Created: Requires executive review' },
      { type: 'create_task', task_title: 'Executive Consultation & Proposal Preparation' },
    ],
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'wf-002',
    organization_id: 'tenant-prod-001',
    name: 'Auto-Enroll Qualified Leads in Enterprise Sequence',
    description: 'Automatically enrolls deals advancing to Qualified stage into outreach cadence.',
    trigger_type: 'stage_changed',
    trigger_conditions: { stage: 'qualified' },
    actions: [{ type: 'enroll_sequence', sequence_id: 'seq-001' }],
    is_active: true,
    created_at: new Date().toISOString(),
  },
];

export const SEED_SEQUENCES: OutreachSequence[] = [
  {
    id: 'seq-001',
    organization_id: 'tenant-prod-001',
    name: 'Enterprise Executive Outreach Cadence',
    description: '4-step high-touch cadence for qualified B2B SME leads.',
    auto_pause_on_reply: true,
    auto_pause_on_stage_change: true,
    enrolled_count: 4,
    created_at: new Date().toISOString(),
    steps: [
      { step_number: 1, day_offset: 0, type: 'email', subject: 'Vortiq Introduction & SME Architecture Overview', body_template: 'Namaste {{name}}, Introduction to Vortiq unified SaaS...' },
      { step_number: 2, day_offset: 2, type: 'call_task', body_template: 'Call {{phone}} to discuss ERP integration requirements.' },
      { step_number: 3, day_offset: 4, type: 'whatsapp', body_template: 'Hi {{name}}, sharing customer case study for {{company_name}}.' },
      { step_number: 4, day_offset: 7, type: 'manual_task', body_template: 'Prepare customized proposal PDF.' },
    ],
  },
];

export const SEED_LEAD_SCORE_RULES: LeadScoreRule[] = [
  { id: 'score-1', rule_name: 'Deal Value > ₹3,00,000', category: 'deal_size', condition_field: 'estimated_value', operator: 'greater_than', expected_value: 300000, points_delta: 30 },
  { id: 'score-2', rule_name: 'Source is Referral / Inbound', category: 'demographic', condition_field: 'source', operator: 'equals', expected_value: 'referral', points_delta: 20 },
  { id: 'score-3', rule_name: 'Email Opened', category: 'behavioral', condition_field: 'email_opened', operator: 'is_true', expected_value: true, points_delta: 15 },
  { id: 'score-4', rule_name: 'Priority is Urgent', category: 'demographic', condition_field: 'priority', operator: 'equals', expected_value: 'urgent', points_delta: 15 },
];

export const SEED_CALL_TRANSCRIPTS: CallTranscript[] = [
  {
    id: 'tr-001',
    lead_id: 'lead-001',
    audio_url: 'https://actions.google.com/sounds/v1/ambiences/office_talking.ogg',
    duration_seconds: 245,
    speaker_name: 'Alex Vance (Sales VP) & Priya Mehra (CFO)',
    transcript_text: 'Alex: Namaste Priya ji, thanks for joining. We discussed unifying your CRM and GST invoicing in Vortiq.\nPriya: Thanks Alex. Our primary pain point is GST Form 26Q compliance and TDS calculations on services.\nAlex: Absolutely. Vortiq automates CGST/SGST vs IGST tax split and section 194J TDS deductions automatically.\nPriya: Excellent. What is the onboarding timeline?\nAlex: We can go live in under 48 hours with complete clean slate migration.',
    summary: 'Prospect (CFO Priya Mehra) confirmed budget approved. Key evaluation criteria: GST Form 26Q TDS automation. Target go-live: 48 hours.',
    sentiment: 'positive',
    action_items: ['Send GST feature breakdown PDF', 'Prepare MSA for signature by Friday', 'Schedule technical onboarding session'],
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
];

export const SEED_CANNED_RESPONSES: CannedResponse[] = [
  { id: 'can-1', shortcut: '/pricing', title: 'Enterprise Plan Pricing Summary', body: 'Our Enterprise Plan includes unlimited users, GST/TDS billing, HR payroll, and dedicated Cloud Run tenant isolation at ₹4,999/month.', category: 'Pricing' },
  { id: 'can-2', shortcut: '/gst_demo', title: 'GST & Form 26Q Demo Link', body: 'You can inspect our live GST invoicing and Form 26Q TDS ledger walkthrough here: https://vortiq.biz/docs/gst-demo', category: 'Product' },
  { id: 'can-3', shortcut: '/proposal_followup', title: 'Proposal Follow-up Email', body: 'Hi {{name}}, following up on the proposal sent for {{company_name}}. Please let me know if you have any questions on the SLA or contract terms.', category: 'Outreach' },
];

export const SEED_SCHEDULING_LINKS: SchedulingLink[] = [
  { id: 'sched-1', slug: 'alex-vance-30min', title: 'Alex Vance — 30 Min Discovery & Demo', duration_minutes: 30, available_days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], booking_url: 'https://vortiq.biz/book/alex-vance-30min' },
];

export const SEED_CUSTOM_FIELDS: CustomFieldDefinition[] = [
  { id: 'cf-1', field_key: 'gstin_number', label: 'Customer GSTIN', field_type: 'text', is_required: false },
  { id: 'cf-2', field_key: 'contract_tenure_months', label: 'Contract Tenure (Months)', field_type: 'number', is_required: false },
];

// Helper: Calculate dynamic Lead Score based on rules
export function calculateLeadScore(lead: CrmLead, rules: LeadScoreRule[] = SEED_LEAD_SCORE_RULES): number {
  let score = 20; // Base score
  rules.forEach((rule) => {
    if (!rule.is_active) return;
    if (rule.condition_field in lead) {
      const val = (lead as any)[rule.condition_field];
      if (rule.operator === 'equals' && val === rule.expected_value) score += rule.points_delta;
      if (rule.operator === 'greater_than' && typeof val === 'number' && val > rule.expected_value) score += rule.points_delta;
    }
  });
  return Math.max(0, score);
}

