// ─────────────────────────────────────────────────────────────
// Vortiq User Notification Preference Manager
// Per-user channel toggles (Email, SMS, WhatsApp, In-App) & deletion alerts
// ─────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { Card, Button } from '@/design-system';
import { Bell, Mail, MessageSquare, Phone, CheckCircle2, ShieldAlert } from 'lucide-react';

export const NotificationPreferenceManager: React.FC = () => {
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [whatsappEnabled, setWhatsappEnabled] = useState(true);
  const [inAppEnabled, setInAppEnabled] = useState(true);
  const [notifyDeletions, setNotifyDeletions] = useState(true);
  const [notifySalaryChanges, setNotifySalaryChanges] = useState(true);
  const [saveNotification, setSaveNotification] = useState<string | null>(null);

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveNotification('Notification preferences saved successfully!');
    setTimeout(() => setSaveNotification(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {saveNotification && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-2xs text-emerald-300 flex items-center gap-2 animate-pulse font-mono">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{saveNotification}</span>
        </div>
      )}

      {/* Preferences Form Card */}
      <Card className="p-5 bg-dark-card border-dark-border space-y-4">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-display flex items-center gap-2">
            <Bell className="w-4 h-4 text-brand-400" />
            User Notification Channel Preferences & Alert Triggers
          </h4>
          <p className="text-2xs text-slate-400 mt-0.5">Configure preferred alert delivery channels and high-priority event triggers</p>
        </div>

        <form onSubmit={handleSavePreferences} className="space-y-4 text-xs font-mono">
          {/* Channels Selection */}
          <div className="space-y-2 p-4 bg-dark-surface rounded-xl border border-dark-border">
            <h5 className="font-bold text-slate-200 font-display uppercase text-2xs tracking-wider">Alert Delivery Channels</h5>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <label className="p-3 bg-dark-card border border-dark-border rounded-lg flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={emailEnabled} onChange={(e) => setEmailEnabled(e.target.checked)} />
                <Mail className="w-3.5 h-3.5 text-brand-400" /> Email Alerts
              </label>
              <label className="p-3 bg-dark-card border border-dark-border rounded-lg flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={smsEnabled} onChange={(e) => setSmsEnabled(e.target.checked)} />
                <Phone className="w-3.5 h-3.5 text-emerald-400" /> SMS Alerts
              </label>
              <label className="p-3 bg-dark-card border border-dark-border rounded-lg flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={whatsappEnabled} onChange={(e) => setWhatsappEnabled(e.target.checked)} />
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400" /> WhatsApp
              </label>
              <label className="p-3 bg-dark-card border border-dark-border rounded-lg flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={inAppEnabled} onChange={(e) => setInAppEnabled(e.target.checked)} />
                <Bell className="w-3.5 h-3.5 text-violet-400" /> In-App Center
              </label>
            </div>
          </div>

          {/* Event Triggers */}
          <div className="space-y-2 p-4 bg-dark-surface rounded-xl border border-dark-border">
            <h5 className="font-bold text-slate-200 font-display uppercase text-2xs tracking-wider">Event Triggers & Master Directive Compliance</h5>
            <div className="space-y-2 pt-1">
              <label className="p-3 bg-dark-card border border-dark-border rounded-lg flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={notifyDeletions} onChange={(e) => setNotifyDeletions(e.target.checked)} />
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" /> Highest-Visibility Alert on Financial & Record Deletions
              </label>
              <label className="p-3 bg-dark-card border border-dark-border rounded-lg flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={notifySalaryChanges} onChange={(e) => setNotifySalaryChanges(e.target.checked)} />
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" /> Security Alert on Employee Compensation Modifications
              </label>
            </div>
          </div>

          <Button variant="primary" size="md" className="w-full" type="submit" leftIcon={<Bell className="w-4 h-4" />}>
            Save Notification Preferences
          </Button>
        </form>
      </Card>
    </div>
  );
};
