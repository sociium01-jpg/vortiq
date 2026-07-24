// ─────────────────────────────────────────────────────────────
// Vortiq Rep Meeting Scheduling Links & Macro Snippets
// Meeting booking links generator & canned response templates
// ─────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { Card, Button, Badge } from '@/design-system';
import { SchedulingLink, CannedResponse, SEED_SCHEDULING_LINKS, SEED_CANNED_RESPONSES } from './types';
import { Calendar, Copy, Check, MessageSquare } from 'lucide-react';

export const SchedulingLinkGenerator: React.FC = () => {
  const [links] = useState<SchedulingLink[]>(SEED_SCHEDULING_LINKS);
  const [canned] = useState<CannedResponse[]>(SEED_CANNED_RESPONSES);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyLink = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Scheduling Links */}
      <Card className="p-5 bg-dark-card border-dark-border space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-display flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand-400" />
              Rep Meeting Scheduling Links (HubSpot Parity)
            </h4>
            <p className="text-2xs text-slate-400 mt-0.5">Share booking links directly with prospects for instant calendar sync</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {links.map((lnk) => (
            <div key={lnk.id} className="p-3.5 bg-dark-surface/60 rounded-xl border border-dark-border space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-100 font-display">{lnk.title}</p>
                  <p className="text-2xs text-slate-400 font-mono">{lnk.duration_minutes} Minutes • Mon–Fri</p>
                </div>
                <Badge variant="emerald" size="sm">Active</Badge>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  readOnly
                  value={lnk.booking_url}
                  className="flex-1 px-2.5 py-1 bg-dark-bg border border-dark-border rounded-lg text-2xs font-mono text-slate-300"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyLink(lnk.id, lnk.booking_url)}
                  leftIcon={copiedId === lnk.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                >
                  {copiedId === lnk.id ? 'Copied' : 'Copy'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Canned Responses / Macros */}
      <Card className="p-5 bg-dark-card border-dark-border space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-display flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-amber-400" />
              Macros & Canned Responses
            </h4>
            <p className="text-2xs text-slate-400 mt-0.5">Type shortcuts (e.g. <code className="text-amber-300 font-mono">/pricing</code>) in notes or emails to expand templates</p>
          </div>
        </div>

        <div className="space-y-2">
          {canned.map((cn) => (
            <div key={cn.id} className="p-3 bg-dark-surface/60 rounded-xl border border-dark-border space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-amber-400 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30">
                    {cn.shortcut}
                  </span>
                  <span className="text-xs font-bold text-slate-200 font-display">{cn.title}</span>
                </div>
                <Badge variant="slate" size="sm">{cn.category}</Badge>
              </div>
              <p className="text-2xs text-slate-400 font-sans line-clamp-2 leading-relaxed pl-1">{cn.body}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
