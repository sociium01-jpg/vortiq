import React, { useState } from 'react';
import { TaskItem, TaskStatus, TaskPriority, TaskType, TeamMember } from './types';
import { Modal, Button, Input, Select } from '@/design-system';

export interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: TaskItem | null;
  teamMembers?: TeamMember[];
  onSaveTask: (task: Partial<TaskItem>) => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  isOpen,
  onClose,
  task,
  teamMembers = [],
  onSaveTask,
}) => {
  const isEditing = !!task;

  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [status, setStatus] = useState<TaskStatus>(task?.status || 'To Do');
  const [priority, setPriority] = useState<TaskPriority>(task?.priority || 'medium');
  const [taskType, setTaskType] = useState<TaskType>(task?.task_type || 'feature');
  const [assigneeId, setAssigneeId] = useState(task?.assignee_id || '');
  const [assigneeName, setAssigneeName] = useState(task?.assignee || '');
  const [storyPoints, setStoryPoints] = useState(task?.story_points || 1);

  const handleSave = () => {
    onSaveTask({
      id: task?.id,
      title,
      description,
      status,
      priority,
      task_type: taskType,
      assignee_id: assigneeId,
      assignee: assigneeName,
      story_points: Number(storyPoints) || 1,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Task Inspector: ${task?.title}` : 'Create New Task'}
      maxWidth="xl"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSave}>
            {isEditing ? 'Save Task Updates' : 'Create Task'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input
          label="Task Title"
          placeholder="e.g., Implement Supabase RLS policies"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <div className="space-y-1">
          <label className="block text-xs font-medium text-slate-300">Description & Context</label>
          <textarea
            rows={3}
            className="w-full bg-dark-surface border border-dark-border rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500/80 transition-colors"
            placeholder="Detailed description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus)}
            options={[
              { value: 'To Do', label: 'To Do' },
              { value: 'In Progress', label: 'In Progress' },
              { value: 'Review', label: 'In Review' },
              { value: 'Done', label: 'Done' },
            ]}
          />

          <Select
            label="Priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority)}
            options={[
              { value: 'low', label: 'Low' },
              { value: 'medium', label: 'Medium' },
              { value: 'high', label: 'High' },
              { value: 'urgent', label: 'Urgent' },
            ]}
          />

          <Select
            label="Task Type"
            value={taskType}
            onChange={(e) => setTaskType(e.target.value as TaskType)}
            options={[
              { value: 'feature', label: 'Feature' },
              { value: 'bug', label: 'Bug Fix' },
              { value: 'task', label: 'Task' },
              { value: 'epic', label: 'Epic' },
            ]}
          />

          <Input
            label="Story Points"
            type="number"
            value={String(storyPoints)}
            onChange={(e) => setStoryPoints(Number(e.target.value) || 1)}
          />
        </div>

        <Select
          label="Assignee"
          value={assigneeName}
          onChange={(e) => {
            setAssigneeName(e.target.value);
            const found = teamMembers.find((m) => m.name === e.target.value);
            if (found) setAssigneeId(found.id);
          }}
          options={[
            { value: 'Alex Vance', label: 'Alex Vance (Owner)' },
            { value: 'Priya Sharma', label: 'Priya Sharma (Admin)' },
            { value: 'Rajesh Kumar', label: 'Rajesh Kumar (Manager)' },
          ]}
        />
      </div>
    </Modal>
  );
};
