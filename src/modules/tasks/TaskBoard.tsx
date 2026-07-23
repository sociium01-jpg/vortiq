import React from 'react';
import { TaskItem, TaskStatus, TaskPriority } from './types';
import { Card, Badge, Avatar } from '@/design-system';
import {
  Plus,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';

export interface TaskBoardProps {
  tasks: TaskItem[];
  onSelectTask: (task: TaskItem) => void;
  onQuickMoveTask?: (taskId: string, newStatus: TaskStatus) => void;
  onAddNewTask?: () => void;
}

interface ColumnConfig {
  id: TaskStatus;
  title: string;
  badgeVariant: 'slate' | 'amber' | 'blue' | 'violet' | 'emerald';
}

const COLUMNS: ColumnConfig[] = [
  { id: 'To Do', title: 'To Do', badgeVariant: 'blue' },
  { id: 'In Progress', title: 'In Progress', badgeVariant: 'amber' },
  { id: 'Review', title: 'In Review', badgeVariant: 'violet' },
  { id: 'Done', title: 'Done', badgeVariant: 'emerald' },
];

export const TaskBoard: React.FC<TaskBoardProps> = ({
  tasks,
  onSelectTask,
  onQuickMoveTask,
  onAddNewTask,
}) => {
  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case 'urgent':
        return <Badge variant="rose" size="sm" dot>Urgent</Badge>;
      case 'high':
        return <Badge variant="amber" size="sm">High</Badge>;
      case 'medium':
        return <Badge variant="blue" size="sm">Medium</Badge>;
      case 'low':
      default:
        return <Badge variant="slate" size="sm">Low</Badge>;
    }
  };

  const getTaskTypeBadge = (type: string) => {
    switch (type) {
      case 'bug':
        return <Badge variant="rose" size="sm">Bug</Badge>;
      case 'feature':
        return <Badge variant="emerald" size="sm">Feature</Badge>;
      case 'epic':
        return <Badge variant="violet" size="sm">Epic</Badge>;
      default:
        return <Badge variant="slate" size="sm">Task</Badge>;
    }
  };

  const getNextStatus = (current: TaskStatus): TaskStatus | null => {
    const statuses: TaskStatus[] = ['To Do', 'In Progress', 'Review', 'Done'];
    const idx = statuses.indexOf(current);
    return idx < statuses.length - 1 ? statuses[idx + 1] : null;
  };

  const getPrevStatus = (current: TaskStatus): TaskStatus | null => {
    const statuses: TaskStatus[] = ['To Do', 'In Progress', 'Review', 'Done'];
    const idx = statuses.indexOf(current);
    return idx > 0 ? statuses[idx - 1] : null;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
      {COLUMNS.map((col) => {
        const columnTasks = tasks.filter((t) => t.status === col.id);

        return (
          <div
            key={col.id}
            className="flex flex-col bg-dark-surface/40 rounded-xl border border-dark-border/80 overflow-hidden min-h-[500px]"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between p-3.5 border-b border-dark-border/80 bg-dark-surface/60">
              <div className="flex items-center gap-2">
                <span className="font-display font-semibold text-xs text-slate-200">
                  {col.title}
                </span>
                <Badge variant={col.badgeVariant} size="sm">
                  {columnTasks.length}
                </Badge>
              </div>
              <button
                onClick={onAddNewTask}
                className="text-slate-400 hover:text-slate-200 p-1 rounded-md hover:bg-dark-border/50 transition-colors"
                title="Add task"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Column Task Cards */}
            <div className="flex-1 p-2 space-y-2.5 overflow-y-auto max-h-[calc(100vh-260px)]">
              {columnTasks.map((task) => {
                const nextStatus = getNextStatus(task.status);
                const prevStatus = getPrevStatus(task.status);

                return (
                  <Card
                    key={task.id}
                    className="p-3 bg-dark-card hover:bg-dark-cardHover border-dark-border hover:border-brand-500/30 transition-all cursor-pointer group space-y-2.5 shadow-sm"
                    onClick={() => onSelectTask(task)}
                  >
                    {/* Top Row: Type & Priority */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        {getTaskTypeBadge(task.task_type)}
                        {getPriorityBadge(task.priority)}
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">
                        {task.story_points ? `${task.story_points} pts` : ''}
                      </span>
                    </div>

                    {/* Task Title */}
                    <h4 className="text-xs font-semibold text-slate-200 group-hover:text-white transition-colors line-clamp-2 leading-snug">
                      {task.title}
                    </h4>

                    {/* Tags */}
                    {task.tags && task.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {task.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-dark-surface text-slate-400 border border-dark-border/50"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Footer: Assignee & Move Buttons */}
                    <div className="flex items-center justify-between pt-1 border-t border-dark-border/40 text-xs">
                      <div className="flex items-center gap-2">
                        <Avatar
                          name={task.assignee || 'Unassigned'}
                          size="sm"
                        />
                        <span className="text-[11px] text-slate-400 truncate max-w-[90px]">
                          {task.assignee || 'Unassigned'}
                        </span>
                      </div>

                      {/* Quick Shift Controls */}
                      <div
                        className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {prevStatus && onQuickMoveTask && (
                          <button
                            onClick={() => onQuickMoveTask(task.id, prevStatus)}
                            className="p-1 text-slate-400 hover:text-white rounded hover:bg-dark-surface"
                            title={`Move to ${prevStatus}`}
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {nextStatus && onQuickMoveTask && (
                          <button
                            onClick={() => onQuickMoveTask(task.id, nextStatus)}
                            className="p-1 text-slate-400 hover:text-white rounded hover:bg-dark-surface"
                            title={`Move to ${nextStatus}`}
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}

              {columnTasks.length === 0 && (
                <div className="h-24 border border-dashed border-dark-border/60 rounded-lg flex items-center justify-center text-slate-500 text-xs font-mono">
                  Empty stage
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
