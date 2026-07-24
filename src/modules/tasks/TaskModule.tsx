// ─────────────────────────────────────────────────────────────
// Vortiq Task Management & Doc Space (Zoho Projects & Jira/Confluence Parity)
// Includes Multi-view (Board, List, Timeline Gantt), Task Dependencies (FS),
// Timesheet Rollup, Custom Statuses, Confluence Wiki Pages with Versioning & Task Links.
// ─────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { useAuth } from '@/auth/AuthContext';
import { TaskBoard } from './TaskBoard';
import { TaskDetailModal } from './TaskDetailModal';
import { TaskGanttView } from './TaskGanttView';
import { TimesheetRollupView } from './TimesheetRollupView';
import { DocsSpaceModule } from './DocsSpaceModule';
import { CustomStatusManagerModal } from './CustomStatusManagerModal';
import { TaskItem, SEED_TASKS } from './types';
import { Button, Badge } from '@/design-system';
import {
  Plus,
  BookOpen,
  Calendar,
  Clock,
  LayoutGrid,
  Sliders,
  AlertCircle,
} from 'lucide-react';

type TabView = 'board' | 'gantt' | 'timesheet' | 'docs';

export const TaskModule: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabView>('board');
  const [tasks, setTasks] = useState<TaskItem[]>(SEED_TASKS);
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [dependencyWarning, setDependencyWarning] = useState<string | null>(null);

  // Handle task status update with Finish-to-Start dependency check
  const handleTaskStatusUpdate = (taskId: string, newStatus: any) => {
    const target = tasks.find((t) => t.id === taskId);
    if (!target) return;

    // Prerequisite check: Task B cannot start if prerequisite Task A is incomplete
    if (newStatus === 'In Progress' || newStatus === 'Done') {
      if (target.dependency_task_ids && target.dependency_task_ids.length > 0) {
        const incompletePrereq = tasks.find(
          (t) => target.dependency_task_ids?.includes(t.id) && t.status !== 'Done'
        );
        if (incompletePrereq) {
          setDependencyWarning(
            `Prerequisite Dependency Locked: Cannot move "${target.title}" to ${newStatus} until "${incompletePrereq.title}" is completed.`
          );
          setTimeout(() => setDependencyWarning(null), 4000);
          return;
        }
      }
    }

    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus, updated_at: new Date().toISOString() } : t))
    );
  };

  const handleCreateTask = () => {
    const newTask: TaskItem = {
      id: `task-${Date.now()}`,
      tenant_id: 'tenant-prod-001',
      title: 'New Engineering Task',
      description: 'Task description and specifications',
      status: 'To Do',
      task_type: 'task',
      priority: 'medium',
      assignee_id: user?.id || 'u-1',
      assignee_name: user?.full_name || 'Alex Vance',
      story_points: 3,
      estimated_hours: 8,
      logged_hours: 0,
      due_date: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
      dependency_task_ids: [],
      recurrence_pattern: 'none',
      comments_count: 0,
      comments: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setTasks([newTask, ...tasks]);
    setSelectedTask(newTask);
    setIsTaskModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Dependency Blocking Alert Banner */}
      {dependencyWarning && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-2xs text-amber-300 flex items-center gap-2 animate-pulse">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{dependencyWarning}</span>
        </div>
      )}

      {/* Top Header & Submodule Navigation Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-dark-card border border-dark-border rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-100 font-display tracking-tight">Task & Workspace Hub</h1>
            <Badge variant="violet" size="sm" className="font-mono font-bold">Zoho & Jira Parity</Badge>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Multi-View • Task Dependencies • Timesheets • Confluence Docs & Version History
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Sub-module View Switcher */}
          <div className="flex p-1 bg-dark-surface rounded-xl border border-dark-border overflow-x-auto text-xs font-semibold">
            {[
              { id: 'board', label: 'Kanban Board', icon: LayoutGrid },
              { id: 'gantt', label: 'Gantt Timeline', icon: Calendar },
              { id: 'timesheet', label: 'Timesheets', icon: Clock },
              { id: 'docs', label: 'Wiki Docs', icon: BookOpen },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as TabView)}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all whitespace-nowrap ${
                  activeTab === id
                    ? 'bg-brand-500 text-dark-bg font-bold shadow-md shadow-brand-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            leftIcon={<Sliders className="w-3.5 h-3.5" />}
            onClick={() => setIsStatusModalOpen(true)}
          >
            Workflow Statuses
          </Button>

          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={handleCreateTask}
          >
            Create Task
          </Button>
        </div>
      </div>

      {/* Main Viewport */}
      {activeTab === 'board' && (
        <TaskBoard
          tasks={tasks}
          onSelectTask={(task: TaskItem) => {
            setSelectedTask(task);
            setIsTaskModalOpen(true);
          }}
          onQuickMoveTask={handleTaskStatusUpdate}
          onAddNewTask={handleCreateTask}
        />
      )}

      {activeTab === 'gantt' && (
        <TaskGanttView
          tasks={tasks}
          onTaskClick={(task: TaskItem) => {
            setSelectedTask(task);
            setIsTaskModalOpen(true);
          }}
        />
      )}

      {activeTab === 'timesheet' && <TimesheetRollupView />}

      {activeTab === 'docs' && <DocsSpaceModule tasks={tasks} />}

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          isOpen={isTaskModalOpen}
          onClose={() => {
            setIsTaskModalOpen(false);
            setSelectedTask(null);
          }}
          task={selectedTask}
          allTasks={tasks}
          onUpdateTask={(updated) => {
            setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
            setSelectedTask(updated);
          }}
          onDeleteTask={(taskId) => {
            setTasks((prev) => prev.filter((t) => t.id !== taskId));
            setIsTaskModalOpen(false);
            setSelectedTask(null);
          }}
        />
      )}

      {/* Custom Workflow Status Manager Modal */}
      {isStatusModalOpen && (
        <CustomStatusManagerModal
          isOpen={isStatusModalOpen}
          onClose={() => setIsStatusModalOpen(false)}
        />
      )}
    </div>
  );
};
