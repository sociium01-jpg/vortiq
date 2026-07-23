import React, { useState, useMemo } from 'react';
import { Button, Card, Badge, Input, Select, Modal } from '@/design-system';
import {
  MarketingSegmentWithRules,
  CampaignTemplate,
  Campaign,
  SEED_SEGMENTS,
  SEED_TEMPLATES,
  SEED_CAMPAIGNS,
  getCrmLeads,
} from './types';
import { CampaignComposer } from './CampaignComposer';
import { SegmentBuilder } from './SegmentBuilder';
import { AudienceList } from './AudienceList';
import {
  Megaphone,
  Layers,
  Users,
  FileText,
  BarChart3,
  Plus,
  Search,
  Mail,
  MessageSquare,
  Smartphone,
  Clock,
  Edit,
  ArrowUpRight,
} from 'lucide-react';

type Tab = 'campaigns' | 'segments' | 'audiences' | 'templates' | 'analytics';

export const MarketingModule: React.FC = () => {
  // Navigation & View State
  const [activeTab, setActiveTab] = useState<Tab>('campaigns');
  const [isComposing, setIsComposing] = useState<boolean>(false);
  const [editingCampaign, setEditingCampaign] = useState<Partial<Campaign> | null>(null);

  // Core Entity State
  const [campaigns, setCampaigns] = useState<Campaign[]>(() => {
    try {
      const saved = localStorage.getItem('vortiq_marketing_campaigns');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return SEED_CAMPAIGNS;
  });

  const [segments, setSegments] = useState<MarketingSegmentWithRules[]>(() => {
    try {
      const saved = localStorage.getItem('vortiq_marketing_segments');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return SEED_SEGMENTS;
  });

  const [templates, setTemplates] = useState<CampaignTemplate[]>(() => {
    try {
      const saved = localStorage.getItem('vortiq_marketing_templates');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return SEED_TEMPLATES;
  });

  const [selectedAudienceSegmentId, setSelectedAudienceSegmentId] = useState<string | null>(null);

  // Filters for Campaign Center
  const [campaignSearch, setCampaignSearch] = useState('');
  const [campaignChannelFilter, setCampaignChannelFilter] = useState<string>('all');
  const [campaignStatusFilter, setCampaignStatusFilter] = useState<string>('all');

  // New Template Modal state
  const [isNewTemplateOpen, setIsNewTemplateOpen] = useState(false);
  const [newTplName, setNewTplName] = useState('');
  const [newTplChannel, setNewTplChannel] = useState<'email' | 'whatsapp' | 'sms'>('email');
  const [newTplSubject, setNewTplSubject] = useState('');
  const [newTplBody, setNewTplBody] = useState('');

  // Single Source of Truth CRM leads
  const crmLeads = useMemo(() => getCrmLeads(), []);

  // Save persistence handlers
  const saveCampaignsState = (updated: Campaign[]) => {
    setCampaigns(updated);
    try {
      localStorage.setItem('vortiq_marketing_campaigns', JSON.stringify(updated));
    } catch (e) {}
  };

  const saveSegmentsState = (updated: MarketingSegmentWithRules[]) => {
    setSegments(updated);
    try {
      localStorage.setItem('vortiq_marketing_segments', JSON.stringify(updated));
    } catch (e) {}
  };

  const saveTemplatesState = (updated: CampaignTemplate[]) => {
    setTemplates(updated);
    try {
      localStorage.setItem('vortiq_marketing_templates', JSON.stringify(updated));
    } catch (e) {}
  };

  // Add / Save Campaign from Composer
  const handleSaveCampaign = (campaign: Campaign) => {
    const exists = campaigns.some((c) => c.id === campaign.id);
    let updated: Campaign[];
    if (exists) {
      updated = campaigns.map((c) => (c.id === campaign.id ? campaign : c));
    } else {
      updated = [campaign, ...campaigns];
    }
    saveCampaignsState(updated);
    setIsComposing(false);
    setEditingCampaign(null);
    setActiveTab('campaigns');
  };

  // Save Segment from Builder
  const handleSaveSegment = (newSegment: MarketingSegmentWithRules) => {
    const exists = segments.some((s) => s.id === newSegment.id);
    let updated: MarketingSegmentWithRules[];
    if (exists) {
      updated = segments.map((s) => (s.id === newSegment.id ? newSegment : s));
    } else {
      updated = [newSegment, ...segments];
    }
    saveSegmentsState(updated);
  };

  // Save New Template
  const handleCreateTemplate = () => {
    if (!newTplName.trim() || !newTplBody.trim()) return;
    const tpl: CampaignTemplate = {
      id: `tpl-${Date.now()}`,
      tenant_id: 'tenant-1',
      name: newTplName.trim(),
      channel: newTplChannel,
      subject: newTplChannel === 'email' ? newTplSubject.trim() : undefined,
      body: newTplBody.trim(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    saveTemplatesState([tpl, ...templates]);
    setIsNewTemplateOpen(false);
    setNewTplName('');
    setNewTplSubject('');
    setNewTplBody('');
  };

  // Filtered Campaigns
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((c) => {
      const matchSearch = c.name.toLowerCase().includes(campaignSearch.toLowerCase());
      const matchChannel = campaignChannelFilter === 'all' || c.channel === campaignChannelFilter;
      const matchStatus = campaignStatusFilter === 'all' || c.status === campaignStatusFilter;
      return matchSearch && matchChannel && matchStatus;
    });
  }, [campaigns, campaignSearch, campaignChannelFilter, campaignStatusFilter]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    const totalSent = campaigns.reduce((acc, c) => acc + (c.sent_count || 0), 0);
    const totalOpens = campaigns.reduce((acc, c) => acc + (c.open_count || 0), 0);
    const totalClicks = campaigns.reduce((acc, c) => acc + (c.click_count || 0), 0);
    const avgOpenRate = totalSent > 0 ? Math.round((totalOpens / totalSent) * 100) : 0;
    const avgClickRate = totalOpens > 0 ? Math.round((totalClicks / totalOpens) * 100) : 0;
    const activeCount = campaigns.filter((c) => c.status === 'running').length;

    return { totalSent, totalOpens, totalClicks, avgOpenRate, avgClickRate, activeCount };
  }, [campaigns]);

  // Render Composer if active
  if (isComposing) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <CampaignComposer
          segments={segments}
          templates={templates}
          initialCampaign={editingCampaign}
          onSaveCampaign={handleSaveCampaign}
          onCancel={() => {
            setIsComposing(false);
            setEditingCampaign(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
              <Megaphone className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-100 font-display">
                Marketing & Campaign Center
              </h1>
              <p className="text-sm text-slate-400">
                Multi-channel messaging & segment builder powered by live <code className="text-brand-300 font-mono text-xs">crm_leads</code>.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="md"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => {
              setEditingCampaign(null);
              setIsComposing(true);
            }}
          >
            Create Campaign
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-dark-border overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab('campaigns')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all shrink-0 ${
            activeTab === 'campaigns'
              ? 'border-brand-500 text-brand-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>Campaign Center</span>
          <Badge variant="blue" size="sm">
            {campaigns.length}
          </Badge>
        </button>

        <button
          onClick={() => setActiveTab('segments')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all shrink-0 ${
            activeTab === 'segments'
              ? 'border-brand-500 text-brand-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Segment Builder</span>
          <Badge variant="violet" size="sm">
            {segments.length}
          </Badge>
        </button>

        <button
          onClick={() => setActiveTab('audiences')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all shrink-0 ${
            activeTab === 'audiences'
              ? 'border-brand-500 text-brand-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Audience List</span>
          <Badge variant="emerald" size="sm">
            {crmLeads.length} Leads
          </Badge>
        </button>

        <button
          onClick={() => setActiveTab('templates')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all shrink-0 ${
            activeTab === 'templates'
              ? 'border-brand-500 text-brand-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Templates Library</span>
          <Badge variant="slate" size="sm">
            {templates.length}
          </Badge>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all shrink-0 ${
            activeTab === 'analytics'
              ? 'border-brand-500 text-brand-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Analytics & ROI</span>
        </button>
      </div>

      {/* ── TAB 1: CAMPAIGN CENTER ────────────────────────────────────────── */}
      {activeTab === 'campaigns' && (
        <div className="space-y-6">
          {/* Performance Overview KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="space-y-2 bg-gradient-to-br from-dark-card to-dark-surface border border-dark-border">
              <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider block">
                Total Outreach Messages
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold text-slate-100 font-display">
                  {metrics.totalSent.toLocaleString()}
                </span>
                <Badge variant="blue" size="sm">
                  {campaigns.length} Campaigns
                </Badge>
              </div>
              <p className="text-xs text-slate-400">Dispatched across Email, WhatsApp & SMS</p>
            </Card>

            <Card className="space-y-2 bg-gradient-to-br from-dark-card to-dark-surface border border-dark-border">
              <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider block">
                Avg. Open / View Rate
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold text-emerald-400 font-display">
                  {metrics.avgOpenRate}%
                </span>
                <span className="text-xs text-emerald-400 font-mono">
                  {metrics.totalOpens} opened
                </span>
              </div>
              <p className="text-xs text-slate-400">Industry benchmark: 42%</p>
            </Card>

            <Card className="space-y-2 bg-gradient-to-br from-dark-card to-dark-surface border border-dark-border">
              <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider block">
                Click-Through Rate (CTR)
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold text-brand-400 font-display">
                  {metrics.avgClickRate}%
                </span>
                <span className="text-xs text-brand-400 font-mono">
                  {metrics.totalClicks} clicks
                </span>
              </div>
              <p className="text-xs text-slate-400">Engagement on CTAs & Links</p>
            </Card>

            <Card className="space-y-2 bg-gradient-to-br from-dark-card to-dark-surface border border-dark-border">
              <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider block">
                Active Running Campaigns
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold text-violet-400 font-display">
                  {metrics.activeCount}
                </span>
                <Badge variant="violet" dot size="sm">
                  Live Dispatch
                </Badge>
              </div>
              <p className="text-xs text-slate-400">Automated background queue</p>
            </Card>
          </div>

          {/* Search & Filter Bar */}
          <Card className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                placeholder="Search campaigns by title..."
                value={campaignSearch}
                onChange={(e) => setCampaignSearch(e.target.value)}
                leftIcon={<Search className="w-4 h-4 text-slate-400" />}
              />

              <Select
                value={campaignChannelFilter}
                onChange={(e) => setCampaignChannelFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'All Channels (Email, WhatsApp, SMS)' },
                  { value: 'email', label: 'Email Only' },
                  { value: 'whatsapp', label: 'WhatsApp Only' },
                  { value: 'sms', label: 'SMS Only' },
                ]}
              />

              <Select
                value={campaignStatusFilter}
                onChange={(e) => setCampaignStatusFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'All Statuses' },
                  { value: 'running', label: 'Running' },
                  { value: 'scheduled', label: 'Scheduled' },
                  { value: 'completed', label: 'Completed' },
                  { value: 'draft', label: 'Draft' },
                ]}
              />
            </div>
          </Card>

          {/* Campaigns List */}
          <div className="space-y-4">
            {filteredCampaigns.length === 0 ? (
              <Card className="py-12 text-center space-y-3">
                <Megaphone className="w-12 h-12 text-slate-600 mx-auto" />
                <p className="text-slate-300 font-medium">No marketing campaigns found</p>
                <p className="text-slate-500 text-xs">
                  Create your first campaign to engage targeted CRM leads across Email, WhatsApp, and SMS.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Plus className="w-4 h-4" />}
                  onClick={() => {
                    setEditingCampaign(null);
                    setIsComposing(true);
                  }}
                  className="mt-2"
                >
                  Create New Campaign
                </Button>
              </Card>
            ) : (
              filteredCampaigns.map((camp) => {
                const targetSeg = segments.find((s) => s.id === camp.segment_id);
                const openPct = camp.sent_count > 0 ? Math.round((camp.open_count / camp.sent_count) * 100) : 0;
                const clickPct = camp.open_count > 0 ? Math.round((camp.click_count / camp.open_count) * 100) : 0;

                return (
                  <Card
                    key={camp.id}
                    className="hover:border-slate-500/60 transition-all space-y-4"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      {/* Left Title & Metadata */}
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="p-1.5 rounded-lg bg-dark-surface border border-dark-border text-brand-400">
                            {camp.channel === 'email' ? (
                              <Mail className="w-4 h-4" />
                            ) : camp.channel === 'whatsapp' ? (
                              <MessageSquare className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <Smartphone className="w-4 h-4 text-blue-400" />
                            )}
                          </span>

                          <h3 className="font-bold text-slate-100 text-base">{camp.name}</h3>

                          <Badge
                            variant={
                              camp.status === 'completed'
                                ? 'emerald'
                                : camp.status === 'running'
                                ? 'blue'
                                : camp.status === 'scheduled'
                                ? 'amber'
                                : 'slate'
                            }
                            dot={camp.status === 'running'}
                            size="sm"
                          >
                            {camp.status.toUpperCase()}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
                          <span>
                            Audience Segment:{' '}
                            <strong className="text-slate-200 font-medium">
                              {targetSeg?.name || 'All CRM Leads'}
                            </strong>
                          </span>
                          <span>•</span>
                          <span>
                            Channel:{' '}
                            <strong className="text-slate-200 capitalize font-medium">
                              {camp.channel}
                            </strong>
                          </span>
                          {camp.scheduled_at && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1 text-amber-400">
                                <Clock className="w-3 h-3" />
                                {new Date(camp.scheduled_at).toLocaleDateString()}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Performance Bar */}
                      <div className="flex items-center gap-6 border-t md:border-t-0 border-dark-border pt-3 md:pt-0">
                        <div className="text-center">
                          <span className="text-2xs text-slate-400 uppercase font-semibold block">
                            Sent
                          </span>
                          <span className="font-mono font-bold text-slate-200 text-sm">
                            {camp.sent_count}
                          </span>
                        </div>

                        <div className="text-center">
                          <span className="text-2xs text-slate-400 uppercase font-semibold block">
                            Open Rate
                          </span>
                          <span className="font-mono font-bold text-emerald-400 text-sm">
                            {openPct}%
                          </span>
                        </div>

                        <div className="text-center">
                          <span className="text-2xs text-slate-400 uppercase font-semibold block">
                            CTR
                          </span>
                          <span className="font-mono font-bold text-brand-400 text-sm">
                            {clickPct}%
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 pl-2 border-l border-dark-border">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingCampaign(camp);
                              setIsComposing(true);
                            }}
                            leftIcon={<Edit className="w-3.5 h-3.5" />}
                          >
                            Edit
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ── TAB 2: SEGMENT BUILDER ───────────────────────────────────────── */}
      {activeTab === 'segments' && (
        <SegmentBuilder
          onSaveSegment={handleSaveSegment}
          onViewAudience={(segId) => {
            setSelectedAudienceSegmentId(segId);
            setActiveTab('audiences');
          }}
        />
      )}

      {/* ── TAB 3: AUDIENCE LIST ─────────────────────────────────────────── */}
      {activeTab === 'audiences' && (
        <AudienceList
          segments={segments}
          selectedSegmentId={selectedAudienceSegmentId}
          onSelectSegment={(id) => setSelectedAudienceSegmentId(id)}
          onOpenSegmentBuilder={() => setActiveTab('segments')}
        />
      )}

      {/* ── TAB 4: TEMPLATES LIBRARY ────────────────────────────────────── */}
      {activeTab === 'templates' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-dark-card rounded-xl border border-dark-border">
            <div>
              <h2 className="text-lg font-bold text-slate-100 font-display">
                Campaign Templates Library
              </h2>
              <p className="text-xs text-slate-400">
                Pre-built creative templates with variable placeholders for instant outreach.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setIsNewTemplateOpen(true)}
            >
              New Template
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((tpl) => (
              <Card
                key={tpl.id}
                className="flex flex-col justify-between hover:border-slate-500/60 transition-all space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge
                      variant={
                        tpl.channel === 'email'
                          ? 'blue'
                          : tpl.channel === 'whatsapp'
                          ? 'emerald'
                          : 'slate'
                      }
                      size="sm"
                    >
                      {tpl.channel.toUpperCase()}
                    </Badge>
                    <span className="text-2xs text-slate-500 font-mono">
                      {new Date(tpl.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-100 text-base">{tpl.name}</h3>

                  {tpl.subject && (
                    <div className="text-xs text-slate-300 bg-dark-surface p-2 rounded border border-dark-border font-mono">
                      <span className="text-slate-500 text-2xs block">Subject:</span>
                      {tpl.subject}
                    </div>
                  )}

                  <div className="text-xs text-slate-300 bg-dark-surface/60 p-3 rounded-lg border border-dark-border font-mono leading-relaxed line-clamp-4 whitespace-pre-wrap">
                    {tpl.body}
                  </div>
                </div>

                <div className="pt-3 border-t border-dark-border flex items-center justify-between">
                  <span className="text-2xs text-slate-400">
                    Variables: <code className="text-brand-300">{'{{contact_name}}'}</code>
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingCampaign({
                        template_id: tpl.id,
                        channel: tpl.channel as any,
                        name: `${tpl.name} Campaign`,
                      });
                      setIsComposing(true);
                    }}
                    rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}
                  >
                    Use Template
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 5: ANALYTICS & ROI ──────────────────────────────────────── */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <Card className="space-y-6 bg-gradient-to-r from-dark-card via-dark-surface to-dark-card border border-dark-border">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-slate-100 font-display flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-brand-400" />
                Marketing Analytics & Conversion ROI
              </h2>
              <p className="text-xs text-slate-400">
                Performance analytics across delivery channels & lead stage conversions.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="space-y-3 bg-dark-surface border border-dark-border">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-400" />
                  <span className="font-bold text-slate-200 text-sm">Email Channel Performance</span>
                </div>
                <div className="space-y-1 font-mono text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Delivered:</span>
                    <span className="text-slate-200">142</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Open Rate:</span>
                    <span className="text-emerald-400 font-bold">69%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Click Rate:</span>
                    <span className="text-brand-400 font-bold">43%</span>
                  </div>
                </div>
              </Card>

              <Card className="space-y-3 bg-dark-surface border border-dark-border">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-slate-200 text-sm">WhatsApp Channel Performance</span>
                </div>
                <div className="space-y-1 font-mono text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Delivered:</span>
                    <span className="text-slate-200">88</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Read Rate:</span>
                    <span className="text-emerald-400 font-bold">95%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Reply Rate:</span>
                    <span className="text-brand-400 font-bold">58%</span>
                  </div>
                </div>
              </Card>

              <Card className="space-y-3 bg-dark-surface border border-dark-border">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-amber-400" />
                  <span className="font-bold text-slate-200 text-sm">SMS Channel Performance</span>
                </div>
                <div className="space-y-1 font-mono text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Delivered:</span>
                    <span className="text-slate-200">45</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Delivery Rate:</span>
                    <span className="text-emerald-400 font-bold">98%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Click Rate:</span>
                    <span className="text-brand-400 font-bold">31%</span>
                  </div>
                </div>
              </Card>
            </div>
          </Card>
        </div>
      )}

      {/* New Template Modal */}
      <Modal
        isOpen={isNewTemplateOpen}
        onClose={() => setIsNewTemplateOpen(false)}
        title="Create Campaign Template"
      >
        <div className="space-y-4">
          <Input
            label="Template Title *"
            placeholder="e.g. Q4 Special Offer Announcement"
            value={newTplName}
            onChange={(e) => setNewTplName(e.target.value)}
          />

          <Select
            label="Channel"
            value={newTplChannel}
            onChange={(e) => setNewTplChannel(e.target.value as any)}
            options={[
              { value: 'email', label: 'Email' },
              { value: 'whatsapp', label: 'WhatsApp' },
              { value: 'sms', label: 'SMS' },
            ]}
          />

          {newTplChannel === 'email' && (
            <Input
              label="Subject Line"
              placeholder="Subject line with {{company}}..."
              value={newTplSubject}
              onChange={(e) => setNewTplSubject(e.target.value)}
            />
          )}

          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-300">
              Template Body Content *
            </label>
            <textarea
              rows={5}
              className="w-full rounded-lg bg-dark-surface border border-dark-border text-slate-100 text-sm p-3 focus:outline-none focus:ring-2 focus:ring-brand-500/50 font-mono"
              placeholder="Hi {{contact_name}}, write template message here..."
              value={newTplBody}
              onChange={(e) => setNewTplBody(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsNewTemplateOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleCreateTemplate}
              disabled={!newTplName.trim() || !newTplBody.trim()}
            >
              Save Template
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MarketingModule;
