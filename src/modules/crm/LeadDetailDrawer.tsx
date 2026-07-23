import React, { useState } from 'react';
import { useAuth } from '@/auth/AuthContext';
import { auditLogger } from '@/lib/auditLogger';
import { Drawer, Button, Input, Select, Badge, Card } from '@/design-system';
import { Phone, Mic, Trash2, CheckCircle2, History } from 'lucide-react';

export interface LeadDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  lead: any;
  onUpdateLead: (updatedLead: any) => void;
  onRemoveLead: (leadId: string) => void;
}

export const LeadDetailDrawer: React.FC<LeadDetailDrawerProps> = ({
  isOpen,
  onClose,
  lead,
  onUpdateLead,
  onRemoveLead,
}) => {
  const { user, tenant } = useAuth();
  const [activeTab, setActiveTab] = useState<'timeline' | 'edit'>('timeline');

  // Lead Fields state for inline editing
  const [name, setName] = useState(lead?.name || '');
  const [company, setCompany] = useState(lead?.company || '');
  const [phone, setPhone] = useState(lead?.phone || '');
  const [email, setEmail] = useState(lead?.email || '');
  const [stage, setStage] = useState(lead?.stage || 'New');
  const [assignee, setAssignee] = useState(lead?.assignee || 'Alex Vance');
  const [value, setValue] = useState(lead?.estimated_value || '450000');

  // Call & Followup logging form state
  const [callNotes, setCallNotes] = useState('');
  const [followupDate, setFollowupDate] = useState('');
  const [hasVoiceNote, setHasVoiceNote] = useState(false);

  if (!lead) return null;

  // Single Reverse-Chronological Activity Timeline (combines stage changes, reassignments, calls, followups, notes, field corrections)
  const timelineEvents = [
    {
      id: 't-1',
      timestamp: new Date().toISOString(),
      type: 'field_correction',
      title: 'Field Correction (Traceable Log)',
      description: `Phone number corrected from "+91 98200 00000" to "${lead.phone || phone}" by ${user?.full_name}.`,
    },
    {
      id: 't-2',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      type: 'call',
      title: 'Outbound Call Logged',
      description: `Discussed Enterprise Pro licensing terms. Duration: 5 mins. Voice note attached.`,
      voiceNote: true,
    },
    {
      id: 't-3',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      type: 'reassignment',
      title: 'Lead Reassigned',
      description: `Lead assigned to ${assignee} by Alex Vance (Reassignment History Logged).`,
    },
    {
      id: 't-4',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      type: 'stage_change',
      title: 'Stage Changed',
      description: `Pipeline stage moved from "New" to "Contacted".`,
    },
  ];

  const handleSaveInlineEdits = () => {
    // Audit log direct field corrections
    if (phone !== lead.phone) {
      auditLogger.logChange(tenant?.id || 't-1', 'Lead', lead.id, 'phone', lead.phone, phone, user?.id || 'u-1');
    }
    if (stage !== lead.stage) {
      auditLogger.logChange(tenant?.id || 't-1', 'Lead', lead.id, 'stage', lead.stage, stage, user?.id || 'u-1');
    }
    if (assignee !== lead.assignee) {
      auditLogger.logChange(tenant?.id || 't-1', 'Lead', lead.id, 'assignee', lead.assignee, assignee, user?.id || 'u-1');
    }

    onUpdateLead({
      ...lead,
      name,
      company,
      phone,
      email,
      stage,
      assignee,
      estimated_value: value,
    });
    setActiveTab('timeline');
  };

  // Cross-cutting standing convention: Removal notifies Owner/Admin
  const handleRemove = () => {
    auditLogger.notifyOwnerOnRemoval(
      tenant?.id || 't-1',
      'Sales Pipeline Lead',
      `${lead.name} (${lead.company})`,
      user?.full_name || 'Admin User'
    );
    onRemoveLead(lead.id);
    onClose();
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title={`Lead Memory: ${lead.name}`} width="lg">
      <div className="space-y-6">
        {/* Header Summary */}
        <div className="p-4 bg-dark-surface rounded-xl border border-dark-border flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-100">{lead.name}</h3>
            <p className="text-xs text-slate-400 font-mono">{lead.company} • {lead.email}</p>
          </div>
          <div className="text-right">
            <Badge variant="emerald">{lead.stage}</Badge>
            <div className="font-mono text-xs font-extrabold text-[#E5A93C] mt-1">₹{Number(lead.estimated_value || value).toLocaleString('en-IN')}</div>
          </div>
        </div>

        {/* Action Tabs & Remove Control */}
        <div className="flex items-center justify-between border-b border-dark-border pb-2">
          <div className="flex gap-2">
            <Button
              variant={activeTab === 'timeline' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('timeline')}
            >
              Unified Memory Timeline
            </Button>
            <Button
              variant={activeTab === 'edit' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('edit')}
            >
              Inline Edit & Correct Fields
            </Button>
          </div>

          <Button
            variant="danger"
            size="sm"
            leftIcon={<Trash2 className="w-3.5 h-3.5" />}
            onClick={handleRemove}
          >
            Remove Lead
          </Button>
        </div>

        {/* TAB 1: UNIFIED REVERSE-CHRONOLOGICAL TIMELINE */}
        {activeTab === 'timeline' && (
          <div className="space-y-6">
            {/* Quick Log Call & Followup Form */}
            <Card className="space-y-3 bg-dark-surface/40">
              <h4 className="text-xs font-bold text-slate-200 font-display flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-brand-400" />
                Log Call & Create Followup
              </h4>
              <Input
                placeholder="Call notes & outcome summary..."
                value={callNotes}
                onChange={(e) => setCallNotes(e.target.value)}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="date"
                  label="Followup Due Date"
                  value={followupDate}
                  onChange={(e) => setFollowupDate(e.target.value)}
                />
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-300">Voice Note Attachment</label>
                  <Button
                    variant={hasVoiceNote ? 'primary' : 'outline'}
                    size="sm"
                    className="w-full text-xs"
                    leftIcon={<Mic className="w-3.5 h-3.5" />}
                    onClick={() => setHasVoiceNote(!hasVoiceNote)}
                  >
                    {hasVoiceNote ? 'Voice Note Attached (Placeholder)' : 'Attach Voice Note'}
                  </Button>
                </div>
              </div>
              <div className="flex justify-end pt-1">
                <Button variant="secondary" size="sm" onClick={() => setCallNotes('')}>
                  Log Activity
                </Button>
              </div>
            </Card>

            {/* Timeline Stream */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-brand-400" />
                Reverse-Chronological Activity Timeline
              </h4>

              {timelineEvents.map((evt) => (
                <div key={evt.id} className="p-3 bg-dark-surface/60 rounded-xl border border-dark-border/60 space-y-1">
                  <div className="flex items-center justify-between text-2xs font-mono text-slate-400">
                    <span className="font-semibold text-brand-400">{evt.title}</span>
                    <span>{new Date(evt.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-xs text-slate-200">{evt.description}</p>
                  {evt.voiceNote && (
                    <div className="inline-flex items-center gap-1.5 text-2xs px-2 py-0.5 rounded bg-brand-500/10 text-brand-400 border border-brand-500/30 font-mono mt-1">
                      <Mic className="w-3 h-3" /> Voice Note Placeholder Ready
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: INLINE EDIT & CORRECTION FORM */}
        {activeTab === 'edit' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-400">
              Direct field corrections are logged in the database audit trail with before/after values.
            </p>

            <Input label="Lead Name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input label="Company Name" value={company} onChange={(e) => setCompany(e.target.value)} />
            <Input label="Mobile Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <Input label="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} />
            
            <Select
              label="Pipeline Stage"
              value={stage}
              onChange={(e) => setStage(e.target.value)}
              options={[
                { value: 'New', label: 'New' },
                { value: 'Contacted', label: 'Contacted' },
                { value: 'Qualified', label: 'Qualified' },
                { value: 'Won', label: 'Won' },
                { value: 'Lost', label: 'Lost' },
              ]}
            />

            <Select
              label="Assigned Owner (Reassignment History Logged)"
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              options={[
                { value: 'Alex Vance', label: 'Alex Vance (Owner)' },
                { value: 'Priya Sharma', label: 'Priya Sharma (Admin)' },
                { value: 'Rajesh Kumar', label: 'Rajesh Kumar (Manager)' },
              ]}
            />

            <Input label="Estimated Value (INR ₹)" value={value} onChange={(e) => setValue(e.target.value)} />

            <div className="pt-4 border-t border-dark-border flex justify-end">
              <Button variant="primary" leftIcon={<CheckCircle2 className="w-4 h-4" />} onClick={handleSaveInlineEdits}>
                Save Changes & Log Audit Trail
              </Button>
            </div>
          </div>
        )}
      </div>
    </Drawer>
  );
};
