import { MarketingSegment, CampaignTemplate, Campaign } from '@/types';
import { CrmLead, SEED_LEADS } from '@/modules/crm/types';

export type { MarketingSegment, CampaignTemplate, Campaign };

export type MarketingChannel = 'email' | 'whatsapp' | 'sms' | 'in_app';
export type CampaignStatus = 'draft' | 'scheduled' | 'running' | 'completed' | 'paused';

export type SegmentRuleField =
  | 'stage_id'
  | 'estimated_value'
  | 'source'
  | 'priority'
  | 'company_name'
  | 'email';

export type SegmentRuleOperator =
  | 'equals'
  | 'not_equals'
  | 'greater_than'
  | 'less_than'
  | 'contains';

export interface SegmentRule {
  id: string;
  field: SegmentRuleField;
  operator: SegmentRuleOperator;
  value: string | number;
}

export interface MarketingSegmentWithRules extends MarketingSegment {
  rules: SegmentRule[];
}

export interface TemplateVariable {
  key: string;
  label: string;
  example: string;
}

export const TEMPLATE_VARIABLES: TemplateVariable[] = [
  { key: '{{contact_name}}', label: 'Contact Name', example: 'Priya Mehra' },
  { key: '{{company}}', label: 'Company Name', example: 'Fintech Corp India' },
  { key: '{{title}}', label: 'Deal Title', example: 'Enterprise Software Deal' },
  { key: '{{email}}', label: 'Email Address', example: 'priya.mehra@fintechcorp.in' },
  { key: '{{estimated_value}}', label: 'Deal Value', example: '₹4,50,000' },
  { key: '{{stage}}', label: 'CRM Stage', example: 'Qualified' },
];

// Single source of truth helper to read CRM leads without duplicating records
export const getCrmLeads = (): CrmLead[] => {
  try {
    const saved = localStorage.getItem('crm_leads');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to parse crm_leads from localStorage', e);
  }
  return SEED_LEADS;
};

// Seed Marketing Data
export const SEED_SEGMENTS: MarketingSegmentWithRules[] = [
  {
    id: 'seg-1',
    tenant_id: 'tenant-1',
    name: 'High Value Qualified Leads',
    description: 'CRM leads in Qualified stage with estimated deal value > ₹1,00,000',
    filter_rules: {
      field: 'stage_id',
      operator: 'equals',
      value: 'qualified',
    },
    rules: [
      { id: 'r-1', field: 'stage_id', operator: 'equals', value: 'qualified' },
      { id: 'r-2', field: 'estimated_value', operator: 'greater_than', value: 100000 },
    ],
    member_count: 2,
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'seg-2',
    tenant_id: 'tenant-1',
    name: 'Website Inbound Leads',
    description: 'All CRM leads captured through Website form',
    filter_rules: {
      field: 'source',
      operator: 'equals',
      value: 'website',
    },
    rules: [
      { id: 'r-3', field: 'source', operator: 'equals', value: 'website' },
    ],
    member_count: 3,
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'seg-3',
    tenant_id: 'tenant-1',
    name: 'Urgent Priority Prospects',
    description: 'Leads flagged with Urgent priority across all pipeline stages',
    filter_rules: {
      field: 'priority',
      operator: 'equals',
      value: 'urgent',
    },
    rules: [
      { id: 'r-4', field: 'priority', operator: 'equals', value: 'urgent' },
    ],
    member_count: 2,
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const SEED_TEMPLATES: CampaignTemplate[] = [
  {
    id: 'tpl-1',
    tenant_id: 'tenant-1',
    name: 'Q3 Enterprise Product Demo Invite',
    channel: 'email',
    subject: 'Exclusive Demo: Elevate Operations at {{company}}',
    body: `Hi {{contact_name}},

We noticed your team at {{company}} is evaluating modern business automation tools.

Vortiq offers an all-in-one ERP & CRM workspace built for high-growth teams. Based on your current deal profile ({{title}}), we would love to offer a personalized 1-on-1 walkthrough.

Would you be available for a brief 15-minute intro call this Thursday?

Best regards,
The Vortiq Sales Team`,
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'tpl-2',
    tenant_id: 'tenant-1',
    name: 'WhatsApp Quick Follow-up & Offer',
    channel: 'whatsapp',
    body: `👋 Hi {{contact_name}}, hope you are having a great week!

Quick check-in regarding the proposal for {{company}} ({{estimated_value}}). We have an exclusive early-bird tier discount expiring this Friday.

Let us know if you'd like to jump on a quick 5-min call today! 🚀`,
    created_at: new Date(Date.now() - 12 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'tpl-3',
    tenant_id: 'tenant-1',
    name: 'SMS Flash Announcement',
    channel: 'sms',
    body: `Vortiq Update: Hi {{contact_name}}, your custom proposal for {{company}} is ready! Check your inbox or call us back at +91 98200 12345.`,
    created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const SEED_CAMPAIGNS: Campaign[] = [
  {
    id: 'camp-1',
    tenant_id: 'tenant-1',
    name: 'Q3 High-Value Enterprise Outreach',
    template_id: 'tpl-1',
    segment_id: 'seg-1',
    channel: 'email',
    status: 'running',
    sent_count: 142,
    open_count: 98,
    click_count: 42,
    scheduled_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'camp-2',
    tenant_id: 'tenant-1',
    name: 'Inbound Website Leads WhatsApp Nurture',
    template_id: 'tpl-2',
    segment_id: 'seg-2',
    channel: 'whatsapp',
    status: 'completed',
    sent_count: 88,
    open_count: 84,
    click_count: 51,
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'camp-3',
    tenant_id: 'tenant-1',
    name: 'Urgent Leads VIP Phone Check-in SMS',
    template_id: 'tpl-3',
    segment_id: 'seg-3',
    channel: 'sms',
    status: 'scheduled',
    scheduled_at: new Date(Date.now() + 1 * 86400000).toISOString(),
    sent_count: 0,
    open_count: 0,
    click_count: 0,
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];
