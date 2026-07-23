import React from 'react';
import { CrmActivity, CrmCall, CrmFollowup, ActivityType, PIPELINE_STAGES } from './types';
import { Badge } from '@/design-system';
import {
  Phone,
  ArrowRightLeft,
  Calendar,
  FileText,
  Edit3,
  Zap,
  Upload,
  CheckCircle2,
  AlertCircle,
  Clock,
  Mic,
} from 'lucide-react';

interface ActivityTimelineProps {
  activities: CrmActivity[];
  calls: Record<string, CrmCall>;
  followups: Record<string, CrmFollowup>;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDateTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays === 0) return `Today ${d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
  if (diffDays === 1) return `Yesterday ${d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) +
    ` · ${d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
}

function groupActivitiesByDay(activities: CrmActivity[]) {
  const groups: { label: string; activities: CrmActivity[] }[] = [];
  const sorted = [...activities].sort(
    (a, b) => new Date(b.performed_at).getTime() - new Date(a.performed_at).getTime()
  );

  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  let currentLabel = '';
  for (const act of sorted) {
    const d = new Date(act.performed_at).toDateString();
    const label = d === today ? 'Today' : d === yesterday ? 'Yesterday' :
      new Date(act.performed_at).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

    if (label !== currentLabel) {
      currentLabel = label;
      groups.push({ label, activities: [] });
    }
    groups[groups.length - 1].activities.push(act);
  }
  return groups;
}

// ── Activity Icon ─────────────────────────────────────────────────────────────

function ActivityIcon({ type }: { type: ActivityType }) {
  const base = 'w-4 h-4 shrink-0';
  switch (type) {
    case 'call_logged':       return <Phone className={`${base} text-teal-400`} />;
    case 'stage_change':      return <ArrowRightLeft className={`${base} text-blue-400`} />;
    case 'reassignment':      return <ArrowRightLeft className={`${base} text-amber-400`} />;
    case 'followup_created':  return <Calendar className={`${base} text-violet-400`} />;
    case 'followup_done':     return <CheckCircle2 className={`${base} text-emerald-400`} />;
    case 'note_added':        return <FileText className={`${base} text-slate-300`} />;
    case 'field_correction':  return <Edit3 className={`${base} text-amber-300`} />;
    case 'lead_created':      return <Zap className={`${base} text-brand-400`} />;
    case 'import_created':    return <Upload className={`${base} text-brand-400`} />;
    default:                  return <AlertCircle className={`${base} text-slate-400`} />;
  }
}

function activityBorderColor(type: ActivityType) {
  switch (type) {
    case 'call_logged':       return 'border-l-teal-500/60';
    case 'stage_change':      return 'border-l-blue-500/60';
    case 'reassignment':      return 'border-l-amber-500/60';
    case 'followup_created':  return 'border-l-violet-500/60';
    case 'followup_done':     return 'border-l-emerald-500/60';
    case 'note_added':        return 'border-l-slate-500/60';
    case 'field_correction':  return 'border-l-amber-400/80';
    case 'lead_created':      return 'border-l-brand-500/60';
    default:                  return 'border-l-slate-600/40';
  }
}

// ── Activity Entry ────────────────────────────────────────────────────────────

function ActivityEntry({ activity, calls, followups }: {
  activity: CrmActivity;
  calls: Record<string, CrmCall>;
  followups: Record<string, CrmFollowup>;
}) {
  const call = activity.call_id ? calls[activity.call_id] : undefined;
  const followup = activity.followup_id ? followups[activity.followup_id] : undefined;
  const stage = (id?: string) => PIPELINE_STAGES.find(s => s.id === id);

  return (
    <div className={`flex gap-3 p-3.5 rounded-xl border border-dark-border/60 bg-dark-surface/30 border-l-2 ${activityBorderColor(activity.type)} hover:bg-dark-surface/50 transition-colors`}>
      {/* Icon */}
      <div className="mt-0.5 shrink-0">
        <ActivityIcon type={activity.type} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1.5">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <span className="text-xs font-semibold text-slate-200">
            {activity.performed_by_name}
          </span>
          <span className="text-2xs font-mono text-slate-500 shrink-0 whitespace-nowrap">
            {formatDateTime(activity.performed_at)}
          </span>
        </div>

        {/* Type-specific body */}
        {activity.type === 'lead_created' && (
          <p className="text-xs text-slate-400">{activity.note || 'Lead added to Sales Pipeline.'}</p>
        )}

        {activity.type === 'import_created' && (
          <p className="text-xs text-slate-400">Lead added via bulk CSV import.</p>
        )}

        {activity.type === 'stage_change' && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-2xs text-slate-400">Stage changed:</span>
            <Badge variant={stage(activity.stage_from)?.badgeVariant || 'slate'} size="sm">
              {stage(activity.stage_from)?.name || activity.stage_from}
            </Badge>
            <ArrowRightLeft className="w-3 h-3 text-slate-500" />
            <Badge variant={stage(activity.stage_to)?.badgeVariant || 'slate'} size="sm">
              {stage(activity.stage_to)?.name || activity.stage_to}
            </Badge>
          </div>
        )}

        {activity.type === 'reassignment' && (
          <div className="flex items-center gap-2 flex-wrap text-2xs text-slate-400">
            <span>Reassigned from</span>
            <span className="font-semibold text-slate-200">{activity.assignee_from_name || 'Unassigned'}</span>
            <span>→</span>
            <span className="font-semibold text-slate-200">{activity.assignee_to_name}</span>
            {activity.note && <span className="text-slate-500">· {activity.note}</span>}
          </div>
        )}

        {activity.type === 'field_correction' && (
          <div className="space-y-1">
            <p className="text-2xs text-slate-400">
              Field <span className="font-mono text-slate-200">{activity.field_name}</span> corrected:
            </p>
            <div className="font-mono text-2xs flex items-center gap-2 flex-wrap">
              <span className="line-through text-rose-400/80">{activity.field_before}</span>
              <ArrowRightLeft className="w-3 h-3 text-slate-500" />
              <span className="text-emerald-400">{activity.field_after}</span>
            </div>
            {activity.note && <p className="text-2xs text-slate-500 italic">{activity.note}</p>}
          </div>
        )}

        {activity.type === 'call_logged' && call && (
          <div className="space-y-2">
            <div className="flex items-center gap-3 flex-wrap text-2xs text-slate-300">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-500" />
                {call.duration_minutes} min
              </span>
              <Badge
                variant={call.outcome === 'meeting_booked' ? 'emerald' : call.outcome === 'not_interested' ? 'rose' : 'slate'}
                size="sm"
              >
                {call.outcome.replace(/_/g, ' ')}
              </Badge>
              {call.voice_note_filename && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-teal-500/10 text-teal-400 border border-teal-500/30">
                  <Mic className="w-3 h-3" />
                  Voice note
                </span>
              )}
            </div>
            {call.notes && (
              <p className="text-2xs text-slate-400 leading-relaxed bg-dark-bg/40 p-2 rounded-lg border border-dark-border/40">
                {call.notes}
              </p>
            )}
          </div>
        )}

        {activity.type === 'call_logged' && !call && activity.note && (
          <p className="text-2xs text-slate-400 leading-relaxed">{activity.note}</p>
        )}

        {activity.type === 'followup_created' && followup && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap text-2xs text-slate-300">
              <Badge variant="violet" size="sm">{followup.type.replace(/_/g, ' ')}</Badge>
              <span className="text-slate-400">Due:</span>
              <span className="font-mono">{new Date(followup.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
              {followup.assignee_name && (
                <span className="text-slate-400">→ {followup.assignee_name}</span>
              )}
            </div>
            {followup.notes && (
              <p className="text-2xs text-slate-500 italic">{followup.notes}</p>
            )}
          </div>
        )}

        {activity.type === 'followup_done' && (
          <p className="text-2xs text-emerald-400">Followup marked as completed.</p>
        )}

        {activity.type === 'note_added' && activity.note && (
          <p className="text-xs text-slate-300 leading-relaxed bg-dark-bg/40 p-2.5 rounded-lg border border-dark-border/40 italic">
            "{activity.note}"
          </p>
        )}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
  activities,
  calls,
  followups,
}) => {
  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-12 h-12 rounded-full bg-dark-surface border border-dark-border flex items-center justify-center mb-3">
          <Clock className="w-6 h-6 text-slate-500" />
        </div>
        <p className="text-sm font-semibold text-slate-300">No activity yet</p>
        <p className="text-2xs text-slate-500 mt-1">Log a call or add a note to start this lead's history.</p>
      </div>
    );
  }

  const groups = groupActivitiesByDay(activities);

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <div key={group.label}>
          {/* Day separator */}
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px flex-1 bg-dark-border/60" />
            <span className="text-2xs font-mono font-semibold text-slate-500 uppercase tracking-wider px-2 py-0.5 rounded-full bg-dark-surface border border-dark-border/60">
              {group.label}
            </span>
            <div className="h-px flex-1 bg-dark-border/60" />
          </div>

          {/* Events */}
          <div className="space-y-2">
            {group.activities.map((act) => (
              <ActivityEntry
                key={act.id}
                activity={act}
                calls={calls}
                followups={followups}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
