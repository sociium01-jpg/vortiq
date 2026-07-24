// ─────────────────────────────────────────────────────────────
// Vortiq Call Recording & AI Transcription Player
// Audio player, speaker diarization, sentiment analysis, AI summary & action items
// ─────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { Card, Badge } from '@/design-system';
import { CallTranscript } from './types';
import { Mic, Play, Pause, Volume2, Sparkles, CheckCircle2, FileText } from 'lucide-react';

export interface CallTranscriptPlayerProps {
  transcript: CallTranscript;
}

export const CallTranscriptPlayer: React.FC<CallTranscriptPlayerProps> = ({ transcript }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainder = sec % 60;
    return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  const sentimentVariants: Record<string, 'emerald' | 'amber' | 'rose' | 'slate'> = {
    positive: 'emerald',
    neutral: 'slate',
    hesitant: 'amber',
    negative: 'rose',
  };

  return (
    <Card className="p-4 bg-dark-card border-dark-border space-y-4">
      {/* Call Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-brand-500/10 border border-brand-500/30 text-brand-400 flex items-center justify-center">
            <Mic className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-100 font-display">Call Recording & AI Analysis</h4>
            <p className="text-2xs text-slate-400 font-mono">
              Speakers: {transcript.speaker_name} • Duration: {formatSeconds(transcript.duration_seconds)}
            </p>
          </div>
        </div>

        <Badge variant={sentimentVariants[transcript.sentiment] || 'slate'} size="sm" className="capitalize">
          Sentiment: {transcript.sentiment}
        </Badge>
      </div>

      {/* Audio Mock Player */}
      <div className="p-3 bg-dark-surface rounded-xl border border-dark-border flex items-center gap-3">
        <button
          type="button"
          onClick={() => setIsPlaying(!isPlaying)}
          className="w-8 h-8 rounded-full bg-brand-500 text-dark-bg font-bold flex items-center justify-center shadow hover:bg-brand-400 transition-colors"
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
        </button>

        <div className="flex-1 space-y-1">
          <div className="flex justify-between text-2xs font-mono text-slate-400">
            <span>{isPlaying ? '0:45' : '0:00'}</span>
            <span>{formatSeconds(transcript.duration_seconds)}</span>
          </div>
          <div className="w-full bg-dark-bg h-1.5 rounded-full overflow-hidden">
            <div className={`h-full bg-brand-500 transition-all ${isPlaying ? 'w-1/3' : 'w-0'}`} />
          </div>
        </div>

        <Volume2 className="w-4 h-4 text-slate-400 shrink-0" />
      </div>

      {/* AI Summary & Key Takeaways */}
      <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 font-display">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>AI Conversation Summary (Claude API)</span>
        </div>
        <p className="text-xs text-slate-200 leading-relaxed font-sans">{transcript.summary}</p>
      </div>

      {/* AI Suggested Action Items */}
      {transcript.action_items && transcript.action_items.length > 0 && (
        <div className="space-y-2">
          <span className="text-2xs font-bold uppercase tracking-wider text-slate-400 block font-display">
            AI Next-Step Suggested Actions ({transcript.action_items.length})
          </span>
          <div className="flex flex-wrap gap-2">
            {transcript.action_items.map((item, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 bg-dark-surface border border-dark-border rounded-lg text-xs text-slate-300 flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                {item}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Transcript Text Accordion */}
      <div className="space-y-2 pt-2 border-t border-dark-border">
        <span className="text-2xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 font-display">
          <FileText className="w-3.5 h-3.5" /> Full Transcript
        </span>
        <div className="p-3 bg-dark-surface/50 border border-dark-border rounded-xl text-xs font-mono text-slate-300 whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed">
          {transcript.transcript_text}
        </div>
      </div>
    </Card>
  );
};
