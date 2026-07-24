// ─────────────────────────────────────────────────────────────
// Vortiq Gantt Timeline View (Zoho Projects Parity)
// Interactive Gantt Chart with task duration bars & dependency indicators
// ─────────────────────────────────────────────────────────────

import React from 'react';
import { Card, Badge } from '@/design-system';
import { TaskItem } from './types';
import { Calendar, AlertCircle, Link2 } from 'lucide-react';

export interface TaskGanttViewProps {
  tasks: TaskItem[];
  onTaskClick: (task: TaskItem) => void;
}

export const TaskGanttView: React.FC<TaskGanttViewProps> = ({ tasks, onTaskClick }) => {
  // Timeline days (7-day window)
  const timelineDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - 2 + i);
    return {
      dateStr: d.toISOString().split('T')[0],
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNum: d.getDate(),
      isToday: i === 2,
    };
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Done':
        return '#22B8A3';
      case 'In Progress':
        return '#E5A93C';
      case 'Review':
        return '#8B5CF6';
      default:
        return '#8D93AC';
    }
  };

  return (
    <Card className="p-5 bg-dark-card border-dark-border space-y-4 overflow-x-auto">
      <div className="flex items-center justify-between min-w-[900px]">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100 font-display flex items-center gap-2">
            <Calendar className="w-4 h-4 text-brand-400" />
            Gantt Timeline & Task Dependencies
          </h3>
          <p className="text-2xs text-slate-400 mt-0.5">
            Zoho Projects-style interactive timeline chart with Finish-to-Start dependency validation
          </p>
        </div>

        <div className="flex items-center gap-4 text-2xs font-mono text-slate-400">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-[#22B8A3]" /> Done</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-[#E5A93C]" /> In Progress</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-[#8D93AC]" /> To Do</span>
        </div>
      </div>

      {/* Grid Table */}
      <div className="min-w-[900px] border border-dark-border rounded-xl overflow-hidden bg-dark-surface/50">
        {/* Header Row */}
        <div className="grid grid-cols-[280px,1fr] border-b border-dark-border bg-dark-surface font-semibold text-2xs uppercase text-slate-300">
          <div className="p-3 border-r border-dark-border">Task Details</div>
          <div className="grid grid-cols-7 text-center">
            {timelineDays.map((d) => (
              <div
                key={d.dateStr}
                className={`p-2 border-r last:border-r-0 border-dark-border ${
                  d.isToday ? 'bg-brand-500/10 text-brand-400 font-bold' : ''
                }`}
              >
                <div>{d.dayName}</div>
                <div className="font-mono text-xs mt-0.5">{d.dayNum}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Task Timeline Rows */}
        <div className="divide-y divide-dark-border/60">
          {tasks.map((task) => {
            const hasDependency = task.dependency_task_ids && task.dependency_task_ids.length > 0;
            const prerequisiteTask = hasDependency
              ? tasks.find((t) => task.dependency_task_ids?.includes(t.id))
              : null;
            const isBlocked = prerequisiteTask && prerequisiteTask.status !== 'Done';

            return (
              <div
                key={task.id}
                onClick={() => onTaskClick(task)}
                className="grid grid-cols-[280px,1fr] hover:bg-dark-surface/80 transition-colors cursor-pointer text-xs"
              >
                {/* Left Task Meta */}
                <div className="p-3 border-r border-dark-border space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-100 truncate pr-2 font-display">{task.title}</span>
                    <Badge variant={task.priority === 'urgent' ? 'rose' : task.priority === 'high' ? 'amber' : 'slate'} size="sm">
                      {task.priority}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-2xs text-slate-400 font-mono">
                    <span>Est: {task.estimated_hours || 0}h • Logged: {task.logged_hours || 0}h</span>
                    {isBlocked && (
                      <span className="text-rose-400 font-bold flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Blocked
                      </span>
                    )}
                  </div>
                </div>

                {/* Right Timeline Bar */}
                <div className="grid grid-cols-7 relative items-center px-2 py-3">
                  {/* Gantt Bar Mock Span */}
                  <div
                    className="h-7 rounded-lg shadow-md px-2.5 flex items-center justify-between text-2xs font-mono text-dark-bg font-bold truncate transition-all"
                    style={{
                      backgroundColor: getStatusColor(task.status),
                      gridColumnStart: 2,
                      gridColumnEnd: 6,
                    }}
                  >
                    <span className="truncate">{task.title}</span>
                    <span className="shrink-0">{task.status}</span>
                  </div>

                  {/* Dependency Line Indicator */}
                  {prerequisiteTask && (
                    <div className="absolute left-2 text-2xs font-mono text-amber-300 bg-dark-card/90 px-1.5 py-0.5 rounded border border-amber-500/30 flex items-center gap-1">
                      <Link2 className="w-3 h-3 text-amber-400" />
                      Prereq: {prerequisiteTask.title.substring(0, 15)}...
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};
