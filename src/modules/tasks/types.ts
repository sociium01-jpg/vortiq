import { Task, TaskStatus, TaskPriority } from '@/types';

export type { TaskStatus, TaskPriority };

export type TaskType = 'feature' | 'bug' | 'task' | 'epic';

export interface TaskComment {
  id: string;
  task_id: string;
  tenant_id: string;
  user_id: string;
  author_name: string;
  author_avatar?: string;
  comment_text: string;
  created_at: string;
}

export interface TaskDoc {
  id: string;
  tenant_id: string;
  title: string;
  content: string;
  category: string;
  author_id: string;
  author_name: string;
  author_avatar?: string;
  tags: string[];
  related_task_ids?: string[];
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar_url?: string;
}

export interface TaskItem extends Task {
  task_type: TaskType;
  story_points?: number;
  assignee_name?: string;
  assignee_avatar?: string;
  creator_name?: string;
  comments_count?: number;
  comments?: TaskComment[];
  attachment_count?: number;
  doc_ids?: string[];
}

export type TaskViewMode = 'board' | 'list' | 'docs';

export interface TaskFilterState {
  searchTerm: string;
  status: TaskStatus | 'all';
  priority: TaskPriority | 'all';
  taskType: TaskType | 'all';
  assigneeId: string | 'all';
  tag: string | 'all';
}
