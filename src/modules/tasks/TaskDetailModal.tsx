import React, { useState, useEffect } from 'react';
import {
  Modal,
  Button,
  Input,
  Select,
  Avatar,
} from '@/design-system';
import {
  TaskItem,
  TaskStatus,
  TaskPriority,
  TaskType,
  TeamMember,
} from './types';
import {
  MessageSquare,
  Send,
  Trash2,
  Calendar,
  Tag,
  FileText,
  Clock,
} from 'lucide-react';

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: TaskItem | null; // null means create mode
  initialStatus?: TaskStatus;
  teamMembers: TeamMember[];
  onSaveTask: (taskData: Partial<TaskItem>) => void;
  onDeleteTask?: (taskId: string) => void;
  onAddComment?: (taskId: string, text: string) => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  isOpen,
  onClose,
  task,
  initialStatus = 'todo',
  teamMembers,
  onSaveTask,
  onDeleteTask,
  onAddComment,
}) => {
  const isCreateMode = !task;

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>(initialStatus);
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [taskType, setTaskType] = useState<TaskType>('task');
  const [assigneeId, setAssigneeId] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [storyPoints, setStoryPoints] = useState<number | undefined>(undefined);
  const [tagsInput, setTagsInput] = useState('');
  const [newCommentText, setNewCommentText] = useState('');

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setStatus(task.status || 'todo');
      setPriority(task.priority || 'medium');
      setTaskType(task.task_type || 'task');
      setAssigneeId(task.assignee_id || '');
      setDueDate(task.due_date || '');
      setStoryPoints(task.story_points);
      setTagsInput(task.tags ? task.tags.join(', ') : '');
    } else {
      setTitle('');
      setDescription('');
      setStatus(initialStatus);
      setPriority('medium');
      setTaskType('task');
      setAssigneeId(teamMembers[0]?.id || '');
      setDueDate('');
      setStoryPoints(undefined);
      setTagsInput('');
    }
    setNewCommentText('');
  }, [task, initialStatus, isOpen, teamMembers]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const selectedAssignee = teamMembers.find((m) => m.id === assigneeId);

    const parsedTags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    onSaveTask({
      ...(task || {}),
      title,
      description,
      status,
      priority,
      task_type: taskType,
      assignee_id: assigneeId || undefined,
      assignee_name: selectedAssignee ? selectedAssignee.name : undefined,
      assignee_avatar: selectedAssignee ? selectedAssignee.avatar_url : undefined,
      due_date: dueDate || undefined,
      story_points: storyPoints ? Number(storyPoints) : undefined,
      tags: parsedTags,
    });

    onClose();
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!task || !newCommentText.trim() || !onAddComment) return;

    onAddComment(task.id, newCommentText.trim());
    setNewCommentText('');
  };

  const assigneeOptions = [
    { value: '', label: 'Unassigned' },
    ...teamMembers.map((m) => ({
      value: m.id,
      label: `${m.name} (${m.role})`,
    })),
  ];

  const statusOptions = [
    { value: 'backlog', label: 'Backlog' },
    { value: 'todo', label: 'To Do' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'review', label: 'In Review' },
    { value: 'done', label: 'Done' },
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'high', label: 'High Priority' },
    { value: 'urgent', label: 'Urgent Priority' },
  ];

  const typeOptions = [
    { value: 'task', label: 'Task' },
    { value: 'feature', label: 'Feature' },
    { value: 'bug', label: 'Bug Fix' },
    { value: 'epic', label: 'Epic Initiative' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isCreateMode ? 'Create New Task' : `Task: ${task?.title}`}
      maxWidth="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          <div>
            {!isCreateMode && task && onDeleteTask && (
              <Button
                variant="danger"
                size="sm"
                leftIcon={<Trash2 className="w-4 h-4" />}
                onClick={() => {
                  onDeleteTask(task.id);
                  onClose();
                }}
              >
                Delete Task
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSave}>
              {isCreateMode ? 'Create Task' : 'Save Changes'}
            </Button>
          </div>
        </div>
      }
    >
      <form onSubmit={handleSave} className="space-y-5">
        {/* Title Input */}
        <Input
          label="Task Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Implement OAuth2 Refresh Token Rotation"
          required
        />

        {/* Grid Controls: Status, Priority, Type, Assignee */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Status"
            options={statusOptions}
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus)}
          />

          <Select
            label="Priority"
            options={priorityOptions}
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority)}
          />

          <Select
            label="Task Type"
            options={typeOptions}
            value={taskType}
            onChange={(e) => setTaskType(e.target.value as TaskType)}
          />

          <Select
            label="Assignee"
            options={assigneeOptions}
            value={assigneeId}
            onChange={(e) => setAssigneeId(e.target.value)}
          />
        </div>

        {/* Due Date & Story Points */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Due Date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            leftIcon={<Calendar className="w-4 h-4" />}
          />

          <Input
            label="Story Points (Est)"
            type="number"
            min="1"
            max="100"
            value={storyPoints ?? ''}
            onChange={(e) => setStoryPoints(e.target.value ? Number(e.target.value) : undefined)}
            placeholder="e.g. 3, 5, 8"
          />
        </div>

        {/* Tags */}
        <Input
          label="Tags (Comma Separated)"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder="backend, api, security, frontend"
          leftIcon={<Tag className="w-4 h-4" />}
        />

        {/* Description Textarea Styled with Design System Tokens */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-300 flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            Description & Acceptance Criteria
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Detail task scope, implementation steps, and acceptance criteria..."
            className="block w-full rounded-lg bg-dark-surface border border-dark-border text-slate-100 placeholder-slate-500 text-sm p-3 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-colors"
          />
        </div>

        {/* Comments Section (Only in Inspect/Edit Mode) */}
        {!isCreateMode && task && (
          <div className="pt-4 border-t border-dark-border/80 space-y-3">
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2 font-display">
              <MessageSquare className="w-4 h-4 text-brand-400" />
              Activity & Comments ({task.comments?.length || 0})
            </h4>

            {/* List of Comments */}
            <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
              {!task.comments || task.comments.length === 0 ? (
                <p className="text-2xs text-slate-500 italic py-2">
                  No comments yet. Start the conversation below.
                </p>
              ) : (
                task.comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="p-3 rounded-lg bg-dark-surface/60 border border-dark-border/50 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar name={comment.author_name} src={comment.author_avatar} size="sm" />
                        <span className="font-semibold text-slate-200 text-2xs">{comment.author_name}</span>
                      </div>
                      <span className="text-3xs text-slate-400 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-300 text-xs leading-relaxed pl-9">
                      {comment.comment_text}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Add Comment Input */}
            {onAddComment && (
              <div className="flex items-center gap-2 pt-2">
                <Input
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  className="text-xs py-1.5"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleCommentSubmit}
                  disabled={!newCommentText.trim()}
                  leftIcon={<Send className="w-3.5 h-3.5 text-brand-400" />}
                >
                  Comment
                </Button>
              </div>
            )}
          </div>
        )}
      </form>
    </Modal>
  );
};
