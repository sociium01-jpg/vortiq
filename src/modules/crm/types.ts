import { Lead as BaseLead } from '@/types';

export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Won' | 'Lost';

export interface CrmLead extends Omit<BaseLead, 'status'> {
  name: string;
  company?: string;
  phone?: string;
  email?: string;
  source?: string;
  stage: LeadStatus;
  assignee?: string;
  assignee_id?: string;
  assigned_to_name?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  notes_count?: number;
  notes?: string;
}

export interface CrmPipelineStage {
  id: string;
  tenant_id: string;
  name: LeadStatus;
  sort_order: number;
  color: string;
  badgeVariant?: 'emerald' | 'amber' | 'rose' | 'blue' | 'slate' | 'violet';
}

export interface CrmActivity {
  id: string;
  tenant_id: string;
  lead_id: string;
  created_by?: string;
  activity_type: 'call' | 'meeting' | 'email' | 'note' | 'stage_change' | 'reassignment' | 'field_correction';
  content: string;
  voice_note_url?: string;
  call_duration_seconds?: number;
  scheduled_at?: string;
  completed?: boolean;
  created_at: string;
}
