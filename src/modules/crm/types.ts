// Local CRM module types referencing global DB schema (crm_leads, crm_pipeline_stages, crm_activities)
import { Lead as GlobalLead, PipelineStage as GlobalPipelineStage, LeadStatus } from '@/types';

export type { LeadStatus };

export type ActivityType = 'call' | 'meeting' | 'note' | 'email' | 'stage_change';
export type LeadPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface CrmPipelineStage extends GlobalPipelineStage {
  badgeVariant: 'emerald' | 'amber' | 'rose' | 'blue' | 'slate' | 'violet';
}

export interface CrmLead extends GlobalLead {
  priority?: LeadPriority;
  probability?: number;
  expected_close_date?: string;
  assigned_to_name?: string;
  assigned_to_avatar?: string;
  notes_count?: number;
  last_contacted_at?: string;
}

export interface CrmActivity {
  id: string;
  tenant_id: string;
  lead_id: string;
  lead_title?: string;
  company_name?: string;
  activity_type: ActivityType;
  title: string;
  notes?: string;
  performed_by: string;
  created_at: string;
}

export interface NewLeadFormData {
  title: string;
  company_name: string;
  contact_person: string;
  email: string;
  phone: string;
  estimated_value: number;
  stage_id: string;
  priority: LeadPriority;
  assigned_to_name: string;
  probability: number;
  expected_close_date: string;
}

export interface NewActivityFormData {
  activity_type: ActivityType;
  title: string;
  notes: string;
}

export const DEFAULT_PIPELINE_STAGES: CrmPipelineStage[] = [
  {
    id: 'stage-new',
    tenant_id: 'tenant-demo',
    name: 'New',
    sort_order: 1,
    color: 'blue',
    badgeVariant: 'blue',
    created_at: new Date().toISOString(),
  },
  {
    id: 'stage-contacted',
    tenant_id: 'tenant-demo',
    name: 'Contacted',
    sort_order: 2,
    color: 'amber',
    badgeVariant: 'amber',
    created_at: new Date().toISOString(),
  },
  {
    id: 'stage-qualified',
    tenant_id: 'tenant-demo',
    name: 'Qualified',
    sort_order: 3,
    color: 'violet',
    badgeVariant: 'violet',
    created_at: new Date().toISOString(),
  },
  {
    id: 'stage-proposal',
    tenant_id: 'tenant-demo',
    name: 'Proposal',
    sort_order: 4,
    color: 'blue',
    badgeVariant: 'blue',
    created_at: new Date().toISOString(),
  },
  {
    id: 'stage-won',
    tenant_id: 'tenant-demo',
    name: 'Won',
    sort_order: 5,
    color: 'emerald',
    badgeVariant: 'emerald',
    created_at: new Date().toISOString(),
  },
  {
    id: 'stage-lost',
    tenant_id: 'tenant-demo',
    name: 'Lost',
    sort_order: 6,
    color: 'rose',
    badgeVariant: 'rose',
    created_at: new Date().toISOString(),
  },
];

export const INITIAL_MOCK_LEADS: CrmLead[] = [
  {
    id: 'lead-101',
    tenant_id: 'tenant-demo',
    title: 'Reliance Retail ERP Integration',
    company_name: 'Reliance Retail Ventures',
    contact_person: 'Rajesh Sharma',
    email: 'rajesh.sharma@relianceretail.com',
    phone: '+91 98200 12345',
    estimated_value: 1850000,
    currency: 'INR',
    stage_id: 'stage-proposal',
    assigned_to: 'user-1',
    assigned_to_name: 'Ananya Roy',
    status: 'open',
    priority: 'urgent',
    probability: 80,
    expected_close_date: '2026-08-15',
    notes_count: 5,
    last_contacted_at: '2026-07-22T10:30:00Z',
    created_at: '2026-07-01T09:00:00Z',
    updated_at: '2026-07-22T10:30:00Z',
  },
  {
    id: 'lead-102',
    tenant_id: 'tenant-demo',
    title: 'Tata Motors Fleet IoT Analytics',
    company_name: 'Tata Motors Ltd',
    contact_person: 'Vikramaditya Deshmukh',
    email: 'v.deshmukh@tatamotors.co.in',
    phone: '+91 98111 54321',
    estimated_value: 3200000,
    currency: 'INR',
    stage_id: 'stage-qualified',
    assigned_to: 'user-2',
    assigned_to_name: 'Rohan Verma',
    status: 'open',
    priority: 'high',
    probability: 60,
    expected_close_date: '2026-09-30',
    notes_count: 3,
    last_contacted_at: '2026-07-21T14:15:00Z',
    created_at: '2026-07-05T11:20:00Z',
    updated_at: '2026-07-21T14:15:00Z',
  },
  {
    id: 'lead-103',
    tenant_id: 'tenant-demo',
    title: 'Zomato Cloud Kitchen POS Sync',
    company_name: 'Zomato Media Pvt Ltd',
    contact_person: 'Priya Sundaram',
    email: 'priya.s@zomato.com',
    phone: '+91 97654 88990',
    estimated_value: 950000,
    currency: 'INR',
    stage_id: 'stage-won',
    assigned_to: 'user-1',
    assigned_to_name: 'Ananya Roy',
    status: 'won',
    priority: 'high',
    probability: 100,
    expected_close_date: '2026-07-18',
    notes_count: 8,
    last_contacted_at: '2026-07-18T16:00:00Z',
    created_at: '2026-06-20T08:45:00Z',
    updated_at: '2026-07-18T16:00:00Z',
  },
  {
    id: 'lead-104',
    tenant_id: 'tenant-demo',
    title: 'Infosys Cloud Workforce Suite',
    company_name: 'Infosys BPM',
    contact_person: 'Siddharth Nair',
    email: 'siddharth_nair@infosys.com',
    phone: '+91 99000 33221',
    estimated_value: 4500000,
    currency: 'INR',
    stage_id: 'stage-contacted',
    assigned_to: 'user-3',
    assigned_to_name: 'Kavita Menon',
    status: 'open',
    priority: 'urgent',
    probability: 40,
    expected_close_date: '2026-10-15',
    notes_count: 2,
    last_contacted_at: '2026-07-20T11:00:00Z',
    created_at: '2026-07-10T14:30:00Z',
    updated_at: '2026-07-20T11:00:00Z',
  },
  {
    id: 'lead-105',
    tenant_id: 'tenant-demo',
    title: 'Razorpay Enterprise Billing Plugin',
    company_name: 'Razorpay Software',
    contact_person: 'Amitabh Joshi',
    email: 'ajoshi@razorpay.com',
    phone: '+91 98450 77112',
    estimated_value: 1200000,
    currency: 'INR',
    stage_id: 'stage-new',
    assigned_to: 'user-2',
    assigned_to_name: 'Rohan Verma',
    status: 'open',
    priority: 'medium',
    probability: 20,
    expected_close_date: '2026-11-01',
    notes_count: 1,
    last_contacted_at: '2026-07-23T09:15:00Z',
    created_at: '2026-07-22T17:00:00Z',
    updated_at: '2026-07-23T09:15:00Z',
  },
  {
    id: 'lead-106',
    tenant_id: 'tenant-demo',
    title: 'Apollo Hospitals Telemedicine Portal',
    company_name: 'Apollo Hospitals Enterprise',
    contact_person: 'Dr. Meera Nambiar',
    email: 'meera_n@apollohospitals.com',
    phone: '+91 94440 12890',
    estimated_value: 2800000,
    currency: 'INR',
    stage_id: 'stage-won',
    assigned_to: 'user-1',
    assigned_to_name: 'Ananya Roy',
    status: 'won',
    priority: 'urgent',
    probability: 100,
    expected_close_date: '2026-07-10',
    notes_count: 6,
    last_contacted_at: '2026-07-10T15:30:00Z',
    created_at: '2026-06-01T10:00:00Z',
    updated_at: '2026-07-10T15:30:00Z',
  },
  {
    id: 'lead-107',
    tenant_id: 'tenant-demo',
    title: 'Flipkart Supply Chain Audit',
    company_name: 'Flipkart Internet Pvt Ltd',
    contact_person: 'Gaurav Kulkarni',
    email: 'gkulkarni@flipkart.com',
    phone: '+91 97110 55443',
    estimated_value: 1500000,
    currency: 'INR',
    stage_id: 'stage-lost',
    assigned_to: 'user-3',
    assigned_to_name: 'Kavita Menon',
    status: 'lost',
    priority: 'low',
    probability: 0,
    expected_close_date: '2026-07-05',
    notes_count: 4,
    last_contacted_at: '2026-07-05T12:00:00Z',
    created_at: '2026-06-15T09:30:00Z',
    updated_at: '2026-07-05T12:00:00Z',
  },
];

export const INITIAL_MOCK_ACTIVITIES: CrmActivity[] = [
  {
    id: 'act-1',
    tenant_id: 'tenant-demo',
    lead_id: 'lead-101',
    lead_title: 'Reliance Retail ERP Integration',
    company_name: 'Reliance Retail Ventures',
    activity_type: 'call',
    title: 'Discovery call with IT Director',
    notes: 'Discussed timeline for SAP connector rollout across 400 nationwide stores.',
    performed_by: 'Ananya Roy',
    created_at: '2026-07-22T10:30:00Z',
  },
  {
    id: 'act-2',
    tenant_id: 'tenant-demo',
    lead_id: 'lead-101',
    lead_title: 'Reliance Retail ERP Integration',
    company_name: 'Reliance Retail Ventures',
    activity_type: 'meeting',
    title: 'Technical proposal presentation',
    notes: 'Presented architecture deck to VP of Engineering. Received positive feedback.',
    performed_by: 'Ananya Roy',
    created_at: '2026-07-21T15:00:00Z',
  },
  {
    id: 'act-3',
    tenant_id: 'tenant-demo',
    lead_id: 'lead-102',
    lead_title: 'Tata Motors Fleet IoT Analytics',
    company_name: 'Tata Motors Ltd',
    activity_type: 'stage_change',
    title: 'Stage updated to Qualified',
    notes: 'Moved lead from Contacted to Qualified after security assessment approval.',
    performed_by: 'Rohan Verma',
    created_at: '2026-07-21T14:15:00Z',
  },
  {
    id: 'act-4',
    tenant_id: 'tenant-demo',
    lead_id: 'lead-103',
    lead_title: 'Zomato Cloud Kitchen POS Sync',
    company_name: 'Zomato Media Pvt Ltd',
    activity_type: 'stage_change',
    title: 'Contract signed - Deal Won',
    notes: 'PO received for ₹9.5 Lakhs annual recurring subscription.',
    performed_by: 'Ananya Roy',
    created_at: '2026-07-18T16:00:00Z',
  },
  {
    id: 'act-5',
    tenant_id: 'tenant-demo',
    lead_id: 'lead-104',
    lead_title: 'Infosys Cloud Workforce Suite',
    company_name: 'Infosys BPM',
    activity_type: 'email',
    title: 'RFP Response Sent',
    notes: 'Emailed comprehensive security compliance documentation and SLA matrix.',
    performed_by: 'Kavita Menon',
    created_at: '2026-07-20T11:00:00Z',
  },
  {
    id: 'act-6',
    tenant_id: 'tenant-demo',
    lead_id: 'lead-105',
    lead_title: 'Razorpay Enterprise Billing Plugin',
    company_name: 'Razorpay Software',
    activity_type: 'note',
    title: 'Initial lead qualification note',
    notes: 'Inbound lead via web form. Looking for custom webhook routing logic.',
    performed_by: 'Rohan Verma',
    created_at: '2026-07-23T09:15:00Z',
  },
];
