import React, { useState } from 'react';
import {
  Card,
  Badge,
  Avatar,
  Button,
  Select,
} from '@/design-system';
import { CrmLead, CrmPipelineStage } from './types';
import {
  Plus,
  ArrowRight,
  ArrowLeft,
  IndianRupee,
  Building2,
  User,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

export interface KanbanBoardProps {
  stages: CrmPipelineStage[];
  leads: CrmLead[];
  onLeadClick: (lead: CrmLead) => void;
  onLeadStageChange: (leadId: string, newStageId: string) => void;
  onAddLeadToStage?: (stageId: string) => void;
  onSelectLead?: (lead: CrmLead) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  stages,
  leads,
  onLeadClick,
  onLeadStageChange,
  onAddLeadToStage,
}) => {
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [dragOverStageId, setDragOverStageId] = useState<string | null>(null);

  // Currency Formatter in INR (₹)
  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    setDraggedLeadId(leadId);
    e.dataTransfer.setData('text/plain', leadId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverStageId !== stageId) {
      setDragOverStageId(stageId);
    }
  };

  const handleDragLeave = (_e: React.DragEvent, stageId: string) => {
    if (dragOverStageId === stageId) {
      setDragOverStageId(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetStageId: string) => {
    e.preventDefault();
    setDragOverStageId(null);
    const leadId = e.dataTransfer.getData('text/plain') || draggedLeadId;
    if (leadId) {
      onLeadStageChange(leadId, targetStageId);
    }
    setDraggedLeadId(null);
  };

  const getPriorityVariant = (priority?: string) => {
    switch (priority) {
      case 'urgent':
        return 'rose';
      case 'high':
        return 'amber';
      case 'medium':
        return 'blue';
      default:
        return 'slate';
    }
  };

  return (
    <div className="w-full overflow-x-auto pb-4 pt-2">
      <div className="flex gap-4 min-w-[1280px]">
        {stages.map((stage, stageIndex) => {
          const stageLeads = leads.filter((l) => l.stage_id === stage.id);
          const totalValue = stageLeads.reduce((acc, l) => acc + (l.estimated_value || 0), 0);
          const isDragOver = dragOverStageId === stage.id;

          return (
            <div
              key={stage.id}
              className={`flex-1 flex flex-col rounded-xl border transition-all duration-200 ${
                isDragOver
                  ? 'border-brand-500 bg-brand-500/5 shadow-lg shadow-brand-500/10'
                  : 'border-dark-border/80 bg-dark-card/60'
              }`}
              onDragOver={(e) => handleDragOver(e, stage.id)}
              onDragLeave={(e) => handleDragLeave(e, stage.id)}
              onDrop={(e) => handleDrop(e, stage.id)}
            >
              {/* Column Header */}
              <div className="p-3.5 border-b border-dark-border/80 bg-dark-surface/60 rounded-t-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant={stage.badgeVariant} dot size="sm">
                    {stage.name}
                  </Badge>
                  <span className="text-2xs font-mono font-medium text-slate-400 bg-dark-bg px-2 py-0.5 rounded-full border border-dark-border">
                    {stageLeads.length}
                  </span>
                </div>

                {onAddLeadToStage && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1 h-7 w-7 text-slate-400 hover:text-slate-100"
                    onClick={() => onAddLeadToStage(stage.id)}
                    title={`Add Lead to ${stage.name}`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>

              {/* Total Value Sub-header */}
              <div className="px-3.5 py-2 bg-dark-bg/40 border-b border-dark-border/40 flex items-center justify-between text-2xs">
                <span className="text-slate-400 font-medium">Stage Value:</span>
                <span className="font-mono font-semibold text-brand-400">
                  {formatINR(totalValue)}
                </span>
              </div>

              {/* Column Lead Cards Container */}
              <div className="p-3 flex-1 space-y-3 min-h-[420px] max-h-[70vh] overflow-y-auto">
                {stageLeads.length === 0 ? (
                  <div className="h-32 border border-dashed border-dark-border/60 rounded-lg flex flex-col items-center justify-center text-center p-3">
                    <Sparkles className="w-5 h-5 text-slate-600 mb-1" />
                    <p className="text-2xs text-slate-500">No leads in {stage.name}</p>
                    <p className="text-3xs text-slate-600 mt-0.5">Drag card here to move</p>
                  </div>
                ) : (
                  stageLeads.map((lead) => {
                    const isBeingDragged = draggedLeadId === lead.id;

                    return (
                      <Card
                        key={lead.id}
                        hoverable
                        draggable
                        onDragStart={(e) => handleDragStart(e, lead.id)}
                        onDragEnd={() => setDraggedLeadId(null)}
                        onClick={() => onLeadClick(lead)}
                        className={`cursor-grab active:cursor-grabbing relative p-4 transition-all ${
                          isBeingDragged ? 'opacity-40 scale-95 border-brand-500/50' : ''
                        }`}
                      >
                        {/* Card Header: Title & Priority */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="text-xs font-bold text-slate-100 line-clamp-2 hover:text-brand-400 transition-colors font-display">
                            {lead.title}
                          </h4>
                          {lead.priority && (
                            <Badge variant={getPriorityVariant(lead.priority)} size="sm">
                              {lead.priority}
                            </Badge>
                          )}
                        </div>

                        {/* Company & Contact */}
                        <div className="space-y-1 mb-3 text-2xs text-slate-400">
                          {lead.company_name && (
                            <div className="flex items-center gap-1.5 truncate">
                              <Building2 className="w-3 h-3 text-slate-500 shrink-0" />
                              <span className="truncate font-medium text-slate-300">
                                {lead.company_name}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-1.5 truncate">
                            <User className="w-3 h-3 text-slate-500 shrink-0" />
                            <span className="truncate">{lead.contact_person}</span>
                          </div>
                        </div>

                        {/* Card Footer: INR Value & Assigned User */}
                        <div className="pt-2 border-t border-dark-border/60 flex items-center justify-between">
                          <div className="flex items-center gap-1 text-xs font-mono font-bold text-emerald-400">
                            <IndianRupee className="w-3 h-3 shrink-0" />
                            <span>{lead.estimated_value ? lead.estimated_value.toLocaleString('en-IN') : '0'}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            {lead.notes_count ? (
                              <span className="flex items-center gap-0.5 text-3xs font-mono text-slate-400 bg-dark-surface px-1.5 py-0.5 rounded">
                                <MessageSquare className="w-2.5 h-2.5" />
                                {lead.notes_count}
                              </span>
                            ) : null}

                            <Avatar
                              name={lead.assigned_to_name || 'Unassigned'}
                              size="sm"
                            />
                          </div>
                        </div>

                        {/* Quick Action Stage Move Controls (Accessible Click Alternative) */}
                        <div className="mt-3 pt-2 border-t border-dark-border/40 flex items-center justify-between text-3xs text-slate-400">
                          <button
                            disabled={stageIndex === 0}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (stageIndex > 0) {
                                onLeadStageChange(lead.id, stages[stageIndex - 1].id);
                              }
                            }}
                            className="flex items-center gap-1 p-1 hover:text-brand-400 disabled:opacity-30 disabled:hover:text-slate-400"
                            title="Move to Previous Stage"
                          >
                            <ArrowLeft className="w-3 h-3" />
                            Prev
                          </button>

                          <Select
                            value={lead.stage_id}
                            onChange={(e) => {
                              e.stopPropagation();
                              onLeadStageChange(lead.id, e.target.value);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            options={stages.map((s) => ({ value: s.id, label: s.name }))}
                            className="text-3xs py-0.5 px-1.5 h-6 bg-dark-bg border-dark-border/60 w-24"
                          />

                          <button
                            disabled={stageIndex === stages.length - 1}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (stageIndex < stages.length - 1) {
                                onLeadStageChange(lead.id, stages[stageIndex + 1].id);
                              }
                            }}
                            className="flex items-center gap-1 p-1 hover:text-brand-400 disabled:opacity-30 disabled:hover:text-slate-400"
                            title="Move to Next Stage"
                          >
                            Next
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </Card>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
