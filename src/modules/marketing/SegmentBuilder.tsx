import React, { useState, useMemo } from 'react';
import { Button, Card, Badge, Input, Select } from '@/design-system';
import {
  MarketingSegmentWithRules,
  SegmentRule,
  SegmentRuleField,
  SegmentRuleOperator,
  getCrmLeads,
} from './types';
import { CrmLead } from '@/modules/crm/types';
import {
  Filter,
  Plus,
  Trash2,
  Users,
  Sparkles,
  Layers,
  Save,
  Eye,
  ArrowRight,
} from 'lucide-react';

interface SegmentBuilderProps {
  onSaveSegment: (segment: MarketingSegmentWithRules) => void;
  onViewAudience?: (segmentId: string) => void;
  initialSegment?: MarketingSegmentWithRules | null;
}

const FIELD_OPTIONS: { value: SegmentRuleField; label: string }[] = [
  { value: 'stage_id', label: 'CRM Stage' },
  { value: 'estimated_value', label: 'Estimated Deal Value (₹)' },
  { value: 'source', label: 'Lead Source' },
  { value: 'priority', label: 'Lead Priority' },
  { value: 'company_name', label: 'Company Name' },
];

const OPERATOR_OPTIONS: { value: SegmentRuleOperator; label: string }[] = [
  { value: 'equals', label: 'Equals (=)' },
  { value: 'not_equals', label: 'Does Not Equal (≠)' },
  { value: 'greater_than', label: 'Greater Than (>)' },
  { value: 'less_than', label: 'Less Than (<)' },
  { value: 'contains', label: 'Contains Text' },
];

const STAGE_VALUES = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'won', label: 'Won' },
  { value: 'lost', label: 'Lost' },
];

const SOURCE_VALUES = [
  { value: 'website', label: 'Website Inbound' },
  { value: 'referral', label: 'Referral' },
  { value: 'cold_outreach', label: 'Cold Outreach' },
  { value: 'inbound_call', label: 'Inbound Call' },
  { value: 'social_media', label: 'Social Media' },
  { value: 'partner', label: 'Partner' },
];

const PRIORITY_VALUES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

export const SegmentBuilder: React.FC<SegmentBuilderProps> = ({
  onSaveSegment,
  onViewAudience,
  initialSegment,
}) => {
  const [name, setName] = useState(initialSegment?.name || '');
  const [description, setDescription] = useState(initialSegment?.description || '');
  const [rules, setRules] = useState<SegmentRule[]>(
    initialSegment?.rules || [
      { id: 'rule-1', field: 'stage_id', operator: 'equals', value: 'qualified' },
      { id: 'rule-2', field: 'estimated_value', operator: 'greater_than', value: 100000 },
    ]
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Single Source of Truth: Fetch crm_leads
  const crmLeads = useMemo(() => getCrmLeads(), []);

  // Compute matching leads in real time
  const matchingLeads = useMemo(() => {
    if (rules.length === 0) return crmLeads;

    return crmLeads.filter((lead: CrmLead) => {
      return rules.every((rule) => {
        const leadVal = (lead as any)[rule.field];
        if (leadVal === undefined || leadVal === null) return false;

        switch (rule.operator) {
          case 'equals':
            return String(leadVal).toLowerCase() === String(rule.value).toLowerCase();
          case 'not_equals':
            return String(leadVal).toLowerCase() !== String(rule.value).toLowerCase();
          case 'greater_than':
            return Number(leadVal) > Number(rule.value);
          case 'less_than':
            return Number(leadVal) < Number(rule.value);
          case 'contains':
            return String(leadVal).toLowerCase().includes(String(rule.value).toLowerCase());
          default:
            return true;
        }
      });
    });
  }, [crmLeads, rules]);

  const addRule = () => {
    const newRule: SegmentRule = {
      id: `rule-${Date.now()}`,
      field: 'source',
      operator: 'equals',
      value: 'website',
    };
    setRules([...rules, newRule]);
  };

  const updateRule = (id: string, updates: Partial<SegmentRule>) => {
    setRules((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const updated = { ...r, ...updates };
          // Set sensible defaults if field changed
          if (updates.field && updates.field !== r.field) {
            if (updates.field === 'stage_id') updated.value = 'qualified';
            else if (updates.field === 'estimated_value') updated.value = 100000;
            else if (updates.field === 'source') updated.value = 'website';
            else if (updates.field === 'priority') updated.value = 'high';
            else updated.value = '';
          }
          return updated;
        }
        return r;
      })
    );
  };

  const removeRule = (id: string) => {
    setRules(rules.filter((r) => r.id !== id));
  };

  const handleSave = () => {
    if (!name.trim()) return;

    const newSegment: MarketingSegmentWithRules = {
      id: initialSegment?.id || `seg-${Date.now()}`,
      tenant_id: 'tenant-1',
      name: name.trim(),
      description: description.trim(),
      filter_rules: rules[0] ? { field: rules[0].field, operator: rules[0].operator, value: rules[0].value } : {},
      rules,
      member_count: matchingLeads.length,
      created_at: initialSegment?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    onSaveSegment(newSegment);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const matchPercentage = Math.round((matchingLeads.length / (crmLeads.length || 1)) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-dark-card via-dark-surface to-dark-card border border-dark-border">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400">
                <Layers className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-100 font-display">
                Dynamic Segment Builder
              </h2>
              <Badge variant="violet" dot size="sm">
                Targeting CRM Leads
              </Badge>
            </div>
            <p className="text-sm text-slate-400">
              Build rule-based audiences that filter live <code className="font-mono text-brand-300">crm_leads</code> with zero data duplication.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {onViewAudience && (
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Eye className="w-4 h-4" />}
                onClick={() => onViewAudience(initialSegment?.id || '')}
              >
                View Matching Members
              </Button>
            )}
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Save className="w-4 h-4" />}
              onClick={handleSave}
              disabled={!name.trim()}
            >
              {savedSuccess ? 'Segment Saved!' : 'Save Segment'}
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Rules & Config */}
        <div className="lg:col-span-2 space-y-6">
          {/* Segment Details */}
          <Card className="space-y-4">
            <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-400" />
              Segment Identification
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <Input
                label="Segment Name *"
                placeholder="e.g. High Value Qualified Leads"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Input
                label="Description (Optional)"
                placeholder="Describe the purpose or targeting criteria for this segment..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </Card>

          {/* Rules Builder */}
          <Card className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                  <Filter className="w-4 h-4 text-violet-400" />
                  Targeting Rules (ALL rules must match)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Define logic rules to evaluate against CRM lead attributes.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={addRule}
              >
                Add Condition
              </Button>
            </div>

            {rules.length === 0 ? (
              <div className="p-8 border border-dashed border-dark-border rounded-xl text-center space-y-2 bg-dark-surface/30">
                <Filter className="w-8 h-8 text-slate-500 mx-auto" />
                <p className="text-sm font-medium text-slate-300">No filter rules defined</p>
                <p className="text-xs text-slate-500">Add at least one rule to narrow down your audience.</p>
                <Button variant="secondary" size="sm" onClick={addRule} className="mt-2">
                  Add First Rule
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {rules.map((rule, idx) => (
                  <div
                    key={rule.id}
                    className="p-3.5 bg-dark-surface/60 border border-dark-border rounded-lg flex flex-col sm:flex-row items-stretch sm:items-center gap-3 transition-all hover:border-slate-600"
                  >
                    <span className="text-2xs font-mono font-bold text-slate-500 uppercase shrink-0">
                      {idx === 0 ? 'WHERE' : 'AND'}
                    </span>

                    {/* Field selector */}
                    <div className="flex-1 min-w-[150px]">
                      <Select
                        value={rule.field}
                        onChange={(e) => updateRule(rule.id, { field: e.target.value as SegmentRuleField })}
                        options={FIELD_OPTIONS}
                      />
                    </div>

                    {/* Operator selector */}
                    <div className="w-full sm:w-[150px]">
                      <Select
                        value={rule.operator}
                        onChange={(e) => updateRule(rule.id, { operator: e.target.value as SegmentRuleOperator })}
                        options={OPERATOR_OPTIONS}
                      />
                    </div>

                    {/* Value Input */}
                    <div className="flex-1 min-w-[160px]">
                      {rule.field === 'stage_id' ? (
                        <Select
                          value={String(rule.value)}
                          onChange={(e) => updateRule(rule.id, { value: e.target.value })}
                          options={STAGE_VALUES}
                        />
                      ) : rule.field === 'source' ? (
                        <Select
                          value={String(rule.value)}
                          onChange={(e) => updateRule(rule.id, { value: e.target.value })}
                          options={SOURCE_VALUES}
                        />
                      ) : rule.field === 'priority' ? (
                        <Select
                          value={String(rule.value)}
                          onChange={(e) => updateRule(rule.id, { value: e.target.value })}
                          options={PRIORITY_VALUES}
                        />
                      ) : (
                        <Input
                          type={rule.field === 'estimated_value' ? 'number' : 'text'}
                          placeholder={rule.field === 'estimated_value' ? 'e.g. 100000' : 'Value...'}
                          value={String(rule.value)}
                          onChange={(e) =>
                            updateRule(rule.id, {
                              value: rule.field === 'estimated_value' ? Number(e.target.value) : e.target.value,
                            })
                          }
                        />
                      )}
                    </div>

                    {/* Remove rule */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeRule(rule.id)}
                      className="text-slate-400 hover:text-rose-400 p-2 shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Live Matching Preview */}
        <div className="space-y-6">
          <Card className="bg-gradient-to-b from-dark-card to-dark-surface border border-brand-500/30 space-y-5">
            <div className="flex items-center justify-between border-b border-dark-border/60 pb-3">
              <h3 className="font-semibold text-slate-100 flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                Live Matching Audience
              </h3>
              <Badge variant="emerald" dot>
                Real-Time CRM Query
              </Badge>
            </div>

            {/* Match Counter Display */}
            <div className="bg-dark-surface p-4 rounded-xl border border-dark-border text-center space-y-2">
              <span className="text-3xl font-extrabold text-brand-400 font-display">
                {matchingLeads.length}
              </span>
              <span className="text-slate-400 text-sm block font-medium">
                Matching CRM Leads
              </span>
              <div className="w-full bg-dark-border rounded-full h-2 overflow-hidden mt-3">
                <div
                  className="bg-brand-500 h-full transition-all duration-300"
                  style={{ width: `${matchPercentage}%` }}
                />
              </div>
              <p className="text-2xs text-slate-400 font-mono pt-1">
                {matchPercentage}% of total {crmLeads.length} leads in database
              </p>
            </div>

            {/* Matched Lead Sample Chips */}
            <div className="space-y-2">
              <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider block">
                Matched Leads Sample:
              </span>
              {matchingLeads.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-2">
                  No CRM leads match these conditions.
                </p>
              ) : (
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {matchingLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="p-2.5 bg-dark-surface/80 rounded-lg border border-dark-border text-xs flex items-center justify-between"
                    >
                      <div>
                        <span className="font-semibold text-slate-200 block">
                          {lead.contact_person || lead.name || lead.title}
                        </span>
                        <span className="text-slate-400 text-2xs">
                          {lead.company_name || lead.email || 'No company'}
                        </span>
                      </div>
                      <Badge variant="blue" size="sm">
                        ₹{(lead.estimated_value || 0).toLocaleString('en-IN')}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className="pt-3 border-t border-dark-border/60 space-y-2">
              <Button
                variant="primary"
                size="md"
                className="w-full"
                leftIcon={<Save className="w-4 h-4" />}
                onClick={handleSave}
                disabled={!name.trim()}
              >
                {savedSuccess ? 'Segment Saved Successfully!' : 'Save Segment'}
              </Button>
              {onViewAudience && (
                <Button
                  variant="outline"
                  size="md"
                  className="w-full"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                  onClick={() => onViewAudience(initialSegment?.id || '')}
                >
                  View Full Audience Table
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
