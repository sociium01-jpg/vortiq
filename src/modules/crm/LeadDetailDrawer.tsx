import React, { useState } from 'react';
import {
  Drawer,
  Button,
  Input,
  Select,
  Badge,
  Avatar,
  Card,
  EmptyState,
} from '@/design-system';
import {
  CrmLead,
  CrmPipelineStage,
  CrmActivity,
  ActivityType,
  NewActivityFormData,
} from './types';
import {
  PhoneCall,
  Users,
  FileText,
  Mail,
  GitCommit,
  Plus,
  Building2,
  Mail as MailIcon,
  Phone as PhoneIcon,
  Calendar,
  IndianRupee,
  Clock,
  Send,
  UserCheck,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

export interface LeadDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  lead: CrmLead | null;
  stages: CrmPipelineStage[];
  activities: CrmActivity[];
  onStageChange: (leadId: string, newStageId: string) => void;
  onStatusChange: (leadId: string, newStatus: 'open' | 'won' | 'lost' | 'nurture') => void;
  onAddActivity: (leadId: string, data: NewActivityFormData) => void;
}

export const LeadDetailDrawer: React.FC<LeadDetailDrawerProps> = ({
  isOpen,
  onClose,
  lead,
  stages,
  activities,
  onStageChange,
  onStatusChange,
  onAddActivity,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'activities'>('overview');
  
  // Activity Form State
  const [activityType, setActivityType] = useState<ActivityType>('call');
  const [activityTitle, setActivityTitle] = useState('');
  const [activityNotes, setActivityNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!lead) return null;

  const leadActivities = activities.filter((a) => a.lead_id === lead.id);

  const handleAddActivitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityTitle.trim()) return;

    setIsSubmitting(true);
    onAddActivity(lead.id, {
      activity_type: activityType,
      title: activityTitle.trim(),
      notes: activityNotes.trim(),
    });

    setActivityTitle('');
    setActivityNotes('');
    setIsSubmitting(false);
  };

  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case 'call':
        return <PhoneCall className="w-4 h-4 text-emerald-400" />;
      case 'meeting':
        return <Users className="w-4 h-4 text-blue-400" />;
      case 'email':
        return <Mail className="w-4 h-4 text-amber-400" />;
      case 'stage_change':
        return <GitCommit className="w-4 h-4 text-violet-400" />;
      default:
        return <FileText className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'won':
        return 'emerald';
      case 'lost':
        return 'rose';
      case 'nurture':
        return 'amber';
      default:
        return 'blue';
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Lead Management Inspector"
      width="lg"
    >
      <div className="space-y-5">
        {/* Header Hero Section */}
        <div className="p-4 bg-gradient-to-r from-dark-surface via-dark-card to-dark-surface border border-dark-border rounded-xl space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-100 font-display">
                {lead.title}
              </h3>
              {lead.company_name && (
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                  <Building2 className="w-3.5 h-3.5 text-brand-400" />
                  <span className="font-medium text-slate-200">{lead.company_name}</span>
                </div>
              )}
            </div>

            <Badge variant={getStatusVariant(lead.status)} dot size="md">
              {lead.status.toUpperCase()}
            </Badge>
          </div>

          {/* Key Deal Metrics */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-dark-border/60">
            <div>
              <span className="text-3xs uppercase tracking-wider text-slate-400">
                Estimated Deal Value
              </span>
              <div className="text-base font-bold font-mono text-emerald-400 flex items-center gap-1 mt-0.5">
                <IndianRupee className="w-4 h-4 shrink-0" />
                <span>{lead.estimated_value ? lead.estimated_value.toLocaleString('en-IN') : '0'}</span>
              </div>
            </div>

            <div>
              <span className="text-3xs uppercase tracking-wider text-slate-400">
                Current Pipeline Stage
              </span>
              <div className="mt-1">
                <Select
                  value={lead.stage_id}
                  onChange={(e) => onStageChange(lead.id, e.target.value)}
                  options={stages.map((s) => ({ value: s.id, label: s.name }))}
                  className="text-xs py-1 px-2 h-8"
                />
              </div>
            </div>
          </div>

          {/* Quick Outcome Actions */}
          <div className="pt-2 border-t border-dark-border/40 flex items-center justify-between gap-2">
            <span className="text-2xs text-slate-400">Quick Status Update:</span>
            <div className="flex items-center gap-2">
              {lead.status !== 'won' && (
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                  onClick={() => onStatusChange(lead.id, 'won')}
                  className="border-emerald-500/30 hover:bg-emerald-500/10 text-emerald-300"
                >
                  Mark Won
                </Button>
              )}
              {lead.status !== 'lost' && (
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<XCircle className="w-3.5 h-3.5 text-rose-400" />}
                  onClick={() => onStatusChange(lead.id, 'lost')}
                  className="border-rose-500/30 hover:bg-rose-500/10 text-rose-300"
                >
                  Mark Lost
                </Button>
              )}
              {lead.status !== 'open' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onStatusChange(lead.id, 'open')}
                >
                  Reopen
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-dark-border">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-2.5 px-4 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-brand-500 text-brand-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Lead Overview
          </button>
          <button
            onClick={() => setActiveTab('activities')}
            className={`pb-2.5 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'activities'
                ? 'border-brand-500 text-brand-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Activity Timeline
            <span className="text-3xs font-mono px-1.5 py-0.5 rounded-full bg-dark-surface border border-dark-border text-slate-300">
              {leadActivities.length}
            </span>
          </button>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-4 text-xs">
            {/* Contact Details Card */}
            <Card className="space-y-3 p-4">
              <h4 className="font-semibold text-slate-200 font-display text-xs border-b border-dark-border/60 pb-2">
                Primary Contact Information
              </h4>
              
              <div className="grid grid-cols-1 gap-2.5 text-slate-300">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                    Contact Name
                  </span>
                  <span className="font-semibold text-slate-100">{lead.contact_person}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <MailIcon className="w-3.5 h-3.5 text-slate-500" />
                    Email
                  </span>
                  <a
                    href={`mailto:${lead.email}`}
                    className="text-brand-400 hover:underline font-mono"
                  >
                    {lead.email || 'Not provided'}
                  </a>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <PhoneIcon className="w-3.5 h-3.5 text-slate-500" />
                    Phone
                  </span>
                  <a
                    href={`tel:${lead.phone}`}
                    className="text-slate-200 font-mono hover:text-brand-400"
                  >
                    {lead.phone || 'Not provided'}
                  </a>
                </div>
              </div>
            </Card>

            {/* Deal Attributes Card */}
            <Card className="space-y-3 p-4">
              <h4 className="font-semibold text-slate-200 font-display text-xs border-b border-dark-border/60 pb-2">
                Sales & Pipeline Metadata
              </h4>

              <div className="grid grid-cols-2 gap-3 text-slate-300">
                <div>
                  <span className="text-slate-400 text-3xs block mb-1">Assigned Owner</span>
                  <div className="flex items-center gap-2">
                    <Avatar name={lead.assigned_to_name || 'Unassigned'} size="sm" />
                    <span className="font-medium text-slate-200">{lead.assigned_to_name || 'Unassigned'}</span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 text-3xs block mb-1">Priority Level</span>
                  <Badge variant={lead.priority === 'urgent' ? 'rose' : lead.priority === 'high' ? 'amber' : 'blue'}>
                    {lead.priority || 'medium'}
                  </Badge>
                </div>

                <div>
                  <span className="text-slate-400 text-3xs block mb-1">Win Probability</span>
                  <span className="font-mono text-brand-400 font-semibold">{lead.probability || 50}%</span>
                </div>

                <div>
                  <span className="text-slate-400 text-3xs block mb-1">Target Close Date</span>
                  <span className="font-mono text-slate-300 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    {lead.expected_close_date || 'TBD'}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Tab 2: Activity Log & Add Form */}
        {activeTab === 'activities' && (
          <div className="space-y-5">
            {/* Log New Activity Form Card */}
            <Card className="p-4 space-y-3 border-brand-500/30">
              <h4 className="text-xs font-semibold text-slate-100 font-display flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-brand-400" />
                Log Call, Meeting, or Note
              </h4>

              <form onSubmit={handleAddActivitySubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Select
                    label="Activity Type"
                    value={activityType}
                    onChange={(e) => setActivityType(e.target.value as ActivityType)}
                    options={[
                      { value: 'call', label: 'Call Log' },
                      { value: 'meeting', label: 'Meeting' },
                      { value: 'note', label: 'Note' },
                      { value: 'email', label: 'Email' },
                    ]}
                  />

                  <div className="sm:col-span-2">
                    <Input
                      label="Subject / Summary"
                      placeholder="e.g. Discussed proposal pricing terms"
                      value={activityTitle}
                      onChange={(e) => setActivityTitle(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Detailed Notes & Takeaways
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter key conversation points, next action items..."
                    value={activityNotes}
                    onChange={(e) => setActivityNotes(e.target.value)}
                    className="block w-full rounded-lg bg-dark-surface border border-dark-border text-slate-100 placeholder-slate-500 text-xs p-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-colors"
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    isLoading={isSubmitting}
                    leftIcon={<Send className="w-3 h-3" />}
                  >
                    Save Activity
                  </Button>
                </div>
              </form>
            </Card>

            {/* Timeline of Past Activities */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-display">
                History & Timeline ({leadActivities.length})
              </h4>

              {leadActivities.length === 0 ? (
                <EmptyState
                  title="No Activities Logged Yet"
                  description="Use the form above to log your first call, meeting note, or email update for this lead."
                />
              ) : (
                <div className="relative pl-4 border-l-2 border-dark-border space-y-4">
                  {leadActivities.map((act) => (
                    <div key={act.id} className="relative group">
                      {/* Timeline Node Icon */}
                      <div className="absolute -left-[25px] top-0.5 p-1 bg-dark-card border border-dark-border rounded-full shadow-sm">
                        {getActivityIcon(act.activity_type)}
                      </div>

                      {/* Activity Card Content */}
                      <Card className="p-3 space-y-1.5">
                        <div className="flex items-center justify-between text-2xs">
                          <span className="font-semibold text-slate-100 font-display">
                            {act.title}
                          </span>
                          <span className="text-slate-400 font-mono flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-500" />
                            {new Date(act.created_at).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        {act.notes && (
                          <p className="text-xs text-slate-300 leading-relaxed bg-dark-surface/50 p-2 rounded border border-dark-border/40">
                            {act.notes}
                          </p>
                        )}

                        <div className="flex items-center justify-between text-3xs text-slate-400 pt-1">
                          <span>
                            By: <strong className="text-slate-200">{act.performed_by}</strong>
                          </span>
                          <Badge variant="slate" size="sm">
                            {act.activity_type}
                          </Badge>
                        </div>
                      </Card>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Drawer>
  );
};
