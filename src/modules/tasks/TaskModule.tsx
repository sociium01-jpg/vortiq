import React, { useState, useMemo } from 'react';
import {
  Button,
  Input,
  Select,
  Card,
  Badge,
  Avatar,
  DataTable,
  Column,
  EmptyState,
  Toast,
  Modal,
} from '@/design-system';
import {
  TaskItem,
  TaskDoc,
  TeamMember,
  TaskViewMode,
  TaskStatus,
  TaskPriority,
  TaskType,
  TaskComment,
} from './types';
import { TaskBoard } from './TaskBoard';
import { TaskDetailModal } from './TaskDetailModal';
import {
  Kanban,
  List,
  BookOpen,
  Plus,
  Search,
} from 'lucide-react';

// Pre-seeded Team Members
const MOCK_TEAM_MEMBERS: TeamMember[] = [
  { id: 'usr-1', name: 'Alex Vance', email: 'alex@acmeops.com', role: 'ADMIN' },
  { id: 'usr-2', name: 'Sarah Jenkins', email: 'sarah@acmeops.com', role: 'Lead Architect' },
  { id: 'usr-3', name: 'David Chen', email: 'david@acmeops.com', role: 'Product Manager' },
  { id: 'usr-4', name: 'Priya Sharma', email: 'priya@acmeops.com', role: 'QA Lead' },
  { id: 'usr-5', name: 'Marcus Vance', email: 'marcus@acmeops.com', role: 'DevOps Engineer' },
];

// Pre-seeded Enterprise Tasks (Jira Style)
const INITIAL_TASKS: TaskItem[] = [
  {
    id: 'TASK-101',
    tenant_id: 'tenant-demo-1001',
    title: 'Migrate PostgreSQL Database to Multi-Tenant RLS Schemas',
    description: 'Implement row level security policies across all 11 core tables and update migration scripts.',
    status: 'in_progress',
    priority: 'urgent',
    task_type: 'feature',
    assignee_id: 'usr-2',
    assignee_name: 'Sarah Jenkins',
    creator_id: 'usr-1',
    creator_name: 'Alex Vance',
    due_date: '2026-07-28',
    story_points: 8,
    tags: ['database', 'rls', 'security'],
    comments_count: 2,
    attachment_count: 2,
    comments: [
      {
        id: 'c-1',
        task_id: 'TASK-101',
        tenant_id: 'tenant-demo-1001',
        user_id: 'usr-1',
        author_name: 'Alex Vance',
        comment_text: 'Verified policy benchmarks in staging. Row filtering adds <2ms overhead.',
        created_at: '2026-07-22T10:30:00Z',
      },
      {
        id: 'c-2',
        task_id: 'TASK-101',
        tenant_id: 'tenant-demo-1001',
        user_id: 'usr-2',
        author_name: 'Sarah Jenkins',
        comment_text: 'Adding helper functions for tenant_id verification across triggers.',
        created_at: '2026-07-23T08:15:00Z',
      },
    ],
    created_at: '2026-07-20T09:00:00Z',
    updated_at: '2026-07-23T08:15:00Z',
  },
  {
    id: 'TASK-102',
    tenant_id: 'tenant-demo-1001',
    title: 'Fix Razorpay Webhook Signature Mismatch on Auto-Renewal',
    description: 'Investigate intermittent webhook failure during subscription billing cycle renewal.',
    status: 'todo',
    priority: 'high',
    task_type: 'bug',
    assignee_id: 'usr-1',
    assignee_name: 'Alex Vance',
    creator_id: 'usr-3',
    creator_name: 'David Chen',
    due_date: '2026-07-25',
    story_points: 5,
    tags: ['billing', 'razorpay', 'webhook'],
    comments_count: 1,
    attachment_count: 1,
    comments: [
      {
        id: 'c-3',
        task_id: 'TASK-102',
        tenant_id: 'tenant-demo-1001',
        user_id: 'usr-3',
        author_name: 'David Chen',
        comment_text: 'Customer reported failed auto-charge event on Enterprise plan.',
        created_at: '2026-07-22T14:20:00Z',
      },
    ],
    created_at: '2026-07-21T11:00:00Z',
    updated_at: '2026-07-22T14:20:00Z',
  },
  {
    id: 'TASK-103',
    tenant_id: 'tenant-demo-1001',
    title: 'Build Mobile Photo Capture & SKU Barcode Scanner UI',
    description: 'Develop responsive camera viewport with QR scanner overlay and image preview gallery for inventory module.',
    status: 'review',
    priority: 'high',
    task_type: 'feature',
    assignee_id: 'usr-4',
    assignee_name: 'Priya Sharma',
    creator_id: 'usr-2',
    creator_name: 'Sarah Jenkins',
    due_date: '2026-07-24',
    story_points: 5,
    tags: ['mobile', 'inventory', 'camera'],
    comments_count: 1,
    attachment_count: 3,
    comments: [
      {
        id: 'c-4',
        task_id: 'TASK-103',
        tenant_id: 'tenant-demo-1001',
        user_id: 'usr-4',
        author_name: 'Priya Sharma',
        comment_text: 'Tested camera permission fallback on Android and iOS webview. Working smoothly.',
        created_at: '2026-07-23T09:45:00Z',
      },
    ],
    created_at: '2026-07-19T10:00:00Z',
    updated_at: '2026-07-23T09:45:00Z',
  },
  {
    id: 'TASK-104',
    tenant_id: 'tenant-demo-1001',
    title: 'Configure Multi-Channel WhatsApp & In-App Notification Engine',
    description: 'Set up real-time socket events and WhatsApp Business API template triggers for low stock alerts.',
    status: 'done',
    priority: 'medium',
    task_type: 'task',
    assignee_id: 'usr-5',
    assignee_name: 'Marcus Vance',
    creator_id: 'usr-1',
    creator_name: 'Alex Vance',
    due_date: '2026-07-21',
    story_points: 3,
    tags: ['notifications', 'whatsapp', 'sockets'],
    comments_count: 0,
    attachment_count: 0,
    created_at: '2026-07-18T08:30:00Z',
    updated_at: '2026-07-21T17:00:00Z',
  },
  {
    id: 'TASK-105',
    tenant_id: 'tenant-demo-1001',
    title: 'Setup Automated CI/CD Pipeline for Vite Build & Docker Containerization',
    description: 'Add GitHub Actions workflow for static typechecking, build verification, and deployment artifact packaging.',
    status: 'backlog',
    priority: 'low',
    task_type: 'epic',
    assignee_id: 'usr-5',
    assignee_name: 'Marcus Vance',
    creator_id: 'usr-2',
    creator_name: 'Sarah Jenkins',
    due_date: '2026-08-05',
    story_points: 13,
    tags: ['devops', 'docker', 'ci-cd'],
    comments_count: 0,
    attachment_count: 0,
    created_at: '2026-07-22T16:00:00Z',
    updated_at: '2026-07-22T16:00:00Z',
  },
];

// Pre-seeded Confluence-style Wiki Docs
const INITIAL_DOCS: TaskDoc[] = [
  {
    id: 'DOC-201',
    tenant_id: 'tenant-demo-1001',
    title: 'Vortiq Architecture Overview & RLS Security Standard',
    category: 'Architecture',
    author_id: 'usr-2',
    author_name: 'Sarah Jenkins',
    content: `# Vortiq Architecture Overview & RLS Security Standard

## Overview
Vortiq utilizes a single-database multi-tenant design powered by PostgreSQL Row Level Security (RLS). Every table contains a mandatory \`tenant_id\` column.

### RLS Policy Rules:
1. Every query executed by the application must operate under a tenant context.
2. Direct cross-tenant access is prevented at the database engine layer.
3. RBAC roles (\`OWNER\`, \`ADMIN\`, \`MANAGER\`, \`MEMBER\`) enforce feature-level operations on top of RLS isolation.

## Component Layout
- **Frontend**: React 18 + TypeScript + Vite + TailwindCSS.
- **Design System**: Strict locked primitives in \`@/design-system\`.
- **Database**: Supabase / PostgreSQL with multi-tenant schema isolation.
`,
    tags: ['architecture', 'rls', 'security', 'database'],
    related_task_ids: ['TASK-101'],
    created_at: '2026-07-15T10:00:00Z',
    updated_at: '2026-07-22T11:30:00Z',
  },
  {
    id: 'DOC-202',
    tenant_id: 'tenant-demo-1001',
    title: 'Razorpay Payment & Webhook Integration Specification',
    category: 'API Specs',
    author_id: 'usr-1',
    author_name: 'Alex Vance',
    content: `# Razorpay Payment & Webhook Integration Specification

## Webhook Handlers
- **Event**: \`subscription.charged\` -> Triggers billing cycle renewal & invoice record generation.
- **Event**: \`subscription.halted\` -> Updates tenant status to \`past_due\` and alerts tenant OWNER.

### Security Verification:
All webhooks require HMAC SHA256 signature validation matching header \`X-Razorpay-Signature\`.
`,
    tags: ['payments', 'razorpay', 'webhooks', 'api'],
    related_task_ids: ['TASK-102'],
    created_at: '2026-07-18T14:00:00Z',
    updated_at: '2026-07-21T09:15:00Z',
  },
  {
    id: 'DOC-203',
    tenant_id: 'tenant-demo-1001',
    title: 'Standard Operating Procedure: Inventory Photo Audit & SKU Tagging',
    category: 'SOPs',
    author_id: 'usr-4',
    author_name: 'Priya Sharma',
    content: `# Standard Operating Procedure: Inventory Photo Audit & SKU Tagging

## Audit Workflow
1. Open the Inventory module on mobile or tablet device.
2. Select **Mobile Photo Capture & Scan**.
3. Point device camera at the item's barcode or QR tag.
4. Capture high-resolution photo proof and attach to warehouse location record.
5. Save entry — real-time notification dispatches if stock drops below reorder threshold.
`,
    tags: ['sop', 'inventory', 'mobile', 'audit'],
    related_task_ids: ['TASK-103'],
    created_at: '2026-07-20T16:00:00Z',
    updated_at: '2026-07-23T08:00:00Z',
  },
];

export const TaskModule: React.FC = () => {
  // Main State
  const [tasks, setTasks] = useState<TaskItem[]>(INITIAL_TASKS);
  const [docs, setDocs] = useState<TaskDoc[]>(INITIAL_DOCS);
  const [viewMode, setViewMode] = useState<TaskViewMode>('board');
  const [toastNotification, setToastNotification] = useState<{ title: string; message: string; type: 'success' | 'info' | 'warning' } | null>(null);

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<TaskType | 'all'>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string | 'all'>('all');

  // Modal States
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [initialTaskStatus, setInitialTaskStatus] = useState<TaskStatus>('todo');

  // Doc Space States
  const [selectedDoc, setSelectedDoc] = useState<TaskDoc | null>(INITIAL_DOCS[0]);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [docModalTitle, setDocModalTitle] = useState('');
  const [docModalCategory, setDocModalCategory] = useState('Architecture');
  const [docModalContent, setDocModalContent] = useState('');
  const [docModalTags, setDocModalTags] = useState('');

  // Filtered Tasks Calculation
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const matchesTitle = t.title.toLowerCase().includes(query);
        const matchesDesc = t.description?.toLowerCase().includes(query) || false;
        const matchesTags = t.tags?.some((tag) => tag.toLowerCase().includes(query)) || false;
        if (!matchesTitle && !matchesDesc && !matchesTags) return false;
      }
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
      if (typeFilter !== 'all' && t.task_type !== typeFilter) return false;
      if (assigneeFilter !== 'all' && t.assignee_id !== assigneeFilter) return false;
      return true;
    });
  }, [tasks, searchTerm, statusFilter, priorityFilter, typeFilter, assigneeFilter]);

  // Metrics
  const metrics = useMemo(() => {
    const total = tasks.length;
    const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
    const urgent = tasks.filter((t) => t.priority === 'urgent').length;
    const completed = tasks.filter((t) => t.status === 'done').length;
    return { total, inProgress, urgent, completed, docsCount: docs.length };
  }, [tasks, docs]);

  // Task Actions
  const handleOpenCreateTask = (status: TaskStatus = 'todo') => {
    setSelectedTask(null);
    setInitialTaskStatus(status);
    setIsTaskModalOpen(true);
  };

  const handleOpenInspectTask = (task: TaskItem) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  const handleQuickMoveTask = (taskId: string, newStatus: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, status: newStatus, updated_at: new Date().toISOString() }
          : t
      )
    );
    const taskObj = tasks.find((t) => t.id === taskId);
    setToastNotification({
      type: 'success',
      title: 'Task Moved',
      message: `"${taskObj?.title || taskId}" moved to ${newStatus.replace('_', ' ').toUpperCase()}`,
    });
  };

  const handleSaveTask = (taskData: Partial<TaskItem>) => {
    if (selectedTask) {
      // Update existing task
      setTasks((prev) =>
        prev.map((t) =>
          t.id === selectedTask.id
            ? { ...t, ...taskData, updated_at: new Date().toISOString() }
            : t
        )
      );
      setToastNotification({
        type: 'success',
        title: 'Task Updated',
        message: `Task "${taskData.title}" was updated successfully.`,
      });
    } else {
      // Create new task
      const newId = `TASK-${100 + tasks.length + 1}`;
      const newTask: TaskItem = {
        id: newId,
        tenant_id: 'tenant-demo-1001',
        title: taskData.title || 'Untitled Task',
        description: taskData.description,
        status: taskData.status || 'todo',
        priority: taskData.priority || 'medium',
        task_type: taskData.task_type || 'task',
        assignee_id: taskData.assignee_id,
        assignee_name: taskData.assignee_name,
        assignee_avatar: taskData.assignee_avatar,
        creator_id: 'usr-1',
        creator_name: 'Alex Vance',
        due_date: taskData.due_date,
        story_points: taskData.story_points,
        tags: taskData.tags || [],
        comments_count: 0,
        attachment_count: 0,
        comments: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setTasks((prev) => [newTask, ...prev]);
      setToastNotification({
        type: 'success',
        title: 'Task Created',
        message: `${newId} "${newTask.title}" added to ${newTask.status}.`,
      });
    }
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    setToastNotification({
      type: 'info',
      title: 'Task Deleted',
      message: `Task ${taskId} removed.`,
    });
  };

  const handleAddComment = (taskId: string, commentText: string) => {
    const newComment: TaskComment = {
      id: `c-${Date.now()}`,
      task_id: taskId,
      tenant_id: 'tenant-demo-1001',
      user_id: 'usr-1',
      author_name: 'Alex Vance (You)',
      comment_text: commentText,
      created_at: new Date().toISOString(),
    };

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const updatedComments = [...(t.comments || []), newComment];
          return {
            ...t,
            comments: updatedComments,
            comments_count: updatedComments.length,
            updated_at: new Date().toISOString(),
          };
        }
        return t;
      })
    );

    // Also update selected task if modal open
    if (selectedTask && selectedTask.id === taskId) {
      const updatedComments = [...(selectedTask.comments || []), newComment];
      setSelectedTask({
        ...selectedTask,
        comments: updatedComments,
        comments_count: updatedComments.length,
      });
    }

    setToastNotification({
      type: 'info',
      title: 'Comment Added',
      message: 'Your comment was posted to the task.',
    });
  };

  // Doc Actions
  const handleOpenCreateDoc = () => {
    setDocModalTitle('');
    setDocModalCategory('Architecture');
    setDocModalContent('');
    setDocModalTags('');
    setIsDocModalOpen(true);
  };

  const handleSaveDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docModalTitle.trim()) return;

    const newDoc: TaskDoc = {
      id: `DOC-${200 + docs.length + 1}`,
      tenant_id: 'tenant-demo-1001',
      title: docModalTitle,
      category: docModalCategory,
      content: docModalContent || '# ' + docModalTitle,
      author_id: 'usr-1',
      author_name: 'Alex Vance',
      tags: docModalTags.split(',').map((t) => t.trim()).filter((t) => t.length > 0),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setDocs((prev) => [newDoc, ...prev]);
    setSelectedDoc(newDoc);
    setIsDocModalOpen(false);
    setToastNotification({
      type: 'success',
      title: 'Documentation Article Published',
      message: `"${newDoc.title}" added to Confluence Doc Space under ${newDoc.category}.`,
    });
  };

  // DataTable columns for List View
  const listColumns: Column<TaskItem>[] = [
    {
      key: 'id',
      header: 'Key / Title',
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-2">
          <span className="font-mono text-2xs font-semibold text-slate-400">{item.id}</span>
          <span className="font-medium text-slate-100">{item.title}</span>
        </div>
      ),
    },
    {
      key: 'task_type',
      header: 'Type',
      sortable: true,
      render: (item) => (
        <Badge
          variant={
            item.task_type === 'bug' ? 'rose' : item.task_type === 'feature' ? 'violet' : item.task_type === 'epic' ? 'emerald' : 'blue'
          }
          size="sm"
        >
          {item.task_type}
        </Badge>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (item) => (
        <Badge
          variant={
            item.status === 'done'
              ? 'emerald'
              : item.status === 'in_progress'
              ? 'amber'
              : item.status === 'review'
              ? 'violet'
              : item.status === 'todo'
              ? 'blue'
              : 'slate'
          }
          dot
          size="sm"
        >
          {item.status.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      key: 'priority',
      header: 'Priority',
      sortable: true,
      render: (item) => (
        <Badge
          variant={
            item.priority === 'urgent'
              ? 'rose'
              : item.priority === 'high'
              ? 'amber'
              : item.priority === 'medium'
              ? 'blue'
              : 'slate'
          }
          size="sm"
        >
          {item.priority}
        </Badge>
      ),
    },
    {
      key: 'assignee_name',
      header: 'Assignee',
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-1.5">
          <Avatar name={item.assignee_name || 'Unassigned'} src={item.assignee_avatar} size="sm" />
          <span className="text-xs text-slate-300">{item.assignee_name || 'Unassigned'}</span>
        </div>
      ),
    },
    {
      key: 'due_date',
      header: 'Due Date',
      sortable: true,
      render: (item) => (
        <span className="font-mono text-2xs text-slate-400">
          {item.due_date ? new Date(item.due_date).toLocaleDateString() : '-'}
        </span>
      ),
    },
    {
      key: 'story_points',
      header: 'Pts',
      sortable: true,
      render: (item) => (
        <span className="font-mono text-2xs text-slate-300">{item.story_points ?? '-'}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toastNotification && (
        <Toast
          id="task-toast"
          type={toastNotification.type}
          title={toastNotification.title}
          message={toastNotification.message}
          onDismiss={() => setToastNotification(null)}
        />
      )}

      {/* Top Header & Metrics Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-100 font-display tracking-tight">
              Task Management & Doc Space
            </h1>
            <Badge variant="blue" size="md">Stage 1 Module B</Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Jira-style agile kanban task board & Confluence knowledge base docs workspace
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<BookOpen className="w-4 h-4 text-violet-400" />}
            onClick={handleOpenCreateDoc}
          >
            New Doc Article
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => handleOpenCreateTask('todo')}
          >
            Create Task
          </Button>
        </div>
      </div>

      {/* Metrics Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 border-l-4 border-l-brand-500">
          <div className="text-2xs font-medium text-slate-400 uppercase tracking-wider">Total Tasks</div>
          <div className="text-xl font-bold text-slate-100 font-display mt-0.5">{metrics.total}</div>
          <div className="text-3xs text-emerald-400 font-mono mt-1">{metrics.completed} Completed</div>
        </Card>

        <Card className="p-3.5 border-l-4 border-l-amber-500">
          <div className="text-2xs font-medium text-slate-400 uppercase tracking-wider">In Progress</div>
          <div className="text-xl font-bold text-slate-100 font-display mt-0.5">{metrics.inProgress}</div>
          <div className="text-3xs text-amber-400 font-mono mt-1">Active Sprints</div>
        </Card>

        <Card className="p-3.5 border-l-4 border-l-rose-500">
          <div className="text-2xs font-medium text-slate-400 uppercase tracking-wider">Urgent Priority</div>
          <div className="text-xl font-bold text-slate-100 font-display mt-0.5">{metrics.urgent}</div>
          <div className="text-3xs text-rose-400 font-mono mt-1">Requires Attention</div>
        </Card>

        <Card className="p-3.5 border-l-4 border-l-violet-500">
          <div className="text-2xs font-medium text-slate-400 uppercase tracking-wider">Doc Articles</div>
          <div className="text-xl font-bold text-slate-100 font-display mt-0.5">{metrics.docsCount}</div>
          <div className="text-3xs text-violet-400 font-mono mt-1">Confluence Space</div>
        </Card>
      </div>

      {/* Controls & Filter Bar */}
      <Card className="p-4 bg-dark-card border-dark-border space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 bg-dark-surface p-1 rounded-lg border border-dark-border self-start">
            <Button
              variant={viewMode === 'board' ? 'primary' : 'ghost'}
              size="sm"
              leftIcon={<Kanban className="w-3.5 h-3.5" />}
              onClick={() => setViewMode('board')}
            >
              Board View
            </Button>
            <Button
              variant={viewMode === 'list' ? 'primary' : 'ghost'}
              size="sm"
              leftIcon={<List className="w-3.5 h-3.5" />}
              onClick={() => setViewMode('list')}
            >
              List View
            </Button>
            <Button
              variant={viewMode === 'docs' ? 'primary' : 'ghost'}
              size="sm"
              leftIcon={<BookOpen className="w-3.5 h-3.5" />}
              onClick={() => setViewMode('docs')}
            >
              Docs Space ({docs.length})
            </Button>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 max-w-sm">
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={viewMode === 'docs' ? "Search docs space articles..." : "Search tasks by title, desc, tag..."}
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            />
          </div>
        </div>

        {/* Secondary Filter Dropdowns (Visible in Board & List Views) */}
        {viewMode !== 'docs' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-dark-border/40">
            <Select
              label="Status"
              options={[
                { value: 'all', label: 'All Statuses' },
                { value: 'backlog', label: 'Backlog' },
                { value: 'todo', label: 'To Do' },
                { value: 'in_progress', label: 'In Progress' },
                { value: 'review', label: 'In Review' },
                { value: 'done', label: 'Done' },
              ]}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="text-xs py-1 px-2"
            />

            <Select
              label="Priority"
              options={[
                { value: 'all', label: 'All Priorities' },
                { value: 'urgent', label: 'Urgent' },
                { value: 'high', label: 'High' },
                { value: 'medium', label: 'Medium' },
                { value: 'low', label: 'Low' },
              ]}
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as any)}
              className="text-xs py-1 px-2"
            />

            <Select
              label="Task Type"
              options={[
                { value: 'all', label: 'All Types' },
                { value: 'feature', label: 'Feature' },
                { value: 'bug', label: 'Bug Fix' },
                { value: 'task', label: 'Task' },
                { value: 'epic', label: 'Epic' },
              ]}
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="text-xs py-1 px-2"
            />

            <Select
              label="Assignee"
              options={[
                { value: 'all', label: 'All Assignees' },
                ...MOCK_TEAM_MEMBERS.map((m) => ({ value: m.id, label: m.name })),
              ]}
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              className="text-xs py-1 px-2"
            />
          </div>
        )}
      </Card>

      {/* Main View Area */}
      {viewMode === 'board' && (
        <TaskBoard
          tasks={filteredTasks}
          onSelectTask={handleOpenInspectTask}
          onQuickMoveTask={handleQuickMoveTask}
          onAddNewTask={handleOpenCreateTask}
        />
      )}

      {viewMode === 'list' && (
        <DataTable
          columns={listColumns}
          data={filteredTasks}
          keyExtractor={(item) => item.id}
          onRowClick={handleOpenInspectTask}
          emptyTitle="No tasks match your filters"
          emptyDescription="Try clearing search filters or add a new task."
        />
      )}

      {viewMode === 'docs' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left Column: Docs Sidebar & Navigator */}
          <Card className="space-y-4 p-4 lg:col-span-1 bg-dark-card border-dark-border">
            <div className="flex items-center justify-between pb-3 border-b border-dark-border">
              <h3 className="text-sm font-semibold text-slate-100 font-display flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-violet-400" />
                Knowledge Base Space
              </h3>
              <Badge variant="violet" size="sm">{docs.length} Articles</Badge>
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {docs
                .filter((d) => !searchTerm || d.title.toLowerCase().includes(searchTerm.toLowerCase()) || d.category.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedDoc(doc)}
                    className={`p-3 rounded-lg border transition-all cursor-pointer space-y-1 ${
                      selectedDoc?.id === doc.id
                        ? 'bg-violet-500/10 border-violet-500/50 shadow-md'
                        : 'bg-dark-surface/50 border-dark-border/60 hover:bg-dark-surface'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Badge variant="violet" size="sm">{doc.category}</Badge>
                      <span className="text-3xs font-mono text-slate-500">{doc.id}</span>
                    </div>
                    <h4 className="text-xs font-semibold text-slate-200 line-clamp-1">{doc.title}</h4>
                    <div className="flex items-center justify-between text-3xs text-slate-400 pt-1">
                      <span>By {doc.author_name}</span>
                      <span>{new Date(doc.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
            </div>
          </Card>

          {/* Right Column: Active Doc Article Viewer */}
          <Card className="lg:col-span-2 p-6 space-y-6 bg-dark-card border-dark-border min-h-[500px]">
            {selectedDoc ? (
              <div className="space-y-6">
                {/* Doc Header */}
                <div className="border-b border-dark-border pb-4 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <Badge variant="violet" size="md">{selectedDoc.category}</Badge>
                    <span className="text-2xs font-mono text-slate-400">Article ID: {selectedDoc.id}</span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-100 font-display leading-tight">
                    {selectedDoc.title}
                  </h2>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Avatar name={selectedDoc.author_name} size="sm" />
                      <span>{selectedDoc.author_name}</span>
                    </div>
                    <span>•</span>
                    <span className="font-mono text-2xs">
                      Last updated {new Date(selectedDoc.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Doc Markdown Article Render */}
                <div className="prose prose-invert max-w-none space-y-4 text-xs text-slate-300 leading-relaxed font-sans">
                  {selectedDoc.content.split('\n\n').map((paragraph, idx) => {
                    if (paragraph.startsWith('# ')) {
                      return <h1 key={idx} className="text-lg font-bold text-slate-100 font-display border-b border-dark-border/40 pb-1 mt-4">{paragraph.replace('# ', '')}</h1>;
                    }
                    if (paragraph.startsWith('## ')) {
                      return <h2 key={idx} className="text-base font-semibold text-slate-200 font-display mt-3">{paragraph.replace('## ', '')}</h2>;
                    }
                    if (paragraph.startsWith('### ')) {
                      return <h3 key={idx} className="text-sm font-semibold text-slate-200 mt-2">{paragraph.replace('### ', '')}</h3>;
                    }
                    return <p key={idx}>{paragraph}</p>;
                  })}
                </div>

                {/* Related Tasks Tags */}
                {selectedDoc.related_task_ids && selectedDoc.related_task_ids.length > 0 && (
                  <div className="pt-4 border-t border-dark-border/60 flex items-center gap-2">
                    <span className="text-2xs font-semibold text-slate-400 uppercase tracking-wider">Related Tasks:</span>
                    {selectedDoc.related_task_ids.map((tid) => (
                      <Badge key={tid} variant="blue" size="sm">
                        {tid}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <EmptyState
                title="No Document Selected"
                description="Select an article from the left navigation tree or publish a new doc article."
              />
            )}
          </Card>
        </div>
      )}

      {/* Task Creation & Inspection Modal */}
      <TaskDetailModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        task={selectedTask}
        initialStatus={initialTaskStatus}
        teamMembers={MOCK_TEAM_MEMBERS}
        onSaveTask={handleSaveTask}
        onDeleteTask={handleDeleteTask}
        onAddComment={handleAddComment}
      />

      {/* Create New Doc Modal */}
      <Modal
        isOpen={isDocModalOpen}
        onClose={() => setIsDocModalOpen(false)}
        title="Publish Confluence Doc Article"
        maxWidth="lg"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setIsDocModalOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleSaveDoc}>Publish Article</Button>
          </div>
        }
      >
        <form onSubmit={handleSaveDoc} className="space-y-4">
          <Input
            label="Article Title"
            value={docModalTitle}
            onChange={(e) => setDocModalTitle(e.target.value)}
            placeholder="e.g. System Architecture & API Rate Limiting Policy"
            required
          />

          <Select
            label="Category Space"
            options={[
              { value: 'Architecture', label: 'Architecture & Engineering' },
              { value: 'API Specs', label: 'API Specifications' },
              { value: 'SOPs', label: 'Standard Operating Procedures (SOPs)' },
              { value: 'Product Docs', label: 'Product & Feature Specs' },
              { value: 'Release Notes', label: 'Release Notes & Changelog' },
            ]}
            value={docModalCategory}
            onChange={(e) => setDocModalCategory(e.target.value)}
          />

          <Input
            label="Tags (Comma Separated)"
            value={docModalTags}
            onChange={(e) => setDocModalTags(e.target.value)}
            placeholder="api, backend, setup, security"
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">Article Content (Markdown supported)</label>
            <textarea
              value={docModalContent}
              onChange={(e) => setDocModalContent(e.target.value)}
              rows={8}
              placeholder="# Overview&#10;&#10;Describe system requirements, workflow procedures, and guidelines..."
              className="block w-full rounded-lg bg-dark-surface border border-dark-border text-slate-100 placeholder-slate-500 text-sm p-3 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 font-mono text-xs"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
