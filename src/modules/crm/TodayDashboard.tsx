import React from 'react';
import { Button, Badge, Avatar } from '@/design-system';
import { CrmFollowup, FOLLOWUP_TYPES } from './types';
import {
  Calendar,
  AlertCircle,
  Clock,
  CheckCircle2,
  RefreshCw,
  ChevronRight,
} from 'lucide-react';

interface TodayDashboardProps {
  followups: CrmFollowup[];
  onLeadClick: (leadId: string) => void;
  onMarkDone: (followupId: string) => void;
  onReschedule: (followup: CrmFollowup) => void;
}

export const TodayDashboard: React.FC<TodayDashboardProps> = ({
  followups,
  onLeadClick,
  onMarkDone,
  onReschedule,
}) => {
  const today = new Date().toISOString().split('T')[0];

  const pending = followups.filter(f => f.status === 'pending');
  const overdue = pending.filter(f => f.due_date < today).sort((a, b) => a.due_date.localeCompare(b.due_date));
  const dueToday = pending.filter(f => f.due_date === today);
  const upcoming = pending.filter(f => f.due_date > today)
    .sort((a, b) => a.due_date.localeCompare(b.due_date))
    .slice(0, 10);

  const typeLabelMap = Object.fromEntries(FOLLOWUP_TYPES.map(t => [t.value, t.label]));

  const daysDiff = (date: string) => {
    const d = new Date(date).getTime();
    const now = new Date().setHours(0, 0, 0, 0);
    return Math.round((d - now) / 86400000);
  };

  function FollowupCard({ followup, variant }: { followup: CrmFollowup; variant: 'overdue' | 'today' | 'upcoming' }) {
    const daysNum = daysDiff(followup.due_date);
    const dueDateStr = new Date(followup.due_date).toLocaleDateString('en-IN', {
      weekday: 'short', day: 'numeric', month: 'short',
    });

    return (
      <div className={`flex items-start gap-3 p-4 rounded-xl border transition-all group ${
        variant === 'overdue'
          ? 'border-rose-500/30 bg-rose-500/5 hover:bg-rose-500/8'
          : variant === 'today'
          ? 'border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/8'
          : 'border-dark-border/60 bg-dark-surface/20 hover:bg-dark-surface/40'
      }`}>
        {/* Left: status indicator */}
        <div className="mt-0.5 shrink-0">
          {variant === 'overdue' && <AlertCircle className="w-4 h-4 text-rose-400" />}
          {variant === 'today' && <Clock className="w-4 h-4 text-amber-400" />}
          {variant === 'upcoming' && <Calendar className="w-4 h-4 text-slate-500" />}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-200 truncate">{followup.lead_title}</p>
              <div className="flex items-center gap-2 flex-wrap mt-0.5">
                <Badge
                  variant={variant === 'overdue' ? 'rose' : variant === 'today' ? 'amber' : 'slate'}
                  size="sm"
                >
                  {typeLabelMap[followup.type]}
                </Badge>
                {followup.assignee_name && (
                  <div className="flex items-center gap-1 text-2xs text-slate-500">
                    <Avatar name={followup.assignee_name} size="sm" />
                    <span>{followup.assignee_name}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Due date badge */}
            <div className={`shrink-0 font-mono text-2xs font-bold px-2 py-1 rounded-lg ${
              variant === 'overdue'
                ? 'text-rose-300 bg-rose-500/10'
                : variant === 'today'
                ? 'text-amber-300 bg-amber-500/10'
                : 'text-slate-400 bg-dark-surface'
            }`}>
              {variant === 'overdue' ? `${Math.abs(daysNum)}d overdue` :
               variant === 'today' ? 'Today' :
               daysNum === 1 ? 'Tomorrow' : `in ${daysNum}d`}
            </div>
          </div>

          {followup.notes && (
            <p className="text-2xs text-slate-500 line-clamp-1 italic">"{followup.notes}"</p>
          )}

          <p className="text-2xs font-mono text-slate-600">{dueDateStr}</p>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
              onClick={() => onMarkDone(followup.id)}
              className="text-xs"
            >
              Mark Done
            </Button>
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              onClick={() => onReschedule(followup)}
              className="text-xs"
            >
              Reschedule
            </Button>
            <button
              onClick={() => onLeadClick(followup.lead_id)}
              className="ml-auto flex items-center gap-0.5 text-2xs text-slate-500 hover:text-brand-400 transition-colors opacity-0 group-hover:opacity-100"
            >
              Open Lead <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  function Section({
    title, count, variant, items, emptyText,
  }: {
    title: string;
    count: number;
    variant: 'overdue' | 'today' | 'upcoming';
    items: CrmFollowup[];
    emptyText: string;
  }) {
    const headerColor = variant === 'overdue' ? 'text-rose-400' : variant === 'today' ? 'text-amber-400' : 'text-slate-300';
    const countBg = variant === 'overdue' ? 'bg-rose-500/15 text-rose-400' : variant === 'today' ? 'bg-amber-500/15 text-amber-400' : 'bg-dark-surface text-slate-400';

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <h3 className={`text-sm font-bold font-display ${headerColor}`}>{title}</h3>
          <span className={`text-2xs font-mono font-bold px-2 py-0.5 rounded-full ${countBg}`}>{count}</span>
        </div>
        {items.length === 0 ? (
          <p className="text-2xs text-slate-600 italic px-1">{emptyText}</p>
        ) : (
          <div className="space-y-2">
            {items.map(f => <FollowupCard key={f.id} followup={f} variant={variant} />)}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Summary bar */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Overdue', count: overdue.length, color: 'text-rose-400', bg: 'bg-rose-500/5 border-rose-500/20' },
          { label: 'Due Today', count: dueToday.length, color: 'text-amber-400', bg: 'bg-amber-500/5 border-amber-500/20' },
          { label: 'Upcoming', count: upcoming.length, color: 'text-slate-300', bg: 'bg-dark-surface/20 border-dark-border/60' },
        ].map(({ label, count, color, bg }) => (
          <div key={label} className={`p-4 rounded-xl border ${bg} text-center`}>
            <p className={`text-2xl font-bold font-mono ${color}`}>{count}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <Section
        title="Overdue"
        count={overdue.length}
        variant="overdue"
        items={overdue}
        emptyText="No overdue followups. Great job staying on top of things."
      />

      <Section
        title="Due Today"
        count={dueToday.length}
        variant="today"
        items={dueToday}
        emptyText="Nothing due today."
      />

      <Section
        title="Upcoming (next 7 days)"
        count={upcoming.length}
        variant="upcoming"
        items={upcoming}
        emptyText="No upcoming followups scheduled."
      />
    </div>
  );
};
