// ─────────────────────────────────────────────────────────────
// Vortiq Internal Ops — Alerts Center
// Internal ops alerts feed for trial expirations & overdue accounts
// ─────────────────────────────────────────────────────────────

import React from 'react';
import { Card, Button, Badge } from '@/design-system';
import { OpsAlert } from './types';
import { ShieldAlert, Clock, CheckCircle2, Mail } from 'lucide-react';

interface OpsAlertsCenterProps {
  alerts: OpsAlert[];
  onMarkRead: (alertId: string) => void;
}

export const OpsAlertsCenter: React.FC<OpsAlertsCenterProps> = ({
  alerts,
  onMarkRead,
}) => {
  const unreadCount = alerts.filter((a) => !a.read).length;

  return (
    <Card className="p-5 bg-dark-card border-dark-border space-y-4 font-mono text-xs">
      <div className="flex items-center justify-between border-b border-dark-border pb-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-amber-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-display">
            Internal Operations Automated Alert Feed
          </h3>
          {unreadCount > 0 && (
            <Badge variant="rose" size="sm" className="font-mono font-bold">
              {unreadCount} Unread
            </Badge>
          )}
        </div>
        <span className="text-2xs text-slate-400">Target: Internal Ops Team Inbox</span>
      </div>

      <div className="space-y-3">
        {alerts.length === 0 ? (
          <div className="p-8 text-center text-slate-500 font-sans text-xs">
            No active internal ops alerts.
          </div>
        ) : (
          alerts.map((item) => (
            <div
              key={item.id}
              className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                item.severity === 'high'
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-200'
                  : item.severity === 'warning'
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                  : 'bg-dark-surface border-dark-border text-slate-300'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold font-display text-slate-100 text-xs">{item.org_name}</span>
                  <Badge
                    variant={item.severity === 'high' ? 'rose' : 'amber'}
                    size="sm"
                    className="uppercase font-mono text-2xs"
                  >
                    {item.alert_type.replace('_', ' ')}
                  </Badge>
                </div>
                <p className="text-2xs font-mono">{item.message}</p>
                <div className="flex items-center gap-3 text-2xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" /> Due: {item.due_date}
                  </span>
                  <span>Logged: {new Date(item.created_at).toLocaleTimeString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<Mail className="w-3 h-3 text-emerald-400" />}
                  onClick={() => alert(`Email follow-up queued for ${item.org_name}`)}
                >
                  Follow-up Client
                </Button>
                {!item.read && (
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<CheckCircle2 className="w-3 h-3 text-slate-300" />}
                    onClick={() => onMarkRead(item.id)}
                  >
                    Mark Read
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};
