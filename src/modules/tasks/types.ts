// ─────────────────────────────────────────────────────────────
// Vortiq Task Management & Doc Space Types (Zoho & Jira/Confluence Parity)
// Multi-tenant scoped by tenant_id
// ─────────────────────────────────────────────────────────────

import { Task as BaseTask, TaskPriority as GlobalTaskPriority } from '@/types';

export type TaskStatus = 'To Do' | 'In Progress' | 'Review' | 'Done';
export type TaskType = 'feature' | 'bug' | 'task' | 'epic';
export type TaskPriority = GlobalTaskPriority;
export type RecurrencePattern = 'none' | 'daily' | 'weekly' | 'monthly';

export interface TeamMember {
  id: string;
  name: string;
  avatar_url?: string;
}

export interface TaskComment {
  id: string;
  task_id: string;
  user_id: string;
  user_name?: string;
  author_name?: string;
  author_avatar?: string;
  comment?: string;
  comment_text?: string;
  mentions?: string[]; // user_ids mentioned via @
  created_at: string;
}

export interface TaskItem extends Omit<BaseTask, 'status'> {
  project_id?: string;
  status: TaskStatus;
  custom_status_id?: string;
  task_type: TaskType;
  assignee?: string;
  assignee_name?: string;
  assignee_avatar?: string;
  story_points?: number;
  comments_count?: number;
  attachment_count?: number;
  comments: TaskComment[];

  // Extended Features
  dependency_task_ids?: string[]; // Finish-to-Start prerequisite task IDs
  recurrence_pattern?: RecurrencePattern;
  estimated_hours?: number;
  logged_hours?: number;
  start_date?: string;
}

export interface TaskTimeLog {
  id: string;
  tenant_id: string;
  task_id: string;
  task_title: string;
  user_id: string;
  user_name: string;
  hours: number;
  notes: string;
  is_billable: boolean;
  logged_date: string;
  created_at: string;
}

export interface TaskCustomStatus {
  id: string;
  tenant_id: string;
  project_id: string;
  name: string;
  color: string;
  sort_order: number;
  is_terminal: boolean;
}

// ── Confluence Wiki Space Types ──────────────────────────────
export interface DocPageRevision {
  id: string;
  page_id: string;
  version_number: number;
  title: string;
  content: string;
  edited_by_name: string;
  created_at: string;
}

export interface DocPage {
  id: string;
  tenant_id: string;
  title: string;
  content: string;
  category: string;
  version_number: number;
  linked_task_ids: string[];
  author_name: string;
  created_at: string;
  updated_at: string;
  revisions: DocPageRevision[];
}

// ── Seed Datasets ─────────────────────────────────────────────

export const SEED_TASKS: TaskItem[] = [
  {
    id: 'task-101',
    tenant_id: 'tenant-prod-001',
    project_id: 'proj-alpha',
    title: 'Design GST Form 26Q Automated Ledger Component',
    description: 'Build Form 26Q TDS ledger calculation table supporting 194C, 194J (10%/2%) split.',
    status: 'In Progress',
    task_type: 'feature',
    priority: 'high',
    assignee_id: 'u-1',
    assignee_name: 'Alex Vance',
    story_points: 5,
    estimated_hours: 12,
    logged_hours: 6.5,
    due_date: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
    start_date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
    dependency_task_ids: [],
    recurrence_pattern: 'none',
    comments_count: 2,
    attachment_count: 1,
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    comments: [
      {
        id: 'tc-1',
        task_id: 'task-101',
        user_id: 'u-2',
        user_name: 'Priya Sharma',
        author_name: 'Priya Sharma',
        comment_text: '@Alex Vance Please ensure 194J technical services split (2% vs 10%) is verified.',
        mentions: ['u-1'],
        created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
      },
    ],
  },
  {
    id: 'task-102',
    tenant_id: 'tenant-prod-001',
    project_id: 'proj-alpha',
    title: 'Audit Multi-Tenant Storage Scoping Engine',
    description: 'Prerequisite check ensuring all keys are scoped strictly by tenant_id.',
    status: 'To Do',
    task_type: 'task',
    priority: 'urgent',
    assignee_id: 'u-2',
    assignee_name: 'Priya Sharma',
    story_points: 3,
    estimated_hours: 8,
    logged_hours: 0,
    due_date: new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0],
    start_date: new Date(Date.now()).toISOString().split('T')[0],
    dependency_task_ids: ['task-101'], // Blocked until Task 101 finishes
    recurrence_pattern: 'weekly',
    comments_count: 0,
    attachment_count: 0,
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    comments: [],
  },
  {
    id: 'task-103',
    tenant_id: 'tenant-prod-001',
    project_id: 'proj-alpha',
    title: 'Deploy GCP Cloud Run Production Container',
    description: 'Deploy dockerized container revision to asia-south1 Cloud Run managed platform.',
    status: 'Done',
    task_type: 'epic',
    priority: 'high',
    assignee_id: 'u-1',
    assignee_name: 'Alex Vance',
    story_points: 8,
    estimated_hours: 15,
    logged_hours: 14.5,
    due_date: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0],
    start_date: new Date(Date.now() - 6 * 86400000).toISOString().split('T')[0],
    dependency_task_ids: [],
    recurrence_pattern: 'none',
    comments_count: 1,
    attachment_count: 2,
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    comments: [],
  },
];

export const SEED_TIME_LOGS: TaskTimeLog[] = [
  {
    id: 'tl-1',
    tenant_id: 'tenant-prod-001',
    task_id: 'task-101',
    task_title: 'Design GST Form 26Q Automated Ledger Component',
    user_id: 'u-1',
    user_name: 'Alex Vance',
    hours: 4.5,
    notes: 'Built Form 26Q TDS ledger calculation breakdown.',
    is_billable: true,
    logged_date: new Date().toISOString().split('T')[0],
    created_at: new Date().toISOString(),
  },
  {
    id: 'tl-2',
    tenant_id: 'tenant-prod-001',
    task_id: 'task-103',
    task_title: 'Deploy GCP Cloud Run Production Container',
    user_id: 'u-1',
    user_name: 'Alex Vance',
    hours: 8.0,
    notes: 'Configured Dockerfile and Cloud Run domain mapping.',
    is_billable: true,
    logged_date: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0],
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
];

export const SEED_CUSTOM_STATUSES: TaskCustomStatus[] = [
  { id: 'st-todo', tenant_id: 'tenant-prod-001', project_id: 'proj-alpha', name: 'Backlog', color: '#8D93AC', sort_order: 1, is_terminal: false },
  { id: 'st-inprog', tenant_id: 'tenant-prod-001', project_id: 'proj-alpha', name: 'In Progress', color: '#E5A93C', sort_order: 2, is_terminal: false },
  { id: 'st-review', tenant_id: 'tenant-prod-001', project_id: 'proj-alpha', name: 'QA Testing', color: '#8B5CF6', sort_order: 3, is_terminal: false },
  { id: 'st-done', tenant_id: 'tenant-prod-001', project_id: 'proj-alpha', name: 'Completed', color: '#22B8A3', sort_order: 4, is_terminal: true },
];

export const SEED_DOC_PAGES: DocPage[] = [
  {
    id: 'doc-101',
    tenant_id: 'tenant-prod-001',
    title: 'Vortiq Architecture & Multi-Tenant RLS Specifications',
    content: '## Overview\nVortiq utilizes PostgreSQL Row Level Security (RLS) with pgcrypto encryption for PII fields.\n\n### Key Principles\n1. All queries are scoped by `tenant_id`.\n2. Cross-tenant leakage is strictly prevented via storage keys.\n3. Sensitive fields (PAN, Bank details) show masked (`•••• 1234`) by default.',
    category: 'Architecture',
    version_number: 2,
    linked_task_ids: ['task-101', 'task-102'],
    author_name: 'Alex Vance',
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    revisions: [
      {
        id: 'rev-1',
        page_id: 'doc-101',
        version_number: 1,
        title: 'Vortiq Architecture (Draft v1)',
        content: 'Initial draft of multi-tenant architecture specifications.',
        edited_by_name: 'Alex Vance',
        created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
      },
      {
        id: 'rev-2',
        page_id: 'doc-101',
        version_number: 2,
        title: 'Vortiq Architecture & Multi-Tenant RLS Specifications',
        content: 'Added pgcrypto encryption details and audit log notification requirements.',
        edited_by_name: 'Priya Sharma',
        created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
      },
    ],
  },
];
