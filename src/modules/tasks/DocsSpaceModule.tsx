// ─────────────────────────────────────────────────────────────
// Vortiq Confluence-Style Wiki & Docs Space
// Rich doc editor, page version history timeline, & page-to-task Smart Links
// ─────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { Card, Button, Badge, Modal, Input } from '@/design-system';
import { DocPage, SEED_DOC_PAGES, TaskItem } from './types';
import { FileText, History, Link2, Plus, Save, CheckCircle2 } from 'lucide-react';

export interface DocsSpaceModuleProps {
  tasks: TaskItem[];
}

export const DocsSpaceModule: React.FC<DocsSpaceModuleProps> = ({ tasks }) => {
  const [pages, setPages] = useState<DocPage[]>(SEED_DOC_PAGES);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(pages[0]?.id || null);
  const [isEditing, setIsEditing] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Edit states
  const selectedPage = pages.find((p) => p.id === selectedPageId) || null;
  const [titleInput, setTitleInput] = useState(selectedPage?.title || '');
  const [contentInput, setContentInput] = useState(selectedPage?.content || '');

  const handleSavePage = () => {
    if (!selectedPage || !titleInput) return;

    const newVersionNumber = selectedPage.version_number + 1;
    const newRevision = {
      id: `rev-${Date.now()}`,
      page_id: selectedPage.id,
      version_number: newVersionNumber,
      title: titleInput,
      content: contentInput,
      edited_by_name: 'Alex Vance',
      created_at: new Date().toISOString(),
    };

    const updatedPage: DocPage = {
      ...selectedPage,
      title: titleInput,
      content: contentInput,
      version_number: newVersionNumber,
      updated_at: new Date().toISOString(),
      revisions: [newRevision, ...selectedPage.revisions],
    };

    setPages((prev) => prev.map((p) => (p.id === selectedPage.id ? updatedPage : p)));
    setIsEditing(false);
  };

  const handleCreateNewPage = () => {
    const newPage: DocPage = {
      id: `doc-${Date.now()}`,
      tenant_id: 'tenant-prod-001',
      title: 'Untitled Documentation Page',
      content: '## New Documentation Page\nStart typing content here...',
      category: 'General',
      version_number: 1,
      linked_task_ids: [],
      author_name: 'Alex Vance',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      revisions: [
        {
          id: `rev-init-${Date.now()}`,
          page_id: `doc-${Date.now()}`,
          version_number: 1,
          title: 'Untitled Documentation Page',
          content: 'Initial page creation',
          edited_by_name: 'Alex Vance',
          created_at: new Date().toISOString(),
        },
      ],
    };

    setPages([newPage, ...pages]);
    setSelectedPageId(newPage.id);
    setTitleInput(newPage.title);
    setContentInput(newPage.content);
    setIsEditing(true);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-[300px,1fr] gap-6">
      {/* Left Sidebar: Pages Tree */}
      <Card className="p-4 bg-dark-card border-dark-border space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-display flex items-center gap-2">
            <FileText className="w-4 h-4 text-brand-400" />
            Wiki Doc Pages ({pages.length})
          </h4>

          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={handleCreateNewPage}
          >
            New Page
          </Button>
        </div>

        <div className="space-y-1.5">
          {pages.map((pg) => (
            <button
              key={pg.id}
              onClick={() => {
                setSelectedPageId(pg.id);
                setTitleInput(pg.title);
                setContentInput(pg.content);
                setIsEditing(false);
              }}
              className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all space-y-1 ${
                selectedPageId === pg.id
                  ? 'bg-brand-500/10 border-brand-500/40 text-brand-300 font-bold'
                  : 'bg-dark-surface/60 border-dark-border text-slate-300 hover:text-slate-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="truncate">{pg.title}</span>
                <Badge variant="slate" size="sm" className="font-mono">v{pg.version_number}</Badge>
              </div>
              <p className="text-2xs text-slate-400 font-mono truncate">{pg.category} • {pg.author_name}</p>
            </button>
          ))}
        </div>
      </Card>

      {/* Right Content Viewport */}
      {selectedPage ? (
        <Card className="p-6 bg-dark-card border-dark-border space-y-5">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-dark-border pb-4">
            <div>
              {isEditing ? (
                <Input
                  type="text"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  className="text-lg font-bold text-slate-100 font-display"
                />
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-extrabold text-slate-100 font-display">{selectedPage.title}</h2>
                  <Badge variant="violet" size="sm" className="font-mono">v{selectedPage.version_number}</Badge>
                </div>
              )}
              <p className="text-2xs text-slate-400 font-mono mt-0.5">
                Author: {selectedPage.author_name} • Last updated: {new Date(selectedPage.updated_at).toLocaleDateString()}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<History className="w-3.5 h-3.5 text-violet-400" />}
                onClick={() => setShowHistoryModal(true)}
              >
                Version History ({selectedPage.revisions.length})
              </Button>

              {isEditing ? (
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Save className="w-3.5 h-3.5" />}
                  onClick={handleSavePage}
                >
                  Save Revision v{selectedPage.version_number + 1}
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setTitleInput(selectedPage.title);
                    setContentInput(selectedPage.content);
                    setIsEditing(true);
                  }}
                >
                  Edit Page
                </Button>
              )}
            </div>
          </div>

          {/* Linked Tasks Smart Links Bar */}
          <div className="p-3 bg-dark-surface/60 rounded-xl border border-dark-border space-y-1.5">
            <span className="text-2xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 font-display">
              <Link2 className="w-3.5 h-3.5 text-amber-400" /> Linked Tasks & Smart Links
            </span>
            <div className="flex flex-wrap gap-2">
              {selectedPage.linked_task_ids.map((tid) => {
                const linkedT = tasks.find((t) => t.id === tid);
                return (
                  <span
                    key={tid}
                    className="px-2.5 py-1 bg-dark-card border border-dark-border rounded-lg text-2xs font-mono text-brand-300 flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    {linkedT ? linkedT.title : tid}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Page Markdown Content Editor/Viewer */}
          {isEditing ? (
            <textarea
              value={contentInput}
              onChange={(e) => setContentInput(e.target.value)}
              className="w-full h-80 p-4 bg-dark-surface border border-dark-border rounded-xl font-mono text-xs text-slate-200 leading-relaxed focus:outline-none focus:border-brand-500"
            />
          ) : (
            <div className="p-4 bg-dark-surface/40 border border-dark-border rounded-xl text-xs font-mono text-slate-200 whitespace-pre-wrap leading-relaxed min-h-[300px]">
              {selectedPage.content}
            </div>
          )}

          {/* Version History Modal */}
          {showHistoryModal && (
            <Modal
              isOpen={showHistoryModal}
              onClose={() => setShowHistoryModal(false)}
              title="Documentation Revision History Timeline"
              maxWidth="md"
            >
              <div className="space-y-4">
                <p className="text-xs text-slate-400">
                  Inspect and restore previous page revisions:
                </p>

                <div className="space-y-3">
                  {selectedPage.revisions.map((rev) => (
                    <div key={rev.id} className="p-3 bg-dark-surface rounded-xl border border-dark-border space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="violet" size="sm" className="font-mono">v{rev.version_number}</Badge>
                          <span className="text-xs font-bold text-slate-200 font-display">{rev.title}</span>
                        </div>
                        <span className="text-2xs text-slate-400 font-mono">
                          {new Date(rev.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-2xs text-slate-400 font-mono">Edited by: {rev.edited_by_name}</p>
                      <p className="text-2xs text-slate-300 font-mono bg-dark-card p-2 rounded border border-dark-border truncate">
                        {rev.content}
                      </p>
                    </div>
                  ))}
                </div>

                <Button variant="ghost" size="md" className="w-full" onClick={() => setShowHistoryModal(false)}>
                  Close Revision Timeline
                </Button>
              </div>
            </Modal>
          )}
        </Card>
      ) : (
        <Card className="p-12 text-center text-slate-400">
          Select or create a documentation page to begin.
        </Card>
      )}
    </div>
  );
};
