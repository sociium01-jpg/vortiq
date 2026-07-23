import React from 'react';
import {
  Card,
  Badge,
  Avatar,
  Button,
} from '@/design-system';
import {
  TaskItem,
  TaskStatus,
  TaskPriority,
  TaskType,
} from './types';
import {
  Plus,
  MessageSquare,
  Paperclip,
  Clock,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

interface TaskBoardProps {
  tasks: TaskItem[];
  onSelectTask: (task: TaskItem) => void;
  onQuickMoveTask: (taskId: string, newStatus: TaskStatus) => void;
  onAddNewTask: (initialStatus?: TaskStatus) => void;
}

interface ColumnConfig {
  id: TaskStatus;
  title: string;
  badgeVariant: 'slate' | 'amber' | 'blue' | 'violet' | 'emerald';
}

const COLUMNS: ColumnConfig[] = [
  { id: 'backlog', title: 'Backlog', badgeVariant: 'slate' },
  { id: 'todo', title: 'To Do', badgeVariant: 'blue' },
  { id: 'in_progress', title: 'In Progress', badgeVariant: 'amber' },
  { id: 'review', title: 'In Review', badgeVariant: 'violet' },
  { id: 'done', title: 'Done', badgeVariant: 'emerald' },
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
        return <Badge variant="slate" size="sm">Low</Badge>;
    }
  };

  const getTypeBadge = (type: TaskType) => {
    switch (type) {
      case 'bug':
        return <Badge variant="rose" size="sm">Bug</Badge>;
      case 'feature':
        return <Badge variant="violet" size="sm">Feature</Badge>;
      case 'task':
        return <Badge variant="blue" size="sm">Task</Badge>;
      case 'epic':
        return <Badge variant="emerald" size="sm">Epic</Badge>;
    }
  };

  const getNextStatus = (current: TaskStatus): TaskStatus | null => {
    const sequence: TaskStatus[] = ['backlog', 'todo', 'in_progress', 'review', 'done'];
    const idx = sequence.indexOf(current);
    if (idx < sequence.length - 1) return sequence[idx + 1];
    return null;
  };

  const getPrevStatus = (current: TaskStatus): TaskStatus | null => {
    const sequence: TaskStatus[] = ['backlog', 'todo', 'in_progress', 'review', 'done'];
    const idx = sequence.indexOf(current);
    if (idx > 0) return sequence[idx - 1];
    return null;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const today = new Date();
    const isOverdue = date < today && date.toDateString() !== today.toDateString();

    const formatted = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });

    return (
      <span className={`inline-flex items-center gap-1 text-2xs font-mono ${isOverdue ? 'text-rose-400 font-semibold' : 'text-slate-400'}`}>
        {isOverdue ? <AlertCircle className="w-3 h-3 text-rose-400" /> : <Clock className="w-3 h-3 text-slate-500" />}
        {formatted}
      </span>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start w-full overflow-x-auto pb-4">
      {COLUMNS.map((col) => {
        const columnTasks = tasks.filter((t) => t.status === col.id);

        return (
          <div
            key={col.id}
            className="flex flex-col bg-dark-surface/50 rounded-xl border border-dark-border/70 p-3 min-w-[280px]"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-dark-border/60">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-semibold text-slate-200 font-display tracking-wide uppercase">
                  {col.title}
                </h3>
                <Badge variant={col.badgeVariant} size="sm">
                  {columnTasks.length}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => onAddNewTask(col.id)}
                title={`Add task to ${col.title}`}
              >
                <Plus className="w-3.5 h-3.5" />
              </Button>
            </div>

            {/* Column Tasks List */}
            <div className="space-y-3 min-h-[300px]">
              {columnTasks.length === 0 ? (
                <div className="h-32 flex flex-col items-center justify-center border border-dashed border-dark-border/50 rounded-lg p-4 text-center">
                  <p className="text-2xs text-slate-500 font-medium">No tasks in {col.title}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 text-2xs"
                    onClick={() => onAddNewTask(col.id)}
                  >
                    + Add Task
                  </Button>
                </div>
              ) : (
                columnTasks.map((task) => {
                  const prevCol = getPrevStatus(task.status);
                  const nextCol = getNextStatus(task.status);

                  return (
                    <Card
                      key={task.id}
                      hoverable
                      className="p-3.5 cursor-pointer relative group space-y-2.5 bg-dark-card hover:border-brand-500/50"
                      onClick={() => onSelectTask(task)}
                    >
                      {/* Card Header: Type & Priority Badges */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {getTypeBadge(task.task_type)}
                          {getPriorityBadge(task.priority)}
                        </div>
                        {task.story_points && (
                          <span className="text-2xs font-mono text-slate-400 bg-dark-surface px-1.5 py-0.5 rounded border border-dark-border">
                            {task.story_points} pts
                          </span>
                        )}
                      </div>

                      {/* Title & Description preview */}
                      <div>
                        <h4 className="text-xs font-semibold text-slate-100 line-clamp-2 leading-snug hover:text-brand-300 transition-colors">
                          {task.title}
                        </h4>
                        {task.description && (
                          <p className="text-2xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                            {task.description}
                          </p>
                        )}
                      </div>

                      {/* Tags */}
                      {task.tags && task.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {task.tags.map((t) => (
                            <Badge key={t} variant="slate" size="sm" className="text-3xs px-1.5 py-0">
                              #{t}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Card Footer: Assignee, Due Date, Indicators */}
                      <div className="flex items-center justify-between pt-2 border-t border-dark-border/40 text-2xs text-slate-400">
                        <div className="flex items-center gap-2">
                          <Avatar
                            name={task.assignee_name || 'Unassigned'}
                            src={task.assignee_avatar}
                            size="sm"
                          />
                          <span className="truncate max-w-[90px] font-medium text-slate-300">
                            {task.assignee_name || 'Unassigned'}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          {task.due_date && formatDate(task.due_date)}

                          {(task.comments_count || 0) > 0 && (
                            <span className="flex items-center gap-0.5 text-slate-400">
                              <MessageSquare className="w-3 h-3 text-slate-500" />
                              {task.comments_count}
                            </span>
                          )}

                          {(task.attachment_count || 0) > 0 && (
                            <span className="flex items-center gap-0.5 text-slate-400">
                              <Paperclip className="w-3 h-3 text-slate-500" />
                              {task.attachment_count}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Quick Move Action Overlay buttons (Visible on hover) */}
                      <div
                        className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 top-2 flex items-center gap-1 bg-dark-card/90 backdrop-blur p-1 rounded-md border border-dark-border shadow-lg"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {prevCol && (
                          <button
                            type="button"
                            onClick={() => onQuickMoveTask(task.id, prevCol)}
                            className="p-1 hover:bg-dark-surface rounded text-slate-400 hover:text-slate-100 transition-colors"
                            title={`Move back to ${prevCol}`}
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {nextCol && (
                          <button
                            type="button"
                            onClick={() => onQuickMoveTask(task.id, nextCol)}
                            className="p-1 hover:bg-dark-surface rounded text-slate-400 hover:text-brand-400 transition-colors flex items-center gap-0.5 text-3xs font-semibold"
                            title={`Advance to ${nextCol}`}
                          >
                            {nextCol === 'done' ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
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
  );
};
