import React, { useState } from 'react';
import { Modal, Button, Badge } from '@/design-system';
import { CrmCall, CallOutcome, CALL_OUTCOMES } from './types';
import { Phone, Mic, Clock, Calendar, Upload, X } from 'lucide-react';

interface CallLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadId: string;
  leadTitle: string;
  currentUserId: string;
  currentUserName: string;
  onSave: (call: CrmCall) => void;
}

export const CallLogModal: React.FC<CallLogModalProps> = ({
  isOpen,
  onClose,
  leadId,
  leadTitle,
  currentUserId,
  currentUserName,
  onSave,
}) => {
  const now = new Date();
  const localDatetime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

  const [callDate, setCallDate] = useState(localDatetime);
  const [durationMinutes, setDurationMinutes] = useState('5');
  const [outcome, setOutcome] = useState<CallOutcome>('connected');
  const [notes, setNotes] = useState('');
  const [voiceNoteFile, setVoiceNoteFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleVoiceNoteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setVoiceNoteFile(file);
  };

  const handleSubmit = () => {
    if (!callDate || !durationMinutes) return;
    setSubmitting(true);

    const call: CrmCall = {
      id: `call-${Date.now()}`,
      lead_id: leadId,
      organization_id: 'org-1',
      logged_by_id: currentUserId,
      logged_by_name: currentUserName,
      call_date: new Date(callDate).toISOString(),
      duration_minutes: Number(durationMinutes) || 1,
      outcome,
      notes: notes.trim() || undefined,
      voice_note_filename: voiceNoteFile?.name,
      voice_note_url: voiceNoteFile ? `placeholder://voice-notes/${voiceNoteFile.name}` : undefined,
      created_at: new Date().toISOString(),
    };

    onSave(call);
    setSubmitting(false);

    // Reset
    setCallDate(localDatetime);
    setDurationMinutes('5');
    setOutcome('connected');
    setNotes('');
    setVoiceNoteFile(null);
    onClose();
  };

  const outcomeColor: Record<CallOutcome, string> = {
    connected: 'text-emerald-400',
    no_answer: 'text-slate-400',
    voicemail: 'text-slate-400',
    meeting_booked: 'text-[#22B8A3]',
    not_interested: 'text-rose-400',
    follow_up_required: 'text-amber-400',
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Log a Call"
      maxWidth="lg"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Phone className="w-4 h-4" />}
            onClick={handleSubmit}
            disabled={submitting || !durationMinutes}
          >
            Save Call Log
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        {/* Context strip */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-dark-surface border border-dark-border/60 text-xs text-slate-400">
          <Phone className="w-3.5 h-3.5 text-teal-400" />
          <span>Logging call against:</span>
          <span className="font-semibold text-slate-200">{leadTitle}</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Call date/time */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-medium text-slate-300">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Call Date & Time
            </label>
            <input
              type="datetime-local"
              value={callDate}
              onChange={(e) => setCallDate(e.target.value)}
              className="w-full bg-dark-surface border border-dark-border rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-brand-500/80 transition-colors font-mono"
            />
          </div>

          {/* Duration */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-medium text-slate-300">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Duration (minutes)
            </label>
            <input
              type="number"
              min="1"
              max="180"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
              className="w-full bg-dark-surface border border-dark-border rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-brand-500/80 transition-colors font-mono"
              placeholder="5"
            />
          </div>
        </div>

        {/* Outcome */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-300">Call Outcome</label>
          <div className="grid grid-cols-2 gap-2">
            {CALL_OUTCOMES.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setOutcome(opt.value)}
                className={`px-3 py-2.5 rounded-xl border text-xs font-medium text-left transition-all ${
                  outcome === opt.value
                    ? 'border-brand-500 bg-brand-500/10 text-slate-100'
                    : 'border-dark-border/60 bg-dark-surface/40 text-slate-400 hover:border-dark-border hover:text-slate-300'
                }`}
              >
                <span className={outcome === opt.value ? outcomeColor[opt.value] : ''}>
                  {opt.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-300">Call Notes</label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="What was discussed? Key decisions, next steps, objections..."
            className="w-full bg-dark-surface border border-dark-border rounded-xl px-3 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-brand-500/80 transition-colors resize-none"
          />
        </div>

        {/* Voice note upload (placeholder) */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-medium text-slate-300">
            <Mic className="w-3.5 h-3.5 text-teal-400" />
            Voice Note
            <Badge variant="slate" size="sm">Placeholder — no transcription yet</Badge>
          </label>

          {voiceNoteFile ? (
            <div className="flex items-center justify-between px-3 py-2.5 rounded-xl border border-teal-500/30 bg-teal-500/5">
              <div className="flex items-center gap-2 text-xs text-teal-300">
                <Mic className="w-4 h-4" />
                <span className="font-mono truncate max-w-[200px]">{voiceNoteFile.name}</span>
                <span className="text-slate-500">({(voiceNoteFile.size / 1024).toFixed(0)} KB)</span>
              </div>
              <button
                onClick={() => setVoiceNoteFile(null)}
                className="text-slate-400 hover:text-rose-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="flex items-center justify-center gap-2 px-4 py-3 border border-dashed border-dark-border/60 rounded-xl text-xs text-slate-500 hover:text-slate-300 hover:border-dark-border cursor-pointer transition-colors">
              <Upload className="w-4 h-4" />
              <span>Click to attach a voice recording (.mp3, .m4a, .wav)</span>
              <input
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={handleVoiceNoteChange}
              />
            </label>
          )}
        </div>
      </div>
    </Modal>
  );
};
