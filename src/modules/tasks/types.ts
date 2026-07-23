import { Task as BaseTask, TaskPriority as GlobalTaskPriority } from '@/types';

export type TaskStatus = 'To Do' | 'In Progress' | 'Review' | 'Done';
export type TaskType = 'feature' | 'bug' | 'task' | 'epic';
export type TaskPriority = GlobalTaskPriority;

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
  created_at: string;
}

export interface TaskItem extends Omit<BaseTask, 'status'> {
  status: TaskStatus;
  task_type: TaskType;
  assignee?: string;
  assignee_name?: string;
  assignee_avatar?: string;
  story_points?: number;
  comments_count?: number;
  attachment_count?: number;
  comments: TaskComment[];
}

export interface TaskDoc {
  id: string;
  tenant_id: string;
  project_id?: string;
  title: string;
  content: string;
  author_id?: string;
  author_name?: string;
  version: number;
  created_at: string;
  updated_at: string;
}
