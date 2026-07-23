import React, { useState, useMemo } from 'react';
import { Button, Card, Badge, Input, Select } from '@/design-system';
import { MarketingSegmentWithRules, getCrmLeads, SegmentRule } from './types';
import { CrmLead } from '@/modules/crm/types';
import {
  Users,
  Search,
  Layers,
  Database,
  Building,
  Mail,
  Phone,
  IndianRupee,
  Plus,
  CheckCircle2,
} from 'lucide-react';

interface AudienceListProps {
  segments: MarketingSegmentWithRules[];
  selectedSegmentId: string | null;
  onSelectSegment: (id: string) => void;
  onOpenSegmentBuilder: () => void;
}

export const AudienceList: React.FC<AudienceListProps> = ({
  segments,
  selectedSegmentId,
  onSelectSegment,
  onOpenSegmentBuilder,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Single source of truth: fetch crm_leads live
  const crmLeads = useMemo(() => getCrmLeads(), []);

  const activeSegment = useMemo(() => {
    if (!selectedSegmentId) return segments[0] || null;
    return segments.find((s) => s.id === selectedSegmentId) || null;
  }, [segments, selectedSegmentId]);

  // Evaluate segment rules dynamically on crm_leads
  const matchingLeads = useMemo(() => {
    if (!activeSegment || !activeSegment.rules || activeSegment.rules.length === 0) {
      return crmLeads;
    }

    return crmLeads.filter((lead: CrmLead) => {
      return activeSegment.rules.every((rule: SegmentRule) => {
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
  }, [crmLeads, activeSegment]);

  // Search filter
  const filteredLeads = useMemo(() => {
    if (!searchTerm.trim()) return matchingLeads;
    const term = searchTerm.toLowerCase();
    return matchingLeads.filter(
      (lead) =>
        lead.name?.toLowerCase().includes(term) ||
        lead.contact_person?.toLowerCase().includes(term) ||
        lead.company_name?.toLowerCase().includes(term) ||
        lead.email?.toLowerCase().includes(term) ||
        lead.title?.toLowerCase().includes(term)
    );
  }, [matchingLeads, searchTerm]);

  const segmentOptions = useMemo(() => {
    return [
      { value: 'all', label: `All CRM Leads (${crmLeads.length} total)` },
      ...segments.map((s) => ({
        value: s.id,
        label: `${s.name} (${s.member_count || 0} matching)`,
      })),
    ];
  }, [segments, crmLeads.length]);

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <Card className="bg-gradient-to-r from-dark-card to-dark-surface border border-dark-border/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-brand-500/10 text-brand-400">
                <Users className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-100 font-display">
                Audience & Lead Targeting
              </h2>
              <Badge variant="emerald" dot className="ml-2">
                Single Source of Truth
              </Badge>
            </div>
            <p className="text-sm text-slate-400">
              Live queries directly against <code className="text-brand-300 font-mono text-xs">crm_leads</code>. Zero contact duplication.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={onOpenSegmentBuilder}
            >
              Build New Segment
            </Button>
          </div>
        </div>

        {/* Controls */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-dark-border/60">
          <div className="md:col-span-1">
            <Select
              label="Select Segment Filter"
              value={selectedSegmentId || (activeSegment ? activeSegment.id : 'all')}
              onChange={(e) => {
                const val = e.target.value;
                if (val === 'all') onSelectSegment('');
                else onSelectSegment(val);
              }}
              options={segmentOptions}
            />
          </div>

          <div className="md:col-span-2">
            <Input
              label="Search Members in Segment"
              placeholder="Search by name, company, email, or deal title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            />
          </div>
        </div>
      </Card>

      {/* Active Segment Metadata */}
      {activeSegment && (
        <Card className="bg-dark-card/60 border border-brand-500/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2.5">
                <Layers className="w-4 h-4 text-brand-400" />
                <h3 className="font-semibold text-slate-100">{activeSegment.name}</h3>
                <Badge variant="violet" size="sm">
                  {matchingLeads.length} Lead{matchingLeads.length === 1 ? '' : 's'} Matched
                </Badge>
              </div>
              {activeSegment.description && (
                <p className="text-xs text-slate-400 mt-1">{activeSegment.description}</p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-2xs text-slate-400 uppercase font-semibold">Active Rules:</span>
              {activeSegment.rules && activeSegment.rules.length > 0 ? (
                activeSegment.rules.map((rule) => (
                  <Badge key={rule.id} variant="slate" size="sm">
                    {rule.field} {rule.operator} {String(rule.value)}
                  </Badge>
                ))
              ) : (
                <Badge variant="slate" size="sm">
                  Show All CRM Leads
                </Badge>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Audience List Table */}
      <Card className="p-0 overflow-hidden border border-dark-border">
        <div className="px-5 py-4 border-b border-dark-border bg-dark-surface/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-brand-400" />
            <span className="text-sm font-medium text-slate-200">
              Matched Leads ({filteredLeads.length} of {crmLeads.length} total CRM leads)
            </span>
          </div>
          <span className="text-xs text-slate-400">
            Source: <span className="font-mono text-emerald-400">crm_leads</span>
          </span>
        </div>

        {filteredLeads.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Users className="w-12 h-12 text-slate-600 mx-auto" />
            <p className="text-slate-300 font-medium text-base">No CRM leads match this segment rule</p>
            <p className="text-slate-500 text-xs max-w-sm mx-auto">
              Try adjusting your filter rules in Segment Builder or choosing a different segment.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenSegmentBuilder}
              className="mt-2"
            >
              Adjust Segment Rules
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-dark-surface/80 text-2xs uppercase tracking-wider text-slate-400 font-semibold border-b border-dark-border">
                <tr>
                  <th className="py-3 px-4">Contact / Title</th>
                  <th className="py-3 px-4">Company</th>
                  <th className="py-3 px-4">Email & Phone</th>
                  <th className="py-3 px-4">Stage</th>
                  <th className="py-3 px-4">Value</th>
                  <th className="py-3 px-4">Source</th>
                  <th className="py-3 px-4 text-right">Data Sync</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border/50">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-dark-surface/30 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-slate-100">
                      <div>
                        <div className="font-semibold text-slate-100">
                          {lead.contact_person || lead.name || lead.title}
                        </div>
                        <div className="text-2xs text-slate-400 font-normal">{lead.title}</div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{lead.company_name || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      <div className="space-y-0.5 text-xs">
                        {lead.email && (
                          <div className="flex items-center gap-1 text-slate-300">
                            <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate max-w-[180px]">{lead.email}</span>
                          </div>
                        )}
                        {lead.phone && (
                          <div className="flex items-center gap-1 text-slate-400">
                            <Phone className="w-3 h-3 text-slate-500 shrink-0" />
                            <span>{lead.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          lead.stage_id === 'won'
                            ? 'emerald'
                            : lead.stage_id === 'qualified'
                            ? 'violet'
                            : lead.stage_id === 'contacted'
                            ? 'blue'
                            : lead.stage_id === 'lost'
                            ? 'rose'
                            : 'amber'
                        }
                        size="sm"
                      >
                        {lead.stage_id.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-200">
                      <div className="flex items-center gap-0.5">
                        <IndianRupee className="w-3 h-3 text-slate-400" />
                        <span>{Number(lead.estimated_value || 0).toLocaleString('en-IN')}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant="slate" size="sm">
                        {lead.source || 'Direct'}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="inline-flex items-center gap-1 text-2xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-mono">
                        <CheckCircle2 className="w-3 h-3" />
                        Live CRM
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
