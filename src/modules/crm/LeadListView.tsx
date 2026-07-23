import React, { useState } from 'react';
import { Badge, Avatar, Select, Button } from '@/design-system';
import {
  CrmLead,
  LeadStageId,
  LeadSource,
  LeadPriority,
  LeadFilters,
  PIPELINE_STAGES,
  LEAD_SOURCES,
  SAMPLE_TEAM_MEMBERS,
} from './types';
import {
  Search,
  Filter,
  X,
  IndianRupee,
  ArrowUpRight,
  ChevronDown,
} from 'lucide-react';

interface LeadListViewProps {
  leads: CrmLead[];
  onLeadClick: (lead: CrmLead) => void;
  onLeadStageChange: (leadId: string, newStageId: string) => void;
  onLeadAssigneeChange: (leadId: string, newAssigneeId: string) => void;
}

const DEFAULT_FILTERS: LeadFilters = {
  search: '',
  stage_id: 'all',
  assignee_id: 'all',
  source: 'all',
  date_from: '',
  date_to: '',
  priority: 'all',
};

const priorityVariants: Record<string, 'rose' | 'amber' | 'blue' | 'slate'> = {
  urgent: 'rose',
  high: 'amber',
  medium: 'blue',
  low: 'slate',
};

export const LeadListView: React.FC<LeadListViewProps> = ({
  leads,
  onLeadClick,
  onLeadStageChange,
  onLeadAssigneeChange,
}) => {
  const [filters, setFilters] = useState<LeadFilters>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [sortField, setSortField] = useState<'title' | 'estimated_value' | 'updated_at' | 'stage_id'>('updated_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const setFilter = <K extends keyof LeadFilters>(key: K, val: LeadFilters[K]) => {
    setFilters(prev => ({ ...prev, [key]: val }));
  };

  const activeFiltersCount = Object.entries(filters).filter(([k, v]) => v !== '' && v !== 'all' && k !== 'search').length;

  // ── Filter + sort ──────────────────────────────────────────────────────────
  const filtered = leads
    .filter(l => {
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (
          !l.title.toLowerCase().includes(q) &&
          !l.company_name?.toLowerCase().includes(q) &&
          !l.contact_person.toLowerCase().includes(q) &&
          !l.email?.toLowerCase().includes(q)
        ) return false;
      }
      if (filters.stage_id !== 'all' && l.stage_id !== filters.stage_id) return false;
      if (filters.assignee_id !== 'all' && l.assignee_id !== filters.assignee_id) return false;
      if (filters.source !== 'all' && l.source !== filters.source) return false;
      if (filters.priority !== 'all' && l.priority !== filters.priority) return false;
      if (filters.date_from && new Date(l.created_at) < new Date(filters.date_from)) return false;
      if (filters.date_to && new Date(l.created_at) > new Date(filters.date_to)) return false;
      return true;
    })
    .sort((a, b) => {
      let diff = 0;
      if (sortField === 'title') diff = a.title.localeCompare(b.title);
      else if (sortField === 'estimated_value') diff = (a.estimated_value || 0) - (b.estimated_value || 0);
      else if (sortField === 'updated_at') diff = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
      else if (sortField === 'stage_id') {
        const aIdx = PIPELINE_STAGES.findIndex(s => s.id === a.stage_id);
        const bIdx = PIPELINE_STAGES.findIndex(s => s.id === b.stage_id);
        diff = aIdx - bIdx;
      }
      return sortDir === 'asc' ? diff : -diff;
    });

  const totalValue = filtered.reduce((sum, l) => sum + (l.estimated_value || 0), 0);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };


  return (
    <div className="space-y-4">

      {/* ── Filter Bar ───────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setFilter('search', e.target.value)}
            placeholder="Search leads, companies, emails..."
            className="w-full bg-dark-surface border border-dark-border rounded-xl pl-9 pr-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500/60 transition-colors"
          />
          {filters.search && (
            <button onClick={() => setFilter('search', '')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Toggle advanced filters */}
        <Button
          variant={showFilters || activeFiltersCount > 0 ? 'primary' : 'outline'}
          size="sm"
          leftIcon={<Filter className="w-4 h-4" />}
          onClick={() => setShowFilters(f => !f)}
        >
          Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
        </Button>

        {/* Summary */}
        <div className="ml-auto flex items-center gap-3 text-2xs text-slate-500 font-mono">
          <span>{filtered.length} leads</span>
          <span>·</span>
          <span className="flex items-center gap-1 text-emerald-400 font-bold">
            <IndianRupee className="w-3 h-3" />
            {totalValue.toLocaleString('en-IN')} pipeline
          </span>
        </div>
      </div>

      {/* ── Advanced Filters ─────────────────────────────────────────────────── */}
      {showFilters && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-dark-surface/40 border border-dark-border/60 rounded-xl">
          <Select
            label="Stage"
            value={filters.stage_id}
            onChange={(e) => setFilter('stage_id', e.target.value as LeadStageId | 'all')}
            options={[{ value: 'all', label: 'All Stages' }, ...PIPELINE_STAGES.map(s => ({ value: s.id, label: s.name }))]}
          />
          <Select
            label="Owner"
            value={filters.assignee_id}
            onChange={(e) => setFilter('assignee_id', e.target.value)}
            options={[{ value: 'all', label: 'All Owners' }, ...SAMPLE_TEAM_MEMBERS.map(m => ({ value: m.id, label: m.name }))]}
          />
          <Select
            label="Source"
            value={filters.source}
            onChange={(e) => setFilter('source', e.target.value as LeadSource | 'all')}
            options={[{ value: 'all', label: 'All Sources' }, ...LEAD_SOURCES]}
          />
          <Select
            label="Priority"
            value={filters.priority}
            onChange={(e) => setFilter('priority', e.target.value as LeadPriority | 'all')}
            options={[
              { value: 'all', label: 'All Priorities' },
              { value: 'urgent', label: 'Urgent' },
              { value: 'high', label: 'High' },
              { value: 'medium', label: 'Medium' },
              { value: 'low', label: 'Low' },
            ]}
          />
          <div>
            <label className="text-xs font-medium text-slate-400 mb-1.5 block">Created From</label>
            <input
              type="date"
              value={filters.date_from}
              onChange={(e) => setFilter('date_from', e.target.value)}
              className="w-full bg-dark-surface border border-dark-border rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-brand-500/60 font-mono"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-400 mb-1.5 block">Created To</label>
            <input
              type="date"
              value={filters.date_to}
              onChange={(e) => setFilter('date_to', e.target.value)}
              className="w-full bg-dark-surface border border-dark-border rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-brand-500/60 font-mono"
            />
          </div>
          <div className="flex items-end col-span-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFilters(DEFAULT_FILTERS)}
              className="text-rose-400 hover:text-rose-300"
            >
              Clear All Filters
            </Button>
          </div>
        </div>
      )}

      {/* ── Table ────────────────────────────────────────────────────────────── */}
      <div className="bg-dark-card border border-dark-border/60 rounded-2xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-slate-500">No leads match your filters</p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-dark-border/60 bg-dark-surface/60">
                  <th className="px-4 py-3">
                    <button className="flex items-center gap-1 text-2xs font-semibold text-slate-400 uppercase tracking-wider hover:text-slate-200" onClick={() => handleSort('title')}>
                      Lead <ChevronDown className={`w-3 h-3 transition-transform ${sortField === 'title' && sortDir === 'asc' ? 'rotate-180' : ''}`} />
                    </button>
                  </th>
                  <th className="px-4 py-3">
                    <button className="flex items-center gap-1 text-2xs font-semibold text-slate-400 uppercase tracking-wider hover:text-slate-200" onClick={() => handleSort('stage_id')}>
                      Stage <ChevronDown className={`w-3 h-3 transition-transform ${sortField === 'stage_id' && sortDir === 'asc' ? 'rotate-180' : ''}`} />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-2xs font-semibold text-slate-400 uppercase tracking-wider">Priority</th>
                  <th className="px-4 py-3">
                    <button className="flex items-center gap-1 text-2xs font-semibold text-slate-400 uppercase tracking-wider hover:text-slate-200" onClick={() => handleSort('estimated_value')}>
                      Value <ChevronDown className={`w-3 h-3 transition-transform ${sortField === 'estimated_value' && sortDir === 'asc' ? 'rotate-180' : ''}`} />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-2xs font-semibold text-slate-400 uppercase tracking-wider">Assigned To</th>
                  <th className="px-4 py-3">
                    <button className="flex items-center gap-1 text-2xs font-semibold text-slate-400 uppercase tracking-wider hover:text-slate-200" onClick={() => handleSort('updated_at')}>
                      Updated <ChevronDown className={`w-3 h-3 transition-transform ${sortField === 'updated_at' && sortDir === 'asc' ? 'rotate-180' : ''}`} />
                    </button>
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border/40">
                {filtered.map((lead) => (
                  <tr
                    key={lead.id}
                    className="group hover:bg-dark-surface/40 transition-colors cursor-pointer"
                    onClick={() => onLeadClick(lead)}
                  >
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold text-slate-100 truncate max-w-[200px]">{lead.title}</p>
                      <p className="text-2xs text-slate-500 truncate">{lead.company_name || lead.contact_person}</p>
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <Select
                        value={lead.stage_id}
                        onChange={(e) => onLeadStageChange(lead.id, e.target.value)}
                        options={PIPELINE_STAGES.map(s => ({ value: s.id, label: s.name }))}
                        className="text-xs py-1 h-8 min-w-[120px]"
                      />
                    </td>
                    <td className="px-4 py-3">
                      {lead.priority ? (
                        <Badge variant={priorityVariants[lead.priority] || 'slate'} size="sm">{lead.priority}</Badge>
                      ) : <span className="text-2xs text-slate-600">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs font-bold text-emerald-400">
                        ₹{(lead.estimated_value || 0).toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-2">
                        <Avatar name={lead.assignee_name || 'Unassigned'} size="sm" />
                        <Select
                          value={lead.assignee_id || ''}
                          onChange={(e) => onLeadAssigneeChange(lead.id, e.target.value)}
                          options={SAMPLE_TEAM_MEMBERS.map(m => ({ value: m.id, label: m.name }))}
                          className="text-xs py-1 h-8 min-w-[120px]"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-2xs font-mono text-slate-500">
                        {new Date(lead.updated_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => onLeadClick(lead)}
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
