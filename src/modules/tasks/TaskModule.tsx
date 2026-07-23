import React, { useState } from 'react';
import { useAuth } from '@/auth/AuthContext';
import { auditLogger } from '@/lib/auditLogger';
import { TaskBoard } from './TaskBoard';
import { TaskDetailModal } from './TaskDetailModal';
import { TaskItem, TaskDoc } from './types';
import {
  Button,
  Input,
  Select,
  Card,
  Badge,
  DataTable,
  Modal,
  Toast,
  Column,
} from '@/design-system';
import {
  CheckSquare,
  Plus,
  BookOpen,
  FolderPlus,
  Trash2,
} from 'lucide-react';

export const TaskModule: React.FC = () => {
  const { user, tenant } = useAuth();
  const [activeTab, setActiveTab] = useState<'board' | 'list' | 'docs'>('board');
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Project Form
  const [projectName, setProjectName] = useState('');
  const [projectDesc, setProjectDesc] = useState('');

  // Sample Projects
  const [projects] = useState([
    { id: 'p-1', name: 'Q3 Product Engineering', members: ['Alex Vance', 'Priya Sharma'] },
    { id: 'p-2', name: 'Customer Onboarding & Migration', members: ['Rajesh Kumar', 'Sneha Patel'] },
  ]);

  // Sample Tasks Dataset
  const [tasks, setTasks] = useState<TaskItem[]>([
    {
      id: 'task-1',
      tenant_id: 't-1',
      title: 'Migrate Supabase RLS Policies for Multi-Tenancy',
      description: 'Audit and enforce tenant_id isolation across all public DB tables.',
      status: 'In Progress',
      priority: 'urgent',
      task_type: 'feature',
      assignee_id: 'u-1',
      assignee: 'Alex Vance',
      creator_id: 'u-1',
      due_date: new Date(Date.now() + 86400000).toISOString(),
      story_points: 5,
      tags: ['security', 'database'],
      comments: [
        {
          id: 'c-1',
          task_id: 'task-1',
          user_id: 'u-2',
          user_name: 'Priya Sharma',
          comment: 'Verified RLS isolation on users & leads tables.',
          created_at: new Date().toISOString(),
        },
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'task-2',
      tenant_id: 't-1',
      title: 'Setup Confluence Wiki Documentation Space',
      description: 'Document architecture conventions for Stage 1 parallel agent modules.',
      status: 'To Do',
      priority: 'high',
      task_type: 'task',
      assignee_id: 'u-2',
      assignee: 'Priya Sharma',
      creator_id: 'u-1',
      due_date: new Date(Date.now() + 172800000).toISOString(),
      story_points: 3,
      tags: ['wiki', 'docs'],
      comments: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ]);

  // Confluence-style Wiki Docs per Project
  const [docs] = useState<TaskDoc[]>([
    {
      id: 'doc-1',
      tenant_id: 't-1',
      project_id: 'p-1',
      title: 'Vortiq Architecture & Design Tokens Standard',
      content: 'All parallel modules must strictly consume primitives exported from @/design-system. Colors: Emerald #10b981, Dark Surface #1e293b, Gold Accent #E5A93C.',
      author_id: 'u-1',
      author_name: 'Alex Vance',
      version: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ]);

  const handleUpdateTask = (updatedTask: TaskItem) => {
    // Log direct field corrections
    const original = tasks.find((t) => t.id === updatedTask.id);
    if (original && original.status !== updatedTask.status) {
      auditLogger.logChange(tenant?.id || 't-1', 'Task', updatedTask.id, 'status', original.status, updatedTask.status, user?.id || 'u-1');
    }

    setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
    setToastMessage(`Task "${updatedTask.title}" updated.`);
  };

  // Cross-cutting standing convention: Removal notifies Owner/Admin
  const handleRemoveTask = (taskId: string) => {
    const target = tasks.find((t) => t.id === taskId);
    if (!target) return;

    auditLogger.notifyOwnerOnRemoval(
      tenant?.id || 't-1',
      'Task Management Item',
      target.title,
      user?.full_name || 'Admin User',
      (notif) => setToastMessage(`${notif.title}: ${notif.message}`)
    );

    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    setIsTaskModalOpen(false);
  };

  const handleCreateProject = () => {
    if (!projectName) return;
    setIsProjectModalOpen(false);
    setProjectName('');
    setProjectDesc('');
    setToastMessage(`New project "${projectName}" created with team members assigned.`);
  };

  const listColumns: Column<TaskItem>[] = [
    {
      key: 'title',
      header: 'Task Title',
      sortable: true,
      render: (item) => (
        <div>
          <div className="font-semibold text-slate-100">{item.title}</div>
          <div className="text-2xs text-slate-400">{item.description}</div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (item) => (
        <Select
          options={[
            { value: 'To Do', label: 'To Do' },
            { value: 'In Progress', label: 'In Progress' },
            { value: 'Review', label: 'Review' },
            { value: 'Done', label: 'Done' },
          ]}
          value={item.status}
          onChange={(e) => {
            handleUpdateTask({ ...item, status: e.target.value as any });
          }}
          className="text-xs py-1 px-2 w-32"
        />
      ),
    },
    {
      key: 'priority',
      header: 'Priority',
      sortable: true,
      render: (item) => (
        <Badge
          variant={item.priority === 'urgent' ? 'rose' : item.priority === 'high' ? 'amber' : 'blue'}
        >
          {item.priority}
        </Badge>
      ),
    },
    {
      key: 'assignee',
      header: 'Assignee',
      sortable: true,
      render: (item) => <span className="text-xs text-slate-300">{item.assignee || 'Unassigned'}</span>,
    },
    {
      key: 'actions',
      header: 'Inspect / Remove',
      render: (item) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedTask(item);
              setIsTaskModalOpen(true);
            }}
          >
            Inspect
          </Button>

          <button
            onClick={() => handleRemoveTask(item.id)}
            className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 transition-colors"
            title="Remove Task (Triggers Owner/Admin Alert)"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {toastMessage && (
        <Toast
          id="task-toast"
          type="info"
          title="Task Management Alert"
          message={toastMessage}
          onDismiss={() => setToastMessage(null)}
        />
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-dark-border pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 font-display flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-blue-400" />
            Task Management & Confluence Wiki Space
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Jira-style task board, priority tracking, project creation, and Confluence wiki documentation space.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<FolderPlus className="w-4 h-4 text-violet-400" />}
            onClick={() => setIsProjectModalOpen(true)}
          >
            New Project
          </Button>

          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => {
              setSelectedTask(null);
              setIsTaskModalOpen(true);
            }}
          >
            Create Task
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 bg-dark-surface/60 p-1 rounded-xl border border-dark-border w-fit">
        <button
          onClick={() => setActiveTab('board')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'board' ? 'bg-blue-500 text-white' : 'text-slate-300 hover:text-white'
          }`}
        >
          Kanban Board View
        </button>

        <button
          onClick={() => setActiveTab('list')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'list' ? 'bg-blue-500 text-white' : 'text-slate-300 hover:text-white'
          }`}
        >
          Task Data Table
        </button>

        <button
          onClick={() => setActiveTab('docs')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'docs' ? 'bg-blue-500 text-white' : 'text-slate-300 hover:text-white'
          }`}
        >
          Confluence Wiki Space
        </button>
      </div>

      {/* Viewport */}
      {activeTab === 'board' && (
        <TaskBoard
          tasks={tasks}
          onSelectTask={(task: TaskItem) => {
            setSelectedTask(task);
            setIsTaskModalOpen(true);
          }}
          onQuickMoveTask={(taskId, newStatus) => {
            const t = tasks.find((item) => item.id === taskId);
            if (t) handleUpdateTask({ ...t, status: newStatus as any });
          }}
          onAddNewTask={() => {
            setSelectedTask(null);
            setIsTaskModalOpen(true);
          }}
        />
      )}

      {activeTab === 'list' && (
        <DataTable
          columns={listColumns}
          data={tasks}
          keyExtractor={(item) => item.id}
          searchPlaceholder="Search tasks by title, assignee, or tag..."
        />
      )}

      {activeTab === 'docs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100 font-display flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-violet-400" />
              Project Confluence-Style Knowledge Base Wiki
            </h3>
            <Badge variant="violet">{projects.length} Active Projects</Badge>
          <Badge variant="violet">Versioned Docs</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {docs.map((doc) => (
              <Card key={doc.id} className="space-y-3 border-violet-500/30">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-100">{doc.title}</h4>
                  <Badge variant="slate" size="sm">v{doc.version}.0</Badge>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-mono bg-dark-surface/60 p-3 rounded-lg border border-dark-border/40">
                  {doc.content}
                </p>
                <div className="flex items-center justify-between text-2xs text-slate-400 font-mono">
                  <span>Author: {doc.author_name}</span>
                  <span>Updated: {new Date(doc.updated_at).toLocaleDateString('en-IN')}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Task Modal Inspector / Creator */}
      {isTaskModalOpen && (
        <TaskDetailModal
          isOpen={isTaskModalOpen}
          onClose={() => setIsTaskModalOpen(false)}
          task={selectedTask}
          teamMembers={[
            { id: 'u-1', name: 'Alex Vance' },
            { id: 'u-2', name: 'Priya Sharma' },
            { id: 'u-3', name: 'Rajesh Kumar' },
          ]}
          onSaveTask={(saved: Partial<TaskItem>) => {
            const fullTask: TaskItem = {
              id: saved.id || `task-${Date.now()}`,
              tenant_id: saved.tenant_id || 't-1',
              title: saved.title || 'New Task',
              description: saved.description || '',
              status: (saved.status as any) || 'To Do',
              priority: saved.priority || 'medium',
              task_type: saved.task_type || 'task',
              assignee_id: saved.assignee_id || 'u-1',
              assignee: saved.assignee || 'Alex Vance',
              creator_id: 'u-1',
              due_date: saved.due_date || new Date().toISOString(),
              story_points: saved.story_points || 1,
              tags: saved.tags || [],
              comments: saved.comments || [],
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };

            if (selectedTask) handleUpdateTask(fullTask);
            else {
              setTasks((prev) => [fullTask, ...prev]);
              setToastMessage(`Task "${fullTask.title}" created.`);
            }
            setIsTaskModalOpen(false);
          }}
        />
      )}

      {/* New Project Modal */}
      <Modal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        title="Create New Project"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setIsProjectModalOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleCreateProject}>Create Project</Button>
          </>
        }
      >
        <div className="space-y-3">
          <Input label="Project Name" value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="e.g. Q3 Engineering" />
          <Input label="Description" value={projectDesc} onChange={(e) => setProjectDesc(e.target.value)} placeholder="Key milestone objectives..." />
        </div>
      </Modal>
    </div>
  );
};
