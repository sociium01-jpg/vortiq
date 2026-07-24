// ─────────────────────────────────────────────────────────────
// Vortiq Task Detail & Inspector Modal
// Timer-based time logging, prerequisite task picker, & @mentions comments
// ─────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { TaskItem, TaskStatus, TaskPriority, TaskType, TaskComment } from './types';
import { Modal, Button, Input, Select, Card } from '@/design-system';
import { Clock, Play, Pause, Link2, MessageSquare, Send, Trash2 } from 'lucide-react';

export interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: TaskItem;
  allTasks: TaskItem[];
  onUpdateTask: (task: TaskItem) => void;
  onDeleteTask: (taskId: string) => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  isOpen,
  onClose,
  task,
  allTasks,
  onUpdateTask,
  onDeleteTask,
}) => {
  const [title, setTitle] = useState(task.title || '');
  const [description, setDescription] = useState(task.description || '');
  const [status, setStatus] = useState<TaskStatus>(task.status || 'To Do');
  const [priority, setPriority] = useState<TaskPriority>(task.priority || 'medium');
  const [taskType, setTaskType] = useState<TaskType>(task.task_type || 'task');
  const [estimatedHours, setEstimatedHours] = useState(task.estimated_hours ? String(task.estimated_hours) : '8');
  const [loggedHours, setLoggedHours] = useState(task.logged_hours ? String(task.logged_hours) : '0');
  const [selectedPrereqId, setSelectedPrereqId] = useState<string>(task.dependency_task_ids?.[0] || '');

  // Timer state
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Comment input
  const [commentText, setCommentText] = useState('');

  const handleSave = () => {
    const updated: TaskItem = {
      ...task,
      title,
      description,
      status,
      priority,
      task_type: taskType,
      estimated_hours: parseFloat(estimatedHours) || 8,
      logged_hours: parseFloat(loggedHours) || 0,
      dependency_task_ids: selectedPrereqId ? [selectedPrereqId] : [],
      updated_at: new Date().toISOString(),
    };
    onUpdateTask(updated);
    onClose();
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    // Detect @mentions
    const mentions = commentText.match(/@\w+/g) || [];

    const newComment: TaskComment = {
      id: `tc-${Date.now()}`,
      task_id: task.id,
      user_id: 'u-1',
      user_name: 'Alex Vance',
      author_name: 'Alex Vance',
      comment_text: commentText,
      mentions: mentions.map((m) => m.replace('@', '')),
      created_at: new Date().toISOString(),
    };

    const updated: TaskItem = {
      ...task,
      comments: [newComment, ...(task.comments || [])],
      comments_count: (task.comments_count || 0) + 1,
    };

    onUpdateTask(updated);
    setCommentText('');
  };

  const potentialPrereqs = allTasks.filter((t) => t.id !== task.id);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Task Inspector: ${task.title}`}
      maxWidth="xl"
    >
      <div className="space-y-6">
        {/* Title & Status Bar */}
        <div className="space-y-3">
          <div>
            <label className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">
              Task Title *
            </label>
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-base font-bold font-display"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Status</label>
              <Select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                options={[
                  { value: 'To Do', label: 'To Do' },
                  { value: 'In Progress', label: 'In Progress' },
                  { value: 'Review', label: 'QA Testing' },
                  { value: 'Done', label: 'Done' },
                ]}
              />
            </div>

            <div>
              <label className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Priority</label>
              <Select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                options={[
                  { value: 'low', label: 'Low' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'high', label: 'High' },
                  { value: 'urgent', label: 'Urgent' },
                ]}
              />
            </div>

            <div>
              <label className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Task Type</label>
              <Select
                value={taskType}
                onChange={(e) => setTaskType(e.target.value as any)}
                options={[
                  { value: 'feature', label: 'Feature' },
                  { value: 'bug', label: 'Bug' },
                  { value: 'task', label: 'Task' },
                  { value: 'epic', label: 'Epic' },
                ]}
              />
            </div>
          </div>
        </div>

        {/* Stopwatch Timer & Time Logging */}
        <Card className="p-4 bg-dark-surface/60 border-dark-border space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-200 font-display flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-400" />
              Time Tracking & Live Stopwatch
            </span>

            <Button
              variant={isTimerRunning ? 'ghost' : 'primary'}
              size="sm"
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              leftIcon={isTimerRunning ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5" />}
            >
              {isTimerRunning ? 'Stop Timer' : 'Start Timer'}
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Estimated Hours</label>
              <Input
                type="number"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(e.target.value)}
              />
            </div>
            <div>
              <label className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Logged Hours</label>
              <Input
                type="number"
                value={loggedHours}
                onChange={(e) => setLoggedHours(e.target.value)}
              />
            </div>
          </div>
        </Card>

        {/* Task Dependency Picker (Finish-to-Start) */}
        <div>
          <label className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5 font-display">
            <Link2 className="w-3.5 h-3.5 text-amber-400" /> Finish-to-Start Prerequisite Task
          </label>
          <Select
            value={selectedPrereqId}
            onChange={(e) => setSelectedPrereqId(e.target.value)}
            options={[
              { value: '', label: 'No prerequisite (Can start anytime)' },
              ...potentialPrereqs.map((t) => ({ value: t.id, label: `${t.title} (${t.status})` })),
            ]}
          />
        </div>

        {/* Description Textarea */}
        <div>
          <label className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full h-24 p-3 bg-dark-surface border border-dark-border rounded-xl font-mono text-xs text-slate-200 focus:outline-none focus:border-brand-500"
          />
        </div>

        {/* Comments Section with @mentions */}
        <div className="space-y-3 pt-3 border-t border-dark-border">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2 font-display">
            <MessageSquare className="w-4 h-4 text-violet-400" />
            Comments & @Mentions ({task.comments?.length || 0})
          </span>

          <form onSubmit={handlePostComment} className="flex gap-2">
            <Input
              type="text"
              placeholder="Write a comment... Use @Alex or @Priya to notify team members"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <Button variant="primary" size="sm" type="submit" leftIcon={<Send className="w-3.5 h-3.5" />}>
              Post
            </Button>
          </form>

          <div className="space-y-2 max-h-40 overflow-y-auto">
            {(task.comments || []).map((c) => (
              <div key={c.id} className="p-3 bg-dark-surface/60 rounded-xl border border-dark-border space-y-1">
                <div className="flex items-center justify-between text-2xs font-mono">
                  <span className="font-bold text-slate-200">{c.author_name || c.user_name}</span>
                  <span className="text-slate-400">{new Date(c.created_at).toLocaleTimeString()}</span>
                </div>
                <p className="text-xs text-slate-300 font-sans">{c.comment_text || c.comment}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex justify-between items-center pt-3 border-t border-dark-border">
          <Button
            variant="ghost"
            size="sm"
            className="text-rose-400 hover:text-rose-300"
            leftIcon={<Trash2 className="w-4 h-4" />}
            onClick={() => onDeleteTask(task.id)}
          >
            Delete Task
          </Button>

          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSave}>
              Save Task Updates
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
