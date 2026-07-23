import React, { useState, useMemo } from 'react';
import { Button, Card, Badge, Input, Select, Modal } from '@/design-system';
import {
  MarketingSegmentWithRules,
  CampaignTemplate,
  Campaign,
  MarketingChannel,
  TEMPLATE_VARIABLES,
  getCrmLeads,
} from './types';
import { CrmLead } from '@/modules/crm/types';
import {
  Mail,
  MessageSquare,
  Smartphone,
  Send,
  Calendar,
  Sparkles,
  Monitor,
  CheckCircle2,
  Clock,
  Zap,
  Save,
  ArrowLeft,
} from 'lucide-react';

interface CampaignComposerProps {
  segments: MarketingSegmentWithRules[];
  templates: CampaignTemplate[];
  initialCampaign?: Partial<Campaign> | null;
  onSaveCampaign: (campaign: Campaign) => void;
  onCancel?: () => void;
}

export const CampaignComposer: React.FC<CampaignComposerProps> = ({
  segments,
  templates,
  initialCampaign,
  onSaveCampaign,
  onCancel,
}) => {
  // Form State
  const [name, setName] = useState(initialCampaign?.name || 'New Marketing Campaign');
  const [channel, setChannel] = useState<MarketingChannel>(
    (initialCampaign?.channel as MarketingChannel) || 'email'
  );
  const [selectedSegmentId, setSelectedSegmentId] = useState<string>(
    initialCampaign?.segment_id || (segments[0] ? segments[0].id : '')
  );
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    initialCampaign?.template_id || ''
  );
  const [subject, setSubject] = useState(
    channel === 'email' ? 'Exclusive Invite for {{company}}' : ''
  );
  const [body, setBody] = useState(
    templates.find((t) => t.channel === channel)?.body ||
      'Hi {{contact_name}},\n\nWe noticed your team at {{company}} is looking to optimize operations.\n\nBest regards,\n{{team_name}}'
  );
  const [sendOption, setSendOption] = useState<'now' | 'schedule'>('now');
  const [scheduledAt, setScheduledAt] = useState(
    new Date(Date.now() + 86400000).toISOString().slice(0, 16)
  );

  // Preview Pane State
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'desktop'>('mobile');
  const [selectedLeadIndex, setSelectedLeadIndex] = useState<number>(0);
  const [isTestSendOpen, setIsTestSendOpen] = useState(false);
  const [testEmail, setTestEmail] = useState('demo@vortiq.app');
  const [testSentSuccess, setTestSentSuccess] = useState(false);

  // Single Source of Truth CRM leads
  const crmLeads = useMemo(() => getCrmLeads(), []);
  const activeLead: CrmLead | undefined = crmLeads[selectedLeadIndex] || crmLeads[0];

  const activeSegment = useMemo(
    () => segments.find((s) => s.id === selectedSegmentId) || segments[0],
    [segments, selectedSegmentId]
  );

  // Template select handler
  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const found = templates.find((t) => t.id === templateId);
    if (found) {
      setChannel(found.channel as MarketingChannel);
      if (found.subject) setSubject(found.subject);
      setBody(found.body);
    }
  };

  // Variable insertion
  const insertVariable = (varKey: string) => {
    setBody((prev) => prev + ' ' + varKey);
  };

  // Live variable substitution for preview
  const renderedSubject = useMemo(() => {
    if (!activeLead) return subject;
    return subject
      .replace(/\{\{contact_name\}\}/g, activeLead.contact_person || activeLead.name || 'Valued Partner')
      .replace(/\{\{company\}\}/g, activeLead.company_name || 'your company')
      .replace(/\{\{title\}\}/g, activeLead.title || 'Deal Opportunity')
      .replace(/\{\{email\}\}/g, activeLead.email || 'contact@company.com')
      .replace(/\{\{estimated_value\}\}/g, `₹${(activeLead.estimated_value || 0).toLocaleString('en-IN')}`)
      .replace(/\{\{stage\}\}/g, activeLead.stage_id?.toUpperCase() || 'QUALIFIED');
  }, [subject, activeLead]);

  const renderedBody = useMemo(() => {
    if (!activeLead) return body;
    return body
      .replace(/\{\{contact_name\}\}/g, activeLead.contact_person || activeLead.name || 'Valued Partner')
      .replace(/\{\{company\}\}/g, activeLead.company_name || 'your company')
      .replace(/\{\{title\}\}/g, activeLead.title || 'Deal Opportunity')
      .replace(/\{\{email\}\}/g, activeLead.email || 'contact@company.com')
      .replace(/\{\{estimated_value\}\}/g, `₹${(activeLead.estimated_value || 0).toLocaleString('en-IN')}`)
      .replace(/\{\{stage\}\}/g, activeLead.stage_id?.toUpperCase() || 'QUALIFIED')
      .replace(/\{\{team_name\}\}/g, 'Vortiq Outreach Team');
  }, [body, activeLead]);

  // SMS character length calculator
  const smsStats = useMemo(() => {
    const len = body.length;
    const parts = Math.ceil(len / 160) || 1;
    return { len, parts };
  }, [body]);

  // Save / Launch handler
  const handleLaunch = (status: 'draft' | 'scheduled' | 'running') => {
    if (!name.trim() || !body.trim()) return;

    const newCampaign: Campaign = {
      id: initialCampaign?.id || `camp-${Date.now()}`,
      tenant_id: 'tenant-1',
      name: name.trim(),
      channel,
      segment_id: selectedSegmentId,
      template_id: selectedTemplateId || undefined,
      status: sendOption === 'schedule' ? 'scheduled' : status,
      scheduled_at: sendOption === 'schedule' ? new Date(scheduledAt).toISOString() : undefined,
      sent_count: status === 'running' ? activeSegment?.member_count || crmLeads.length : 0,
      open_count: 0,
      click_count: 0,
      created_at: initialCampaign?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    onSaveCampaign(newCampaign);
  };

  const segmentOptions = useMemo(
    () =>
      segments.map((s) => ({
        value: s.id,
        label: `${s.name} (${s.member_count} CRM leads)`,
      })),
    [segments]
  );

  const templateOptions = useMemo(
    () => [
      { value: '', label: '-- Select a Saved Template (Optional) --' },
      ...templates.map((t) => ({
        value: t.id,
        label: `[${t.channel.toUpperCase()}] ${t.name}`,
      })),
    ],
    [templates]
  );

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-dark-card rounded-xl border border-dark-border">
        <div className="flex items-center gap-3">
          {onCancel && (
            <Button variant="ghost" size="sm" onClick={onCancel} className="p-2">
              <ArrowLeft className="w-4 h-4 text-slate-400" />
            </Button>
          )}
          <div>
            <h2 className="text-lg font-bold text-slate-100 font-display">
              {initialCampaign ? 'Edit Campaign Studio' : 'Campaign Composer Studio'}
            </h2>
            <p className="text-xs text-slate-400">
              Visual creative studio with live CRM contact substitution & multi-channel previews.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleLaunch('draft')}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save Draft
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsTestSendOpen(true)}
            leftIcon={<Zap className="w-4 h-4 text-amber-400" />}
          >
            Test Send
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleLaunch(sendOption === 'schedule' ? 'scheduled' : 'running')}
            leftIcon={sendOption === 'schedule' ? <Clock className="w-4 h-4" /> : <Send className="w-4 h-4" />}
          >
            {sendOption === 'schedule' ? 'Schedule Campaign' : 'Send / Launch Now'}
          </Button>
        </div>
      </div>

      {/* Main Dual Pane Surface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Editor Pane (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Campaign Config Card */}
          <Card className="space-y-5">
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-400" />
              Campaign Configuration
            </h3>

            <div className="space-y-4">
              <Input
                label="Campaign Title *"
                placeholder="e.g. Q3 High-Value Enterprise Outreach"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              {/* Channel Selector Tabs */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-300">
                  Select Delivery Channel
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setChannel('email')}
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-xs font-medium transition-all ${
                      channel === 'email'
                        ? 'bg-brand-500/10 border-brand-500 text-brand-400 shadow-md shadow-brand-500/10'
                        : 'bg-dark-surface border-dark-border text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Mail className="w-4 h-4" />
                    <span>Email</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setChannel('whatsapp')}
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-xs font-medium transition-all ${
                      channel === 'whatsapp'
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-md shadow-emerald-500/10'
                        : 'bg-dark-surface border-dark-border text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setChannel('sms')}
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-xs font-medium transition-all ${
                      channel === 'sms'
                        ? 'bg-blue-500/10 border-blue-500 text-blue-400 shadow-md shadow-blue-500/10'
                        : 'bg-dark-surface border-dark-border text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>SMS</span>
                  </button>
                </div>
              </div>

              {/* Segment & Template Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Target Audience Segment"
                  value={selectedSegmentId}
                  onChange={(e) => setSelectedSegmentId(e.target.value)}
                  options={segmentOptions}
                />
                <Select
                  label="Load Saved Template"
                  value={selectedTemplateId}
                  onChange={(e) => handleSelectTemplate(e.target.value)}
                  options={templateOptions}
                />
              </div>
            </div>
          </Card>

          {/* Creative Content Editor */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
                Creative Editor ({channel.toUpperCase()})
              </h3>
              {channel === 'sms' && (
                <span className="text-2xs font-mono text-slate-400">
                  {smsStats.len} characters ({smsStats.parts} SMS segment{smsStats.parts > 1 ? 's' : ''})
                </span>
              )}
            </div>

            {/* Variable Insertion Buttons */}
            <div className="space-y-1.5">
              <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider block">
                Insert Personalization Tokens:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {TEMPLATE_VARIABLES.map((v) => (
                  <button
                    key={v.key}
                    type="button"
                    onClick={() => insertVariable(v.key)}
                    className="text-xs bg-dark-surface hover:bg-dark-border text-brand-300 hover:text-brand-200 border border-dark-border px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 font-mono"
                  >
                    <span>{v.key}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Subject Line (Email Only) */}
            {channel === 'email' && (
              <Input
                label="Email Subject Line *"
                placeholder="e.g. Special Offer for {{company}}"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            )}

            {/* Main Content Body */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">
                Message Body *
              </label>
              <textarea
                rows={channel === 'sms' ? 4 : channel === 'whatsapp' ? 6 : 9}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write your campaign content here..."
                className="w-full rounded-lg bg-dark-surface border border-dark-border text-slate-100 placeholder-slate-500 text-sm p-3 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-colors font-mono leading-relaxed"
              />
            </div>
          </Card>

          {/* Schedule & Delivery Trigger */}
          <Card className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4 text-violet-400" />
              Schedule & Dispatch Settings
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                onClick={() => setSendOption('now')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  sendOption === 'now'
                    ? 'bg-brand-500/10 border-brand-500 text-slate-100'
                    : 'bg-dark-surface/50 border-dark-border text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5 font-semibold text-sm">
                  <Send className="w-4 h-4 text-brand-400" />
                  <span>Send Immediately</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Queue and dispatch messages to all CRM segment members right now.
                </p>
              </div>

              <div
                onClick={() => setSendOption('schedule')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  sendOption === 'schedule'
                    ? 'bg-violet-500/10 border-violet-500 text-slate-100'
                    : 'bg-dark-surface/50 border-dark-border text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5 font-semibold text-sm">
                  <Clock className="w-4 h-4 text-violet-400" />
                  <span>Schedule for Later</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Specify exact date and time for automated background dispatch.
                </p>
              </div>
            </div>

            {sendOption === 'schedule' && (
              <div className="pt-2">
                <Input
                  type="datetime-local"
                  label="Dispatch Date & Time"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                />
              </div>
            )}
          </Card>
        </div>

        {/* Right Live Preview Pane (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="bg-gradient-to-b from-dark-card to-dark-surface border border-dark-border sticky top-6 space-y-4">
            {/* Toolbar Header */}
            <div className="flex items-center justify-between border-b border-dark-border pb-3">
              <div className="flex items-center gap-2">
                <Badge variant="emerald" dot size="sm">
                  Live Live Preview
                </Badge>
              </div>

              <div className="flex items-center bg-dark-surface rounded-lg p-0.5 border border-dark-border">
                <button
                  type="button"
                  onClick={() => setPreviewDevice('mobile')}
                  className={`p-1.5 rounded-md text-xs font-medium transition-colors ${
                    previewDevice === 'mobile'
                      ? 'bg-dark-card text-brand-400 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Mobile View"
                >
                  <Smartphone className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('desktop')}
                  className={`p-1.5 rounded-md text-xs font-medium transition-colors ${
                    previewDevice === 'desktop'
                      ? 'bg-dark-card text-brand-400 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Desktop View"
                >
                  <Monitor className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Contact Persona Switcher */}
            <div className="space-y-1">
              <label className="block text-2xs font-semibold text-slate-400 uppercase tracking-wider">
                Previewing as Lead Persona:
              </label>
              <select
                value={selectedLeadIndex}
                onChange={(e) => setSelectedLeadIndex(Number(e.target.value))}
                className="block w-full rounded-lg bg-dark-surface border border-dark-border text-slate-200 text-xs py-1.5 px-2.5 focus:outline-none"
              >
                {crmLeads.map((lead, idx) => (
                  <option key={lead.id} value={idx}>
                    {lead.contact_person || lead.name} ({lead.company_name || 'CRM Lead'})
                  </option>
                ))}
              </select>
            </div>

            {/* Device Container Frame */}
            <div className="pt-2 flex justify-center">
              {/* Mobile Phone Mockup */}
              {previewDevice === 'mobile' ? (
                <div className="w-full max-w-[340px] bg-slate-900 border-4 border-slate-700 rounded-[32px] p-3 shadow-2xl space-y-3 relative overflow-hidden">
                  {/* Phone Notch */}
                  <div className="w-28 h-4 bg-slate-800 rounded-b-xl mx-auto flex items-center justify-center gap-2">
                    <div className="w-2.5 h-2.5 bg-slate-900 rounded-full" />
                    <div className="w-8 h-1 bg-slate-700 rounded-full" />
                  </div>

                  {/* Phone Display Content */}
                  <div className="bg-slate-950 min-h-[440px] max-h-[480px] overflow-y-auto rounded-2xl p-3 text-slate-100 space-y-3 text-xs">
                    {channel === 'email' && (
                      <div className="space-y-3 bg-slate-900 p-3 rounded-xl border border-slate-800">
                        <div className="border-b border-slate-800 pb-2 space-y-1">
                          <div className="text-2xs text-slate-400">
                            From: <span className="text-slate-200 font-medium">Vortiq Marketing &lt;outreach@vortiq.app&gt;</span>
                          </div>
                          <div className="text-2xs text-slate-400">
                            To: <span className="text-slate-200 font-medium">{activeLead?.email || 'priya@fintechcorp.in'}</span>
                          </div>
                          <div className="font-bold text-slate-100 text-xs pt-1">
                            {renderedSubject || 'Subject Line'}
                          </div>
                        </div>
                        <div className="whitespace-pre-wrap text-slate-300 leading-relaxed text-xs">
                          {renderedBody}
                        </div>
                        <div className="pt-3 text-center border-t border-slate-800">
                          <button className="bg-brand-500 text-dark-bg font-bold px-4 py-2 rounded-lg text-xs w-full">
                            View Offer & Booking Link
                          </button>
                        </div>
                      </div>
                    )}

                    {channel === 'whatsapp' && (
                      <div className="space-y-2">
                        {/* WhatsApp Header */}
                        <div className="bg-emerald-800 p-2 rounded-lg flex items-center gap-2 text-white">
                          <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-2xs">
                            VQ
                          </div>
                          <div>
                            <div className="font-bold text-2xs">Vortiq Business</div>
                            <div className="text-[10px] text-emerald-200">Official Account</div>
                          </div>
                        </div>

                        {/* WhatsApp Bubble */}
                        <div className="bg-emerald-950 border border-emerald-800/60 p-3 rounded-xl text-slate-200 whitespace-pre-wrap leading-relaxed shadow-md">
                          {renderedBody}
                          <div className="text-[9px] text-emerald-400 text-right mt-1 font-mono">
                            10:42 AM ✓✓
                          </div>
                        </div>
                      </div>
                    )}

                    {channel === 'sms' && (
                      <div className="space-y-2">
                        <div className="text-center text-[10px] text-slate-500 font-mono">
                          SMS Message • Today 10:42 AM
                        </div>
                        <div className="bg-blue-600 text-white p-3 rounded-2xl rounded-tl-sm whitespace-pre-wrap leading-relaxed max-w-[90%] ml-auto">
                          {renderedBody}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Phone Home Bar */}
                  <div className="w-24 h-1 bg-slate-600 rounded-full mx-auto" />
                </div>
              ) : (
                /* Desktop Browser Frame */
                <div className="w-full bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-2xl">
                  {/* Browser Bar */}
                  <div className="bg-slate-800 px-3 py-2 flex items-center gap-2 border-b border-slate-700">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    </div>
                    <div className="flex-1 bg-slate-950 rounded-md px-3 py-1 text-[11px] text-slate-400 font-mono truncate">
                      https://outreach.vortiq.app/preview/{channel}
                    </div>
                  </div>

                  {/* Desktop Preview Body */}
                  <div className="p-4 bg-slate-950 min-h-[380px] max-h-[420px] overflow-y-auto text-slate-200">
                    {channel === 'email' ? (
                      <div className="max-w-md mx-auto bg-slate-900 rounded-xl p-5 border border-slate-800 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                          <div className="font-bold text-brand-400 text-sm">VOR TIQ</div>
                          <span className="text-2xs text-slate-400 font-mono">HTML Email</span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-100">{renderedSubject}</h4>
                        <div className="whitespace-pre-wrap text-xs text-slate-300 leading-relaxed">
                          {renderedBody}
                        </div>
                        <div className="pt-2 text-center">
                          <button className="bg-brand-500 text-slate-950 font-bold px-6 py-2.5 rounded-lg text-xs shadow-lg shadow-brand-500/20">
                            Book Introductory Walkthrough
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="max-w-sm mx-auto bg-slate-900 rounded-xl p-4 border border-slate-800 space-y-2">
                        <div className="text-2xs text-slate-400 uppercase font-mono font-bold">
                          {channel.toUpperCase()} Preview
                        </div>
                        <div className="whitespace-pre-wrap text-xs text-slate-200 bg-slate-950 p-3 rounded-lg border border-slate-800">
                          {renderedBody}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Test Send Modal */}
      <Modal
        isOpen={isTestSendOpen}
        onClose={() => {
          setIsTestSendOpen(false);
          setTestSentSuccess(false);
        }}
        title="Send Test Message"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-400">
            Dispatch a test sample of this campaign to your email or test inbox to verify formatting and mobile responsiveness.
          </p>

          <Input
            label="Destination Test Email / Phone"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
          />

          {testSentSuccess && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Test message successfully dispatched to {testEmail}!</span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsTestSendOpen(false)}
            >
              Close
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setTestSentSuccess(true);
              }}
              leftIcon={<Send className="w-3.5 h-3.5" />}
            >
              Send Test Sample
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
